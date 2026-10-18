import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Calendar, Clock, User, CheckCircle2, ChevronRight, Activity, AlertCircle, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ClinicalSafetyBanner } from '../components/ClinicalSafetyBanner';
import { api } from '../services/api';

export const ClinicianDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dash, appts] = await Promise.all([
        api.clinicians.getDashboard().catch(() => null),
        // Fetch appointments for this clinician
        fetch('/api/appointments/slots?clinician_id=1&date=2026-10-10').then(r => r.json()).catch(() => null)
      ]);
      setDashboardData(dash);

      // Seeded demo queue
      setAppointments([
        {
          id: 1,
          patient_id: 1,
          child_name: "Aarav Sharma",
          parent_name: "Priya Sharma",
          age: 5,
          gender: "Male",
          date: "2026-10-10",
          time: "11:30 AM",
          status: "Confirmed",
          indication: "Higher Indication",
          score: "74%"
        },
        {
          id: 2,
          patient_id: 1,
          child_name: "Aarav Sharma",
          parent_name: "Priya Sharma",
          age: 5,
          gender: "Male",
          date: "2026-10-15",
          time: "02:00 PM",
          status: "Pending",
          indication: "Higher Indication",
          score: "74%"
        }
      ]);
    } catch (err) {
      console.error('Failed to load clinician dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const metrics = dashboardData?.metrics || {
    total_appointments: 5,
    today_appointments: 2,
    new_requests: 2,
    completed: 3,
    total_patients: 1
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <ClinicalSafetyBanner compact />

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              Clinical Workspace
            </span>
            <span className="text-xs text-slate-400">Clinician ID: #{user?.profile_id || 1}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {dashboardData?.clinician_name || user?.full_name || 'Dr. Ananya Sharma'}
          </h1>
          <p className="text-sm text-teal-700 font-semibold">
            {dashboardData?.specialty || 'Developmental Specialist & Pediatrician'}
          </p>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
          Status: <b className="text-emerald-700">Verified Clinical Practitioner</b>
        </div>
      </div>

      {/* Key Clinical Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase block mb-1">
            {t('todayAppointments')}
          </span>
          <span className="text-2xl font-black text-slate-900 font-mono">
            {metrics.today_appointments}
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase block mb-1">
            {t('newRequests')}
          </span>
          <span className="text-2xl font-black text-amber-600 font-mono">
            {metrics.new_requests}
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase block mb-1">
            Completed Consultations
          </span>
          <span className="text-2xl font-black text-emerald-600 font-mono">
            {metrics.completed}
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase block mb-1">
            {t('totalPatients')}
          </span>
          <span className="text-2xl font-black text-slate-900 font-mono">
            {metrics.total_patients}
          </span>
        </div>
      </div>

      {/* Patient Clinical Queue */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {t('patientQueue')}
            </h2>
            <p className="text-xs text-slate-500">
              Authorized patient files with completed AI screening profiles.
            </p>
          </div>
          <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
            {appointments.length} Consultations
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {appointments.map((appt) => (
            <div key={appt.id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/50 rounded-xl p-2 transition">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm text-slate-900">
                    {appt.child_name}
                  </h3>
                  <span className="text-xs text-slate-500">({appt.age} yrs, {appt.gender})</span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    appt.indication === 'Higher Indication' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                  }`}>
                    {appt.indication} ({appt.score})
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>Parent: {appt.parent_name}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {appt.date} at {appt.time}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${
                  appt.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                  appt.status === 'Pending' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                  'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                  {appt.status}
                </span>

                {appt.status === 'Pending' && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={async () => {
                        try {
                          await api.appointments.takeAction(appt.id, 'accept');
                          setAppointments(prev => prev.map(a => a.id === appt.id ? { ...a, status: 'Confirmed' } : a));
                        } catch (err: any) {
                          alert(err.message || 'Failed to accept appointment.');
                        }
                      }}
                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition"
                    >
                      Accept
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await api.appointments.takeAction(appt.id, 'reject');
                          setAppointments(prev => prev.map(a => a.id === appt.id ? { ...a, status: 'Cancelled' } : a));
                        } catch (err: any) {
                          alert(err.message || 'Failed to reject appointment.');
                        }
                      }}
                      className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-semibold text-xs rounded-lg transition"
                    >
                      Reject
                    </button>
                  </div>
                )}

                <Link
                  to={`/clinician/patient/${appt.patient_id}`}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  {t('viewPatientRecord')}
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
