import { useEffect, useState } from 'react';
import { festivalConfig } from '../config/festivalConfig.js';
import { PetalEdge } from './Decor.jsx';

function getTimeParts(targetTime) {
  const diff = targetTime - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function Countdown() {
  const target = festivalConfig.pujaDateTime ? new Date(festivalConfig.pujaDateTime).getTime() : null;
  const [parts, setParts] = useState(() => (target ? getTimeParts(target) : null));

  useEffect(() => {
    if (!target) return undefined;
    const id = setInterval(() => setParts(getTimeParts(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const units = parts
    ? [
        { label: 'दिन', value: parts.days },
        { label: 'घंटे', value: parts.hours },
        { label: 'मिनट', value: parts.minutes },
        { label: 'सेकंड', value: parts.seconds },
      ]
    : null;

  return (
    <section aria-label="पूजा की उलटी गिनती">
      {/* the petal edge uses the band's colour, so the band looks like it rises out of the pond */}
      <div className="-mb-px text-maroon-700" aria-hidden="true">
        <PetalEdge />
      </div>
      <div className="bg-maroon-700 pb-10 pt-6 text-ivory-100">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          {!target ? (
            <p className="devanagari-body py-2 text-lg">पूजा की तारीख जल्द घोषित की जाएगी।</p>
          ) : units ? (
            <>
              <p className="devanagari mb-5 text-lg text-basanti-300 sm:text-xl">सरस्वती पूजा प्रारंभ होने में</p>
              <div className="grid grid-cols-4 gap-2 sm:gap-4">
                {units.map((u) => (
                  <div key={u.label} className="rounded-2xl border border-gold-300/30 bg-maroon-900/40 py-3 sm:py-5">
                    <p className="font-display text-3xl font-medium tabular-nums text-basanti-300 sm:text-5xl">
                      {String(u.value).padStart(2, '0')}
                    </p>
                    <p className="devanagari-body mt-1 text-xs text-ivory-100/80 sm:text-sm">{u.label}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="devanagari py-2 text-xl">॥ सरस्वती पूजा प्रारंभ हो चुकी है ॥</p>
          )}
        </div>
      </div>
    </section>
  );
}
