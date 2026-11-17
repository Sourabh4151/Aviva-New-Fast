import React from "react";
import humanSvg from "../assets/human.svg";
import tickSvg from "../assets/hero-tick.svg";

const LADDER = [
  { role: "Business Development Manager", x: 148, y: 22 },
  { role: "Senior Agency Sales Manager", x: 92, y: 96 },
  { role: "Certified Health Insurance Manager", x: 36, y: 170 },
];

const MOBILE_ROLES = [
  "Certified Health Insurance Manager",
  "Senior Agency Sales Manager",
  "Business Development Manager",
];

const RESPONSIBILITIES = [
  "To recruit, train & develop good quality prospective insurance advisors",
  "Conducts regular meetings and empanelment and activation of advisors",
  "Updates sales portal with requisite information to facilitate information",
  "Obtains and analyzes information from market to identify new clients and advisors",
  "Do the Field Sales/Joint calls to increase the advisor strength & Business",
  "Drives ongoing sales from the advisors and contribute towards regions achievements",
];

export default function CareerGrowth() {
  return (
    <section id="career-growth" className="scroll-mt-24 bg-[#fff4d9] text-[#231f20]">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-4 py-10 sm:px-8 sm:py-[60px] lg:gap-[10px] lg:px-[100px]">
        <div className="inline-flex h-9 w-fit items-center rounded-[100px] border border-[#c7222a] bg-[#c7222a] px-[30px] py-2 font-['Anek_Latin',sans-serif] text-[20px] font-semibold leading-5 text-white lg:bg-transparent lg:text-[#c7222a]">
          Career Growth
        </div>

        <ul className="relative flex h-[232px] w-full flex-col justify-between lg:hidden">
          <span
            className="pointer-events-none absolute bottom-[21px] left-[7px] top-[21px] border-l-2 border-dashed border-[#a09a8e]"
            aria-hidden="true"
          />
          {MOBILE_ROLES.map((role) => (
            <li key={role} className="relative z-10 flex items-center gap-3">
              <span className="h-4 w-4 shrink-0 rounded-full bg-[#c7222a]" aria-hidden="true" />
              <span className="inline-flex items-center rounded-[100px] border border-[#c7222a] bg-[#fff4d9] px-5 py-2.5 font-['Anek_Latin',sans-serif] text-[16px] font-semibold leading-5 text-[#c7222a]">
                {role}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative hidden h-[232px] w-[464px] shrink-0 lg:block">
            <svg className="absolute left-0 top-0" width="464" height="232" viewBox="0 0 464 232" aria-hidden="true">
              <line
                x1="148"
                y1="22"
                x2="36"
                y2="170"
                stroke="#C7222A"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="0.1 7"
              />
            </svg>
            {LADDER.map((step) => (
              <div key={step.role}>
                <span
                  className="absolute z-10 h-4 w-4 rounded-full bg-[#c7222a]"
                  style={{ left: step.x - 8, top: step.y - 8 }}
                />
                <span
                  className="absolute z-10 inline-flex items-center whitespace-nowrap rounded-[100px] border border-[#c7222a] px-8 py-3 font-['Anek_Latin',sans-serif] text-[16px] font-semibold leading-5 text-[#c7222a]"
                  style={{ left: step.x + 16, top: step.y - 22 }}
                >
                  {step.role}
                </span>
              </div>
            ))}
            <img
              src={humanSvg}
              alt=""
              width={25}
              height={43}
              className="absolute z-20"
              style={{ left: 28, top: 128 }}
            />
          </div>

          <article className="flex w-full flex-col gap-4 rounded-[12px] border border-[#c7222a] p-4 lg:h-[242px] lg:w-[631px] lg:shrink-0">
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
