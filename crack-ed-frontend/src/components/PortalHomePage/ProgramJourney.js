import React, { useState, useEffect } from 'react';
import { GraduationCap, Briefcase } from 'lucide-react';
import './ProgramJourney.css'; // Create this for custom styles
import utthaanImg from './path-to-utthaan.png';
import aarohanImg from './path-to-aarohan.png';
import shikharImg from './path-to-shikhar.png';


const BankAbsorptionCard = ({details,children}) => {
  return (
    <div className="bank-card">
      <div className="bank-icon-wrapper">
        <div className="bank-icon">
          {children}
        </div>
      </div>
      <p className="bank-text about-text-secondary">
      {details}
      </p>
    </div>

  );
};



const ProgramJourney = () => {
  const journeyData = [
    {
      title: 'Utthaan',
      points: [
        'Banking & finance essentials',
        'Excel, PowerPoint & number skills',
        'Communication & workplace readiness',
        'Real-world business fundamentals',
      ],
      img: utthaanImg,
    },
    {
      title: 'Aarohan',
      points: [
        'CASA Products & Use-Cases',
        'Cross-Selling Related Offerings',
        'Understanding Customer Needs',
        'Ethical Sales & Compliance',
      ],
      img: aarohanImg,
    },
    {
      title: 'Shikhar',
      points: [
        'Smart lead generation tactics',
        'Confident pitching & handling objections',
        'Effective cross-selling & upselling',
        'Delivering standout service experiences',
      ],
      img: shikharImg,
    },
  ];

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setActiveIndex(null); // reset dropdown on desktop
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleDropdown = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="program-journey-section bg-white">
      <div className="container">
      <h2 className="portal-section-title text-start">Your Program Journey</h2>

        {/* Classroom Training Header */}
        <div className="journey-header mb-4 text-white px-3 py-3 rounded fw-semibold text-center">
          45 Days of Classroom Training
        </div>

        {/* Cards or Dropdowns */}
        {isMobile ? (
          <div className="accordion" id="programJourneyAccordion">
            {journeyData.map((item, index) => (
              <div className="accordion-item" key={index}>
                <h2 className="accordion-header " id={`heading${index}`}>
                  <button
                    className={`accordion-button program-journey-card ${activeIndex === index ? '' : 'collapsed'}`}
                    type="button"
                    onClick={() => toggleDropdown(index)}
                    aria-expanded={activeIndex === index}
                    aria-controls={`collapse${index}`}
                  >
                    {item.title}
                  </button>
                </h2>
                <div
                  id={`collapse${index}`}
                  className={`accordion-collapse collapse ${activeIndex === index ? 'show' : ''}`}
                  aria-labelledby={`heading${index}`}
                  data-bs-parent="#programJourneyAccordion"
                >
                  <div className="accordion-body">
                    <img src={item.img} alt={item.title} className="img-fluid mb-3" />
                    <ul className="small ps-3">
                      {item.points.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="row g-4">
            {journeyData.map((item, index) => (
              <div key={index} className="col-md-4">
                <div className="program-journey-card h-100 border border-light shadow-sm">
                  <img src={item.img} alt={item.title} className="card-img-top" />
                  <div className="card-body">
                    <h5 className="card-title text-purple fw-semibold">{item.title}</h5>
                    <ul className="card-text about-text-secondary ps-3">
                      {item.points.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* On-the-Job Training Header */}
        <div className="journey-header my-5 text-center text-white px-3 py-3 rounded fw-semibold">
          60 Days of Paid On-The-Job Training
        </div>

        {/* Paragraph */}
        <div className="bg-light-pink p-4 rounded journey-header-desc">
          Transition smoothly into the professional world with OJT, where you'll work on live projects, interact with customers, and get a firsthand experience of the roles and responsibilities that await you post- graduation. Participants will receive a stipend of Rs 15,000, further supporting their transition into the professional environment while allowing them to apply their learning to real-world projects.
        </div>

        {/* Outcomes */}
        <div className="BankAbsorptionCard">
          <BankAbsorptionCard details="Upon successful completion of the initial 3-month period, the candidate will be absorbed into AU Small Finance Bank as a Bank Officer." children={<Briefcase className="text-purple" />}/>
          <BankAbsorptionCard details="After successfully completing the program, the candidate receives a Post Graduate Certificate from IMT Ghaziabad (CDL)." children={<GraduationCap className="text-purple" />}/>
        </div>

      </div>
    </section>
  );
};

export default ProgramJourney;
