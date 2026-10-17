import { useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

// Six digit boxes: auto-advance, backspace, paste, one-time-code autofill.
// `status`: '' | 'error' | 'ok' drives the colour and the shake / pop.
export default function OtpInput({ value, onChange, status = '', shakeKey = 0, disabled = false }) {
  const refs = useRef([]);
  const reduce = useReducedMotion();
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || '');

  const setAt = (i, ch) => {
    const arr = digits.slice();
    arr[i] = ch;
    onChange(arr.join('').slice(0, 6));
  };

  function onInput(i, e) {
    const v = e.target.value.replace(/\D/g, '');
    if (!v) return setAt(i, '');
    if (v.length > 1) {
      // autofill / multi-digit input
      const next = (value.slice(0, i) + v).slice(0, 6);
      onChange(next);
      refs.current[Math.min(next.length, 5)]?.focus();
      return;
    }
    setAt(i, v);
    if (i < 5) refs.current[i + 1]?.focus();
  }

  function onKey(i, e) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      e.preventDefault();
      setAt(i - 1, '');
      refs.current[i - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && i > 0) refs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < 5) refs.current[i + 1]?.focus();
  }

  function onPaste(e) {
    const v = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6);
    if (!v) return;
    e.preventDefault();
    onChange(v);
    refs.current[Math.min(v.length, 5)]?.focus();
  }

  const ring = status === 'error' ? 'border-maroon-500 bg-maroon-500/5' : status === 'ok' ? 'border-green-600 bg-green-50' : null;

  return (
    <motion.div
      key={shakeKey}
      animate={status === 'error' && !reduce ? { x: [0, -9, 9, -7, 7, -3, 0] } : { x: 0 }}
      transition={{ duration: 0.45 }}
      className="flex justify-center gap-2 sm:gap-2.5"
      role="group"
      aria-label="6 अंकों का सत्यापन कोड"
    >
      {digits.map((d, i) => (
        <motion.input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          value={d}
          onChange={(e) => onInput(i, e)}
          onKeyDown={(e) => onKey(i, e)}
          onPaste={onPaste}
          disabled={disabled}
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={6}
          aria-label={`अंक ${i + 1}`}
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0, scale: d && !reduce ? [1, 1.1, 1] : 1 }}
          transition={{ delay: reduce ? 0 : i * 0.05, duration: 0.25 }}
          className={`h-14 w-11 rounded-xl border-2 text-center text-2xl font-medium text-maroon-700 outline-none transition sm:w-12 ${
            ring || (d ? 'border-gold-500 bg-ivory-50' : 'border-navy-900/15 bg-ivory-50')
          } focus:border-gold-500 focus:shadow-[0_0_0_4px_rgba(220,174,73,0.25)]`}
        />
      ))}
    </motion.div>
  );
}
