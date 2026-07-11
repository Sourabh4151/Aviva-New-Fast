import earnIcon from "../assets/Vector.svg";
import zeroInvestmentIcon from "../assets/Vector (1).svg";
import jobLinkedIcon from "../assets/Vector (2).svg";
import supportIcon from "../assets/Vector (3).svg";

const FEATURES = [
  {
    icon: earnIcon,
    title: "ஒவ்வொரு சேர்க்கையிலும் வருமானம் பெறுங்கள்",
    description: "ஒவ்வொரு வெற்றிகரமான மாணவர் சேர்க்கைக்கும் கமிஷன் பெறுங்கள்.",
  },
  {
    icon: zeroInvestmentIcon,
    title: "முன்பணம் முதலீடு தேவையில்லை",
    description: "ஆரம்ப முதலீடு இல்லாமல் உடனே சம்பாதிக்கத் தொடங்குங்கள்.",
  },
  {
    icon: jobLinkedIcon,
    title: "வேலைவாய்ப்பு இணைந்த பயிற்சி திட்டங்கள்",
    description: "வேலைவாய்ப்பு உதவியுடன் கூடிய பயிற்சி திட்டங்களைப் பரிந்துரையுங்கள்.",
  },
  {
    icon: supportIcon,
    title: "பிரத்யேக ஆதரவு",
    description: "எங்கள் குழுவின் முழுமையான ஆதரவைப் பெறுங்கள்.",
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
