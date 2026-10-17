import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { PageHeader } from '../components/Decor.jsx';
import { trackEvent } from '../lib/analytics.js';

export default function ThankYou() {
  useEffect(() => {
    // GA4 conversion: a message was successfully sent
    trackEvent('generate_lead', { form: 'contact' });
  }, []);

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
      <PageHeader hindi="धन्यवाद!" english="Thank you" />
      <div className="rounded-2xl border border-gold-300/40 bg-white p-8 shadow-card">
        <CheckCircle2 className="mx-auto h-14 w-14 text-whatsapp-600" aria-hidden="true" />
        <h2 className="devanagari mt-4 text-2xl text-maroon-700">आपका संदेश मिल गया है</h2>
        <p className="devanagari-body mt-3 text-sm leading-relaxed text-navy-700">
          समिति के सदस्य जल्द ही आपके संदेश को देखेंगे। अगर आपने फ़ोन नंबर या ईमेल लिखा है तो हम उसी पर संपर्क करेंगे।
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn-primary">
            होम पेज पर जाएं
          </Link>
          <Link to="/events" className="btn-outline">
            पूजा कार्यक्रम देखें
          </Link>
        </div>
      </div>
    </div>
  );
}
