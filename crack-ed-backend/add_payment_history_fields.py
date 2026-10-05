import sqlite3
import os

def add_payment_history_fields():
    # Connect to the database
    db_path = 'instance/users.db'
    if not os.path.exists(db_path):
        print(f"Database file not found at {db_path}")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Add program_total_fee column to application table
        cursor.execute("ALTER TABLE application ADD COLUMN program_total_fee REAL DEFAULT 236000.0;")
        print("Added program_total_fee column")
    except Exception as e:
        print("program_total_fee:", e)
    
    try:
        # Create payment_history table
        cursor.execute("""
            CREATE TABLE payment_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                application_id VARCHAR(20) NOT NULL,
                razorpay_order_id VARCHAR(100),
                razorpay_payment_id VARCHAR(100),
                razorpay_payment_status VARCHAR(50),
                razorpay_payment_amount REAL,
                razorpay_payment_method VARCHAR(50),
                razorpay_payment_timestamp DATETIME,
                payment_type VARCHAR(50),
                installment_number INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (application_id) REFERENCES application (application_id)
            );
        """)
        print("Created payment_history table")
    except Exception as e:
        print("payment_history table:", e)
    
    # Commit changes and close connection
    conn.commit()
    conn.close()
    print("Migration completed successfully!")

if __name__ == "__main__":
    add_payment_history_fields() 