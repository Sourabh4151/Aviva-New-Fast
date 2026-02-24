
import React, { useState ,useContext} from 'react';
import '../styles/banker-program.css';
import asfbank from '../assets/asfbank_icon.png';
import imt_icon from '../assets/imt_icon.png';
import ellipse_icon from '../assets/ellipse_icon.png';
import call_icon from '../assets/call_icon.png';
import popup_icon from '../assets/popup_icon.png';
import close_icon from '../assets/close_icon.png';
import CustomTextField from '../utils/custom_textfield.js';
import OtpInput from '../utils/otp_input.js';
import {Link, useNavigate} from 'react-router-dom'
import { AuthContext } from "../context/AuthContext";


export default function BankerProgram() {
    const [showPopup, setShowPopup] = useState(false);
    const navigate=useNavigate();
    const [loading, setLoading] = useState(false);
    const [otp, setOtp] = useState("");
    const authContext = useContext(AuthContext);

    // const [name, setName] = useState('');
    // const [email, setEmail] = useState('');
    // const [mobile, setMobile] = useState('');
    // const [otp, setOtp] = useState('');
    const [formData, setFormData] = useState({});


    const handleFieldChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));

        console.log("Form Data:", formData);
    };

    const sendRegisterOtp =() => {
        setLoading(true);
        authContext.sendRegisterOtp(formData.name, formData.email, formData.phone).then((response) => {
            console.log("OTP sent successfully:", response);
            setLoading(false);
        }).catch((error) => {
            console.error("Error sending OTP:", error);
            setLoading(false);
        });
    }  
    const handleRegister =() => {
        setLoading(true);
        authContext.register(formData.name, formData.email, formData.phone,otp).then((response) => {
            console.log("Registration Successfully!", response);
            setLoading(false);
        }).catch((error) => {
            console.error("Register Failed:", error);
            setLoading(false);
        });
    }
    
 

    const FeatureCard = ({ title }) => {
        return (
            <div className='feature-card'>
                <div className='feature-card-icon'>
                </div>
                <div className='feature-card-text'>{title}</div>
            </div>
        );
    }

    const RequestCallbackButton = () => {
        return (
            <>
                {!showPopup ?
                    <div className='request-callback' onClick={() => setShowPopup(true)}>
                        <div className='request-callback-button'>
                            <img src={call_icon} alt="Call" className='call-icon' />
                            Request a Callback
                        </div>
                    </div> : null}
            </>
        );
    }
    const RequestCallbackPopup = () => {
        const [isChecked, setIsChecked] = useState(false);
        const [callbackFormData, setCallbackFormData] = useState({});
        const handleCallback =() => {
            setLoading(true);
            if (isChecked) {

            
            authContext.sendCallbackDetails(callbackFormData.first_name, callbackFormData.last_name, callbackFormData.email,callbackFormData.phone).then((response) => {
                console.log("callback added successfully:", response);
                setShowPopup(false);
                setCallbackFormData({});
                setLoading(false);
            }).catch((error) => {
                console.error("callback added Failed:", error);
                setLoading(false);
            });
        }
        }
        const handleCallbackFieldChange = (name, value) => {
            setCallbackFormData(prev => ({ ...prev, [name]: value }));
    
            console.log("Form Data:", callbackFormData);
        };
        return (
            <>
                {showPopup ?
                    <div className='callback-popup-form'>
                        <div className='callback-form-card'>
                            <img src={popup_icon} alt="Popup" className='popup-icon' />
                            <div className='close-popup' onClick={() => setShowPopup(false)}>
                                <img src={close_icon} alt="Close" className='close-icon' />
                            </div>
                            <div className="callback-title">Talk to our counsellors to know more!</div>
                            <form>
                                <CustomTextField label="First Name" name="first_name" type="text" onChange={handleCallbackFieldChange}/>
                                <CustomTextField label="Last Name" name="last_name" type="text" onChange={handleCallbackFieldChange}/>
                                <CustomTextField label="Email" name="email" type="email" onChange={handleCallbackFieldChange}/>
                                <CustomTextField label="Phone Number" name="phone" type="number" onChange={handleCallbackFieldChange}/>
                                <label className="consent-label">
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => setIsChecked(!isChecked)}
                                        className="consent-checkbox"
                                    />
                                    <div className="consent-text">
                                        I agree to receive updates and notifications from <strong>Crack-ED</strong>.
                                    </div>
                                </label>
                                <div className='callback-btn' onClick={handleCallback}>Request a Callback</div>
                            </form>
                        </div>

                    </div>
                    : null}
            </>
        );
    }


    return (
        <div className="banker-program">
            <img src={ellipse_icon} alt="Ellipse" className='ellipse-icon' />
            <div className="banker-program-header">
                <h1>Aurum Bankers Program</h1>
                <p>Kickstart your career with AU Small Finance Bank and upskill for unparalleled success in the world of finance.</p>
                <div className='feature-cards'>
                    <FeatureCard title="100% placement assurance"></FeatureCard>
                    <FeatureCard title="Paid 3 month on-job training"></FeatureCard>
                </div>
                <div className='feature-cards'>
                    <FeatureCard title="Fully residential program"></FeatureCard>
                    <FeatureCard title="PG Certificate from IMT Ghaziabad"></FeatureCard>
                </div>
                <div className='feature-icons'>
                    <img src={asfbank} alt="Aurum Bankers Program" className='feature-icon' />
                    <img src={imt_icon} alt="IMT Ghaziabad" className='feature-icon' />
                </div>
                <div className='feature-buttons'>
                    <div className='feature-button1'>Enrol Now!</div>
                    <div className='feature-button2'>Download Brochure</div>
                </div>

            </div>
            <div className='registration-form'>

                <div className='registration-form-card'>
                    <div className="registration-title">Start your registration process today!</div>
                    <form>
                        <CustomTextField label="Full Name" name="name" type="text" onChange={handleFieldChange}/>
                        <CustomTextField label="Email" name="email" type="email" onChange={handleFieldChange}/>
                        <CustomTextField 
                        label="Mobile Number" 
                        name="phone" type="text" 
                        onChange={handleFieldChange} 
                        tail={true} 
                        tailContent={ <div className='sendOtpButton' onClick={sendRegisterOtp}>GET OTP</div>}>
                        </CustomTextField>
                        <div className='otp-container'>
                            <div className='enter-otp-text'>Enter OTP sent to your mobile number</div>

                            <OtpInput length={4} onChange={(val) => setOtp(val)} />

                        </div>
                        <div className='register-btn' onClick={handleRegister} >Register</div>
                    </form>
                </div>

            </div>
            <RequestCallbackButton />
            <RequestCallbackPopup />
        </div>
    );
}




