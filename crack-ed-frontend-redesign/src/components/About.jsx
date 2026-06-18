import React from "react";

export default function About() {
  return (
    <section id="about" className="bg-black text-white scroll-mt-24">
      <div className="about-inner mx-auto py-section lg:pt-[110px] lg:pb-[110px]">
        <div className="about-pill inline-flex items-center justify-center text-[14px] leading-[27px] font-medium tracking-normal rounded-[100px] border border-white/30 py-1 px-[30px] text-white/70">
          About The Program
        </div>

        <p className="about-body about-body-justify mt-4 sm:mt-6 text-[16px] leading-[27px] sm:text-[18px] sm:leading-[32px] font-normal text-white/80 sm:text-white">
          India’s banking sector is growing fast, creating opportunities for people who want to learn, grow, and make a real impact. A Relationship Manager plays a key role in this, managing client portfolios, building trust, guiding customers with the right financial solutions, and helping businesses grow. The Postgraduate Program in Banking Management – Relationship Manager prepares you for this role with a mix of practical learning and real-world exposure, giving you the skills, confidence, and clarity to start a meaningful career in banking.
        </p>
      </div>
    </section>
  );
}
