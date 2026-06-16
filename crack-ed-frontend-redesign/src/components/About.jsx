import React from "react";

export default function About() {
  return (
    <section id="about" className="bg-black text-white scroll-mt-24">
      <div className="mx-auto px-section py-section lg:px-[120px] lg:pt-[110px] lg:pb-[110px]">
        <div className="about-pill inline-flex items-center justify-center text-[14px] leading-[27px] font-medium tracking-normal rounded-[100px] border border-white/30 py-1 px-[30px] text-white/70">
          About The Program
        </div>

        <p className="about-body mt-4 sm:mt-6 text-[16px] leading-[27px] sm:text-[18px] sm:leading-[32px] font-normal text-white/80 sm:text-white text-justify">
        India's rural banking and financial services sector continues to expand as more individuals and small businesses seek access to credit, savings, and other essential banking solutions. This growth has created a need for professionals who can connect with customers, build trust within communities, and support financial inclusion efforts on the ground. The Quess Samriddhi Program prepares candidates for a Field Executive role, where they engage with customers, facilitate loan sourcing and servicing, support repayment activities, and promote banking products and financial awareness initiatives. Combining structured learning with practical application, the program helps candidates develop the knowledge, confidence, and customer engagement skills required to build a successful career in rural banking.
        </p>
      </div>
    </section>
  );
}

