import React from "react";

const MESSAGE = "Admissions Open • Batch Starts on 1st December";
const REPEAT_COUNT = 8;

export default function AdmissionStrip() {
  const items = Array.from({ length: REPEAT_COUNT * 2 }, (_, i) => i);

  return (
    <div
      className="admission-strip"
      aria-label="Admissions announcement"
      role="region"
    >
      <p className="sr-only">{MESSAGE}</p>
      <div className="admission-strip__viewport">
        <div className="admission-strip__track">
          {items.map((i) => (
            <span key={i} className="admission-strip__item" aria-hidden="true">
              {MESSAGE}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
