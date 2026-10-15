#!/usr/bin/env python3
"""
Database Model Checker
Checks if all models defined in models.py are properly created in the database
"""

from main import app, db
from models import User, Application, CallBackUsers, AdminUser, PaymentHistory
from sqlalchemy import inspect
import os

def check_database_models():
    """Check if all models are properly created in the database"""
    
    print("🔍 Database Model Checker")
    print("=" * 50)
    
    with app.app_context():
        # Initialize database
        db.init_app(app)
        
        # Get database inspector
        inspector = inspect(db.engine)
        
        # Get all table names from database
        existing_tables = inspector.get_table_names()
        print(f"📋 Existing tables in database: {existing_tables}")
        
        # Define expected models and their table names
        expected_models = {
            'user': User,
            'application': Application,
            'callback_users': CallBackUsers,
            'admin_user': AdminUser,
            'payment_history': PaymentHistory
        }
        
        print("\n🔍 Checking model definitions...")
        missing_tables = []
        existing_models = []
        
        for table_name, model_class in expected_models.items():
            if table_name in existing_tables:
                existing_models.append(table_name)
                print(f"✅ {table_name} - EXISTS")
                
                # Check columns
                columns = inspector.get_columns(table_name)
                print(f"   📊 Columns: {len(columns)}")
                for col in columns:
                    print(f"      - {col['name']}: {col['type']}")
            else:
                missing_tables.append(table_name)
                print(f"❌ {table_name} - MISSING")
        
        print(f"\n📊 Summary:")
        print(f"   ✅ Existing models: {len(existing_models)}")
        print(f"   ❌ Missing models: {len(missing_tables)}")
        
        if missing_tables:
            print(f"\n⚠️  Missing tables: {missing_tables}")
            print("💡 Run 'db.create_all()' to create missing tables")
        
        # Check for any extra tables in database
        extra_tables = [table for table in existing_tables if table not in expected_models.keys()]
        if extra_tables:
            print(f"\n🔍 Extra tables found: {extra_tables}")
        
        return missing_tables, existing_models, extra_tables

def check_admin_users():
    """Check admin users in the database"""
    
    print("\n👥 Admin Users Check")
    print("=" * 30)
    
    with app.app_context():
        try:
            admin_users = AdminUser.query.all()
            print(f"📊 Total admin users: {len(admin_users)}")
            
            if admin_users:
                print("\n📋 Admin Users List:")
                for i, user in enumerate(admin_users, 1):
                    print(f"{i}. Username: {user.username:<15} | Role: {user.role:<8} | Mobile: {user.mobile_number or 'N/A':<12} | Active: {user.is_active}")
            else:
                print("⚠️  No admin users found!")
                print("💡 Use hashgenerator.py to create admin users")
                
        except Exception as e:
            print(f"❌ Error checking admin users: {e}")

def check_payment_history():
    """Check payment history in the database"""
    
    print("\n💰 Payment History Check")
    print("=" * 30)
    
    with app.app_context():
        try:
            payments = PaymentHistory.query.all()
            print(f"📊 Total payment records: {len(payments)}")
            
            if payments:
                print("\n📋 Recent Payments:")
                for i, payment in enumerate(payments[-5:], 1):  # Show last 5
                    print(f"{i}. App ID: {payment.application_id:<12} | Amount: ₹{payment.razorpay_payment_amount:<10} | Status: {payment.razorpay_payment_status:<12} | Date: {payment.created_at.strftime('%Y-%m-%d')}")
            else:
                print("ℹ️  No payment records found")
                
        except Exception as e:
            print(f"❌ Error checking payment history: {e}")

def check_applications():
    """Check applications in the database"""
    
    print("\n📝 Applications Check")
    print("=" * 30)
    
    with app.app_context():
        try:
            applications = Application.query.all()
            print(f"📊 Total applications: {len(applications)}")
            
            if applications:
                # Count by status
                status_counts = {}
                for app in applications:
                    status = app.status or 'Unknown'
                    status_counts[status] = status_counts.get(status, 0) + 1
                
                print("\n📊 Applications by Status:")
                for status, count in status_counts.items():
                    print(f"   {status}: {count}")
                    
                # Show recent applications
                print("\n📋 Recent Applications:")
                for i, app in enumerate(applications[-5:], 1):  # Show last 5
                    print(f"{i}. ID: {app.application_id:<12} | Name: {app.first_name} {app.last_name:<15} | Status: {app.status:<12} | Date: {app.created_at.strftime('%Y-%m-%d')}")
            else:
                print("ℹ️  No applications found")
                
        except Exception as e:
            print(f"❌ Error checking applications: {e}")

def check_database_file():
    """Check database file status"""
    
    print("\n💾 Database File Check")
    print("=" * 30)
    
    db_path = "users.db"
    if os.path.exists(db_path):
        size = os.path.getsize(db_path)
        print(f"✅ Database file exists: {db_path}")
        print(f"📊 File size: {size:,} bytes ({size/1024:.1f} KB)")
    else:
        print(f"❌ Database file not found: {db_path}")

def main():
    """Main function to run all checks"""
    
    try:
        # Check database file
        check_database_file()
        
        # Check models
        missing_tables, existing_models, extra_tables = check_database_models()
        
        # Check specific data
        check_admin_users()
        check_payment_history()
        check_applications()
        
        print("\n" + "=" * 50)
        print("✅ Database check completed!")
        
        if missing_tables:
            print(f"\n⚠️  Action required: Create missing tables: {missing_tables}")
            print("💡 Run: python -c 'from main import app, db; app.app_context().push(); db.create_all()'")
        
    except Exception as e:
        print(f"❌ Error during database check: {e}")

if __name__ == "__main__":
    main() 