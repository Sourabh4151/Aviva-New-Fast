import React from 'react';
import './ProgramFeatures.css';
import Icon1 from '../../assets/1st.svg';
import Icon2 from '../../assets/2nd.svg';
import Icon3 from '../../assets/3rd.svg';
import Icon4 from '../../assets/4th.svg';

const features = [
  {
    icon: Icon1,
    title: 'Curriculum Curated for Performers',
    body: 'Our three-tier approach—Utthan, Aarohan, and Shikhar—guides learners from core fundamentals to on-the-job readiness, ensuring training translates into real workplace performance.'
  },
  {
    icon: Icon2,
    title: 'Experiential Learning',
    body: 'Our experiential learning approach turns classroom into active spaces, helping you understand concepts closely and retain them longer.'
  },
  {
    icon: Icon3,
    title: 'Technology That Transforms',
    body: 'Practice real workplace situations through AI-powered simulations that mirror everyday conversations and decisions on the job.'
  },
  {
    icon: Icon4,
    title: 'OJT Support',
    body: 'Bi-monthly sessions during OJT to understand performance and smoothen transition to your full-time role.'
  }
];

const ProgramFeatures = () => {
  return (
    <section className="program-features" id="program-features">
      <div className="program-features-container">
        <div className="features-grid">
          {features.map((f, idx) => (
            <article className="feature-card" key={idx}>
              <div className="feature-left">
                <img src={f.icon} alt="" className="feature-icon-img" />
              </div>
              <div className="feature-right">
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-body">{f.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProgramFeatures;
