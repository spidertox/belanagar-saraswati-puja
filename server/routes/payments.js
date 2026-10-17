// "Own payment gateway" for UPI donations - a checkout + reconciliation flow.
//
//   donor  : POST /api/payments            -> creates a PENDING payment with a unique
//                                             reference (BSP-XXXXXX) that goes into the
//                                             UPI note, so it shows on the bank statement
//            POST /api/payments/:id {utr}  -> donor adds the UPI transaction id
//            GET  /api/payments/:id        -> donor checks the status
//   admin  : GET  /api/payments            -> list (needs login)
//            PUT  /api/payments/:id        -> confirm (creates the donation record) / reject
//
// Money moves donor -> committee bank account directly via UPI. Nothing here can
// see the bank, so an admin confirms each payment against the bank statement.
import { randomBytes } from 'node:crypto';
import { getCollection, getFullDatabase, transact, notify } from '../telegramStore.js';
import { isAuthenticated } from '../auth.js';

const UPI_ID = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z][a-zA-Z0-9.-]{1,63}$/;
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 12;
const hits = new Map();

function fail(status, message, errors) {
  const e = new Error(message);
  e.status = status;
  e.publicMessage = message;
  e.errors = errors;
  return e;
}
const clientIp = (req) =>
  String((req.headers && req.headers['x-forwarded-for']) || '').split(',')[0].trim() || (req.socket && req.socket.remoteAddress) || 'unknown';

function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

const clean = (v, max) => (typeof v === 'string' ? v.replace(/\u0000/g, '').trim().slice(0, max) : '');
const newRef = () => 'BSP-' + Array.from(randomBytes(6), (b) => ALPHABET[b % 32]).join('');
const istDate = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

// What a donor may see about a payment (never the phone number).
const donorView = (p) => ({ id: p.id, amount: p.amount, status: p.status, utrSubmitted: Boolean(p.utr), createdAt: p.createdAt });

export function buildLink(donation, p) {
  const parts = [`pa=${donation.upiId}`];
  if (donation.payeeName) parts.push(`pn=${encodeURIComponent(donation.payeeName)}`);
  parts.push(`am=${p.amount}`, 'cu=INR', `tn=${encodeURIComponent(p.id)}`, `tr=${encodeURIComponent(p.id)}`);
  return `upi://pay?${parts.join('&')}`;
}

function validateCreate(b, max) {
  const errors = {};
  if (!clean(b.name, 120)) errors.name = 'नाम आवश्यक है';
  const amt = Number(b.amount);
  if (!Number.isInteger(amt) || amt < 1 || amt > max) errors.amount = `राशि ₹1 से ₹${max} के बीच पूर्ण संख्या हो`;
  const phone = clean(b.phone, 20);
  if (phone && !/^[6-9]\d{9}$/.test(phone.replace(/^\+?91/, '').replace(/[\s-]/g, ''))) errors.phone = 'मोबाइल नंबर सही नहीं है';
  return errors;
}

export default async function payments(req, res, id) {
  const method = req.method;

  // ---- public: create
  if (method === 'POST' && !id) {
    const b = req.body || {};
    if (b.website) return res.status(200).json({ ok: true }); // honeypot
    if (rateLimited(clientIp(req))) throw fail(429, 'बहुत अधिक प्रयास। कृपया कुछ देर बाद दोबारा करें।');
    const data = await getFullDatabase();
    const d = (data.settings && data.settings.donation) || {};
    if (d.enabled === false || !UPI_ID.test(String(d.upiId || ''))) throw fail(503, 'ऑनलाइन दान अभी चालू नहीं है।');
    const errors = validateCreate(b, d.maxAmount || 100000);
    if (Object.keys(errors).length) throw fail(400, 'कृपया जानकारी जांचें।', errors);

    const p = {
      id: newRef(),
      name: clean(b.name, 120),
      phone: clean(b.phone, 20),
      amount: Number(b.amount),
      anonymous: Boolean(b.anonymous),
      status: 'pending',
      utr: '',
      createdAt: new Date().toISOString(),
    };
    await transact((db) => {
      db.payments = [...(db.payments || []), p].slice(-2000);
    });
    await notify(`💰 नया ऑनलाइन दान (पुष्टि बाकी)\n${p.name} — ₹${p.amount}\nसंदर्भ: ${p.id}\nAdmin > ऑनलाइन भुगतान में पुष्टि करें।`);
    return res.status(201).json({ payment: donorView(p), upiLink: buildLink(d, p), upiId: d.upiId });
  }

  // ---- public: donor status / UTR (id is an unguessable reference)
  if (id && (method === 'GET' || method === 'POST')) {
    if (rateLimited(clientIp(req))) throw fail(429, 'बहुत अधिक प्रयास। कृपया कुछ देर बाद दोबारा करें।');
    const list = await getCollection('payments');
    const p = list.find((x) => x.id === id);
    if (!p) return res.status(404).json({ error: 'भुगतान नहीं मिला।' });
    if (method === 'GET') return res.status(200).json({ payment: donorView(p) });

    const utr = clean((req.body || {}).utr, 30).replace(/\s/g, '');
    if (!/^[A-Za-z0-9]{10,22}$/.test(utr)) throw fail(400, 'UTR / Transaction ID सही नहीं है (आमतौर पर 12 अंक)।');
    if (p.status !== 'pending') throw fail(409, 'इस भुगतान की समीक्षा हो चुकी है।');
    await transact((db) => {
      const row = (db.payments || []).find((x) => x.id === id);
      if (row && row.status === 'pending') {
        row.utr = utr;
        row.utrAt = new Date().toISOString();
      }
    });
    return res.status(200).json({ ok: true });
  }

  // ---- admin only below
  if (!isAuthenticated(req)) return res.status(401).json({ error: 'अनधिकृत। कृपया दोबारा लॉगिन करें।' });

  if (method === 'GET' && !id) {
    const status = typeof (req.query || {}).status === 'string' ? req.query.status : '';
    const all = [...(await getCollection('payments'))].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const items = status ? all.filter((p) => p.status === status) : all;
    const pending = all.filter((p) => p.status === 'pending').length;
    return res.status(200).json({ items: items.slice(0, 200), total: items.length, pending });
  }

  if (method === 'PUT' && id) {
    const action = (req.body || {}).status;
    if (action !== 'confirmed' && action !== 'rejected') throw fail(400, 'अमान्य कार्रवाई।');
    let out;
    await transact((db) => {
      const p = (db.payments || []).find((x) => x.id === id);
      if (!p) throw fail(404, 'भुगतान नहीं मिला।');
      if (p.status !== 'pending') throw fail(409, 'इस भुगतान की समीक्षा पहले हो चुकी है।');
      p.status = action;
      p.reviewedAt = new Date().toISOString();
      if (action === 'confirmed') {
        db.counters = db.counters || {};
        const seq = (db.counters.donations || 0) + 1;
        db.counters.donations = seq;
        const don = {
          id: `DON-${new Date().getFullYear()}-${String(seq).padStart(4, '0')}`,
          type: 'donation',
          name: p.name,
          anonymous: p.anonymous,
          amount: p.amount,
          date: istDate(),
          purpose: 'ऑनलाइन UPI दान',
          note: `UPI ref ${p.id}${p.utr ? `, UTR ${p.utr}` : ''}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        db.donations = [...(db.donations || []), don];
        p.donationId = don.id;
      }
      db.auditLog = [
        ...(db.auditLog || []),
        {
          id: `AUD-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
          action: action === 'confirmed' ? 'CONFIRM' : 'REJECT',
          recordType: 'payments',
          recordId: p.id,
          oldValue: null,
          newValue: { amount: p.amount, donationId: p.donationId || null },
          at: new Date().toISOString(),
        },
      ].slice(-500);
      out = { ...p };
    });
    return res.status(200).json({ payment: out });
  }

  res.setHeader('Allow', 'GET, POST, PUT');
  return res.status(405).json({ error: 'Method not allowed' });
}
