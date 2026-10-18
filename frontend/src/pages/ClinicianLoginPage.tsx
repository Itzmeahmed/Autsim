import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Stethoscope, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const ClinicianLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, switchDemoRole } = useAuth();

  const [email, setEmail] = useState('ananya.sharma@autiaignosis.org');
  const [password, setPassword] = useState('Password@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const session = await api.auth.login(email, password);
      if (session.role !== 'clinician' && session.role !== 'admin') {
        throw new Error('Access denied. This portal is restricted to authorized clinicians.');
      }
      login(session);
      navigate('/clinician/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid clinician credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClinician = async () => {
    try {
      setLoading(true);
      await switchDemoRole('clinician');
      navigate('/clinician/dashboard');
    } catch (err: any) {
      setError(err.message || 'Demo clinician login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white shadow-md mb-3">
            <Stethoscope className="w-6 h-6" />
          </div>
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 mb-2">
            Doctor & Clinician Portal
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Clinician Portal Login
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Secure clinical workstation for authorized healthcare specialists
          </p>
        </div>

        {/* Security Badge */}
        <div className="p-3.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-700 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-900">Protected Clinical Access: </span>
            Access to patient screening reports and clinical notes requires active clinician credentials.
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
                Professional Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@autiaignosis.org"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? 'Authenticating...' : 'Sign In to Clinical Workstation'}
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
            onClick={handleDemoClinician}
            className="w-full py-2.5 px-4 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-blue-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            Instant Demo Clinician Login (Dr. Ananya Sharma)
          </button>
        </div>

        {/* Footer Navigation */}
        <div className="flex justify-between text-xs text-slate-500 pt-2 px-1">
          <Link to="/patient/login" className="hover:text-blue-700 hover:underline">
            ← Patient Portal
          </Link>
          <Link to="/about" className="hover:text-blue-700 hover:underline">
            Meet the Developers
          </Link>
          <Link to="/admin/login" className="hover:text-blue-700 hover:underline">
            Admin Portal →
          </Link>
        </div>
      </div>
    </div>
  );
};
