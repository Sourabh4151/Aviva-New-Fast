import os
import sqlite3


def remove_callback_email_unique():
    """Rebuild callback_users so email is no longer unique (mobile stays unique)."""
    db_path = os.path.join(os.path.dirname(__file__), "instance", "users.db")

    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        cursor.execute("SELECT sql FROM sqlite_master WHERE name='callback_users'")
        row = cursor.fetchone()
        if not row:
            print("callback_users table not found")
            return

        create_sql = row[0] or ""
        if "UNIQUE (email)" not in create_sql:
            print("Email unique constraint already removed on callback_users")
            return

        cursor.execute("PRAGMA table_info(callback_users)")
        columns = [col[1] for col in cursor.fetchall()]

        cursor.execute(
            """
            CREATE TABLE callback_users_new (
                id INTEGER NOT NULL,
                fname VARCHAR(120),
                lname VARCHAR(120),
                state VARCHAR(120),
                city VARCHAR(120),
                email VARCHAR(120),
                mobile VARCHAR(15),
                otp VARCHAR(6),
                otp_txn_id VARCHAR(100),
                verified BOOLEAN,
                utm_source VARCHAR(100),
                utm_medium VARCHAR(100),
                utm_campaign VARCHAR(100),
                utm_term VARCHAR(100),
                PRIMARY KEY (id),
                UNIQUE (mobile)
            )
            """
        )

        col_list = ", ".join(columns)
        cursor.execute(
            f"INSERT INTO callback_users_new ({col_list}) SELECT {col_list} FROM callback_users"
        )
        cursor.execute("DROP TABLE callback_users")
        cursor.execute("ALTER TABLE callback_users_new RENAME TO callback_users")

        conn.commit()
        print("Removed unique constraint on callback_users.email successfully!")
    except Exception as e:
        print(f"Error removing email unique constraint: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()


if __name__ == "__main__":
    remove_callback_email_unique()
