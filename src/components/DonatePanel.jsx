import { useMemo, useState } from 'react';
import { Copy, Download, Smartphone, ShieldCheck, Clock } from 'lucide-react';
import { useDonationSettings } from '../hooks/useDonationSettings.js';
import { buildUpiLink, isValidUpiId, parseAmount } from '../lib/upi.js';
import PaymentCheckout from './PaymentCheckout.jsx';
import ArtisticQR, { downloadQrPng } from './ArtisticQR.jsx';
import { SectionHeading } from './Decor.jsx';
import { useToast } from './Toast.jsx';

const rupee = (n) => `₹${new Intl.NumberFormat('en-IN').format(n)}`;

// "ऑनलाइन दान करें": amount chips + a Saraswati-themed UPI QR. Nothing is
// invented: with no UPI ID in festivalConfig it shows a "coming soon" card.
export default function DonatePanel() {
  const { cfg } = useDonationSettings();
  const showToast = useToast();
  const [chip, setChip] = useState(null); // a number from cfg.amounts, or 'custom', or null (any amount)
  const [custom, setCustom] = useState('');
  const [checkout, setCheckout] = useState(false);

  const ready = cfg.enabled && isValidUpiId(cfg.upiId);
  const amount = chip === 'custom' ? parseAmount(custom, cfg.maxAmount) : typeof chip === 'number' ? chip : null;
  const customInvalid = chip === 'custom' && custom !== '' && amount === null;

  const link = useMemo(
    () => (ready ? buildUpiLink({ upiId: cfg.upiId, name: cfg.payeeName, amount, note: cfg.note }) : ''),
    [ready, cfg.upiId, cfg.payeeName, cfg.note, amount]
  );

  async function copyId() {
    try {
      await navigator.clipboard.writeText(cfg.upiId);
      showToast('UPI ID कॉपी हो गई');
    } catch {
      showToast('कॉपी नहीं हो सका। कृपया UPI ID हाथ से लिख लें।', { type: 'error' });
    }
  }

  async function saveQr() {
    try {
      await downloadQrPng(link, { label: 'दान के लिए UPI QR', fileName: 'belanagar-puja-donation-qr.png' });
    } catch {
      showToast('QR डाउनलोड नहीं हो सका।', { type: 'error' });
    }
  }

  if (!ready) {
    return (
      <section id="donate" aria-labelledby="donate-title" className="mb-10 rounded-3xl border border-gold-300/50 bg-white p-6 text-center shadow-card sm:p-8">
        <Clock className="mx-auto h-8 w-8 text-gold-500" aria-hidden="true" />
        <h2 id="donate-title" className="devanagari mt-3 text-2xl text-maroon-700">ऑनलाइन दान (UPI) जल्द शुरू होगा</h2>
        <p className="devanagari-body mx-auto mt-2 max-w-md text-sm text-navy-600">
          समिति के बैंक खाते की UPI जानकारी जोड़ते ही यहाँ QR कोड दिखने लगेगा। तब तक दान के लिए समिति के सदस्यों या WhatsApp ग्रुप से संपर्क करें।
        </p>
      </section>
    );
  }

  return (
    <section id="donate" aria-labelledby="donate-title" className="mb-10 overflow-hidden rounded-3xl border border-gold-300/50 bg-gradient-to-br from-white via-ivory-50 to-gold-50 p-6 shadow-card sm:p-8">
      <SectionHeading hindi="ऑनलाइन दान करें" english="Donate by UPI" align="center" />
      <div className="mt-8 flex flex-col items-center gap-8 md:flex-row md:items-start md:justify-center">
        <div className="w-60 flex-shrink-0 sm:w-72">
          <ArtisticQR
            value={link}
            label={amount ? `${rupee(amount)} दान के लिए UPI QR कोड` : 'दान के लिए UPI QR कोड'}
            className="w-full drop-shadow-sm"
          />
          <p className="mt-2 text-center text-xs text-navy-500">किसी भी UPI ऐप (PhonePe, Google Pay, Paytm, BHIM) से स्कैन करें</p>
        </div>

        <div className="w-full max-w-sm">
          <p className="devanagari text-lg text-maroon-700">राशि चुनें <span className="devanagari-body text-xs text-navy-500">(वैकल्पिक)</span></p>
          <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="दान की राशि">
            {cfg.amounts.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setChip(chip === a ? null : a)}
                aria-pressed={chip === a}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  chip === a ? 'border-maroon-700 bg-maroon-700 text-ivory-50' : 'border-gold-300 bg-white text-maroon-700 hover:bg-gold-50'
                }`}
              >
                {rupee(a)}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setChip(chip === 'custom' ? null : 'custom')}
              aria-pressed={chip === 'custom'}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                chip === 'custom' ? 'border-maroon-700 bg-maroon-700 text-ivory-50' : 'border-gold-300 bg-white text-maroon-700 hover:bg-gold-50'
              }`}
            >
              अपनी राशि
            </button>
          </div>

          {chip === 'custom' ? (
            <div className="mt-3">
              <label htmlFor="donate-amount" className="text-sm font-medium text-navy-700">राशि (₹)</label>
              <input
                id="donate-amount"
                inputMode="numeric"
                autoComplete="off"
                value={custom}
                onChange={(e) => setCustom(e.target.value.replace(/[^\d]/g, '').slice(0, 7))}
                aria-invalid={customInvalid}
                className="mt-1 w-full rounded-xl border border-navy-900/15 bg-white px-4 py-2.5 text-sm focus:border-gold-500"
                placeholder="जैसे 351"
              />
              {customInvalid ? (
                <p className="mt-1 text-xs text-maroon-500">कृपया {rupee(1)} से {rupee(cfg.maxAmount)} के बीच की राशि लिखें।</p>
              ) : null}
            </div>
          ) : null}

          <p className="devanagari-body mt-4 text-sm text-navy-700">
            {amount ? `QR में ${rupee(amount)} पहले से भरी है।` : 'राशि नहीं चुनी: भुगतान के समय अपनी ऐप में राशि लिखें।'}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {/* tapping this on a phone opens the UPI app directly */}
            <a href={link} className="btn-primary gap-2 !px-4 !py-2 md:hidden">
              <Smartphone className="h-4 w-4" aria-hidden="true" /> UPI ऐप में खोलें
            </a>
            <button type="button" onClick={copyId} className="btn-outline gap-2 !px-4 !py-2">
              <Copy className="h-4 w-4" aria-hidden="true" /> UPI ID कॉपी करें
            </button>
            <button type="button" onClick={saveQr} className="btn-outline gap-2 !px-4 !py-2">
              <Download className="h-4 w-4" aria-hidden="true" /> QR डाउनलोड
            </button>
          </div>
          <button type="button" onClick={() => setCheckout(true)} className="btn-primary mt-4 w-full justify-center !py-2.5">
            नाम के साथ दान दर्ज करें (दान-सूची में जुड़ेगा)
          </button>
          {checkout ? <PaymentCheckout amount={amount} maxAmount={cfg.maxAmount} onClose={() => setCheckout(false)} /> : null}
          <p className="mt-3 break-all text-xs text-navy-500">UPI ID: <span className="font-medium text-navy-700">{cfg.upiId}</span></p>

          <div className="mt-5 flex gap-2 rounded-2xl bg-gold-50 p-3 text-xs text-navy-700">
            <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-gold-600" aria-hidden="true" />
            <p className="devanagari-body">
              भुगतान सीधे समिति के बैंक खाते में जाता है; यह वेबसाइट आपकी कोई भुगतान जानकारी नहीं लेती। भुगतान के बाद अपना नाम और राशि
              समिति को बताएं ताकि उसे दान-सूची में जोड़ा जा सके।
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
