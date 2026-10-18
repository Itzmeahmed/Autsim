import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Calendar, Clock, Stethoscope, User, ChevronRight, Activity, Edit3, CheckCircle, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ClinicalSafetyBanner } from '../components/ClinicalSafetyBanner';
import { PatientProfile, ScreeningSummary, Appointment } from '../types';
import { api } from '../services/api';

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [screenings, setScreenings] = useState<ScreeningSummary[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editForm, setEditForm] = useState<Partial<PatientProfile>>({});

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [profData, screenData, apptData] = await Promise.all([
        api.patients.getProfile().catch(() => null),
        api.patients.getScreenings().catch(() => []),
        api.patients.getAppointments().catch(() => [])
      ]);
      if (profData) {
        setProfile(profData);
        setEditForm(profData);
      }
      setScreenings(screenData);
      setAppointments(apptData);
    } catch (err) {
      console.error('Error fetching patient dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await api.patients.updateProfile(editForm);
      setProfile(updated);
      setShowEditModal(false);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile.');
    }
  };

  const latestScreening = screenings.length > 0 ? screenings[0] : null;
  const nextAppointment = appointments.find(a => a.status === 'Confirmed' || a.status === 'Pending');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Clinical Safety Notice */}
      <ClinicalSafetyBanner compact />

      {/* Hero Welcome Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              Patient Portal
            </span>
            <span className="text-xs text-slate-500">ID: #{profile?.id || user?.user_id}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t('welcome')}, {profile?.full_name || 'Caregiver'}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Child Profile: <span className="font-semibold text-slate-800">{profile?.child_name || 'Aarav'}</span> ({profile?.age || 5} years old, {profile?.gender || 'Male'})
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setShowEditModal(true)}
            className="flex-1 md:flex-initial px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2"
          >
            <Edit3 className="w-4 h-4 text-slate-500" />
            {t('editProfile')}
          </button>
          <Link
            to="/screening"
            className="flex-1 md:flex-initial px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition shadow-sm flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {t('startScreening')}
          </Link>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Quick Action Cards */}
        <div className="md:col-span-7 space-y-6">
          {/* Screening Action Card */}
          <div className="bg-gradient-to-br from-teal-700 to-teal-900 text-white rounded-2xl p-6 sm:p-7 shadow-sm relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-800/80 text-teal-200 border border-teal-600">
                <Activity className="w-3.5 h-3.5 text-teal-300" />
                AI Behavioral Observation
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Start AI Screening
              </h2>
              <p className="text-teal-100 text-sm max-w-lg leading-relaxed">
                Guided camera-based behavioral observation session evaluating visual tracking, head orientation, and interaction cues.
              </p>
              <div className="pt-2">
                <Link
                  to="/screening"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-teal-900 hover:bg-teal-50 font-bold text-sm rounded-xl transition shadow-sm"
                >
                  Start Guided Screening
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Latest Screening Result Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-base">
                {t('latestResult')}
              </h3>
              {latestScreening?.result && (
                <span className="text-xs text-slate-500">
                  {new Date(latestScreening.created_at).toLocaleDateString()}
                </span>
              )}
            </div>

            {latestScreening?.result ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 uppercase font-semibold block mb-1">
                      Screening Indication
                    </span>
                    <span className={`inline-block font-bold text-sm px-3 py-1 rounded-full ${latestScreening.result.screening_indication === 'Higher Indication' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'}`}>
                      {latestScreening.result.screening_indication}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 uppercase font-semibold block mb-1">Model Score</span>
                    <span className="text-lg font-bold text-slate-900 font-mono">
                      {(latestScreening.result.probability_score * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-500">
                    Contributing areas: <b>{latestScreening.result.key_contributing_areas?.join(', ') || 'Observed traits'}</b>
                  </span>
                  <Link
                    to={`/result/${latestScreening.result.screening_id}`}
                    className="text-xs font-bold text-teal-700 hover:text-teal-800 hover:underline flex items-center gap-1"
                  >
                    View Full Analysis
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-sm text-slate-500">
                <p>{t('noScreeningYet')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Appointment & Clinical Connection */}
        <div className="md:col-span-5 space-y-6">
          {/* Upcoming Appointment */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-600" />
              {t('upcomingAppointment')}
            </h3>

            {nextAppointment ? (
              <div className="p-4 bg-teal-50/50 border border-teal-200/80 rounded-xl space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {nextAppointment.clinician_name || 'Dr. Ananya Sharma'}
                    </h4>
                    <span className="text-xs text-teal-700 font-medium">
                      {nextAppointment.clinician_specialty || 'Developmental Specialist'}
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 bg-teal-100 text-teal-800 text-[11px] font-bold rounded-full border border-teal-300">
                    {nextAppointment.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-600 pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {nextAppointment.appointment_date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {nextAppointment.appointment_time}
                  </span>
                </div>

                <p className="text-xs text-slate-500 italic">
                  "{nextAppointment.reason_for_visit}"
                </p>
              </div>
            ) : (
              <div className="py-6 text-center text-sm text-slate-500 space-y-3">
                <p>{t('noAppointments')}</p>
                <Link
                  to="/clinicians"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold rounded-xl transition border border-teal-200"
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  {t('connectClinicianBtn')}
                </Link>
              </div>
            )}
          </div>

          {/* Child Profile Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center justify-between">
              <span>{t('patientProfile')}</span>
              <button
                onClick={() => setShowEditModal(true)}
                className="text-xs text-teal-700 hover:underline font-semibold"
              >
                {t('editProfile')}
              </button>
            </h3>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">{t('childName')}</span>
                <span className="font-semibold text-slate-800">{profile?.child_name || 'Aarav Sharma'}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">{t('age')} / {t('gender')}</span>
                <span className="font-semibold text-slate-800">{profile?.age || 5} yrs / {profile?.gender || 'Male'}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">{t('parentName')}</span>
                <span className="font-semibold text-slate-800">{profile?.parent_guardian_name || profile?.full_name || 'Priya Sharma'}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-slate-500">{t('preferredLang')}</span>
                <span className="font-semibold text-slate-800">{profile?.preferred_language || 'English'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assessment History Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <h3 className="font-bold text-slate-900 text-base mb-4">
          {t('previousAssessments')}
        </h3>

        {screenings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Assessment ID</th>
                  <th className="py-2.5 px-4 font-semibold">Date</th>
                  <th className="py-2.5 px-4 font-semibold">Indication</th>
                  <th className="py-2.5 px-4 font-semibold">Probability Score</th>
                  <th className="py-2.5 px-4 font-semibold">Status</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {screenings.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-medium">#SCR-{s.id}</td>
                    <td className="py-3 px-4">{new Date(s.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold ${s.result?.screening_indication === 'Higher Indication' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'}`}>
                        {s.result?.screening_indication || 'Completed'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {s.result ? `${(s.result.probability_score * 100).toFixed(0)}%` : 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-600 font-medium">Completed</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {s.result && (
                        <Link
                          to={`/result/${s.id}`}
                          className="text-teal-700 font-bold hover:underline"
                        >
                          View Result
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-4 text-center">
            No previous assessments on file.
          </p>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">{t('editProfile')}</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('childName')}</label>
                <input
                  type="text"
                  required
                  value={editForm.child_name || ''}
                  onChange={(e) => setEditForm({ ...editForm, child_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('age')} (Years)</label>
                  <input
                    type="number"
                    min={1}
                    max={18}
                    required
                    value={editForm.age || 5}
                    onChange={(e) => setEditForm({ ...editForm, age: parseInt(e.target.value) || 5 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t('gender')}</label>
                  <select
                    value={editForm.gender || 'Male'}
                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 text-sm"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('parentName')}</label>
                <input
                  type="text"
                  value={editForm.parent_guardian_name || ''}
                  onChange={(e) => setEditForm({ ...editForm, parent_guardian_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('preferredLang')}</label>
                <select
                  value={editForm.preferred_language || 'English'}
                  onChange={(e) => setEditForm({ ...editForm, preferred_language: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 text-sm"
                >
                  <option value="English">English</option>
                  <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
                  <option value="Hindi">Hindi (हिन्दी)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
