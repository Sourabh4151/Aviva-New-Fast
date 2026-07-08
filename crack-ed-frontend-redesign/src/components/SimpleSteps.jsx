import React from "react";

import iconSubmit from "../assets/1st.svg";
import iconConnect from "../assets/2nd.svg";
import iconPaid from "../assets/3rd.svg";

const STEPS = [
  {
    id: 1,
    title: "1. Submit Details",
    description:
      "Enter your contact info and your friend's details in the form above. Takes less than 60 seconds!",
    icon: iconSubmit,
    iconAlt: "",
  },
  {
    id: 2,
    title: "2. We Connect",
    description:
      "Our career experts reach out and guide them through our top job-linked programs tailored to their profile.",
    icon: iconConnect,
    iconAlt: "",
  },
  {
    id: 3,
    title: "3. Get Paid",
    description:
      "Receive your commission within 7 days of enrollment. No delays, no excuses.",
    icon: iconPaid,
    iconAlt: "",
  },
];

export default function SimpleSteps() {
  return (
    <section className="simple-steps" aria-labelledby="simple-steps-heading">
      <div className="simple-steps-inner">
        <div className="simple-steps-header">
          <span className="simple-steps-badge">Simple Process</span>
          <h2 id="simple-steps-heading" className="simple-steps-title">
            Three Simple Steps to <span className="text-[#1A9EB7]">Rs 10,000</span>
          </h2>
        </div>

        <div className="simple-steps-grid">
          {STEPS.map((step) => (
            <article key={step.id} className="simple-steps-card">
              <img
                src={step.icon}
                alt={step.iconAlt}
                aria-hidden="true"
                className="simple-steps-icon"
              />
              <div className="simple-steps-card-body">
                <h3 className="simple-steps-card-title">{step.title}</h3>
                <p className="simple-steps-card-desc">{step.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
