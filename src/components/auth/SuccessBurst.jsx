import { motion, useReducedMotion } from 'framer-motion';

// Sleek confirmation: ring draws, soft ripple pulses outward, tick draws.
export default function SuccessBurst() {
  const reduce = useReducedMotion();
  return (
    <div className="relative mx-auto h-24 w-24" aria-hidden="true">
      {reduce ? null : [0, 1].map((i) => (
        <motion.span key={i} className="absolute inset-0 rounded-full border-2 border-green-600"
          initial={{ scale: 0.8, opacity: 0.6 }} animate={{ scale: 1.9, opacity: 0 }} transition={{ delay: 0.5 + i * 0.25, duration: 1.2, ease: 'easeOut' }} />
      ))}
      <svg viewBox="0 0 96 96" className="relative h-24 w-24">
        <motion.circle cx="48" cy="48" r="42" fill="rgba(34,134,58,0.1)" stroke="#22863A" strokeWidth="4" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7, ease: 'easeInOut' }} style={{ transformOrigin: 'center', rotate: -90 }} />
        <motion.path d="M30 50 L43 63 L68 35" fill="none" stroke="#22863A" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.55, duration: 0.45, ease: 'easeOut' }} />
      </svg>
    </div>
  );
}
