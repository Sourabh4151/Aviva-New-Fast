from main import app, db, AdminUser
import sqlite3
import bcrypt

def fix_mobile_migration():
    with app.app_context():
        try:
            # Connect to the database
            conn = sqlite3.connect('instance/users.db')
            cursor = conn.cursor()
            
            # Check if mobile_number column exists
            cursor.execute("PRAGMA table_info(admin_user)")
            columns = [column[1] for column in cursor.fetchall()]
            
            if 'mobile_number' not in columns:
                print("Adding mobile_number column to admin_user table...")
                cursor.execute("ALTER TABLE admin_user ADD COLUMN mobile_number TEXT")
                conn.commit()
                print("mobile_number column added successfully!")
            else:
                print("mobile_number column already exists!")
            
            # Update existing users with a default mobile number if they don't have one
            cursor.execute("UPDATE admin_user SET mobile_number = '1234567890' WHERE mobile_number IS NULL OR mobile_number = ''")
            conn.commit()
            print("Updated existing users with default mobile number")
            
            # Show current users
            cursor.execute("SELECT id, username, role, mobile_number, is_active FROM admin_user")
            users = cursor.fetchall()
            print(f"\nCurrent users ({len(users)}):")
            for user in users:
                print(f"ID: {user[0]}, Username: {user[1]}, Role: {user[2]}, Mobile: {user[3]}, Active: {user[4]}")
            
            # Create a default admin user if none exists
            if not users:
                print("\nNo users found. Creating default admin user...")
                password_hash = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
                cursor.execute("""
                    INSERT INTO admin_user (username, password_hash, role, mobile_number, is_active, created_at)
                    VALUES (?, ?, ?, ?, ?, datetime('now'))
                """, ('admin', password_hash, 'admin', '1234567890', True))
                conn.commit()
                print("Default admin user created:")
                print("Username: admin")
                print("Password: admin123")
                print("Mobile: 1234567890")
            
            conn.close()
            print("\nMigration completed successfully!")
            
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    fix_mobile_migration() 