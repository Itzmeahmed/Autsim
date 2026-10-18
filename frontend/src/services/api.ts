import {
  UserSession, PatientProfile, ClinicianProfile, QuestionnaireItem,
  ScreeningResult, ScreeningSummary, Appointment, ClinicalNote, AuditLog, AdminStats
} from '../types';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('autiaignosis_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let errorDetail = 'Something went wrong. Please try again.';
    try {
      const errJson = await response.json();
      if (errJson && errJson.detail) {
        errorDetail = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
      }
    } catch {
      errorDetail = response.statusText;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  auth: {
    sendOtp: (phoneNumber: string) =>
      request<{ message: string; phone_number: string; expires_in_seconds: number; mock_otp?: string }>('/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ phone_number: phoneNumber }),
      }),
    verifyOtp: (phoneNumber: string, otp: string) =>
      request<UserSession>('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ phone_number: phoneNumber, otp }),
      }),
    patientRegister: (data: {
      phone_number: string;
      otp: string;
      caregiver_name: string;
      child_name: string;
      child_age: number;
      child_gender: string;
      relationship_to_child: string;
      preferred_language?: string;
      consent_given: boolean;
      medical_history_notes?: string;
    }) =>
      request<UserSession>('/auth/patient/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    login: (email: string, password: string) =>
      request<UserSession>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    demoLogin: (role: string) =>
      request<UserSession>(`/auth/demo-login/${role}`, {
        method: 'POST',
      }),
    getMe: () => request<any>('/auth/me'),
  },

  patients: {
    getProfile: () => request<PatientProfile>('/patients/profile'),
    updateProfile: (profile: Partial<PatientProfile>) =>
      request<PatientProfile>('/patients/profile', {
        method: 'POST',
        body: JSON.stringify(profile),
      }),
    getScreenings: () => request<ScreeningSummary[]>('/patients/screenings'),
    getAppointments: () => request<Appointment[]>('/patients/appointments'),
  },

  screening: {
    getQuestions: () => request<{ questions: QuestionnaireItem[]; total: number }>('/screening/questions'),
    submitScreening: (data: {
      patient_id: number;
      child_age: number;
      child_gender: string;
      jaundice_at_birth: string;
      family_history_asd: string;
      responses: Array<{
        question_id: string;
        question_text: string;
        domain: string;
        response_value: number;
        response_text?: string;
      }>;
    }) =>
      request<ScreeningResult>('/screening/submit', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    submitCameraSession: (data: {
      patient_id: number;
      child_age?: number;
      child_gender?: string;
      duration_seconds?: number;
      head_face_orientation?: string;
      visual_orientation_tracking?: string;
      stimulus_response?: string;
      movement_patterns?: string;
      repetitive_movement_indicator?: boolean;
      observation_quality?: string;
      observation_notes?: string;
      jaundice_at_birth?: string;
      family_history_asd?: string;
    }) =>
      request<ScreeningResult>('/screening/camera-session', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getResult: (id: number) => request<ScreeningResult>(`/screening/${id}`),
  },

  clinicians: {
    getDirectory: () => request<ClinicianProfile[]>('/clinicians/'),
    getClinician: (id: number) => request<ClinicianProfile>(`/clinicians/${id}`),
    getDashboard: () => request<any>('/clinicians/me/dashboard'),
    getPatientDetail: (patientId: number) => request<any>(`/clinicians/me/patient/${patientId}`),
  },

  appointments: {
    getSlots: (clinicianId: number, date: string) =>
      request<{
        clinician_id: number;
        date: string;
        all_slots: string[];
        booked_slots: string[];
        available_slots: string[];
      }>(`/appointments/slots?clinician_id=${clinicianId}&date=${date}`),
    book: (data: { clinician_id: number; appointment_date: string; appointment_time: string; reason_for_visit?: string }) =>
      request<Appointment>('/appointments/', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateStatus: (id: number, status: string) =>
      request<Appointment>(`/appointments/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    takeAction: (id: number, action: 'accept' | 'reject' | 'reschedule', newDate?: string, newTime?: string) =>
      request<Appointment>(`/appointments/${id}/action`, {
        method: 'POST',
        body: JSON.stringify({ action, new_date: newDate, new_time: newTime }),
      }),
  },

  clinicalNotes: {
    saveNote: (data: {
      appointment_id: number;
      consultation_notes: string;
      follow_up_recommendations?: string;
      observation_summary?: string;
    }) =>
      request<ClinicalNote>('/clinical-notes/', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getNote: (appointmentId: number) => request<ClinicalNote>(`/clinical-notes/appointment/${appointmentId}`),
  },

  admin: {
    getStats: () => request<AdminStats>('/admin/stats'),
    getUsers: () => request<any[]>('/admin/users'),
    toggleUserStatus: (userId: number, isActive: boolean) =>
      request<{ message: string; user_id: number; is_active: boolean }>(`/admin/users/${userId}/status?is_active=${isActive}`, {
        method: 'PATCH',
      }),
    getClinicians: () => request<any[]>('/admin/clinicians'),
    verifyClinician: (clinicianId: number, verified: boolean) =>
      request<any>(`/admin/clinicians/${clinicianId}/verify?verified=${verified}`, {
        method: 'POST',
      }),
    getAuditLogs: (limit: number = 50) => request<AuditLog[]>(`/admin/audit-logs?limit=${limit}`),
  },
};
