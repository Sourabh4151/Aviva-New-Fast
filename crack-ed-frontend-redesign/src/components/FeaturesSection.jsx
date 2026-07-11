import earnIcon from "../assets/Vector.svg";
import zeroInvestmentIcon from "../assets/Vector (1).svg";
import jobLinkedIcon from "../assets/Vector (2).svg";
import supportIcon from "../assets/Vector (3).svg";

const FEATURES = [
  {
    icon: earnIcon,
    title: "ప్రతి అడ్మిషన్‌పై సంపాదించండి",
    description: "ప్రతి విజయవంతమైన విద్యార్థి అడ్మిషన్‌కు చెల్లింపులు పొందండి.",
  },
  {
    icon: zeroInvestmentIcon,
    title: "ఎలాంటి ముందస్తు పెట్టుబడి అవసరం లేదు",
    description: "ఎలాంటి ప్రారంభ ఖర్చు లేకుండా సంపాదించడం ప్రారంభించండి.",
  },
  {
    icon: jobLinkedIcon,
    title: "ఉద్యోగ-అనుసంధాన ప్రోగ్రామ్‌లు",
    description: "ఉద్యోగ అవకాశాలతో కూడిన ప్రోగ్రామ్‌లను ప్రచారం చేయండి.",
  },
  {
    icon: supportIcon,
    title: "ప్రత్యేక సహాయం",
    description: "మా పార్ట్నర్ సక్సెస్ టీమ్ నుంచి పూర్తి సహాయం పొందండి.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="features-section" aria-label="Partner benefits">
      <div className="features-section__inner">
        <ul className="features-grid">
          {FEATURES.map((feature) => (
            <li key={feature.title} className="feature-card">
              <img
                src={feature.icon}
                alt=""
                aria-hidden="true"
                className="feature-card__icon"
              />
              <h3 className="feature-card__title">{feature.title}</h3>
              <p className="feature-card__description">{feature.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
