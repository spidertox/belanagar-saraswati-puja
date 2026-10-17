import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube, Send, Loader2 } from 'lucide-react';
import { festivalConfig } from '../config/festivalConfig.js';
import { PageHeader } from '../components/Decor.jsx';
import WhatsAppGroupCard from '../components/WhatsAppGroupCard.jsx';
import Turnstile, { TURNSTILE_SITE_KEY } from '../components/Turnstile.jsx';
import { FormSuccess } from '../components/StatusStates.jsx';
import { createResource } from '../lib/api.js';

const inputClass =
  'mt-1 w-full rounded-xl border border-navy-900/15 bg-ivory-50 px-4 py-2.5 text-sm text-navy-900 placeholder:text-navy-400 focus:border-gold-500 focus:outline-none';

function ContactForm() {
  const [values, setValues] = useState({ name: '', contactInfo: '', message: '', website: '' });
  const [token, setToken] = useState('');
  const [resetKey, setResetKey] = useState(0);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [tick, setTick] = useState(0); // bumps on every failed submit so the shake replays

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));
  // In production the form is only offered once spam protection is configured.
  const protectionReady = true; // Turnstile is optional; the honeypot and server limits always apply

  async function onSubmit(e) {
    e.preventDefault();
    const next = {};
    if (values.name.trim().length < 2) next.name = 'कृपया अपना नाम लिखें';
    if (values.message.trim().length < 10) next.message = 'संदेश कम से कम 10 अक्षर का होना चाहिए';
    if (TURNSTILE_SITE_KEY && !token) next.captcha = 'कृपया "मैं इंसान हूँ" वाली जाँच पूरी करें';
    setErrors(next);
    setFormError('');
    if (Object.keys(next).length) {
      setTick((t) => t + 1);
      return;
    }

    setSending(true);
    try {
      await createResource('contact', {
        name: values.name.trim(),
        contactInfo: values.contactInfo.trim(),
        message: values.message.trim(),
        website: values.website, // honeypot: real people leave it empty
        token,
      });
      setValues({ name: '', contactInfo: '', message: '', website: '' });
      setToken('');
      setResetKey((k) => k + 1);
      setSent(true);
    } catch (err) {
      setFormError(err.message || 'संदेश नहीं भेजा जा सका। कृपया दोबारा प्रयास करें।');
      setToken('');
      setResetKey((k) => k + 1); // a Turnstile token works only once
    } finally {
      setSending(false);
    }
  }

  if (!protectionReady) {
    return (
      <p className="devanagari-body text-sm text-navy-600">
        संदेश फ़ॉर्म अभी चालू नहीं है। कृपया नीचे दिए WhatsApp ग्रुप से संपर्क करें।
      </p>
    );
  }

  if (sent) return <FormSuccess message="धन्यवाद! आपका संदेश भेज दिया गया है। हम जल्द जवाब देंगे।" onDone={() => setSent(false)} />;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div>
        <label htmlFor="cf-name" className="text-sm font-medium text-navy-700">नाम *</label>
        <input id="cf-name" key={errors.name ? `e${tick}` : 'ok'} type="text" autoComplete="name" maxLength={80} value={values.name} onChange={set('name')}
          className={`${inputClass} ${errors.name ? 'field-error' : ''}`} placeholder="आपका नाम" aria-invalid={Boolean(errors.name)} />
        {errors.name ? <p className="mt-1 text-xs text-maroon-500">{errors.name}</p> : null}
      </div>
      <div>
        <label htmlFor="cf-contact" className="text-sm font-medium text-navy-700">फ़ोन या ईमेल (वैकल्पिक)</label>
        <input id="cf-contact" type="text" autoComplete="email" maxLength={120} value={values.contactInfo}
          onChange={set('contactInfo')} className={inputClass} placeholder="जवाब के लिए" />
      </div>
      <div>
        <label htmlFor="cf-message" className="text-sm font-medium text-navy-700">संदेश *</label>
        <textarea id="cf-message" key={errors.message ? `e${tick}` : 'ok'} rows={5} maxLength={1000} value={values.message} onChange={set('message')}
          className={`${inputClass} ${errors.message ? 'field-error' : ''}`} placeholder="आपका सवाल या सुझाव" aria-invalid={Boolean(errors.message)} />
        {errors.message ? <p className="mt-1 text-xs text-maroon-500">{errors.message}</p> : null}
      </div>

      {/* Honeypot: hidden from people, bots fill it in and get silently dropped. */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', height: 0, overflow: 'hidden' }}>
        <label>
          वेबसाइट (इसे खाली छोड़ें)
          <input type="text" tabIndex={-1} autoComplete="off" value={values.website} onChange={set('website')} />
        </label>
      </div>

      <Turnstile onToken={setToken} resetKey={resetKey} />
      {errors.captcha ? <p className="text-xs text-maroon-500">{errors.captcha}</p> : null}
      {formError ? <p role="alert" className="rounded-xl bg-maroon-500/10 px-4 py-2 text-sm text-maroon-600">{formError}</p> : null}

      <button type="submit" disabled={sending} className="btn-primary gap-2 disabled:opacity-60">
        {sending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
        {sending ? 'भेजा जा रहा है...' : 'संदेश भेजें'}
      </button>
      <p className="text-xs text-navy-500">
        भेजकर आप हमारी{' '}
        <Link to="/privacy-policy" className="underline">गोपनीयता नीति</Link> से सहमत होते हैं।
      </p>
    </form>
  );
}

export default function Contact() {
  const { contact, social, location, address, coordinates } = festivalConfig;
  const hasContact = Boolean(contact.phone || contact.email || address);
  const hasSocial = Boolean(social.facebook || social.instagram || social.youtube);
  const mapSrc = coordinates ? `https://maps.google.com/maps?q=${coordinates.lat},${coordinates.lng}&z=15&output=embed` : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <PageHeader hindi="संपर्क करें" english="Contact" intro="पूजा, दान, भोग-प्रसाद या किसी भी जानकारी के लिए समिति को सीधे संदेश भेजें, या WhatsApp ग्रुप से जुड़ें। हम जल्द से जल्द जवाब देने की कोशिश करते हैं।" />

      <div className="space-y-4 rounded-2xl bg-white p-6 shadow-card">
        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 flex-shrink-0 text-gold-500" aria-hidden="true" />
          <span className="text-sm text-navy-700">{address || location}</span>
        </div>
        {contact.phone ? (
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 flex-shrink-0 text-gold-500" aria-hidden="true" />
            <a href={`tel:${contact.phone}`} className="text-sm text-navy-700 hover:text-maroon-700">
              {contact.phone}
            </a>
          </div>
        ) : null}
        {contact.email ? (
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 flex-shrink-0 text-gold-500" aria-hidden="true" />
            <a href={`mailto:${contact.email}`} className="text-sm text-navy-700 hover:text-maroon-700">
              {contact.email}
            </a>
          </div>
        ) : null}
        {!hasContact ? <p className="text-sm text-navy-500">जल्द ही यहां संपर्क जानकारी उपलब्ध होगी।</p> : null}

        {hasSocial ? (
          <div className="flex gap-4 border-t border-navy-900/5 pt-4">
            {social.facebook ? (
              <a href={social.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="text-navy-500 hover:text-maroon-700">
                <Facebook className="h-5 w-5" />
              </a>
            ) : null}
            {social.instagram ? (
              <a href={social.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="text-navy-500 hover:text-maroon-700">
                <Instagram className="h-5 w-5" />
              </a>
            ) : null}
            {social.youtube ? (
              <a href={social.youtube} target="_blank" rel="noreferrer" aria-label="YouTube" className="text-navy-500 hover:text-maroon-700">
                <Youtube className="h-5 w-5" />
              </a>
            ) : null}
          </div>
        ) : null}
      </div>

      <section className="mt-8 rounded-2xl bg-white p-6 shadow-card" aria-labelledby="contact-form-title">
        <h2 id="contact-form-title" className="devanagari text-2xl text-maroon-700">हमें संदेश भेजें</h2>
        <div className="mt-4">
          <ContactForm />
        </div>
      </section>

      <WhatsAppGroupCard className="mt-8" />

      {mapSrc ? (
        <div className="mt-8 overflow-hidden rounded-2xl shadow-card">
          <iframe
            title="Belanagar location"
            src={mapSrc}
            className="h-72 w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      ) : null}
    </div>
  );
}
