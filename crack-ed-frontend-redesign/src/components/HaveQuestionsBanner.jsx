import React from "react";

/** Same layering as Yes Bank SO: black base + soft brand gradient (web-safe alphas) */
const BANNER_BACKGROUND =
  "linear-gradient(180deg, rgba(199, 34, 42, 0.2) 0%, rgba(199, 34, 42, 0.06) 100%), rgba(0, 0, 0, 1)";

export default function HaveQuestionsBanner() {
  const scrollToHero = () => {
    if (typeof document === "undefined") return;
    const heroSection = document.getElementById("hero");
    if (heroSection) {
      heroSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="relative bg-black text-white overflow-hidden">
      <div className="relative z-10 mx-auto px-section py-section lg:px-[120px] lg:py-20">
        <div className="mx-auto flex flex-col items-center justify-center text-center max-w-[1040px]">
          <div
            className="w-full max-w-[1040px] min-h-[208px] rounded-[16px] flex flex-col items-center justify-center"
            style={{
              padding: "40px 48px",
              gap: "30px",
              background: BANNER_BACKGROUND,
            }}
          >
            <div className="flex flex-col items-center max-w-[542px] w-full gap-[9px]">
              <p className="have-questions-title w-full">Have Questions?</p>
              <p className="have-questions-subtitle w-full">
                Request a callback and talk to our counsellors to know more
              </p>
            </div>

            <button
              type="button"
              onClick={scrollToHero}
              className="have-questions-cta cursor-pointer hover:opacity-95 transition-opacity w-fit"
            >
              Request a callback
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
