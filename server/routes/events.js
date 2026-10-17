import { makeCollectionHandler, makeItemHandler } from '../resourceHandler.js';
import { validateEvent } from '../validators.js';

export const list = makeCollectionHandler({
  type: 'events',
  validate: validateEvent,
  buildRecord: (body, { seq, year }) => ({
    id: `EVT-${year}-${seq}`,
    type: 'event',
    name: String(body.name).trim(),
    date: body.date,
    time: body.time,
    location: (body.location || '').trim(),
    description: (body.description || '').trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }),
});

export const item = makeItemHandler({
  type: 'events',
  validate: validateEvent,
  applyUpdate: (existing, body) => ({
    ...existing,
    name: String(body.name).trim(),
    date: body.date,
    time: body.time,
    location: (body.location || '').trim(),
    description: (body.description || '').trim(),
    updatedAt: new Date().toISOString(),
  }),
});
