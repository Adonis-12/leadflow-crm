
import { useCallback, useEffect, useState } from 'react';
import { Users, RefreshCw, Shield, UserRound, ChevronDown } from 'lucide-react';
import api from '../services/api';

export default function Team() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const loadMembers = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/users', {
        params: { page: 1, limit: 100 },
      });

      const data = response.data.data ?? response.data;
      setMembers(data.items ?? []);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Could not load team members.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  async function changeRole(member, role) {
    if (member.role === role) return;

    setUpdatingId(member.id);
    setError('');

    try {
      const response = await api.patch(`/users/${member.id}/role`, { role });
      const updatedMember = response.data.data ?? response.data;

      setMembers((current) =>
        current.map((item) =>
          item.id === member.id ? updatedMember : item
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update role.');
    } finally {
      setUpdatingId(null);
    }
  }

  const adminCount = members.filter((member) => member.role === 'ADMIN').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-indigo-400">WORKSPACE</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Team</h1>
          <p className="mt-2 text-slate-400">
            Manage team members and their access levels.
          </p>
        </div>

        <button
          onClick={loadMembers}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-800 px-4 py-2.5 text-sm hover:bg-slate-900 disabled:opacity-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Team members</p>
            <Users className="text-indigo-400" size={20} />
          </div>
          <p className="mt-3 text-3xl font-bold">{members.length}</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Administrators</p>
            <Shield className="text-emerald-400" size={20} />
          </div>
          <p className="mt-3 text-3xl font-bold">{adminCount}</p>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300"
        >
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        <div className="border-b border-slate-800 p-5">
          <h2 className="font-semibold">All members</h2>
          <p className="mt-1 text-sm text-slate-400">
            Change a member's role to update their access.
          </p>
        </div>

        {loading ? (
          <p className="p-10 text-center text-slate-400">Loading team...</p>
        ) : members.length === 0 ? (
          <p className="p-10 text-center text-slate-400">
            No team members found.
          </p>
        ) : (
          <div className="divide-y divide-slate-800">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-300">
                    <UserRound size={20} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-medium">{member.name}</p>
                    <p className="truncate text-sm text-slate-400">
                      {member.email}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Joined{' '}
                      {new Intl.DateTimeFormat('en-IN', {
                        dateStyle: 'medium',
                      }).format(new Date(member.createdAt))}
                    </p>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <span className="sr-only">Role for {member.name}</span>
                  <Shield size={15} />
                  <span className="relative">
                    <select
                      value={member.role}
                      disabled={updatingId === member.id}
                      onChange={(event) =>
                        changeRole(member, event.target.value)
                      }
                      className="appearance-none rounded-lg border border-slate-700 bg-slate-950 py-2 pl-3 pr-9 outline-none focus:border-indigo-500 disabled:opacity-50"
                    >
                      <option value="SALES_REP">Sales representative</option>
                      <option value="ADMIN">Administrator</option>
                    </select>
                    <ChevronDown
                      size={14}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
                    />
                  </span>
                  {updatingId === member.id && (
                    <span className="text-xs text-slate-500">Saving...</span>
                  )}
                </label>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
