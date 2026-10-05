import { useState } from 'react';
import { adminResources } from '../config/adminResources.js';
import { useResourceList } from '../lib/api.js';
import { GalleryGrid } from '../components/ContentGrids.jsx';
import { LoadingSpinner, ErrorState, EmptyState } from '../components/StatusStates.jsx';
import { PageHeader } from '../components/Decor.jsx';

const config = adminResources.gallery;
const PAGE_SIZE_STEP = 12;

export default function Gallery() {
  const [category, setCategory] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE_STEP);

  const { items, total, loading, error, refresh } = useResourceList('gallery', {
    page: 1,
    pageSize: visibleCount,
    category,
  });

  function selectCategory(c) {
    setCategory(c);
    setVisibleCount(PAGE_SIZE_STEP);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <PageHeader hindi="गैलरी" english="Gallery" />

      <div className="mb-8 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => selectCategory('')}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
            category === '' ? 'bg-maroon-700 text-ivory-50' : 'bg-white text-navy-700 hover:bg-maroon-700/10'
          }`}
        >
          सभी
        </button>
        {config.categoryFilter.options.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => selectCategory(c)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              category === c ? 'bg-maroon-700 text-ivory-50' : 'bg-white text-navy-700 hover:bg-maroon-700/10'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : items.length === 0 ? (
        <EmptyState message="जल्द ही पूजा की तस्वीरें यहाँ उपलब्ध होंगी।" />
      ) : (
        <>
          <GalleryGrid items={items} />
          {visibleCount < total ? (
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => setVisibleCount((v) => v + PAGE_SIZE_STEP)}
                className="rounded-full border border-maroon-700 px-6 py-2.5 text-sm font-medium text-maroon-700 transition hover:bg-maroon-700 hover:text-ivory-50"
              >
                और तस्वीरें देखें
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
