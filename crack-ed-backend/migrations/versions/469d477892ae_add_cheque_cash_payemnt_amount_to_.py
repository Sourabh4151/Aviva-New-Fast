"""add cheque_cash_payemnt_amount to Application

Revision ID: 469d477892ae
Revises: cdd356f17829
Create Date: 2025-06-26 14:51:11.347588

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '469d477892ae'
down_revision = 'cdd356f17829'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('application', sa.Column('cheque_cash_payemnt_amount', sa.Float(), server_default='0.0'))


def downgrade():
    op.drop_column('application', 'cheque_cash_payemnt_amount')
