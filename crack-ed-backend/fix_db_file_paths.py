import os
import sqlite3

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), 'instance/users.db'))
UPLOADS_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), 'uploads'))

file_fields = [
    'applicant1_pan', 'applicant1_aadhar_front', 'applicant1_aadhar_back', 'applicant1_bank_statement', 'applicant1_salary_slip',
    'applicant2_pan', 'applicant2_aadhar_front', 'applicant2_aadhar_back', 'applicant2_bank_statement', 'applicant2_salary_slip',
    'applicant3_pan', 'applicant3_aadhar_front', 'applicant3_aadhar_back', 'applicant3_bank_statement', 'applicant3_salary_slip',
]

def get_applicant_folder(field):
    if field.startswith('applicant1_'):
        return 'applicant1'
    if field.startswith('applicant2_'):
        return 'applicant2'
    if field.startswith('applicant3_'):
        return 'applicant3'
    return None

def main():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT application_id, " + ", ".join(file_fields) + " FROM loan_application")
    rows = c.fetchall()
    updates = []
    for row in rows:
        application_id = row[0]
        for idx, field in enumerate(file_fields):
            file_path = row[1 + idx]
            if not file_path:
                continue
            # If already has applicantX/ in path, skip
            if '/loan_application/applicant' in file_path:
                continue
            applicant_folder = get_applicant_folder(field)
            if not applicant_folder:
                continue
            # Insert applicantX/ into the path
            parts = file_path.split('/loan_application/')
            if len(parts) != 2:
                continue
            new_path = f"{parts[0]}/loan_application/{applicant_folder}/{parts[1]}"
            abs_path = os.path.join(UPLOADS_ROOT, os.path.relpath(new_path, 'uploads'))
            if os.path.exists(abs_path):
                c.execute(f"UPDATE loan_application SET {field} = ? WHERE application_id = ?", (new_path, application_id))
                updates.append((application_id, field, file_path, new_path))
    conn.commit()
    print(f"Updated {len(updates)} file paths.")
    for app_id, field, old, new in updates:
        print(f"UPDATED: application_id={app_id}, field={field}, old={old}, new={new}")
    if not updates:
        print("No paths needed updating.")
    conn.close()

if __name__ == "__main__":
    main() 