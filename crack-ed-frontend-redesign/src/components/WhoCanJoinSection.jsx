import channelPartnersIcon from "../assets/1st.svg";
import vendorsIcon from "../assets/2nd.svg";
import studentNetworkIcon from "../assets/3rd.svg";

const AUDIENCES = [
  {
    icon: channelPartnersIcon,
    label: "चैनल पार्टनर्स / कंसल्टेंट्स",
  },
  {
    icon: vendorsIcon,
    label: "वेंडर्स / फ्रीलांसर्स / संस्थान",
  },
  {
    icon: studentNetworkIcon,
    label: "कोई भी जिसके पास छात्रों का नेटवर्क हो",
  },
];

export default function WhoCanJoinSection() {
  return (
    <section className="who-can-join-section" aria-labelledby="who-can-join-heading">
      <div className="who-can-join-section__inner">
        <header className="who-can-join-section__header">
          <h2 id="who-can-join-heading" className="who-can-join-section__title">
          कौन जुड़ सकता है?
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
