import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

// Appears after 300px of scrolling; scrolls smoothly (instantly if the visitor
// asked the system for reduced motion).
export default function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 300);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!show) return null;
  const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })}
      aria-label="ऊपर जाएं"
      className="no-print fixed bottom-24 right-4 z-40 rounded-full border border-gold-300/60 bg-ivory-50 p-3 text-maroon-700 shadow-lift transition duration-200 hover:scale-110 hover:bg-maroon-700 hover:text-ivory-50 sm:right-6"
    >
      <ArrowUp className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}
