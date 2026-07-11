import React, { useState, useRef, useEffect } from "react";

// Import assets so Vite bundles them and production URLs work (raw /src/assets/ paths 404 after build).
// Use desktop.jpg or aviva_ds_hero.jpg depending on which file you have in src/assets/.
// import heroImage from "../assets/desktop.jpg";
import heroImage from "../assets/desk.png";
import tickSvg from "../assets/tick.svg";
import crackedLogo from "../assets/crack-ed.svg";

import stateCities from "../data/indian_state_cities.json";

const INDIAN_STATES = Object.keys(stateCities).sort((a, b) => a.localeCompare(b));
const MAX_FILTERED_OPTIONS = 100;

function filterByQuery(options, query) {
  const q = (query || "").trim().toLowerCase();
  if (!q) return options;
  return options.filter((item) => item.toLowerCase().startsWith(q));
}

export default function Hero() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    state: "",
    city: "",
    mobile: "",
  });
  const [status, setStatus] = useState(null);
  const [errors, setErrors] = useState({});
  const [stateOpen, setStateOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [stateQuery, setStateQuery] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [cityHintActive, setCityHintActive] = useState(false);
  const stateRef = useRef(null);
  const cityRef = useRef(null);
  const [showOtp, setShowOtp] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
  const otpRefs = useRef([]);
  const [showPopup, setShowPopup] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const otpValue = otpDigits.join("");
  function trackPixelEvent(eventName, params) {
    try {
      if (typeof window !== "undefined" && typeof window.fbq === "function") {
        if (params && Object.keys(params).length) {
          window.fbq("track", eventName, params);
        } else {
          window.fbq("track", eventName);
        }
      }
    } catch (_) {
    }
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

  const matchedState = INDIAN_STATES.find(
    (s) => s.toLowerCase() === (form.state || "").trim().toLowerCase()
  );
  const citiesForState = matchedState
    ? [...(stateCities[matchedState] || [])].sort((a, b) => a.localeCompare(b))
    : [];
  const filteredStates = filterByQuery(INDIAN_STATES, stateOpen ? stateQuery : form.state).slice(
    0,
    MAX_FILTERED_OPTIONS
  );
  const filteredCities = filterByQuery(citiesForState, cityOpen ? cityQuery : form.city).slice(
    0,
    MAX_FILTERED_OPTIONS
  );

  useEffect(() => {
    function onClickOutside(e) {
      if (stateRef.current && !stateRef.current.contains(e.target)) {
        setStateOpen(false);
      }
      if (cityRef.current && !cityRef.current.contains(e.target)) {
        setCityOpen(false);
      }
    }
    window.addEventListener("pointerdown", onClickOutside);
    return () => window.removeEventListener("pointerdown", onClickOutside);
  }, []);

  useEffect(() => {
    if (matchedState) setCityHintActive(false);
  }, [matchedState]);

  async function handleSubmit(e) {
    e.preventDefault();
    const { name, email, state, city, mobile } = form;
    const newErrors = {};
    if (!name || !name.trim()) newErrors.name = "Full name is required.";
    const stateMatch = INDIAN_STATES.find(
      (s) => s.toLowerCase() === (state || "").trim().toLowerCase()
    );
    if (!state || !state.trim()) newErrors.state = "State is required.";
    else if (!stateMatch) newErrors.state = "Please select a valid state from the list.";
    const cityList = stateMatch ? stateCities[stateMatch] || [] : [];
    const cityMatch = cityList.find((c) => c.toLowerCase() === (city || "").trim().toLowerCase());
    if (!city || !city.trim()) newErrors.city = "City is required.";
    else if (!cityMatch) newErrors.city = "Please select a valid city from the list.";
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
          state: stateMatch || state,
          city: cityMatch || city,
          mobile,
          utm_source,
          utm_medium,
          utm_campaign,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        const alreadyInSystem = json.message && json.message.includes("already in our system");
        trackPixelEvent("CompleteRegistration", {
          content_name: "NCP Partner",
          status: alreadyInSystem ? "already_registered" : "otp_sent",
        });
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
        trackPixelEvent("Lead", {
          content_name: "NCP Partner",
        });
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
        className="hero-background w-full min-h-[730px] sm:min-h-[770px] lg:h-[690px] relative overflow-hidden"
        role="img"
        aria-label="Aviva hero"
      >
        <img
          src={heroImage}
          alt=""
          aria-hidden="true"
          className="hero-background-image"
        />
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
            <div className="absolute left-[120px] max-w-[773px] text-white left-adjust hero-left-adjust">
              <img
                src={crackedLogo}
                alt="CRACK-ED"
                className="hero-logo-badge"
              />
              <div className="hero-heading-block">
                <h1 className="hero-title">క్రాక్-ఎడ్ భాగస్వామిగా చేరండి</h1>
                <p className="hero-tagline">
                ప్రతి విద్యార్థి అడ్మిషన్‌పై ఆదాయం పొందండి. ఎలాంటి ముందస్తు పెట్టుబడి అవసరం లేదు.
                </p>
              </div>
              <ul className="hero-bullet-list space-y-3">
                <li className="flex items-start gap-2 sm:gap-3">
                  <img src={tickSvg} alt="" aria-hidden="true" className="hero-tick-icon" />
                  <span className="hero-bullet-text">
                  ప్రతి అడ్మిషన్‌పై గరిష్టంగా 12% వరకు కమిషన్ పొందండి
                  </span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <img src={tickSvg} alt="" aria-hidden="true" className="hero-tick-icon" />
                  <span className="hero-bullet-text">
                  విద్యార్థులకు ఉద్యోగ ఆధారిత కోర్సులను సూచించి అదనపు ఆదాయం సంపాదించండి
                  </span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <img src={tickSvg} alt="" aria-hidden="true" className="hero-tick-icon" />
                  <span className="hero-bullet-text">
                  10,000కు పైగా వెండర్ భాగస్వాముల నెట్‌వర్క్‌లో చేరి నెలకు ₹1.17 లక్షల వరకు సంపాదించండి.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Request a Callback form: on mobile it sits below the hero (its own space); on desktop it overlays the hero on the right. z-30 ensures it stays above the hero gradient overlay (z-10) and navbar strip (z-20). */}
      <aside
        className="hero-form-card max-lg:relative max-lg:mx-4 max-lg:mt-12 max-lg:mb-16 max-lg:max-w-[calc(100%-2rem)] lg:absolute lg:right-[120px] lg:top-[35px] lg:mt-0 lg:w-[439px] lg:z-30 w-full p-4 sm:p-6 lg:p-[24px_32px_28px_32px] rounded-2xl flex flex-col gap-4 min-h-0 h-fit"
        style={{
          backgroundColor: "rgba(26, 158, 183, 1)",
        }}
      >
        <div>
          <h3 className="hero-form-title text-[18px] font-semibold mb-1">ఈరోజే సంపాదించడం ప్రారంభించండి!</h3>
          <p className="hero-form-subtitle text-sm mb-3">పరిమిత స్థానాలు మాత్రమే అందుబాటులో ఉన్నాయి. ఈరోజే మా భాగస్వాముల నెట్‌వర్క్‌లో చేరండి.</p>
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
                className={`relative flex items-start gap-2 rounded-[10px] px-4 py-3 shadow-[0_10px_25px_rgba(0,0,0,0.35)] border ${status.type === "error"
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
                className="relative flex items-start gap-2 rounded-[14px] px-4 py-3 shadow-[0_14px_40px_rgba(0,0,0,0.6)] border border-[rgba(227,24,55,0.6)] bg-gradient-to-r from-[rgba(227,24,55,0.22)] to-[rgba(227,24,55,0.08)]"
                role="alert"
              >
                <p className="text-sm font-normal pr-6 flex-1 text-[rgba(250,250,250,0.92)]">
                  {status.message}
                </p>
                <button
                  type="button"
                  onClick={() => setStatus(null)}
                  className="absolute top-3 right-3 w-5 h-5 flex items-center justify-center rounded text-[rgba(250,250,250,0.85)] hover:bg-[rgba(0,0,0,0.35)] transition-colors"
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
              className="hero-form-field callback-input"
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
              className="hero-form-field callback-input"
            />
            {errors.email && (
              <p className="mt-1 text-[12px] text-red-400">
                {errors.email}
              </p>
            )}
            <div ref={stateRef} className="relative w-full">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="State"
                    value={stateOpen ? stateQuery : form.state}
                    onChange={(e) => {
                      const value = e.target.value;
                      setStateQuery(value);
                      setStateOpen(true);
                      setForm((prev) => ({
                        ...prev,
                        state: value,
                        city: prev.state === value ? prev.city : "",
                      }));
                      if (errors.state) setErrors((prev) => ({ ...prev, state: "" }));
                    }}
                    onFocus={() => {
                      setStateQuery(form.state);
                      setStateOpen(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") setStateOpen(false);
                    }}
                    autoComplete="off"
                    aria-autocomplete="list"
                    aria-expanded={stateOpen}
                    aria-haspopup="listbox"
                    className="hero-form-field hero-form-field--select custom-select"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label="Toggle state list"
                    onClick={() => {
                      setStateQuery(form.state);
                      setStateOpen((open) => !open);
                    }}
                    className="hero-form-chevron absolute right-3 flex h-6 w-6 items-center justify-center"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                      <path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>

                {stateOpen && (
                  <ul role="listbox" className="custom-options absolute z-50 mt-2 max-h-56 w-full overflow-auto rounded border border-[rgba(3,15,25,0.2)] bg-white py-2 shadow-lg">
                    {filteredStates.length > 0 ? (
                      filteredStates.map((s) => (
                        <li
                          key={s}
                          role="option"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setForm({ ...form, state: s, city: "" });
                            setStateQuery(s);
                            setCityQuery("");
                            setErrors((prev) => ({ ...prev, state: "", city: "" }));
                            setStateOpen(false);
                            setCityOpen(false);
                          }}
                          className="px-4 py-2 text-[14px] text-[rgba(3,15,25,1)] hover:bg-[rgba(26,158,183,0.15)] cursor-pointer"
                        >
                          {s}
                        </li>
                      ))
                    ) : (
                      <li className="px-4 py-2 text-[14px] text-[rgba(3,15,25,1)]">
                        No matching states
                      </li>
                    )}
                  </ul>
                )}
                {errors.state && (
                  <p className="mt-1 text-[12px] text-red-400">
                    {errors.state}
                  </p>
                )}
            </div>
            <div ref={cityRef} className="relative w-full">
                <div
                  className={`relative flex items-center ${!matchedState ? "opacity-50" : ""}`}
                  onMouseEnter={() => {
                    if (!matchedState) setCityHintActive(true);
                  }}
                  onMouseLeave={() => {
                    if (!matchedState) setCityHintActive(false);
                  }}
                  onMouseDown={() => {
                    if (!matchedState) setCityHintActive(true);
                  }}
                >
                  <input
                    type="text"
                    placeholder={
                      matchedState ? "City" : cityHintActive ? "Select State First" : "City"
                    }
                    disabled={!matchedState}
                    value={cityOpen ? cityQuery : form.city}
                    onChange={(e) => {
                      if (!matchedState) return;
                      const value = e.target.value;
                      setCityQuery(value);
                      setCityOpen(true);
                      setForm({ ...form, city: value });
                      if (errors.city) setErrors((prev) => ({ ...prev, city: "" }));
                    }}
                    onFocus={() => {
                      if (!matchedState) return;
                      setCityQuery(form.city);
                      setCityOpen(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") setCityOpen(false);
                    }}
                    autoComplete="off"
                    aria-autocomplete="list"
                    aria-expanded={cityOpen}
                    aria-haspopup="listbox"
                    className="hero-form-field hero-form-field--select custom-select disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    disabled={!matchedState}
                    aria-label="Toggle city list"
                    onClick={() => {
                      if (!matchedState) return;
                      setCityQuery(form.city);
                      setCityOpen((open) => !open);
                    }}
                    className="hero-form-chevron absolute right-3 flex h-6 w-6 items-center justify-center disabled:cursor-not-allowed"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                      <path
                        d="M6 8L10 12L14 8"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>

                {cityOpen && matchedState && (
                  <ul
                    role="listbox"
                    className="custom-options absolute z-50 mt-2 max-h-56 w-full overflow-auto rounded border border-[rgba(3,15,25,0.2)] bg-white py-2 shadow-lg"
                  >
                    {filteredCities.length > 0 ? (
                      filteredCities.map((c) => (
                        <li
                          key={c}
                          role="option"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setForm({ ...form, city: c });
                            setCityQuery(c);
                            setErrors((prev) => ({ ...prev, city: "" }));
                            setCityOpen(false);
                          }}
                          className="px-4 py-2 text-[14px] text-[rgba(3,15,25,1)] hover:bg-[rgba(26,158,183,0.15)] cursor-pointer"
                        >
                          {c}
                        </li>
                      ))
                    ) : (
                      <li className="px-4 py-2 text-[14px] text-[rgba(3,15,25,1)]">
                        No matching cities
                      </li>
                    )}
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
                  className="hero-form-field callback-input"
                />
                {errors.mobile && (
                  <p className="mt-1 text-[12px] text-red-400">
                    {errors.mobile}
                  </p>
                )}
                {!alreadyInSystem && (
                  <p className="hero-form-otp-text text-[12px] leading-[18px] font-normal">
                    ధృవీకరణ కోసం ఈ నంబర్‌కు ఒక OTP పంపబడుతుంది.
                  </p>
                )}
              </>
            )}

            {showOtp && (
              <>
                <p className="hero-form-otp-text text-[12px] leading-[18px] font-normal">
                  Enter OTP sent to your mobile number
                </p>
                <div className="flex w-full gap-3">
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
                      className="hero-form-field callback-input min-w-0 flex-1 text-center text-[18px]"
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
            <div
              className={`flex flex-col items-center ${showOtp ? "pt-1" : "pt-2"} ${alreadyInSystem ? "pb-2" : ""}`}
            >
              <button
                type="button"
                onClick={(e) => (showOtp ? verifyOtp(e) : handleSubmit(e))}
                className="hero-get-otp-btn h-[52px] w-[206px] rounded-[10px] text-white text-[14px] font-medium tracking-[0.02em] shadow-[0_12px_30px_rgba(0,0,0,0.45)]"
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
          </form>
        </div>
      </aside>

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

