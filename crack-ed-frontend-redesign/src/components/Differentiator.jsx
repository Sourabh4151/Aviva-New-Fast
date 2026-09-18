import React from "react";
import arrowRightThin from "../assets/arrow-right-thin.svg";

const STEPS = [
  {
    title: "Analyze",
    description:
      "Understand the EdTech industry, Inside Sales role, customer journey, sales fundamentals, KPIs and performance expectations.",
  },
  {
    title: "Build",
    description:
      "Develop the skills to sell effectively through communication, consultative selling, objection handling, product mastery and CRM tools. Learners also practise through AI-led roleplays and simulated sales conversations.",
  },
  {
    title: "Calibrate",
    description:
      "AI-powered practice helps learners repeatedly practise conversations, handle objections and improve their performance.",
  },
];

export default function Differentiator() {
  return (
    <section
      id="differentiator"
      className="differentiator relative text-white scroll-mt-24 overflow-hidden"
    >
      <div className="relative z-10 mx-auto px-section py-section lg:px-[120px] lg:pt-[110px] lg:pb-[110px]">
        <div className="differentiator-container mx-auto flex w-full max-w-[1040px] flex-col">
          <div className="differentiator-header">
            <div className="differentiator-pill">Differentiator</div>
            <h2 className="differentiator-heading">Why Crack-ED?</h2>
          </div>

          <div className="differentiator-body">
            <p>
              Sales in EdTech can be a high-reward, high-pressure career. Daily
              targets, multiple KPIs, constant follow-ups and rejection demand
              more than just the ability to pitch and close. Crack-ED prepares
              learners for the reality of the job.
            </p>
            <p>
              Our ABC Framework of Job Readiness takes learners from
              understanding the role to building practical skills and performing
              with confidence.
            </p>
          </div>

          <div className="differentiator-abc">
            {STEPS.map((step, index) => (
              <React.Fragment key={step.title}>
                <article className="differentiator-step">
                  <h3 className="differentiator-step-title">{step.title}</h3>
                  <p className="differentiator-step-desc">{step.description}</p>
                </article>
                {index < STEPS.length - 1 && (
                  <img
                    src={arrowRightThin}
                    alt=""
                    className="differentiator-arrow"
                    width={50}
                    height={43}
                    aria-hidden="true"
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
