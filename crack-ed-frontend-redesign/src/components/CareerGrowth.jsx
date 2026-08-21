import React from "react";
import careerIcon from "../assets/career.svg";
import ctcIcon from "../assets/ctc.svg";
import growthIcon from "../assets/growth.svg";
import careerGrowthRight from "../assets/career_growth_right.png";

const FEATURES = [
  {
    text: "Start your career in banking",
    icon: careerIcon,
    textClassName:
      "font-medium text-[18px] leading-[1] text-[rgba(250,250,250,1)]",
  },
  {
    text: "Earn a CTC of Rs. 4 LPA*",
    icon: ctcIcon,
    textClassName:
      "font-medium text-[18px] leading-[27px] text-[rgba(250,250,250,1)]",
  },
  {
    text: "Grow into senior banking roles",
    icon: growthIcon,
    textClassName:
      "font-medium text-[18px] leading-[1] text-[rgba(250,250,250,1)]",
  },
];

export default function CareerGrowth() {
  return (
    <section
      id="career-growth"
      className="relative bg-[rgba(10,50,82,0.3)] backdrop-blur-[100px] text-white scroll-mt-24 overflow-hidden"
    >
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
        <div className="career-growth-card flex w-full flex-col items-start gap-10 lg:flex-row lg:items-center lg:gap-x-12">
          <div className="w-full shrink-0 lg:w-[430px] lg:max-w-[430px]">
            <div className="career-growth-tag inline-flex items-center justify-center text-xs sm:text-sm font-medium tracking-normal rounded-full border border-white/30 py-1 px-4 sm:px-[30px] text-white/70">
              Career Growth
            </div>

            <div className="mt-3 sm:mt-4">
              <p className="career-growth-subtitle text-lg sm:text-xl lg:text-2xl font-medium text-white text-justify leading-tight">
                From your first branch role to bigger opportunities.
              </p>
              <p className="career-growth-body mt-3 sm:mt-4 font-normal text-[16px] leading-[24px] text-[rgba(250,250,250,0.8)] text-justify">
                Designed as a strong entry point with clear scope to grow into
                senior branch responsibilities.
              </p>
            </div>

            <div className="mt-3 sm:mt-4 space-y-0">
              {FEATURES.map(({ text, icon, textClassName }) => (
                <div
                  key={text}
                  className="flex items-center gap-3 sm:gap-4 py-2.5 sm:py-3 pr-3 sm:pr-4"
                >
                  <img
                    src={icon}
                    alt=""
                    className="h-10 w-10 flex-shrink-0 sm:h-14 sm:w-14"
                    aria-hidden="true"
                  />
                  <p className={`career-growth-list-text ${textClassName}`}>
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="career-growth-image-wrap w-full lg:ml-auto lg:shrink-0">
            <div className="career-growth-image-frame relative w-full overflow-hidden max-lg:rounded-[10px] lg:rounded-l-[10px] lg:rounded-r-none">
              <img
                src={careerGrowthRight}
                alt="Bandhan Bank professional working at a branch"
                className="career-growth-image h-full w-full object-cover"
              />
              <div
                className="career-growth-image-overlay pointer-events-none absolute inset-0"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
