import React from 'react';
import './AboutProgram.css'; 
import aboutProgramImg from './about-program.png';
import WhyChoose from '../../assets/why_choose.png';

const WhyChooseUS = () => {
  return (
    <section className="portal-about bg-light-pink" id='why'>
      <div className="container d-flex flex-column flex-md-row align-items-center gap-4 gap-md-5" >
        {/* Circular Images */}
        <div className="image-container flex-shrink-0  mb-md-0">
          <img
            src={WhyChoose}
            alt="About the Program"
            className="rounded w-100 img-fluid about-img desktop-img"
          />
          <img
            src={WhyChoose}
            alt="About the Program Mobile"
            className="img-fluid about-img mobile-img1"
          />
        </div>

        {/* Text Content */}
        <div className="text-container text-start px-3">
          <div className="title-text-purple">
          Why Choose This Program?
          </div>
          <p className="about-text-secondary mb-3 lh-relaxed">
          The Aurum Bankers Program is a 3.5 month course that offers a stipend during your learning journey.
          </p>
          <p className="about-text-secondary">
          With a focus on real-world experience, the program combines practical lessons and hands-on learning to help you grow.          
          </p> 
          <p className="about-text-secondary">
          On successfully completing the program, you'll have the chance to get job placement opportunities at Aurum Bank with a CTC of Rs 3.5 LPA.          </p> 
          <p className="about-text-secondary">
          The Aurum Bankers Program provides you with the skills and knowledge you need to make a smooth transition into the corporate world.          </p>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUS;
