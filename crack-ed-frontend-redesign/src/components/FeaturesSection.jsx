import earnIcon from "../assets/Vector.svg";
import zeroInvestmentIcon from "../assets/Vector (1).svg";
import jobLinkedIcon from "../assets/Vector (2).svg";
import supportIcon from "../assets/Vector (3).svg";

const FEATURES = [
  {
    icon: earnIcon,
    title: "Earn on Every Admission",
    description: "Get paid for every successful student enrollment",
  },
  {
    icon: zeroInvestmentIcon,
    title: "Zero Upfront Investment",
    description: "Start earning without any initial costs",
  },
  {
    icon: jobLinkedIcon,
    title: "Job-Linked Programs",
    description: "Promote programs with placement help",
  },
  {
    icon: supportIcon,
    title: "Dedicated Support",
    description: "Get help from our partner success team",
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
