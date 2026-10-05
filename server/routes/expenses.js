import { makeCollectionHandler, makeItemHandler } from '../resourceHandler.js';
import { validateExpense } from '../validators.js';

export const list = makeCollectionHandler({
  type: 'expenses',
  validate: validateExpense,
  searchField: 'title',
  sumField: 'amount',
  buildRecord: (body, { seq, year }) => ({
    id: `EXP-${year}-${seq}`,
    type: 'expense',
    title: String(body.title).trim(),
    category: body.category,
    amount: Number(body.amount),
    date: body.date,
    note: (body.note || '').trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }),
});

export const item = makeItemHandler({
  type: 'expenses',
  validate: validateExpense,
  applyUpdate: (existing, body) => ({
    ...existing,
    title: String(body.title).trim(),
    category: body.category,
    amount: Number(body.amount),
    date: body.date,
    note: (body.note || '').trim(),
    updatedAt: new Date().toISOString(),
  }),
});
