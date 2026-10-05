// The ENTIRE API is this one serverless function (the code it uses lives in
// ../server, outside api/, so nothing else here can count as a function).
//
// Vercel's free (Hobby) plan allows at most 12 serverless functions per
// deployment, and every file directly under api/ counts as one. So instead of
// one file per endpoint, vercel.json rewrites
//     /api/<resource>        ->  /api/router?resource=<resource>
//     /api/<resource>/<id>   ->  /api/router?resource=<resource>&id=<id>
// and this file hands each request to the right handler. The public URLs
// (/api/donations, /api/donations/DON-2026-0001, /api/auth/login, ...) are the
// same as before, and adding a new resource never adds a function.
import * as donations from '../server/routes/donations.js';
import * as expenses from '../server/routes/expenses.js';
import * as events from '../server/routes/events.js';
import * as gallery from '../server/routes/gallery.js';
import * as announcements from '../server/routes/announcements.js';
import authRoutes from '../server/routes/authRoutes.js';
import summary from '../server/routes/summary.js';
import audit from '../server/routes/audit.js';

const RESOURCES = { donations, expenses, events, gallery, announcements };

const LOAD_FAILED = 'डेटा लोड नहीं हो सका। कृपया कुछ देर बाद पुनः प्रयास करें।';
const SAVE_FAILED = 'Save नहीं हो सका। कृपया दोबारा प्रयास करें।';

function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

// Normally `resource` and `id` arrive as query parameters from the rewrite.
// If they are missing, fall back to reading them from the URL path itself.
function resolveRoute(req) {
  const q = req.query || {};
  let resource = typeof q.resource === 'string' ? q.resource : '';
  let id = typeof q.id === 'string' ? q.id : '';
  if (!resource) {
    const parts = String(req.url || '').split('?')[0].split('/').filter(Boolean);
    const i = parts.indexOf('api');
    if (i !== -1) {
      resource = parts[i + 1] || '';
      id = parts[i + 2] || '';
    }
  }
  return { resource, id: safeDecode(id) };
}

export default async function handler(req, res) {
  try {
    const { resource, id } = resolveRoute(req);

    if (resource === 'summary') return await summary(req, res);
    if (resource === 'audit') return await audit(req, res);
    if (resource === 'auth') return await authRoutes(req, res, id);

    if (!Object.prototype.hasOwnProperty.call(RESOURCES, resource)) {
      return res.status(404).json({ error: 'Not found' });
    }
    const route = RESOURCES[resource];
    return await (id ? route.item(req, res, { id }) : route.list(req, res));
  } catch (err) {
    // Full details go to the server log (Vercel > Logs). Visitors only ever get
    // a short friendly message: no Telegram or server internals.
    console.error('[api]', req.method, req.url, err && err.stack ? err.stack : err);
    const isWrite = req.method && req.method !== 'GET';
    const message = (err && err.publicMessage) || (isWrite ? SAVE_FAILED : LOAD_FAILED);
    const status = err && Number.isInteger(err.status) && err.status >= 400 && err.status < 600 ? err.status : 500;
    return res.status(status).json({ error: message });
  }
}
