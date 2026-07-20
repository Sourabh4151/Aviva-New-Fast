import React from "react";

export default function About() {
  return (
    <section id="about" className="bg-black text-white scroll-mt-24">
      <div className="mx-auto px-section py-section lg:px-[120px] lg:pt-[110px] lg:pb-[110px]">
        <div className="about-pill inline-flex items-center justify-center text-[14px] leading-[27px] font-medium tracking-normal rounded-[100px] border border-white/30 py-1 px-[30px] text-white/70">
          About The Program
        </div>

        <p className="about-body mt-4 sm:mt-6 text-[16px] leading-[27px] sm:text-[18px] sm:leading-[32px] font-normal text-white/80 sm:text-white text-justify">
        Most entrepreneurship programmes teach concepts through classroom learning and hypothetical case studies. The House of Founders Fellowship is different. Every framework, assignment, and mentoring session is designed to help you build, validate, and scale your own venture. Combining the academic rigour of IIM Lucknow with founder mentorship from the House of Founders, this fellowship gives entrepreneurs the tools, guidance, and network to turn ideas into scalable businesses. 
        </p>
      </div>
    </section>
  );
}

