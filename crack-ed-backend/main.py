from flask import Flask, request, jsonify,render_template,session,redirect,url_for,flash,send_from_directory, abort, send_file
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import random
import string
import os
from werkzeug.utils import secure_filename
import threading
import time
import hashlib
import requests
from flask_migrate import Migrate
from models import User,Application,CallBackUsers,AdminUser,LoanApplication,LoanProviderSelection
from extensions import db, migrate
import json
import uuid
# import razorpay  # Removed - using Easebuzz now
from dotenv import load_dotenv
from datetime import datetime
import logging
import bcrypt
from functools import wraps
import jwt
import traceback
import re
from io import BytesIO
import pandas as pd
import zipfile
from sqlalchemy import or_  # Add this import if not present
from sqlalchemy.exc import OperationalError

# PDF Generation imports
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from reportlab.lib.colors import HexColor, white, black
from math import ceil

def normalize_status(s):
    if not isinstance(s, str):
        return ""
    return re.sub(r"\s+", "", s).lower()



load_dotenv()

# NoPaperForms CRM — set NOPAPERFORMS_ACCESS_KEY, NOPAPERFORMS_SECRET_KEY (and optional NOPAPERFORMS_API_TOKEN) in .env.
NOPAPERFORMS_LEAD_URL = os.getenv(
    "NOPAPERFORMS_LEAD_URL",
    "https://api.nopaperforms.io/lead/v1/createOrUpdate",
)
NOPAPERFORMS_GET_BY_MOBILE_URL = os.getenv(
    "NOPAPERFORMS_GET_BY_MOBILE_URL",
    "https://api.nopaperforms.io/lead/v1/getDetailsByMobileNumber",
)
# Fallback when mobile lookup returns nothing. Set to empty string to disable.
NOPAPERFORMS_GET_BY_EMAIL_URL = os.getenv(
    "NOPAPERFORMS_GET_BY_EMAIL_URL",
    "https://api.nopaperforms.io/lead/v1/getDetailsByEmail",
)
def _nopaperforms_lead_headers():
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    access_key = (os.getenv("NOPAPERFORMS_ACCESS_KEY") or "").strip()
    secret_key = (os.getenv("NOPAPERFORMS_SECRET_KEY") or "").strip()
    if access_key:
        headers["access-key"] = access_key
    if secret_key:
        headers["secret-key"] = secret_key
    token = (os.getenv("NOPAPERFORMS_API_TOKEN") or "").strip()
    if token:
        headers["Authorization"] = (
            token if token.lower().startswith("bearer ") else f"Bearer {token}"
        )
    return headers


def _format_mobile_for_nopaperforms(mobile):
    """Normalize to 10-digit local mobile as in NoPaperForms examples."""
    if mobile is None:
        return ""
    s = str(mobile).strip().replace(" ", "")
    digits = "".join(c for c in s if c.isdigit())
    if len(digits) >= 10:
        return digits[-10:]
    return digits


def _str_utm(value):
    if value is None:
        return ""
    return str(value).strip()


def _post_lead_to_nopaperforms(
    *,
    full_name,
    email,
    mobile,
    state="",
    city="",
    search_criteria="mobile",
    utm_source="",
    utm_medium="",
    utm_campaign="",
):
    payload = {
        "name": (full_name or "").strip(),
        "email": (email or "").strip(),
        "mobile": _format_mobile_for_nopaperforms(mobile),
        "state": state or "",
        "city": city or "",
        "search_criteria": search_criteria or "mobile",
        "source": _str_utm(utm_source),
        "medium": _str_utm(utm_medium),
        "campaign": _str_utm(utm_campaign),
        "cf_form_name": "Microsite - Banking Sales",
        "cf_program": "Banking Sales",
        "cf_pg_program": "PG Program",
    }
    try:
        print("NoPaperForms CRM payload:", json.dumps(payload))
    except Exception:
        pass
    return requests.post(
        NOPAPERFORMS_LEAD_URL,
        json=payload,
        headers=_nopaperforms_lead_headers(),
        timeout=(10, 30),
    )


def _nopaperforms_pull_fields():
    default = ["name", "mobile", "lead_stage", "email", "course"]
    raw = (os.getenv("NOPAPERFORMS_PULL_FIELDS") or "").strip()
    if not raw:
        return default
    try:
        parsed = json.loads(raw)
        return parsed if isinstance(parsed, list) else default
    except json.JSONDecodeError:
        return default


def _parse_nopaperforms_details_list(data):
    if not isinstance(data, dict):
        return []
    inner = data.get("data") or {}
    details = inner.get("details")
    return details if isinstance(details, list) else []


def _pick_nopaperforms_detail(details, email=None):
    if not details:
        return None
    if email and len(details) > 1:
        el = email.strip().lower()
        for d in details:
            if not isinstance(d, dict):
                continue
            if (d.get("email") or "").strip().lower() == el:
                return d
    first = details[0]
    return first if isinstance(first, dict) else None


def _normalize_nopaperforms_detail(detail):
    """
    Map NoPaperForms lead detail to the shape used by login / get-application-data:
    Status (from lead_stage), Reason (explicit or inferred from common stage labels).
    """
    if not detail:
        return None
    lead_stage = (detail.get("lead_stage") or "").strip()
    reason = (detail.get("Reason") or detail.get("reason") or "").strip()
    status = lead_stage
    uls = lead_stage.lower()

    # Heuristics when CRM does not use Extraa-style "Result" + Reason Selected/Rejected
    if reason:
        pass
    elif uls in ("selected", "offered", "admitted", "shortlisted"):
        status = "Result"
        reason = "Selected"
    elif uls in ("rejected", "not selected", "not_selected", "disqualified", "declined"):
        status = "Result"
        reason = "Rejected"

    out = dict(detail)
    out["Status"] = status
    out["Reason"] = reason
    return out


def _post_nopaperforms_get_leads(url, json_body):
    if not url:
        return None
    try:
        r = requests.post(
            url,
            json=json_body,
            headers=_nopaperforms_lead_headers(),
            timeout=(10, 30),
        )
        if r.status_code != 200:
            print(f"NoPaperForms pull status {r.status_code}: {r.text[:300]}")
            return None
        return r.json()
    except requests.exceptions.RequestException as e:
        print(f"NoPaperForms pull error: {e}")
        return None


def _pull_nopaperforms_by_mobile(mobile_number, email=None):
    mob = _format_mobile_for_nopaperforms(mobile_number)
    if not mob or len(mob) < 10:
        return None
    try:
        mobile_payload = int(mob)
    except ValueError:
        mobile_payload = mob
    fields = _nopaperforms_pull_fields()
    data = _post_nopaperforms_get_leads(
        NOPAPERFORMS_GET_BY_MOBILE_URL,
        {"mobile": mobile_payload, "fields": fields},
    )
    if not data:
        return None
    details = _parse_nopaperforms_details_list(data)
    picked = _pick_nopaperforms_detail(details, email=email)
    return _normalize_nopaperforms_detail(picked)


def _pull_nopaperforms_by_email(email):
    if not email or not str(email).strip():
        return None
    clean = email.strip().lower()
    fields = _nopaperforms_pull_fields()
    data = _post_nopaperforms_get_leads(
        NOPAPERFORMS_GET_BY_EMAIL_URL,
        {"email": clean, "fields": fields},
    )
    if not data:
        return None
    details = _parse_nopaperforms_details_list(data)
    picked = _pick_nopaperforms_detail(details, email=clean)
    return _normalize_nopaperforms_detail(picked)

# $env:FLASK_APP="main:app" 

app = Flask(__name__)
app.secret_key = 'b7e1c2e4c9a84e2e8f7d4a1b6c3e5f9a2d7c6b8e4f1a2c3d5e6f7b9a1c2d3e4f'
# CORS(app, supports_credentials=True)
CORS(app, 
     origins=["http://localhost:5000"], 
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"])
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024 



# Payment integration removed
# Easebuzz/Razorpay related configuration and helper functions were removed.
def generate_easebuzz_hash(data_string):
    # Payment hashing removed — function kept as stub to avoid import errors.
    return ""

def verify_easebuzz_hash(response_data):
    # Verification removed — always return False if called.
    return False

def fetch_easebuzz_payment_status(merchant_txn):
    """
    Fetch payment status from Easebuzz (similar to Razorpay's payment.fetch())
    Uses Transaction Status API V2.1
    """
    # Payment status fetch removed — return None.
    return None

CUSTOMER_KEY = "362405"
ORANGE_API_KEY = "RHFLK7kkQN4fGtNwnXOhvpXreO2hJxx1"
SEND_URL = "https://login.xecurify.com/moas/api/auth/challenge" 
VALIDATE_URL = "https://login.xecurify.com/moas/api/auth/validate" 
UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads')  # full path to uploads/

logging.basicConfig(level=logging.DEBUG)

@app.route("/")
def helloworld():
    return "Hello Crack-ED!"

def generate_hash_header():
    timestamp = str(int(time.time() * 1000))
    string_to_hash = CUSTOMER_KEY + timestamp + ORANGE_API_KEY
    hash_value = hashlib.sha512(string_to_hash.encode('utf-8')).hexdigest().lower()

    return {
    "Customer-Key": CUSTOMER_KEY,
    "Timestamp": timestamp,
    "Authorization": hash_value,
    "Content-Type": "application/json"
    }
    

def generate_otp():
    return ''.join(random.choices(string.digits, k=4))

def generate_token():
    return ''.join(random.choices(string.ascii_letters + string.digits, k=30))

def send_otp_api(mobile):
    header=generate_hash_header()
    payload = {
    "customerKey": CUSTOMER_KEY,
    "phone": "91"+mobile,  # Replace with the mobile number
    "authType": "SMS", 
    }
    
    try:
        response = requests.post(SEND_URL, json=payload, headers=header)
        print("Response from OTP API:", response.json())
        return response.json()["txId"] 
    except requests.exceptions.RequestException as e:
        print("Error sending OTP:", str(e))
        return None

def verify_otp_api(otp_txn_id, otp):
    if not otp_txn_id:
        print("verify_otp_api: missing otp_txn_id")
        return "FAILED"

    header = generate_hash_header()
    payload = {
        "txId": otp_txn_id,
        "token": str(otp or "").strip(),
    }

    try:
        response = requests.post(VALIDATE_URL, json=payload, headers=header, timeout=30)
        body = response.json()
        print("Response from OTP API:", body)
        return body.get("status", "FAILED")
    except requests.exceptions.RequestException as e:
        print("Error validating OTP:", str(e))
        return "FAILED"
    except (ValueError, KeyError) as e:
        print("Error parsing OTP validation response:", str(e))
        return "FAILED"

def send_callback_lead_to_crm(user):
    full_name = f"{user.fname or ''} {user.lname or ''}".strip()
    state_val = (getattr(user, "state", None) or "").strip()
    city_val = (getattr(user, "city", None) or "").strip()
    if not state_val and city_val:
        state_val, city_val = city_val, ""
    response = _post_lead_to_nopaperforms(
        full_name=full_name,
        email=user.email,
        mobile=user.mobile,
        state=state_val,
        city=city_val,
        search_criteria="mobile",
        utm_source=getattr(user, "utm_source", None),
        utm_medium=getattr(user, "utm_medium", None),
        utm_campaign=getattr(user, "utm_campaign", None),
    )
    print(response.text)

def pull_lead_details_from_crm(email=None, mobile_number=None):
    """Pull lead details from NoPaperForms: by mobile first, then by email if configured."""
    if mobile_number:
        try:
            lead = _pull_nopaperforms_by_mobile(mobile_number, email=email)
            if lead:
                return lead
        except Exception as e:
            print(f"Error pulling CRM by mobile: {e}")

    if email:
        try:
            if (NOPAPERFORMS_GET_BY_EMAIL_URL or "").strip():
                lead = _pull_nopaperforms_by_email(email)
                if lead:
                    return lead
        except Exception as e:
            print(f"Error pulling CRM by email: {e}")
    return None

def send_registration_lead_to_crm(user):
    name_parts = (user.name or "").split()
    first_name = name_parts[0] if name_parts else ""
    last_name = name_parts[-1] if len(name_parts) > 1 else ""
    full_name = (user.name or "").strip() or f"{first_name} {last_name}".strip()

    try:
        print(
            "CRM UTM (registration):",
            getattr(user, "utm_source", None),
            getattr(user, "utm_medium", None),
            getattr(user, "utm_campaign", None),
        )
    except Exception:
        pass

    try:
        response = _post_lead_to_nopaperforms(
            full_name=full_name,
            email=user.email,
            mobile=user.mobile,
            state=getattr(user, "state", None) or "",
            city=getattr(user, "city", None) or "",
            search_criteria="mobile",
            utm_source=getattr(user, "utm_source", None),
            utm_medium=getattr(user, "utm_medium", None),
            utm_campaign=getattr(user, "utm_campaign", None),
        )
        print(f"CRM Response: {response.text}")
        return response
    except Exception as e:
        print(f"Error sending to CRM: {e}")
        return None


def safe_str(value):
    """Convert any value to string safely"""
    if value is None:
        return ""
    return str(value)


def _is_schema_migration_error(exc):
    """True when SQLite schema is behind the SQLAlchemy models (missing columns/tables)."""
    msg = str(exc).lower()
    return isinstance(exc, OperationalError) and (
        "no such column" in msg or "no such table" in msg
    )


def _schema_migration_error_response():
    return jsonify({
        "error": "Database migrations are pending. Please run migration scripts on the server and try again.",
    }), 503


def _set_callback_user_location(user, state_val, city_val):
    """Persist state and city; fall back if `state` column is not migrated yet."""
    state_val = (state_val or "").strip()
    city_val = (city_val or "").strip()
    try:
        user.state = state_val
        user.city = city_val
    except AttributeError:
        user.city = city_val or state_val

def generate_payment_receipt_pdf(payment_data, application_data):
    # Payment receipt generation removed.
    return None


@app.route('/api/auth/callbackOtp/', methods=['POST', 'OPTIONS']) 
@app.route('/auth/callbackOtp/', methods=['POST', 'OPTIONS']) 
def send_callback_otp():
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        response = jsonify({})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response
    data = request.get_json()
    print("Registration data received:", data)
    mobile = data.get("mobile")
    print("Mobile number received:", mobile)
    if not mobile:
        return jsonify({"error": "Mobile number is required"}), 400

    print("Generating OTP for mobile:", mobile)
    otp = generate_otp()
    name_parts = data['name'].split()
    first_name = name_parts[0] 
    last_name = name_parts[-1] if len(name_parts) > 1 else ""
    state_val = (data.get("state") or "").strip()
    city_val = (data.get("city") or "").strip()
    # Older clients sent a single location field as `state` or `city`.
    if not state_val and not city_val:
        legacy = (data.get("state") or data.get("city") or "").strip()
        state_val = legacy

    try:
        # Extract UTM parameters
        utm_source = data.get("utm_source", "") or ""
        utm_medium = data.get("utm_medium", "") or ""
        utm_campaign = data.get("utm_campaign", "") or ""
        
        existing_user = CallBackUsers.query.filter_by(mobile=mobile).first()
        user = None

        if existing_user:
            existing_user.otp = otp
            user = existing_user
            if user.verified:
                return jsonify({"message": "Thanks! Your callback request is already in our system. We'll connect with you soon!"}), 200
            else:
                user.fname = first_name
                user.lname = last_name
                user.email = data['email']
                _set_callback_user_location(user, state_val, city_val)
                # Update UTM parameters if provided and column exists
                try:
                    if utm_source:
                        user.utm_source = utm_source
                    if utm_medium:
                        user.utm_medium = utm_medium
                    if utm_campaign:
                        user.utm_campaign = utm_campaign
                except AttributeError:
                    # UTM columns don't exist in database yet - skip silently
                    print("Warning: UTM columns not found in database. Run migration script.")
        else:
            print("Creating new callback user with mobile:", mobile)
            user = CallBackUsers(
                fname=first_name,
                lname=last_name,
                email=data['email'],
                mobile=mobile,
                otp=otp,
            )
            _set_callback_user_location(user, state_val, city_val)
            # Try to set UTM parameters if columns exist
            try:
                if utm_source:
                    user.utm_source = utm_source
                if utm_medium:
                    user.utm_medium = utm_medium
                if utm_campaign:
                    user.utm_campaign = utm_campaign
            except AttributeError:
                # UTM columns don't exist in model - skip silently
                print("Warning: UTM columns not found in model. Run migration script.")
        
        db.session.add(user)
        otp_txn_id = send_otp_api(user.mobile)
        if otp_txn_id is None:
            db.session.rollback()
            return jsonify({"error": "Failed to send OTP"}), 500
        user.otp_txn_id = otp_txn_id

        def _retry_callback_user_without_utm():
            """Reuse the same OTP transaction after a schema-related commit failure."""
            nonlocal user
            if existing_user:
                user = existing_user
                if user.verified:
                    return jsonify({"message": "Thanks! Your callback request is already in our system. We'll connect with you soon!"}), 200
                user.otp = otp
                user.fname = first_name
                user.lname = last_name
                user.email = data["email"]
                _set_callback_user_location(user, state_val, city_val)
            else:
                user = CallBackUsers(
                    fname=first_name,
                    lname=last_name,
                    email=data["email"],
                    mobile=mobile,
                    otp=otp,
                )
                _set_callback_user_location(user, state_val, city_val)
                db.session.add(user)
            user.otp_txn_id = otp_txn_id
            db.session.commit()
            print(
                "User created/updated successfully without UTM fields. "
                "Please run migration script to add UTM columns."
            )
            return None

        try:
            db.session.commit()
        except OperationalError as db_error:
            error_msg = str(db_error).lower()
            if "no such column" in error_msg:
                print(
                    "Database schema error. Retrying without missing columns "
                    "(same OTP transaction):",
                    db_error,
                )
                db.session.rollback()
                retry_response = _retry_callback_user_without_utm()
                if retry_response is not None:
                    return retry_response
            else:
                raise

        return jsonify({"message": "OTP sent"}), 200

    except Exception as e:
        print("OTP registration error:", str(e))
        traceback.print_exc()
        db.session.rollback()
        if _is_schema_migration_error(e):
            return _schema_migration_error_response()
        return jsonify({"error": "Internal Server Error"}), 500


@app.route('/api/auth/registerOtp/', methods=['POST'])
@app.route('/auth/registerOtp/', methods=['POST'])
def send_register_otp():
    """Handles registration OTP generation and user/application creation."""
    print("Database path:", app.config.get('SQLALCHEMY_DATABASE_URI'))

    try:
        # -----------------------------
        # ✅ 1. Parse and validate input
        # -----------------------------
        data = request.get_json(force=True, silent=True)
        print("Registration data received:", data)

        if not data:
            return jsonify({"error": "Invalid or empty JSON payload"}), 400

        mobile = data.get("mobile")
        name = data.get("name")
        email = data.get("email")

        if not mobile:
            return jsonify({"error": "Mobile number is required"}), 400
        if not name:
            return jsonify({"error": "Name is required"}), 400
        if not email:
            return jsonify({"error": "Email is required"}), 400

        # -----------------------------
        # ✅ 2. Prepare user info
        # -----------------------------
        otp = generate_otp()
        name_parts = name.split()
        first_name = name_parts[0]
        last_name = name_parts[-1] if len(name_parts) > 1 else ""

        existing_user = User.query.filter_by(mobile=mobile).first()

        # -----------------------------
        # ✅ 3. Update or create user
        # -----------------------------
        if existing_user:
            print("Existing user found:", existing_user.id)
            user = existing_user
            user.otp = otp

            if getattr(user, "verified", False):
                return jsonify({"message": "Already Registered. Please login."}), 400

            # Update user info
            user.name = name
            user.email = email
            user.utm_source = data.get("utm_source", "")
            user.utm_medium = data.get("utm_medium", "")
            user.utm_campaign = data.get("utm_campaign", "")

            # Don't create/update Application here - wait for OTP verification

        else:
            print("Creating new user record")
            user = User(name=name, email=email, mobile=mobile, otp=otp)
            db.session.add(user)
            db.session.flush()  # ensure user.id is available

            # Don't create Application here - wait for OTP verification

        # -----------------------------
        # ✅ 4. Send OTP through API
        # -----------------------------
        try:
            otp_txn_id = send_otp_api(user.mobile)
            print("OTP API transaction ID:", otp_txn_id)
            user.otp_txn_id = otp_txn_id
            if not otp_txn_id:
                raise ValueError("send_otp_api() returned None or invalid response")
        except Exception as otp_err:
            print("❌ Error while sending OTP:", str(otp_err))
            traceback.print_exc()
            db.session.rollback()
            return jsonify({"error": f"Failed to send OTP: {otp_err}"}), 500

        # -----------------------------
        # ✅ 5. Commit changes
        # -----------------------------
        db.session.commit()
        print("✅ OTP registration success for:", mobile)
        return jsonify({"message": "OTP sent successfully"}), 200

    # -----------------------------
    # ❌ Global Exception Handling
    # -----------------------------
    except Exception as e:
        print("❌ OTP registration error:", str(e))
        traceback.print_exc()
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@app.route('/auth/register/', methods=['POST']) 
def register_user():
    data = request.get_json()
    user=None
    print("Data received:", data)
    try:
        print("UTM received:", data.get('utm_source'), data.get('utm_medium'), data.get('utm_campaign'))
    except Exception as _e:
        pass
    
    user = User.query.filter_by(mobile=data['mobile']).first()
        
    if not user:
        return jsonify({"message": "User with mobile number not found"}), 400
    else:
        status=verify_otp_api(user.otp_txn_id, data['otp'])
        if status == "SUCCESS":
            user.verified = True
            user.utm_source = data.get('utm_source', '')
            user.utm_medium = data.get('utm_medium', '')
            user.utm_campaign = data.get('utm_campaign', '')
        else:
            return jsonify({"message": "Invalid OTP"}), 400
    
    # Create or update Application record ONLY after OTP verification
    application = Application.query.filter_by(user_id=user.id).first()
    
    if not application:
        # Create new Application record after successful OTP verification
        name_parts = user.name.split()
        first_name = name_parts[0]
        last_name = name_parts[-1] if len(name_parts) > 1 else ""
        
        application = Application(
            user_id=user.id,
            first_name=first_name,
            last_name=last_name,
            mobile_number=user.mobile,
            email=user.email,
            status="Registered"
        )
        db.session.add(application)
        db.session.flush()  # ensure application.id is available
    
    # Update Application record with date of birth, qualification, and year of passing
    if data.get('date_of_birth'):
        application.date_of_birth = data.get('date_of_birth')
    if data.get('qualification'):
        application.qualification = data.get('qualification')
    if data.get('year_of_passing'):
        application.year_of_passing = data.get('year_of_passing')
    
    user.token = generate_token()
    db.session.commit()
    try:
        send_registration_lead_to_crm(user)
    except Exception as e:
        print(f"CRM integration failed: {e}")
    return jsonify({"token": user.token, "username": user.name}), 200

@app.route('/api/auth/callback/', methods=['POST'])
@app.route('/auth/callback/', methods=['POST'])
def add_callback_user():
    data = request.get_json()
    user=None
    print("Data received:", data)
   
    user = CallBackUsers.query.filter_by(mobile=data['mobile']).first()
        
    if not user:
        return jsonify({"message": "mobile number not found"}), 400
    else:
        db.session.refresh(user)
        if not user.otp_txn_id:
            return jsonify({
                "message": "OTP session expired. Please request a new OTP.",
            }), 400

        otp_value = str(data.get("otp", "")).strip()
        print(
            "Verifying OTP for mobile:",
            data.get("mobile"),
            "txId:",
            user.otp_txn_id,
        )
        status = verify_otp_api(user.otp_txn_id, otp_value)
        if status == "SUCCESS":
            try:
                send_callback_lead_to_crm(user)
            except:
                print("callback failed")
            user.verified = True
        else:
            return jsonify({"message": "Invalid OTP"}), 400
        
    db.session.commit()
    return jsonify({"message":"We will contact you soon"}), 200

@app.route('/auth/loginOtp/', methods=['POST'])
def send_login_otp():
    data = request.get_json()
    print("Data received:", data)
    user = User.query.filter_by(mobile=data['mobile']).first()
    if not user or not user.verified:
        return jsonify({"message": "Mobile not registered"}), 400
    user.otp = generate_otp()
    user.otp_txn_id = send_otp_api(user.mobile)
    if user.otp_txn_id is None:
        return jsonify({"error": "Failed to send OTP"}), 500
    
    db.session.commit()
    return jsonify({"message": "OTP sent",}), 200

@app.route('/auth/login/', methods=['POST'])
def login_user():
    data = request.get_json()
    user=None
    user = User.query.filter_by(mobile=data['mobile']).first()
    if not user:
        return jsonify({"message": "Invalid credentials"}), 400
    else: 
        status=verify_otp_api(user.otp_txn_id, data['otp'])
        if status == "SUCCESS":
            user.verified = True
        else:
            return jsonify({"message": "Invalid OTP"}), 400
    
    # Pull CRM data and update application status
    # Skip CRM sync if status is "Payment" or "Completed" (don't override user actions)
    try:
        application = Application.query.filter_by(user_id=user.id).first()
        if application and application.status not in ["Payment", "Completed"]:
            crm_data = pull_lead_details_from_crm(email=user.email, mobile_number=user.mobile)
            if crm_data:
                crm_status = crm_data.get('Status', '')
                print(f"CRM Status for user {user.mobile}: {crm_status}")
                
                # Update application status based on CRM status
                if application:
                    # Check if status contains "Interview" (e.g., "08-Interview")
                    if 'Interview' in crm_status:
                        application.status = "Interview"
                    # Check if status is in "Result" stage, then check Reason field
                    elif 'Result' in crm_status:
                        crm_reason = crm_data.get('Reason', '')
                        if crm_reason == "Selected":
                            application.status = "Selected"
                        elif crm_reason == "Rejected":
                            application.status = "Rejected"
                    # You can add more status mappings here if needed
                    
                    db.session.commit()
                    print(f"Updated application status to: {application.status}")
        else:
            print(f"Skipping CRM sync for user {user.mobile} - status is {application.status if application else 'N/A'}")
    except Exception as e:
        print(f"Error pulling CRM data during login: {e}")
        # Continue with login even if CRM call fails
    
    user.token = generate_token()
    db.session.commit()
    return jsonify({"token": user.token, "username": user.name}), 200

@app.route('/auth/logout/', methods=['POST'])
def logout_user():
    token = request.headers.get('Authorization')
    user = User.query.filter_by(token=token).first()
    if user:
        user.token = None
        db.session.commit()
        return jsonify({"message": "Logged out successfully"}), 200
    return jsonify({"message": "Invalid token"}), 400


def get_application_dict(application):
    FIELD_META = {
        # Personal Details
        "first_name": {"label": "Full Name", "input_type": "text", "required": True, "max_length": 100},
        "mobile_number": {
            "label": "Mobile Number",
            "input_type": "text",
            "required": True,
            "pattern": r"^\d{10}$",
            "error_message": "Mobile number must be exactly 10 digits."
        },
        "email": {
            "label": "Email",
            "input_type": "text",
            "required": True,
            "pattern": r"^[\w\.-]+@[\w\.-]+\.\w+$",
            "error_message": "Enter a valid email address."
        },
        "date_of_birth": {"label": "Date of Birth", "input_type": "date", "required": True},
        "gender": {
            "label": "Gender",
            "input_type": "select",
            "required": True,
            "options": ["Male", "Female", "Other"]
        },
        
        # KYC Details
        "aadhaar_card_number": {
            "label": "Aadhaar Card Number",
            "input_type": "text",
            "required": True,
            "pattern": r"^\d{12}$",
            "error_message": "Aadhaar number must be exactly 12 digits."
        },
        "aadhar_front": {
            "label": "Upload Aadhaar Card (Front)",
            "input_type": "file",
            "required": True,
            "max_size_mb": 2
        },
        "aadhar_back": {
            "label": "Upload Aadhaar Card (Back)",
            "input_type": "file",
            "required": True,
            "max_size_mb": 2
        },
        "pan_card_number": {
            "label": "PAN Card Number",
            "input_type": "text",
            "required": True,
            "pattern": r"^[A-Z]{5}[0-9]{4}[A-Z]$",
            "error_message": "PAN must follow the format: 5 uppercase letters, 4 digits, 1 uppercase letter."
        },
        "pan_card": {
            "label": "Upload PAN Card",
            "input_type": "file",
            "required": True,
            "max_size_mb": 2
        }
    }


    def field(key):
        meta = FIELD_META[key]
        # Handle Full Name - combine first, middle, and last name
        if key == "first_name":
            # Combine first_name, middle_name, and last_name for display
            first = getattr(application, "first_name", "") or ""
            middle = getattr(application, "middle_name", "") or ""
            last = getattr(application, "last_name", "") or ""
            full_name = " ".join(filter(None, [first, middle, last])).strip()
            field_value = full_name if full_name else first
        else:
            field_value = getattr(application, key, "") or ""
        
        field_data = {
            "field_name": key,
            "label": meta["label"],
            "value": field_value,
            "input_type": meta["input_type"],
            "required": meta["required"]
        }

        optional_keys = [
            "max_length", "min_length", "pattern", "error_message",
            "min_value", "max_value", "max_size_mb", "options"
        ]

        for opt_key in optional_keys:
            if opt_key in meta:
                field_data[opt_key] = meta[opt_key]

        return field_data


    # Payment processing removed — provide safe defaults
    pay_fee_enabled = False
    total_paid = 0
    payment_completed = False

    result = {
        "application_id": application.application_id,
        "current_application_step": application.current_application_step,
        "status": application.status,
        "name": application.first_name + " " + application.last_name,
        "program": "AURUM Banker Program",
        "pay_fee_enabled": pay_fee_enabled,
        "program_total_fee": application.program_total_fee,
        "total_paid_amount": total_paid,
        "payment_completed": payment_completed,
        "payment_history": [],
        "steps": [
            {
                "step": 0,
                "title": "Application Form",
                "sections": [
                    {
                        "section": "Personal Details",
                        "fields": [field(k) for k in [
                            "first_name", "mobile_number", "email", "date_of_birth", "gender"
                        ]]
                    },
                    {
                        "section": "KYC Details",
                        "fields": [field(k) for k in [
                            "aadhaar_card_number", "aadhar_front", "aadhar_back", "pan_card_number", "pan_card"
                        ]]
                    }
                ]
            }
        ]
    }
    return result

@app.route('/dataset/get-application-data/', methods=['GET'])
def get_application_data():
    auth_header = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"error": "Unauthorized"}), 401

    token = auth_header.split(" ")[1]
    print("Received token:", token)
    user = User.query.filter_by(token=token).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Fetch applications of the user
    application = Application.query.filter_by(user_id=user.id).first()

    if not application:
        return jsonify({"error": "Application not found"}), 404

    # Pull CRM data and update application status
    # Skip CRM sync if status is "Payment" or "Completed" (don't override user actions)
    crm_status = None
    crm_data = None
    try:
        # Only sync from CRM if status is not "Payment" or "Completed"
        if application.status not in ["Payment", "Completed"]:
            crm_data = pull_lead_details_from_crm(email=user.email, mobile_number=user.mobile)
            if crm_data:
                crm_status = crm_data.get('Status', '')
                print(f"CRM Status for user {user.mobile}: {crm_status}")
                
                # Update application status based on CRM status
                # Check if status contains "Interview" (e.g., "08-Interview")
                if 'Interview' in crm_status:
                    if application.status != "Interview":
                        print(f"🌟 Updating status from {application.status} → Interview for {application.mobile_number}")
                        application.status = "Interview"
                        db.session.commit()
                # Check if status is in "Result" stage, then check Reason field
                elif 'Result' in crm_status:
                    crm_reason = crm_data.get('Reason', '')
                    if crm_reason == "Selected":
                        if application.status != "Selected":
                            print(f"🌟 Updating status from {application.status} → Selected for {application.mobile_number}")
                            application.status = "Selected"
                            db.session.commit()
                    elif crm_reason == "Rejected":
                        if application.status != "Rejected":
                            print(f"🌟 Updating status from {application.status} → Rejected for {application.mobile_number}")
                            application.status = "Rejected"
                            db.session.commit()
        else:
            print(f"Skipping CRM sync for user {user.mobile} - status is {application.status}")
    except Exception as e:
        print(f"Error pulling CRM data: {e}")
        # Continue even if CRM call fails


    # Get application dict and add CRM status info for button disable logic
    result = get_application_dict(application)
    # Add CRM status to help frontend determine if button should be disabled
    result['crm_status'] = crm_status
    # Check if candidate is selected in Result stage by checking Reason field
    crm_reason = None
    if crm_data:
        crm_reason = crm_data.get('Reason', '')
    result['is_selected_in_result'] = crm_status and 'Result' in crm_status and crm_reason == "Selected"
    
    return jsonify(result), 200




# File fields you want to support
FILE_FIELDS = [
    "aadhar_front", "aadhar_back", "pan_card"
]

@app.route('/dataset/update-application-data/', methods=['POST'])
def update_application_data():
    auth_header = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"error": "Unauthorized"}), 401

    token = auth_header.split(" ")[1]
    user = User.query.filter_by(token=token).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    application = Application.query.filter_by(user_id=user.id).first()
    if not application:
        return jsonify({"error": "Application not found"}), 404

    try:
        # Setup fields
        allowed_fields = [
            "first_name", "mobile_number", "email", "date_of_birth", "gender",
            "aadhaar_card_number", "pan_card_number",
            "current_application_step", "status"
        ]

        form_data = request.form  # for text fields
        file_data = request.files  # for file uploads
        print("Form data:", form_data)  
        print("Form data:", file_data)  
        
        # 🧠 1. Handle text fields
        for key in form_data:
            if key in allowed_fields:
                # Handle Full Name - split into first, middle, last
                if key == "first_name":
                    full_name = form_data[key].strip()
                    name_parts = full_name.split()
                    if len(name_parts) >= 1:
                        application.first_name = name_parts[0]
                    if len(name_parts) >= 2:
                        application.last_name = name_parts[-1]
                    if len(name_parts) > 2:
                        application.middle_name = " ".join(name_parts[1:-1])
                    else:
                        application.middle_name = ""
                else:
                    setattr(application, key, form_data[key])

        # 🧠 2. Handle file fields
        upload_base_path = os.path.join('uploads', str(user.id), str(application.application_id))
        os.makedirs(upload_base_path, exist_ok=True)

        for file_key in file_data:
            if file_key in FILE_FIELDS:
                uploaded_file = file_data[file_key]
                if uploaded_file.filename:
                    # Safe filename
                    filename = secure_filename(file_key + os.path.splitext(uploaded_file.filename)[1])
                    file_path = os.path.join(upload_base_path, filename)
                    uploaded_file.save(file_path)

                    # Save the relative path to the DB field
                    setattr(application, file_key, f"uploads/{user.id}/{application.application_id}/{filename}")

        # Set status to Completed only when explicitly requested by frontend
        try:
            if form_data.get('status') == "Completed":
                application.status = "Completed"
                print(f"✅ Application status set to Completed for {application.application_id}")
                # Send completion lead to CRM
                # send_application_completed_lead_to_crm(application)
		    
            elif form_data.get('status') == "In Progress":
                application.status = "In Progress"
                print(f"📝 Application status set to In Progress for {application.application_id}")
        except Exception as e:
            print("Error setting application status:", e)

        db.session.commit()
        return jsonify(get_application_dict(application)), 200

    except Exception as e:
        print("Error while updating application:", str(e))
        return jsonify({"error": "Internal server error"}), 500




@app.route('/dataset/get-basic-application-data/', methods=['GET'])
def get_basic_application_data():
    auth_header = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"error": "Unauthorized"}), 401

    token = auth_header.split(" ")[1]
    print("Received token:", token)

    try:
        # Decode token to get user identity
        user = User.query.filter_by(token=token).first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Fetch applications of the user
        applications = Application.query.filter_by(user_id=user.id).all()

        application_list = []
        for app in applications:
            application_list.append({
                "application_id": app.application_id,
                "first_name": app.first_name,
                "middle_name": app.middle_name,
                "last_name": app.last_name,
                "email": app.email,
                "mobile": app.mobile_number,
                "program": "AURUM Banker Program",
                "status": app.status,
                # add other fields as needed...
            })

        return jsonify({"applications": application_list}), 200
    except Exception as e:
        print("Exception:", e)
        return jsonify({"error": "Something went wrong"}), 500
    

@app.route('/uploads/<string:user_id>/<string:application_id>/<string:filename>')
def view_image(user_id,application_id, filename):
    print("Receive image req")
    token = request.args.get("token") 

    print("Received image token:", token)
    user = User.query.filter_by(token=token).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    dir_path = os.path.join(UPLOAD_FOLDER, str(user.id), str(application_id))
    safe_dir = os.path.abspath(dir_path)
    safe_file = os.path.abspath(os.path.join(safe_dir, filename))
    if not safe_file.startswith(safe_dir):
        abort(403)  # prevent directory traversal
    if not os.path.exists(safe_file):
        abort(404, description="Image not found")
    return send_from_directory(directory=safe_dir, path=filename)


@app.route('/admin_files/uploads/<string:user_id>/<string:application_id>/<string:filename>')
def admin_view_image(user_id, application_id, filename):
    print(f"Receive file req for admin: user_id={user_id}, application_id={application_id}, filename={filename}")
    user = User.query.filter_by(id=user_id).first()
    if not user:
        print("User not found")
        return jsonify({"error": "User not found"}), 404
    # Try main folder
    dir_path = os.path.join(UPLOAD_FOLDER, str(user.id), str(application_id))
    safe_dir = os.path.abspath(dir_path)
    safe_file = os.path.abspath(os.path.join(safe_dir, filename))
    if safe_file.startswith(safe_dir) and os.path.exists(safe_file):
        return send_file(safe_file)
    # Try loan_application subfolder
    loan_dir_path = os.path.join(UPLOAD_FOLDER, str(user.id), str(application_id), "loan_application")
    loan_safe_dir = os.path.abspath(loan_dir_path)
    loan_safe_file = os.path.abspath(os.path.join(loan_safe_dir, filename))
    if loan_safe_file.startswith(loan_safe_dir) and os.path.exists(loan_safe_file):
        return send_file(loan_safe_file)
    print(f"File not found: {safe_file} or {loan_safe_file}")
    abort(404, description="File not found")

@app.route('/admin_files/thumbnail/<string:user_id>/<string:application_id>/<string:filename>')
def admin_view_thumbnail(user_id, application_id, filename):
    """Generate or serve thumbnails for admin dashboard"""
    print("Receive thumbnail req for admin")
    
    user = User.query.filter_by(id=user_id).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    dir_path = os.path.join(UPLOAD_FOLDER, str(user.id), str(application_id))
    safe_dir = os.path.abspath(dir_path)
    safe_file = os.path.abspath(os.path.join(safe_dir, filename))
    if not safe_file.startswith(safe_dir):
        abort(403)  # prevent directory traversal
    if not os.path.exists(safe_file):
        abort(404, description="File not found")
    
    file_extension = os.path.splitext(filename)[1].lower()
    
    if file_extension == '.pdf':
        # For PDFs, return a PDF icon or first page as thumbnail
        # For now, we'll return a simple PDF icon response
        # In a production environment, you might want to generate actual PDF thumbnails
        return jsonify({
            "type": "pdf",
            "filename": filename,
            "url": f"/admin_files/uploads/{user_id}/{application_id}/{filename}"
        })
    elif file_extension in ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']:
        # For images, return the image itself as thumbnail
        return send_file(safe_file, mimetype='image/' + file_extension[1:])
    else:
        # For other file types, return a generic file icon
        return jsonify({
            "type": "file",
            "filename": filename,
            "url": f"/admin_files/uploads/{user_id}/{application_id}/{filename}"
        })

@app.route('/districts', methods=['GET'])
def get_districts():
    try:
        auth_header = request.headers.get("Authorization")

        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Unauthorized"}), 401

        token = auth_header.split(" ")[1]
        print("Received token:", token)
        user = User.query.filter_by(token=token).first()
        if not user:
            return jsonify({"error": "User not found"}), 404
        file_path = os.path.join(os.path.dirname(__file__),"dataset", 'districts.json')
        with open(file_path, 'r') as file:
            data = json.load(file)
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/universities', methods=['GET'])
def get_universities():
    try:
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Unauthorized"}), 401

        token = auth_header.split(" ")[1]
        print("Received token:", token)
        user = User.query.filter_by(token=token).first()
        if not user:
            return jsonify({"error": "User not found"}), 404
        file_path = os.path.join(os.path.dirname(__file__),"dataset", 'universities.json')
        with open(file_path, 'r') as file:
            data = json.load(file)
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

# Create order endpoint removed
@app.route('/api/create_order', methods=['POST'])
def create_order():
    return jsonify({'error': 'Payment functionality has been removed from this application.'}), 410

# Payment callbacks removed
@app.route('/api/payment_success', methods=['POST', 'GET'])
def payment_success():
    return jsonify({'error': 'Payment callbacks disabled'}), 410
    # Get data from request (POST form data or GET query params from Easebuzz redirect)
    if request.method == 'POST':
        if request.is_json:
            # Frontend API call (JSON)
            response_data = request.json
        else:
            # Easebuzz callback (form data)
            response_data = request.form.to_dict()
    else:
        # GET request (Easebuzz redirect or manual check)
        response_data = request.args.to_dict()
    
    # Extract transaction ID
    txnid = response_data.get('txnid') or response_data.get('merchant_txn')
    application_id = response_data.get('udf1')
    status = response_data.get('status', '').lower()
    
    if not txnid:
        return jsonify({'error': 'Transaction ID not found'}), 400
    
    # Find application by application_id if provided (legacy order-id removed)
    application = None
    if application_id:
        application = Application.query.filter_by(application_id=application_id).first()
    
    if not application:
        return jsonify({'error': 'Application not found'}), 404
    
    # Verify hash (if hash is present in response)
    if 'hash' in response_data:
        if not verify_easebuzz_hash(response_data):
            logging.error(f"Hash verification failed. Response: {response_data}")
            return jsonify({'error': 'Hash verification failed'}), 400
    
    # Fetch payment details from Easebuzz (similar to Razorpay's payment.fetch())
    # This ensures we have complete payment information
    payment_status = fetch_easebuzz_payment_status(txnid)
    
    if payment_status and payment_status.get('status'):
        payment_data = payment_status.get('data', {})
        
        # Extract payment information
        payment_amount = float(payment_data.get('amount', response_data.get('amount', 0)))
        payment_id = payment_data.get('payment_id') or payment_data.get('easebuzz_payment_id') or txnid
        payment_method = payment_data.get('payment_mode', 'online')
        payment_status_value = payment_data.get('status', 'captured')
        
        # Parse timestamp
        payment_timestamp = datetime.now()
        if 'created_at' in payment_data:
            try:
                payment_timestamp = datetime.fromtimestamp(int(payment_data['created_at']))
            except:
                pass
        elif 'addedon' in response_data:
            try:
                payment_timestamp = datetime.fromtimestamp(int(response_data['addedon']))
            except:
                pass
        
        # Payment handling removed
        return jsonify({'error': 'Payment functionality disabled'}), 410
    else:
        # If status API fails, use callback data directly
        if status == 'success':
            payment_amount = float(response_data.get('amount', 0))
            payment_id = response_data.get('payment_id') or response_data.get('easebuzz_payment_id') or txnid
            payment_method = response_data.get('payment_mode', 'online')
            payment_timestamp = datetime.now()
            
            if 'addedon' in response_data:
                try:
                    payment_timestamp = datetime.fromtimestamp(int(response_data['addedon']))
                except:
                    pass
            
            # PaymentHistory storage removed
            pass
            if request.is_json or (request.method == 'POST' and not request.form):
                return jsonify({'status': 'success'})
            else:
                return redirect(f"/portal/payment-success?application_id={application_id}&amount={payment_amount}")
        else:
            if request.is_json or (request.method == 'POST' and not request.form):
                return jsonify({'error': 'Payment failed'}), 400
            else:
                return redirect(f"/portal/payment-failure?application_id={application_id}")

# Check payment status endpoint (removed)
@app.route('/check_payment_status', methods=['GET'])
def check_payment_status():
    return jsonify({'error': 'Payment functionality disabled'}), 410

# Payment failure endpoint removed
@app.route('/payment_failure', methods=['POST', 'GET'])
def payment_failure():
    return jsonify({'error': 'Payment functionality disabled'}), 410

@app.route('/easebuzz_webhook', methods=['POST'])
def easebuzz_webhook():
    return jsonify({'error': 'Webhook endpoint removed'}), 410

# --- Admin Auth & User Management ---

def admin_login_required(role=None):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            user_id = session.get('admin_user_id')
            user_role = session.get('admin_role')
            user = None
            # Try session first
            if user_id:
                user = AdminUser.query.get(user_id)
            # If not in session, try token from Authorization header
            if not user:
                auth_header = request.headers.get('Authorization')
                if auth_header and auth_header.startswith('Bearer '):
                    token = auth_header.split(' ')[1]
                    user = AdminUser.query.filter_by(token=token).first()
                    if user:
                        session['admin_user_id'] = user.id
                        session['admin_role'] = user.role
                        user_id = user.id
                        user_role = user.role
            if not user:
                return jsonify({'error': 'Not logged in'}), 401
            if role and user.role != role:
                return jsonify({'error': 'Insufficient permissions'}), 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator

# Update program fee endpoint
@app.route('/update_program_fee', methods=['POST'])
@admin_login_required('admin')
def update_program_fee():
    data = request.get_json()
    application_id = data.get('application_id')
    new_fee = data.get('program_total_fee')
    
    if not application_id or not new_fee:
        return jsonify({'error': 'Missing application_id or program_total_fee'}), 400
    
    try:
        new_fee = float(new_fee)
        if new_fee < 0:
            return jsonify({'error': 'Program fee cannot be negative'}), 400
    except ValueError:
        return jsonify({'error': 'Invalid fee amount'}), 400
    
    application = Application.query.filter_by(application_id=application_id).first()
    if not application:
        return jsonify({'error': 'Application not found'}), 404
    
    application.program_total_fee = new_fee
    db.session.commit()
    
    return jsonify({
        'message': 'Program fee updated successfully',
        'application_id': application_id,
        'new_fee': new_fee
    })

@app.route('/admin/login', methods=['POST'])
def admin_login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    user = AdminUser.query.filter_by(username=username).first()
    if not user or not bcrypt.checkpw(password.encode('utf-8'), user.password_hash.encode('utf-8')):
        return jsonify({'error': 'Invalid credentials'}), 401
    # Check if user is active
    if not user.is_active:
        return jsonify({'error': 'Your account has been deactivated. Please contact your administrator.'}), 403
    session['admin_user_id'] = user.id
    session['admin_role'] = user.role
    # Generate a simple token (in production, use JWT)
    import secrets
    token = secrets.token_urlsafe(32)
    user.token = token  # Store the token in the database
    db.session.commit()
    return jsonify({
        'message': 'Login successful', 
        'token': token,
        'user': {
            'id': user.id,
            'username': user.username,
            'role': user.role,
            'mobile_number': getattr(user, 'mobile_number', None)
        }
    })

@app.route('/admin/logout', methods=['POST'])
@admin_login_required()
def admin_logout():
    session.pop('admin_user_id', None)
    session.pop('admin_role', None)
    return jsonify({'message': 'Logged out'})

@app.route('/admin/forgot-password', methods=['POST'])
def admin_forgot_password():
    data = request.get_json()
    action = data.get('action')
    
    if action == 'verify_user':
        username = data.get('username')
        mobile_number = data.get('mobile_number')
        
        if not username or not mobile_number:
            return jsonify({'error': 'Username and mobile number are required'}), 400
            
        user = AdminUser.query.filter_by(username=username, mobile_number=mobile_number).first()
        if not user:
            return jsonify({'error': 'Invalid Username or Mobile Number combination'}), 404
            
        return jsonify({
            'message': 'User verified successfully',
            'username': user.username,
            'user_id': user.id
        })
        
    elif action == 'get_username_by_mobile':
        mobile_number = data.get('mobile_number')
        
        if not mobile_number:
            return jsonify({'error': 'Mobile number is required'}), 400
            
        user = AdminUser.query.filter_by(mobile_number=mobile_number).first()
        if not user:
            return jsonify({'error': 'No user found with this mobile number'}), 404
            
        return jsonify({
            'message': 'Username retrieved successfully',
            'username': user.username
        })
        
    elif action == 'reset_password_self':
        username = data.get('username')
        mobile_number = data.get('mobile_number')
        new_password = data.get('new_password')
        
        if not username or not mobile_number or not new_password:
            return jsonify({'error': 'Username, mobile number, and new password are required'}), 400
            
        user = AdminUser.query.filter_by(username=username, mobile_number=mobile_number).first()
        if not user:
            return jsonify({'error': 'Invalid Username or Mobile Number combination'}), 404
            
        # Update password
        user.password_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        db.session.commit()
        
        return jsonify({
            'message': 'Password updated successfully',
            'username': user.username
        })
        
    elif action == 'get_username':
        # This is a simple endpoint to help users remember their username
        # In a real application, you might want to add email verification
        return jsonify({
            'message': 'Please contact your system administrator to retrieve your username',
            'contact_info': 'Contact your admin team for username recovery'
        })
        
    else:
        return jsonify({'error': 'Invalid action'}), 400

@app.route('/admin/reset-password', methods=['POST'])
@admin_login_required()
def admin_reset_password():
    data = request.get_json()
    user = AdminUser.query.get(session['admin_user_id'])
    if user.role == 'admin':
        # Admin can reset any user's password
        username = data.get('username')
        new_password = data.get('new_password')
        target = AdminUser.query.filter_by(username=username).first()
        if not target:
            return jsonify({'error': 'User not found'}), 404
        target.password_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        db.session.commit()
        return jsonify({'message': f'Password reset for {username}'})
    else:
        # Others can only reset their own password
        old_password = data.get('old_password')
        new_password = data.get('new_password')
        if not bcrypt.checkpw(old_password.encode('utf-8'), user.password_hash.encode('utf-8')):
            return jsonify({'error': 'Old password incorrect'}), 400
        user.password_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        db.session.commit()
        return jsonify({'message': 'Password updated'})

@app.route('/admin/users', methods=['GET'])
@admin_login_required('admin')
def list_admin_users():
    users = AdminUser.query.all()
    return jsonify([{
        'id': u.id, 
        'username': u.username, 
        'role': u.role, 
        'mobile_number': getattr(u, 'mobile_number', None),
        'created_at': u.created_at,
        'is_active': u.is_active
    } for u in users])

@app.route('/admin/users/<int:user_id>/toggle-status', methods=['POST'])
@admin_login_required('admin')
def toggle_user_status(user_id):
    user = AdminUser.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Prevent admin from deactivating themselves
    if user.id == session['admin_user_id']:
        return jsonify({'error': 'You cannot deactivate your own account'}), 400
    
    user.is_active = not user.is_active
    db.session.commit()
    
    return jsonify({
        'message': f'User {"activated" if user.is_active else "deactivated"} successfully',
        'is_active': user.is_active
    })

@app.route('/admin/signup', methods=['POST'])
def admin_signup():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    mobile_number = data.get('mobile_number')
    
    if not username or not password or not mobile_number:
        return jsonify({'error': 'Username, password, and mobile number are required'}), 400
        
    if AdminUser.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 400
        
    if AdminUser.query.filter_by(mobile_number=mobile_number).first():
        return jsonify({'error': 'Mobile number already registered'}), 400
    
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    user = AdminUser(
        username=username, 
        password_hash=password_hash, 
        role='user',
        mobile_number=mobile_number,
        is_active=False  # Inactive by default
    )
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'message': 'User created successfully! Please contact admin for activation.'})

@app.route('/admin/users', methods=['POST'])
@admin_login_required('admin')
def create_admin_user():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    role = data.get('role')
    mobile_number = data.get('mobile_number')
    
    if not username or not password or not role:
        return jsonify({'error': 'Missing fields'}), 400
    if AdminUser.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 400
    if mobile_number and AdminUser.query.filter_by(mobile_number=mobile_number).first():
        return jsonify({'error': 'Mobile number already registered'}), 400
    
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    user = AdminUser(
        username=username, 
        password_hash=password_hash, 
        role=role,
        mobile_number=mobile_number,
        is_active=False  # Inactive by default
    )
    db.session.add(user)
    db.session.commit()
    
    # TODO: Send email notification
    # send_new_user_notification(user)
    
    return jsonify({'message': 'User created (inactive by default)'})

@app.route('/admin/users/<int:user_id>', methods=['PUT'])
@admin_login_required('admin')
def update_admin_user(user_id):
    data = request.get_json()
    user = AdminUser.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    # Only update role if provided and not blank
    if 'role' in data and data['role']:
        user.role = data['role']
    # Only update password if provided and not blank
    if 'password' in data and data['password']:
        user.password_hash = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    db.session.commit()
    return jsonify({'message': 'User updated'})

@app.route('/admin/users/<int:user_id>', methods=['DELETE'])
@admin_login_required('admin')
def delete_admin_user(user_id):
    user = AdminUser.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted'})

@app.route('/applications', methods=['GET'])
@admin_login_required()
def get_applications():
    # Pagination
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 50))
    search = request.args.get('search', '').strip().lower()

    query = Application.query

    # Search filter (searches across name, email, mobile, application_id)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            db.or_(
                Application.first_name.ilike(search_pattern),
                Application.last_name.ilike(search_pattern),
                Application.email.ilike(search_pattern),
                Application.mobile_number.ilike(search_pattern),
                Application.application_id.ilike(search_pattern)
            )
        )

    # LIFO: latest created first
    query = query.order_by(Application.created_at.desc())

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    applications = pagination.items
    total = pagination.total
    total_pages = pagination.pages

    def app_to_dict(app):
        # PaymentHistory references removed; provide safe defaults.
        provider_disbursed = sum(p.disbursed_amount or 0 for p in LoanProviderSelection.query.filter_by(application_id=app.application_id).all() if p.disbursed_amount)
        total_paid = provider_disbursed
        return {
            'id': app.id,
            'application_id': app.application_id,
            'user_id': app.user_id,
            'first_name': app.first_name,
            'middle_name': app.middle_name,
            'last_name': app.last_name,
            'mobile_number': app.mobile_number,
            'email': app.email,
            'date_of_birth': app.date_of_birth,
            'pan_card_number': app.pan_card_number,
            'gender': app.gender,
            'family_income': app.family_income,
            'address': app.address,
            'state': app.state,
            'district': app.district,
            'city': app.city,
            'pincode': app.pincode,
            'ug_university_name': app.ug_university_name,
            'ug_degree': app.ug_degree,
            'ug_year_graduated': app.ug_year_graduated,
            'pg_university_name': app.pg_university_name,
            'pg_degree': app.pg_degree,
            'pg_year_graduated': app.pg_year_graduated,
            'current_job_title': app.current_job_title,
            'company_name': app.company_name,
            'job_type': app.job_type,
            'location': app.location,
            'exp_current_company': app.exp_current_company,
            'total_experience': app.total_experience,
            'passport_photo': app.passport_photo,
            'aadhar_front': app.aadhar_front,
            'aadhar_back': app.aadhar_back,
            'pan_card': app.pan_card,
            'ug_certificate': app.ug_certificate,
            'pg_certificate': app.pg_certificate,
            'resume': app.resume,
            'current_application_step': app.current_application_step,
            'status': app.status,
            'created_at': app.created_at,
            'updated_at': app.updated_at,
            'program_total_fee': app.program_total_fee,
            'total_amount_paid': total_paid,
            'approved_loan_amount': provider_disbursed,
        }

    return jsonify({
        'applications': [app_to_dict(a) for a in applications],
        'total': total,
        'total_pages': total_pages,
        'page': page,
        'per_page': per_page
    })

@app.route('/applications/<int:app_id>', methods=['PUT'])
@admin_login_required()
def update_application(app_id):
    user = AdminUser.query.get(session['admin_user_id'])
    app = Application.query.get(app_id)
    if not app:
        return jsonify({'error': 'Application not found'}), 404
    data = request.get_json()
    from datetime import datetime
    # Filter out datetime fields that should not be updated from frontend
    datetime_fields = ['created_at', 'updated_at']
    filtered_data = {k: v for k, v in data.items() if k not in datetime_fields}
    # Special handling for payment_timestamp
    # Payment-related timestamp/amount fields removed from editable list.
    # Admin can edit all fields, ops can edit only payment-related fields
    if user.role == 'admin':
        for key, value in filtered_data.items():
            if hasattr(app, key):
                # Only set scalar values, skip dict/list
                if isinstance(value, (dict, list)):
                    continue
                setattr(app, key, value)
    elif user.role == 'ops':
        # Ops role no longer allowed to edit payment provider fields; only fee
        payment_fields = ['program_total_fee']
        for key, value in filtered_data.items():
            if key in payment_fields:
                setattr(app, key, value)
    else:
        return jsonify({'error': 'Insufficient permissions'}), 403
    # Update the updated_at timestamp
    app.updated_at = datetime.utcnow()
    db.session.commit()
    return jsonify({'message': 'Application updated'})

@app.route('/applications/bulk-delete', methods=['POST'])
@admin_login_required('admin')
def bulk_delete_applications():
    data = request.get_json()
    ids = data.get('ids', [])
    if not ids:
        return jsonify({'error': 'No IDs provided'}), 400
    deleted = 0
    for app_id in ids:
        app = Application.query.get(app_id)
        if app:
            application_id = app.application_id
            user_id = app.user_id
            # PaymentHistory removed
            # Delete all LoanApplication records for this application_id
            LoanApplication.query.filter_by(application_id=application_id).delete()
            # Delete all LoanProviderSelection records for this application_id
            LoanProviderSelection.query.filter_by(application_id=application_id).delete()
            # Delete CallBackUsers by mobile or email only (application_id does not exist in this table)
            CallBackUsers.query.filter(
                or_(CallBackUsers.mobile == app.mobile_number, CallBackUsers.email == app.email)
            ).delete()
            # Delete User by mobile or email (in addition to user_id logic)
            User.query.filter(
                or_(User.mobile == app.mobile_number, User.email == app.email)
            ).delete()
            # Delete the Application itself
            db.session.delete(app)
            # If this user has no other applications, delete the User as well (by user_id)
            other_apps = Application.query.filter_by(user_id=user_id).count()
            if other_apps == 1:  # Only this app exists
                user = User.query.get(user_id)
                if user:
                    db.session.delete(user)
            deleted += 1
    db.session.commit()
    return jsonify({'message': f'{deleted} applications deleted'})

@app.route('/applications/bulk-download', methods=['POST'])
@admin_login_required()
def bulk_download_applications():
    data = request.get_json()
    ids = data.get('ids', [])
    if not ids:
        return jsonify({'error': 'No IDs provided'}), 400
    apps = Application.query.filter(Application.id.in_(ids)).all()
    rows = []
    doc_fields = [
        'passport_photo', 'aadhar_front', 'aadhar_back', 'pan_card', 'ug_certificate', 'pg_certificate', 'resume'
    ]
    for app in apps:
        row = {}
        for col in app.__table__.columns:
            if col.name not in doc_fields:
                row[col.name] = getattr(app, col.name)
        rows.append(row)
    df = pd.DataFrame(rows)
    output = BytesIO()
    df.to_excel(output, index=False, engine='openpyxl')
    output.seek(0)
    return send_file(
        output,
        as_attachment=True,
        download_name='applications.xlsx',
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )

@app.route('/payment-history', methods=['GET'])
@admin_login_required()
def get_payment_history():
    return jsonify({'error': 'Payment history endpoint removed'}), 410

@app.route('/download-payment-receipt/<int:application_id>', methods=['GET'])
@admin_login_required()
def download_payment_receipt(application_id):
    return jsonify({'error': 'Payment receipts are not available'}), 410

@app.route('/download-payment-receipt-by-payment/<int:payment_id>', methods=['GET'])
@admin_login_required()
def download_payment_receipt_by_payment(payment_id):
    return jsonify({'error': 'Payment receipts are not available'}), 410

# --- Loan Application Endpoints ---
from sqlalchemy.exc import IntegrityError

@app.route('/loan-applications', methods=['POST'])
def create_loan_application():
    print("RAW FORM:", request.form)
    print("RAW FILES:", request.files)
    try:
        data = request.form.get('data')
        print("PARSED DATA:", data)
        if data:
            data = json.loads(data)
            print("JSON DATA:", data)
    except Exception as e:
        print("Error parsing data:", e)
    application_id = data.get('application_id')
    if not application_id:
        return jsonify({'error': 'Missing application_id'}), 400
    app_obj = Application.query.filter_by(application_id=application_id).first()
    if not app_obj:
        return jsonify({'error': 'Invalid application_id'}), 400
    files = request.files if request.content_type and request.content_type.startswith('multipart/form-data') else None

    def save_file(field, applicant_idx):
        if not files:
            return None
        f = files.get(field)
        if f and f.filename:
            # Always save in subfolder for each applicant
            upload_base = os.path.join('uploads', str(app_obj.user_id), str(application_id), 'loan_application', f'applicant{applicant_idx}')
            os.makedirs(upload_base, exist_ok=True)
            base_filename = secure_filename(field + '_' + f.filename)
            filename = base_filename
            file_path = os.path.join(upload_base, filename)
            # Ensure unique filename if conflict
            if os.path.exists(file_path):
                import time, random
                name, ext = os.path.splitext(base_filename)
                filename = f"{name}_{int(time.time())}_{random.randint(1000,9999)}{ext}"
                file_path = os.path.join(upload_base, filename)
            f.save(file_path)
            # Return relative path for DB
            return f"uploads/{app_obj.user_id}/{application_id}/loan_application/applicant{applicant_idx}/{filename}"
        return None

    # Save applicant files in their subfolders (no fallback)
    applicant1_pan = save_file('applicant1_pan', 1)
    applicant1_aadhar_front = save_file('applicant1_aadhar_front', 1)
    applicant1_aadhar_back = save_file('applicant1_aadhar_back', 1)
    applicant1_bank_statement = save_file('applicant1_bank_statement', 1)
    applicant1_salary_slip = save_file('applicant1_salary_slip', 1)
    applicant2_pan = save_file('applicant2_pan', 2)
    applicant2_aadhar_front = save_file('applicant2_aadhar_front', 2)
    applicant2_aadhar_back = save_file('applicant2_aadhar_back', 2)
    applicant2_bank_statement = save_file('applicant2_bank_statement', 2)
    applicant2_salary_slip = save_file('applicant2_salary_slip', 2)
    applicant3_pan = save_file('applicant3_pan', 3)
    applicant3_aadhar_front = save_file('applicant3_aadhar_front', 3)
    applicant3_aadhar_back = save_file('applicant3_aadhar_back', 3)
    applicant3_bank_statement = save_file('applicant3_bank_statement', 3)
    applicant3_salary_slip = save_file('applicant3_salary_slip', 3)
    # Upsert LoanApplication (one row per application_id)
    loan_app = LoanApplication.query.filter_by(application_id=application_id).first()
    if not loan_app:
        loan_app = LoanApplication(application_id=application_id)
        db.session.add(loan_app)
    # Update fields
    for field in [
        'registered_user_name',
        'applicant1_name','applicant1_relationship',
        'applicant2_name','applicant2_relationship',
        'applicant3_name','applicant3_relationship']:
        if data.get(field):
            setattr(loan_app, field, data.get(field))
    # Set file fields if uploaded
    if applicant1_pan: loan_app.applicant1_pan = applicant1_pan
    if applicant1_aadhar_front: loan_app.applicant1_aadhar_front = applicant1_aadhar_front
    if applicant1_aadhar_back: loan_app.applicant1_aadhar_back = applicant1_aadhar_back
    if applicant1_bank_statement: loan_app.applicant1_bank_statement = applicant1_bank_statement
    if applicant1_salary_slip: loan_app.applicant1_salary_slip = applicant1_salary_slip
    if applicant2_pan: loan_app.applicant2_pan = applicant2_pan
    if applicant2_aadhar_front: loan_app.applicant2_aadhar_front = applicant2_aadhar_front
    if applicant2_aadhar_back: loan_app.applicant2_aadhar_back = applicant2_aadhar_back
    if applicant2_bank_statement: loan_app.applicant2_bank_statement = applicant2_bank_statement
    if applicant2_salary_slip: loan_app.applicant2_salary_slip = applicant2_salary_slip
    if applicant3_pan: loan_app.applicant3_pan = applicant3_pan
    if applicant3_aadhar_front: loan_app.applicant3_aadhar_front = applicant3_aadhar_front
    if applicant3_aadhar_back: loan_app.applicant3_aadhar_back = applicant3_aadhar_back
    if applicant3_bank_statement: loan_app.applicant3_bank_statement = applicant3_bank_statement
    if applicant3_salary_slip: loan_app.applicant3_salary_slip = applicant3_salary_slip
    db.session.commit()
    return jsonify({'id': loan_app.id}), 201

@app.route('/loan-provider-selections', methods=['POST'])
def create_loan_provider_selection():
    data = request.get_json()
    application_id = data.get('application_id')
    if not application_id:
        return jsonify({'error': 'Missing application_id'}), 400
    # Check if provider already chosen for this application
    existing = LoanProviderSelection.query.filter_by(application_id=application_id, loan_provider_name=data.get('loan_provider_name')).first()
    if existing:
        return jsonify({'error': 'Provider already chosen for this application'}), 400
    provider = LoanProviderSelection(
        application_id=application_id,
        loan_provider_name=data.get('loan_provider_name'),
        loan_amount=data.get('loan_amount'),
        loan_tenure=data.get('loan_tenure'),
        loan_interest=data.get('loan_interest'),
        emi=data.get('emi'),
        status=data.get('status', 'Pending'),
        disbursal_date=data.get('disbursal_date'),
        disbursed_amount=data.get('disbursed_amount'),
        final_interest_rate=data.get('final_interest_rate'),
        loan_processed_by=data.get('loan_processed_by')
    )
    db.session.add(provider)
    db.session.commit()
    return jsonify({'id': provider.id}), 201

@app.route('/loan-provider-selections', methods=['GET'])
def list_loan_provider_selections():
    application_id = request.args.get('application_id')
    if not application_id:
        return jsonify({'error': 'Missing application_id'}), 400
    providers = LoanProviderSelection.query.filter_by(application_id=application_id).all()
    return jsonify({'providers': [
        {
            'id': p.id,
            'application_id': p.application_id,
            'loan_provider_name': p.loan_provider_name,
            'loan_amount': p.loan_amount,
            'loan_tenure': p.loan_tenure,
            'loan_interest': p.loan_interest,
            'emi': p.emi,
            'status': p.status,
            'disbursal_date': p.disbursal_date.isoformat() if p.disbursal_date else None,
            'disbursed_amount': p.disbursed_amount,
            'final_interest_rate': p.final_interest_rate,
            'loan_processed_by': p.loan_processed_by,
            'created_at': p.created_at.isoformat() if p.created_at else None,
            'updated_at': p.updated_at.isoformat() if p.updated_at else None
        } for p in providers
    ]})

@app.route('/loan-applications/<int:loan_id>', methods=['PUT'])
@admin_login_required()
def update_loan_application(loan_id):
    loan_app = LoanApplication.query.get(loan_id)
    if not loan_app:
        return jsonify({'error': 'Loan application not found'}), 404
    data = request.get_json()
    from datetime import datetime, date
    date_fields = ['disbursal_date']
    datetime_fields = ['created_at', 'updated_at']
    for key, value in data.items():
        if hasattr(loan_app, key):
            if key in date_fields and value:
                # Accepts 'YYYY-MM-DD' or None
                if isinstance(value, str):
                    try:
                        setattr(loan_app, key, datetime.strptime(value, "%Y-%m-%d").date())
                    except Exception:
                        setattr(loan_app, key, None)
                else:
                    setattr(loan_app, key, value)
            elif key in datetime_fields and value:
                # Accepts 'YYYY-MM-DDTHH:MM:SS' or None
                if isinstance(value, str):
                    try:
                        setattr(loan_app, key, datetime.fromisoformat(value))
                    except Exception:
                        setattr(loan_app, key, None)
                else:
                    setattr(loan_app, key, value)
            else:
                setattr(loan_app, key, value)
    db.session.commit()
    return jsonify({'message': 'Loan application updated'})

@app.route('/loan-applications', methods=['GET'])
@admin_login_required()
def list_loan_applications():
    application_id = request.args.get('application_id')
    query = db.session.query(LoanApplication, Application).join(Application, LoanApplication.application_id == Application.application_id)
    if application_id:
        query = query.filter(LoanApplication.application_id == application_id)
    results = query.all()
    def loan_to_dict(loan, app):
        return {
            'id': loan.id,
            'application_id': loan.application_id,
            'user_id': app.user_id,
            'candidate_name': loan.candidate_name or f"{app.first_name or ''} {app.middle_name or ''} {app.last_name or ''}".strip(),
            'program': loan.program or 'AURUM Banker Program',
            'applicant1_name': loan.applicant1_name,
            'applicant1_relationship': loan.applicant1_relationship,
            'applicant1_pan': loan.applicant1_pan,
            'applicant1_aadhar_front': loan.applicant1_aadhar_front,
            'applicant1_aadhar_back': loan.applicant1_aadhar_back,
            'applicant1_bank_statement': loan.applicant1_bank_statement,
            'applicant1_salary_slip': loan.applicant1_salary_slip,
            'applicant2_name': loan.applicant2_name,
            'applicant2_relationship': loan.applicant2_relationship,
            'applicant2_pan': loan.applicant2_pan,
            'applicant2_aadhar_front': loan.applicant2_aadhar_front,
            'applicant2_aadhar_back': loan.applicant2_aadhar_back,
            'applicant2_bank_statement': loan.applicant2_bank_statement,
            'applicant2_salary_slip': loan.applicant2_salary_slip,
            'applicant3_name': loan.applicant3_name,
            'applicant3_relationship': loan.applicant3_relationship,
            'applicant3_pan': loan.applicant3_pan,
            'applicant3_aadhar_front': loan.applicant3_aadhar_front,
            'applicant3_aadhar_back': loan.applicant3_aadhar_back,
            'applicant3_bank_statement': loan.applicant3_bank_statement,
            'applicant3_salary_slip': loan.applicant3_salary_slip,
            'created_at': loan.created_at,
            'updated_at': loan.updated_at,
            # Add any new fields from LoanApplication here
        }
    return jsonify({'loans': [loan_to_dict(loan, app) for loan, app in results]})

@app.route('/loan-applications/<int:loan_id>', methods=['GET'])
@admin_login_required()
def get_loan_application(loan_id):
    loan = LoanApplication.query.get(loan_id)
    if not loan:
        return jsonify({'error': 'Loan application not found'}), 404
    app = Application.query.filter_by(application_id=loan.application_id).first()
    return jsonify({'loan': {
        'id': loan.id,
        'application_id': loan.application_id,
        'user_id': app.user_id,
        'candidate_name': f"{app.first_name or ''} {app.middle_name or ''} {app.last_name or ''}".strip(),
        'program': 'AURUM Banker Program',
        'applicant1_name': loan.applicant1_name,
        'applicant1_relationship': loan.applicant1_relationship,
        'applicant1_pan': loan.applicant1_pan,
        'applicant1_aadhar_front': loan.applicant1_aadhar_front,
        'applicant1_aadhar_back': loan.applicant1_aadhar_back,
        'applicant1_bank_statement': loan.applicant1_bank_statement,
        'applicant1_salary_slip': loan.applicant1_salary_slip,
        'applicant2_name': loan.applicant2_name,
        'applicant2_relationship': loan.applicant2_relationship,
        'applicant2_pan': loan.applicant2_pan,
        'applicant2_aadhar_front': loan.applicant2_aadhar_front,
        'applicant2_aadhar_back': loan.applicant2_aadhar_back,
        'applicant2_bank_statement': loan.applicant2_bank_statement,
        'applicant2_salary_slip': loan.applicant2_salary_slip,
        'applicant3_name': loan.applicant3_name,
        'applicant3_relationship': loan.applicant3_relationship,
        'applicant3_pan': loan.applicant3_pan,
        'applicant3_aadhar_front': loan.applicant3_aadhar_front,
        'applicant3_aadhar_back': loan.applicant3_aadhar_back,
        'applicant3_bank_statement': loan.applicant3_bank_statement,
        'applicant3_salary_slip': loan.applicant3_salary_slip,
        'created_at': loan.created_at,
        'updated_at': loan.updated_at,
        # Add any new fields from LoanApplication here
    }})

@app.route('/loan-applications/<int:loan_id>/download-documents', methods=['GET'])
@admin_login_required()
def download_loan_documents(loan_id):
    loan = LoanApplication.query.get(loan_id)
    if not loan:
        return jsonify({'error': 'Loan application not found'}), 404
    app_obj = Application.query.filter_by(application_id=loan.application_id).first()
    if not app_obj:
        return jsonify({'error': 'Application not found'}), 404
    user_id = app_obj.user_id
    application_id = loan.application_id
    zip_buffer = BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for idx in range(1, 4):
            folder = f"applicant{idx}"
            fields = [
                f"applicant{idx}_pan",
                f"applicant{idx}_aadhar_front",
                f"applicant{idx}_aadhar_back",
                f"applicant{idx}_bank_statement",
                f"applicant{idx}_salary_slip"
            ]
            for field in fields:
                rel_path = getattr(loan, field, None)
                if rel_path:
                    abs_path = os.path.join(os.getcwd(), rel_path)
                    if os.path.exists(abs_path):
                        ext = os.path.splitext(abs_path)[1]
                        name = f"{field}{ext}"
                        zipf.write(abs_path, arcname=os.path.join(folder, name))
    zip_buffer.seek(0)
    return send_file(zip_buffer, mimetype='application/zip', as_attachment=True, download_name=f"loan_documents_{application_id}.zip")

@app.route('/loan-applications/by-application-id/<string:application_id>', methods=['PUT'])
@admin_login_required()
def update_loan_application_by_application_id(application_id):
    loan_app = LoanApplication.query.filter_by(application_id=application_id).first()
    if not loan_app:
        return jsonify({'error': 'Loan application not found'}), 404
    data = request.get_json()
    from datetime import datetime, date
    date_fields = ['disbursal_date']
    datetime_fields = ['created_at', 'updated_at']
    for key, value in data.items():
        if hasattr(loan_app, key):
            if key in date_fields and value:
                # Accepts 'YYYY-MM-DD' or None
                if isinstance(value, str):
                    try:
                        setattr(loan_app, key, datetime.strptime(value, "%Y-%m-%d").date())
                    except Exception:
                        setattr(loan_app, key, None)
                else:
                    setattr(loan_app, key, value)
            elif key in datetime_fields and value:
                # Accepts 'YYYY-MM-DDTHH:MM:SS' or None
                if isinstance(value, str):
                    try:
                        setattr(loan_app, key, datetime.fromisoformat(value))
                    except Exception:
                        setattr(loan_app, key, None)
                else:
                    setattr(loan_app, key, value)
            else:
                setattr(loan_app, key, value)
    db.session.commit()
    return jsonify({'message': 'Loan application updated'})

@app.route('/user/download-payment-receipt', methods=['GET'])
def user_download_payment_receipt():
    return jsonify({'error': 'Payment receipts are not available'}), 410

@app.route('/loan-provider-selections/<int:provider_id>', methods=['PUT'])
def update_loan_provider_selection(provider_id):
    provider = LoanProviderSelection.query.get(provider_id)
    if not provider:
        return jsonify({'error': 'Provider selection not found'}), 404
    data = request.get_json()
    from datetime import datetime, date
    date_fields = ['disbursal_date']
    datetime_fields = ['created_at', 'updated_at']
    disbursed_amount_updated = False
    for key, value in data.items():
        if hasattr(provider, key):
            if key in date_fields and value:
                if isinstance(value, str):
                    try:
                        setattr(provider, key, datetime.strptime(value, "%Y-%m-%d").date())
                    except Exception:
                        setattr(provider, key, None)
                else:
                    setattr(provider, key, value)
            elif key in datetime_fields and value:
                if isinstance(value, str):
                    try:
                        setattr(provider, key, datetime.fromisoformat(value))
                    except Exception:
                        setattr(provider, key, None)
                else:
                    setattr(provider, key, value)
            else:
                setattr(provider, key, value)
            if key == 'disbursed_amount':
                disbursed_amount_updated = True
    # If disbursed_amount was updated, update Application.approved_loan_amount
    if disbursed_amount_updated and provider.disbursed_amount is not None:
        loan_app = LoanApplication.query.filter_by(application_id=provider.application_id).first()
        if loan_app:
            app = Application.query.filter_by(application_id=loan_app.application_id).first()
            if app:
                app.approved_loan_amount = provider.disbursed_amount
    db.session.commit()
    return jsonify({'message': 'Provider selection updated'})

@app.route('/admin_files/uploads/<int:user_id>/<string:application_id>/loan_application/<string:filename>')
def serve_uploaded_file(user_id, application_id, filename):
    # Try applicant subfolders first
    for idx in range(1, 4):
        sub_dir = os.path.join('uploads', str(user_id), str(application_id), 'loan_application', f'applicant{idx}')
        sub_file = os.path.join(sub_dir, filename)
        if os.path.exists(sub_file):
            return send_from_directory(sub_dir, filename)
    # Then try directly in loan_application folder (legacy/flat structure)
    flat_dir = os.path.join('uploads', str(user_id), str(application_id), 'loan_application')
    flat_file = os.path.join(flat_dir, filename)
    if os.path.exists(flat_file):
        return send_from_directory(flat_dir, filename)
    print(f"File not found: {filename} checked in: "
          f"uploads/{user_id}/{application_id}/loan_application/applicant1, "
          f"uploads/{user_id}/{application_id}/loan_application/applicant2, "
          f"uploads/{user_id}/{application_id}/loan_application/applicant3, "
          f"uploads/{user_id}/{application_id}/loan_application/")
    return abort(404)

@app.route('/admin_files/<path:filename>')
def serve_any_admin_file(filename):
    import os
    from flask import send_file, abort
    # Remove leading 'uploads/' if present
    if filename.startswith('uploads/'):
        filename = filename[len('uploads/'):]
    abs_path = os.path.abspath(os.path.join('uploads', filename))
    if os.path.exists(abs_path):
        return send_file(abs_path)
    abort(404)

@app.route('/user/loan-application', methods=['GET'])
def user_get_loan_application():
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"error": "Unauthorized"}), 401
    token = auth_header.split(" ")[1]
    user = User.query.filter_by(token=token).first()
    if not user:
        return jsonify({"error": "User not found"}), 404
    application_id = request.args.get('application_id')
    if not application_id:
        return jsonify({"error": "Missing application_id"}), 400
    app_obj = Application.query.filter_by(application_id=application_id, user_id=user.id).first()
    if not app_obj:
        return jsonify({"error": "Application not found for this user"}), 404
    loan = LoanApplication.query.filter_by(application_id=application_id).first()
    if not loan:
        return jsonify({"error": "Loan application not found"}), 404
    # Return the same structure as the admin endpoint
    return jsonify({'loan': {
        'id': loan.id,
        'application_id': loan.application_id,
        'user_id': app_obj.user_id,
        'candidate_name': loan.candidate_name or f"{app_obj.first_name or ''} {app_obj.middle_name or ''} {app_obj.last_name or ''}".strip(),
        'program': loan.program or 'AURUM Banker Program',
        'applicant1_name': loan.applicant1_name,
        'applicant1_relationship': loan.applicant1_relationship,
        'applicant1_pan': loan.applicant1_pan,
        'applicant1_aadhar_front': loan.applicant1_aadhar_front,
        'applicant1_aadhar_back': loan.applicant1_aadhar_back,
        'applicant1_bank_statement': loan.applicant1_bank_statement,
        'applicant1_salary_slip': loan.applicant1_salary_slip,
        'applicant2_name': loan.applicant2_name,
        'applicant2_relationship': loan.applicant2_relationship,
        'applicant2_pan': loan.applicant2_pan,
        'applicant2_aadhar_front': loan.applicant2_aadhar_front,
        'applicant2_aadhar_back': loan.applicant2_aadhar_back,
        'applicant2_bank_statement': loan.applicant2_bank_statement,
        'applicant2_salary_slip': loan.applicant2_salary_slip,
        'applicant3_name': loan.applicant3_name,
        'applicant3_relationship': loan.applicant3_relationship,
        'applicant3_pan': loan.applicant3_pan,
        'applicant3_aadhar_front': loan.applicant3_aadhar_front,
        'applicant3_aadhar_back': loan.applicant3_aadhar_back,
        'applicant3_bank_statement': loan.applicant3_bank_statement,
        'applicant3_salary_slip': loan.applicant3_salary_slip,
        'created_at': loan.created_at,
        'updated_at': loan.updated_at,
    }})

@app.route('/loan-applications/bulk-download', methods=['POST'])
@admin_login_required()
def bulk_download_loan_applications():
    data = request.get_json()
    ids = data.get('ids', [])
    if not ids:
        return jsonify({'error': 'No IDs provided'}), 400
    # Join LoanApplication with Application for candidate_name, program, etc.
    query = db.session.query(LoanApplication, Application).join(Application, LoanApplication.application_id == Application.application_id)
    query = query.filter(LoanApplication.id.in_(ids))
    results = query.all()
    rows = []
    for loan, app in results:
        rows.append({
            'Loan ID': loan.id,
            'Application ID': loan.application_id,
            'Candidate Name': loan.candidate_name or f"{app.first_name or ''} {app.middle_name or ''} {app.last_name or ''}".strip(),
            'Program': loan.program or 'AURUM Banker Program',
            'Applicant 1 Name': loan.applicant1_name,
            'Applicant 1 Relationship': loan.applicant1_relationship,
            'Applicant 2 Name': loan.applicant2_name,
            'Applicant 2 Relationship': loan.applicant2_relationship,
            'Applicant 3 Name': loan.applicant3_name,
            'Applicant 3 Relationship': loan.applicant3_relationship,
            'Created At': loan.created_at,
            'Updated At': loan.updated_at,
            # Add more non-file fields as needed
        })
    import pandas as pd
    from io import BytesIO
    output = BytesIO()
    df = pd.DataFrame(rows)
    df.to_excel(output, index=False, engine='openpyxl')
    output.seek(0)
    return send_file(
        output,
        as_attachment=True,
        download_name='loan_history.xlsx',
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )

@app.route('/payment-history/bulk-download', methods=['POST'])
@admin_login_required()
def bulk_download_payment_history():
    return jsonify({'error': 'Payment history export removed'}), 410

@app.route('/applications/<string:application_id>/download-documents', methods=['GET'])
@admin_login_required()
def download_candidate_documents(application_id):
    app_obj = Application.query.filter_by(application_id=application_id).first()
    if not app_obj:
        return jsonify({'error': 'Application not found'}), 404
    user_id = app_obj.user_id
    doc_fields = [
        ('passport_photo', 'passport_photo'),
        ('aadhar_front', 'aadhar_front'),
        ('aadhar_back', 'aadhar_back'),
        ('pan_card', 'pan_card'),
        ('ug_certificate', 'ug_certificate'),
        ('pg_certificate', 'pg_certificate'),
        ('resume', 'resume'),
    ]
    zip_buffer = BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for field, label in doc_fields:
            rel_path = getattr(app_obj, field, None)
            if rel_path:
                abs_path = os.path.join(os.getcwd(), rel_path)
                if os.path.exists(abs_path):
                    ext = os.path.splitext(abs_path)[1]
                    name = f"{label}{ext}"
                    zipf.write(abs_path, arcname=name)
    zip_buffer.seek(0)
    return send_file(zip_buffer, mimetype='application/zip', as_attachment=True, download_name=f"candidate_documents_{application_id}.zip")

if __name__ == '__main__':
    with app.app_context():
        db.init_app(app)
        migrate.init_app(app, db)
        db.create_all()
    app.run(debug=True, port=8000)