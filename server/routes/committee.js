import { makeCollectionHandler, makeItemHandler } from '../resourceHandler.js';
import { validateCommittee } from '../validators.js';

const order = (v) => (v === '' || v === undefined || v === null ? 999 : Number(v));
const fields = (b) => ({
  name: String(b.name).trim(),
  position: (b.position || '').trim(),
  occupation: (b.occupation || '').trim(),
  village: (b.village || '').trim(),
  order: order(b.order),
});

export const list = makeCollectionHandler({
  type: 'committee',
  validate: validateCommittee,
  searchField: 'name',
  buildRecord: (body, { seq, year }) => ({
    id: `COM-${year}-${seq}`,
    type: 'committee',
    ...fields(body),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }),
});

export const item = makeItemHandler({
  type: 'committee',
  validate: validateCommittee,
  applyUpdate: (existing, body) => ({ ...existing, ...fields(body), updatedAt: new Date().toISOString() }),
});
