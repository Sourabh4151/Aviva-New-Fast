import React from "react";

const MESSAGE = "Admissions Open • New Batch Starts in June";
const REPEAT_COUNT = 8;

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
            <span key={i} className="admission-strip__item" aria-hidden="true">
              {MESSAGE}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
