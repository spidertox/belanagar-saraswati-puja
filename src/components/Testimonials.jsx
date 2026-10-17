import { Quote } from 'lucide-react';
import { testimonials } from '../config/testimonials.js';
import { SectionHeading, Divider } from './Decor.jsx';

// Shows ONLY real, approved testimonials from src/config/testimonials.js.
// With an empty list the whole section disappears - nothing is invented.
export default function Testimonials() {
  if (!testimonials.length) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <SectionHeading hindi="श्रद्धालुओं के अनुभव" english="What devotees say" align="center" />
      <Divider className="my-6" />
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t) => (
          <figure key={`${t.name}-${t.quote.slice(0, 20)}`} className="rounded-2xl border border-gold-300/40 bg-white p-6 shadow-card">
            <Quote className="h-6 w-6 text-gold-400" aria-hidden="true" />
            <blockquote className="devanagari-body mt-3 text-sm leading-relaxed text-navy-700">{t.quote}</blockquote>
            <figcaption className="mt-4 text-sm">
              <span className="font-semibold text-maroon-700">{t.name}</span>
              {t.detail ? <span className="text-navy-500"> · {t.detail}</span> : null}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
