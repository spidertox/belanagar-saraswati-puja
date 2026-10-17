import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { userLogout, userMe } from '../lib/api.js';

// Signed-in website visitor (separate from the admin session).
const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [state, setState] = useState({ user: null, loading: true });

  useEffect(() => {
    let alive = true;
    userMe()
      .then((d) => alive && setState({ user: d.user || null, loading: false }))
      .catch(() => alive && setState({ user: null, loading: false }));
    return () => {
      alive = false;
    };
  }, []);

  const setUser = useCallback((user) => setState({ user, loading: false }), []);
  const logout = useCallback(async () => {
    try {
      await userLogout();
    } finally {
      setState({ user: null, loading: false });
    }
  }, []);

  const value = useMemo(() => ({ ...state, setUser, logout }), [state, setUser, logout]);
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
