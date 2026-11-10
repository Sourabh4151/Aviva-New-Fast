import React from "react";

export default function About() {
  return (
    <section id="about" className="scroll-mt-28 bg-[#fafafa] text-[#231f20]">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-6 py-12 sm:px-10 lg:px-[120px] lg:pb-12 lg:pt-[100px]">
        <div className="flex flex-col gap-4">
          <div className="inline-flex w-fit items-center justify-center rounded-full border border-[#97144d] px-[30px] py-1 text-[14px] font-medium capitalize leading-[27px] text-[#97144d]">
            About the program
          </div>
          <h2 className="text-[24px] font-medium leading-[31.2px] text-[#97144d]">
            Axis Bank Virtual Relationship Manager Program
          </h2>
        </div>
        <div className="space-y-5 text-justify text-[18px] leading-[32px] text-[rgba(34,31,32,0.8)]">
          <p>
            The Virtual Relationship Manager (VRM) Program, presented by Crack-ED in partnership with Axis Bank, is a fast-track mandate program designed to launch high-potential graduates into retail banking careers. Focused on the Priority &amp; NRI segment, this initiative combines 5 weeks of virtual instruction along with New Joiners Training (NJT) and On-the-Job Training (OJT) to build complete functional expertise.
          </p>
          <p>
            Candidates master financial products, hone high-touch relationship management skills, and step directly into Assistant Manager roles at Axis Bank upon successful completion.
          </p>
        </div>
      </div>
    </section>
  );
}
