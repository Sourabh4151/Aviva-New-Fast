import React from "react";

const INSTALLMENTS = [
  { number: "01", label: "At Application", amount: "₹15,000/-" },
  {
    number: "02",
    label: "Within one week of offer rollout",
    amount: "₹95,000/-",
  },
  { number: "03", label: "01 December 2026", amount: "₹95,000/-" },
  { number: "04", label: "01 January 2027", amount: "₹95,000/-" },
];

export default function ProgramFee() {
  return (
    <section
      id="program-fee"
      className="relative bg-black text-white scroll-mt-24 overflow-hidden"
    >
      <div className="relative z-10 mx-auto px-section py-section lg:px-[120px] lg:py-20">
        <div className="program-fee-inner">
          <div className="program-fee-copy">
            <div className="program-fee-copy-top">
              <div className="program-fee-pill">Program Fee</div>

              <h2 className="program-fee-heading">
                <em>Investment</em> in Your Entrepreneurial Journey
              </h2>

              <p className="program-fee-body">
                The fees includes mentorship, one on one guidance, access to
                live classes, campus immersion and expert advisory along with
                access to lifetime community. Flexible EMI and education
                financing partners available.
              </p>
            </div>

            <p className="program-fee-discount">
              * Pay full fees upfront and enjoy an exclusive{" "}
              <span>5% Discount</span>
            </p>
          </div>

          <div className="program-fee-card-wrap">
            <div className="program-fee-card-glow" aria-hidden="true" />

            <div className="program-fee-card">
              <div className="program-fee-card-header">
                <p className="program-fee-card-label">Total Investment</p>
                <p className="program-fee-amount">₹3,00,000/-</p>
                <p className="program-fee-tax">(Inclusive of all taxes)</p>
              </div>

              <ul className="program-fee-schedule">
                {INSTALLMENTS.map((item) => (
                  <li key={item.number} className="program-fee-row">
                    <span className="program-fee-row-num">{item.number}</span>
                    <span className="program-fee-row-label">{item.label}</span>
                    <span className="program-fee-row-amount">{item.amount}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
