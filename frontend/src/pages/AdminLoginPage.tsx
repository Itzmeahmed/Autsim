import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, switchDemoRole } = useAuth();

  const [email, setEmail] = useState('admin@autiaignosis.org');
  const [password, setPassword] = useState('Admin@12345');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const session = await api.auth.login(email, password);
      if (session.role !== 'admin') {
        throw new Error('Access denied. Administrator privileges required.');
      }
      login(session);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid administrator credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAdmin = async () => {
    try {
      setLoading(true);
      await switchDemoRole('admin');
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Demo admin login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-800 text-white shadow-md mb-3">
            <ShieldAlert className="w-6 h-6 text-teal-400" />
          </div>
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-300 mb-2">
            System Administration
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Admin Portal Login
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            System governance, clinician verification & audit logs
          </p>
        </div>

        {/* Security Alert */}
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-950">Restricted Area: </span>
            All administrative actions, verification changes, and access attempts are timestamped and recorded in immutable audit logs.
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Administrator Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@autiaignosis.org"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-800 text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Master Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-800 text-sm font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? 'Verifying Admin Access...' : 'Sign In as System Administrator'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-wider text-slate-400 bg-white px-2">
              Evaluation & Demo Access
            </div>
          </div>

          <button
            type="button"
            onClick={handleDemoAdmin}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            Instant Demo Administrator Login
          </button>
        </div>

        {/* Footer Navigation */}
        <div className="flex justify-between text-xs text-slate-500 pt-2 px-1">
          <Link to="/patient/login" className="hover:text-slate-900 hover:underline">
            ← Patient Portal
          </Link>
          <Link to="/about" className="hover:text-slate-900 hover:underline">
            Meet the Developers
          </Link>
          <Link to="/clinician/login" className="hover:text-slate-900 hover:underline">
            Clinician Portal →
          </Link>
        </div>
      </div>
    </div>
  );
};
