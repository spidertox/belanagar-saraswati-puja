import { useMemo } from 'react';
import { buildQrSvg } from '../lib/qrArt.js';
import { festivalConfig } from '../config/festivalConfig.js';

// Saraswati-themed QR code. `value` is whatever the QR should open (a
// WhatsApp invite link, a UPI payment link, ...). Renders crisp at any size.
export default function ArtisticQR({ value, label, className = '', logoSrc = festivalConfig.logoSrc, tree = true }) {
  const svg = useMemo(() => {
    if (!value) return '';
    try {
      return buildQrSvg(value, { label, logoSrc, tree, animate: true });
    } catch {
      return ''; // value too long etc. - caller shows its fallback
    }
  }, [value, label, logoSrc, tree]);

  if (!svg) return null;
  // The string only contains numbers, fixed markup and an escaped logo URL / label.
  return <div className={className} dangerouslySetInnerHTML={{ __html: svg }} />;
}

// Turns the rendered QR into a PNG download (for printing on a flex banner or
// sharing on WhatsApp).
export async function downloadQrPng(value, { label = 'qr', fileName = 'qr.png', size = 1200 } = {}) {
  // An SVG drawn through <img> may not load outside images, so embed the logo as a data URI first.
  const logoBlob = await (await fetch(festivalConfig.logoSrc)).blob();
  const logoData = await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(logoBlob);
  });
  const svg = buildQrSvg(value, { label, logoSrc: logoData, tree: true });
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    canvas.getContext('2d').drawImage(img, 0, 0, size, size);
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = fileName;
    a.click();
  } finally {
    URL.revokeObjectURL(url);
  }
}
