
import { useCallback, useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Handshake,
  CircleDollarSign,
  TrendingUp,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  ArrowUpDown,
  RefreshCw,
  X,
  AlertCircle,
  CalendarDays,
  UserRound,
  Building2,
  Target,
} from 'lucide-react';

import api from '../services/api';
import DealModal from '../components/leads/DealModal';

const PAGE_SIZE = 10;

const STAGE_OPTIONS = [
  { value: '', label: 'All stages' },
  { value: 'QUALIFICATION', label: 'Qualification' },
  { value: 'PROPOSAL', label: 'Proposal' },
  { value: 'NEGOTIATION', label: 'Negotiation' },
  { value: 'WON', label: 'Won' },
  { value: 'LOST', label: 'Lost' },
];

const STAGE_STYLES = {
  QUALIFICATION: 'bg-blue-50 text-blue-700 ring-blue-600/15',
  PROPOSAL: 'bg-violet-50 text-violet-700 ring-violet-600/15',
  NEGOTIATION: 'bg-amber-50 text-amber-700 ring-amber-600/15',
  WON: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
  LOST: 'bg-rose-50 text-rose-700 ring-rose-600/15',
};

const formatStage = (stage = '') =>
  stage.charAt(0) + stage.slice(1).toLowerCase().replaceAll('_', ' ');

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));

const formatDate = (date) => {
  if (!date) return 'Not set';

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return 'Not set';

  return parsed.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

function StageBadge({ stage }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
        STAGE_STYLES[stage] ||
        'bg-slate-100 text-slate-700 ring-slate-500/10'
      }`}
    >
      {formatStage(stage)}
    </span>
  );
}

function MetricCard({ title, value, description, icon: Icon, iconClass }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 truncate text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {value}
          </p>
          <p className="mt-2 text-xs text-slate-500">{description}</p>
        </div>

        <div className={`rounded-xl p-3 ${iconClass}`}>
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

export default function Deals() {
  const [deals, setDeals] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('');
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
  const [deleteError, setDeleteError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [sortNewestFirst, setSortNewestFirst] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);

  const loadDeals = useCallback(
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
        if (stage) params.stage = stage;

        const response = await api.get('/deals', { params });
        const data = response.data?.data ?? response.data;
        const items = Array.isArray(data?.items) ? data.items : [];
        const paginationData = data?.pagination ?? {};

        setDeals(items);

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
            'Unable to load deals. Check your server connection and try again.'
        );
        setDeals([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, search, stage]
  );

  useEffect(() => {
    loadDeals();
  }, [loadDeals]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleStageChange = (event) => {
    setStage(event.target.value);
    setPage(1);
  };

  const openCreateModal = () => {
    setEditingDeal(null);
    setModalOpen(true);
  };

  const openEditModal = (deal) => {
    setEditingDeal(deal);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingDeal(null);
  };

  const handleDealSaved = async () => {
    closeModal();
    await loadDeals({ refresh: true });
  };

  const handleDelete = async (deal) => {
    const confirmed = window.confirm(
      `Delete "${deal.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(deal.id);
    setDeleteError('');

    try {
      await api.delete(`/deals/${deal.id}`);

      if (deals.length === 1 && page > 1) {
        setPage((currentPage) => currentPage - 1);
      } else {
        await loadDeals({ refresh: true });
      }
    } catch (err) {
      setDeleteError(
        err.response?.data?.message ||
          'Unable to delete this deal. Only admins can delete deals.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  const sortedDeals = [...deals].sort((a, b) => {
    const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();

    return sortNewestFirst ? dateB - dateA : dateA - dateB;
  });

  // These metrics describe the currently loaded page, not the entire database.
  const pageValue = deals.reduce(
    (sum, deal) => sum + Number(deal.value ?? 0),
    0
  );

  const wonDeals = deals.filter((deal) => deal.stage === 'WON');
  const wonValue = wonDeals.reduce(
    (sum, deal) => sum + Number(deal.value ?? 0),
    0
  );

  const activeDeals = deals.filter(
    (deal) =>
      ['QUALIFICATION', 'PROPOSAL', 'NEGOTIATION'].includes(deal.stage)
  ).length;

  const hasFilters = Boolean(search || stage);

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 pb-8">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-slate-700">Deals</span>
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Deals
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Track opportunities, monitor deal stages, and manage revenue.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadDeals({ refresh: true })}
            disabled={refreshing || loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
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
            Add deal
          </button>
        </div>
      </div>

      {/* Errors */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
        >
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <span className="flex-1">{error}</span>
          <button
            type="button"
            onClick={() => loadDeals()}
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
          title="Total deals"
          value={pagination.total}
          description="Deals matching your current filters"
          icon={Handshake}
          iconClass="bg-indigo-50 text-indigo-600"
        />

        <MetricCard
          title="Pipeline value"
          value={formatCurrency(pageValue)}
          description="Value of deals on this page"
          icon={CircleDollarSign}
          iconClass="bg-blue-50 text-blue-600"
        />

        <MetricCard
          title="Active deals"
          value={activeDeals}
          description="Active deals on this page"
          icon={TrendingUp}
          iconClass="bg-amber-50 text-amber-600"
        />

        <MetricCard
          title="Won value"
          value={formatCurrency(wonValue)}
          description={`${wonDeals.length} won on this page`}
          icon={Trophy}
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
                placeholder="Search deal title, lead, or company..."
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
                value={stage}
                onChange={handleStageChange}
                className="w-full min-w-48 appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-8 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              >
                {STAGE_OPTIONS.map((option) => (
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
              {sortNewestFirst ? 'Recently updated' : 'Least recent'}
            </button>

            {hasFilters && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  setSearch('');
                  setStage('');
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
            Showing {deals.length ? (page - 1) * PAGE_SIZE + 1 : 0}–
            {(page - 1) * PAGE_SIZE + deals.length} of {pagination.total} deals
          </p>

          {hasFilters && (
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 font-medium text-indigo-700">
              Filters applied
            </span>
          )}
        </div>
      </div>

      {/* Deals table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="font-semibold text-slate-900">All deals</h2>
            <p className="mt-1 text-xs text-slate-500">
              Review your opportunities and their current stages.
            </p>
          </div>

          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {pagination.total} total
          </span>
        </div>

        {loading ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-slate-500">
            <RefreshCw size={24} className="animate-spin text-indigo-600" />
            <p className="text-sm">Loading deals...</p>
          </div>
        ) : deals.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
            <div className="rounded-2xl bg-indigo-50 p-4 text-indigo-600">
              <Handshake size={28} />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              {hasFilters ? 'No matching deals' : 'No deals yet'}
            </h3>

            <p className="mt-1 max-w-sm text-sm text-slate-500">
              {hasFilters
                ? 'Try changing your search or clearing the filters.'
                : 'Create a deal to start tracking an opportunity.'}
            </p>

            {hasFilters ? (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  setSearch('');
                  setStage('');
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
                Create first deal
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left">
                <thead className="bg-slate-50/80">
                  <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-3.5">Deal</th>
                    <th className="px-5 py-3.5">Lead / Company</th>
                    <th className="px-5 py-3.5">Value</th>
                    <th className="px-5 py-3.5">Stage</th>
                    <th className="px-5 py-3.5">Expected close</th>
                    <th className="px-5 py-3.5">Owner</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {sortedDeals.map((deal) => (
                    <tr
                      key={deal.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                            <Target size={19} />
                          </div>

                          <div className="min-w-0">
                            <p className="max-w-52 truncate text-sm font-semibold text-slate-900">
                              {deal.title}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              Updated {formatDate(deal.updatedAt)}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="max-w-44 truncate text-sm font-medium text-slate-700">
                          {deal.lead?.name || 'No lead'}
                        </p>

                        <p className="mt-1 flex max-w-44 items-center gap-1.5 truncate text-xs text-slate-500">
                          <Building2 size={12} className="shrink-0" />
                          {deal.lead?.company || 'No company'}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span className="whitespace-nowrap text-sm font-semibold text-slate-900">
                          {formatCurrency(deal.value)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <StageBadge stage={deal.stage} />
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 whitespace-nowrap text-sm text-slate-500">
                          <CalendarDays
                            size={15}
                            className="text-slate-400"
                          />
                          {formatDate(deal.expectedCloseDate)}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                            <UserRound size={15} />
                          </div>
                          <div className="min-w-0">
                            <p className="max-w-32 truncate text-sm text-slate-700">
                              {deal.owner?.name || 'Unknown'}
                            </p>
                            <p className="max-w-32 truncate text-xs text-slate-400">
                              {deal.owner?.email || ''}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(deal)}
                            title="Edit deal"
                            aria-label={`Edit ${deal.title}`}
                            className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(deal)}
                            disabled={deletingId === deal.id}
                            title="Delete deal"
                            aria-label={`Delete ${deal.title}`}
                            className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                          >
                            {deletingId === deal.id ? (
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
        <DealModal
          deal={editingDeal}
          onClose={closeModal}
          onSaved={handleDealSaved}
        />
      )}
    </div>
  );
}
