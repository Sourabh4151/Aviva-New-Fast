import sqlite3
import os

def add_aadhaar_card_number():
    """Add aadhaar_card_number column to the application table"""
    # Get the database path
    db_path = os.path.join(os.path.dirname(__file__), 'instance', 'users.db')
    
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return
    
    # Connect to the database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if column already exists
        cursor.execute("PRAGMA table_info(application)")
        columns = [column[1] for column in cursor.fetchall()]
        
        # Add aadhaar_card_number column if it doesn't exist
        if 'aadhaar_card_number' not in columns:
            cursor.execute("ALTER TABLE application ADD COLUMN aadhaar_card_number VARCHAR(20)")
            print("Added aadhaar_card_number column")
        else:
            print("aadhaar_card_number column already exists")
        
        # Commit the changes
        conn.commit()
        print("Migration completed successfully!")
        
    except Exception as e:
        print(f"Error adding column: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    add_aadhaar_card_number()

