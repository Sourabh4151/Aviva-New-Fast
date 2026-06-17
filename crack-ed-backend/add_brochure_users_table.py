"""Create brochure_users table for download-brochure lead capture."""

import sqlite3
import os


def add_brochure_users_table():
    db_path = os.path.join(os.path.dirname(__file__), "instance", "users.db")
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS brochure_users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name VARCHAR(120),
            mobile VARCHAR(15) UNIQUE,
            otp VARCHAR(6),
            otp_txn_id VARCHAR(100),
            verified BOOLEAN DEFAULT 0,
            utm_source VARCHAR(100),
            utm_medium VARCHAR(100),
            utm_campaign VARCHAR(100)
        )
        """
    )
    conn.commit()
    conn.close()
    print("brochure_users table migration completed.")


if __name__ == "__main__":
    add_brochure_users_table()
