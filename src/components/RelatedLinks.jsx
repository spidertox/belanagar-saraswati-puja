import { Link, useLocation } from 'react-router-dom';
import { PAGES } from '../config/seo.js';

// Every public page links to the others, so visitors (and Google's crawler)
// can reach the whole site from anywhere. Rendered once, by PublicLayout.
const LINKS = [
  { to: '/', label: 'होम', hint: 'पूजा की तारीख और मुख्य जानकारी' },
  { to: '/events', label: 'पूजा कार्यक्रम', hint: 'मुहूर्त, आरती और कार्यक्रम' },
  { to: '/donations', label: 'दान विवरण', hint: 'हर दान का सार्वजनिक हिसाब' },
  { to: '/expenses', label: 'खर्च का विवरण', hint: 'हर खर्च की जानकारी' },
  { to: '/gallery', label: 'फोटो गैलरी', hint: 'पूजा के यादगार पल' },
  { to: '/faq', label: 'अक्सर पूछे सवाल', hint: 'FAQ - आपके सवालों के जवाब' },
  { to: '/contact', label: 'संपर्क करें', hint: 'संदेश भेजें, WhatsApp से जुड़ें' },
  { to: '/about', label: 'हमारे बारे में', hint: 'समिति और पूजा का उद्देश्य' },
];

export default function RelatedLinks() {
  const { pathname } = useLocation();
  const clean = pathname.replace(/\/+$/, '') || '/';
  // not on home, the thank-you page, or the 404 page
  if (clean === '/' || clean === '/thank-you' || !PAGES[clean]) return null;

  const items = LINKS.filter((l) => l.to !== clean).slice(0, 4);
  return (
    <nav aria-label="और पेज देखें" className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
      <p className="devanagari mb-4 text-center text-xl text-maroon-700">और भी देखें</p>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((l) => (
          <li key={l.to}>
            <Link
              to={l.to}
              className="block h-full rounded-2xl border border-gold-300/40 bg-white p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-lift"
            >
              <span className="devanagari text-lg text-maroon-700">{l.label}</span>
              <span className="devanagari-body mt-1 block text-xs text-navy-500">{l.hint}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
