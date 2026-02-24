import React, { useState, useEffect, useContext } from 'react';
import Header from "../components/PortalHomePage/header.js";
import '../styles/portal.css';
import CustomTextField from '../utils/custom_textfield.js';
import OtpInput from '../utils/otp_input.js';
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from "../context/AuthContext.js";
import { LoadingComponent } from '../components/LoadingComponent.js';
import Alert from '../components/Alert.js';

const PortalRegisterPage = () => {
    const [otp, setOtp] = useState("");
    const navigate = useNavigate();
    const [formData, setFormData] = useState({});
    const authContext = useContext(AuthContext);
    const { authLoading } = useContext(AuthContext);  // Correctly access getApplicationData from DataContext
    const [showOtp, setShowOtp] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (showOtp) {
            if (!authContext.loading) {
                if (authContext.isAuthenticated) {
                    setShowOtp(false);
                    navigate("/portal/dashboard", { state: { fromRegister: true } });
                }
            }
        } else {
            if (!authContext.loading) {
                if (authContext.isAuthenticated) {
                    navigate("/portal/dashboard");
                }
            }
        }
    }, [authContext.isAuthenticated, authContext.loading, navigate, showOtp]);

    useEffect(() => {
        if (authContext.authError) {
            setError(authContext.authError);
            // Block OTP input if the error is 'We will reach out soon'
            if (authContext.authError.message === 'We will reach out soon') {
                setShowOtp(false);
            }
        }
        authContext.setAuthError(null);
    }, [authContext.authError, authContext]);

    const handleFieldChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(null);
    };

   

    const sendRegisterOtp = () => {
        const { name, email, phone } = formData;
        let errors = [];

        if (!name || !email || !phone) {
            authContext.setAuthError({ "type": "error", "message": "All Fields are Required." });
            return;
        }
        if (!name.trim()) errors.push({ "type": "error", "message": "Name is required." });
        if (!email.trim()) errors.push({ "type": "error", "message": "Email is required." });
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push({ "type": "error", "message": "Invalid email format." });

        if (!phone.trim()) errors.push({ "type": "error", "message": "Phone Number is required." });
        else if (!/^\d{10}$/.test(phone)) errors.push({ "type": "error", "message": "Phone must be 10 digits." });

        if (errors.length > 0) {
            console.log("Errors ", errors);
            authContext.setAuthError(errors[0]);
            return;
        }

       authContext.sendRegisterOtp(formData.name, formData.email, formData.phone).then((response) => {
            if (response) {
                console.log("OTP successfully:",);
                setShowOtp(true);
            }
        }).catch((error) => {
            console.error("Error sending OTP:", error);
        });
    };




    const handleRegister = () => {

        const { name, email, phone } = formData;
        if (!name || !email || !phone) {
            authContext.setAuthError({ "type": "error", "message": "All Fields are Required." });
            return;
        }

        let errors = [];

        if (!name.trim()) errors.push({ "type": "error", "message": "Name is required." });
        if (!email.trim()) errors.push({ "type": "error", "message": "Email is required." });
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push({ "type": "error", "message": "Invalid email format." });

        if (!phone.trim()) errors.push({ "type": "error", "message": "Phone Number is required." });
        else if (!/^\d{10}$/.test(phone)) errors.push({ "type": "error", "message": "Phone must be 10 digits." });

        if (!otp.trim()) errors.push({ "type": "error", "message": "OTP is required." });
        else if (otp.trim().length !== 4 || !/^\d{4}$/.test(otp.trim())) errors.push({ "type": "error", "message": "OTP must be 4 digits." });

        if (errors.length > 0) {
            console.log("Errors ", errors);
            authContext.setAuthError(errors[0]);
            return;
        }

        authContext.register(formData.name, formData.email, formData.phone, otp).then((response) => {
            if (response) {
                console.log("Register successfully:");
                navigate('/portal/dashboard', { state: { fromRegister: true } });

            }
        }).catch((error) => {
            console.error("Register Failed:", error);
        });
    }

    return (
        <>
            <Header />
            {authLoading ? <LoadingComponent /> : null}
            {error && <Alert error={error} onClose={() => setError(null)} />}
            <div className="portal-container">
                <div className="portal-form-container">
                    <div className='portal-form-title'>
                        Register
                    </div>
                    <div className="portal-form-card">
                        <form>
                            <CustomTextField label="Full Name" name="name" type="text" onChange={handleFieldChange} />
                            <CustomTextField label="Email" name="email" type="email" onChange={handleFieldChange} />
                            <CustomTextField
                                label="Mobile Number"
                                name="phone" type="text"
                                onChange={handleFieldChange}
                                tail={true}
                                tailContent={<div className='sendOtpButton' onClick={sendRegisterOtp} style={{ pointerEvents: (error && error.message === 'We will reach out soon') ? 'none' : 'auto', opacity: (error && error.message === 'We will reach out soon') ? 0.5 : 1 }}>GET OTP</div>}>
                            </CustomTextField>

                            {showOtp && <div className='otp-container'>
                                <div className='enter-otp-text'>Enter OTP sent to your mobile number</div>
                                <OtpInput length={4} onChange={(val) => setOtp(val)} />
                            </div>}
                            <div className='portal-btn' onClick={handleRegister} >Register</div>
                        </form>

                    </div>
                </div>

            </div>
        </>
    );
}

export default PortalRegisterPage;