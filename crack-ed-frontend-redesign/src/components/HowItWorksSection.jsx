const STEPS = [
  {
    number: "1",
    title: "Register as a Partner",
    description: "Fill out the form and get verified as an NCP Ads channel partner",
  },
  {
    number: "2",
    title: "Share Programs with Your Network",
    description: "Promote our skill programs to students in your network",
  },
  {
    number: "3",
    title: "Earn on Successful Enrollments",
    description: "Receive attractive payouts for every student admission",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="how-it-works-section" aria-labelledby="how-it-works-heading">
      <div className="how-it-works-section__inner">
        <header className="how-it-works-section__header">
          <h2 id="how-it-works-heading" className="how-it-works-section__title">
            How It Works
          </h2>
          <span className="how-it-works-section__underline" aria-hidden="true" />
        </header>

        <ol className="how-it-works-steps">
          {STEPS.map((step) => (
            <li key={step.number} className="how-it-works-step">
              <div className="how-it-works-step__badge" aria-hidden="true">
                {step.number}
              </div>
              <h3 className="how-it-works-step__title">{step.title}</h3>
              <p className="how-it-works-step__description">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
