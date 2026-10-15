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

const FONT =
  "'Anek Latin', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const CARD_PADDING = { paddingTop: 24, paddingRight: 16, paddingBottom: 24, paddingLeft: 16 };
const CARD_GAP = 10;
const CARD_RADIUS = 10;
const CARD_MIN_HEIGHT = 316;
const CARD_ACTIVE_BG = "rgba(24, 3, 4, 1)";
const LINE_ACTIVE_HEIGHT = 2;
const LINE_ACTIVE_WIDTH = 304;
const LINE_ACTIVE_COLOR = "#c7222a";

const DURATION_LABEL = {
  fontFamily: FONT,
  fontWeight: 600,
  fontSize: 12,
  lineHeight: "21px",
  letterSpacing: 0,
  textTransform: "uppercase",
  textAlign: "justify",
};
const DURATION_LABEL_COLOR_INACTIVE = "rgba(250, 250, 250, 0.3)";
const DURATION_LABEL_COLOR_ACTIVE = "rgba(250, 250, 250, 0.6)";

const DURATION_VALUE = {
  fontFamily: FONT,
  fontWeight: 500,
  fontSize: 16,
  lineHeight: "24px",
  letterSpacing: 0,
  textAlign: "justify",
};
const DURATION_VALUE_COLOR_INACTIVE = "rgba(250, 250, 250, 0.5)";
const DURATION_VALUE_COLOR_ACTIVE = "rgba(250, 250, 250, 1)";

const CARDS = [
  {
    id: "classroom",
    title: "Classroom Training",
    description:
      "Build strong role fundamentals through structured, instructor-led sessions focused on practical knowledge and real-world scenarios.",
    mobileIcon: classroomMobile,
    desktopIcon: card1,
    desktopIconActive: card1gold,
    meta: [
      { label: "DURATION", value: "3 Months" },
      { label: "STIPEND", value: "₹10,000" },
    ],
  },
  {
    id: "internship",
    title: "Internship",
    description:
      "Gain real-world exposure to health insurance sales, customer interactions, product understanding.",
    mobileIcon: ojtMobile,
    desktopIcon: card2,
    desktopIconActive: card2gold,
    meta: [{ label: "DURATION", value: "3 Months" }],
  },
  {
    id: "ojt",
    title: "On the Job Training",
    description:
      "Apply your learning on the job while handling customers, understanding their needs, recommending suitable insurance solutions and driving business outcomes.",
    mobileIcon: placementMobile,
    desktopIcon: card3,
    desktopIconActive: card3gold,
    meta: [{ label: "DURATION", value: "3 Months" }],
  },
];

function cardTitleStyle(isActive, isMobile) {
  return {
    fontFamily: FONT,
    fontWeight: 500,
    fontSize: 18,
    lineHeight: "27px",
    letterSpacing: 0,
    textAlign: isMobile ? "left" : "justify",
    color: isActive ? "rgba(250, 250, 250, 0.8)" : "rgba(250, 250, 250, 0.5)",
  };
}

function cardBodyStyle(isActive, isMobile) {
  return {
    fontFamily: FONT,
    fontWeight: 400,
    fontSize: 16,
    lineHeight: "100%",
    letterSpacing: 0,
    textAlign: isMobile ? "left" : "justify",
    color: isActive ? "rgba(250, 250, 250, 0.7)" : "rgba(250, 250, 250, 0.5)",
    marginTop: CARD_GAP,
  };
}

export default function TrainingJourney() {
  const [activeCard, setActiveCard] = useState("classroom");
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

  return (
    <section id="training" className="bg-black text-white scroll-mt-24">
      <div className="mx-auto px-section py-section lg:px-[120px] lg:pt-[110px] lg:pb-[110px]">
        <div className="text-left sm:text-center">
          <div
            className="inline-flex items-center justify-center rounded-full border border-white/30 py-1 px-4 sm:px-[30px] type-section-eyebrow"
            style={{
              fontFamily: FONT,
              fontWeight: 500,
              color: "rgba(250, 250, 250, 0.7)",
            }}
          >
            Training Journey
          </div>

          <p
            className="mt-4 mx-auto text-left sm:text-center max-w-[736px]"
            style={{
              fontFamily: FONT,
              fontWeight: 500,
              fontSize: 24,
              lineHeight: "100%",
              letterSpacing: 0,
              color: "rgba(250, 250, 250, 1)",
            }}
          >
            Structured learning that prepares you for real workplace responsibilities.
          </p>
        </div>

        <div
          className="mt-4 sm:mt-6 flex flex-col lg:flex-row gap-4 max-w-[1040px] mx-auto"
          onMouseLeave={!isMobile ? () => setActiveCard("classroom") : undefined}
        >
          {CARDS.map((card) => {
            const isActive = activeCard === card.id;
            const visualActive = isMobile ? true : isActive;

            return (
              <article
                key={card.id}
                className="flex-1 min-w-0 max-w-full lg:max-w-[336px] flex flex-col"
                style={{
                  backgroundColor: visualActive
                    ? isMobile
                      ? "rgba(13, 11, 0, 1)"
                      : CARD_ACTIVE_BG
                    : "transparent",
                  borderRadius: CARD_RADIUS,
                  ...(isMobile ? {} : { minHeight: CARD_MIN_HEIGHT }),
                  ...CARD_PADDING,
                  gap: CARD_GAP,
                }}
                onMouseEnter={!isMobile ? () => setActiveCard(card.id) : undefined}
              >
                <div
                  className={`w-full flex flex-col ${isMobile ? "" : "flex-1"}`}
                  style={{ gap: CARD_GAP }}
                >
                  <div>
                    <img
                      src={card.mobileIcon}
                      alt=""
                      className="w-16 h-16 sm:hidden"
                      aria-hidden="true"
                    />
                    <img
                      src={isActive ? card.desktopIconActive : card.desktopIcon}
                      alt=""
                      className="hidden sm:block w-12 h-12 sm:w-16 sm:h-16"
                      aria-hidden="true"
                    />
                  </div>

                  <div>
                    <h3 style={cardTitleStyle(visualActive, isMobile)}>{card.title}</h3>
                    <p style={cardBodyStyle(visualActive, isMobile)}>{card.description}</p>
                  </div>

                  <div
                    className="flex flex-wrap gap-x-20 sm:gap-x-[100px] gap-y-2"
                    style={{ marginTop: 6 }}
                  >
                    {card.meta.map(({ label, value }) => (
                      <div key={label}>
                        <div
                          style={{
                            ...DURATION_LABEL,
                            textAlign: isMobile ? "left" : "justify",
                            color: visualActive
                              ? DURATION_LABEL_COLOR_ACTIVE
                              : DURATION_LABEL_COLOR_INACTIVE,
                          }}
                        >
                          {label}
                        </div>
                        <div style={{ marginTop: 8 }} />
                        <div
                          style={{
                            ...DURATION_VALUE,
                            textAlign: isMobile ? "left" : "justify",
                            color: visualActive
                              ? DURATION_VALUE_COLOR_ACTIVE
                              : DURATION_VALUE_COLOR_INACTIVE,
                          }}
                        >
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {!isMobile && <div style={{ flex: 1, minHeight: 0 }} aria-hidden="true" />}

                  <div className="h-[2px] w-full bg-white sm:hidden" />
                  <div
                    className="hidden sm:block"
                    style={{
                      height: isActive ? LINE_ACTIVE_HEIGHT : 1,
                      width: isActive ? LINE_ACTIVE_WIDTH : "100%",
                      maxWidth: "100%",
                      marginLeft: isActive ? "auto" : undefined,
                      marginRight: isActive ? "auto" : undefined,
                      backgroundColor: isActive
                        ? LINE_ACTIVE_COLOR
                        : "rgba(250, 250, 250, 0.25)",
                    }}
                  />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
