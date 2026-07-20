import React from "react";
import iconLearn from "../assets/1.svg";
import iconFounder from "../assets/2.svg";
import iconInvestor from "../assets/3.svg";
import iconNetwork from "../assets/4.svg";

const FEATURES = [
  {
    icon: iconLearn,
    title: "Learn by doing",
    description:
      "Apply frameworks taught directly to your own venture, not hypothetical case studies. Build your business alongside the fellowship.",
  },
  {
    icon: iconFounder,
    title: "Founder-Led Learning",
    description:
      "Go beyond textbook concepts with founder-led case studies and mentoring sessions that reveal the decisions, setbacks, and strategies behind successful businesses.",
  },
  {
    icon: iconInvestor,
    title: "Build an Investor-Ready Business",
    description:
      "Leave with a validated business model, growth strategy, financial plan, and investor-ready pitch tailored to your own venture.",
  },
  {
    icon: iconNetwork,
    title: "Join a Powerful Founder Network",
    description:
      "Become part of the House of Founders community, connecting you with entrepreneurs, mentors, industry experts, and investors who continue to support your growth.",
  },
];

export default function WhyThisFellowship() {
  return (
    <section
      id="why-this-fellowship"
      className="relative bg-black text-white scroll-mt-24 overflow-hidden"
    >
      <div className="relative z-10 mx-auto flex flex-col items-center px-4 py-section sm:px-6 md:px-8 lg:px-[120px] lg:py-[100px]">
        <div className="flex w-full max-w-[1040px] flex-col items-center gap-[42px]">
          <div className="flex flex-col items-center gap-4 text-center">
            <div
              className="inline-flex h-[35px] items-center justify-center rounded-full border border-[rgba(250,250,250,1)] px-[30px] py-1"
              style={{
                fontFamily:
                  "Montserrat, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontWeight: 600,
                fontSize: "14px",
                lineHeight: "27px",
                color: "rgba(250, 250, 250, 1)",
              }}
            >
              Why This Fellowship?
            </div>

            <p
              className="w-full text-center text-lg whitespace-normal sm:whitespace-nowrap sm:text-xl lg:text-2xl"
              style={{
                fontFamily:
                  "Montserrat, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontWeight: 500,
                lineHeight: "100%",
                letterSpacing: "0%",
                color: "rgba(250, 250, 250, 1)",
              }}
            >
              Learn from experts. Apply to your business. Grow with confidence.
            </p>
          </div>

          <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
            {FEATURES.map(({ icon, title, description }) => (
              <article
                key={title}
                className="flex w-full flex-col gap-[27px] rounded-2xl bg-[rgba(13,13,13,1)] px-6 py-8 sm:px-[42px] sm:py-8"
              >
                <img
                  src={icon}
                  alt=""
                  width={75}
                  height={75}
                  className="shrink-0"
                  style={{ width: 75, height: 75, minWidth: 75, minHeight: 75 }}
                  aria-hidden="true"
                />

                <div className="flex flex-col gap-2">
                  <h3
                    style={{
                      fontFamily:
                        "Montserrat, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                      fontWeight: 600,
                      fontSize: "24px",
                      lineHeight: "100%",
                      letterSpacing: "0%",
                      color: "rgba(250, 250, 250, 1)",
                    }}
                  >
                    {title}
                  </h3>
                  <p
                    className="text-justify"
                    style={{
                      fontFamily:
                        "Montserrat, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                      fontWeight: 400,
                      fontSize: "16px",
                      lineHeight: "20px",
                      letterSpacing: "0%",
                      color: "rgba(250, 250, 250, 0.7)",
                    }}
                  >
                    {description}
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
