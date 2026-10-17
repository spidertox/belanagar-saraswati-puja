import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// "Continue with Google / Microsoft": only the providers the server has keys for.
const GoogleIcon = () => (
  <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.1 5.5c4.2-3.9 7.2-9.6 7.2-16.9z" />
    <path fill="#FBBC05" d="M10.5 28.7c-.5-1.4-.8-2.9-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z" />
    <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.1-5.5c-2 1.4-4.6 2.3-8.8 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
  </svg>
);
const MicrosoftIcon = () => (
  <svg viewBox="0 0 23 23" className="h-5 w-5" aria-hidden="true">
    <path fill="#F25022" d="M1 1h10v10H1z" /><path fill="#7FBA00" d="M12 1h10v10H12z" />
    <path fill="#00A4EF" d="M1 12h10v10H1z" /><path fill="#FFB900" d="M12 12h10v10H12z" />
  </svg>
);

export default function SocialButtons({ verb = 'जारी रखें' }) {
  const [p, setP] = useState(null);
  useEffect(() => {
    let alive = true;
    fetch('/api/users/providers')
      .then((r) => r.json())
      .then((d) => alive && setP(d))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  if (!p || (!p.google && !p.microsoft)) return null;

  const btn = 'flex w-full items-center justify-center gap-3 rounded-xl border border-navy-900/15 bg-white px-4 py-2.5 text-sm font-medium text-navy-800 transition hover:border-gold-500 hover:shadow-md';
  return (
    <div className="space-y-3">
      {p.google ? (
        <motion.a whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} href="/api/users/oauth?provider=google" className={btn}>
          <GoogleIcon /> Google से {verb}
        </motion.a>
      ) : null}
      {p.microsoft ? (
        <motion.a whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} href="/api/users/oauth?provider=microsoft" className={btn}>
          <MicrosoftIcon /> Microsoft / Hotmail से {verb}
        </motion.a>
      ) : null}
      <div className="flex items-center gap-3 text-xs text-navy-400" aria-hidden="true">
        <span className="h-px flex-1 bg-navy-900/10" /> या ईमेल से <span className="h-px flex-1 bg-navy-900/10" />
      </div>
    </div>
  );
}
