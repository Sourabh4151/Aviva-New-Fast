const PROGRAM_NAME = "Talent Accelerator Program - Sales Executive";

export function trackGenerateLead() {
  if (typeof window.gtag !== "function") return;
  window.gtag("event", "generate_lead", {
    program_name: PROGRAM_NAME,
    page_type: "microsite",
  });
}
