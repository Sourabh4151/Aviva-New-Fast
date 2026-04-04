import React from "react";
import indusland from "../assets/indusland.svg";
import yesbank from "../assets/yesbank.svg";
import kotak from "../assets/kotak.svg";
import au from "../assets/au.svg";
import axis from "../assets/axis.svg";
import bandhan from "../assets/bandhan.svg";
import hdfcLogo from "../assets/hdfc_logo.png";

const placementPartners = [
  { src: indusland, alt: "IndusInd Bank", marqueeMax: "max-w-[160px]" },
  { src: yesbank, alt: "Yes Bank", marqueeMax: "max-w-[130px]" },
  { src: kotak, alt: "Kotak Bank", marqueeMax: "max-w-[140px]" },
  { src: au, alt: "AU Small Finance Bank", marqueeMax: "max-w-[120px]" },
  { src: axis, alt: "Axis Bank", marqueeMax: "max-w-[130px]" },
  { src: bandhan, alt: "Bandhan Bank", marqueeMax: "max-w-[130px]" },
  { src: hdfcLogo, alt: "HDFC Bank", marqueeMax: "max-w-[180px]" },
];

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

        <div className="mt-10 w-full min-w-0 max-w-full">
          <p className="text-[12px] leading-[21px] font-semibold uppercase text-[rgba(250,250,250,0.8)]">
            Placement Partners
          </p>
          {/* Mobile: scrolling logo carousel */}
          <div className="mt-4 block md:hidden w-full min-w-0 max-w-full placement-partners-marquee">
            <div className="placement-partners-track">
              {placementPartners.map(({ src, alt, marqueeMax }) => (
                <img
                  key={`a-${alt}`}
                  src={src}
                  alt={alt}
                  className={`h-auto max-h-[43px] w-auto shrink-0 object-contain ${marqueeMax}`}
                />
              ))}
              {placementPartners.map(({ src, alt, marqueeMax }) => (
                <img
                  key={`b-${alt}`}
                  src={src}
                  alt={alt}
                  className={`h-auto max-h-[43px] w-auto shrink-0 object-contain ${marqueeMax}`}
                />
              ))}
            </div>
          </div>

          {/* Desktop: grid keeps logos inside padded width (flex+nowrap overflow was clipping against body overflow-x) */}
          <div className="mt-4 hidden md:grid w-full min-w-0 max-w-full gap-x-4 gap-y-6 items-center justify-items-center lg:gap-x-[50px] lg:gap-y-0 [grid-template-columns:repeat(4,minmax(0,1fr))] lg:[grid-template-columns:repeat(7,minmax(0,1fr))]">
            {placementPartners.map(({ src, alt }) => (
              <img
                key={alt}
                src={src}
                alt={alt}
                className="h-auto max-h-[43px] w-full max-w-full min-w-0 object-contain"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

