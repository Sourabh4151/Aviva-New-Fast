import React from "react";

export default function About() {
  return (
    <section id="about" className="bg-black text-white scroll-mt-24">
      <div className="mx-auto px-section py-section lg:px-[120px] lg:pt-[110px] lg:pb-[110px]">
        <div className="about-pill inline-flex items-center justify-center text-[14px] leading-[27px] font-medium tracking-normal rounded-[100px] border border-white/30 py-1 px-[30px] text-white/70">
          About The Program
        </div>

        <p className="about-body mt-4 sm:mt-6 text-[16px] leading-[27px] sm:text-[18px] sm:leading-[32px] font-normal text-white/80 sm:text-white text-justify">
        The Aviva Nirmaan Program – Agency Sales Executive, offered by Aviva Life Insurance in partnership with Crack-ED, is designed for graduates who want to build a structured, performance-driven career in insurance distribution. The program prepares you to recruit and manage advisors, drive quality business, and achieve defined sales targets with clarity and confidence. Through a blend of focused classroom learning and guided on-the-job exposure, you gain practical understanding of how agency sales works in real environments. By the time you transition into the full-time role, you are equipped to take ownership, deliver results, and progress steadily toward higher responsibilities in agency sales leadership.
        </p>
      </div>
    </section>
  );
}

