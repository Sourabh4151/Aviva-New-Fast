import React, { useState, useEffect, useContext } from 'react';
import './Reg.css';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from "../../context/AuthContext.js";
import { LoadingComponent } from '../LoadingComponent.js';
import OtpInput from '../../utils/otp_input.js';
import Alert from '../Alert.js';
import Popup from './Popup.js';

const RegistrationForm = ({ hideCity = false }) => {
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [formData, setFormData] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const { authLoading, authError, setAuthError } = authContext;

  useEffect(() => {
    if (authError) {
      setError(authError);
      if (authError.message === 'We will reach out soon') {
        setShowOtp(false);
      }
    }
    setAuthError(null);
  }, [authError]);

  const handleFieldChange = ({ name, value }) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };


  const sendRegisterOtp = async () => {
  const { name, email, city, phone } = formData;
  const cityVal = hideCity ? "" : (city || "");
  let errors = [];

  if (!name?.trim()) errors.push({ type: "error", message: "Name is required." });
  if (!hideCity && !city?.trim()) errors.push({ type: "error", message: "City is required." });
  if (!email?.trim()) errors.push({ type: "error", message: "Email is required." });
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push({ type: "error", message: "Invalid email format." });
  if (!phone?.trim()) errors.push({ type: "error", message: "Phone Number is required." });
  else if (!/^\d{10}$/.test(phone)) errors.push({ type: "error", message: "Phone must be 10 digits." });

  if (errors.length > 0) {
    setAuthError(errors[0]);
    return;
  }

  try {
    
      authContext.sendCallbackOtp(name, email, cityVal, phone)
      .then((response) => {
        if (response) {
          console.log("OTP successfully sent");
          setShowOtp(true);
        }
      })
      .catch((error) => {
        console.error("Register Failed:", error);
        setAuthError({
          type: "error",
          message: `OTP failed: ${error?.message || "Something went wrong"}`
        });
      });


  } catch (error) {
    console.error("OTP send error:", error);
    setAuthError({ type: "error", message: "Failed to send OTP." });
  }
};



  const handleRegister = async (e) => {
    e.preventDefault();
    const { name, email, phone, city } = formData;

    let errors = [];

    if (!name?.trim()) errors.push({ type: "error", message: "Name is required." });
    if (!hideCity && !city?.trim()) errors.push({ type: "error", message: "City is required." });
    if (!email?.trim()) errors.push({ type: "error", message: "Email is required." });
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push({ type: "error", message: "Invalid email format." });

    if (!phone?.trim()) errors.push({ type: "error", message: "Phone Number is required." });
    else if (!/^\d{10}$/.test(phone)) errors.push({ type: "error", message: "Phone must be 10 digits." });
    if (!otp.trim()) errors.push({ "type": "error", "message": "OTP is required." });
    else if (otp.trim().length !== 4 || !/^\d{4}$/.test(otp.trim())) errors.push({ "type": "error", "message": "OTP must be 4 digits." });


    if (errors.length > 0) {
      setAuthError(errors[0]);
      return;
    }

    authContext.addCallback(formData.phone, otp).then((response) => {
            if (response) {
                console.log("Callback successfully:");
                    setShowPopup(true);
                    setShowOtp(false);

            }
        }).catch((error) => {
            console.error("Callback Failed:", error);
        });

  };

  return (
    <>
      <div className="registration-container">
        {authLoading && <LoadingComponent />}
        {error && <Alert error={error} onClose={() => setError(null)} />}

        <form className="registration-form">
          <div className="form-group">
            <input
              type="text"
              placeholder="Full Name"
              className="form-control"
              name="name"
              readOnly={showOtp}
              onChange={(e) => handleFieldChange({ name: "name", value: e.target.value })}
            />
          </div>

          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              className="form-control"
              name="email"
              readOnly={showOtp}
              onChange={(e) => handleFieldChange({ name: "email", value: e.target.value })}
            />
          </div>

          {!hideCity && (
            <div className="form-group">
              <input
                type="text"
                placeholder="City"
                className="form-control"
                name="city"
                readOnly={showOtp}
                onChange={(e) => handleFieldChange({ name: "city", value: e.target.value })}
              />
            </div>
          )}

          <div className="form-group">
            <div className="mobile-input-wrapper">
              <input
                type="text"
                placeholder="Mobile Number"
                className="form-control mobile-number-input"
                name="phone"
                readOnly={showOtp}
                onChange={(e) => handleFieldChange({ name: "phone", value: e.target.value })}
              />
              <button
                type="button"
                className="btn-get-otp-inside"
                onClick={sendRegisterOtp}
                disabled={error && error.message === 'We will reach out soon'}
              >
                GET OTP
              </button>
            </div>
          </div>

          {showOtp && (
            <div className="form-group">
              <p className="otp-instruction">Enter OTP sent to your mobile number</p>
              <div className="otp-container">
                <OtpInput length={4} onChange={(val) => setOtp(val)} />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn-submit-createac"
            onClick={handleRegister}
            disabled={error && error.message === 'We will reach out soon'}
          >
            Request a callback
          </button>
        </form>
      </div>

      {showPopup && (
        <Popup
          message="You have successfully registered!"
          onClose={() => setShowPopup(false)}
        />
      )}
    </>
  );
};

export default RegistrationForm;