import React, { useState, useEffect } from "react";
import card1 from "../assets/card1.svg";
import card2 from "../assets/card2.svg";
import card3 from "../assets/card3.svg";
import card1gold from "../assets/card1gold.svg";
import card2gold from "../assets/card2gold.svg";
import card3gold from "../assets/card3gold.svg";
import classroomMobile from "../assets/classroom_mobile.svg";
import ojtMobile from "../assets/ojt_mobile.svg";
import placementMobile from "../assets/placement_mobile.svg";

const FONT_MONTSERRAT =
  "Montserrat, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const FONT_NEWSREADER = "Newsreader, ui-serif, Georgia, serif";

const CARD_PADDING = { paddingTop: 24, paddingRight: 16, paddingBottom: 24, paddingLeft: 16 };
const CARD_GAP = 10;
const CARD_RADIUS = 10;
const CARD_MIN_HEIGHT = 276;
const MOBILE_BODY_COLOR = "rgba(203, 203, 204, 1)";
/** Background when card is hovered/active (design spec) */
const CARD_ACTIVE_BG = "rgba(13, 11, 0, 1)";
/** Bottom line when card is hovered/active: 2px, 304px wide, centered, dark blue */
const LINE_ACTIVE_HEIGHT = 2;
const LINE_ACTIVE_WIDTH = 304;
const LINE_ACTIVE_COLOR = "rgba(227, 185, 9, 1)";

export default function TrainingJourney() {
  const [activeCard, setActiveCard] = useState("classroom");
  const classroomActive = activeCard === "classroom";
  const ojtActive = activeCard === "ojt";
  const placementActive = activeCard === "placement";

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

  const classroomVisualActive = isMobile ? true : classroomActive;
  const ojtVisualActive = isMobile ? true : ojtActive;
  const placementVisualActive = isMobile ? true : placementActive;

  return (
    <section
      id="training"
      className="bg-black text-white scroll-mt-24"
    >
      <div className="mx-auto px-section py-section lg:px-[120px] lg:pt-[110px] lg:pb-[110px]">
        {/* Section header */}
        <div className="text-left sm:text-center">
          <div
            className="inline-flex items-center justify-center rounded-full border border-dashed sm:border-solid border-white/30 py-1 px-4 sm:px-[30px]"
            style={{
              fontFamily: FONT_MONTSERRAT,
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
              fontFamily: FONT_MONTSERRAT,
              fontWeight: 500,
              fontSize: 24,
              lineHeight: isMobile ? "100%" : "31.2px",
              letterSpacing: isMobile ? "-0.01em" : "0em",
              color: "rgba(250,250,250,1)",
              whiteSpace: isMobile ? "normal" : "nowrap",
              maxWidth: isMobile ? 361 : undefined,
            }}
          >
            {isMobile ? (
              <>
                Classroom is only the{" "}
                <span
                  style={{
                    fontFamily: FONT_NEWSREADER,
                    fontWeight: 500,
                    fontStyle: "italic",
                    fontSize: 28,
                    lineHeight: "100%",
                    letterSpacing: "0em",
                  }}
                >
                  Beginning
                </span>
              </>
            ) : (
              "Classroom is only the Beginning"
            )}
          </p>
        </div>

        {/* Three cards, same specs: 336px fill, 316px height, radius 10px, padding 24/16, gap 10px */}
        <div
          className="mt-4 sm:mt-6 flex flex-col lg:flex-row gap-4 max-w-[1040px] mx-auto"
          onMouseLeave={!isMobile ? () => setActiveCard("classroom") : undefined}
        >
          {/* Campus Immersion card */}
          <article
            className="flex-1 min-w-0 max-w-full lg:max-w-[336px] flex flex-col"
            style={{
              backgroundColor: classroomVisualActive
                ? isMobile
                  ? "rgba(13, 11, 0, 1)"
                  : CARD_ACTIVE_BG
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
                    lineHeight: isMobile ? "100%" : "27px",
                    letterSpacing: "0em",
                    textAlign: "justify",
                    color: classroomVisualActive ? "rgba(250,250,250,1)" : "rgba(250,250,250,0.5)",
                  }}
                >
                  Campus Immersion
                </h3>
                <p
                  style={{
                    fontFamily: FONT_MONTSERRAT,
                    fontWeight: 400,
                    fontSize: isMobile ? 16 : 14,
                    lineHeight: isMobile ? "100%" : "21px",
                    letterSpacing: "0em",
                    textAlign: "justify",
                    color: classroomVisualActive
                      ? isMobile
                        ? MOBILE_BODY_COLOR
                        : "rgba(250,250,250,0.8)"
                      : "rgba(250,250,250,0.5)",
                    marginTop: CARD_GAP,
                  }}
                >
                  Experience an immersive 5-day campus journey at India’s top management institute gaining valuable insights, building meaningful connections and networking on campus.
                </p>
              </div>

              <div style={{ flex: 1, minHeight: 0 }} aria-hidden="true" />

              <div className="h-[2px] w-full bg-white sm:hidden" />
              <div
                className="hidden sm:block"
                style={{
                  height: classroomActive ? LINE_ACTIVE_HEIGHT : 1,
                  width: classroomActive ? LINE_ACTIVE_WIDTH : "100%",
                  maxWidth: "100%",
                  marginLeft: classroomActive ? "auto" : undefined,
                  marginRight: classroomActive ? "auto" : undefined,
                  backgroundColor: classroomActive
                    ? LINE_ACTIVE_COLOR
                    : "rgba(250,250,250,0.25)",
                }}
              />
            </div>
          </article>

          {/* Industry Exposure card */}
          <article
            className="flex-1 min-w-0 max-w-full lg:max-w-[336px] flex flex-col"
            style={{
              backgroundColor: ojtVisualActive
                ? isMobile
                  ? "rgba(13, 11, 0, 1)"
                  : CARD_ACTIVE_BG
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
                    lineHeight: isMobile ? "100%" : "27px",
                    letterSpacing: "0em",
                    textAlign: "justify",
                    color: ojtVisualActive ? "rgba(250,250,250,1)" : "rgba(250,250,250,0.5)",
                  }}
                >
                  Industry Exposure
                </h3>
                <p
                  style={{
                    fontFamily: FONT_MONTSERRAT,
                    fontWeight: 400,
                    fontSize: isMobile ? 16 : 14,
                    lineHeight: isMobile ? "100%" : "21px",
                    letterSpacing: "0em",
                    textAlign: "justify",
                    color: ojtVisualActive
                      ? isMobile
                        ? MOBILE_BODY_COLOR
                        : "rgba(250,250,250,0.8)"
                      : "rgba(250,250,250,0.5)",
                    marginTop: CARD_GAP,
                  }}
                >
                  Visit 3 successful startups and businesses to observe how they operate, interact with founders, and learn from real entrepreneurial journeys.
                </p>
              </div>

              <div style={{ flex: 1, minHeight: 0 }} aria-hidden="true" />

              <div className="h-[2px] w-full bg-white sm:hidden" />
              <div
                className="hidden sm:block"
                style={{
                  height: ojtActive ? LINE_ACTIVE_HEIGHT : 1,
                  width: ojtActive ? LINE_ACTIVE_WIDTH : "100%",
                  maxWidth: "100%",
                  marginLeft: ojtActive ? "auto" : undefined,
                  marginRight: ojtActive ? "auto" : undefined,
                  backgroundColor: ojtActive
                    ? LINE_ACTIVE_COLOR
                    : "rgba(250,250,250,0.25)",
                }}
              />
            </div>
          </article>

          {/* Expert Advisory card */}
          <article
            className="flex-1 min-w-0 max-w-full lg:max-w-[336px] flex flex-col"
            style={{
              backgroundColor: placementVisualActive
                ? isMobile
                  ? "rgba(13, 11, 0, 1)"
                  : CARD_ACTIVE_BG
                : "transparent",
              borderRadius: CARD_RADIUS,
              minHeight: CARD_MIN_HEIGHT,
              ...CARD_PADDING,
              gap: CARD_GAP,
            }}
            onMouseEnter={!isMobile ? () => setActiveCard("placement") : undefined}
          >
            <div className="w-full flex flex-col flex-1" style={{ gap: CARD_GAP }}>
              <div>
                <img
                  src={placementMobile}
                  alt=""
                  className="w-16 h-16 sm:hidden"
                  aria-hidden="true"
                />
                <img
                  src={placementActive ? card3gold : card3}
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
                    lineHeight: isMobile ? "100%" : "27px",
                    letterSpacing: "0em",
                    textAlign: "justify",
                    color: placementVisualActive ? "rgba(250,250,250,1)" : "rgba(250,250,250,0.5)",
                  }}
                >
                  Expert Advisory
                </h3>
                <p
                  style={{
                    fontFamily: FONT_MONTSERRAT,
                    fontWeight: 400,
                    fontSize: isMobile ? 16 : 14,
                    lineHeight: isMobile ? "100%" : "21px",
                    letterSpacing: "0em",
                    textAlign: "justify",
                    color: placementVisualActive
                      ? isMobile
                        ? MOBILE_BODY_COLOR
                        : "rgba(250,250,250,0.8)"
                      : "rgba(250,250,250,0.5)",
                    marginTop: CARD_GAP,
                  }}
                >
                  Receive guidance through Quarterly Expert Advisory Clinics of experienced CAs, corporate lawyers, IP specialists, marketing, HR, and technology consultants and gain practical guidance with strategic insights that will draw informed business decisions.
                </p>
              </div>

              <div style={{ flex: 1, minHeight: 0 }} aria-hidden="true" />

              <div className="h-[2px] w-full bg-white sm:hidden" />
              <div
                className="hidden sm:block"
                style={{
                  height: placementActive ? LINE_ACTIVE_HEIGHT : 1,
                  width: placementActive ? LINE_ACTIVE_WIDTH : "100%",
                  maxWidth: "100%",
                  marginLeft: placementActive ? "auto" : undefined,
                  marginRight: placementActive ? "auto" : undefined,
                  backgroundColor: placementActive
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

