from flask import Flask, request, jsonify,render_template,session,redirect,url_for,flash,send_from_directory, abort
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
from models import User,Application,CallBackUsers
from extensions import db, migrate
import json
import razorpay
from dotenv import load_dotenv
from datetime import datetime
import logging

import gspread
from oauth2client.service_account import ServiceAccountCredentials
import re

def normalize_status(s):
    if not isinstance(s, str):
        return ""
    return re.sub(r"\s+", "", s).lower()


GOOGLE_CLOUD_CREDENTIALS = "google_cloud_credentials.json"
if not os.path.exists(GOOGLE_CLOUD_CREDENTIALS):
    raise FileNotFoundError(f"Google Cloud credentials file not found: {GOOGLE_CLOUD_CREDENTIALS}")
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = GOOGLE_CLOUD_CREDENTIALS

SHEET_ID = "16aU4ibSVsUv94SF2LEGcpxE2wuE5EsS7fNs8SWQbfAE"
scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]

try:
    creds = ServiceAccountCredentials.from_json_keyfile_name(GOOGLE_CLOUD_CREDENTIALS, scope)
    gspread_client = gspread.authorize(creds)
    # sheet = gspread_client.open_by_key(SHEET_ID).sheet1
    worksheet_name = "AU Finance"
    sheet = gspread_client.open_by_key(SHEET_ID).worksheet(worksheet_name)

except Exception as e:
    raise RuntimeError(f"Failed to connect to Google Sheets: {e}")

def is_candidate_selected(contact_no, email=None):
    try:
        rows = sheet.get_all_values()
        header = rows[0]

        try:
            contact_idx = header.index("Contact No.")
            status_idx = header.index("Status")
            email_idx = header.index("Email") if "Email" in header else None
        except ValueError as ve:
            print("❌ Column headers not found:", ve)
            return False

        contact_no = ''.join(filter(str.isdigit, str(contact_no)))
        email = email.strip().lower() if email else None

        for row in rows[1:]:
            if len(row) <= max(contact_idx, status_idx):
                continue

            row_contact = ''.join(filter(str.isdigit, row[contact_idx]))
            row_status = row[status_idx].strip().lower().replace(" ", "")
            row_email = row[email_idx].strip().lower() if email_idx is not None and len(row) > email_idx else None

            if row_contact == contact_no or (email and row_email == email):
                print(f"✅ Match found for contact/email with status: {row_status}")
                return row_status == "selected"

        return False
    except Exception as e:
        print("Error reading Google Sheet:", e)
        return False

load_dotenv()

# $env:FLASK_APP="main:app" 

app = Flask(__name__)
CORS(app, origins=["http://localhost:5000"], supports_credentials=True)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024 


print("Razorpay Key:", os.getenv("RAZORPAY_KEY_ID"))
print("Razorpay Secret:", os.getenv("RAZORPAY_KEY_SECRET"))

razorpay_client = razorpay.Client(auth=(os.getenv("RAZORPAY_KEY_ID"), os.getenv("RAZORPAY_KEY_SECRET")))

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
        return jsonify({"error": "Failed to send OTP", "details": str(e)}), 500

def verify_otp_api(otp_txn_id, otp):
    header=generate_hash_header()
    payload = {
    "txId": otp_txn_id,
	"token": otp
    }
    
    try:
        response = requests.post(VALIDATE_URL, json=payload, headers=header)
        print("Response from OTP API:", response.json())
        return response.json()["status"] 
    except requests.exceptions.RequestException as e:
        print("Error sending OTP:", str(e))
        return jsonify({"error": "Failed to send OTP", "details": str(e)}), 500
    
def send_lead_to_crm(application):
    url = "https://thirdpartyapi.extraaedge.com/api/SaveRequest"
    payload = json.dumps({
    "Source": "crack-ed",
    "AuthToken": "crack-ed_29-01-2025",
    "FirstName": application.first_name,
    "LastName":  application.last_name,
    "Email": application.email,
    "MobileNumber": int(application.mobile_number),
    "City":  application.city,
    "Center": "AURUM Bankers Program",
    "Course": "PG Program",
    "Field5": "Microsite - AU",
    "LeadSource": "Microsite",
    })
    headers = {
    'Content-Type': 'application/json'
    }
    response = requests.request("POST", url, headers=headers, data=payload)

    print(response.text)



@app.route('/auth/registerOtp/', methods=['POST']) 
def send_register_otp():
    print("Database path:", app.config['SQLALCHEMY_DATABASE_URI'])
    data = request.get_json()
    print("Registration data received:", data)
    otp = generate_otp()
    # Split name into first name and last name (handle single-word name)
    name_parts = data['name'].split()
    first_name = name_parts[0]  # First part is always the first name
    last_name = name_parts[-1] if len(name_parts) > 1 else ""  # Last part is the last name, if any
    try:
        existing_user = User.query.filter_by(mobile=data['mobile']).first()
        user = None
        if existing_user:
            existing_user.otp = otp
            user = existing_user
            if user.verified:
                return jsonify({"message": "Already Registerd Please Login"}), 400
            else:
                user.name = data['name']
                user.email = data['email']
                application = Application.query.filter_by(user_id=existing_user.id).first()
                if application is not None:
                    application.first_name = first_name
                    application.last_name = last_name
                    application.email = data['email']
                    application.mobile_number = data['mobile']
                else:
                    application = Application(
                        user_id=user.id,
                        first_name=first_name,
                        last_name=last_name,
                        mobile_number=data['mobile'],
                        email=data['email'],
                        status="Apply Now"
                    )
                    db.session.add(application)
        else:
            user = User(name=data['name'], email=data['email'], mobile=data['mobile'], otp=otp)
            db.session.add(user)
            db.session.commit()
            application = Application(
                user_id=user.id,
                first_name=first_name,
                last_name=last_name,
                mobile_number=data['mobile'],
                email=data['email'],
                status="Apply Now"
            )
            db.session.add(application)
        db.session.commit()

        print("First name:", user.name)
        print("Data received:", user.name)

        txn_id = send_otp_api(user.mobile)
        if isinstance(txn_id, tuple):
            txn_id = txn_id[0]  # or extract the string part
        user.otp_txn_id = str(txn_id)
        db.session.commit()

        # Return the response
        return jsonify({"message": "OTP sent",}), 200
    except Exception as e:
        print("Error in /auth/registerOtp/:", e)
        import traceback; traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route('/auth/register/', methods=['POST'])
def register_user():
    data = request.get_json()
    user=None
    print("Data received:", data)
   
    user = User.query.filter_by(mobile=data['mobile']).first()
        
    if not user:
        return jsonify({"message": "User with mobile number not found"}), 400
    else:
        status=verify_otp_api(user.otp_txn_id, data['otp'])
        if status == "SUCCESS":
            user.verified = True
        else:
            return jsonify({"message": "Invalid OTP"}), 400
    
    user.token = generate_token()
    db.session.commit()
    return jsonify({"token": user.token, "username": user.name}), 200

@app.route('/auth/callback/', methods=['POST'])
def add_callback_user():
    data = request.get_json()
    print("Data received:", data)   
    existing_user = CallBackUsers.query.filter_by(mobile=data['mobile']).first()

    existing_user = CallBackUsers.query.filter_by(mobile=data['mobile'],).first()
    if existing_user:
        return jsonify({"message": "Detailes already added ",}), 200
    else:
        new_user = CallBackUsers(fname=data['fname'],lname=data['lname'], email=data['email'], mobile=data['mobile'])
        db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "Detailes added successfully",}), 200

@app.route('/auth/loginOtp/', methods=['POST'])
def send_login_otp():
    data = request.get_json()
    print("Data received:", data)
    user = User.query.filter_by(mobile=data['mobile']).first()
    if not user or not user.verified:
        return jsonify({"message": "Mobile not registered"}), 400
    user.otp = generate_otp()
    user.otp_txn_id = send_otp_api(user.mobile)
    
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
        # Step 1 - Personal Info
        "first_name": {"label": "First Name", "input_type": "text", "required": True, "max_length": 50},
        "middle_name": {"label": "Middle Name", "input_type": "text", "required": False, "max_length": 50},
        "last_name": {"label": "Last Name", "input_type": "text", "required": True, "max_length": 50},
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
        "pan_card_number": {
            "label": "PAN Card Number",
            "input_type": "text",
            "required": True,
            "pattern": r"^[A-Z]{5}[0-9]{4}[A-Z]$",
            "error_message": "PAN must follow the format: 5 uppercase letters, 4 digits, 1 uppercase letter."
        },
        "gender": {
            "label": "Gender",
            "input_type": "select",  # change from text to select for dropdown
            "required": True,
            "options": ["Male", "Female", "Other"]
        },
        "family_income": {"label": "Family Annual Income", "input_type": "number", "required": False, "min_value": 0},

        # Address
        "address": {"label": "Address", "input_type": "text", "required": True},
        "state": {"label": "State", "input_type": "text", "required": True},
        "district": {"label": "District", "input_type": "text", "required": True},
        "city": {"label": "City", "input_type": "text", "required": True},
        "pincode": {
            "label": "Pincode",
            "input_type": "number",
            "required": True,
            "pattern": r"^\d{6}$",
            "error_message": "Pincode must be exactly 6 digits."
        },

        # UG
        "ug_university_name": {"label": "UG University Name", "input_type": "text", "required": True},
        "ug_degree": {"label": "Degree", "input_type": "text", "required": True},
        "ug_year_graduated": {
            "label": "Year Graduated",
            "input_type": "year",
            "required": True,
            "min_value": 1900,
            "max_value": 2100
        },

        # PG
        "pg_university_name": {"label": "PG University Name", "input_type": "text", "required": False},
        "pg_degree": {"label": "Degree", "input_type": "text", "required": False},
        "pg_year_graduated": {
            "label": "Year Graduated",
            "input_type": "year",
            "required": False,
            "min_value": 1900,
            "max_value": 2100
        },

        # Experience
        "current_job_title": {"label": "Current Job Title", "input_type": "text", "required": False},
        "company_name": {"label": "Company Name", "input_type": "text", "required": False},
        "job_type": {
            "label": "Job Type",
            "input_type": "select",
            "required": False,
            "options": ["Full-time", "Part-time", "Internship", "Freelance"]
        },
        "location": {"label": "Location", "input_type": "text", "required": False},
        "exp_current_company": {"label": "Experience at Current Company", "input_type": "text", "required": False},
        "total_experience": {"label": "Total Experience", "input_type": "text", "required": False},

        # Documents
        "passport_photo": {"label": "Passport Sized Photo", "input_type": "file", "required": True, "max_size_mb": 2},
        "aadhar_front": {
            "label": "Aadhar Card (Front)",
            "input_type": "file",
            "required": True,
            "max_size_mb": 2
        },
        "aadhar_back": {
            "label": "Aadhar Card (Back)",
            "input_type": "file",
            "required": True,
            "max_size_mb": 2
        },
        "pan_card": {
            "label": "PAN Card",
            "input_type": "file",
            "required": True,
            "max_size_mb": 2
        },
        "ug_certificate": {
            "label": "UG Degree Certificate",
            "input_type": "file",
            "required": True,
            "max_size_mb": 2
        },
        "pg_certificate": {
            "label": "PG Degree Certificate",
            "input_type": "file",
            "required": False,
            "max_size_mb": 2
        },
        "resume": {
            "label": "Resume",
            "input_type": "file",
            "required": True,
            "max_size_mb": 5
        }
    }


    def field(key):
        meta = FIELD_META[key]
        field_data = {
            "field_name": key,
            "label": meta["label"],
            "value": getattr(application, key, ""),
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


    return {
        "application_id": application.application_id,
        "current_application_step": application.current_application_step,
        "status": application.status,
        "name":application.first_name + " " + application.last_name,
        "program": "AURUM Banker Program",
        "razorpay_payment_status": application.razorpay_payment_status,
        "razorpay_payment_amount": application.razorpay_payment_amount,
        # Individual payment tracking
        "registration_fee_paid": application.registration_fee_paid,
        "registration_fee_amount": application.registration_fee_amount,
        "registration_fee_payment_timestamp": application.registration_fee_payment_timestamp.isoformat() if application.registration_fee_payment_timestamp else None,
        "first_installment_paid": application.first_installment_paid,
        "first_installment_amount": application.first_installment_amount,
        "first_installment_payment_timestamp": application.first_installment_payment_timestamp.isoformat() if application.first_installment_payment_timestamp else None,
        "second_installment_paid": application.second_installment_paid,
        "second_installment_amount": application.second_installment_amount,
        "second_installment_payment_timestamp": application.second_installment_payment_timestamp.isoformat() if application.second_installment_payment_timestamp else None,
        "steps": [
            {
                "step": 0,
                "title": "Personal Details",
                "sections": [
                    {
                        "section": "Personal Info",
                        "fields": [field(k) for k in [
                            "first_name", "middle_name", "last_name", "mobile_number",
                            "email", "date_of_birth", "pan_card_number", "gender", "family_income"
                        ]]
                    },
                    {
                        "section": "Address",
                        "fields": [field(k) for k in [
                            "address", "state", "district", "city", "pincode"
                        ]]
                    }
                ]
            },
            {
                "step": 1,
                "title": "Education & Experience",
                "sections": [
                    {
                        "section": "Undergraduate",
                        "fields": [field(k) for k in [
                            "ug_university_name", "ug_degree", "ug_year_graduated"
                        ]]
                    },
                    {
                        "section": "Postgraduate",
                        "fields": [field(k) for k in [
                            "pg_university_name", "pg_degree", "pg_year_graduated"
                        ]]
                    },
                    {
                        "section": "Job Experience",
                        "fields": [field(k) for k in [
                            "current_job_title", "company_name", "job_type",
                            "location", "exp_current_company", "total_experience"
                        ]]
                    }
                ]
            },
            {
                "step": 2,
                "title": "Preview",
                "sections": []
            },
      
        ]
    }

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

    # Only check Google Sheet for 'Selected' status when application status is 'Completed'
    if application.status == "Completed":
        try:
            if is_candidate_selected(application.mobile_number, application.email):
                if application.status != "Selected":
                    print(f"🌟 Updating status from {application.status} → Selected for {application.mobile_number}")
                    application.status = "Selected"
                    db.session.commit()
        except Exception as e:
            print("Error reading status from Google Sheet:", e)

    return jsonify(get_application_dict(application)), 200




# File fields you want to support
FILE_FIELDS = [
    "passport_photo", "aadhar_front", "aadhar_back", "pan_card",
    "ug_certificate", "pg_certificate", "resume"
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
            "first_name", "middle_name", "last_name", "mobile_number", "email", "date_of_birth", "pan_card_number",
            "gender", "family_income", "address", "state", "district", "city", "pincode",
            "ug_university_name", "ug_degree", "ug_year_graduated",
            "pg_university_name", "pg_degree", "pg_year_graduated",
            "current_job_title", "company_name", "job_type", "location", "exp_current_company", "total_experience",
            "current_application_step", "status"
        ]

        form_data = request.form  # for text fields
        file_data = request.files  # for file uploads
        print("Form data:", form_data)  
        print("Form data:", file_data)  
        # 🧠 1. Handle text fields
        for key in form_data:
            if key in allowed_fields:
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
            elif form_data.get('status') == "In Progress":
                application.status = "In Progress"
                print(f"📝 Application status set to In Progress for {application.application_id}")
        except Exception as e:
            print("Error setting application status:", e)

        db.session.commit()
        if application.status == "Completed":
            print("Status is completed. Sending data to CRM...")
            send_lead_to_crm(application)
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
    

# Create Razorpay order
@app.route('/api/create_order', methods=['POST'])
def create_order():
    data = request.json
    application_id = data.get('application_id')
    amount = data.get('amount')

    application = Application.query.filter_by(application_id=application_id).first()
    if not application:
        return jsonify({'error': 'Application not found'}), 404

    order_data = {
        'amount': int(float(amount) * 100),
        'currency': 'INR',
        'receipt': application_id,
        'payment_capture': 1,
        'notes': {
            'application_id': application_id,
            'user_email': application.email
        }
    }
    order = razorpay_client.order.create(data=order_data)
    application.razorpay_order_id = order['id']
    db.session.commit()

    return jsonify({
        'order_id': order['id'],
        'razorpay_key': os.getenv("RAZORPAY_KEY_ID"),
        'amount': amount,
        'name': f"{application.first_name} {application.last_name}",
        'email': application.email,
        'phone': application.mobile_number,
        'application_id': application_id
    })

# Payment success endpoint
@app.route('/api/payment_success', methods=['POST'])
def payment_success():
    data = request.json
    order_id = data.get('order_id')
    payment_id = data.get('payment_id')
    signature = data.get('signature')
    installment = data.get('installment')  # 'registration', 'first', or 'second'

    application = Application.query.filter_by(razorpay_order_id=order_id).first()
    if not application:
        return jsonify({'error': 'Application not found'}), 404

    try:
        params_dict = {
            'razorpay_order_id': order_id,
            'razorpay_payment_id': payment_id,
            'razorpay_signature': signature
        }
        razorpay_client.utility.verify_payment_signature(params_dict)
    except razorpay.errors.SignatureVerificationError:
        return jsonify({'error': 'Signature verification failed'}), 400

    payment = razorpay_client.payment.fetch(payment_id)
    payment_amount = payment['amount'] / 100
    payment_timestamp = datetime.fromtimestamp(payment['created_at'])
    
    # Update general payment fields
    application.razorpay_payment_id = payment_id
    application.razorpay_payment_status = payment['status']
    application.razorpay_payment_amount = payment_amount
    application.razorpay_payment_method = payment['method']
    application.razorpay_payment_timestamp = payment_timestamp
    
    # Update specific installment payment fields
    if installment == 'registration':
        application.registration_fee_paid = True
        application.registration_fee_payment_id = payment_id
        application.registration_fee_payment_timestamp = payment_timestamp
    elif installment == 'first':
        application.first_installment_paid = True
        application.first_installment_payment_id = payment_id
        application.first_installment_payment_timestamp = payment_timestamp
    elif installment == 'second':
        application.second_installment_paid = True
        application.second_installment_payment_id = payment_id
        application.second_installment_payment_timestamp = payment_timestamp
    
    db.session.commit()

    return jsonify({'status': 'success'})

# Check payment status endpoint
@app.route('/api/check_payment_status', methods=['GET'])
def check_payment_status():
    application_id = request.args.get('application_id')
    application = Application.query.filter_by(application_id=application_id).first()
    if not application:
        return jsonify({'error': 'Application not found'}), 404

    status = application.razorpay_payment_status or 'pending'
    return jsonify({'status': status})

# Razorpay webhook endpoint
@app.route('/api/razorpay_webhook', methods=['POST'])
def razorpay_webhook():
    webhook_secret = os.getenv('WEBHOOK_SECRET')
    received_signature = request.headers.get('X-Razorpay-Signature')
    payload = request.get_data(as_text=True)

    try:
        razorpay_client.utility.verify_webhook_signature(payload, received_signature, webhook_secret)
    except razorpay.errors.SignatureVerificationError:
        return jsonify({'error': 'Invalid signature'}), 400

    event = request.json.get('event')
    if event == 'payment.captured':
        payment_data = request.json['payload']['payment']['entity']
        order_id = payment_data['order_id']
        application = Application.query.filter_by(razorpay_order_id=order_id).first()
        if application:
            application.razorpay_payment_id = payment_data['id']
            application.razorpay_payment_status = payment_data['status']
            application.razorpay_payment_amount = payment_data['amount'] / 100
            application.razorpay_payment_method = payment_data['method']
            application.razorpay_payment_timestamp = datetime.fromtimestamp(payment_data['created_at'])
            db.session.commit()
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    with app.app_context():
        db.init_app(app)
        migrate.init_app(app, db)
        db.create_all()
    app.run(debug=True, port=8000)
