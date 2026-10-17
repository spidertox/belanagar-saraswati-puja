import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { cosmicSvg } from '../../lib/cosmicSvg.js';
import { festivalConfig } from '../../config/festivalConfig.js';

// Left panel art: "Cosmic Mandala". Twinkling stars, golden prana dust,
// falling lotus/marigold petals and ten diyas orbiting on a tilted ring are
// drawn on one <canvas>; the mandala itself is SVG whose rings turn in
// alternating directions. Click the canvas for a petal shower, click the
// Maa Saraswati medallion for a shockwave. No audio.
const RINGS = [['ring-outer-crown', 0.08], ['ring-sanskrit', -0.055], ['ring-floral-16', 0.11], ['ring-sacred-geometry', -0.09], ['ring-lotus-12', 0.065], ['ring-inner-rays', -0.14]];
const STAR_COLORS = ['#ffffff', '#fef08a', '#bae6fd', '#f5d0fe'];
const PETAL_TYPES = [['#fff1f2', '#f472b6', '#be185d'], ['#ffffff', '#fce7f3', '#f9a8d4'], ['#fef08a', '#f59e0b', '#b45309']];
const TILT = -0.14;
const r = Math.random;

export default function AuthArt() {
  const root = useRef(null);
  const cvs = useRef(null);
  const stage = useRef(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = root.current, cv = cvs.current, st = stage.current;
    const ctx = cv.getContext('2d');
    const rings = RINGS.map(([id, speed]) => ({ g: st.querySelector('#' + id), speed, a: 0 }));
    const emblem = st.querySelector('#central-emblem');
    let W = 0, H = 0, cx = 0, cy = 0, base = 0, raf = 0, last = 0, aarti = 0, timer = 0;
    const ptr = { x: 0, y: 0, tx: 0, ty: 0 };

    const stars = Array.from({ length: 150 }, () => ({ x: r(), y: r(), r: r() * 1.6 + 0.4, p: r() * 6.28, s: r() * 0.03 + 0.01, c: STAR_COLORS[(r() * 4) | 0], cross: r() < 0.12 }));
    const dust = Array.from({ length: 60 }, () => ({ x: r(), y: r(), vx: (r() - 0.5) * 0.4, vy: -r() * 0.6 - 0.2, s: r() * 2.2 + 0.8, a: r() * 0.7 + 0.2 }));
    const diyas = Array.from({ length: 10 }, (_, i) => ({ a: (i / 10) * 6.283, seed: r() * 100 }));
    const petals = [];
    const waves = [];

    const spawn = (x, y, burst) => {
      const ang = r() * 6.283, sp = burst ? r() * 5.5 + 1.5 : 0;
      petals.push({ x, y, vx: burst ? Math.cos(ang) * sp : (r() - 0.5) * 1.2, vy: burst ? Math.sin(ang) * sp - 1.5 : r() * 1.4 + 0.8, rot: r() * 6.28, vr: (r() - 0.5) * 0.05, sw: r() * 6.28, size: r() * 9 + 9, t: PETAL_TYPES[(r() * 3) | 0], alpha: 1, life: burst ? 180 : 420 });
    };
    const burst = (x, y, n = 40, maxR = Math.max(W, H) * 0.65) => {
      for (let i = 0; i < n; i++) spawn(x, y, true);
      waves.push({ x, y, r: 15, max: maxR, a: 0.85 });
    };

    const fit = () => {
      const b = el.getBoundingClientRect();
      W = b.width; H = b.height;
      if (!W || !H) return false;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const top = Math.min(190, H * 0.25);
      const S = Math.min(W * 0.72, (H - top) * 0.92);
      cx = W / 2; cy = top + (H - top) / 2; base = S / 2;
      Object.assign(st.style, { width: S + 'px', height: S + 'px', left: cx - S / 2 + 'px', top: cy - S / 2 + 'px' });
      return true;
    };

    const drawPetal = (p) => {
      const s = p.size;
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.beginPath(); ctx.moveTo(0, -s);
      ctx.bezierCurveTo(s * 0.85, -s * 0.5, s * 0.7, s * 0.6, 0, s);
      ctx.bezierCurveTo(-s * 0.7, s * 0.6, -s * 0.85, -s * 0.5, 0, -s);
      const g = ctx.createLinearGradient(0, -s, 0, s);
      g.addColorStop(0, p.t[0]); g.addColorStop(0.6, p.t[1]); g.addColorStop(1, p.t[2]);
      ctx.fillStyle = g; ctx.fill();
      ctx.strokeStyle = 'rgba(254,240,138,.6)'; ctx.lineWidth = 0.8; ctx.stroke();
      ctx.restore();
    };

    const drawDiya = (x, y, sc, t, seed) => {
      const fl = Math.sin(t * 0.018 + seed) * 2.2 + Math.cos(t * 0.032 + seed) * 1.5;
      ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
      const ag = ctx.createRadialGradient(0, -14, 2, 0, -14, 36);
      ag.addColorStop(0, 'rgba(255,251,235,.95)'); ag.addColorStop(0.35, 'rgba(251,191,36,.55)'); ag.addColorStop(0.7, 'rgba(234,88,12,.2)'); ag.addColorStop(1, 'rgba(234,88,12,0)');
      ctx.fillStyle = ag; ctx.beginPath(); ctx.arc(0, -14, 36, 0, 6.283); ctx.fill();
      const bg = ctx.createLinearGradient(-18, 0, 18, 14);
      bg.addColorStop(0, '#f59e0b'); bg.addColorStop(0.5, '#b45309'); bg.addColorStop(1, '#78350f');
      ctx.fillStyle = bg; ctx.strokeStyle = '#fde047'; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(-20, -2); ctx.quadraticCurveTo(0, 4, 20, -2); ctx.quadraticCurveTo(15, 14, 0, 14); ctx.quadraticCurveTo(-15, 14, -20, -2); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fef08a';
      for (let d = -12; d <= 12; d += 6) { ctx.beginPath(); ctx.arc(d, 3, 1.3, 0, 6.283); ctx.fill(); }
      ctx.beginPath(); ctx.moveTo(0, -2); ctx.bezierCurveTo(-10, -10, -7, -24, fl * 0.5, -32 + fl * 0.3); ctx.bezierCurveTo(7, -24, 10, -10, 0, -2);
      const fg = ctx.createLinearGradient(0, -2, 0, -32);
      fg.addColorStop(0, '#38bdf8'); fg.addColorStop(0.25, '#f97316'); fg.addColorStop(0.65, '#facc15'); fg.addColorStop(1, '#fff');
      ctx.fillStyle = fg; ctx.fill();
      ctx.beginPath(); ctx.moveTo(0, -4); ctx.bezierCurveTo(-4, -9, -3, -17, fl * 0.25, -22); ctx.bezierCurveTo(3, -17, 4, -9, 0, -4);
      ctx.fillStyle = '#fff'; ctx.fill();
      ctx.restore();
    };

    const frame = (t, k) => {
      ctx.clearRect(0, 0, W, H);
      aarti = Math.max(0, aarti - 0.015 * k);
      const spd = 1 + aarti * 2.2;

      if (k) {
        rings.forEach((o) => { o.a = (o.a + o.speed * spd * k) % 360; o.g.setAttribute('transform', `rotate(${o.a})`); });
        emblem.setAttribute('transform', `translate(0,${Math.sin(t * 0.0022) * 4.5}) scale(${1 + Math.sin(t * 0.0015) * 0.015})`);
        ptr.x += (ptr.tx - ptr.x) * 0.06 * k; ptr.y += (ptr.ty - ptr.y) * 0.06 * k;
        st.style.transform = `translate3d(${ptr.x * 10}px,${ptr.y * 10}px,0)`;
      }

      stars.forEach((s) => {
        s.p += s.s * k;
        const al = 0.25 + (Math.sin(s.p) * 0.5 + 0.5) * 0.75, x = s.x * W, y = s.y * H;
        ctx.globalAlpha = al; ctx.fillStyle = s.c; ctx.beginPath(); ctx.arc(x, y, s.r, 0, 6.283); ctx.fill();
        if (s.cross && al > 0.7) {
          const l = s.r * 4.5; ctx.strokeStyle = s.c; ctx.lineWidth = 0.7;
          ctx.beginPath(); ctx.moveTo(x - l, y); ctx.lineTo(x + l, y); ctx.moveTo(x, y - l); ctx.lineTo(x, y + l); ctx.stroke();
        }
      });
      ctx.globalAlpha = 1;

      // orbit track + diyas (sorted by depth)
      const rx = base * 1.32, ry = base * 0.52, oy = cy + base * 0.16;
      ctx.save(); ctx.translate(cx, oy); ctx.rotate(TILT);
      ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, 6.283); ctx.strokeStyle = 'rgba(251,191,36,.32)'; ctx.lineWidth = 2.5; ctx.shadowColor = '#e879f9'; ctx.shadowBlur = 14; ctx.stroke();
      ctx.shadowBlur = 0; ctx.beginPath(); ctx.ellipse(0, 0, rx * 1.04, ry * 1.04, 0, 0, 6.283); ctx.strokeStyle = 'rgba(34,211,238,.24)'; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.restore();
      diyas.forEach((d) => { d.a += 0.0045 * spd * k; });
      [...diyas].sort((a, b) => Math.sin(a.a) - Math.sin(b.a)).forEach((d) => {
        const lx = Math.cos(d.a) * rx, ly = Math.sin(d.a) * ry;
        drawDiya(cx + lx * Math.cos(TILT) - ly * Math.sin(TILT), oy + lx * Math.sin(TILT) + ly * Math.cos(TILT), (0.68 + (Math.sin(d.a) + 1) * 0.26) * Math.min(1, base / 330), t, d.seed);
      });

      dust.forEach((p) => {
        p.x += (p.vx * spd * k) / W; p.y += (p.vy * spd * k) / H;
        if (p.y < -0.02) p.y = 1.02; if (p.x < -0.02) p.x = 1.02; if (p.x > 1.02) p.x = -0.02;
        ctx.globalAlpha = p.a * 0.25; ctx.fillStyle = '#fbbf24'; ctx.beginPath(); ctx.arc(p.x * W, p.y * H, p.s * 3, 0, 6.283); ctx.fill();
        ctx.globalAlpha = p.a; ctx.fillStyle = '#fde047'; ctx.beginPath(); ctx.arc(p.x * W, p.y * H, p.s, 0, 6.283); ctx.fill();
      });
      ctx.globalAlpha = 1;

      for (let i = waves.length - 1; i >= 0; i--) {
        const w = waves[i]; w.r += 8 * k; w.a *= Math.pow(0.94, k);
        ctx.beginPath(); ctx.arc(w.x, w.y, w.r, 0, 6.283); ctx.strokeStyle = `rgba(254,240,138,${w.a})`; ctx.lineWidth = 3; ctx.stroke();
        if (w.a < 0.02 || w.r > w.max) waves.splice(i, 1);
      }

      if (k && petals.length < 24 && r() < 0.08 * k) spawn(r() * W, -20, false);
      for (let i = petals.length - 1; i >= 0; i--) {
        const p = petals[i];
        p.sw += 0.03 * k; p.x += (p.vx + Math.sin(p.sw) * 0.45) * k; p.y += p.vy * k; p.vy += 0.015 * k; p.rot += p.vr * k; p.life -= k;
        if (p.life < 40) p.alpha = p.life / 40;
        drawPetal(p);
        if (p.life <= 0 || p.y > H + 40) petals.splice(i, 1);
      }
    };

    const loop = (t) => {
      const k = Math.min(3, (t - (last || t)) / 16.67); last = t;
      frame(t, k);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      cancelAnimationFrame(raf); raf = 0; last = 0;
      if (!fit()) return;
      if (reduce) { frame(0, 0); return; }
      raf = requestAnimationFrame(loop);
    };

    for (let i = 0; i < 18; i++) spawn(r() * 800, r() * 800, false);
    const ro = new ResizeObserver(start);
    ro.observe(el);
    if (!reduce) timer = setTimeout(() => W && burst(cx, cy, 36), 1500);

    const onMove = (e) => { const b = el.getBoundingClientRect(); ptr.tx = ((e.clientX - b.left) / b.width - 0.5) * 2; ptr.ty = ((e.clientY - b.top) / b.height - 0.5) * 2; };
    const onLeave = () => { ptr.tx = 0; ptr.ty = 0; };
    const onDown = (e) => { const b = el.getBoundingClientRect(); burst(e.clientX - b.left, e.clientY - b.top, 18, 180); };
    const onEmblem = (e) => {
      e.stopPropagation();
      const b = el.getBoundingClientRect(), q = emblem.getBoundingClientRect();
      burst(q.left - b.left + q.width / 2, q.top - b.top + q.height / 2, 16, 260);
    };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    cv.addEventListener('pointerdown', onDown);
    emblem.addEventListener('click', onEmblem);

    return () => {
      cancelAnimationFrame(raf); clearTimeout(timer); ro.disconnect();
      el.removeEventListener('pointermove', onMove); el.removeEventListener('pointerleave', onLeave);
      cv.removeEventListener('pointerdown', onDown); emblem.removeEventListener('click', onEmblem);
    };
  }, [reduce]);

  return (
    <div ref={root} className="absolute inset-0 overflow-hidden bg-[#03010a]">
      <div className="cm-bg absolute inset-0" />
      <canvas ref={cvs} className="absolute inset-0 h-full w-full" />
      <div ref={stage} className="pointer-events-none absolute">
        <div className="cm-aura cm-aura-1" /><div className="cm-aura cm-aura-2" />
        <div className="cm-intro h-full w-full" dangerouslySetInnerHTML={{ __html: cosmicSvg(festivalConfig.logoSrc) }} />
      </div>
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_90px_rgba(0,0,0,0.85)]" />
    </div>
  );
}
