import React from "react";
import certificateImage from "../assets/Certificate.jpg";

const fontFamily =
  "Montserrat, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export default function Certification() {
  return (
    <section
      id="certification"
      className="relative bg-black text-white scroll-mt-24 overflow-hidden"
    >
      <div className="relative z-10 mx-auto px-section py-12 lg:px-[120px] lg:py-12">
        <div className="mx-auto flex max-w-[1040px] flex-col items-start gap-[10px]">
          <div
            className="inline-flex h-[35px] items-center justify-center rounded-full border border-white/30 px-[30px] py-1 text-sm font-medium tracking-normal leading-[27px] text-white/70"
            style={{ fontFamily }}
          >
            Recognition For Your Journey
          </div>

          <p
            className="text-[24px] font-medium leading-[31.2px] tracking-normal"
            style={{
              fontFamily,
              color: "rgba(250, 250, 250, 1)",
            }}
          >
            Earn a Certificate That Recognises Your Banking Readiness.
          </p>

          <p
            className="text-base font-medium leading-normal tracking-normal"
            style={{
              fontFamily,
              color: "rgba(250, 250, 250, 1)",
            }}
          >
            Complete structured classroom training, gain practical on-the-job
            experience and demonstrate your readiness through professional
            certification.
          </p>

          <div className="mt-[10px] flex w-full justify-center">
            <img
              src={certificateImage}
              alt="CRACK-ED Certificate of Completion"
              className="h-auto w-full max-w-[520px] rounded-[10px] object-contain"
              width={520}
              height={184}
            />
          </div>
        </div>
      </div>
    </section>
  );
}