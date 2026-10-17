import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { motion, useAnimationControls } from 'framer-motion';
import SocialButtons from '../components/auth/SocialButtons.jsx';
import AuthShell, { Stagger } from '../components/auth/AuthShell.jsx';
import { userLogin } from '../lib/api.js';
import PasswordInput from '../components/PasswordInput.jsx';
import { useUser } from '../hooks/useUser.jsx';

const inputClass =
  'mt-1 w-full rounded-xl border border-navy-900/15 bg-ivory-50 px-4 py-2.5 text-sm text-navy-900 outline-none transition focus:border-gold-500 focus:shadow-[0_0_0_4px_rgba(220,174,73,0.25)]';

export default function UserLogin() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const shake = useAnimationControls();
  const [params] = useSearchParams();
  const urlError = params.get('error') === 'oauth' ? 'Google / Microsoft से लॉगिन नहीं हो सका। कृपया दोबारा प्रयास करें।' : params.get('error') === 'provider' ? 'यह लॉगिन विकल्प अभी चालू नहीं है।' : '';

  if (user) return <Navigate to="/account" replace />;

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const r = await userLogin(email, password);
      setUser(r.user);
      navigate('/account');
    } catch (err) {
      setError(err.message);
      shake.start({ x: [0, -9, 9, -7, 7, -3, 0], transition: { duration: 0.45 } });
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title="बेलानगर सरस्वती पूजा समिति" subtitle="माँ सरस्वती की कृपा, हम सबके साथ">
      <motion.form animate={shake} onSubmit={submit}>
        <Stagger className="space-y-4">
          <div>
            <h1 className="devanagari text-3xl text-maroon-700">लॉगिन</h1>
            <p className="mt-1 text-sm text-navy-500">अपने खाते में वापस आएं</p>
          </div>
          <SocialButtons verb="लॉगिन करें" />
          <div>
            <label htmlFor="li-email" className="text-sm font-medium text-navy-700">ईमेल</label>
            <input id="li-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" aria-invalid={Boolean(error)} className={`${inputClass} ${error ? 'field-error' : ''}`} placeholder="name@gmail.com" />
          </div>
          <div>
            <label htmlFor="li-pw" className="text-sm font-medium text-navy-700">पासवर्ड</label>
            <PasswordInput id="li-pw" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" aria-invalid={Boolean(error)} className={`${inputClass} ${error ? 'field-error' : ''}`} />
          </div>
          {error || urlError ? <p role="alert" className="rounded-xl bg-maroon-500/10 px-4 py-2 text-sm text-maroon-600">{error || urlError}</p> : null}
          <button type="submit" disabled={busy || !email || !password} className="btn-primary btn-shine w-full justify-center gap-2 disabled:opacity-60">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null} लॉगिन
          </button>
          <p className="text-center text-sm text-navy-600">खाता नहीं है? <Link to="/signup" className="font-medium text-maroon-700 underline">साइन-अप करें</Link></p>
        </Stagger>
      </motion.form>
    </AuthShell>
  );
}
