// Builds a UPI payment link: upi://pay?pa=<id>&pn=<name>&am=<amount>&cu=INR&tn=<note>
// Scanning it (or opening it on a phone) starts the payment in the donor's own
// UPI app. The donor pays directly into the committee's bank account.

const UPI_ID = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z][a-zA-Z0-9.-]{1,63}$/;

export const isValidUpiId = (id) => UPI_ID.test(String(id || '').trim());

// Whole rupees, 1..max. Returns null for anything else (empty, 0, negative, text, decimals).
export function parseAmount(input, max = 100000) {
  const text = String(input ?? '').trim();
  if (!/^\d{1,7}$/.test(text)) return null;
  const n = Number(text);
  return n >= 1 && n <= max ? n : null;
}

export function buildUpiLink({ upiId, name, amount, note }) {
  const pa = String(upiId || '').trim();
  if (!isValidUpiId(pa)) return '';
  const parts = [`pa=${pa}`];
  if (name) parts.push(`pn=${encodeURIComponent(name)}`);
  if (amount) parts.push(`am=${amount}`);
  parts.push('cu=INR');
  if (note) parts.push(`tn=${encodeURIComponent(note)}`);
  return `upi://pay?${parts.join('&')}`;
}
