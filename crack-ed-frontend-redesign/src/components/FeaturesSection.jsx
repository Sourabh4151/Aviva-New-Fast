import earnIcon from "../assets/Vector.svg";
import zeroInvestmentIcon from "../assets/Vector (1).svg";
import jobLinkedIcon from "../assets/Vector (2).svg";
import supportIcon from "../assets/Vector (3).svg";

const FEATURES = [
  {
    icon: earnIcon,
    title: "हर एडमिशन पर कमाएँ",
    description: "हर सफल छात्र एडमिशन पर कमीशन प्राप्त करें।",
  },
  {
    icon: zeroInvestmentIcon,
    title: "बिना किसी शुरुआती निवेश के",
    description: "बिना किसी शुरुआती लागत के कमाई शुरू करें।",
  },
  {
    icon: jobLinkedIcon,
    title: "जॉब-लिंक्ड प्रोग्राम्स",
    description: "प्लेसमेंट सहायता वाले प्रोग्राम्स को प्रमोट करें।",
  },
  {
    icon: supportIcon,
    title: "समर्पित सहायता",
    description: "हमारी पार्टनर सक्सेस टीम से पूरा सहयोग प्राप्त करें।",
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
