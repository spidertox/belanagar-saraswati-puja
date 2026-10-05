import { Megaphone } from 'lucide-react';
import { useResourceList } from '../lib/api.js';

// Fails quietly (renders nothing) on error/empty — this is a homepage
// accent, not a page whose whole job is to show data, so we don't want a
// scary error box here if announcements simply haven't been set up yet.
export default function AnnouncementBanner() {
  const { items, loading, error } = useResourceList('announcements', { page: 1, pageSize: 5 });

  if (loading || error || items.length === 0) return null;

  const important = items.filter((a) => a.important);
  const list = important.length ? important : items.slice(0, 1);

  return (
    <div className="bg-basanti-300/40">
      <div className="mx-auto max-w-4xl space-y-3 px-4 py-4 sm:px-6">
        {list.map((a) => (
          <div key={a.id} className="flex gap-3">
            <Megaphone className="mt-0.5 h-4 w-4 flex-shrink-0 text-maroon-700" aria-hidden="true" />
            <div>
              <p className="devanagari text-sm font-medium text-maroon-700">{a.title}</p>
              <p className="mt-0.5 text-sm text-navy-700">{a.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
