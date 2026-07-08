import os
import json
import time
import random
import string
import hashlib
import logging
import traceback
from datetime import date, datetime

import requests
from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
from dotenv import load_dotenv
from sqlalchemy import inspect, text
from sqlalchemy.exc import IntegrityError, OperationalError

from extensions import db
from models import (
    CallBackUsers,
    Referral,
    REFERRAL_STATUS_ENROLLED,
    REFERRAL_STATUS_IN_PROCESS,
)

load_dotenv()

# ---------------------------------------------------------------------------
# App configuration
# ---------------------------------------------------------------------------
app = Flask(__name__)
app.secret_key = 'b7e1c2e4c9a84e2e8f7d4a1b6c3e5f9a2d7c6b8e4f1a2c3d5e6f7b9a1c2d3e4f'

CORS(
    app,
    origins=[
        "http://localhost:5000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization", "X-Admin-Key"],
    methods=["GET", "POST", "OPTIONS"],
)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)


def _ensure_callback_users_schema():
    db.create_all()
    inspector = inspect(db.engine)
    if not inspector.has_table("callback_users"):
        return
    columns = {col["name"] for col in inspector.get_columns("callback_users")}
    migrations = []
    if "state" not in columns:
        migrations.append("ALTER TABLE callback_users ADD COLUMN state VARCHAR(120)")
    if "age" not in columns:
        migrations.append("ALTER TABLE callback_users ADD COLUMN age VARCHAR(10)")
    if "graduation_year" not in columns:
        migrations.append("ALTER TABLE callback_users ADD COLUMN graduation_year VARCHAR(20)")
    if migrations:
        with db.engine.begin() as conn:
            for stmt in migrations:
                conn.execute(text(stmt))


with app.app_context():
    _ensure_callback_users_schema()
    db.create_all()

logging.basicConfig(level=logging.DEBUG)

# ---------------------------------------------------------------------------
# OTP provider (Xecurify / Orange) configuration
# ---------------------------------------------------------------------------
CUSTOMER_KEY = "362405"
ORANGE_API_KEY = "RHFLK7kkQN4fGtNwnXOhvpXreO2hJxx1"
SEND_URL = "https://login.xecurify.com/moas/api/auth/challenge"
VALIDATE_URL = "https://login.xecurify.com/moas/api/auth/validate"


def generate_hash_header():
    timestamp = str(int(time.time() * 1000))
    string_to_hash = CUSTOMER_KEY + timestamp + ORANGE_API_KEY
    hash_value = hashlib.sha512(string_to_hash.encode('utf-8')).hexdigest().lower()
    return {
        "Customer-Key": CUSTOMER_KEY,
        "Timestamp": timestamp,
        "Authorization": hash_value,
        "Content-Type": "application/json",
    }


def generate_otp():
    return ''.join(random.choices(string.digits, k=4))


def send_otp_api(mobile):
    header = generate_hash_header()
    payload = {
        "customerKey": CUSTOMER_KEY,
        "phone": "91" + mobile,
        "authType": "SMS",
    }
    try:
        response = requests.post(SEND_URL, json=payload, headers=header)
        print("Response from OTP API:", response.json())
        return response.json()["txId"]
    except requests.exceptions.RequestException as e:
        print("Error sending OTP:", str(e))
        return None


def verify_otp_api(otp_txn_id, otp):
    header = generate_hash_header()
    payload = {"txId": otp_txn_id, "token": otp}
    try:
        response = requests.post(VALIDATE_URL, json=payload, headers=header)
        print("Response from OTP API:", response.json())
        return response.json()["status"]
    except requests.exceptions.RequestException as e:
        print("Error verifying OTP:", str(e))
        return None


# ---------------------------------------------------------------------------
# CRM integration (Meritto / NoPaperForms)
# ---------------------------------------------------------------------------

NOPAPERFORMS_LEAD_URL = os.getenv(
    "NOPAPERFORMS_LEAD_URL",
    "https://api.nopaperforms.io/lead/v1/createOrUpdate",
)
NOPAPERFORMS_LEAD_GET_URL = os.getenv(
    "NOPAPERFORMS_LEAD_GET_URL",
    "https://api.nopaperforms.io/lead/v1/getDetailsByMobileNumber",
)
REFERRAL_ADMIN_API_KEY = (os.getenv("REFERRAL_ADMIN_API_KEY") or "").strip()
CRM_ENROLLMENT_STAGE = (os.getenv("CRM_ENROLLMENT_STAGE") or "Enrollment").strip().lower()
CRM_ENROLLMENT_SUB_STAGE = (os.getenv("CRM_ENROLLMENT_SUB_STAGE") or "").strip().lower()
CRM_POST_ENROLLMENT_STAGES = {
    s.strip().lower()
    for s in (os.getenv("CRM_POST_ENROLLMENT_STAGES") or "").split(",")
    if s.strip()
}


def _nopaperforms_lead_headers():
    headers = {"Content-Type": "application/json", "Accept": "application/json"}
    access_key = (os.getenv("NOPAPERFORMS_ACCESS_KEY") or "").strip()
    secret_key = (os.getenv("NOPAPERFORMS_SECRET_KEY") or "").strip()
    if access_key:
        headers["access-key"] = access_key
    if secret_key:
        headers["secret-key"] = secret_key
    token = (os.getenv("NOPAPERFORMS_API_TOKEN") or "").strip()
    if token:
        headers["Authorization"] = (
            token if token.lower().startswith("bearer ") else f"Bearer {token}"
        )
    return headers


def _format_mobile_for_nopaperforms(mobile):
    if mobile is None:
        return ""
    s = str(mobile).strip().replace(" ", "")
    digits = "".join(c for c in s if c.isdigit())
    return digits[-10:] if len(digits) >= 10 else digits


def _str_utm(value):
    return "" if value is None else str(value).strip()


def _normalize_graduation_year(value):
    """Return 4-digit graduation year for Meritto (year only, not full date)."""
    raw = (value or "").strip()
    if not raw:
        return ""
    if len(raw) == 4 and raw.isdigit():
        return raw
    if "/" in raw:
        for part in reversed(raw.split("/")):
            if len(part) == 4 and part.isdigit():
                return part
    if "-" in raw:
        parts = raw.split("-")
        if parts and len(parts[0]) == 4 and parts[0].isdigit():
            return parts[0]
        if parts and len(parts[-1]) == 4 and parts[-1].isdigit():
            return parts[-1]
    return ""


def _post_lead_to_nopaperforms(
    *,
    full_name,
    mobile,
    state="",
    city="",
    utm_source="",
    utm_medium="",
    utm_campaign="",
    form_name="Landing Page - Refer & Earn",
):
    state_value = (state or "").strip() or (city or "").strip()
    city_value = (city or "").strip()
    payload = {
        "name": (full_name or "").strip(),
        "mobile": _format_mobile_for_nopaperforms(mobile),
        "state": state_value,
        "search_criteria": "mobile",
        "source": _str_utm(utm_source),
        "medium": _str_utm(utm_medium),
        "campaign": _str_utm(utm_campaign),
        "cf_form_name": form_name,
        "cf_pg_program": "PG Program",
    }
    if city_value and city_value.lower() != state_value.lower():
        payload["city"] = city_value
    try:
        print("Meritto CRM payload:", json.dumps(payload))
    except Exception:
        pass
    return requests.post(
        NOPAPERFORMS_LEAD_URL,
        json=payload,
        headers=_nopaperforms_lead_headers(),
        timeout=(10, 30),
    )


def send_callback_lead_to_crm(user):
    full_name = " ".join(part for part in [user.fname, user.lname] if part).strip()
    state_value = (getattr(user, "state", "") or "").strip()
    city_value = (user.city or "").strip()
    # Legacy rows may have state stored only in `city`.
    if not state_value and city_value:
        state_value = city_value
        city_value = ""
    response = _post_lead_to_nopaperforms(
        full_name=full_name,
        mobile=user.mobile,
        state=state_value,
        city=city_value,
        utm_source=getattr(user, "utm_source", "") or "",
        utm_medium=getattr(user, "utm_medium", "") or "",
        utm_campaign=getattr(user, "utm_campaign", "") or "",
    )
    print("Meritto CRM response:", response.text)
    return response


def _normalize_mobile_10(mobile):
    digits = "".join(c for c in str(mobile or "") if c.isdigit())
    return digits[-10:] if len(digits) >= 10 else digits


def _normalize_stage_name(stage):
    return (stage or "").strip().lower()


def _stage_is_enrolled(stage, sub_stage=""):
    normalized_stage = _normalize_stage_name(stage)
    normalized_sub_stage = _normalize_stage_name(sub_stage)
    if not normalized_stage and not normalized_sub_stage:
        return False
    if normalized_stage == CRM_ENROLLMENT_STAGE:
        return True
    if normalized_stage in CRM_POST_ENROLLMENT_STAGES:
        return True
    if CRM_ENROLLMENT_STAGE and CRM_ENROLLMENT_STAGE in normalized_stage:
        return True
    if CRM_ENROLLMENT_SUB_STAGE and normalized_sub_stage == CRM_ENROLLMENT_SUB_STAGE:
        return True
    if CRM_ENROLLMENT_SUB_STAGE and CRM_ENROLLMENT_SUB_STAGE in normalized_sub_stage:
        return True
    # Common CRM business case: Closed Won + enrollment done-like sub-stage.
    if normalized_stage == "closed won" and (
        "enrol" in normalized_sub_stage
        or "enroll" in normalized_sub_stage
        or "admission" in normalized_sub_stage
    ):
        return True
    return False


def _apply_referral_status_from_crm_stage(referral, stage, sub_stage=""):
    if referral.status == REFERRAL_STATUS_ENROLLED:
        return False
    if _stage_is_enrolled(stage, sub_stage):
        referral.status = REFERRAL_STATUS_ENROLLED
        if referral.enrollment_date is None:
            referral.enrollment_date = date.today()
        referral.updated_at = datetime.utcnow()
        return True
    if referral.status != REFERRAL_STATUS_IN_PROCESS:
        referral.status = REFERRAL_STATUS_IN_PROCESS
        referral.updated_at = datetime.utcnow()
        return True
    return False


def _extract_stage_info_from_crm_payload(payload):
    stage = ""
    sub_stage = ""

    if not isinstance(payload, dict):
        return {"stage": stage, "sub_stage": sub_stage}

    for key in ("lead_stage", "stage", "application_stage", "lead_status", "status"):
        value = payload.get(key)
        if isinstance(value, bool):
            continue
        if isinstance(value, (str, int, float)) and str(value).strip() and not stage:
            stage = str(value)
    for key in (
        "lead_sub_stage",
        "lead sub stage",
        "sub_stage",
        "sub stage",
        "application_sub_stage",
        "stage_sub_status",
    ):
        value = payload.get(key)
        if value and not sub_stage:
            sub_stage = str(value)

    if stage or sub_stage:
        return {"stage": stage, "sub_stage": sub_stage}

    data = payload.get("data")
    if isinstance(data, dict):
        return _extract_stage_info_from_crm_payload(data)
    if isinstance(data, list) and data:
        first = data[0]
        if isinstance(first, dict):
            return _extract_stage_info_from_crm_payload(first)
    details = payload.get("details")
    if isinstance(details, list) and details:
        first = details[0]
        if isinstance(first, dict):
            return _extract_stage_info_from_crm_payload(first)
    return {"stage": stage, "sub_stage": sub_stage}


def _fetch_lead_stage_from_crm(mobile):
    mobile_value = _format_mobile_for_nopaperforms(mobile)
    if not mobile_value:
        return {"stage": "", "sub_stage": ""}
    mobile_int = None
    try:
        mobile_int = int(mobile_value)
    except (TypeError, ValueError):
        mobile_int = None
    if mobile_int is None:
        return {"stage": "", "sub_stage": ""}
    try:
        response = requests.post(
            NOPAPERFORMS_LEAD_GET_URL,
            json={
                "mobile": mobile_int,
                "search_criteria": "mobile",
                "fields": ["lead_stage", "lead_sub_stage", "lead sub stage"],
            },
            headers=_nopaperforms_lead_headers(),
            timeout=(10, 30),
        )
        if not response.ok:
            print("Meritto CRM lead fetch failed:", response.status_code, response.text)
            return {"stage": "", "sub_stage": ""}
        payload = response.json()
        stage_info = _extract_stage_info_from_crm_payload(payload)
        print(
            "Meritto CRM lead stage fetch:",
            {"mobile": mobile_value, "stage": stage_info.get("stage"), "sub_stage": stage_info.get("sub_stage")},
        )
        return stage_info
    except Exception as exc:
        print("Meritto CRM lead fetch error:", exc)
        return {"stage": "", "sub_stage": ""}


def send_referral_candidate_to_crm(
    *,
    candidate_name,
    candidate_mobile,
    candidate_state,
    candidate_city,
    utm_source="",
    utm_medium="",
    utm_campaign="",
):
    return _post_lead_to_nopaperforms(
        full_name=candidate_name,
        mobile=candidate_mobile,
        state=candidate_state,
        city=candidate_city,
        utm_source=utm_source,
        utm_medium=utm_medium,
        utm_campaign=utm_campaign,
    )


def _is_admin_request():
    if not REFERRAL_ADMIN_API_KEY:
        return False
    provided = (request.headers.get("X-Admin-Key") or "").strip()
    query_key = (request.args.get("key") or "").strip()
    return provided == REFERRAL_ADMIN_API_KEY or query_key == REFERRAL_ADMIN_API_KEY


def _cors_preflight_response():
    response = jsonify({})
    origin = request.headers.get("Origin", "http://localhost:5173")
    response.headers.add("Access-Control-Allow-Origin", origin)
    response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Admin-Key")
    response.headers.add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    response.headers.add("Access-Control-Allow-Credentials", "true")
    return response


REFERRALS_ADMIN_HTML = """
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Referral Database</title>
  <style>
    body { font-family: Montserrat, Arial, sans-serif; background: #111; color: #fafafa; margin: 0; padding: 24px; }
    h1 { font-size: 20px; margin-bottom: 16px; }
    .toolbar {
      display: grid;
      grid-template-columns: repeat(3, minmax(180px, 1fr)) auto auto;
      gap: 10px;
      margin-bottom: 14px;
      align-items: end;
    }
    .toolbar-group { display: flex; flex-direction: column; gap: 6px; }
    .toolbar label { font-size: 12px; color: rgba(250,250,250,0.75); }
    .toolbar input {
      height: 36px;
      border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.18);
      background: rgba(255,255,255,0.04);
      color: #fafafa;
      padding: 0 10px;
      outline: none;
    }
    .toolbar input:focus { border-color: #1A9EB7; }
    .toolbar button {
      height: 36px;
      border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.2);
      background: rgba(26,158,183,0.15);
      color: #fafafa;
      cursor: pointer;
      padding: 0 14px;
    }
    .toolbar button:hover { background: rgba(26,158,183,0.26); }
    .sync-button {
      background: rgba(87,190,136,0.18);
      border-color: rgba(87,190,136,0.35);
    }
    .sync-button:hover {
      background: rgba(87,190,136,0.3);
    }
    .sync-button:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }
    .result-meta { margin-bottom: 10px; font-size: 12px; color: rgba(250,250,250,0.75); }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { border: 1px solid rgba(255,255,255,0.12); padding: 10px 12px; text-align: left; }
    th { background: rgba(26,158,183,0.2); color: #1A9EB7; }
    tr:nth-child(even) { background: rgba(255,255,255,0.03); }
    .status-enrolled { color: #57BE88; font-weight: 600; }
    .status-process { color: #FACC15; font-weight: 600; }
    .no-results { text-align: center; color: rgba(250,250,250,0.7); }
    @media (max-width: 980px) {
      .toolbar { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <h1>Referral Database (Read-only)</h1>
  <div class="toolbar">
    <div class="toolbar-group">
      <label for="nameFilter">Referrer Name Filter</label>
      <input id="nameFilter" type="text" placeholder="e.g. Pragya" />
    </div>
    <div class="toolbar-group">
      <label for="mobileFilter">Referrer Mobile Filter</label>
      <input id="mobileFilter" type="text" placeholder="e.g. 8571" />
    </div>
    <div class="toolbar-group">
      <label for="globalSearch">Search (all columns)</label>
      <input id="globalSearch" type="text" placeholder="Name, mobile, status..." />
    </div>
    <button id="syncNowBtn" type="button" class="sync-button">Sync Now</button>
    <button id="resetFilters" type="button">Reset</button>
  </div>
  <div id="resultMeta" class="result-meta"></div>
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Referrer Name</th>
        <th>Referrer Mobile</th>
        <th>Referred Candidate Mobile</th>
        <th>Status</th>
        <th>Enrollment Date</th>
        <th>Submitted At</th>
      </tr>
    </thead>
    <tbody id="referralsTableBody">
      {% for row in referrals %}
      <tr class="ref-row">
        <td>{{ row.id }}</td>
        <td>{{ row.referrer_name }}</td>
        <td>{{ row.referrer_mobile }}</td>
        <td>{{ row.referred_candidate_mobile }}</td>
        <td class="{{ 'status-enrolled' if row.status == 'Enrolled' else 'status-process' }}">{{ row.status }}</td>
        <td>{{ row.enrollment_date or '—' }}</td>
        <td>{{ row.created_at }}</td>
      </tr>
      {% endfor %}
      <tr id="noResultsRow" style="display:none;">
        <td colspan="7" class="no-results">No matching referrals found.</td>
      </tr>
    </tbody>
  </table>
  <script>
    (function() {
      const nameInput = document.getElementById("nameFilter");
      const mobileInput = document.getElementById("mobileFilter");
      const searchInput = document.getElementById("globalSearch");
      const syncNowBtn = document.getElementById("syncNowBtn");
      const resetBtn = document.getElementById("resetFilters");
      const resultMeta = document.getElementById("resultMeta");
      const rows = Array.from(document.querySelectorAll(".ref-row"));
      const noResultsRow = document.getElementById("noResultsRow");

      function normalize(v) {
        return (v || "").toString().trim().toLowerCase();
      }

      function renderMeta(visible, total) {
        resultMeta.textContent = `Showing ${visible} of ${total} referrals`;
      }

      function applyFilters() {
        const nameQuery = normalize(nameInput.value);
        const mobileQuery = normalize(mobileInput.value);
        const globalQuery = normalize(searchInput.value);

        let visibleCount = 0;
        rows.forEach((row) => {
          const cells = row.querySelectorAll("td");
          const referrerName = normalize(cells[1]?.textContent);
          const referrerMobile = normalize(cells[2]?.textContent);
          const fullText = normalize(row.textContent);

          const matchesName = !nameQuery || referrerName.includes(nameQuery);
          const matchesMobile = !mobileQuery || referrerMobile.includes(mobileQuery);
          const matchesGlobal = !globalQuery || fullText.includes(globalQuery);

          const show = matchesName && matchesMobile && matchesGlobal;
          row.style.display = show ? "" : "none";
          if (show) visibleCount += 1;
        });

        noResultsRow.style.display = visibleCount === 0 ? "" : "none";
        renderMeta(visibleCount, rows.length);
      }

      [nameInput, mobileInput, searchInput].forEach((el) => {
        el.addEventListener("input", applyFilters);
      });

      resetBtn.addEventListener("click", () => {
        nameInput.value = "";
        mobileInput.value = "";
        searchInput.value = "";
        applyFilters();
      });

      syncNowBtn.addEventListener("click", async () => {
        const params = new URLSearchParams(window.location.search);
        const key = params.get("key") || "";
        if (!key) {
          alert("Missing admin key in URL. Please open page with ?key=...");
          return;
        }
        syncNowBtn.disabled = true;
        syncNowBtn.textContent = "Syncing...";
        try {
          const response = await fetch(`/auth/referral/sync/?key=${encodeURIComponent(key)}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin"
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            throw new Error(data.error || "Sync failed");
          }
          const updated = typeof data.updated === "number" ? data.updated : "some";
          alert(`Sync completed. Updated: ${updated}`);
          window.location.reload();
        } catch (err) {
          alert(`Sync failed: ${err && err.message ? err.message : "Unknown error"}`);
        } finally {
          syncNowBtn.disabled = false;
          syncNowBtn.textContent = "Sync Now";
        }
      });

      applyFilters();
    })();
  </script>
</body>
</html>
"""


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.route("/")
def helloworld():
    return "Hello Crack-ED!"


@app.route('/api/auth/callbackOtp/', methods=['POST', 'OPTIONS'])
@app.route('/auth/callbackOtp/', methods=['POST', 'OPTIONS'])
def send_callback_otp():
    if request.method == 'OPTIONS':
        response = jsonify({})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response

    data = request.get_json() or {}
    print("Callback OTP request:", data)

    mobile = data.get("mobile")
    if not mobile:
        return jsonify({"error": "Mobile number is required"}), 400

    age_raw = str(data.get("age") or "").strip()
    if not age_raw:
        return jsonify({"error": "Age is required"}), 400
    try:
        age_num = int(age_raw)
    except ValueError:
        return jsonify({"error": "Invalid age"}), 400
    if age_num > 30:
        return jsonify({"error": "Age must be 30 or below to apply"}), 400
    if age_num < 18:
        return jsonify({"error": "Age must be between 18 and 30"}), 400

    graduation_year_value = _normalize_graduation_year(data.get("graduation_year"))
    if not graduation_year_value:
        return jsonify({"error": "Graduation year is required"}), 400
    try:
        graduation_year_num = int(graduation_year_value)
    except ValueError:
        return jsonify({"error": "Invalid graduation year"}), 400
    current_year = time.localtime().tm_year
    if graduation_year_num < 1990 or graduation_year_num > current_year:
        return jsonify({"error": f"Graduation year must be between 1990 and {current_year}"}), 400

    otp = generate_otp()
    name_parts = (data.get('name') or "").split()
    first_name = name_parts[0] if name_parts else ""
    last_name = name_parts[-1] if len(name_parts) > 1 else ""
    state_value = (data.get("state") or "").strip()
    city_value = (data.get("city") or "").strip()
    # Backward compat when only one location field is sent.
    if not state_value and city_value:
        state_value = city_value
        city_value = ""

    age_value = str(data.get("age") or "").strip()

    def _apply_location_fields(target):
        try:
            target.state = state_value
            target.city = city_value
        except AttributeError:
            target.city = state_value or city_value

    def _apply_profile_fields(target):
        try:
            target.age = age_value
            target.graduation_year = graduation_year_value
        except AttributeError:
            pass

    try:
        utm_source = data.get("utm_source", "") or ""
        utm_medium = data.get("utm_medium", "") or ""
        utm_campaign = data.get("utm_campaign", "") or ""

        incoming_email = (data.get("email") or "").strip()
        existing_user = CallBackUsers.query.filter_by(mobile=mobile).first()
        if not existing_user and incoming_email:
            existing_user = CallBackUsers.query.filter_by(email=incoming_email).first()

        if existing_user:
            user = existing_user
            if user.verified:
                return jsonify({
                    "message": "Thanks! Your callback request is already in our system. We'll connect with you soon!"
                }), 200
            user.otp = otp
            user.fname = first_name
            user.lname = last_name
            user.email = incoming_email
            user.mobile = mobile
            _apply_location_fields(user)
            _apply_profile_fields(user)
            try:
                if utm_source:
                    user.utm_source = utm_source
                if utm_medium:
                    user.utm_medium = utm_medium
                if utm_campaign:
                    user.utm_campaign = utm_campaign
            except AttributeError:
                print("Warning: UTM columns not found. Run a migration to add them.")
        else:
            user = CallBackUsers(
                fname=first_name,
                lname=last_name,
                email=incoming_email,
                mobile=mobile,
                otp=otp,
            )
            _apply_location_fields(user)
            _apply_profile_fields(user)
            try:
                if utm_source:
                    user.utm_source = utm_source
                if utm_medium:
                    user.utm_medium = utm_medium
                if utm_campaign:
                    user.utm_campaign = utm_campaign
            except AttributeError:
                print("Warning: UTM columns not found on model. Run a migration.")
            db.session.add(user)

        user.otp_txn_id = send_otp_api(user.mobile)
        if user.otp_txn_id is None:
            db.session.rollback()
            return jsonify({"error": "Failed to send OTP"}), 500

        try:
            db.session.commit()
        except (OperationalError, IntegrityError) as db_error:
            error_msg = str(db_error).lower()
            if "no such column" in error_msg and (
                "utm_source" in error_msg
                or "utm_medium" in error_msg
                or "utm_campaign" in error_msg
                or ".state" in error_msg
                or " state" in error_msg
            ):
                print("UTM columns missing from DB; retrying without them.")
                db.session.rollback()
                if existing_user:
                    user = existing_user
                    user.otp = otp
                    user.fname = first_name
                    user.lname = last_name
                    user.email = incoming_email
                    user.mobile = mobile
                    _apply_location_fields(user)
                    _apply_profile_fields(user)
                else:
                    user = CallBackUsers(
                        fname=first_name,
                        lname=last_name,
                        email=incoming_email,
                        mobile=mobile,
                        otp=otp,
                    )
                    _apply_location_fields(user)
                    _apply_profile_fields(user)
                    db.session.add(user)
                user.otp_txn_id = send_otp_api(user.mobile)
                if user.otp_txn_id is None:
                    db.session.rollback()
                    return jsonify({"error": "Failed to send OTP"}), 500
                db.session.commit()
            elif "unique constraint failed" in error_msg and "callback_users.email" in error_msg:
                # Email already exists on another row: reuse that row instead of inserting.
                otp_txn_id = user.otp_txn_id
                db.session.rollback()
                email_user = CallBackUsers.query.filter_by(email=incoming_email).first()
                if not email_user:
                    raise
                if email_user.verified:
                    return jsonify({
                        "message": "Thanks! Your callback request is already in our system. We'll connect with you soon!"
                    }), 200
                email_user.otp = otp
                email_user.fname = first_name
                email_user.lname = last_name
                _apply_location_fields(email_user)
                _apply_profile_fields(email_user)
                email_user.mobile = mobile
                email_user.otp_txn_id = otp_txn_id
                if not email_user.otp_txn_id:
                    email_user.otp_txn_id = send_otp_api(mobile)
                    if email_user.otp_txn_id is None:
                        db.session.rollback()
                        return jsonify({"error": "Failed to send OTP"}), 500
                try:
                    if utm_source:
                        email_user.utm_source = utm_source
                    if utm_medium:
                        email_user.utm_medium = utm_medium
                    if utm_campaign:
                        email_user.utm_campaign = utm_campaign
                except AttributeError:
                    print("Warning: UTM columns not found. Run a migration to add them.")
                db.session.commit()
            else:
                raise

        return jsonify({"message": "OTP sent"}), 200

    except Exception as e:
        print("Callback OTP error:", str(e))
        traceback.print_exc()
        db.session.rollback()
        return jsonify({"error": "Internal Server Error"}), 500


@app.route('/auth/callback/', methods=['POST'])
def add_callback_user():
    data = request.get_json() or {}
    print("Callback verify request:", data)

    mobile = data.get('mobile')
    otp = data.get('otp')
    if not mobile or not otp:
        return jsonify({"message": "Mobile number and OTP are required"}), 400

    user = CallBackUsers.query.filter_by(mobile=mobile).first()
    if not user:
        return jsonify({"message": "mobile number not found"}), 400

    status = verify_otp_api(user.otp_txn_id, otp)
    if status != "SUCCESS":
        return jsonify({"message": "Invalid OTP"}), 400

    try:
        send_callback_lead_to_crm(user)
    except Exception as e:
        print("callback CRM send failed:", e)

    user.verified = True
    db.session.commit()
    return jsonify({"message": "We will contact you soon"}), 200


@app.route("/auth/referral/", methods=["POST", "OPTIONS"])
@app.route("/api/auth/referral/", methods=["POST", "OPTIONS"])
def submit_referral():
    if request.method == "OPTIONS":
        return _cors_preflight_response()

    data = request.get_json() or {}
    print("Referral submit request:", data)

    candidate_name = (data.get("candidate_name") or data.get("name") or "").strip()
    candidate_mobile = _normalize_mobile_10(data.get("candidate_mobile") or data.get("mobile"))
    candidate_state = (data.get("candidate_state") or data.get("state") or "").strip()
    candidate_city = (data.get("candidate_city") or data.get("city") or "").strip()
    referrer_name = (data.get("referrer_name") or "").strip()
    referrer_mobile = _normalize_mobile_10(data.get("referrer_mobile"))
    utm_source = data.get("utm_source", "") or ""
    utm_medium = data.get("utm_medium", "") or ""
    utm_campaign = data.get("utm_campaign", "") or ""

    if not candidate_name:
        return jsonify({"error": "Candidate full name is required"}), 400
    if not candidate_mobile or len(candidate_mobile) != 10:
        return jsonify({"error": "Candidate mobile must be 10 digits"}), 400
    if not candidate_state:
        return jsonify({"error": "Candidate state is required"}), 400
    if not candidate_city:
        return jsonify({"error": "Candidate city is required"}), 400
    if not referrer_name:
        return jsonify({"error": "Your name is required"}), 400
    if not referrer_mobile or len(referrer_mobile) != 10:
        return jsonify({"error": "Your mobile must be 10 digits"}), 400
    if candidate_mobile == referrer_mobile:
        return jsonify({"error": "Referrer and candidate mobile numbers must be different"}), 400

    existing = Referral.query.filter_by(referred_candidate_mobile=candidate_mobile).first()
    if existing:
        return jsonify({
            "message": "This candidate has already been referred. Thank you for your support!"
        }), 200

    try:
        crm_response = send_referral_candidate_to_crm(
            candidate_name=candidate_name,
            candidate_mobile=candidate_mobile,
            candidate_state=candidate_state,
            candidate_city=candidate_city,
            utm_source=utm_source,
            utm_medium=utm_medium,
            utm_campaign=utm_campaign,
        )
        print("Referral CRM response:", crm_response.status_code, crm_response.text)
        if not crm_response.ok:
            return jsonify({
                "error": "Failed to submit candidate details to CRM. Please try again."
            }), 502
    except Exception as exc:
        print("Referral CRM send failed:", exc)
        traceback.print_exc()
        return jsonify({"error": "Failed to submit candidate details. Please try again."}), 500

    referral = Referral(
        referrer_name=referrer_name,
        referrer_mobile=referrer_mobile,
        referred_candidate_mobile=candidate_mobile,
        status=REFERRAL_STATUS_IN_PROCESS,
    )
    db.session.add(referral)

    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({
            "message": "This candidate has already been referred. Thank you for your support!"
        }), 200
    except Exception as exc:
        print("Referral DB save failed:", exc)
        traceback.print_exc()
        db.session.rollback()
        return jsonify({"error": "Failed to save referral. Please try again."}), 500

    return jsonify({
        "message": "Thank you! Your referral has been submitted successfully.",
        "referral_id": referral.id,
    }), 200


@app.route("/auth/referral/crm-webhook/", methods=["POST", "OPTIONS"])
@app.route("/api/auth/referral/crm-webhook/", methods=["POST", "OPTIONS"])
def referral_crm_webhook():
    if request.method == "OPTIONS":
        return _cors_preflight_response()

    webhook_secret = (os.getenv("REFERRAL_CRM_WEBHOOK_SECRET") or "").strip()
    if webhook_secret:
        provided = (request.headers.get("X-Webhook-Secret") or "").strip()
        if provided != webhook_secret:
            return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json() or {}
    mobile = _normalize_mobile_10(
        data.get("referred_candidate_mobile") or data.get("mobile") or data.get("candidate_mobile")
    )
    stage = (
        data.get("stage")
        or data.get("lead_stage")
        or data.get("application_stage")
        or data.get("status")
        or ""
    )
    sub_stage = (
        data.get("lead_sub_stage")
        or data.get("lead sub stage")
        or data.get("sub_stage")
        or data.get("sub stage")
        or ""
    )
    if not mobile:
        return jsonify({"error": "Candidate mobile is required"}), 400

    referral = Referral.query.filter_by(referred_candidate_mobile=mobile).first()
    if not referral:
        return jsonify({"message": "No matching referral found"}), 404

    _apply_referral_status_from_crm_stage(referral, stage, sub_stage)
    db.session.commit()
    return jsonify({"message": "Referral status updated", "referral": referral.to_dict()}), 200


@app.route("/auth/referral/sync/", methods=["POST", "OPTIONS"])
@app.route("/api/auth/referral/sync/", methods=["POST", "OPTIONS"])
def sync_referral_statuses():
    if request.method == "OPTIONS":
        return _cors_preflight_response()
    if not _is_admin_request():
        return jsonify({"error": "Unauthorized"}), 401

    updated = 0
    referrals = Referral.query.filter_by(status=REFERRAL_STATUS_IN_PROCESS).all()
    for referral in referrals:
        stage_info = _fetch_lead_stage_from_crm(referral.referred_candidate_mobile)
        stage = stage_info.get("stage")
        sub_stage = stage_info.get("sub_stage")
        if (stage or sub_stage) and _apply_referral_status_from_crm_stage(referral, stage, sub_stage):
            updated += 1
    db.session.commit()
    return jsonify({"message": "Referral sync complete", "updated": updated}), 200


@app.route("/auth/referrals/", methods=["GET", "OPTIONS"])
@app.route("/api/auth/referrals/", methods=["GET", "OPTIONS"])
def list_referrals():
    if request.method == "OPTIONS":
        return _cors_preflight_response()
    if not _is_admin_request():
        return jsonify({"error": "Unauthorized"}), 401

    referrals = Referral.query.order_by(Referral.created_at.desc()).all()
    return jsonify({"referrals": [row.to_dict() for row in referrals]}), 200


@app.route("/admin/referrals", methods=["GET"])
def referrals_admin_view():
    if not _is_admin_request():
        return "Unauthorized. Provide ?key=YOUR_ADMIN_KEY", 401

    referrals = Referral.query.order_by(Referral.created_at.desc()).all()
    rows = []
    for row in referrals:
        rows.append({
            "id": row.id,
            "referrer_name": row.referrer_name,
            "referrer_mobile": row.referrer_mobile,
            "referred_candidate_mobile": row.referred_candidate_mobile,
            "status": row.status,
            "enrollment_date": row.enrollment_date.isoformat() if row.enrollment_date else None,
            "created_at": row.created_at.strftime("%Y-%m-%d %H:%M") if row.created_at else "",
        })
    return render_template_string(REFERRALS_ADMIN_HTML, referrals=rows)


if __name__ == '__main__':
    app.run(debug=True, port=8000)
