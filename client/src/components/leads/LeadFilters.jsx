
import { Search, Plus, SlidersHorizontal } from 'lucide-react';

const statuses = [
  'ALL',
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'CONVERTED',
  'LOST',
];

export default function LeadFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  onAdd,
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row">
        <div className="relative sm:max-w-sm sm:flex-1">
          <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search leads..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 pl-10 pr-4 text-sm outline-none placeholder:text-slate-500 focus:border-indigo-500"
          />
        </div>

        <div className="relative">
          <SlidersHorizontal size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={status}
            onChange={(event) => onStatusChange(event.target.value)}
            className="w-full appearance-none rounded-xl border border-slate-800 bg-slate-900 py-2.5 pl-9 pr-8 text-sm outline-none focus:border-indigo-500 sm:w-auto"
          >
            {statuses.map((item) => (
              <option key={item} value={item}>
                {item === 'ALL' ? 'All statuses' : item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={onAdd}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400"
      >
        <Plus size={17} />
        Add lead
      </button>
    </div>
  );
}
