import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Smartphone, KeyRound, ArrowRight, ShieldCheck, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const PatientLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, switchDemoRole } = useAuth();

  const [phoneNumber, setPhoneNumber] = useState('+919876543210');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mockOtpHint, setMockOtpHint] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(0);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.auth.sendOtp(phoneNumber);
      setMockOtpHint(res.mock_otp || null);
      if (res.mock_otp) {
        setOtp(res.mock_otp); // Auto-fill in dev mode
      }
      setStep('OTP');
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch verification OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const session = await api.auth.verifyOtp(phoneNumber, otp);
      login(session);
      navigate('/patient/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid OTP code. Please check and retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-teal-600 text-white shadow-md mb-3">
            <Smartphone className="w-6 h-6" />
          </div>
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 mb-2">
            Patient & Caregiver Portal
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Patient Portal Login
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Secure passwordless login with OTP verification
          </p>
        </div>

        {/* Development Mode Notice */}
        <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-blue-950">Development Mode Active: </span>
            A secure mock OTP is automatically generated and provided on submission for local testing.
          </div>
        </div>

        {/* Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {step === 'PHONE' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mobile Number (with Country Code)
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+919876543210"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-medium"
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-slate-400">
                  Example: +919876543210. An SMS OTP will be generated.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? 'Sending OTP...' : 'Send Verification OTP'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Enter 6-Digit OTP
                  </label>
                  <button
                    type="button"
                    onClick={() => setStep('PHONE')}
                    className="text-xs text-teal-700 hover:underline font-medium"
                  >
                    Change Number
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full px-4 py-3 text-center tracking-widest text-lg font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                {mockOtpHint && (
                  <p className="mt-1.5 text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Development OTP code: {mockOtpHint}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 4}
                className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? 'Verifying OTP...' : 'Verify OTP & Open Dashboard'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                {countdown > 0 ? (
                  <span className="text-xs text-slate-400">
                    Resend code in {countdown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="text-xs text-teal-700 hover:underline font-semibold"
                  >
                    Resend OTP Code
                  </button>
                )}
              </div>
            </form>
          )}

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-wider text-slate-400 bg-white px-2">
              New to AUTI.AI.AIGNOSIS?
            </div>
          </div>

          <Link
            to="/patient/register"
            className="w-full py-2.5 px-4 rounded-xl border border-teal-200 bg-teal-50/50 hover:bg-teal-50 text-teal-800 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            Create New Patient Account <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => switchDemoRole('patient')}
              className="w-full py-2 px-3 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 border border-slate-200 transition-colors"
            >
              Instant Demo Patient Login
            </button>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex justify-between text-xs text-slate-500 pt-2 px-1">
          <Link to="/clinician/login" className="hover:text-teal-700 hover:underline">
            Clinician Portal →
          </Link>
          <Link to="/about" className="hover:text-teal-700 hover:underline">
            Meet the Developers
          </Link>
          <Link to="/admin/login" className="hover:text-teal-700 hover:underline">
            Admin Portal →
          </Link>
        </div>
      </div>
    </div>
  );
};
