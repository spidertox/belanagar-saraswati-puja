import { useEffect, useRef } from 'react';
import { Loader2, AlertTriangle, WifiOff, Check } from 'lucide-react';
import { LotusBloom } from './Backdrop.jsx';

export function LoadingSpinner({ label = 'डेटा लोड हो रहा है...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-navy-500">
      <Loader2 className="h-7 w-7 animate-spin text-gold-500" aria-hidden="true" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function Skeleton({ className = '' }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-xl bg-navy-900/10 ${className}`} />;
}

// Placeholder rows shown while a list loads.
export function SkeletonList({ rows = 4, label = 'डेटा लोड हो रहा है...' }) {
  return (
    <div role="status" aria-busy="true" className="space-y-3 py-6">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-2xl border border-gold-300/30 bg-white p-4">
          <Skeleton className="h-12 w-12 flex-shrink-0 !rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Placeholder cards (photo + two lines) for gallery-like grids.
export function SkeletonGrid({ count = 6, label = 'डेटा लोड हो रहा है...' }) {
  return (
    <div role="status" aria-busy="true" className="grid grid-cols-2 gap-4 py-6 sm:grid-cols-3">
      <span className="sr-only">{label}</span>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="space-y-2 rounded-2xl border border-gold-300/30 bg-white p-3">
          <Skeleton className="aspect-square w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      ))}
    </div>
  );
}

// Green tick + message; calls onDone after `delay` ms (used to reset the form).
export function FormSuccess({ message, onDone, delay = 4000 }) {
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    const id = setTimeout(() => done.current?.(), delay);
    return () => clearTimeout(id);
  }, [delay]);
  return (
    <div role="status" className="flex animate-riseIn flex-col items-center gap-3 py-10 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/15 text-green-600">
        <Check className="h-8 w-8" strokeWidth={3} aria-hidden="true" />
      </span>
      <p className="devanagari-body max-w-xs text-sm text-navy-700">{message}</p>
    </div>
  );
}

export function ErrorState({
  message = 'डेटा लोड नहीं हो सका। कृपया कुछ देर बाद पुनः प्रयास करें।',
  onRetry,
  offline = false,
}) {
  const Icon = offline ? WifiOff : AlertTriangle;
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
      <Icon className="h-7 w-7 text-maroon-600" aria-hidden="true" />
      <p className="max-w-sm text-sm text-navy-700">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-full border border-maroon-600 px-4 py-1.5 text-sm font-medium text-maroon-700 transition hover:bg-maroon-600 hover:text-ivory-50"
        >
          पुनः प्रयास करें
        </button>
      ) : null}
    </div>
  );
}

export function EmptyState({ message = 'अभी कोई रिकॉर्ड उपलब्ध नहीं है।', icon: Icon }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center text-navy-500">
      {Icon ? (
        <Icon className="h-7 w-7 text-gold-400" aria-hidden="true" />
      ) : (
        <LotusBloom variant="line" className="h-14 w-auto text-gold-400" />
      )}
      <p className="max-w-sm text-sm">{message}</p>
    </div>
  );
}
