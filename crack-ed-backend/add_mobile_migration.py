from main import app, db
import sqlite3

def add_mobile_column():
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
            
            conn.close()
            
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    add_mobile_column() 