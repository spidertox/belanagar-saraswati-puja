import {
  checkEmail,
  normalizeEmail
} from "../chunk-F2C4TRBC.js";

// ../../../../../home/claude/site_src/belanagar-saraswati-puja/server/routes/users.js
import crypto3 from "node:crypto";
import { getFullDatabase, transact as transact2, storeImage, fetchStoredFile, deleteStoredMessage, notify as notify2 } from "/home/claude/site_src/belanagar-saraswati-puja/stub-store.mjs";

// ../../../../../home/claude/site_src/belanagar-saraswati-puja/server/auth.js
import crypto from "node:crypto";
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
var loginAttempts = /* @__PURE__ */ new Map();
var MAX_ATTEMPTS = 8;
var WINDOW_MS = 10 * 60 * 1e3;
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

// ../../../../../home/claude/site_src/belanagar-saraswati-puja/server/mail.js
function mailConfigured() {
  return Boolean((process.env.BREVO_API_KEY || "").trim() && (process.env.MAIL_FROM_EMAIL || "").trim());
}
async function sendMail({ to, subject, text, html }) {
  if (!mailConfigured()) {
    const isProd = process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
    if (isProd) {
      const err = new Error("mail not configured");
      err.status = 503;
      err.publicMessage = "\u0908\u092E\u0947\u0932 \u0938\u0947\u0935\u093E \u0905\u092D\u0940 \u091A\u093E\u0932\u0942 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964 \u0915\u0943\u092A\u092F\u093E \u092C\u093E\u0926 \u092E\u0947\u0902 \u092A\u094D\u0930\u092F\u093E\u0938 \u0915\u0930\u0947\u0902\u0964";
      throw err;
    }
    console.log(`[dev mail] to=${to} subject=${subject}
${text}`);
    return;
  }
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": process.env.BREVO_API_KEY.trim(), "Content-Type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      sender: { email: process.env.MAIL_FROM_EMAIL.trim(), name: (process.env.MAIL_FROM_NAME || "\u092C\u0947\u0932\u093E\u0928\u0917\u0930 \u0938\u0930\u0938\u094D\u0935\u0924\u0940 \u092A\u0942\u091C\u093E \u0938\u092E\u093F\u0924\u093F").trim() },
      to: [{ email: to }],
      subject,
      textContent: text,
      htmlContent: html
    })
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("[mail] Brevo error", res.status, body.slice(0, 300));
    const err = new Error("mail send failed");
    err.status = 502;
    err.publicMessage = "\u0908\u092E\u0947\u0932 \u092D\u0947\u091C\u093E \u0928\u0939\u0940\u0902 \u091C\u093E \u0938\u0915\u093E\u0964 \u0915\u0943\u092A\u092F\u093E \u0915\u0941\u091B \u0926\u0947\u0930 \u092C\u093E\u0926 \u092A\u094D\u0930\u092F\u093E\u0938 \u0915\u0930\u0947\u0902\u0964";
    throw err;
  }
}

// ../../../../../home/claude/site_src/belanagar-saraswati-puja/server/routes/contact.js
import { sendChatMessage } from "/home/claude/site_src/belanagar-saraswati-puja/stub-store.mjs";
var TURNSTILE_VERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
var WINDOW_MS2 = 60 * 60 * 1e3;
function fail(status, publicMessage) {
  const err = new Error(publicMessage);
  err.status = status;
  err.publicMessage = publicMessage;
  return err;
}
async function verifyTurnstile(token, ip) {
  const secret = (process.env.TURNSTILE_SECRET_KEY || "").trim();
  const isProd = process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
  if (!secret) {
    if (isProd) console.warn("[contact] TURNSTILE_SECRET_KEY not set: running without the human check");
    return;
  }
  if (!token) throw fail(400, '\u0915\u0943\u092A\u092F\u093E "\u092E\u0948\u0902 \u0907\u0902\u0938\u093E\u0928 \u0939\u0942\u0901" \u0935\u093E\u0932\u0940 \u091C\u093E\u0901\u091A \u092A\u0942\u0930\u0940 \u0915\u0930\u0947\u0902\u0964');
  const res = await fetch(TURNSTILE_VERIFY, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret, response: token, remoteip: ip })
  });
  const data = await res.json().catch(() => null);
  if (!data || !data.success) throw fail(400, "\u0938\u0941\u0930\u0915\u094D\u0937\u093E \u091C\u093E\u0901\u091A \u092A\u0942\u0930\u0940 \u0928\u0939\u0940\u0902 \u0939\u0941\u0908\u0964 \u0915\u0943\u092A\u092F\u093E \u0926\u094B\u092C\u093E\u0930\u093E \u092A\u094D\u0930\u092F\u093E\u0938 \u0915\u0930\u0947\u0902\u0964");
}

// ../../../../../home/claude/site_src/belanagar-saraswati-puja/server/routes/oauth.js
import crypto2 from "node:crypto";
import { transact, notify } from "/home/claude/site_src/belanagar-saraswati-puja/stub-store.mjs";
var env = (k) => (process.env[k] || "").trim();
var PROVIDERS = {
  google: {
    id: () => env("GOOGLE_CLIENT_ID"),
    secret: () => env("GOOGLE_CLIENT_SECRET"),
    authorize: "https://accounts.google.com/o/oauth2/v2/auth",
    token: "https://oauth2.googleapis.com/token",
    scope: "openid email profile",
    extra: { prompt: "select_account" }
  },
  microsoft: {
    id: () => env("MICROSOFT_CLIENT_ID"),
    secret: () => env("MICROSOFT_CLIENT_SECRET"),
    authorize: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
    token: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    scope: "openid email profile User.Read",
    extra: { prompt: "select_account", response_mode: "query" }
  }
};
var configured = (name) => Boolean(PROVIDERS[name] && PROVIDERS[name].id() && PROVIDERS[name].secret());
function baseUrl(req) {
  const site = env("SITE_URL").replace(/\/+$/, "");
  if (site) return site;
  const h = req.headers || {};
  return `https://${h["x-forwarded-host"] || h.host}`;
}
var redirectUri = (req) => `${baseUrl(req)}/api/users/oauth-callback`;
function redirect(res, location, cookies = []) {
  if (cookies.length) res.setHeader("Set-Cookie", cookies);
  res.setHeader("Location", location);
  return res.status(302).end();
}
function providers(req, res) {
  return res.status(200).json({ google: configured("google"), microsoft: configured("microsoft") });
}
function start(req, res) {
  const name = String((req.query || {}).provider || "");
  if (!configured(name)) return redirect(res, "/login?error=provider");
  const p = PROVIDERS[name];
  const { state, cookie } = createOAuthState(name);
  const q = new URLSearchParams({
    client_id: p.id(),
    redirect_uri: redirectUri(req),
    response_type: "code",
    scope: p.scope,
    state,
    ...p.extra
  });
  return redirect(res, `${p.authorize}?${q}`, [cookie]);
}
async function fetchProfile(name, code, req) {
  const p = PROVIDERS[name];
  const tokenRes = await fetch(p.token, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: p.id(),
      client_secret: p.secret(),
      redirect_uri: redirectUri(req),
      grant_type: "authorization_code"
    })
  });
  const tok = await tokenRes.json().catch(() => null);
  if (!tok || !tok.access_token) throw new Error(`token exchange failed: ${tok && (tok.error_description || tok.error)}`);
  const auth = { Authorization: `Bearer ${tok.access_token}` };
  if (name === "google") {
    const info = await (await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: auth })).json();
    if (!info.email || info.email_verified === false) throw new Error("google email not verified");
    return { email: info.email, name: info.name || info.given_name || info.email.split("@")[0] };
  }
  const me2 = await (await fetch("https://graph.microsoft.com/v1.0/me", { headers: auth })).json();
  const email = me2.mail || (/@/.test(me2.userPrincipalName || "") ? me2.userPrincipalName : "");
  if (!email) throw new Error("microsoft account has no email");
  return { email, name: me2.displayName || email.split("@")[0] };
}
async function callback(req, res) {
  const q = req.query || {};
  const fail3 = () => redirect(res, "/login?error=oauth", [clearOAuthCookie()]);
  if (q.error || !q.code || !q.state) return fail3();
  const name = checkOAuthState(req, String(q.state));
  if (!name || !configured(name)) return fail3();
  let profile;
  try {
    profile = await fetchProfile(name, String(q.code), req);
  } catch (err) {
    console.error("[oauth]", name, err && err.message);
    return fail3();
  }
  const email = profile.email.trim().toLowerCase();
  let user;
  let created = false;
  await transact((db) => {
    db.users = db.users || [];
    let u = db.users.find((x) => x.email === email);
    if (!u) {
      u = { id: `USR-${crypto2.randomBytes(6).toString("hex")}`, name: String(profile.name).slice(0, 60), email, passwordHash: "", verified: true, provider: name, createdAt: (/* @__PURE__ */ new Date()).toISOString() };
      db.users.push(u);
      created = true;
    } else if (!u.verified) {
      Object.assign(u, { verified: true, verifiedAt: (/* @__PURE__ */ new Date()).toISOString() });
      delete u.otpHash;
    }
    user = { ...u };
  });
  if (created) await notify(`\u{1F464} \u0928\u092F\u093E \u0938\u0926\u0938\u094D\u092F (${name}): ${user.name} (${user.email})`);
  return redirect(res, "/account", [createUserSessionCookie(user.id), clearOAuthCookie()]);
}

// ../../../../../home/claude/site_src/belanagar-saraswati-puja/server/routes/users.js
function fail2(status, message, errors) {
  const e = new Error(message);
  e.status = status;
  e.publicMessage = message;
  if (errors) e.errors = errors;
  return e;
}
var OTP_TTL_MS = 10 * 60 * 1e3;
var RESEND_GAP_MS = 60 * 1e3;
var MAX_SENDS_PER_HOUR = 5;
var MAX_OTP_TRIES = 5;
var UNVERIFIED_TTL_MS = 24 * 60 * 60 * 1e3;
var MAX_AVATAR_BYTES = 2 * 1024 * 1024;
var AVATAR_PER_HOUR = 10;
var EXT_OK = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
var hits = /* @__PURE__ */ new Map();
function limited(key, max, windowMs) {
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5e3) hits.clear();
  return recent.length > max;
}
var clean = (v, max) => typeof v === "string" ? v.replace(/\u0000/g, "").trim().slice(0, max) : "";
var clientIp = (req) => String(req.headers && req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.socket && req.socket.remoteAddress || "unknown";
var publicUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  avatarUrl: u.avatarFileId ? `/api/users/avatar?u=${encodeURIComponent(u.id)}&v=${u.avatarVersion || 0}` : "",
  createdAt: u.createdAt
});
var passwordError = (p) => typeof p !== "string" || p.length < 8 ? "\u092A\u093E\u0938\u0935\u0930\u094D\u0921 \u0915\u092E \u0938\u0947 \u0915\u092E 8 \u0905\u0915\u094D\u0937\u0930 \u0915\u093E \u0939\u094B\u0964" : p.length > 72 ? "\u092A\u093E\u0938\u0935\u0930\u094D\u0921 72 \u0905\u0915\u094D\u0937\u0930 \u0938\u0947 \u091B\u094B\u091F\u093E \u0930\u0916\u0947\u0902\u0964" : "";
var newOtp = () => String(crypto3.randomInt(0, 1e6)).padStart(6, "0");
var otpHash = (userId, code) => hmac(`otp:${userId}:${code}`);
async function mailCode(user, code) {
  const text = `\u0928\u092E\u0938\u094D\u0924\u0947 ${user.name},

\u092C\u0947\u0932\u093E\u0928\u0917\u0930 \u0938\u0930\u0938\u094D\u0935\u0924\u0940 \u092A\u0942\u091C\u093E \u0938\u092E\u093F\u0924\u093F \u0915\u0940 \u0935\u0947\u092C\u0938\u093E\u0907\u091F \u092A\u0930 \u0906\u092A\u0915\u093E \u0938\u0924\u094D\u092F\u093E\u092A\u0928 \u0915\u094B\u0921: ${code}

\u092F\u0939 \u0915\u094B\u0921 10 \u092E\u093F\u0928\u091F \u0924\u0915 \u092E\u093E\u0928\u094D\u092F \u0939\u0948\u0964 \u0905\u0917\u0930 \u0906\u092A\u0928\u0947 \u0916\u093E\u0924\u093E \u0928\u0939\u0940\u0902 \u092C\u0928\u093E\u092F\u093E \u0939\u0948 \u0924\u094B \u0907\u0938 \u092E\u0947\u0932 \u0915\u094B \u0905\u0928\u0926\u0947\u0916\u093E \u0915\u0930\u0947\u0902\u0964`;
  const html = `<p>\u0928\u092E\u0938\u094D\u0924\u0947 ${escapeHtml(user.name)},</p><p>\u092C\u0947\u0932\u093E\u0928\u0917\u0930 \u0938\u0930\u0938\u094D\u0935\u0924\u0940 \u092A\u0942\u091C\u093E \u0938\u092E\u093F\u0924\u093F \u0915\u0940 \u0935\u0947\u092C\u0938\u093E\u0907\u091F \u092A\u0930 \u0906\u092A\u0915\u093E \u0938\u0924\u094D\u092F\u093E\u092A\u0928 \u0915\u094B\u0921:</p><p style="font-size:28px;letter-spacing:6px;font-weight:bold">${code}</p><p>\u092F\u0939 \u0915\u094B\u0921 10 \u092E\u093F\u0928\u091F \u0924\u0915 \u092E\u093E\u0928\u094D\u092F \u0939\u0948\u0964 \u0905\u0917\u0930 \u0906\u092A\u0928\u0947 \u0916\u093E\u0924\u093E \u0928\u0939\u0940\u0902 \u092C\u0928\u093E\u092F\u093E \u0939\u0948 \u0924\u094B \u0907\u0938 \u092E\u0947\u0932 \u0915\u094B \u0905\u0928\u0926\u0947\u0916\u093E \u0915\u0930\u0947\u0902\u0964</p>`;
  await sendMail({ to: user.email, subject: `\u0906\u092A\u0915\u093E \u0938\u0924\u094D\u092F\u093E\u092A\u0928 \u0915\u094B\u0921: ${code}`, text, html });
}
var escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
function bodyOf(req) {
  if (typeof req.body === "string") {
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
  if (clean(b.website, 200)) return res.status(200).json({ ok: true, email: "" });
  const ip = clientIp(req);
  if (limited(`reg:${ip}`, 8, 60 * 60 * 1e3)) throw fail2(429, "\u092C\u0939\u0941\u0924 \u0905\u0927\u093F\u0915 \u092A\u094D\u0930\u092F\u093E\u0938\u0964 \u0915\u0943\u092A\u092F\u093E \u0915\u0941\u091B \u0926\u0947\u0930 \u092C\u093E\u0926 \u0926\u094B\u092C\u093E\u0930\u093E \u0915\u0930\u0947\u0902\u0964");
  const name = clean(b.name, 60);
  const email = normalizeEmail(b.email);
  const errors = {};
  if (name.length < 2) errors.name = "\u0915\u0943\u092A\u092F\u093E \u0905\u092A\u0928\u093E \u0928\u093E\u092E \u0932\u093F\u0916\u0947\u0902\u0964";
  const pe = passwordError(b.password);
  if (pe) errors.password = pe;
  const ee = await checkEmail(email);
  if (ee) errors.email = ee;
  if (Object.keys(errors).length) throw fail2(400, "\u0915\u0943\u092A\u092F\u093E \u091C\u093E\u0928\u0915\u093E\u0930\u0940 \u091C\u093E\u0902\u091A\u0947\u0902\u0964", errors);
  await verifyTurnstile(clean(b.token, 4096), ip);
  const passwordHash = hashPassword(b.password);
  const code = newOtp();
  let user;
  await transact2((db) => {
    const now = Date.now();
    db.users = (db.users || []).filter((u) => u.verified || now - new Date(u.createdAt).getTime() < UNVERIFIED_TTL_MS);
    const existing = db.users.find((u) => u.email === email);
    if (existing && existing.verified) throw fail2(409, "\u0907\u0938 \u0908\u092E\u0947\u0932 \u0938\u0947 \u0916\u093E\u0924\u093E \u092A\u0939\u0932\u0947 \u0938\u0947 \u0939\u0948\u0964 \u0915\u0943\u092A\u092F\u093E \u0932\u0949\u0917\u093F\u0928 \u0915\u0930\u0947\u0902\u0964");
    if (existing) {
      if (existing.otpSentAt && now - existing.otpSentAt < RESEND_GAP_MS) throw fail2(429, "\u0915\u0943\u092A\u092F\u093E 1 \u092E\u093F\u0928\u091F \u092C\u093E\u0926 \u0926\u094B\u092C\u093E\u0930\u093E \u0915\u094B\u0921 \u092E\u0902\u0917\u093E\u090F\u0902\u0964");
      Object.assign(existing, { name, passwordHash });
      user = existing;
    } else {
      user = {
        id: `USR-${crypto3.randomBytes(6).toString("hex")}`,
        name,
        email,
        passwordHash,
        verified: false,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        sends: []
      };
      db.users.push(user);
    }
    user.sends = (user.sends || []).filter((t) => now - t < 60 * 60 * 1e3);
    if (user.sends.length >= MAX_SENDS_PER_HOUR) throw fail2(429, "\u0907\u0938 \u0908\u092E\u0947\u0932 \u092A\u0930 \u092C\u0939\u0941\u0924 \u0915\u094B\u0921 \u092D\u0947\u091C\u0947 \u091C\u093E \u091A\u0941\u0915\u0947 \u0939\u0948\u0902\u0964 1 \u0918\u0902\u091F\u0947 \u092C\u093E\u0926 \u092A\u094D\u0930\u092F\u093E\u0938 \u0915\u0930\u0947\u0902\u0964");
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
  if (limited(`rs:${clientIp(req)}`, 10, 60 * 60 * 1e3)) throw fail2(429, "\u092C\u0939\u0941\u0924 \u0905\u0927\u093F\u0915 \u092A\u094D\u0930\u092F\u093E\u0938\u0964 \u0915\u0943\u092A\u092F\u093E \u0915\u0941\u091B \u0926\u0947\u0930 \u092C\u093E\u0926 \u0926\u094B\u092C\u093E\u0930\u093E \u0915\u0930\u0947\u0902\u0964");
  const code = newOtp();
  let user = null;
  await transact2((db) => {
    const u = (db.users || []).find((x) => x.email === email && !x.verified);
    if (!u) return;
    const now = Date.now();
    if (u.otpSentAt && now - u.otpSentAt < RESEND_GAP_MS) throw fail2(429, "\u0915\u0943\u092A\u092F\u093E 1 \u092E\u093F\u0928\u091F \u092C\u093E\u0926 \u0926\u094B\u092C\u093E\u0930\u093E \u0915\u094B\u0921 \u092E\u0902\u0917\u093E\u090F\u0902\u0964");
    u.sends = (u.sends || []).filter((t) => now - t < 60 * 60 * 1e3);
    if (u.sends.length >= MAX_SENDS_PER_HOUR) throw fail2(429, "\u0907\u0938 \u0908\u092E\u0947\u0932 \u092A\u0930 \u092C\u0939\u0941\u0924 \u0915\u094B\u0921 \u092D\u0947\u091C\u0947 \u091C\u093E \u091A\u0941\u0915\u0947 \u0939\u0948\u0902\u0964 1 \u0918\u0902\u091F\u0947 \u092C\u093E\u0926 \u092A\u094D\u0930\u092F\u093E\u0938 \u0915\u0930\u0947\u0902\u0964");
    u.sends.push(now);
    Object.assign(u, { otpHash: otpHash(u.id, code), otpExp: now + OTP_TTL_MS, otpTries: 0, otpSentAt: now });
    user = { ...u };
  });
  if (user) await mailCode(user, code);
  return res.status(200).json({ ok: true });
}
async function verify2(req, res) {
  const b = bodyOf(req);
  const email = normalizeEmail(b.email);
  const code = clean(b.code, 10);
  if (!/^\d{6}$/.test(code)) throw fail2(400, "\u0915\u094B\u0921 6 \u0905\u0902\u0915\u094B\u0902 \u0915\u093E \u0939\u094B\u0924\u093E \u0939\u0948\u0964");
  if (limited(`vf:${clientIp(req)}`, 30, 60 * 60 * 1e3)) throw fail2(429, "\u092C\u0939\u0941\u0924 \u0905\u0927\u093F\u0915 \u092A\u094D\u0930\u092F\u093E\u0938\u0964 \u0915\u0943\u092A\u092F\u093E \u0915\u0941\u091B \u0926\u0947\u0930 \u092C\u093E\u0926 \u0926\u094B\u092C\u093E\u0930\u093E \u0915\u0930\u0947\u0902\u0964");
  let user = null;
  let problem = "";
  await transact2((db) => {
    const u = (db.users || []).find((x) => x.email === email);
    if (!u || u.verified || !u.otpHash) {
      problem = "\u0915\u094B\u0921 \u0938\u0939\u0940 \u0928\u0939\u0940\u0902 \u0939\u0948 \u092F\u093E \u0938\u092E\u093E\u092A\u094D\u0924 \u0939\u094B \u0917\u092F\u093E \u0939\u0948\u0964";
      return;
    }
    if (Date.now() > u.otpExp || u.otpTries >= MAX_OTP_TRIES) {
      problem = "\u0915\u094B\u0921 \u0938\u092E\u093E\u092A\u094D\u0924 \u0939\u094B \u0917\u092F\u093E \u0939\u0948\u0964 \u0915\u0943\u092A\u092F\u093E \u0928\u092F\u093E \u0915\u094B\u0921 \u092E\u0902\u0917\u093E\u090F\u0902\u0964";
      return;
    }
    u.otpTries += 1;
    const a = Buffer.from(otpHash(u.id, code));
    const c = Buffer.from(u.otpHash);
    if (a.length !== c.length || !crypto3.timingSafeEqual(a, c)) {
      problem = u.otpTries >= MAX_OTP_TRIES ? "\u092C\u0939\u0941\u0924 \u0917\u0932\u0924 \u092A\u094D\u0930\u092F\u093E\u0938\u0964 \u0915\u0943\u092A\u092F\u093E \u0928\u092F\u093E \u0915\u094B\u0921 \u092E\u0902\u0917\u093E\u090F\u0902\u0964" : "\u0915\u094B\u0921 \u0938\u0939\u0940 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964";
      return;
    }
    u.verified = true;
    u.verifiedAt = (/* @__PURE__ */ new Date()).toISOString();
    delete u.otpHash;
    delete u.otpExp;
    delete u.otpTries;
    user = { ...u };
  });
  if (!user) throw fail2(400, problem);
  await notify2(`\u{1F464} \u0928\u092F\u093E \u0938\u0926\u0938\u094D\u092F: ${user.name} (${user.email})`);
  res.setHeader("Set-Cookie", createUserSessionCookie(user.id));
  return res.status(200).json({ user: publicUser(user) });
}
async function login(req, res) {
  const b = bodyOf(req);
  const ip = clientIp(req);
  if (!checkLoginRateLimit(`user:${ip}`)) throw fail2(429, "\u092C\u0939\u0941\u0924 \u0905\u0927\u093F\u0915 \u092A\u094D\u0930\u092F\u093E\u0938\u0964 \u0915\u0943\u092A\u092F\u093E \u0915\u0941\u091B \u0926\u0947\u0930 \u092C\u093E\u0926 \u092A\u094D\u0930\u092F\u093E\u0938 \u0915\u0930\u0947\u0902\u0964");
  const email = normalizeEmail(b.email);
  const data = await getFullDatabase();
  const u = (data.users || []).find((x) => x.email === email);
  const ok = u && typeof b.password === "string" && verifyPassword(b.password, u.passwordHash);
  if (!ok) throw fail2(401, "\u0908\u092E\u0947\u0932 \u092F\u093E \u092A\u093E\u0938\u0935\u0930\u094D\u0921 \u0917\u0932\u0924 \u0939\u0948\u0964");
  if (!u.verified) throw fail2(403, "\u092A\u0939\u0932\u0947 \u0905\u092A\u0928\u093E \u0908\u092E\u0947\u0932 \u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924 \u0915\u0930\u0947\u0902\u0964");
  res.setHeader("Set-Cookie", createUserSessionCookie(u.id));
  return res.status(200).json({ user: publicUser(u) });
}
async function me(req, res) {
  const uid = getUserId(req);
  if (!uid) return res.status(200).json({ user: null });
  const data = await getFullDatabase();
  const u = (data.users || []).find((x) => x.id === uid && x.verified);
  if (!u) return res.status(200).json({ user: null });
  if (req.method === "PUT") {
    const name = clean(bodyOf(req).name, 60);
    if (name.length < 2) throw fail2(400, "\u0915\u0943\u092A\u092F\u093E \u0905\u092A\u0928\u093E \u0928\u093E\u092E \u0932\u093F\u0916\u0947\u0902\u0964");
    let updated;
    await transact2((db) => {
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
function sniff(buf) {
  if (buf.length > 3 && buf[0] === 255 && buf[1] === 216 && buf[2] === 255) return "image/jpeg";
  if (buf.length > 8 && buf.slice(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return "image/png";
  if (buf.length > 12 && buf.slice(0, 4).toString() === "RIFF" && buf.slice(8, 12).toString() === "WEBP") return "image/webp";
  return "";
}
async function avatar(req, res) {
  if (req.method === "GET") {
    const uid2 = clean((req.query || {}).u, 40);
    const data2 = await getFullDatabase();
    const u2 = (data2.users || []).find((x) => x.id === uid2);
    if (!u2 || !u2.avatarFileId) return res.status(404).json({ error: "\u092B\u094B\u091F\u094B \u0928\u0939\u0940\u0902 \u092E\u093F\u0932\u0940\u0964" });
    const buf2 = await fetchStoredFile(u2.avatarFileId);
    res.setHeader("Content-Type", u2.avatarMime || "image/jpeg");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "public, max-age=86400, immutable");
    return res.status(200).end(buf2);
  }
  if (req.method !== "POST") throw fail2(405, "Method not allowed");
  const uid = getUserId(req);
  if (!uid) throw fail2(401, "\u0915\u0943\u092A\u092F\u093E \u092A\u0939\u0932\u0947 \u0932\u0949\u0917\u093F\u0928 \u0915\u0930\u0947\u0902\u0964");
  if (limited(`av:${uid}`, AVATAR_PER_HOUR, 60 * 60 * 1e3)) throw fail2(429, "\u090F\u0915 \u0918\u0902\u091F\u0947 \u092E\u0947\u0902 10 \u0938\u0947 \u0905\u0927\u093F\u0915 \u092B\u094B\u091F\u094B \u0905\u092A\u0932\u094B\u0921 \u0928\u0939\u0940\u0902 \u0939\u094B \u0938\u0915\u0924\u0940\u0902\u0964");
  const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(String(bodyOf(req).image || ""));
  if (!m) throw fail2(400, "\u0915\u0947\u0935\u0932 JPG, PNG \u092F\u093E WEBP \u092B\u094B\u091F\u094B \u092E\u093E\u0928\u094D\u092F \u0939\u0948\u0964");
  const buf = Buffer.from(m[2], "base64");
  if (buf.length > MAX_AVATAR_BYTES) throw fail2(413, "\u092B\u094B\u091F\u094B 2MB \u0938\u0947 \u091B\u094B\u091F\u0940 \u0939\u094B\u0928\u0940 \u091A\u093E\u0939\u093F\u090F\u0964");
  const real = sniff(buf);
  if (!real || real !== m[1]) throw fail2(400, "\u092F\u0939 \u092B\u093C\u093E\u0907\u0932 \u0905\u0938\u0932\u0940 \u092B\u094B\u091F\u094B \u0928\u0939\u0940\u0902 \u0932\u0917\u0924\u0940\u0964 \u0915\u0947\u0935\u0932 JPG, PNG \u092F\u093E WEBP \u092E\u093E\u0928\u094D\u092F \u0939\u0948\u0964");
  const data = await getFullDatabase();
  const u = (data.users || []).find((x) => x.id === uid && x.verified);
  if (!u) throw fail2(401, "\u0915\u0943\u092A\u092F\u093E \u092A\u0939\u0932\u0947 \u0932\u0949\u0917\u093F\u0928 \u0915\u0930\u0947\u0902\u0964");
  const stored = await storeImage(buf, real, `avatar-${uid}-${Date.now()}-${crypto3.randomBytes(4).toString("hex")}.${EXT_OK[real]}`);
  let oldMsg = null;
  let updated;
  try {
    await transact2((db) => {
      const row = db.users.find((x) => x.id === uid);
      oldMsg = row.avatarMessageId || null;
      Object.assign(row, { avatarFileId: stored.fileId, avatarMessageId: stored.messageId, avatarMime: real, avatarVersion: (row.avatarVersion || 0) + 1 });
      updated = { ...row };
    });
  } catch (err) {
    await deleteStoredMessage(stored.messageId);
    throw err;
  }
  if (oldMsg) await deleteStoredMessage(oldMsg);
  return res.status(200).json({ user: publicUser(updated) });
}
async function users(req, res, action) {
  const m = req.method;
  if (action === "providers" && m === "GET") return providers(req, res);
  if (action === "oauth" && m === "GET") return start(req, res);
  if (action === "oauth-callback" && m === "GET") return callback(req, res);
  if (action === "register" && m === "POST") return register(req, res);
  if (action === "verify" && m === "POST") return verify2(req, res);
  if (action === "resend" && m === "POST") return resend(req, res);
  if (action === "login" && m === "POST") return login(req, res);
  if (action === "logout" && m === "POST") {
    res.setHeader("Set-Cookie", clearUserSessionCookie());
    return res.status(200).json({ ok: true });
  }
  if (action === "me" && (m === "GET" || m === "PUT")) return me(req, res);
  if (action === "avatar" && (m === "GET" || m === "POST")) return avatar(req, res);
  return res.status(404).json({ error: "Not found" });
}
export {
  users as default
};
