import React from "react";
import alignmentIcon from "../assets/alignment.svg";
import progressIcon from "../assets/progress.svg";
import reviewIcon from "../assets/review.svg";

const ITEMS = [
  {
    key: "alignment",
    icon: alignmentIcon,
    title: "Role Alignment Reviews",
    description:
      "Understand how your skills match real workplace expectations through guided check-ins at key stages of the program.",
  },
  {
    key: "progress",
    icon: progressIcon,
    title: "Module Progress Checks",
    description:
      "Short, structured reviews after each module to help you strengthen your understanding and stay on track.",
  },
  {
    key: "review",
    icon: reviewIcon,
    title: "Final Readiness Review",
    description:
      "A comprehensive evaluation that brings everything together to confirm you're prepared to step confidently into the role.",
  },
];

export default function TrackGrowth() {
  return (
    <section
      id="track-growth"
      className="relative bg-black text-white scroll-mt-24 overflow-hidden"
    >
      <div className="relative z-10 mx-auto px-section py-section lg:px-[120px] lg:py-20">
        {/* Heading block */}
        <div className="max-w-4xl flex flex-col items-start text-left sm:items-center sm:text-center mx-auto">
          <div
            className="inline-flex items-center justify-center font-medium rounded-full border border-white/30 py-1 px-[30px] text-[14px] leading-[27px] text-white/70"
            style={{
              fontFamily:
                "Montserrat, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            }}
          >
            Track Your Growth
          </div>

          <p
            className="mt-4 sm:mt-6 text-[24px] leading-[36px] font-medium text-white px-2"
            style={{
              fontFamily:
                "Montserrat, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            }}
          >
            Continuous feedback to help you grow into the role with confidence.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-8 sm:mt-12 flex flex-col lg:flex-row gap-4 lg:gap-6 justify-center items-stretch mx-auto max-w-[1040px]">
          {ITEMS.map((item) => (
            <div key={item.key} className="group flex-1 min-w-0">
              <div
                className="h-full rounded-[10px] bg-[#0d0d0d] transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-[0px_16px_40px_rgba(0,0,0,0.55)] pt-6 pb-6 px-4"
              >
                <div className="flex flex-col gap-[10px]">
                  <div className="inline-flex items-center justify-center rounded-[10px] w-16 h-16 bg-[#202020]">
                    <img
                      src={item.icon}
                      alt={item.title}
                      className="w-16 h-16 object-contain"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <h3
                      className="font-semibold text-[18px] leading-[27px] text-white text-justify"
                      style={{
                        fontFamily:
                          "Montserrat, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                      }}
                    >
                      {item.title}
                    </h3>
                    <p
                      className="text-[14px] leading-[21px] text-white/80 text-justify"
                      style={{
                        fontFamily:
                          "Montserrat, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                      }}
                    >
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

