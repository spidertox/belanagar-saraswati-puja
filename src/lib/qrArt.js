// Draws a QR code as a "Maa Saraswati" themed SVG: maroon rounded modules,
// lotus-eye finder patterns, a golden petal border and the goddess logo in a
// gold seal at the centre.
//
// It stays scannable on purpose:
//   - error correction level H (up to 30% damage tolerated), logo hides only ~8%
//   - dark modules are deep maroon on a near-white background (strong contrast)
//   - the 4-module quiet zone around the code is left completely clear
//   - finder patterns keep the exact 1:1:3:1:1 proportions
// Pure function (returns a string) so it can run in the browser, in Node and
// in tests. Only numbers and the escaped logo URL are interpolated.
import { makeQr } from './qr.js';

const M = 10; // px per module
const QUIET = 4; // modules of clear space (spec minimum)
const LEAF = ['#14532D', '#166534', '#1E4D2B'];
const BAND = 11; // modules of decorative border outside the quiet zone

const DARK_A = '#3A0C19';
const DARK_B = '#7A1B34';
const GOLD = '#C08A1E';
const GOLD_L = '#DCAE49';
const GOLD_BG = '#FBF0D9';
const PAPER = '#FFFDF8';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const f = (n) => Number(n.toFixed(2));

function petalRow(count, length, y, fill, opacity) {
  // petals along the top edge, pointing up; rotated copies make the other sides
  const step = length / count;
  let d = '';
  for (let i = 0; i < count; i += 1) {
    const x = i * step;
    const w = step * 0.9;
    const h = step * 0.95;
    const x0 = x + (step - w) / 2;
    d += `M${f(x0)} ${f(y)}C${f(x0)} ${f(y - h * 0.6)} ${f(x0 + w * 0.35)} ${f(y - h * 0.9)} ${f(x0 + w / 2)} ${f(y - h)}C${f(x0 + w * 0.65)} ${f(y - h * 0.9)} ${f(x0 + w)} ${f(y - h * 0.6)} ${f(x0 + w)} ${f(y)}Z`;
  }
  return `<path d="${d}" fill="${fill}" opacity="${opacity}"/>`;
}

// Trunk rising from the bottom edge with branches, leaves and blossoms in the border band.
function treeDecor(W, band, animate) {
  const f2 = (v) => Math.round(v * 10) / 10;
  const mid = W / 2;
  const bottom = W - band * 0.15;
  let out = `<path d="M${f2(mid - band * 0.22)} ${f2(bottom)}Q${f2(mid)} ${f2(W - band * 0.75)} ${f2(mid + band * 0.22)} ${f2(bottom)}Z" fill="#6B4423"${animate ? ' class="qa-trunk"' : ''}/>`;
  const branch = (dir) => {
    const y0 = W - band * 0.55;
    let b = `<path d="M${f2(mid)} ${f2(y0)}C${f2(mid + dir * W * 0.12)} ${f2(y0 - band * 0.3)} ${f2(mid + dir * W * 0.25)} ${f2(y0 + band * 0.1)} ${f2(mid + dir * W * 0.4)} ${f2(y0 - band * 0.05)}" fill="none" stroke="#6B4423" stroke-width="3" stroke-linecap="round"${animate ? ' pathLength="1" class="qa-draw"' : ''}/>`;
    for (let i = 1; i <= 9; i += 1) {
      const x = mid + dir * (W * 0.04 * i + band * 0.2);
      const y = y0 - band * 0.12 + (i % 2 ? -band * 0.22 : band * 0.2);
      b += `<ellipse cx="${f2(x)}" cy="${f2(y)}" rx="${f2(band * 0.17)}" ry="${f2(band * 0.08)}" transform="rotate(${i % 2 ? -35 : 35} ${f2(x)} ${f2(y)})" fill="${i % 3 === 0 ? '#166534' : '#22863A'}"${animate ? ` class="qa-leaf" style="animation-delay:${f2(1.2 + i * 0.12)}s,${f2(2.5 + i * 0.3)}s"` : ''}/>`;
      if (i % 4 === 0) b += `<circle cx="${f2(x)}" cy="${f2(y)}" r="${f2(band * 0.07)}" fill="${i % 8 === 0 ? '#E8742A' : '#DCAE49'}"${animate ? ` class="qa-bloom" style="animation-delay:${f2(2 + i * 0.1)}s"` : ''}/>`;
    }
    return b;
  };
  out += branch(1) + branch(-1);
  // side vines
  for (const sx of [band * 0.5, W - band * 0.5]) {
    for (let i = 0; i < 8; i += 1) {
      const y = band * 1.6 + i * ((W - band * 4) / 8);
      out += `<ellipse cx="${f2(sx)}" cy="${f2(y)}" rx="${f2(band * 0.1)}" ry="${f2(band * 0.2)}" transform="rotate(${i % 2 ? 25 : -25} ${f2(sx)} ${f2(y)})" fill="${i % 3 === 0 ? '#DCAE49' : '#22863A'}"${animate ? ` class="qa-leaf" style="animation-delay:${f2(0.6 + i * 0.15)}s,${f2(2 + i * 0.4)}s"` : ''}/>`;
    }
  }
  return out;
}

const ANIM_CSS =
  '.qa-m,.qa-leaf,.qa-bloom{transform-box:fill-box;transform-origin:center}' +
  '.qa-m{animation:qa-pop .5s cubic-bezier(.2,1.4,.4,1) backwards}' +
  '@keyframes qa-pop{from{opacity:0;transform:scale(0) rotate(-60deg)}to{opacity:1;transform:none}}' +
  '.qa-trunk{transform-box:fill-box;transform-origin:50% 100%;animation:qa-grow 1s ease-out backwards}' +
  '@keyframes qa-grow{from{transform:scaleY(0)}to{transform:none}}' +
  '.qa-draw{stroke-dasharray:1;animation:qa-dash 1.4s .5s ease-out backwards}' +
  '@keyframes qa-dash{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}' +
  '.qa-leaf{animation:qa-pop .5s backwards,qa-sway 3.4s ease-in-out infinite alternate}' +
  '@keyframes qa-sway{from{transform:rotate(-9deg)}to{transform:rotate(9deg)}}' +
  '.qa-bloom{animation:qa-pop .6s backwards,qa-pulse 2.2s ease-in-out infinite alternate}' +
  '@keyframes qa-pulse{from{transform:scale(.8)}to{transform:scale(1.35)}}' +
  '@media (prefers-reduced-motion:reduce){.qa-m,.qa-trunk,.qa-draw,.qa-leaf,.qa-bloom{animation:none!important}}';

export function buildQrSvg(
  value,
  { logoSrc = '', label = 'QR code', ecc = 'H', logoScale = 0.16, moduleRx = 3.4, inset = 0.5, eyeRx = 0.2, decor = true, tree = false, animate = false } = {}
) {
  const qr = makeQr(value, ecc);
  const n = qr.size;
  const qrPx = n * M;
  const inner = qrPx + QUIET * 2 * M; // QR + quiet zone
  const W = inner + BAND * 2 * M;
  const origin = (BAND + QUIET) * M; // where module (0,0) starts
  const cx = W / 2;
  const R = qrPx * logoScale; // logo seal radius (px)
  const clearR = R + M * 0.9; // modules inside this radius are left out

  const inFinder = (r, c) => (r < 8 && c < 8) || (r < 8 && c > n - 9) || (r > n - 9 && c < 8);

  let modules = '';
  for (let r = 0; r < n; r += 1) {
    for (let c = 0; c < n; c += 1) {
      if (!qr.get(r, c) || inFinder(r, c)) continue;
      const x = origin + c * M;
      const y = origin + r * M;
      const mx = x + M / 2;
      const my = y + M / 2;
      if (Math.hypot(mx - cx, my - cx) < clearR) continue;
      if (tree) {
        const a = x + 0.1;
        const b = x + M - 0.1;
        const t = y + 0.1;
        const u = y + M - 0.1;
        const k = (r * 7 + c * 13) % 3;
        const fl = (r + c) % 2 === 0;
        // leaf: two opposite rounded corners, two sharp ones (alternating direction)
        const w = b - a;
        const R1 = w * 0.5;
        const R2 = w * 0.08;
        // fat leaf: two big rounded corners, two nearly square ones
        const d = fl
          ? `M${a + R1} ${t}H${b - R2}Q${b} ${t} ${b} ${t + R2}V${u - R1}A${R1} ${R1} 0 0 1 ${b - R1} ${u}H${a + R2}Q${a} ${u} ${a} ${u - R2}V${t + R1}A${R1} ${R1} 0 0 1 ${a + R1} ${t}Z`
          : `M${a + R2} ${t}H${b - R1}A${R1} ${R1} 0 0 1 ${b} ${t + R1}V${u - R2}Q${b} ${u} ${b - R2} ${u}H${a + R1}A${R1} ${R1} 0 0 1 ${a} ${u - R1}V${t + R2}Q${a} ${t} ${a + R2} ${t}Z`;
        const dl = f(0.15 + (Math.hypot(mx - cx, my - cx) / (qrPx * 0.75)) * 1.6 + ((r * 31 + c * 17) % 7) * 0.02);
        modules += animate
          ? `<path class="qa-m" style="animation-delay:${dl}s" d="${d}" fill="${LEAF[k]}"/>`
          : `<path d="${d}" fill="${LEAF[k]}"/>`;
        continue;
      }
      modules += `<rect x="${x + inset}" y="${y + inset}" width="${M - 2 * inset}" height="${M - 2 * inset}" rx="${moduleRx}"/>`;
    }
  }

  const eye = (r, c) => {
    const x = origin + c * M;
    const y = origin + r * M;
    return (
      `<rect x="${x + M / 2}" y="${y + M / 2}" width="${6 * M}" height="${6 * M}" rx="${eyeRx * M}" fill="none" stroke="url(#qa-dark)" stroke-width="${M}"/>` +
      `<rect x="${x + 2 * M}" y="${y + 2 * M}" width="${3 * M}" height="${3 * M}" rx="${Math.min(1.1, eyeRx * 0.55) * M}" fill="url(#qa-dark)"/>`
    );
  };

  // decorative border: petal rows on the four sides (outside the quiet zone)
  const bandPx = BAND * M;
  const start = bandPx * 0.95; // petals stop short of the corners
  const edge = W - 2 * start; // petal row length along a side
  const petals = 22;
  const rowY = bandPx * 0.78;
  const side = (rot) =>
    `<g transform="rotate(${rot} ${cx} ${cx})"><g transform="translate(${f(start)} 0)">${petalRow(petals, edge, rowY, GOLD_L, 0.9)}${petalRow(
      petals,
      edge,
      rowY + bandPx * 0.12,
      GOLD,
      0.35
    )}</g></g>`;

  const corner = (x, y) =>
    `<g transform="translate(${f(x)} ${f(y)})"><path d="M0 -${f(bandPx * 0.36)}L${f(bandPx * 0.36)} 0L0 ${f(bandPx * 0.36)}L-${f(bandPx * 0.36)} 0Z" fill="${GOLD}"/><circle r="${f(bandPx * 0.13)}" fill="${GOLD_BG}"/></g>`;
  const cOff = bandPx * 0.5;
  const corners = corner(cOff, cOff) + corner(W - cOff, cOff) + corner(cOff, W - cOff) + corner(W - cOff, W - cOff);

  const logoImg = logoSrc
    ? `<image href="${esc(logoSrc)}" x="${f(cx - R * 0.78)}" y="${f(cx - R * 0.86)}" width="${f(R * 1.56)}" height="${f(R * 1.72)}" preserveAspectRatio="xMidYMid meet"/>`
    : '';

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${W}" role="img" aria-label="${esc(label)}">` +
    `<title>${esc(label)}</title>` +
    `<defs>` +
    `<linearGradient id="qa-dark" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${W}" y2="${W}"><stop offset="0" stop-color="${DARK_B}"/><stop offset="1" stop-color="${DARK_A}"/></linearGradient>` +
    `<linearGradient id="qa-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F3DFA9"/><stop offset="0.5" stop-color="${GOLD}"/><stop offset="1" stop-color="${GOLD_L}"/></linearGradient>` +
    `</defs>` +
    (animate ? `<style>${ANIM_CSS}</style>` : '') +
    // card + gold frame
    `<rect width="${W}" height="${W}" rx="${M * 3}" fill="${GOLD_BG}"/>` +
    `<rect x="3" y="3" width="${W - 6}" height="${W - 6}" rx="${M * 3 - 2}" fill="none" stroke="url(#qa-gold)" stroke-width="5"/>` +
    `<rect x="${f(bandPx * 0.2)}" y="${f(bandPx * 0.2)}" width="${f(W - bandPx * 0.4)}" height="${f(W - bandPx * 0.4)}" rx="${M * 2}" fill="none" stroke="${GOLD_L}" stroke-width="1.5" opacity="0.7"/>` +
    (decor ? (tree ? treeDecor(W, bandPx, animate) : side(0) + side(90) + side(180) + side(270)) : '') +
    corners +
    // clear paper behind the code and its quiet zone
    `<rect x="${bandPx}" y="${bandPx}" width="${inner}" height="${inner}" rx="${M * 1.5}" fill="${PAPER}"/>` +
    `<g fill="url(#qa-dark)">${modules}</g>` +
    eye(0, 0) +
    `<g transform="translate(${(n - 7) * M} 0)">${eye(0, 0)}</g>` +
    `<g transform="translate(0 ${(n - 7) * M})">${eye(0, 0)}</g>` +
    // centre seal with the goddess
    `<circle cx="${cx}" cy="${cx}" r="${f(R + 4)}" fill="url(#qa-gold)"/>` +
    `<circle cx="${cx}" cy="${cx}" r="${f(R)}" fill="${PAPER}"/>` +
    logoImg +
    `</svg>`
  );
}

export const QR_FRAME_RATIO = 1; // the SVG is square
