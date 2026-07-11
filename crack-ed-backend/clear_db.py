from flask import Flask

from extensions import db
from models import CallBackUsers  # noqa: F401 – imported so SQLAlchemy registers the table

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///users.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)

with app.app_context():
    db.drop_all()
    db.create_all()
    print("Database has been cleared and recreated successfully!")
