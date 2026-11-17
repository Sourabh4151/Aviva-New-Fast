import React from "react";
import designation from "../assets/icon-designation.svg";
import ctc from "../assets/icon-ctc.svg";
import earn from "../assets/icon-earn.svg";
import reimburse from "../assets/icon-reimburse.svg";

const ITEMS = [
  {
    icon: designation,
    text: "Designation: Certified Health Insurance Manager",
  },
  {
    icon: ctc,
    text: "CTC: ₹3.5 LPA + Incentives",
  },
  {
    icon: earn,
    text: "Start Earning\nAs Early as 30 Days",
  },
  {
    icon: reimburse,
    text: "100% Course fee Reimbursement",
  },
];

export default function Highlights() {
  return (
    <section className="bg-[#fafafa] text-[#c7222a]">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-4 py-10 sm:grid sm:grid-cols-2 sm:gap-6 sm:px-8 lg:grid-cols-4 lg:px-[100px] lg:py-12">
        {ITEMS.map((item) => (
          <div key={item.text} className="flex w-full items-center gap-2 pr-5 sm:gap-3 sm:pr-0">
            <span className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-[16px] bg-[#fff4d9]">
              <img src={item.icon} alt="" className="h-8 w-8 object-contain" />
            </span>
            <p className="min-w-0 flex-1 font-['Anek_Latin',sans-serif] text-[16px] font-medium leading-6 tracking-normal text-[#c7222a]">
              {item.text.includes("\n") ? (
                <>
                  <span className="whitespace-nowrap lg:hidden">{item.text.replace("\n", " ")}</span>
                  <span className="hidden lg:contents">
                    {item.text.split("\n").map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </span>
                </>
              ) : (
                item.text
              )}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
