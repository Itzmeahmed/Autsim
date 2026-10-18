export type UserRole = 'patient' | 'clinician' | 'admin';

export type LanguageCode = 'en' | 'kn' | 'hi';

export interface UserSession {
  access_token: string;
  user_id: number;
  role: UserRole;
  full_name?: string;
  profile_id?: number;
}

export interface PatientProfile {
  id: number;
  user_id: number;
  full_name: string;
  child_name: string;
  date_of_birth?: string;
  age: number;
  gender: string;
  parent_guardian_name?: string;
  preferred_language: string;
  medical_history_notes?: string;
  created_at: string;
}

export interface ClinicianProfile {
  id: number;
  user_id: number;
  full_name: string;
  specialty: string;
  qualification: string;
  experience_years: number;
  languages: string;
  bio?: string;
  availability_hours: string;
  is_verified_by_admin: boolean;
  created_at: string;
}

export interface QuestionnaireItem {
  id: string;
  domain: string;
  text: {
    en: string;
    kn: string;
    hi: string;
  };
  description: string;
  reverse_scored: boolean;
}

export interface ScreeningResult {
  id: number;
  screening_id: number;
  screening_indication: 'Higher Indication' | 'Lower Indication';
  probability_score: number;
  developmental_profile: {
    Communication: number;
    'Social Interaction': number;
    'Sensory Responses': number;
    'Repetitive Behaviors': number;
    'Daily-Life Skills': number;
  };
  key_contributing_areas: string[];
  explanation: string;
  disclaimer: string;
  model_version: string;
  created_at: string;
}

export interface ScreeningSummary {
  id: number;
  patient_id: number;
  child_age: number;
  total_score: number;
  status: string;
  created_at: string;
  result?: ScreeningResult;
}

export interface Appointment {
  id: number;
  patient_id: number;
  clinician_id: number;
  appointment_date: string;
  appointment_time: string;
  status: 'Pending' | 'Confirmed' | 'Rescheduled' | 'Cancelled' | 'Completed';
  reason_for_visit?: string;
  patient_name?: string;
  child_name?: string;
  clinician_name?: string;
  clinician_specialty?: string;
  created_at: string;
}

export interface ClinicalNote {
  id: number;
  appointment_id: number;
  clinician_id: number;
  patient_id: number;
  consultation_notes: string;
  follow_up_recommendations?: string;
  observation_summary?: string;
  created_at: string;
}

export interface AuditLog {
  id: number;
  user_id?: number;
  action: string;
  resource: string;
  ip_address?: string;
  status: string;
  details?: string;
  created_at: string;
}

export interface AdminStats {
  total_users: number;
  total_patients: number;
  total_clinicians: number;
  pending_clinician_verifications: number;
  total_screenings: number;
  total_appointments: number;
  high_indication_screenings: number;
}
