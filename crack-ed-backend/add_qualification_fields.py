import sqlite3
import os

def add_qualification_fields():
    """Add qualification and year_of_passing columns to the application table"""
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
        cursor.execute("PRAGMA table_info(application)")
        columns = [column[1] for column in cursor.fetchall()]
        
        # Add qualification column if it doesn't exist
        if 'qualification' not in columns:
            cursor.execute("ALTER TABLE application ADD COLUMN qualification VARCHAR(100)")
            print("Added qualification column")
        else:
            print("qualification column already exists")
        
        # Add year_of_passing column if it doesn't exist
        if 'year_of_passing' not in columns:
            cursor.execute("ALTER TABLE application ADD COLUMN year_of_passing VARCHAR(10)")
            print("Added year_of_passing column")
        else:
            print("year_of_passing column already exists")
        
        # Commit the changes
        conn.commit()
        print("Qualification fields added successfully!")
        
    except Exception as e:
        print(f"Error adding columns: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    add_qualification_fields()

