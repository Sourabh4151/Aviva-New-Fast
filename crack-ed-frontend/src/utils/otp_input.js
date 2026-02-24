import React, { useRef, useEffect } from 'react';
import '../styles/otpInput.css';

const OtpInput = ({ length = 3, onChange }) => {
  const inputRefs = useRef([]);

  const handleChange = (e, idx) => {
    const val = e.target.value;
  
    // Allow only digits (0-9)
    if (!/^\d?$/.test(val)) return;
  
    const ref = inputRefs.current[idx];
    if (ref?.current) {
      ref.current.value = val;
  
      const otp = inputRefs.current.map(r => r.current?.value || '').join('');
      if (onChange) onChange(otp);
  
      // Auto-focus next input if value entered
      if (val && idx < length - 1) {
        inputRefs.current[idx + 1]?.current?.focus();
      }
    }
  };
  
  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace') {
      const ref = inputRefs.current[idx];
      if (ref?.current?.value === '' && idx > 0) {
        inputRefs.current[idx - 1]?.current?.focus();
      }
    }
  };
  
  useEffect(() => {
    inputRefs.current = Array(length)
      .fill()
      .map((_, i) => inputRefs.current[i] || React.createRef());
  }, [length]);
  

  return (
    <div className="otp-input-wrapper">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={inputRefs.current[i]}
          type="text"
          
          maxLength="1"
          className="otp-box"
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
        />
      ))}
    </div>
  );
};

export default OtpInput;
