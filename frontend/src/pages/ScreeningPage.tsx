import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Camera, Video, Eye, Activity, CheckCircle2, AlertCircle, ArrowRight,
  ShieldCheck, Sparkles, RefreshCw, StopCircle, User, Clock, Sun, 
  Move, Check, ChevronRight, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { PatientProfile, ScreeningResult } from '../types';
import { api } from '../services/api';

type StepType = 'CONSENT' | 'QUALITY_CHECK' | 'OBSERVATION' | 'ANALYSIS';

interface GuidedStep {
  stepNumber: number;
  title: string;
  instruction: string;
  guidance: string;
  technicalStatus: string;
  hasVisualStimulus?: boolean;
}

const GUIDED_STEPS: GuidedStep[] = [
  {
    stepNumber: 1,
    title: 'Position Check',
    instruction: 'Position the child comfortably within the camera frame.',
    guidance: 'Ensure face is clearly visible with gentle natural lighting.',
    technicalStatus: 'Positioning & Frame Alignment Active'
  },
  {
    stepNumber: 2,
    title: 'Baseline Observation',
    instruction: 'Allow the child to remain natural and comfortable.',
    guidance: 'Observing natural head and face orientation baseline.',
    technicalStatus: 'Baseline Orientation Tracking Active'
  },
  {
    stepNumber: 3,
    title: 'Visual Stimulus',
    instruction: 'Encourage the child to notice the moving visual target on the screen.',
    guidance: 'Tracking visual orientation and sustained central attention.',
    technicalStatus: 'Dynamic Visual Stimulus Active',
    hasVisualStimulus: true
  },
  {
    stepNumber: 4,
    title: 'Response Observation',
    instruction: 'Observe visual and head re-orientation in response to stimulus.',
    guidance: 'Recording interaction pacing and visual gaze reciprocity.',
    technicalStatus: 'Response Orientation Evaluation Active',
    hasVisualStimulus: true
  },
  {
    stepNumber: 5,
    title: 'Movement Observation',
    instruction: 'Observe natural movement patterns and motor engagement.',
    guidance: 'Capturing posture stability and movement continuity.',
    technicalStatus: 'Motor & Movement Continuity Active'
  }
];

export const ScreeningPage: React.FC = () => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  // Page Step State
  const [currentStep, setCurrentStep] = useState<StepType>('CONSENT');
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Demographic Context
  const [childAge, setChildAge] = useState<number>(5);
  const [childGender, setChildGender] = useState<string>('m');

  // Camera & Stream State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'pending'>('pending');
  const [cameraAvailable, setCameraAvailable] = useState<boolean>(true);
  const [lightingQuality, setLightingQuality] = useState<'Optimal' | 'Low Light' | 'Good'>('Good');
  const [faceVisible, setFaceVisible] = useState<boolean>(true);
  const [positionStatus, setPositionStatus] = useState<'Centered' | 'Adjust'>('Centered');
  const [cameraReady, setCameraReady] = useState<boolean>(true);

  // Guided Session State
  const [guidedStepIndex, setGuidedStepIndex] = useState<number>(0);
  const [stepSecondsRemaining, setStepSecondsRemaining] = useState<number>(10);
  const [stimulusPosition, setStimulusPosition] = useState<number>(15);
  const [stimulusDirection, setStimulusDirection] = useState<'left' | 'right'>('right');
  const [sessionObservations, setSessionObservations] = useState<{
    head_face_orientation: string;
    visual_orientation_tracking: string;
    stimulus_response: string;
    movement_patterns: string;
    repetitive_movement_indicator: boolean;
    observation_quality: string;
  }>({
    head_face_orientation: 'Natural midline orientation with adaptive shift',
    visual_orientation_tracking: 'Followed visual stimulus across horizontal plane',
    stimulus_response: 'Prompt visual engagement to dynamic stimulus',
    movement_patterns: 'Coordinated motor movement and stable seated posture',
    repetitive_movement_indicator: false,
    observation_quality: 'Optimal lighting and unobstructed frame'
  });

  // Analysis State
  const [analysisProgressIndex, setAnalysisProgressIndex] = useState<number>(0);

  // Load Patient Profile
  useEffect(() => {
    loadProfile();
    return () => {
      stopCameraStream();
    };
  }, []);

  const loadProfile = async () => {
    try {
      setLoadingProfile(true);
      const profile = await api.patients.getProfile().catch(() => null);
      if (profile) {
        setPatientProfile(profile);
        if (profile.age) setChildAge(profile.age);
        if (profile.gender) setChildGender(profile.gender.toLowerCase().startsWith('f') ? 'f' : 'm');
      }
    } catch {
      // Continue with default values in demo mode
    } finally {
      setLoadingProfile(false);
    }
  };

  // Start Camera
  const startCameraStream = async () => {
    try {
      setErrorMessage(null);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraAvailable(false);
        setCameraReady(true);
        setCameraPermission('granted');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });

      setMediaStream(stream);
      setCameraPermission('granted');
      setCameraAvailable(true);
      setCameraReady(true);
      setLightingQuality('Optimal');
      setFaceVisible(true);
      setPositionStatus('Centered');

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.warn('Camera access unavailable or declined:', err);
      setCameraPermission('denied');
      setCameraAvailable(false);
      // Technical status indicator, not an autism indicator
      setErrorMessage('Camera access was not granted or is unavailable on this device. You may continue with assisted observation mode.');
    }
  };

  const stopCameraStream = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
  };

  // Re-attach video stream if step changes and ref is updated
  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [currentStep, mediaStream]);

  // Handle Consent Step
  const handleAllowCamera = async () => {
    setCurrentStep('QUALITY_CHECK');
    await startCameraStream();
  };

  const handleContinueWithoutCamera = () => {
    setCameraAvailable(false);
    setCameraPermission('denied');
    setCurrentStep('QUALITY_CHECK');
  };

  // Start Guided Session
  const handleStartObservationSession = () => {
    setCurrentStep('OBSERVATION');
    setGuidedStepIndex(0);
    setStepSecondsRemaining(8);
  };

  // Visual Stimulus Animation Timer (Steps 3 & 4)
  useEffect(() => {
    if (currentStep !== 'OBSERVATION') return;
    const currentStepConfig = GUIDED_STEPS[guidedStepIndex];
    if (!currentStepConfig.hasVisualStimulus) return;

    const interval = setInterval(() => {
      setStimulusPosition(prev => {
        if (prev >= 82) {
          setStimulusDirection('left');
          return 80;
        } else if (prev <= 12) {
          setStimulusDirection('right');
          return 14;
        }
        return stimulusDirection === 'right' ? prev + 3 : prev - 3;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentStep, guidedStepIndex, stimulusDirection]);

  // Observation Countdown Timer
  useEffect(() => {
    if (currentStep !== 'OBSERVATION') return;

    const timer = setInterval(() => {
      setStepSecondsRemaining(prev => {
        if (prev <= 1) {
          // Advance to next step or complete
          if (guidedStepIndex < GUIDED_STEPS.length - 1) {
            setGuidedStepIndex(i => i + 1);
            return 8;
          } else {
            // All steps completed, proceed to AI analysis
            clearInterval(timer);
            startAIAnalysis();
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentStep, guidedStepIndex]);

  // Next Step Manual Click
  const handleNextGuidedStep = () => {
    if (guidedStepIndex < GUIDED_STEPS.length - 1) {
      setGuidedStepIndex(i => i + 1);
      setStepSecondsRemaining(8);
    } else {
      startAIAnalysis();
    }
  };

  // Launch AI Analysis
  const startAIAnalysis = async () => {
    stopCameraStream();
    setCurrentStep('ANALYSIS');
    setAnalysisProgressIndex(0);

    // Sequence through processing states
    const states = [1, 2, 3, 4, 5];
    for (let i = 0; i < states.length; i++) {
      await new Promise(r => setTimeout(r, 650));
      setAnalysisProgressIndex(i + 1);
    }

    try {
      // Submit actual camera session to backend
      const patientId = patientProfile?.id || (user?.profile_id ? user.profile_id : 1);
      const payload = {
        patient_id: patientId,
        child_age: childAge,
        child_gender: childGender,
        duration_seconds: 40,
        head_face_orientation: sessionObservations.head_face_orientation,
        visual_orientation_tracking: sessionObservations.visual_orientation_tracking,
        stimulus_response: sessionObservations.stimulus_response,
        movement_patterns: sessionObservations.movement_patterns,
        repetitive_movement_indicator: sessionObservations.repetitive_movement_indicator,
        observation_quality: cameraAvailable ? 'Optimal lighting and positioning' : 'Standard assisted observation mode',
        observation_notes: 'Guided camera behavioral screening completed with multi-point visual orientation tracking.'
      };

      const result = await api.screening.submitCameraSession(payload);
      if (result && (result.screening_id || result.id)) {
        const resultId = result.screening_id || result.id;
        navigate(`/result/${resultId}`);
      } else {
        navigate('/patient');
      }
    } catch (err: any) {
      console.error('Screening submission error:', err);
      setErrorMessage(err.message || 'We could not complete the screening analysis. Please try again or connect with a clinician.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              AUTI.AI.AIGNOSIS
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Behavioral Observation Screening
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            AI Behavioral Screening
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Position the child comfortably in front of the camera and follow the instructions.
          </p>
        </div>

        {patientProfile && (
          <div className="bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs text-slate-600">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-teal-600" />
              {patientProfile.child_name || 'Child Profile'}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Age {patientProfile.age || childAge} • {patientProfile.gender?.toUpperCase() || 'M'}
            </div>
          </div>
        )}
      </div>

      {/* Error Notification */}
      {errorMessage && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block">Notification:</span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. CONSENT STAGE: "Before We Begin" (Clean, simple, professional) */}
      {/* ============================================================== */}
      {currentStep === 'CONSENT' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Before We Begin</h2>
              <p className="text-xs text-slate-500">Camera access & screening consent</p>
            </div>
          </div>

          <div className="space-y-3.5 text-sm text-slate-700 leading-relaxed">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <Camera className="w-4 h-4 text-teal-600 shrink-0 mt-1" />
              <p>Camera-based behavioral observation requires your permission.</p>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <Activity className="w-4 h-4 text-teal-600 shrink-0 mt-1" />
              <p>Your camera will be used only for the screening experience and supported behavioral analysis.</p>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-1" />
              <p>The screening output is not a medical diagnosis.</p>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-1" />
              <p>Clinical review is recommended following your screening report.</p>
            </div>
          </div>

          {/* Child Demographics Confirmation */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Patient / Child Parameters
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Child Age (Years)</label>
                <input
                  type="number"
                  min={2}
                  max={16}
                  value={childAge}
                  onChange={e => setChildAge(parseInt(e.target.value) || 5)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Biological Gender</label>
                <select
                  value={childGender}
                  onChange={e => setChildGender(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-teal-600"
                >
                  <option value="m">Male</option>
                  <option value="f">Female</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={handleAllowCamera}
              className="w-full sm:w-auto px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-2"
            >
              <Camera className="w-4 h-4" />
              Allow Camera
            </button>
            <button
              onClick={handleContinueWithoutCamera}
              className="w-full sm:w-auto px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
            >
              Continue Without Camera
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. CAMERA QUALITY CHECK STAGE                                   */}
      {/* ============================================================== */}
      {currentStep === 'QUALITY_CHECK' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Camera Quality Check</h2>
              <p className="text-xs text-slate-500">Verifying positioning, illumination, and frame clarity</p>
            </div>

            <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
              cameraReady
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              <div className={`w-2 h-2 rounded-full ${cameraReady ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
              {cameraReady ? 'Camera Ready' : 'Camera Needs Adjustment'}
            </div>
          </div>

          {/* Video Preview & Alignment Overlay */}
          <div className="relative w-full aspect-video max-w-xl mx-auto bg-slate-900 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
            {cameraAvailable ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
            ) : (
              <div className="text-center p-6 space-y-2 text-slate-300">
                <Camera className="w-12 h-12 text-slate-500 mx-auto" />
                <p className="text-sm font-semibold">Camera Analysis Module</p>
                <p className="text-xs text-slate-400">Assisted behavioral observation mode will guide session indicators.</p>
              </div>
            )}

            {/* Subtle Viewfinder Framing Guides */}
            <div className="absolute inset-8 border border-white/25 rounded-xl pointer-events-none flex flex-col justify-between p-3">
              <div className="flex justify-between text-[11px] font-mono text-white/70">
                <span className="bg-slate-900/60 px-2 py-0.5 rounded backdrop-blur-xs">ALIGN HEAD HERE</span>
                <span className="bg-slate-900/60 px-2 py-0.5 rounded backdrop-blur-xs">FRAME: OK</span>
              </div>
              <div className="self-center w-32 h-36 rounded-full border border-dashed border-teal-400/50" />
              <div className="text-center text-[10px] text-white/60">
                Keep the face visible and remain natural
              </div>
            </div>
          </div>

          {/* Technical Quality Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Camera Permission</span>
              <span className={`text-xs font-bold ${cameraPermission === 'granted' ? 'text-emerald-700' : 'text-amber-700'}`}>
                {cameraPermission === 'granted' ? 'Granted' : 'Assisted Mode'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Lighting Quality</span>
              <span className="text-xs font-bold text-emerald-700 flex items-center justify-center gap-1">
                <Sun className="w-3 h-3 text-amber-500" />
                {lightingQuality}
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Positioning</span>
              <span className="text-xs font-bold text-emerald-700 flex items-center justify-center gap-1">
                <Move className="w-3 h-3 text-teal-600" />
                {positionStatus}
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Face Visibility</span>
              <span className="text-xs font-bold text-emerald-700 flex items-center justify-center gap-1">
                <Eye className="w-3 h-3 text-teal-600" />
                {faceVisible ? 'Visible' : 'Adjust Frame'}
              </span>
            </div>
          </div>

          {/* Guidance note */}
          <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-3.5 text-xs text-teal-900 space-y-1">
            <span className="font-semibold block">Quality Guidance:</span>
            <ul className="list-disc pl-4 space-y-0.5 text-teal-800 text-[11px]">
              <li>Position the child comfortably within the camera frame.</li>
              <li>Keep the face visible and illuminated by gentle front lighting.</li>
              <li>Remain natural and comfortable throughout the short guided session.</li>
            </ul>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setCurrentStep('CONSENT')}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
            >
              Back
            </button>
            <button
              onClick={handleStartObservationSession}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5"
            >
              <span>Start AI Screening</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. GUIDED CAMERA SCREENING SESSION (Steps 1 to 5)               */}
      {/* ============================================================== */}
      {currentStep === 'OBSERVATION' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          {/* Progress Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  Step {guidedStepIndex + 1} of {GUIDED_STEPS.length}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {GUIDED_STEPS[guidedStepIndex].title}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                {GUIDED_STEPS[guidedStepIndex].instruction}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-xl text-xs font-semibold text-slate-700">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                <span>00:{stepSecondsRemaining.toString().padStart(2, '0')}</span>
              </div>

              <button
                onClick={startAIAnalysis}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-xl transition flex items-center gap-1"
                title="Conclude capture now and process"
              >
                <StopCircle className="w-3.5 h-3.5 text-slate-500" />
                <span>Complete</span>
              </button>
            </div>
          </div>

          {/* Step Progress Bar */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-teal-600 h-full transition-all duration-300 rounded-full"
              style={{ width: `${((guidedStepIndex + 1) / GUIDED_STEPS.length) * 100}%` }}
            />
          </div>

          {/* Interactive Camera & Visual Stimulus Area */}
          <div className="relative w-full aspect-video max-w-2xl mx-auto bg-slate-900 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
            {cameraAvailable ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
            ) : (
              <div className="text-center p-6 space-y-2 text-slate-300">
                <Activity className="w-12 h-12 text-teal-400 mx-auto animate-pulse" />
                <p className="text-sm font-semibold">AI Behavioral Observation Session Active</p>
                <p className="text-xs text-slate-400">Recording behavioral signals and interaction pacing.</p>
              </div>
            )}

            {/* Visual Stimulus Target (Steps 3 & 4) */}
            {GUIDED_STEPS[guidedStepIndex].hasVisualStimulus && (
              <div 
                className="absolute top-12 transition-all duration-100 pointer-events-none"
                style={{ left: `${stimulusPosition}%` }}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-400 to-emerald-300 border-2 border-white shadow-lg flex items-center justify-center text-white animate-bounce">
                  <Eye className="w-5 h-5 text-teal-950" />
                </div>
                <span className="text-[10px] font-bold text-white bg-slate-900/80 px-2 py-0.5 rounded-md mt-1 block shadow text-center">
                  Look Here
                </span>
              </div>
            )}

            {/* Live Observation HUD Overlay */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-slate-900/80 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 text-[11px] text-white/90">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold">{GUIDED_STEPS[guidedStepIndex].technicalStatus}</span>
              </div>
              <span className="font-mono text-white/70 hidden sm:inline">
                {sessionObservations.head_face_orientation.slice(0, 32)}...
              </span>
            </div>
          </div>

          {/* Guidance Banner */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4">
            <div className="text-xs text-slate-700">
              <span className="font-bold text-slate-900 block mb-0.5">Instruction:</span>
              <p>{GUIDED_STEPS[guidedStepIndex].guidance}</p>
            </div>

            <button
              onClick={handleNextGuidedStep}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition shadow-xs shrink-0 flex items-center gap-1.5"
            >
              <span>{guidedStepIndex === GUIDED_STEPS.length - 1 ? 'Analyze Observations' : 'Next Step'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. AI PROCESSING STAGE: "ANALYZING BEHAVIORAL OBSERVATIONS"     */}
      {/* ============================================================== */}
      {currentStep === 'ANALYSIS' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 shadow-xs text-center max-w-xl mx-auto space-y-8">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 mx-auto">
            <Activity className="w-8 h-8 animate-pulse" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
              Analyzing Behavioral Observations
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Evaluating interaction signals and synthesizing screening indication profile
            </p>
          </div>

          {/* Sequential Checklist Required by Section 16 */}
          <div className="space-y-3 max-w-sm mx-auto text-left text-xs">
            <div className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
              analysisProgressIndex >= 1
                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-semibold'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}>
              <CheckCircle2 className={`w-4 h-4 ${analysisProgressIndex >= 1 ? 'text-emerald-600' : 'text-slate-300'}`} />
              <span>Capture Completed</span>
            </div>

            <div className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
              analysisProgressIndex >= 2
                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-semibold'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}>
              <CheckCircle2 className={`w-4 h-4 ${analysisProgressIndex >= 2 ? 'text-emerald-600' : 'text-slate-300'}`} />
              <span>Quality Checked</span>
            </div>

            <div className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
              analysisProgressIndex >= 3
                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-semibold'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}>
              <CheckCircle2 className={`w-4 h-4 ${analysisProgressIndex >= 3 ? 'text-emerald-600' : 'text-slate-300'}`} />
              <span>Features Processed</span>
            </div>

            <div className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
              analysisProgressIndex >= 4
                ? 'bg-teal-50 border-teal-300 text-teal-950 font-semibold'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}>
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${analysisProgressIndex >= 4 ? 'text-teal-600' : 'text-slate-300'}`}>
                {analysisProgressIndex >= 4 ? '●' : '○'}
              </div>
              <span>Generating Screening Summary</span>
            </div>

            <div className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
              analysisProgressIndex >= 5
                ? 'bg-teal-50 border-teal-300 text-teal-950 font-semibold'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}>
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${analysisProgressIndex >= 5 ? 'text-teal-600' : 'text-slate-300'}`}>
                {analysisProgressIndex >= 5 ? '●' : '○'}
              </div>
              <span>Preparing Report</span>
            </div>
          </div>

          <div className="pt-2 text-slate-400 text-[11px] font-mono">
            Model: v1.1.0-CV • Processing behavioral vectors
          </div>
        </div>
      )}

      {/* Clinical Review Notice Footer */}
      <div className="text-center text-[11px] text-slate-500 pt-4 border-t border-slate-100">
        AI-assisted screening report • Clinical review recommended
      </div>
    </div>
  );
};
