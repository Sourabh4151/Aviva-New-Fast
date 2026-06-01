import React from "react";
import bandhanBankLogo from "../assets/bandhan_bank_logo.svg";

export default function About() {
  return (
    <section id="about" className="bg-black text-white scroll-mt-24">
      <div className="mx-auto px-section py-section lg:px-[120px] lg:pt-[110px] lg:pb-[110px]">
        <div className="about-pill inline-flex items-center justify-center text-[14px] leading-[27px] font-medium tracking-normal rounded-[100px] border border-white/30 py-1 px-[30px] text-white/70">
          About The Program
        </div>

        <p className="about-body mt-4 sm:mt-6 text-[16px] leading-[27px] sm:text-[18px] sm:leading-[32px] font-normal text-white/80 sm:text-white text-justify">
        India’s banking and financial services industry is one of the fastest-growing career sectors today, offering stability, strong income potential, and clear growth pathways for ambitious young professionals. The{" "}
        <span className="font-semibold">
        Bandhan Career Bridge Program - Assistant Manager
        </span>{" "}
        is designed as a direct entry into this opportunity, combining structured training with real-world exposure so you don’t just learn banking, you experience it. In collaboration with Bandhan Bank, one of India’s leading inclusive banking institutions known for its strong microfinance legacy, the program ensures industry-relevant learning and exposure. Throughout the program, you gain hands-on experience across high-impact verticals: Microfinance (managing and strengthening customer portfolios), Assets (driving loan sales and building the lending book), and Liabilities (acquiring and managing CASA and deposit accounts). It’s a career pathway built for those who want responsibility early, performance-driven rewards, and long-term growth in frontline banking.
        </p>
        <img
          src={bandhanBankLogo}
          alt="Bandhan Bank"
          className="mt-4 h-[67px] w-[196px] object-cover lg:h-[76px] lg:w-[220px]"
        />
      </div>
    </section>
  );
}

