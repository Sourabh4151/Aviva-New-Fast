import React, { useState, useEffect, useContext } from 'react';
import Header from "../components/PortalHomePage/header.js";
import '../styles/portal.css';
import CustomTextField from '../utils/custom_textfield.js';
import OtpInput from '../utils/otp_input.js';
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { AuthContext } from "../context/AuthContext.js";
import { DataContext } from "../context/DataContext.js";
import ApplicationCard from '../components/ApplicationCard.js';
import { LoadingComponent } from '../components/LoadingComponent.js';
import Alert from '../components/Alert.js';


const PortalDashboardPage = () => {
  const location = useLocation();
  const authContext = useContext(AuthContext);
  const dataContext = useContext(AuthContext);
  const { getApplicationData, applicationData, dataLoading } = useContext(DataContext);  // Correctly access getApplicationData from DataContext
  const { authLoading, authError, setAuthError } = useContext(AuthContext);  // Correctly access getApplicationData from DataContext
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleLogout = () => {
    authContext.logout();
    console.log("Logout successfully");
    navigate('/portal/login');
  }
  const handleResume = () => {
    navigate('/portal/application-form');
  }
  const handlePaynow = () => {
    navigate('/portal/payment-options');
  };


  useEffect(() => {
    if (authError) {
      setError(authError);
    }
    setAuthError(null);
  }, [authError]);

  useEffect(() => {
    if (!authContext.loading) {
      if (!authContext.isAuthenticated) {
        navigate("/portal/login");
      }
    }
  }, [authContext.isAuthenticated, authContext.loading]);

  useEffect(() => {
    console.log("State Sent ", location.state);
    if (location.state?.fromRegister) {
      setError({ "type": "success", "message": "Register Successfully" });
          window.history.replaceState({}, document.title);
    }
    if (location.state?.fromLogin) {
      setError({ "type": "success", "message": "Login Successfully" });
          window.history.replaceState({}, document.title);
    }
    getApplicationData();
  }, []);

  useEffect(() => {
    console.log("Application Data dash:", applicationData);
    // Store application_id in localStorage for payment flow
    if (applicationData && applicationData.application_id) {
      localStorage.setItem("application_id", applicationData.application_id);
    }
  }, [applicationData]);

  return (
    <>
      <Header />

      {error && <Alert error={error} onClose={() => setError(null)} />}

      <div className='application-cards'>
        {dataLoading || authLoading ? <LoadingComponent /> :
          applicationData ?
            <ApplicationCard
              appNumber={applicationData ? applicationData.application_id : "Loading"}
              candidateName={applicationData ? applicationData.name : "Sourabh Tayal"}
              program={applicationData ? applicationData.program : "Udaan Teller Program"}
              status={applicationData ? applicationData.status : ""}
              paymentStatus={applicationData && applicationData.razorpay_payment_status === 'captured' ? 'Paid' : 'Unpaid'}
              paymentAmount={applicationData ? applicationData.razorpay_payment_amount : 0}
              onResume={handleResume}
              onPaynow={handlePaynow}
              totalPaidAmount={applicationData ? applicationData.total_paid_amount : 0}
              programTotalFee={applicationData ? applicationData.program_total_fee : 76700}
              paymentCompleted={applicationData ? applicationData.payment_completed : false}
            /> : <ApplicationCard
              appNumber={applicationData ? applicationData.application_id : "NA"}
              candidateName={applicationData ? applicationData.name : "Not found"}
              program={applicationData ? applicationData.program : "Udaan Teller Program"}
              status={applicationData ? applicationData.status : "Error"}
              paymentStatus={'Unpaid'}
              paymentAmount={0}
              onResume={handleResume}
              onPaynow={handlePaynow}
              totalPaidAmount={0}
              programTotalFee={76700}
              paymentCompleted={false}
            />
        }
      </div>
    </>
  );
}

export default PortalDashboardPage;