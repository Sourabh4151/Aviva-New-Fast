import React from "react";
import tickSvg from "../assets/tick.svg";

const FEE_INCLUDES = [
  "Comprehensive training & placement support",
  "All learning materials and resources",
];

export default function ProgramFee() {
  return (
    <section
      id="program-fee"
      className="relative bg-black text-white scroll-mt-24 overflow-hidden"
    >
      <div className="relative z-10 mx-auto px-section py-section lg:px-[120px] lg:py-20">
        <div className="mx-auto flex flex-col lg:flex-row items-start justify-between gap-8 lg:gap-10 max-w-[1040px]">
          {/* Left: badge, heading, note */}
          <div className="flex-1 flex flex-col items-start text-left min-w-0 w-full">
            <div className="program-fee-pill inline-flex items-center justify-center tracking-normal rounded-full border border-white/30 py-1 px-4 sm:px-[30px]">
              Program Fee
            </div>

            <div className="mt-4 flex flex-col gap-4 max-w-full lg:max-w-[498px]">
              <p className="program-fee-heading">
                An investment in your skills, preparation, and career progression.
              </p>

              <p className="program-fee-note">
                *Flexible EMI and education loan assistance available.
              </p>
            </div>
          </div>

          {/* Right: fee card with glow */}
          <div className="flex-1 flex justify-center lg:justify-end w-full lg:w-auto">
            <div className="relative w-full max-w-[364px]">
              <div
                className="pointer-events-none absolute -left-4 -right-4 -top-2 -bottom-10 sm:-left-6 sm:-right-6 sm:-top-4 sm:-bottom-12"
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, rgba(199, 34, 42, 0.7) 0, rgba(199, 34, 42, 0) 65%)",
                  filter: "blur(35px)",
                  opacity: 1,
                }}
              />

              <div className="relative flex flex-col shadow-2xl program-fee-card">
                <div className="flex flex-col gap-1">
                  <p className="program-fee-card-label">Program fee</p>
                  <p className="program-fee-amount">₹99,000 + GST</p>
                </div>

                <div className="flex flex-col gap-[10px]">
                  <p className="program-fee-includes">The program fee includes:</p>

                  <div className="flex flex-col gap-[10px]">
                    {FEE_INCLUDES.map((item) => (
                      <div key={item} className="flex items-start gap-[10px]">
                        <span className="hero-tick shrink-0">
                          <img
                            src={tickSvg}
                            alt=""
                            className="hero-tick-icon"
                            aria-hidden="true"
                          />
                        </span>
                        <p className="program-fee-list-text min-w-0 flex-1">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <a
                  href="https://smartpay.easebuzz.in/234234/kotak_gl_ro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="program-fee-pay-btn self-center lg:self-start"
                >
                  Enrol & Pay Now
                  <svg
                    width="18"
                    height="14"
                    viewBox="0 0 18 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <rect
                      x="0.75"
                      y="0.75"
                      width="16.5"
                      height="12.5"
                      rx="1.5"
                      stroke="white"
                      strokeWidth="1.5"
                    />
                    <path d="M0.75 4.5H17.25" stroke="white" strokeWidth="1.5" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
