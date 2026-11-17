import React from "react";
import roleIcon from "../assets/role.svg";
import moduleIcon from "../assets/module.svg";
import finalIcon from "../assets/final.svg";

const ITEMS = [
  {
    key: "alignment",
    title: "Role Alignment Reviews",
    description:
      "Understand how your skills match real workplace expectations through guided check-ins at key stages of the program.",
    icon: roleIcon,
  },
  {
    key: "progress",
    title: "Module Progress Checks",
    description:
      "Short, structured reviews after each module to help you strengthen your understanding and stay on track.",
    icon: moduleIcon,
  },
  {
    key: "review",
    title: "Final Readiness Review",
    description:
      "A comprehensive evaluation that brings everything together to confirm you’re prepared to step confidently into the role.",
    icon: finalIcon,
  },
];

export default function TrackGrowth() {
  return (
    <section id="track-growth" className="scroll-mt-24 bg-[#fafafa] text-[#231f20]">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-8 px-4 py-12 sm:px-8 lg:gap-10 lg:px-10 lg:py-12 xl:px-[120px]">
        <div className="inline-flex h-11 w-fit items-center justify-center gap-2.5 rounded-[100px] border border-[#c7222a] px-[30px] py-2 text-center font-['Anek_Latin',sans-serif] text-[20px] font-semibold leading-7 text-[#c7222a]">
          Track Your Growth
        </div>

        <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-3">
          {ITEMS.map((item) => (
            <article
              key={item.key}
              className="flex flex-col gap-2.5 rounded-[12px] border border-[#c7222a] bg-[#fafafa] px-4 py-6 shadow-[0_1px_2px_rgba(0,0,0,0.3),0_2px_6px_2px_rgba(0,0,0,0.15)] lg:min-h-[216px]"
            >
              <img src={item.icon} alt="" width={60} height={60} className="h-[60px] w-[60px]" />
              <div className="flex flex-col gap-4">
                <h3 className="font-['Anek_Latin',sans-serif] text-[18px] font-semibold leading-none text-[#c7222a]">
                  {item.title}
                </h3>
                <p className="text-left font-['Anek_Latin',sans-serif] text-[16px] font-normal leading-6 text-[rgba(65,64,66,0.9)]">
                  {item.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
