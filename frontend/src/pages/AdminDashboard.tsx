import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, Users, Stethoscope, Activity, Calendar, Lock,
  Search, CheckCircle2, XCircle, AlertTriangle, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ClinicalSafetyBanner } from '../components/ClinicalSafetyBanner';
import { AdminStats, AuditLog } from '../types';
import { api } from '../services/api';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [clinicians, setClinicians] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'verification' | 'users' | 'audits'>('verification');
  const [logFilter, setLogFilter] = useState<string>('');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [sData, cData, uData, lData] = await Promise.all([
        api.admin.getStats().catch(() => null),
        api.admin.getClinicians().catch(() => []),
        api.admin.getUsers().catch(() => []),
        api.admin.getAuditLogs(60).catch(() => [])
      ]);
      setStats(sData);
      setClinicians(cData);
      setUsersList(uData);
      setAuditLogs(lData);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVerification = async (clinicianId: number, currentStatus: boolean) => {
    try {
      await api.admin.verifyClinician(clinicianId, !currentStatus);
      setClinicians(prev =>
        prev.map(c => c.id === clinicianId ? { ...c, is_verified_by_admin: !currentStatus } : c)
      );
    } catch (err: any) {
      alert(err.message || 'Verification update failed.');
    }
  };

  const handleToggleUserStatus = async (userId: number, currentActive: boolean) => {
    try {
      await api.admin.toggleUserStatus(userId, !currentActive);
      setUsersList(prev =>
        prev.map(u => u.id === userId ? { ...u, is_active: !currentActive } : u)
      );
    } catch (err: any) {
      alert(err.message || 'User status update failed.');
    }
  };

  const filteredLogs = auditLogs.filter(log =>
    log.action.toLowerCase().includes(logFilter.toLowerCase()) ||
    log.resource.toLowerCase().includes(logFilter.toLowerCase()) ||
    (log.details && log.details.toLowerCase().includes(logFilter.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <ClinicalSafetyBanner compact />

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              System Administration
            </span>
            <span className="text-xs text-slate-400">Security Clearance: ADMIN</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Platform Governance & Auditing
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enforce RBAC permissions, verify clinicians, manage accounts, and inspect cryptographic audit trails.
          </p>
        </div>

        <button
          onClick={loadAdminData}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Data
        </button>
      </div>

      {/* Key Metric Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Total Users</span>
          <span className="text-2xl font-black font-mono text-slate-900">{stats?.total_users ?? 4}</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Patients</span>
          <span className="text-2xl font-black font-mono text-teal-700">{stats?.total_patients ?? 1}</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Clinicians</span>
          <span className="text-2xl font-black font-mono text-teal-700">{stats?.total_clinicians ?? 2}</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Screenings</span>
          <span className="text-2xl font-black font-mono text-slate-900">{stats?.total_screenings ?? 1}</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Appointments</span>
          <span className="text-2xl font-black font-mono text-slate-900">{stats?.total_appointments ?? 1}</span>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Higher Indication</span>
          <span className="text-2xl font-black font-mono text-amber-600">{stats?.high_indication_screenings ?? 1}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 pt-3 gap-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('verification')}
            className={`pb-3 border-b-2 transition ${activeTab === 'verification' ? 'border-teal-600 text-teal-800' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            Clinician Verification ({clinicians.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-3 border-b-2 transition ${activeTab === 'users' ? 'border-teal-600 text-teal-800' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            User Accounts ({usersList.length})
          </button>
          <button
            onClick={() => setActiveTab('audits')}
            className={`pb-3 border-b-2 transition ${activeTab === 'audits' ? 'border-teal-600 text-teal-800' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          >
            Audit Event Logs ({auditLogs.length})
          </button>
        </div>

        {/* Tab 1: Clinician Verification */}
        {activeTab === 'verification' && (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Clinician Name</th>
                    <th className="py-2.5 px-4 font-semibold">Specialty</th>
                    <th className="py-2.5 px-4 font-semibold">Qualification</th>
                    <th className="py-2.5 px-4 font-semibold">Status</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {clinicians.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-slate-900">{c.full_name}</td>
                      <td className="py-3 px-4">{c.specialty}</td>
                      <td className="py-3 px-4">{c.qualification}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold ${
                          c.is_verified_by_admin ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}>
                          {c.is_verified_by_admin ? 'Verified' : 'Pending Verification'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleToggleVerification(c.id, c.is_verified_by_admin)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                            c.is_verified_by_admin
                              ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                        >
                          {c.is_verified_by_admin ? 'Revoke Status' : 'Approve Clinician'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: User Account Management */}
        {activeTab === 'users' && (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">ID</th>
                    <th className="py-2.5 px-4 font-semibold">Full Name</th>
                    <th className="py-2.5 px-4 font-semibold">Role</th>
                    <th className="py-2.5 px-4 font-semibold">Contact</th>
                    <th className="py-2.5 px-4 font-semibold">Status</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Account Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono font-medium">#{u.id}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{u.full_name || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <span className="capitalize px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                        {u.phone_number || u.email || 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold ${
                          u.is_active ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-900'
                        }`}>
                          {u.is_active ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {u.id !== user?.user_id ? (
                          <button
                            onClick={() => handleToggleUserStatus(u.id, u.is_active)}
                            className={`px-3 py-1 rounded-xl font-bold text-xs transition ${
                              u.is_active
                                ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {u.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Current Session</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Audit Event Logs */}
        {activeTab === 'audits' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 max-w-sm">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value)}
                placeholder="Filter by action or resource..."
                className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="py-2 px-3 font-semibold">Event ID</th>
                    <th className="py-2 px-3 font-semibold">Timestamp</th>
                    <th className="py-2 px-3 font-semibold">Action</th>
                    <th className="py-2 px-3 font-semibold">Resource</th>
                    <th className="py-2 px-3 font-semibold">Details</th>
                    <th className="py-2 px-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px] text-slate-700">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3">#{log.id}</td>
                      <td className="py-2 px-3 text-slate-500">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </td>
                      <td className="py-2 px-3 font-bold text-teal-800">{log.action}</td>
                      <td className="py-2 px-3 text-slate-600">{log.resource}</td>
                      <td className="py-2 px-3 font-sans text-slate-600 max-w-xs truncate">
                        {log.details || '—'}
                      </td>
                      <td className="py-2 px-3">
                        <span className="text-emerald-700 font-bold">{log.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
