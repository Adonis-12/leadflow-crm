
import { useEffect, useState } from 'react';
import {
  X,
  Handshake,
  FileText,
  Target,
  CircleDollarSign,
  CalendarDays,
  LoaderCircle,
  AlertCircle,
  Search,
  UserRound,
} from 'lucide-react';

import api from '../../services/api';

const INITIAL_FORM = {
  title: '',
  value: '',
  stage: 'QUALIFICATION',
  leadId: '',
  expectedCloseDate: '',
  notes: '',
};

const STAGES = [
  { value: 'QUALIFICATION', label: 'Qualification' },
  { value: 'PROPOSAL', label: 'Proposal' },
  { value: 'NEGOTIATION', label: 'Negotiation' },
  { value: 'WON', label: 'Won' },
  { value: 'LOST', label: 'Lost' },
];

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50';

function Field({ label, icon: Icon, required = false, children }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        {Icon && <Icon size={15} className="text-slate-400" />}
        {label}
        {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function dateForInput(value) {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

export default function DealModal({ deal, onClose, onSaved }) {
  const isEditing = Boolean(deal);

  const [form, setForm] = useState(INITIAL_FORM);
  const [leads, setLeads] = useState([]);
  const [leadSearch, setLeadSearch] = useState('');
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!deal) {
      setForm(INITIAL_FORM);
      return;
    }

    setForm({
      title: deal.title ?? '',
      value: deal.value == null ? '' : String(deal.value),
      stage: deal.stage ?? 'QUALIFICATION',
      leadId: deal.lead?.id ?? deal.leadId ?? '',
      expectedCloseDate: dateForInput(deal.expectedCloseDate),
      notes: deal.notes ?? '',
    });
  }, [deal]);

  useEffect(() => {
    let active = true;

    async function loadLeads() {
      setLoadingLeads(true);

      try {
        const response = await api.get('/leads', {
          params: { page: 1, limit: 100 },
        });

        if (!active) return;

        const data = response.data?.data ?? response.data;
        const items = Array.isArray(data?.items) ? data.items : [];

        // Keep the currently linked lead available while editing.
        if (deal?.lead && !items.some((item) => item.id === deal.lead.id)) {
          items.unshift(deal.lead);
        }

        setLeads(items);
      } catch {
        if (active) {
          setError('Could not load leads. Check your connection and retry.');
        }
      } finally {
        if (active) setLoadingLeads(false);
      }
    }

    loadLeads();

    return () => {
      active = false;
    };
  }, [deal]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !saving) {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, saving]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const filteredLeads = leads.filter((lead) => {
    const term = leadSearch.trim().toLowerCase();

    if (!term) return true;

    return [lead.name, lead.company, lead.email]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(term));
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.title.trim()) {
      setError('Deal title is required.');
      return;
    }

    if (!form.leadId) {
      setError('Please select a lead for this deal.');
      return;
    }

    const value = form.value.trim() === '' ? 0 : Number(form.value);

    if (!Number.isFinite(value) || value < 0) {
      setError('Enter a valid, non-negative deal value.');
      return;
    }

    const payload = {
      title: form.title.trim(),
      value,
      stage: form.stage,
      leadId: form.leadId,
      expectedCloseDate: form.expectedCloseDate || null,
      notes: form.notes.trim() || null,
    };

    setSaving(true);

    try {
      if (isEditing) {
        await api.patch(`/deals/${deal.id}`, payload);
      } else {
        await api.post('/deals', payload);
      }

      await onSaved?.();
    } catch (err) {
      const responseData = err.response?.data;

      const validationMessage = Array.isArray(responseData?.errors)
        ? responseData.errors
            .map((item) => item.message || item.msg)
            .filter(Boolean)
            .join(' ')
        : '';

      setError(
        validationMessage ||
          responseData?.message ||
          `Could not ${isEditing ? 'update' : 'create'} the deal.`
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) {
          onClose?.();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="deal-modal-title"
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-7">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
              <Handshake size={21} />
            </div>

            <div>
              <h2
                id="deal-modal-title"
                className="text-lg font-bold text-slate-900"
              >
                {isEditing ? 'Edit deal' : 'Create a deal'}
              </h2>

              <p className="mt-0.5 text-sm text-slate-500">
                {isEditing
                  ? 'Update the details of this opportunity.'
                  : 'Add a new opportunity to your pipeline.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close modal"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </header>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div className="space-y-5 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-700"
              >
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Field label="Deal title" icon={Target} required>
              <input
                autoFocus
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Website redesign contract"
                maxLength={200}
                required
                className={inputClass}
              />
            </Field>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Deal value (INR)" icon={CircleDollarSign}>
                <input
                  type="number"
                  name="value"
                  value={form.value}
                  onChange={handleChange}
                  placeholder="50000"
                  min="0"
                  step="0.01"
                  className={inputClass}
                />
              </Field>

              <Field label="Deal stage">
                <select
                  name="stage"
                  value={form.stage}
                  onChange={handleChange}
                  className={inputClass}
                >
                  {STAGES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Linked lead" icon={UserRound} required>
              <div className="relative">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="search"
                  value={leadSearch}
                  onChange={(event) => setLeadSearch(event.target.value)}
                  placeholder="Find a lead by name, email, or company..."
                  className={`${inputClass} pl-9`}
                />
              </div>

              <select
                name="leadId"
                value={form.leadId}
                onChange={handleChange}
                disabled={loadingLeads}
                required
                className={`${inputClass} mt-2`}
              >
                <option value="">
                  {loadingLeads ? 'Loading leads...' : 'Select a lead'}
                </option>

                {filteredLeads.map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.name}
                    {lead.company ? ` · ${lead.company}` : ''}
                  </option>
                ))}
              </select>

              {!loadingLeads && leads.length === 0 && (
                <p className="mt-1.5 text-xs text-amber-700">
                  No accessible leads found. Create a lead first.
                </p>
              )}
            </Field>

            <Field label="Expected close date" icon={CalendarDays}>
              <input
                type="date"
                name="expectedCloseDate"
                value={form.expectedCloseDate}
                onChange={handleChange}
                className={inputClass}
              />
            </Field>

            <Field label="Notes" icon={FileText}>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Scope, requirements, next steps..."
                rows={4}
                maxLength={5000}
                className={`${inputClass} resize-y`}
              />

              <p className="mt-1 text-right text-xs text-slate-400">
                {form.notes.length}/5000
              </p>
            </Field>
          </div>

          <footer className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || loadingLeads || leads.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && <LoaderCircle size={17} className="animate-spin" />}
              {saving
                ? 'Saving...'
                : isEditing
                  ? 'Save changes'
                  : 'Create deal'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
