import React, { useState, useEffect } from "react";
import "../styles/PaymentOptions.css"; 
import { useNavigate } from "react-router-dom";
import LoanApplicationForm from "./LoanApplicationForm";
import LoanPlans from "./LoanProviders";
import PaymentModal from "./PaymentModal";

// Razorpay script loader utility
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const PaymentOptions = () => {
  const [selectedMethod, setSelectedMethod] = useState("pay");
  const [payAmount, setPayAmount] = useState("");
  const [totalDue, setTotalDue] = useState(118000);
  const [selectedInstallment, setSelectedInstallment] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [applicationData, setApplicationData] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [totalPaidAmount, setTotalPaidAmount] = useState(0);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [downloadingReceipt, setDownloadingReceipt] = useState(false);
  const navigate = useNavigate();

  // Fetch application data on mount and after payment
  const fetchAppData = () => {
    const token = localStorage.getItem("TOKEN");
    fetch(`${process.env.REACT_APP_BASE_URL}/dataset/get-application-data/`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setApplicationData(data);
        setTotalDue(data.program_total_fee || 118000);
        setTotalPaidAmount(data.total_paid_amount || 0);
        setPaymentCompleted(data.payment_completed || false);
      })
      .catch(err => console.error("Failed to fetch application data", err));
  };

  useEffect(() => {
    fetchAppData();
  }, []);

  const handlePayment = async () => {
    if (!applicationData) {
      alert("Application data not loaded. Please try again.");
      return;
    }
    if (paymentCompleted) {
      alert("Payment completed! Your total fee has been paid.");
      return;
    }
    if (!payAmount || payAmount <= 0 || payAmount > (totalDue - totalPaidAmount)) {
      alert("Please enter a valid amount to pay.");
      return;
    }
    setLoading(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        alert("Razorpay SDK failed to load. Are you online?");
        setLoading(false);
        return;
      }
      const res = await fetch(`${process.env.REACT_APP_BASE_URL}/api/create_order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount: payAmount,
          application_id: applicationData.application_id
        }),
      });
      const data = await res.json();
      if (!data.order_id) throw new Error("Order creation failed");
      const options = {
        key: data.razorpay_key_id || data.razorpay_key,
        amount: data.amount * 100,
        currency: "INR",
        order_id: data.order_id,
        handler: function (response) {
          fetch(`${process.env.REACT_APP_BASE_URL}/api/payment_success`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              order_id: response.razorpay_order_id,
              payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              application_id: applicationData.application_id
            }),
          })
            .then(res => res.json())
            .then(() => {
              // Navigate to thank you page after payment
              navigate('/portal/payment-success', { state: { amount: payAmount } });
            });
        },
        prefill: {},
        theme: { color: "#F37021" },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
      setModalOpen(false);
    } catch (err) {
      alert("Payment initiation failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = async () => {
    if (!applicationData) {
      alert("Application data not available. Please try again.");
      return;
    }
    setDownloadingReceipt(true);
    try {
      const token = localStorage.getItem("TOKEN");
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/user/download-payment-receipt?application_id=${applicationData.application_id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error('Failed to download receipt');
      }
      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Payment_Receipt_${applicationData.application_id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading receipt:', error);
      alert('Failed to download payment receipt. Please try again.');
    } finally {
      setDownloadingReceipt(false);
    }
  };

  return (
    <div className="payment-container">
      <h3>Payment</h3>

      <div className="method-box">
        <p className="method-label">How would you like to proceed?</p>
        <div className="method-buttons">
          <button
            className={`method-btn ${selectedMethod === "pay" ? "selected" : ""}`}
            onClick={() => setSelectedMethod("pay")}
          >
            Pay Now
          </button>
          <button
            className={`method-btn ${selectedMethod === "loan" ? "selected" : ""}`}
            onClick={() => setSelectedMethod("loan")}
          >
            Apply for loan
          </button>
        </div>
      </div>

      {selectedMethod === "pay" && (
        <div className="installment-box Desktop">
          {paymentCompleted ? (
            <div style={{
              backgroundColor: "#e8f5e8",
              border: "1px solid #4caf50",
              borderRadius: "4px",
              padding: "12px",
              marginBottom: "1rem",
              textAlign: "center",
              color: "#2e7d32",
              fontWeight: "500"
            }}>
              ✓ Payment Completed! Total fee of ₹{totalDue.toLocaleString()} has been paid.
            </div>
          ) : (
            <>
              <p className="installment-label">How much would you like to pay right now?</p>
              {/* <div className="payment-summary" style={{
                backgroundColor: "#f8f9fa",
                padding: "12px",
                borderRadius: "4px",
                marginBottom: "1rem",
                border: "1px solid #e0e0e0"
              }}>
                <div><b>Total Fee:</b> ₹{totalDue.toLocaleString()}</div>
                <div><b>Total Paid:</b> ₹{totalPaidAmount.toLocaleString()}</div>
                <div><b>Remaining Amount:</b> ₹{(totalDue - totalPaidAmount).toLocaleString()}</div>
              </div> */}
              
              <div className="installments payment-flow">
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  max={totalDue - totalPaidAmount}
                />
                 <button
              className="proceedtopay-btn"
              onClick={handlePayment}
              disabled={!applicationData || loading}
            >
              {loading ? "Processing..." : "Proceed to Pay"}
            </button>
              </div>
              <div className="remaining-balance">
                <p>Remaining after this payment</p>
                <h2>₹ {(totalDue - totalPaidAmount - payAmount >= 0 ? totalDue - totalPaidAmount - payAmount : 0).toLocaleString()}</h2>
              </div>
            </>
          )}
          
          {/* Download Receipt Button - Show if any payments have been made */}
          {/*
          {totalPaidAmount > 0 && (
            <div style={{ marginTop: "1rem", textAlign: "center" }}>
              <button 
                onClick={handleDownloadReceipt}
                disabled={downloadingReceipt}
                style={{
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "6px",
                  cursor: downloadingReceipt ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  opacity: downloadingReceipt ? 0.7 : 1,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}
              >
                {downloadingReceipt ? "📄 Downloading..." : "📄 Download Payment Receipt"}
              </button>
            </div>
          )}
          */}
        </div>
      )}

    {selectedMethod === "loan" && (
      <div className="loan-box">
        <LoanApplicationForm />
      </div>
    )}
    </div>
  );
};

export default PaymentOptions; 