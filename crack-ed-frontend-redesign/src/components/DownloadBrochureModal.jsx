import React, { useEffect, useRef, useState } from "react";

const BROCHURE_HREF = "/Banking%20Sales%20Program.pdf";
const BROCHURE_FILENAME = "Banking Sales Program.pdf";

function triggerBrochureDownload() {
  const link = document.createElement("a");
  link.href = BROCHURE_HREF;
  link.download = BROCHURE_FILENAME;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function friendlyBackendError(err) {
  const msg = (err && typeof err === "object" && "message" in err ? err.message : "") || "";
  const lowered = String(msg).toLowerCase();
  const backendDown =
    err?.name === "TypeError" ||
    lowered.includes("failed to fetch") ||
    lowered.includes("networkerror") ||
    lowered.includes("econnrefused") ||
    lowered.includes("load failed");

  if (backendDown) {
    return "Service is temporarily unavailable. Please try again in a moment.";
  }
  return msg || "Something went wrong. Please try again.";
}

function getUtmParams() {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    utm_source: urlParams.get("utm_source") || "",
    utm_medium: urlParams.get("utm_medium") || "",
    utm_campaign: urlParams.get("utm_campaign") || "",
    utm_term: urlParams.get("utm_term") || "",
  };
}

export default function DownloadBrochureModal({ isOpen, onClose }) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState("form");
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const otpRefs = useRef([]);

  const otpValue = otpDigits.join("");

  useEffect(() => {
    if (!isOpen) return;
    setName("");
    setMobile("");
    setErrors({});
    setStep("form");
    setOtpDigits(["", "", "", ""]);
    setOtpError("");
    setStatusMessage("");
    setIsSendingOtp(false);
    setIsSubmitting(false);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  function setOtpDigit(index, value) {
    const digit = value.replace(/\D/g, "").slice(-1);
    setOtpError("");
    setOtpDigits((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });

    if (digit && index < otpRefs.current.length - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  function validateForm() {
    const nextErrors = {};
    if (!name.trim()) nextErrors.name = "Full name is required.";
    if (!mobile.trim()) nextErrors.mobile = "Mobile number is required.";
    else if (!/^\d{10}$/.test(mobile)) nextErrors.mobile = "Mobile must be 10 digits.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleGetOtp(e) {
    e.preventDefault();
    if (!validateForm()) return;

    const baseUrl = import.meta.env.VITE_BASE_URL;
    if (!baseUrl) {
      setStatusMessage("Service is temporarily unavailable. Please try again later.");
      return;
    }

    setIsSendingOtp(true);
    setStatusMessage("");
    setOtpError("");

    try {
      const res = await fetch(`${baseUrl}/auth/brochureOtp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), mobile: mobile.trim(), ...getUtmParams() }),
      });
      const json = await res.json().catch(() => ({}));

      if (res.ok) {
        if (json.already_verified) {
          setStep("verified");
          setStatusMessage(
            json.message ||
              "Your mobile number is already verified. Your brochure is ready for download."
          );
        } else {
          setStep("otp");
          setOtpDigits(["", "", "", ""]);
        }
      } else {
        setStatusMessage(json.error || json.message || "Failed to send OTP");
      }
    } catch (err) {
      setStatusMessage(friendlyBackendError(err));
    } finally {
      setIsSendingOtp(false);
    }
  }

  async function handleVerifyAndDownload(e) {
    e.preventDefault();
    if (!/^\d{4}$/.test(otpValue)) {
      setOtpError("OTP must be 4 digits.");
      return;
    }

    const baseUrl = import.meta.env.VITE_BASE_URL;
    if (!baseUrl) {
      setOtpError("Service is temporarily unavailable. Please try again later.");
      return;
    }

    setIsSubmitting(true);
    setOtpError("");

    try {
      const res = await fetch(`${baseUrl}/auth/brochure/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          mobile: mobile.trim(),
          otp: otpValue,
        }),
      });
      const json = await res.json().catch(() => ({}));

      if (res.ok) {
        triggerBrochureDownload();
        onClose();
      } else {
        setOtpError(json.message || json.error || "Invalid OTP. Please enter the correct OTP.");
      }
    } catch (err) {
      setOtpError(friendlyBackendError(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDirectDownload(e) {
    e.preventDefault();
    if (!validateForm()) return;

    const baseUrl = import.meta.env.VITE_BASE_URL;
    if (!baseUrl) {
      setStatusMessage("Service is temporarily unavailable. Please try again later.");
      return;
    }

    setIsSubmitting(true);
    setStatusMessage("");

    try {
      const res = await fetch(`${baseUrl}/auth/brochure/download/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), mobile: mobile.trim(), ...getUtmParams() }),
      });
      const json = await res.json().catch(() => ({}));

      if (res.ok) {
        triggerBrochureDownload();
        onClose();
      } else {
        setStatusMessage(json.error || json.message || "Unable to start download. Please try again.");
      }
    } catch (err) {
      setStatusMessage(friendlyBackendError(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) return null;

  const primaryLabel =
    step === "verified"
      ? isSubmitting
        ? "Downloading..."
        : "Download Brochure"
      : step === "otp"
        ? isSubmitting
          ? "Verifying..."
          : "Download Brochure"
        : isSendingOtp
          ? "Sending OTP..."
          : "Get OTP";

  const primaryHandler =
    step === "verified"
      ? handleDirectDownload
      : step === "otp"
        ? handleVerifyAndDownload
        : handleGetOtp;

  const primaryDisabled = isSendingOtp || isSubmitting;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="brochure-modal-card relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="brochure-modal-title"
      >
        <div className="brochure-modal-header">
          <h2 id="brochure-modal-title" className="brochure-modal-title">
            Download Brochure
          </h2>
          <p className="brochure-modal-subtitle">
            Fill in your details to download the complete program brochure.
          </p>
        </div>

        <form onSubmit={primaryHandler} className="brochure-modal-form">
          {statusMessage && step !== "verified" && (
            <p className="text-sm text-red-400" role="alert">
              {statusMessage}
            </p>
          )}

          <div className="brochure-modal-fields">
            <input
              name="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
              }}
              placeholder="Full Name"
              className="callback-input w-full px-4 h-[50px] rounded-[10px] bg-transparent border border-[rgba(250,250,250,0.3)] outline-none focus:outline-none focus:ring-0 focus:border-[rgba(250,250,250,0.55)]"
            />
            {errors.name && <p className="text-[12px] text-red-400">{errors.name}</p>}

            <input
              name="mobile"
              value={mobile}
              onChange={(e) => {
                setMobile(e.target.value.replace(/\D/g, "").slice(0, 10));
                if (errors.mobile) setErrors((prev) => ({ ...prev, mobile: "" }));
              }}
              placeholder="Mobile Number"
              inputMode="numeric"
              className="callback-input w-full px-4 h-[50px] rounded-[10px] bg-transparent border border-[rgba(250,250,250,0.3)] outline-none focus:outline-none focus:ring-0 focus:border-[rgba(250,250,250,0.55)]"
            />
            {errors.mobile && <p className="text-[12px] text-red-400">{errors.mobile}</p>}

            {step === "form" && (
              <p className="brochure-modal-helper">
                You&apos;ll receive an OTP on this number for verification
              </p>
            )}

            {step === "verified" && (
              <p className="brochure-modal-helper">
                {statusMessage ||
                  "Your mobile number is already verified. Your brochure is ready for download."}
              </p>
            )}

            {step === "otp" && (
              <div className="flex flex-col gap-[13px]">
                <p className="brochure-modal-helper">
                  Enter OTP sent to your mobile number
                </p>
                <div className="flex gap-2">
                  {[0, 1, 2, 3].map((i) => (
                    <input
                      key={i}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={otpDigits[i]}
                      ref={(el) => {
                        otpRefs.current[i] = el;
                      }}
                      onChange={(e) => setOtpDigit(i, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !otpDigits[i] && i > 0) {
                          otpRefs.current[i - 1]?.focus();
                        }
                      }}
                      className="w-12 h-12 rounded-[10px] bg-transparent border border-[rgba(250,250,250,0.3)] outline-none focus:outline-none focus:ring-0 focus:border-[rgba(250,250,250,0.55)] text-center text-[18px] text-white callback-input"
                      aria-label={`OTP digit ${i + 1}`}
                    />
                  ))}
                </div>
                {otpError && (
                  <p className="text-[12px] text-red-400" role="alert">
                    {otpError}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="brochure-modal-btn-wrap">
            <button
              type="submit"
              disabled={primaryDisabled}
              className="otp-btn h-[52px] w-[206px] shadow-[0_12px_30px_rgba(0,0,0,0.45)] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {primaryLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
