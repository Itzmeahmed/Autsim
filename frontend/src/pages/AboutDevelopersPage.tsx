import React from 'react';
import { 
  Brain, ShieldCheck, Layout, CheckCircle2, 
  ArrowRight, Users, Sparkles, AlertCircle, HeartHandshake, Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface DeveloperMember {
  id: string;
  name: string;
  role: string;
  initials: string;
  accentColor: string;
  badge: string;
  shortDescription: string;
  responsibilities: string[];
}

const TEAM_MEMBERS: DeveloperMember[] = [
  {
    id: 'ahmed',
    name: 'Mohammed Ahmed',
    role: 'AI/ML Engineer & Project Lead',
    initials: 'MA',
    accentColor: 'from-blue-600 to-indigo-700',
    badge: 'AI & Data Science',
    shortDescription: 'Led end-to-end model development, feature engineering, and validated screening algorithms.',
    responsibilities: [
      'AI/ML model development & hyperparameter tuning',
      'Autism screening dataset preparation & cleaning',
      'Data preprocessing and leakage-free feature engineering',
      'Model training, evaluation & metrics logging',
      'AI-assisted screening logic & domain scoring',
      'ML inference engine backend integration',
      'Overall technical project coordination'
    ]
  },
  {
    id: 'nawaz',
    name: 'Nawaz ur Rahman Khan',
    role: 'Backend & Security Engineer',
    initials: 'NR',
    accentColor: 'from-teal-600 to-emerald-700',
    badge: 'Backend & Cybersecurity',
    shortDescription: 'Architected robust FastAPI microservices, database schemas, cryptographic OTP, and strict RBAC.',
    responsibilities: [
      'FastAPI RESTful API development & architecture',
      'Normalized SQLite/PostgreSQL relational database schema',
      'Patient cryptographic OTP verification system',
      'Strict Role-Based Access Control (RBAC) & IDOR prevention',
      'Appointment booking engine with conflict resolution',
      'Security headers, CORS hardening & audit logging',
      'Session security & secret key management'
    ]
  },
  {
    id: 'saifulla',
    name: 'Mohammed Saifulla',
    role: 'Frontend & UI/UX Engineer',
    initials: 'MS',
    accentColor: 'from-sky-600 to-blue-700',
    badge: 'Frontend & Healthcare UI/UX',
    shortDescription: 'Crafted the healthcare UI/UX design system, 3 dedicated role portals, and multilingual accessibility.',
    responsibilities: [
      'React frontend SPA development & state management',
      'Healthcare design system (pure white theme, teal/blue accents)',
      'Independent Patient, Clinician, and Admin portal interfaces',
      'Adaptive 20-item screening questionnaire flow',
      'Multilingual interface support (English, Kannada, Hindi)',
      'Responsive mobile-first layout & print stylesheets',
      'Frontend-backend API integration'
    ]
  },
  {
    id: 'nischitha',
    name: 'Nischitha S',
    role: 'QA, Testing & Product Engineer',
    initials: 'NS',
    accentColor: 'from-indigo-600 to-purple-700',
    badge: 'Quality Assurance & Validation',
    shortDescription: 'Engineered comprehensive test suites, boundary audits, and clinical workflow validation.',
    responsibilities: [
      'End-to-end functional & user flow testing',
      'Automated integration and API security test suites',
      'Boundary validation & edge-case test design',
      'Bug identification, tracing, and issue resolution',
      'Clinical non-diagnostic disclaimer verification',
      'Product quality standards & documentation review',
      'Deployment support & cross-browser compatibility'
    ]
  }
];

const DEVELOPMENT_STAGES = [
  {
    step: '01',
    title: 'AI & Machine Learning',
    lead: 'Mohammed Ahmed',
    icon: Brain,
    description: 'Data curation, feature engineering, and training champion Random Forest & XGBoost classifiers with zero leakage.'
  },
  {
    step: '02',
    title: 'Backend & Security',
    lead: 'Nawaz ur Rahman Khan',
    icon: ShieldCheck,
    description: 'Constructing FastAPI backend, relational database, secure cryptographic OTP flow, and RBAC authorization.'
  },
  {
    step: '03',
    title: 'Frontend & UI/UX',
    lead: 'Mohammed Saifulla',
    icon: Layout,
    description: 'Building separate portals for Patients, Clinicians, and Admins with responsive healthcare aesthetics.'
  },
  {
    step: '04',
    title: 'Testing & Product Quality',
    lead: 'Nischitha S',
    icon: CheckCircle2,
    description: 'Executing unit tests, regression suites, IDOR vulnerability checks, and complete user-journey validation.'
  }
];

export const AboutDevelopersPage: React.FC = () => {
  return (
    <div className="bg-white min-h-screen text-slate-800">
      {/* Top Banner / Breadcrumb */}
      <div className="border-b border-slate-100 bg-slate-50/60 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Link to="/" className="text-teal-700 hover:underline font-medium">Home</Link>
            <span>/</span>
            <span className="text-slate-700 font-semibold">Meet the Developers</span>
          </div>
          <span className="bg-teal-50 text-teal-700 px-2.5 py-0.5 rounded-full font-medium border border-teal-200/60">
            Final Year Engineering Project 2026
          </span>
        </div>
      </div>

      {/* Hero Header */}
      <section className="py-14 sm:py-18 bg-gradient-to-b from-slate-50/80 via-white to-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 text-teal-800 text-xs font-semibold uppercase tracking-wider mb-4 border border-teal-200">
            <Users className="w-3.5 h-3.5 text-teal-600" />
            Project Makers & Engineering Team
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Meet the Developers
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-slate-600 font-normal max-w-3xl mx-auto leading-relaxed">
            Built by a student team passionate about AI, healthcare technology, software engineering, and creating meaningful technology solutions.
          </p>

          <div className="mt-6 p-4 rounded-xl bg-blue-50/70 border border-blue-100 text-left max-w-2xl mx-auto flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-blue-900 leading-relaxed">
              <strong>AUTI.AI.AIGNOSIS</strong> is developed by a four-member engineering team combining AI/ML, backend engineering, cybersecurity, frontend development, UI/UX, testing, and product development. Our goal is to build a secure, accessible, and responsible AI-assisted screening platform that helps users understand screening results and connect with qualified clinicians.
            </p>
          </div>
        </div>
      </section>

      {/* Developer Cards Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Core Engineering Team
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-500">
            Four specialized engineering disciplines united under one healthcare mission
          </p>
        </div>

        {/* 4 Cards Grid: 4 in row on Desktop, 2 on Tablet, 1 on Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {TEAM_MEMBERS.map((member) => (
            <div 
              key={member.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group"
            >
              {/* Card Header & Avatar */}
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${member.accentColor} text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0`}>
                    {member.initials}
                  </div>
                  <div>
                    <span className="inline-block text-[11px] font-semibold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 mb-1">
                      {member.badge}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 leading-snug group-hover:text-teal-700 transition-colors">
                      {member.name}
                    </h3>
                  </div>
                </div>

                <div className="text-xs font-semibold text-teal-800 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 mb-3">
                  {member.role}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {member.shortDescription}
                </p>

                <div className="border-t border-slate-100 pt-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Key Responsibilities:
                  </p>
                  <ul className="space-y-1.5">
                    {member.responsibilities.map((resp, idx) => (
                      <li key={idx} className="text-xs text-slate-600 flex items-start gap-1.5 leading-snug">
                        <span className="text-teal-600 font-bold shrink-0">•</span>
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Card Footer / Professional Tag */}
              <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between font-medium">
                <span>AUTI.AI.AIGNOSIS Project</span>
                <span className="text-teal-700 font-semibold">2026</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Project Contribution Section: "How We Built AUTI.AI.AIGNOSIS" */}
      <section className="py-16 bg-slate-50/80 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Methodology & Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
              How We Built AUTI.AI.AIGNOSIS
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              A structured 4-stage engineering lifecycle from data science to production quality assurance.
            </p>
          </div>

          {/* Horizontal timeline on Desktop, vertical on Mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {DEVELOPMENT_STAGES.map((stage, idx) => {
              const IconComp = stage.icon;
              return (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm relative flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-black text-teal-700 tracking-tight">
                        {stage.step}
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
                        <IconComp className="w-5 h-5" />
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-1">
                      {stage.title}
                    </h3>
                    <p className="text-xs font-semibold text-teal-700 mb-2">
                      Lead: {stage.lead}
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {stage.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-medium flex items-center justify-between">
                    <span>Phase {stage.step}</span>
                    <span className="text-emerald-700 font-semibold">Completed</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Collaboration: "One Team. One Goal." */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto mb-4 border border-teal-200">
          <HeartHandshake className="w-6 h-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          One Team. One Goal.
        </h2>
        <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
          AUTI.AI.AIGNOSIS brings together four complementary engineering roles to create one complete healthcare technology platform — from data and AI to secure backend systems, user experience, testing, and deployment.
        </p>

        {/* Action Link to Portals */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            to="/patient/login"
            className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-sm transition-all"
          >
            Explore Patient Portal <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/clinician/login"
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm px-6 py-3 rounded-xl border border-slate-200 shadow-sm transition-all"
          >
            Clinician Portal
          </Link>
          <Link
            to="/admin/login"
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm px-6 py-3 rounded-xl border border-slate-200 shadow-sm transition-all"
          >
            Admin Portal
          </Link>
        </div>
      </section>

      {/* Project Mission Note */}
      <section className="pb-16 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-xs leading-relaxed text-center">
          AUTI.AI.AIGNOSIS is an <strong>AI-assisted autism screening</strong> and clinical connection platform designed to provide an accessible digital screening experience and help users connect with qualified clinicians.
        </div>
      </section>

      {/* Footer Credit */}
      <footer className="border-t border-slate-200 py-8 bg-white text-center text-xs text-slate-500">
        <p className="font-semibold text-slate-700">AUTI.AI.AIGNOSIS</p>
        <p className="mt-1">Designed & Developed by the AUTI.AI.AIGNOSIS Project Team</p>
        <p className="mt-1 text-slate-400">© 2026 AUTI.AI.AIGNOSIS. All rights reserved.</p>
      </footer>
    </div>
  );
};
