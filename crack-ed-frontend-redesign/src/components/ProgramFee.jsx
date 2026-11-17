import React from "react";
import tickSvg from "../assets/hero-tick.svg";

const PAY_URL = "https://smartpay.easebuzz.in/234234/abcfs";

const INCLUDES = [
  "Comprehensive counseling, grooming and training.",
  "All learning materials and resources",
];

const TRANCHES = [
  "1st Year - 50% of Program Fee",
  "2nd Year - Remaining 50% of Program Fee",
];

function TickList({ items }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2">
          <img src={tickSvg} alt="" width={16} height={16} className="mt-0.5 shrink-0" />
          <span className="font-['Anek_Latin',sans-serif] text-[16px] font-normal leading-5 text-[rgba(65,64,66,0.9)]">
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function ProgramFee() {
  return (
    <section id="program-fee" className="scroll-mt-24 bg-[#fafafa] text-[#231f20]">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-3 px-4 py-12 sm:px-8 lg:px-10 lg:py-12 xl:px-[120px]">
        <div className="flex flex-col gap-8 lg:gap-10">
          <div className="inline-flex h-11 w-fit items-center justify-center gap-2.5 rounded-[100px] border border-[#c7222a] px-[30px] py-2 text-center font-['Anek_Latin',sans-serif] text-[20px] font-semibold leading-7 text-[#c7222a]">
            Program Fee
          </div>

          <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:gap-6 xl:gap-[60px]">
            <article className="flex min-w-0 flex-1 flex-col gap-3 rounded-[10px] border border-[#c7222a] bg-[#fff4d9] p-6 lg:min-h-[265px] xl:max-w-[490px]">
              <div>
                <p className="font-['Anek_Latin',sans-serif] text-[32px] font-semibold leading-8 text-[#c7222a] xl:whitespace-nowrap">
                  ₹99,000* +
                  <br className="lg:hidden" />
                  <span className="text-[20px] font-semibold leading-8"> Applicable Taxes & Charges</span>
                </p>
                <p className="text-right font-['Anek_Latin',sans-serif] text-[12px] font-normal leading-none text-[rgba(65,64,66,0.9)]">
                  *In the Business
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                <p className="font-['Anek_Latin',sans-serif] text-[16px] font-normal leading-6 text-[rgba(65,64,66,0.9)]">
                  The program fee includes:
                </p>
                <TickList items={INCLUDES} />
              </div>

              <a
                href={PAY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-flex h-[50px] w-fit shrink-0 cursor-pointer items-center gap-2 rounded-[10px] bg-[#c7222a] px-6 font-['Anek_Latin',sans-serif] text-[14px] font-semibold leading-none text-white transition-[background-color,box-shadow,transform] duration-150 hover:bg-[#a61c23] hover:shadow-[0_8px_20px_rgba(199,34,42,0.28)] active:translate-y-px active:shadow-none"
              >
                Enrol & Pay Now
                <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true">
                  <rect x="0.75" y="0.75" width="16.5" height="12.5" rx="1.5" stroke="white" strokeWidth="1.5" />
                  <path d="M0.75 4.5H17.25" stroke="white" strokeWidth="1.5" />
                </svg>
              </a>
            </article>

            <article className="flex min-w-0 flex-1 flex-col gap-2.5 rounded-[10px] border border-[#c7222a] bg-[#fff4d9] p-6 lg:min-h-[265px] xl:max-w-[490px]">
              <h3 className="font-['Anek_Latin',sans-serif] text-[20px] font-semibold leading-6 text-[#c7222a]">
                Reimbursement Of Fee:
              </h3>
              <p className="font-['Anek_Latin',sans-serif] text-[40px] font-semibold leading-none text-[#c7222a]">100%</p>
              <p className="font-['Anek_Latin',sans-serif] text-[16px] font-normal leading-6 text-[rgba(65,64,66,0.9)]">
                The reimbursement will be shared in the following two tranches
              </p>
              <TickList items={TRANCHES} />
            </article>
          </div>
        </div>

        <p className="font-['Anek_Latin',sans-serif] text-[14px] font-normal leading-[15px] text-[rgba(65,64,66,0.9)]">
          *Flexible EMI and education loan assistance available. Terms and conditions apply.
        </p>
      </div>
    </section>
  );
}
