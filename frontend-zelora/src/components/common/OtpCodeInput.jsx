import { useRef } from 'react';

/**
 * 6-digit copy-pastable OTP box input supporting typing, pasting, backspace, and arrow navigation.
 */
export default function OtpCodeInput({
  value = '',
  onChange,
  disabled = false,
  idPrefix = 'otp-box',
  accentColor = 'var(--seller-gold, #B69A70)',
  borderColor = 'var(--seller-border, #e2d9cd)',
  textColor = 'var(--seller-espresso, #111111)',
}) {
  const inputRefs = useRef([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || '');

  const updateAt = (nextDigits) => {
    onChange(nextDigits.join('').slice(0, 6));
  };

  const handleChange = (index, raw) => {
    const clean = raw.replace(/\D/g, '');
    if (!clean) {
      const next = [...digits];
      next[index] = '';
      updateAt(next);
      return;
    }

    // Handle multi-digit input / autofill / paste fallback
    if (clean.length > 1) {
      const pasted = clean.slice(0, 6).split('');
      const next = Array.from({ length: 6 }, (_, i) => pasted[i] || '');
      updateAt(next);
      const focusIdx = Math.min(pasted.length, 5);
      inputRefs.current[focusIdx]?.focus();
      return;
    }

    const next = [...digits];
    next[index] = clean;
    updateAt(next);
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = Array.from({ length: 6 }, (_, i) => pasted[i] || '');
    updateAt(next);
    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const next = [...digits];
        next[index] = '';
        updateAt(next);
      } else if (index > 0) {
        const next = [...digits];
        next[index - 1] = '';
        updateAt(next);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
      {digits.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => {
            inputRefs.current[idx] = el;
          }}
          id={`${idPrefix}-${idx}`}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={idx === 0 ? 'one-time-code' : 'off'}
          maxLength={6}
          disabled={disabled}
          value={digit}
          onPaste={handlePaste}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onFocus={(e) => e.target.select()}
          onChange={(e) => handleChange(idx, e.target.value)}
          style={{
            width: '44px',
            height: '50px',
            textAlign: 'center',
            fontSize: '20px',
            fontWeight: 700,
            borderRadius: '8px',
            border: digit ? `1.5px solid ${accentColor}` : `1.5px solid ${borderColor}`,
            backgroundColor: '#ffffff',
            color: textColor,
            outline: 'none',
            transition: 'border-color 0.15s ease',
          }}
        />
      ))}
    </div>
  );
}

