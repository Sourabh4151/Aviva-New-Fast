import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import humanSvg from "../assets/human.svg";
import tickSvg from "../assets/hero-tick.svg";

// Index 0 is the starting role (bottom). The path climbs toward the last role.
const STAGES = [
  { role: "Certified Health Insurance Manager", x: 36, y: 192 },
  { role: "Senior Agency Sales Manager", x: 76, y: 118 },
  { role: "Business Development Manager", x: 115, y: 44 },
];

const RESPONSIBILITIES = [
  "To recruit, train & develop good quality prospective insurance advisors",
  "Conducts regular meetings and empanelment and activation of advisors",
  "Updates sales portal with requisite information to facilitate information",
  "Obtains and analyzes information from market to identify new clients and advisors",
  "Do the Field Sales/Joint calls to increase the advisor strength & Business",
  "Drives ongoing sales from the advisors and contribute towards regions achievements",
];

const LINE = "rgba(65, 64, 66, 0.5)";
const LINE_ACTIVE = "#c7222a";
const ANIM_INITIAL_DELAY_MS = 500;
const ANIM_STEP_DELAY_MS = 1000;
const ANIM_DURATION_MS = 600;
const VIEWPORT_THRESHOLD_DESKTOP = 0.75;
const VIEWPORT_THRESHOLD_MOBILE = 0.25;

function pillClass(isActive, size) {
  const shape =
    size === "desktop"
      ? "absolute z-10 inline-flex items-center whitespace-nowrap rounded-[100px] border px-8 py-3"
      : "inline-flex items-center rounded-[100px] border px-5 py-2.5";
  const state = isActive
    ? "border-[#c7222a] bg-[#c7222a] text-[#fafafa]"
    : "border-[#c7222a] bg-[#fff4d9] text-[#c7222a]";
  return `${shape} ${state} font-['Anek_Latin',sans-serif] text-[16px] font-semibold leading-5 transition-colors duration-[600ms] ease-in`;
}

function lengthUntil(points, index) {
  const end = Math.max(0, Math.min(index, points.length - 1));
  let length = 0;
  for (let i = 1; i <= end; i += 1) {
    length += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  }
  return length;
}

function LadderTrack({ points, activeIndex, width, height }) {
  if (!points.length || !width || !height) return null;

  const allPoints = points.map((point) => `${point.x},${point.y}`).join(" ");
  const personAt = points[Math.max(activeIndex, 0)];
  const totalLength = lengthUntil(points, points.length - 1);
  const drawnLength = activeIndex > 0 ? lengthUntil(points, activeIndex) : 0;

  return (
    <>
      <svg
        className="pointer-events-none absolute left-0 top-0 z-[1]"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        aria-hidden="true"
      >
        <polyline
          points={allPoints}
          fill="none"
          stroke={LINE}
          strokeWidth="1"
          strokeDasharray="6 6"
        />
        {totalLength > 0 && (
          <polyline
            points={allPoints}
            fill="none"
            stroke={LINE_ACTIVE}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: totalLength,
              strokeDashoffset: totalLength - drawnLength,
              transition: `stroke-dashoffset ${ANIM_DURATION_MS}ms ease-in`,
            }}
          />
        )}
      </svg>
      {personAt && (
        <img
          src={humanSvg}
          alt=""
          width={25}
          height={43}
          className="pointer-events-none absolute z-20"
          style={{
            left: personAt.x - 28,
            top: personAt.y - 38,
            transition: `left ${ANIM_DURATION_MS}ms ease-in, top ${ANIM_DURATION_MS}ms ease-in`,
          }}
        />
      )}
    </>
  );
}

function useDotPoints(containerRef, dotRefs, stageCount) {
  const [box, setBox] = useState({ width: 0, height: 0, points: [] });

  const measure = useCallback(() => {
    const root = containerRef.current;
    if (!root || root.getClientRects().length === 0) return;
    const rootRect = root.getBoundingClientRect();
    const points = [];
    for (let index = 0; index < stageCount; index += 1) {
      const dot = dotRefs.current[index];
      if (!dot) return;
      const rect = dot.getBoundingClientRect();
      points.push({
        x: rect.left + rect.width / 2 - rootRect.left,
        y: rect.top + rect.height / 2 - rootRect.top,
      });
    }
    const width = Math.round(root.offsetWidth);
    const height = Math.round(root.offsetHeight);
    setBox((prev) => {
      const sameSize = prev.width === width && prev.height === height;
      const samePoints =
        prev.points.length === points.length &&
        prev.points.every(
          (point, index) =>
            Math.abs(point.x - points[index].x) < 0.5 &&
            Math.abs(point.y - points[index].y) < 0.5
        );
      return sameSize && samePoints ? prev : { width, height, points };
    });
  }, [containerRef, dotRefs, stageCount]);

  useLayoutEffect(() => {
    measure();
    const root = containerRef.current;
    const observer = new ResizeObserver(measure);
    if (root) observer.observe(root);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure, containerRef]);

  return box;
}

export default function CareerGrowth() {
  const mobileRef = useRef(null);
  const desktopRef = useRef(null);
  const mobileDots = useRef([]);
  const desktopDots = useRef([]);
  const animationTimeouts = useRef([]);
  const animationStarted = useRef(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const mobileBox = useDotPoints(mobileRef, mobileDots, STAGES.length);
  const desktopBox = useDotPoints(desktopRef, desktopDots, STAGES.length);

  const clearAnimation = useCallback(() => {
    animationTimeouts.current.forEach((id) => clearTimeout(id));
    animationTimeouts.current = [];
  }, []);

  const startAnimation = useCallback(() => {
    clearAnimation();
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setActiveIndex(STAGES.length - 1);
      return;
    }

    setActiveIndex(-1);
    STAGES.forEach((_, step) => {
      const timeoutId = setTimeout(() => {
        setActiveIndex(step);
      }, ANIM_INITIAL_DELAY_MS + step * ANIM_STEP_DELAY_MS);
      animationTimeouts.current.push(timeoutId);
    });
  }, [clearAnimation]);

  useEffect(() => {
    const targets = [mobileRef.current, desktopRef.current].filter(Boolean);
    if (!targets.length) return;

    const thresholdFor = () =>
      window.matchMedia("(min-width: 1024px)").matches
        ? VIEWPORT_THRESHOLD_DESKTOP
        : VIEWPORT_THRESHOLD_MOBILE;

    const observer = new IntersectionObserver(
      (entries) => {
        const threshold = thresholdFor();
        const visible = entries.some(
          (entry) => entry.isIntersecting && entry.intersectionRatio >= threshold
        );
        if (visible && !animationStarted.current) {
          animationStarted.current = true;
          startAnimation();
        }
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    targets.forEach((target) => observer.observe(target));
    return () => {
      observer.disconnect();
      clearAnimation();
      animationStarted.current = false;
    };
  }, [startAnimation, clearAnimation]);

  return (
    <section id="career-growth" className="scroll-mt-24 bg-[#fff4d9] text-[#231f20]">
      <div className="mx-auto flex w-full min-w-0 max-w-[1280px] flex-col gap-8 px-4 py-10 sm:px-8 sm:py-[60px] lg:gap-4 lg:px-10 xl:px-[100px]">
        <div className="inline-flex h-9 w-fit items-center rounded-[100px] border border-[#c7222a] bg-[#c7222a] px-[30px] py-2 font-['Anek_Latin',sans-serif] text-[20px] font-semibold leading-5 text-white lg:bg-transparent lg:text-[#c7222a]">
          Career Growth
        </div>

        <ul
          ref={mobileRef}
          className="relative mt-1 flex h-[266px] w-full flex-col justify-between pl-8 pt-7 lg:hidden"
        >
          <LadderTrack
            points={mobileBox.points}
            activeIndex={activeIndex}
            width={mobileBox.width}
            height={mobileBox.height}
          />
          {[...STAGES].reverse().map((stage) => {
            const index = STAGES.findIndex((item) => item.role === stage.role);
            const isActive = activeIndex >= index;
            return (
              <li key={stage.role} className="relative z-10 flex items-center gap-3">
                <span
                  ref={(el) => {
                    mobileDots.current[index] = el;
                  }}
                  className="h-4 w-4 shrink-0 rounded-full bg-[#c7222a]"
                  aria-hidden="true"
                />
                <span className={pillClass(isActive, "mobile")}>{stage.role}</span>
              </li>
            );
          })}
        </ul>

        <div className="flex w-full min-w-0 flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
          <div ref={desktopRef} className="relative hidden h-[250px] w-[464px] max-w-full shrink-0 lg:mt-2 lg:block">
            <LadderTrack
              points={desktopBox.points}
              activeIndex={activeIndex}
              width={desktopBox.width}
              height={desktopBox.height}
            />
            {STAGES.map((stage, index) => {
              const isActive = activeIndex >= index;
              return (
                <div key={stage.role}>
                  <span
                    ref={(el) => {
                      desktopDots.current[index] = el;
                    }}
                    className="absolute z-10 h-4 w-4 rounded-full bg-[#c7222a]"
                    style={{ left: stage.x - 8, top: stage.y - 8 }}
                  />
                  <span
                    className={pillClass(isActive, "desktop")}
                    style={{ left: stage.x + 16, top: stage.y - 22 }}
                  >
                    {stage.role}
                  </span>
                </div>
              );
            })}
          </div>

          <article className="flex w-full min-w-0 flex-1 flex-col gap-4 rounded-[12px] border border-[#c7222a] p-4 xl:max-w-[631px]">
            <h3 className="font-['Anek_Latin',sans-serif] text-[18px] font-semibold leading-6 text-[#c7222a]">
              Job Responsibilities
            </h3>
            <ul className="flex flex-col gap-2">
              {RESPONSIBILITIES.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <img src={tickSvg} alt="" width={20} height={20} className="mt-0.5 shrink-0" />
                  <span className="font-['Anek_Latin',sans-serif] text-[14px] font-normal leading-5 text-[rgba(65,64,66,0.9)]">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
