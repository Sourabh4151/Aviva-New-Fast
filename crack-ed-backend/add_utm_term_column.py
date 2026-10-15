import sqlite3
import os


def add_utm_term_column():
    """Add utm_term column to user, callback_users, and brochure_users tables."""
    db_path = os.path.join(os.path.dirname(__file__), "instance", "users.db")

    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    tables = ("user", "callback_users", "brochure_users")

    try:
        for table in tables:
            cursor.execute(f"PRAGMA table_info({table})")
            columns = [column[1] for column in cursor.fetchall()]
            if "utm_term" not in columns:
                cursor.execute(f"ALTER TABLE {table} ADD COLUMN utm_term VARCHAR(100)")
                print(f"Added utm_term column to {table}")
            else:
                print(f"utm_term column already exists on {table}")

        conn.commit()
        print("utm_term migration completed successfully!")
    except Exception as e:
        print(f"Error adding utm_term column: {e}")
        conn.rollback()
    finally:
        conn.close()


if __name__ == "__main__":
    add_utm_term_column()
