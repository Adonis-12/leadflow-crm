
import { useCallback, useEffect, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  ContactRound,
  RefreshCw,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const money = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const number = (value) =>
  new Intl.NumberFormat('en-IN').format(Number(value) || 0);

const leadColors = {
  NEW: 'bg-blue-500',
  CONTACTED: 'bg-violet-500',
  QUALIFIED: 'bg-emerald-500',
  CONVERTED: 'bg-teal-500',
  LOST: 'bg-rose-400',
};

const stageColors = {
  QUALIFICATION: 'bg-blue-500',
  PROPOSAL: 'bg-violet-500',
  NEGOTIATION: 'bg-amber-400',
  WON: 'bg-emerald-500',
  LOST: 'bg-rose-400',
};

const leadNames = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  QUALIFIED: 'Qualified',
  CONVERTED: 'Converted',
  LOST: 'Lost',
};

const stageNames = {
  QUALIFICATION: 'Qualification',
  PROPOSAL: 'Proposal',
  NEGOTIATION: 'Negotiation',
  WON: 'Won',
  LOST: 'Lost',
};

function MetricCard({ title, value, subtitle, icon: Icon, tone, to }) {
  const content = (
    <div className="h-full rounded-2xl border border-slate-200/80 bg-white p-5 transition hover:border-blue-200 hover:shadow-lg hover:shadow-slate-200/40 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-3 break-words text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {value}
          </p>
        </div>
        <div className={`rounded-xl p-3 ${tone}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="mt-4 text-xs leading-5 text-slate-500">{subtitle}</p>
    </div>
  );

  return to ? <Link to={to} className="block h-full">{content}</Link> : content;
}

function SectionCard({ title, subtitle, action, children }) {
  return (
    <section className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-slate-900">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-xs leading-5 text-slate-500">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex min-h-36 flex-col items-center justify-center text-center">
      <div className="rounded-xl bg-slate-100 p-3 text-slate-400">
        <Target size={21} />
      </div>
      <p className="mt-3 text-sm text-slate-500">{message}</p>
    </div>
  );
}

export default function Overview() {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const results = await Promise.allSettled([
        api.get('/analytics/dashboard'),
        api.get('/activities', {
          params: { page: 1, limit: 5, completed: false },
        }),
      ]);

      if (results[0].status === 'rejected') {
        throw results[0].reason;
      }

      const response = results[0].value;
      const data = response.data.data ?? response.data;

      // Analytics API returns:
      // { summary: {...}, dealsByStage: [...], leadsByStatus: [...] }
      setStats(data);

      if (results[1].status === 'fulfilled') {
        const activityResponse = results[1].value;
        const activityData =
          activityResponse.data.data ?? activityResponse.data;

        setActivities(activityData.items ?? []);
      } else {
        setActivities([]);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to load dashboard analytics.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  let user = {};
  try {
    user = JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    user = {};
  }

  if (loading && !stats) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <RefreshCw size={18} className="animate-spin text-blue-600" />
          Loading your workspace...
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-white p-8">
        <p className="font-semibold text-slate-900">Dashboard unavailable</p>
        <p className="mt-2 text-sm text-slate-500">{error}</p>
        <button
          onClick={loadDashboard}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <RefreshCw size={15} /> Try again
        </button>
      </div>
    );
  }

  // Read the summary fields returned by your backend.
  const summary = stats?.summary ?? {};

  const totalLeads = Number(summary.totalLeads) || 0;
  const newLeads = Number(summary.newLeads) || 0;
  const qualifiedLeads = Number(summary.qualifiedLeads) || 0;
  const convertedLeads = Number(summary.convertedLeads) || 0;
  const totalDeals = Number(summary.totalDeals) || 0;
  const activeDeals = Number(summary.activeDeals) || 0;
  const wonDeals = Number(summary.wonDeals) || 0;
  const lostDeals = Number(summary.lostDeals) || 0;
  const wonRevenue = Number(summary.wonRevenue) || 0;
  const conversionRate = Number(summary.conversionRate) || 0;

  // Grouped records already return `count`, not `_count._all`.
  const leadsByStatus = Array.isArray(stats?.leadsByStatus)
    ? stats.leadsByStatus
    : [];

  const dealsByStage = Array.isArray(stats?.dealsByStage)
    ? stats.dealsByStage
    : [];

  const leadStatusRows = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST']
    .map((status) => ({
      status,
      count: Number(
        leadsByStatus.find((item) => item.status === status)?.count
      ) || 0,
    }));

  const maxLeadCount = Math.max(
    1,
    ...leadStatusRows.map((item) => item.count)
  );

  const dealRows = [
    'QUALIFICATION',
    'PROPOSAL',
    'NEGOTIATION',
    'WON',
    'LOST',
  ].map((stage) => {
    const item = dealsByStage.find((entry) => entry.stage === stage);

    return {
      stage,
      count: Number(item?.count) || 0,
      value: Number(item?.value) || 0,
    };
  });

  const maxDealValue = Math.max(1, ...dealRows.map((item) => item.value));

  return (
    <div className="min-h-full space-y-7 text-slate-900">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-blue-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            YOUR SALES WORKSPACE
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            {user.name
              ? `Welcome back, ${user.name.split(' ')[0]}`
              : 'Overview'}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Here's what's happening across your sales pipeline.
          </p>
        </div>

        <button
          onClick={loadDashboard}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:text-blue-700 disabled:opacity-50 sm:self-auto"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Refresh data
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Some dashboard data could not be refreshed. {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total leads"
          value={number(totalLeads)}
          subtitle={`${number(newLeads)} new leads to review`}
          icon={ContactRound}
          tone="bg-blue-50 text-blue-700"
          to="/leads"
        />
        <MetricCard
          title="Active deals"
          value={number(activeDeals)}
          subtitle={`${number(totalDeals)} deals in your pipeline`}
          icon={BriefcaseBusiness}
          tone="bg-violet-50 text-violet-700"
          to="/deals"
        />
        <MetricCard
          title="Won revenue"
          value={money(wonRevenue)}
          subtitle={`${number(wonDeals)} successfully won deals`}
          icon={CircleDollarSign}
          tone="bg-emerald-50 text-emerald-700"
          to="/deals"
        />
        <MetricCard
          title="Conversion rate"
          value={`${conversionRate.toFixed(1)}%`}
          subtitle={`${number(qualifiedLeads)} qualified · ${number(convertedLeads)} converted`}
          icon={TrendingUp}
          tone="bg-amber-50 text-amber-700"
          to="/leads"
        />
      </div>

      <div className="grid min-w-0 gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard
          title="Lead overview"
          subtitle="Distribution of leads by current status."
          action={
            <Link to="/leads" className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">
              View leads <ArrowRight size={14} />
            </Link>
          }
        >
          {totalLeads === 0 ? (
            <EmptyState message="Add your first lead to see your pipeline take shape." />
          ) : (
            <div className="space-y-5">
              {leadStatusRows.map((item) => (
                <div key={item.status}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${leadColors[item.status]}`} />
                      <span className="text-sm text-slate-600">
                        {leadNames[item.status]}
                      </span>
                    </div>
                    <span className="text-sm font-semibold tabular-nums text-slate-800">
                      {number(item.count)}
                      <span className="ml-2 text-xs font-normal text-slate-400">
                        {Math.round((item.count / Math.max(totalLeads, 1)) * 100)}%
                      </span>
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${leadColors[item.status]}`}
                      style={{ width: `${(item.count / maxLeadCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Deal pipeline"
          subtitle="Deal value grouped by sales stage."
          action={
            <Link to="/deals" className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">
              View deals <ArrowRight size={14} />
            </Link>
          }
        >
          {totalDeals === 0 ? (
            <EmptyState message="Create a deal to start tracking your sales opportunities." />
          ) : (
            <div className="space-y-5">
              {dealRows.map((item) => (
                <div key={item.stage}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${stageColors[item.stage]}`} />
                      <span className="text-sm text-slate-600">
                        {stageNames[item.stage]}
                      </span>
                    </div>
                    <span className="text-right text-xs font-semibold tabular-nums text-slate-800">
                      {money(item.value)}
                      <span className="ml-2 font-normal text-slate-400">
                        ({item.count})
                      </span>
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${stageColors[item.stage]}`}
                      style={{ width: `${(item.value / maxDealValue) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <div className="grid min-w-0 gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard
          title="Upcoming follow-ups"
          subtitle="Activities that still need attention."
          action={
            <Link to="/activities" className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">
              All activities <ArrowRight size={14} />
            </Link>
          }
        >
          {activities.length === 0 ? (
            <EmptyState message="No pending activities found." />
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 rounded-xl border border-slate-100 p-3 transition hover:bg-slate-50"
                >
                  <div className="mt-0.5 rounded-lg bg-blue-50 p-2 text-blue-700">
                    {activity.type === 'CALL' ? (
                      <ContactRound size={17} />
                    ) : activity.type === 'MEETING' ? (
                      <CalendarDays size={17} />
                    ) : (
                      <CheckCircle2 size={17} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {activity.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {activity.type}
                      {activity.lead?.name ? ` · ${activity.lead.name}` : ''}
                    </p>
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                      <Clock3 size={13} />
                      {activity.dueDate
                        ? new Intl.DateTimeFormat('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          }).format(new Date(activity.dueDate))
                        : 'No due date'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Quick actions"
          subtitle="Get straight to the work that matters."
        >
          <div className="space-y-3">
            {[
              {
                title: 'Add a new lead',
                description: 'Capture a new prospect.',
                icon: ContactRound,
                to: '/leads',
                tone: 'bg-blue-50 text-blue-700',
              },
              {
                title: 'Create a deal',
                description: 'Track a sales opportunity.',
                icon: BriefcaseBusiness,
                to: '/deals',
                tone: 'bg-violet-50 text-violet-700',
              },
              {
                title: 'Schedule a follow-up',
                description: 'Keep the next step on your radar.',
                icon: CalendarDays,
                to: '/activities',
                tone: 'bg-emerald-50 text-emerald-700',
              },
            ].map((action) => (
              <Link
                key={action.title}
                to={action.to}
                className="group flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50/30"
              >
                <div className={`rounded-xl p-3 ${action.tone}`}>
                  <action.icon size={19} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800">
                    {action.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {action.description}
                  </p>
                </div>
                <ArrowUpRight size={17} className="text-slate-400 transition group-hover:text-blue-600" />
              </Link>
            ))}
          </div>

          <div className="mt-5 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-violet-50 p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-white p-2 text-blue-600 shadow-sm">
                <Zap size={17} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Keep your pipeline moving
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Review qualified leads and follow up on open deals regularly.
                </p>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="flex flex-col justify-between gap-3 border-t border-slate-200/80 pt-5 text-xs text-slate-400 sm:flex-row">
        <p>LeadFlow CRM · Sales workspace</p>
        <p>
          {number(totalLeads)} leads · {number(activeDeals)} active deals · {number(lostDeals)} lost deals
        </p>
      </div>
    </div>
  );
}

