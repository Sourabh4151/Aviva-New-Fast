"""Remove payment-related columns and PaymentHistory table

Revision ID: remove_payments_20260221
Revises: 9f1ddd1ac448
Create Date: 2026-02-21 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'remove_payments_20260221'
down_revision = '9f1ddd1ac448'
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    table_names = inspector.get_table_names()

    # Drop payment_history table if it exists
    if 'payment_history' in table_names:
        op.drop_table('payment_history')

    # Columns we want to remove from application table (if present)
    cols_to_drop = [
        'razorpay_order_id',
        'razorpay_payment_id',
        'razorpay_payment_status',
        'razorpay_payment_amount',
        'razorpay_payment_method',
        'razorpay_payment_timestamp',
        'total_amount_paid',
        'approved_loan_amount',
        'cheque_cash_payment_mode',
        'payment_timestamp',
        'payment_comment',
        'cheque_cash_payemnt_amount',
    ]

    if 'application' in table_names:
        existing_cols = [c['name'] for c in inspector.get_columns('application')]
        with op.batch_alter_table('application') as batch_op:
            for c in cols_to_drop:
                if c in existing_cols:
                    batch_op.drop_column(c)


def downgrade():
    # Recreate dropped columns and table (best-effort)
    # Add columns back to application table
    with op.batch_alter_table('application') as batch_op:
        batch_op.add_column(sa.Column('razorpay_order_id', sa.String(length=100), nullable=True))
        batch_op.add_column(sa.Column('razorpay_payment_id', sa.String(length=100), nullable=True))
        batch_op.add_column(sa.Column('razorpay_payment_status', sa.String(length=50), nullable=True))
        batch_op.add_column(sa.Column('razorpay_payment_amount', sa.Float(), nullable=True))
        batch_op.add_column(sa.Column('razorpay_payment_method', sa.String(length=50), nullable=True))
        batch_op.add_column(sa.Column('razorpay_payment_timestamp', sa.DateTime(), nullable=True))
        batch_op.add_column(sa.Column('total_amount_paid', sa.Float(), nullable=True))
        batch_op.add_column(sa.Column('approved_loan_amount', sa.Float(), nullable=True))
        batch_op.add_column(sa.Column('cheque_cash_payment_mode', sa.String(length=50), nullable=True))
        batch_op.add_column(sa.Column('payment_timestamp', sa.DateTime(), nullable=True))
        batch_op.add_column(sa.Column('payment_comment', sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column('cheque_cash_payemnt_amount', sa.Float(), nullable=True))

    # Recreate payment_history table
    op.create_table(
        'payment_history',
        sa.Column('id', sa.Integer, primary_key=True, autoincrement=True),
        sa.Column('application_id', sa.String(length=20), nullable=False),
        sa.Column('razorpay_order_id', sa.String(length=100), nullable=True),
        sa.Column('razorpay_payment_id', sa.String(length=100), nullable=True),
        sa.Column('razorpay_payment_status', sa.String(length=50), nullable=True),
        sa.Column('razorpay_payment_amount', sa.Float(), nullable=True),
        sa.Column('razorpay_payment_method', sa.String(length=50), nullable=True),
        sa.Column('razorpay_payment_timestamp', sa.DateTime(), nullable=True),
        sa.Column('payment_type', sa.String(length=50), nullable=True),
        sa.Column('installment_number', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=True),
        sa.Column('total_amount_paid', sa.Float(), nullable=True),
    )

