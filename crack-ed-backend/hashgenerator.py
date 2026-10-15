import bcrypt
from getpass import getpass
from models import db, AdminUser
from extensions import db as db_ext
from flask import Flask
import re

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db_ext.init_app(app)

def validate_mobile_number(mobile):
    """Validate mobile number format (10 digits)"""
    if not mobile:
        return False
    # Remove any spaces or special characters
    mobile_clean = re.sub(r'[^\d]', '', mobile)
    return len(mobile_clean) == 10 and mobile_clean.isdigit()

def validate_username(username):
    """Validate username format"""
    if not username or len(username) < 3:
        return False
    # Allow alphanumeric and underscore, 3-20 characters
    return re.match(r'^[a-zA-Z0-9_]{3,20}$', username) is not None

def validate_password(password):
    """Validate password strength"""
    if len(password) < 6:
        return False
    return True

print("🔐 Enhanced Admin User Creator")
print("==============================\n")

created_users = []

with app.app_context():
    # Check if database tables exist
    try:
        db.create_all()
        print("✅ Database tables created/verified successfully")
    except Exception as e:
        print(f"❌ Error creating database tables: {e}")
        exit(1)
    
    while True:
        print("\n" + "="*50)
        print("📝 Creating New Admin User")
        print("="*50)
        
        # Username input with validation
        while True:
            username = input("Enter username (3-20 chars, alphanumeric + underscore): ").strip()
            if not validate_username(username):
                print("❌ Invalid username format. Use 3-20 characters, alphanumeric and underscore only.")
                continue
            if AdminUser.query.filter_by(username=username).first():
                print(f"❌ User '{username}' already exists. Please choose a different username.")
                continue
            break
        
        # Password input with validation
        while True:
            password = getpass("Enter password (min 6 characters): ")
            if not validate_password(password):
                print("❌ Password must be at least 6 characters long.")
                continue
            confirm_password = getpass("Confirm password: ")
            if password != confirm_password:
                print("❌ Passwords do not match. Please try again.")
                continue
            break
        
        # Role input with validation
        while True:
            role = input("Enter role (admin/ops/sales): ").strip().lower()
            if role not in ['admin', 'ops', 'sales']:
                print("❌ Invalid role. Please enter 'admin', 'ops', or 'sales'.")
                continue
            break
        
        # Mobile number input with validation
        while True:
            mobile_number = input("Enter mobile number (10 digits): ").strip()
            if not validate_mobile_number(mobile_number):
                print("❌ Invalid mobile number. Please enter 10 digits.")
                continue
            if AdminUser.query.filter_by(mobile_number=mobile_number).first():
                print(f"❌ Mobile number '{mobile_number}' already exists. Please use a different number.")
                continue
            break
        
        # Create user
        try:
            password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            user = AdminUser(
                username=username, 
                password_hash=password_hash, 
                role=role,
                mobile_number=mobile_number,
                is_active=True
            )
            db.session.add(user)
            db.session.commit()
            created_users.append((username, role, mobile_number))
            print(f"✅ User '{username}' with role '{role}' and mobile '{mobile_number}' created successfully!")
        except Exception as e:
            print(f"❌ Error creating user: {e}")
            db.session.rollback()
        
        # Ask if user wants to create another
        more = input("\nAdd another user? (y/n): ").strip().lower()
        if more != 'y':
            break

print("\n" + "="*50)
print("📊 Summary of Created Users")
print("="*50)
if created_users:
    for i, (username, role, mobile) in enumerate(created_users, 1):
        print(f"{i}. Username: {username:<15} | Role: {role:<8} | Mobile: {mobile}")
else:
    print("No users were created.")
print("\n✅ Done!") 