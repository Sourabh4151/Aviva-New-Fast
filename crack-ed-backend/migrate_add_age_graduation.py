import os
import sqlite3


def add_age_graduation_columns():
    """Add age and graduation_year columns to callback_users."""
    db_path = os.path.join(os.path.dirname(__file__), "instance", "users.db")

    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        cursor.execute("PRAGMA table_info(callback_users)")
        columns = {column[1] for column in cursor.fetchall()}

        if "age" not in columns:
            cursor.execute("ALTER TABLE callback_users ADD COLUMN age VARCHAR(10)")
            print("Added age column to callback_users")
        else:
            print("age column already exists on callback_users")

        if "graduation_year" not in columns:
            cursor.execute("ALTER TABLE callback_users ADD COLUMN graduation_year VARCHAR(20)")
            print("Added graduation_year column to callback_users")
        else:
            print("graduation_year column already exists on callback_users")

        conn.commit()
        print("Age and graduation_year migration completed for callback_users.")
    except Exception as e:
        print(f"Error adding columns: {e}")
        conn.rollback()
    finally:
        conn.close()


if __name__ == "__main__":
    add_age_graduation_columns()
