// "Last updated: 17 Oct 2026". Defaults to the date of the last build/deploy
// (injected by vite.config.js); pass `date` to show a specific day.
const BUILD = typeof __BUILD_DATE__ !== 'undefined' ? __BUILD_DATE__ : '';

export function formatLastUpdated(input) {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return '';
  return d
    .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })
    .replace(/\./g, '');
}

export default function LastUpdated({ date = BUILD, label = 'अंतिम अपडेट', className = '' }) {
  const text = formatLastUpdated(date);
  if (!text) return null;
  return (
    <p className={className}>
      {label}: <time dateTime={new Date(date).toISOString().slice(0, 10)}>{text}</time>
    </p>
  );
}
