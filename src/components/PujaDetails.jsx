import { festivalConfig } from '../config/festivalConfig.js';
import { LotusIcon } from './Decor.jsx';

// Date / tithi / muhurat card. Everything shown comes from
// `festivalConfig.pujaDetails`, so next year only the config changes.
export default function PujaDetails({ className = '' }) {
  const details = festivalConfig.pujaDetails;
  if (!details || !details.rows || details.rows.length === 0) return null;

  return (
    <section
      aria-labelledby="puja-details-title"
      className={`relative overflow-hidden rounded-2xl border border-gold-300/60 bg-white shadow-card ${className}`}
    >
      <div className="h-1.5 bg-gradient-to-r from-gold-300 via-gold-500 to-gold-300" aria-hidden="true" />
      <div className="p-5 sm:p-7">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold-50 to-gold-100 text-gold-600">
            <LotusIcon className="h-6 w-6" />
          </span>
          <h2 id="puja-details-title" className="devanagari text-xl text-maroon-700 sm:text-2xl">
            {details.title}
          </h2>
        </div>

        <dl className="mt-4 divide-y divide-navy-900/5">
          {details.rows.map((row) => (
            <div
              key={row.label}
              className={`grid gap-0.5 py-3 sm:grid-cols-[13rem_1fr] sm:gap-4 ${
                row.highlight ? '-mx-3 rounded-xl bg-gold-50 px-3' : ''
              }`}
            >
              <dt className="devanagari-body text-sm text-navy-500">{row.label}</dt>
              <dd
                className={`devanagari-body text-sm sm:text-base ${
                  row.highlight ? 'font-semibold text-maroon-700' : 'font-medium text-navy-700'
                }`}
              >
                {row.value}
                {row.note ? <span className="mt-0.5 block text-xs font-normal text-navy-500">{row.note}</span> : null}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
