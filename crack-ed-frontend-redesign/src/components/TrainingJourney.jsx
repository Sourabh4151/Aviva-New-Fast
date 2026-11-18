import React from "react";

function ClassroomIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20,17A2,2 0 0,0 22,15V4A2,2 0 0,0 20,2H9.46C9.81,2.61 10,3.3 10,4H20V15H11V17M15,7V9H9V22H7V16H5V22H3V14H1.5V9A2,2 0 0,1 3.5,7H15M8,4A2,2 0 0,1 6,6A2,2 0 0,1 4,4A2,2 0 0,1 6,2A2,2 0 0,1 8,4Z" />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M10 16V15H3L3 19C3 20.11 3.89 21 5 21H19C20.11 21 21 20.11 21 19V15H14V16H10M20 7H16V5L14 3H10L8 5V7H4C2.9 7 2 7.9 2 9V12C2 13.11 2.89 14 4 14H10V12H14V14H20C21.1 14 22 13.1 22 12V9C22 7.9 21.1 7 20 7M14 7H10V5H14V7Z" />
    </svg>
  );
}

function HandshakeIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21.71 8.71C22.96 7.46 22.39 6 21.71 5.29L18.71 2.29C17.45 1.04 16 1.61 15.29 2.29L13.59 4H11C9.1 4 8 5 7.44 6.15L3 10.59V14.59L2.29 15.29C1.04 16.55 1.61 18 2.29 18.71L5.29 21.71C5.83 22.25 6.41 22.45 6.96 22.45C7.67 22.45 8.32 22.1 8.71 21.71L11.41 19H15C16.7 19 17.56 17.94 17.87 16.9C19 16.6 19.62 15.74 19.87 14.9C21.42 14.5 22 13.03 22 12V9H21.41L21.71 8.71M20 12C20 12.45 19.81 13 19 13L18 13L18 14C18 14.45 17.81 15 17 15L16 15L16 16C16 16.45 15.81 17 15 17H10.59L7.31 20.28C7 20.57 6.82 20.4 6.71 20.29L3.72 17.31C3.43 17 3.6 16.82 3.71 16.71L5 15.41V11.41L7 9.41V11C7 12.21 7.8 14 10 14S13 12.21 13 11H20V12M20.29 7.29L18.59 9H11V11C11 11.45 10.81 12 10 12S9 11.45 9 11V8C9 7.54 9.17 6 11 6H14.41L16.69 3.72C17 3.43 17.18 3.6 17.29 3.71L20.28 6.69C20.57 7 20.4 7.18 20.29 7.29Z" />
    </svg>
  );
}

const CARDS = [
  {
    title: "Classroom Training",
    description:
      "Build strong role fundamentals through structured, instructor-led sessions focused on practical knowledge and real-world scenarios.",
    duration: "1 Month",
    icon: <ClassroomIcon />,
  },
  {
    title: "Internship",
    description:
      "Gain real-world exposure to health insurance sales, customer interactions, product understanding.",
    duration: "3 Months",
    icon: <BriefcaseIcon />,
  },
  {
    title: "On the Job Training",
    description:
      "Apply your learning on the job while handling customers, understanding their needs, recommending suitable insurance solutions, and driving business outcomes.",
    duration: "3 Months",
    icon: <HandshakeIcon />,
  },
];

export default function TrainingJourney() {
  return (
    <section id="training" className="scroll-mt-24 bg-[#fafafa] text-[#231f20]">
      <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-8 lg:px-[120px] lg:py-16">
        <div className="flex justify-center">
          <div className="inline-flex h-11 items-center justify-center gap-2.5 rounded-[100px] border border-[#c7222a] px-[30px] py-2 font-['Anek_Latin',sans-serif] text-[20px] font-semibold leading-7 tracking-normal text-[#c7222a]">
            Program Details
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center gap-4 sm:grid sm:items-stretch lg:grid-cols-3">
          {CARDS.map((card) => (
            <article
              key={card.title}
              className="group flex w-full max-w-[328px] flex-col gap-6 rounded-[12px] border border-[#c7222a] bg-[#fafafa] p-4 shadow-none transition-colors duration-200 hover:bg-[#fff4d9] sm:max-w-none sm:min-h-[292px] sm:bg-white sm:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_2px_6px_2px_rgba(0,0,0,0.15)] lg:min-h-[300px]"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-[12px] bg-[#f6d4d6] text-[#c7222a] transition-colors duration-200 group-hover:bg-[#c7222a] group-hover:text-white">
                {card.icon}
              </span>
              <div className="flex flex-col gap-2">
                <h3 className="font-['Anek_Latin',sans-serif] text-[18px] font-semibold leading-6 text-[#c7222a]">
                  {card.title}
                </h3>
                <p className="text-justify font-['Anek_Latin',sans-serif] text-[14px] leading-[22px] text-[#414042]">
                  {card.description}
                </p>
              </div>
              <div className="mt-auto">
                <p className="font-['Anek_Latin',sans-serif] text-[12px] font-medium uppercase tracking-wide text-[#8a8a8a]">
                  Duration
                </p>
                <p className="font-['Anek_Latin',sans-serif] text-[16px] font-medium leading-6 text-[#231f20]">
                  {card.duration}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
