import { makeCollectionHandler, makeItemHandler } from '../resourceHandler.js';
import { validateDonation } from '../validators.js';

export const list = makeCollectionHandler({
  type: 'donations',
  validate: validateDonation,
  searchField: 'name',
  sumField: 'amount',
  // The real name is always stored (the committee needs it for its own
  // records) but never shown to the public when the donor asked to be
  // listed as Anonymous.
  sanitizeForPublic: (item) => (item.anonymous ? { ...item, name: 'Anonymous' } : item),
  buildRecord: (body, { seq, year }) => ({
    id: `DON-${year}-${seq}`,
    type: 'donation',
    name: String(body.name).trim(),
    anonymous: Boolean(body.anonymous),
    amount: Number(body.amount),
    date: body.date,
    purpose: (body.purpose || '').trim(),
    note: (body.note || '').trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }),
});

export const item = makeItemHandler({
  type: 'donations',
  validate: validateDonation,
  applyUpdate: (existing, body) => ({
    ...existing,
    name: String(body.name).trim(),
    anonymous: Boolean(body.anonymous),
    amount: Number(body.amount),
    date: body.date,
    purpose: (body.purpose || '').trim(),
    note: (body.note || '').trim(),
    updatedAt: new Date().toISOString(),
  }),
});
