import {
  isAuthenticated
} from "../chunk-DR235NYX.js";

// ../../../../../home/claude/site_src/belanagar-saraswati-puja/server/routes/payments.js
import { randomBytes } from "node:crypto";
import { getCollection, getFullDatabase, transact, notify } from "/home/claude/site_src/belanagar-saraswati-puja/stub-store.mjs";
var UPI_ID = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z][a-zA-Z0-9.-]{1,63}$/;
var ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
var WINDOW_MS = 60 * 60 * 1e3;
var MAX_PER_WINDOW = 12;
var hits = /* @__PURE__ */ new Map();
function fail(status, message, errors) {
  const e = new Error(message);
  e.status = status;
  e.publicMessage = message;
  e.errors = errors;
  return e;
}
var clientIp = (req) => String(req.headers && req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.socket && req.socket.remoteAddress || "unknown";
function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5e3) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}
var clean = (v, max) => typeof v === "string" ? v.replace(/\u0000/g, "").trim().slice(0, max) : "";
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
  if (!clean(b.name, 120)) errors.name = "\u0928\u093E\u092E \u0906\u0935\u0936\u094D\u092F\u0915 \u0939\u0948";
  const amt = Number(b.amount);
  if (!Number.isInteger(amt) || amt < 1 || amt > max) errors.amount = `\u0930\u093E\u0936\u093F \u20B91 \u0938\u0947 \u20B9${max} \u0915\u0947 \u092C\u0940\u091A \u092A\u0942\u0930\u094D\u0923 \u0938\u0902\u0916\u094D\u092F\u093E \u0939\u094B`;
  const phone = clean(b.phone, 20);
  if (phone && !/^[6-9]\d{9}$/.test(phone.replace(/^\+?91/, "").replace(/[\s-]/g, ""))) errors.phone = "\u092E\u094B\u092C\u093E\u0907\u0932 \u0928\u0902\u092C\u0930 \u0938\u0939\u0940 \u0928\u0939\u0940\u0902 \u0939\u0948";
  return errors;
}
async function payments(req, res, id) {
  const method = req.method;
  if (method === "POST" && !id) {
    const b = req.body || {};
    if (b.website) return res.status(200).json({ ok: true });
    if (rateLimited(clientIp(req))) throw fail(429, "\u092C\u0939\u0941\u0924 \u0905\u0927\u093F\u0915 \u092A\u094D\u0930\u092F\u093E\u0938\u0964 \u0915\u0943\u092A\u092F\u093E \u0915\u0941\u091B \u0926\u0947\u0930 \u092C\u093E\u0926 \u0926\u094B\u092C\u093E\u0930\u093E \u0915\u0930\u0947\u0902\u0964");
    const data = await getFullDatabase();
    const d = data.settings && data.settings.donation || {};
    if (d.enabled === false || !UPI_ID.test(String(d.upiId || ""))) throw fail(503, "\u0911\u0928\u0932\u093E\u0907\u0928 \u0926\u093E\u0928 \u0905\u092D\u0940 \u091A\u093E\u0932\u0942 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964");
    const errors = validateCreate(b, d.maxAmount || 1e5);
    if (Object.keys(errors).length) throw fail(400, "\u0915\u0943\u092A\u092F\u093E \u091C\u093E\u0928\u0915\u093E\u0930\u0940 \u091C\u093E\u0902\u091A\u0947\u0902\u0964", errors);
    const p = {
      id: newRef(),
      name: clean(b.name, 120),
      phone: clean(b.phone, 20),
      amount: Number(b.amount),
      anonymous: Boolean(b.anonymous),
      status: "pending",
      utr: "",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await transact((db) => {
      db.payments = [...db.payments || [], p].slice(-2e3);
    });
    await notify(`\u{1F4B0} \u0928\u092F\u093E \u0911\u0928\u0932\u093E\u0907\u0928 \u0926\u093E\u0928 (\u092A\u0941\u0937\u094D\u091F\u093F \u092C\u093E\u0915\u0940)
${p.name} \u2014 \u20B9${p.amount}
\u0938\u0902\u0926\u0930\u094D\u092D: ${p.id}
Admin > \u0911\u0928\u0932\u093E\u0907\u0928 \u092D\u0941\u0917\u0924\u093E\u0928 \u092E\u0947\u0902 \u092A\u0941\u0937\u094D\u091F\u093F \u0915\u0930\u0947\u0902\u0964`);
    return res.status(201).json({ payment: donorView(p), upiLink: buildLink(d, p), upiId: d.upiId });
  }
  if (id && (method === "GET" || method === "POST")) {
    if (rateLimited(clientIp(req))) throw fail(429, "\u092C\u0939\u0941\u0924 \u0905\u0927\u093F\u0915 \u092A\u094D\u0930\u092F\u093E\u0938\u0964 \u0915\u0943\u092A\u092F\u093E \u0915\u0941\u091B \u0926\u0947\u0930 \u092C\u093E\u0926 \u0926\u094B\u092C\u093E\u0930\u093E \u0915\u0930\u0947\u0902\u0964");
    const list = await getCollection("payments");
    const p = list.find((x) => x.id === id);
    if (!p) return res.status(404).json({ error: "\u092D\u0941\u0917\u0924\u093E\u0928 \u0928\u0939\u0940\u0902 \u092E\u093F\u0932\u093E\u0964" });
    if (method === "GET") return res.status(200).json({ payment: donorView(p) });
    const utr = clean((req.body || {}).utr, 30).replace(/\s/g, "");
    if (!/^[A-Za-z0-9]{10,22}$/.test(utr)) throw fail(400, "UTR / Transaction ID \u0938\u0939\u0940 \u0928\u0939\u0940\u0902 \u0939\u0948 (\u0906\u092E\u0924\u094C\u0930 \u092A\u0930 12 \u0905\u0902\u0915)\u0964");
    if (p.status !== "pending") throw fail(409, "\u0907\u0938 \u092D\u0941\u0917\u0924\u093E\u0928 \u0915\u0940 \u0938\u092E\u0940\u0915\u094D\u0937\u093E \u0939\u094B \u091A\u0941\u0915\u0940 \u0939\u0948\u0964");
    await transact((db) => {
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
    const all = [...await getCollection("payments")].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const items = status ? all.filter((p) => p.status === status) : all;
    const pending = all.filter((p) => p.status === "pending").length;
    return res.status(200).json({ items: items.slice(0, 200), total: items.length, pending });
  }
  if (method === "PUT" && id) {
    const action = (req.body || {}).status;
    if (action !== "confirmed" && action !== "rejected") throw fail(400, "\u0905\u092E\u093E\u0928\u094D\u092F \u0915\u093E\u0930\u094D\u0930\u0935\u093E\u0908\u0964");
    let out;
    await transact((db) => {
      const p = (db.payments || []).find((x) => x.id === id);
      if (!p) throw fail(404, "\u092D\u0941\u0917\u0924\u093E\u0928 \u0928\u0939\u0940\u0902 \u092E\u093F\u0932\u093E\u0964");
      if (p.status !== "pending") throw fail(409, "\u0907\u0938 \u092D\u0941\u0917\u0924\u093E\u0928 \u0915\u0940 \u0938\u092E\u0940\u0915\u094D\u0937\u093E \u092A\u0939\u0932\u0947 \u0939\u094B \u091A\u0941\u0915\u0940 \u0939\u0948\u0964");
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
export {
  buildLink,
  payments as default
};
