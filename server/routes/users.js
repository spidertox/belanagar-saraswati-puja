// Visitor accounts: sign up with a REAL e-mail (one-time code sent to the
// inbox), log in, profile + avatar.
//
//   POST /api/users/register   {name,email,password,website,token}  -> sends a 6-digit code
//   POST /api/users/verify     {email,code}                         -> verifies + logs in
//   POST /api/users/resend     {email}
//   POST /api/users/login      {email,password}
//   POST /api/users/logout
//   GET  /api/users/me
//   PUT  /api/users/me         {name}
//   POST /api/users/avatar     {image: "data:image/...;base64,..."}  (<= 2 MB, jpg/png/webp)
//   GET  /api/users/avatar?u=<id>                                    (public image)
import crypto from 'node:crypto';
import { getFullDatabase, transact, storeImage, fetchStoredFile, deleteStoredMessage, notify } from '../telegramStore.js';
import {
  hashPassword, verifyPassword, createUserSessionCookie, clearUserSessionCookie, getUserId, hmac,
  checkLoginRateLimit,
} from '../auth.js';
import { checkEmail, normalizeEmail } from '../emailCheck.js';
import { sendMail } from '../mail.js';
import { verifyTurnstile } from './contact.js';
import * as oauth from './oauth.js';

function fail(status, message, errors) {
  const e = new Error(message);
  e.status = status;
  e.publicMessage = message;
  if (errors) e.errors = errors;
  return e;
}

const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_GAP_MS = 60 * 1000;
const MAX_SENDS_PER_HOUR = 5;
const MAX_OTP_TRIES = 5;
const UNVERIFIED_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const AVATAR_PER_HOUR = 10;
const EXT_OK = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

const hits = new Map();
function limited(key, max, windowMs) {
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > max;
}

const clean = (v, max) => (typeof v === 'string' ? v.replace(/\u0000/g, '').trim().slice(0, max) : '');
const clientIp = (req) =>
  String((req.headers && req.headers['x-forwarded-for']) || '').split(',')[0].trim() || (req.socket && req.socket.remoteAddress) || 'unknown';

const publicUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  avatarUrl: u.avatarFileId ? `/api/users/avatar?u=${encodeURIComponent(u.id)}&v=${u.avatarVersion || 0}` : '',
  createdAt: u.createdAt,
});

const passwordError = (p) =>
  typeof p !== 'string' || p.length < 8 ? 'पासवर्ड कम से कम 8 अक्षर का हो।' : p.length > 72 ? 'पासवर्ड 72 अक्षर से छोटा रखें।' : '';

const newOtp = () => String(crypto.randomInt(0, 1000000)).padStart(6, '0');
const otpHash = (userId, code) => hmac(`otp:${userId}:${code}`);

async function mailCode(user, code) {
  const text = `नमस्ते ${user.name},\n\nबेलानगर सरस्वती पूजा समिति की वेबसाइट पर आपका सत्यापन कोड: ${code}\n\nयह कोड 10 मिनट तक मान्य है। अगर आपने खाता नहीं बनाया है तो इस मेल को अनदेखा करें।`;
  const html = `<p>नमस्ते ${escapeHtml(user.name)},</p><p>बेलानगर सरस्वती पूजा समिति की वेबसाइट पर आपका सत्यापन कोड:</p><p style="font-size:28px;letter-spacing:6px;font-weight:bold">${code}</p><p>यह कोड 10 मिनट तक मान्य है। अगर आपने खाता नहीं बनाया है तो इस मेल को अनदेखा करें।</p>`;
  await sendMail({ to: user.email, subject: `आपका सत्यापन कोड: ${code}`, text, html });
}
const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function bodyOf(req) {
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body || {};
}

async function register(req, res) {
  const b = bodyOf(req);
  if (clean(b.website, 200)) return res.status(200).json({ ok: true, email: '' }); // honeypot
  const ip = clientIp(req);
  if (limited(`reg:${ip}`, 8, 60 * 60 * 1000)) throw fail(429, 'बहुत अधिक प्रयास। कृपया कुछ देर बाद दोबारा करें।');

  const name = clean(b.name, 60);
  const email = normalizeEmail(b.email);
  const errors = {};
  if (name.length < 2) errors.name = 'कृपया अपना नाम लिखें।';
  const pe = passwordError(b.password);
  if (pe) errors.password = pe;
  const ee = await checkEmail(email);
  if (ee) errors.email = ee;
  if (Object.keys(errors).length) throw fail(400, 'कृपया जानकारी जांचें।', errors);

  await verifyTurnstile(clean(b.token, 4096), ip);

  const passwordHash = hashPassword(b.password);
  const code = newOtp();
  let user;
  await transact((db) => {
    const now = Date.now();
    // forget sign-ups that were never verified
    db.users = (db.users || []).filter((u) => u.verified || now - new Date(u.createdAt).getTime() < UNVERIFIED_TTL_MS);
    const existing = db.users.find((u) => u.email === email);
    if (existing && existing.verified) throw fail(409, 'इस ईमेल से खाता पहले से है। कृपया लॉगिन करें।');
    if (existing) {
      if (existing.otpSentAt && now - existing.otpSentAt < RESEND_GAP_MS) throw fail(429, 'कृपया 1 मिनट बाद दोबारा कोड मंगाएं।');
      Object.assign(existing, { name, passwordHash });
      user = existing;
    } else {
      user = {
        id: `USR-${crypto.randomBytes(6).toString('hex')}`,
        name,
        email,
        passwordHash,
        verified: false,
        createdAt: new Date().toISOString(),
        sends: [],
      };
      db.users.push(user);
    }
    user.sends = (user.sends || []).filter((t) => now - t < 60 * 60 * 1000);
    if (user.sends.length >= MAX_SENDS_PER_HOUR) throw fail(429, 'इस ईमेल पर बहुत कोड भेजे जा चुके हैं। 1 घंटे बाद प्रयास करें।');
    user.sends.push(now);
    user.otpHash = otpHash(user.id, code);
    user.otpExp = now + OTP_TTL_MS;
    user.otpTries = 0;
    user.otpSentAt = now;
    user = { ...user };
  });
  await mailCode(user, code);
  return res.status(201).json({ ok: true, email });
}

async function resend(req, res) {
  const email = normalizeEmail(bodyOf(req).email);
  if (limited(`rs:${clientIp(req)}`, 10, 60 * 60 * 1000)) throw fail(429, 'बहुत अधिक प्रयास। कृपया कुछ देर बाद दोबारा करें।');
  const code = newOtp();
  let user = null;
  await transact((db) => {
    const u = (db.users || []).find((x) => x.email === email && !x.verified);
    if (!u) return;
    const now = Date.now();
    if (u.otpSentAt && now - u.otpSentAt < RESEND_GAP_MS) throw fail(429, 'कृपया 1 मिनट बाद दोबारा कोड मंगाएं।');
    u.sends = (u.sends || []).filter((t) => now - t < 60 * 60 * 1000);
    if (u.sends.length >= MAX_SENDS_PER_HOUR) throw fail(429, 'इस ईमेल पर बहुत कोड भेजे जा चुके हैं। 1 घंटे बाद प्रयास करें।');
    u.sends.push(now);
    Object.assign(u, { otpHash: otpHash(u.id, code), otpExp: now + OTP_TTL_MS, otpTries: 0, otpSentAt: now });
    user = { ...u };
  });
  if (user) await mailCode(user, code);
  return res.status(200).json({ ok: true }); // same answer whether or not the address exists
}

async function verify(req, res) {
  const b = bodyOf(req);
  const email = normalizeEmail(b.email);
  const code = clean(b.code, 10);
  if (!/^\d{6}$/.test(code)) throw fail(400, 'कोड 6 अंकों का होता है।');
  if (limited(`vf:${clientIp(req)}`, 30, 60 * 60 * 1000)) throw fail(429, 'बहुत अधिक प्रयास। कृपया कुछ देर बाद दोबारा करें।');
  let user = null;
  let problem = '';
  await transact((db) => {
    const u = (db.users || []).find((x) => x.email === email);
    if (!u || u.verified || !u.otpHash) {
      problem = 'कोड सही नहीं है या समाप्त हो गया है।';
      return;
    }
    if (Date.now() > u.otpExp || u.otpTries >= MAX_OTP_TRIES) {
      problem = 'कोड समाप्त हो गया है। कृपया नया कोड मंगाएं।';
      return;
    }
    u.otpTries += 1;
    const a = Buffer.from(otpHash(u.id, code));
    const c = Buffer.from(u.otpHash);
    if (a.length !== c.length || !crypto.timingSafeEqual(a, c)) {
      problem = u.otpTries >= MAX_OTP_TRIES ? 'बहुत गलत प्रयास। कृपया नया कोड मंगाएं।' : 'कोड सही नहीं है।';
      return;
    }
    u.verified = true;
    u.verifiedAt = new Date().toISOString();
    delete u.otpHash;
    delete u.otpExp;
    delete u.otpTries;
    user = { ...u };
  });
  if (!user) throw fail(400, problem);
  await notify(`👤 नया सदस्य: ${user.name} (${user.email})`);
  res.setHeader('Set-Cookie', createUserSessionCookie(user.id));
  return res.status(200).json({ user: publicUser(user) });
}

async function login(req, res) {
  const b = bodyOf(req);
  const ip = clientIp(req);
  if (!checkLoginRateLimit(`user:${ip}`)) throw fail(429, 'बहुत अधिक प्रयास। कृपया कुछ देर बाद प्रयास करें।');
  const email = normalizeEmail(b.email);
  const data = await getFullDatabase();
  const u = (data.users || []).find((x) => x.email === email);
  const ok = u && typeof b.password === 'string' && verifyPassword(b.password, u.passwordHash);
  if (!ok) throw fail(401, 'ईमेल या पासवर्ड गलत है।');
  if (!u.verified) throw fail(403, 'पहले अपना ईमेल सत्यापित करें।');
  res.setHeader('Set-Cookie', createUserSessionCookie(u.id));
  return res.status(200).json({ user: publicUser(u) });
}

async function me(req, res) {
  const uid = getUserId(req);
  if (!uid) return res.status(200).json({ user: null });
  const data = await getFullDatabase();
  const u = (data.users || []).find((x) => x.id === uid && x.verified);
  if (!u) return res.status(200).json({ user: null });
  if (req.method === 'PUT') {
    const name = clean(bodyOf(req).name, 60);
    if (name.length < 2) throw fail(400, 'कृपया अपना नाम लिखें।');
    let updated;
    await transact((db) => {
      const row = (db.users || []).find((x) => x.id === uid);
      if (row) {
        row.name = name;
        updated = { ...row };
      }
    });
    return res.status(200).json({ user: publicUser(updated || u) });
  }
  return res.status(200).json({ user: publicUser(u) });
}

// jpeg / png / webp by their first bytes, not by what the browser claims
function sniff(buf) {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.length > 8 && buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (buf.length > 12 && buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP') return 'image/webp';
  return '';
}

async function avatar(req, res) {
  if (req.method === 'GET') {
    const uid = clean((req.query || {}).u, 40);
    const data = await getFullDatabase();
    const u = (data.users || []).find((x) => x.id === uid);
    if (!u || !u.avatarFileId) return res.status(404).json({ error: 'फोटो नहीं मिली।' });
    const buf = await fetchStoredFile(u.avatarFileId);
    res.setHeader('Content-Type', u.avatarMime || 'image/jpeg');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
    return res.status(200).end(buf);
  }
  if (req.method !== 'POST') throw fail(405, 'Method not allowed');
  const uid = getUserId(req);
  if (!uid) throw fail(401, 'कृपया पहले लॉगिन करें।');
  if (limited(`av:${uid}`, AVATAR_PER_HOUR, 60 * 60 * 1000)) throw fail(429, 'एक घंटे में 10 से अधिक फोटो अपलोड नहीं हो सकतीं।');

  const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(String(bodyOf(req).image || ''));
  if (!m) throw fail(400, 'केवल JPG, PNG या WEBP फोटो मान्य है।');
  const buf = Buffer.from(m[2], 'base64');
  if (buf.length > MAX_AVATAR_BYTES) throw fail(413, 'फोटो 2MB से छोटी होनी चाहिए।');
  const real = sniff(buf);
  if (!real || real !== m[1]) throw fail(400, 'यह फ़ाइल असली फोटो नहीं लगती। केवल JPG, PNG या WEBP मान्य है।');

  const data = await getFullDatabase();
  const u = (data.users || []).find((x) => x.id === uid && x.verified);
  if (!u) throw fail(401, 'कृपया पहले लॉगिन करें।');

  const stored = await storeImage(buf, real, `avatar-${uid}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${EXT_OK[real]}`);
  let oldMsg = null;
  let updated;
  try {
    await transact((db) => {
      const row = db.users.find((x) => x.id === uid);
      oldMsg = row.avatarMessageId || null;
      Object.assign(row, { avatarFileId: stored.fileId, avatarMessageId: stored.messageId, avatarMime: real, avatarVersion: (row.avatarVersion || 0) + 1 });
      updated = { ...row };
    });
  } catch (err) {
    await deleteStoredMessage(stored.messageId); // DB save failed: do not leave an orphan file
    throw err;
  }
  if (oldMsg) await deleteStoredMessage(oldMsg);
  return res.status(200).json({ user: publicUser(updated) });
}

export default async function users(req, res, action) {
  const m = req.method;
  if (action === 'providers' && m === 'GET') return oauth.providers(req, res);
  if (action === 'oauth' && m === 'GET') return oauth.start(req, res);
  if (action === 'oauth-callback' && m === 'GET') return oauth.callback(req, res);
  if (action === 'register' && m === 'POST') return register(req, res);
  if (action === 'verify' && m === 'POST') return verify(req, res);
  if (action === 'resend' && m === 'POST') return resend(req, res);
  if (action === 'login' && m === 'POST') return login(req, res);
  if (action === 'logout' && m === 'POST') {
    res.setHeader('Set-Cookie', clearUserSessionCookie());
    return res.status(200).json({ ok: true });
  }
  if (action === 'me' && (m === 'GET' || m === 'PUT')) return me(req, res);
  if (action === 'avatar' && (m === 'GET' || m === 'POST')) return avatar(req, res);
  return res.status(404).json({ error: 'Not found' });
}
