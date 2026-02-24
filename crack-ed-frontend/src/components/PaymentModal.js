import React, { useState, useEffect } from 'react';
import '../styles/confirm-payment-popup.css';

const PaymentModal = ({ open, onClose, onPay, loading, defaultAmount = 0 }) => {
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (open && defaultAmount > 0) {
      setAmount(defaultAmount.toString());
    }
  }, [open, defaultAmount]);

  if (!open) return null;

  const handlePay = (e) => {
    e.preventDefault();
    if (amount && !isNaN(amount) && Number(amount) > 0) {
      onPay(Number(amount));
    }
  };

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal">
        <h2>Pay Fee</h2>
        <form onSubmit={handlePay}>
          <label htmlFor="amount">Amount (INR):</label>
          <input
            id="amount"
            type="number"
            min="1"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            required
            disabled={loading}
          />
          <div className="payment-modal-actions">
            <button type="button" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" disabled={loading || !amount || Number(amount) <= 0}>
              {loading ? 'Processing...' : 'Pay Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal; 