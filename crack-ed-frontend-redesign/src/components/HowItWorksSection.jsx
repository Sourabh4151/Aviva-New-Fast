const STEPS = [
  {
    number: "1",
    title: "భాగస్వామిగా నమోదు చేసుకోండి",
    description: "ఫారమ్‌ను పూరించి, NCP Ads ఛానల్ భాగస్వామిగా ధృవీకరించబడండి.",
  },
  {
    number: "2",
    title: "మీ నెట్‌వర్క్‌తో ప్రోగ్రామ్‌లను పంచుకోండి",
    description: "మీ నెట్‌వర్క్‌లోని విద్యార్థులకు మా స్కిల్ ప్రోగ్రామ్‌లను ప్రచారం చేయండి.",
  },
  {
    number: "3",
    title: "విజయవంతమైన అడ్మిషన్‌లపై సంపాదించండి",
    description: "ప్రతి విద్యార్థి అడ్మిషన్‌కు ఆకర్షణీయమైన చెల్లింపులు పొందండి.",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="how-it-works-section" aria-labelledby="how-it-works-heading">
      <div className="how-it-works-section__inner">
        <header className="how-it-works-section__header">
          <h2 id="how-it-works-heading" className="how-it-works-section__title">
          ఇది ఎలా పనిచేస్తుంది
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
