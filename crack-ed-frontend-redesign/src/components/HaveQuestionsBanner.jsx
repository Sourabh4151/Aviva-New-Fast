import React from "react";

const FONT_MONTSERRAT =
  "Montserrat, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const FONT_POPPINS =
  "Poppins, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export default function HaveQuestionsBanner() {
  const scrollToCallbackForm = () => {
    if (typeof document === "undefined") return;
    const form = document.getElementById("callback-form");
    if (!form) return;

    const header = document.querySelector("header");
    const headerH = header ? Math.ceil(header.getBoundingClientRect().height) : 88;
    const gap = 16;
    const body = document.body;
    const html = document.documentElement;
    const scrollY = window.scrollY || html.scrollTop || body.scrollTop || 0;
    const top = Math.max(0, form.getBoundingClientRect().top + scrollY - headerH - gap);

    const scroller =
      body && body.scrollHeight > body.clientHeight + 1
        ? body
        : html.scrollHeight > html.clientHeight + 1
          ? html
          : document.scrollingElement || html;
    scroller.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <section className="relative bg-black text-white overflow-hidden">
      <div className="relative z-10 mx-auto px-section py-section lg:px-[120px] lg:py-20">
        <div className="mx-auto flex flex-col items-center justify-center text-center max-w-[1040px]">
          <div
            className="w-full rounded-[16px] flex flex-col items-center overflow-hidden px-6 sm:px-12 py-10"
            style={{
              gap: "30px",
              backgroundColor: "rgba(0, 0, 0, 1)",
              backgroundImage:
                "linear-gradient(180deg, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.02) 100%)",
            }}
          >
            <div className="flex flex-col items-center max-w-[542px] w-full gap-[9px]">
              <p
                className="text-center w-full"
                style={{
                  fontFamily: FONT_MONTSERRAT,
                  fontWeight: 500,
                  fontSize: "24px",
                  lineHeight: "27px",
                  letterSpacing: "0%",
                  color: "rgba(250, 250, 250, 1)",
                }}
              >
                Your first-job is waiting for you..
              </p>
              <p
                className="text-center w-full"
                style={{
                  fontFamily: FONT_POPPINS,
                  fontWeight: 400,
                  fontSize: "14px",
                  lineHeight: "21px",
                  letterSpacing: "0%",
                  color: "rgba(250, 250, 250, 0.6)",
                }}
              >
                Request a callback and talk to our counsellors to know more.
              </p>
            </div>

            <button
              type="button"
              onClick={scrollToCallbackForm}
              className="rounded-[10px] cursor-pointer hover:opacity-95 transition-opacity w-fit"
              style={{
                fontFamily: FONT_MONTSERRAT,
                fontWeight: 600,
                fontSize: "14px",
                lineHeight: "100%",
                letterSpacing: "0%",
                color: "rgba(250, 250, 250, 1)",
                padding: "14px 40px",
                backgroundColor: "rgba(59, 130, 246, 1)",
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

