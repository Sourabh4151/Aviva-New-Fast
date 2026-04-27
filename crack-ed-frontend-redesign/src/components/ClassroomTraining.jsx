import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import uthaanImg from "../assets/uthaan.png";
import aarohanImg from "../assets/aarohan.png";
import shikharImg from "../assets/shikhar.png";

const MODULES = [
  {
    key: "uthaan",
    label: "Utthan",
    heading: "Building Strong Foundations",
    description:
      "Utthan focuses on building a strong foundation by introducing candidates to the fundamentals of banking sales, core concepts, and customer interactions. It helps learners understand the role clearly while developing essential communication and field readiness skills needed to get started.",
    image: uthaanImg,
  },
  {
    key: "aarohan",
    label: "Aarohan",
    heading: "Product Mastery",
    description:
      "Aarohan moves into product mastery, where candidates develop a deeper understanding of banking products and customer needs. This stage equips them to confidently position offerings, handle conversations effectively, and drive meaningful sales outcomes.",
    image: aarohanImg,
  },
  {
    key: "shikhar",
    label: "Shikhar",
    heading: "Excel in Sales, Service & Growth",
    description:
      "Shikhar is centered on excelling in the role, with a focus on refining sales techniques, strengthening relationship management, and consistently delivering high performance. It prepares candidates to operate independently and succeed in a fast-paced, target-driven environment.",
    image: shikharImg,
  },
];

export default function ClassroomTraining() {
  const sectionRef = useRef(null);
  const modulesRef = useRef(null);
  const imageRefs = useRef([]);
  const [progress, setProgress] = useState(0);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    const modules = modulesRef.current;
    if (!modules) return;

    // Pixel offset from the top of the modules container so that the
    // scroll progress starts closer to "Building Strong Foundations".
    const START_OFFSET_PX = 100;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: modules,
        // "top+=OFFSET center" waits until the trigger has moved further
        // before starting the animation.
        start: `top+=${START_OFFSET_PX} center`,
        end: "bottom bottom",
        onUpdate: (self) => {
          setProgress(self.progress);
        },
      });
    });

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  // Image zoom-in when roughly 60% of the image is in view.
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    const images = imageRefs.current;
    if (!images || images.length === 0) return;

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
              // Approximate "60% visible": start zoom as image enters,
              // reach full zoom when most of it is in the viewport.
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

  const progressHeight = `${progress * 100}%`;
  // Fine-tuned dot positions so 2nd and 3rd sit slightly above their cards
  const dotPositions = [0, 35.5, 71.8];
  const maxDotPosition = dotPositions[dotPositions.length - 1] || 100;
  const dotOffsets = dotPositions.map(
    (position) => (position / maxDotPosition) * 100
  );

  return (
    <section
      id="classroom-training"
      ref={sectionRef}
      className="relative bg-black text-white scroll-mt-24 overflow-hidden"
    >
      {/* Blurred yellow background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-80px] top-1/2 -translate-y-1/2"
        style={{
          width: 420,
          height: 420,
          borderRadius: "999px",
          backgroundColor: "rgba(255, 217, 0, 0.05)",
          filter: "blur(100px)",
        }}
      />

      <div className="relative z-10 mx-auto px-section py-section lg:px-[120px] lg:pt-[110px] lg:pb-[110px] lg:pr-0">
        {/* Heading block */}
        <div className="max-w-xl">
          <div className="classroom-pill inline-flex items-center justify-center">
            Classroom Training
          </div>

          <p
            className="classroom-subtitle mt-3 sm:mt-4"
            style={{
              fontFamily: "Montserrat, ui-sans-serif, system-ui, sans-serif",
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

        {/* Modules with vertical progress marker */}
        <div className="mt-8 sm:mt-12 lg:mt-16 flex flex-col lg:flex-row gap-6 lg:gap-12">
          {/* Vertical progress bar + dots - hidden on mobile */}
          <div className="hidden lg:block relative flex-shrink-0" style={{ width: 40 }}>
            <div
              className="absolute left-1/2 -translate-x-1/2"
              style={{
                width: 4,
                top: 96,
                height: `${maxDotPosition}%`,
              }}
            >
              {/* Grey base line */}
              <div
                className="w-full h-full rounded-full"
                style={{ backgroundColor: "rgba(250,250,250,0.15)" }}
              />

              {/* Yellow progress line */}
              <div
                className="absolute left-1/2 -translate-x-1/2 top-0 w-full rounded-full"
                style={{
                  height: progressHeight,
                  backgroundColor: "rgba(151, 20, 77, 1)",
                }}
              />

              {/* Dots for each module */}
              {dotPositions.map((position, index) => {
                // Activate a dot only when the yellow line has visually
                // reached (or passed) that dot within the container.
                const threshold = dotOffsets[index] / 100;
                const isActive = progress >= threshold;
                return (
                  <div
                    key={MODULES[index].key}
                    className="absolute left-1/2 -translate-x-1/2"
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: "999px",
                      top: `calc(${dotOffsets[index]}% - 8px)`,
                      backgroundColor: isActive
                        ? "rgba(151, 20, 77, 1)"
                        : "rgba(63, 63, 63, 1)",
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Module rows */}
          <div className="flex-1 flex flex-col gap-0 min-w-0" ref={modulesRef}>
            {MODULES.map((module, index) => (
              <div
                key={module.key}
                className={index === 0 ? "" : "mt-12 sm:mt-16 lg:mt-[192px]"}
              >
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-stretch">
                  <div className="order-2 lg:order-1 flex-1 rounded-[10px] bg-black/20 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-full lg:max-w-[512px]">
                    <div
                      className="inline-flex items-center justify-center mb-4 text-sm font-medium tracking-normal"
                      style={{
                        borderRadius: 100,
                        border: "1px solid rgba(151, 20, 77, 1)",
                        backgroundColor: "rgba(151, 20, 77, 1)",
                        paddingTop: 4,
                        paddingBottom: 4,
                        paddingLeft: 30,
                        paddingRight: 30,
                        fontFamily:
                          "Montserrat, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                        fontWeight: 500,
                        fontSize: 14,
                        lineHeight: "27px",
                        letterSpacing: "0%",
                        color: "rgba(250, 250, 250, 1)",
                        textAlign: "center",
                      }}
                    >
                      {module.label}
                    </div>

                    <h3
                      className="classroom-module-heading"
                      style={{
                        fontFamily: "Montserrat, ui-sans-serif, system-ui, sans-serif",
                        fontWeight: 500,
                        fontSize: 18,
                        lineHeight: "27px",
                        letterSpacing: "0%",
                        textAlign: "justify",
                        textTransform: "capitalize",
                        color: "rgba(250, 250, 250, 1)",
                      }}
                    >
                      {module.heading}
                    </h3>

                    <p
                      className="classroom-module-body mt-3"
                      style={{
                        fontFamily: "Montserrat, ui-sans-serif, system-ui, sans-serif",
                        fontWeight: 400,
                        fontSize: 16,
                        lineHeight: "24px",
                        letterSpacing: "0%",
                        textAlign: "justify",
                        color: "rgba(250, 250, 250, 0.8)",
                      }}
                    >
                      {module.description}
                    </p>
                  </div>

                  <div
                    className="order-1 lg:order-2 classroom-image-mobile overflow-hidden ml-0 lg:ml-auto w-full lg:w-[504px] lg:flex-shrink-0 h-[220px] sm:h-[280px] lg:h-[353px] rounded-none sm:rounded-t-[10px] sm:rounded-b-[10px] lg:rounded-l-[10px] lg:rounded-tr-none lg:rounded-br-none lg:bg-black/20"
                  >
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

