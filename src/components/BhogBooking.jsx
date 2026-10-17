import { useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import { festivalConfig } from '../config/festivalConfig.js';
import { createResource } from '../lib/api.js';
import { SectionHeading } from './Decor.jsx';
import { FormSuccess } from './StatusStates.jsx';

const input = 'mt-1 w-full rounded-xl border border-navy-900/15 bg-ivory-50 px-4 py-2.5 text-sm text-navy-900 placeholder:text-navy-400 focus:border-gold-500 focus:outline-none';
const EMPTY = { name: '', phone: '', slot: '', people: '1', note: '', website: '' };

// Prasad / bhog booking REQUEST. Nothing here promises a seat: the committee
// phones back and confirms (status "पक्का" in the admin panel).
export default function BhogBooking() {
  const cfg = festivalConfig.bhog || {};
  const [v, setV] = useState({ ...EMPTY, slot: (cfg.slots || [])[0] || '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [tick, setTick] = useState(0);

  if (!cfg.enabled || !(cfg.slots || []).length) return null;
  const set = (k) => (e) => setV((x) => ({ ...x, [k]: e.target.value }));
  const bad = (k) => (errors[k] ? 'field-error' : '');
  const k = (f) => (errors[f] ? `e${tick}` : 'ok'); // re-key so the shake replays

  async function submit(e) {
    e.preventDefault();
    const next = {};
    if (v.name.trim().length < 2) next.name = 'कृपया अपना नाम लिखें';
    if (!/^[6-9]\d{9}$/.test(v.phone.replace(/\D/g, '').slice(-10))) next.phone = '10 अंकों का सही मोबाइल नंबर लिखें';
    const n = Number(v.people);
    if (!Number.isInteger(n) || n < 1 || n > 50) next.people = '1 से 50 के बीच संख्या लिखें';
    setErrors(next);
    setFormError('');
    if (Object.keys(next).length) return setTick((t) => t + 1);

    setBusy(true);
    try {
      await createResource('bhog', { name: v.name, phone: v.phone, slot: v.slot, people: n, note: v.note, website: v.website });
      setV({ ...EMPTY, slot: cfg.slots[0] });
      setSent(true);
    } catch (err) {
      if (err.errors) setErrors(err.errors);
      setTick((t) => t + 1);
      setFormError(err.message || 'अनुरोध नहीं भेजा जा सका। कृपया दोबारा प्रयास करें।');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="bhog" aria-labelledby="bhog-title" className="mt-14 rounded-3xl border border-gold-300/50 bg-white p-6 shadow-card sm:p-8">
      <SectionHeading hindi="प्रसाद / भोग बुकिंग" english="Request a prasad slot" align="center" />
      <h2 id="bhog-title" className="sr-only">प्रसाद बुकिंग फ़ॉर्म</h2>
      <p className="devanagari-body mx-auto mt-3 max-w-md text-center text-sm text-navy-600">
        यह सिर्फ़ अनुरोध है। समिति आपसे फ़ोन पर संपर्क करके समय पक्का करेगी।
      </p>
      {sent ? (
        <FormSuccess message="धन्यवाद! आपका अनुरोध मिल गया। समिति जल्द आपसे संपर्क करेगी।" onDone={() => setSent(false)} />
      ) : (
        <form onSubmit={submit} noValidate className="mx-auto mt-6 max-w-md space-y-4">
          <div>
            <label htmlFor="bh-name" className="text-sm font-medium text-navy-700">नाम *</label>
            <input id="bh-name" key={k('name')} value={v.name} onChange={set('name')} maxLength={80} autoComplete="name" aria-invalid={Boolean(errors.name)} className={`${input} ${bad('name')}`} />
            {errors.name ? <p role="alert" className="mt-1 text-xs text-maroon-500">{errors.name}</p> : null}
          </div>
          <div>
            <label htmlFor="bh-phone" className="text-sm font-medium text-navy-700">मोबाइल नंबर *</label>
            <input id="bh-phone" key={k('phone')} value={v.phone} onChange={set('phone')} inputMode="tel" maxLength={16} autoComplete="tel" placeholder="98XXXXXXXX" aria-invalid={Boolean(errors.phone)} className={`${input} ${bad('phone')}`} />
            {errors.phone ? <p role="alert" className="mt-1 text-xs text-maroon-500">{errors.phone}</p> : null}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="bh-slot" className="text-sm font-medium text-navy-700">पसंदीदा समय</label>
              <select id="bh-slot" value={v.slot} onChange={set('slot')} className={input}>
                {cfg.slots.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="bh-people" className="text-sm font-medium text-navy-700">कितने लोग</label>
              <input id="bh-people" key={k('people')} type="number" min={1} max={50} value={v.people} onChange={set('people')} aria-invalid={Boolean(errors.people)} className={`${input} ${bad('people')}`} />
              {errors.people ? <p role="alert" className="mt-1 text-xs text-maroon-500">{errors.people}</p> : null}
            </div>
          </div>
          <div>
            <label htmlFor="bh-note" className="text-sm font-medium text-navy-700">टिप्पणी (वैकल्पिक)</label>
            <textarea id="bh-note" rows={2} maxLength={300} value={v.note} onChange={set('note')} className={input} />
          </div>
          <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', height: 0, overflow: 'hidden' }}>
            <label>वेबसाइट (खाली छोड़ें)<input type="text" tabIndex={-1} autoComplete="off" value={v.website} onChange={set('website')} /></label>
          </div>
          {formError ? <p role="alert" className="rounded-xl bg-maroon-500/10 px-4 py-2 text-sm text-maroon-600">{formError}</p> : null}
          <button type="submit" disabled={busy} className="btn-primary w-full justify-center gap-2 disabled:opacity-60">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
            {busy ? 'भेजा जा रहा है...' : 'अनुरोध भेजें'}
          </button>
        </form>
      )}
    </section>
  );
}
