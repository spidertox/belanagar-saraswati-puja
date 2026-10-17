import {
  __export,
  checkLoginRateLimit,
  checkOAuthState,
  clearLoginRateLimit,
  clearOAuthCookie,
  clearSessionCookie,
  clearUserSessionCookie,
  createOAuthState,
  createSessionCookie,
  createUserSessionCookie,
  getUserId,
  hashPassword,
  hmac,
  isAuthenticated,
  verifyPassword
} from "../chunk-DMOV4MIQ.js";

// ../../../../../home/claude/site_src/belanagar-saraswati-puja/server/routes/donations.js
var donations_exports = {};
__export(donations_exports, {
  item: () => item,
  list: () => list
});

// ../../../../../home/claude/site_src/belanagar-saraswati-puja/server/resourceHandler.js
import { getCollection, transact } from "/home/claude/site_src/belanagar-saraswati-puja/stub-store.mjs";
var IST = "Asia/Kolkata";
function dayKey(value) {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-CA", { timeZone: IST });
}
function addDays(key, n) {
  const d = /* @__PURE__ */ new Date(`${key}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
function withinRange(dateStr, range, from, to) {
  if (!range || range === "all") return true;
  const day = dayKey(dateStr);
  if (!day) return false;
  const today = dayKey(/* @__PURE__ */ new Date());
  if (range === "today") return day === today;
  if (range === "week") {
    const weekday = (/* @__PURE__ */ new Date(`${today}T00:00:00Z`)).getUTCDay();
    return day >= addDays(today, -weekday) && day <= today;
  }
  if (range === "month") return day.slice(0, 7) === today.slice(0, 7);
  if (range === "custom") {
    const f = from ? dayKey(from) : null;
    const t = to ? dayKey(to) : null;
    if (f && day < f) return false;
    if (t && day > t) return false;
    return true;
  }
  return true;
}
function matchesSearch(item7, searchField, search) {
  if (!search) return true;
  const value = String(item7[searchField] || "").toLowerCase();
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
    at: (/* @__PURE__ */ new Date()).toISOString()
  };
}
function pushAudit(data, entry) {
  data.auditLog = [...data.auditLog || [], entry].slice(-500);
}
function makeCollectionHandler({ type, validate: validate2, searchField, sumField, buildRecord, sanitizeForPublic }) {
  return async function handler5(req, res) {
    if (req.method === "GET") {
      const stored = await getCollection(type);
      const authed = isAuthenticated(req);
      const all = !authed && sanitizeForPublic ? stored.map(sanitizeForPublic) : stored;
      const { search = "", page = "1", pageSize = "20", range, from, to, category } = req.query || {};
      const filtered = all.filter((item7) => {
        if (searchField && !matchesSearch(item7, searchField, search)) return false;
        if (range && !withinRange(item7.date, range, from, to)) return false;
        if (category && item7.category !== category) return false;
        return true;
      });
      filtered.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
      const overallTotal = sumField ? all.reduce((s, i) => s + (Number(i[sumField]) || 0), 0) : void 0;
      const overallCount = all.length;
      const p = Math.max(1, Number(page) || 1);
      const ps = Math.min(100, Math.max(1, Number(pageSize) || 20));
      const paged = filtered.slice((p - 1) * ps, (p - 1) * ps + ps);
      return res.status(200).json({ items: paged, total: filtered.length, page: p, pageSize: ps, overallTotal, overallCount });
    }
    if (req.method === "POST") {
      if (!isAuthenticated(req)) return res.status(401).json({ error: "\u0905\u0928\u0927\u093F\u0915\u0943\u0924\u0964 \u0915\u0943\u092A\u092F\u093E \u0926\u094B\u092C\u093E\u0930\u093E \u0932\u0949\u0917\u093F\u0928 \u0915\u0930\u0947\u0902\u0964" });
      const errors = validate2(req.body || {});
      if (Object.keys(errors).length > 0) {
        return res.status(400).json({ error: "\u0915\u0943\u092A\u092F\u093E \u092B\u093C\u0949\u0930\u094D\u092E \u0915\u0940 \u091C\u093E\u0902\u091A \u0915\u0930\u0947\u0902\u0964", errors });
      }
      let created;
      await transact((data) => {
        data.counters = data.counters || {};
        const seq = (data.counters[type] || 0) + 1;
        data.counters[type] = seq;
        created = buildRecord(req.body, { seq: String(seq).padStart(4, "0"), year: (/* @__PURE__ */ new Date()).getFullYear() });
        data[type] = [...data[type] || [], created];
        pushAudit(data, makeAuditEntry("CREATE", type, created.id, null, created));
      });
      return res.status(201).json({ item: created });
    }
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  };
}
function makeItemHandler({ type, validate: validate2, applyUpdate }) {
  return async function handler5(req, res, ctx = {}) {
    if (!isAuthenticated(req)) return res.status(401).json({ error: "\u0905\u0928\u0927\u093F\u0915\u0943\u0924\u0964 \u0915\u0943\u092A\u092F\u093E \u0926\u094B\u092C\u093E\u0930\u093E \u0932\u0949\u0917\u093F\u0928 \u0915\u0930\u0947\u0902\u0964" });
    const id = ctx.id !== void 0 ? ctx.id : (req.query || {}).id;
    if (req.method === "PUT") {
      const errors = validate2(req.body || {});
      if (Object.keys(errors).length > 0) {
        return res.status(400).json({ error: "\u0915\u0943\u092A\u092F\u093E \u092B\u093C\u0949\u0930\u094D\u092E \u0915\u0940 \u091C\u093E\u0902\u091A \u0915\u0930\u0947\u0902\u0964", errors });
      }
      let updated = null;
      let previous = null;
      await transact((data) => {
        const list7 = data[type] || [];
        const idx = list7.findIndex((item7) => item7.id === id);
        if (idx === -1) return;
        previous = list7[idx];
        updated = applyUpdate(previous, req.body);
        list7[idx] = updated;
        data[type] = list7;
        pushAudit(data, makeAuditEntry("UPDATE", type, id, previous, updated));
      });
      if (!updated) return res.status(404).json({ error: "\u0930\u093F\u0915\u0949\u0930\u094D\u0921 \u0928\u0939\u0940\u0902 \u092E\u093F\u0932\u093E\u0964" });
      return res.status(200).json({ item: updated });
    }
    if (req.method === "DELETE") {
      let removed = null;
      await transact((data) => {
        const list7 = data[type] || [];
        const idx = list7.findIndex((item7) => item7.id === id);
        if (idx === -1) return;
        removed = list7[idx];
        data[type] = list7.filter((item7) => item7.id !== id);
        pushAudit(data, makeAuditEntry("DELETE", type, id, removed, null));
      });
      if (!removed) return res.status(404).json({ error: "\u0930\u093F\u0915\u0949\u0930\u094D\u0921 \u0928\u0939\u0940\u0902 \u092E\u093F\u0932\u093E\u0964" });
      return res.status(200).json({ success: true });
    }
    res.setHeader("Allow", "PUT, DELETE");
    return res.status(405).json({ error: "Method not allowed" });
  };
}

// ../../../../../home/claude/site_src/belanagar-saraswati-puja/server/validators.js
function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}
function isValidDate(v) {
  return typeof v === "string" && v.trim() !== "" && !Number.isNaN(Date.parse(v));
}
function isPositiveNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0;
}
function isReasonableAmount(v) {
  return Number(v) < 1e7;
}
function tooLong(errors, body, field, max) {
  if (typeof body[field] === "string" && body[field].trim().length > max) {
    errors[field] = `\u0905\u0927\u093F\u0915\u0924\u092E ${max} \u0905\u0915\u094D\u0937\u0930 \u0915\u0940 \u0905\u0928\u0941\u092E\u0924\u093F \u0939\u0948`;
  }
}
function validateDonation(body) {
  const errors = {};
  if (!isNonEmptyString(body.name)) errors.name = "\u0928\u093E\u092E \u0906\u0935\u0936\u094D\u092F\u0915 \u0939\u0948";
  if (!isPositiveNumber(body.amount)) errors.amount = "\u0930\u093E\u0936\u093F \u0938\u0939\u0940 \u0928\u0939\u0940\u0902 \u0939\u0948 (0 \u0938\u0947 \u0905\u0927\u093F\u0915 \u0939\u094B\u0928\u0940 \u091A\u093E\u0939\u093F\u090F)";
  else if (!isReasonableAmount(body.amount)) errors.amount = "\u0930\u093E\u0936\u093F \u092C\u0939\u0941\u0924 \u0905\u0927\u093F\u0915 \u0932\u0917 \u0930\u0939\u0940 \u0939\u0948, \u0915\u0943\u092A\u092F\u093E \u091C\u093E\u0902\u091A\u0947\u0902";
  if (!isValidDate(body.date)) errors.date = "\u0924\u093E\u0930\u0940\u0916 \u0938\u0939\u0940 \u0928\u0939\u0940\u0902 \u0939\u0948";
  tooLong(errors, body, "name", 120);
  tooLong(errors, body, "purpose", 200);
  tooLong(errors, body, "note", 1e3);
  return errors;
}
function validateExpense(body) {
  const errors = {};
  if (!isNonEmptyString(body.title)) errors.title = "\u0935\u093F\u0935\u0930\u0923 \u0906\u0935\u0936\u094D\u092F\u0915 \u0939\u0948";
  if (!isNonEmptyString(body.category)) errors.category = "\u0936\u094D\u0930\u0947\u0923\u0940 \u0906\u0935\u0936\u094D\u092F\u0915 \u0939\u0948";
  if (!isPositiveNumber(body.amount)) errors.amount = "\u0930\u093E\u0936\u093F \u0938\u0939\u0940 \u0928\u0939\u0940\u0902 \u0939\u0948 (0 \u0938\u0947 \u0905\u0927\u093F\u0915 \u0939\u094B\u0928\u0940 \u091A\u093E\u0939\u093F\u090F)";
  else if (!isReasonableAmount(body.amount)) errors.amount = "\u0930\u093E\u0936\u093F \u092C\u0939\u0941\u0924 \u0905\u0927\u093F\u0915 \u0932\u0917 \u0930\u0939\u0940 \u0939\u0948, \u0915\u0943\u092A\u092F\u093E \u091C\u093E\u0902\u091A\u0947\u0902";
  if (!isValidDate(body.date)) errors.date = "\u0924\u093E\u0930\u0940\u0916 \u0938\u0939\u0940 \u0928\u0939\u0940\u0902 \u0939\u0948";
  tooLong(errors, body, "title", 200);
  tooLong(errors, body, "note", 1e3);
  return errors;
}
function validateEvent(body) {
  const errors = {};
  if (!isNonEmptyString(body.name)) errors.name = "\u0915\u093E\u0930\u094D\u092F\u0915\u094D\u0930\u092E \u0915\u093E \u0928\u093E\u092E \u0906\u0935\u0936\u094D\u092F\u0915 \u0939\u0948";
  if (!isValidDate(body.date)) errors.date = "\u0924\u093E\u0930\u0940\u0916 \u0938\u0939\u0940 \u0928\u0939\u0940\u0902 \u0939\u0948";
  if (!isNonEmptyString(body.time)) errors.time = "\u0938\u092E\u092F \u0906\u0935\u0936\u094D\u092F\u0915 \u0939\u0948";
  tooLong(errors, body, "name", 200);
  tooLong(errors, body, "location", 200);
  tooLong(errors, body, "description", 2e3);
  return errors;
}
function validateCommittee(body) {
  const errors = {};
  if (!isNonEmptyString(body.name)) errors.name = "\u0928\u093E\u092E \u0906\u0935\u0936\u094D\u092F\u0915 \u0939\u0948";
  if (body.order !== void 0 && body.order !== "" && body.order !== null) {
    const n = Number(body.order);
    if (!Number.isInteger(n) || n < 1 || n > 999) errors.order = "\u0915\u094D\u0930\u092E 1 \u0938\u0947 999 \u0915\u0947 \u092C\u0940\u091A \u092A\u0942\u0930\u094D\u0923 \u0938\u0902\u0916\u094D\u092F\u093E \u0939\u094B";
  }
  tooLong(errors, body, "name", 120);
  tooLong(errors, body, "position", 120);
  tooLong(errors, body, "occupation", 120);
  tooLong(errors, body, "village", 120);
  return errors;
}
function validateGallery(body) {
  const errors = {};
  if (!isNonEmptyString(body.imageUrl) || !/^https?:\/\//i.test(body.imageUrl.trim())) {
    errors.imageUrl = "\u0938\u0939\u0940 \u092B\u093C\u094B\u091F\u094B URL \u0906\u0935\u0936\u094D\u092F\u0915 \u0939\u0948 (http/https \u0938\u0947 \u0936\u0941\u0930\u0942)";
  }
  if (!isNonEmptyString(body.category)) errors.category = "\u0936\u094D\u0930\u0947\u0923\u0940 \u0906\u0935\u0936\u094D\u092F\u0915 \u0939\u0948";
  tooLong(errors, body, "imageUrl", 2e3);
  tooLong(errors, body, "caption", 200);
  return errors;
}
function validateAnnouncement(body) {
  const errors = {};
  if (!isNonEmptyString(body.title)) errors.title = "\u0936\u0940\u0930\u094D\u0937\u0915 \u0906\u0935\u0936\u094D\u092F\u0915 \u0939\u0948";
  if (!isNonEmptyString(body.body)) errors.body = "\u0935\u093F\u0935\u0930\u0923 \u0906\u0935\u0936\u094D\u092F\u0915 \u0939\u0948";
  tooLong(errors, body, "title", 200);
  tooLong(errors, body, "body", 2e3);
  return errors;
}

// ../../../../../home/claude/site_src/belanagar-saraswati-puja/server/routes/donations.js
var list = makeCollectionHandler({
  type: "donations",
  validate: validateDonation,
  searchField: "name",
  sumField: "amount",
  // The real name is always stored (the committee needs it for its own
  // records) but never shown to the public when the donor asked to be
  // listed as Anonymous.
  sanitizeForPublic: (item7) => item7.anonymous ? { ...item7, name: "Anonymous" } : item7,
  buildRecord: (body, { seq, year }) => ({
    id: `DON-${year}-${seq}`,
    type: "donation",
    name: String(body.name).trim(),
    anonymous: Boolean(body.anonymous),
    amount: Number(body.amount),
    date: body.date,
    purpose: (body.purpose || "").trim(),
    note: (body.note || "").trim(),
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  })
});
var item = makeItemHandler({
  type: "donations",
  validate: validateDonation,
  applyUpdate: (existing, body) => ({
    ...existing,
    name: String(body.name).trim(),
    anonymous: Boolean(body.anonymous),
    amount: Number(body.amount),
    date: body.date,
    purpose: (body.purpose || "").trim(),
    note: (body.note || "").trim(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  })
});

// ../../../../../home/claude/site_src/belanagar-saraswati-puja/server/routes/expenses.js
var expenses_exports = {};
__export(expenses_exports, {
  item: () => item2,
  list: () => list2
});
var list2 = makeCollectionHandler({
  type: "expenses",
  validate: validateExpense,
  searchField: "title",
  sumField: "amount",
  buildRecord: (body, { seq, year }) => ({
    id: `EXP-${year}-${seq}`,
    type: "expense",
    title: String(body.title).trim(),
    category: body.category,
    amount: Number(body.amount),
    date: body.date,
    note: (body.note || "").trim(),
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  })
});
var item2 = makeItemHandler({
  type: "expenses",
  validate: validateExpense,
  applyUpdate: (existing, body) => ({
    ...existing,
    title: String(body.title).trim(),
    category: body.category,
    amount: Number(body.amount),
    date: body.date,
    note: (body.note || "").trim(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  })
});

// ../../../../../home/claude/site_src/belanagar-saraswati-puja/server/routes/events.js
var events_exports = {};
__export(events_exports, {
  item: () => item3,
  list: () => list3
});
var list3 = makeCollectionHandler({
  type: "events",
  validate: validateEvent,
  buildRecord: (body, { seq, year }) => ({
    id: `EVT-${year}-${seq}`,
    type: "event",
    name: String(body.name).trim(),
    date: body.date,
    time: body.time,
    location: (body.location || "").trim(),
    description: (body.description || "").trim(),
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  })
});
var item3 = makeItemHandler({
  type: "events",
  validate: validateEvent,
  applyUpdate: (existing, body) => ({
    ...existing,
    name: String(body.name).trim(),
    date: body.date,
    time: body.time,
    location: (body.location || "").trim(),
    description: (body.description || "").trim(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  })
});

// ../../../../../home/claude/site_src/belanagar-saraswati-puja/server/routes/committee.js
var committee_exports = {};
__export(committee_exports, {
  item: () => item4,
  list: () => list4
});
var order = (v) => v === "" || v === void 0 || v === null ? 999 : Number(v);
var fields = (b) => ({
  name: String(b.name).trim(),
  position: (b.position || "").trim(),
  occupation: (b.occupation || "").trim(),
  village: (b.village || "").trim(),
  order: order(b.order)
});
var list4 = makeCollectionHandler({
  type: "committee",
  validate: validateCommittee,
  searchField: "name",
  buildRecord: (body, { seq, year }) => ({
    id: `COM-${year}-${seq}`,
    type: "committee",
    ...fields(body),
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  })
});
var item4 = makeItemHandler({
  type: "committee",
  validate: validateCommittee,
  applyUpdate: (existing, body) => ({ ...existing, ...fields(body), updatedAt: (/* @__PURE__ */ new Date()).toISOString() })
});

// ../../../../../home/claude/site_src/belanagar-saraswati-puja/server/routes/gallery.js
var gallery_exports = {};
__export(gallery_exports, {
  item: () => item5,
  list: () => list5
});
var list5 = makeCollectionHandler({
  type: "gallery",
  validate: validateGallery,
  buildRecord: (body, { seq, year }) => ({
    id: `GAL-${year}-${seq}`,
    type: "gallery",
    imageUrl: String(body.imageUrl).trim(),
    caption: (body.caption || "").trim(),
    category: body.category,
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  })
});
var item5 = makeItemHandler({
  type: "gallery",
  validate: validateGallery,
  applyUpdate: (existing, body) => ({
    ...existing,
    imageUrl: String(body.imageUrl).trim(),
    caption: (body.caption || "").trim(),
    category: body.category,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  })
});

// ../../../../../home/claude/site_src/belanagar-saraswati-puja/server/routes/announcements.js
var announcements_exports = {};
__export(announcements_exports, {
  item: () => item6,
  list: () => list6
});
var list6 = makeCollectionHandler({
  type: "announcements",
  validate: validateAnnouncement,
  buildRecord: (body, { seq, year }) => ({
    id: `ANN-${year}-${seq}`,
    type: "announcement",
    title: String(body.title).trim(),
    body: String(body.body).trim(),
    important: Boolean(body.important),
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  })
});
var item6 = makeItemHandler({
  type: "announcements",
  validate: validateAnnouncement,
  applyUpdate: (existing, body) => ({
    ...existing,
    title: String(body.title).trim(),
    body: String(body.body).trim(),
    important: Boolean(body.important),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  })
});

// ../../../../../home/claude/site_src/belanagar-saraswati-puja/server/routes/authRoutes.js
function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}
async function login(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.socket?.remoteAddress || "unknown";
  if (!checkLoginRateLimit(ip)) {
    return res.status(429).json({ error: "\u092C\u0939\u0941\u0924 \u0905\u0927\u093F\u0915 \u092A\u094D\u0930\u092F\u093E\u0938\u0964 \u0915\u0943\u092A\u092F\u093E \u0915\u0941\u091B \u0926\u0947\u0930 \u092C\u093E\u0926 \u092A\u0941\u0928\u0903 \u092A\u094D\u0930\u092F\u093E\u0938 \u0915\u0930\u0947\u0902\u0964" });
  }
  const body = typeof req.body === "string" ? safeJson(req.body) : req.body || {};
  const { password } = body;
  if (!password || typeof password !== "string") {
    return res.status(400).json({ error: "\u092A\u093E\u0938\u0935\u0930\u094D\u0921 \u0906\u0935\u0936\u094D\u092F\u0915 \u0939\u0948\u0964" });
  }
  const storedHash = (process.env.ADMIN_PASSWORD_HASH || "").trim();
  if (!storedHash) {
    console.error("[api] ADMIN_PASSWORD_HASH is not set");
    return res.status(500).json({ error: "\u0938\u0930\u094D\u0935\u0930 \u0938\u0939\u0940 \u0938\u0947 \u0938\u0947\u091F\u0905\u092A \u0928\u0939\u0940\u0902 \u0939\u0948\u0964 \u0915\u0943\u092A\u092F\u093E \u090F\u0921\u092E\u093F\u0928 \u0938\u0947 \u0938\u0902\u092A\u0930\u094D\u0915 \u0915\u0930\u0947\u0902\u0964" });
  }
  if (!verifyPassword(password, storedHash)) {
    return res.status(401).json({ error: "\u0917\u0932\u0924 \u092A\u093E\u0938\u0935\u0930\u094D\u0921\u0964 \u0915\u0943\u092A\u092F\u093E \u092A\u0941\u0928\u0903 \u092A\u094D\u0930\u092F\u093E\u0938 \u0915\u0930\u0947\u0902\u0964" });
  }
  clearLoginRateLimit(ip);
  res.setHeader("Set-Cookie", createSessionCookie());
  return res.status(200).json({ success: true });
}
async function logout(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  res.setHeader("Set-Cookie", clearSessionCookie());
  return res.status(200).json({ success: true });
}
async function session(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  return res.status(200).json({ authenticated: isAuthenticated(req) });
}
var actions = { login, logout, session };
async function authRoutes(req, res, action) {
  const fn = Object.prototype.hasOwnProperty.call(actions, action) ? actions[action] : null;
  if (!fn) return res.status(404).json({ error: "Not found" });
  return fn(req, res);
}

// ../../../../../home/claude/site_src/belanagar-saraswati-puja/server/routes/summary.js
import { getFullDatabase } from "/home/claude/site_src/belanagar-saraswati-puja/stub-store.mjs";
async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const data = await getFullDatabase();
  const totalDonations = (data.donations || []).reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const totalExpenses = (data.expenses || []).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  return res.status(200).json({
    totalDonations,
    totalExpenses,
    balance: totalDonations - totalExpenses,
    lastUpdated: data.updatedAt
  });
}

// ../../../../../home/claude/site_src/belanagar-saraswati-puja/server/routes/audit.js
import { getCollection as getCollection2 } from "/home/claude/site_src/belanagar-saraswati-puja/stub-store.mjs";
async function handler2(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!isAuthenticated(req)) {
    return res.status(401).json({ error: "\u0905\u0928\u0927\u093F\u0915\u0943\u0924\u0964 \u0915\u0943\u092A\u092F\u093E \u0926\u094B\u092C\u093E\u0930\u093E \u0932\u0949\u0917\u093F\u0928 \u0915\u0930\u0947\u0902\u0964" });
  }
  const log = await getCollection2("auditLog");
  const sorted = [...log].sort((a, b) => new Date(b.at) - new Date(a.at));
  const { page = "1", pageSize = "20" } = req.query || {};
  const p = Math.max(1, Number(page) || 1);
  const ps = Math.min(100, Math.max(1, Number(pageSize) || 20));
  const paged = sorted.slice((p - 1) * ps, (p - 1) * ps + ps);
  return res.status(200).json({ items: paged, total: sorted.length, page: p, pageSize: ps });
}

// ../../../../../home/claude/site_src/belanagar-saraswati-puja/server/routes/contact.js
import { sendChatMessage } from "/home/claude/site_src/belanagar-saraswati-puja/stub-store.mjs";
var TURNSTILE_VERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
var WINDOW_MS = 60 * 60 * 1e3;
var MAX_PER_WINDOW = 5;
var hits = /* @__PURE__ */ new Map();
function fail(status, publicMessage) {
  const err = new Error(publicMessage);
  err.status = status;
  err.publicMessage = publicMessage;
  return err;
}
function clientIp(req) {
  const fwd = String(req.headers && req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return fwd || req.socket && req.socket.remoteAddress || "unknown";
}
function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5e3) hits.clear();
  return recent.length > MAX_PER_WINDOW;
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
var clean = (v, max) => typeof v === "string" ? v.replace(/\u0000/g, "").trim().slice(0, max) : "";
async function contact(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  if (clean(body.website, 200)) return res.status(200).json({ ok: true });
  const name = clean(body.name, 80);
  const contactInfo = clean(body.contactInfo, 120);
  const message = clean(body.message, 1e3);
  if (name.length < 2) throw fail(400, "\u0915\u0943\u092A\u092F\u093E \u0905\u092A\u0928\u093E \u0928\u093E\u092E \u0932\u093F\u0916\u0947\u0902\u0964");
  if (message.length < 10) throw fail(400, "\u0938\u0902\u0926\u0947\u0936 \u0915\u092E \u0938\u0947 \u0915\u092E 10 \u0905\u0915\u094D\u0937\u0930 \u0915\u093E \u0939\u094B\u0928\u093E \u091A\u093E\u0939\u093F\u090F\u0964");
  const ip = clientIp(req);
  if (rateLimited(ip)) throw fail(429, "\u092C\u0939\u0941\u0924 \u091C\u093C\u094D\u092F\u093E\u0926\u093E \u0938\u0902\u0926\u0947\u0936 \u092D\u0947\u091C\u0947 \u0917\u090F \u0939\u0948\u0902\u0964 \u0915\u0943\u092A\u092F\u093E \u0915\u0941\u091B \u0926\u0947\u0930 \u092C\u093E\u0926 \u092A\u094D\u0930\u092F\u093E\u0938 \u0915\u0930\u0947\u0902\u0964");
  await verifyTurnstile(clean(body.token, 4096), ip);
  await sendChatMessage(
    `\u{1F4E9} \u0935\u0947\u092C\u0938\u093E\u0907\u091F \u0938\u0947 \u0928\u092F\u093E \u0938\u0902\u0926\u0947\u0936

\u0928\u093E\u092E: ${name}
\u0938\u0902\u092A\u0930\u094D\u0915: ${contactInfo || "(\u0928\u0939\u0940\u0902 \u0926\u093F\u092F\u093E)"}

${message}`
  );
  return res.status(200).json({ ok: true });
}

// ../../../../../home/claude/site_src/belanagar-saraswati-puja/server/routes/payments.js
import { randomBytes } from "node:crypto";
import { getCollection as getCollection3, getFullDatabase as getFullDatabase2, transact as transact2, notify } from "/home/claude/site_src/belanagar-saraswati-puja/stub-store.mjs";
var UPI_ID = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z][a-zA-Z0-9.-]{1,63}$/;
var ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
var WINDOW_MS2 = 60 * 60 * 1e3;
var MAX_PER_WINDOW2 = 12;
var hits2 = /* @__PURE__ */ new Map();
function fail2(status, message, errors) {
  const e = new Error(message);
  e.status = status;
  e.publicMessage = message;
  e.errors = errors;
  return e;
}
var clientIp2 = (req) => String(req.headers && req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.socket && req.socket.remoteAddress || "unknown";
function rateLimited2(ip) {
  const now = Date.now();
  const recent = (hits2.get(ip) || []).filter((t) => now - t < WINDOW_MS2);
  recent.push(now);
  hits2.set(ip, recent);
  if (hits2.size > 5e3) hits2.clear();
  return recent.length > MAX_PER_WINDOW2;
}
var clean2 = (v, max) => typeof v === "string" ? v.replace(/\u0000/g, "").trim().slice(0, max) : "";
var newRef = () => "BSP-" + Array.from(randomBytes(6), (b) => ALPHABET[b % 32]).join("");
var istDate = () => (/* @__PURE__ */ new Date()).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
var donorView = (p) => ({ id: p.id, amount: p.amount, status: p.status, utrSubmitted: Boolean(p.utr), createdAt: p.createdAt });
function buildLink(donation, p) {
  const parts = [`pa=${donation.upiId}`];
  if (donation.payeeName) parts.push(`pn=${encodeURIComponent(donation.payeeName)}`);
  parts.push(`am=${p.amount}`, "cu=INR", `tn=${encodeURIComponent(p.id)}`, `tr=${encodeURIComponent(p.id)}`);
  return `upi://pay?${parts.join("&")}`;
}
function validateCreate(b, max) {
  const errors = {};
  if (!clean2(b.name, 120)) errors.name = "\u0928\u093E\u092E \u0906\u0935\u0936\u094D\u092F\u0915 \u0939\u0948";
  const amt = Number(b.amount);
  if (!Number.isInteger(amt) || amt < 1 || amt > max) errors.amount = `\u0930\u093E\u0936\u093F \u20B91 \u0938\u0947 \u20B9${max} \u0915\u0947 \u092C\u0940\u091A \u092A\u0942\u0930\u094D\u0923 \u0938\u0902\u0916\u094D\u092F\u093E \u0939\u094B`;
  const phone = clean2(b.phone, 20);
  if (phone && !/^[6-9]\d{9}$/.test(phone.replace(/^\+?91/, "").replace(/[\s-]/g, ""))) errors.phone = "\u092E\u094B\u092C\u093E\u0907\u0932 \u0928\u0902\u092C\u0930 \u0938\u0939\u0940 \u0928\u0939\u0940\u0902 \u0939\u0948";
  return errors;
}
async function payments(req, res, id) {
  const method = req.method;
  if (method === "POST" && !id) {
    const b = req.body || {};
    if (b.website) return res.status(200).json({ ok: true });
    if (rateLimited2(clientIp2(req))) throw fail2(429, "\u092C\u0939\u0941\u0924 \u0905\u0927\u093F\u0915 \u092A\u094D\u0930\u092F\u093E\u0938\u0964 \u0915\u0943\u092A\u092F\u093E \u0915\u0941\u091B \u0926\u0947\u0930 \u092C\u093E\u0926 \u0926\u094B\u092C\u093E\u0930\u093E \u0915\u0930\u0947\u0902\u0964");
    const data = await getFullDatabase2();
    const d = data.settings && data.settings.donation || {};
    if (d.enabled === false || !UPI_ID.test(String(d.upiId || ""))) throw fail2(503, "\u0911\u0928\u0932\u093E\u0907\u0928 \u0926\u093E\u0928 \u0905\u092D\u0940 \u091A\u093E\u0932\u0942 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964");
    const errors = validateCreate(b, d.maxAmount || 1e5);
    if (Object.keys(errors).length) throw fail2(400, "\u0915\u0943\u092A\u092F\u093E \u091C\u093E\u0928\u0915\u093E\u0930\u0940 \u091C\u093E\u0902\u091A\u0947\u0902\u0964", errors);
    const p = {
      id: newRef(),
      name: clean2(b.name, 120),
      phone: clean2(b.phone, 20),
      amount: Number(b.amount),
      anonymous: Boolean(b.anonymous),
      status: "pending",
      utr: "",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await transact2((db) => {
      db.payments = [...db.payments || [], p].slice(-2e3);
    });
    await notify(`\u{1F4B0} \u0928\u092F\u093E \u0911\u0928\u0932\u093E\u0907\u0928 \u0926\u093E\u0928 (\u092A\u0941\u0937\u094D\u091F\u093F \u092C\u093E\u0915\u0940)
${p.name} \u2014 \u20B9${p.amount}
\u0938\u0902\u0926\u0930\u094D\u092D: ${p.id}
Admin > \u0911\u0928\u0932\u093E\u0907\u0928 \u092D\u0941\u0917\u0924\u093E\u0928 \u092E\u0947\u0902 \u092A\u0941\u0937\u094D\u091F\u093F \u0915\u0930\u0947\u0902\u0964`);
    return res.status(201).json({ payment: donorView(p), upiLink: buildLink(d, p), upiId: d.upiId });
  }
  if (id && (method === "GET" || method === "POST")) {
    if (rateLimited2(clientIp2(req))) throw fail2(429, "\u092C\u0939\u0941\u0924 \u0905\u0927\u093F\u0915 \u092A\u094D\u0930\u092F\u093E\u0938\u0964 \u0915\u0943\u092A\u092F\u093E \u0915\u0941\u091B \u0926\u0947\u0930 \u092C\u093E\u0926 \u0926\u094B\u092C\u093E\u0930\u093E \u0915\u0930\u0947\u0902\u0964");
    const list7 = await getCollection3("payments");
    const p = list7.find((x) => x.id === id);
    if (!p) return res.status(404).json({ error: "\u092D\u0941\u0917\u0924\u093E\u0928 \u0928\u0939\u0940\u0902 \u092E\u093F\u0932\u093E\u0964" });
    if (method === "GET") return res.status(200).json({ payment: donorView(p) });
    const utr = clean2((req.body || {}).utr, 30).replace(/\s/g, "");
    if (!/^[A-Za-z0-9]{10,22}$/.test(utr)) throw fail2(400, "UTR / Transaction ID \u0938\u0939\u0940 \u0928\u0939\u0940\u0902 \u0939\u0948 (\u0906\u092E\u0924\u094C\u0930 \u092A\u0930 12 \u0905\u0902\u0915)\u0964");
    if (p.status !== "pending") throw fail2(409, "\u0907\u0938 \u092D\u0941\u0917\u0924\u093E\u0928 \u0915\u0940 \u0938\u092E\u0940\u0915\u094D\u0937\u093E \u0939\u094B \u091A\u0941\u0915\u0940 \u0939\u0948\u0964");
    await transact2((db) => {
      const row = (db.payments || []).find((x) => x.id === id);
      if (row && row.status === "pending") {
        row.utr = utr;
        row.utrAt = (/* @__PURE__ */ new Date()).toISOString();
      }
    });
    return res.status(200).json({ ok: true });
  }
  if (!isAuthenticated(req)) return res.status(401).json({ error: "\u0905\u0928\u0927\u093F\u0915\u0943\u0924\u0964 \u0915\u0943\u092A\u092F\u093E \u0926\u094B\u092C\u093E\u0930\u093E \u0932\u0949\u0917\u093F\u0928 \u0915\u0930\u0947\u0902\u0964" });
  if (method === "GET" && !id) {
    const status = typeof (req.query || {}).status === "string" ? req.query.status : "";
    const all = [...await getCollection3("payments")].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const items = status ? all.filter((p) => p.status === status) : all;
    const pending = all.filter((p) => p.status === "pending").length;
    return res.status(200).json({ items: items.slice(0, 200), total: items.length, pending });
  }
  if (method === "PUT" && id) {
    const action = (req.body || {}).status;
    if (action !== "confirmed" && action !== "rejected") throw fail2(400, "\u0905\u092E\u093E\u0928\u094D\u092F \u0915\u093E\u0930\u094D\u0930\u0935\u093E\u0908\u0964");
    let out;
    await transact2((db) => {
      const p = (db.payments || []).find((x) => x.id === id);
      if (!p) throw fail2(404, "\u092D\u0941\u0917\u0924\u093E\u0928 \u0928\u0939\u0940\u0902 \u092E\u093F\u0932\u093E\u0964");
      if (p.status !== "pending") throw fail2(409, "\u0907\u0938 \u092D\u0941\u0917\u0924\u093E\u0928 \u0915\u0940 \u0938\u092E\u0940\u0915\u094D\u0937\u093E \u092A\u0939\u0932\u0947 \u0939\u094B \u091A\u0941\u0915\u0940 \u0939\u0948\u0964");
      p.status = action;
      p.reviewedAt = (/* @__PURE__ */ new Date()).toISOString();
      if (action === "confirmed") {
        db.counters = db.counters || {};
        const seq = (db.counters.donations || 0) + 1;
        db.counters.donations = seq;
        const don = {
          id: `DON-${(/* @__PURE__ */ new Date()).getFullYear()}-${String(seq).padStart(4, "0")}`,
          type: "donation",
          name: p.name,
          anonymous: p.anonymous,
          amount: p.amount,
          date: istDate(),
          purpose: "\u0911\u0928\u0932\u093E\u0907\u0928 UPI \u0926\u093E\u0928",
          note: `UPI ref ${p.id}${p.utr ? `, UTR ${p.utr}` : ""}`,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        db.donations = [...db.donations || [], don];
        p.donationId = don.id;
      }
      db.auditLog = [
        ...db.auditLog || [],
        {
          id: `AUD-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
          action: action === "confirmed" ? "CONFIRM" : "REJECT",
          recordType: "payments",
          recordId: p.id,
          oldValue: null,
          newValue: { amount: p.amount, donationId: p.donationId || null },
          at: (/* @__PURE__ */ new Date()).toISOString()
        }
      ].slice(-500);
      out = { ...p };
    });
    return res.status(200).json({ payment: out });
  }
  res.setHeader("Allow", "GET, POST, PUT");
  return res.status(405).json({ error: "Method not allowed" });
}

// ../../../../../home/claude/site_src/belanagar-saraswati-puja/server/routes/users.js
import crypto2 from "node:crypto";
import { getFullDatabase as getFullDatabase3, transact as transact4, storeImage, fetchStoredFile, deleteStoredMessage, notify as notify3 } from "/home/claude/site_src/belanagar-saraswati-puja/stub-store.mjs";

// ../../../../../home/claude/site_src/belanagar-saraswati-puja/server/emailCheck.js
import { resolveMx, resolve4 } from "/home/claude/site_src/belanagar-saraswati-puja/stub-dns.mjs";
var DISPOSABLE = new Set(`
mailinator.com mailinator.net guerrillamail.com guerrillamail.net guerrillamail.org guerrillamail.biz guerrillamail.de guerrillamailblock.com sharklasers.com grr.la spam4.me pokemail.net
10minutemail.com 10minutemail.net 10minutemail.org 10minemail.com 20minutemail.com 30minutemail.com minutemail.com tempmail.com temp-mail.org temp-mail.io temp-mail.ru tempmail.net tempmail.dev tempmail.email tempmailo.com
tempr.email tempail.com tempinbox.com temporary-mail.net temporaryemail.net yopmail.com yopmail.net yopmail.fr cool.fr.nf jetable.fr.nf nospam.ze.tc nomail.xl.cx mega.zik.dj speed.1s.fr courriel.fr.nf moncourrier.fr.nf monemail.fr.nf monmail.fr.nf
trashmail.com trashmail.net trashmail.org trashmail.de trashmail.io trashmail.me trash-mail.com trash-mail.de wegwerfmail.de wegwerfmail.net wegwerfmail.org getnada.com nada.email dispostable.com maildrop.cc mailnesia.com
throwawaymail.com throwam.com fakeinbox.com fakemail.net fakemailgenerator.com mintemail.com mohmal.com emailondeck.com burnermail.io moakt.com moakt.cc tmpmail.org tmpmail.net mytemp.email mytrashmail.com
spamgourmet.com spambox.us spamex.com spamfree24.org discard.email discardmail.com discardmail.de dropmail.me emailfake.com email-fake.com fakeemail.org gettempmail.com guerrillamail.info inboxkitten.com
harakirimail.com incognitomail.com instantemailaddress.com jourrapide.com armyspy.com cuvox.de dayrep.com einrot.com fleckens.hu gustr.com rhyta.com superrito.com teleworm.us
mailcatch.com mailforspam.com mailnull.com mailsac.com mailtemp.info mailtothis.com mintemail.com mt2015.com mytempemail.com nowmymail.com objectmail.com owlpic.com
sogetthis.com spam.la spamavert.com spamherelots.com spamhereplease.com spamhole.com spamify.com spaml.com supermailer.jp tempemail.co.za tempemail.com tempemail.net tempmailaddress.com
tempsky.com throwawayemailaddress.com trbvm.com trillianpro.com twinmail.de wh4f.org yepmail.net zippymail.info zoemail.org 33mail.com anonbox.net anonymbox.com binkmail.com bobmail.info bccto.me
chacuo.net cheatmail.de deadaddress.com despam.it devnullmail.com dingbone.com dodgeit.com dodgit.com dontreg.com e4ward.com emailias.com emailsensei.com emailtemporanea.net emailwarden.com
fastacura.com filzmail.com get2mail.fr getairmail.com guerrillamail.com haltospam.com imails.info inbox.si inboxalias.com jetable.org kasmail.com klzlk.com kurzepost.de lroid.com lookugly.com
mailexpire.com mailmetrash.com mailmoat.com mailzilla.com meltmail.com messagebeamer.de mierdamail.com nepwk.com no-spam.ws noclickemail.com nobulk.com notmailinator.com
nwldx.com pjjkp.com plexolan.de pookmail.com privacy.net proxymail.eu putthisinyourspamdatabase.com quickinbox.com rcpt.at reallymymail.com recode.me regbypass.com safetymail.info
sendspamhere.com shiftmail.com skeefmail.com slopsbox.com smellfear.com snakemail.com sneakemail.com sofort-mail.de spamstack.net spamthis.co.uk tagyourself.com thankyou2010.com
thisisnotmyrealemail.com tradermail.info trash2009.com trashymail.com turual.com uggsrock.com veryrealemail.com vomoto.com wegwerfadresse.de wuzupmail.net xagloo.com yuurok.com zehnminutenmail.com
1secmail.com 1secmail.net 1secmail.org esiix.com wwjmp.com vjuum.com laafd.com txcct.com kzccv.com qiott.com oosln.com icznn.com ezztt.com cevipsa.com
tmail.ws tmails.net tmpeml.com tmpbox.net mail.tm mail.gw internxt.com smailpro.com luxusmail.org emltmp.com fakemailbox.com maildu.de inboxbear.com
`.split(/\s+/).filter(Boolean));
var SUSPICIOUS = /(temp-?mail|tempmail|10-?minute|guerrilla|throwaway|trash-?mail|mailinator|yopmail|fake-?(mail|inbox)|disposable|burner|spambox|getnada|dispostable)/i;
var EXTRA = (process.env.DISPOSABLE_EXTRA || "").split(",").map((d) => d.trim().toLowerCase()).filter(Boolean);
var EMAIL = /^[a-z0-9._%+-]{1,64}@([a-z0-9-]+(\.[a-z0-9-]+)+)$/;
function normalizeEmail(input) {
  return String(input || "").trim().toLowerCase();
}
function isDisposableDomain(domain) {
  const d = String(domain).toLowerCase();
  if (EXTRA.includes(d)) return true;
  const parts = d.split(".");
  for (let i = 0; i < parts.length - 1; i += 1) {
    if (DISPOSABLE.has(parts.slice(i).join("."))) return true;
  }
  return SUSPICIOUS.test(d);
}
async function checkEmail(email) {
  const m = EMAIL.exec(email);
  if (!m || email.length > 254 || email.includes("..")) return "\u0915\u0943\u092A\u092F\u093E \u0938\u0939\u0940 \u0908\u092E\u0947\u0932 \u092A\u0924\u093E \u0932\u093F\u0916\u0947\u0902\u0964";
  const domain = m[1];
  if (isDisposableDomain(domain)) return "\u0905\u0938\u094D\u0925\u093E\u092F\u0940 (temp) \u0908\u092E\u0947\u0932 \u092E\u093E\u0928\u094D\u092F \u0928\u0939\u0940\u0902 \u0939\u0948\u0964 \u0915\u0943\u092A\u092F\u093E \u0905\u092A\u0928\u093E \u0905\u0938\u0932\u0940 \u0908\u092E\u0947\u0932 \u0909\u092A\u092F\u094B\u0917 \u0915\u0930\u0947\u0902\u0964";
  try {
    const mx = await resolveMx(domain);
    if (!mx || mx.length === 0) throw new Error("no mx");
  } catch (e) {
    if (e && (e.code === "ENOTFOUND" || e.code === "ENODATA" || e.message === "no mx")) {
      try {
        const a = await resolve4(domain);
        if (a && a.length) return "";
      } catch {
      }
      return "\u0907\u0938 \u0908\u092E\u0947\u0932 \u0915\u093E \u0921\u094B\u092E\u0947\u0928 \u092E\u0947\u0932 \u092A\u094D\u0930\u093E\u092A\u094D\u0924 \u0928\u0939\u0940\u0902 \u0915\u0930 \u0938\u0915\u0924\u093E\u0964 \u0915\u0943\u092A\u092F\u093E \u0908\u092E\u0947\u0932 \u091C\u093E\u0902\u091A\u0947\u0902\u0964";
    }
  }
  return "";
}

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

// ../../../../../home/claude/site_src/belanagar-saraswati-puja/server/routes/oauth.js
import crypto from "node:crypto";
import { transact as transact3, notify as notify2 } from "/home/claude/site_src/belanagar-saraswati-puja/stub-store.mjs";
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
  const fail4 = () => redirect(res, "/login?error=oauth", [clearOAuthCookie()]);
  if (q.error || !q.code || !q.state) return fail4();
  const name = checkOAuthState(req, String(q.state));
  if (!name || !configured(name)) return fail4();
  let profile;
  try {
    profile = await fetchProfile(name, String(q.code), req);
  } catch (err) {
    console.error("[oauth]", name, err && err.message);
    return fail4();
  }
  const email = profile.email.trim().toLowerCase();
  let user;
  let created = false;
  await transact3((db) => {
    db.users = db.users || [];
    let u = db.users.find((x) => x.email === email);
    if (!u) {
      u = { id: `USR-${crypto.randomBytes(6).toString("hex")}`, name: String(profile.name).slice(0, 60), email, passwordHash: "", verified: true, provider: name, createdAt: (/* @__PURE__ */ new Date()).toISOString() };
      db.users.push(u);
      created = true;
    } else if (!u.verified) {
      Object.assign(u, { verified: true, verifiedAt: (/* @__PURE__ */ new Date()).toISOString() });
      delete u.otpHash;
    }
    user = { ...u };
  });
  if (created) await notify2(`\u{1F464} \u0928\u092F\u093E \u0938\u0926\u0938\u094D\u092F (${name}): ${user.name} (${user.email})`);
  return redirect(res, "/account", [createUserSessionCookie(user.id), clearOAuthCookie()]);
}

// ../../../../../home/claude/site_src/belanagar-saraswati-puja/server/routes/users.js
function fail3(status, message, errors) {
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
var hits3 = /* @__PURE__ */ new Map();
function limited(key, max, windowMs) {
  const now = Date.now();
  const recent = (hits3.get(key) || []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits3.set(key, recent);
  if (hits3.size > 5e3) hits3.clear();
  return recent.length > max;
}
var clean3 = (v, max) => typeof v === "string" ? v.replace(/\u0000/g, "").trim().slice(0, max) : "";
var clientIp3 = (req) => String(req.headers && req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.socket && req.socket.remoteAddress || "unknown";
var publicUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  avatarUrl: u.avatarFileId ? `/api/users/avatar?u=${encodeURIComponent(u.id)}&v=${u.avatarVersion || 0}` : "",
  createdAt: u.createdAt
});
var passwordError = (p) => typeof p !== "string" || p.length < 8 ? "\u092A\u093E\u0938\u0935\u0930\u094D\u0921 \u0915\u092E \u0938\u0947 \u0915\u092E 8 \u0905\u0915\u094D\u0937\u0930 \u0915\u093E \u0939\u094B\u0964" : p.length > 72 ? "\u092A\u093E\u0938\u0935\u0930\u094D\u0921 72 \u0905\u0915\u094D\u0937\u0930 \u0938\u0947 \u091B\u094B\u091F\u093E \u0930\u0916\u0947\u0902\u0964" : "";
var newOtp = () => String(crypto2.randomInt(0, 1e6)).padStart(6, "0");
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
  if (clean3(b.website, 200)) return res.status(200).json({ ok: true, email: "" });
  const ip = clientIp3(req);
  if (limited(`reg:${ip}`, 8, 60 * 60 * 1e3)) throw fail3(429, "\u092C\u0939\u0941\u0924 \u0905\u0927\u093F\u0915 \u092A\u094D\u0930\u092F\u093E\u0938\u0964 \u0915\u0943\u092A\u092F\u093E \u0915\u0941\u091B \u0926\u0947\u0930 \u092C\u093E\u0926 \u0926\u094B\u092C\u093E\u0930\u093E \u0915\u0930\u0947\u0902\u0964");
  const name = clean3(b.name, 60);
  const email = normalizeEmail(b.email);
  const errors = {};
  if (name.length < 2) errors.name = "\u0915\u0943\u092A\u092F\u093E \u0905\u092A\u0928\u093E \u0928\u093E\u092E \u0932\u093F\u0916\u0947\u0902\u0964";
  const pe = passwordError(b.password);
  if (pe) errors.password = pe;
  const ee = await checkEmail(email);
  if (ee) errors.email = ee;
  if (Object.keys(errors).length) throw fail3(400, "\u0915\u0943\u092A\u092F\u093E \u091C\u093E\u0928\u0915\u093E\u0930\u0940 \u091C\u093E\u0902\u091A\u0947\u0902\u0964", errors);
  await verifyTurnstile(clean3(b.token, 4096), ip);
  const passwordHash = hashPassword(b.password);
  const code = newOtp();
  let user;
  await transact4((db) => {
    const now = Date.now();
    db.users = (db.users || []).filter((u) => u.verified || now - new Date(u.createdAt).getTime() < UNVERIFIED_TTL_MS);
    const existing = db.users.find((u) => u.email === email);
    if (existing && existing.verified) throw fail3(409, "\u0907\u0938 \u0908\u092E\u0947\u0932 \u0938\u0947 \u0916\u093E\u0924\u093E \u092A\u0939\u0932\u0947 \u0938\u0947 \u0939\u0948\u0964 \u0915\u0943\u092A\u092F\u093E \u0932\u0949\u0917\u093F\u0928 \u0915\u0930\u0947\u0902\u0964");
    if (existing) {
      if (existing.otpSentAt && now - existing.otpSentAt < RESEND_GAP_MS) throw fail3(429, "\u0915\u0943\u092A\u092F\u093E 1 \u092E\u093F\u0928\u091F \u092C\u093E\u0926 \u0926\u094B\u092C\u093E\u0930\u093E \u0915\u094B\u0921 \u092E\u0902\u0917\u093E\u090F\u0902\u0964");
      Object.assign(existing, { name, passwordHash });
      user = existing;
    } else {
      user = {
        id: `USR-${crypto2.randomBytes(6).toString("hex")}`,
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
    if (user.sends.length >= MAX_SENDS_PER_HOUR) throw fail3(429, "\u0907\u0938 \u0908\u092E\u0947\u0932 \u092A\u0930 \u092C\u0939\u0941\u0924 \u0915\u094B\u0921 \u092D\u0947\u091C\u0947 \u091C\u093E \u091A\u0941\u0915\u0947 \u0939\u0948\u0902\u0964 1 \u0918\u0902\u091F\u0947 \u092C\u093E\u0926 \u092A\u094D\u0930\u092F\u093E\u0938 \u0915\u0930\u0947\u0902\u0964");
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
  if (limited(`rs:${clientIp3(req)}`, 10, 60 * 60 * 1e3)) throw fail3(429, "\u092C\u0939\u0941\u0924 \u0905\u0927\u093F\u0915 \u092A\u094D\u0930\u092F\u093E\u0938\u0964 \u0915\u0943\u092A\u092F\u093E \u0915\u0941\u091B \u0926\u0947\u0930 \u092C\u093E\u0926 \u0926\u094B\u092C\u093E\u0930\u093E \u0915\u0930\u0947\u0902\u0964");
  const code = newOtp();
  let user = null;
  await transact4((db) => {
    const u = (db.users || []).find((x) => x.email === email && !x.verified);
    if (!u) return;
    const now = Date.now();
    if (u.otpSentAt && now - u.otpSentAt < RESEND_GAP_MS) throw fail3(429, "\u0915\u0943\u092A\u092F\u093E 1 \u092E\u093F\u0928\u091F \u092C\u093E\u0926 \u0926\u094B\u092C\u093E\u0930\u093E \u0915\u094B\u0921 \u092E\u0902\u0917\u093E\u090F\u0902\u0964");
    u.sends = (u.sends || []).filter((t) => now - t < 60 * 60 * 1e3);
    if (u.sends.length >= MAX_SENDS_PER_HOUR) throw fail3(429, "\u0907\u0938 \u0908\u092E\u0947\u0932 \u092A\u0930 \u092C\u0939\u0941\u0924 \u0915\u094B\u0921 \u092D\u0947\u091C\u0947 \u091C\u093E \u091A\u0941\u0915\u0947 \u0939\u0948\u0902\u0964 1 \u0918\u0902\u091F\u0947 \u092C\u093E\u0926 \u092A\u094D\u0930\u092F\u093E\u0938 \u0915\u0930\u0947\u0902\u0964");
    u.sends.push(now);
    Object.assign(u, { otpHash: otpHash(u.id, code), otpExp: now + OTP_TTL_MS, otpTries: 0, otpSentAt: now });
    user = { ...u };
  });
  if (user) await mailCode(user, code);
  return res.status(200).json({ ok: true });
}
async function verify(req, res) {
  const b = bodyOf(req);
  const email = normalizeEmail(b.email);
  const code = clean3(b.code, 10);
  if (!/^\d{6}$/.test(code)) throw fail3(400, "\u0915\u094B\u0921 6 \u0905\u0902\u0915\u094B\u0902 \u0915\u093E \u0939\u094B\u0924\u093E \u0939\u0948\u0964");
  if (limited(`vf:${clientIp3(req)}`, 30, 60 * 60 * 1e3)) throw fail3(429, "\u092C\u0939\u0941\u0924 \u0905\u0927\u093F\u0915 \u092A\u094D\u0930\u092F\u093E\u0938\u0964 \u0915\u0943\u092A\u092F\u093E \u0915\u0941\u091B \u0926\u0947\u0930 \u092C\u093E\u0926 \u0926\u094B\u092C\u093E\u0930\u093E \u0915\u0930\u0947\u0902\u0964");
  let user = null;
  let problem = "";
  await transact4((db) => {
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
    if (a.length !== c.length || !crypto2.timingSafeEqual(a, c)) {
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
  if (!user) throw fail3(400, problem);
  await notify3(`\u{1F464} \u0928\u092F\u093E \u0938\u0926\u0938\u094D\u092F: ${user.name} (${user.email})`);
  res.setHeader("Set-Cookie", createUserSessionCookie(user.id));
  return res.status(200).json({ user: publicUser(user) });
}
async function login2(req, res) {
  const b = bodyOf(req);
  const ip = clientIp3(req);
  if (!checkLoginRateLimit(`user:${ip}`)) throw fail3(429, "\u092C\u0939\u0941\u0924 \u0905\u0927\u093F\u0915 \u092A\u094D\u0930\u092F\u093E\u0938\u0964 \u0915\u0943\u092A\u092F\u093E \u0915\u0941\u091B \u0926\u0947\u0930 \u092C\u093E\u0926 \u092A\u094D\u0930\u092F\u093E\u0938 \u0915\u0930\u0947\u0902\u0964");
  const email = normalizeEmail(b.email);
  const data = await getFullDatabase3();
  const u = (data.users || []).find((x) => x.email === email);
  const ok = u && typeof b.password === "string" && verifyPassword(b.password, u.passwordHash);
  if (!ok) throw fail3(401, "\u0908\u092E\u0947\u0932 \u092F\u093E \u092A\u093E\u0938\u0935\u0930\u094D\u0921 \u0917\u0932\u0924 \u0939\u0948\u0964");
  if (!u.verified) throw fail3(403, "\u092A\u0939\u0932\u0947 \u0905\u092A\u0928\u093E \u0908\u092E\u0947\u0932 \u0938\u0924\u094D\u092F\u093E\u092A\u093F\u0924 \u0915\u0930\u0947\u0902\u0964");
  res.setHeader("Set-Cookie", createUserSessionCookie(u.id));
  return res.status(200).json({ user: publicUser(u) });
}
async function me(req, res) {
  const uid = getUserId(req);
  if (!uid) return res.status(200).json({ user: null });
  const data = await getFullDatabase3();
  const u = (data.users || []).find((x) => x.id === uid && x.verified);
  if (!u) return res.status(200).json({ user: null });
  if (req.method === "PUT") {
    const name = clean3(bodyOf(req).name, 60);
    if (name.length < 2) throw fail3(400, "\u0915\u0943\u092A\u092F\u093E \u0905\u092A\u0928\u093E \u0928\u093E\u092E \u0932\u093F\u0916\u0947\u0902\u0964");
    let updated;
    await transact4((db) => {
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
    const uid2 = clean3((req.query || {}).u, 40);
    const data2 = await getFullDatabase3();
    const u2 = (data2.users || []).find((x) => x.id === uid2);
    if (!u2 || !u2.avatarFileId) return res.status(404).json({ error: "\u092B\u094B\u091F\u094B \u0928\u0939\u0940\u0902 \u092E\u093F\u0932\u0940\u0964" });
    const buf2 = await fetchStoredFile(u2.avatarFileId);
    res.setHeader("Content-Type", u2.avatarMime || "image/jpeg");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "public, max-age=86400, immutable");
    return res.status(200).end(buf2);
  }
  if (req.method !== "POST") throw fail3(405, "Method not allowed");
  const uid = getUserId(req);
  if (!uid) throw fail3(401, "\u0915\u0943\u092A\u092F\u093E \u092A\u0939\u0932\u0947 \u0932\u0949\u0917\u093F\u0928 \u0915\u0930\u0947\u0902\u0964");
  if (limited(`av:${uid}`, AVATAR_PER_HOUR, 60 * 60 * 1e3)) throw fail3(429, "\u090F\u0915 \u0918\u0902\u091F\u0947 \u092E\u0947\u0902 10 \u0938\u0947 \u0905\u0927\u093F\u0915 \u092B\u094B\u091F\u094B \u0905\u092A\u0932\u094B\u0921 \u0928\u0939\u0940\u0902 \u0939\u094B \u0938\u0915\u0924\u0940\u0902\u0964");
  const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(String(bodyOf(req).image || ""));
  if (!m) throw fail3(400, "\u0915\u0947\u0935\u0932 JPG, PNG \u092F\u093E WEBP \u092B\u094B\u091F\u094B \u092E\u093E\u0928\u094D\u092F \u0939\u0948\u0964");
  const buf = Buffer.from(m[2], "base64");
  if (buf.length > MAX_AVATAR_BYTES) throw fail3(413, "\u092B\u094B\u091F\u094B 2MB \u0938\u0947 \u091B\u094B\u091F\u0940 \u0939\u094B\u0928\u0940 \u091A\u093E\u0939\u093F\u090F\u0964");
  const real = sniff(buf);
  if (!real || real !== m[1]) throw fail3(400, "\u092F\u0939 \u092B\u093C\u093E\u0907\u0932 \u0905\u0938\u0932\u0940 \u092B\u094B\u091F\u094B \u0928\u0939\u0940\u0902 \u0932\u0917\u0924\u0940\u0964 \u0915\u0947\u0935\u0932 JPG, PNG \u092F\u093E WEBP \u092E\u093E\u0928\u094D\u092F \u0939\u0948\u0964");
  const data = await getFullDatabase3();
  const u = (data.users || []).find((x) => x.id === uid && x.verified);
  if (!u) throw fail3(401, "\u0915\u0943\u092A\u092F\u093E \u092A\u0939\u0932\u0947 \u0932\u0949\u0917\u093F\u0928 \u0915\u0930\u0947\u0902\u0964");
  const stored = await storeImage(buf, real, `avatar-${uid}-${Date.now()}-${crypto2.randomBytes(4).toString("hex")}.${EXT_OK[real]}`);
  let oldMsg = null;
  let updated;
  try {
    await transact4((db) => {
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
  if (action === "verify" && m === "POST") return verify(req, res);
  if (action === "resend" && m === "POST") return resend(req, res);
  if (action === "login" && m === "POST") return login2(req, res);
  if (action === "logout" && m === "POST") {
    res.setHeader("Set-Cookie", clearUserSessionCookie());
    return res.status(200).json({ ok: true });
  }
  if (action === "me" && (m === "GET" || m === "PUT")) return me(req, res);
  if (action === "avatar" && (m === "GET" || m === "POST")) return avatar(req, res);
  return res.status(404).json({ error: "Not found" });
}

// ../../../../../home/claude/site_src/belanagar-saraswati-puja/server/routes/settings.js
import { getFullDatabase as getFullDatabase4, transact as transact5, sendChatMessage as sendChatMessage2 } from "/home/claude/site_src/belanagar-saraswati-puja/stub-store.mjs";
var UPI_ID2 = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z][a-zA-Z0-9.-]{1,63}$/;
function publicView(data) {
  const d = data.settings && data.settings.donation || {};
  return {
    donation: {
      enabled: d.enabled !== false,
      upiId: d.upiId || "",
      payeeName: d.payeeName || "",
      note: d.note || "",
      amounts: Array.isArray(d.amounts) ? d.amounts : [],
      maxAmount: d.maxAmount || 1e5
    }
  };
}
function validate(body) {
  const errors = {};
  const b = body || {};
  const upi = String(b.upiId || "").trim();
  if (upi && !UPI_ID2.test(upi)) errors.upiId = "UPI ID \u0938\u0939\u0940 \u0928\u0939\u0940\u0902 \u0939\u0948 (\u091C\u0948\u0938\u0947 name@bank)\u0964";
  const name = String(b.payeeName || "").trim();
  if (name.length > 60) errors.payeeName = "\u0928\u093E\u092E 60 \u0905\u0915\u094D\u0937\u0930\u094B\u0902 \u0938\u0947 \u091B\u094B\u091F\u093E \u0930\u0916\u0947\u0902\u0964";
  const note = String(b.note || "").trim();
  if (note.length > 60) errors.note = "\u0928\u094B\u091F 60 \u0905\u0915\u094D\u0937\u0930\u094B\u0902 \u0938\u0947 \u091B\u094B\u091F\u093E \u0930\u0916\u0947\u0902\u0964";
  const max = Number(b.maxAmount);
  if (!Number.isInteger(max) || max < 1 || max > 1e6) errors.maxAmount = "\u0905\u0927\u093F\u0915\u0924\u092E \u0930\u093E\u0936\u093F 1 \u0938\u0947 10,00,000 \u0915\u0947 \u092C\u0940\u091A \u0939\u094B\u0964";
  const amounts = Array.isArray(b.amounts) ? b.amounts.map(Number) : [];
  if (amounts.length > 8 || amounts.some((a) => !Number.isInteger(a) || a < 1 || a > (Number.isInteger(max) ? max : 1e6))) {
    errors.amounts = "\u0905\u0927\u093F\u0915\u0924\u092E 8 \u0930\u093E\u0936\u093F\u092F\u093E\u0901, \u0939\u0930 \u090F\u0915 1 \u0938\u0947 \u0905\u0927\u093F\u0915\u0924\u092E \u0930\u093E\u0936\u093F \u0915\u0947 \u092C\u0940\u091A \u092A\u0942\u0930\u094D\u0923 \u0938\u0902\u0916\u094D\u092F\u093E\u0964";
  }
  return errors;
}
async function handler3(req, res) {
  if (req.method === "GET") {
    return res.status(200).json(publicView(await getFullDatabase4()));
  }
  if (req.method === "POST") {
    if (!isAuthenticated(req)) return res.status(401).json({ error: "\u0905\u0928\u0927\u093F\u0915\u0943\u0924\u0964 \u0915\u0943\u092A\u092F\u093E \u0926\u094B\u092C\u093E\u0930\u093E \u0932\u0949\u0917\u093F\u0928 \u0915\u0930\u0947\u0902\u0964" });
    try {
      await sendChatMessage2("\u2705 \u091F\u0947\u0938\u094D\u091F \u0938\u0902\u0926\u0947\u0936: \u0935\u0947\u092C\u0938\u093E\u0907\u091F \u0915\u093E Telegram \u0915\u0928\u0947\u0915\u094D\u0936\u0928 \u0920\u0940\u0915 \u0939\u0948\u0964");
      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(502).json({ error: `Telegram \u0938\u0902\u0926\u0947\u0936 \u0928\u0939\u0940\u0902 \u092D\u0947\u091C\u093E \u091C\u093E \u0938\u0915\u093E: ${err.message}` });
    }
  }
  if (req.method !== "PUT") {
    res.setHeader("Allow", "GET, PUT, POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!isAuthenticated(req)) return res.status(401).json({ error: "\u0905\u0928\u0927\u093F\u0915\u0943\u0924\u0964 \u0915\u0943\u092A\u092F\u093E \u0926\u094B\u092C\u093E\u0930\u093E \u0932\u0949\u0917\u093F\u0928 \u0915\u0930\u0947\u0902\u0964" });
  const donation = req.body && req.body.donation || {};
  const errors = validate(donation);
  if (Object.keys(errors).length) return res.status(400).json({ error: "\u0915\u0943\u092A\u092F\u093E \u091C\u093E\u0928\u0915\u093E\u0930\u0940 \u0938\u0941\u0927\u093E\u0930\u0947\u0902\u0964", errors });
  const clean4 = {
    enabled: donation.enabled !== false,
    upiId: String(donation.upiId || "").trim(),
    payeeName: String(donation.payeeName || "").trim(),
    note: String(donation.note || "").trim(),
    amounts: [...new Set(donation.amounts.map(Number))],
    maxAmount: Number(donation.maxAmount)
  };
  const saved = await transact5((data) => {
    const old = data.settings && data.settings.donation || null;
    data.settings = { ...data.settings || {}, donation: { ...clean4, updatedAt: (/* @__PURE__ */ new Date()).toISOString() } };
    data.auditLog = [
      ...data.auditLog || [],
      {
        id: `AUD-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
        action: "UPDATE",
        recordType: "settings",
        recordId: "donation",
        oldValue: old ? { upiId: old.upiId, payeeName: old.payeeName } : null,
        newValue: { upiId: clean4.upiId, payeeName: clean4.payeeName },
        at: (/* @__PURE__ */ new Date()).toISOString()
      }
    ].slice(-500);
    return publicView(data);
  });
  return res.status(200).json(saved);
}

// ../../../../../home/claude/site_src/belanagar-saraswati-puja/api/router.js
var RESOURCES = { donations: donations_exports, expenses: expenses_exports, events: events_exports, committee: committee_exports, gallery: gallery_exports, announcements: announcements_exports };
var LOAD_FAILED = "\u0921\u0947\u091F\u093E \u0932\u094B\u0921 \u0928\u0939\u0940\u0902 \u0939\u094B \u0938\u0915\u093E\u0964 \u0915\u0943\u092A\u092F\u093E \u0915\u0941\u091B \u0926\u0947\u0930 \u092C\u093E\u0926 \u092A\u0941\u0928\u0903 \u092A\u094D\u0930\u092F\u093E\u0938 \u0915\u0930\u0947\u0902\u0964";
var SAVE_FAILED = "Save \u0928\u0939\u0940\u0902 \u0939\u094B \u0938\u0915\u093E\u0964 \u0915\u0943\u092A\u092F\u093E \u0926\u094B\u092C\u093E\u0930\u093E \u092A\u094D\u0930\u092F\u093E\u0938 \u0915\u0930\u0947\u0902\u0964";
function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
function resolveRoute(req) {
  const q = req.query || {};
  let resource = typeof q.resource === "string" ? q.resource : "";
  let id = typeof q.id === "string" ? q.id : "";
  if (!resource) {
    const parts = String(req.url || "").split("?")[0].split("/").filter(Boolean);
    const i = parts.indexOf("api");
    if (i !== -1) {
      resource = parts[i + 1] || "";
      id = parts[i + 2] || "";
    }
  }
  return { resource, id: safeDecode(id) };
}
async function handler4(req, res) {
  try {
    const { resource, id } = resolveRoute(req);
    if (resource === "summary") return await handler(req, res);
    if (resource === "audit") return await handler2(req, res);
    if (resource === "users") return await users(req, res, id);
    if (resource === "payments") return await payments(req, res, id);
    if (resource === "settings") return await handler3(req, res);
    if (resource === "contact") return await contact(req, res);
    if (resource === "auth") return await authRoutes(req, res, id);
    if (!Object.prototype.hasOwnProperty.call(RESOURCES, resource)) {
      return res.status(404).json({ error: "Not found" });
    }
    const route = RESOURCES[resource];
    return await (id ? route.item(req, res, { id }) : route.list(req, res));
  } catch (err) {
    console.error("[api]", req.method, req.url, err && err.stack ? err.stack : err);
    const isWrite = req.method && req.method !== "GET";
    const message = err && err.publicMessage || (isWrite ? SAVE_FAILED : LOAD_FAILED);
    const status = err && Number.isInteger(err.status) && err.status >= 400 && err.status < 600 ? err.status : 500;
    return res.status(status).json(err && err.errors ? { error: message, errors: err.errors } : { error: message });
  }
}
export {
  handler4 as default
};
