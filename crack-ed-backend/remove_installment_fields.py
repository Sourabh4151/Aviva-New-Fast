import sqlite3
import os

def remove_installment_fields():
    # Connect to the database
    db_path = 'instance/users.db'
    if not os.path.exists(db_path):
        print(f"Database file not found at {db_path}")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # List of columns to remove
    columns_to_remove = [
        'registration_fee_paid',
        'registration_fee_amount', 
        'registration_fee_payment_id',
        'registration_fee_payment_timestamp',
        'first_installment_paid',
        'first_installment_amount',
        'first_installment_payment_id',
        'first_installment_payment_timestamp',
        'second_installment_paid',
        'second_installment_amount',
        'second_installment_payment_id',
        'second_installment_payment_timestamp'
    ]
    
    # Get current table schema
    cursor.execute("PRAGMA table_info(application)")
    current_columns = [row[1] for row in cursor.fetchall()]
    
    # Create new table without the columns to remove
    cursor.execute("PRAGMA table_info(application)")
    columns_info = cursor.fetchall()
    
    # Filter out columns to remove
    new_columns = []
    for col in columns_info:
        if col[1] not in columns_to_remove:
            new_columns.append(col)
    
    # Create new table schema
    create_sql = "CREATE TABLE application_new ("
    for i, col in enumerate(new_columns):
        if i > 0:
            create_sql += ", "
        create_sql += f"{col[1]} {col[2]}"
        if col[3]:  # NOT NULL
            create_sql += " NOT NULL"
        if col[4]:  # DEFAULT
            create_sql += f" DEFAULT {col[4]}"
        if col[5]:  # PRIMARY KEY
            create_sql += " PRIMARY KEY"
    create_sql += ")"
    
    print("Creating new table schema...")
    cursor.execute(create_sql)
    
    # Copy data from old table to new table
    print("Copying data to new table...")
    select_columns = [col[1] for col in new_columns]
    select_sql = f"SELECT {', '.join(select_columns)} FROM application"
    cursor.execute(select_sql)
    
    insert_sql = f"INSERT INTO application_new ({', '.join(select_columns)}) VALUES ({', '.join(['?' for _ in select_columns])})"
    cursor.executemany(insert_sql, cursor.fetchall())
    
    # Drop old table and rename new table
    print("Replacing old table...")
    cursor.execute("DROP TABLE application")
    cursor.execute("ALTER TABLE application_new RENAME TO application")
    
    # Commit changes and close connection
    conn.commit()
    conn.close()
    print("Migration completed successfully!")
    print(f"Removed {len(columns_to_remove)} columns: {', '.join(columns_to_remove)}")

if __name__ == "__main__":
    remove_installment_fields() 