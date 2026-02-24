import React from 'react';
import './AboutProgram.css'; 
import aboutProgramImg from './about-program.png';
import jobready from '../../assets/jobready.png'
import moneyearn from '../../assets/moneyearn.png'
import certified from '../../assets/certif.png';

const AboutProgram = () => {
  return (
    <section className="about-program-section">
      <div className="portal-about" id="about">
        {/* Left: Only the image, no blue abstract shape */}
        <div className="image-container">
          <img
            src={aboutProgramImg}
            alt="About the Program"
            className="about-img"
          />
        </div>
        {/* Right: Heading and description */}
        <div className="text-container">
          <div className="title-text-purple">
            About The Program
          </div>
          <p className="about-text-secondary mb-3 lh-relaxed">
            As the banking industry moves rapidly toward digital-first, customer-centric models, the role of the Virtual Relationship Manager has become essential. Crack-ED&apos;s <span className="about-program-name">Udaan Certification Program – Virtual Relationship Manager</span> is built to equip learners for this shift through practical, role-aligned training. Grounded in real banking processes and customer interactions, the program guides learners progressively into the role—strengthening communication skills, service quality, and decision-making. The outcome goes beyond theory, enabling learners to step into customer-facing banking roles fully prepared from day one.
          </p>
          <a
            href="/UCP_%20Virtual%20Relationship%20Manager.pdf"
            className="about-download-brochure"
            target="_blank"
            rel="noopener noreferrer"
            download="UCP_Virtual_Relationship_Manager.pdf"
          >
            <svg className="about-download-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download Brochure
          </a>
        </div>
      </div>
      {/* Info Cards Row */}
      
      <div className="about-info-cards">
        <div className="about-info-card">
          <div className="about-info-icon">
            <img src={jobready} alt="Icon" className="about-info-icon-img" />
          </div>
          <div className="about-info-title">Become job ready</div>
          <div className="about-info-desc">
            Train for a Virtual Relationship Manager role focused on customer relationships, service excellence, and digital banking support.
          </div>
        </div>
        <div className="about-info-card">
          <div className="about-info-icon">
            <img src={moneyearn} alt="Icon" className="about-info-icon-img" />

          </div>
          <div className="about-info-title">Your Career, All Set.</div>
          <div className="about-info-desc">
            For ₹80,000, get comprehensive training, placement support, and all learning resources included.
          </div>
        </div>
        <div className="about-info-card">
          <div className="about-info-icon">
            <img src={certified} alt="Icon" className="about-info-icon-img" />
          </div>
          <div className="about-info-title">Certified by Industry Experts</div>
          <div className="about-info-desc">Get certified by Crack-ED in collaboration with India's leading private banks.</div>
        </div>
      </div>
    </section>
  );
};

export default AboutProgram;

