import React, { useState,useEffect ,useContext} from 'react';
import Header from '../components/PortalHomePage/header.js';
import { useNavigate } from "react-router-dom";
import RegistrationFormThankYou from '../components/RegistrationFormThankYou';
import { AuthContext } from "../context/AuthContext.js";


const PageSuccess = () => {
    const navigate = useNavigate();
    const authContext = useContext(AuthContext);

    const handleGotoDashboard = () => {
        navigate("/portal/dashboard");
    }
    const handleLogout = () => {
        authContext.logout();
        console.log("Logout successfully");
      navigate('/portal/login');
    }   
    return (
        <>
            <Header />
            <RegistrationFormThankYou />
            {/* <div className="form-footer">
                <button
                    type="button"
                    className="back-button"
                    onClick={handleGotoDashboard}
                >
                    Go to Dashboard
                </button>
            </div> */}
        </>
    );
}

export default PageSuccess;

