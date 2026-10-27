
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChartNoAxesCombined,
  CircleDollarSign,
  ContactRound,
  Layers3,
  Menu,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: ContactRound,
    title: 'Lead management',
    description:
      'Capture, organize, and track every prospect from first contact to conversion.',
    color: 'bg-blue-100 text-blue-700',
  },
  {
    icon: ChartNoAxesCombined,
    title: 'Sales analytics',
    description:
      'Understand your pipeline, monitor conversions, and make smarter decisions.',
    color: 'bg-emerald-100 text-emerald-700',
  },
  {
    icon: Layers3,
    title: 'Deal pipeline',
    description:
      'Keep every opportunity moving through a clear, organized sales process.',
    color: 'bg-violet-100 text-violet-700',
  },
  {
    icon: Users,
    title: 'Team workspace',
    description:
      'Manage team members and access levels from one central workspace.',
    color: 'bg-amber-100 text-amber-700',
  },
];

const pipeline = [
  { label: 'Qualification', value: 76, color: 'bg-blue-500' },
  { label: 'Proposal', value: 55, color: 'bg-violet-500' },
  { label: 'Negotiation', value: 38, color: 'bg-amber-400' },
  { label: 'Won', value: 27, color: 'bg-emerald-500' },
];

function DashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-5xl">
      <div className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-br from-blue-200/60 via-violet-100/60 to-emerald-100/60 blur-2xl" />

      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-300/50 sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Zap size={17} fill="currentColor" />
            </div>
            <span className="font-bold tracking-tight text-slate-900">
              LeadFlow
            </span>
          </div>
          <span className="hidden text-xs text-slate-400 sm:block">
            SALES WORKSPACE / OVERVIEW
          </span>
          <div className="h-8 w-8 rounded-full bg-blue-100 text-center text-xs font-bold leading-8 text-blue-700">
            LF
          </div>
        </div>

        <div className="grid min-h-[360px] grid-cols-1 sm:grid-cols-[145px_1fr]">
          <aside className="hidden border-r border-slate-100 bg-slate-50/80 p-4 sm:block">
            <p className="mb-4 text-[10px] font-semibold tracking-[0.16em] text-slate-400">
              WORKSPACE
            </p>
            {[
              ['Overview', true],
              ['Leads', false],
              ['Deals', false],
              ['Activities', false],
              ['Analytics', false],
            ].map(([label, active]) => (
              <div
                key={label}
                className={`mb-2 rounded-lg px-3 py-2 text-xs ${
                  active
                    ? 'bg-blue-100 font-semibold text-blue-700'
                    : 'text-slate-500'
                }`}
              >
                {label}
              </div>
            ))}
          </aside>

          <div className="min-w-0 p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs text-slate-400">Tuesday, your next move</p>
                <h3 className="mt-1 text-lg font-bold text-slate-900 sm:text-xl">
                  Sales overview
                </h3>
              </div>
              <span className="rounded-lg border border-slate-200 px-3 py-2 text-[10px] text-slate-500">
                Last 30 days
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                { label: 'Total leads', value: '248', change: '+12.8%', icon: Users },
                { label: 'Open deals', value: '36', change: '+8.4%', icon: Target },
                { label: 'Won revenue', value: '₹4.8L', change: '+18.2%', icon: CircleDollarSign },
                { label: 'Conversions', value: '24.6%', change: '+4.2%', icon: ChartNoAxesCombined },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-slate-100 bg-white p-3 sm:p-4"
                >
                  <stat.icon size={16} className="text-blue-600" />
                  <p className="mt-3 text-[10px] text-slate-400">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-lg font-bold text-slate-900 sm:text-xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[10px] font-medium text-emerald-600">
                    {stat.change} <span className="text-slate-400">vs. last month</span>
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
              <div className="rounded-xl border border-slate-100 p-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-slate-800">
                    Deal pipeline
                  </h4>
                  <ArrowUpRight size={15} className="text-slate-400" />
                </div>
                <div className="mt-5 space-y-4">
                  {pipeline.map((item) => (
                    <div key={item.label}>
                      <div className="mb-1.5 flex justify-between text-[10px]">
                        <span className="text-slate-500">{item.label}</span>
                        <span className="font-medium text-slate-700">
                          {item.value}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${item.color}`}
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 p-4">
                <h4 className="text-xs font-semibold text-slate-800">
                  Recent activity
                </h4>
                <div className="mt-4 space-y-4">
                  {[
                    ['New lead added', 'Just now', 'bg-blue-100 text-blue-600'],
                    ['Deal moved to proposal', '2 hours ago', 'bg-violet-100 text-violet-600'],
                    ['Follow-up completed', 'Yesterday', 'bg-emerald-100 text-emerald-600'],
                  ].map(([title, time, style]) => (
                    <div key={title} className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${style}`}>
                        <CheckCircle2 size={15} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[10px] font-medium text-slate-700">
                          {title}
                        </p>
                        <p className="mt-1 text-[10px] text-slate-400">{time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p className="mt-4 text-center text-[10px] text-slate-400">
              Illustrative preview · Your actual workspace uses live CRM data
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-hidden bg-white text-slate-900">
      <header className="relative z-20 border-b border-slate-100 bg-white/90 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200">
              <Zap size={21} fill="currentColor" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Lead<span className="text-blue-600">Flow</span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-slate-600 hover:text-blue-600">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-slate-600 hover:text-blue-600">
              How it works
            </a>
            <Link to="/login" className="text-sm font-medium text-slate-700 hover:text-blue-600">
              Log in
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
            >
              Get started <ArrowRight size={16} />
            </Link>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg border border-slate-200 p-2 md:hidden"
            aria-label="Toggle navigation"
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </nav>

        {menuOpen && (
          <div className="space-y-1 border-t border-slate-100 bg-white p-4 md:hidden">
            <a href="#features" onClick={() => setMenuOpen(false)} className="block rounded-lg p-3 text-sm hover:bg-slate-50">
              Features
            </a>
            <a href="#how-it-works" onClick={() => setMenuOpen(false)} className="block rounded-lg p-3 text-sm hover:bg-slate-50">
              How it works
            </a>
            <Link to="/login" className="block rounded-lg p-3 text-sm hover:bg-slate-50">
              Log in
            </Link>
            <Link to="/register" className="block rounded-lg bg-blue-600 p-3 text-sm font-semibold text-white">
              Get started
            </Link>
          </div>
        )}
      </header>

      <main>
        <section className="relative px-5 pb-16 pt-16 sm:pb-24 sm:pt-24 lg:px-8">
          <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
            <div className="absolute left-1/2 top-0 h-[450px] w-[850px] -translate-x-1/2 rounded-full bg-blue-100/60 blur-[100px]" />
            <div className="absolute right-0 top-40 h-72 w-72 rounded-full bg-violet-100/50 blur-[90px]" />
            <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-emerald-100/40 blur-[90px]" />
          </div>

          <div className="relative mx-auto max-w-5xl text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-4 py-2 text-xs font-medium text-blue-700 shadow-sm">
              <Sparkles size={14} />
              A clearer way to manage your sales
              <ArrowUpRight size={13} />
            </div>

            <h1 className="mx-auto mt-7 max-w-4xl text-4xl font-semibold leading-[1.12] tracking-[-0.045em] text-slate-950 sm:text-6xl lg:text-7xl">
              Your business moves fast.
              <span className="mt-2 block bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-500 bg-clip-text text-transparent">
                Your CRM should too.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              Manage leads, move deals forward, stay on top of follow-ups,
              and see your entire sales pipeline in one beautifully organized workspace.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700"
              >
                Get started <ArrowRight size={17} />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white"
              >
                Explore features <ArrowUpRight size={16} />
              </a>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Check size={14} className="text-emerald-600" />
                Lead tracking
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check size={14} className="text-emerald-600" />
                Deal management
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check size={14} className="text-emerald-600" />
                Sales analytics
              </span>
            </div>
          </div>

          <div className="relative mx-auto mt-14 max-w-6xl sm:mt-20">
            <DashboardPreview />
          </div>
        </section>

        <section id="features" className="border-y border-slate-100 bg-slate-50/70 px-5 py-20 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                Everything in one place
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Less busywork.
                <span className="block text-slate-400">More meaningful progress.</span>
              </h2>
              <p className="mt-5 max-w-xl leading-7 text-slate-600">
                All the essentials your team needs to keep customer relationships
                organized and sales opportunities moving.
              </p>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <article
                  key={feature.title}
                  className="group rounded-2xl border border-slate-200/80 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/50"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${feature.color}`}>
                    <feature.icon size={22} />
                  </div>
                  <p className="mt-7 text-xs font-medium text-slate-400">
                    0{index + 1}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="px-5 py-20 sm:py-24 lg:px-8">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                Built for clarity
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                The whole sales picture.
                <span className="block text-slate-400">Without the chaos.</span>
              </h2>
              <p className="mt-5 max-w-xl leading-7 text-slate-600">
                Keep your customer information, sales opportunities, follow-ups,
                and performance metrics connected in one workspace.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  'Track leads from first contact to conversion',
                  'Keep every deal organized by sales stage',
                  'Manage follow-ups before they slip through the cracks',
                  'Use role-based access to organize your team',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-slate-700">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <Check size={12} />
                    </span>
                    {item}
                  </div>
                ))}
              </div>

              <Link
                to="/register"
                className="mt-9 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-600"
              >
                Build your workflow <ArrowRight size={16} />
              </Link>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-blue-100 via-violet-100 to-emerald-100 blur-2xl opacity-80" />
              <div className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">YOUR WORKSPACE</p>
                    <h3 className="mt-1 text-xl font-semibold text-slate-900">
                      Stay in control
                    </h3>
                  </div>
                  <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
                    <ShieldCheck size={22} />
                  </div>
                </div>

                <div className="mt-7 space-y-3">
                  {[
                    { title: 'Leads', detail: 'One place for every prospect', icon: ContactRound, color: 'bg-blue-100 text-blue-700' },
                    { title: 'Deals', detail: 'A clearer sales pipeline', icon: Target, color: 'bg-violet-100 text-violet-700' },
                    { title: 'Activities', detail: 'Calls, tasks, and follow-ups', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700' },
                    { title: 'Analytics', detail: 'Insights into sales performance', icon: ChartNoAxesCombined, color: 'bg-amber-100 text-amber-700' },
                  ].map((item) => (
                    <div key={item.title} className="flex items-center gap-4 rounded-2xl border border-slate-100 p-4">
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${item.color}`}>
                        <item.icon size={20} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-slate-900">{item.title}</h4>
                        <p className="mt-1 text-xs text-slate-500">{item.detail}</p>
                      </div>
                      <CheckCircle2 size={17} className="text-emerald-500" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 pb-20 lg:px-8">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-slate-950 px-6 py-12 text-center sm:px-12 sm:py-16">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-blue-300">
              <Zap size={23} fill="currentColor" />
            </div>
            <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              Ready to bring your sales into focus?
            </h2>
            <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-400">
              Give your leads, deals, and team a workspace that keeps everything moving.
            </p>
            <Link
              to="/register"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-blue-100"
            >
              Get started <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-100 px-5 py-7 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-slate-500 sm:flex-row">
          <Link to="/" className="flex items-center gap-2 font-bold text-slate-800">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Zap size={15} fill="currentColor" />
            </span>
            LeadFlow
          </Link>
          <p>Sales clarity starts here.</p>
          <div className="flex gap-5">
            <Link to="/login" className="hover:text-blue-600">Log in</Link>
            <Link to="/register" className="hover:text-blue-600">Get started</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
