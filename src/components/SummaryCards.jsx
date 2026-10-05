// Generic stat-card row shared by the public Donations/Expenses pages and
// the admin dashboard, so all three read as one consistent "financial
// summary" component rather than three bespoke ones.
//
// Each item: { label, value, tone?: 'accent', icon?: <a lucide icon component> }
//
// NOTE: Tailwind only picks up class names that appear literally in the
// source, so the responsive column count is chosen from this fixed map
// rather than built with a template string.
const COLS = {
  1: 'sm:grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-4',
  5: 'sm:grid-cols-5',
};

export default function SummaryCards({ items }) {
  const colsClass = COLS[items.length] || 'sm:grid-cols-3';

  return (
    <div className={`grid grid-cols-2 gap-3 sm:gap-4 ${colsClass}`}>
      {items.map((it) => {
        const accent = it.tone === 'accent';
        return (
          <div
            key={it.label}
            className={`relative overflow-hidden rounded-2xl p-4 shadow-card sm:p-5 ${
              accent
                ? 'col-span-2 bg-gradient-to-br from-maroon-600 to-maroon-900 sm:col-span-1'
                : 'border border-gold-300/40 bg-white'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <p className={`devanagari-body text-sm ${accent ? 'text-ivory-100/80' : 'text-navy-500'}`}>{it.label}</p>
              {it.icon ? (
                <span
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl sm:h-9 sm:w-9 ${
                    accent ? 'bg-ivory-50/10 text-basanti-300' : 'bg-gold-50 text-gold-600'
                  }`}
                >
                  <it.icon className="h-5 w-5" aria-hidden="true" />
                </span>
              ) : null}
            </div>
            <p
              className={`mt-2 font-display text-2xl font-medium tabular-nums sm:text-3xl ${
                accent ? 'text-basanti-300' : 'text-maroon-700'
              }`}
            >
              {it.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
