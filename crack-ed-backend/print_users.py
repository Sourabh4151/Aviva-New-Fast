from flask import Flask
from extensions import db
from models import User
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():
    users = User.query.all()
    print(f"Total users: {len(users)}")
    for user in users:
        print(f"Mobile: {user.mobile}, Verified: {user.verified}, Name: {user.name}, Email: {user.email}") 