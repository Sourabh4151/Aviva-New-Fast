const STEPS = [
  {
    number: "1",
    title: "கூட்டாளராக பதிவு செய்யுங்கள்",
    description: "படிவத்தை நிரப்பி, NCP Ads சேனல் கூட்டாளராக சரிபார்க்கப்படுங்கள்.",
  },
  {
    number: "2",
    title: "உங்கள் வலையமைப்புடன் பயிற்சி திட்டங்களைப் பகிருங்கள்",
    description: "உங்கள் வலையமைப்பில் உள்ள மாணவர்களிடம் எங்கள் திறன் மேம்பாட்டு (Skill) திட்டங்களை அறிமுகப்படுத்துங்கள்.",
  },
  {
    number: "3",
    title: "வெற்றிகரமான மாணவர் சேர்க்கைகளில் வருமானம் பெறுங்கள்",
    description: "ஒவ்வொரு மாணவர் சேர்க்கைக்கும் கவர்ச்சிகரமான கமிஷனைப் பெறுங்கள்.",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="how-it-works-section" aria-labelledby="how-it-works-heading">
      <div className="how-it-works-section__inner">
        <header className="how-it-works-section__header">
          <h2 id="how-it-works-heading" className="how-it-works-section__title">
          இது எப்படி செயல்படுகிறது
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
