"""migrate old loan_application files to subfolders and update DB paths

Revision ID: cdd356f17829
Revises: 665fbef68556
Create Date: 2025-06-26 12:05:10.777122

"""
from alembic import op
import sqlalchemy as sa
import os
import shutil
import sqlite3
from sqlalchemy.sql import text


# revision identifiers, used by Alembic.
revision = 'cdd356f17829'
down_revision = '665fbef68556'
branch_labels = None
depends_on = None


def upgrade():
    # Path setup
    BASE_UPLOAD = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../uploads'))
    DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../instance/users.db'))
    print('DEBUG: Using DB_PATH:', DB_PATH)

    # Connect to DB
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    # List of file fields to check
    file_fields = [
        'applicant1_pan', 'applicant1_aadhar_front', 'applicant1_aadhar_back', 'applicant1_bank_statement', 'applicant1_salary_slip',
        'applicant2_pan', 'applicant2_aadhar_front', 'applicant2_aadhar_back', 'applicant2_bank_statement', 'applicant2_salary_slip',
        'applicant3_pan', 'applicant3_aadhar_front', 'applicant3_aadhar_back', 'applicant3_bank_statement', 'applicant3_salary_slip',
    ]

    c.execute("SELECT application_id, " + ", ".join(file_fields) + " FROM loan_application")
    rows = c.fetchall()
    for row in rows:
        application_id = row[0]
        # Find user_id by searching uploads/*/<application_id>/loan_application
        user_id = None
        uploads_root = os.path.join(BASE_UPLOAD)
        for candidate_user_id in os.listdir(uploads_root):
            app_dir = os.path.join(uploads_root, candidate_user_id, str(application_id), 'loan_application')
            if os.path.isdir(app_dir):
                user_id = candidate_user_id
                break
        if not user_id:
            continue  # skip if not found
        for idx, field in enumerate(file_fields):
            file_path = row[1 + idx]
            if not file_path:
                continue
            if '/applicant' in file_path:
                continue
            if 'applicant1_' in field:
                applicant_folder = 'applicant1'
            elif 'applicant2_' in field:
                applicant_folder = 'applicant2'
            elif 'applicant3_' in field:
                applicant_folder = 'applicant3'
            else:
                continue
            old_abs = os.path.join(uploads_root, user_id, str(application_id), 'loan_application', os.path.basename(file_path))
            new_rel = f"uploads/{user_id}/{application_id}/loan_application/{applicant_folder}/" + os.path.basename(file_path)
            new_abs = os.path.join(uploads_root, user_id, str(application_id), 'loan_application', applicant_folder, os.path.basename(file_path))
            if os.path.exists(old_abs):
                os.makedirs(os.path.dirname(new_abs), exist_ok=True)
                shutil.move(old_abs, new_abs)
                c.execute(f"UPDATE loan_application SET {field} = ? WHERE application_id = ?", (new_rel, application_id))
    conn.commit()
    conn.close()


def downgrade():
    pass
