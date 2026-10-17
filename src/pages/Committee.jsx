import { committeeMembers } from '../config/committee.js';
import { CommitteeGrid } from '../components/ContentGrids.jsx';
import { SkeletonList, ErrorState, EmptyState } from '../components/StatusStates.jsx';
import { PageHeader } from '../components/Decor.jsx';
import { useResourceList } from '../lib/api.js';

export default function Committee() {
  const { items, loading, error, refresh } = useResourceList('committee', { page: 1, pageSize: 100 });
  const members = [...items, ...committeeMembers].sort(
    (a, b) => (a.order ?? 999) - (b.order ?? 999) || new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <PageHeader hindi="समिति के सदस्य" english="Committee" intro="बेलानगर के निवासियों की यह समिति हर साल सरस्वती पूजा का आयोजन करती है। यहाँ पदाधिकारियों और सदस्यों के नाम व ज़िम्मेदारियाँ दी गई हैं, ताकि आप किसी भी जानकारी के लिए सीधे संपर्क कर सकें।" />
      {loading ? (
        <SkeletonList />
      ) : error && members.length === 0 ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : members.length === 0 ? (
        <EmptyState message="समिति के सदस्यों की जानकारी जल्द ही उपलब्ध होगी।" />
      ) : (
        <CommitteeGrid members={members} />
      )}
    </div>
  );
}
