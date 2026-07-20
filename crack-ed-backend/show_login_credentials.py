from main import app, db, AdminUser

def show_credentials():
    with app.app_context():
        db.init_app(app)
        users = AdminUser.query.all()
        print("=== Admin Login Credentials ===")
        print()
        for user in users:
            if user.is_active:
                print(f"Username: {user.username}")
                print(f"Role: {user.role}")
                mobile = getattr(user, 'mobile_number', 'Not set')
                print(f"Mobile: {mobile}")
                if user.username == 'admin':
                    print("Password: admin123")
                else:
                    print("Password: (contact admin)")
                print("-" * 30)
        
        print()
        print("=== Login Instructions ===")
        print("1. Go to: http://localhost:5000/admin-login")
        print("2. Use the credentials above")
        print("3. For new users, use 'Create New User' button")
        print("4. For password reset, use 'Forgot Password' button")

if __name__ == "__main__":
    show_credentials() 