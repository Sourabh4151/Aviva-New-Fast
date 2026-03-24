import React, { useState, useRef, useEffect } from "react";

// Import assets so Vite bundles them and production URLs work (raw /src/assets/ paths 404 after build).
// Use desktop.jpg or aviva_ds_hero.jpg depending on which file you have in src/assets/.
// import heroImage from "../assets/desktop.jpg";
import heroImage from "../assets/desk.jpeg";
import tickSvg from "../assets/tick.svg";
import mahindraLogo from "../assets/mahindra_logo.png";

export default function Hero() {
  const [form, setForm] = useState({ name: "", email: "", city: "", mobile: "" });
  const [status, setStatus] = useState(null);
  const [errors, setErrors] = useState({});
  const [stateOpen, setStateOpen] = useState(false);
  const stateRef = useRef(null);
  const [showOtp, setShowOtp] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
  const otpRefs = useRef([]);
  const [showPopup, setShowPopup] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const otpValue = otpDigits.join("");

  const hasValidationError =
    Object.values(errors).some((val) => Boolean(val)) || Boolean(otpError);

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

  function setOtpDigit(index, value) {
    const digit = value.replace(/\D/g, "").slice(-1);
    setOtpError("");
    setOtpDigits((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });

    if (digit && index < otpRefs.current.length - 1) {
      const nextInput = otpRefs.current[index + 1];
      if (nextInput) {
        nextInput.focus();
      }
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }

  useEffect(() => {
    function onClickOutside(e) {
      if (stateRef.current && !stateRef.current.contains(e.target)) {
        setStateOpen(false);
      }
    }
    window.addEventListener("pointerdown", onClickOutside);
    return () => window.removeEventListener("pointerdown", onClickOutside);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    // client-side validation (same rules as original Reg.js)
    const { name, email, city, mobile } = form;
    const newErrors = {};
    if (!name || !name.trim()) newErrors.name = "Full name is required.";
    if (!city || !city.trim()) newErrors.city = "State is required.";
    if (!email || !email.trim()) newErrors.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Invalid email format.";
    if (!mobile || !mobile.trim()) newErrors.mobile = "Mobile number is required.";
    else if (!/^\d{10}$/.test(mobile)) newErrors.mobile = "Mobile must be 10 digits.";

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSendingOtp(true);
    setStatus({ type: "info", message: "Sending OTP..." });

    const baseUrl = import.meta.env.VITE_BASE_URL;
    if (!baseUrl) {
      setStatus({
        type: "error",
        message: "Service is temporarily unavailable. Please try again later.",
      });
      setIsSendingOtp(false);
      setShowOtp(false);
      return;
    }

    // extract UTM params from URL
    const urlParams = new URLSearchParams(window.location.search);
    const utm_source = urlParams.get("utm_source") || "";
    const utm_medium = urlParams.get("utm_medium") || "";
    const utm_campaign = urlParams.get("utm_campaign") || "";

    try {
      const res = await fetch(`${baseUrl}/auth/callbackOtp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          city,
          mobile,
          utm_source,
          utm_medium,
          utm_campaign,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        const alreadyInSystem = json.message && json.message.includes("already in our system");
        if (alreadyInSystem) {
          setStatus({ type: "success", message: json.message });
          setShowOtp(false);
        } else {
          setStatus(null);
          setOtpDigits(["", "", "", ""]);
          setShowOtp(true);
        }
      } else {
        setStatus({ type: "error", message: json.error || json.message || "Failed to send OTP" });
        setShowOtp(false);
      }
    } catch (err) {
      setStatus({ type: "error", message: friendlyBackendError(err) });
      setShowOtp(false);
    } finally {
      setIsSendingOtp(false);
    }
  }

  async function verifyOtp(e) {
    e.preventDefault();
    const { mobile } = form;
    if (!otpValue || !/^\d{4}$/.test(otpValue)) {
      setOtpError("OTP must be 4 digits.");
      return;
    }
    setOtpError("");
    setIsVerifyingOtp(true);
    setStatus({ type: "info", message: "Verifying OTP..." });

    const baseUrl = import.meta.env.VITE_BASE_URL;
    if (!baseUrl) {
      setStatus({
        type: "error",
        message: "Service is temporarily unavailable. Please try again later.",
      });
      setIsVerifyingOtp(false);
      setOtpError("Service is temporarily unavailable. Please try again later.");
      return;
    }
    try {
      const res = await fetch(`${baseUrl}/auth/callback/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, otp: otpValue }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus({ type: "success", message: json.message || "We will contact you soon." });
        setShowPopup(true);
        setShowOtp(false);
        setOtpDigits(["", "", "", ""]);
      } else {
        setStatus({ type: "error", message: json.message || json.error || "Invalid OTP" });
        setOtpError("Invalid OTP. Please enter the correct OTP.");
      }
    } catch (err) {
      const msg = friendlyBackendError(err);
      setStatus({ type: "error", message: msg });
      setOtpError(msg);
    } finally {
      setIsVerifyingOtp(false);
    }
  }

  function handleClosePopup() {
    setShowPopup(false);
    try {
      window.location.reload();
    } catch {
      // ignore if window not available
    }
  }

  const alreadyInSystem =
    status?.type === "success" &&
    status?.message &&
    status.message.includes("already in our system");

  return (
    <section id="hero" className="relative max-lg:bg-black">
      {/* Hero background: fixed height on all screens – does NOT grow. Form comes after on mobile. */}
      <div
        className="w-full min-h-[520px] sm:min-h-[600px] lg:h-[690px] bg-cover bg-no-repeat relative max-lg:bg-[10%_center] lg:bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
        role="img"
        aria-label="Aviva hero"
      >
        <div
          className="absolute inset-0"
          style={{
            zIndex: 10,
            background:
              "linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.8)), linear-gradient(to bottom, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0.5) 85%, rgba(0, 0, 0, 0.85) 95%, rgba(0, 0, 0, 1) 100%)",
          }}
        >
          <div className="absolute left-0 right-0 bottom-0 h-8 bg-black pointer-events-none" />
          <div className="hero-container relative">
            <div className="absolute left-[120px] top-[200px] w-[586px] max-w-[calc(100%-2rem)] text-white left-adjust hero-left-adjust">
              <div className="hero-logo-badge mb-3 md:mb-4">
                <img
                  src={mahindraLogo}
                  alt="Mahindra Finance"
                  className="block w-[197px] h-[55px] lg:w-[239px] lg:h-[38px] object-contain"
                />
                <div
                  className="hero-badge mt-4 md:mt-6 inline-flex items-center justify-center text-center text-[14px] leading-[100%] tracking-[0em] font-semibold text-white rounded-full border border-white px-4 py-2 max-lg:w-[292px] max-lg:h-[37px] max-lg:px-[10px] max-lg:py-[10px] max-lg:gap-[10px] max-lg:rounded-[100px] whitespace-nowrap"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  Mahindra Finance Prarambh Program
                </div>
              </div>
              <h1
                className="hero-title text-[40px] sm:text-[40px] md:text-[40px] lg:text-[48px] font-semibold leading-[100%] tracking-[0em] mb-3 md:mb-4"
                style={{ fontFamily: "Montserrat, sans-serif" }}
              >
              Business Executive
              </h1>
              <ul className="hero-bullet-list text-gray-200 space-y-3 sm:space-y-4 mb-4 md:mb-8">
                <li className="flex items-start gap-2 sm:gap-3">
                  <span className="hero-tick">
                    <img src={tickSvg} alt="tick" className="hero-tick-icon" />
                  </span>
                  <span
                    className="hero-subtitle text-[16px] max-lg:text-[14px] leading-[100%] max-lg:leading-[120%] font-normal tracking-[0em]"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    Join as a Business Executive (Vehicle Loan - Field Sales) with a CTC of Rs 3.5 LPA + incentives
                  </span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <span className="hero-tick">
                    <img src={tickSvg} alt="tick" className="hero-tick-icon" />
                  </span>
                  <span
                    className="text-[16px] leading-[100%] max-lg:leading-[120%] font-normal tracking-[0em] text-[rgba(250,250,250,1)]"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    1-Month Online program
                  </span>
                </li>
              </ul>
              <div className="register-btn-wrap mt-5 max-lg:mb-12">
                <button
                  type="button"
                  disabled
                  className="download-brochure-btn download-brochure-btn--unavailable"
                  aria-disabled="true"
                  title="Brochure download is currently unavailable"
                >
                  Download Brochure
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile highlight bar: appears above callback form */}
      <div className="w-full bg-[rgba(227,24,55,1)] flex justify-center lg:hidden mt-10">
        <div className="w-full max-w-[1280px] flex items-center justify-center py-2 px-6">
          <p
            className="text-[16px] leading-[24px] font-medium tracking-[0em] text-[rgba(250,250,250,1)] text-center"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Designed to Empower Women Candidates
          </p>
        </div>
      </div>

      {/* Request a Callback form: on mobile it sits below the hero (its own space); on desktop it overlays the hero on the right. z-30 ensures it stays above the hero gradient overlay (z-10) and navbar strip (z-20). */}
      <aside
        className={`hero-form-card max-lg:relative max-lg:mx-4 max-lg:mt-6 max-lg:max-w-[calc(100%-2rem)] lg:absolute lg:right-[120px] lg:top-[131px] lg:mt-0 lg:w-[373px] lg:z-30 w-full p-4 sm:p-6 lg:p-[24px_32px_28px_32px] rounded-2xl border border-[rgba(250,250,250,0.15)] flex flex-col justify-between min-h-0 ${
          alreadyInSystem || hasValidationError ? "lg:min-h-[520px]" : "lg:min-h-[471px]"
        }`}
        style={{
          backgroundColor: "rgba(23,2,5,1)",
        }}
      >
              <div>
                <h3 className="hero-form-title text-[18px] font-semibold mb-1">Request a Callback!</h3>
                <p className="hero-form-subtitle text-sm text-[rgba(250,250,250,0.6)] mb-3">Talk to our counsellors to know more</p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (showOtp) verifyOtp(e);
                    else handleSubmit(e);
                  }}
                  className="space-y-[13px]"
                >
                  {status?.message && !alreadyInSystem && status.type !== "info" && (
                    <div
                      className={`relative flex items-start gap-2 rounded-[10px] px-4 py-3 shadow-[0_10px_25px_rgba(0,0,0,0.35)] border ${
                        status.type === "error"
                          ? "border-[rgba(248,113,113,0.9)] bg-[rgba(127,29,29,0.98)]"
                          : status.type === "success"
                          ? "border-[rgba(34,197,94,0.35)] bg-gradient-to-r from-[rgba(34,197,94,0.18)] to-[rgba(34,197,94,0.06)]"
                          : "border-[rgba(59,130,246,0.35)] bg-gradient-to-r from-[rgba(59,130,246,0.18)] to-[rgba(59,130,246,0.06)]"
                      }`}
                      role={status.type === "error" ? "alert" : "status"}
                      aria-live="polite"
                    >
                      <p className="text-sm font-normal pr-6 flex-1 text-[rgba(250,250,250,0.92)]">
                        {status.message}
                      </p>
                      <button
                        type="button"
                        onClick={() => setStatus(null)}
                        className="absolute top-3 right-3 w-5 h-5 flex items-center justify-center rounded text-[rgba(250,250,250,0.75)] hover:bg-[rgba(0,0,0,0.35)] transition-colors"
                        aria-label="Dismiss"
                      >
                        <span className="text-lg leading-none">×</span>
                      </button>
                    </div>
                  )}
                  {alreadyInSystem && (
                    <div
                      className="relative flex items-start gap-2 rounded-[14px] px-4 py-3 shadow-[0_14px_40px_rgba(0,0,0,0.6)] border border-[rgba(245,158,11,0.9)] bg-gradient-to-r from-[rgba(120,53,15,0.98)] via-[rgba(180,83,9,0.98)] to-[rgba(234,179,8,0.95)]"
                      role="alert"
                    >
                      <p className="text-sm font-normal pr-6 flex-1 text-[rgba(250,250,250,0.92)]">
                        {status.message}
                      </p>
                      <button
                        type="button"
                        onClick={() => setStatus(null)}
                        className="absolute top-3 right-3 w-5 h-5 flex items-center justify-center rounded text-[rgba(240,185,11,0.9)] hover:bg-[rgba(0,0,0,0.35)] transition-colors"
                        aria-label="Dismiss"
                      >
                        <span className="text-lg leading-none">×</span>
                      </button>
                    </div>
                  )}
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Full Name"
                    className="callback-input w-full px-4 h-[50px] rounded-[10px] bg-transparent border border-[rgba(250,250,250,0.3)] outline-none focus:outline-none focus:ring-0 focus:border-[rgba(250,250,250,0.55)]"
                  />
                  {errors.name && (
                    <p className="mt-1 text-[12px] text-red-400">
                      {errors.name}
                    </p>
                  )}
                  <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="Email"
                    className="w-full px-4 h-[50px] rounded-[10px] bg-transparent border border-[rgba(250,250,250,0.3)] outline-none focus:outline-none focus:ring-0 focus:border-[rgba(250,250,250,0.55)] callback-input"
                  />
                  {errors.email && (
                    <p className="mt-1 text-[12px] text-red-400">
                      {errors.email}
                    </p>
                  )}
                  {/* Custom dropdown to ensure consistent styling across browsers */}
                  <div ref={stateRef} className="relative">
                    <div
                      tabIndex={0}
                      role="button"
                      aria-haspopup="listbox"
                      aria-expanded={stateOpen}
                      onClick={() => setStateOpen(!stateOpen)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setStateOpen(!stateOpen);
                        } else if (e.key === "Escape") {
                          setStateOpen(false);
                        }
                      }}
                      className="custom-select w-full px-4 h-[50px] rounded-[10px] bg-transparent border border-[rgba(250,250,250,0.3)] outline-none focus:outline-none focus:ring-0 focus:border-[rgba(250,250,250,0.55)] font-normal text-[14px] flex items-center justify-between cursor-pointer"
                    >
                      <span className={form.city ? "text-[14px] text-white" : "text-[14px] text-[rgba(250,250,250,0.6)]"}>
                        {form.city || "State"}
                      </span>
                      <svg className="h-4 w-4 text-[rgba(250,250,250,0.6)]" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                        <path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>

                    {stateOpen && (
                      <ul role="listbox" className="custom-options absolute z-50 mt-2 max-h-56 w-full overflow-auto rounded border border-[rgba(255,255,255,0.06)] bg-black/95 py-2">
                        {[
                          "Andhra Pradesh",
                          "Arunachal Pradesh",
                          "Assam",
                          "Bihar",
                          "Chhattisgarh",
                          "Goa",
                          "Gujarat",
                          "Haryana",
                          "Himachal Pradesh",
                          "Jharkhand",
                          "Karnataka",
                          "Kerala",
                          "Madhya Pradesh",
                          "Maharashtra",
                          "Manipur",
                          "Meghalaya",
                          "Mizoram",
                          "Nagaland",
                          "Odisha",
                          "Punjab",
                          "Rajasthan",
                          "Sikkim",
                          "Tamil Nadu",
                          "Telangana",
                          "Tripura",
                          "Uttar Pradesh",
                          "Uttarakhand",
                          "West Bengal",
                          "Andaman and Nicobar Islands",
                          "Chandigarh",
                          "Dadra and Nagar Haveli and Daman and Diu",
                          "Delhi",
                          "Jammu and Kashmir",
                          "Ladakh",
                          "Lakshadweep",
                          "Puducherry",
                        ].map((s) => (
                          <li
                            key={s}
                            role="option"
                            onClick={() => {
                              setForm({ ...form, city: s });
                              setErrors((prev) => ({ ...prev, city: "" }));
                              setStateOpen(false);
                            }}
                            className="px-4 py-2 text-[14px] text-white hover:bg-blue-600 hover:text-white cursor-pointer"
                          >
                            {s}
                          </li>
                        ))}
                      </ul>
                    )}
                    {errors.city && (
                      <p className="mt-1 text-[12px] text-red-400">
                        {errors.city}
                      </p>
                    )}
                  </div>
                  {!showOtp && (
                    <>
                      <input
                        name="mobile"
                        value={form.mobile}
                        onChange={handleChange}
                        required
                        placeholder="Mobile Number"
                        className="w-full px-4 h-[50px] rounded-[10px] bg-transparent border border-[rgba(250,250,250,0.3)] outline-none focus:outline-none focus:ring-0 focus:border-[rgba(250,250,250,0.55)] callback-input"
                      />
                      {errors.mobile && (
                        <p className="mt-1 text-[12px] text-red-400">
                          {errors.mobile}
                        </p>
                      )}
                      {!alreadyInSystem && (
                        <p className="hero-form-otp-text text-[12px] leading-[18px] font-normal text-[rgba(250,250,250,0.6)]">
                          You’ll receive an OTP on this number for verification
                        </p>
                      )}
                    </>
                  )}

                  {showOtp && (
                    <>
                      <p className="hero-form-otp-text text-[12px] leading-[18px] font-normal text-[rgba(250,250,250,0.6)]">
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
                                const prevInput = otpRefs.current[i - 1];
                                if (prevInput) {
                                  prevInput.focus();
                                }
                              }
                            }}
                            className="w-12 h-12 rounded-[10px] bg-transparent border border-[rgba(250,250,250,0.3)] outline-none focus:outline-none focus:ring-0 focus:border-[rgba(250,250,250,0.55)] text-center text-[18px] text-white callback-input"
                            aria-label={`OTP digit ${i + 1}`}
                          />
                        ))}
                      </div>
                      {otpError && (
                        <p className="mt-2 text-[12px] text-red-400">
                          {otpError}
                        </p>
                      )}
                    </>
                  )}
                </form>
              </div>

              <div className={`flex flex-col items-center pt-4 ${alreadyInSystem ? "pb-6" : "pb-1"}`}>
                <button
                  type="button"
                  onClick={(e) => (showOtp ? verifyOtp(e) : handleSubmit(e))}
                  className="h-[52px] w-[206px] rounded-[10px] bg-[rgba(227,24,55,1)] hover:bg-[rgba(159,17,38,1)] text-white text-[14px] font-medium tracking-[0.02em] shadow-[0_12px_30px_rgba(0,0,0,0.45)] transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                  disabled={isSendingOtp || isVerifyingOtp}
                >
                  {showOtp
                    ? isVerifyingOtp
                      ? "Verifying..."
                      : "Request a callback"
                    : isSendingOtp
                    ? "Sending OTP..."
                    : "Get OTP"}
                </button>
              </div>
            </aside>

      {/* Bottom highlight bar */}
      <div className="w-full bg-[rgba(227,24,55,1)] justify-center hidden lg:flex">
        <div className="w-full max-w-[1280px] flex items-center justify-center py-6 px-4">
          <p
            className="text-[24px] leading-[32px] font-medium tracking-[0em] text-[rgba(250,250,250,1)] text-center"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Designed to Empower Women Candidates
          </p>
        </div>
      </div>
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="relative w-[500px] max-w-[90vw] rounded-[26px] shadow-[0_22px_60px_rgba(0,0,0,0.9)] overflow-hidden border border-[rgba(250,250,250,0.18)] bg-gradient-to-b from-[rgba(23,23,23,0.98)] via-[rgba(6,6,6,1)] to-[rgba(23,23,23,0.98)]">
            <button
              type="button"
              onClick={handleClosePopup}
              className="absolute right-5 top-5 text-2xl leading-none text-[rgba(250,250,250,0.6)] hover:text-white"
              aria-label="Close"
            >
              ×
            </button>
            <div className="bg-gradient-to-b from-[rgba(250,250,250,0.06)] to-transparent px-10 pt-12 pb-6 flex justify-center">
              <div className="w-28 h-28 rounded-full bg-[rgba(0,0,0,0.85)] border border-[rgba(250,250,250,0.24)] shadow-[0_16px_40px_rgba(0,0,0,0.8)] flex items-center justify-center">
                <span className="text-5xl text-[#FACC15]">✓</span>
              </div>
            </div>
            <div className="px-10 pb-10 pt-3 text-center">
              <h2 className="text-2xl font-semibold mb-3 text-white">
                Thank you for reaching out!
              </h2>
              <p className="text-[15px] text-[rgba(250,250,250,0.72)] mb-7">
                We’ve received your request. Someone from our team will contact you shortly on your provided mobile number.
              </p>
              <button
                type="button"
                onClick={handleClosePopup}
                className="inline-flex items-center justify-center px-10 py-2.5 rounded-[999px] border border-[rgba(250,250,250,0.85)] bg-white/5 text-white text-sm font-medium hover:bg-white hover:text-black transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

