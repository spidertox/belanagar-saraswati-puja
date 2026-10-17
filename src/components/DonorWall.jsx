import { HeartHandshake } from 'lucide-react';
import { useResourceList } from '../lib/api.js';
import { formatCurrency, formatDate } from '../lib/format.js';
import { SectionHeading } from './Decor.jsx';
import { Skeleton } from './StatusStates.jsx';

// "दानवीरों की दीवार": the 12 latest donors. The API already shows
// "Anonymous" for donors who asked to stay unnamed, so nothing private leaks.
export default function DonorWall() {
  const { items, loading, error } = useResourceList('donations', { page: 1, pageSize: 12 });
  if (error || (!loading && items.length === 0)) return null;

  return (
    <section aria-labelledby="donor-wall-title" className="mt-12">
      <SectionHeading hindi="दानवीरों की दीवार" english="Donor wall - with gratitude" align="center" />
      <h2 id="donor-wall-title" className="sr-only">हाल के दानदाता</h2>
      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 8 }, (_, i) => (
              <li key={i}><Skeleton className="h-24 w-full" /></li>
            ))
          : items.map((d) => (
              <li key={d.id} className="card-lift flex flex-col items-center rounded-2xl border border-gold-300/40 bg-white p-4 text-center shadow-card">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-100 text-maroon-700">
                  {d.name === 'Anonymous' ? <HeartHandshake className="h-5 w-5" aria-hidden="true" /> : <span className="devanagari text-lg">{d.name.trim().charAt(0)}</span>}
                </span>
                <p className="devanagari mt-2 max-w-full truncate text-sm text-maroon-700">{d.name === 'Anonymous' ? 'एक श्रद्धालु' : d.name}</p>
                <p className="text-sm font-semibold text-navy-800">{formatCurrency(d.amount)}</p>
                <p className="text-[11px] text-navy-500">{formatDate(d.date)}</p>
              </li>
            ))}
      </ul>
    </section>
  );
}
