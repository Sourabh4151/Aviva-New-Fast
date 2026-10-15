import sqlite3
import os

def add_utm_columns():
    """Add UTM parameter columns to the user table"""
    # Get the database path
    db_path = os.path.join(os.path.dirname(__file__), 'instance', 'users.db')
    
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return
    
    # Connect to the database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if columns already exist
        cursor.execute("PRAGMA table_info(user)")
        columns = [column[1] for column in cursor.fetchall()]
        
        # Add UTM columns if they don't exist
        if 'utm_source' not in columns:
            cursor.execute("ALTER TABLE user ADD COLUMN utm_source VARCHAR(100)")
            print("Added utm_source column")
        
        if 'utm_medium' not in columns:
            cursor.execute("ALTER TABLE user ADD COLUMN utm_medium VARCHAR(100)")
            print("Added utm_medium column")
        
        if 'utm_campaign' not in columns:
            cursor.execute("ALTER TABLE user ADD COLUMN utm_campaign VARCHAR(100)")
            print("Added utm_campaign column")
        
        # Commit the changes
        conn.commit()
        print("UTM columns added successfully!")
        
    except Exception as e:
        print(f"Error adding columns: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    add_utm_columns()
