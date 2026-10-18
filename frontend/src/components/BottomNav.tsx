import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Sparkles, Stethoscope, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const BottomNav: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-3 py-2 flex items-center justify-around shadow-lg">
      {user.role === 'patient' && (
        <>
          <Link
            to="/patient"
            className={`flex flex-col items-center gap-1 text-[11px] font-medium ${location.pathname === '/patient' ? 'text-teal-700 font-bold' : 'text-slate-500'}`}
          >
            <Home className="w-5 h-5" />
            <span>Home</span>
          </Link>
          <Link
            to="/screening"
            className={`flex flex-col items-center gap-1 text-[11px] font-medium ${location.pathname === '/screening' ? 'text-teal-700 font-bold' : 'text-slate-500'}`}
          >
            <Sparkles className="w-5 h-5" />
            <span>Screening</span>
          </Link>
          <Link
            to="/clinicians"
            className={`flex flex-col items-center gap-1 text-[11px] font-medium ${location.pathname === '/clinicians' ? 'text-teal-700 font-bold' : 'text-slate-500'}`}
          >
            <Stethoscope className="w-5 h-5" />
            <span>Clinicians</span>
          </Link>
        </>
      )}

      {user.role === 'clinician' && (
        <Link
          to="/clinician"
          className="flex flex-col items-center gap-1 text-[11px] font-medium text-teal-700 font-bold"
        >
          <Stethoscope className="w-5 h-5" />
          <span>Workspace</span>
        </Link>
      )}

      {user.role === 'admin' && (
        <Link
          to="/admin"
          className="flex flex-col items-center gap-1 text-[11px] font-medium text-teal-700 font-bold"
        >
          <ShieldCheck className="w-5 h-5" />
          <span>Governance</span>
        </Link>
      )}
    </nav>
  );
};
