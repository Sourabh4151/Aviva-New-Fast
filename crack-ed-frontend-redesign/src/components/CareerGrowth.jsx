import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import careerIcon from "../assets/career.svg";
import ctcIcon from "../assets/ctc.svg";
import growthIcon from "../assets/growth.svg";

const CAREER_STAGES = [
  {
    title: "Business Executive",
    description:
      "Connect with customers, support vehicle loan sales, and build strong relationships through on-ground field engagement.",
  },
  {
    title: "Senior Executive",
    description:
      "Manage customer interactions, drive loan business growth, and strengthen dealer and client relationships in the field.",
  },
  {
    title: "Relationship Manager",
    description:
      "Handle customer portfolios, provide tailored financing solutions, and ensure long-term client engagement and satisfaction.",
  },
  {
    title: "Area Manager",
    description:
      "Lead regional sales operations, guide field teams, and drive business growth and portfolio performance across multiple locations.",
  },
];

const LINE_ANGLE_DEG = 59.1;
const ACTIVE_ACCENT = "rgba(227, 24, 55, 1)";
const ANIM_INITIAL_DELAY_MS = 500;
const ANIM_STEP_DELAY_MS = 1000;
const ANIM_DURATION_MS = 600;
const INACTIVE_LINE = "rgba(250, 250, 250, 0.35)";
const INACTIVE_DOT = "rgba(143, 143, 143, 1)";
const INACTIVE_PILL_BG_DESKTOP = "rgba(143, 143, 143, 1)";
const INACTIVE_PILL_BG_MOBILE = "rgba(143, 143, 143, 1)";
const TEXT_GAP_PX = 14;
const TITLE_DESC_GAP_PX = 14;
const TOP_STAGE_MIN_PX = 8;
const MOBILE_STAGE_GAP_PX = 40;

const VIEWPORT_THRESHOLD_DESKTOP = 0.75;
const VIEWPORT_THRESHOLD_MOBILE = 0.25;
const ROADMAP_EDGE_PAD = 12;
const MIN_ROW_WIDTH = 140;
const ROADMAP_TARGET_FILL = 0.9;
const ROADMAP_MIN_FILL_BEFORE_SCALE = 0.62;
const MAX_ROADMAP_SCALE_UP = 2.75;

const DEFAULT_LAYOUT = CAREER_STAGES.map((_, index) => ({
  top: index * 140,
  marginLeft: index * 28,
  maxWidth: undefined,
}));

function CareerStageRow({
  stage,
  stageIndex,
  isActive,
  isDesktop,
  layout,
  rowRefs,
  dotRefs,
}) {
  return (
    <div
      ref={(el) => {
        rowRefs.current[stageIndex] = el;
      }}
      className={`career-roadmap-stage z-10 grid w-full max-w-full ${
        isDesktop ? "absolute left-0" : "relative"
      }`}
      style={
        isDesktop
          ? {
              top: layout?.top ?? 0,
              marginLeft: layout?.marginLeft ?? 0,
              columnGap: TEXT_GAP_PX,
              rowGap: TITLE_DESC_GAP_PX,
              maxWidth: layout?.maxWidth,
              gridTemplateColumns: "auto minmax(0, 1fr)",
            }
          : {
              gridTemplateColumns: "auto 1fr",
              columnGap: TEXT_GAP_PX,
              rowGap: TITLE_DESC_GAP_PX,
            }
      }
    >
      <span
        ref={(el) => {
          dotRefs.current[stageIndex] = el;
        }}
        className="career-roadmap-node career-roadmap-node-spec relative z-20 col-start-1 row-start-1 shrink-0 self-center rounded-full"
        style={{
          backgroundColor: isActive ? ACTIVE_ACCENT : INACTIVE_DOT,
          transition: `background-color ${ANIM_DURATION_MS}ms ease-in`,
        }}
        aria-hidden="true"
      />
      <span
        className={`career-roadmap-title col-start-2 row-start-1 min-w-0 w-max max-w-full self-center ${
          isDesktop
            ? "career-roadmap-title-desktop"
            : "career-roadmap-title-mobile"
        }`}
        style={{
          backgroundColor: isActive
            ? ACTIVE_ACCENT
            : isDesktop
              ? INACTIVE_PILL_BG_DESKTOP
              : INACTIVE_PILL_BG_MOBILE,
          ...(isActive ? { color: "rgba(255, 255, 255, 1)" } : {}),
          transition: `background-color ${ANIM_DURATION_MS}ms ease-in, color ${ANIM_DURATION_MS}ms ease-in`,
        }}
      >
        {stage.title}
      </span>
      <p
        className={`career-roadmap-desc col-start-2 row-start-2 min-w-0 w-full max-w-full ${
          isDesktop
            ? "career-roadmap-desc-desktop"
            : "career-roadmap-desc-mobile"
        }`}
      >
        {stage.description}
      </p>
    </div>
  );
}

export default function CareerGrowth() {
  const sectionRef = useRef(null);
  const roadmapRef = useRef(null);
  const careerGrowthTagRef = useRef(null);
  const lastFeatureRef = useRef(null);
  const rowRefs = useRef([]);
  const dotRefs = useRef([]);
  const animationTimeoutIdsRef = useRef([]);
  const animationStartedRef = useRef(false);

  const [stageLayout, setStageLayout] = useState(DEFAULT_LAYOUT);
  const [roadmapMinHeight, setRoadmapMinHeight] = useState(420);
  const [connectorLine, setConnectorLine] = useState(null);
  const [isDesktopLayout, setIsDesktopLayout] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 1024px)").matches
  );
  const [activeProgressIndex, setActiveProgressIndex] = useState(-1);

  const clearAnimationTimeouts = useCallback(() => {
    animationTimeoutIdsRef.current.forEach((id) => clearTimeout(id));
    animationTimeoutIdsRef.current = [];
  }, []);

  const startAnimation = useCallback(() => {
    clearAnimationTimeouts();
    setActiveProgressIndex(-1);

    for (let step = 0; step < CAREER_STAGES.length; step += 1) {
      const delay = ANIM_INITIAL_DELAY_MS + step * ANIM_STEP_DELAY_MS;
      const timeoutId = setTimeout(() => {
        setActiveProgressIndex(step);
      }, delay);
      animationTimeoutIdsRef.current.push(timeoutId);
    }
  }, [clearAnimationTimeouts]);

  useEffect(() => {
    const roadmap = roadmapRef.current;
    if (!roadmap) return;

    const getVisibilityThreshold = () =>
      window.matchMedia("(min-width: 1024px)").matches
        ? VIEWPORT_THRESHOLD_DESKTOP
        : VIEWPORT_THRESHOLD_MOBILE;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const threshold = getVisibilityThreshold();
        const isVisible =
          entry.isIntersecting && entry.intersectionRatio >= threshold;

        if (isVisible && !animationStartedRef.current) {
          animationStartedRef.current = true;
          startAnimation();
        }
      },
      { threshold: [0, 0.25, 0.5, 0.75] }
    );

    observer.observe(roadmap);

    return () => {
      observer.disconnect();
      clearAnimationTimeouts();
    };
  }, [startAnimation, clearAnimationTimeouts]);

  const updateLayout = useCallback(() => {
    const roadmap = roadmapRef.current;
    if (!roadmap) return;

    const roadmapRect = roadmap.getBoundingClientRect();
    const width = roadmapRect.width;
    if (!width) return;

    const rows = CAREER_STAGES.map((_, index) => ({
      row: rowRefs.current[index],
      dot: dotRefs.current[index],
    }));

    if (rows.some(({ row, dot }) => !row || !dot)) return;

    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    setIsDesktopLayout(isDesktop);

    const toLocalCenter = (el) => {
      const rect = el.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2 - roadmapRect.left,
        y: rect.top + rect.height / 2 - roadmapRect.top,
      };
    };

    const dotCenters = CAREER_STAGES.map((_, index) =>
      toLocalCenter(dotRefs.current[index])
    );

    const lineHeight = Math.max(roadmapRect.height, roadmap.scrollHeight);

    if (isDesktop) {
      const getDotOffsetFromTop = (row, dot) => {
        const rowRect = row.getBoundingClientRect();
        const dotRect = dot.getBoundingClientRect();
        return dotRect.top + dotRect.height / 2 - rowRect.top;
      };

      const heights = rows.map(({ row }) => row.offsetHeight);
      const dotOffsets = rows.map(({ row, dot }) =>
        getDotOffsetFromTop(row, dot)
      );
      const careerGrowthTag = careerGrowthTagRef.current;
      const lastFeature = lastFeatureRef.current;
      const topStageIndex = CAREER_STAGES.length - 1;
      const bottomStageIndex = 0;

      let topDotCenterY =
        dotCenters[topStageIndex]?.y ?? TOP_STAGE_MIN_PX + dotOffsets[topStageIndex];
      let bottomDotCenterY =
        roadmapRect.height - heights[bottomStageIndex] / 2 - 16;

      if (careerGrowthTag) {
        const tagRect = careerGrowthTag.getBoundingClientRect();
        topDotCenterY =
          tagRect.top + tagRect.height / 2 - roadmapRect.top;
      }

      if (lastFeature) {
        const featureRect = lastFeature.getBoundingClientRect();
        bottomDotCenterY =
          featureRect.top + featureRect.height / 2 - roadmapRect.top;
      }

      const tops = CAREER_STAGES.map((_, index) => {
        const t = index / (CAREER_STAGES.length - 1);
        const dotCenterY =
          bottomDotCenterY + t * (topDotCenterY - bottomDotCenterY);
        return dotCenterY - dotOffsets[index];
      });

      if (Math.min(...tops) < TOP_STAGE_MIN_PX) {
        const shift = TOP_STAGE_MIN_PX - Math.min(...tops);
        for (let index = 0; index < tops.length; index += 1) {
          tops[index] += shift;
        }
      }

      const bottomDot = dotRefs.current[0];
      const bottomX = toLocalCenter(bottomDot).x;
      const tanAngle = Math.tan((LINE_ANGLE_DEG * Math.PI) / 180);
      const bottomCenterY = tops[0] + dotOffsets[0];

      const newLayout = CAREER_STAGES.map((_, index) => {
        const dot = dotRefs.current[index];
        const dotCenterY = tops[index] + dotOffsets[index];
        const dotHalf = dot.offsetWidth / 2;
        const marginLeft =
          index === 0
            ? 0
            : Math.max(
                0,
                Math.round(
                  bottomX + (bottomCenterY - dotCenterY) / tanAngle - dotHalf
                )
              );

        return {
          top: Math.round(tops[index]),
          marginLeft,
        };
      });

      const applyLayoutToDom = (layout) => {
        layout.forEach((item, index) => {
          const row = rowRefs.current[index];
          if (!row) return;
          row.style.top = `${item.top}px`;
          row.style.marginLeft = `${item.marginLeft}px`;
          if (item.maxWidth != null) {
            row.style.maxWidth = `${item.maxWidth}px`;
          }
        });
      };

      const withMaxWidths = (layout, containerWidth) =>
        layout.map((item) => ({
          ...item,
          maxWidth: Math.max(
            MIN_ROW_WIDTH,
            containerWidth - item.marginLeft - ROADMAP_EDGE_PAD
          ),
        }));

      const getMaxRightEdge = (layout) =>
        Math.max(
          ...CAREER_STAGES.map((_, index) => {
            const row = rowRefs.current[index];
            const item = layout[index];
            if (!row || !item) return 0;
            return item.marginLeft + row.offsetWidth;
          }),
          0
        );

      const getMaxContentWidth = () =>
        Math.max(
          ...CAREER_STAGES.map(
            (_, index) => rowRefs.current[index]?.offsetWidth ?? MIN_ROW_WIDTH
          ),
          MIN_ROW_WIDTH
        );

      const scaleMarginLeft = (layout, scale) =>
        withMaxWidths(
          layout.map((item, index) => ({
            top: item.top,
            marginLeft: index === 0 ? 0 : Math.round(item.marginLeft * scale),
          })),
          width
        );

      const rightLimit = width - ROADMAP_EDGE_PAD;
      let fittedLayout = withMaxWidths(newLayout, width);
      applyLayoutToDom(fittedLayout);

      const maxMarginLeft = Math.max(...newLayout.map((l) => l.marginLeft));
      if (maxMarginLeft > 0) {
        let maxRight = getMaxRightEdge(fittedLayout);

        if (maxRight > rightLimit) {
          const availableForMargin = Math.max(
            0,
            rightLimit - getMaxContentWidth()
          );
          const scaleDown = Math.max(0.25, availableForMargin / maxMarginLeft);
          fittedLayout = scaleMarginLeft(newLayout, scaleDown);
          applyLayoutToDom(fittedLayout);
          maxRight = getMaxRightEdge(fittedLayout);
        }

        const fillRatio = maxRight / rightLimit;
        if (fillRatio < ROADMAP_MIN_FILL_BEFORE_SCALE) {
          const targetMaxMarginLeft = Math.max(
            0,
            rightLimit * ROADMAP_TARGET_FILL - getMaxContentWidth()
          );
          const scaleUp = Math.min(
            MAX_ROADMAP_SCALE_UP,
            targetMaxMarginLeft / maxMarginLeft
          );

          if (scaleUp > 1.05) {
            fittedLayout = scaleMarginLeft(newLayout, scaleUp);
            applyLayoutToDom(fittedLayout);
            maxRight = getMaxRightEdge(fittedLayout);

            if (maxRight > rightLimit) {
              const currentMaxML = Math.max(
                ...fittedLayout.map((l) => l.marginLeft)
              );
              const availableForMargin = Math.max(
                0,
                rightLimit - getMaxContentWidth()
              );
              const scaleDown = Math.max(
                0.25,
                availableForMargin / currentMaxML
              );
              fittedLayout = scaleMarginLeft(newLayout, scaleDown);
              applyLayoutToDom(fittedLayout);
            }
          }
        }
      }

      const contentHeight =
        Math.max(
          ...fittedLayout.map((item, index) => item.top + heights[index])
        ) + 16;

      const finalDotCenters = CAREER_STAGES.map((_, index) =>
        toLocalCenter(dotRefs.current[index])
      );

      setStageLayout((prev) => {
        const changed = prev.some(
          (item, index) =>
            Math.abs(item.top - fittedLayout[index].top) > 1 ||
            Math.abs(item.marginLeft - fittedLayout[index].marginLeft) > 1 ||
            Math.abs((item.maxWidth ?? 0) - fittedLayout[index].maxWidth) > 1
        );
        return changed ? fittedLayout : prev;
      });

      setRoadmapMinHeight((prev) =>
        Math.abs(prev - contentHeight) > 1 ? Math.ceil(contentHeight) : prev
      );

      setConnectorLine({
        width,
        height: Math.max(lineHeight, contentHeight),
        dotCenters: finalDotCenters,
      });
    } else {
      const contentHeight = roadmap.scrollHeight || roadmapRect.height;
      setRoadmapMinHeight((prev) =>
        Math.abs(prev - contentHeight) > 1 ? contentHeight : prev
      );
      setConnectorLine({
        width,
        height: contentHeight,
        dotCenters,
      });
    }
  }, []);

  useLayoutEffect(() => {
    updateLayout();

    const roadmap = roadmapRef.current;
    if (!roadmap) return;

    const observer = new ResizeObserver(updateLayout);
    observer.observe(roadmap);
    if (careerGrowthTagRef.current) {
      observer.observe(careerGrowthTagRef.current);
    }
    if (lastFeatureRef.current) {
      observer.observe(lastFeatureRef.current);
    }
    window.addEventListener("resize", updateLayout);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateLayout);
    };
  }, [updateLayout]);

  useLayoutEffect(() => {
    updateLayout();
  }, [isDesktopLayout, updateLayout]);

  const renderConnectorLines = () => {
    if (!connectorLine?.dotCenters?.length) return null;

    const allPoints = connectorLine.dotCenters
      .map((point) => `${point.x},${point.y}`)
      .join(" ");

    const activePointCount = activeProgressIndex + 1;
    const activeCenters =
      activeProgressIndex >= 0
        ? connectorLine.dotCenters.slice(0, activePointCount)
        : [];

    const activePoints =
      activeCenters.length > 0
        ? activeCenters.map((point) => `${point.x},${point.y}`).join(" ")
        : null;

    return (
      <svg
        className="pointer-events-none absolute inset-0 z-[1] h-full w-full"
        viewBox={`0 0 ${connectorLine.width} ${connectorLine.height}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <polyline
          points={allPoints}
          fill="none"
          stroke={INACTIVE_LINE}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="6 6"
        />
        {activePoints && (
          <polyline
            points={activePoints}
            fill="none"
            stroke={ACTIVE_ACCENT}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transition: `stroke ${ANIM_DURATION_MS}ms ease-in`,
            }}
          />
        )}
      </svg>
    );
  };

  return (
    <section
      ref={sectionRef}
      id="career-growth"
      className="relative bg-[rgba(227,24,55,0.06)] backdrop-blur-[100px] text-white scroll-mt-24 overflow-hidden"
    >
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
      <div className="relative z-10 px-4 sm:px-6 md:px-8 py-section lg:pl-[120px] lg:pr-0 lg:pt-[110px] lg:pb-[110px]">
        <div className="career-growth-card w-full flex flex-col lg:flex-row gap-8 lg:gap-12 rounded-[16px] bg-[rgba(10,49,82,0.2)]/0">
          {/* Left content */}
          <div className="w-full lg:w-[430px] flex-shrink-0">
            <div
              ref={careerGrowthTagRef}
              className="career-growth-tag inline-flex items-center justify-center text-xs sm:text-sm font-medium tracking-normal rounded-full border border-white/30 py-1 px-4 sm:px-[30px] text-white/70"
            >
              Career Growth
            </div>

            <div className="mt-3 sm:mt-4">
              <p className="career-growth-subtitle text-lg sm:text-xl lg:text-2xl font-medium text-white text-justify leading-tight">
                From your first branch role to bigger opportunities.
              </p>
              <p className="career-growth-body mt-3 sm:mt-4 font-normal text-[16px] leading-[24px] text-[rgba(250,250,250,0.8)] text-justify">
                Designed as a strong entry point with clear scope to grow into senior roles.
              </p>
            </div>

            <div className="mt-3 sm:mt-4 space-y-0">
              {[
                {
                  text: "Start your career in the financial services industry",
                  icon: careerIcon,
                  textClassName:
                    "font-medium text-[18px] leading-[1] text-[rgba(250,250,250,1)]",
                },
                {
                  text: "Earn a CTC of Rs 3.5 LPA + incentives",
                  icon: ctcIcon,
                  textClassName:
                    "font-medium text-[18px] leading-[27px] text-[rgba(250,250,250,1)]",
                },
                {
                  text: "Grow into senior roles in sales and financial services",
                  icon: growthIcon,
                  textClassName:
                    "font-medium text-[18px] leading-[1] text-[rgba(250,250,250,1)]",
                  alignBottomDot: true,
                },
              ].map(({ text, icon, textClassName, alignBottomDot }) => (
                <div
                  key={text}
                  ref={alignBottomDot ? lastFeatureRef : null}
                  className="flex items-center gap-3 sm:gap-4 py-2.5 sm:py-3 pr-3 sm:pr-4"
                >
                  <img
                    src={icon}
                    alt=""
                    className="w-10 h-10 sm:w-14 sm:h-14 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <p className={`career-growth-list-text ${textClassName}`}>
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Career roadmap */}
          <div
            ref={roadmapRef}
            className="career-roadmap relative min-w-0 w-full flex-1 overflow-hidden lg:min-h-full"
            style={isDesktopLayout ? { minHeight: roadmapMinHeight } : undefined}
          >
            {renderConnectorLines()}

            {isDesktopLayout ? (
              <div
                className="relative w-full"
                style={{ minHeight: roadmapMinHeight }}
              >
                {CAREER_STAGES.map((stage, stageIndex) => {
                  const isActive =
                    activeProgressIndex >= 0 &&
                    stageIndex <= activeProgressIndex;

                  return (
                    <CareerStageRow
                      key={`desktop-${stage.title}`}
                      stage={stage}
                      stageIndex={stageIndex}
                      isActive={isActive}
                      isDesktop
                      layout={stageLayout[stageIndex]}
                      rowRefs={rowRefs}
                      dotRefs={dotRefs}
                    />
                  );
                })}
              </div>
            ) : (
              <div
                className="flex flex-col pl-1"
                style={{ gap: MOBILE_STAGE_GAP_PX }}
              >
                {CAREER_STAGES.map((stage, stageIndex) => {
                  const isActive =
                    activeProgressIndex >= 0 &&
                    stageIndex <= activeProgressIndex;

                  return (
                    <CareerStageRow
                      key={`mobile-${stage.title}`}
                      stage={stage}
                      stageIndex={stageIndex}
                      isActive={isActive}
                      isDesktop={false}
                      layout={null}
                      rowRefs={rowRefs}
                      dotRefs={dotRefs}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
