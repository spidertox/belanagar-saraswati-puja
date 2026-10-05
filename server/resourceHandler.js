// Generic GET/POST/PUT/DELETE machinery shared by every admin-managed
// collection (donations, expenses, events, gallery, announcements). Each file in server/routes/
// just configures this factory; server/routes/donations.js is the simplest example.
import { getCollection, transact } from './telegramStore.js';
import { isAuthenticated } from './auth.js';

function withinRange(dateStr, range, from, to) {
  if (!range || range === 'all') return true;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;
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

function matchesSearch(item, searchField, search) {
  if (!search) return true;
  const value = String(item[searchField] || '').toLowerCase();
  return value.includes(String(search).toLowerCase());
}

function makeAuditEntry(action, recordType, recordId, oldValue, newValue) {
  return {
    id: `AUD-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    action,
    recordType,
    recordId,
    oldValue: oldValue || null,
    newValue: newValue || null,
    at: new Date().toISOString(),
  };
}

function pushAudit(data, entry) {
  data.auditLog = [...(data.auditLog || []), entry].slice(-500);
}

/**
 * @param {string} type - collection name (also the URL segment)
 * @param {Function} validate - (body) => { field: 'error message' }
 * @param {string} [searchField] - item field matched by ?search=
 * @param {string} [sumField] - item field summed into `overallTotal`
 * @param {Function} buildRecord - (body, { seq, year }) => newRecord
 * @param {Function} [sanitizeForPublic] - (item) => item, applied when the
 *   caller is not an authenticated admin (e.g. hide a donor's real name)
 */
export function makeCollectionHandler({ type, validate, searchField, sumField, buildRecord, sanitizeForPublic }) {
  return async function handler(req, res) {
    if (req.method === 'GET') {
      const all = await getCollection(type);
      const authed = isAuthenticated(req);
      const { search = '', page = '1', pageSize = '20', range, from, to, category } = req.query || {};

      const filtered = all.filter((item) => {
        if (searchField && !matchesSearch(item, searchField, search)) return false;
        if (range && !withinRange(item.date, range, from, to)) return false;
        if (category && item.category !== category) return false;
        return true;
      });

      filtered.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

      const overallTotal = sumField ? all.reduce((s, i) => s + (Number(i[sumField]) || 0), 0) : undefined;
      const overallCount = all.length;

      const p = Math.max(1, Number(page) || 1);
      const ps = Math.max(1, Number(pageSize) || 20);
      let paged = filtered.slice((p - 1) * ps, (p - 1) * ps + ps);
      if (!authed && sanitizeForPublic) paged = paged.map(sanitizeForPublic);

      return res.status(200).json({ items: paged, total: filtered.length, page: p, pageSize: ps, overallTotal, overallCount });
    }

    if (req.method === 'POST') {
      if (!isAuthenticated(req)) return res.status(401).json({ error: 'अनधिकृत। कृपया दोबारा लॉगिन करें।' });

      const errors = validate(req.body || {});
      if (Object.keys(errors).length > 0) {
        return res.status(400).json({ error: 'कृपया फ़ॉर्म की जांच करें।', errors });
      }

      let created;
      await transact((data) => {
        data.counters = data.counters || {};
        const seq = (data.counters[type] || 0) + 1;
        data.counters[type] = seq;
        created = buildRecord(req.body, { seq: String(seq).padStart(4, '0'), year: new Date().getFullYear() });
        data[type] = [...(data[type] || []), created];
        pushAudit(data, makeAuditEntry('CREATE', type, created.id, null, created));
      });

      return res.status(201).json({ item: created });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  };
}

/** @param {Function} applyUpdate - (existingRecord, body) => updatedRecord */
export function makeItemHandler({ type, validate, applyUpdate }) {
  return async function handler(req, res, ctx = {}) {
    if (!isAuthenticated(req)) return res.status(401).json({ error: 'अनधिकृत। कृपया दोबारा लॉगिन करें।' });
    const id = ctx.id !== undefined ? ctx.id : (req.query || {}).id;

    if (req.method === 'PUT') {
      const errors = validate(req.body || {});
      if (Object.keys(errors).length > 0) {
        return res.status(400).json({ error: 'कृपया फ़ॉर्म की जांच करें।', errors });
      }

      let updated = null;
      let previous = null;
      await transact((data) => {
        const list = data[type] || [];
        const idx = list.findIndex((item) => item.id === id);
        if (idx === -1) return;
        previous = list[idx];
        updated = applyUpdate(previous, req.body);
        list[idx] = updated;
        data[type] = list;
        pushAudit(data, makeAuditEntry('UPDATE', type, id, previous, updated));
      });

      if (!updated) return res.status(404).json({ error: 'रिकॉर्ड नहीं मिला।' });
      return res.status(200).json({ item: updated });
    }

    if (req.method === 'DELETE') {
      let removed = null;
      await transact((data) => {
        const list = data[type] || [];
        const idx = list.findIndex((item) => item.id === id);
        if (idx === -1) return;
        removed = list[idx];
        data[type] = list.filter((item) => item.id !== id);
        pushAudit(data, makeAuditEntry('DELETE', type, id, removed, null));
      });

      if (!removed) return res.status(404).json({ error: 'रिकॉर्ड नहीं मिला।' });
      return res.status(200).json({ success: true });
    }

    res.setHeader('Allow', 'PUT, DELETE');
    return res.status(405).json({ error: 'Method not allowed' });
  };
}
