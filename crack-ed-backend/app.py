from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from models import User,Application,CallBackUsers
from extensions import db,migrate


def create_app():
    app = Flask(__name__)

    # Configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'  # change as needed
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True


    # Initialize extensions with app

    # Example model
    from models import User,Application,CallBackUsers
    with app.app_context():
        db.init_app(app)
        migrate.init_app(app, db)
        db.create_all()
    return app