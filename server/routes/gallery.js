import { makeCollectionHandler, makeItemHandler } from '../resourceHandler.js';
import { validateGallery } from '../validators.js';

export const list = makeCollectionHandler({
  type: 'gallery',
  validate: validateGallery,
  buildRecord: (body, { seq, year }) => ({
    id: `GAL-${year}-${seq}`,
    type: 'gallery',
    imageUrl: String(body.imageUrl).trim(),
    caption: (body.caption || '').trim(),
    category: body.category,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }),
});

export const item = makeItemHandler({
  type: 'gallery',
  validate: validateGallery,
  applyUpdate: (existing, body) => ({
    ...existing,
    imageUrl: String(body.imageUrl).trim(),
    caption: (body.caption || '').trim(),
    category: body.category,
    updatedAt: new Date().toISOString(),
  }),
});
