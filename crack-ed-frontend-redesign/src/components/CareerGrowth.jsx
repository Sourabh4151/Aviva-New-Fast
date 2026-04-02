import React, { useEffect, useState } from "react";
import careerIcon from "../assets/career.svg";
import ctcIcon from "../assets/ctc.svg";
import growthIcon from "../assets/growth.svg";
import flseIcon from "../assets/flse.svg";
import sflseIcon from "../assets/sflse.svg";
import flsamIcon from "../assets/flsam.svg";
import flsdmIcon from "../assets/flsdm.svg";
import frontLineSalesExecutive from "../assets/assistant manager.jpg";
import seniorFrontLineSalesExecutive from "../assets/relationship manager (2).jpg";
import frontLineSalesAssistantManager from "../assets/branch sales manager.jpg";
import frontLineSalesDeputyManager from "../assets/branch manager.jpg";

const ROLE_STEPS = [
  {
    key: "flse",
    label: "Sales Executive",
    icon: flseIcon,
    image: frontLineSalesExecutive,
  },
  {
    key: "sflse",
    label: "Senior Sales Executive",
    icon: sflseIcon,
    image: seniorFrontLineSalesExecutive,
  },
  {
    key: "flsam",
    label: "Relationship Officer",
    icon: flsamIcon,
    image: frontLineSalesAssistantManager,
  },
  {
    key: "flsdm",
    label: "Area Sales Manager",
    icon: flsdmIcon,
    image: frontLineSalesDeputyManager,
  },
];

export default function CareerGrowth() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeRole = ROLE_STEPS[activeIndex];

  // Auto-rotate roles every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % ROLE_STEPS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);
  return (
    <section
      id="career-growth"
      className="relative bg-[rgba(10,49,82,0.2)] backdrop-blur-[100px] text-white scroll-mt-24 overflow-hidden"
    >
      {/* Blurred yellow background as per design spec */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-80px] top-1/2 -translate-y-1/2"
        style={{
          width: 420,
          height: 420,
          borderRadius: "999px",
          backgroundColor: "rgba(255, 217, 0, 0.05)",
          filter: "blur(100px)",
        }}
      />
      <div className="relative z-10 px-4 sm:px-6 md:px-8 py-section lg:pl-[120px] lg:pr-0 lg:pt-[110px] lg:pb-[110px]">
        <div className="career-growth-card w-full flex flex-col lg:flex-row gap-8 lg:gap-12 rounded-[16px] bg-[rgba(10,49,82,0.2)]/0">
          {/* Left content */}
          <div className="w-full lg:w-[430px] flex-shrink-0">
            <div className="career-growth-tag inline-flex items-center justify-center text-xs sm:text-sm font-medium tracking-normal rounded-full border border-white/30 py-1 px-4 sm:px-[30px] text-white/70">
              Career Growth
            </div>

          <div className="mt-3 sm:mt-4">
            <p className="career-growth-subtitle text-lg sm:text-xl lg:text-2xl font-medium text-white text-justify leading-tight">
            From your first role in consumer finance sales to bigger opportunities.
            </p>
            <p
              className="career-growth-body mt-3 sm:mt-4 font-normal text-[16px] leading-[24px] text-[rgba(250,250,250,0.8)] text-justify"
            >
              Designed as a strong entry point with clear scope to grow into senior sales and relationship management roles.
            </p>
          </div>

          <div className="mt-3 sm:mt-4 space-y-0">
            {[
              {
                text: "Start your career in the consumer finance industry",
                icon: careerIcon,
                textClassName:
                  "font-medium text-[18px] leading-[1] text-[rgba(250,250,250,1)]",
              },
              {
                text: "Earn a CTC of upto Rs. 2.76 LPA",
                icon: ctcIcon,
                textClassName:
                  "font-medium text-[18px] leading-[27px] text-[rgba(250,250,250,1)]",
              },
              {
                text: "Grow into senior roles in sales and financial services",
                icon: growthIcon,
                textClassName:
                  "font-medium text-[18px] leading-[1] text-[rgba(250,250,250,1)]",
              },
            ].map(({ text, icon, textClassName }) => (
              <div
                key={text}
                className="flex items-center gap-3 sm:gap-4 py-2.5 sm:py-3 pr-3 sm:pr-4"
              >
                <img
                  src={icon}
                  alt=""
                  className="w-10 h-10 sm:w-14 sm:h-14 flex-shrink-0"
                  aria-hidden="true"
                />
                <p className={`career-growth-list-text ${textClassName}`}>
                  {text}
                </p>
              </div>
            ))}
          </div>
          </div>

          {/* Right image card */}
          <div className="career-growth-image-wrap flex-1 flex justify-center lg:justify-end min-w-0 -mx-4 sm:-mx-6 md:-mx-8 lg:mx-0">
            <div className="relative w-full max-w-[628px] h-[280px] sm:h-[360px] lg:h-[440px] lg:rounded-l-[10px] lg:rounded-r-none overflow-hidden">
              <img
                src={activeRole.image}
                alt={activeRole.label}
                className="w-full h-full object-cover"
              />

              {/* Overlay role pill + progression icons */}
              <div className="career-growth-overlay absolute left-1/2 -translate-x-1/2 bottom-3 sm:bottom-6 flex flex-col items-center gap-2 sm:gap-3">
                {/* Role label pill – mobile: Montserrat 600, 12px, line-height 24px, letter-spacing -3%, rgba(30,30,30,1), radius 100px, padding 8px */}
                <div className="career-growth-role-pill inline-flex items-center justify-center rounded-full py-1 px-2 sm:py-1.5 sm:px-2 bg-white text-[#1e1e1e] font-semibold text-[10px] sm:text-xs tracking-tight">
                  {activeRole.label}
                </div>

                {/* Steps pill – desktop: 224×50, padding 4px, gap 16px, bg rgba(250,250,250,0.7) */}
                <div className="career-growth-steps-pill flex items-center rounded-full p-1 gap-2 sm:gap-4 bg-white/70">
                  {ROLE_STEPS.map((role, index) => {
                    const isActive = index === activeIndex;
                    return (
                      <button
                        key={role.key}
                        type="button"
                        onClick={() => setActiveIndex(index)}
                        className="career-growth-step-btn w-8 h-8 sm:w-10 sm:h-10 lg:w-[42px] lg:h-[42px] rounded-full border-0 cursor-pointer flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: isActive
                            ? "rgba(255,255,255,1)"
                            : "transparent",
                        }}
                      >
                        <img
                          src={role.icon}
                          alt=""
                          className="w-4 h-4 sm:w-5 sm:h-5 lg:w-[22px] lg:h-[22px]"
                          aria-hidden="true"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

