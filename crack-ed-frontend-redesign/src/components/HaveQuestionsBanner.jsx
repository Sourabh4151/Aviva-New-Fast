import React from "react";

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
            className="w-full rounded-[16px] flex flex-col items-center"
            style={{
              padding: "40px 48px",
              gap: "30px",
              backgroundColor: "rgba(0, 0, 0, 1)",
              backgroundImage:
                "linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)",
            }}
          >
            <div className="flex flex-col items-center max-w-[542px] w-full gap-[9px]">
              <p
                className="text-center w-full"
                style={{
                  fontFamily:
                    "Montserrat, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontWeight: 500,
                  fontSize: "24px",
                  lineHeight: "27px",
                  letterSpacing: "0%",
                  color: "rgba(250, 250, 250, 1)",
                }}
              >
                Have Questions?
              </p>
              <p
                className="text-center w-full"
                style={{
                  fontFamily:
                    "Poppins, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                  fontWeight: 400,
                  fontSize: "14px",
                  lineHeight: "21px",
                  letterSpacing: "0%",
                  color: "rgba(250, 250, 250, 0.6)",
                }}
              >
                Request a callback and talk to our counsellors to know more
              </p>
            </div>

            <button
              type="button"
              onClick={scrollToHero}
              className="rounded-[10px] cursor-pointer hover:opacity-95 transition-opacity w-fit"
              style={{
                fontFamily:
                  "Montserrat, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontWeight: 600,
                fontSize: "14px",
                lineHeight: "100%",
                letterSpacing: "0%",
                color: "rgba(250, 250, 250, 1)",
                padding: "14px 40px",
                backgroundColor: "rgba(143, 40, 44, 1)",
              }}
            >
              Request a callback
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

