
import { useEffect, useState } from 'react';
import { X, LoaderCircle } from 'lucide-react';
import api from '../../services/api';

const ACTIVITY_TYPES = [
  { value: 'CALL', label: 'Call' },
  { value: 'MEETING', label: 'Meeting' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'TASK', label: 'Task' },
];

const initialForm = {
  title: '',
  description: '',
  type: 'TASK',
  dueDate: '',
  leadId: '',
};

function toDateTimeLocal(value) {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const localDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  );

  return localDate.toISOString().slice(0, 16);
}

export default function ActivityModal({
  activity,
  onClose,
  onSaved,
}) {
  const isEditing = Boolean(activity);

  const [form, setForm] = useState(initialForm);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!activity) return;

    setForm({
      title: activity.title || '',
      description: activity.description || '',
      type: activity.type || 'TASK',
      dueDate: toDateTimeLocal(activity.dueDate),
      leadId: activity.leadId || activity.lead?.id || '',
    });
  }, [activity]);

  useEffect(() => {
    let active = true;

    async function fetchLeads() {
      try {
        const response = await api.get('/leads', {
          params: { page: 1, limit: 100 },
        });

        if (active) {
          setLeads(response.data.data?.items || []);
        }
      } catch {
        if (active) setLeads([]);
      } finally {
        if (active) setLoadingLeads(false);
      }
    }

    fetchLeads();

    return () => {
      active = false;
    };
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!form.title.trim()) {
      setError('Activity title is required.');
      return;
    }

    setLoading(true);

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      type: form.type,
      dueDate: form.dueDate
        ? new Date(form.dueDate).toISOString()
        : null,
      leadId: form.leadId || null,
    };

    try {
      if (isEditing) {
        await api.patch(`/activities/${activity.id}`, payload);
      } else {
        await api.post('/activities', payload);
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Could not save the activity. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              {isEditing ? 'Edit activity' : 'Create activity'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Keep track of your next step with a lead.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close modal"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 px-6 py-6">
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="activity-title"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Activity title <span className="text-red-500">*</span>
              </label>
              <input
                id="activity-title"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                maxLength={150}
                placeholder="e.g. Follow up with potential client"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="activity-type"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Activity type
                </label>
                <select
                  id="activity-type"
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                >
                  {ACTIVITY_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="activity-due-date"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Due date
                </label>
                <input
                  id="activity-due-date"
                  name="dueDate"
                  type="datetime-local"
                  value={form.dueDate}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="activity-lead"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Related lead
              </label>
              <select
                id="activity-lead"
                name="leadId"
                value={form.leadId}
                onChange={handleChange}
                disabled={loadingLeads}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:bg-slate-50"
              >
                <option value="">
                  {loadingLeads ? 'Loading leads...' : 'No linked lead'}
                </option>
                {leads.map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.name}
                    {lead.company ? ` · ${lead.company}` : ''}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-slate-500">
                Link this activity to a lead if it is relevant.
              </p>
            </div>

            <div>
              <label
                htmlFor="activity-description"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Description
              </label>
              <textarea
                id="activity-description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                maxLength={2000}
                placeholder="Add notes, context, or a reminder..."
                className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && <LoaderCircle size={16} className="animate-spin" />}
              {loading
                ? 'Saving...'
                : isEditing
                  ? 'Save changes'
                  : 'Create activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
