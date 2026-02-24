import React from 'react';
import '../Styles/Thankyou.css';
import paymentSuccessImg from '../../../assets/payment-success.png'; 
import PortalHeader from '../../PortalHeader.js';

const PaymentSuccess = () => {
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


    <div className="payment-success-container">
      <div className="payment-success-card">
        <img
          src={paymentSuccessImg}
          alt="Payment Success Illustration"
          className="payment-success-image"
        />
        <h2>Payment Successful!</h2>
        <p>
          Thank you for your payment. We've received your transaction and your
          enrollment is now confirmed.
        </p>
        <p>
          If you have any questions, feel free to reach out to us at:{' '}
          <span className="phone-number">+91 9240258311</span>
        </p>
      </div>
    </div>

    </>
  );
};

export default PaymentSuccess;