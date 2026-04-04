import React, { useState, useEffect } from "react";
import card1 from "../assets/card1.svg";
import card2 from "../assets/card2.svg";
import card1gold from "../assets/card1gold.svg";
import card2gold from "../assets/card2gold.svg";
import classroomMobile from "../assets/classroom_mobile.svg";
import ojtMobile from "../assets/ojt_mobile.svg";

const FONT_MONTSERRAT =
  "Montserrat, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const CARD_PADDING = { paddingTop: 24, paddingRight: 16, paddingBottom: 24, paddingLeft: 16 };
const CARD_GAP = 10;
const CARD_RADIUS = 10;
const CARD_MIN_HEIGHT = 274;
/** Background when card is hovered/active (design spec) */
const CARD_ACTIVE_BG = "rgba(3, 0, 69, 0.2)";
/** Bottom line when card is hovered/active: full width, dark blue */
const LINE_ACTIVE_HEIGHT = 2;
const LINE_ACTIVE_COLOR = "rgba(7, 0, 166, 1)";

/** DURATION/STIPEND label: 12px, 600, 21px line height, uppercase. Initial 0.3, on hover 0.6 */
const DURATION_LABEL = {
  fontFamily: FONT_MONTSERRAT,
  fontWeight: 600,
  fontSize: 12,
  lineHeight: "21px",
  letterSpacing: "0em",
  textTransform: "uppercase",
  textAlign: "justify",
};
const DURATION_LABEL_COLOR_INACTIVE = "rgba(250,250,250,0.3)";
const DURATION_LABEL_COLOR_ACTIVE = "rgba(250,250,250,0.3)";

/** DURATION/STIPEND value: 16px, 500, 24px line height. Initial 0.5, on hover 1 */
const DURATION_VALUE = {
  fontFamily: FONT_MONTSERRAT,
  fontWeight: 500,
  fontSize: 16,
  lineHeight: "24px",
  letterSpacing: "0em",
  textAlign: "justify",
};
const DURATION_VALUE_COLOR_INACTIVE = "rgba(250,250,250,0.5)";
const DURATION_VALUE_COLOR_ACTIVE = "rgba(250,250,250,1)";

export default function TrainingJourney() {
  const [activeCard, setActiveCard] = useState("classroom");
  const classroomActive = activeCard === "classroom";
  const ojtActive = activeCard === "ojt";

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      if (typeof window !== "undefined") {
        setIsMobile(window.innerWidth < 640);
      }
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  const classroomVisualActive = classroomActive;
  const ojtVisualActive = ojtActive;

  return (
    <section
      id="training"
      className="bg-black text-white scroll-mt-24"
    >
      <div className="mx-auto px-section py-section lg:px-[120px] lg:pt-[110px] lg:pb-[110px]">
        {/* Section header */}
        <div className="text-left sm:text-center">
          <div
            className="inline-flex items-center justify-center rounded-full border border-white/30 py-1 px-4 sm:px-[30px]"
            style={{
              fontFamily:
                "Montserrat, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              fontWeight: 500,
              fontSize: 14,
              lineHeight: "27px",
              letterSpacing: "0em",
              textAlign: "center",
              color: "rgba(250,250,250,0.7)",
            }}
          >
            Training Journey
          </div>

          <p
            className="mt-4 mx-auto text-left sm:text-center max-w-[1040px]"
            style={{
              fontFamily:
                "Montserrat, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              fontWeight: 500,
              fontSize: 24,
              lineHeight: isMobile ? "36px" : "31.2px",
              color: "rgba(250,250,250,1)",
              whiteSpace: isMobile ? "normal" : "nowrap",
            }}
          >
            Structured learning that prepares you for real workplace responsibilities.
          </p>
        </div>

        {/* Two cards, same specs: fill width, 274px height, radius 10px, padding 24/16, gap 10px */}
        <div
          className="mt-4 sm:mt-6 flex flex-col lg:flex-row gap-4 max-w-[1040px] mx-auto"
          onMouseLeave={!isMobile ? () => setActiveCard("classroom") : undefined}
        >
          {/* Classroom Training card */}
          <article
            className="flex-1 min-w-0 max-w-full lg:basis-1/2 lg:max-w-none flex flex-col"
            style={{
              backgroundColor: isMobile
                ? "rgba(13, 11, 0, 1)"
                : classroomVisualActive
                  ? CARD_ACTIVE_BG
                  : "transparent",
              borderRadius: CARD_RADIUS,
              minHeight: CARD_MIN_HEIGHT,
              ...CARD_PADDING,
              gap: CARD_GAP,
            }}
            onMouseEnter={!isMobile ? () => setActiveCard("classroom") : undefined}
          >
            <div className="w-full flex flex-col flex-1" style={{ gap: CARD_GAP }}>
              <div>
                <img
                  src={classroomMobile}
                  alt=""
                  className="w-16 h-16 sm:hidden"
                  aria-hidden="true"
                />
                <img
                  src={classroomActive ? card1gold : card1}
                  alt=""
                  className="hidden sm:block w-12 h-12 sm:w-16 sm:h-16"
                  aria-hidden="true"
                />
              </div>

              <div>
                <h3
                  style={{
                    fontFamily: FONT_MONTSERRAT,
                    fontWeight: 600,
                    fontSize: 18,
                    lineHeight: "27px",
                    letterSpacing: "0em",
                    textAlign: isMobile ? "left" : "justify",
                    color: classroomVisualActive ? "rgba(250,250,250,1)" : "rgba(250,250,250,0.5)",
                  }}
                >
                  Classroom Training
                </h3>
                <p
                  style={{
                    fontFamily: FONT_MONTSERRAT,
                    fontWeight: 400,
                    fontSize: 14,
                    lineHeight: "21px",
                    letterSpacing: "0em",
                    textAlign: isMobile ? "left" : "justify",
                    color: classroomVisualActive
                      ? "rgba(250,250,250,0.8)"
                      : "rgba(250,250,250,0.5)",
                    marginTop: CARD_GAP,
                  }}
                >
                  Build strong role fundamentals through structured, instructor-led sessions
                  focused on real-world scenarios.
                </p>
              </div>

              <div
                className="flex flex-wrap gap-x-20 sm:gap-x-[100px] gap-y-2 text-xs tracking-[0.16em]"
                style={{ marginTop: 6 }}
              >
                <div>
                  <div
                    style={{
                      ...DURATION_LABEL,
                      textAlign: isMobile ? "left" : "justify",
                      color: classroomVisualActive
                        ? DURATION_LABEL_COLOR_ACTIVE
                        : DURATION_LABEL_COLOR_INACTIVE,
                    }}
                  >
                    DURATION
                  </div>
                  <div style={{ marginTop: 8 }} />
                  <div
                    style={{
                      ...DURATION_VALUE,
                      textAlign: isMobile ? "left" : "justify",
                      color: classroomVisualActive
                        ? DURATION_VALUE_COLOR_ACTIVE
                        : DURATION_VALUE_COLOR_INACTIVE,
                    }}
                  >
                    10 Days
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      ...DURATION_LABEL,
                      color: classroomVisualActive
                        ? DURATION_LABEL_COLOR_ACTIVE
                        : DURATION_LABEL_COLOR_INACTIVE,
                    }}
                  >
                    MODE
                  </div>
                  <div style={{ marginTop: 8 }} />
                  <div
                    style={{
                      ...DURATION_VALUE,
                      color: classroomVisualActive
                        ? DURATION_VALUE_COLOR_ACTIVE
                        : DURATION_VALUE_COLOR_INACTIVE,
                    }}
                  >
                    Online
                  </div>
                </div>
              </div>

              {/* Spacer: pushes bottom line down to match card 3 */}
              <div style={{ flex: 1, minHeight: 0 }} aria-hidden="true" />

              <div className="h-[2px] w-full bg-white sm:hidden" />
              <div
                className="hidden sm:block"
                style={{
                  height: classroomActive ? LINE_ACTIVE_HEIGHT : 1,
                  width: "100%",
                  maxWidth: "100%",
                  backgroundColor: classroomActive
                    ? LINE_ACTIVE_COLOR
                    : "rgba(250,250,250,0.25)",
                }}
              />
            </div>
          </article>

          {/* On-the-Job Training card */}
          <article
            className="flex-1 min-w-0 max-w-full lg:basis-1/2 lg:max-w-none flex flex-col"
            style={{
              backgroundColor: isMobile
                ? "rgba(13, 11, 0, 1)"
                : ojtVisualActive
                  ? CARD_ACTIVE_BG
                  : "transparent",
              borderRadius: CARD_RADIUS,
              minHeight: CARD_MIN_HEIGHT,
              ...CARD_PADDING,
              gap: CARD_GAP,
            }}
            onMouseEnter={!isMobile ? () => setActiveCard("ojt") : undefined}
          >
            <div className="w-full flex flex-col flex-1" style={{ gap: CARD_GAP }}>
              <div>
                <img
                  src={ojtMobile}
                  alt=""
                  className="w-16 h-16 sm:hidden"
                  aria-hidden="true"
                />
                <img
                  src={ojtActive ? card2gold : card2}
                  alt=""
                  className="hidden sm:block w-12 h-12 sm:w-16 sm:h-16"
                  aria-hidden="true"
                />
              </div>

              <div>
                <h3
                  style={{
                    fontFamily: FONT_MONTSERRAT,
                    fontWeight: 600,
                    fontSize: 18,
                    lineHeight: "27px",
                    letterSpacing: "0em",
                    textAlign: isMobile ? "left" : "justify",
                    color:
                      ojtVisualActive || isMobile
                        ? "rgba(250,250,250,1)"
                        : "rgba(250,250,250,0.5)",
                  }}
                >
                  On-the-Job Training
                </h3>
                <p
                  style={{
                    fontFamily: FONT_MONTSERRAT,
                    fontWeight: 400,
                    fontSize: 14,
                    lineHeight: "21px",
                    letterSpacing: "0em",
                    textAlign: isMobile ? "left" : "justify",
                    color:
                      ojtVisualActive || isMobile
                        ? "rgba(250,250,250,0.8)"
                        : "rgba(250,250,250,0.5)",
                    marginTop: CARD_GAP,
                  }}
                >
                  Transition into a live work environment where you apply your learning in
                  real business situations.
                </p>
              </div>

              <div
                className="flex flex-wrap gap-x-20 sm:gap-x-[100px] gap-y-2 text-xs tracking-[0.16em]"
                style={{ marginTop: 6 }}
              >
                <div>
                  <div
                    style={{
                      ...DURATION_LABEL,
                      textAlign: isMobile ? "left" : "justify",
                      color:
                        ojtVisualActive || isMobile
                          ? DURATION_LABEL_COLOR_ACTIVE
                          : DURATION_LABEL_COLOR_INACTIVE,
                    }}
                  >
                    DURATION
                  </div>
                  <div style={{ marginTop: 8 }} />
                  <div
                    style={{
                      ...DURATION_VALUE,
                      textAlign: isMobile ? "left" : "justify",
                      color:
                        ojtVisualActive || isMobile
                          ? DURATION_VALUE_COLOR_ACTIVE
                          : DURATION_VALUE_COLOR_INACTIVE,
                    }}
                  >
                    4 Weeks
                  </div>
                </div>
              </div>

              {/* Spacer: pushes bottom line down to match card 3 */}
              <div style={{ flex: 1, minHeight: 0 }} aria-hidden="true" />

              <div className="h-[2px] w-full bg-white sm:hidden" />
              <div
                className="hidden sm:block"
                style={{
                  height: ojtActive ? LINE_ACTIVE_HEIGHT : 1,
                  width: "100%",
                  maxWidth: "100%",
                  backgroundColor: ojtActive
                    ? LINE_ACTIVE_COLOR
                    : "rgba(250,250,250,0.25)",
                }}
              />
            </div>
          </article>

        </div>
      </div>
    </section>
  );
}