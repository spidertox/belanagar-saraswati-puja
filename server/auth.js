// Dependency-free admin auth: a single shared admin password (its scrypt
// hash lives in ADMIN_PASSWORD_HASH), and a signed, httpOnly session cookie
// (HMAC-SHA256 with SESSION_SECRET). No database, no third-party auth
// service — just Node's built-in crypto module.
import crypto from 'node:crypto';

const SESSION_COOKIE = 'admin_session';
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 hours

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, hash] = storedHash.split(':');
  const hashBuffer = Buffer.from(hash, 'hex');
  const testBuffer = crypto.scryptSync(password, salt, 64);
  return hashBuffer.length === testBuffer.length && crypto.timingSafeEqual(hashBuffer, testBuffer);
}

function sign(payload, secret) {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(data).digest('base64url');
  return `${data}.${sig}`;
}

function verify(token, secret) {
  if (!token || !token.includes('.')) return null;
  const [data, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', secret).update(data).digest('base64url');
  const sigBuffer = Buffer.from(sig);
  const expectedBuffer = Buffer.from(expected);
  if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString());
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    const err = new Error('सर्वर सही से सेटअप नहीं है। कृपया एडमिन से संपर्क करें। (SESSION_SECRET missing)');
    err.status = 500;
    err.publicMessage = 'सर्वर सही से सेटअप नहीं है। कृपया एडमिन से संपर्क करें।';
    throw err;
  }
  return secret;
}

export function createSessionCookie() {
  const token = sign({ exp: Date.now() + SESSION_DURATION_MS }, getSessionSecret());
  const maxAge = Math.floor(SESSION_DURATION_MS / 1000);
  return `${SESSION_COOKIE}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAge}`;
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}

function readCookie(req, name) {
  const header = req.headers.cookie || '';
  const match = header.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function isAuthenticated(req) {
  const token = readCookie(req, SESSION_COOKIE);
  if (!token) return false;
  return Boolean(verify(token, getSessionSecret()));
}

/**
 * Very small best-effort brute-force slowdown for the login endpoint. This
 * only protects a single warm serverless instance (state is lost on cold
 * start and isn't shared across instances) — it is not a substitute for a
 * real rate-limiting service, so use a long admin password regardless.
 */
const loginAttempts = new Map();
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 10 * 60 * 1000;

export function checkLoginRateLimit(key) {
  const now = Date.now();
  const entry = loginAttempts.get(key);
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  entry.count += 1;
  return entry.count <= MAX_ATTEMPTS;
}
