// POST /api/contact - website contact form.
//
// Spam protection, in order:
//   1. honeypot field ("website") - bots fill it, people never see it
//   2. Cloudflare Turnstile token, verified server-side (TURNSTILE_SECRET_KEY)
//   3. per-IP rate limit (best effort: serverless instances don't share memory)
//   4. strict length limits
import { sendChatMessage } from '../telegramStore.js';

const TURNSTILE_VERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map();

export function fail(status, publicMessage) {
  const err = new Error(publicMessage);
  err.status = status;
  err.publicMessage = publicMessage;
  return err;
}

function clientIp(req) {
  const fwd = String((req.headers && req.headers['x-forwarded-for']) || '').split(',')[0].trim();
  return fwd || (req.socket && req.socket.remoteAddress) || 'unknown';
}

function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear(); // keep memory bounded
  return recent.length > MAX_PER_WINDOW;
}

export async function verifyTurnstile(token, ip) {
  const secret = (process.env.TURNSTILE_SECRET_KEY || '').trim();
  const isProd = process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';
  if (!secret) {
    // No Turnstile keys: the honeypot + per-IP limit still protect the form.
    // (Before, production refused every message, so nothing reached Telegram.)
    if (isProd) console.warn('[contact] TURNSTILE_SECRET_KEY not set: running without the human check');
    return;
  }
  if (!token) throw fail(400, 'कृपया "मैं इंसान हूँ" वाली जाँच पूरी करें।');
  const res = await fetch(TURNSTILE_VERIFY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret, response: token, remoteip: ip }),
  });
  const data = await res.json().catch(() => null);
  if (!data || !data.success) throw fail(400, 'सुरक्षा जाँच पूरी नहीं हुई। कृपया दोबारा प्रयास करें।');
}

const clean = (v, max) => (typeof v === 'string' ? v.replace(/\u0000/g, '').trim().slice(0, max) : '');

export default async function contact(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};

  // honeypot: pretend success so the bot learns nothing
  if (clean(body.website, 200)) return res.status(200).json({ ok: true });

  const name = clean(body.name, 80);
  const contactInfo = clean(body.contactInfo, 120);
  const message = clean(body.message, 1000);
  if (name.length < 2) throw fail(400, 'कृपया अपना नाम लिखें।');
  if (message.length < 10) throw fail(400, 'संदेश कम से कम 10 अक्षर का होना चाहिए।');

  const ip = clientIp(req);
  if (rateLimited(ip)) throw fail(429, 'बहुत ज़्यादा संदेश भेजे गए हैं। कृपया कुछ देर बाद प्रयास करें।');
  await verifyTurnstile(clean(body.token, 4096), ip);

  await sendChatMessage(
    `📩 वेबसाइट से नया संदेश\n\nनाम: ${name}\nसंपर्क: ${contactInfo || '(नहीं दिया)'}\n\n${message}`
  );
  return res.status(200).json({ ok: true });
}
