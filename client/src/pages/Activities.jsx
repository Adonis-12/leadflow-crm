
import { useCallback, useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  CalendarDays,
  Phone,
  Video,
  Mail,
  CheckSquare,
  Clock,
  CheckCircle2,
  Circle,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  X,
  AlertCircle,
  UserRound,
  ExternalLink,
} from 'lucide-react';

import api from '../services/api';
import ActivityModal from '../components/leads/ActivityModal';

const PAGE_SIZE = 10;

const TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  { value: 'CALL', label: 'Call' },
  { value: 'MEETING', label: 'Meeting' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'TASK', label: 'Task' },
];

const TYPE_CONFIG = {
  CALL: {
    label: 'Call',
    icon: Phone,
    style: 'bg-blue-50 text-blue-700',
  },
  MEETING: {
    label: 'Meeting',
    icon: Video,
    style: 'bg-violet-50 text-violet-700',
  },
  EMAIL: {
    label: 'Email',
    icon: Mail,
    style: 'bg-amber-50 text-amber-700',
  },
  TASK: {
    label: 'Task',
    icon: CheckSquare,
    style: 'bg-emerald-50 text-emerald-700',
  },
};

const formatDate = (value) => {
  if (!value) return 'No due date';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'No due date';

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const formatDateTime = (value) => {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

function TypeBadge({ type }) {
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.TASK;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold ${config.style}`}
    >
      <Icon size={14} />
      {config.label}
    </span>
  );
}

function MetricCard({ title, value, description, icon: Icon, iconClass }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
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

export default function Activities() {
  const [activities, setActivities] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [completionFilter, setCompletionFilter] = useState('ALL');
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
  const [actionError, setActionError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [sortNewestFirst, setSortNewestFirst] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);

  const loadActivities = useCallback(
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
        if (type) params.type = type;

        if (completionFilter !== 'ALL') {
          params.completed = completionFilter === 'COMPLETED';
        }

        const response = await api.get('/activities', { params });

        const data = response.data?.data ?? response.data;
        const items = Array.isArray(data?.items) ? data.items : [];
        const paginationData = data?.pagination ?? {};

        setActivities(items);

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
            'Unable to load activities. Check your server connection.'
        );
        setActivities([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, search, type, completionFilter]
  );

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const openCreateModal = () => {
    setEditingActivity(null);
    setModalOpen(true);
  };

  const openEditModal = (activity) => {
    setEditingActivity(activity);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingActivity(null);
  };

  const handleActivitySaved = async () => {
    closeModal();
    await loadActivities({ refresh: true });
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleDelete = async (activity) => {
    if (
      !window.confirm(
        `Delete "${activity.title}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setDeletingId(activity.id);
    setActionError('');

    try {
      await api.delete(`/activities/${activity.id}`);

      if (activities.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await loadActivities({ refresh: true });
      }
    } catch (err) {
      setActionError(
        err.response?.data?.message || 'Unable to delete this activity.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  const toggleCompleted = async (activity) => {
    setUpdatingId(activity.id);
    setActionError('');

    try {
      await api.patch(`/activities/${activity.id}`, {
        completed: !activity.completed,
      });

      await loadActivities({ refresh: true });
    } catch (err) {
      setActionError(
        err.response?.data?.message || 'Unable to update this activity.'
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const sortedActivities = [...activities].sort((a, b) => {
    const dateA = new Date(a.dueDate || a.createdAt || 0).getTime();
    const dateB = new Date(b.dueDate || b.createdAt || 0).getTime();

    return sortNewestFirst ? dateA - dateB : dateB - dateA;
  });

  const completedOnPage = activities.filter(
    (activity) => activity.completed
  ).length;

  const pendingOnPage = activities.filter(
    (activity) => !activity.completed
  ).length;

  const overdueOnPage = activities.filter((activity) => {
    if (activity.completed || !activity.dueDate) return false;
    return new Date(activity.dueDate).getTime() < Date.now();
  }).length;

  const hasFilters =
    Boolean(search || type) || completionFilter !== 'ALL';

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 pb-8">
      {/* Heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-slate-700">Activities</span>
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Activities
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Keep track of calls, meetings, emails, and follow-up tasks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadActivities({ refresh: true })}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
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
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <Plus size={18} />
            Add activity
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
            onClick={() => loadActivities()}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {actionError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
        >
          <AlertCircle size={18} className="shrink-0" />
          <span className="flex-1">{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError('')}
            aria-label="Dismiss error"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total activities"
          value={pagination.total}
          description="Activities matching current filters"
          icon={CalendarDays}
          iconClass="bg-indigo-50 text-indigo-600"
        />

        <MetricCard
          title="Pending"
          value={pendingOnPage}
          description="Pending on this page"
          icon={Clock}
          iconClass="bg-blue-50 text-blue-600"
        />

        <MetricCard
          title="Completed"
          value={completedOnPage}
          description="Completed on this page"
          icon={CheckCircle2}
          iconClass="bg-emerald-50 text-emerald-600"
        />

        <MetricCard
          title="Overdue"
          value={overdueOnPage}
          description="Overdue on this page"
          icon={AlertCircle}
          iconClass="bg-rose-50 text-rose-600"
        />
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
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
                placeholder="Search activity title or description..."
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

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <select
              value={type}
              onChange={(event) => {
                setType(event.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            >
              {TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={completionFilter}
              onChange={(event) => {
                setCompletionFilter(event.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            >
              <option value="ALL">All activity status</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
            </select>

            <button
              type="button"
              onClick={() => setSortNewestFirst((current) => !current)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <Filter size={15} />
              {sortNewestFirst ? 'Earliest due' : 'Latest due'}
            </button>
          </div>
        </div>

        {hasFilters && (
          <div className="mt-4 flex justify-end border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={() => {
                setSearchInput('');
                setSearch('');
                setType('');
                setCompletionFilter('ALL');
                setPage(1);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
            >
              <X size={15} />
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Activity list */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="font-semibold text-slate-900">All activities</h2>
            <p className="mt-1 text-xs text-slate-500">
              Your follow-ups and scheduled work.
            </p>
          </div>

          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {pagination.total} total
          </span>
        </div>

        {loading ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-slate-500">
            <RefreshCw size={24} className="animate-spin text-indigo-600" />
            <p className="text-sm">Loading activities...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
            <div className="rounded-2xl bg-indigo-50 p-4 text-indigo-600">
              <CalendarDays size={28} />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              {hasFilters ? 'No matching activities' : 'No activities yet'}
            </h3>

            <p className="mt-1 max-w-sm text-sm text-slate-500">
              {hasFilters
                ? 'Try changing your search or clearing the filters.'
                : 'Create an activity to keep track of calls, meetings, and tasks.'}
            </p>

            {hasFilters ? (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  setSearch('');
                  setType('');
                  setCompletionFilter('ALL');
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
                Create activity
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="divide-y divide-slate-100">
              {sortedActivities.map((activity) => {
                const isOverdue =
                  !activity.completed &&
                  activity.dueDate &&
                  new Date(activity.dueDate).getTime() < Date.now();

                return (
                  <article
                    key={activity.id}
                    className="flex flex-col gap-4 px-5 py-5 transition hover:bg-slate-50/70 sm:flex-row sm:items-start"
                  >
                    <button
                      type="button"
                      onClick={() => toggleCompleted(activity)}
                      disabled={updatingId === activity.id}
                      aria-label={
                        activity.completed
                          ? `Mark ${activity.title} as pending`
                          : `Mark ${activity.title} as completed`
                      }
                      title={
                        activity.completed
                          ? 'Mark as pending'
                          : 'Mark as completed'
                      }
                      className={`mt-0.5 shrink-0 rounded-full transition disabled:opacity-50 ${
                        activity.completed
                          ? 'text-emerald-600'
                          : 'text-slate-300 hover:text-indigo-600'
                      }`}
                    >
                      {updatingId === activity.id ? (
                        <RefreshCw size={21} className="animate-spin" />
                      ) : activity.completed ? (
                        <CheckCircle2 size={22} />
                      ) : (
                        <Circle size={22} />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3
                          className={`text-sm font-semibold ${
                            activity.completed
                              ? 'text-slate-400 line-through'
                              : 'text-slate-900'
                          }`}
                        >
                          {activity.title}
                        </h3>

                        <TypeBadge type={activity.type} />

                        {activity.completed && (
                          <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                            Completed
                          </span>
                        )}

                        {isOverdue && (
                          <span className="rounded-full bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700">
                            Overdue
                          </span>
                        )}
                      </div>

                      {activity.description && (
                        <p className="mt-2 max-w-3xl whitespace-pre-wrap text-sm leading-6 text-slate-500">
                          {activity.description}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
                        <span
                          className={`inline-flex items-center gap-1.5 ${
                            isOverdue ? 'font-semibold text-rose-600' : ''
                          }`}
                        >
                          <CalendarDays size={14} />
                          {formatDateTime(activity.dueDate) ||
                            formatDate(activity.createdAt)}
                        </span>

                        {activity.owner?.name && (
                          <span className="inline-flex items-center gap-1.5">
                            <UserRound size={14} />
                            {activity.owner.name}
                          </span>
                        )}

                        {activity.lead?.name && (
                          <span className="inline-flex items-center gap-1.5">
                            <ExternalLink size={14} />
                            Lead: {activity.lead.name}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 sm:ml-3">
                      <button
                        type="button"
                        onClick={() => openEditModal(activity)}
                        title="Edit activity"
                        aria-label={`Edit ${activity.title}`}
                        className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(activity)}
                        disabled={deletingId === activity.id}
                        title="Delete activity"
                        aria-label={`Delete ${activity.title}`}
                        className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                      >
                        {deletingId === activity.id ? (
                          <RefreshCw size={15} className="animate-spin" />
                        ) : (
                          <Trash2 size={15} />
                        )}
                      </button>
                    </div>
                  </article>
                );
              })}
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

      {modalOpen && (
        <ActivityModal
          activity={editingActivity}
          onClose={closeModal}
          onSaved={handleActivitySaved}
        />
      )}
    </div>
  );
}
