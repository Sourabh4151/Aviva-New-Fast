import React, { useEffect } from 'react';
import '../styles/alert.css';

const Alert = ({ error, onClose, duration = 5000 }) => {
  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(() => onClose(), duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getAlertClass = () => {
    switch (error?.type) {
      case "success":
        return "alert alert-success";
      case "error":
        return "alert alert-error";
      case "warning":
        return "alert alert-warning";
      default:
        return "alert alert-info";
    }
  };

  const message =
    typeof error === "string"
      ? error
      : typeof error?.message === "string"
      ? error.message
      : "Something went wrong.";

  return (
    <div className={getAlertClass()} role="alert" aria-live="assertive">
      <span className="alert-message">{message}</span>
      {onClose && (
        <button className="close-btn" onClick={onClose} aria-label="Close alert">
          &times;
        </button>
      )}
    </div>
  );
};

export default Alert;
