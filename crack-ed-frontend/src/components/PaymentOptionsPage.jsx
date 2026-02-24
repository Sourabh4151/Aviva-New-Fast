import React from 'react';
import PortalHeader from "./PortalHeader.js";
import PaymentOptions from './PaymentOptions.jsx';  
import Alert from './Alert.js';
import '../styles/portal_header.css'; 

const PaymentOptionsPage = () => {
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

      <div style={{ padding: '2rem' }}>
        <PaymentOptions />
      </div>
    </>
  );
};

export default PaymentOptionsPage;