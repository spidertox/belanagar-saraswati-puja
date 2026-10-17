// Server-side validation — the actual enforced rules. The frontend form
// mirrors these for a fast UX, but nothing here trusts that mirror.
function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}
function isValidDate(v) {
  return typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Date.parse(v));
}
function isPositiveNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0;
}
function isReasonableAmount(v) {
  // Guards against fat-fingered/garbage values (spec: "extremely large
  // invalid values") without imposing an unrealistic ceiling on a real
  // community festival's finances.
  return Number(v) < 10000000; // ₹1 crore
}

// Length caps: the whole database is one JSON file in Telegram, so one
// absurdly long value should not be able to bloat it.
function tooLong(errors, body, field, max) {
  if (typeof body[field] === 'string' && body[field].trim().length > max) {
    errors[field] = `अधिकतम ${max} अक्षर की अनुमति है`;
  }
}

export function validateDonation(body) {
  const errors = {};
  if (!isNonEmptyString(body.name)) errors.name = 'नाम आवश्यक है';
  if (!isPositiveNumber(body.amount)) errors.amount = 'राशि सही नहीं है (0 से अधिक होनी चाहिए)';
  else if (!isReasonableAmount(body.amount)) errors.amount = 'राशि बहुत अधिक लग रही है, कृपया जांचें';
  if (!isValidDate(body.date)) errors.date = 'तारीख सही नहीं है';
  tooLong(errors, body, 'name', 120);
  tooLong(errors, body, 'purpose', 200);
  tooLong(errors, body, 'note', 1000);
  return errors;
}

export function validateExpense(body) {
  const errors = {};
  if (!isNonEmptyString(body.title)) errors.title = 'विवरण आवश्यक है';
  if (!isNonEmptyString(body.category)) errors.category = 'श्रेणी आवश्यक है';
  if (!isPositiveNumber(body.amount)) errors.amount = 'राशि सही नहीं है (0 से अधिक होनी चाहिए)';
  else if (!isReasonableAmount(body.amount)) errors.amount = 'राशि बहुत अधिक लग रही है, कृपया जांचें';
  if (!isValidDate(body.date)) errors.date = 'तारीख सही नहीं है';
  tooLong(errors, body, 'title', 200);
  tooLong(errors, body, 'note', 1000);
  return errors;
}

export function validateEvent(body) {
  const errors = {};
  if (!isNonEmptyString(body.name)) errors.name = 'कार्यक्रम का नाम आवश्यक है';
  if (!isValidDate(body.date)) errors.date = 'तारीख सही नहीं है';
  if (!isNonEmptyString(body.time)) errors.time = 'समय आवश्यक है';
  tooLong(errors, body, 'name', 200);
  tooLong(errors, body, 'location', 200);
  tooLong(errors, body, 'description', 2000);
  return errors;
}

export function validateCommittee(body) {
  const errors = {};
  if (!isNonEmptyString(body.name)) errors.name = 'नाम आवश्यक है';
  if (body.order !== undefined && body.order !== '' && body.order !== null) {
    const n = Number(body.order);
    if (!Number.isInteger(n) || n < 1 || n > 999) errors.order = 'क्रम 1 से 999 के बीच पूर्ण संख्या हो';
  }
  tooLong(errors, body, 'name', 120);
  tooLong(errors, body, 'position', 120);
  tooLong(errors, body, 'occupation', 120);
  tooLong(errors, body, 'village', 120);
  return errors;
}

export const BHOG_STATUSES = ['नया', 'पक्का', 'पूरा', 'रद्द'];

// 10-digit Indian mobile number from "98765 43210", "+91 98765-43210", "098765..."
export function normalizePhone(v) {
  const digits = String(v || '').replace(/\D/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
}

export function validateBhog(body) {
  const errors = {};
  if (!isNonEmptyString(body.name) || body.name.trim().length < 2) errors.name = 'नाम आवश्यक है';
  if (!/^[6-9]\d{9}$/.test(normalizePhone(body.phone))) errors.phone = '10 अंकों का सही मोबाइल नंबर लिखें';
  if (!isNonEmptyString(body.slot)) errors.slot = 'समय चुनें';
  const n = Number(body.people);
  if (!Number.isInteger(n) || n < 1 || n > 50) errors.people = 'लोगों की संख्या 1 से 50 के बीच हो';
  if (body.status !== undefined && body.status !== '' && !BHOG_STATUSES.includes(body.status)) errors.status = 'स्थिति सही नहीं है';
  tooLong(errors, body, 'name', 80);
  tooLong(errors, body, 'slot', 60);
  tooLong(errors, body, 'note', 300);
  return errors;
}

export function validateGallery(body) {
  const errors = {};
  if (!isNonEmptyString(body.imageUrl) || !/^https?:\/\//i.test(body.imageUrl.trim())) {
    errors.imageUrl = 'सही फ़ोटो URL आवश्यक है (http/https से शुरू)';
  }
  if (!isNonEmptyString(body.category)) errors.category = 'श्रेणी आवश्यक है';
  tooLong(errors, body, 'imageUrl', 2000);
  tooLong(errors, body, 'caption', 200);
  return errors;
}

export function validateAnnouncement(body) {
  const errors = {};
  if (!isNonEmptyString(body.title)) errors.title = 'शीर्षक आवश्यक है';
  if (!isNonEmptyString(body.body)) errors.body = 'विवरण आवश्यक है';
  tooLong(errors, body, 'title', 200);
  tooLong(errors, body, 'body', 2000);
  return errors;
}
