import React from "react";
import icon1 from "../assets/Icon1.svg";
import icon2 from "../assets/Icon2.svg";
import icon3 from "../assets/Icon3.svg";

const FONT_MONTSERRAT =
  "Montserrat, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const FEATURES = [
  {
    icon: icon1,
    title: "EdTech is India's Booming Industry",
    description:
      "India's EdTech market, valued at $7.5B today, is projected to grow 4x by 2030.",
  },
  {
    icon: icon2,
    title: "Inside Sales is a Growing Career",
    description:
      "Inside Sales hiring rose ~11% year-on-year, the opportunities are endless.",
  },
  {
    icon: icon3,
    title: "Build for Freshers",
    description:
      "Strong demand for fresh talent makes Inside Sales a promising entry point for those with the right skills, communication and drive.",
  },
];

export default function About() {
  return (
    <section id="about" className="bg-black text-white scroll-mt-24">
      <div className="mx-auto px-section py-section lg:px-[120px] lg:pt-[110px] lg:pb-[110px]">
        <div className="about-section-container mx-auto flex w-full max-w-[1040px] flex-col">
          <div className="about-pill inline-flex items-center justify-center text-[14px] leading-[27px] font-medium tracking-normal rounded-[100px] border border-white/30 py-1 px-[30px] text-white/70">
            About The Program
          </div>

          <h2 className="about-heading">Why EdTech Sales?</h2>

          <p className="about-body">
            EdTech is changing how India learns. Sales is how people discover,
            choose and access those opportunities. Together, they create a career
            path built around people, technology and growth. It sits at the
            perfect intersection of India's growing EdTech market and increasing
            demand for Inside-Sales roles.
          </p>

          <div className="about-feature-row">
            {FEATURES.map((feature) => (
              <article key={feature.title} className="about-feature-card">
                <img
                  src={feature.icon}
                  alt=""
                  className="h-16 w-16 object-contain"
                  aria-hidden="true"
                />
                <div className="about-feature-text">
                  <h3 className="about-card-title" style={{ fontFamily: FONT_MONTSERRAT }}>
                    {feature.title}
                  </h3>
                  <p className="about-card-desc" style={{ fontFamily: FONT_MONTSERRAT }}>
                    {feature.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
