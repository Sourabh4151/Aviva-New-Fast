import React from "react";
import icon1 from "../assets/figma/journey-1.svg";
import icon2 from "../assets/figma/journey-2.svg";
import icon3 from "../assets/figma/journey-3.svg";
import icon4 from "../assets/figma/journey-4.svg";
import icon5 from "../assets/figma/journey-5.svg";
import icon6 from "../assets/figma/journey-6.svg";

const STEPS = [
  {
    icon: icon1,
    title: "Screening",
    detail: "Fill application form and appear for Crack-ED screening interview.",
  },
  {
    icon: icon2,
    title: "Assessment",
    detail: "Complete the Axis Bank’s Assessment.",
  },
  {
    icon: icon3,
    title: "HR & Technical Interview",
    detail: "Appear online for Axis Bank’s HR & Technical Interview.",
  },
  {
    icon: icon4,
    title: "Enrollment",
    detail: "Receive provisional offer letter and enroll for the program.",
  },
  {
    icon: icon5,
    title: "166 Hours Training",
    detail: "Complete 5 weeks of virtual classroom training with Crack-ED.",
  },
  {
    icon: icon6,
    title: "Onboarding",
    detail: "Join Axis Bank as a VRM (Assistant Manager Grade)",
  },
];

export default function EnrollmentProcess() {
  return (
    <section id="enrollment-process" className="scroll-mt-28 bg-[#fafafa]">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-6 py-12 sm:px-10 lg:px-[80px] lg:py-12">
        <div className="mx-auto flex max-w-[850px] flex-col items-center gap-4 text-center">
          <div className="inline-flex items-center justify-center rounded-full border border-[#97144d] px-[30px] py-1 text-[14px] font-medium capitalize leading-[27px] text-[#97144d]">
            Candidates Journey
          </div>
          <h2 className="text-[22px] font-semibold leading-normal text-[#9d2257] sm:text-[24px]">
            A simple, step-by-step process designed to help you get started with confidence.
          </h2>
        </div>

        <ol className="relative grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
          <span
            className="pointer-events-none absolute inset-x-0 top-[39px] hidden h-[2px] rounded-full bg-[#97144d] lg:block"
            aria-hidden="true"
          />
          {STEPS.map((step, index) => (
            <li key={step.title} className="relative flex flex-col items-center text-center">
              <div className="relative z-10 flex flex-col items-center">
                <span className="flex h-20 w-20 items-center justify-center rounded-full border border-[#97144d] bg-[#fafafa]">
                  <img src={step.icon} alt="" className="h-10 w-10" />
                </span>
                <span className="-mt-5 flex h-8 w-8 items-center justify-center rounded-full bg-[#97144d] text-[20px] font-medium text-[#fafafa]">
                  {index + 1}
                </span>
              </div>
              <p className="mt-3 text-[16px] font-medium leading-normal text-[#231f20]">{step.title}</p>
              <p className="mt-2 text-[14px] leading-normal text-[rgba(35,31,32,0.8)]">{step.detail}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
