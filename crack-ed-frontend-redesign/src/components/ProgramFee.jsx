import React from "react";
import checkIcon from "../assets/figma/check-fee.svg";
import payIcon from "../assets/figma/arrow-pay.svg";

const INCLUSIONS = [
  "Comprehensive training and placement support",
  "All learning materials and resources",
];

const PAYMENT_URL = "https://smartpay.easebuzz.in/234234/asix_vrm";

export default function ProgramFee() {
  return (
    <section id="program-fee" className="scroll-mt-28 bg-[#fafafa]">
      <div className="mx-auto flex max-w-[1280px] flex-col items-start justify-between gap-10 px-6 py-12 sm:px-10 lg:flex-row lg:px-[120px] lg:py-12">
        <div className="flex max-w-[498px] flex-col gap-4">
          <div className="inline-flex w-fit items-center justify-center rounded-full border border-[#9d2257] px-[30px] py-1 text-[14px] font-semibold capitalize leading-5 text-[#9d2257]">
            Program Fee
          </div>
          <h2 className="text-[24px] font-semibold leading-normal text-[#9d2257]">
            An investment in your skills, preparation, and career progression.
          </h2>
          <div className="space-y-2 text-[14px] text-[rgba(34,31,32,0.8)]">
            <p>
              *Enrolment fee of ₹2360 is payable over and above program fee. This covers the interview preparation and assessment fees, and is non-refundable.
            </p>
            <p>*Flexible EMI and education loan assistance available.</p>
          </div>
        </div>

        <div className="w-full max-w-[479px] rounded-[10px] border border-[#9d2257] bg-[#ffe7f1] p-6">
          <p className="text-[14px] uppercase leading-[21px] text-[#231f20]">Program Fee</p>
          <p className="mt-1 text-[#9d2257]">
            <span className="text-[32px] font-semibold leading-8">₹49,500*</span>
            <span className="text-[20px] font-semibold leading-8"> (+ Applicable Taxes &amp; Charges)</span>
          </p>
          <p className="mt-3 text-[16px] text-[rgba(34,31,32,0.8)]">The program fee includes:</p>
          <ul className="mt-2 flex flex-col gap-1">
            {INCLUSIONS.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <img src={checkIcon} alt="" className="mt-0.5 h-4 w-4 shrink-0" />
                <span className="text-[16px] text-[rgba(34,31,32,0.8)]">{item}</span>
              </li>
            ))}
          </ul>
          <a
            href={PAYMENT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-[10px] bg-[#9d2257] px-6 py-4 text-[14px] font-semibold text-white shadow-[0px_2px_6px_rgba(0,0,0,0.15),0px_1px_2px_rgba(0,0,0,0.3)] transition-colors duration-200 hover:bg-[rgba(157,34,87,0.7)]"
          >
            Enrol &amp; Pay Now
            <img src={payIcon} alt="" className="h-[18px] w-[18px]" />
          </a>
        </div>
      </div>
    </section>
  );
}
