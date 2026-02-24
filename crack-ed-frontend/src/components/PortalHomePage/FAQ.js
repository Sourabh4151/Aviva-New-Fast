// import React, { useState } from 'react';
// import { ChevronDown, ChevronUp } from 'lucide-react';
// import './FAQ.css'; // For custom styles

// const faqs = [
//   "Is job placement truly guaranteed after joining the AURUM program?",
//   "Do I need to pay the full ₹1.5 lakh fee upfront?",
//   "Will I earn back the course fee?",
//   "Do we receive any stipend during training?",
//   "What will my job involve after placement? Is it fieldwork-heavy?",
//   "Can I be placed in my home city or nearby location?",
//   "What does the career growth path look like?"
// ];

// const FAQ = () => {
//   const [openIndex, setOpenIndex] = useState(null);

//   const toggle = (index) => {
//     setOpenIndex(openIndex === index ? null : index);
//   };

//   return (
//     <section className="py-5 bg-white px-3">
//       <div className="container" style={{ maxWidth: '800px' }}>
//         <div className="text-white text-center py-3 rounded-top bg-orange fw-semibold">
//           Frequently Asked Questions
//         </div>
//         <div className="accordion border border-top-0 border-orange rounded-bottom">
//           {faqs.map((question, index) => (
//             <div
//               key={index}
//               className="faq-item d-flex justify-content-between align-items-center px-3 py-3 border-top"
//               onClick={() => toggle(index)}
//               role="button"
//             >
//               <span className="small text-dark">{`${index + 1}. ${question}`}</span>
//               {openIndex === index ? (
//                 <ChevronUp size={16} className="text-orange" />
//               ) : (
//                 <ChevronDown size={16} className="text-orange" />
//               )}
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default FAQ;


import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import './FAQ.css'; // For custom styles
import dropDownIcon from './dropdown_icon.png'
import dropUpIcon from './dropup_icon.png'
const faqs = [
  {
    question: "Is job placement truly guaranteed after joining the program?",
    answer: "After succesful completion of the classrom you will enter Internship/On the Job Training with a reputed bank. Based on your performance during this phase you will be offered a full time role at the bank."
  },
  {
    question: " Do I need to pay the full fee upfront?",
    answer: "No, you don't. We offer flexible EMI and installment options for up to 18 months, making it easier for you to invest in your future."
  },
  {
    question: "Do we receive any stipend during training?",
    answer: "Yes, during your classroom training training you'll receive a stipend of ₹5,000, and during Internship/OJT you will receive a stipened of Rs. 10000."
  },
  {
    question: "Can I be placed in my home city or nearby location?",
    answer: "Placement at a specific location will depend on role availability at the time of OJT completion."
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faq-container-section bg-white">
      <div className="faq-container-section-container">
        <div className="faq-heading">FAQ's</div>
        <div className="accordion faq-accordion rounded-bottom">
          {faqs.map(({ question, answer }, index) => (
            <div key={index} className="faq-item border order-top">
              <div
                className="faq-question d-flex justify-content-between gap-2 align-items-center"
                onClick={() => toggle(index)}
                role="button"
              >
                <span className="text-dark">{`${index + 1}. ${question}`}</span>
                {openIndex === index ? (
                  <img className='faq-dropdown-icon' src={dropUpIcon} ></img>
                ) : (
                  <img className='faq-dropdown-icon' src={dropDownIcon} ></img>
                )}
              </div>
              {openIndex === index && (
                <div className="faq-answer  text-muted">
                  {answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
