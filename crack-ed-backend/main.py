import os
import json
import time
import random
import string
import hashlib
import logging
import traceback

import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from sqlalchemy.exc import IntegrityError, OperationalError

from extensions import db
from models import CallBackUsers

load_dotenv()

# ---------------------------------------------------------------------------
# App configuration
# ---------------------------------------------------------------------------
app = Flask(__name__)
app.secret_key = 'b7e1c2e4c9a84e2e8f7d4a1b6c3e5f9a2d7c6b8e4f1a2c3d5e6f7b9a1c2d3e4f'

CORS(
    app,
    origins=["http://localhost:5000"],
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "OPTIONS"],
)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

logging.basicConfig(level=logging.DEBUG)

# ---------------------------------------------------------------------------
# OTP provider (Xecurify / Orange) configuration
# ---------------------------------------------------------------------------
CUSTOMER_KEY = "362405"
ORANGE_API_KEY = "RHFLK7kkQN4fGtNwnXOhvpXreO2hJxx1"
SEND_URL = "https://login.xecurify.com/moas/api/auth/challenge"
VALIDATE_URL = "https://login.xecurify.com/moas/api/auth/validate"


def generate_hash_header():
    timestamp = str(int(time.time() * 1000))
    string_to_hash = CUSTOMER_KEY + timestamp + ORANGE_API_KEY
    hash_value = hashlib.sha512(string_to_hash.encode('utf-8')).hexdigest().lower()
    return {
        "Customer-Key": CUSTOMER_KEY,
        "Timestamp": timestamp,
        "Authorization": hash_value,
        "Content-Type": "application/json",
    }


def generate_otp():
    return ''.join(random.choices(string.digits, k=4))


def send_otp_api(mobile):
    header = generate_hash_header()
    payload = {
        "customerKey": CUSTOMER_KEY,
        "phone": "91" + mobile,
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
    header = generate_hash_header()
    payload = {"txId": otp_txn_id, "token": otp}
    try:
        response = requests.post(VALIDATE_URL, json=payload, headers=header)
        print("Response from OTP API:", response.json())
        return response.json()["status"]
    except requests.exceptions.RequestException as e:
        print("Error verifying OTP:", str(e))
        return None


# ---------------------------------------------------------------------------
# CRM integration (Meritto / NoPaperForms)
# ---------------------------------------------------------------------------

NOPAPERFORMS_LEAD_URL = os.getenv(
    "NOPAPERFORMS_LEAD_URL",
    "https://api.nopaperforms.io/lead/v1/createOrUpdate",
)


def _nopaperforms_lead_headers():
    headers = {"Content-Type": "application/json", "Accept": "application/json"}
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
    if mobile is None:
        return ""
    s = str(mobile).strip().replace(" ", "")
    digits = "".join(c for c in s if c.isdigit())
    return digits[-10:] if len(digits) >= 10 else digits


def _str_utm(value):
    return "" if value is None else str(value).strip()


def _post_lead_to_nopaperforms(
    *,
    full_name,
    email,
    mobile,
    state="",
    city="",
    utm_source="",
    utm_medium="",
    utm_campaign="",
):
    state_value = (state or "").strip() or (city or "").strip()
    city_value = (city or "").strip()
    payload = {
        "name": (full_name or "").strip(),
        "email": (email or "").strip(),
        "mobile": _format_mobile_for_nopaperforms(mobile),
        "state": state_value,
        "search_criteria": "mobile",
        "source": _str_utm(utm_source),
        "medium": _str_utm(utm_medium),
        "campaign": _str_utm(utm_campaign),
        "cf_form_name": "Landing Page - Mahindra - BE",
        "cf_program": "Mahindra - BE",
        "cf_pg_program": "PG Program",
    }
    if city_value and city_value.lower() != state_value.lower():
        payload["city"] = city_value
    try:
        print("Meritto CRM payload:", json.dumps(payload))
    except Exception:
        pass
    return requests.post(
        NOPAPERFORMS_LEAD_URL,
        json=payload,
        headers=_nopaperforms_lead_headers(),
        timeout=(10, 30),
    )


def send_callback_lead_to_crm(user):
    full_name = " ".join(part for part in [user.fname, user.lname] if part).strip()
    # Current DB model stores selected state in `city`; pass that to Meritto's
    # required `state` field until a dedicated state column is introduced.
    state_value = (getattr(user, "state", "") or "").strip() or (user.city or "").strip()
    response = _post_lead_to_nopaperforms(
        full_name=full_name,
        email=user.email or "",
        mobile=user.mobile,
        state=state_value,
        city="",
        utm_source=getattr(user, "utm_source", "") or "",
        utm_medium=getattr(user, "utm_medium", "") or "",
        utm_campaign=getattr(user, "utm_campaign", "") or "",
    )
    print("Meritto CRM response:", response.text)
    return response


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.route("/")
def helloworld():
    return "Hello Crack-ED!"


@app.route('/api/auth/callbackOtp/', methods=['POST', 'OPTIONS'])
@app.route('/auth/callbackOtp/', methods=['POST', 'OPTIONS'])
def send_callback_otp():
    if request.method == 'OPTIONS':
        response = jsonify({})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response

    data = request.get_json() or {}
    print("Callback OTP request:", data)

    mobile = data.get("mobile")
    if not mobile:
        return jsonify({"error": "Mobile number is required"}), 400

    otp = generate_otp()
    name_parts = (data.get('name') or "").split()
    first_name = name_parts[0] if name_parts else ""
    last_name = name_parts[-1] if len(name_parts) > 1 else ""
    state_or_city = (data.get("state") or data.get("city") or "").strip()

    try:
        utm_source = data.get("utm_source", "") or ""
        utm_medium = data.get("utm_medium", "") or ""
        utm_campaign = data.get("utm_campaign", "") or ""

        incoming_email = (data.get("email") or "").strip()
        existing_user = CallBackUsers.query.filter_by(mobile=mobile).first()
        if not existing_user and incoming_email:
            existing_user = CallBackUsers.query.filter_by(email=incoming_email).first()

        if existing_user:
            user = existing_user
            if user.verified:
                return jsonify({
                    "message": "Thanks! Your callback request is already in our system. We'll connect with you soon!"
                }), 200
            user.otp = otp
            user.fname = first_name
            user.lname = last_name
            user.email = incoming_email
            user.mobile = mobile
            user.city = state_or_city
            try:
                if utm_source:
                    user.utm_source = utm_source
                if utm_medium:
                    user.utm_medium = utm_medium
                if utm_campaign:
                    user.utm_campaign = utm_campaign
            except AttributeError:
                print("Warning: UTM columns not found. Run a migration to add them.")
        else:
            user = CallBackUsers(
                fname=first_name,
                lname=last_name,
                email=incoming_email,
                city=state_or_city,
                mobile=mobile,
                otp=otp,
            )
            try:
                if utm_source:
                    user.utm_source = utm_source
                if utm_medium:
                    user.utm_medium = utm_medium
                if utm_campaign:
                    user.utm_campaign = utm_campaign
            except AttributeError:
                print("Warning: UTM columns not found on model. Run a migration.")
            db.session.add(user)

        user.otp_txn_id = send_otp_api(user.mobile)
        if user.otp_txn_id is None:
            db.session.rollback()
            return jsonify({"error": "Failed to send OTP"}), 500

        try:
            db.session.commit()
        except (OperationalError, IntegrityError) as db_error:
            error_msg = str(db_error).lower()
            if "no such column" in error_msg and (
                "utm_source" in error_msg
                or "utm_medium" in error_msg
                or "utm_campaign" in error_msg
            ):
                print("UTM columns missing from DB; retrying without them.")
                db.session.rollback()
                if existing_user:
                    user = existing_user
                    user.otp = otp
                    user.fname = first_name
                    user.lname = last_name
                    user.email = incoming_email
                    user.mobile = mobile
                    user.city = state_or_city
                else:
                    user = CallBackUsers(
                        fname=first_name,
                        lname=last_name,
                        email=incoming_email,
                        city=state_or_city,
                        mobile=mobile,
                        otp=otp,
                    )
                    db.session.add(user)
                user.otp_txn_id = send_otp_api(user.mobile)
                if user.otp_txn_id is None:
                    db.session.rollback()
                    return jsonify({"error": "Failed to send OTP"}), 500
                db.session.commit()
            elif "unique constraint failed" in error_msg and "callback_users.email" in error_msg:
                # Email already exists on another row: reuse that row instead of inserting.
                otp_txn_id = user.otp_txn_id
                db.session.rollback()
                email_user = CallBackUsers.query.filter_by(email=incoming_email).first()
                if not email_user:
                    raise
                if email_user.verified:
                    return jsonify({
                        "message": "Thanks! Your callback request is already in our system. We'll connect with you soon!"
                    }), 200
                email_user.otp = otp
                email_user.fname = first_name
                email_user.lname = last_name
                email_user.city = state_or_city
                email_user.mobile = mobile
                email_user.otp_txn_id = otp_txn_id
                if not email_user.otp_txn_id:
                    email_user.otp_txn_id = send_otp_api(mobile)
                    if email_user.otp_txn_id is None:
                        db.session.rollback()
                        return jsonify({"error": "Failed to send OTP"}), 500
                try:
                    if utm_source:
                        email_user.utm_source = utm_source
                    if utm_medium:
                        email_user.utm_medium = utm_medium
                    if utm_campaign:
                        email_user.utm_campaign = utm_campaign
                except AttributeError:
                    print("Warning: UTM columns not found. Run a migration to add them.")
                db.session.commit()
            else:
                raise

        return jsonify({"message": "OTP sent"}), 200

    except Exception as e:
        print("Callback OTP error:", str(e))
        traceback.print_exc()
        db.session.rollback()
        return jsonify({"error": "Internal Server Error"}), 500


@app.route('/auth/callback/', methods=['POST'])
def add_callback_user():
    data = request.get_json() or {}
    print("Callback verify request:", data)

    mobile = data.get('mobile')
    otp = data.get('otp')
    if not mobile or not otp:
        return jsonify({"message": "Mobile number and OTP are required"}), 400

    user = CallBackUsers.query.filter_by(mobile=mobile).first()
    if not user:
        return jsonify({"message": "mobile number not found"}), 400

    status = verify_otp_api(user.otp_txn_id, otp)
    if status != "SUCCESS":
        return jsonify({"message": "Invalid OTP"}), 400

    try:
        send_callback_lead_to_crm(user)
    except Exception as e:
        print("callback CRM send failed:", e)

    user.verified = True
    db.session.commit()
    return jsonify({"message": "We will contact you soon"}), 200


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=8000)
