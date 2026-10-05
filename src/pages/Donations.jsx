import { useState } from 'react';
import { Wallet, Receipt, PiggyBank } from 'lucide-react';
import { adminResources } from '../config/adminResources.js';
import { useResourceList, useSummary } from '../lib/api.js';
import { formatCurrency, formatDateTime } from '../lib/format.js';
import SummaryCards from '../components/SummaryCards.jsx';
import RecordTable from '../components/RecordTable.jsx';
import { PageHeader } from '../components/Decor.jsx';

const config = adminResources.donations;

export default function Donations() {
  const summary = useSummary();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState({ preset: 'all', from: '', to: '' });

  const { items, total, loading, error, refresh } = useResourceList('donations', {
    search,
    page,
    pageSize: 10,
    range: dateRange.preset,
    from: dateRange.preset === 'custom' ? dateRange.from : undefined,
    to: dateRange.preset === 'custom' ? dateRange.to : undefined,
  });

  const summaryCards = summary.data
    ? [
        { label: 'कुल प्राप्त Donation', value: formatCurrency(summary.data.totalDonations), icon: Wallet },
        { label: 'कुल खर्च', value: formatCurrency(summary.data.totalExpenses), icon: Receipt },
        { label: 'शेष राशि', value: formatCurrency(summary.data.balance), tone: 'accent', icon: PiggyBank },
      ]
    : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <PageHeader hindi="दान विवरण" english="Donations" />

      {summary.data ? (
        <>
          <SummaryCards items={summaryCards} />
          <p className="mt-3 text-center text-xs text-navy-400">
            Last Updated: {formatDateTime(summary.data.lastUpdated)}
          </p>
        </>
      ) : null}

      <div className="mt-10">
        <RecordTable
          columns={config.columns}
          items={items}
          total={total}
          page={page}
          pageSize={10}
          onPageChange={setPage}
          loading={loading}
          error={error}
          onRetry={refresh}
          emptyMessage="अभी कोई रिकॉर्ड उपलब्ध नहीं है।"
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          searchPlaceholder={config.searchPlaceholder}
          dateRange={dateRange}
          onDateRangeChange={(v) => {
            setDateRange(v);
            setPage(1);
          }}
        />
      </div>
    </div>
  );
}
