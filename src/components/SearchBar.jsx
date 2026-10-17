import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import useDebounce from '../hooks/useDebounce.js';
import { faqItems } from '../config/faq.js';

// Searches the page names and the FAQ questions (the site has no other free
// text worth indexing). The query is debounced by 300 ms.
export default function SearchBar({ links, onClose }) {
  const [q, setQ] = useState('');
  const term = useDebounce(q.trim().toLowerCase(), 300);
  const ref = useRef(null);

  useEffect(() => {
    ref.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const index = useMemo(
    () => [
      ...links.map((l) => ({ label: l.label, to: l.to, kind: 'पेज' })),
      { label: 'FAQ - अक्सर पूछे जाने वाले सवाल', to: '/faq', kind: 'पेज' },
      { label: 'गोपनीयता नीति / Privacy Policy', to: '/privacy-policy', kind: 'पेज' },
      ...faqItems.map((f) => ({ label: f.q, to: '/faq', kind: 'FAQ', text: f.a })),
    ],
    [links]
  );
  const results = term ? index.filter((r) => `${r.label} ${r.text || ''}`.toLowerCase().includes(term)).slice(0, 6) : [];
  const waiting = q.trim().toLowerCase() !== term; // typed but debounce not fired yet

  return (
    <div className="border-t border-gold-300/50 bg-ivory-50">
      <div className="mx-auto max-w-2xl px-4 py-3 sm:px-6">
        <label htmlFor="site-search" className="sr-only">साइट में खोजें</label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-500" aria-hidden="true" />
          <input
            ref={ref}
            id="site-search"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="खोजें: कार्यक्रम, दान, समिति..."
            autoComplete="off"
            className="w-full rounded-full border border-navy-900/15 bg-white py-2 pl-9 pr-4 text-sm text-navy-900 placeholder:text-navy-400 focus:border-gold-500 focus:outline-none"
          />
        </div>
        <div aria-live="polite">
          {term && !waiting ? (
            results.length ? (
              <ul className="mt-2 divide-y divide-navy-900/5 overflow-hidden rounded-2xl border border-navy-900/10 bg-white">
                {results.map((r) => (
                  <li key={r.kind + r.label}>
                    <Link to={r.to} onClick={onClose} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm text-navy-700 transition duration-200 hover:bg-maroon-700/10">
                      <span>{r.label}</span>
                      <span className="flex-shrink-0 text-xs text-navy-500">{r.kind}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 px-2 text-sm text-navy-500">"{q.trim()}" के लिए कुछ नहीं मिला।</p>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}
