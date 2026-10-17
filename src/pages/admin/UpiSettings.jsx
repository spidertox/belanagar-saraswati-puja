import { useEffect, useMemo, useState } from 'react';
import { Save, Download, Copy, QrCode } from 'lucide-react';
import { getSettings, saveSettings } from '../../lib/api.js';
import { mergeDonation } from '../../hooks/useDonationSettings.js';
import { buildUpiLink, isValidUpiId, parseAmount } from '../../lib/upi.js';
import ArtisticQR, { downloadQrPng } from '../../components/ArtisticQR.jsx';
import { LoadingSpinner } from '../../components/StatusStates.jsx';
import { useToast } from '../../components/Toast.jsx';

const inputCls = 'mt-1 w-full rounded-xl border border-navy-900/15 bg-white px-4 py-2.5 text-sm focus:border-gold-500';
const labelCls = 'text-sm font-medium text-navy-700';

function Field({ id, label, hint, error, children }) {
  return (
    <div>
      <label htmlFor={id} className={labelCls}>{label}</label>
      {children}
      {hint && !error ? <p className="mt-1 text-xs text-navy-500">{hint}</p> : null}
      {error ? <p role="alert" className="mt-1 text-xs text-maroon-500">{error}</p> : null}
    </div>
  );
}

export default function UpiSettings() {
  const showToast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({ enabled: true, upiId: '', payeeName: '', note: '', amountsText: '', maxAmount: '100000' });
  // custom QR generator (not saved; just for printing / sharing)
  const [qr, setQr] = useState({ amount: '', note: '', payee: '' });

  useEffect(() => {
    let alive = true;
    getSettings()
      .then((d) => {
        if (!alive) return;
        const c = mergeDonation(d.donation);
        setForm({ enabled: c.enabled, upiId: c.upiId, payeeName: c.payeeName, note: c.note, amountsText: c.amounts.join(', '), maxAmount: String(c.maxAmount) });
      })
      .catch((e) => showToast(e.message, { type: 'error' }))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  async function onSave(e) {
    e.preventDefault();
    const amounts = form.amountsText.split(/[,\s]+/).filter(Boolean).map(Number);
    const local = {};
    if (form.upiId.trim() && !isValidUpiId(form.upiId)) local.upiId = 'UPI ID सही नहीं है (जैसे name@bank)।';
    if (amounts.some((a) => !Number.isInteger(a) || a < 1)) local.amounts = 'राशियाँ केवल संख्या में, कॉमा से अलग करके लिखें (जैसे 101, 251, 501)।';
    if (Object.keys(local).length) return setErrors(local);
    setErrors({});
    setSaving(true);
    try {
      await saveSettings({
        enabled: form.enabled,
        upiId: form.upiId.trim(),
        payeeName: form.payeeName.trim(),
        note: form.note.trim(),
        amounts,
        maxAmount: Number(form.maxAmount),
      });
      showToast('UPI सेटिंग सेव हो गई');
    } catch (err) {
      setErrors(err.errors || {});
      showToast(err.message, { type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  const upiOk = isValidUpiId(form.upiId);
  const amount = qr.amount === '' ? null : parseAmount(qr.amount, Number(form.maxAmount) || 100000);
  const amountBad = qr.amount !== '' && amount === null;
  const link = useMemo(
    () => (upiOk && !amountBad ? buildUpiLink({ upiId: form.upiId, name: qr.payee.trim() || form.payeeName, amount, note: qr.note.trim() || form.note }) : ''),
    [upiOk, amountBad, form.upiId, form.payeeName, form.note, qr.payee, qr.note, amount]
  );

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      showToast('UPI लिंक कॉपी हो गया');
    } catch {
      showToast('कॉपी नहीं हो सका।', { type: 'error' });
    }
  }
  async function download() {
    try {
      await downloadQrPng(link, { label: 'UPI भुगतान QR', fileName: `payment-qr${amount ? `-${amount}` : ''}.png` });
    } catch {
      showToast('QR डाउनलोड नहीं हो सका।', { type: 'error' });
    }
  }

  if (loading) return <LoadingSpinner label="सेटिंग लोड हो रही है..." />;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form onSubmit={onSave} noValidate className="space-y-4 rounded-2xl bg-white p-5 shadow-card">
        <h2 className="devanagari text-xl text-maroon-700">दान (UPI) सेटिंग</h2>
        <p className="devanagari-body text-xs text-navy-500">
          यहाँ डाली गई UPI ID वेबसाइट के &ldquo;ऑनलाइन दान&rdquo; QR में तुरंत दिखने लगती है। पैसा सीधे इसी UPI ID से जुड़े बैंक खाते में जाता है। सेव करने से पहले ID दोबारा जांच लें।
        </p>
        <label className="flex items-center gap-2 text-sm text-navy-700">
          <input type="checkbox" checked={form.enabled} onChange={set('enabled')} className="h-4 w-4" />
          वेबसाइट पर ऑनलाइन दान दिखाएं
        </label>
        <Field id="upi-id" label="UPI ID" hint="जैसे samiti@oksbi" error={errors.upiId}>
          <input id="upi-id" value={form.upiId} onChange={set('upiId')} autoComplete="off" spellCheck="false" className={inputCls} placeholder="name@bank" />
        </Field>
        <Field id="upi-name" label="खाताधारक / समिति का नाम" hint="भुगतान के समय donor को यही नाम दिखेगा" error={errors.payeeName}>
          <input id="upi-name" value={form.payeeName} onChange={set('payeeName')} maxLength={60} className={inputCls} />
        </Field>
        <Field id="upi-note" label="भुगतान नोट" error={errors.note}>
          <input id="upi-note" value={form.note} onChange={set('note')} maxLength={60} className={inputCls} />
        </Field>
        <Field id="upi-amts" label="त्वरित राशियाँ (₹)" hint="कॉमा से अलग करें, अधिकतम 8" error={errors.amounts}>
          <input id="upi-amts" value={form.amountsText} onChange={set('amountsText')} inputMode="numeric" className={inputCls} />
        </Field>
        <Field id="upi-max" label="अधिकतम राशि (₹)" error={errors.maxAmount}>
          <input id="upi-max" value={form.maxAmount} onChange={set('maxAmount')} inputMode="numeric" className={inputCls} />
        </Field>
        <button type="submit" disabled={saving} className="btn-primary gap-2 disabled:opacity-60">
          <Save className="h-4 w-4" aria-hidden="true" /> {saving ? 'सेव हो रहा है...' : 'सेव करें'}
        </button>
      </form>

      <section className="space-y-4 rounded-2xl bg-white p-5 shadow-card" aria-labelledby="qr-gen">
        <h2 id="qr-gen" className="devanagari flex items-center gap-2 text-xl text-maroon-700">
          <QrCode className="h-5 w-5" aria-hidden="true" /> अपना पेमेंट QR बनाएं
        </h2>
        <p className="devanagari-body text-xs text-navy-500">राशि और नोट भरकर कस्टम QR बनाएं (जैसे किसी विशेष दान या पूजा सामग्री के लिए)। यह सेव नहीं होता, सिर्फ डाउनलोड/शेयर के लिए है।</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field id="qr-amt" label="राशि (₹) — खाली = कोई भी" error={amountBad ? 'सही राशि लिखें' : ''}>
            <input id="qr-amt" value={qr.amount} onChange={(e) => setQr((q) => ({ ...q, amount: e.target.value.replace(/\D/g, '').slice(0, 7) }))} inputMode="numeric" className={inputCls} placeholder="जैसे 501" />
          </Field>
          <Field id="qr-note" label="नोट">
            <input id="qr-note" value={qr.note} onChange={(e) => setQr((q) => ({ ...q, note: e.target.value }))} maxLength={60} className={inputCls} placeholder={form.note} />
          </Field>
        </div>
        <Field id="qr-payee" label="नाम (वैकल्पिक)">
          <input id="qr-payee" value={qr.payee} onChange={(e) => setQr((q) => ({ ...q, payee: e.target.value }))} maxLength={60} className={inputCls} placeholder={form.payeeName} />
        </Field>

        {link ? (
          <div className="flex flex-col items-center gap-3">
            <ArtisticQR value={link} label="कस्टम UPI पेमेंट QR" className="w-64" />
            <div className="flex flex-wrap justify-center gap-2">
              <button type="button" onClick={download} className="btn-primary gap-2 !px-4 !py-2"><Download className="h-4 w-4" aria-hidden="true" /> PNG डाउनलोड</button>
              <button type="button" onClick={copyLink} className="btn-outline gap-2 !px-4 !py-2"><Copy className="h-4 w-4" aria-hidden="true" /> लिंक कॉपी</button>
            </div>
          </div>
        ) : (
          <p className="devanagari-body rounded-xl bg-gold-50 p-4 text-center text-sm text-navy-700">
            QR देखने के लिए बाईं ओर सही UPI ID भरें।
          </p>
        )}
      </section>
    </div>
  );
}
