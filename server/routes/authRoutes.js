import { verifyPassword, createSessionCookie, clearSessionCookie, isAuthenticated, checkLoginRateLimit } from '../auth.js';

async function login(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress || 'unknown';
  if (!checkLoginRateLimit(ip)) {
    return res.status(429).json({ error: 'बहुत अधिक प्रयास। कृपया कुछ देर बाद पुनः प्रयास करें।' });
  }

  const { password } = req.body || {};
  if (!password || typeof password !== 'string') {
    return res.status(400).json({ error: 'पासवर्ड आवश्यक है।' });
  }

  const storedHash = (process.env.ADMIN_PASSWORD_HASH || '').trim();
  if (!storedHash) {
    console.error('[api] ADMIN_PASSWORD_HASH is not set');
    return res.status(500).json({ error: 'सर्वर सही से सेटअप नहीं है। कृपया एडमिन से संपर्क करें।' });
  }

  if (!verifyPassword(password, storedHash)) {
    return res.status(401).json({ error: 'गलत पासवर्ड। कृपया पुनः प्रयास करें।' });
  }

  res.setHeader('Set-Cookie', createSessionCookie());
  return res.status(200).json({ success: true });
}

async function logout(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  res.setHeader('Set-Cookie', clearSessionCookie());
  return res.status(200).json({ success: true });
}

async function session(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  return res.status(200).json({ authenticated: isAuthenticated(req) });
}

const actions = { login, logout, session };

// /api/auth/<action>
export default async function authRoutes(req, res, action) {
  const fn = Object.prototype.hasOwnProperty.call(actions, action) ? actions[action] : null;
  if (!fn) return res.status(404).json({ error: 'Not found' });
  return fn(req, res);
}
