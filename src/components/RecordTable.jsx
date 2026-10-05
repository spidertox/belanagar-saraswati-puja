import { useId } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/format.js';
import { LoadingSpinner, ErrorState, EmptyState } from './StatusStates.jsx';

const RANGE_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
  { value: 'custom', label: 'Custom' },
];

function formatValue(item, column) {
  const raw = item[column.key];
  if (column.format === 'currency') return formatCurrency(raw);
  if (column.format === 'date') return formatDate(raw);
  if (column.format === 'yesno') return raw ? 'हाँ' : 'नहीं';
  return raw || raw === 0 ? raw : '—';
}

/**
 * One table component used everywhere a list of records is shown: public
 * donation/expense ledgers and every admin management screen. Search,
 * date-range and category filters are all optional — pass the matching
 * `on*Change` prop to turn one on. `renderActions(item)` adds an edit/delete
 * column for the admin panel; omit it for read-only public views.
 */
export default function RecordTable({
  columns,
  items,
  total,
  page = 1,
  pageSize = 10,
  onPageChange,
  loading,
  error,
  onRetry,
  emptyMessage,
  search,
  onSearchChange,
  searchPlaceholder = 'खोजें...',
  dateRange,
  onDateRangeChange,
  categoryOptions,
  category,
  onCategoryChange,
  renderActions,
}) {
  const searchId = useId();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const showFilters = Boolean(onSearchChange || onDateRangeChange || (categoryOptions && onCategoryChange));

  return (
    <div>
      {showFilters ? (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          {onSearchChange ? (
            <div className="relative min-w-[180px] flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400"
                aria-hidden="true"
              />
              <label htmlFor={searchId} className="sr-only">
                {searchPlaceholder}
              </label>
              <input
                id={searchId}
                type="search"
                value={search || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-full border border-navy-900/15 bg-white py-2 pl-9 pr-4 text-sm focus:border-gold-500"
              />
            </div>
          ) : null}

          {onDateRangeChange ? (
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={dateRange?.preset || 'all'}
                onChange={(e) => onDateRangeChange({ ...dateRange, preset: e.target.value })}
                className="rounded-full border border-navy-900/15 bg-white px-3 py-2 text-sm"
                aria-label="तारीख के अनुसार फ़िल्टर करें"
              >
                {RANGE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              {dateRange?.preset === 'custom' ? (
                <>
                  <input
                    type="date"
                    value={dateRange.from || ''}
                    onChange={(e) => onDateRangeChange({ ...dateRange, from: e.target.value })}
                    className="rounded-full border border-navy-900/15 bg-white px-3 py-2 text-sm"
                    aria-label="से तारीख"
                  />
                  <input
                    type="date"
                    value={dateRange.to || ''}
                    onChange={(e) => onDateRangeChange({ ...dateRange, to: e.target.value })}
                    className="rounded-full border border-navy-900/15 bg-white px-3 py-2 text-sm"
                    aria-label="तक तारीख"
                  />
                </>
              ) : null}
            </div>
          ) : null}

          {categoryOptions && onCategoryChange ? (
            <select
              value={category || ''}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="rounded-full border border-navy-900/15 bg-white px-3 py-2 text-sm"
              aria-label="श्रेणी के अनुसार फ़िल्टर करें"
            >
              <option value="">सभी श्रेणियां</option>
              {categoryOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          ) : null}
        </div>
      ) : null}

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : items.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-2xl border border-navy-900/10 bg-white sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-900/10 bg-ivory-100 text-navy-600">
                  {columns.map((c) => (
                    <th
                      key={c.key}
                      className={`px-4 py-3 font-medium ${c.align === 'right' ? 'text-right' : 'text-left'}`}
                    >
                      {c.label}
                    </th>
                  ))}
                  {renderActions ? <th className="px-4 py-3 text-right font-medium">कार्रवाई</th> : null}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-navy-900/5 last:border-0 hover:bg-ivory-50">
                    {columns.map((c) => (
                      <td
                        key={c.key}
                        className={`px-4 py-3 ${c.format === 'currency' ? 'font-semibold text-maroon-700' : 'text-navy-800'} ${c.align === 'right' ? 'text-right tabular-nums' : ''}`}
                      >
                        {formatValue(item, c)}
                      </td>
                    ))}
                    {renderActions ? <td className="px-4 py-3 text-right">{renderActions(item)}</td> : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 sm:hidden">
            {items.map((item) => (
              <div key={item.id} className="rounded-xl border border-navy-900/10 bg-white p-4">
                {columns.map((c, i) => (
                  <div
                    key={c.key}
                    className={`flex items-center justify-between gap-3 py-1.5 ${i === 0 ? '' : 'border-t border-navy-900/5'}`}
                  >
                    <span className="text-xs text-navy-500">{c.label}</span>
                    <span
                      className={`text-sm ${c.format === 'currency' ? 'font-semibold text-maroon-700' : 'text-navy-800'} ${c.align === 'right' ? 'tabular-nums' : ''}`}
                    >
                      {formatValue(item, c)}
                    </span>
                  </div>
                ))}
                {renderActions ? (
                  <div className="mt-3 flex justify-end gap-2 border-t border-navy-900/5 pt-3">{renderActions(item)}</div>
                ) : null}
              </div>
            ))}
          </div>

          {totalPages > 1 && onPageChange ? (
            <div className="mt-5 flex items-center justify-center gap-1">
              <button
                type="button"
                onClick={() => onPageChange(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="rounded-full p-2 text-navy-600 hover:bg-navy-900/5 disabled:opacity-30"
                aria-label="पिछला पृष्ठ"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-3 text-sm text-navy-600">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="rounded-full p-2 text-navy-600 hover:bg-navy-900/5 disabled:opacity-30"
                aria-label="अगला पृष्ठ"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
