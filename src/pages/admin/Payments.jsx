import { useCallback, useEffect, useState } from 'react';
import { Check, X, RefreshCw } from 'lucide-react';
import { listPayments, reviewPayment } from '../../lib/api.js';
import { LoadingSpinner, ErrorState } from '../../components/StatusStates.jsx';
import { useToast } from '../../components/Toast.jsx';
import { ConfirmDialog } from '../../components/Modal.jsx';

const rupee = (n) => `₹${new Intl.NumberFormat('en-IN').format(n)}`;
const TABS = [
  ['pending', 'प्रतीक्षा में'],
  ['confirmed', 'पुष्ट'],
  ['rejected', 'अस्वीकृत'],
  ['', 'सभी'],
];
const BADGE = { pending: 'bg-gold-100 text-gold-700', confirmed: 'bg-green-100 text-green-800', rejected: 'bg-red-100 text-red-700' };
const LABEL = { pending: 'प्रतीक्षा में', confirmed: 'पुष्ट', rejected: 'अस्वीकृत' };

export default function Payments() {
  const showToast = useToast();
  const [tab, setTab] = useState('pending');
  const [data, setData] = useState({ items: [], pending: 0 });
  const [state, setState] = useState({ loading: true, error: '' });
  const [ask, setAsk] = useState(null); // { p, status }
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setState({ loading: true, error: '' });
    listPayments(tab)
      .then((d) => {
        setData(d);
        setState({ loading: false, error: '' });
      })
      .catch((e) => setState({ loading: false, error: e.message }));
  }, [tab]);
  useEffect(load, [load]);

  async function confirm() {
    setBusy(true);
    try {
      await reviewPayment(ask.p.id, ask.status);
      showToast(ask.status === 'confirmed' ? 'दान-सूची में जोड़ दिया गया' : 'अस्वीकृत किया गया');
      setAsk(null);
      load();
    } catch (e) {
      showToast(e.message, { type: 'error' });
      setAsk(null);
      load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-5 shadow-card">
        <h2 className="devanagari text-xl text-maroon-700">ऑनलाइन UPI भुगतान</h2>
        <p className="devanagari-body mt-1 text-xs text-navy-500">
          बैंक स्टेटमेंट / UPI ऐप में देखें कि संदर्भ कोड (BSP-…) या UTR के साथ पैसा आया है, फिर &ldquo;पुष्टि करें&rdquo; दबाएं। पुष्टि होते ही वह दान-सूची में जुड़ जाता है। बिना पैसा आए पुष्टि न करें।
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2" role="tablist">
          {TABS.map(([k, l]) => (
            <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
              className={`rounded-full border px-4 py-1.5 text-sm ${tab === k ? 'border-maroon-700 bg-maroon-700 text-ivory-50' : 'border-gold-300 bg-white text-maroon-700'}`}>
              {l}{k === 'pending' && data.pending ? ` (${data.pending})` : ''}
            </button>
          ))}
          <button type="button" onClick={load} aria-label="रीफ़्रेश" className="ml-auto rounded-full border border-gold-300 p-2 text-maroon-700"><RefreshCw className="h-4 w-4" /></button>
        </div>
      </div>

      {state.loading ? <LoadingSpinner /> : state.error ? <ErrorState message={state.error} onRetry={load} /> : data.items.length === 0 ? (
        <p className="devanagari-body rounded-2xl bg-white p-8 text-center text-sm text-navy-500 shadow-card">कोई भुगतान नहीं।</p>
      ) : (
        <ul className="space-y-3">
          {data.items.map((p) => (
            <li key={p.id} className="rounded-2xl bg-white p-4 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-base font-semibold text-navy-800">{p.name}{p.anonymous ? ' (Anonymous)' : ''} — {rupee(p.amount)}</p>
                <span className={`rounded-full px-3 py-0.5 text-xs ${BADGE[p.status]}`}>{LABEL[p.status]}</span>
              </div>
              <p className="mt-1 break-all text-xs text-navy-600">
                संदर्भ: <span className="font-mono">{p.id}</span> · UTR: <span className="font-mono">{p.utr || 'अभी नहीं दिया'}</span>
                {p.phone ? ` · ${p.phone}` : ''} · {new Date(p.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
              </p>
              {p.status === 'pending' ? (
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={() => setAsk({ p, status: 'confirmed' })} className="btn-primary gap-1 !px-3 !py-1.5 text-sm"><Check className="h-4 w-4" aria-hidden="true" /> पुष्टि करें</button>
                  <button type="button" onClick={() => setAsk({ p, status: 'rejected' })} className="btn-outline gap-1 !px-3 !py-1.5 text-sm"><X className="h-4 w-4" aria-hidden="true" /> अस्वीकार</button>
                </div>
              ) : p.donationId ? <p className="mt-2 text-xs text-green-700">दान रिकॉर्ड: {p.donationId}</p> : null}
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(ask)}
        title={ask && ask.status === 'confirmed' ? 'भुगतान की पुष्टि करें?' : 'भुगतान अस्वीकार करें?'}
        message={ask ? `${ask.p.name} — ${rupee(ask.p.amount)} (${ask.p.id}). ${ask.status === 'confirmed' ? 'यह दान-सूची में जुड़ जाएगा।' : ''}` : ''}
        confirmLabel={ask && ask.status === 'confirmed' ? 'हाँ, पैसा आया है' : 'अस्वीकार करें'}
        loading={busy}
        onConfirm={confirm}
        onClose={() => setAsk(null)}
        danger={ask ? ask.status === 'rejected' : false}
      />
    </div>
  );
}
