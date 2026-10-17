import { Link } from 'react-router-dom';
import { PageHeader } from '../components/Decor.jsx';
import Faq from '../components/Faq.jsx';

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <PageHeader hindi="अक्सर पूछे जाने वाले सवाल" english="Frequently asked questions" />
      <Faq />
      <p className="devanagari-body mt-8 text-center text-sm text-navy-600">
        आपका सवाल यहाँ नहीं है?{' '}
        <Link to="/contact" className="font-medium text-maroon-700 underline underline-offset-2">
          हमें लिखें
        </Link>
      </p>
    </div>
  );
}
