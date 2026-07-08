from datetime import datetime

from extensions import db

REFERRAL_STATUS_IN_PROCESS = "In Process"
REFERRAL_STATUS_ENROLLED = "Enrolled"


class Referral(db.Model):
    __tablename__ = "referrals"
    id = db.Column(db.Integer, primary_key=True)
    referrer_name = db.Column(db.String(120), nullable=False)
    referrer_mobile = db.Column(db.String(15), nullable=False, index=True)
    referred_candidate_mobile = db.Column(db.String(15), nullable=False, unique=True, index=True)
    status = db.Column(db.String(50), nullable=False, default=REFERRAL_STATUS_IN_PROCESS)
    enrollment_date = db.Column(db.Date, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "referrer_name": self.referrer_name,
            "referrer_mobile": self.referrer_mobile,
            "referred_candidate_mobile": self.referred_candidate_mobile,
            "status": self.status,
            "enrollment_date": self.enrollment_date.isoformat() if self.enrollment_date else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class CallBackUsers(db.Model):
    __tablename__ = "callback_users"
    id = db.Column(db.Integer, primary_key=True)
    fname = db.Column(db.String(120))
    lname = db.Column(db.String(120))
    state = db.Column(db.String(120))
    city = db.Column(db.String(120))
    email = db.Column(db.String(120), unique=True)
    mobile = db.Column(db.String(15), unique=True)
    otp = db.Column(db.String(6))
    otp_txn_id = db.Column(db.String(100))
    verified = db.Column(db.Boolean, default=False)
    age = db.Column(db.String(10))
    graduation_year = db.Column(db.String(20))
    utm_source = db.Column(db.String(100))
    utm_medium = db.Column(db.String(100))
    utm_campaign = db.Column(db.String(100))
