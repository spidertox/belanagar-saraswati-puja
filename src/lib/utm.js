// UTM campaign tracking: ?utm_source=whatsapp&utm_medium=group is parsed on
// arrival and kept in localStorage - but only after the visitor accepted
// cookies. Until they answer, it waits in sessionStorage and is moved over on
// "accept" (or dropped on "decline").
const KEY = 'bsp-utm';
const PENDING = 'bsp-utm-pending';
const FIELDS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

export function parseUtm(search = '') {
  const p = new URLSearchParams(search);
  const out = {};
  FIELDS.forEach((k) => {
    const v = (p.get(k) || '').trim().slice(0, 100);
    if (v) out[k] = v;
  });
  return out;
}

const read = (store, key) => {
  try {
    return JSON.parse(store.getItem(key) || 'null');
  } catch {
    return null;
  }
};
const write = (store, key, value) => {
  try {
    store.setItem(key, JSON.stringify(value));
  } catch {
    // storage blocked - tracking is optional
  }
};

// consent: 'granted' | 'denied' | null (not answered yet)
export function captureUtm(search, consent) {
  const found = parseUtm(search);
  if (!Object.keys(found).length || consent === 'denied') return;
  const record = { ...found, landedAt: new Date().toISOString() };
  write(consent === 'granted' ? localStorage : sessionStorage, consent === 'granted' ? KEY : PENDING, record);
}

export function flushPendingUtm() {
  const pending = read(sessionStorage, PENDING);
  if (pending) write(localStorage, KEY, pending);
  try {
    sessionStorage.removeItem(PENDING);
  } catch {
    // ignore
  }
}

// e.g. { utm_source: 'whatsapp', utm_medium: 'group', landedAt: '...' } or null
export const getUtm = () => read(localStorage, KEY);
