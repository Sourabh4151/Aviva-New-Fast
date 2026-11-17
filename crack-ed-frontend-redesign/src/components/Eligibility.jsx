import React from "react";

function SchoolIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12,3L1,9L12,15L21,10.09V17H23V9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z" />
    </svg>
  );
}

function AccountIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19,19H5V5H19M19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M16.5,16.25C16.5,14.75 13.5,14 12,14C10.5,14 7.5,14.75 7.5,16.25V17H16.5M12,12.25A2.25,2.25 0 0,0 14.25,10A2.25,2.25 0 0,0 12,7.75A2.25,2.25 0 0,0 9.75,10A2.25,2.25 0 0,0 12,12.25Z" />
    </svg>
  );
}

function MapMarkerIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M9,11.5A2.5,2.5 0 0,0 11.5,9A2.5,2.5 0 0,0 9,6.5A2.5,2.5 0 0,0 6.5,9A2.5,2.5 0 0,0 9,11.5M9,2C12.86,2 16,5.13 16,9C16,14.25 9,22 9,22C9,22 2,14.25 2,9A7,7 0 0,1 9,2M15,17H18V14H20V17H23V19H20V22H18V19H15V17Z" />
    </svg>
  );
}

const CARDS = [
  {
    title: "Qualification",
    text: "Graduate in any stream with 50% or\u00A0above.",
    icon: <SchoolIcon />,
  },
  {
    title: "Age",
    text: "23-27 years of age.",
    icon: <AccountIcon />,
  },
  {
    title: "Job Locations",
    text: "Open to opportunities across eligible ABC business locations.",
    icon: <MapMarkerIcon />,
  },
];

export default function Eligibility() {
  return (
    <section id="eligibility" className="scroll-mt-24 bg-[#fafafa] text-[#231f20]">
      <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-8 lg:px-10 lg:py-14 xl:px-[120px]">
        <div className="flex flex-col items-start gap-4">
          <div className="inline-flex h-11 items-center justify-center rounded-[100px] border border-[#c7222a] px-[30px] py-2 font-['Anek_Latin',sans-serif] text-[20px] font-semibold leading-7 tracking-normal text-[#c7222a]">
            Eligibility
          </div>
          <div className="grid w-full gap-4 lg:grid-cols-3">
            {CARDS.map((card) => (
              <article
                key={card.title}
                className="flex min-h-[119px] items-start gap-2 rounded-[12px] border border-[#c7222a] bg-white py-4 pl-2 pr-4 shadow-[0_1px_3px_rgba(0,0,0,0.3),0_4px_8px_3px_rgba(0,0,0,0.15)] transition-colors duration-200 hover:bg-[#fff4d9]"
              >
                <span className="shrink-0 text-[#c7222a]">{card.icon}</span>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <h3 className="font-['Anek_Latin',sans-serif] text-[18px] font-semibold leading-[27px] text-[#c7222a]">
                    {card.title}
                  </h3>
                  <p className="font-['Anek_Latin',sans-serif] text-[16px] font-normal leading-6 text-[rgba(65,64,66,0.9)]">
                    {card.text}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
