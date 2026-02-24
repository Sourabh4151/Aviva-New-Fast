import React from "react";
import "../styles/confirm-payment-popup.css"; // Optional: Use for custom styling
import warning_icon from "../assets/warning_icon.png"


const ConfirmPaymentPopup = ({ onClose, onConfirm }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-icon">
          <img className="icon-circle" src={warning_icon}/>
        </div>
        <div className="modal-title">Ready to Submit?</div>
        <p className="modal-description">
          Once you submit details you cannot change them later.
        </p>
        <div className="modal-actions">
          <button className="btn-outline" onClick={onClose}>
            Edit Details
          </button>
          <button className="btn-filled" onClick={onConfirm}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmPaymentPopup;