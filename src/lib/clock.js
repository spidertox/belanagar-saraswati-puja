// "Today" for the site, always in India time (IST), even if the visitor's
// phone/computer clock or time zone is wrong.
//
// How: one tiny HEAD request to this site's own server; the HTTP `Date`
// response header is the real time. We keep the difference between that and
// the device clock (offset). If the request fails we silently use the device
// clock. No third-party service is involved.
const TZ = 'Asia/Kolkata';
let offsetMs = 0;
let synced = false;

export async function syncClock() {
  if (synced) return offsetMs;
  try {
    const before = Date.now();
    const res = await fetch('/', { method: 'HEAD', cache: 'no-store' });
    const header = res.headers.get('date');
    const after = Date.now();
    if (header) {
      const server = new Date(header).getTime();
      if (Number.isFinite(server)) {
        offsetMs = server - (before + after) / 2; // account for network delay
        synced = true;
      }
    }
  } catch {
    // keep using the device clock
  }
  return offsetMs;
}

export const nowMs = () => Date.now() + offsetMs;

export function formatIndiaDate(ms = nowMs()) {
  return new Date(ms).toLocaleDateString('hi-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: TZ,
  });
}

// yyyy-mm-dd of "today" in IST
export function indiaDateKey(ms = nowMs()) {
  return new Date(ms).toLocaleDateString('en-CA', { timeZone: TZ });
}

// milliseconds until the next midnight in IST (IST has no daylight saving: UTC+5:30)
export function msUntilIndiaMidnight(ms = nowMs()) {
  const IST = 5.5 * 3600000;
  const day = 86400000;
  return day - (((ms + IST) % day) + day) % day;
}

// whole days from today (IST) to a target date-time; negative if past
export function daysUntil(targetIso, ms = nowMs()) {
  const IST = 5.5 * 3600000;
  const day = 86400000;
  const startOf = (t) => Math.floor((t + IST) / day);
  return startOf(new Date(targetIso).getTime()) - startOf(ms);
}
