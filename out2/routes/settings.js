import {
  isAuthenticated
} from "../chunk-DR235NYX.js";

// ../../../../../home/claude/site_src/belanagar-saraswati-puja/server/routes/settings.js
import { getFullDatabase, transact, sendChatMessage } from "/home/claude/site_src/belanagar-saraswati-puja/stub-store.mjs";
var UPI_ID = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z][a-zA-Z0-9.-]{1,63}$/;
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
  if (upi && !UPI_ID.test(upi)) errors.upiId = "UPI ID \u0938\u0939\u0940 \u0928\u0939\u0940\u0902 \u0939\u0948 (\u091C\u0948\u0938\u0947 name@bank)\u0964";
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
async function handler(req, res) {
  if (req.method === "GET") {
    return res.status(200).json(publicView(await getFullDatabase()));
  }
  if (req.method === "POST") {
    if (!isAuthenticated(req)) return res.status(401).json({ error: "\u0905\u0928\u0927\u093F\u0915\u0943\u0924\u0964 \u0915\u0943\u092A\u092F\u093E \u0926\u094B\u092C\u093E\u0930\u093E \u0932\u0949\u0917\u093F\u0928 \u0915\u0930\u0947\u0902\u0964" });
    try {
      await sendChatMessage("\u2705 \u091F\u0947\u0938\u094D\u091F \u0938\u0902\u0926\u0947\u0936: \u0935\u0947\u092C\u0938\u093E\u0907\u091F \u0915\u093E Telegram \u0915\u0928\u0947\u0915\u094D\u0936\u0928 \u0920\u0940\u0915 \u0939\u0948\u0964");
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
  const clean = {
    enabled: donation.enabled !== false,
    upiId: String(donation.upiId || "").trim(),
    payeeName: String(donation.payeeName || "").trim(),
    note: String(donation.note || "").trim(),
    amounts: [...new Set(donation.amounts.map(Number))],
    maxAmount: Number(donation.maxAmount)
  };
  const saved = await transact((data) => {
    const old = data.settings && data.settings.donation || null;
    data.settings = { ...data.settings || {}, donation: { ...clean, updatedAt: (/* @__PURE__ */ new Date()).toISOString() } };
    data.auditLog = [
      ...data.auditLog || [],
      {
        id: `AUD-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
        action: "UPDATE",
        recordType: "settings",
        recordId: "donation",
        oldValue: old ? { upiId: old.upiId, payeeName: old.payeeName } : null,
        newValue: { upiId: clean.upiId, payeeName: clean.payeeName },
        at: (/* @__PURE__ */ new Date()).toISOString()
      }
    ].slice(-500);
    return publicView(data);
  });
  return res.status(200).json(saved);
}
export {
  handler as default
};
