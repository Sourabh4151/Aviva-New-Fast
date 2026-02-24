import React from 'react';
import './ProcessSteps.css';
import processImg from '../../assets/process_illustration.png'; // Replace with your actual image

const steps = [
  'Submit your online application to begin your journey into premium banking.',
  'Shortlisted candidates receive a week long online training to prepare, to clear the first round of the interview at a designated bank.',
  'Candidates attend one-on-one interview to understand their fitment for the role, followed by 3 weeks of online training.',
  'Selected candidates receive a formal offer and complete enrollment into the program.',
  'Begin your learning journey with structured orientation, expectations setting, and readiness alignment.',
];

const ProcessSteps = () => (
  <section id="eligibility" className="process-steps-section">
    <div className="process-steps-container">
      <div className="process-steps-left">
        <h2 className="process-steps-heading">
          Designed for driven individuals ready to lead in Banking.
        </h2>
        <div className="process-steps-list">
          {steps.map((step, idx) => (
            <div className="process-step-box" key={idx}>
              <div className="process-step-number-bg">
                <span className="process-step-number">{idx + 1}</span>
              </div>
              <div className="process-step-text">{step}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
    <img src={processImg} alt="Process Illustration" className="process-steps-img" />
  </section>
);

export default ProcessSteps; 