// Prasad / bhog booking requests.
//
//   visitor : POST /api/bhog            -> sends a request (name, phone, slot, people)
//   admin   : GET  /api/bhog            -> list (needs login; contains phone numbers)
//             PUT/DELETE /api/bhog/:id  -> update the status / remove (item handler)
//
// A request is NOT a confirmed booking: the committee phones the person back and
// then marks it "पक्का". Spam protection: honeypot + per-IP limit + length checks.
import { getCollection, transact, notify } from '../telegramStore.js';
import { isAuthenticated } from '../auth.js';
import { makeItemHandler } from '../resourceHandler.js';
import { validateBhog, normalizePhone, BHOG_STATUSES } from '../validators.js';

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 6;
const hits = new Map();
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
const fields = (b) => ({
  name: clean(b.name, 80),
  phone: normalizePhone(b.phone),
  slot: clean(b.slot, 60),
  people: Number(b.people) || 1,
  note: clean(b.note, 300),
});

export async function list(req, res) {
  const authed = isAuthenticated(req);

  if (req.method === 'GET') {
    if (!authed) return res.status(401).json({ error: 'अनधिकृत। कृपया दोबारा लॉगिन करें।' });
    const { search = '', page = '1', pageSize = '20' } = req.query || {};
    const all = (await getCollection('bhog'))
      .filter((i) => !search || String(i.name || '').toLowerCase().includes(String(search).toLowerCase()))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const p = Math.max(1, Number(page) || 1);
    const ps = Math.min(100, Math.max(1, Number(pageSize) || 20));
    return res.status(200).json({ items: all.slice((p - 1) * ps, p * ps), total: all.length, page: p, pageSize: ps });
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    if (!authed) {
      if (body.website) return res.status(201).json({ ok: true }); // honeypot: pretend success
      if (rateLimited(clientIp(req))) {
        return res.status(429).json({ error: 'बहुत ज़्यादा अनुरोध। कृपया कुछ देर बाद पुनः प्रयास करें।' });
      }
    }
    const errors = validateBhog(body);
    if (Object.keys(errors).length) return res.status(400).json({ error: 'कृपया फ़ॉर्म की जाँच करें।', errors });

    let created;
    await transact((data) => {
      data.counters = data.counters || {};
      const seq = (data.counters.bhog || 0) + 1;
      data.counters.bhog = seq;
      const now = new Date().toISOString();
      created = {
        id: `BHG-${new Date().getFullYear()}-${String(seq).padStart(4, '0')}`,
        type: 'bhog',
        ...fields(body),
        status: authed && BHOG_STATUSES.includes(body.status) ? body.status : BHOG_STATUSES[0],
        createdAt: now,
        updatedAt: now,
      };
      data.bhog = [...(data.bhog || []), created];
    });
    if (!authed) {
      await notify(`🍛 नई प्रसाद/भोग बुकिंग (${created.id})\n${created.name} · ${created.phone}\n${created.slot} · ${created.people} लोग${created.note ? `\n${created.note}` : ''}`);
    }
    return res.status(201).json({ item: authed ? created : { id: created.id } });
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
}

export const item = makeItemHandler({
  type: 'bhog',
  validate: validateBhog,
  applyUpdate: (existing, body) => ({
    ...existing,
    ...fields(body),
    status: BHOG_STATUSES.includes(body.status) ? body.status : existing.status,
    updatedAt: new Date().toISOString(),
  }),
});
