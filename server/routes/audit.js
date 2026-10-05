import { getCollection } from '../telegramStore.js';
import { isAuthenticated } from '../auth.js';

// Audit log is admin-only, unlike the other collections' GET endpoints —
// it's internal bookkeeping, not something the public transparency pages
// need (they already show the donations/expenses it logs changes to).
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!isAuthenticated(req)) {
    return res.status(401).json({ error: 'अनधिकृत। कृपया दोबारा लॉगिन करें।' });
  }

  const log = await getCollection('auditLog');
  const sorted = [...log].sort((a, b) => new Date(b.at) - new Date(a.at));

  const { page = '1', pageSize = '20' } = req.query || {};
  const p = Math.max(1, Number(page) || 1);
  const ps = Math.max(1, Number(pageSize) || 20);
  const paged = sorted.slice((p - 1) * ps, (p - 1) * ps + ps);

  return res.status(200).json({ items: paged, total: sorted.length, page: p, pageSize: ps });
}
