import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, Smartphone, Stethoscope, ArrowRight, 
  Activity, Users, Sparkles, HeartHandshake, CheckCircle2,
  FileText, Calendar, Camera, Lock, Eye, ChevronDown, ChevronUp,
  Check, HelpCircle, Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingAuthPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: 'Does AUTI.AI.AIGNOSIS diagnose autism?',
      a: 'No. AUTI.AI.AIGNOSIS is strictly an AI-assisted screening and clinical connection platform. It does not provide a medical diagnosis. Its structured reports and behavioral observations are designed to help caregivers understand developmental indicators and share validated observations with qualified clinicians.'
    },
    {
      q: 'How does camera-based screening work without extra hardware?',
      a: 'Using your device webcam, our guided screening analyzes validated visual tracking and head/face orientation during gentle on-screen visual prompts. No private videos are stored publicly or sold.'
    },
    {
      q: 'How is patient and camera data protected?',
      a: 'We implement zero raw video storage retention, end-to-end HTTPS encryption, role-based authorization (RBAC), and strict IDOR defenses. Only authorized clinicians with active appointments can review patient screening reports.'
    },
    {
      q: 'Can clinicians review previous screening history?',
      a: 'Yes. Verified clinicians can access longitudinal assessment records, view 5-domain developmental profiles, add clinical consultation notes, and schedule follow-ups.'
    }
  ];

  return (
    <div className="bg-white min-h-screen text-slate-800">
      
      {/* ============================================================ */}
      {/* 1. HERO SECTION                                              */}
      {/* ============================================================ */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-slate-50 via-white to-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 text-teal-800 text-xs font-extrabold uppercase tracking-wider mb-6 border border-teal-200">
            <Activity className="w-3.5 h-3.5 text-teal-600" />
            AUTI.AI.AIGNOSIS
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
            AI-Assisted Autism Screening <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-700">
              & Clinical Connection Platform
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            A secure and accessible platform for AI-assisted behavioral screening and clinical connection.
          </p>

          {/* Primary & Secondary Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/screening"
              className="w-full sm:w-auto px-7 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-sm flex items-center justify-center gap-2"
            >
              <Camera className="w-4 h-4" />
              <span>Start AI Screening</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/clinicians"
              className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm rounded-xl transition border border-slate-300 flex items-center justify-center gap-2"
            >
              <Stethoscope className="w-4 h-4 text-teal-600" />
              <span>Connect with Clinician</span>
            </Link>
          </div>

          <div className="mt-4 flex items-center justify-center gap-4 text-xs font-semibold text-slate-500">
            <Link to="/patient/login" className="hover:text-teal-700 transition">
              Patient Login →
            </Link>
            <span>•</span>
            <Link to="/clinician/login" className="hover:text-teal-700 transition">
              Clinician Login →
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. ABOUT SECTION                                             */}
      {/* ============================================================ */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 sm:p-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-teal-800 text-xs font-bold uppercase tracking-wider border border-slate-200">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            Responsible Healthcare Technology
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            About AUTI.AI.AIGNOSIS
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
            AUTI.AI.AIGNOSIS was conceived to eliminate the friction in early pediatric developmental screening. By replacing prolonged static forms with brief, guided camera behavioral observation and connecting families directly with licensed developmental pediatricians, the platform provides actionable clarity while preserving strict clinical rigor.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">Non-Diagnostic Screening</span>
              <span className="text-slate-500">Provides observational indicators to support—never replace—qualified medical evaluation.</span>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">Standard Hardware</span>
              <span className="text-slate-500">Runs seamlessly on everyday smartphones, tablets, and laptops without external equipment.</span>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block mb-1">Direct Clinical Link</span>
              <span className="text-slate-500">Instant connection to verified clinical specialists with automated appointment booking.</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. HOW IT WORKS (Five-Step Workflow)                         */}
      {/* ============================================================ */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            Streamlined Screening Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
            How It Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            A guided five-step journey from caregiver registration to professional consultation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Step 1 */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-extrabold text-teal-700 font-mono block mb-2">01</span>
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm mb-3 border border-teal-200">
                <Smartphone className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Create Profile</h4>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Secure mobile OTP authentication and basic pediatric profile setup with caregiver consent.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-extrabold text-teal-700 font-mono block mb-2">02</span>
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm mb-3 border border-teal-200">
                <Camera className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Camera-Based Screening</h4>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Brief guided observation session with visual prompts, lighting check, and positioning alignment.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-extrabold text-teal-700 font-mono block mb-2">03</span>
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm mb-3 border border-teal-200">
                <Activity className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">AI-Assisted Analysis</h4>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Evaluates head orientation, dynamic visual orientation, and movement continuity patterns.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-extrabold text-teal-700 font-mono block mb-2">04</span>
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm mb-3 border border-teal-200">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Professional Report</h4>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                5-domain developmental intensity profile, observational factors, and instant print/PDF download.
              </p>
            </div>
          </div>

          {/* Step 5 */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-xs font-extrabold text-teal-700 font-mono block mb-2">05</span>
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm mb-3 border border-teal-200">
                <Stethoscope className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Connect with Clinician</h4>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Schedule consultations with verified pediatric specialists to discuss findings and next steps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. AI SCREENING SECTION                                      */}
      {/* ============================================================ */}
      <section className="py-16 bg-slate-50/70 border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                Computer Vision Screening
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Guided Behavioral Observation Instead of Long Forms
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Rather than filling out tiresome 20-item questionnaires, parents can complete a 40-second camera screening session. Children naturally respond to playful on-screen visual prompts while the system records supported behavioral signals:
              </p>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Visual orientation tracking & sustained central focus</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Head and face re-orientation pacing to stimuli</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Motor posture stability and movement continuity</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <span>Zero facial recognition, beauty, or race metrics used</span>
                </li>
              </ul>
              <div className="pt-2">
                <Link
                  to="/screening"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition shadow-xs"
                >
                  <Camera className="w-4 h-4" />
                  <span>Experience Camera Screening</span>
                </Link>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-800">Observation Signal Quality</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Calibrated
                </span>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span>Visual Orientation Tracking</span>
                    <span className="text-teal-700 font-mono">Central Focus</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-teal-600 h-full rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span>Stimulus Re-Orientation</span>
                    <span className="text-teal-700 font-mono">Active</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-teal-600 h-full rounded-full" style={{ width: '78%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-slate-700 mb-1">
                    <span>Motor Pattern Stability</span>
                    <span className="text-teal-700 font-mono">Optimal</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-teal-600 h-full rounded-full" style={{ width: '92%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. CLINICAL CONNECTION & DIRECTORY                           */}
      {/* ============================================================ */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            Professional Network
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
            Connect Directly with Verified Clinicians
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Licensed developmental pediatricians, speech therapists, and child psychologists review your screening report and guide next steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Verified Credentials</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every clinician is vetted and approved by our medical administration prior to receiving patient booking access.
            </p>
          </div>

          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Real-Time Scheduling</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Select available date and time slots with double-booking prevention and automated appointment status tracking.
            </p>
          </div>

          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Clinical Consultation Notes</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Clinicians record structured observation notes and developmental follow-up recommendations directly onto your patient file.
            </p>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link
            to="/clinicians"
            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl transition shadow-xs"
          >
            <span>Browse Clinician Directory</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. SECURITY & PRIVACY                                        */}
      {/* ============================================================ */}
      <section className="py-16 bg-slate-900 text-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-400 bg-teal-950 px-3 py-1 rounded-full border border-teal-800">
              Healthcare Security Standards
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3">
              Patient Data Security & Privacy Protection
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Architected with medical-grade security controls, zero public video exposures, and rigorous access boundaries.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
              <Lock className="w-5 h-5 text-teal-400" />
              <h4 className="font-bold text-white text-sm">IDOR Defense</h4>
              <p className="text-slate-400 leading-relaxed">
                Resource-level authorization ensures patients can only access their own reports and clinicians only view authorized bookings.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
              <Eye className="w-5 h-5 text-teal-400" />
              <h4 className="font-bold text-white text-sm">Zero Video Retention</h4>
              <p className="text-slate-400 leading-relaxed">
                Camera feeds are analyzed in real-time memory and never permanently stored as public video assets.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
              <Shield className="w-5 h-5 text-teal-400" />
              <h4 className="font-bold text-white text-sm">Role Isolation (RBAC)</h4>
              <p className="text-slate-400 leading-relaxed">
                Dedicated gateways for Patients, Clinicians, and Administrators with isolated token validation.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
              <CheckCircle2 className="w-5 h-5 text-teal-400" />
              <h4 className="font-bold text-white text-sm">Audit Trail</h4>
              <p className="text-slate-400 leading-relaxed">
                Every screening generation, status update, and authorization check is logged to an immutable security audit trail.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. DEVELOPERS SECTION                                        */}
      {/* ============================================================ */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            Engineering Team
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
            Meet the Developers
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Building AUTI.AI.AIGNOSIS through AI, secure software engineering, thoughtful design and rigorous testing.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Dev 1 */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 font-black text-lg flex items-center justify-center mx-auto border border-teal-200">
              MA
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Mohammed Ahmed</h4>
            <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 inline-block">
              AI/ML Engineer & Project Lead
            </span>
            <p className="text-xs text-slate-500 pt-1">
              Machine learning models, dataset preprocessing, behavioral computer vision, and evaluation pipelines.
            </p>
          </div>

          {/* Dev 2 */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 font-black text-lg flex items-center justify-center mx-auto border border-teal-200">
              NR
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Nawaz ur Rahman Khan</h4>
            <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 inline-block">
              Backend & Security Engineer
            </span>
            <p className="text-xs text-slate-500 pt-1">
              FastAPI architecture, PostgreSQL database schema, OTP validation, IDOR protection, and RBAC authorization.
            </p>
          </div>

          {/* Dev 3 */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 font-black text-lg flex items-center justify-center mx-auto border border-teal-200">
              MS
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Mohammed Saifulla</h4>
            <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 inline-block">
              Frontend & UI/UX Engineer
            </span>
            <p className="text-xs text-slate-500 pt-1">
              React TypeScript application, guided camera experience, multilingual localization, and clinical report printing.
            </p>
          </div>

          {/* Dev 4 */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 font-black text-lg flex items-center justify-center mx-auto border border-teal-200">
              NS
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Nischitha S</h4>
            <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 inline-block">
              QA, Testing & Product Engineer
            </span>
            <p className="text-xs text-slate-500 pt-1">
              Comprehensive test suites, accessibility audits, clinical safety verification, and responsive QA testing.
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link
            to="/about"
            className="text-xs font-semibold text-teal-700 hover:underline inline-flex items-center gap-1"
          >
            <span>Learn more about the engineering roles & project story</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 8. FAQ SECTION                                               */}
      {/* ============================================================ */}
      <section className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
              Common Questions
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition shadow-xs"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-800 hover:text-teal-700 transition"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-teal-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 9. FOOTER                                                    */}
      {/* ============================================================ */}
      <footer className="border-t border-slate-200 py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <p className="font-extrabold text-slate-900 tracking-tight">AUTI.AI.AIGNOSIS</p>
            <p className="mt-0.5 text-slate-500">AI-Assisted Autism Screening & Clinical Connection Platform</p>
          </div>
          <div className="flex flex-wrap gap-5 font-medium">
            <Link to="/about" className="hover:text-teal-700">Meet the Developers</Link>
            <Link to="/patient/login" className="hover:text-teal-700">Patient Portal</Link>
            <Link to="/clinician/login" className="hover:text-teal-700">Clinician Portal</Link>
            <Link to="/admin/login" className="hover:text-teal-700">Admin Portal</Link>
          </div>
          <p className="text-slate-400">© 2026 AUTI.AI.AIGNOSIS. All rights reserved.</p>
        </div>
        <div className="text-center text-[11px] text-slate-400 mt-4">
          AI-assisted screening report • Clinical review recommended
        </div>
      </footer>

    </div>
  );
};
