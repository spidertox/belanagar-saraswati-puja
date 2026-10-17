import { getFullDatabase, transact, sendChatMessage } from '../telegramStore.js';
import { isAuthenticated } from '../auth.js';

const UPI_ID = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z][a-zA-Z0-9.-]{1,63}$/;

// Public: only the donation block (UPI ID is meant to be shown to donors).
function publicView(data) {
  const d = (data.settings && data.settings.donation) || {};
  return {
    donation: {
      enabled: d.enabled !== false,
      upiId: d.upiId || '',
      payeeName: d.payeeName || '',
      note: d.note || '',
      amounts: Array.isArray(d.amounts) ? d.amounts : [],
      maxAmount: d.maxAmount || 100000,
    },
  };
}

function validate(body) {
  const errors = {};
  const b = body || {};
  const upi = String(b.upiId || '').trim();
  if (upi && !UPI_ID.test(upi)) errors.upiId = 'UPI ID सही नहीं है (जैसे name@bank)।';
  const name = String(b.payeeName || '').trim();
  if (name.length > 60) errors.payeeName = 'नाम 60 अक्षरों से छोटा रखें।';
  const note = String(b.note || '').trim();
  if (note.length > 60) errors.note = 'नोट 60 अक्षरों से छोटा रखें।';
  const max = Number(b.maxAmount);
  if (!Number.isInteger(max) || max < 1 || max > 1000000) errors.maxAmount = 'अधिकतम राशि 1 से 10,00,000 के बीच हो।';
  const amounts = Array.isArray(b.amounts) ? b.amounts.map(Number) : [];
  if (amounts.length > 8 || amounts.some((a) => !Number.isInteger(a) || a < 1 || a > (Number.isInteger(max) ? max : 1000000))) {
    errors.amounts = 'अधिकतम 8 राशियाँ, हर एक 1 से अधिकतम राशि के बीच पूर्ण संख्या।';
  }
  return errors;
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json(publicView(await getFullDatabase()));
  }
  // Admin-only: send a test message so a broken Telegram setup shows its real reason.
  if (req.method === 'POST') {
    if (!isAuthenticated(req)) return res.status(401).json({ error: 'अनधिकृत। कृपया दोबारा लॉगिन करें।' });
    try {
      await sendChatMessage('✅ टेस्ट संदेश: वेबसाइट का Telegram कनेक्शन ठीक है।');
      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(502).json({ error: `Telegram संदेश नहीं भेजा जा सका: ${err.message}` });
    }
  }
  if (req.method !== 'PUT') {
    res.setHeader('Allow', 'GET, PUT, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  if (!isAuthenticated(req)) return res.status(401).json({ error: 'अनधिकृत। कृपया दोबारा लॉगिन करें।' });

  const donation = (req.body && req.body.donation) || {};
  const errors = validate(donation);
  if (Object.keys(errors).length) return res.status(400).json({ error: 'कृपया जानकारी सुधारें।', errors });

  const clean = {
    enabled: donation.enabled !== false,
    upiId: String(donation.upiId || '').trim(),
    payeeName: String(donation.payeeName || '').trim(),
    note: String(donation.note || '').trim(),
    amounts: [...new Set(donation.amounts.map(Number))],
    maxAmount: Number(donation.maxAmount),
  };
  const saved = await transact((data) => {
    const old = (data.settings && data.settings.donation) || null;
    data.settings = { ...(data.settings || {}), donation: { ...clean, updatedAt: new Date().toISOString() } };
    data.auditLog = [
      ...(data.auditLog || []),
      {
        id: `AUD-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
        action: 'UPDATE',
        recordType: 'settings',
        recordId: 'donation',
        oldValue: old ? { upiId: old.upiId, payeeName: old.payeeName } : null,
        newValue: { upiId: clean.upiId, payeeName: clean.payeeName },
        at: new Date().toISOString(),
      },
    ].slice(-500);
    return publicView(data);
  });
  return res.status(200).json(saved);
}
