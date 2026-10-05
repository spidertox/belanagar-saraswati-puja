import { Wallet, Receipt, PiggyBank, Users, ClipboardList } from 'lucide-react';
import { useResourceList, useSummary } from '../../lib/api.js';
import { formatCurrency, formatDateTime } from '../../lib/format.js';
import SummaryCards from '../../components/SummaryCards.jsx';
import { DonationExpenseChart, RecentActivityList } from '../../components/admin/DashboardWidgets.jsx';
import { LoadingSpinner, ErrorState } from '../../components/StatusStates.jsx';

export default function Dashboard() {
  const summary = useSummary();
  const donations = useResourceList('donations', { page: 1, pageSize: 1 });
  const expenses = useResourceList('expenses', { page: 1, pageSize: 1 });
  const activity = useResourceList('audit', { page: 1, pageSize: 8 });

  if (summary.loading) return <LoadingSpinner label="डैशबोर्ड लोड हो रहा है..." />;
  if (summary.error) return <ErrorState message={summary.error} onRetry={summary.refresh} />;

  const cards = [
    { label: 'कुल Donations', value: formatCurrency(summary.data.totalDonations), icon: Wallet },
    { label: 'कुल Expenses', value: formatCurrency(summary.data.totalExpenses), icon: Receipt },
    { label: 'Current Balance', value: formatCurrency(summary.data.balance), tone: 'accent', icon: PiggyBank },
    { label: 'दानदाताओं की संख्या', value: donations.overallCount ?? '—', icon: Users },
    { label: 'खर्च की संख्या', value: expenses.overallCount ?? '—', icon: ClipboardList },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl text-maroon-700">Admin Dashboard</h1>
      <p className="mt-1 text-xs text-navy-400">Last Updated: {formatDateTime(summary.data.lastUpdated)}</p>

      <div className="mt-6">
        <SummaryCards items={cards} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="font-display mb-3 text-lg text-maroon-700">Donation vs Expense</h2>
          <DonationExpenseChart totalDonations={summary.data.totalDonations} totalExpenses={summary.data.totalExpenses} />
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-card">
          <h2 className="devanagari mb-3 text-lg text-maroon-700">हाल की गतिविधि</h2>
          {activity.loading ? <LoadingSpinner /> : <RecentActivityList entries={activity.items} />}
        </div>
      </div>
    </div>
  );
}
