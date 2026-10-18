import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  UserPlus, Smartphone, ArrowRight, ShieldCheck, 
  AlertCircle, CheckCircle2, Sparkles, User, Baby, Heart 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const PatientRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Step state: 1 = Phone/OTP, 2 = Profile
  const [step, setStep] = useState<1 | 2>(1);
  const [phoneNumber, setPhoneNumber] = useState('+919811223344');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [mockOtpHint, setMockOtpHint] = useState<string | null>(null);

  // Profile fields (Caregiver vs Child distinction)
  const [caregiverName, setCaregiverName] = useState('Priya Sharma');
  const [relationship, setRelationship] = useState('Mother');
  const [childName, setChildName] = useState('Aarav Sharma');
  const [childAge, setChildAge] = useState(5);
  const [childGender, setChildGender] = useState('Male');
  const [language, setLanguage] = useState('English');
  const [consentGiven, setConsentGiven] = useState(true);
  const [historyNotes, setHistoryNotes] = useState('First screening evaluation for early developmental milestones.');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.auth.sendOtp(phoneNumber);
      setMockOtpHint(res.mock_otp || null);
      if (res.mock_otp) {
        setOtp(res.mock_otp);
      }
      setOtpSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch verification OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setError('Please enter a valid OTP code.');
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentGiven) {
      setError('Parental / caregiver consent is mandatory to create a patient profile.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const session = await api.auth.patientRegister({
        phone_number: phoneNumber,
        otp: otp,
        caregiver_name: caregiverName,
        child_name: childName,
        child_age: Number(childAge),
        child_gender: childGender,
        relationship_to_child: relationship,
        preferred_language: language,
        consent_given: consentGiven,
        medical_history_notes: historyNotes
      });

      login(session);
      navigate('/patient/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check details and retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      <div className="max-w-xl w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-teal-600 text-white shadow-md mb-3">
            <UserPlus className="w-6 h-6" />
          </div>
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 mb-2">
            Patient Portal Registration
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Create Patient Account
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {step === 1 ? 'Step 1 of 2: Verify Mobile Number' : 'Step 2 of 2: Caregiver & Child Profile'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div 
            className="bg-teal-600 h-2 rounded-full transition-all duration-300"
            style={{ width: step === 1 ? '50%' : '100%' }}
          />
        </div>

        {/* Main Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {step === 1 ? (
            <div className="space-y-5">
              {/* Development Mode Tip */}
              <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Development Mode: </strong>
                  Enter any valid phone number. A secure 6-digit mock OTP is generated on-the-fly.
                </span>
              </div>

              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Parent / Caregiver Mobile Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+919876543210"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-medium"
                    />
                    <p className="mt-1 text-[11px] text-slate-400">
                      Standard format with country code (e.g., +91 for India)
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
                <form onSubmit={handleProceedToProfile} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Enter Verification OTP
                      </label>
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="text-xs text-teal-700 hover:underline font-medium"
                      >
                        Change Number
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="123456"
                      className="w-full px-4 py-3 text-center tracking-widest text-lg font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    {mockOtpHint && (
                      <p className="mt-2 text-xs text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Development OTP generated: {mockOtpHint}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    Confirm OTP & Set Up Profile
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-5">
              {/* Account Holder Section */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
                  <User className="w-4 h-4 text-teal-600" />
                  Account Holder (Parent / Caregiver)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Caregiver Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={caregiverName}
                      onChange={(e) => setCaregiverName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium"
                      placeholder="e.g. Priya Sharma"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Relationship to Subject
                    </label>
                    <select
                      value={relationship}
                      onChange={(e) => setRelationship(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium bg-white"
                    >
                      <option value="Mother">Mother</option>
                      <option value="Father">Father</option>
                      <option value="Legal Guardian">Legal Guardian</option>
                      <option value="Relative / Caregiver">Relative / Caregiver</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Screening Subject Section */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
                  <Baby className="w-4 h-4 text-teal-600" />
                  Screening Subject (Child / Patient)
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Child Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium"
                    placeholder="e.g. Aarav Sharma"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Age (2 - 16 Years)
                    </label>
                    <input
                      type="number"
                      required
                      min={2}
                      max={16}
                      value={childAge}
                      onChange={(e) => setChildAge(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Gender
                    </label>
                    <select
                      value={childGender}
                      onChange={(e) => setChildGender(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium bg-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other / Prefer not to say</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Language
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium bg-white"
                    >
                      <option value="English">English</option>
                      <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
                      <option value="Hindi">हिन्दी (Hindi)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Developmental / Medical Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={historyNotes}
                    onChange={(e) => setHistoryNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium"
                    placeholder="Any prior observations or notes for the clinician..."
                  />
                </div>
              </div>

              {/* Explicit Consent */}
              <div className="p-3.5 bg-teal-50/60 rounded-xl border border-teal-200/80 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="consent"
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded text-teal-600 border-slate-300 focus:ring-teal-500"
                />
                <label htmlFor="consent" className="text-xs text-teal-950 leading-relaxed cursor-pointer">
                  <strong>Consent for AI-Assisted Screening: </strong>
                  I confirm that I am the parent or legal guardian of the child named above. I understand that AUTI.AI.AIGNOSIS provides screening support and is <strong>not a medical diagnosis</strong>.
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || !consentGiven}
                  className="w-2/3 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? 'Creating Account...' : 'Complete Registration & Open Dashboard'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

          <div className="text-center pt-2">
            <span className="text-xs text-slate-500">
              Already registered?{' '}
              <Link to="/patient/login" className="text-teal-700 hover:underline font-semibold">
                Sign In with Mobile OTP
              </Link>
            </span>
          </div>
        </div>

        {/* Footer Link */}
        <div className="text-center text-xs text-slate-400">
          <Link to="/" className="hover:text-slate-600 hover:underline">
            ← Return to AUTI.AI.AIGNOSIS Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};
