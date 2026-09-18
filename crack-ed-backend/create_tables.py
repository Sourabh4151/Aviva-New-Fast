from main import app, db
from models import User, Application, CallBackUsers, AdminUser, PaymentHistory

with app.app_context():
    db.create_all()
    print("✅ All database tables created successfully!")
    
    # Check what tables were created
    from sqlalchemy import inspect
    inspector = inspect(db.engine)
    tables = inspector.get_table_names()
    print(f"📋 Created tables: {tables}") 