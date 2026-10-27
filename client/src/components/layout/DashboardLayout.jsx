
import { useState } from 'react';
import api, { clearAccessToken } from '../../services/api';
import {
  Activity,
  ArrowUpRight,
  Bell,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  ChevronDown,
  ContactRound,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  Users,
  X,
  Zap,
} from 'lucide-react';
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom';

const navItems = [
  { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Leads', path: '/leads', icon: ContactRound },
  { name: 'Deals', path: '/deals', icon: BriefcaseBusiness },
  { name: 'Activities', path: '/activities', icon: Activity },
  { name: 'Analytics', path: '/dashboard', icon: ChartNoAxesCombined },
  { name: 'Team', path: '/team', icon: Users },
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  let user = {};

  try {
    user = JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    user = {};
  }

  const currentPage =
    navItems.find(
      (item) =>
        item.path === location.pathname &&
        item.name !== 'Analytics'
    )?.name || 'Overview';

async function handleLogout() {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout request failed:', error);
  } finally {
    clearAccessToken();
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  }
}

  function closeSidebar() {
    setSidebarOpen(false);
  }

  const visibleNavItems = navItems.filter(
    (item) => item.name !== 'Team' || user.role === 'ADMIN'
  );

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-900">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-slate-200 bg-white transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex h-[76px] items-center justify-between border-b border-slate-100 px-6">
          <Link
            to="/dashboard"
            onClick={closeSidebar}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-200">
              <Zap size={21} fill="currentColor" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Lead<span className="text-blue-600">Flow</span>
            </span>
          </Link>

          <button
            type="button"
            onClick={closeSidebar}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={19} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-7">
          <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Workspace
          </p>

          <nav className="space-y-1.5">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const active =
                item.name === 'Analytics'
                  ? false
                  : location.pathname === item.path;

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={closeSidebar}
                  className={`group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm transition ${
                    active
                      ? 'bg-blue-50 font-semibold text-blue-700'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon
                    size={19}
                    strokeWidth={active ? 2.2 : 1.8}
                    className={
                      active
                        ? 'text-blue-600'
                        : 'text-slate-400 group-hover:text-slate-600'
                    }
                  />
                  <span className="flex-1">{item.name}</span>
                  {active && (
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                  )}
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-9">
            <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Preferences
            </p>

            <Link
              to="/settings"
              onClick={closeSidebar}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm transition ${
                location.pathname === '/settings'
                  ? 'bg-blue-50 font-semibold text-blue-700'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Settings size={19} className="text-slate-400" />
              Settings
            </Link>
          </div>
        </div>

        <div className="border-t border-slate-100 p-4">
          <div className="mb-4 rounded-2xl bg-gradient-to-br from-blue-50 to-violet-50 p-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-white p-2 text-blue-600 shadow-sm">
                <ShieldCheck size={17} />
              </div>
              <p className="text-xs font-semibold text-slate-800">
                Your sales, organized
              </p>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Keep your pipeline moving and every follow-up on track.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-xl px-2 py-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
              {(user.name || user.email || 'U').charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800">
                {user.name || 'CRM User'}
              </p>
              <p className="truncate text-xs text-slate-500">
                {user.email || 'Signed in'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Log out"
              aria-label="Log out"
              className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-[260px]">
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-7 lg:px-9">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <LayoutDashboard size={14} />
                <span>Workspace</span>
                <span>/</span>
                <span className="truncate font-medium text-slate-700">
                  {currentPage}
                </span>
              </div>
              <p className="mt-1 hidden text-[11px] text-slate-400 sm:block">
                Welcome to your LeadFlow workspace
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {searchOpen && (
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  const query = new FormData(event.currentTarget)
                    .get('search')
                    ?.toString()
                    .trim();

                  if (query) {
                    navigate(`/leads?search=${encodeURIComponent(query)}`);
                    setSearchOpen(false);
                  }
                }}
                className="absolute left-3 right-3 top-[82px] flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-lg sm:static sm:w-56 sm:shadow-none"
              >
                <Search size={17} className="ml-2 text-slate-400" />
                <input
                  name="search"
                  autoFocus
                  placeholder="Search leads..."
                  className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-slate-400"
                />
              </form>
            )}

            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search leads"
              className="rounded-xl border border-slate-200 p-2.5 text-slate-500 transition hover:bg-slate-50 hover:text-blue-600"
            >
              {searchOpen ? <X size={18} /> : <Search size={18} />}
            </button>

            <button
              type="button"
              title="Notifications"
              aria-label="Notifications"
              className="relative rounded-xl border border-slate-200 p-2.5 text-slate-500 transition hover:bg-slate-50 hover:text-blue-600"
            >
              <Bell size={18} />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-blue-500 ring-2 ring-white" />
            </button>

            <div className="hidden h-8 w-px bg-slate-200 sm:block" />

            <div className="hidden items-center gap-2 sm:flex">
              <div className="text-right">
                <p className="max-w-32 truncate text-xs font-semibold text-slate-800">
                  {user.name || 'CRM User'}
                </p>
                <p className="text-[10px] text-slate-400">
                  {user.role === 'ADMIN' ? 'Administrator' : 'Sales workspace'}
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-violet-100 text-sm font-bold text-blue-700">
                {(user.name || 'U').charAt(0).toUpperCase()}
              </div>
              <ChevronDown size={15} className="text-slate-400" />
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-76px)] px-4 py-6 sm:px-7 sm:py-8 lg:px-9 lg:py-9">
          <div className="mx-auto w-full max-w-[1500px]">
            <Outlet />
          </div>

          <footer className="mx-auto mt-10 flex max-w-[1500px] flex-col justify-between gap-2 border-t border-slate-200/80 pt-5 text-xs text-slate-400 sm:flex-row">
            <span>© {new Date().getFullYear()} LeadFlow CRM</span>
            <span className="inline-flex items-center gap-1">
              Built for clearer sales workflows <ArrowUpRight size={12} />
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
