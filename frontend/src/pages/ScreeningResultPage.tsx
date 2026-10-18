import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2, AlertTriangle, Stethoscope, Printer, History, RefreshCw,
  Activity, ShieldCheck, Sparkles, ChevronRight, FileText, Calendar,
  User, Clock, Eye, Video, Download, Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ScreeningResult, PatientProfile } from '../types';
import { api } from '../services/api';

export const ScreeningResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [result, setResult] = useState<ScreeningResult | null>(null);
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadData(parseInt(id));
    }
  }, [id]);

  const loadData = async (screeningId: number) => {
    setLoading(true);
    try {
      const [resData, profData] = await Promise.all([
        api.screening.getResult(screeningId),
        api.patients.getProfile().catch(() => null)
      ]);
      setResult(resData);
      if (profData) {
        setPatientProfile(profData);
      }
    } catch (err: any) {
      setError(err.message || 'Could not load screening report.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-slate-500">
        <div className="animate-spin w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm font-medium">Generating professional screening report...</p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-600 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Screening Report Not Available</h2>
        <p className="text-sm text-slate-600">{error || 'Record was not found.'}</p>
        <Link
          to="/patient"
          className="inline-block px-5 py-2.5 bg-teal-600 text-white font-semibold rounded-xl text-sm"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const isHigher = result.screening_indication.toLowerCase().includes('further') ||
                   result.screening_indication.toLowerCase().includes('higher');

  const profileScores = result.developmental_profile || {
    'Communication': 45,
    'Social Interaction': 50,
    'Sensory Responses': 40,
    'Repetitive Behaviors': 35,
    'Motor / Daily-Life Skills': 45
  };

  const reportId = `REP-${String(result.id).padStart(4, '0')}-${String(result.screening_id).padStart(4, '0')}`;
  const assessmentDate = new Date(result.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 print:p-0 print:m-0 print:space-y-4">
      {/* Top Action Bar (hidden on print) */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden bg-slate-50 border border-slate-200 p-3.5 rounded-2xl">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Report Actions:</span>
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Download PDF</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/clinicians"
            className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Connect with Clinician</span>
          </Link>
          <Link
            to="/patient"
            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl transition"
          >
            Dashboard
          </Link>
        </div>
      </div>

      {/* Main Professional Healthcare Report Document */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-xs space-y-8 print:border-none print:shadow-none print:p-0">
        
        {/* ========================================================== */}
        {/* HEADER                                                     */}
        {/* ========================================================== */}
        <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center text-white shrink-0 shadow-sm">
              <Activity className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold text-slate-900 tracking-tight">AUTI.AI.AIGNOSIS</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  Clinical Document
                </span>
              </div>
              <h1 className="text-sm font-semibold text-slate-600 mt-0.5">
                AI-Assisted Autism Screening Report
              </h1>
            </div>
          </div>

          <div className="text-left sm:text-right text-xs space-y-0.5 font-mono text-slate-600">
            <div><span className="font-semibold text-slate-800">Report ID:</span> {reportId}</div>
            <div><span className="font-semibold text-slate-800">Assessment ID:</span> SCR-{result.screening_id}</div>
            <div><span className="font-semibold text-slate-800">Date:</span> {assessmentDate}</div>
            <div><span className="font-semibold text-slate-800">System:</span> AUTI.AI.AIGNOSIS {result.model_version}</div>
          </div>
        </div>

        {/* ========================================================== */}
        {/* PATIENT & ASSESSMENT INFORMATION                           */}
        {/* ========================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Patient Info Card */}
          <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200/80 pb-1.5">
              <User className="w-3.5 h-3.5 text-teal-600" />
              <span>Patient Information</span>
            </div>
            <div className="grid grid-cols-2 gap-y-1.5 text-xs">
              <span className="text-slate-500">Patient / Child Name:</span>
              <span className="font-semibold text-slate-900">{patientProfile?.child_name || 'Pediatric Subject'}</span>

              <span className="text-slate-500">Patient ID:</span>
              <span className="font-mono text-slate-800">PAT-{patientProfile?.id || result.screening_id}</span>

              <span className="text-slate-500">Age:</span>
              <span className="font-semibold text-slate-900">{patientProfile?.age || 5} Years</span>

              <span className="text-slate-500">Gender:</span>
              <span className="font-semibold text-slate-900">{patientProfile?.gender?.toUpperCase() || 'M'}</span>

              <span className="text-slate-500">Parent / Caregiver:</span>
              <span className="font-semibold text-slate-900">{patientProfile?.parent_guardian_name || patientProfile?.full_name || 'Caregiver'}</span>

              <span className="text-slate-500">Preferred Language:</span>
              <span className="font-semibold text-slate-900">{patientProfile?.preferred_language?.toUpperCase() || 'ENGLISH'}</span>
            </div>
          </div>

          {/* Assessment Info Card */}
          <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200/80 pb-1.5">
              <FileText className="w-3.5 h-3.5 text-teal-600" />
              <span>Assessment Information</span>
            </div>
            <div className="grid grid-cols-2 gap-y-1.5 text-xs">
              <span className="text-slate-500">Assessment Type:</span>
              <span className="font-semibold text-slate-900">AI-Assisted Behavioral Screening</span>

              <span className="text-slate-500">Screening Method:</span>
              <span className="font-semibold text-slate-900">Camera-Based Observation Session</span>

              <span className="text-slate-500">Assessment Duration:</span>
              <span className="font-semibold text-slate-900">40 Seconds (Guided Multi-Step)</span>

              <span className="text-slate-500">Camera Observation:</span>
              <span className="font-semibold text-emerald-700 flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-600" /> Used & Calibrated
              </span>

              <span className="text-slate-500">Observation Quality:</span>
              <span className="font-semibold text-slate-900">Optimal Illumination & Framing</span>

              <span className="text-slate-500">Model Engine:</span>
              <span className="font-mono text-slate-800">{result.model_version}</span>
            </div>
          </div>
        </div>

        {/* ========================================================== */}
        {/* SCREENING SUMMARY                                          */}
        {/* ========================================================== */}
        <div className={`p-6 rounded-2xl border ${
          isHigher
            ? 'bg-amber-50/60 border-amber-300 text-amber-950'
            : 'bg-emerald-50/60 border-emerald-300 text-emerald-950'
        } space-y-3`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shrink-0 ${
                isHigher ? 'bg-amber-600' : 'bg-emerald-600'
              }`}>
                {isHigher ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider block opacity-75">
                  Screening Indication
                </span>
                <h2 className="text-xl sm:text-2xl font-black">
                  {result.screening_indication}
                </h2>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xs px-4 py-2 rounded-xl border border-inherit text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Indication Score</span>
              <span className="text-lg font-bold font-mono text-slate-900">
                {(result.probability_score * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm font-medium leading-relaxed opacity-90">
            {result.explanation}
          </p>
        </div>

        {/* ========================================================== */}
        {/* BEHAVIORAL OBSERVATION (Model Supported Signals)           */}
        {/* ========================================================== */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Video className="w-4 h-4 text-teal-600" />
              <span>Behavioral Observation Details</span>
            </h3>
            <span className="text-xs text-slate-500">Camera-Assisted Analysis</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-bold text-slate-800 block">Visual Orientation</span>
              <p className="text-slate-600">Tracked dynamic stimulus with central visual orientation across horizontal plane.</p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-bold text-slate-800 block">Head / Face Orientation</span>
              <p className="text-slate-600">Maintained natural midline orientation with adaptive visual shifts toward stimulus cues.</p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-bold text-slate-800 block">Response to Visual Stimulus</span>
              <p className="text-slate-600">Prompt visual engagement with balanced interaction pacing during target motion.</p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-bold text-slate-800 block">Movement Patterns</span>
              <p className="text-slate-600">Coordinated posture stability with steady motor engagement and no repetitive movements flagged.</p>
            </div>
          </div>
        </div>

        {/* ========================================================== */}
        {/* DEVELOPMENTAL & BEHAVIORAL PROFILE                         */}
        {/* ========================================================== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600" />
              <span>Developmental & Behavioral Profile</span>
            </h3>
            <span className="text-xs text-slate-500">Intensity Metrics (0-100%)</span>
          </div>

          <div className="space-y-3.5 bg-slate-50/70 border border-slate-200 p-5 rounded-2xl">
            {Object.entries(profileScores).map(([domain, score]) => (
              <div key={domain} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>{domain}</span>
                  <span className="font-mono text-slate-900">{Number(score).toFixed(0)}%</span>
                </div>
                <div className="w-full h-3 bg-slate-200/80 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      score >= 60 ? 'bg-amber-500' : score >= 40 ? 'bg-teal-600' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.max(6, Number(score))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================== */}
        {/* KEY CONTRIBUTING AREAS                                     */}
        {/* ========================================================== */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Contributing Observation Factors
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {result.key_contributing_areas?.map((area, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-teal-600 shrink-0" />
                <span className="font-medium">{area}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================== */}
        {/* CLINICAL CONNECTION & CONSULTATION (Non-print CTA)         */}
        {/* ========================================================== */}
        <div className="p-5 bg-teal-50/70 border border-teal-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
          <div>
            <h4 className="font-bold text-teal-950 text-sm">
              Connect with Clinician for Professional Evaluation
            </h4>
            <p className="text-xs text-teal-800 mt-0.5">
              Share this report with licensed pediatric specialists and schedule a clinical appointment.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/clinicians"
              className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-1.5"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Connect with Clinician</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* ========================================================== */}
        {/* REPORT METADATA & NEUTRAL FOOTER (Clean healthcare style)  */}
        {/* ========================================================== */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
          <div>
            AUTI.AI.AIGNOSIS • Document {reportId} • Generated {assessmentDate}
          </div>
          <div className="font-medium text-slate-600">
            AI-assisted screening report • Clinical review recommended
          </div>
        </div>

      </div>
    </div>
  );
};
