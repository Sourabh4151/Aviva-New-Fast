import React from 'react';
import SelectionIcon1 from '../../assets/selection_icon1.png'
import SelectionIcon2 from '../../assets/selection_icon2.png'
import SelectionIcon3 from '../../assets/selection_icon3.png'
import SelectionIcon4 from '../../assets/selection_icon4.png'
import SelectionIcon5 from '../../assets/selection_icon5.png'

import {
  Laptop,
  MonitorSmartphone,
  Users,
  Handshake,
  Briefcase
} from 'lucide-react';
import './SelectionProcess.css'; // for .icon-wrapper and .text-purple

const steps = [
  {
    icon: <img className="icon-size text-purple"  src={SelectionIcon1}/>,
    text: "Submit your online application to get started",
  },
  {
    icon: <img className="icon-size text-purple"  src={SelectionIcon2}/>,
    text: "Attend the Pre-Placement Talk to learn more about the program",
  },
  {
    icon: <img className="icon-size text-purple"  src={SelectionIcon3}/>,
    text: "Take a quick interview to help us understand your potential.",
  },
  {
    icon: <img className="icon-size text-purple"  src={SelectionIcon4}/>,
    text: "Secure your spot by completing enrollment and payment.",
  },
  {
    icon: <img className="icon-size text-purple"  src={SelectionIcon5}/>,
    text: "Start your training and get ready to launch your career with confidence.",
  },
];

const SelectionProcess = () => {
  return (
    <section className="selection-process-section bg-white " id='eligibility'>
      <div className="container">
        <h2 className="portal-section-title">Selection Process</h2>
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-5 g-4">
          {steps.map((step, index) => (
            <div
              key={index}
              className="d-flex  flex-row flex-grow-1 flex-md-column align-items-center text-center text-md-start gap-3 px-2"
            >
              <div className="icon-wrapper d-flex justify-content-center align-items-center">
                <div className='icon-selection-process'>
                {step.icon}
                </div>

              </div>
              <p className="small icon-selection-items about-text-secondary mb-0 flex-grow-1">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SelectionProcess;
