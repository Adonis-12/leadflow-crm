
import { useCallback, useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Users,
  UserCheck,
  UserPlus,
  Target,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  ArrowUpDown,
  RefreshCw,
  X,
  AlertCircle,
  Building2,
  Mail,
  Phone,
  CalendarDays,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import LeadModal from '../components/leads/LeadModal';

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'NEW', label: 'New' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'QUALIFIED', label: 'Qualified' },
  { value: 'CONVERTED', label: 'Converted' },
  { value: 'LOST', label: 'Lost' },
];

const STATUS_STYLES = {
  NEW: 'bg-blue-50 text-blue-700 ring-blue-600/15',
  CONTACTED: 'bg-violet-50 text-violet-700 ring-violet-600/15',
  QUALIFIED: 'bg-amber-50 text-amber-700 ring-amber-600/15',
  CONVERTED: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
  LOST: 'bg-rose-50 text-rose-700 ring-rose-600/15',
};

const formatStatus = (status = '') =>
  status.charAt(0) + status.slice(1).toLowerCase();

const formatDate = (date) => {
  if (!date) return '—';

  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
        STATUS_STYLES[status] || 'bg-gray-100 text-gray-700 ring-gray-500/10'
      }`}
    >
      {formatStatus(status)}
    </span>
  );
}

function MetricCard({ title, value, description, icon: Icon, iconClass }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
          <p className="mt-2 text-xs text-slate-500">{description}</p>
        </div>
        {/* <button
          onClick={() => toast.success('LeadFlow notifications are working!')}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white"
        >
          Test notification
        </button> */}

        <div className={`rounded-xl p-3 ${iconClass}`}>
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [sortNewestFirst, setSortNewestFirst] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const loadLeads = useCallback(
    async ({ refresh = false } = {}) => {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      try {
        const params = {
          page,
          limit: PAGE_SIZE,
        };

        if (search.trim()) params.search = search.trim();
        if (status) params.status = status;

        const response = await api.get('/leads', { params });

        // Expected backend response:
        // { success: true, data: { items: [], pagination: { page, limit, total, totalPages } } }
        const data = response.data?.data ?? response.data;
        const items = Array.isArray(data?.items) ? data.items : [];
        const paginationData = data?.pagination ?? {};

        setLeads(items);
        setPagination({
          page: Number(paginationData.page ?? page),
          limit: Number(paginationData.limit ?? PAGE_SIZE),
          total: Number(paginationData.total ?? data?.total ?? items.length),
          totalPages: Math.max(
            1,
            Number(
              paginationData.totalPages ??
                paginationData.pages ??
                data?.totalPages ??
                data?.pages ??
                1
            )
          ),
        });
      } catch (err) {
        setError(
          err.response?.data?.message ||
            'Unable to load leads. Check your server connection and try again.'
        );
        setLeads([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, search, status]
  );

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
    setPage(1);
  };

  const handleRefresh = () => {
    loadLeads({ refresh: true });
  };

  const openCreateModal = () => {
    setEditingLead(null);
    setModalOpen(true);
  };

  const openEditModal = (lead) => {
    setEditingLead(lead);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingLead(null);
  };


const handleLeadSaved = async () => {
  const wasEditing = Boolean(editingLead);

  closeModal();
  toast.success(
    wasEditing
      ? 'Lead updated successfully!'
      : 'Lead created successfully!'
  );

  await loadLeads({ refresh: true });
};



const handleDelete = async (lead) => {
  const confirmed = window.confirm(
    `Delete "${lead.name}"? This action cannot be undone.`
  );

  if (!confirmed) return;

  setDeletingId(lead.id);

  try {
    await api.delete(`/leads/${lead.id}`);

    toast.success('Lead deleted successfully!');

    if (leads.length === 1 && page > 1) {
      setPage((currentPage) => currentPage - 1);
    } else {
      await loadLeads({ refresh: true });
    }
  } catch (err) {
    toast.error(
      err.response?.data?.message ||
        'Could not delete this lead. You may not have permission.'
    );
  } finally {
    setDeletingId(null);
  }
};


  const sortedLeads = [...leads].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();

    return sortNewestFirst ? dateB - dateA : dateA - dateB;
  });

  const newLeads = leads.filter((lead) => lead.status === 'NEW').length;
  const qualifiedLeads = leads.filter(
    (lead) => lead.status === 'QUALIFIED'
  ).length;
  const convertedLeads = leads.filter(
    (lead) => lead.status === 'CONVERTED'
  ).length;

  const hasFilters = Boolean(search || status);

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 pb-8">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-slate-700">Leads</span>
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Leads
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage prospects, track progress, and keep your pipeline moving.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={refreshing ? 'animate-spin' : ''}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <Plus size={18} />
            Add lead
          </button>
        </div>
      </div>

      {/* Error messages */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
        >
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <div className="flex-1">{error}</div>
          <button
            type="button"
            onClick={() => loadLeads()}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {deleteError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
        >
          <AlertCircle size={18} className="shrink-0" />
          <span className="flex-1">{deleteError}</span>
          <button
            type="button"
            onClick={() => setDeleteError('')}
            aria-label="Dismiss error"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total leads"
          value={pagination.total}
          description="Leads matching your current filters"
          icon={Users}
          iconClass="bg-indigo-50 text-indigo-600"
        />

        <MetricCard
          title="New leads"
          value={newLeads}
          description="New leads on this page"
          icon={UserPlus}
          iconClass="bg-blue-50 text-blue-600"
        />

        <MetricCard
          title="Qualified leads"
          value={qualifiedLeads}
          description="Qualified leads on this page"
          icon={UserCheck}
          iconClass="bg-amber-50 text-amber-600"
        />

        <MetricCard
          title="Converted leads"
          value={convertedLeads}
          description="Converted leads on this page"
          icon={Target}
          iconClass="bg-emerald-50 text-emerald-600"
        />
      </div>

      {/* Search and filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <form
            onSubmit={handleSearchSubmit}
            className="flex min-w-0 flex-1 items-center gap-2"
          >
            <div className="relative flex-1">
              <Search
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search by name, email, or company..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Search
            </button>
          </form>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Filter
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={status}
                onChange={handleStatusChange}
                className="w-full min-w-44 appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-8 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setSortNewestFirst((current) => !current)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <ArrowUpDown size={16} />
              {sortNewestFirst ? 'Newest first' : 'Oldest first'}
            </button>

            {hasFilters && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  setSearch('');
                  setStatus('');
                  setPage(1);
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
              >
                <X size={15} />
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
          <p>
            Showing {leads.length ? (page - 1) * PAGE_SIZE + 1 : 0}–
            {(page - 1) * PAGE_SIZE + leads.length} of {pagination.total} leads
          </p>

          {hasFilters && (
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 font-medium text-indigo-700">
              Filters applied
            </span>
          )}
        </div>
      </div>

      {/* Leads table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="font-semibold text-slate-900">All leads</h2>
            <p className="mt-1 text-xs text-slate-500">
              Review and manage your prospects.
            </p>
          </div>

          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {pagination.total} total
          </span>
        </div>

        {loading ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-slate-500">
            <RefreshCw size={24} className="animate-spin text-indigo-600" />
            <p className="text-sm">Loading leads...</p>
          </div>
        ) : leads.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
            <div className="rounded-2xl bg-indigo-50 p-4 text-indigo-600">
              <Users size={28} />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              {hasFilters ? 'No matching leads' : 'No leads yet'}
            </h3>

            <p className="mt-1 max-w-sm text-sm text-slate-500">
              {hasFilters
                ? 'Try changing your search or clearing the filters.'
                : 'Create your first lead to start building your sales pipeline.'}
            </p>

            {hasFilters ? (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  setSearch('');
                  setStatus('');
                  setPage(1);
                }}
                className="mt-4 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Clear filters
              </button>
            ) : (
              <button
                type="button"
                onClick={openCreateModal}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                <Plus size={17} />
                Create first lead
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead className="bg-slate-50/80">
                  <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-3.5">Lead</th>
                    <th className="px-5 py-3.5">Company</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Assigned to</th>
                    <th className="px-5 py-3.5">Created</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {sortedLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-700">
                            {(lead.name || '?')
                              .trim()
                              .split(/\s+/)
                              .slice(0, 2)
                              .map((part) => part[0])
                              .join('')
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <p className="max-w-52 truncate text-sm font-semibold text-slate-900">
                              {lead.name}
                            </p>

                            {lead.email ? (
                              <p className="mt-1 flex max-w-56 items-center gap-1.5 truncate text-xs text-slate-500">
                                <Mail size={12} className="shrink-0" />
                                {lead.email}
                              </p>
                            ) : lead.phone ? (
                              <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                                <Phone size={12} />
                                {lead.phone}
                              </p>
                            ) : (
                              <p className="mt-1 text-xs text-slate-400">
                                No contact details
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Building2
                            size={15}
                            className="shrink-0 text-slate-400"
                          />
                          <span className="max-w-40 truncate">
                            {lead.company || '—'}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={lead.status} />
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-sm text-slate-700">
                          {lead.assignedTo?.name || 'Unassigned'}
                        </div>
                        {lead.assignedTo?.email && (
                          <p className="mt-1 text-xs text-slate-400">
                            {lead.assignedTo.email}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 whitespace-nowrap text-sm text-slate-500">
                          <CalendarDays
                            size={15}
                            className="text-slate-400"
                          />
                          {formatDate(lead.createdAt)}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(lead)}
                            title="Edit lead"
                            aria-label={`Edit ${lead.name}`}
                            className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(lead)}
                            disabled={deletingId === lead.id}
                            title="Delete lead"
                            aria-label={`Delete ${lead.name}`}
                            className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                          >
                            {deletingId === lead.id ? (
                              <RefreshCw size={15} className="animate-spin" />
                            ) : (
                              <Trash2 size={15} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Page <span className="font-semibold text-slate-800">{page}</span>{' '}
                of{' '}
                <span className="font-semibold text-slate-800">
                  {pagination.totalPages}
                </span>
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page <= 1 || loading}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                <span className="rounded-lg bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700">
                  {page}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setPage((current) =>
                      Math.min(pagination.totalPages, current + 1)
                    )
                  }
                  disabled={page >= pagination.totalPages || loading}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create/edit modal */}
      {modalOpen && (
        <LeadModal
          lead={editingLead}
          onClose={closeModal}
          onSaved={handleLeadSaved}
        />
      )}
    </div>
  );
}
