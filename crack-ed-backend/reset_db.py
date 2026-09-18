from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import os

# Create Flask app
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)

# Import models after db initialization
from models import User, Application, CallBackUsers

def reset_database():
    with app.app_context():
        # Drop all tables
        db.drop_all()
        
        # Create all tables
        db.create_all()
        
        # Verify the database is empty
        user_count = User.query.count()
        print(f"Total users in database: {user_count}")
        
        if user_count > 0:
            print("Users in database:")
            for user in User.query.all():
                print(f"Mobile: {user.mobile}, Verified: {user.verified}")

if __name__ == "__main__":
    # Delete the database file if it exists
    db_path = os.path.join('instance', 'users.db')
    if os.path.exists(db_path):
        os.remove(db_path)
        print(f"Deleted existing database at {db_path}")
    
    # Reset the database
    reset_database()
    print("Database has been reset successfully!") 