import React from "react";
import checkIcon from "../assets/figma/check-sm.svg";

const REQUIREMENTS = [
  "Graduate with a minimum of 50% marks.",
  "Age limit 21-27 years.",
  "Proficient in English communication",
];

export default function Eligibility() {
  return (
    <section id="eligibility" className="scroll-mt-28 bg-[#fafafa]">
      <div className="mx-auto flex max-w-[1280px] flex-col items-start justify-between gap-8 px-6 py-12 sm:px-10 lg:flex-row lg:px-[120px] lg:py-12">
        <div className="flex max-w-[393px] flex-col gap-4">
          <div className="inline-flex w-fit items-center justify-center rounded-full border border-[#9d2257] px-[30px] py-1 text-[14px] font-semibold capitalize leading-5 text-[#9d2257]">
            Eligibility
          </div>
          <h2 className="text-[24px] font-semibold leading-[31.2px] text-[#9d2257]">Who is this program for?</h2>
        </div>

        <div className="w-full max-w-[516px] rounded-[10px] px-6 pt-6">
          <p className="text-[14px] uppercase leading-[21px] text-[#231f20]">Requirements</p>
          <ul className="mt-3 flex flex-col gap-2">
            {REQUIREMENTS.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <img src={checkIcon} alt="" className="mt-0.5 h-4 w-4 shrink-0" />
                <span className="text-[16px] text-[rgba(34,31,32,0.8)]">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
