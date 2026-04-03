import React from "react";

export default function About() {
  return (
    <section id="about" className="bg-black text-white scroll-mt-24">
      <div className="mx-auto px-section py-section lg:px-[120px] lg:pt-[110px] lg:pb-[110px]">
        <div className="about-pill inline-flex items-center justify-center text-[14px] leading-[27px] font-medium tracking-normal rounded-[100px] border border-white/30 py-1 px-[30px] text-white/70">
          About The Program
        </div>

        <p className="about-body mt-4 sm:mt-6 text-[16px] leading-[27px] sm:text-[18px] sm:leading-[32px] font-normal text-white/80 sm:text-white text-justify">
        India’s MSME sector is one of the strongest drivers of the country’s economy, with millions of small businesses relying on access to formal credit to grow and sustain their operations. NBFCs have become a critical part of this ecosystem by expanding secured lending solutions to underserved business owners. Finova Capital plays an important role in this space by providing accessible financing to MSMEs across India and strengthening financial inclusion. The Finova VyaparaMitra Program - Relationship Officer is designed to prepare candidates to be part of this ecosystem through structured training and practical exposure, helping them build the skills required to support MSME customers and begin a career in secured lending.
        </p>
      </div>
    </section>
  );
}

