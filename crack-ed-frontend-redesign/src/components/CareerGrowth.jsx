import React from "react";
import ladder from "../assets/figma/career-ladder.svg";
import walkIcon from "../assets/figma/walk.svg";
import njtIcon from "../assets/figma/icon-njt.svg";
import roleIcon from "../assets/figma/icon-role.svg";
import ctcIcon from "../assets/figma/icon-ctc.svg";

const STAGES = [
  { title: "Assistant Manager", left: 35, top: 410 },
  { title: "Deputy Manager", left: 97, top: 316 },
  { title: "Manager", left: 155, top: 208 },
  { title: "Senior Manager", left: 211, top: 112 },
];

const YEAR_LABELS = [
  { left: 40, top: 349 },
  { left: 105, top: 242 },
  { left: 162, top: 138 },
];

const ROLE_LINES = [
  { left: 19.5, top: 424 },
  { left: 77.1, top: 331 },
  { left: 136.6, top: 222 },
  { left: 192.8, top: 126 },
];

const POINTS = [
  { icon: njtIcon, iconClass: "h-[16px] w-[30px]", text: "Build job-ready skills through NJT & OJT" },
  { icon: roleIcon, iconClass: "h-8 w-8", text: "Start your career as an Assistant Manager in Axis Bank" },
  { icon: ctcIcon, iconClass: "h-[33px] w-[30px]", text: "Earn a CTC of up to ₹3.5* LPA" },
];

export default function CareerGrowth() {
  return (
    <section id="career-growth" className="scroll-mt-28 bg-[#fafafa]">
      <div className="mx-auto flex max-w-[1280px] items-center justify-center px-6 py-12 lg:h-[673px] lg:px-[120px] lg:py-12">
        <div className="flex w-full max-w-[955px] flex-col items-center gap-10 rounded-[40px] bg-[#97144d] px-6 py-10 lg:h-[495px] lg:flex-row lg:gap-10 lg:px-[60px] lg:py-0">
          <div className="flex w-full max-w-[419px] flex-col gap-10">
            <div className="flex flex-col gap-4">
              <div className="inline-flex w-fit items-center justify-center rounded-full border border-[#fafafa] px-[30px] py-1 text-[14px] font-medium capitalize leading-[27px] text-[#fafafa]">
                Career Growth
              </div>
              <h2 className="text-[24px] font-medium leading-[31.2px] text-[#fafafa]">
                From a Virtual Desk to your lasting career in Banking.
              </h2>
            </div>
            <ul className="flex flex-col gap-4">
              {POINTS.map((point) => (
                <li key={point.text} className="flex items-center gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#fafafa]">
                    <img src={point.icon} alt="" className={point.iconClass} />
                  </span>
                  <p className="text-[18px] font-medium leading-[27px] text-[rgba(250,250,250,0.9)]">{point.text}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative h-[360px] w-[274px] shrink-0 sm:h-[495px] sm:w-[376px]">
            <div className="absolute left-0 top-0 h-[495px] w-[376px] origin-top-left scale-[0.73] sm:scale-100">
              <div className="absolute left-[16px] top-[118px] flex h-[314px] w-[185px] items-center justify-center">
                <img src={ladder} alt="" className="h-[8px] w-[360px] max-w-none -rotate-[60deg]" />
              </div>

              <img
                src={walkIcon}
                alt=""
                className="absolute h-[64px] w-[67.5px]"
                style={{ left: 18, top: 292 }}
              />

              {ROLE_LINES.map((line) => (
                <span
                  key={`${line.left}-${line.top}`}
                  aria-hidden="true"
                  className="absolute h-0 w-[23.6px] origin-left rotate-[0.78deg] border-t-2 border-[#fafafa]"
                  style={{ left: line.left, top: line.top }}
                />
              ))}

              {YEAR_LABELS.map((label) => (
                <span
                  key={`${label.left}-${label.top}`}
                  className="absolute w-[83px] -rotate-[60deg] text-center text-[16px] font-normal leading-normal text-[rgba(250,250,250,0.9)]"
                  style={{ left: label.left, top: label.top }}
                >
                  2 years
                </span>
              ))}

              {STAGES.map((stage) => (
                <div
                  key={stage.title}
                  className="absolute flex items-center gap-2"
                  style={{ left: stage.left, top: stage.top }}
                >
                  <span className="h-3 w-3 shrink-0 rounded-full bg-[#fafafa]" />
                  <span className="whitespace-nowrap rounded-full bg-[#fafafa] px-4 py-1 text-[16px] font-medium leading-normal text-[#97144d]">
                    {stage.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
