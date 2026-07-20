import React from "react";

const REQUIREMENTS = [
  "An existing business owner looking to scale your enterprise",
  "An entrepreneur with a validated business idea, ready to launch",
  "A successor or next-gen leader preparing to join, modernise or expand your family business",
];

export default function Eligibility() {
  return (
    <section
      id="eligibility"
      className="relative bg-black text-white scroll-mt-24 overflow-hidden"
    >
      <div className="relative z-10 mx-auto px-section py-section lg:px-[120px] lg:py-20">
        <div className="mx-auto flex max-w-[1040px] flex-col items-start justify-between gap-8 lg:flex-row lg:gap-[10px]">
          {/* Left: badge, heading, next steps */}
          <div className="flex w-full min-w-0 flex-1 flex-col items-start text-left lg:min-h-[196px] lg:justify-between">
            <div className="flex w-full max-w-[498px] flex-col items-start gap-4">
              <div
                className="inline-flex items-center justify-center rounded-full border border-white/30 px-4 py-1 tracking-normal sm:px-[30px]"
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

              <p
                className="max-w-[498px]"
                style={{
                  fontFamily:
                    "Montserrat, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontWeight: 500,
                  fontSize: "24px",
                  lineHeight: "31.2px",
                  letterSpacing: "0%",
                  color: "rgba(250, 250, 250, 1)",
                }}
              >
                Designed for ambitious entrepreneurs ready to build, grow, or
                scale a business.
              </p>
            </div>

            <div
              className="mt-8 inline-flex items-center justify-center rounded-full border border-white/30 px-4 py-1 tracking-normal sm:mt-10 sm:px-[30px] lg:mt-0"
              style={{
                fontFamily:
                  "Montserrat, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontWeight: 500,
                fontSize: "14px",
                lineHeight: "27px",
                color: "rgba(250, 250, 250, 0.7)",
              }}
            >
              Your Next Steps
            </div>
          </div>

          {/* Right: Who Should Apply card with glow */}
          <div className="flex w-full justify-start lg:w-auto lg:justify-end">
            <div className="relative w-full max-w-[422px]">
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{
                  width: 537,
                  height: 128,
                  backgroundColor: "rgba(28, 50, 214, 0.9)",
                  filter: "blur(200px)",
                }}
                aria-hidden="true"
              />

              <div
                className="relative flex flex-col shadow-2xl"
                style={{
                  width: "100%",
                  borderRadius: 10,
                  padding: 24,
                  gap: 10,
                  background: "rgba(0, 0, 0, 1)",
                }}
              >
                <p
                  className="uppercase"
                  style={{
                    fontFamily:
                      "Montserrat, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    fontWeight: 600,
                    fontSize: "12px",
                    lineHeight: "21px",
                    letterSpacing: "0%",
                    color: "rgba(250, 250, 250, 0.8)",
                  }}
                >
                  Who Should Apply?
                </p>

                <div className="flex flex-col" style={{ gap: 10 }}>
                  {REQUIREMENTS.map((item) => (
                    <div
                      key={item}
                      className="flex items-start"
                      style={{ gap: 10 }}
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
                        style={{
                          fontFamily:
                            "Poppins, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                          fontWeight: 400,
                          fontSize: "14px",
                          lineHeight: "100%",
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
