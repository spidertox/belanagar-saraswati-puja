// LOCAL DEVELOPMENT ONLY.
//
// Simulates the /api/* endpoints against a local JSON file instead of
// Telegram, so `npm run dev` + `npm run dev:mock` gives a fully clickable
// site before you've set up a real bot. Vite's dev proxy (see
// vite.config.js) forwards /api/* here on port 8787. None of this file is
// used in production — Vercel serves the real functions in /api instead.
import http from 'node:http';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(__dirname, 'db.json');
const SEED_FILE = path.join(__dirname, 'seed-data.json');
const DEV_PASSWORD = 'admin123';
const PORT = 8787;
const RESOURCES = ['donations', 'expenses', 'events', 'committee', 'gallery', 'announcements', 'bhog'];
const sessions = new Set();

function loadDb() {
  if (!existsSync(DB_FILE)) {
    writeFileSync(DB_FILE, existsSync(SEED_FILE) ? readFileSync(SEED_FILE, 'utf-8') : '{}');
  }
  return JSON.parse(readFileSync(DB_FILE, 'utf-8'));
}
function saveDb(db) {
  writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}
function getCookie(req, name) {
  const match = (req.headers.cookie || '').match(new RegExp(`${name}=([^;]+)`));
  return match ? match[1] : null;
}
function isAuthed(req) {
  const token = getCookie(req, 'dev_session');
  return Boolean(token && sessions.has(token));
}
function send(res, status, body, extraHeaders = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json', ...extraHeaders });
  res.end(JSON.stringify(body));
}
function paginate(list, page, pageSize) {
  const p = Number(page) || 1;
  const ps = Number(pageSize) || 20;
  const start = (p - 1) * ps;
  return { items: list.slice(start, start + ps), total: list.length, page: p, pageSize: ps };
}
function withinRange(dateStr, range, from, to) {
  if (!range || range === 'all') return true;
  const d = new Date(dateStr);
  const now = new Date();
  if (range === 'today') return d.toDateString() === now.toDateString();
  if (range === 'week') {
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    start.setHours(0, 0, 0, 0);
    return d >= start;
  }
  if (range === 'month') return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  if (range === 'custom') {
    if (from && d < new Date(from)) return false;
    if (to && d > new Date(`${to}T23:59:59`)) return false;
    return true;
  }
  return true;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const parts = url.pathname.split('/').filter(Boolean); // ['api', 'donations', ':id'?]
  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  });
  req.on('end', () => {
    let parsed = {};
    try {
      parsed = body ? JSON.parse(body) : {};
    } catch {
      /* ignore malformed body */
    }
    const db = loadDb();
    const q = Object.fromEntries(url.searchParams);

    if (parts[0] !== 'api') return send(res, 404, { error: 'Not found' });

    if (parts[1] === 'auth') {
      if (parts[2] === 'login' && req.method === 'POST') {
        if (parsed.password === DEV_PASSWORD) {
          const token = Math.random().toString(36).slice(2);
          sessions.add(token);
          return send(res, 200, { success: true }, { 'Set-Cookie': `dev_session=${token}; HttpOnly; Path=/; SameSite=Lax` });
        }
        return send(res, 401, { error: `गलत पासवर्ड (dev password: ${DEV_PASSWORD})` });
      }
      if (parts[2] === 'logout' && req.method === 'POST') {
        sessions.delete(getCookie(req, 'dev_session'));
        return send(res, 200, { success: true }, { 'Set-Cookie': 'dev_session=; Path=/; Max-Age=0' });
      }
      if (parts[2] === 'session' && req.method === 'GET') {
        return send(res, 200, { authenticated: isAuthed(req) });
      }
    }

    if (parts[1] === 'contact' && req.method === 'POST') {
      if (parsed.website) return send(res, 200, { ok: true }); // honeypot
      if (!parsed.name || !parsed.message) return send(res, 400, { error: 'नाम और संदेश आवश्यक हैं।' });
      console.log('[mock contact]', parsed.name, '|', parsed.contactInfo || '-', '|', parsed.message);
      return send(res, 200, { ok: true });
    }

    if (parts[1] === 'users') {
      // dev only: no real e-mail, the code is printed in this terminal
      db.users = db.users || [];
      const act = parts[2];
      const email = String(parsed.email || '').trim().toLowerCase();
      const pub = (u) => ({ id: u.id, name: u.name, email: u.email, avatarUrl: u.avatar || '' });
      const cookieHdr = (u) => ({ 'Set-Cookie': `dev_user=${u ? u.id : ''}; Path=/; HttpOnly; SameSite=Lax${u ? '' : '; Max-Age=0'}` });
      const me = db.users.find((u) => u.id === getCookie(req, 'dev_user') && u.verified);
      if (act === 'register' && req.method === 'POST') {
        if (/mailinator|yopmail|tempmail|10minute|guerrilla/i.test(email)) return send(res, 400, { error: 'x', errors: { email: 'अस्थायी (temp) ईमेल मान्य नहीं है।' } });
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return send(res, 400, { error: 'x', errors: { email: 'कृपया सही ईमेल पता लिखें।' } });
        let u = db.users.find((x) => x.email === email);
        if (u && u.verified) return send(res, 409, { error: 'इस ईमेल से खाता पहले से है।' });
        const code = String(Math.floor(100000 + Math.random() * 900000));
        if (!u) { u = { id: 'USR-' + Date.now(), email }; db.users.push(u); }
        Object.assign(u, { name: parsed.name, password: parsed.password, code, verified: false });
        saveDb(db); console.log(`[mock mail] verification code for ${email}: ${code}`);
        return send(res, 201, { ok: true, email });
      }
      if (act === 'verify' && req.method === 'POST') {
        const u = db.users.find((x) => x.email === email);
        if (!u || u.code !== parsed.code) return send(res, 400, { error: 'कोड सही नहीं है।' });
        u.verified = true; delete u.code; saveDb(db);
        return send(res, 200, { user: pub(u) }, cookieHdr(u));
      }
      if (act === 'resend') return send(res, 200, { ok: true });
      if (act === 'login' && req.method === 'POST') {
        const u = db.users.find((x) => x.email === email && x.password === parsed.password);
        if (!u) return send(res, 401, { error: 'ईमेल या पासवर्ड गलत है।' });
        if (!u.verified) return send(res, 403, { error: 'पहले अपना ईमेल सत्यापित करें।' });
        return send(res, 200, { user: pub(u) }, cookieHdr(u));
      }
      if (act === 'logout') return send(res, 200, { ok: true }, cookieHdr(null));
      if (act === 'me') {
        if (me && req.method === 'PUT') { me.name = parsed.name; saveDb(db); }
        return send(res, 200, { user: me ? pub(me) : null });
      }
      if (act === 'avatar' && req.method === 'POST') {
        if (!me) return send(res, 401, { error: 'कृपया पहले लॉगिन करें।' });
        me.avatar = parsed.image; saveDb(db);
        return send(res, 200, { user: pub(me) });
      }
    }

    if (parts[1] === 'payments') {
      db.payments = db.payments || [];
      const pid = parts[2];
      const d = (db.settings && db.settings.donation) || {};
      if (req.method === 'POST' && !pid) {
        if (!d.upiId) return send(res, 503, { error: 'ऑनलाइन दान अभी चालू नहीं है।' });
        const p = { id: 'BSP-' + Math.random().toString(36).slice(2, 8).toUpperCase(), name: parsed.name, phone: parsed.phone || '', amount: Number(parsed.amount), anonymous: !!parsed.anonymous, status: 'pending', utr: '', createdAt: new Date().toISOString() };
        db.payments.push(p); saveDb(db);
        return send(res, 201, { payment: { id: p.id, amount: p.amount, status: p.status, utrSubmitted: false }, upiLink: `upi://pay?pa=${d.upiId}&am=${p.amount}&cu=INR&tn=${p.id}`, upiId: d.upiId });
      }
      if (pid && req.method === 'GET') {
        const p = db.payments.find((x) => x.id === pid);
        return p ? send(res, 200, { payment: { id: p.id, amount: p.amount, status: p.status, utrSubmitted: !!p.utr } }) : send(res, 404, { error: 'भुगतान नहीं मिला।' });
      }
      if (pid && req.method === 'POST') {
        const p = db.payments.find((x) => x.id === pid);
        if (!p) return send(res, 404, { error: 'भुगतान नहीं मिला।' });
        p.utr = parsed.utr; saveDb(db);
        return send(res, 200, { ok: true });
      }
      if (!isAuthed(req)) return send(res, 401, { error: 'Unauthorized' });
      if (!pid && req.method === 'GET') {
        const items = db.payments.filter((p) => !q.status || p.status === q.status).reverse();
        return send(res, 200, { items, total: items.length, pending: db.payments.filter((p) => p.status === 'pending').length });
      }
      if (pid && req.method === 'PUT') {
        const p = db.payments.find((x) => x.id === pid);
        if (!p || p.status !== 'pending') return send(res, 409, { error: 'समीक्षा हो चुकी है।' });
        p.status = parsed.status;
        if (p.status === 'confirmed') {
          db.donations = db.donations || [];
          const don = { id: `DON-${Date.now()}`, type: 'donation', name: p.name, anonymous: p.anonymous, amount: p.amount, date: new Date().toISOString().slice(0, 10), purpose: 'ऑनलाइन UPI दान', note: `UPI ref ${p.id}`, createdAt: new Date().toISOString() };
          db.donations.push(don); p.donationId = don.id;
        }
        saveDb(db);
        return send(res, 200, { payment: p });
      }
    }

    if (parts[1] === 'settings') {
      const d = (db.settings && db.settings.donation) || {};
      const view = { donation: { enabled: d.enabled !== false, upiId: d.upiId || '', payeeName: d.payeeName || '', note: d.note || '', amounts: d.amounts || [], maxAmount: d.maxAmount || 100000 } };
      if (req.method === 'POST') return send(res, 200, { ok: true });
      if (req.method === 'GET') return send(res, 200, view);
      if (req.method === 'PUT') {
        if (!isAuthed(req)) return send(res, 401, { error: 'Unauthorized' });
        db.settings = { ...(db.settings || {}), donation: parsed.donation || {} };
        saveDb(db);
        return send(res, 200, { donation: db.settings.donation });
      }
    }

    if (parts[1] === 'summary' && req.method === 'GET') {
      const totalDonations = (db.donations || []).reduce((s, d) => s + (Number(d.amount) || 0), 0);
      const totalExpenses = (db.expenses || []).reduce((s, e) => s + (Number(e.amount) || 0), 0);
      return send(res, 200, {
        totalDonations,
        totalExpenses,
        balance: totalDonations - totalExpenses,
        lastUpdated: db.updatedAt || new Date().toISOString(),
      });
    }

    if (parts[1] === 'audit' && req.method === 'GET') {
      if (!isAuthed(req)) return send(res, 401, { error: 'Unauthorized' });
      const log = (db.auditLog || []).slice().sort((a, b) => new Date(b.at) - new Date(a.at));
      return send(res, 200, paginate(log, q.page, q.pageSize));
    }

    if (RESOURCES.includes(parts[1])) {
      const type = parts[1];
      const id = parts[2];
      db[type] = db[type] || [];

      if (!id && req.method === 'GET') {
        let items = db[type].slice();
        if (q.search) {
          const s = q.search.toLowerCase();
          items = items.filter((i) => (i.name || i.title || '').toLowerCase().includes(s));
        }
        if (q.range) items = items.filter((i) => withinRange(i.date, q.range, q.from, q.to));
        if (q.category) items = items.filter((i) => i.category === q.category);
        items.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
        const overallTotal = db[type].some((i) => 'amount' in i)
          ? db[type].reduce((s, i) => s + (Number(i.amount) || 0), 0)
          : undefined;
        return send(res, 200, { ...paginate(items, q.page, q.pageSize), overallTotal, overallCount: db[type].length });
      }

      if (!id && req.method === 'POST') {
        if (!isAuthed(req) && type !== 'bhog') return send(res, 401, { error: 'Unauthorized' }); // bhog requests are public
        db.counters = db.counters || {};
        db.counters[type] = (db.counters[type] || 0) + 1;
        const record = {
          ...parsed,
          id: `${type.slice(0, 3).toUpperCase()}-${new Date().getFullYear()}-${String(db.counters[type]).padStart(4, '0')}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        db[type].push(record);
        db.auditLog = [...(db.auditLog || []), { id: `AUD-${Date.now()}`, action: 'CREATE', recordType: type, recordId: record.id, at: new Date().toISOString() }];
        db.updatedAt = new Date().toISOString();
        saveDb(db);
        return send(res, 201, { item: record });
      }

      if (id && req.method === 'PUT') {
        if (!isAuthed(req)) return send(res, 401, { error: 'Unauthorized' });
        const idx = db[type].findIndex((i) => i.id === id);
        if (idx === -1) return send(res, 404, { error: 'रिकॉर्ड नहीं मिला।' });
        db[type][idx] = { ...db[type][idx], ...parsed, updatedAt: new Date().toISOString() };
        db.auditLog = [...(db.auditLog || []), { id: `AUD-${Date.now()}`, action: 'UPDATE', recordType: type, recordId: id, at: new Date().toISOString() }];
        db.updatedAt = new Date().toISOString();
        saveDb(db);
        return send(res, 200, { item: db[type][idx] });
      }

      if (id && req.method === 'DELETE') {
        if (!isAuthed(req)) return send(res, 401, { error: 'Unauthorized' });
        const before = db[type].length;
        db[type] = db[type].filter((i) => i.id !== id);
        if (db[type].length === before) return send(res, 404, { error: 'रिकॉर्ड नहीं मिला।' });
        db.auditLog = [...(db.auditLog || []), { id: `AUD-${Date.now()}`, action: 'DELETE', recordType: type, recordId: id, at: new Date().toISOString() }];
        db.updatedAt = new Date().toISOString();
        saveDb(db);
        return send(res, 200, { success: true });
      }
    }

    send(res, 404, { error: 'Not found' });
  });
});

server.listen(PORT, () => {
  console.log(`\nMock API (development only) running at http://localhost:${PORT}`);
  console.log(`Dev admin password: ${DEV_PASSWORD}\n`);
});
