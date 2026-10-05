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

export function validateDonation(body) {
  const errors = {};
  if (!isNonEmptyString(body.name)) errors.name = 'नाम आवश्यक है';
  if (!isPositiveNumber(body.amount)) errors.amount = 'राशि सही नहीं है (0 से अधिक होनी चाहिए)';
  else if (!isReasonableAmount(body.amount)) errors.amount = 'राशि बहुत अधिक लग रही है, कृपया जांचें';
  if (!isValidDate(body.date)) errors.date = 'तारीख सही नहीं है';
  return errors;
}

export function validateExpense(body) {
  const errors = {};
  if (!isNonEmptyString(body.title)) errors.title = 'विवरण आवश्यक है';
  if (!isNonEmptyString(body.category)) errors.category = 'श्रेणी आवश्यक है';
  if (!isPositiveNumber(body.amount)) errors.amount = 'राशि सही नहीं है (0 से अधिक होनी चाहिए)';
  else if (!isReasonableAmount(body.amount)) errors.amount = 'राशि बहुत अधिक लग रही है, कृपया जांचें';
  if (!isValidDate(body.date)) errors.date = 'तारीख सही नहीं है';
  return errors;
}

export function validateEvent(body) {
  const errors = {};
  if (!isNonEmptyString(body.name)) errors.name = 'कार्यक्रम का नाम आवश्यक है';
  if (!isValidDate(body.date)) errors.date = 'तारीख सही नहीं है';
  if (!isNonEmptyString(body.time)) errors.time = 'समय आवश्यक है';
  return errors;
}

export function validateGallery(body) {
  const errors = {};
  if (!isNonEmptyString(body.imageUrl) || !/^https?:\/\//i.test(body.imageUrl.trim())) {
    errors.imageUrl = 'सही फ़ोटो URL आवश्यक है (http/https से शुरू)';
  }
  if (!isNonEmptyString(body.category)) errors.category = 'श्रेणी आवश्यक है';
  return errors;
}

export function validateAnnouncement(body) {
  const errors = {};
  if (!isNonEmptyString(body.title)) errors.title = 'शीर्षक आवश्यक है';
  if (!isNonEmptyString(body.body)) errors.body = 'विवरण आवश्यक है';
  return errors;
}
