// "Continue with Google / Microsoft" (OAuth 2.0 authorization-code flow, no libraries).
//   GET /api/users/providers        -> { google: bool, microsoft: bool }
//   GET /api/users/oauth?provider=  -> redirects to the provider
//   GET /api/users/oauth-callback   -> exchanges the code, signs the visitor in, redirects to /account
// Env: GOOGLE_CLIENT_ID/SECRET, MICROSOFT_CLIENT_ID/SECRET, SITE_URL (see .env.example)
import crypto from 'node:crypto';
import { transact, notify } from '../telegramStore.js';
import { createOAuthState, checkOAuthState, clearOAuthCookie, createUserSessionCookie } from '../auth.js';

const env = (k) => (process.env[k] || '').trim();

const PROVIDERS = {
  google: {
    id: () => env('GOOGLE_CLIENT_ID'),
    secret: () => env('GOOGLE_CLIENT_SECRET'),
    authorize: 'https://accounts.google.com/o/oauth2/v2/auth',
    token: 'https://oauth2.googleapis.com/token',
    scope: 'openid email profile',
    extra: { prompt: 'select_account' },
  },
  microsoft: {
    id: () => env('MICROSOFT_CLIENT_ID'),
    secret: () => env('MICROSOFT_CLIENT_SECRET'),
    authorize: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    token: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    scope: 'openid email profile User.Read',
    extra: { prompt: 'select_account', response_mode: 'query' },
  },
};

const configured = (name) => Boolean(PROVIDERS[name] && PROVIDERS[name].id() && PROVIDERS[name].secret());

function baseUrl(req) {
  const site = env('SITE_URL').replace(/\/+$/, '');
  if (site) return site;
  const h = req.headers || {};
  return `https://${h['x-forwarded-host'] || h.host}`;
}
const redirectUri = (req) => `${baseUrl(req)}/api/users/oauth-callback`;

function redirect(res, location, cookies = []) {
  if (cookies.length) res.setHeader('Set-Cookie', cookies);
  res.setHeader('Location', location);
  return res.status(302).end();
}

export function providers(req, res) {
  return res.status(200).json({ google: configured('google'), microsoft: configured('microsoft') });
}

export function start(req, res) {
  const name = String((req.query || {}).provider || '');
  if (!configured(name)) return redirect(res, '/login?error=provider');
  const p = PROVIDERS[name];
  const { state, cookie } = createOAuthState(name);
  const q = new URLSearchParams({
    client_id: p.id(),
    redirect_uri: redirectUri(req),
    response_type: 'code',
    scope: p.scope,
    state,
    ...p.extra,
  });
  return redirect(res, `${p.authorize}?${q}`, [cookie]);
}

async function fetchProfile(name, code, req) {
  const p = PROVIDERS[name];
  const tokenRes = await fetch(p.token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: p.id(),
      client_secret: p.secret(),
      redirect_uri: redirectUri(req),
      grant_type: 'authorization_code',
    }),
  });
  const tok = await tokenRes.json().catch(() => null);
  if (!tok || !tok.access_token) throw new Error(`token exchange failed: ${tok && (tok.error_description || tok.error)}`);
  const auth = { Authorization: `Bearer ${tok.access_token}` };

  if (name === 'google') {
    const info = await (await fetch('https://openidconnect.googleapis.com/v1/userinfo', { headers: auth })).json();
    if (!info.email || info.email_verified === false) throw new Error('google email not verified');
    return { email: info.email, name: info.name || info.given_name || info.email.split('@')[0] };
  }
  // Microsoft Graph: personal (Hotmail / Outlook / Live) and work or school accounts
  const me = await (await fetch('https://graph.microsoft.com/v1.0/me', { headers: auth })).json();
  const email = me.mail || (/@/.test(me.userPrincipalName || '') ? me.userPrincipalName : '');
  if (!email) throw new Error('microsoft account has no email');
  return { email, name: me.displayName || email.split('@')[0] };
}

export async function callback(req, res) {
  const q = req.query || {};
  const fail = () => redirect(res, '/login?error=oauth', [clearOAuthCookie()]);
  if (q.error || !q.code || !q.state) return fail();
  const name = checkOAuthState(req, String(q.state));
  if (!name || !configured(name)) return fail();

  let profile;
  try {
    profile = await fetchProfile(name, String(q.code), req);
  } catch (err) {
    console.error('[oauth]', name, err && err.message);
    return fail();
  }
  const email = profile.email.trim().toLowerCase();
  let user;
  let created = false;
  await transact((db) => {
    db.users = db.users || [];
    let u = db.users.find((x) => x.email === email);
    if (!u) {
      u = { id: `USR-${crypto.randomBytes(6).toString('hex')}`, name: String(profile.name).slice(0, 60), email, passwordHash: '', verified: true, provider: name, createdAt: new Date().toISOString() };
      db.users.push(u);
      created = true;
    } else if (!u.verified) {
      // the provider has proven this mailbox, so the pending password sign-up is complete
      Object.assign(u, { verified: true, verifiedAt: new Date().toISOString() });
      delete u.otpHash;
    }
    user = { ...u };
  });
  if (created) await notify(`👤 नया सदस्य (${name}): ${user.name} (${user.email})`);
  return redirect(res, '/account', [createUserSessionCookie(user.id), clearOAuthCookie()]);
}
