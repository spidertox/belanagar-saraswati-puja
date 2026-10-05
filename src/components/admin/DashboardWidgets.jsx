import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCurrency, formatDateTime } from '../../lib/format.js';

export function DonationExpenseChart({ totalDonations, totalExpenses }) {
  const data = [
    { name: 'दान', amount: totalDonations },
    { name: 'खर्च', amount: totalExpenses },
  ];
  return (
    <div className="h-64 rounded-2xl bg-white p-4 shadow-card">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#0F172A14" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={48}
            tickFormatter={(v) => `₹${Math.round(v / 1000)}k`}
          />
          <Tooltip formatter={(v) => formatCurrency(v)} />
          <Bar dataKey="amount" radius={[6, 6, 0, 0]} fill="#7A1B34" maxBarSize={72} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const ACTION_LABEL = { CREATE: 'जोड़ा गया', UPDATE: 'संपादित किया गया', DELETE: 'हटाया गया' };
const TYPE_LABEL = {
  donations: 'दान',
  expenses: 'खर्च',
  events: 'कार्यक्रम',
  gallery: 'गैलरी',
  announcements: 'सूचना',
};

export function RecentActivityList({ entries }) {
  if (!entries || entries.length === 0) {
    return <p className="py-4 text-sm text-navy-500">अभी कोई गतिविधि नहीं है।</p>;
  }
  return (
    <ul className="divide-y divide-navy-900/5">
      {entries.map((entry) => (
        <li key={entry.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
          <span className="text-navy-700">
            {TYPE_LABEL[entry.recordType] || entry.recordType} {ACTION_LABEL[entry.action] || entry.action}
          </span>
          <span className="flex-shrink-0 text-xs text-navy-400">{formatDateTime(entry.at)}</span>
        </li>
      ))}
    </ul>
  );
}
