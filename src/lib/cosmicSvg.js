// Static markup of the "Cosmic Mandala" (Saraswati Puja). Rendered once via
// dangerouslySetInnerHTML from a constant (no user input). The rings are
// rotated by AuthArt.jsx; ids are only used inside that component.
const clones = (tpl, count, off = 0) =>
  Array.from({ length: count }, (_, i) => `<use href="#${tpl}" transform="rotate(${(i * 360) / count + off})"/>`).join('');

const rays = Array.from({ length: 36 }, (_, i) => `<line x1="0" y1="-68" x2="0" y2="${i % 2 ? -118 : -136}" transform="rotate(${i * 10})"/>`).join('');

export const cosmicSvg = (logo) => `
<svg viewBox="-500 -500 1000 1000" class="h-full w-full overflow-visible" role="img" aria-label="माँ सरस्वती मंडल">
<defs>
<linearGradient id="goldRich" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fef08a"/><stop offset="30%" stop-color="#f59e0b"/><stop offset="55%" stop-color="#fde047"/><stop offset="80%" stop-color="#b45309"/><stop offset="100%" stop-color="#fef08a"/></linearGradient>
<linearGradient id="goldSoft" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="#d97706"/><stop offset="50%" stop-color="#fde68a"/><stop offset="100%" stop-color="#f59e0b"/></linearGradient>
<linearGradient id="neonCosmic" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#22d3ee"/><stop offset="50%" stop-color="#e879f9"/><stop offset="100%" stop-color="#fbbf24"/></linearGradient>
<radialGradient id="crimsonCore" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#7c2d12"/><stop offset="55%" stop-color="#4c0519"/><stop offset="85%" stop-color="#2e1065"/><stop offset="100%" stop-color="#090418" stop-opacity="0"/></radialGradient>
<linearGradient id="whiteLotus" x1="50%" y1="0%" x2="50%" y2="100%"><stop offset="0%" stop-color="#fff"/><stop offset="65%" stop-color="#fce7f3"/><stop offset="90%" stop-color="#f472b6"/><stop offset="100%" stop-color="#db2777"/></linearGradient>
<linearGradient id="goldLotus" x1="50%" y1="0%" x2="50%" y2="100%"><stop offset="0%" stop-color="#fef9c3"/><stop offset="50%" stop-color="#facc15"/><stop offset="90%" stop-color="#ca8a04"/><stop offset="100%" stop-color="#713f12"/></linearGradient>
<linearGradient id="veenaWood" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#b45309"/><stop offset="40%" stop-color="#78350f"/><stop offset="75%" stop-color="#451a03"/><stop offset="100%" stop-color="#d97706"/></linearGradient>
<linearGradient id="swanGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fff"/><stop offset="70%" stop-color="#e0f2fe"/><stop offset="100%" stop-color="#bae6fd"/></linearGradient>
<radialGradient id="maaDisc" cx="50%" cy="46%" r="60%"><stop offset="0%" stop-color="#fffdf5"/><stop offset="62%" stop-color="#fdf1cf"/><stop offset="100%" stop-color="#f3d58a"/></radialGradient>
<clipPath id="maaClip"><circle r="128"/></clipPath>
<filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<path id="sanskritTextPath" d="M 0,-368 A 368,368 0 1,1 -0.01,-368"/>
<path id="innerMantraPath" d="M 0,-252 A 252,252 0 1,1 -0.01,-252"/>
<g id="ornatePetal24"><path d="M 0,-415 C 18,-435 28,-455 0,-478 C -28,-455 -18,-435 0,-415 Z" fill="url(#goldRich)" stroke="#fef08a" stroke-width="1.2"/><circle cx="0" cy="-445" r="4" fill="#ec4899"/><circle cx="0" cy="-484" r="2.5" fill="#fef08a"/></g>
<g id="omMedallion"><circle cx="0" cy="-368" r="22" fill="#2e1065" stroke="url(#goldRich)" stroke-width="2.5"/><circle cx="0" cy="-368" r="18" fill="none" stroke="#fde047" stroke-width="0.8" stroke-dasharray="2,2"/><text x="0" y="-361" text-anchor="middle" fill="#fef08a" class="cm-sk" font-size="21">ॐ</text></g>
<g id="floralArch16"><path d="M -38,-285 Q 0,-335 38,-285" fill="none" stroke="url(#neonCosmic)" stroke-width="2.2"/><path d="M -24,-285 C -15,-312 0,-325 0,-332 C 0,-325 15,-312 24,-285 Z" fill="url(#goldSoft)" fill-opacity="0.85" stroke="#fef08a"/><circle cx="0" cy="-302" r="5" fill="#22d3ee"/><circle cx="0" cy="-337" r="3" fill="#fff"/></g>
<g id="lotusPetal12"><path d="M 0,-155 C 32,-175 42,-220 0,-250 C -42,-220 -32,-175 0,-155 Z" fill="url(#goldLotus)" stroke="#fef08a" stroke-width="1.5"/><path d="M 0,-162 C 18,-180 22,-212 0,-238 C -22,-212 -18,-180 0,-162 Z" fill="#4c0519" fill-opacity="0.65" stroke="url(#neonCosmic)"/><circle cx="0" cy="-215" r="4" fill="#fde047"/></g>
</defs>

<circle r="460" fill="url(#crimsonCore)"/>

<g id="ring-outer-crown"><circle r="422" fill="none" stroke="url(#goldRich)" stroke-width="3"/><circle r="412" fill="none" stroke="#22d3ee" stroke-width="1.2" stroke-dasharray="6 4" opacity="0.8"/>${clones('ornatePetal24', 24)}</g>

<g id="ring-sanskrit"><circle r="395" fill="none" stroke="url(#goldRich)" stroke-width="4" filter="url(#softGlow)"/><circle r="342" fill="none" stroke="url(#goldRich)" stroke-width="3.5"/>
<path d="M -393,0 A 393,393 0 1,1 393,0 A 393,393 0 1,1 -393,0 Z M -344,0 A 344,344 0 1,1 344,0 A 344,344 0 1,1 -344,0 Z" fill="#170936" fill-opacity="0.82" fill-rule="evenodd"/>
<text fill="#fef08a" font-size="19.5" letter-spacing="3.2" class="cm-sk" dy="7"><textPath href="#sanskritTextPath">ॐ ऐं ह्रीं क्लीं महासरस्वती देव्यै नमः • या कुन्देन्दुतुषारहारधवला या शुभ्रवस्त्रावृता • या वीणावरदण्डमण्डितकरा • </textPath></text>
${clones('omMedallion', 8, 22.5)}</g>

<g id="ring-floral-16"><circle r="334" fill="none" stroke="url(#neonCosmic)" stroke-width="2.5"/><circle r="285" fill="none" stroke="url(#goldRich)" stroke-width="2"/>${clones('floralArch16', 16)}</g>

<g id="ring-sacred-geometry"><circle r="275" fill="none" stroke="#f472b6" stroke-width="1.5" stroke-dasharray="4 6"/>
<g stroke="url(#goldRich)" stroke-width="2" fill="rgba(131,24,67,0.22)"><rect x="-190" y="-190" width="380" height="380" rx="12"/><rect x="-190" y="-190" width="380" height="380" rx="12" transform="rotate(30)" stroke="url(#neonCosmic)"/><rect x="-190" y="-190" width="380" height="380" rx="12" transform="rotate(60)"/></g>
<text fill="#f9a8d4" font-size="13" letter-spacing="4.5" class="cm-sk" dy="4" opacity="0.9"><textPath href="#innerMantraPath">ॐ वाग्देव्यै च विद्महे कामराजाय धीमहि • तन्नो देवी प्रचोदयात् • ॐ सरस्वत्यै नमः •</textPath></text></g>

<g id="ring-lotus-12">${clones('lotusPetal12', 12)}<circle r="162" fill="none" stroke="url(#goldRich)" stroke-width="4"/><circle r="152" fill="#2a0845" stroke="#22d3ee" stroke-width="1.5" stroke-dasharray="3 5"/></g>

<g id="ring-inner-rays"><circle r="138" fill="url(#crimsonCore)"/><g stroke="url(#goldSoft)" stroke-width="1.2" opacity="0.65">${rays}</g></g>

<g id="central-emblem" class="cm-emblem">
<circle r="146" fill="none" stroke="url(#goldRich)" stroke-width="3" stroke-dasharray="2 6" stroke-linecap="round" opacity="0.9"/>
<circle r="134" fill="url(#maaDisc)" stroke="url(#goldRich)" stroke-width="5"/>
<circle r="124" fill="none" stroke="#b45309" stroke-width="1" stroke-dasharray="1 4" opacity="0.7"/>
<image href="${logo}" x="-102" y="-112" width="204" height="227" preserveAspectRatio="xMidYMid meet" clip-path="url(#maaClip)"/>
</g>
</svg>`;
