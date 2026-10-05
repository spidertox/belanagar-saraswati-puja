import { Loader2, AlertTriangle, WifiOff } from 'lucide-react';
import { LotusBloom } from './Backdrop.jsx';

export function LoadingSpinner({ label = 'डेटा लोड हो रहा है...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-navy-500">
      <Loader2 className="h-7 w-7 animate-spin text-gold-500" aria-hidden="true" />
      <p className="text-sm">{label}</p>
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
