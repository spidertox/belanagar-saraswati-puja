import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { festivalConfig } from '../../config/festivalConfig.js';

export default function Login() {
  const { status, login } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  if (status === 'authenticated') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await login(password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'गलत पासवर्ड। कृपया पुनः प्रयास करें।');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-900 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-ivory-50 p-8 shadow-lift">
        <img
          src={festivalConfig.logoSrc}
          alt=""
          width={festivalConfig.logoWidth}
          height={festivalConfig.logoHeight}
          className="mx-auto mb-3 h-20 w-auto"
        />
        <p className="devanagari text-center text-lg text-maroon-700">{festivalConfig.shortNameHindi}</p>
        <h1 className="mt-1 text-center text-sm text-navy-500">Admin Login</h1>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-navy-700">
              पासवर्ड
            </label>
            <input
              id="password"
              type="password"
              autoFocus
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-navy-900/15 px-3 py-2.5 text-sm focus:border-gold-500"
              required
            />
          </div>
          {error ? <p className="text-sm text-maroon-600">{error}</p> : null}
          <button
            type="submit"
            disabled={submitting || !password}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-maroon-700 px-4 py-2.5 text-sm font-medium text-ivory-50 transition hover:bg-maroon-600 disabled:opacity-60"
          >
            <LogIn className="h-4 w-4" />
            {submitting ? 'लॉगिन हो रहा है...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
