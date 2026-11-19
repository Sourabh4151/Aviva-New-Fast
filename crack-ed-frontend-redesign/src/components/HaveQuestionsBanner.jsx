import React from "react";

export default function HaveQuestionsBanner() {
  const scrollToHero = () => {
    const heroSection = document.getElementById("hero");
    if (heroSection) {
      heroSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="bg-[#fafafa] text-[#231f20]">
      <div className="mx-auto max-w-[1280px] px-4 py-10 sm:px-8 lg:px-[120px] lg:py-16">
        <div
          className="mx-auto flex min-h-[210px] max-w-[1040px] flex-col items-center justify-center rounded-[16px] px-6 py-10 text-center"
          style={{
            background:
              "linear-gradient(180deg, rgba(199, 34, 42, 0.16) 0%, rgba(199, 34, 42, 0.05) 100%)",
          }}
        >
          <p className="have-questions-title">Start your Career in Financial Services today.</p>
          <p className="have-questions-subtitle mt-2">
            Request a callback and talk to our counsellors to know more
          </p>
          <button
            type="button"
            onClick={scrollToHero}
            className="have-questions-cta mt-6 cursor-pointer transition-opacity hover:opacity-95"
          >
            Request a callback
          </button>
        </div>
      </div>
    </section>
  );
}
