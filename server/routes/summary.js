import { getFullDatabase } from '../telegramStore.js';

// The one number the whole site is built around: कुल Donation, कुल खर्च,
// शेष राशि. Public — anyone can check the math without logging in.
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const data = await getFullDatabase();
  const totalDonations = (data.donations || []).reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  const totalExpenses = (data.expenses || []).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  return res.status(200).json({
    totalDonations,
    totalExpenses,
    balance: totalDonations - totalExpenses,
    lastUpdated: data.updatedAt,
  });
}
