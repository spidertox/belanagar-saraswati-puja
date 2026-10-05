// Original, simple line-art motifs used throughout the site (never a photo
// or reproduction of existing religious art) plus the shared section
// heading treatment.

import { useId } from 'react';
import { festivalConfig } from '../config/festivalConfig.js';
import { LotusBloom } from './Backdrop.jsx';

export function LotusIcon({ className = 'w-8 h-8', color = 'currentColor' }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <path
        d="M24 40c-8-3-13-10-13-18 5 2 9 6 10 12 1-9-2-16-8-21 8 0 13 5 15 12 2-7 7-12 15-12-6 5-9 12-8 21 1-6 5-10 10-12 0 8-5 15-13 18"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="34" r="2.4" fill={color} />
    </svg>
  );
}

export function DiyaIcon({ className = 'w-8 h-8', color = 'currentColor' }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <path d="M6 28c0 6 8 10 18 10s18-4 18-10" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M6 28c0-3 8-5 18-5s18 2 18 5" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M24 21c-3-4-2-8 1-11 2 4 4 6 3 10-1 2-2 2-4 1Z" fill={color} />
    </svg>
  );
}

export function VeenaIcon({ className = 'w-8 h-8', color = 'currentColor' }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <ellipse cx="14" cy="34" rx="7" ry="5" stroke={color} strokeWidth="1.6" />
      <ellipse cx="38" cy="14" rx="5" ry="3.6" stroke={color} strokeWidth="1.6" />
      <path d="M17 30 L36 16" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M17 33 L37 18" stroke={color} strokeWidth="1.1" strokeLinecap="round" />
      <path d="M13 30 L13 38 M17 29 L17 39" stroke={color} strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

export function BookIcon({ className = 'w-8 h-8', color = 'currentColor' }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <path
        d="M24 14c-4-3-10-4-15-3v22c5-1 11 0 15 3 4-3 10-4 15-3V11c-5-1-11 0-15 3Z"
        stroke={color}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M24 14v22" stroke={color} strokeWidth="1.6" />
    </svg>
  );
}

export function SwanIcon({ className = 'w-8 h-8', color = 'currentColor' }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <path
        d="M9 33c9 5 20 4 25-3 3-5 1-11-4-13 3 0 6 2 7 5 3-1 5-4 4-8 4 2 6 7 4 12-3 7-12 11-21 10-6-1-11-2-15-3Z"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="35" cy="15" r="1.3" fill={color} />
    </svg>
  );
}

export function CornerMotif({ className = 'h-16 w-16', color = 'currentColor', flip = false }) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      className={`${className}${flip ? ' scale-x-[-1]' : ''}`}
      aria-hidden="true"
    >
      <path
        d="M4 4c20 0 30 4 36 14M4 4c0 20 4 30 14 36M18 10c10 4 16 12 18 22M10 18c4 10 12 16 22 18"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="40" cy="40" r="2" fill={color} />
    </svg>
  );
}

export function Divider({ className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-2.5 ${className}`} aria-hidden="true">
      <span className="h-px w-14 bg-gradient-to-r from-transparent to-gold-300 sm:w-24" />
      <span className="h-1.5 w-1.5 rotate-45 bg-gold-300" />
      <LotusIcon className="h-6 w-6 text-gold-500" />
      <span className="h-1.5 w-1.5 rotate-45 bg-gold-300" />
      <span className="h-px w-14 bg-gradient-to-l from-transparent to-gold-300 sm:w-24" />
    </div>
  );
}

export function SectionHeading({ hindi, english, align = 'left', className = '' }) {
  return (
    <div className={`${align === 'center' ? 'text-center' : 'text-left'} ${className}`}>
      <h2 className="devanagari text-balance text-3xl font-medium text-maroon-700 sm:text-4xl">{hindi}</h2>
      {english ? <p className="mt-1.5 font-sans text-sm text-navy-500/80">{english}</p> : null}
    </div>
  );
}

// The logo in a golden seal: a ring, a halo of 24 petals and a soft glow.
export function LogoBadge({ className = '' }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <div className={`relative mx-auto aspect-square ${className}`}>
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id={`${uid}-ring`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#F3DFA9" />
            <stop offset="0.5" stopColor="#C08A1E" />
            <stop offset="1" stopColor="#DCAE49" />
          </linearGradient>
          <radialGradient id={`${uid}-glow`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0.55" stopColor="#F6D883" stopOpacity="0.55" />
            <stop offset="1" stopColor="#F6D883" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="100" fill={`url(#${uid}-glow)`} />
        <g transform="translate(100 100)" fill="#DCAE49" opacity="0.85">
          {Array.from({ length: 24 }, (_, i) => (
            <path key={i} transform={`rotate(${i * 15})`} d="M0 -94C4.5 -86 4.5 -79 0 -71C-4.5 -79 -4.5 -86 0 -94Z" />
          ))}
        </g>
        <circle cx="100" cy="100" r="66" fill="#FFFDF8" stroke={`url(#${uid}-ring)`} strokeWidth="3.5" />
        <circle cx="100" cy="100" r="60" fill="none" stroke="#DCAE49" strokeWidth="0.8" opacity="0.7" />
      </svg>
      <img
        src={festivalConfig.logoSrc}
        alt="माँ सरस्वती"
        width={festivalConfig.logoWidth}
        height={festivalConfig.logoHeight}
        className="absolute left-1/2 top-1/2 h-[56%] w-auto -translate-x-1/2 -translate-y-1/2"
      />
    </div>
  );
}

// A row of pointed lotus-petal arches. It takes the surrounding text colour, so
// put it in a wrapper whose text colour matches the section below it.
export function PetalEdge({ className = '' }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <svg className={`block w-full ${className}`} height="16" aria-hidden="true" focusable="false">
      <defs>
        <pattern id={`${uid}-petals`} width="32" height="16" patternUnits="userSpaceOnUse">
          <path d="M0 16C3 8 7 3 16 0C25 3 29 8 32 16Z" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="16" fill={`url(#${uid}-petals)`} />
    </svg>
  );
}

// Title block for the inner pages: a proper <h1>, the English subtitle, the
// ornamental divider and a very faint lotus behind the heading.
export function PageHeader({ hindi, english, className = '' }) {
  return (
    <header className={`relative mb-10 text-center ${className}`}>
      <LotusBloom
        variant="line"
        className="pointer-events-none absolute left-1/2 top-1/2 w-[340px] -translate-x-1/2 -translate-y-1/2 text-gold-500 opacity-[0.12] sm:w-[440px]"
      />
      <h1 className="devanagari relative text-balance text-4xl text-maroon-700 sm:text-5xl">{hindi}</h1>
      {english ? <p className="relative mt-2 text-sm text-navy-500">{english}</p> : null}
      <Divider className="relative mt-5" />
    </header>
  );
}
