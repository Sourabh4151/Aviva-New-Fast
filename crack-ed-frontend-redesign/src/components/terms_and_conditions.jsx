import React from "react";

const TERMS = [
  "Referral commission will be released only after the full CIB amount is received.",
  "A commission of Rs 10,000 is applicable for successful admissions into programs with a course fee of Rs 1 lakh or above.",
  "A commission of Rs 5,000 is applicable for successful admissions into programs with a course fee below Rs 1 lakh.",
];

export default function TermsAndConditions() {
  return (
    <section className="terms-section" aria-labelledby="terms-heading">
      <div className="terms-inner">
        <h2 id="terms-heading" className="terms-heading">
          Terms and Conditions
        </h2>
        <ul className="terms-list">
          {TERMS.map((text) => (
            <li key={text} className="terms-item">
              {text}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
