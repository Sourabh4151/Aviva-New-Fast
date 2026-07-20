import sqlite3

conn = sqlite3.connect('instance/users.db')
cursor = conn.cursor()

# Add new payment tracking columns if they don't exist
try:
    cursor.execute("ALTER TABLE application ADD COLUMN registration_fee_paid BOOLEAN DEFAULT 0;")
    print("Added registration_fee_paid column")
except Exception as e:
    print("registration_fee_paid:", e)

try:
    cursor.execute("ALTER TABLE application ADD COLUMN registration_fee_amount REAL DEFAULT 500.0;")
    print("Added registration_fee_amount column")
except Exception as e:
    print("registration_fee_amount:", e)

try:
    cursor.execute("ALTER TABLE application ADD COLUMN registration_fee_payment_id TEXT;")
    print("Added registration_fee_payment_id column")
except Exception as e:
    print("registration_fee_payment_id:", e)

try:
    cursor.execute("ALTER TABLE application ADD COLUMN registration_fee_payment_timestamp DATETIME;")
    print("Added registration_fee_payment_timestamp column")
except Exception as e:
    print("registration_fee_payment_timestamp:", e)

try:
    cursor.execute("ALTER TABLE application ADD COLUMN first_installment_paid BOOLEAN DEFAULT 0;")
    print("Added first_installment_paid column")
except Exception as e:
    print("first_installment_paid:", e)

try:
    cursor.execute("ALTER TABLE application ADD COLUMN first_installment_amount REAL DEFAULT 1000.0;")
    print("Added first_installment_amount column")
except Exception as e:
    print("first_installment_amount:", e)

try:
    cursor.execute("ALTER TABLE application ADD COLUMN first_installment_payment_id TEXT;")
    print("Added first_installment_payment_id column")
except Exception as e:
    print("first_installment_payment_id:", e)

try:
    cursor.execute("ALTER TABLE application ADD COLUMN first_installment_payment_timestamp DATETIME;")
    print("Added first_installment_payment_timestamp column")
except Exception as e:
    print("first_installment_payment_timestamp:", e)

try:
    cursor.execute("ALTER TABLE application ADD COLUMN second_installment_paid BOOLEAN DEFAULT 0;")
    print("Added second_installment_paid column")
except Exception as e:
    print("second_installment_paid:", e)

try:
    cursor.execute("ALTER TABLE application ADD COLUMN second_installment_amount REAL DEFAULT 1500.0;")
    print("Added second_installment_amount column")
except Exception as e:
    print("second_installment_amount:", e)

try:
    cursor.execute("ALTER TABLE application ADD COLUMN second_installment_payment_id TEXT;")
    print("Added second_installment_payment_id column")
except Exception as e:
    print("second_installment_payment_id:", e)

try:
    cursor.execute("ALTER TABLE application ADD COLUMN second_installment_payment_timestamp DATETIME;")
    print("Added second_installment_payment_timestamp column")
except Exception as e:
    print("second_installment_payment_timestamp:", e)

conn.commit()
conn.close()
print("Payment fields migration complete.") 