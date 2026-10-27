
import { Building2, Mail, Phone, Pencil, Trash2 } from 'lucide-react';

const statusStyles = {
  NEW: 'bg-blue-500/10 text-blue-400',
  CONTACTED: 'bg-amber-500/10 text-amber-400',
  QUALIFIED: 'bg-violet-500/10 text-violet-400',
  CONVERTED: 'bg-emerald-500/10 text-emerald-400',
  LOST: 'bg-red-500/10 text-red-400',
};

export default function LeadsTable({ leads, loading, onEdit, onDelete }) {
  if (loading) {
    return <div className="p-10 text-center text-slate-400">Loading leads...</div>;
  }

  if (!leads.length) {
    return (
      <div className="p-12 text-center">
        <p className="font-medium">No leads found</p>
        <p className="mt-2 text-sm text-slate-400">
          Try changing your search or add your first lead.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-800 bg-slate-950/50 text-xs uppercase tracking-wider text-slate-500">
          <tr>
            <th className="px-5 py-4 font-medium">Lead</th>
            <th className="px-5 py-4 font-medium">Company</th>
            <th className="px-5 py-4 font-medium">Status</th>
            <th className="px-5 py-4 font-medium">Assigned to</th>
            <th className="px-5 py-4 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {leads.map((lead) => (
            <tr key={lead.id} className="hover:bg-slate-800/40">
              <td className="px-5 py-4">
                <div className="font-medium text-white">{lead.name}</div>
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                  <Mail size={12} />
                  {lead.email || 'No email'}
                </div>
                {lead.phone && (
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                    <Phone size={12} />
                    {lead.phone}
                  </div>
                )}
              </td>
              <td className="px-5 py-4 text-slate-300">
                <span className="flex items-center gap-2">
                  <Building2 size={15} className="text-slate-500" />
                  {lead.company || '—'}
                </span>
              </td>
              <td className="px-5 py-4">
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[lead.status] || statusStyles.NEW}`}>
                  {lead.status}
                </span>
              </td>
              <td className="px-5 py-4 text-slate-400">
                {lead.assignedTo?.name || 'Unassigned'}
              </td>
              <td className="px-5 py-4">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEdit(lead)}
                    aria-label={`Edit ${lead.name}`}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-700 hover:text-white"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(lead)}
                    aria-label={`Delete ${lead.name}`}
                    className="rounded-lg p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
