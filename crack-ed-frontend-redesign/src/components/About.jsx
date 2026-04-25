import React from "react";

export default function About() {
  return (
    <section id="about" className="bg-black text-white scroll-mt-24">
      <div className="mx-auto px-section py-section lg:px-[120px] lg:pt-[110px] lg:pb-[110px]">
        <div className="about-pill inline-flex items-center justify-center text-[14px] leading-[27px] font-medium tracking-normal rounded-[100px] border border-white/30 py-1 px-[30px] text-white/70">
          About The Program
        </div>

        <p className="about-body mt-4 sm:mt-6 text-[16px] leading-[27px] sm:text-[18px] sm:leading-[32px] font-normal text-white/80 sm:text-white text-justify">
        The Axis Sales Academy Program is designed to prepare candidates for entry-level field sales roles in banking, such as Business Development Associate, where they engage directly with customers, acquire new clients, and promote a range of banking products including accounts, loans, and services. Built around a structured job readiness framework, the program combines role clarity, hands-on practice, and continuous performance feedback to help candidates develop strong communication, sales, and relationship management skills. Through a focused training journey and real-world exposure, learners gain the confidence and capability to perform effectively from day one, with a clear pathway to grow into roles such as Assistant Manager and Relationship Manager within the banking industry.
        </p>
      </div>
    </section>
  );
}

