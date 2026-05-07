import React from "react";

const REQUIREMENTS = [
  "Must hold a graduate degree in any stream and be up to 28 years of age.",
  "Strong conversational English skills are essential and non-negotiable for this role",
  "Excellent verbal communication and persuasion skills with a natural aptitude for sales",
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
                  "Montserrat, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontWeight: 500,
                fontSize: "14px",
                lineHeight: "27px",
                color: "rgba(250, 250, 250, 0.7)",
              }}
            >
              Eligibility
            </div>

            <div className="mt-4 flex flex-col gap-[10px] max-w-full lg:max-w-[498px]">
              <p
                style={{
                  fontFamily:
                    "Montserrat, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontWeight: 500,
                  fontSize: "24px",
                  lineHeight: "31.2px",
                  letterSpacing: "0%",
                  color: "rgba(250, 250, 250, 1)",
                }}
                className="max-w-[320px] sm:max-w-full"
              >
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
                    "radial-gradient(circle at 50% 50%, rgba(151, 20, 77, 0.92) 0, rgba(151, 20, 77, 0.0) 65%)",
                  filter: "blur(200px)",
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
                <p
                  style={{
                    fontFamily:
                      "Montserrat, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    fontWeight: 600,
                    fontSize: "12px",
                    lineHeight: "21px",
                    letterSpacing: "0%",
                    color: "rgba(250, 250, 250, 0.8)",
                    textTransform: "uppercase",
                  }}
                >
                  Requirements
                </p>

                <div
                  className="flex flex-col"
                  style={{
                    gap: 10,
                  }}
                >
                  {REQUIREMENTS.map((item) => (
                    <div
                      key={item}
                      className="flex items-start"
                      style={{
                        gap: 10,
                      }}
                    >
                      <div
                        className="flex items-center justify-center"
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 100,
                          backgroundColor: "rgba(250,250,250,0.3)",
                          flexShrink: 0,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 10,
                            lineHeight: 1,
                            color: "rgba(250,250,250,1)",
                          }}
                        >
                          ✓
                        </span>
                      </div>

                      <p
                        className="text-[12px] sm:text-[14px]"
                        style={{
                          fontFamily:
                            "Poppins, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                          fontWeight: 400,
                          lineHeight: 1.30,
                          letterSpacing: "0%",
                          color: "rgba(250, 250, 250, 1)",
                        }}
                      >
                        {item}
                      </p>
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

