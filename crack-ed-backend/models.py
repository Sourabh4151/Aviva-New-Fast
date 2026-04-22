from extensions import db


class CallBackUsers(db.Model):
    __tablename__ = "callback_users"
    id = db.Column(db.Integer, primary_key=True)
    fname = db.Column(db.String(120))
    lname = db.Column(db.String(120))
    city = db.Column(db.String(120))
    email = db.Column(db.String(120), unique=True)
    mobile = db.Column(db.String(15), unique=True)
    otp = db.Column(db.String(6))
    otp_txn_id = db.Column(db.String(100))
    verified = db.Column(db.Boolean, default=False)
    utm_source = db.Column(db.String(100))
    utm_medium = db.Column(db.String(100))
    utm_campaign = db.Column(db.String(100))
