import { committeeMembers } from '../config/committee.js';
import { CommitteeGrid } from '../components/ContentGrids.jsx';
import { EmptyState } from '../components/StatusStates.jsx';
import { PageHeader } from '../components/Decor.jsx';

export default function Committee() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <PageHeader hindi="समिति के सदस्य" english="Committee" />

      {committeeMembers.length === 0 ? (
        <EmptyState message="समिति के सदस्यों की जानकारी जल्द ही उपलब्ध होगी।" />
      ) : (
        <CommitteeGrid members={committeeMembers} />
      )}
    </div>
  );
}
