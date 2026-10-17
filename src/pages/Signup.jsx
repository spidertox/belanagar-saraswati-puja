import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Loader2, MailCheck } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import AuthShell, { Stagger } from '../components/auth/AuthShell.jsx';
import OtpInput from '../components/auth/OtpInput.jsx';
import SocialButtons from '../components/auth/SocialButtons.jsx';
import SuccessBurst from '../components/auth/SuccessBurst.jsx';
import Turnstile from '../components/Turnstile.jsx';
import { userRegister, userResend, userVerify } from '../lib/api.js';
import { useUser } from '../hooks/useUser.jsx';
import PasswordInput from '../components/PasswordInput.jsx';
import { useToast } from '../components/Toast.jsx';

const inputClass =
  'mt-1 w-full rounded-xl border border-navy-900/15 bg-ivory-50 px-4 py-2.5 text-sm text-navy-900 placeholder:text-navy-400 outline-none transition focus:border-gold-500 focus:shadow-[0_0_0_4px_rgba(220,174,73,0.25)]';

export default function Signup() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const showToast = useToast();
  const [step, setStep] = useState('form'); // form | code | done
  const [shakeKey, setShakeKey] = useState(0);
  const [values, setValues] = useState({ name: '', email: '', password: '', website: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [token, setToken] = useState('');
  const [resetKey, setResetKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState('');
  const [wait, setWait] = useState(0);

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));
  const protectionReady = true; // Turnstile is optional; the honeypot and server limits always apply

  useEffect(() => {
    if (wait <= 0) return undefined;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const pw = values.password;
  const strength = Math.min(4, (pw.length >= 8) + (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) + /\d/.test(pw) + (/[^A-Za-z0-9]/.test(pw) || pw.length >= 12));
  const strengthColor = ['bg-navy-900/10', 'bg-maroon-500', 'bg-saffron-500', 'bg-gold-500', 'bg-green-600'][strength];

  if (user && step !== 'done') return <Navigate to="/account" replace />;

  async function submit(e) {
    e.preventDefault();
    setErrors({});
    setFormError('');
    setBusy(true);
    try {
      const r = await userRegister({ ...values, token });
      setValues((v) => ({ ...v, email: r.email || v.email.trim().toLowerCase() }));
      setStep('code');
      setWait(60);
    } catch (err) {
      setErrors(err.errors || {});
      setFormError(err.errors ? '' : err.message);
      setToken('');
      setResetKey((k) => k + 1);
    } finally {
      setBusy(false);
    }
  }

  async function confirm(e) {
    e.preventDefault();
    setBusy(true);
    setFormError('');
    try {
      const r = await userVerify(values.email, code);
      setUser(r.user);
      setStep('done');
      setTimeout(() => navigate('/account'), 1800);
    } catch (err) {
      setFormError(err.message);
      setShakeKey((k) => k + 1);
      setCode('');
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    try {
      await userResend(values.email);
      setWait(60);
      showToast('नया कोड भेज दिया गया');
    } catch (err) {
      setFormError(err.message);
    }
  }

  const slide = { initial: { opacity: 0, x: 40 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -40 }, transition: { duration: 0.3 } };

  return (
    <AuthShell title="बेलानगर सरस्वती पूजा समिति" subtitle="माँ सरस्वती की कृपा, हम सबके साथ">
      <AnimatePresence mode="wait" initial={false}>
        {!protectionReady ? (
          <motion.p key="off" {...slide} className="devanagari-body text-sm text-navy-600">साइन-अप अभी चालू नहीं है। कृपया बाद में प्रयास करें।</motion.p>
        ) : step === 'form' ? (
          <motion.form key="form" {...slide} onSubmit={submit} noValidate>
            <Stagger className="space-y-4">
              <div>
                <h1 className="devanagari text-3xl text-maroon-700">खाता बनाएं</h1>
                <p className="mt-1 text-sm text-navy-500">असली ईमेल से, temp mail मान्य नहीं</p>
              </div>
              <SocialButtons verb="साइन-अप करें" />
              <div>
                <label htmlFor="su-name" className="text-sm font-medium text-navy-700">नाम *</label>
                <input id="su-name" value={values.name} onChange={set('name')} maxLength={60} autoComplete="name" aria-invalid={Boolean(errors.name)} className={`${inputClass} ${errors.name ? 'field-error' : ''}`} />
                {errors.name ? <p role="alert" className="mt-1 text-xs text-maroon-500">{errors.name}</p> : null}
              </div>
              <div>
                <label htmlFor="su-email" className="text-sm font-medium text-navy-700">असली ईमेल *</label>
                <input id="su-email" type="email" value={values.email} onChange={set('email')} maxLength={254} autoComplete="email" aria-invalid={Boolean(errors.email)} className={`${inputClass} ${errors.email ? 'field-error' : ''}`} placeholder="name@gmail.com" />
                {errors.email ? <p role="alert" className="mt-1 text-xs text-maroon-500">{errors.email}</p> : <p className="mt-1 text-xs text-navy-500">इसी पर 6 अंकों का कोड आएगा।</p>}
              </div>
              <div>
                <label htmlFor="su-pw" className="text-sm font-medium text-navy-700">पासवर्ड *</label>
                <PasswordInput id="su-pw" value={values.password} onChange={set('password')} maxLength={72} autoComplete="new-password" aria-invalid={Boolean(errors.password)} className={`${inputClass} ${errors.password ? 'field-error' : ''}`} />
                <div className="mt-2 flex gap-1" aria-hidden="true">
                  {[1, 2, 3, 4].map((n) => (
                    <motion.span key={n} className={`h-1.5 flex-1 rounded-full ${n <= strength ? strengthColor : 'bg-navy-900/10'}`} animate={{ scaleY: n <= strength ? 1 : 0.7 }} transition={{ type: 'spring', stiffness: 300, damping: 18 }} />
                  ))}
                </div>
                {errors.password ? <p role="alert" className="mt-1 text-xs text-maroon-500">{errors.password}</p> : <p className="mt-1 text-xs text-navy-500">कम से कम 8 अक्षर</p>}
              </div>
              <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', height: 0, overflow: 'hidden' }}>
                <label>वेबसाइट (खाली छोड़ें)<input type="text" tabIndex={-1} autoComplete="off" value={values.website} onChange={set('website')} /></label>
              </div>
              <Turnstile onToken={setToken} resetKey={resetKey} />
              {formError ? <p role="alert" className="rounded-xl bg-maroon-500/10 px-4 py-2 text-sm text-maroon-600">{formError}</p> : null}
              <button type="submit" disabled={busy} className="btn-primary btn-shine w-full justify-center gap-2 disabled:opacity-60">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null} कोड भेजें
              </button>
              <p className="text-center text-sm text-navy-600">पहले से खाता है? <Link to="/login" className="font-medium text-maroon-700 underline">लॉगिन करें</Link></p>
            </Stagger>
          </motion.form>
        ) : step === 'code' ? (
          <motion.form key="code" {...slide} onSubmit={confirm} className="space-y-5 text-center">
            <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 14 }}>
              <MailCheck className="mx-auto h-10 w-10 text-gold-500" aria-hidden="true" />
            </motion.div>
            <div>
              <h1 className="devanagari text-2xl text-maroon-700">ईमेल सत्यापित करें</h1>
              <p className="devanagari-body mt-1 text-sm text-navy-600"><b className="break-all">{values.email}</b> पर 6 अंकों का कोड भेजा गया है। (Spam फ़ोल्डर भी देखें)</p>
            </div>
            <OtpInput value={code} onChange={setCode} status={formError ? 'error' : ''} shakeKey={shakeKey} disabled={busy} />
            {formError ? <p role="alert" className="rounded-xl bg-maroon-500/10 px-4 py-2 text-sm text-maroon-600">{formError}</p> : null}
            <button type="submit" disabled={busy || code.length !== 6} className="btn-primary btn-shine w-full justify-center gap-2 disabled:opacity-60">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null} सत्यापित करें
            </button>
            <button type="button" onClick={resend} disabled={wait > 0} className="text-sm text-maroon-700 underline disabled:no-underline disabled:opacity-60">
              {wait > 0 ? `${wait} सेकंड बाद नया कोड मंगा सकते हैं` : 'कोड दोबारा भेजें'}
            </button>
          </motion.form>
        ) : (
          <motion.div key="done" {...slide} className="space-y-4 py-4 text-center" role="status">
            <SuccessBurst />
            <h1 className="devanagari text-3xl text-maroon-700">स्वागत है!</h1>
            <p className="devanagari-body text-sm text-navy-600">आपका खाता बन गया है। आपको आपके खाते पर ले जा रहे हैं...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthShell>
  );
}
