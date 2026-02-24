import React from 'react';
import './Popup.css';
import checkImg from './thankyou-phone.png'; // adjust path if needed

const Popup = () => {
  const handleClose = () => {
    window.location.reload(); // refreshes the current page
  };

  return (
    <div className="popup-overlay">
      <div className="popup-card">
        <button className="popup-close" onClick={handleClose}>&times;</button>
        <div className="popup-content">
          <img src={checkImg} alt="Thank you" className="popup-image" />
          <h2>Thank you for reaching out!</h2>
          <p>
            We’ve received your request! Someone from our team will contact you
            shortly on your provided mobile number.
          </p>
          <button className="popup-btn" onClick={handleClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default Popup;
