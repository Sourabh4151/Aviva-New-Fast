import React, { useLayoutEffect, useRef, useState } from "react";
import uthaanImg from "../assets/uthaan.png";
import aarohanImg from "../assets/aarohan.png";
import shikharImg from "../assets/shikhar.png";
import DownloadBrochureModal from "./DownloadBrochureModal";

const FONT_MONTSERRAT =
  "Montserrat, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const ACCENT = "rgba(59, 130, 246, 1)";

const MODULES = [
  {
    key: "uthaan",
    label: "Utthan",
    heading: "Building Strong Foundations",
    description:
      "Comprehensive pre-interview training that equips you with the fundamentals of inside sales, communication and customer engagement.",
    image: uthaanImg,
  },
  {
    key: "aarohan",
    label: "Aarohan",
    heading: "Product Mastery",
    description:
      "Post-selection training that teaches how to sell with confidence. Understand the EdTech Ecosystem, learn the product inside-out and master consultative selling to match learner needs with the right program.",
    image: aarohanImg,
  },
  {
    key: "shikhar",
    label: "Shikhar",
    heading: "Corporate Readiness",
    description:
      "Learn how to perform on the job. Get familiar with workplace tools, CRM systems and sales processes, and prepare for real-world scenarios with AI-led role plays and shadowing.",
    image: shikharImg,
  },
];

export default function ClassroomTraining() {
  const modulesRef = useRef(null);
  const pillRefs = useRef([]);
  const [dotTops, setDotTops] = useState([0, 0, 0]);
  const [showBrochureModal, setShowBrochureModal] = useState(false);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    const measure = () => {
      const parent = modulesRef.current;
      if (!parent) return;
      const parentTop = parent.getBoundingClientRect().top;
      setDotTops(
        pillRefs.current.map((el) => {
          if (!el) return 0;
          const box = el.getBoundingClientRect();
          return box.top - parentTop + box.height / 2;
        })
      );
    };

    measure();
    const observer =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    if (observer && modulesRef.current) observer.observe(modulesRef.current);
    window.addEventListener("resize", measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const firstDot = dotTops[0] || 0;
  const lastDot = dotTops[dotTops.length - 1] || 0;
  const trackHeight = Math.max(lastDot - firstDot, 0);

  return (
    <section
      id="classroom-training"
      className="relative bg-black text-white scroll-mt-24 overflow-hidden"
    >
      <div className="relative z-10 mx-auto w-full px-section py-section lg:pl-[120px] lg:pr-0 lg:pt-[110px] lg:pb-[110px]">
        <div className="classroom-heading flex w-full flex-col items-center lg:pr-[120px]">
          <div className="classroom-pill inline-flex items-center justify-center">
            Classroom Training
          </div>
          <p className="classroom-subtitle">
            Skills that prepare you for real workplace responsibilities.
          </p>
        </div>

        <div className="mt-8 sm:mt-10 lg:mt-12 relative" ref={modulesRef}>
          <div
            className="hidden lg:block absolute left-0 top-0 bottom-0"
            style={{ width: 24 }}
            aria-hidden="true"
          >
            {trackHeight > 0 && (
              <div
                className="absolute left-1/2 -translate-x-1/2"
                style={{
                  width: 2,
                  top: firstDot,
                  height: trackHeight,
                  backgroundColor: "rgba(250,250,250,0.15)",
                  borderRadius: 999,
                }}
              />
            )}
            {dotTops.map((top, index) => (
              <div
                key={MODULES[index].key}
                className="absolute left-1/2 -translate-x-1/2"
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "999px",
                  top: top - 6,
                  backgroundColor: index === 0 ? ACCENT : "rgba(63, 63, 63, 1)",
                  boxShadow: index === 0 ? `0 0 10px ${ACCENT}` : "none",
                }}
              />
            ))}
          </div>

          <div className="flex flex-col gap-6 sm:gap-8 lg:gap-6 lg:pl-8">
            {MODULES.map((module) => (
              <div key={module.key} className="classroom-module-row">
                <div className="classroom-module-split flex flex-col lg:grid lg:grid-cols-[326px_minmax(0,1fr)] gap-5 lg:gap-8 lg:items-start">
                  <div className="order-2 lg:order-1 min-w-0">
                    <div
                      ref={(el) => {
                        const index = MODULES.findIndex(
                          (item) => item.key === module.key
                        );
                        pillRefs.current[index] = el;
                      }}
                      className="classroom-module-label"
                    >
                      {module.label}
                    </div>
                    <h3 className="classroom-module-heading mt-3">
                      {module.heading}
                    </h3>
                    <p className="classroom-module-body mt-2 sm:mt-3">
                      {module.description}
                    </p>
                  </div>

                  <div className="order-1 lg:order-2 classroom-image-mobile overflow-hidden w-full min-w-0 lg:h-[287px]">
                    <img
                      src={module.image}
                      alt={module.heading}
                      className="classroom-module-image"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 sm:mt-8 flex justify-center sm:justify-start lg:pl-8">
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="download-brochure-btn border-0"
              style={{ fontFamily: FONT_MONTSERRAT }}
            >
              Download Brochure
            </button>
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
