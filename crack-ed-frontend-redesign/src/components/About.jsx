import React from "react";

export default function About() {
  return (
    <section id="about" className="bg-black text-white scroll-mt-24">
      <div className="mx-auto px-section py-section lg:px-[120px] lg:pt-[110px] lg:pb-[110px]">
        <div className="about-pill inline-flex items-center justify-center text-[14px] leading-[27px] font-medium tracking-normal rounded-[100px] border border-white/30 py-1 px-[30px] text-white/70">
          About The Program
        </div>

        <p className="about-body mt-4 sm:mt-6 text-[16px] leading-[27px] sm:text-[18px] sm:leading-[32px] font-normal text-white/80 sm:text-white text-justify">
        The banking and financial services industry is undergoing a clear shift toward digital, creating growing opportunities for professionals who can connect with customers through virtual channels and drive sales from an office environment. The Elevate Banking Program – Virtual Relationship Manager is designed to prepare candidates for this environment, training them for an office-based role where they interact with customers over calls, understand their needs, and recommend suitable banking products and services. With structured training that focuses on communication, practical sales skills, and real-world application, the program helps candidates build the confidence to perform from day one.
        </p>
      </div>
    </section>
  );
}

