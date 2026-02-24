import uuid
import random
from extensions import db, migrate
from sqlalchemy.dialects.sqlite import JSON

def generate_application_id():
    prefix = "UDN"
    while True:
        unique_digits = f"{random.randint(0, 99999999):08d}"
        application_id = prefix + unique_digits
        if not Application.query.filter_by(application_id=application_id).first():
            return application_id


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True,autoincrement=True)
    name = db.Column(db.String(120))
    email = db.Column(db.String(120))
    mobile = db.Column(db.String(15), unique=True)
    otp = db.Column(db.String(6))
    otp_txn_id = db.Column(db.String(100))
    verified = db.Column(db.Boolean, default=False)
    token = db.Column(db.String(255))
    applications = db.relationship('Application', backref='user', lazy=True)

    
class CallBackUsers(db.Model):
    __tablename__ = "callback_users"
    id = db.Column(db.Integer, primary_key=True)
    fname = db.Column(db.String(120))
    lname = db.Column(db.String(120))
    city = db.Column(db.String(120))
    email = db.Column(db.String(120), unique=True)
    mobile = db.Column(db.String(15), unique=True)
    otp = db.Column(db.String(6))
    otp_txn_id = db.Column(db.String(100))
    verified = db.Column(db.Boolean, default=False)

class Application(db.Model):
    id = db.Column(db.Integer, primary_key=True,autoincrement=True)
    application_id = db.Column(db.String(20), default=generate_application_id, unique=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    # Personal Details
    first_name = db.Column(db.String(100))
    middle_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100))
    mobile_number = db.Column(db.String(15))
    email = db.Column(db.String(120))
    date_of_birth = db.Column(db.String(20))
    pan_card_number = db.Column(db.String(20))
    gender = db.Column(db.String(20))
    family_income = db.Column(db.String(20))

    # Address
    address = db.Column(db.String(200))
    state = db.Column(db.String(100))
    district = db.Column(db.String(100))
    city = db.Column(db.String(100))
    pincode = db.Column(db.String(10))

    # Education - UG
    ug_university_name = db.Column(db.String(150))
    ug_degree = db.Column(db.String(100))
    ug_year_graduated = db.Column(db.String(10))

    # Education - PG
    pg_university_name = db.Column(db.String(150))
    pg_degree = db.Column(db.String(100))
    pg_year_graduated = db.Column(db.String(10))

    # Job Experience
    current_job_title = db.Column(db.String(100))
    company_name = db.Column(db.String(100))
    job_type = db.Column(db.String(50))
    location = db.Column(db.String(100))
    exp_current_company = db.Column(db.String(10))
    total_experience = db.Column(db.String(10))

    # Documents (store filenames or file paths)
    passport_photo = db.Column(db.String(255))
    aadhar_front = db.Column(db.String(255))
    aadhar_back = db.Column(db.String(255))
    pan_card = db.Column(db.String(255))
    ug_certificate = db.Column(db.String(255))
    pg_certificate = db.Column(db.String(255))
    resume = db.Column(db.String(255))

    # Application status and metadata
    current_application_step = db.Column(db.Integer, default=0)
    status = db.Column(db.String(100), default="Started")
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

    # Razorpay payment fields
    razorpay_order_id = db.Column(db.String(100))
    razorpay_payment_id = db.Column(db.String(100))
    razorpay_payment_status = db.Column(db.String(50))
    razorpay_payment_amount = db.Column(db.Float)
    razorpay_payment_method = db.Column(db.String(50))
    razorpay_payment_timestamp = db.Column(db.DateTime)
    
    # Configurable program fee
    program_total_fee = db.Column(db.Float, default=236000.0)
    # New payment summary fields
    total_amount_paid = db.Column(db.Float, default=0.0)
    approved_loan_amount = db.Column(db.Float, default=0.0)
    cheque_cash_payment_mode = db.Column(db.String(50))  # instead of payment_mode
    payment_timestamp = db.Column(db.DateTime)
    payment_comment = db.Column(db.String(255))
    cheque_cash_payemnt_amount = db.Column(db.Float, default=0.0)

class PaymentHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    application_id = db.Column(db.String(20), db.ForeignKey('application.application_id'), nullable=False)
    razorpay_order_id = db.Column(db.String(100))
    razorpay_payment_id = db.Column(db.String(100))
    razorpay_payment_status = db.Column(db.String(50))
    razorpay_payment_amount = db.Column(db.Float)
    razorpay_payment_method = db.Column(db.String(50))
    razorpay_payment_timestamp = db.Column(db.DateTime)
    payment_type = db.Column(db.String(50))  # 'registration', 'installment', 'custom'
    installment_number = db.Column(db.Integer, nullable=True)  # 1, 2, 3, etc.
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    # New field for dashboard aggregation
    total_amount_paid = db.Column(db.Float, default=0.0)
    # Relationship
    application = db.relationship('Application', backref='payment_history')

class AdminUser(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'admin', 'ops', 'sales'
    mobile_number = db.Column(db.String(15), unique=True)  # Mobile number for password reset
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    is_active = db.Column(db.Boolean, default=True)  # Admin can activate/deactivate user
    token = db.Column(db.String(255), unique=True, nullable=True)  # Token for API authentication
    
class LoanApplication(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    application_id = db.Column(db.String(20), db.ForeignKey('application.application_id'), nullable=False)
    candidate_name = db.Column(db.String(255))
    program = db.Column(db.String(255))
    # Primary applicant
    applicant1_name = db.Column(db.String(255))
    applicant1_relationship = db.Column(db.String(100))
    applicant1_pan = db.Column(db.String(255))
    applicant1_aadhar_front = db.Column(db.String(255))
    applicant1_aadhar_back = db.Column(db.String(255))
    applicant1_bank_statement = db.Column(db.String(255))
    applicant1_salary_slip = db.Column(db.String(255))
    # Co-applicant 1
    applicant2_name = db.Column(db.String(255))
    applicant2_relationship = db.Column(db.String(100))
    applicant2_pan = db.Column(db.String(255))
    applicant2_aadhar_front = db.Column(db.String(255))
    applicant2_aadhar_back = db.Column(db.String(255))
    applicant2_bank_statement = db.Column(db.String(255))
    applicant2_salary_slip = db.Column(db.String(255))
    # Co-applicant 2
    applicant3_name = db.Column(db.String(255))
    applicant3_relationship = db.Column(db.String(100))
    applicant3_pan = db.Column(db.String(255))
    applicant3_aadhar_front = db.Column(db.String(255))
    applicant3_aadhar_back = db.Column(db.String(255))
    applicant3_bank_statement = db.Column(db.String(255))
    applicant3_salary_slip = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())
    # Relationship to provider selections
    provider_selections = db.relationship('LoanProviderSelection', backref='loan_application', lazy=True)

class LoanProviderSelection(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    application_id = db.Column(db.String(20), db.ForeignKey('loan_application.application_id'), nullable=False)
    loan_provider_name = db.Column(db.String(100))
    loan_amount = db.Column(db.Float)
    loan_tenure = db.Column(db.Integer)
    loan_interest = db.Column(db.Float)
    emi = db.Column(db.Float)
    status = db.Column(db.String(50), default='Pending')
    disbursal_date = db.Column(db.Date)
    disbursed_amount = db.Column(db.Float)
    final_interest_rate = db.Column(db.Float)
    loan_processed_by = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())

class LoanProvider(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), nullable=False)
    logo = db.Column(db.String(255))  # file path or URL
    base_interest_rate = db.Column(db.Float, nullable=False)
    tenures = db.Column(JSON, nullable=False)  # List of allowed tenures (e.g., [3,6,9,12,18,24])
    description = db.Column(db.String(500))
    cibil_score = db.Column(db.String(50), nullable=True)  # Now allows ranges like '400-600'
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())
    
