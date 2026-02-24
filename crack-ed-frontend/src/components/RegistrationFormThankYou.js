import React from 'react';
import '../styles/thankyou-page.css';
import thankYouImage from '../assets/thankyou_image.png';

function RegistrationFormThankYou() {
  return (
    <div className="thank-you-container">
      <main className="thank-you-content">
        <div className="thank-you-image-container">
          <img 
            src={thankYouImage}
            alt="Thank you for registering"
            className="thank-you-image"
            loading="lazy"
          />
        </div>
      </main>
    </div>
  );
}

export default RegistrationFormThankYou;