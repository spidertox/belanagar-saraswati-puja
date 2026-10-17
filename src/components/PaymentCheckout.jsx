import { useEffect, useState } from 'react';
import { CheckCircle2, Smartphone, Loader2 } from 'lucide-react';
import { createPayment, getPayment, submitPaymentUtr } from '../lib/api.js';
import ArtisticQR from './ArtisticQR.jsx';
import { useToast } from './Toast.jsx';

const rupee = (n) => `₹${new Intl.NumberFormat('en-IN').format(n)}`;
const inputCls = 'mt-1 w-full rounded-xl border border-navy-900/15 bg-white px-4 py-2.5 text-sm focus:border-gold-500';

const STATUS_TEXT = {
  pending: 'समिति पुष्टि की प्रतीक्षा में',
  confirmed: 'पुष्टि हो गई, दान-सूची में जुड़ गया। धन्यवाद!',
  rejected: 'यह भुगतान समिति को नहीं मिला। कृपया समिति से संपर्क करें।',
};

// Checkout: details -> unique-reference UPI QR -> donor enters UTR -> status.
export default function PaymentCheckout({ amount, maxAmount, onClose }) {
  const showToast = useToast();
  const [step, setStep] = useState('form'); // form | pay | done
  const [form, setForm] = useState({ name: '', phone: '', anonymous: false, website: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [pay, setPay] = useState(null); // { payment, upiLink }
  const [utr, setUtr] = useState('');
  const [status, setStatus] = useState('pending');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  async function start(e) {
    e.preventDefault();
    if (!amount) return setErrors({ amount: `ऊपर से राशि चुनें (₹1 – ${rupee(maxAmount)})` });
    setErrors({});
    setBusy(true);
    try {
      const r = await createPayment({ ...form, amount });
      setPay(r);
      setStep('pay');
    } catch (err) {
      setErrors(err.errors || {});
      showToast(err.message, { type: 'error' });
    } finally {
      setBusy(false);
    }
  }

  async function sendUtr(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await submitPaymentUtr(pay.payment.id, utr);
      setStep('done');
    } catch (err) {
      showToast(err.message, { type: 'error' });
    } finally {
      setBusy(false);
    }
  }

  // while waiting, check the status every 20 s
  useEffect(() => {
    if (step !== 'done' || status !== 'pending') return undefined;
    const t = setInterval(() => {
      getPayment(pay.payment.id).then((r) => setStatus(r.payment.status)).catch(() => {});
    }, 20000);
    return () => clearInterval(t);
  }, [step, status, pay]);

  return (
    <div className="mt-6 rounded-2xl border border-gold-300/60 bg-white p-5">
      {step === 'form' ? (
        <form onSubmit={start} noValidate className="space-y-3">
          <p className="devanagari text-lg text-maroon-700">दान दर्ज करें <span className="text-sm text-navy-500">({amount ? rupee(amount) : 'राशि चुनें'})</span></p>
          {errors.amount ? <p role="alert" className="text-xs text-maroon-500">{errors.amount}</p> : null}
          <div>
            <label htmlFor="pc-name" className="text-sm font-medium text-navy-700">आपका नाम</label>
            <input id="pc-name" value={form.name} onChange={set('name')} maxLength={120} className={inputCls} autoComplete="name" />
            {errors.name ? <p role="alert" className="mt-1 text-xs text-maroon-500">{errors.name}</p> : null}
          </div>
          <div>
            <label htmlFor="pc-phone" className="text-sm font-medium text-navy-700">मोबाइल <span className="text-xs text-navy-500">(वैकल्पिक, केवल समिति देखेगी)</span></label>
            <input id="pc-phone" value={form.phone} onChange={set('phone')} inputMode="tel" maxLength={14} className={inputCls} autoComplete="tel" />
            {errors.phone ? <p role="alert" className="mt-1 text-xs text-maroon-500">{errors.phone}</p> : null}
          </div>
          <label className="flex items-center gap-2 text-sm text-navy-700">
            <input type="checkbox" checked={form.anonymous} onChange={set('anonymous')} className="h-4 w-4" />
            सूची में मेरा नाम Anonymous दिखाएं
          </label>
          {/* honeypot: hidden from people, bots fill it */}
          <input type="text" name="website" value={form.website} onChange={set('website')} tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
          <div className="flex gap-2">
            <button type="submit" disabled={busy} className="btn-primary gap-2 !px-4 !py-2 disabled:opacity-60">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null} भुगतान के लिए आगे बढ़ें
            </button>
            <button type="button" onClick={onClose} className="btn-outline !px-4 !py-2">रद्द करें</button>
          </div>
        </form>
      ) : null}

      {step === 'pay' && pay ? (
        <div className="space-y-4">
          <p className="devanagari text-lg text-maroon-700">{rupee(pay.payment.amount)} का भुगतान करें</p>
          <div className="mx-auto w-60"><ArtisticQR value={pay.upiLink} label={`${rupee(pay.payment.amount)} UPI भुगतान QR`} /></div>
          <a href={pay.upiLink} className="btn-primary gap-2 !px-4 !py-2 md:hidden"><Smartphone className="h-4 w-4" aria-hidden="true" /> UPI ऐप में खोलें</a>
          <p className="devanagari-body text-xs text-navy-600">
            आपका संदर्भ कोड: <b className="font-mono">{pay.payment.id}</b> (भुगतान के नोट में अपने-आप भरा है, इसे बदलें नहीं)।
          </p>
          <form onSubmit={sendUtr} className="space-y-2">
            <label htmlFor="pc-utr" className="text-sm font-medium text-navy-700">भुगतान के बाद UTR / Transaction ID डालें</label>
            <input id="pc-utr" value={utr} onChange={(e) => setUtr(e.target.value.replace(/[^A-Za-z0-9]/g, '').slice(0, 22))} className={inputCls} placeholder="12 अंकों का UTR" autoComplete="off" />
            <button type="submit" disabled={busy || utr.length < 10} className="btn-primary !px-4 !py-2 disabled:opacity-60">जमा करें</button>
          </form>
        </div>
      ) : null}

      {step === 'done' ? (
        <div className="space-y-2 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-green-600" aria-hidden="true" />
          <p className="devanagari text-lg text-maroon-700">धन्यवाद! जानकारी मिल गई</p>
          <p className="devanagari-body text-sm text-navy-700">{STATUS_TEXT[status]}</p>
          <p className="text-xs text-navy-500">संदर्भ कोड: <span className="font-mono">{pay.payment.id}</span></p>
          <button type="button" onClick={onClose} className="btn-outline !px-4 !py-2">बंद करें</button>
        </div>
      ) : null}
    </div>
  );
}
