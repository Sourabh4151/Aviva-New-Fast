import channelPartnersIcon from "../assets/1st.svg";
import vendorsIcon from "../assets/2nd.svg";
import studentNetworkIcon from "../assets/3rd.svg";

const AUDIENCES = [
  {
    icon: channelPartnersIcon,
    label: "சேனல் கூட்டாளர்கள் / ஆலோசகர்கள்",
  },
  {
    icon: vendorsIcon,
    label: "விற்பனையாளர்கள் / ஃப்ரீலான்சர்கள் / கல்வி நிறுவனங்கள்",
  },
  {
    icon: studentNetworkIcon,
    label: "மாணவர் வலையமைப்பு உள்ள யாரும்",
  },
];

export default function WhoCanJoinSection() {
  return (
    <section className="who-can-join-section" aria-labelledby="who-can-join-heading">
      <div className="who-can-join-section__inner">
        <header className="who-can-join-section__header">
          <h2 id="who-can-join-heading" className="who-can-join-section__title">
          யார் சேரலாம்?
          </h2>
          <span className="who-can-join-section__underline" aria-hidden="true" />
        </header>

        <div className="who-can-join-card">
          <ul className="who-can-join-grid">
            {AUDIENCES.map((item) => (
              <li key={item.label} className="who-can-join-item">
                <img
                  src={item.icon}
                  alt=""
                  aria-hidden="true"
                  className="who-can-join-item__icon"
                />
                <p className="who-can-join-item__label">{item.label}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
