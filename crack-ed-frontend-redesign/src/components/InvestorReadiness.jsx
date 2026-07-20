import React from "react";

const POINTS = [
  "Robust, validated business models built module by module",
  "Sound financial planning and defensible unit economics",
  "Scalable operating systems and governance",
  "Investor pitch coaching and a Capstone-ready deck",
];

export default function InvestorReadiness() {
  return (
    <section
      id="investor-readiness"
      className="relative bg-black text-white scroll-mt-24 overflow-hidden"
    >
      <div className="relative z-10 mx-auto px-4 py-section sm:px-6 md:px-8 lg:px-[120px] lg:py-[92px]">
        <div className="mx-auto flex max-w-[1040px] flex-col items-start justify-between gap-8 lg:flex-row lg:items-center lg:gap-[10px]">
          {/* Left: badge, heading, checklist */}
          <div className="flex w-full max-w-[498px] flex-col items-start gap-4 text-left">
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
              Investor Readiness
            </div>

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
            >
              Your Shot at Investment
            </p>

            <div className="flex w-full flex-col" style={{ gap: 10 }}>
              {POINTS.map((item) => (
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
                      fontSize: "12px",
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

          {/* Right: investment card with glow */}
          <div className="flex w-full justify-start lg:w-auto lg:justify-end">
            <div className="relative w-full max-w-[364px]">
              <div
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{
                  width: 356,
                  height: 85,
                  backgroundColor: "rgba(28, 50, 214, 0.9)",
                  filter: "blur(200px)",
                }}
                aria-hidden="true"
              />

              <div
                className="relative flex flex-col shadow-2xl"
                style={{
                  width: "100%",
                  maxWidth: 364,
                  minHeight: 196,
                  borderRadius: 10,
                  padding: 24,
                  gap: 10,
                  background: "rgba(0, 0, 0, 1)",
                }}
              >
                <p
                  className="text-justify uppercase"
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
                  Merit-based opportunity to pitch for
                </p>

                <p
                  className="text-justify"
                  style={{
                    fontFamily:
                      "Montserrat, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    fontWeight: 500,
                    fontSize: "32px",
                    lineHeight: "32px",
                    letterSpacing: "0%",
                    color: "rgba(250, 250, 250, 1)",
                  }}
                >
                  Upto Rs 20,00,000
                </p>

                <p
                  className="text-justify"
                  style={{
                    marginTop: 10,
                    fontFamily:
                      "Montserrat, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    fontWeight: 400,
                    fontSize: "12px",
                    lineHeight: "18px",
                    letterSpacing: "0%",
                    color: "rgba(250, 250, 250, 0.8)",
                  }}
                >
                  in investment for your business or business plan, presented at
                  the Capstone Demo Day.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
