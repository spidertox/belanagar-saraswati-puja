import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

// Full-screen photo viewer: arrows / swipe / Esc, caption and "3 / 12" counter.
export default function Lightbox({ items, index, onClose, onIndex }) {
  const open = index !== null && index >= 0 && index < items.length;
  const touchX = useRef(null);
  const closeBtn = useRef(null);
  const go = (d) => onIndex((index + d + items.length) % items.length);
  const goRef = useRef(go);
  goRef.current = go;
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const onKey = (e) => {
      if (e.key === 'Escape') closeRef.current();
      else if (e.key === 'ArrowLeft') goRef.current(-1);
      else if (e.key === 'ArrowRight') goRef.current(1);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    closeBtn.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previous?.focus?.();
    };
  }, [open]);

  // warm the neighbours so next/previous feel instant
  useEffect(() => {
    if (!open) return;
    [1, -1].forEach((d) => {
      const n = items[(index + d + items.length) % items.length];
      if (n) new Image().src = n.imageUrl;
    });
  }, [open, index, items]);

  if (!open || typeof document === 'undefined') return null;
  const item = items[index];
  const nav = 'absolute top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition duration-200 hover:scale-110 hover:bg-black/70';

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="तस्वीर देखें"
      className="no-print fixed inset-0 z-[95] flex flex-col items-center justify-center bg-black/90 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      }}
    >
      <button ref={closeBtn} type="button" onClick={onClose} aria-label="बंद करें" className="absolute right-3 top-3 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white transition duration-200 hover:bg-black/70">
        <X className="h-6 w-6" aria-hidden="true" />
      </button>
      {items.length > 1 ? (
        <>
          <button type="button" onClick={() => go(-1)} aria-label="पिछली तस्वीर" className={`${nav} left-2 sm:left-4`}><ChevronLeft className="h-6 w-6" aria-hidden="true" /></button>
          <button type="button" onClick={() => go(1)} aria-label="अगली तस्वीर" className={`${nav} right-2 sm:right-4`}><ChevronRight className="h-6 w-6" aria-hidden="true" /></button>
        </>
      ) : null}
      <img
        key={item.id}
        src={item.imageUrl}
        alt={item.caption || `बेलानगर सरस्वती पूजा की तस्वीर${item.category ? ` - ${item.category}` : ''}`}
        className="max-h-[78vh] max-w-full animate-riseIn rounded-lg object-contain"
      />
      <p className="mt-3 max-w-xl text-center text-sm text-white/90">
        {item.caption ? <span className="devanagari-body block">{item.caption}</span> : null}
        <span className="text-xs text-white/60">{index + 1} / {items.length}</span>
      </p>
    </div>,
    document.body
  );
}
