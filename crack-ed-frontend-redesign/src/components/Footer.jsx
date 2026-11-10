import React from "react";

const policyLinks = [
  { label: "Refund Policy", href: "https://crack-ed.com/refund-policy" },
  { label: "Privacy Policy", href: "https://crack-ed.com/privacy-policy" },
  { label: "Terms & Conditions", href: "https://crack-ed.com/terms-conditions" },
];

export default function Footer() {
  return (
    <footer className="bg-[#fafafa]">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-6 py-12 sm:px-10 lg:px-[120px] lg:py-12">
        <div className="h-px w-full bg-[rgba(34,31,32,0.2)]" />
        <div className="flex flex-col gap-3 text-[12px] leading-6 text-[rgba(34,31,32,0.8)] lg:flex-row lg:items-center lg:justify-between">
          <p>© 2026 Crack-ED. All rights reserved.</p>
          <nav className="flex flex-col items-start gap-2 lg:flex-row lg:items-center lg:gap-8">
            {policyLinks.map((link) => (
              <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className="hover:text-[#97144d]">
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
