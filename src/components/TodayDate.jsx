import { useEffect, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { festivalConfig } from '../config/festivalConfig.js';
import { daysUntil, formatIndiaDate, msUntilIndiaMidnight, nowMs, syncClock } from '../lib/clock.js';

// Shows today's real date (India time). It re-syncs with the server clock
// on load and updates by itself at midnight, and when the tab becomes
// visible again, so it is correct every day without a page refresh.
export default function TodayDate() {
  const [ms, setMs] = useState(() => nowMs());

  useEffect(() => {
    let timer;
    let alive = true;
    const refresh = () => alive && setMs(nowMs());
    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        refresh();
        schedule();
      }, msUntilIndiaMidnight() + 1000);
    };
    syncClock().then(() => {
      refresh();
      schedule();
    });
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        refresh();
        schedule();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      alive = false;
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  const target = festivalConfig.pujaDateTime;
  const left = target ? daysUntil(target, ms) : null;
  let note = '';
  if (left !== null) {
    if (left > 1) note = `पूजा में ${left} दिन बाकी`;
    else if (left === 1) note = 'पूजा कल है';
    else if (left === 0) note = 'आज सरस्वती पूजा है 🙏';
  }

  return (
    <div className="mx-auto mt-6 flex w-fit max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-full border border-gold-300/50 bg-ivory-50/90 px-5 py-2 text-sm text-navy-700 shadow-card">
      <CalendarDays className="h-4 w-4 flex-shrink-0 text-gold-500" aria-hidden="true" />
      <time dateTime={new Date(ms).toISOString()} className="devanagari-body font-medium">
        आज: {formatIndiaDate(ms)}
      </time>
      {note ? <span className="devanagari-body text-maroon-700">· {note}</span> : null}
    </div>
  );
}
