import { Children } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import AuthArt from './AuthArt.jsx';

// Two-panel layout (Figma "User / Login"): cosmic mandala on the left
// (desktop only), glass form card on the right.
const container = { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } } };
const item = { hidden: { opacity: 0, y: 16, filter: 'blur(6px)' }, show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } };

export function Stagger({ children, className = '' }) {
  const reduce = useReducedMotion();
  return (
    <motion.div variants={reduce ? undefined : container} initial="hidden" animate="show" className={className}>
      {Children.map(children, (c) => (c ? <motion.div variants={reduce ? undefined : item}>{c}</motion.div> : null))}
    </motion.div>
  );
}

// Headline whose words slide up out of a mask, one after another.
function Reveal({ text, className }) {
  const reduce = useReducedMotion();
  return (
    <p className={className} aria-label={text}>
      {text.split(' ').map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom" aria-hidden="true">
          <motion.span className="inline-block pr-[0.28em]" initial={reduce ? false : { y: '110%' }} animate={{ y: 0 }} transition={{ duration: 0.7, delay: 0.25 + i * 0.09, ease: [0.22, 1, 0.36, 1] }}>
            {w}
          </motion.span>
        </span>
      ))}
    </p>
  );
}

export default function AuthShell({ title, subtitle, children }) {
  const reduce = useReducedMotion();
  return (
    <div className="grid min-h-[calc(100vh-4rem)] overflow-hidden bg-ivory-50 md:grid-cols-2">
      <div className="relative hidden bg-[#3A0C19] md:block">
        <AuthArt />
        <div className="pointer-events-none relative z-10 px-12 pt-16">
          <Reveal text={title} className="devanagari text-4xl leading-tight text-ivory-50" />
          <motion.p initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1, duration: 0.8 }} className="devanagari-body mt-3 max-w-xs text-sm text-gold-300">
            {subtitle}
          </motion.p>
        </div>
      </div>

      <div className="relative flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_70%_20%,rgba(220,174,73,0.14),transparent)]" aria-hidden="true" />
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 28, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-md rounded-3xl border border-white/60 bg-white/85 p-6 shadow-[0_24px_60px_-20px_rgba(92,20,39,0.35)] backdrop-blur sm:p-8"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
