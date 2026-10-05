import os
import sqlite3

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), 'instance/users.db'))
UPLOADS_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), 'uploads'))

file_fields = [
    'applicant1_pan', 'applicant1_aadhar_front', 'applicant1_aadhar_back', 'applicant1_bank_statement', 'applicant1_salary_slip',
    'applicant2_pan', 'applicant2_aadhar_front', 'applicant2_aadhar_back', 'applicant2_bank_statement', 'applicant2_salary_slip',
    'applicant3_pan', 'applicant3_aadhar_front', 'applicant3_aadhar_back', 'applicant3_bank_statement', 'applicant3_salary_slip',
]

def main():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT application_id, " + ", ".join(file_fields) + " FROM loan_application")
    rows = c.fetchall()
    missing = []
    total = 0
    for row in rows:
        application_id = row[0]
        for idx, field in enumerate(file_fields):
            file_path = row[1 + idx]
            if not file_path:
                continue
            total += 1
            abs_path = os.path.join(UPLOADS_ROOT, os.path.relpath(file_path, 'uploads'))
            if not os.path.exists(abs_path):
                missing.append((application_id, field, file_path, abs_path))
    print(f"Checked {total} files. Missing: {len(missing)}")
    for app_id, field, db_path, abs_path in missing:
        print(f"MISSING: application_id={app_id}, field={field}, db_path={db_path}, expected_path={abs_path}")
    if not missing:
        print("All files referenced in the DB exist on disk.")

if __name__ == "__main__":
    main() 