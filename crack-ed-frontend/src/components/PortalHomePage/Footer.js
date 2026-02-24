import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <p className="footer-copyright">© 2026 Udaan Program. All rights reserved.</p>
        <div className="footer-links">
        <a href="https://crack-ed.com/privacy-policy/" className="footer-link">Privacy Policy</a>
        <a href="https://crack-ed.com/terms-conditions/" className="footer-link">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
