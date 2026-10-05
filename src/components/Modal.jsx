import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }) {
  useEffect(() => {
    if (!open) return undefined;
    function onKey(e) {
      if (e.key === 'Escape') onClose?.();
    }
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-navy-900/50 p-0 sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose?.();
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={`max-h-[90vh] w-full ${maxWidth} overflow-y-auto rounded-t-2xl bg-ivory-50 p-5 shadow-lift sm:rounded-2xl sm:p-6`}
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              {title ? <h3 className="devanagari text-xl text-maroon-700">{title}</h3> : <span />}
              <button
                type="button"
                onClick={onClose}
                aria-label="बंद करें"
                className="rounded-full p-1.5 text-navy-500 transition hover:bg-navy-900/5 hover:text-navy-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'पुष्टि करें',
  message,
  confirmLabel = 'Delete',
  danger = true,
  loading = false,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-sm">
      <p className="text-sm text-navy-700">{message}</p>
      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-navy-900/15 px-4 py-2 text-sm font-medium text-navy-700 transition hover:bg-navy-900/5"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={`rounded-full px-4 py-2 text-sm font-medium text-ivory-50 transition disabled:opacity-60 ${
            danger ? 'bg-maroon-600 hover:bg-maroon-700' : 'bg-gold-500 hover:bg-gold-600'
          }`}
        >
          {loading ? 'हो रहा है...' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
