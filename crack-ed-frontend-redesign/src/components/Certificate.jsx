import React from "react";
import certificate from "../assets/figma/certificate.png";

export default function Certificate() {
  return (
    <section id="certification" className="bg-[#fafafa]">
      <div className="mx-auto flex max-w-[1280px] flex-col items-start gap-8 px-6 py-12 sm:px-10 lg:px-[120px] lg:py-12">
        <div className="flex max-w-[1040px] flex-col gap-4">
          <div className="inline-flex w-fit items-center justify-center rounded-full border border-[#97144d] px-[30px] py-1 text-[14px] font-semibold capitalize leading-5 text-[#97144d]">
            Certification
          </div>
          <h2 className="text-[24px] font-semibold text-[#97144d]">Earn a Certificate upon Completion</h2>
          <p className="text-[16px] text-[rgba(34,31,32,0.8)]">
            Complete structured classroom training, gain practical on-the-job experience and demonstrate your readiness through professional certification.
          </p>
        </div>
        <img
          src={certificate}
          alt="Certificate of completion"
          className="mx-auto h-auto w-full max-w-[520px] rounded-[4px] object-cover"
        />
      </div>
    </section>
  );
}
