import { useCallback, useEffect, useState } from 'react';
import { login as apiLogin, logout as apiLogout, getSession } from '../lib/api.js';

// Tracks the admin session by asking the server (via the signed cookie),
// never by trusting anything stored client-side.
export function useAuth() {
  const [status, setStatus] = useState('checking'); // checking | authenticated | anonymous

  const check = useCallback(async () => {
    setStatus('checking');
    try {
      const data = await getSession();
      setStatus(data.authenticated ? 'authenticated' : 'anonymous');
    } catch {
      setStatus('anonymous');
    }
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  const login = useCallback(async (password) => {
    await apiLogin(password);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } finally {
      setStatus('anonymous');
    }
  }, []);

  return { status, login, logout, refresh: check };
}
