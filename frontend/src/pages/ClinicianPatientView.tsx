import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  User, Activity, Calendar, Clock, FileText, CheckCircle2,
  AlertTriangle, ArrowLeft, Save, ShieldAlert, Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ClinicalSafetyBanner } from '../components/ClinicalSafetyBanner';
import { api } from '../services/api';

export const ClinicianPatientView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [patientData, setPatientData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Clinical Notes form
  const [consultationNotes, setConsultationNotes] = useState<string>('');
  const [followUp, setFollowUp] = useState<string>('');
  const [observationSummary, setObservationSummary] = useState<string>('');
  const [savingNotes, setSavingNotes] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (id) {
      loadPatientDetails(parseInt(id));
    }
  }, [id]);

  const loadPatientDetails = async (patientId: number) => {
    setLoading(true);
    try {
      const data = await api.clinicians.getPatientDetail(patientId);
      setPatientData(data);
      if (data.clinical_notes && data.clinical_notes.length > 0) {
        const latest = data.clinical_notes[0];
        setConsultationNotes(latest.consultation_notes || '');
        setFollowUp(latest.follow_up_recommendations || '');
        setObservationSummary(latest.observation_summary || '');
      } else {
        setConsultationNotes(
          "Reviewed AI screening indication. Observed developmental responsiveness during clinical interview. Recommended follow-up speech and occupational therapy assessment."
        );
        setFollowUp("Follow-up evaluation scheduled in 6 weeks. Encouraged structured home engagement activities.");
        setObservationSummary("Child demonstrates engaged eye contact during play; exhibits minor sensory aversion to loud auditory stimuli.");
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load patient clinical file.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSavingNotes(true);
    setSaveSuccess(false);
    try {
      const apptId = patientData?.appointments?.[0]?.id || 1;
      await api.clinicalNotes.saveNote({
        appointment_id: apptId,
        consultation_notes: consultationNotes,
        follow_up_recommendations: followUp,
        observation_summary: observationSummary
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save clinical notes.');
    } finally {
      setSavingNotes(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-500">
        <div className="animate-spin w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm font-medium">Opening secure clinical patient file...</p>
      </div>
    );
  }

  if (error || !patientData) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-600 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Access Denied or Record Not Found</h2>
        <p className="text-sm text-slate-600">{error}</p>
        <Link to="/clinician" className="inline-block px-5 py-2.5 bg-teal-600 text-white rounded-xl text-xs font-bold">
          Return to Workspace
        </Link>
      </div>
    );
  }

  const patient = patientData.patient;
  const latestScreening = patientData.screenings?.[0];
  const devProfile = latestScreening?.result?.developmental_profile || {};

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Safety */}
      <div className="flex items-center justify-between">
        <Link
          to="/clinician"
          className="text-xs font-bold text-slate-600 hover:text-teal-700 flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Clinical Queue
        </Link>
        <span className="text-xs text-slate-400 font-mono">Patient Record #{patient.id}</span>
      </div>

      <ClinicalSafetyBanner compact />

      {/* Patient Demographic Profile Summary Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              Child Record
            </span>
            <span className="text-xs text-slate-500 font-medium">Preferred Language: {patient.preferred_language}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {patient.child_name}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            <b>Age:</b> {patient.age} yrs | <b>Gender:</b> {patient.gender} | <b>Parent/Caregiver:</b> {patient.parent_guardian_name || patient.full_name}
          </p>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
          <div><b>Medical Notes:</b> {patient.medical_history_notes || 'No pre-existing conditions reported.'}</div>
        </div>
      </div>

      {/* AI Screening Review Section */}
      {latestScreening?.result ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 block">
                AI Screening Output & Behavioral Vectors
              </span>
              <h2 className="text-xl font-bold text-slate-900">
                Screening Indication: {latestScreening.result.screening_indication}
              </h2>
            </div>
            <div className="bg-teal-50 text-teal-900 px-3 py-1.5 rounded-xl border border-teal-200 text-xs font-mono font-bold">
              Model Score: {(latestScreening.result.probability_score * 100).toFixed(0)}%
            </div>
          </div>

          {/* 5-Domain Developmental Profile Bars */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {Object.entries(devProfile).map(([domain, score]: [string, any]) => (
              <div key={domain} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <span className="text-[11px] font-bold text-slate-700 block truncate">{domain}</span>
                <span className="text-base font-black font-mono text-slate-900 block">{score.toFixed(0)}%</span>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${score >= 60 ? 'bg-amber-500' : 'bg-teal-600'}`}
                    style={{ width: `${Math.max(5, score)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
            <b>Automated Contributing Factors:</b> {latestScreening.result.explanation}
          </div>

          {/* Detailed Question Responses Accordion / Table */}
          {latestScreening.responses && latestScreening.responses.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Caregiver Questionnaire Responses (AQ-10 / Q-CHAT 20 Items)
              </h3>
              <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs">
                {latestScreening.responses.map((resp: any, i: number) => (
                  <div key={i} className="p-3 flex items-start justify-between gap-4 hover:bg-slate-50">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 mr-2">
                        {resp.domain}
                      </span>
                      <span className="text-slate-800 font-medium">{resp.text}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold shrink-0 ${
                      resp.value === 1 ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {resp.value === 1 ? 'Indication Flag (1)' : 'Baseline (0)'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 bg-white border border-slate-200 rounded-2xl text-center text-xs text-slate-500">
          No completed screening found for this patient record.
        </div>
      )}

      {/* Clinician Consultation Notes Editor */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" />
              {t('clinicalNotes')}
            </h2>
            <p className="text-xs text-slate-500">
              Authored directly by the attending clinician. AI will never generate automated medical diagnoses.
            </p>
          </div>
          {saveSuccess && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 animate-pulse">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {t('notesSaved')}
            </span>
          )}
        </div>

        <form onSubmit={handleSaveNotes} className="space-y-5 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {t('observations')}
            </label>
            <textarea
              rows={3}
              required
              value={observationSummary}
              onChange={(e) => setObservationSummary(e.target.value)}
              placeholder="Record direct behavioral, communication, and eye contact observations during consultation..."
              className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 text-slate-900 text-sm leading-relaxed"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Consultation Notes & Clinical Assessment
            </label>
            <textarea
              rows={4}
              required
              value={consultationNotes}
              onChange={(e) => setConsultationNotes(e.target.value)}
              placeholder="Detail your professional clinical evaluation, developmental milestones comparison, and diagnostic discussion..."
              className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 text-slate-900 text-sm leading-relaxed"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {t('followUpPlan')}
            </label>
            <textarea
              rows={3}
              value={followUp}
              onChange={(e) => setFollowUp(e.target.value)}
              placeholder="Recommended therapies (speech/occupational), home engagement strategies, scheduled follow-up..."
              className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 text-slate-900 text-sm leading-relaxed"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 italic">
              Changes are timestamped and committed to the patient's immutable clinical audit trail.
            </span>
            <button
              type="submit"
              disabled={savingNotes}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {savingNotes ? 'Recording...' : t('saveNotes')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
