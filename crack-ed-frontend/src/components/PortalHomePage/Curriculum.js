import React from 'react';
import { BarChart4, Megaphone, TrendingUp } from 'lucide-react';
import './CurriculumSection.css'; // for custom colors
import BankingIcon1 from "../../assets/banking_icon1.png"
import BankingIcon2 from "../../assets/banking_icon2.png"
import BankingIcon3 from "../../assets/banking_icon3.png"

const curriculum = [
  {
    title: 'Banking & Financial Fundamentals',
    description:
      'Build a strong foundation in core banking operations and financial concepts, helping you understand how the banking industry works.',
    icon: BankingIcon1,
  },
  {
    title: 'Communication & Sales Skills',
    description:
      'Develop effective communication techniques, learn how to approach potential customers, generate leads, and handle objections with confidence and persuasion.',
    icon: BankingIcon2,
  },
  {
    title: 'Growth-Oriented Mindset',
    description:
      'Adopt a growth-driven mindset focused on continuous learning, goal-setting, and professional development to succeed in a fast-paced banking environment.',
    icon: BankingIcon3,
  },
];

const JobCard = ({title,description,icon,index}) => {
  return (
    <div className="curriculum-job-card">
      <div className="curriculum-icon-holder">
        <div className="curriculum-icon-wrapper">
        <img src={icon} className='curriculum-icon-box'></img>
          
        </div>
      </div>
      <div className="curriculum-card-header">
        {title}
      </div>
      <div className="curriculum-card-body">
        {description}
      </div>
    </div>
  );
};

const CurriculumSection = () => {
  return (
    <section className="curriculum-section bg-white">
      <h2 className="portal-section-title text-center">Become An Expert In Banking</h2>

      <div className="">
        <div className="curriculum-section-items">
          {curriculum.map((item, index) => (
            <JobCard icon={item.icon} title={item.title} description={item.description} key={index} index={index}/>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CurriculumSection;
