import React, { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import uthaanImg from "../assets/uthaan.png";
import aarohanImg from "../assets/aarohan.png";
import shikharImg from "../assets/shikhar.png";
import tickSvg from "../assets/tick.svg";
import DownloadBrochureModal from "./DownloadBrochureModal";

const MODULES = [
  {
    key: "utthan",
    label: "Utthan",
    heading: "Building Strong Foundations",
    intro: "Build a strong foundation for your career by developing:",
    items: [
      "Soft Skills",
      "Professional Communication",
      "Customer Interaction",
      "Workplace Etiquette",
    ],
    image: uthaanImg,
  },
  {
    key: "aarohan",
    label: "Aarohan",
    heading: "Product Mastery",
    intro: "Deepen your understanding of:",
    items: [
      "Financial Products",
      "Customer Requirements",
      "Relationship-based Selling",
      "Handling Customers",
    ],
    image: aarohanImg,
  },
  {
    key: "shikhar",
    label: "Shikhar",
    heading: "Excel In Sales, Service & Growth",
    intro: "Take your skills to the next level:",
    items: [
      "Excel Relationship Management",
      "Improve Sales Performance",
      "Resolving Customer Needs",
      "Deliver strong business outcomes",
    ],
    image: shikharImg,
  },
];

export default function ClassroomTraining() {
  const sectionRef = useRef(null);
  const modulesRef = useRef(null);
  const imageRefs = useRef([]);
  const [progress, setProgress] = useState(0);
  const [showBrochureModal, setShowBrochureModal] = useState(false);

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
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

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
  const dotPositions = [0, 33.7, 67.2];
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
      <div className="relative z-10 mx-auto px-section py-section lg:px-[120px] lg:pt-[110px] lg:pb-[110px] lg:pr-0">
        <div className="max-w-xl">
          <div className="classroom-pill inline-flex items-center justify-center">
            Classroom Training
          </div>

          <p className="classroom-subtitle mt-3 sm:mt-4">
            Three progressive modules guiding you toward professional readiness.
          </p>
        </div>

        <div className="mt-8 sm:mt-12 lg:mt-16 flex flex-col lg:flex-row gap-6 lg:gap-12">
          <div className="hidden lg:block relative flex-shrink-0" style={{ width: 40 }}>
            <div
              className="absolute left-1/2 -translate-x-1/2"
              style={{
                width: 4,
                top: 96,
                height: `${maxDotPosition}%`,
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
                  backgroundColor: "#c7222a",
                }}
              />

              {dotPositions.map((position, index) => {
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
                        ? "#c7222a"
                        : "rgba(63, 63, 63, 1)",
                    }}
                  />
                );
              })}
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-0 min-w-0" ref={modulesRef}>
            {MODULES.map((module, index) => (
              <div
                key={module.key}
                className={index === 0 ? "" : "mt-12 sm:mt-16 lg:mt-[96px]"}
              >
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-stretch">
                  <div className="order-2 lg:order-1 flex-1 rounded-[10px] bg-black/20 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-full lg:max-w-[512px]">
                    <div className="classroom-module-badge mb-4">{module.label}</div>

                    <h3 className="classroom-module-heading">{module.heading}</h3>

                    <p className="classroom-module-intro mt-3">{module.intro}</p>

                    <ul className="mt-3 flex flex-col gap-3">
                      {module.items.map((item) => (
                        <li key={item} className="flex items-start gap-2 sm:gap-3">
                          <span className="hero-tick shrink-0">
                            <img src={tickSvg} alt="" className="hero-tick-icon" aria-hidden="true" />
                          </span>
                          <span className="classroom-module-list-text min-w-0 flex-1">
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

                {index === MODULES.length - 1 && (
                  <div className="mt-6 sm:mt-8 flex justify-center sm:justify-start">
                    <button
                      type="button"
                      onClick={() => setShowBrochureModal(true)}
                      className="download-brochure-btn border-0"
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
