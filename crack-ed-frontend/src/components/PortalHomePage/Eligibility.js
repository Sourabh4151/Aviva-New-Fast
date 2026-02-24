import React from 'react';
import './Eligibility.css';
import eligibilityImg from '../../assets/eligibility_img.png'; // Update with your image path
import checkIcon from '../../assets/check_green.png'; // Use a green check icon

const Eligibility = () => {
  return (
    <section className="eligibility-section" id='eligibility'>
      <div className="eligibility-container">
        <div className="eligibility-img-wrapper">
          <div className="eligibility-abstract-shape"></div>
          <img src={eligibilityImg} alt="Eligibility" className="eligibility-img" />
        </div>
        <div className="eligibility-content">
          <h2 className="eligibility-title">Is this post graduate program right for you?</h2>
          <div className="eligibility-subtitle">Requirements</div>
          <div className="eligibility-requirement-row">
            <img src={checkIcon} alt="Check" className="eligibility-check-icon" />
            <span className="eligibility-requirement-text">
              Open to graduates from any stream with 0–2 years of experience.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Eligibility;
