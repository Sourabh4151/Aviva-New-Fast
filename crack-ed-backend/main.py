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
from models import User,Application,CallBackUsers,AdminUser,PaymentHistory,LoanApplication,LoanProviderSelection, LoanProvider
from extensions import db, migrate
import json
import razorpay
from dotenv import load_dotenv
from datetime import datetime
import logging
import bcrypt
from functools import wraps
import jwt

import re
from io import BytesIO
import pandas as pd
import zipfile
from sqlalchemy import or_  # Add this import if not present

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

# $env:FLASK_APP="main:app" 

app = Flask(__name__)
app.secret_key = 'b7e1c2e4c9a84e2e8f7d4a1b6c3e5f9a2d7c6b8e4f1a2c3d5e6f7b9a1c2d3e4f'
# CORS(app, supports_credentials=True)
CORS(app, origins=[
    "http://localhost:3000",
    "http://localhost:5000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5000",
], supports_credentials=True)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024 


# print("Razorpay Key:", os.getenv("RAZORPAY_KEY_ID"))
# print("Razorpay Secret:", os.getenv("RAZORPAY_KEY_SECRET"))

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

def send_callback_lead_to_crm(user):
    url = "https://publisher.extraaedge.com/api/Webhook/addPublisherLead"
    payload = json.dumps({
    "Source": "crack-ed",
    "AuthToken": "crack-ed_29-01-2025",
    "FirstName": user.fname,
    "LastName":  user.lname,
    "Email": user.email,
    "MobileNumber": int(user.mobile),
    "City":  user.city,
    "Center": "77",
    "Course": "1",

    "Field5": "Microsite - Finova - VM",
    "leadCampaign":"Default",
    "LeadSource": "123",
    })
    headers = {
    'Content-Type': 'application/json'
    }
    response = requests.request("POST", url, headers=headers, data=payload)

    print(response.text)


def send_registration_lead_to_crm(user):
    url = "https://publisher.extraaedge.com/api/Webhook/addPublisherLead"

    # Split name into first and last name
    name_parts = user.name.split()
    first_name = name_parts[0] if name_parts else ""
    last_name = name_parts[-1] if len(name_parts) > 1 else ""

    payload = json.dumps({
        "Source": "crack-ed",
        "AuthToken": "crack-ed_29-01-2025",
        "FirstName": first_name,
        "LastName": last_name,
        "Email": user.email,
        "MobileNumber": int(user.mobile),
        "Center": "77",
        "Course": "1",
        "leadCampaign": "Default",
        "LeadSource": "123"
    })

    headers = {
        'Content-Type': 'application/json'
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    print(response.text)

def safe_str(value):
    """Convert any value to string safely"""
    if value is None:
        return ""
    return str(value)

def generate_payment_receipt_pdf(payment_data, application_data):
    """Generate a payment receipt PDF for the payment options page"""
    try:
        # Create a BytesIO buffer to store the PDF
        buffer = BytesIO()
        c = canvas.Canvas(buffer, pagesize=letter)
        
        # Set up colors (matching the user's existing style)
        primary_color = HexColor("#3498db")  # Blue
        secondary_color = HexColor("#2ecc71")  # Green
        accent_color = HexColor("#e74c3c")  # Red
        dark_color = HexColor("#2c3e50")  # Dark blue
        light_color = HexColor("#ecf0f1")  # Light gray
        
        # Header with styling
        c.setFillColor(primary_color)
        c.rect(0, 750, 612, 60, fill=1, stroke=0)
        c.setFillColor(white)
        c.setFont("Helvetica-Bold", 20)
        c.drawCentredString(306, 760, "PAYMENT RECEIPT")
        
        # Institute info
        c.setFillColor(dark_color)
        c.setFont("Helvetica", 10)
        c.drawCentredString(306, 735, "Crack-ED | 7th floor, Imperia Mindspace | Sector 62, Golf Course Road, Gurgaon | 122001")
        c.drawCentredString(306, 720, "Contact: +91-7303913644 | Email: crack-ed@girnarsoft.com")
        
        # Draw a decorative line
        c.setStrokeColor(primary_color)
        c.setLineWidth(2)
        c.line(50, 710, 562, 710)
        
        # Main content area
        c.setFillColor(black)
        c.setFont("Helvetica-Bold", 14)
        c.drawString(50, 680, "Payment Summary:")
        
        # Create a table-like structure for payment details
        y_position = 660
        row_height = 20
        col1_x = 50
        col2_x = 300
        
        def draw_table_row(label, value, y, is_bold=False):
            c.setFont("Helvetica-Bold" if is_bold else "Helvetica", 10)
            c.drawString(col1_x, y, label)
            c.drawString(col2_x, y, safe_str(value))
        
        # Get application_id and fetch data directly from database
        application_id = application_data.get('application_id')
        if not application_id:
            print("Error: No application_id found in application_data")
            return None
            
        # Get application directly from database using application_id
        application = Application.query.filter_by(application_id=application_id).first()
        if not application:
            print(f"Error: Application not found for application_id: {application_id}")
            return None
        
        # Get payment history from database using application_id
        payment_history = PaymentHistory.query.filter_by(
            application_id=application_id
        ).order_by(PaymentHistory.created_at.desc()).all()
        
        # Calculate totals
        total_fee = application.program_total_fee or 236000  # Get from database, default if None
        remaining_amount = total_fee - sum(payment.razorpay_payment_amount or 0 for payment in payment_history if payment.razorpay_payment_status == 'captured')
        
        # Calculate payment method breakdowns
        # Razorpay
        razorpay_total = sum(payment.razorpay_payment_amount or 0 for payment in payment_history if payment.razorpay_payment_status == 'captured')
        # Cash/Cheque/UPI
        cheque_cash = application.cheque_cash_payemnt_amount or 0
        # All disbursed loan amounts
        provider_disbursed = sum(p.disbursed_amount or 0 for p in LoanProviderSelection.query.filter_by(application_id=application_id).all() if p.disbursed_amount)
        # Total paid
        total_paid = razorpay_total + cheque_cash + provider_disbursed
        
        # Payment Summary
        draw_table_row("Total Course Fee:", f"₹{total_fee:,}", y_position, True)
        y_position -= row_height
        draw_table_row("Total Amount Paid:", f"₹{total_paid:,}", y_position, True)
        y_position -= row_height
        draw_table_row("Remaining Amount:", f"₹{total_fee - total_paid:,}", y_position, True)
        y_position -= row_height * 2
        # Show payment method breakdown (only those used)
        if razorpay_total > 0:
            draw_table_row("Paid via Razorpay:", f"₹{razorpay_total:,}", y_position)
            y_position -= row_height
        if provider_disbursed > 0:
            draw_table_row("Disbursed Loan Amount:", f"₹{provider_disbursed:,}", y_position)
            y_position -= row_height
        if cheque_cash > 0:
            draw_table_row("Paid via Cash/UPI/Cheque:", f"₹{cheque_cash:,}", y_position)
            y_position -= row_height
        y_position -= row_height
        
        # Payment History Section - Show only Payment ID, Amount, and Date
        if payment_history:
            c.setFont("Helvetica-Bold", 14)
            c.drawString(50, y_position, "Payment Transaction History:")
            y_position -= row_height
            
            # Payment history table header
            c.setFillColor(secondary_color)
            c.rect(col1_x, y_position-5, 150, row_height, fill=1, stroke=0)
            c.rect(col1_x+160, y_position-5, 100, row_height, fill=1, stroke=0)
            c.rect(col1_x+270, y_position-5, 120, row_height, fill=1, stroke=0)
            c.setFillColor(white)
            c.setFont("Helvetica-Bold", 10)
            c.drawString(col1_x+5, y_position, "Payment ID")
            c.drawString(col1_x+165, y_position, "Amount")
            c.drawString(col1_x+275, y_position, "Date")
            c.setFillColor(black)
            
            y_position -= row_height
            
            for i, payment in enumerate(payment_history):
                if i >= 15:  # Limit to 15 payments to avoid page overflow
                    break
                    
                # Payment ID
                payment_id = payment.razorpay_payment_id or "N/A"
                c.setFont("Helvetica", 9)
                c.drawString(col1_x+5, y_position, payment_id)
                
                # Amount
                amount = f"₹{payment.razorpay_payment_amount:,}" if payment.razorpay_payment_amount else "₹0"
                c.drawString(col1_x+165, y_position, amount)
                
                # Date
                payment_date = payment.razorpay_payment_timestamp.strftime('%Y-%m-%d') if payment.razorpay_payment_timestamp else "N/A"
                c.drawString(col1_x+275, y_position, payment_date)
                y_position -= row_height
                
            if len(payment_history) > 15:
                y_position -= row_height
                c.setFont("Helvetica-Italic", 9)
                c.drawString(col1_x, y_position, f"... and {len(payment_history) - 15} more transactions")
                y_position -= row_height * 2
        
        # Candidate Details - Get values directly from database using application object
        c.setFont("Helvetica-Bold", 14)
        c.drawString(50, y_position, "Candidate Details:")
        y_position -= row_height
        
        # Registration Number - Get from database
        reg_number = application.application_id or "N/A"
        draw_table_row("Registration Number:", reg_number, y_position, True)
        y_position -= row_height
        
        # Full Name - Get from database fields
        first_name = application.first_name or ""
        middle_name = application.middle_name or ""
        last_name = application.last_name or ""
        full_name = f"{first_name} {middle_name} {last_name}".strip()
        if not full_name:
            full_name = "N/A"
        draw_table_row("Full Name:", full_name, y_position)
        y_position -= row_height
        
        # Email Address - Get from database
        email = application.email or "N/A"
        draw_table_row("Email Address:", email, y_position)
        y_position -= row_height
        
        # Phone Number - Get from database
        mobile = application.mobile_number or "N/A"
        draw_table_row("Phone Number:", mobile, y_position)
        y_position -= row_height
        
        # Program Name
        program_name = "Udaan Virtual Relationship  Manager Program"
        draw_table_row("Program Name:", program_name, y_position)
        y_position -= row_height * 2
        
        # Address Details - Get from database fields
        c.setFont("Helvetica-Bold", 14)
        c.drawString(50, y_position, "Address:")
        y_position -= row_height
        
        # Get address fields from database
        address = application.address or ""
        city = application.city or ""
        state = application.state or ""
        pincode = application.pincode or ""
        
        # Line 1: Full address
        if address:
            draw_table_row("Address Line 1:", address, y_position)
        y_position -= row_height
        
        # Line 2: City, State, Pincode
        address_line2_parts = []
        if city:
            address_line2_parts.append(city)
        if state:
            address_line2_parts.append(state)
        if pincode:
            address_line2_parts.append(pincode)
        
        if address_line2_parts:
            address_line2 = ", ".join(address_line2_parts)
            draw_table_row("Address Line 2:", address_line2, y_position)
            y_position -= row_height
        elif not address:
            # If no address at all, show "Not provided"
            draw_table_row("Address:", "Not provided", y_position)
            y_position -= row_height
        
        y_position -= row_height * 2
        
        # Footer
        footer_y = 50
        c.setStrokeColor(primary_color)
        c.setLineWidth(1)
        c.line(50, footer_y + 20, 562, footer_y + 20)
        
        c.setFont("Helvetica-Oblique", 8)
        c.setFillColor(dark_color)
        c.drawCentredString(306, footer_y, "This is a computer generated payment receipt and does not require a signature.")
        c.drawCentredString(306, footer_y - 10, "For any queries, please contact: crack-ed@girnarsoft.com")
        
        # Page border
        c.setStrokeColor(light_color)
        c.setLineWidth(10)
        c.rect(5, 5, 602, 782, stroke=1, fill=0)
        
        c.save()
        
        # Move the buffer position to the start
        buffer.seek(0)
        
        return buffer
        
    except Exception as e:
        print(f"Error generating payment receipt PDF: {str(e)}")
        return None

@app.route('/auth/callbackOtp/', methods=['POST']) 
def send_callback_otp():
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

    try:
        existing_user = CallBackUsers.query.filter_by(mobile=mobile).first()
        user = None

        if existing_user:
            existing_user.otp = otp
            user = existing_user
            if user.verified:
                return jsonify({"message": "Thanks! Your callback request is already in our system. We'll connect with you soon!"}), 400
            else:
                user.fname = first_name
                user.lname = last_name
                user.email = data['email']
                user.city = data['city']   
        else:
            print("Creating new callback user with mobile:", mobile)
            user = CallBackUsers(fname=first_name,lname=last_name, email=data['email'],city=data['city'], mobile=mobile, otp=otp)
        db.session.add(user)
        user.otp_txn_id = send_otp_api(user.mobile)
        db.session.commit()

        return jsonify({"message": "OTP sent"}), 200

    except Exception as e:
        print("OTP registration error:", str(e))
        return jsonify({"error": "Internal Server Error"}), 500


@app.route('/auth/registerOtp/', methods=['POST']) 
def send_register_otp():
    print("Database path:", app.config['SQLALCHEMY_DATABASE_URI'])
    data = request.get_json()
    print("Registration data received:", data)

    mobile = data.get("mobile")
    if not mobile:
        return jsonify({"error": "Mobile number is required"}), 400

    otp = generate_otp()
    name_parts = data['name'].split()
    first_name = name_parts[0] 
    last_name = name_parts[-1] if len(name_parts) > 1 else ""

    try:
        existing_user = User.query.filter_by(mobile=mobile).first()
        user = None

        if existing_user:
            existing_user.otp = otp
            user = existing_user
            if user.verified:
                return jsonify({"message": "Already Registered. Please login."}), 400
            else:
                user.name = data['name']
                user.email = data['email']
                application = Application.query.filter_by(user_id=existing_user.id).first()
                if application:
                    application.first_name = first_name
                    application.last_name = last_name
                    application.email = data['email']
        else:
            user = User(name=data['name'], email=data['email'], mobile=mobile, otp=otp)
            db.session.add(user)
            db.session.flush()  # ensure user.id is available for application

            # Create new application record
            application = Application(
                user_id=user.id,
                first_name=first_name,
                last_name=last_name,
                mobile_number=mobile,
                email=data['email'],
                status="Apply Now"
            )
            db.session.add(application)

        user.otp_txn_id = send_otp_api(user.mobile)
        db.session.commit()

        return jsonify({"message": "OTP sent"}), 200

    except Exception as e:
        print("OTP registration error:", str(e))
        return jsonify({"error": "Internal Server Error"}), 500


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
            try:
                send_registration_lead_to_crm(user)
            except Exception:
                print("Registration lead send to CRM failed")
        else:
            return jsonify({"message": "Invalid OTP"}), 400

    user.token = generate_token()
    db.session.commit()
    return jsonify({"token": user.token, "username": user.name}), 200

@app.route('/auth/callback/', methods=['POST'])
def add_callback_user():
    data = request.get_json()
    user=None
    print("Data received:", data)
   
    user = CallBackUsers.query.filter_by(mobile=data['mobile']).first()
        
    if not user:
        return jsonify({"message": "mobile number not found"}), 400
    else:
        status=verify_otp_api(user.otp_txn_id, data['otp'])
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
        "passport_photo": {"label": "Passport Sized Photo", "input_type": "file", "required": False, "max_size_mb": 2},
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
            "required": False,
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
            "required": False,
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


    # Add pay_fee_enabled logic
    pay_fee_enabled = False
    if application.status == "Selected":
        if not application.razorpay_payment_status or application.razorpay_payment_status != 'captured':
            pay_fee_enabled = True

    # Calculate total paid amount from all sources (Razorpay, loan, cash/cheque/UPI, all disbursed loans)
    payment_history = PaymentHistory.query.filter_by(application_id=application.application_id).all()
    razorpay_total = sum(payment.razorpay_payment_amount or 0 for payment in payment_history if payment.razorpay_payment_status == 'captured')
    cheque_cash = application.cheque_cash_payemnt_amount or 0
    # Sum all disbursed_amounts from all provider selections for this application
    provider_disbursed = sum(p.disbursed_amount or 0 for p in LoanProviderSelection.query.filter_by(application_id=application.application_id).all() if p.disbursed_amount)
    total_paid = razorpay_total + cheque_cash + provider_disbursed
    # Check if payment is completed
    payment_completed = total_paid >= application.program_total_fee

    result = {
        "application_id": application.application_id,
        "current_application_step": application.current_application_step,
        "status": application.status,
        "name": application.first_name + " " + application.last_name,
        "program": "Udaan Virtual Relationship  Manager Program",
        "razorpay_payment_status": application.razorpay_payment_status,
        "razorpay_payment_amount": application.razorpay_payment_amount,
        "razorpay_payment_timestamp": application.razorpay_payment_timestamp.isoformat() if application.razorpay_payment_timestamp else None,
        "pay_fee_enabled": pay_fee_enabled,
        "program_total_fee": application.program_total_fee,
        "total_paid_amount": total_paid,
        "payment_completed": payment_completed,
        "payment_history": [
            {
                "id": payment.id,
                "razorpay_order_id": payment.razorpay_order_id,
                "razorpay_payment_id": payment.razorpay_payment_id,
                "razorpay_payment_status": payment.razorpay_payment_status,
                "razorpay_payment_amount": payment.razorpay_payment_amount,
                "razorpay_payment_method": payment.razorpay_payment_method,
                "razorpay_payment_timestamp": payment.razorpay_payment_timestamp.isoformat() if payment.razorpay_payment_timestamp else None,
                "payment_type": payment.payment_type,
                "installment_number": payment.installment_number,
                "created_at": payment.created_at.isoformat() if payment.created_at else None
            }
            for payment in payment_history
        ],
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
                "title": "Documents",
                "sections": [
                    {
                        "section": "Uploaded Documents",
                        "fields": [field(k) for k in [
                            "passport_photo", "aadhar_front", "aadhar_back", "pan_card",
                            "ug_certificate", "pg_certificate", "resume"
                        ]]
                    }
                ]
            },
            {
                "step": 3,
                "title": "Preview",
                "sections": []
            },
      
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
                "program": "Udaan Virtual Relationship  Manager Program",
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
    
    # Create new payment history record instead of overwriting
    payment_history = PaymentHistory(
        application_id=application.application_id,
        razorpay_order_id=order_id,
        razorpay_payment_id=payment_id,
        razorpay_payment_status=payment['status'],
        razorpay_payment_amount=payment_amount,
        razorpay_payment_method=payment['method'],
        razorpay_payment_timestamp=payment_timestamp,
        payment_type='custom',
        installment_number=None
    )
    db.session.add(payment_history)
    
    # Update general payment fields (latest payment info)
    application.razorpay_payment_id = payment_id
    application.razorpay_payment_status = payment['status']
    application.razorpay_payment_amount = payment_amount
    application.razorpay_payment_method = payment['method']
    application.razorpay_payment_timestamp = payment_timestamp
    
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
@app.route('/api/update_program_fee', methods=['POST'])
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

@app.route('/api/admin/login', methods=['POST'])
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

@app.route('/api/admin/logout', methods=['POST'])
@admin_login_required()
def admin_logout():
    session.pop('admin_user_id', None)
    session.pop('admin_role', None)
    return jsonify({'message': 'Logged out'})

@app.route('/api/admin/forgot-password', methods=['POST'])
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

@app.route('/api/admin/reset-password', methods=['POST'])
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

@app.route('/api/admin/users', methods=['GET'])
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

@app.route('/api/admin/users/<int:user_id>/toggle-status', methods=['POST'])
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

@app.route('/api/admin/signup', methods=['POST'])
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

@app.route('/api/admin/users', methods=['POST'])
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

@app.route('/api/admin/users/<int:user_id>', methods=['PUT'])
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

@app.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
@admin_login_required('admin')
def delete_admin_user(user_id):
    user = AdminUser.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted'})

@app.route('/api/applications', methods=['GET'])
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
        # Sum all successful Razorpay payments from PaymentHistory
        payment_history = PaymentHistory.query.filter_by(application_id=app.application_id).all()
        razorpay_total = sum(p.razorpay_payment_amount or 0 for p in payment_history if p.razorpay_payment_status == 'captured')
        cheque_cash = app.cheque_cash_payemnt_amount or 0
        # Sum all disbursed_amounts from all provider selections for this application
        provider_disbursed = sum(p.disbursed_amount or 0 for p in LoanProviderSelection.query.filter_by(application_id=app.application_id).all() if p.disbursed_amount)
        total_paid = razorpay_total + cheque_cash + provider_disbursed
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
            'razorpay_order_id': app.razorpay_order_id,
            'razorpay_payment_id': app.razorpay_payment_id,
            'razorpay_payment_status': app.razorpay_payment_status,
            'razorpay_payment_amount': app.razorpay_payment_amount,
            'razorpay_payment_method': app.razorpay_payment_method,
            'razorpay_payment_timestamp': app.razorpay_payment_timestamp,
            'program_total_fee': app.program_total_fee,
            'total_amount_paid': total_paid,
            'approved_loan_amount': provider_disbursed,
            'cheque_cash_payment_mode': app.cheque_cash_payment_mode,
            'payment_timestamp': app.payment_timestamp,
            'payment_comment': app.payment_comment,
            'cheque_cash_payemnt_amount': app.cheque_cash_payemnt_amount,
            'payment_history': [
                {
                    'id': p.id,
                    'razorpay_payment_id': p.razorpay_payment_id,
                    'razorpay_payment_status': p.razorpay_payment_status,
                    'razorpay_payment_amount': p.razorpay_payment_amount,
                    'razorpay_payment_method': p.razorpay_payment_method,
                    'razorpay_payment_timestamp': p.razorpay_payment_timestamp.isoformat() if p.razorpay_payment_timestamp else None
                }
                for p in payment_history
            ],
        }

    return jsonify({
        'applications': [app_to_dict(a) for a in applications],
        'total': total,
        'total_pages': total_pages,
        'page': page,
        'per_page': per_page
    })

@app.route('/api/applications/<int:app_id>', methods=['PUT'])
@admin_login_required()
def update_application(app_id):
    user = AdminUser.query.get(session['admin_user_id'])
    app = Application.query.get(app_id)
    if not app:
        return jsonify({'error': 'Application not found'}), 404
    data = request.get_json()
    from datetime import datetime
    # Filter out datetime fields that should not be updated from frontend
    datetime_fields = ['created_at', 'updated_at', 'razorpay_payment_timestamp']
    filtered_data = {k: v for k, v in data.items() if k not in datetime_fields}
    # Special handling for payment_timestamp
    if 'payment_timestamp' in filtered_data:
        ts = filtered_data['payment_timestamp']
        if not ts:
            ts = None
        elif isinstance(ts, str):
            try:
                if len(ts) == 10:  # 'YYYY-MM-DD'
                    ts = datetime.strptime(ts, '%Y-%m-%d')
                else:
                    ts = datetime.fromisoformat(ts)
            except Exception:
                ts = None
        filtered_data['payment_timestamp'] = ts
    # Special handling for cheque_cash_payemnt_amount
    if 'cheque_cash_payemnt_amount' in filtered_data:
        amt = filtered_data['cheque_cash_payemnt_amount']
        if amt in [None, '', 'null']:
            filtered_data['cheque_cash_payemnt_amount'] = 0.0
        else:
            try:
                filtered_data['cheque_cash_payemnt_amount'] = float(amt)
            except Exception:
                filtered_data['cheque_cash_payemnt_amount'] = 0.0
    # Admin can edit all fields, ops can edit only payment-related fields
    if user.role == 'admin':
        for key, value in filtered_data.items():
            if hasattr(app, key):
                # Only set scalar values, skip dict/list
                if isinstance(value, (dict, list)):
                    continue
                setattr(app, key, value)
    elif user.role == 'ops':
        # Only allow editing of payment-related fields
        payment_fields = [
            'razorpay_order_id', 'razorpay_payment_id', 'razorpay_payment_status',
            'razorpay_payment_amount', 'razorpay_payment_method', 'razorpay_payment_timestamp',
            'program_total_fee'
        ]
        for key, value in filtered_data.items():
            if key in payment_fields:
                setattr(app, key, value)
    else:
        return jsonify({'error': 'Insufficient permissions'}), 403
    # Update the updated_at timestamp
    app.updated_at = datetime.utcnow()
    db.session.commit()
    return jsonify({'message': 'Application updated'})

@app.route('/api/applications/bulk-delete', methods=['POST'])
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
            # Delete all PaymentHistory records for this application_id
            PaymentHistory.query.filter_by(application_id=application_id).delete()
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

@app.route('/api/applications/bulk-download', methods=['POST'])
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

@app.route('/api/payment-history', methods=['GET'])
@admin_login_required()
def get_payment_history():
    # Pagination
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 50))
    search = request.args.get('search', '').strip().lower()

    # Join PaymentHistory with Application to get candidate details
    query = db.session.query(PaymentHistory, Application).join(
        Application, PaymentHistory.application_id == Application.application_id
    )

    # Search filter (searches across candidate name, email, mobile, application_id)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            db.or_(
                Application.first_name.ilike(search_pattern),
                Application.last_name.ilike(search_pattern),
                Application.email.ilike(search_pattern),
                Application.mobile_number.ilike(search_pattern),
                Application.application_id.ilike(search_pattern),
                PaymentHistory.razorpay_payment_id.ilike(search_pattern)
            )
        )

    # LIFO: latest payments first
    query = query.order_by(PaymentHistory.created_at.desc())

    # Pagination
    total = query.count()
    offset = (page - 1) * per_page
    results = query.offset(offset).limit(per_page).all()
    
    total_pages = (total + per_page - 1) // per_page

    def payment_to_dict(payment, application):
        return {
            'id': payment.id,
            'application_id': payment.application_id,
            'candidate_name': f"{application.first_name or ''} {application.middle_name or ''} {application.last_name or ''}".strip(),
            'email': application.email,
            'mobile': application.mobile_number,
            'program': 'HDFC Bank Teller Program',
            'razorpay_order_id': payment.razorpay_order_id,
            'razorpay_payment_id': payment.razorpay_payment_id,
            'razorpay_payment_status': payment.razorpay_payment_status,
            'razorpay_payment_amount': payment.razorpay_payment_amount,
            'razorpay_payment_method': payment.razorpay_payment_method,
            'razorpay_payment_timestamp': payment.razorpay_payment_timestamp,
            'payment_type': payment.payment_type,
            'installment_number': payment.installment_number,
            'created_at': payment.created_at,
            'total_amount_paid': payment.total_amount_paid,
            # Add any new fields from PaymentHistory here
        }

    return jsonify({
        'payments': [payment_to_dict(payment, application) for payment, application in results],
        'total': total,
        'total_pages': total_pages,
        'page': page,
        'per_page': per_page
    })

@app.route('/api/download-payment-receipt/<int:application_id>', methods=['GET'])
@admin_login_required()
def download_payment_receipt(application_id):
    """Download payment receipt PDF for a specific application"""
    try:
        # Try to get the application by DB primary key (id)
        application = Application.query.get(application_id)
        # If not found, try to get by business registration number (application_id)
        if not application:
            application = Application.query.filter_by(application_id=str(application_id)).first()
        if not application:
            return jsonify({'error': 'Application not found'}), 404
        # Get payment data from the application
        payment_data = {
            'razorpay_payment_id': application.razorpay_payment_id,
            'razorpay_order_id': application.razorpay_order_id,
            'razorpay_payment_status': application.razorpay_payment_status,
            'razorpay_payment_amount': application.razorpay_payment_amount,
            'razorpay_payment_method': application.razorpay_payment_method,
            'razorpay_payment_timestamp': application.razorpay_payment_timestamp
        }
        
        # Convert application to dict for PDF generation
        application_data = get_application_dict(application)
        
        # Generate PDF
        pdf_buffer = generate_payment_receipt_pdf(payment_data, application_data)
        
        if not pdf_buffer:
            return jsonify({'error': 'Failed to generate PDF'}), 500
        
        # Send the PDF
        return send_file(
            pdf_buffer,
            as_attachment=True,
            download_name=f"Payment_Receipt_{application.application_id}.pdf",
            mimetype='application/pdf'
        )
        
    except Exception as e:
        print(f"Error downloading payment receipt: {str(e)}")
        return jsonify({'error': 'Failed to download payment receipt'}), 500

@app.route('/api/download-payment-receipt-by-payment/<int:payment_id>', methods=['GET'])
@admin_login_required()
def download_payment_receipt_by_payment(payment_id):
    """Download payment receipt PDF for a specific payment (PaymentHistory record)"""
    try:
        # Get the payment history record
        payment = PaymentHistory.query.get(payment_id)
        if not payment:
            return jsonify({'error': 'Payment record not found'}), 404
        # Get the related application
        application = Application.query.filter_by(application_id=payment.application_id).first()
        if not application:
            return jsonify({'error': 'Application not found'}), 404
        # Use payment record fields for the receipt
        payment_data = {
            'razorpay_payment_id': payment.razorpay_payment_id,
            'razorpay_order_id': payment.razorpay_order_id,
            'razorpay_payment_status': payment.razorpay_payment_status,
            'razorpay_payment_amount': payment.razorpay_payment_amount,
            'razorpay_payment_method': payment.razorpay_payment_method,
            'razorpay_payment_timestamp': payment.razorpay_payment_timestamp
        }
        # Convert application to dict for PDF generation
        application_data = get_application_dict(application)
        # Generate PDF
        pdf_buffer = generate_payment_receipt_pdf(payment_data, application_data)
        if not pdf_buffer:
            return jsonify({'error': 'Failed to generate PDF'}), 500
        # Send the PDF
        return send_file(
            pdf_buffer,
            as_attachment=True,
            download_name=f"Payment_Receipt_{application.application_id}_{payment.razorpay_payment_id or payment.id}.pdf",
            mimetype='application/pdf'
        )
    except Exception as e:
        print(f"Error downloading payment receipt by payment: {str(e)}")
        return jsonify({'error': 'Failed to download payment receipt'}), 500

# --- Loan Application Endpoints ---
from sqlalchemy.exc import IntegrityError

@app.route('/api/loan-applications', methods=['POST'])
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

@app.route('/api/loan-provider-selections', methods=['POST'])
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

@app.route('/api/loan-provider-selections', methods=['GET'])
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

@app.route('/api/loan-applications/<int:loan_id>', methods=['PUT'])
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

@app.route('/api/loan-applications', methods=['GET'])
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
            'program': loan.program or 'HDFC Bank Teller Program',
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

@app.route('/api/loan-applications/<int:loan_id>', methods=['GET'])
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
        'program': 'HDFC Bank Teller Program',
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

@app.route('/api/loan-applications/<int:loan_id>/download-documents', methods=['GET'])
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

@app.route('/api/loan-applications/by-application-id/<string:application_id>', methods=['PUT'])
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

@app.route('/api/user/download-payment-receipt', methods=['GET'])
def user_download_payment_receipt():
    application_id = request.args.get('application_id')
    if not application_id:
        return jsonify({'error': 'Missing application_id'}), 400
    # Try to get the application by DB primary key (id) or business registration number (application_id)
    application = Application.query.get(application_id)
    if not application:
        application = Application.query.filter_by(application_id=str(application_id)).first()
    if not application:
        return jsonify({'error': 'Application not found'}), 404
    # Get payment data from the application
    payment_data = {
        'razorpay_payment_id': application.razorpay_payment_id,
        'razorpay_order_id': application.razorpay_order_id,
        'razorpay_payment_status': application.razorpay_payment_status,
        'razorpay_payment_amount': application.razorpay_payment_amount,
        'razorpay_payment_method': application.razorpay_payment_method,
        'razorpay_payment_timestamp': application.razorpay_payment_timestamp
    }
    # Convert application to dict for PDF generation
    application_data = get_application_dict(application)
    # Generate PDF
    pdf_buffer = generate_payment_receipt_pdf(payment_data, application_data)
    if not pdf_buffer:
        return jsonify({'error': 'Failed to generate PDF'}), 500
    # Send the PDF
    return send_file(
        pdf_buffer,
        as_attachment=True,
        download_name=f"Payment_Receipt_{application.application_id}.pdf",
        mimetype='application/pdf'
    )

@app.route('/api/loan-provider-selections/<int:provider_id>', methods=['PUT'])
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

@app.route('/api/user/loan-application', methods=['GET'])
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
        'program': loan.program or 'HDFC Bank Teller Program',
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

@app.route('/api/loan-applications/bulk-download', methods=['POST'])
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
            'Program': loan.program or 'HDFC Bank Teller Program',
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

@app.route('/api/payment-history/bulk-download', methods=['POST'])
@admin_login_required()
def bulk_download_payment_history():
    data = request.get_json()
    ids = data.get('ids', [])
    if not ids:
        return jsonify({'error': 'No IDs provided'}), 400
    # Join PaymentHistory with Application to get candidate details
    query = db.session.query(PaymentHistory, Application).join(
        Application, PaymentHistory.application_id == Application.application_id
    ).filter(PaymentHistory.id.in_(ids))
    results = query.all()
    rows = []
    for payment, application in results:
        rows.append({
            'ID': payment.id,
            'Application ID': payment.application_id,
            'Candidate Name': f"{application.first_name or ''} {application.middle_name or ''} {application.last_name or ''}".strip(),
            'Email': application.email,
            'Mobile': application.mobile_number,
            'Program': 'Udaan Virtual Relationship  Manager Program',
            'Razorpay Order ID': payment.razorpay_order_id,
            'Razorpay Payment ID': payment.razorpay_payment_id,
            'Razorpay Payment Status': payment.razorpay_payment_status,
            'Razorpay Payment Amount': payment.razorpay_payment_amount,
            'Razorpay Payment Method': payment.razorpay_payment_method,
            'Razorpay Payment Timestamp': payment.razorpay_payment_timestamp,
            'Payment Type': payment.payment_type,
            'Installment Number': payment.installment_number,
            'Created At': payment.created_at,
            'Total Amount Paid': payment.total_amount_paid,
            # Add any new fields as needed
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
        download_name='payment_history.xlsx',
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )

@app.route('/api/applications/<string:application_id>/download-documents', methods=['GET'])
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

# --- LoanProvider CRUD API ---
from flask import request, jsonify
from models import LoanProvider
from extensions import db

@app.route('/api/loan-providers', methods=['GET'])
def get_loan_providers():
    providers = LoanProvider.query.all()
    return jsonify([
        {
            'id': p.id,
            'name': p.name,
            'logo': p.logo,
            'base_interest_rate': p.base_interest_rate,
            'tenures': p.tenures,
            'description': p.description,
            'cibil_score': p.cibil_score,
            'created_at': p.created_at,
            'updated_at': p.updated_at
        } for p in providers
    ])

@app.route('/api/loan-providers', methods=['POST'])
@admin_login_required('admin')
def add_loan_provider():
    data = request.json
    provider = LoanProvider(
        name=data.get('name'),
        logo=data.get('logo'),
        base_interest_rate=data.get('base_interest_rate'),
        tenures=data.get('tenures'),
        description=data.get('description'),
        cibil_score=data.get('cibil_score')
    )
    db.session.add(provider)
    db.session.commit()
    return jsonify({'message': 'Provider added', 'id': provider.id}), 201

@app.route('/api/loan-providers/<int:id>', methods=['GET'])
def get_loan_provider(id):
    provider = LoanProvider.query.get_or_404(id)
    return jsonify({
        'id': provider.id,
        'name': provider.name,
        'logo': provider.logo,
        'base_interest_rate': provider.base_interest_rate,
        'tenures': provider.tenures,
        'description': provider.description,
        'cibil_score': provider.cibil_score,
        'created_at': provider.created_at,
        'updated_at': provider.updated_at
    })

@app.route('/api/loan-providers/<int:id>', methods=['PUT'])
@admin_login_required('admin')
def update_loan_provider(id):
    provider = LoanProvider.query.get_or_404(id)
    data = request.json
    provider.name = data.get('name', provider.name)
    provider.logo = data.get('logo', provider.logo)
    provider.base_interest_rate = data.get('base_interest_rate', provider.base_interest_rate)
    provider.tenures = data.get('tenures', provider.tenures)
    provider.description = data.get('description', provider.description)
    provider.cibil_score = data.get('cibil_score', provider.cibil_score)
    db.session.commit()
    return jsonify({'message': 'Provider updated'})

@app.route('/api/loan-providers/<int:id>', methods=['DELETE'])
@admin_login_required('admin')
def delete_loan_provider(id):
    provider = LoanProvider.query.get_or_404(id)
    db.session.delete(provider)
    db.session.commit()
    return jsonify({'message': 'Provider deleted'})

if __name__ == '__main__':
    with app.app_context():
        db.init_app(app)
        migrate.init_app(app, db)
        db.create_all()
    app.run(debug=True, port=8000)
