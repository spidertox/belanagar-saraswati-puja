import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { analyticsEnabled, getConsent, initAnalytics, setConsent, trackPageView } from '../lib/analytics.js';
import { captureUtm, flushPendingUtm } from '../lib/utm.js';

// Sends a GA4 page_view on every route change and shows the consent bar.
export default function Analytics() {
  const { pathname, search } = useLocation();
  const [choice, setChoice] = useState(() => getConsent());
  const enabled = analyticsEnabled();

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    if (!enabled || pathname.startsWith('/admin')) return;
    // wait a tick so RouteSeo has already updated document.title
    const id = setTimeout(() => trackPageView(pathname + search, document.title), 50);
    return () => clearTimeout(id);
  }, [pathname, search, enabled, choice]);

  // ?utm_* parameters are kept only after the visitor accepted (see lib/utm.js)
  useEffect(() => {
    captureUtm(search, choice);
    if (choice === 'granted') flushPendingUtm();
  }, [search, choice]);

  if (choice || pathname.startsWith('/admin')) return null;

  const decide = (value) => {
    setConsent(value);
    setChoice(value);
  };

  return (
    <div
      role="dialog"
      aria-label="कुकीज़ और गोपनीयता"
      className="no-print fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-2xl rounded-2xl border border-gold-300/60 bg-ivory-50 p-4 shadow-lift sm:p-5"
    >
      <p className="devanagari-body text-sm text-navy-700">
        यह वेबसाइट आपकी पसंद (जैसे डार्क मोड) याद रखने के लिए कुकीज़/लोकल स्टोरेज का उपयोग करती है, और आपकी अनुमति से गुमनाम
        आँकड़े (कितने लोग कौन-से पेज देख रहे हैं, किस लिंक से आए) इकट्ठा करती है। "नहीं" चुनने पर कुछ भी ट्रैक नहीं होगा।{' '}
        <Link to="/privacy-policy" className="font-medium text-maroon-700 underline underline-offset-2">
          गोपनीयता नीति पढ़ें
        </Link>
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => decide('granted')} className="btn-primary !px-5 !py-2">
          स्वीकार करें
        </button>
        <button type="button" onClick={() => decide('denied')} className="btn-outline !px-5 !py-2">
          अस्वीकार करें
        </button>
      </div>
    </div>
  );
}
