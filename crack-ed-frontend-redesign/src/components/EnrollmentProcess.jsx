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
      "Pay registration fees of ₹2000 and attend 3-5 days of online training program that equips with industry awareness and skills.",
  },
  {
    number: "03",
    title: "Clear Corporate Interview",
    description:
      "Clear the post training assessment. Your recorded interviews will be shared with Vedantu.",
  },
  {
    number: "04",
    title: "Selection & Fees",
    description:
      "Selected candidates receive a Letter of Intent confirming their provisional selection, and will have to pay the full program fee.",
  },
  {
    number: "05",
    title: "Classroom Training",
    description:
      "3 weeks of intensive, AI-led online training that is built on practical knowledge and real-world scenarios to prepare you for the job.",
  },
  {
    number: "06",
    title: "On the Job Training",
    description:
      "Join up to 3 months of OJT as EdTech Sales Executive with stipend of ₹20,000 per month. Post OJT convert to full time role.",
  },
  {
    number: "07",
    title: "Onboarding",
    description: "After completion of OJT transition into full time role.",
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
              <span className="xl:hidden">Candidate's Journey</span>
              <span className="hidden xl:inline">Candidate Journey</span>
            </div>
            <p className="enrollment-heading">
              A simple, step-by-step process designed to help you get started with
              confidence.
            </p>
          </div>

          {/* Desktop timeline */}
          <div className="enrollment-journey hidden xl:flex">
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
                <div className="enrollment-ticks" aria-hidden="true">
                  {STEPS.map((step) => (
                    <span key={`tick-${step.number}`} className="enrollment-tick" />
                  ))}
                </div>
              </div>
            </div>

            <div className="enrollment-copy enrollment-steps-grid">
              {STEPS.map((step) => (
                <div key={`copy-${step.number}`} className="enrollment-step">
                  <h3 className="enrollment-step-title">{step.title}</h3>
                  <p className="enrollment-step-desc">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile stacked list */}
          <ol className="enrollment-mobile-list xl:hidden">
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
