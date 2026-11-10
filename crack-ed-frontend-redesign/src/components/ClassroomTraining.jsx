import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import utthanImg from "../assets/figma/utthan.png";
import aarohanImg from "../assets/figma/aarohan.png";
import shikharImg from "../assets/figma/shikhar.png";
import checkIcon from "../assets/figma/check.svg";
import downloadIcon from "../assets/figma/download.svg";
import DownloadBrochureModal from "./DownloadBrochureModal";

const MODULES = [
  {
    key: "utthan",
    label: "Utthan",
    heading: "Foundational Excellence",
    intro: "Build a strong foundation for your career in:",
    topics: [
      "Core workspace skills",
      "Banking fundamentals and the VRM role",
      "Retail banking and financial products",
      "Communication and customer engagement",
    ],
    image: utthanImg,
  },
  {
    key: "aarohan",
    label: "Aarohan",
    heading: "Product & Process Mastery",
    intro: "Deepen your understanding of:",
    topics: [
      "Financial products",
      "Banking, investment and insurance solutions",
      "Customer needs and relationship management",
      "Service excellence and compliance",
    ],
    image: aarohanImg,
  },
  {
    key: "shikhar",
    label: "Shikhar",
    heading: "Excel in Sales, Service & Growth",
    intro: "Learn how to excel on the job through:",
    topics: [
      "Mastery in workplace tools",
      "Virtual customer interaction simulations",
      "Relationship deepening and cross-selling",
      "Objection handling and service resolution",
    ],
    image: shikharImg,
  },
];

const EMPTY_TIMELINE = { top: 0, height: 1, dotTops: [0, 0, 0] };

export default function ClassroomTraining() {
  const modulesRef = useRef(null);
  const timelineColumnRef = useRef(null);
  const labelRefs = useRef([]);
  const frameRefs = useRef([]);
  const [progress, setProgress] = useState(0);
  const [timelineLayout, setTimelineLayout] = useState(EMPTY_TIMELINE);
  const [showBrochureModal, setShowBrochureModal] = useState(false);

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

    setTimelineLayout({
      top: trackTop,
      height: trackHeight,
      dotTops: centers.map((center) => center - trackTop),
    });
    ScrollTrigger.refresh();
  }, []);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    const modules = modulesRef.current;
    if (!modules) return;

    // The page scrolls on <body> (html/body are height 100%), while ScrollTrigger
    // follows document.scrollingElement. Report the body's scroll position.
    const scrollProxy = {
      scrollTop(value) {
        if (arguments.length) document.body.scrollTop = value;
        return document.body.scrollTop;
      },
      getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
      },
    };
    [document.documentElement, document.body, document.scrollingElement].forEach((el) => {
      if (el) ScrollTrigger.scrollerProxy(el, scrollProxy);
    });
    const onBodyScroll = () => ScrollTrigger.update();
    document.body.addEventListener("scroll", onBodyScroll, { passive: true });

    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    let imageTweens = [];

    const clearImageTweens = () => {
      imageTweens.forEach((tween) => {
        tween.scrollTrigger?.kill();
        tween.kill();
      });
      imageTweens = [];
      frameRefs.current.forEach((frame) => {
        const img = frame?.querySelector("img");
        if (img) gsap.set(img, { clearProps: "transform" });
      });
    };

    const setupImageTweens = () => {
      clearImageTweens();
      if (!desktopQuery.matches) return;

      frameRefs.current.forEach((frame) => {
        const img = frame?.querySelector("img");
        if (!frame || !img) return;

        imageTweens.push(
          gsap.fromTo(
            img,
            { scale: 1 },
            {
              scale: 1.5,
              transformOrigin: "center center",
              ease: "power2.out",
              scrollTrigger: {
                trigger: frame,
                start: "top 80%",
                end: "bottom 40%",
                scrub: true,
              },
            }
          )
        );
      });
    };

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: modules,
        start: "top+=100 center",
        end: "bottom bottom",
        onUpdate: (self) => setProgress(self.progress),
      });
      setupImageTweens();
    }, modules);

    desktopQuery.addEventListener("change", setupImageTweens);

    return () => {
      desktopQuery.removeEventListener("change", setupImageTweens);
      clearImageTweens();
      document.body.removeEventListener("scroll", onBodyScroll);
      ctx.revert();
    };
  }, []);

  useLayoutEffect(() => {
    measureTimeline();

    window.addEventListener("resize", measureTimeline);
    const modules = modulesRef.current;
    const observer =
      typeof ResizeObserver !== "undefined" && modules ? new ResizeObserver(measureTimeline) : null;
    observer?.observe(modules);

    const images = frameRefs.current.map((frame) => frame?.querySelector("img")).filter(Boolean);
    images.forEach((img) => {
      if (!img.complete) img.addEventListener("load", measureTimeline);
    });

    return () => {
      window.removeEventListener("resize", measureTimeline);
      observer?.disconnect();
      images.forEach((img) => img.removeEventListener("load", measureTimeline));
    };
  }, [measureTimeline]);

  const { top: trackTop, height: trackHeight, dotTops } = timelineLayout;

  return (
    <section id="classroom-training" className="scroll-mt-28 overflow-hidden bg-[#fafafa]">
      <div className="mx-auto max-w-[1280px] px-6 py-12 sm:px-10 lg:py-[60px] lg:pl-[102px] lg:pr-0">
        <div className="max-w-[896px]">
          <div className="inline-flex items-center justify-center rounded-full border border-[#97144d] px-[30px] py-1 text-[14px] font-medium capitalize leading-[27px] text-[#97144d]">
            Classroom Training
          </div>
          <h2 className="mt-4 text-[24px] font-medium leading-[31.2px] text-[#97144d]">
            Three progressive modules guiding you towards professional readiness.
          </h2>
        </div>

        <div className="mt-10 lg:mt-16 lg:flex">
          <div ref={timelineColumnRef} className="relative hidden w-10 shrink-0 lg:block">
            <div
              className="absolute left-1/2 w-0.5 -translate-x-1/2"
              style={{ top: trackTop, height: trackHeight }}
            >
              <div className="h-full w-full bg-[#D1D3D4]" />
              <div
                className="absolute inset-x-0 top-0 bg-[#97144d]"
                style={{ height: `${progress * 100}%` }}
              />
              {dotTops.map((dotTop, index) => {
                const isActive = progress >= dotTop / trackHeight;
                return (
                  <span
                    key={MODULES[index].key}
                    className="absolute left-1/2 size-4 -translate-x-1/2 rounded-full"
                    style={{
                      top: dotTop - 8,
                      backgroundColor: isActive ? "#97144d" : "#D1D3D4",
                    }}
                    aria-hidden="true"
                  />
                );
              })}
            </div>
          </div>

          <div ref={modulesRef} className="flex min-w-0 flex-1 flex-col gap-16 lg:gap-10">
            {MODULES.map((module, index) => (
              <article
                key={module.key}
                className="flex flex-col items-stretch gap-8 lg:h-[353px] lg:flex-row lg:items-center lg:gap-[60px]"
              >
                <div className="w-full lg:w-[452px] lg:shrink-0">
                  <span
                    ref={(el) => {
                      labelRefs.current[index] = el;
                    }}
                    className="inline-flex items-center justify-center rounded-full border border-[#97144d] bg-[#97144d] px-[30px] py-1 text-[14px] font-medium capitalize leading-[27px] text-white"
                  >
                    {module.label}
                  </span>
                  <h3 className="mt-4 text-[18px] font-medium capitalize leading-[27px] text-[#97144d]">
                    {module.heading}
                  </h3>
                  <p className="mt-1 text-[16px] text-[#231f20]">{module.intro}</p>
                  <ul className="mt-2 flex flex-col gap-2">
                    {module.topics.map((topic) => (
                      <li key={topic} className="flex items-center gap-2.5">
                        <img src={checkIcon} alt="" className="h-5 w-5 shrink-0" />
                        <span className="text-[16px] text-[rgba(34,31,32,0.8)]">{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div
                  ref={(el) => {
                    frameRefs.current[index] = el;
                  }}
                  className="relative -mx-6 h-auto w-[calc(100%+3rem)] overflow-hidden sm:-mx-10 sm:w-[calc(100%+5rem)] lg:ml-0 lg:mr-[min(0px,calc((1280px-100vw)/2))] lg:h-[353px] lg:w-auto lg:min-w-0 lg:flex-1 lg:rounded-l-[10px] lg:rounded-r-none"
                >
                  <img
                    src={module.image}
                    alt={module.heading}
                    className="h-auto w-full lg:h-full lg:object-cover"
                  />
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-4 flex justify-center lg:justify-start lg:pl-10">
          <button
            type="button"
            onClick={() => setShowBrochureModal(true)}
            className="inline-flex items-center gap-2.5 rounded-[10px] border border-[#97144d] bg-[#fafafa] px-6 py-4 text-[14px] font-bold text-[#97144d] shadow-[0px_4px_4px_rgba(0,0,0,0.15),0px_1px_1.5px_rgba(0,0,0,0.3)]"
          >
            Download Brochure
            <img src={downloadIcon} alt="" className="h-5 w-5" />
          </button>
        </div>
      </div>
      <DownloadBrochureModal isOpen={showBrochureModal} onClose={() => setShowBrochureModal(false)} />
    </section>
  );
}
