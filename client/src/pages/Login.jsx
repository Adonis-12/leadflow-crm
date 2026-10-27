
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Zap, ShieldCheck } from 'lucide-react';
import api, { setAccessToken } from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

 
async function handleSubmit(event) {
  event.preventDefault();
  setLoading(true);
  setError('');

  try {
    const response = await api.post('/auth/login', form);
    const data = response.data?.data;

    if (!data?.accessToken || !data?.user) {
      throw new Error('Invalid login response from server.');
    }

    setAccessToken(data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));

    navigate('/dashboard', { replace: true });
  } catch (err) {
    setError(
      err.response?.data?.message ||
      err.message ||
      'Unable to sign in. Check your credentials.'
    );
  } finally {
    setLoading(false);
  }
}


  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f8faff] px-5 py-10 text-slate-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-200/40 blur-[100px]" />
        <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-violet-200/40 blur-[100px]" />
      </div>

      <Link
        to="/"
        className="absolute left-5 top-5 z-10 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-blue-600 sm:left-8 sm:top-8"
      >
        <ArrowLeft size={16} /> Back to home
      </Link>

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-200/60 lg:grid-cols-2">
        <section className="hidden flex-col justify-between bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-10 text-white lg:flex xl:p-14">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
              <Zap size={23} fill="currentColor" />
            </div>
            <span className="text-2xl font-bold tracking-tight">LeadFlow</span>
          </Link>

          <div className="py-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs text-blue-50">
              <ShieldCheck size={15} /> Your sales workspace
            </div>
            <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
              Good to have you back.
              <span className="mt-2 block text-blue-100">
                Let's move business forward.
              </span>
            </h1>
            <p className="mt-5 max-w-sm leading-7 text-blue-100/90">
              Your leads, deals, and next steps are waiting in one organized place.
            </p>
          </div>

          <p className="text-xs text-blue-100/70">
            One workspace. Clearer priorities. Better follow-through.
          </p>
        </section>

        <section className="p-6 sm:p-10 lg:p-12 xl:p-14">
          <Link to="/" className="inline-flex items-center gap-2 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Zap size={21} fill="currentColor" />
            </span>
            <span className="text-xl font-bold">Lead<span className="text-blue-600">Flow</span></span>
          </Link>

          <div className="mt-8 lg:mt-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              Welcome back
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Sign in to LeadFlow
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Enter your account details to access your workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@company.com"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3.5 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-200/70 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign in to your account'}
              {!loading && <ArrowRight size={17} />}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-500">
            New to LeadFlow?{' '}
            <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">
              Create an account
            </Link>
          </p>

          <div className="mt-8 flex items-center justify-center gap-2 border-t border-slate-100 pt-5 text-xs text-slate-400">
            <ShieldCheck size={15} /> Secure access to your workspace
          </div>
        </section>
      </div>
    </main>
  );
}
