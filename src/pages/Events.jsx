import { useResourceList } from '../lib/api.js';
import { PageHeader } from '../components/Decor.jsx';
import PujaDetails from '../components/PujaDetails.jsx';
import { EventTimeline } from '../components/ContentGrids.jsx';
import { LoadingSpinner, ErrorState, EmptyState } from '../components/StatusStates.jsx';

export default function Events() {
  const { items, loading, error, refresh } = useResourceList('events', { page: 1, pageSize: 100 });
  const sorted = [...items].sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <PageHeader hindi="पूजा कार्यक्रम" english="Programme" />
      <PujaDetails className="mb-10" />

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : sorted.length === 0 ? (
        <EmptyState message="अभी कोई कार्यक्रम जोड़ा नहीं गया है।" />
      ) : (
        <EventTimeline events={sorted} />
      )}
    </div>
  );
}
