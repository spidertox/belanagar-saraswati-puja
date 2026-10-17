import { useEffect, useState } from 'react';
import { getSettings } from '../lib/api.js';
import { festivalConfig } from '../config/festivalConfig.js';

// Donation settings saved by the admin (Admin > UPI सेटिंग) override the
// defaults in festivalConfig.js. If the API is unreachable the defaults are used.
export function mergeDonation(remote) {
  const base = festivalConfig.donation || {};
  const r = remote || {};
  return {
    enabled: r.enabled !== false,
    upiId: r.upiId || base.upiId || '',
    payeeName: r.payeeName || base.payeeName || '',
    note: r.note || base.note || '',
    amounts: Array.isArray(r.amounts) && r.amounts.length ? r.amounts : base.amounts || [],
    maxAmount: r.maxAmount || base.maxAmount || 100000,
  };
}

export function useDonationSettings() {
  const [state, setState] = useState({ cfg: mergeDonation(null), loading: true });
  useEffect(() => {
    let alive = true;
    getSettings()
      .then((d) => alive && setState({ cfg: mergeDonation(d.donation), loading: false }))
      .catch(() => alive && setState((s) => ({ ...s, loading: false })));
    return () => {
      alive = false;
    };
  }, []);
  return state;
}
