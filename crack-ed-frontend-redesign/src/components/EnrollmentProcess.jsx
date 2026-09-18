import React from "react";

const FONT_MONTSERRAT =
  "Montserrat, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const STEPS = [
  {
    number: "01",
    title: "Online Application & Screening",
    description:
      "Start by filling out the application form and appear for screening interview to assess your communication skills and aptitude.",
  },
  {
    number: "02",
    title: "Pre-Interview Training",
    description:
      "Pay registration fees of ₹2000 and attend one-week online training program that equips with industry awareness and skills, interview readiness and resume building.",
  },
  {
    number: "03",
    title: "Clear Corporate Interview",
    description:
      "Clear the assessment. Your recorded interviews will be shared with corporate employers, giving you 3 assured selection opportunities.",
  },
  {
    number: "04",
    title: "Selection & Fees",
    description:
      "Selected candidates receive an Letter of Intent confirming their provisional selection, and will have to pay the full program fee.",
  },
  {
    number: "05",
    title: "Classroom Training",
    description:
      "2-3 weeks of intensive, AI-led online training that is built on practical knowledge and real-world scenarios to prepare you for the job.",
  },
  {
    number: "06",
    title: "Onboarding",
    description:
      "Transition into a full-time role as an EdTech Sales Executive upon successful completion of the training.",
  },
];

export default function EnrollmentProcess() {
  return (
    <section
      id="enrollment-process"
      className="enrollment-process relative bg-black text-white overflow-hidden scroll-mt-24"
    >
      <div className="enrollment-process-frame relative z-10 mx-auto">
        <div className="enrollment-main">
          <div className="enrollment-header">
            <div className="enrollment-pill" style={{ fontFamily: FONT_MONTSERRAT }}>
              <span className="lg:hidden">Candidate's Journey</span>
              <span className="hidden lg:inline">Candidate Journey</span>
            </div>
            <p className="enrollment-heading">
              A simple, step-by-step process designed to help you get started with
              confidence.
            </p>
          </div>

          {/* Desktop timeline */}
          <div className="enrollment-journey hidden lg:flex">
            <div className="enrollment-journey-line">
              <div className="enrollment-steps-grid">
                {STEPS.map((step) => (
                  <div key={`num-${step.number}`} className="enrollment-step-num">
                    {step.number}
                  </div>
                ))}
              </div>

              <div className="enrollment-track">
                <div className="enrollment-line" />
                {STEPS.map((step, index) => (
                  <span
                    key={`tick-${step.number}`}
                    className="enrollment-tick"
                    style={{ left: `${((index + 0.5) / STEPS.length) * 100}%` }}
                    aria-hidden="true"
                  />
                ))}
              </div>
            </div>

            <div className="enrollment-copy">
              <div className="enrollment-steps-grid">
                {STEPS.map((step) => (
                  <h3 key={`title-${step.number}`} className="enrollment-step-title">
                    {step.title}
                  </h3>
                ))}
              </div>
              <div className="enrollment-steps-grid">
                {STEPS.map((step) => (
                  <p key={`desc-${step.number}`} className="enrollment-step-desc">
                    {step.description}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile stacked list */}
          <ol className="enrollment-mobile-list lg:hidden">
            {STEPS.map((step) => (
              <li key={step.number} className="enrollment-mobile-step">
                <h3 className="enrollment-mobile-title">
                  {step.number} - {step.title}
                </h3>
                <p className="enrollment-mobile-desc">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
