import React from "react";

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
            <div
              className="inline-flex items-center justify-center tracking-normal rounded-full border border-white/30 py-1 px-4 sm:px-[30px] program-fee-pill"
              style={{
                fontFamily:
                  "Montserrat, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontWeight: 500,
                fontSize: "14px",
                lineHeight: "27px",
                color: "rgba(250, 250, 250, 0.7)",
              }}
            >
              Program Fee
            </div>

            <div className="mt-4 flex flex-col gap-4 max-w-full lg:max-w-[498px]">
              <p
                className="program-fee-heading"
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
                An investment in your skills, preparation, and career progression.
              </p>

              <p
                className="text-xs text-white/70 program-fee-note"
                style={{
                  fontFamily:
                    "Poppins, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                }}
              >
                *Financing options available
              </p>
            </div>
          </div>

          {/* Right: fee card with side/bottom glow */}
          <div className="flex-1 flex justify-center lg:justify-end w-full lg:w-auto">
            <div className="relative w-full max-w-[364px]">
              {/* Blue glow around card – matches brand color rgba(10, 49, 82) */}
              <div
                className="pointer-events-none absolute -inset-[40px] sm:-inset-[60px]"
                style={{
                  background:
                    "radial-gradient(circle at 0% 50%, rgba(168, 27, 88, 1) 0, transparent 60%), radial-gradient(circle at 100% 50%, rgba(168, 27, 88, 1) 0, transparent 60%), radial-gradient(circle at 50% 0%, rgba(168, 27, 88, 1) 0, transparent 60%), radial-gradient(circle at 50% 100%, rgba(168, 27, 88, 1) 0, transparent 60%)",
                  filter: "blur(200px)",
                  opacity: 1,
                }}
              />

              <div
              className="relative flex flex-col shadow-2xl program-fee-card"
              style={{
                width: 364,
                maxWidth: "100%",
                borderRadius: 10,
                padding: 24,
                gap: 10,
                background: "rgba(0, 0, 0, 1)",
                flexDirection: "column",
              }}
              >
              {/* PROGRAM FEE + amount */}
              <div className="flex flex-col" style={{ gap: "0px" }}>
                <p
                  className="program-fee-card-label"
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
                  PROGRAM FEE
                </p>

                <p
                  className="program-fee-amount"
                  style={{
                    fontFamily:
                      "Montserrat, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    fontWeight: 500,
                    fontSize: "32px",
                    lineHeight: "48px",
                    letterSpacing: "0%",
                    color: "rgba(250, 250, 250, 1)",
                    whiteSpace: "nowrap",
                  }}
                >
                  Rs 1,00,000{" "}
                  <span
                    style={{
                      fontFamily:
                        "Montserrat, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                      fontWeight: 500,
                      fontSize: "16px",
                      lineHeight: "48px",
                      letterSpacing: "0%",
                      color: "rgba(250, 250, 250, 1)",
                      display: "inline",
                      whiteSpace: "nowrap",
                    }}
                  >
                    + GST
                  </span>
                </p>
              </div>

              <div className="flex flex-col" style={{ gap: "10px" }}>
                <p
                  className="program-fee-includes"
                  style={{
                    fontFamily:
                      "Poppins, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    fontWeight: 400,
                    fontSize: "12px",
                    lineHeight: "100%",
                    color: "rgba(250, 250, 250, 1)",
                  }}
                >
                  The program fee includes:
                </p>

                <div
                  className="flex flex-col"
                  style={{
                    gap: "10px",
                  }}
                >
                  {[
                    "Comprehensive training & placement support",
                    "All learning materials and resources",
                  ].map((item) => (
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
                        className="program-fee-list-text"
                        style={{
                          fontFamily:
                            "Poppins, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                          fontWeight: 400,
                          fontSize: "12px",
                          lineHeight: "100%",
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
      </div>
    </section>
  );
}

