import { Link } from 'react-router-dom';
import { Home, CalendarDays, Wallet, MessageCircle } from 'lucide-react';
import { LotusIcon, Divider } from '../components/Decor.jsx';

const SUGGESTIONS = [
  { to: '/events', label: 'पूजा कार्यक्रम', Icon: CalendarDays },
  { to: '/donations', label: 'दान विवरण', Icon: Wallet },
  { to: '/contact', label: 'संपर्क करें', Icon: MessageCircle },
];

export default function NotFound() {
  return (
    <div className="relative mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
      <LotusIcon className="h-14 w-14 text-gold-400" />
      <p className="mt-4 font-display text-8xl font-medium leading-none text-maroon-700/90 sm:text-9xl" aria-hidden="true">
        404
      </p>
      <h1 className="devanagari mt-4 text-balance text-3xl text-maroon-700 sm:text-4xl">
        माँ सरस्वती का यह पन्ना नहीं मिला
      </h1>
      <p className="devanagari-body mt-3 max-w-md text-sm text-navy-600 sm:text-base">
        जिस पृष्ठ को आप खोज रहे हैं वह हट चुका है, या लिंक में कोई गलती है। चिंता न करें, नीचे से सही रास्ता चुनें।
      </p>
      <p className="mt-1 text-sm text-navy-500">Page not found - the link may be broken or the page has moved.</p>

      <Link to="/" className="btn-primary mt-8 gap-2">
        <Home className="h-4 w-4" aria-hidden="true" />
        होम पेज पर वापस जाएं (Back to Home)
      </Link>

      <Divider className="my-8" />

      <p className="text-sm text-navy-500">या यहाँ जाएं:</p>
      <ul className="mt-3 flex flex-wrap justify-center gap-3">
        {SUGGESTIONS.map(({ to, label, Icon }) => (
          <li key={to}>
            <Link to={to} className="btn-outline gap-2 !px-4 !py-2">
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
