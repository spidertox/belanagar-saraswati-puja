import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { faqItems } from '../config/faq.js';

// Native <details> keeps it accessible and works with no JavaScript, and the
// answers stay in the page HTML where search engines can read them.
export default function Faq({ items = faqItems, className = '' }) {
  const [openIndex, setOpenIndex] = useState(-1); // accordion: only one answer open
  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item, i) => (
        <details
          key={item.q}
          open={openIndex === i}
          className="group rounded-2xl border border-gold-300/40 bg-white shadow-card transition open:shadow-lift"
        >
          <summary
            onClick={(e) => {
              e.preventDefault();
              setOpenIndex(openIndex === i ? -1 : i);
            }}
            className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-4 [&::-webkit-details-marker]:hidden">
            <span className="devanagari text-lg text-maroon-700">{item.q}</span>
            <ChevronDown
              className="h-5 w-5 flex-shrink-0 text-gold-500 transition-transform group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>
          <p className="devanagari-body px-5 pb-5 text-sm leading-relaxed text-navy-700">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
