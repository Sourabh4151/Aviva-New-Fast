import React from "react";
import jobIcon from "../assets/figma/icon-job.svg";
import trainingIcon from "../assets/figma/icon-training.svg";
import financeIcon from "../assets/figma/icon-finance.svg";

const ITEMS = [
  {
    key: "job",
    icon: jobIcon,
    iconClass: "h-[60px] w-[60px]",
    title: "Job Assured Program",
    description:
      "Land an on-roll role as an Assistant Manager with one of India's premier private banking institutions (T&C Apply).",
  },
  {
    key: "training",
    icon: trainingIcon,
    iconClass: "h-5 w-[30px]",
    title: "5 Weeks of Skill Training",
    description:
      "Complete a rigorous 166-hour virtual curriculum focused on core banking products, priority portfolio management, and soft skills.",
  },
  {
    key: "finance",
    icon: financeIcon,
    iconClass: "h-10 w-10",
    title: "Financial Assistance",
    description:
      "Continue your training journey without worrying about finances through our education loan options.",
  },
];

export default function TrackGrowth() {
  return (
    <section id="why-this-program" className="scroll-mt-28 bg-[#fafafa]">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-6 py-12 sm:px-10 lg:px-[120px] lg:py-12">
        <div className="mx-auto flex max-w-[805px] flex-col items-center gap-4 text-center">
          <div className="inline-flex items-center justify-center rounded-full border border-[#97144d] px-[30px] py-1 text-[14px] font-semibold capitalize leading-5 text-[#97144d]">
            Why this program?
          </div>
          <h2 className="text-[22px] font-semibold leading-normal text-[#97144d] sm:text-[24px]">
            Become employed by bridging the gap between your degree &amp; banking skills
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 lg:gap-10">
          {ITEMS.map((item) => (
            <article
              key={item.key}
              className="flex min-h-[222px] flex-col gap-2 rounded-[12px] border border-[#97144d] bg-[#ffe7f1] px-4 py-6 shadow-[0px_4px_4px_rgba(0,0,0,0.15),0px_1px_1.5px_rgba(0,0,0,0.3)]"
            >
              {item.key === "job" ? (
                <img src={item.icon} alt="" className={item.iconClass} />
              ) : (
                <span className="flex h-[60px] w-[60px] items-center justify-center rounded-full border border-[#97144d] bg-[#fafafa]">
                  <img src={item.icon} alt="" className={item.iconClass} />
                </span>
              )}
              <h3 className="text-[18px] font-semibold text-[#97144d]">{item.title}</h3>
              <p className="text-[16px] leading-normal text-[rgba(34,31,31,0.8)]">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
