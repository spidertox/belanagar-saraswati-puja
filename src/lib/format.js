// Shared formatting helpers so every page displays money and dates the
// same way (Indian digit grouping, "13 Sep 2026" style dates).

export function formatCurrency(amount) {
  const n = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatDate(dateInput, overrides = {}) {
  if (!dateInput) return '—';
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return '—';
  // A plain "2026-09-01" is a calendar day, not a moment in time. Format it
  // in UTC so visitors in other time zones never see the previous day.
  const calendarDay = typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput);
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: calendarDay ? 'UTC' : 'Asia/Kolkata',
    ...overrides,
  }).format(d);
}

export function formatDateLong(dateInput) {
  return formatDate(dateInput, { month: 'long' });
}

export function formatDateTime(dateInput) {
  if (!dateInput) return '—';
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  }).format(d);
}
