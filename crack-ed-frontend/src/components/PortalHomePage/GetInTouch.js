import React from 'react';
import './GetInTouch.css';

const GetInTouch = () => {
  return (
    <section className="get-in-touch-section">
      <div className="get-in-touch-inner">
        <div className="get-in-touch-text-block">
          <h2 className="get-in-touch-title">Get in Touch Today</h2>
          <p className="get-in-touch-desc">
            Have a question? Fill in your details and we&apos;ll reach out quickly.
          </p>
        </div>
        <a href="#hero" className="get-in-touch-btn">
          Request a callback
        </a>
      </div>
    </section>
  );
};

export default GetInTouch;
