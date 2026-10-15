import React from "react";
import tickSvg from "../assets/tick.svg";

const REQUIREMENTS = [
  "Must be a graduate in any stream with 50% or above.",
  "Candidates must be 27 years or younger.",
  "Candidates should have strong communication skills and the ability to build relationships with customers.",
];

export default function Eligibility() {
  return (
    <section
      id="eligibility"
      className="relative bg-black text-white scroll-mt-24 overflow-hidden"
    >
      <div className="relative z-10 mx-auto px-section py-section lg:px-[120px] lg:py-20">
        <div
          className="mx-auto flex flex-col lg:flex-row items-start justify-between gap-6 lg:gap-[10px] max-w-[1040px]"
        >
          {/* Left: badge, heading */}
          <div className="flex-1 flex flex-col items-start text-left min-w-0 w-full">
            <div
              className="inline-flex items-center justify-center tracking-normal rounded-full border border-white/30 py-1 px-4 sm:px-[30px]"
              style={{
                fontFamily:
                  "'Anek Latin', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontWeight: 500,
                fontSize: "14px",
                lineHeight: "27px",
                color: "rgba(250, 250, 250, 0.7)",
              }}
            >
              Eligibility
            </div>

            <div className="mt-4 flex flex-col gap-[10px] max-w-full lg:max-w-[498px]">
              <p className="eligibility-heading max-w-[320px] sm:max-w-full">
                Is this the right program for you?
              </p>
            </div>
          </div>

          {/* Right: requirements card with glow */}
          <div className="flex-1 flex justify-start lg:justify-end w-full lg:w-auto lg:-ml-10">
            <div className="relative w-full max-w-[364px] sm:max-w-[422px]">
              {/* Glow around card */}
              <div
                className="pointer-events-none absolute -left-4 -right-4 -top-2 -bottom-10 sm:-left-6 sm:-right-6 sm:-top-4 sm:-bottom-12"
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, rgba(199, 34, 42, 0.7) 0, rgba(3, 149, 218, 0.0) 65%)",
                  filter: "blur(35px)",
                  opacity: 1,
                }}
              />

              <div
                className="relative flex flex-col shadow-2xl"
                style={{
                  width: "100%",
                  borderRadius: 10,
                  padding: 24,
                  gap: 10,
                  background: "rgba(0, 0, 0, 1)",
                  flexDirection: "column",
                }}
              >
                <p className="eligibility-requirements-label">Requirements</p>

                <div className="flex flex-col gap-[10px]">
                  {REQUIREMENTS.map((item) => (
                    <div key={item} className="flex items-start gap-[10px]">
                      <span className="hero-tick shrink-0">
                        <img src={tickSvg} alt="" className="hero-tick-icon" aria-hidden="true" />
                      </span>
                      <p className="eligibility-requirements-item min-w-0 flex-1">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

