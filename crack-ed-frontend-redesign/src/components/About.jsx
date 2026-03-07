import React from "react";
import indusland from "../assets/indusland.svg";
import yesbank from "../assets/yesbank.svg";
import kotak from "../assets/kotak.svg";
import au from "../assets/au.svg";
import axis from "../assets/axis.svg";
import bandhan from "../assets/bandhan.svg";

export default function About() {
  return (
    <section id="about" className="bg-black text-white scroll-mt-24">
      <div className="mx-auto px-section py-section lg:px-[120px] lg:pt-[110px] lg:pb-[110px]">
        <div className="about-pill inline-flex items-center justify-center text-[14px] leading-[27px] font-medium tracking-normal rounded-[100px] border border-white/30 py-1 px-[30px] text-white/70">
          About The Program
        </div>

        <p className="about-body mt-4 sm:mt-6 text-[16px] leading-[27px] sm:text-[18px] sm:leading-[32px] font-normal text-white/80 sm:text-white text-justify">
          India’s banking sector is growing fast, creating opportunities for people who want to learn, grow, and make a real impact. A Relationship Manager plays a key role in this, managing client portfolios, building trust, guiding customers with the right financial solutions, and helping businesses grow. The Postgraduate Program in Banking Management – Relationship Manager prepares you for this role with a mix of practical learning and real-world exposure, giving you the skills, confidence, and clarity to start a meaningful career in banking.
        </p>

        <div className="mt-10">
          <p className="text-[12px] leading-[21px] font-semibold uppercase text-[rgba(250,250,250,0.8)]">
            Placement Partners
          </p>
          {/* Mobile: scrolling logo carousel */}
          <div className="mt-4 block md:hidden placement-partners-marquee">
            <div className="placement-partners-track">
              <img
                src={indusland}
                alt="IndusInd Bank"
                className="h-auto max-h-[43px] max-w-[160px] object-contain"
              />
              <img
                src={yesbank}
                alt="Yes Bank"
                className="h-auto max-h-[43px] max-w-[130px] object-contain"
              />
              <img
                src={kotak}
                alt="Kotak Bank"
                className="h-auto max-h-[43px] max-w-[140px] object-contain"
              />
              <img
                src={au}
                alt="AU Small Finance Bank"
                className="h-auto max-h-[43px] max-w-[120px] object-contain"
              />
              <img
                src={axis}
                alt="Axis Bank"
                className="h-auto max-h-[43px] max-w-[130px] object-contain"
              />
              <img
                src={bandhan}
                alt="Bandhan Bank"
                className="h-auto max-h-[43px] max-w-[130px] object-contain"
              />
              {/* duplicate logos for seamless loop */}
              <img
                src={indusland}
                alt="IndusInd Bank"
                className="h-auto max-h-[43px] max-w-[160px] object-contain"
              />
              <img
                src={yesbank}
                alt="Yes Bank"
                className="h-auto max-h-[43px] max-w-[130px] object-contain"
              />
              <img
                src={kotak}
                alt="Kotak Bank"
                className="h-auto max-h-[43px] max-w-[140px] object-contain"
              />
              <img
                src={au}
                alt="AU Small Finance Bank"
                className="h-auto max-h-[43px] max-w-[120px] object-contain"
              />
              <img
                src={axis}
                alt="Axis Bank"
                className="h-auto max-h-[43px] max-w-[130px] object-contain"
              />
              <img
                src={bandhan}
                alt="Bandhan Bank"
                className="h-auto max-h-[43px] max-w-[130px] object-contain"
              />
            </div>
          </div>

          {/* Desktop: static single-line row */}
          <div className="mt-4 hidden md:flex flex-wrap md:flex-nowrap items-center justify-between gap-8 md:gap-[50px]">
            <img
              src={indusland}
              alt="IndusInd Bank"
              className="h-auto max-h-[43px] max-w-[160px] object-contain"
            />
            <img
              src={yesbank}
              alt="Yes Bank"
              className="h-auto max-h-[43px] max-w-[130px] object-contain"
            />
            <img
              src={kotak}
              alt="Kotak Bank"
              className="h-auto max-h-[43px] max-w-[140px] object-contain"
            />
            <img
              src={au}
              alt="AU Small Finance Bank"
              className="h-auto max-h-[43px] max-w-[120px] object-contain"
            />
            <img
              src={axis}
              alt="Axis Bank"
              className="h-auto max-h-[43px] max-w-[130px] object-contain"
            />
            <img
              src={bandhan}
              alt="Bandhan Bank"
              className="h-auto max-h-[43px] max-w-[130px] object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

