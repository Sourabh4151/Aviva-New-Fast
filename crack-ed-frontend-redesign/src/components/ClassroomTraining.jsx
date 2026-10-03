import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import uthaanImg from "../assets/uthaan.jpg";
import aarohanImg from "../assets/aarohan.png";
import shikharImg from "../assets/shikhar.jpg";

const ACCENT_BLUE = "rgba(28, 50, 214, 1)";
const FONT =
  "Montserrat, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const MODULES = [
  {
    key: "uthaan",
    label: "Utthan",
    heading: "Building Strong Foundations",
    leadIn: "Start with the fundamentals of",
    items: [
      "Banking Ecosystem",
      "Retail Banking",
      "Customer Engagement",
      "Compliance",
    ],
    image: uthaanImg,
  },
  {
    key: "aarohan",
    label: "Aarohan",
    heading: "Product Mastery",
    leadIn: "Develop a deep understanding of",
    items: [
      "CASA Roles",
      "Identifying Customer Needs",
      "Customer Onboarding",
      "Banking Products",
    ],
    image: aarohanImg,
  },
  {
    key: "shikhar",
    label: "Shikhar",
    heading: "Excel In Sales, Service & Growth",
    leadIn: "Build the skills for",
    items: [
      "Customer-facing Sales Role",
      "Lead Generation",
      "Objection Handling",
      "Targets Achievement",
    ],
    image: shikharImg,
  },
];

function ModuleCheckIcon() {
  return (
    <span
      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
      style={{ backgroundColor: ACCENT_BLUE }}
      aria-hidden="true"
    >
      <svg width="12" height="9" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M1 4.5L4.2 7.5L11 1.5"
          stroke="rgba(250,250,250,1)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

const MODULE_BADGE_STYLE = {
  borderRadius: 100,
  border: `1px solid ${ACCENT_BLUE}`,
  backgroundColor: ACCENT_BLUE,
  paddingTop: 4,
  paddingBottom: 4,
  paddingLeft: 30,
  paddingRight: 30,
  fontFamily: FONT,
  fontWeight: 500,
  fontSize: 14,
  lineHeight: "27px",
  letterSpacing: "0em",
  color: "rgba(250, 250, 250, 1)",
  textAlign: "center",
};

const EMPTY_TIMELINE = { top: 0, height: 1, dotTops: [0, 0, 0] };

export default function ClassroomTraining() {
  const sectionRef = useRef(null);
  const modulesRef = useRef(null);
  const timelineColumnRef = useRef(null);
  const timelineTrackRef = useRef(null);
  const labelRefs = useRef([]);
  const imageRefs = useRef([]);
  const [progress, setProgress] = useState(0);
  const [timelineLayout, setTimelineLayout] = useState(EMPTY_TIMELINE);

  const measureTimeline = useCallback(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(min-width: 1024px)").matches) return;

    const column = timelineColumnRef.current;
    const labels = labelRefs.current.filter(Boolean);
    if (!column || labels.length !== MODULES.length) return;

    const columnRect = column.getBoundingClientRect();
    const centers = labels.map((label) => {
      const rect = label.getBoundingClientRect();
      return rect.top + rect.height / 2 - columnRect.top;
    });

    const trackTop = centers[0];
    const trackHeight = centers[centers.length - 1] - centers[0];
    if (trackHeight <= 0) return;

    const dotTops = centers.map((center) => center - trackTop);
    setTimelineLayout({ top: trackTop, height: trackHeight, dotTops });
  }, []);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    const modules = modulesRef.current;
    if (!modules) return;

    const START_OFFSET_PX = 100;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: modules,
        start: `top+=${START_OFFSET_PX} center`,
        end: "bottom bottom",
        onUpdate: (self) => {
          setProgress(self.progress);
        },
      });
    });

    return () => {
      ctx.revert();
    };
  }, []);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    const images = imageRefs.current;
    if (!images?.length) return;

    const ctx = gsap.context(() => {
      images.forEach((img) => {
        if (!img) return;

        gsap.fromTo(
          img,
          { scale: 1 },
          {
            scale: 1.5,
            transformOrigin: "center center",
            ease: "power2.out",
            scrollTrigger: {
              trigger: img,
              start: "top 80%",
              end: "bottom 40%",
              scrub: true,
            },
          }
        );
      });
    });

    return () => {
      ctx.revert();
    };
  }, []);

  useLayoutEffect(() => {
    measureTimeline();

    window.addEventListener("resize", measureTimeline);
    const modules = modulesRef.current;
    const observer =
      typeof ResizeObserver !== "undefined" && modules
        ? new ResizeObserver(measureTimeline)
        : null;
    observer?.observe(modules);

    imageRefs.current.forEach((img) => {
      if (img && !img.complete) {
        img.addEventListener("load", measureTimeline);
      }
    });

    return () => {
      window.removeEventListener("resize", measureTimeline);
      observer?.disconnect();
      imageRefs.current.forEach((img) => {
        img?.removeEventListener("load", measureTimeline);
      });
    };
  }, [measureTimeline]);

  const progressHeight = `${progress * 100}%`;
  const { top: trackTop, height: trackHeight, dotTops } = timelineLayout;

  return (
    <section
      id="classroom-training"
      ref={sectionRef}
      className="relative bg-black text-white scroll-mt-24 overflow-hidden"
    >
      <div className="relative z-10 mx-auto px-section py-section lg:px-[120px] lg:pt-[110px] lg:pb-[110px] lg:pr-0">
        <div className="max-w-xl">
          <div className="classroom-pill inline-flex items-center justify-center">
            Classroom Training
          </div>

          <p
            className="classroom-subtitle mt-3 sm:mt-4"
            style={{
              fontFamily: FONT,
              fontWeight: 500,
              fontSize: 24,
              lineHeight: "31.2px",
              letterSpacing: "0%",
              textAlign: "justify",
              color: "rgba(250, 250, 250, 1)",
            }}
          >
            Three progressive modules guiding you toward professional readiness.
          </p>
        </div>

        <div className="mt-8 sm:mt-12 lg:mt-16 flex flex-col lg:flex-row items-stretch gap-6 lg:gap-12">
          <div
            ref={timelineColumnRef}
            className="relative hidden lg:block shrink-0 self-stretch"
            style={{ width: 40 }}
          >
            <div
              ref={timelineTrackRef}
              className="absolute left-1/2 -translate-x-1/2"
              style={{
                width: 4,
                top: trackTop,
                height: trackHeight,
              }}
            >
              <div
                className="w-full h-full rounded-full"
                style={{ backgroundColor: "rgba(250,250,250,0.15)" }}
              />
              <div
                className="absolute left-1/2 -translate-x-1/2 top-0 w-full rounded-full"
                style={{
                  height: progressHeight,
                  backgroundColor: ACCENT_BLUE,
                }}
              />
              {dotTops.map((dotTop, index) => {
                const threshold = dotTop / trackHeight;
                const isActive = progress >= threshold;
                return (
                  <div
                    key={MODULES[index].key}
                    className="absolute left-1/2 -translate-x-1/2"
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: "999px",
                      top: dotTop - 8,
                      backgroundColor: isActive ? ACCENT_BLUE : "rgba(63, 63, 63, 1)",
                    }}
                  />
                );
              })}
            </div>
          </div>

          <div className="flex-1 min-w-0 flex flex-col" ref={modulesRef}>
            {MODULES.map((module, index) => (
              <div
                key={module.key}
                className={index === 0 ? "" : "mt-12 sm:mt-16 lg:mt-[96px]"}
              >
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-stretch">
                  <div className="order-2 lg:order-1 flex-1 min-w-0 lg:max-w-[512px]">
                    <div
                      ref={(el) => {
                        labelRefs.current[index] = el;
                      }}
                      className="inline-flex items-center justify-center mb-4 text-sm font-medium tracking-normal"
                      style={MODULE_BADGE_STYLE}
                    >
                      {module.label}
                    </div>

                    <h3
                      className="classroom-module-heading normal-case"
                      style={{
                        fontFamily: FONT,
                        fontWeight: 600,
                        fontSize: 18,
                        lineHeight: "27px",
                        letterSpacing: "0em",
                        textAlign: "left",
                        textTransform: "none",
                        color: "rgba(250, 250, 250, 1)",
                      }}
                    >
                      {module.heading}
                    </h3>

                    <p
                      className="mt-3"
                      style={{
                        fontFamily: FONT,
                        fontWeight: 400,
                        fontSize: 16,
                        lineHeight: "24px",
                        letterSpacing: "0%",
                        textAlign: "left",
                        color: "rgba(250, 250, 250, 0.8)",
                      }}
                    >
                      {module.leadIn}
                    </p>

                    <ul className="mt-4 flex flex-col gap-3 sm:gap-4">
                      {module.items.map((item) => (
                        <li key={item} className="flex items-center gap-3">
                          <ModuleCheckIcon />
                          <span
                            style={{
                              fontFamily: FONT,
                              fontWeight: 400,
                              fontSize: 16,
                              lineHeight: "24px",
                              letterSpacing: "0em",
                              color: "rgba(250, 250, 250, 1)",
                            }}
                          >
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="order-1 lg:order-2 classroom-image-mobile overflow-hidden ml-0 lg:ml-auto w-full lg:w-[504px] lg:flex-shrink-0 h-[220px] sm:h-[280px] lg:h-[353px] rounded-none sm:rounded-t-[10px] sm:rounded-b-[10px] lg:rounded-l-[10px] lg:rounded-tr-none lg:rounded-br-none lg:bg-black/20">
                    <img
                      ref={(el) => {
                        imageRefs.current[index] = el;
                      }}
                      src={module.image}
                      alt={module.heading}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
