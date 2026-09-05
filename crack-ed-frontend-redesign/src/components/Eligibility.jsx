import React, { useEffect, useRef, useState } from "react";
import businessOwnersIcon from "../assets/Business_Owners.svg";
import preRevenueFounderIcon from "../assets/Pre_Revenue_Founder.svg";
import familyBusinessIcon from "../assets/Family_Business.svg";
import aspiringEntrepreneurIcon from "../assets/Aspising_Entrepreneur.svg";

const CATEGORIES = [
  {
    title: "Business Owners",
    description:
      "An existing business ready to scale for better systems and strategy.",
    icon: businessOwnersIcon,
  },
  {
    title: "Pre-Revenue Founder",
    description:
      "Building a validated idea before launch and first revenue.",
    icon: preRevenueFounderIcon,
  },
  {
    title: "Family Business",
    description:
      "Modernizing traditions operations and expanding for growth.",
    icon: familyBusinessIcon,
  },
  {
    title: "Aspiring Entrepreneur",
    description:
      "Transitioning into your entrepreneurial journey with right guidance.",
    icon: aspiringEntrepreneurIcon,
  },
];

const FLOW_ITEMS = [
  { type: "word", label: "Learn" },
  { type: "arrow" },
  { type: "word", label: "Build" },
  { type: "arrow" },
  { type: "word", label: "Grow" },
];

const FLOW_STEP_MS = 900;

function FlowArrow({ active }) {
  return (
    <span
      className={`eligibility-flow-arrow-wrap${active ? " is-active" : ""}`}
    >
      <svg
        className="eligibility-flow-arrow"
        width="40"
        height="29"
        viewBox="0 0 40 29"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M25.6631 29V17.4H0.0860207L0 11.571H25.6631V0L40 14.5L25.6631 29Z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}

export default function Eligibility() {
  const learnRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = learnRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.01 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) {
      setActiveIndex(-1);
      return undefined;
    }
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setActiveIndex(-1);
      return undefined;
    }

    setActiveIndex(0);
    const id = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % FLOW_ITEMS.length);
    }, FLOW_STEP_MS);

    return () => window.clearInterval(id);
  }, [inView]);

  return (
    <section
      id="eligibility"
      className="eligibility-section relative bg-black text-white scroll-mt-24 overflow-hidden"
    >
      <div className="eligibility-container relative z-10 mx-auto px-section py-section lg:px-[120px] lg:pt-[110px] lg:pb-[110px]">
        <div className="eligibility-inner">
          <header className="eligibility-header">
            <div className="eligibility-badge">Eligibility</div>
            <h2 className="eligibility-heading">
              Where are you in your <em>Founder&apos;s Journey?</em>
            </h2>
            <p className="eligibility-subtext">
              Not everyone who applies is meant to join — the Fellowship is
              built for one specific moment in your founder&apos;s journey.
            </p>
          </header>

          <div className="eligibility-list-wrap">
            <div
              className="eligibility-glow"
              aria-hidden="true"
            />
            <ul className="eligibility-list">
              {CATEGORIES.map((item) => (
                <li key={item.title} className="eligibility-item">
                  <img
                    src={item.icon}
                    alt=""
                    width={56}
                    height={56}
                    className="eligibility-item-icon"
                    aria-hidden="true"
                  />
                  <div className="eligibility-item-copy">
                    <h3 className="eligibility-item-title">{item.title}</h3>
                    <p className="eligibility-item-desc">{item.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="eligibility-flow" aria-hidden="true">
            {FLOW_ITEMS.map((item, index) => {
              const active = inView && index === activeIndex;
              if (item.type === "arrow") {
                return <FlowArrow key={`arrow-${index}`} active={active} />;
              }
              return (
                <span
                  key={item.label}
                  ref={item.label === "Learn" ? learnRef : undefined}
                  className={`eligibility-flow-word${active ? " is-active" : ""}`}
                >
                  {item.label}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
