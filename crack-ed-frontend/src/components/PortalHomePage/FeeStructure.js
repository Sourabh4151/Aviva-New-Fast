import React from 'react';
import './FeeStructure.css';

const FeeStructure = () => (
  <section className="fee-structure-section">
    <div className="fee-structure-container">
      <div className="fee-structure-header-row">
        <div className="fee-structure-title">Invest in your Future</div>
        <div className="fee-structure-desc">
          We believe in providing top-tier education that's both valuable and accessible. Our fee structure is designed to offer you a world-class learning experience while ensuring affordability and flexibility.
        </div>
      </div>
      <div className="fee-structure-card">
        <div className="fee-structure-col">
          <div className="fee-structure-col-title">1st Installment</div>
          <div className="fee-structure-amount">₹10,000</div>
          <div className="fee-structure-note">on receiving offer letter</div>
        </div>
        <div className="fee-structure-divider" />
        <div className="fee-structure-col">
          <div className="fee-structure-col-title">2nd Installment</div>
          <div className="fee-structure-amount">₹30,000</div>
          <div className="fee-structure-note">Within 7 days before commencement</div>
        </div>
        <div className="fee-structure-divider" />
        <div className="fee-structure-col">
          <div className="fee-structure-col-title">3rd Installment</div>
          <div className="fee-structure-amount">₹25,000</div>
          <div className="fee-structure-note">Within 30 days of commencement</div>
        </div>
      </div>
    </div>
  </section>
);

export default FeeStructure; 