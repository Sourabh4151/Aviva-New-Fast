import React, { useState } from 'react';
import '../styles/application_card.css'; // import the styles

const ApplicationCard = ({ appNumber, candidateName, program, status, paymentStatus, paymentAmount, onResume, onPaynow, totalPaidAmount, programTotalFee, paymentCompleted }) => {
  // Show Pay Now if status is 'Selected' and payment is not completed
  const showPayNow = status === 'Selected' && !paymentCompleted;
  const [downloading, setDownloading] = useState(false);
  const applicationId = appNumber || localStorage.getItem('application_id');

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

  const feePaid = totalPaidAmount || 0;
  const feeRemaining = (programTotalFee || 0) - feePaid;

  return (
    <>
      <div className="application-card">
        <div className="application-details">
          <div className="column">
            <div className="label">Application Number</div>
            <div className="value">{appNumber}</div>
          </div>
          <div className="column">
            <div className="label">Candidate Name</div>
            <div className="value">{candidateName}</div>
          </div>
          <div className="column">
            <div className="label">Program</div>
            <div className="value">{program}</div>
          </div>
          <div className="column">
            <div className="label">Application Status</div>
            <div className="value">{status}</div>
          </div>
        </div>
        <div className="application-actions">
          <div className="button-group">
            <button className="resume-btn" onClick={onResume}>
              {status === "Completed" || status === "Selected" ? "View Details" : "Resume Application"}
            </button>
          </div>
        </div>
      </div>
      {status === 'Selected' && (
        <div className="payment-info-card">
          <div className="payment-info-details">
            <div className="payment-info-column">
              <div className="label">Fee Paid</div>
              <div className="value">Rs {feePaid.toLocaleString()}</div>
            </div>
            <div className="payment-info-column">
              <div className="label">Fee Remaining</div>
              <div className="value">Rs {feeRemaining.toLocaleString()}</div>
            </div>
          </div>
          <div className="payment-info-actions">
            {feePaid > 0 && (
              <button
                className="download-receipt-btn"
                onClick={handleDownloadReceipt}
                disabled={downloading}
              >
                {downloading ? 'Downloading...' : 'Download Payment Receipt'}
              </button>
            )}
            {showPayNow && (
              <button className="pay-fee-btn" onClick={onPaynow}>Pay Fee</button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ApplicationCard;
