import os
import re
import sqlite3


def _email_has_unique_constraint(cursor):
    cursor.execute("PRAGMA index_list(callback_users)")
    for idx in cursor.fetchall():
        if not idx[2]:
            continue
        cursor.execute(f"PRAGMA index_info({idx[1]})")
        col_names = [col[2] for col in cursor.fetchall()]
        if col_names == ["email"]:
            return True

    cursor.execute(
        "SELECT sql FROM sqlite_master WHERE type='table' AND name='callback_users'"
    )
    row = cursor.fetchone()
    if not row or not row[0]:
        return False

    create_sql = row[0]
    for column_def in re.findall(r'"?(\w+)"?\s+[^,)(]+', create_sql):
        if column_def.lower() == "email" and re.search(
            r'"?email"?\s+[^,)]*\bUNIQUE\b', create_sql, re.IGNORECASE
        ):
            return True
    return False


def _build_column_definition(name, col_type, notnull, dflt_value, pk):
    col_type = col_type or "VARCHAR(120)"

    if pk:
        return f"{name} INTEGER PRIMARY KEY"

    definition = f"{name} {col_type}"
    if name == "mobile":
        definition += " UNIQUE"
    if notnull and not pk:
        definition += " NOT NULL"
    if dflt_value is not None:
        definition += f" DEFAULT {dflt_value}"
    return definition


def remove_email_unique_constraint():
    """Rebuild callback_users without a unique constraint on email."""
    db_path = os.path.join(os.path.dirname(__file__), "instance", "users.db")

    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        cursor.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='callback_users'"
        )
        if not cursor.fetchone():
            print("callback_users table not found; nothing to migrate.")
            return

        if not _email_has_unique_constraint(cursor):
            print("Email uniqueness constraint not found on callback_users; nothing to do.")
            return

        cursor.execute("PRAGMA table_info(callback_users)")
        columns = cursor.fetchall()
        column_names = [col[1] for col in columns]
        column_defs = [
            _build_column_definition(name, col_type, notnull, dflt_value, pk)
            for _, name, col_type, notnull, dflt_value, pk in columns
        ]
        quoted_columns = ", ".join(column_names)
        create_sql = (
            "CREATE TABLE callback_users_new ("
            + ", ".join(column_defs)
            + ")"
        )

        cursor.execute("BEGIN")
        cursor.execute(create_sql)
        cursor.execute(
            f"INSERT INTO callback_users_new ({quoted_columns}) "
            f"SELECT {quoted_columns} FROM callback_users"
        )
        cursor.execute("DROP TABLE callback_users")
        cursor.execute("ALTER TABLE callback_users_new RENAME TO callback_users")
        conn.commit()
        print("Removed email uniqueness constraint from callback_users.")
    except Exception as e:
        print(f"Error removing email uniqueness constraint: {e}")
        conn.rollback()
    finally:
        conn.close()


if __name__ == "__main__":
    remove_email_unique_constraint()
