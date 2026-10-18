import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Globe, LogOut, User as UserIcon, ShieldCheck, Stethoscope, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LanguageCode } from '../types';

export const Navbar: React.FC = () => {
  const { user, logout, switchDemoRole } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Demo Notification & Language Bar */}
      <div className="bg-slate-900 text-slate-100 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-medium">
          <span className="bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded text-[11px] font-semibold border border-teal-500/30 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-teal-400" /> DEMO SWITCHER
          </span>
          <span className="text-slate-300 hidden sm:inline">Instant Role Evaluation:</span>
          <button
            onClick={() => switchDemoRole('patient')}
            className={`px-2 py-0.5 rounded hover:bg-slate-800 transition ${user?.role === 'patient' ? 'bg-teal-600 text-white font-semibold' : 'text-slate-400'}`}
          >
            {t('demoPatient')}
          </button>
          <span className="text-slate-700">|</span>
          <button
            onClick={() => switchDemoRole('clinician')}
            className={`px-2 py-0.5 rounded hover:bg-slate-800 transition ${user?.role === 'clinician' ? 'bg-teal-600 text-white font-semibold' : 'text-slate-400'}`}
          >
            {t('demoClinician')}
          </button>
          <span className="text-slate-700">|</span>
          <button
            onClick={() => switchDemoRole('admin')}
            className={`px-2 py-0.5 rounded hover:bg-slate-800 transition ${user?.role === 'admin' ? 'bg-teal-600 text-white font-semibold' : 'text-slate-400'}`}
          >
            {t('demoAdmin')}
          </button>
        </div>

        {/* Multilingual Selector */}
        <div className="flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-teal-400" />
          <div className="flex items-center bg-slate-800 rounded px-1 py-0.5 text-[11px]">
            <button
              onClick={() => setLanguage('en')}
              className={`px-1.5 py-0.5 rounded ${language === 'en' ? 'bg-teal-600 text-white font-bold' : 'text-slate-300 hover:text-white'}`}
            >
              English
            </button>
            <span className="text-slate-600 mx-0.5">|</span>
            <button
              onClick={() => setLanguage('kn')}
              className={`px-1.5 py-0.5 rounded ${language === 'kn' ? 'bg-teal-600 text-white font-bold' : 'text-slate-300 hover:text-white'}`}
            >
              ಕನ್ನಡ
            </button>
            <span className="text-slate-600 mx-0.5">|</span>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-1.5 py-0.5 rounded ${language === 'hi' ? 'bg-teal-600 text-white font-bold' : 'text-slate-300 hover:text-white'}`}
            >
              हिन्दी
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm shadow-teal-700/20 group-hover:scale-105 transition-transform">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">AUTI.AI.AIGNOSIS</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                Healthcare
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              {t('tagline')}
            </p>
          </div>
        </Link>

        {/* Navigation links based on role */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {user.role === 'patient' && (
                <div className="hidden md:flex items-center gap-2">
                  <Link to="/patient" className="text-sm font-medium text-slate-700 hover:text-teal-700 px-3 py-2 rounded-lg hover:bg-slate-100 transition">
                    Dashboard
                  </Link>
                  <Link to="/screening" className="text-sm font-semibold text-teal-700 hover:text-teal-800 px-3 py-2 rounded-lg bg-teal-50 hover:bg-teal-100 transition flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-teal-600" />
                    {t('startScreening')}
                  </Link>
                  <Link to="/clinicians" className="text-sm font-medium text-slate-700 hover:text-teal-700 px-3 py-2 rounded-lg hover:bg-slate-100 transition flex items-center gap-1">
                    <Stethoscope className="w-4 h-4 text-slate-500" />
                    Clinicians
                  </Link>
                </div>
              )}

              {user.role === 'clinician' && (
                <div className="hidden md:flex items-center gap-2">
                  <Link to="/clinician" className="text-sm font-medium text-slate-700 hover:text-teal-700 px-3 py-2 rounded-lg hover:bg-slate-100 transition flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4 text-teal-600" />
                    Clinical Workspace
                  </Link>
                </div>
              )}

              {user.role === 'admin' && (
                <div className="hidden md:flex items-center gap-2">
                  <Link to="/admin" className="text-sm font-medium text-slate-700 hover:text-teal-700 px-3 py-2 rounded-lg hover:bg-slate-100 transition flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    Admin Governance
                  </Link>
                </div>
              )}

              {/* Meet Developers Link */}
              <Link
                to="/about"
                className="hidden sm:inline-flex text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1.5 rounded-lg transition items-center gap-1"
              >
                Meet the Developers
              </Link>

              {/* Role badge & Logout */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <span className="text-xs font-semibold uppercase px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                  <UserIcon className="w-3 h-3 text-slate-500" />
                  {user.role}
                </span>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  title={t('logout')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/about"
                className="text-xs font-semibold text-teal-700 hover:text-teal-800 px-3 py-2 rounded-lg hover:bg-teal-50 transition"
              >
                Meet the Developers
              </Link>
              <Link
                to="/patient/login"
                className="text-xs font-semibold bg-teal-600 text-white px-3.5 py-2 rounded-xl hover:bg-teal-700 transition shadow-sm"
              >
                Patient Portal
              </Link>
              <Link
                to="/clinician/login"
                className="hidden sm:inline-block text-xs font-semibold border border-slate-200 text-slate-700 px-3 py-2 rounded-xl hover:bg-slate-50 transition"
              >
                Clinician
              </Link>
              <Link
                to="/admin/login"
                className="hidden md:inline-block text-xs font-semibold text-slate-500 hover:text-slate-900 px-2.5 py-2 transition"
              >
                Admin
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
