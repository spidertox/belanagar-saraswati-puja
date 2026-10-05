import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { adminResources } from '../../config/adminResources.js';
import { useResourceList, createResource, updateResource, deleteResource } from '../../lib/api.js';
import RecordTable from '../../components/RecordTable.jsx';
import RecordForm from '../../components/admin/RecordForm.jsx';
import Modal, { ConfirmDialog } from '../../components/Modal.jsx';
import { useToast } from '../../components/Toast.jsx';
import NotFound from '../NotFound.jsx';

export default function ManageResource() {
  const { resource } = useParams();
  const config = adminResources[resource];
  const showToast = useToast();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState({ preset: 'all', from: '', to: '' });
  const [category, setCategory] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { items, total, loading, error, refresh } = useResourceList(
    resource,
    {
      search: config?.searchable ? search : undefined,
      page,
      pageSize: 10,
      range: config?.dateRangeFilter ? dateRange.preset : undefined,
      from: config?.dateRangeFilter && dateRange.preset === 'custom' ? dateRange.from : undefined,
      to: config?.dateRangeFilter && dateRange.preset === 'custom' ? dateRange.to : undefined,
      category: config?.categoryFilter ? category : undefined,
    },
    { skip: !config }
  );

  if (!config) return <NotFound />;

  function openCreate() {
    setEditingItem(null);
    setFormOpen(true);
  }
  function openEdit(item) {
    setEditingItem(item);
    setFormOpen(true);
  }

  async function handleSubmit(values) {
    if (editingItem) {
      await updateResource(resource, editingItem.id, values);
      showToast('सफलतापूर्वक अपडेट किया गया');
    } else {
      await createResource(resource, values);
      showToast('सफलतापूर्वक जोड़ा गया');
    }
    setFormOpen(false);
    refresh();
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteResource(resource, deletingItem.id);
      showToast('हटा दिया गया');
      setDeletingItem(null);
      refresh();
    } catch (err) {
      showToast(err.message || 'हटाया नहीं जा सका', { type: 'error' });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="devanagari text-2xl text-maroon-700">{config.labelHindi}</h1>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-full bg-maroon-700 px-4 py-2 text-sm font-medium text-ivory-50 transition hover:bg-maroon-600"
        >
          <Plus className="h-4 w-4" /> {config.addLabel.replace('+ ', '')}
        </button>
      </div>

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
        search={config.searchable ? search : undefined}
        onSearchChange={
          config.searchable
            ? (v) => {
                setSearch(v);
                setPage(1);
              }
            : undefined
        }
        searchPlaceholder={config.searchPlaceholder}
        dateRange={config.dateRangeFilter ? dateRange : undefined}
        onDateRangeChange={
          config.dateRangeFilter
            ? (v) => {
                setDateRange(v);
                setPage(1);
              }
            : undefined
        }
        categoryOptions={config.categoryFilter?.options}
        category={config.categoryFilter ? category : undefined}
        onCategoryChange={
          config.categoryFilter
            ? (v) => {
                setCategory(v);
                setPage(1);
              }
            : undefined
        }
        renderActions={(item) => (
          <div className="flex justify-end gap-1.5">
            <button
              type="button"
              onClick={() => openEdit(item)}
              aria-label="संपादित करें"
              className="rounded-full p-1.5 text-navy-500 hover:bg-navy-900/5 hover:text-maroon-700"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setDeletingItem(item)}
              aria-label="हटाएं"
              className="rounded-full p-1.5 text-navy-500 hover:bg-maroon-700/10 hover:text-maroon-700"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      />

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingItem ? 'संपादित करें' : config.addLabel.replace('+ ', '')}
      >
        <RecordForm
          fields={config.fields}
          initialValues={editingItem}
          onSubmit={handleSubmit}
          onCancel={() => setFormOpen(false)}
          submitLabel={editingItem ? 'Update' : 'Save'}
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(deletingItem)}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="पुष्टि करें"
        message={`क्या आप यह ${config.labelHindi} record delete करना चाहते हैं? यह कार्य पूर्ववत नहीं किया जा सकता।`}
        confirmLabel="Delete"
      />
    </div>
  );
}
