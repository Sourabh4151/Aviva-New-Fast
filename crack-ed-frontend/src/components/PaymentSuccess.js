import React, { useState } from 'react';
import '../styles/Thankyou.css';
import paymentSuccessImg from '../assets/payment-success.png';
import PortalHeader from './PortalHeader';
import { useLocation } from 'react-router-dom';

const PaymentSuccess = () => {
  const location = useLocation();
  const amountPaid = location.state?.amount || 0;
  const applicationId = location.state?.applicationId || localStorage.getItem('application_id');
  const [downloading, setDownloading] = useState(false);

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
          <a href="/portal/dashboard" className="nav-link">Dashboard</a>
        </nav>
        <button className="logout-button" onClick={() => {
          localStorage.clear();
          window.location.href = '/portal/login';
        }}>
          Logout
        </button>
      </PortalHeader>
      <div className="thankyou-wrapper">
        <div className="thankyou-illustration">
          <img src={paymentSuccessImg} alt="Payment Success" />
        </div>
        <div className="thankyou-message">
          <h2>Payment Successful!</h2>
          <p>
            Thank you for your payment{amountPaid ? <> of <strong>Rs {Number(amountPaid).toLocaleString()}</strong></> : null}. We've received your transaction and your enrollment is now confirmed.
          </p>
          <p>
            If you have any questions, feel free to reach out to us at:<br />
            <span className="contact-number">+91 91924025831</span>
          </p>
          <button
            style={{
              background: '#6D3078',
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

export default PaymentSuccess; 