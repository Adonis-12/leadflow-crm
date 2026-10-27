
import { useEffect, useState } from 'react';
import {
  X,
  UserRound,
  Mail,
  Phone,
  Building2,
  Globe,
  FileText,
  UserCheck,
  LoaderCircle,
  AlertCircle,
} from 'lucide-react';

import api from '../../services/api';

const initialForm = {
  name: '',
  email: '',
  phone: '',
  company: '',
  source: '',
  status: 'NEW',
  notes: '',
  assignedToId: '',
};

const STATUS_OPTIONS = [
  { value: 'NEW', label: 'New' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'QUALIFIED', label: 'Qualified' },
  { value: 'CONVERTED', label: 'Converted' },
  { value: 'LOST', label: 'Lost' },
];

const SOURCE_OPTIONS = [
  'Website',
  'Referral',
  'LinkedIn',
  'Cold Call',
  'Email Campaign',
  'Advertisement',
  'Event',
  'Other',
];

function Field({ label, icon: Icon, children, required = false }) {
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

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50';

export default function LeadModal({ lead, onClose, onSaved }) {
  const isEditing = Boolean(lead);

  const [form, setForm] = useState(initialForm);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [userLoadError, setUserLoadError] = useState('');

  useEffect(() => {
    if (lead) {
      setForm({
        name: lead.name ?? '',
        email: lead.email ?? '',
        phone: lead.phone ?? '',
        company: lead.company ?? '',
        source: lead.source ?? '',
        status: lead.status ?? 'NEW',
        notes: lead.notes ?? '',
        assignedToId: lead.assignedToId ?? '',
      });
    } else {
      setForm(initialForm);
    }
  }, [lead]);

  useEffect(() => {
    let active = true;

    async function loadUsers() {
      setLoadingUsers(true);
      setUserLoadError('');

      try {
        const response = await api.get('/users', {
          params: { page: 1, limit: 100 },
        });

        if (!active) return;

        const data = response.data?.data ?? response.data;
        setUsers(Array.isArray(data?.items) ? data.items : []);
      } catch (err) {
        if (!active) return;

        // Non-admin users may not have permission to list all users.
        setUsers([]);
        setUserLoadError(
          err.response?.data?.message ||
            'Assignee list is unavailable. You can still save the lead.'
        );
      } finally {
        if (active) setLoadingUsers(false);
      }
    }

    loadUsers();

    return () => {
      active = false;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('Lead name is required.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      company: form.company.trim() || null,
      source: form.source || null,
      status: form.status,
      notes: form.notes.trim() || null,
    };

    // Only send assignment when creating or when the admin selected a user.
    // The backend rejects assignment changes from non-admin users.
    if (form.assignedToId) {
      payload.assignedToId = form.assignedToId;
    } else if (isEditing && lead.assignedToId) {
      payload.assignedToId = null;
    }

    setSaving(true);

    try {
      if (isEditing) {
        await api.patch(`/leads/${lead.id}`, payload);
      } else {
        await api.post('/leads', payload);
      }

      await onSaved?.();
    } catch (err) {
      const responseData = err.response?.data;

      const validationMessage = Array.isArray(responseData?.errors)
        ? responseData.errors
            .map((item) => item.message)
            .filter(Boolean)
            .join(' ')
        : '';

      setError(
        validationMessage ||
          responseData?.message ||
          `Unable to ${isEditing ? 'update' : 'create'} lead. Please try again.`
      );
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !saving) {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, saving]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) {
          onClose?.();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-modal-title"
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4 sm:px-7 sm:py-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
                <UserRound size={20} />
              </div>

              <div>
                <h2
                  id="lead-modal-title"
                  className="text-lg font-bold text-slate-900"
                >
                  {isEditing ? 'Edit lead' : 'Create a lead'}
                </h2>

                <p className="mt-0.5 text-sm text-slate-500">
                  {isEditing
                    ? 'Update the prospect information below.'
                    : 'Add a new prospect to your sales pipeline.'}
                </p>
              </div>
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
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div className="overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
            {error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-700"
              >
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Full name" icon={UserRound} required>
                  <input
                    autoFocus
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Rahul Sharma"
                    maxLength={120}
                    required
                    className={inputClass}
                  />
                </Field>
              </div>

              <Field label="Email address" icon={Mail}>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="rahul@company.com"
                  maxLength={254}
                  className={inputClass}
                />
              </Field>

              <Field label="Phone number" icon={Phone}>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  maxLength={30}
                  className={inputClass}
                />
              </Field>

              <Field label="Company" icon={Building2}>
                <input
                  type="text"
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="Company name"
                  maxLength={150}
                  className={inputClass}
                />
              </Field>

              <Field label="Lead source" icon={Globe}>
                <select
                  name="source"
                  value={form.source}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select source</option>
                  {SOURCE_OPTIONS.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Status">
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className={inputClass}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="sm:col-span-2">
                <Field label="Assign to" icon={UserCheck}>
                  <select
                    name="assignedToId"
                    value={form.assignedToId}
                    onChange={handleChange}
                    disabled={loadingUsers || users.length === 0}
                    className={inputClass}
                  >
                    <option value="">
                      {loadingUsers
                        ? 'Loading users...'
                        : 'Use default assignment'}
                    </option>

                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>

                  {userLoadError && (
                    <p className="mt-1.5 text-xs text-amber-700">
                      {userLoadError}
                    </p>
                  )}

                  <p className="mt-1.5 text-xs text-slate-400">
                    Assignment changes may be restricted by your role.
                  </p>
                </Field>
              </div>

              <div className="sm:col-span-2">
                <Field label="Notes" icon={FileText}>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="Add context, requirements, or the next step..."
                    rows={4}
                    maxLength={5000}
                    className={`${inputClass} resize-y`}
                  />

                  <p className="mt-1 text-right text-xs text-slate-400">
                    {form.notes.length}/5000
                  </p>
                </Field>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
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
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && <LoaderCircle size={17} className="animate-spin" />}
              {saving
                ? 'Saving...'
                : isEditing
                  ? 'Save changes'
                  : 'Create lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
