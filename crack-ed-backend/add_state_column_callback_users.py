import os
import sqlite3


def add_state_column_to_callback_users():
    """Add state column to the callback_users table."""
    db_path = os.path.join(os.path.dirname(__file__), "instance", "users.db")

    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        cursor.execute("PRAGMA table_info(callback_users)")
        columns = [column[1] for column in cursor.fetchall()]

        if "state" not in columns:
            cursor.execute("ALTER TABLE callback_users ADD COLUMN state VARCHAR(120)")
            print("Added state column to callback_users")

        conn.commit()
        print("State column migration completed for callback_users.")
    except Exception as e:
        print(f"Error adding state column: {e}")
        conn.rollback()
    finally:
        conn.close()


if __name__ == "__main__":
    add_state_column_to_callback_users()
