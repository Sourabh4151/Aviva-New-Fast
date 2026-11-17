import React from "react";
import step1 from "../assets/1st.svg";
import step2 from "../assets/2nd.svg";
import step3 from "../assets/3rd.svg";
import step4 from "../assets/4th.svg";
import step5 from "../assets/5th.svg";
import step6 from "../assets/6th.svg";

const STEPS = [
  {
    title: "Screening",
    mobileDescription: "Fill application form and appear for\nCrack-ED screening interview.",
    description: "Fill\u00A0application\u00A0form and\u00A0appear\u00A0for\u00A0Crack-ED screening\u00A0interview.",
    icon: step1,
  },
  {
    title: "Assessment & Interview",
    mobileDescription: "Complete the ABC Assessment\n& Interview.",
    description: "Complete\u00A0the ABC\u00A0Assessment &\u00A0Interview.",
    icon: step2,
  },
  {
    title: "Provisional Offer",
    mobileDescription: "Receive a provisional offer from\nAditya Birla Health Insurance\nCo. Ltd.",
    description: "Receive\u00A0a\u00A0provisional\u00A0offer from\u00A0Aditya\u00A0Birla\u00A0Health Insurance\u00A0Co.\u00A0Ltd.",
    icon: step3,
  },
  {
    title: "Campus Training",
    mobileDescription: "Complete one month of offline\nclassroom training at Crack-ED.",
    description: "Complete\u00A0one\u00A0month\u00A0of offline\u00A0classroom\u00A0training at\u00A0Crack-ED.",
    icon: step4,
  },
  {
    title: "Join Aditya Birla Capital",
    desktopTitle: "Join\nAditya Birla Capital",
    mobileDescription: "Join Aditya Birla Capital as a\nfull-time employee.",
    description: "Join\u00A0Aditya\u00A0Birla\u00A0Capital as\u00A0a\u00A0full-time\u00A0employee.",
    icon: step5,
  },
  {
    title: "Internship & OJT",
    mobileDescription: "Complete 3 months internship &\n3 months OJT.",
    description: "Complete\u00A03\u00A0months\u00A0internship &\u00A03\u00A0months\u00A0OJT.",
    icon: step6,
  },
];

export default function EnrollmentProcess() {
  return (
    <section id="enrollment-process" className="scroll-mt-24 bg-[#fafafa] text-[#231f20]">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-4 py-12 sm:px-8 lg:px-10 xl:px-[120px]">
        <div className="flex justify-start">
          <div className="inline-flex h-11 items-center justify-center gap-2.5 rounded-[100px] border border-[#c7222a] px-[30px] py-2 font-['Anek_Latin',sans-serif] text-[20px] font-semibold leading-7 tracking-normal text-[#c7222a]">
            Enrollment Process
          </div>
        </div>

        <ol className="relative flex flex-col gap-6 lg:grid lg:grid-cols-6 lg:gap-2">
          <span
            className="pointer-events-none absolute top-[39px] hidden h-[2px] bg-[#c7222a] lg:block"
            style={{ left: "calc((100% - 40px) / 12 - 60px)", right: "calc((100% - 40px) / 12 - 60px)" }}
            aria-hidden="true"
          />
          {STEPS.map((step, index) => (
            <li key={step.title} className="relative flex items-start gap-4 text-left lg:flex-col lg:items-center lg:gap-0 lg:text-center">
              {index < STEPS.length - 1 && (
                <span className="absolute left-[39px] top-20 -bottom-6 w-[2px] bg-[#c7222a] lg:hidden" aria-hidden="true" />
              )}
              <span className="relative z-10 flex h-20 w-20 shrink-0 items-start justify-center lg:h-[111px] lg:w-full">
                <img src={step.icon} alt="" width={80} height={80} className="h-20 w-20 object-contain" />
                <span className="absolute -bottom-1 -left-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#c7222a] font-['Lato',sans-serif] text-[20px] font-medium leading-none text-[#fafafa] lg:bottom-[26px] lg:left-[calc(50%-38px)]">
                  {index + 1}
                </span>
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-2.5 pt-3 lg:mt-5 lg:w-full lg:items-center lg:gap-2 lg:pt-0">
                <h3 className="font-['Anek_Latin',sans-serif] text-[16px] font-medium leading-none text-[#231f20]">
                  <span className="lg:hidden">{step.title}</span>
                  <span className="hidden lg:contents">
                    {(step.desktopTitle || step.title).split("\n").map((line) => (
                      <span key={line} className="lg:block">
                        {line}
                      </span>
                    ))}
                  </span>
                </h3>
                <p className="font-['Anek_Latin',sans-serif] text-[14px] font-normal leading-5 text-[rgba(65,64,66,0.9)]">
                  <span className="lg:hidden">
                    {step.mobileDescription.split("\n").map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </span>
                  <span className="hidden lg:inline">{step.description}</span>
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
