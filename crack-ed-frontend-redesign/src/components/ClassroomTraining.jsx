import React, { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import learnImg from "../assets/LEARN.png";
import applyImg from "../assets/APPLY.png";
import excelImg from "../assets/EXCEL.png";
import immerseImg from "../assets/IMMERSE.png";
import buildImg from "../assets/BUILD.png";
import belongImg from "../assets/BELONG.png";
import tickSvg from "../assets/tick.svg";
import DownloadBrochureModal from "./DownloadBrochureModal";

const MODULES = [
  {
    key: "learn",
    label: "Learn",
    heading: "Where the founder mindset begins",
    description:
      "Live, interactive weekend sessions covering a practical, industry-focused curriculum taught by experienced founders and practitioners",
    points: [
      "Saturday & Sunday live classes",
      "Industry-focused, practical curriculum",
    ],
    image: learnImg,
  },
  {
    key: "apply",
    label: "Apply",
    heading: "Turn theory into traction",
    description:
      "Real founder case studies, AI implementation, and hands-on assignments — with direct mentor feedback at every step",
    points: [
      "Learn through real case studies",
      "Hands-on assignments with mentor feedback",
    ],
    image: applyImg,
  },
  {
    key: "excel",
    label: "Excel",
    heading: "Learn from those already ahead",
    description:
      "Exclusive visits to mentor-led startups, with personalized mentorship for top performers to accelerate their own venture.",
    points: [
      "Industrial visits to mentor-led startups",
      "Personalized visits for top 3 performers",
    ],
    image: excelImg,
  },
  {
    key: "immerse",
    label: "Immerse",
    heading: "Step onto India's top campus",
    description:
      "A 5-day immersive journey at India's top management institute, with faculty sessions and real founder networking.",
    points: [
      "Faculty-led classroom sessions",
      "Networking with entrepreneurs and mentors",
    ],
    image: immerseImg,
  },
  {
    key: "build",
    label: "Build",
    heading: "Make it investor-ready",
    description:
      "Develop a fundraising-ready pitch deck and solve a real challenge from your own business as your capstone.",
    points: [
      "Investor-ready pitch deck",
      "Capstone project on your real business",
    ],
    image: buildImg,
  },
  {
    key: "belong",
    label: "Belong",
    heading: "A network that outlasts the cohort",
    description:
      "Lifetime access to a founder community connecting you with investors, mentors, and industry leaders beyond the fellowship.",
    points: [
      "Lifetime community access",
      "Network with founders, investors, mentors",
    ],
    image: belongImg,
  },
];

export default function ClassroomTraining() {
  const sectionRef = useRef(null);
  const modulesRef = useRef(null);
  const progressColumnRef = useRef(null);
  const headingRefs = useRef([]);
  const imageRefs = useRef([]);
  const [progress, setProgress] = useState(0);
  const [showBrochureModal, setShowBrochureModal] = useState(false);
  const [dotLayout, setDotLayout] = useState({
    lineTop: 0,
    lineHeight: 0,
    dots: [],
  });

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

  // Pin each timeline dot to the vertical center of its module heading.
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    const measureDots = () => {
      const column = progressColumnRef.current;
      const headings = headingRefs.current.filter(Boolean);
      if (!column || headings.length === 0) return;

      const columnTop = column.getBoundingClientRect().top;
      const dots = headings.map((heading) => {
        const rect = heading.getBoundingClientRect();
        return rect.top + rect.height / 2 - columnTop;
      });

      const lineTop = dots[0];
      const lineHeight = dots[dots.length - 1] - dots[0];

      setDotLayout((prev) => {
        const unchanged =
          prev.dots.length === dots.length &&
          Math.abs(prev.lineTop - lineTop) < 0.5 &&
          Math.abs(prev.lineHeight - lineHeight) < 0.5 &&
          prev.dots.every((value, i) => Math.abs(value - dots[i]) < 0.5);
        return unchanged ? prev : { lineTop, lineHeight, dots };
      });
    };

    measureDots();

    const resizeObserver = new ResizeObserver(measureDots);
    if (progressColumnRef.current) resizeObserver.observe(progressColumnRef.current);
    if (modulesRef.current) resizeObserver.observe(modulesRef.current);
    window.addEventListener("resize", measureDots);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measureDots);
    };
  }, []);

  const progressHeight =
    dotLayout.lineHeight > 0 ? `${progress * 100}%` : "0%";
  const dotThresholds = dotLayout.dots.map((y) =>
    dotLayout.lineHeight > 0 ? (y - dotLayout.lineTop) / dotLayout.lineHeight : 0
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
        <div className="w-full max-w-[1040px]">
          <div className="classroom-pill inline-flex items-center justify-center">
          Learning Framework
          </div>

          <p className="classroom-subtitle mt-3 sm:mt-4">
            6 Months. 156 Learning Hours.{" "}
            <em>One Transformational Journey.</em>
          </p>
        </div>

        {/* Modules with vertical progress marker */}
        <div className="mt-8 sm:mt-12 lg:mt-16 flex flex-col lg:flex-row gap-6 lg:gap-12">
          {/* Vertical progress bar + dots - hidden on mobile */}
          <div
            ref={progressColumnRef}
            className="hidden lg:block relative flex-shrink-0"
            style={{ width: 40 }}
          >
            <div
              className="absolute left-1/2 -translate-x-1/2"
              style={{
                width: 4,
                top: dotLayout.lineTop,
                height: dotLayout.lineHeight,
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
                  backgroundColor: "rgba(227, 185, 9, 1)",
                }}
              />

              {/* Dots aligned to each module heading */}
              {dotLayout.dots.map((y, index) => {
                const isActive = progress >= dotThresholds[index];
                return (
                  <div
                    key={MODULES[index].key}
                    className="absolute left-1/2 -translate-x-1/2"
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: "999px",
                      top: y - dotLayout.lineTop - 8,
                      backgroundColor: isActive
                        ? "rgba(227, 185, 9, 1)"
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
                className={index === 0 ? "" : "mt-6 sm:mt-8 lg:mt-[96px]"}
              >
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-stretch">
                  <div className="order-2 lg:order-1 flex-1 rounded-[10px] bg-black/20 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-full lg:max-w-[512px]">
                    <div className="classroom-module-label inline-flex items-center justify-center mb-4">
                      {module.label}
                    </div>

                    <h3
                      ref={(el) => {
                        headingRefs.current[index] = el;
                      }}
                      className="classroom-module-heading"
                    >
                      {module.heading}
                    </h3>

                    <p className="classroom-module-body mt-3">
                      {module.description}
                    </p>

                    <ul className="mt-4 flex flex-col gap-3">
                      {module.points.map((point) => (
                        <li
                          key={point}
                          className="flex items-center gap-3"
                        >
                          <img
                            src={tickSvg}
                            alt=""
                            width={20}
                            height={20}
                            className="shrink-0"
                            style={{ width: 20, height: 20 }}
                            aria-hidden="true"
                          />
                          <span className="classroom-module-point">
                            {point}
                          </span>
                        </li>
                      ))}
                    </ul>
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

                {/* Download brochure CTA only for the last module (Scale),
                    placed below the entire row so it sits visually under the image end */}
                {index === MODULES.length - 1 && (
                  <div className="mt-6 sm:mt-8 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setShowBrochureModal(true)}
                      className="inline-flex items-center justify-center rounded-[10px] py-4 px-4 sm:px-6 bg-white text-[#1e1e1e] font-semibold text-sm border-0 cursor-pointer shadow-lg hover:bg-[#d2d2d2] transition-colors"
                      style={{
                        fontFamily:
                          "Montserrat, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                      }}
                    >
                      Download Brochure
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <DownloadBrochureModal
        isOpen={showBrochureModal}
        onClose={() => setShowBrochureModal(false)}
      />
    </section>
  );
}

