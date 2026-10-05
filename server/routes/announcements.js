import { makeCollectionHandler, makeItemHandler } from '../resourceHandler.js';
import { validateAnnouncement } from '../validators.js';

export const list = makeCollectionHandler({
  type: 'announcements',
  validate: validateAnnouncement,
  buildRecord: (body, { seq, year }) => ({
    id: `ANN-${year}-${seq}`,
    type: 'announcement',
    title: String(body.title).trim(),
    body: String(body.body).trim(),
    important: Boolean(body.important),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }),
});

export const item = makeItemHandler({
  type: 'announcements',
  validate: validateAnnouncement,
  applyUpdate: (existing, body) => ({
    ...existing,
    title: String(body.title).trim(),
    body: String(body.body).trim(),
    important: Boolean(body.important),
    updatedAt: new Date().toISOString(),
  }),
});
