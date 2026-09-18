from main import app, db, AdminUser
import bcrypt

def check_users():
    with app.app_context():
        db.init_app(app)
        users = AdminUser.query.all()
        print(f"Total users: {len(users)}")
        for user in users:
            mobile = getattr(user, 'mobile_number', 'Not set')
            print(f"ID: {user.id}, Username: {user.username}, Role: {user.role}, Active: {user.is_active}, Mobile: {mobile}")
        
        # Create a default admin user if none exists
        if not users:
            print("No users found. Creating default admin user...")
            password_hash = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            admin_user = AdminUser(
                username='admin',
                password_hash=password_hash,
                role='admin',
                mobile_number='1234567890',
                is_active=True
            )
            db.session.add(admin_user)
            db.session.commit()
            print("Default admin user created:")
            print("Username: admin")
            print("Password: admin123")
            print("Mobile: 1234567890")
        else:
            # Check if any user needs mobile number
            for user in users:
                if not hasattr(user, 'mobile_number') or not user.mobile_number:
                    print(f"User {user.username} needs mobile number update")
                    # Add mobile number field if missing
                    if not hasattr(user, 'mobile_number'):
                        # This would require a database migration
                        print(f"Need to add mobile_number column for user {user.username}")

if __name__ == "__main__":
    check_users() 