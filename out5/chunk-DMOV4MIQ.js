var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// ../../../../../home/claude/site_src/belanagar-saraswati-puja/server/auth.js
import crypto from "node:crypto";
var SESSION_COOKIE = "admin_session";
var SESSION_DURATION_MS = 8 * 60 * 60 * 1e3;
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}
function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(":")) return false;
  const [salt, hash] = storedHash.split(":");
  const hashBuffer = Buffer.from(hash, "hex");
  const testBuffer = crypto.scryptSync(password, salt, 64);
  return hashBuffer.length === testBuffer.length && crypto.timingSafeEqual(hashBuffer, testBuffer);
}
function sign(payload, secret) {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(data).digest("base64url");
  return `${data}.${sig}`;
}
function verify(token, secret) {
  if (!token || !token.includes(".")) return null;
  const [data, sig] = token.split(".");
  const expected = crypto.createHmac("sha256", secret).update(data).digest("base64url");
  const sigBuffer = Buffer.from(sig);
  const expectedBuffer = Buffer.from(expected);
  if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString());
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    const err = new Error("\u0938\u0930\u094D\u0935\u0930 \u0938\u0939\u0940 \u0938\u0947 \u0938\u0947\u091F\u0905\u092A \u0928\u0939\u0940\u0902 \u0939\u0948\u0964 \u0915\u0943\u092A\u092F\u093E \u090F\u0921\u092E\u093F\u0928 \u0938\u0947 \u0938\u0902\u092A\u0930\u094D\u0915 \u0915\u0930\u0947\u0902\u0964 (SESSION_SECRET missing)");
    err.status = 500;
    err.publicMessage = "\u0938\u0930\u094D\u0935\u0930 \u0938\u0939\u0940 \u0938\u0947 \u0938\u0947\u091F\u0905\u092A \u0928\u0939\u0940\u0902 \u0939\u0948\u0964 \u0915\u0943\u092A\u092F\u093E \u090F\u0921\u092E\u093F\u0928 \u0938\u0947 \u0938\u0902\u092A\u0930\u094D\u0915 \u0915\u0930\u0947\u0902\u0964";
    throw err;
  }
  return secret;
}
function createSessionCookie() {
  const token = sign({ exp: Date.now() + SESSION_DURATION_MS }, getSessionSecret());
  const maxAge = Math.floor(SESSION_DURATION_MS / 1e3);
  return `${SESSION_COOKIE}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAge}`;
}
function clearSessionCookie() {
  return `${SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}
function readCookie(req, name) {
  const header = req.headers && req.headers.cookie || "";
  const match = header.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}
function isAuthenticated(req) {
  try {
    const token = readCookie(req, SESSION_COOKIE);
    if (!token) return false;
    return Boolean(verify(token, getSessionSecret()));
  } catch {
    return false;
  }
}
var loginAttempts = /* @__PURE__ */ new Map();
var MAX_ATTEMPTS = 8;
var WINDOW_MS = 10 * 60 * 1e3;
function clearLoginRateLimit(key) {
  loginAttempts.delete(key);
}
function checkLoginRateLimit(key) {
  const now = Date.now();
  if (loginAttempts.size > 2e3) loginAttempts.clear();
  const entry = loginAttempts.get(key);
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  entry.count += 1;
  return entry.count <= MAX_ATTEMPTS;
}
var USER_COOKIE = "user_session";
var USER_SESSION_MS = 30 * 24 * 60 * 60 * 1e3;
function createUserSessionCookie(userId) {
  const token = sign({ uid: userId, exp: Date.now() + USER_SESSION_MS }, getSessionSecret());
  return `${USER_COOKIE}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${Math.floor(USER_SESSION_MS / 1e3)}`;
}
function clearUserSessionCookie() {
  return `${USER_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}
function getUserId(req) {
  try {
    const payload = verify(readCookie(req, USER_COOKIE), getSessionSecret());
    return payload && typeof payload.uid === "string" ? payload.uid : null;
  } catch {
    return null;
  }
}
function hmac(text) {
  return crypto.createHmac("sha256", getSessionSecret()).update(String(text)).digest("hex");
}
var OAUTH_NONCE_COOKIE = "oauth_nonce";
function createOAuthState(provider) {
  const nonce = crypto.randomBytes(16).toString("hex");
  const state = sign({ n: nonce, p: provider, exp: Date.now() + 10 * 60 * 1e3 }, getSessionSecret());
  const cookie = `${OAUTH_NONCE_COOKIE}=${nonce}; HttpOnly; Secure; SameSite=Lax; Path=/api; Max-Age=600`;
  return { state, cookie };
}
function checkOAuthState(req, state) {
  try {
    const payload = verify(state, getSessionSecret());
    const nonce = readCookie(req, OAUTH_NONCE_COOKIE);
    if (!payload || !nonce || payload.n !== nonce) return null;
    return payload.p;
  } catch {
    return null;
  }
}
var clearOAuthCookie = () => `${OAUTH_NONCE_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/api; Max-Age=0`;

export {
  __export,
  hashPassword,
  verifyPassword,
  createSessionCookie,
  clearSessionCookie,
  isAuthenticated,
  clearLoginRateLimit,
  checkLoginRateLimit,
  createUserSessionCookie,
  clearUserSessionCookie,
  getUserId,
  hmac,
  createOAuthState,
  checkOAuthState,
  clearOAuthCookie
};
