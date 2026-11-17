import React, { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import uthaanImg from "../assets/uthaan.jpg";
import aarohanImg from "../assets/aarohan.jpg";
import shikharImg from "../assets/shikhar.jpg";
import tickSvg from "../assets/hero-tick.svg";
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
    intro: "Learn how to perform on the job through:",
    items: [
      "Excelling in Relationship Management",
      "Improved Sales Performance",
      "Resolving Customer Needs",
      "Delivering strong business outcomes",
    ],
    image: shikharImg,
  },
];

export default function ClassroomTraining() {
  const sectionRef = useRef(null);
  const modulesRef = useRef(null);
  const imageRefs = useRef([]);
  const badgeRefs = useRef([]);
  const [progress, setProgress] = useState(0);
  const [lineBox, setLineBox] = useState({ top: 0, height: 0, markers: [0, 0.5, 1] });
  const [showBrochureModal, setShowBrochureModal] = useState(false);

  useLayoutEffect(() => {
    const measure = () => {
      const root = modulesRef.current;
      const badges = badgeRefs.current.filter(Boolean);
      if (!root || badges.length < 2) return;
      const rootTop = root.getBoundingClientRect().top;
      const centers = badges.map((badge) => {
        const rect = badge.getBoundingClientRect();
        return rect.top - rootTop + rect.height / 2;
      });
      const top = centers[0];
      const height = centers[centers.length - 1] - top;
      setLineBox({
        top,
        height,
        markers: centers.map((center) => (height ? (center - top) / height : 0)),
      });
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    const modules = modulesRef.current;
    const images = imageRefs.current;
    if (!modules) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: modules,
        scroller: document.body,
        start: "top+=100 center",
        end: "bottom bottom",
        onUpdate: (self) => {
          setProgress(self.progress);
        },
      });

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
              scroller: document.body,
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

  return (
    <section
      id="classroom-training"
      ref={sectionRef}
      className="relative scroll-mt-24 overflow-hidden bg-[#fafafa] text-[#231f20]"
    >
      <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-4 py-12 sm:px-8 lg:gap-10 lg:py-12 lg:pl-10 lg:pr-0 xl:pl-[120px]">
        <div className="training-modules-pill">
          3 Progressive Training Modules
        </div>

        <div ref={modulesRef} className="relative">
          <div
            className="pointer-events-none absolute left-[6px] hidden w-1 lg:block"
            style={{ top: lineBox.top, height: lineBox.height }}
          >
            <div className="h-full w-full rounded-full bg-[rgba(199,34,42,0.18)]" />
            <div
              className="absolute left-0 top-0 w-full rounded-full bg-[#c7222a]"
              style={{ height: `${progress * 100}%` }}
            />
            {lineBox.markers.map((threshold) => (
              <span
                key={threshold}
                className="absolute left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  top: `${threshold * 100}%`,
                  backgroundColor: progress >= threshold - 0.001 ? "#c7222a" : "#f3d4d6",
                }}
              />
            ))}
          </div>

          <div className="flex flex-col gap-10 lg:gap-8">
            {MODULES.map((module, index) => (
              <div
                key={module.key}
                className="flex flex-col items-stretch gap-6 bg-[#fafafa] lg:h-[341px] lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:pl-10"
              >
                <div className="min-w-0 lg:max-w-[520px]">
                  <div
                    ref={(el) => {
                      badgeRefs.current[index] = el;
                    }}
                    className="classroom-module-badge mb-3"
                  >
                    {module.label}
                  </div>
                  <h3 className="classroom-module-heading">{module.heading}</h3>
                  <p className="classroom-module-intro mt-2">{module.intro}</p>
                  <ul className="mt-3 flex flex-col gap-2">
                    {module.items.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="hero-tick shrink-0">
                          <img src={tickSvg} alt="" className="hero-tick-icon" aria-hidden="true" />
                        </span>
                        <span className="classroom-module-list-text min-w-0 flex-1">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="classroom-image-mobile h-[220px] w-full overflow-hidden rounded-none sm:h-[280px]">
                  <img
                    ref={(el) => {
                      imageRefs.current[index] = el;
                    }}
                    src={module.image}
                    alt={module.heading}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center sm:justify-start">
          <button
            type="button"
            className="download-brochure-btn download-brochure-btn--solid download-brochure-btn--unavailable border-0"
            disabled
            aria-disabled="true"
          >
            Download Brochure
          </button>
        </div>
      </div>
      <DownloadBrochureModal
        isOpen={showBrochureModal}
        onClose={() => setShowBrochureModal(false)}
      />
    </section>
  );
}
