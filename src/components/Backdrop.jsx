// Original line-art of a lotus and a Saraswati veena, drawn in code (not a
// photo, and not a copy of anyone's artwork).
//
// Used in three places:
//   HeroArt      - the full-colour lotus + veena picture on the home page
//   SiteBackdrop - very faint outline versions fixed behind every public page
//   public/patterns/lotus-veena.svg - the small repeating wallpaper tile. It
//                  is a plain SVG file: change its opacity there if you want
//                  the pattern stronger or fainter.
import { useId } from 'react';

const GOLD = '#C08A1E';
const GOLD_LIGHT = '#DCAE49';
const GOLD_PALE = '#F3DFA9';
const IVORY = '#FBF6EA';

const r = (n) => Math.round(n * 100) / 100;
// useId() returns strings with colons/brackets that are awkward inside
// url(#...) references, so keep only letters and digits.
const useUid = () => useId().replace(/[^a-zA-Z0-9]/g, '');

/* ───────────────────────────── Lotus ───────────────────────────── */

// One pointed petal growing upward from the origin.
function petalPath(len, wid) {
  return (
    `M0 0C${r(-wid)} ${r(-len * 0.26)} ${r(-wid * 0.8)} ${r(-len * 0.78)} 0 ${r(-len)}` +
    `C${r(wid * 0.8)} ${r(-len * 0.78)} ${r(wid)} ${r(-len * 0.26)} 0 0Z`
  );
}

// Centre vein plus two side veins for a petal.
function veinPath(len, wid) {
  return (
    `M0 ${r(-len * 0.12)}L0 ${r(-len * 0.74)}` +
    `M0 ${r(-len * 0.28)}Q${r(-wid * 0.55)} ${r(-len * 0.44)} ${r(-wid * 0.4)} ${r(-len * 0.66)}` +
    `M0 ${r(-len * 0.28)}Q${r(wid * 0.55)} ${r(-len * 0.44)} ${r(wid * 0.4)} ${r(-len * 0.66)}`
  );
}

// Outer layer first; each layer is staggered against the one behind it.
const LOTUS_LAYERS = [
  { id: 'back', len: 120, wid: 31, angles: [-80, -54, -28, 0, 28, 54, 80], sw: 1.1 },
  { id: 'mid', len: 104, wid: 28, angles: [-67, -41, -14, 14, 41, 67], sw: 1.2 },
  { id: 'front', len: 88, wid: 25, angles: [-54, -27, 0, 27, 54], sw: 1.4 },
  { id: 'core', len: 54, wid: 17, angles: [-18, 0, 18], sw: 1.3 },
];

const LOTUS_CUP = 'M-24 -2C-18 12 18 12 24 -2C12 -9 -12 -9 -24 -2Z';

/* ───────────────────────────── Veena ───────────────────────────── */

const NECK_START = 128;
const NECK_END = 412;
// The neck narrows a little toward the head.
const neckHalf = (x) => 13 - (3 * (x - NECK_START)) / (NECK_END - NECK_START);
// Frets bunch up toward the big resonator, like a real fingerboard
// (equal-tempered spacing measured from the head end).
const FRETS = Array.from({ length: 22 }, (_, i) => r(NECK_END - 361.5 * (1 - 2 ** (-(i + 1) / 12))));
// [y at the head end, y at the bridge]
const STRINGS = [
  [-4.8, -9],
  [-1.6, -3],
  [1.6, 3],
  [4.8, 9],
];
const SCROLL = 'M456 -3C494 -12 524 -2 528 24C531 44 512 56 497 47C484 39 488 24 501 26';

/* ───────────────────────── Shared gradients ───────────────────────── */

function ArtDefs({ uid }) {
  const petals = [
    ['back', '#FFFFFF', '#F3DFA9'],
    ['mid', '#FFFFFF', '#F6D883'],
    ['front', '#FFFDF8', '#F7C98B'],
    ['core', '#FFF6DA', '#F2A65A'],
  ];
  return (
    <defs>
      {petals.map(([id, base, tip]) => (
        <linearGradient key={id} id={`${uid}-p-${id}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor={base} />
          <stop offset="1" stopColor={tip} />
        </linearGradient>
      ))}
      <linearGradient id={`${uid}-wood`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#A52A48" />
        <stop offset="1" stopColor="#5C1427" />
      </linearGradient>
      <linearGradient id={`${uid}-wood-dark`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#7A1B34" />
        <stop offset="1" stopColor="#4A0F20" />
      </linearGradient>
      <radialGradient id={`${uid}-plate`} cx="0.4" cy="0.35" r="0.8">
        <stop offset="0" stopColor="#B33A57" />
        <stop offset="1" stopColor="#7A1B34" />
      </radialGradient>
      <linearGradient id={`${uid}-brass`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={GOLD_PALE} />
        <stop offset="0.5" stopColor={GOLD} />
        <stop offset="1" stopColor="#A06F16" />
      </linearGradient>
      <linearGradient id={`${uid}-leaf`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={GOLD_PALE} stopOpacity="0.6" />
        <stop offset="1" stopColor={GOLD_PALE} stopOpacity="0.15" />
      </linearGradient>
    </defs>
  );
}

/* ─────────────────────────── Drawn shapes ─────────────────────────── */

// Origin is the centre of the base of the flower; petals grow upward (−y).
function LotusShapes({ uid, line }) {
  const stroke = line ? 'currentColor' : GOLD;
  return (
    <g strokeLinecap="round" strokeLinejoin="round">
      {LOTUS_LAYERS.map((layer) => (
        <g key={layer.id}>
          {[...layer.angles]
            .sort((a, b) => Math.abs(b) - Math.abs(a))
            .map((angle) => (
              <g key={angle} transform={`rotate(${angle})`}>
                <path
                  d={petalPath(layer.len, layer.wid)}
                  fill={line ? IVORY : `url(#${uid}-p-${layer.id})`}
                  stroke={stroke}
                  strokeWidth={layer.sw}
                />
                <path
                  d={veinPath(layer.len, layer.wid)}
                  fill="none"
                  stroke={line ? 'currentColor' : GOLD_LIGHT}
                  strokeWidth="0.8"
                  opacity={line ? 0.55 : 0.9}
                />
              </g>
            ))}
        </g>
      ))}
      <path d={LOTUS_CUP} fill={line ? IVORY : `url(#${uid}-brass)`} stroke={stroke} strokeWidth="1.2" />
    </g>
  );
}

// Drawn lying flat: big resonator on the left, head scroll on the right.
function VeenaShapes({ uid, line }) {
  const stroke = line ? 'currentColor' : GOLD;
  const trim = line ? 'currentColor' : GOLD_LIGHT;
  const wood = line ? IVORY : `url(#${uid}-wood)`;
  const woodDark = line ? IVORY : `url(#${uid}-wood-dark)`;
  const brass = line ? IVORY : `url(#${uid}-brass)`;

  return (
    <g strokeLinecap="round" strokeLinejoin="round">
      {/* small gourd, hanging under the neck near the head */}
      <circle cx="372" cy="40" r="32" fill={wood} stroke={stroke} strokeWidth="2" />
      <circle cx="372" cy="42" r="23" fill="none" stroke={trim} strokeWidth="0.9" opacity="0.7" />
      <rect x="358" y="9" width="28" height="7" rx="3.5" fill={brass} stroke={stroke} strokeWidth="1" />

      {/* large resonator with its top plate, lotus rosette and bridge */}
      <circle cx="70" cy="0" r="68" fill={wood} stroke={stroke} strokeWidth="2.2" />
      <circle cx="70" cy="0" r="57" fill={line ? IVORY : `url(#${uid}-plate)`} stroke={trim} strokeWidth="1" />
      <circle cx="70" cy="0" r="49" fill="none" stroke={trim} strokeWidth="0.9" strokeDasharray="2 4" opacity="0.8" />
      <g transform="translate(52 0)">
        {Array.from({ length: 12 }, (_, i) => (
          <path
            key={i}
            transform={`rotate(${i * 30})`}
            d="M0 0C-3.6 -5 -3.6 -11 0 -16C3.6 -11 3.6 -5 0 0Z"
            fill={brass}
            stroke={stroke}
            strokeWidth="0.8"
          />
        ))}
        <circle r="3.2" fill={line ? IVORY : GOLD_PALE} stroke={stroke} strokeWidth="0.8" />
      </g>
      {line ? null : <ellipse cx="44" cy="-34" rx="26" ry="11" transform="rotate(-30 44 -34)" fill="#fff" opacity="0.1" />}
      <rect x="104" y="-17" width="7" height="34" rx="3" fill={brass} stroke={stroke} strokeWidth="1" />

      {/* neck, inlay lines and frets */}
      <path d={`M${NECK_START} -13L${NECK_END} -10V10L${NECK_START} 13Z`} fill={woodDark} stroke={stroke} strokeWidth="1.8" />
      <path d="M136 -9.6L406 -7M136 9.6L406 7" fill="none" stroke={trim} strokeWidth="0.7" opacity="0.6" />
      {FRETS.map((x) => {
        const h = neckHalf(x) - 1.4;
        return (
          <line
            key={x}
            x1={x}
            y1={-h}
            x2={x}
            y2={h}
            stroke={trim}
            strokeWidth={line ? 0.9 : 1.3}
            opacity={line ? 0.8 : 1}
          />
        );
      })}
      <rect x="122" y="-16" width="9" height="32" rx="2" fill={brass} stroke={stroke} strokeWidth="1" />

      {/* strings */}
      {STRINGS.map(([headY, bridgeY], i) => (
        <line
          key={i}
          x1="410"
          y1={headY}
          x2="108"
          y2={bridgeY}
          stroke={line ? 'currentColor' : GOLD_PALE}
          strokeWidth={i === 0 ? 1.4 : 1}
        />
      ))}

      {/* peg box, pegs and the curled head */}
      <rect x="408" y="-12" width="48" height="24" rx="6" fill={woodDark} stroke={stroke} strokeWidth="1.6" />
      {[
        [424, -17],
        [440, -17],
        [424, 17],
        [440, 17],
      ].map(([x, y]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r="3.2" fill={brass} stroke={stroke} strokeWidth="0.8" />
      ))}
      <path d={SCROLL} fill="none" stroke={stroke} strokeWidth="15" />
      <path d={SCROLL} fill="none" stroke={line ? IVORY : '#7A1B34'} strokeWidth="11" />
      <circle cx="501" cy="26" r="5" fill={brass} stroke={stroke} strokeWidth="1" />
    </g>
  );
}

function LotusLeaf({ uid, cx, cy, rx, ry }) {
  const spokes = 9;
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#${uid}-leaf)`} stroke={GOLD} strokeWidth="1" opacity="0.75" />
      {Array.from({ length: spokes }, (_, i) => {
        const a = (i / spokes) * Math.PI * 2;
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={r(cx + Math.cos(a) * rx * 0.92)}
            y2={r(cy + Math.sin(a) * ry * 0.92)}
            stroke={GOLD}
            strokeWidth="0.7"
            opacity="0.4"
          />
        );
      })}
    </g>
  );
}

// A small four-point glint. The animation sits on the inner path so it does
// not fight with the positioning transform on the group.
function Sparkle({ x, y, s = 1, delay = 0 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path
        className="art-twinkle"
        style={{ animationDelay: `${delay}s` }}
        d="M0 -8L1.8 -1.8L8 0L1.8 1.8L0 8L-1.8 1.8L-8 0L-1.8 -1.8Z"
        fill="#F3C860"
      />
    </g>
  );
}

/* ──────────────────────────── Public API ──────────────────────────── */

export function LotusBloom({ variant = 'color', className = '' }) {
  const uid = useUid();
  const line = variant === 'line';
  return (
    <svg viewBox="-150 -128 300 152" className={className} aria-hidden="true" focusable="false">
      {line ? null : <ArtDefs uid={uid} />}
      <LotusShapes uid={uid} line={line} />
    </svg>
  );
}

export function VeenaArt({ variant = 'color', className = '' }) {
  const uid = useUid();
  const line = variant === 'line';
  return (
    <svg viewBox="-4 -72 544 150" className={className} aria-hidden="true" focusable="false">
      {line ? null : <ArtDefs uid={uid} />}
      <VeenaShapes uid={uid} line={line} />
    </svg>
  );
}

// The home-page picture: a lotus in bloom on still water with a veena
// resting behind it.
export function HeroArt({ className = '' }) {
  const uid = useUid();
  return (
    <svg viewBox="0 84 640 316" className={className} aria-hidden="true" focusable="false">
      <ArtDefs uid={uid} />

      <g fill="none" stroke={GOLD} strokeLinecap="round">
        <ellipse cx="320" cy="352" rx="300" ry="15" strokeWidth="1" opacity="0.3" />
        <ellipse cx="320" cy="352" rx="228" ry="11" strokeWidth="1" opacity="0.38" />
        <ellipse cx="320" cy="352" rx="158" ry="7" strokeWidth="1.1" opacity="0.5" />
      </g>

      <LotusLeaf uid={uid} cx={104} cy={354} rx={86} ry={15} />
      <LotusLeaf uid={uid} cx={548} cy={356} rx={70} ry={12} />

      <g transform="translate(62 300) rotate(-21)">
        <VeenaShapes uid={uid} />
      </g>

      <g transform="translate(320 350) scale(1.28)">
        <g className="art-sway">
          <LotusShapes uid={uid} />
        </g>
      </g>

      <Sparkle x={500} y={190} s={1.1} delay={0} />
      <Sparkle x={150} y={226} s={0.8} delay={1.4} />
      <Sparkle x={588} y={132} s={0.9} delay={2.6} />
      <Sparkle x={330} y={168} s={0.7} delay={0.8} />
    </svg>
  );
}

// Fixed, very faint outline art behind every public page. Purely
// decorative: it never receives clicks and is hidden from screen readers.
export function SiteBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-x-0 top-0 h-[70vh]"
        style={{
          background: 'radial-gradient(60% 60% at 50% 0%, rgba(246,216,131,0.30), rgba(251,246,234,0) 72%)',
        }}
      />
      <LotusBloom
        variant="line"
        className="absolute -bottom-6 -right-20 w-[380px] text-gold-500 opacity-[0.12] sm:-right-10 sm:w-[520px]"
      />
      <VeenaArt
        variant="line"
        className="absolute -bottom-2 -left-44 w-[520px] -rotate-[24deg] text-gold-500 opacity-[0.09] sm:-bottom-6 sm:-left-28 sm:w-[680px]"
      />
    </div>
  );
}
