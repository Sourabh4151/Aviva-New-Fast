const STEPS = [
  {
    number: "1",
    title: "पार्टनर के रूप में रजिस्टर करें",
    description: "फॉर्म भरें और NCP Ads चैनल पार्टनर के रूप में वेरिफाई हों।",
  },
  {
    number: "2",
    title: "अपने नेटवर्क के साथ प्रोग्राम्स साझा करें",
    description: "अपने नेटवर्क के छात्रों के साथ हमारे स्किल प्रोग्राम्स साझा करें।",
  },
  {
    number: "3",
    title: "सफल एडमिशन पर कमाई करें",
    description: "हर छात्र के एडमिशन पर आकर्षक कमीशन प्राप्त करें।",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="how-it-works-section" aria-labelledby="how-it-works-heading">
      <div className="how-it-works-section__inner">
        <header className="how-it-works-section__header">
          <h2 id="how-it-works-heading" className="how-it-works-section__title">
          यह कैसे काम करता है
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
