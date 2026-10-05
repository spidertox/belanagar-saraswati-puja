// Hand-drawn two-tone icons for the festival highlight cards: kalash, aarti thali,
// laddu bowl, veena with a note, and water with a lotus. Original line-art drawn in
// code; the colour comes from the surrounding text colour (currentColor).
const base = {
  viewBox: '0 0 64 64',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: 'false',
};
const tone = { fill: 'currentColor', fillOpacity: 0.18 };

export function KalashIcon({ className = '' }) {
  return (
    <svg {...base} className={className}>
      <path d="M30 28C22 27 15 22 14 14C21 14 28 18 30 28Z" {...tone} />
      <path d="M34 28C42 27 49 22 50 14C43 14 36 18 34 28Z" {...tone} />
      <circle cx="32" cy="18" r="6.5" {...tone} />
      <path d="M29.5 16.5h.01M34.5 16.5h.01M32 20.5h.01" strokeWidth="2.4" />
      <rect x="24" y="28" width="16" height="4" rx="2" {...tone} />
      <path d="M25 32C17 36 15 45 21 51C24 54 40 54 43 51C49 45 47 36 39 32" {...tone} />
      <path d="M19 42C27 45 37 45 45 42" />
      <path d="M32 46.5l2 2.5-2 2.5-2-2.5Z" />
      <path d="M25 57H39" />
    </svg>
  );
}

export function AartiIcon({ className = '' }) {
  return (
    <svg {...base} className={className}>
      <path d="M32 11V16M22.5 17.5L25.5 20.5M41.5 17.5L38.5 20.5" />
      <path d="M32 20C26 28 27 37 32 37C37 37 38 28 32 20Z" {...tone} />
      <path d="M32 28C30 31.5 30.5 34.5 32 34.5C33.5 34.5 34 31.5 32 28Z" />
      <path d="M23 40C24 47 40 47 41 40Z" {...tone} />
      <path d="M15.5 34C12.5 38.5 13.2 42 15.5 42C17.8 42 18.5 38.5 15.5 34Z" {...tone} />
      <path d="M48.5 34C45.5 38.5 46.2 42 48.5 42C50.8 42 51.5 38.5 48.5 34Z" {...tone} />
      <path d="M11.5 43C12 46.5 19 46.5 19.5 43Z" />
      <path d="M44.5 43C45 46.5 52 46.5 52.5 43Z" />
      <ellipse cx="32" cy="50" rx="27" ry="7" {...tone} />
      <ellipse cx="32" cy="50" rx="19" ry="4" strokeWidth="1.2" />
    </svg>
  );
}

export function LadduIcon({ className = '' }) {
  return (
    <svg {...base} className={className}>
      <circle cx="21" cy="33.4" r="8.5" {...tone} />
      <circle cx="43" cy="33.4" r="8.5" {...tone} />
      <circle cx="32" cy="24.5" r="9" {...tone} />
      <path
        d="M17.5 31.5h.01M23.5 36h.01M20 38h.01M39.5 31h.01M45.5 35.5h.01M41 38.5h.01M28.5 22h.01M35.5 26.5h.01M33 20.5h.01"
        strokeWidth="2.2"
      />
      <path d="M9 42H55C55 52 46 58 32 58C18 58 9 52 9 42Z" {...tone} />
      <path d="M9 42H55" />
      <path d="M25 51C29 53.5 35 53.5 39 51" strokeWidth="1.4" />
    </svg>
  );
}

export function MusicIcon({ className = '' }) {
  return (
    <svg {...base} className={className}>
      <circle cx="41" cy="32" r="5" {...tone} />
      <circle cx="20" cy="45" r="11" {...tone} />
      <circle cx="20" cy="45" r="5" strokeWidth="1.2" />
      <path d="M26 35L30 39L53 16L49 12Z" {...tone} />
      <path d="M29 38L51 16" strokeWidth="0.9" />
      <path d="M51 14C55 9 60 11 59 16C58 19 54 19 55 16" />
      <circle cx="11" cy="19" r="3" fill="currentColor" />
      <path d="M14 19V8C17.5 9.5 19 11.5 19 14.5" />
    </svg>
  );
}

export function WavesIcon({ className = '' }) {
  return (
    <svg {...base} className={className}>
      <path d="M32 40C28 34 28 27 32 20C36 27 36 34 32 40Z" {...tone} />
      <path d="M30 40C23 38 19 33 19 26C25 27 29 32 30 40Z" {...tone} />
      <path d="M34 40C41 38 45 33 45 26C39 27 35 32 34 40Z" {...tone} />
      <path d="M6 46C11 42 16 42 21 46C26 50 31 50 36 46C41 42 46 42 51 46C54 48 56 48 58 47" />
      <path d="M6 54C11 50 16 50 21 54C26 58 31 58 36 54C41 50 46 50 51 54C54 56 56 56 58 55" />
    </svg>
  );
}

// Keys used by `highlights[].icon` in src/config/festivalConfig.js
export const HIGHLIGHT_ICONS = { kalash: KalashIcon, aarti: AartiIcon, laddu: LadduIcon, music: MusicIcon, waves: WavesIcon };
