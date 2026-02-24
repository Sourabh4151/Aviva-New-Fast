import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/LoanThankYouPage.css";
import PortalHeader from "./PortalHeader.js";
import paymentSuccessImg from '../assets/loan-illustration.png'

const ThankYouPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const providerName = location.state?.providerName || "your loan provider";
  const applicationId = location.state?.applicationId || localStorage.getItem('application_id');
  const [downloading, setDownloading] = React.useState(false);

  const handleDownloadReceipt = async () => {
    if (!applicationId) {
      alert("Application ID not found. Please try again.");
      return;
    }
    setDownloading(true);
    try {
      const token = localStorage.getItem("TOKEN");
      const response = await fetch(`/api/user/download-payment-receipt?application_id=${applicationId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error('Failed to download receipt');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Payment_Receipt_${applicationId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to download payment receipt. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <PortalHeader>
        <nav className="nav-links">
          <a href="/portal" className="nav-link">Home</a>
        </nav>
        <button className="logout-button" onClick={() => {
          localStorage.clear();
          window.location.href = '/portal/login';
        }}>
          Logout
        </button>
      </PortalHeader>

      <div className="thankyou-content">
        <div className="thankyou-image">
          <img src={paymentSuccessImg} alt="Thank you illustration" />
        </div>
        <div className="thankyou-text">
          <h1>Thank You for Applying!</h1>
          <p>Our lending partners are now reviewing your details. You'll hear from us soon regarding your loan status.</p>
          <p>If you have any questions, feel free to reach out to us at <br />
            <a href="tel:+919240258311">+91 9240258311</a>
          </p>
          <button
            style={{
              background: '#004C8E',
              color: 'white',
              border: 'none',
              padding: '0.8rem 2rem',
              borderRadius: '6px',
              fontWeight: 500,
              fontSize: '15px',
              marginTop: '1.5rem',
              cursor: downloading ? 'not-allowed' : 'pointer',
              opacity: downloading ? 0.7 : 1
            }}
            onClick={handleDownloadReceipt}
            disabled={downloading}
          >
            {downloading ? 'Downloading...' : 'Download Payment Receipt'}
          </button>
        </div>
      </div>
    </>
  );
};

export default ThankYouPage;