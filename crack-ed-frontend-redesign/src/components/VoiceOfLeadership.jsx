import React, { useState } from "react";
import amitImg from "../assets/Amit 1.png";
import debojitImg from "../assets/Debojit 1.png";
import vijayImg from "../assets/Vijay 1.png";
import rajnishImg from "../assets/Rajnish 1.png";
import carDekhoLogo from "../assets/car-dekho.svg";
import crackEdLogo from "../assets/crack-ed.svg";
import sharkTankLogo from "../assets/shark_tank.svg";
import bigBossLogo from "../assets/big_boss.svg";
import rajnishLogo from "../assets/rajnish.svg";
import iconModules from "../assets/Frame 343.svg";
import iconWeeks from "../assets/Frame 343 (1).svg";
import iconMasterclass from "../assets/Frame 343 (2).svg";
import iconInvestor from "../assets/Frame 343 (3).svg";
import iconCommunity from "../assets/Frame 343 (4).svg";
import bidLogo from "../assets/BID.svg";

const LEADERS = [
  {
    name: "Amit Jain",
    nameWeight: 500,
    role: "CEO & Co-Founder,",
    company: "Car Dekho",
    flipRole: "CEO & Co-Founder",
    companyLogo: carDekhoLogo,
    affiliationLabel: "Shark at",
    affiliationLogo: sharkTankLogo,
    mobileLines: ["CEO & Co-Founder, Car Dekho", "Shark at Shark Tank India"],
    image: amitImg,
  },
  {
    name: "Debojit Sen",
    nameWeight: 500,
    role: "CEO & Founder,",
    company: "Crack-ED",
    flipRole: "CEO & Founder",
    companyLogo: crackEdLogo,
    affiliationLabel: "Podcaster at",
    affiliationLogo: bidLogo,
    mobileLines: ["CEO & Founder, Crack-ED", "Podcaster at Badhta India Dekho"],
    image: debojitImg,
  },
  {
    name: "Vijay Vikram Singh",
    nameWeight: 500,
    role: "Bollywood Actor &",
    roleLine2: "Voice Artist",
    flipRole: "Bollywood Actor & Voice Artist",
    affiliationLabel: "Voice of",
    affiliationLogo: bigBossLogo,
    mobileLines: ["Bollywood Actor & Voice Artist", "Voice of Big Boss"],
    image: vijayImg,
  },
  {
    name: "Rajnish Virmani",
    nameWeight: 600,
    role: "Managing Partner",
    flipRole: "Managing Partner",
    affiliationLabel: "Mentor & Coach",
    affiliationLogo: rajnishLogo,
    mobileLines: ["Managing Partner", "Mentor & Coach at Positive Momemtum"],
    image: rajnishImg,
  },
];

const CATEGORIES = ["Growth", "Leadership", "Funding"];

const FEATURES = [
  {
    title: "8 Modules",
    description:
      "A practical journey from entrepreneurial mindset to investment-ready business covering strategy, finance, marketing, AI, growth, and investment readiness.",
    icon: iconModules,
  },
  {
    title: "26 Weeks",
    description:
      "A structured 26-week journey combining expert learning, hands-on application, and continuous progress with 6-hours weekend classes.",
    icon: iconWeeks,
  },
  {
    title: "4 Masterclass Series",
    description:
      "4 Exclusive masterclasses with business leaders, sharing practical lessons from building and scaling successful businesses.",
    icon: iconMasterclass,
  },
  {
    title: "Investor Access",
    description:
      "Gain direct access to investors, showcase your venture, and explore potential funding opportunities to accelerate your business growth.",
    icon: iconInvestor,
  },
  {
    title: "Lifelong Community",
    description:
      "Be a part of lifelong community of founders, mentors, investors, and business leaders while sharing knowledge and creating meaningful connections to discover opportunities.",
    icon: iconCommunity,
  },
];

function LeaderTitle({ leader }) {
  return (
    <div
      className={`leadership-card__title${
        leader.company ? "" : " leadership-card__title--single"
      }`}
    >
      <div className="leadership-card__title-desktop">
        <span className="leadership-card__role">{leader.role}</span>
        {leader.roleLine2 && (
          <span className="leadership-card__role">{leader.roleLine2}</span>
        )}
        {leader.company && (
          <span className="leadership-card__company">{leader.company}</span>
        )}
      </div>
      <div className="leadership-card__title-mobile">
        {leader.mobileLines.map((line) => (
          <span key={line} className="leadership-card__role">
            {line}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function VoiceOfLeadership() {
  const [flipped, setFlipped] = useState(null);

  const toggleFlip = (name) => {
    setFlipped((current) => (current === name ? null : name));
  };

  return (
    <section
      id="voice-of-leadership"
      className="leadership-section"
      aria-labelledby="leadership-heading"
    >
      <div className="leadership-container">
        <header className="leadership-header">
          <div className="leadership-badge">Voice of Leadership</div>
          <h2 id="leadership-heading" className="leadership-heading">
            Learn from <em>People who have Built</em>
          </h2>
        </header>

        <div className="leadership-cards">
          {LEADERS.map((leader) => {
            const isFlipped = flipped === leader.name;
            const nameClass = `leadership-card__name${
              leader.nameWeight === 600 ? " leadership-card__name--semibold" : ""
            }`;

            return (
              <article
                key={leader.name}
                className={`leadership-card${isFlipped ? " is-flipped" : ""}`}
                onClick={() => toggleFlip(leader.name)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    toggleFlip(leader.name);
                  }
                }}
                tabIndex={0}
                aria-pressed={isFlipped}
                aria-label={`${leader.name}. ${
                  isFlipped ? "Hide" : "Show"
                } profile details.`}
              >
                <div className="leadership-card__inner">
                  <div className="leadership-card__face leadership-card__face--front">
                    <div className="leadership-card__photo">
                      <img src={leader.image} alt="" />
                    </div>
                    <div className="leadership-card__meta">
                      <h3 className={nameClass}>{leader.name}</h3>
                      <LeaderTitle leader={leader} />
                    </div>
                  </div>

                  <div className="leadership-card__face leadership-card__face--back">
                    <div className="leadership-card__back-top">
                      <h3 className="leadership-card__name leadership-card__name--semibold">
                        {leader.name}
                      </h3>
                      <p className="leadership-card__back-role">
                        {leader.flipRole}
                      </p>
                      {leader.companyLogo && (
                        <div className="leadership-card__company-badge">
                          <img src={leader.companyLogo} alt="" />
                        </div>
                      )}
                    </div>
                    <div className="leadership-card__back-bottom">
                      <p className="leadership-card__affiliation-label">
                        {leader.affiliationLabel}
                      </p>
                      {leader.affiliationLogo && (
                        <img
                          src={leader.affiliationLogo}
                          alt=""
                          className="leadership-card__affiliation-logo"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="leadership-categories" aria-hidden="true">
          {CATEGORIES.map((label, index) => (
            <React.Fragment key={label}>
              {index > 0 && (
                <span className="leadership-categories__rule">
                  <span className="leadership-categories__line" />
                </span>
              )}
              <span className="leadership-categories__item">{label}</span>
            </React.Fragment>
          ))}
        </div>

        <div className="leadership-features">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="leadership-feature">
              <img
                src={feature.icon}
                alt=""
                width={64}
                height={64}
                className="leadership-feature__icon"
                aria-hidden="true"
              />
              <div className="leadership-feature__copy">
                <h3 className="leadership-feature__title">{feature.title}</h3>
                <p className="leadership-feature__text">{feature.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
