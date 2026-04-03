import React from "react";

export default function About() {
  return (
    <section id="about" className="bg-black text-white scroll-mt-24">
      <div className="mx-auto px-section py-section lg:px-[120px] lg:pt-[110px] lg:pb-[110px]">
        <div className="about-pill inline-flex items-center justify-center text-[14px] leading-[27px] font-medium tracking-normal rounded-[100px] border border-white/30 py-1 px-[30px] text-white/70">
          About The Program
        </div>

        <p className="about-body mt-4 sm:mt-6 text-[16px] leading-[27px] sm:text-[18px] sm:leading-[32px] font-normal text-white/80 sm:text-white text-justify">
        India’s digital payments industry is growing rapidly as more businesses adopt QR codes and mobile payments to serve customers faster and more conveniently. This shift has created strong demand for professionals who can help merchants adopt these solutions. Paytm has been a key driver of this transformation, building a trusted digital payments ecosystem used by millions of consumers and businesses across India. The Paytm Disha Program – Front Line Sales Executive prepares you for this opportunity by equipping you with the practical skills to onboard merchants, build relationships with shop owners, and begin your career in the fast-growing digital payments ecosystem.
        </p>
      </div>
    </section>
  );
}

