import React, { useState, useEffect, useContext } from 'react';
import './HeroSection.css';
import avivaHero from '../../assets/finova_logo.svg';
import RegistrationForm from './Reg';
import { AuthContext } from '../../context/AuthContext';

const HeroSection = () => {
  const [isMobile, setIsMobile] = useState(false);
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section id="hero" className="hero-section">
        <div className="overlay position-absolute top-0 start-0 w-100 h-100"></div>

        <div className="hero-section-container position-relative z-2">
          <div className="udaan-hero-flex-row">
            {/* LEFT: Title + Info Cards */}
            <div className="udaan-left-holder col-12 col-md-10 col-lg-7 mb-4">
              <div className="d-flex flex-column">
                <img src={avivaHero} alt="Aviva" className="aviva-hero-svg" />
                <div className="udaan-hero-title d-inline-block">
                VyaparaMitra<br/> Program - <br/>Relationship Officer
                </div>
              </div>
              <div className="udaan-info-cards d-flex flex-wrap mt-4">
                <div className="udaan-info-card"><span className="chip-dot" />Starting CTC of Rs 2.4LPA + variable</div>
                <div className="udaan-info-card"><span className="chip-dot" />Fees: Rs 1,00,000 (inclusive of taxes)</div>
                <div className="udaan-info-card"><span className="chip-dot" />Classroom Training: 1 Month</div>
                <div className="udaan-info-card"><span className="chip-dot" />OJT: 2 Months</div>
                <div className="udaan-info-card"><span className="chip-dot" />Stipend: Rs 34,000</div>
              </div>
            </div>

            {/* RIGHT: Registration Form – Desktop Only */}
            {!isMobile && !isAuthenticated && (
              <div className="udaan-right-holder">
                <div className="bg-white text-dark p-4 rounded shadow-sm w-100 form-box">
                  <div className="heading-registration-home-page">
                    Talk to our counsellors to know more!
                  </div>
                  <RegistrationForm />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* MOBILE FORM – Rendered BELOW Hero */}
      {isMobile && !isAuthenticated && (
        <section className="mobile-registration-wrapper">
          <div className="form-box-mobile bg-white text-dark p-4 rounded shadow-sm w-90 mx-auto my-4">
            <div className="heading-registration-home-page text-center mb-3">
              Talk to our counsellors to know more!
            </div>
            <RegistrationForm />
          </div>
        </section>
      )}
    </>
  );
};

export default HeroSection;
