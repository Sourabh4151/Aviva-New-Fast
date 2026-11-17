import React from "react";

const REPEAT_COUNT = 8;

function scrollToApplyForm() {
  const form = document.getElementById("apply-now");
  if (!form) return;
  form.scrollIntoView({ behavior: "smooth", block: "center" });
  window.history.replaceState(null, "", "#apply-now");
  const field = form.querySelector("input, select, textarea");
  if (field) field.focus({ preventScroll: true });
}

export default function AdmissionStrip() {
  const items = Array.from({ length: REPEAT_COUNT * 2 }, (_, i) => i);

  return (
    <section
      className="admission-strip"
      aria-label="Admissions announcement"
    >
      <div className="admission-strip__viewport">
        <div className="admission-strip__track">
          {items.map((i) => (
            <span key={i} className="admission-strip__item" aria-hidden={i !== 0}>
              Batch Starts in November •{" "}
              <button
                type="button"
                className="admission-strip__link"
                tabIndex={i === 0 ? 0 : -1}
                onClick={scrollToApplyForm}
              >
                Register Now
              </button>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
