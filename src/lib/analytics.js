// Google Analytics 4, loaded ONLY after the visitor accepts (see
// ConsentBanner.jsx) and ONLY if a Measurement ID is configured:
//
//   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX   (Vercel > Settings > Environment Variables)
//
// Single-page-app note: GA does not see page changes by itself, so
// <Analytics /> in App.jsx calls trackPageView() on every route change.

export const GA_ID = (import.meta.env.VITE_GA_MEASUREMENT_ID || '').trim();
const CONSENT_KEY = 'bsp-analytics-consent'; // 'granted' | 'denied'

let loaded = false;

export function analyticsEnabled() {
  return /^G-[A-Z0-9]+$/i.test(GA_ID);
}

export function getConsent() {
  try {
    return localStorage.getItem(CONSENT_KEY);
  } catch {
    return null;
  }
}

export function setConsent(value) {
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // private mode etc. - the choice just won't be remembered
  }
  if (value === 'granted') loadAnalytics();
}

export function loadAnalytics() {
  if (loaded || !analyticsEnabled() || typeof document === 'undefined') return;
  loaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments); // eslint-disable-line prefer-rest-params
  };
  window.gtag('js', new Date());
  // send_page_view false: we send page views ourselves on every route change.
  window.gtag('config', GA_ID, { anonymize_ip: true, send_page_view: false });
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
  document.head.appendChild(s);
}

export function trackPageView(path, title) {
  if (!loaded || typeof window.gtag !== 'function') return;
  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: window.location.origin + path,
    page_title: title,
  });
}

export function trackEvent(name, params = {}) {
  if (!loaded || typeof window.gtag !== 'function') return;
  window.gtag('event', name, params);
}

// Called once at start-up: if the visitor already accepted earlier, resume.
export function initAnalytics() {
  if (getConsent() === 'granted') loadAnalytics();
}
