import React from "react";

export default function HaveQuestionsBanner() {
  const scrollToHero = () => {
    const heroSection = document.getElementById("hero");
    if (heroSection) {
      heroSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="bg-[#fafafa]">
      <div className="mx-auto max-w-[1280px] px-6 py-12 sm:px-10 lg:px-[120px] lg:py-12">
        <div className="flex flex-col items-center gap-[30px] rounded-[16px] bg-gradient-to-b from-[rgba(151,20,77,0.2)] to-[rgba(151,20,77,0)] px-6 py-10 text-center sm:px-12">
          <div className="flex flex-col items-center gap-[9px]">
            <p className="text-[24px] font-semibold text-[#9d2257]">Start your banking career today..</p>
            <p className="text-[18px] text-[rgba(34,31,32,0.8)]">
              Request a callback and talk to our counsellors to know more
            </p>
          </div>
          <button
            type="button"
            onClick={scrollToHero}
            className="rounded-[10px] bg-[#9d2257] px-10 py-3.5 text-[14px] font-semibold text-[#fafafa]"
          >
            Request a callback
          </button>
        </div>
      </div>
    </section>
  );
}
