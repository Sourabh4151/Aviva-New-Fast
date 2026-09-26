import React from "react";

const FONT_MONTSERRAT =
  "Montserrat, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const FONT_POPPINS =
  "Poppins, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const ACCENT = "rgba(59, 130, 246, 1)";

const INCLUDES = [
  "Includes corporate specific job-role training.",
  "Includes all learning material and resources.",
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
            <div
              className="inline-flex items-center justify-center tracking-normal rounded-full border border-white/30 py-1 px-4 sm:px-[30px] program-fee-pill"
              style={{
                fontFamily: FONT_MONTSERRAT,
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
                  fontFamily: FONT_MONTSERRAT,
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
                className="program-fee-note"
                style={{
                  fontFamily: FONT_POPPINS,
                  fontWeight: 500,
                  fontSize: "12px",
                  lineHeight: "150%",
                  letterSpacing: "0%",
                  color: "rgba(250, 250, 250, 0.7)",
                }}
              >
                Flexible EMI and education financing partners available.
              </p>
            </div>
          </div>

          {/* Right: investment card + registration note */}
          <div className="w-full lg:w-[527px] lg:flex-none flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[527px] flex flex-col gap-4">
              <div className="relative w-full">
                {/* Ellipse 4 – 619×200, rgba(59,130,246,0.3), blur 200 */}
                <div
                  className="pointer-events-none absolute left-1/2 top-1/2"
                  style={{
                    width: 619,
                    height: 200,
                    maxWidth: "140%",
                    borderRadius: "50%",
                    background: "rgba(59, 130, 246, 0.3)",
                    filter: "blur(200px)",
                    transform: "translate(-50%, -50%) rotate(180deg)",
                  }}
                />

                <div
                  className="relative flex flex-col program-fee-card"
                  style={{
                    width: "100%",
                    maxWidth: 527,
                    borderRadius: 4,
                    padding: 20,
                    gap: 20,
                    background: "rgba(0, 0, 0, 1)",
                  }}
                >
                  <div className="flex flex-col" style={{ maxWidth: 487, width: "100%" }}>
                    <p
                      className="program-fee-card-label"
                      style={{
                        width: "100%",
                        height: 20,
                        fontFamily: FONT_MONTSERRAT,
                        fontWeight: 600,
                        fontSize: "16px",
                        lineHeight: "100%",
                        letterSpacing: "0%",
                        textAlign: "justify",
                        color: "rgba(200, 203, 204, 1)",
                        textTransform: "uppercase",
                      }}
                    >
                      Investment
                    </p>

                    <p
                      className="program-fee-amount"
                      style={{
                        width: "100%",
                        height: 36,
                        display: "flex",
                        alignItems: "center",
                        fontFamily: FONT_POPPINS,
                        fontWeight: 600,
                        fontSize: "24px",
                        lineHeight: "100%",
                        letterSpacing: "0%",
                        color: "rgba(250, 250, 250, 1)",
                      }}
                    >
                      ₹52,360*
                    </p>
                  </div>

                  <div className="flex flex-col" style={{ gap: "10px" }}>
                    {INCLUDES.map((item) => (
                      <div
                        key={item}
                        className="flex items-start"
                        style={{ gap: 10 }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                          style={{ flexShrink: 0, marginTop: 1 }}
                        >
                          <circle cx="8" cy="8" r="8" fill={ACCENT} />
                          <path
                            d="M4.7 8.15L6.85 10.3L11.3 5.7"
                            stroke="white"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>

                        <p
                          className="program-fee-list-text"
                          style={{
                            fontFamily: FONT_POPPINS,
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

                  <a
                    href="https://smartpay.easebuzz.in/234234/vedantu_ac"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="program-fee-pay-btn self-start"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "fit-content",
                      minWidth: 193,
                      height: 50,
                      padding: "16px 24px",
                      gap: 8,
                      borderRadius: 10,
                      background:
                        "linear-gradient(180deg, rgba(59, 130, 246, 1) 0%, rgba(32, 72, 137, 1) 100%)",
                      fontFamily: FONT_MONTSERRAT,
                      fontWeight: 600,
                      fontSize: 14,
                      lineHeight: "100%",
                      color: "#ffffff",
                      textDecoration: "none",
                      whiteSpace: "nowrap",
                      boxSizing: "border-box",
                    }}
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

              <p
                className="program-fee-disclaimer"
                style={{
                  maxWidth: 519,
                  fontFamily: FONT_POPPINS,
                  fontWeight: 400,
                  fontSize: "14px",
                  lineHeight: "150%",
                  letterSpacing: "0%",
                  color: "rgba(250, 250, 250, 0.7)",
                }}
              >
                *₹2,000 + GST will be payable as the registration fee, and the remaining
                amount will be payable only after you receive your offer letter.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
