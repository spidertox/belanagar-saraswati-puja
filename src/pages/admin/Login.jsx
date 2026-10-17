import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { festivalConfig } from '../../config/festivalConfig.js';

export default function Login() {
  const { status, login } = useAuth();
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  if (status === 'authenticated') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError('');
    try {
      await login(password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'गलत पासवर्ड। कृपया पुनः प्रयास करें।');
      setPassword('');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-navy-900 to-navy-800 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-ivory-50 p-8 shadow-lift">
        <img
          src={festivalConfig.logoSrc}
          alt="समिति का लोगो"
          width={festivalConfig.logoWidth}
          height={festivalConfig.logoHeight}
          className="mx-auto mb-3 h-20 w-auto"
        />
        <p className="devanagari text-center text-lg text-maroon-700">{festivalConfig.shortNameHindi}</p>
        <h1 className="mt-1 text-center text-sm text-navy-500">Admin Login</h1>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-navy-700">
              पासवर्ड
            </label>
            <div className="relative">
              <input
                id="password"
                type={show ? 'text' : 'password'}
                autoFocus
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'login-error' : undefined}
                className="w-full rounded-lg border border-navy-900/15 bg-white py-2.5 pl-3 pr-10 text-sm focus:border-gold-500"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? 'पासवर्ड छुपाएं' : 'पासवर्ड दिखाएं'}
                aria-pressed={show}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-navy-500 hover:bg-navy-900/5"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {error ? (
            <p id="login-error" role="alert" className="rounded-lg bg-maroon-700/10 px-3 py-2 text-sm text-maroon-700">
              {error}
            </p>
          ) : null}
          <button type="submit" disabled={submitting || !password} className="btn-primary w-full gap-2 disabled:opacity-60">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <LogIn className="h-4 w-4" aria-hidden="true" />}
            {submitting ? 'लॉगिन हो रहा है...' : 'Login'}
          </button>
        </form>
      </div>
      <Link to="/" className="mt-6 flex items-center gap-1.5 text-sm text-ivory-100/70 hover:text-basanti-400">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> वेबसाइट पर वापस जाएं
      </Link>
    </div>
  );
}
