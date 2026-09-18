import sqlite3

conn = sqlite3.connect('instance/users.db')  # adjust path if needed
cursor = conn.cursor()

# Remove per-installment payment columns if they exist
columns_to_drop = [
    'registration_fee_paid', 'registration_fee_paid_amount', 'registration_fee_payment_id', 'registration_fee_payment_timestamp',
    'first_installment_paid', 'first_installment_paid_amount', 'first_installment_payment_id', 'first_installment_payment_timestamp',
    'second_installment_paid', 'second_installment_paid_amount', 'second_installment_payment_id', 'second_installment_payment_timestamp'
]

for col in columns_to_drop:
    try:
        cursor.execute(f"ALTER TABLE application DROP COLUMN {col};")
        print(f"Dropped column: {col}")
    except Exception as e:
        print(f"{col}: {e}")

conn.commit()
conn.close()
print("Per-installment payment fields removed. Migration complete.")