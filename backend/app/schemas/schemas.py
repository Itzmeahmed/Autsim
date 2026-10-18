"""
Auti AIgnosis - Pydantic Request & Response Data Schemas
Ensures strict validation, type safety, and clean API contracts.
"""

from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- Authentication ---
class SendOtpRequest(BaseModel):
    phone_number: str = Field(..., example="+919876543210")

class SendOtpResponse(BaseModel):
    message: str
    phone_number: str
    expires_in_seconds: int
    mock_otp: Optional[str] = None # Provided in demo/development mode for convenience

class VerifyOtpRequest(BaseModel):
    phone_number: str = Field(..., example="+919876543210")
    otp: str = Field(..., min_length=4, max_length=6, example="123456")

class PatientRegisterRequest(BaseModel):
    phone_number: str = Field(..., example="+919876543210")
    otp: str = Field(..., min_length=4, max_length=6, example="123456")
    caregiver_name: str = Field(..., min_length=2, example="Priya Sharma")
    child_name: str = Field(..., min_length=2, example="Aarav Sharma")
    child_age: int = Field(default=5, ge=2, le=16)
    child_gender: str = Field(default="Male")
    relationship_to_child: str = Field(default="Mother")
    preferred_language: str = Field(default="English")
    consent_given: bool = Field(default=True)
    medical_history_notes: Optional[str] = None

class LoginRequest(BaseModel):
    email: str = Field(...)
    password: str = Field(..., min_length=6)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    role: str
    full_name: Optional[str] = None
    profile_id: Optional[int] = None

# --- Profiles ---
class PatientProfileCreate(BaseModel):
    full_name: str = Field(..., min_length=2)
    child_name: str = Field(..., min_length=2)
    date_of_birth: Optional[str] = None
    age: int = Field(default=5, ge=1, le=18)
    gender: str = Field(default="Prefer not to say")
    parent_guardian_name: Optional[str] = None
    preferred_language: str = Field(default="English")
    medical_history_notes: Optional[str] = None

class PatientProfileResponse(BaseModel):
    id: int
    user_id: int
    full_name: str
    child_name: str
    date_of_birth: Optional[str]
    age: int
    gender: str
    parent_guardian_name: Optional[str]
    preferred_language: str
    medical_history_notes: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class ClinicianProfileResponse(BaseModel):
    id: int
    user_id: int
    full_name: str
    specialty: str
    qualification: str
    experience_years: int
    languages: str
    bio: Optional[str]
    availability_hours: str
    is_verified_by_admin: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# --- Screening ---
class QuestionAnswer(BaseModel):
    question_id: str
    question_text: str
    domain: str
    response_value: int # 1 or 0
    response_text: Optional[str] = None

    @field_validator("response_value")
    @classmethod
    def validate_response_value(cls, v: int) -> int:
        if v not in (0, 1):
            raise ValueError("Response value must be binary: 0 or 1.")
        return v

class BehavioralObservationCreate(BaseModel):
    consent_given: bool = True
    facial_expression_patterns: Optional[Any] = None
    movement_patterns: Optional[Any] = None
    attention_orientation_patterns: Optional[Any] = None
    facial_expression_indicators: Optional[Any] = None
    attention_orientation_indicators: Optional[Any] = None
    repetitive_movement_detected: Optional[bool] = False
    confidence_quality_indicator: Optional[str] = "Moderate - Good Lighting"
    summary_indicators: Optional[List[str]] = None
    observation_notes: Optional[str] = None
    duration_seconds: int = 30

class BehavioralObservationResponse(BaseModel):
    id: int
    consent_given: bool
    facial_expression_patterns: Optional[Dict[str, Any]] = None
    movement_patterns: Optional[Dict[str, Any]] = None
    attention_orientation_patterns: Optional[Dict[str, Any]] = None
    summary_indicators: Optional[List[str]] = None
    duration_seconds: int
    created_at: datetime

    class Config:
        from_attributes = True

class CameraScreeningSubmitRequest(BaseModel):
    patient_id: int
    child_age: int = 5
    child_gender: str = "m"
    duration_seconds: int = 60
    head_face_orientation: str = "Active and oriented"
    visual_orientation_tracking: str = "Followed visual stimuli with sustained central focus"
    stimulus_response: str = "Responsive visual engagement"
    movement_patterns: str = "Stable posture with motor engagement"
    repetitive_movement_indicator: bool = False
    observation_quality: str = "Optimal lighting and positioning"
    observation_notes: Optional[str] = "Guided camera-based behavioral observation session completed."
    jaundice_at_birth: str = "no"
    family_history_asd: str = "no"

class ScreeningSubmitRequest(BaseModel):
    patient_id: int
    child_age: int = 5
    child_gender: str = "m"
    jaundice_at_birth: str = "no"
    family_history_asd: str = "no"
    responses: List[QuestionAnswer]
    camera_observation: Optional[BehavioralObservationCreate] = None

    @field_validator("child_age")
    @classmethod
    def validate_child_age(cls, v: int) -> int:
        if v < 2 or v > 16:
            raise ValueError("Child age must be between 2 and 16 years.")
        return v

    @field_validator("child_gender")
    @classmethod
    def validate_gender(cls, v: str) -> str:
        v_clean = v.strip().lower()
        if v_clean not in ("m", "f", "male", "female"):
            raise ValueError("Child gender must be 'm', 'f', 'Male', or 'Female'.")
        return v

    @field_validator("jaundice_at_birth", "family_history_asd")
    @classmethod
    def validate_binary_history(cls, v: str) -> str:
        v_clean = v.strip().lower()
        if v_clean not in ("yes", "no"):
            raise ValueError("Clinical history indicator must be 'yes' or 'no'.")
        return v_clean

    @field_validator("responses")
    @classmethod
    def validate_responses_count(cls, v: List[QuestionAnswer]) -> List[QuestionAnswer]:
        if len(v) != 20:
            raise ValueError(f"Screening questionnaire requires exactly 20 answered items, received {len(v)}.")
        return v

class ScreeningResultResponse(BaseModel):
    id: int
    screening_id: int
    screening_indication: str
    probability_score: float
    developmental_profile: Dict[str, float]
    key_contributing_areas: List[str]
    explanation: str
    disclaimer: str
    model_version: str
    created_at: datetime
    observation: Optional[BehavioralObservationResponse] = None

    class Config:
        from_attributes = True

class ScreeningSummaryResponse(BaseModel):
    id: int
    patient_id: int
    child_age: int
    total_score: int
    status: str
    created_at: datetime
    result: Optional[ScreeningResultResponse] = None

    class Config:
        from_attributes = True

# --- Appointments ---
class AppointmentCreateRequest(BaseModel):
    clinician_id: int
    appointment_date: str # YYYY-MM-DD
    appointment_time: str # e.g. "10:30 AM"
    consultation_type: Optional[str] = "Video Consultation" # "Video Consultation" or "In-Person Clinical Visit"
    reason_for_visit: Optional[str] = None

class AppointmentResponse(BaseModel):
    id: int
    patient_id: int
    clinician_id: int
    appointment_date: str
    appointment_time: str
    status: str
    consultation_type: Optional[str] = "Video Consultation"
    reason_for_visit: Optional[str]
    patient_name: Optional[str] = None
    child_name: Optional[str] = None
    clinician_name: Optional[str] = None
    clinician_specialty: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class AppointmentStatusUpdate(BaseModel):
    status: str # "Pending", "Confirmed", "Completed", "Cancelled", "Rescheduled"
    appointment_date: Optional[str] = None
    appointment_time: Optional[str] = None

class AppointmentActionRequest(BaseModel):
    action: str # "accept", "reject", "reschedule"
    new_date: Optional[str] = None
    new_time: Optional[str] = None
    reason: Optional[str] = None

# --- Clinical Notes ---
class ClinicalNoteCreateRequest(BaseModel):
    appointment_id: int
    consultation_notes: str
    follow_up_recommendations: Optional[str] = None
    observation_summary: Optional[str] = None

class ClinicalNoteResponse(BaseModel):
    id: int
    appointment_id: int
    clinician_id: int
    patient_id: int
    consultation_notes: str
    follow_up_recommendations: Optional[str]
    observation_summary: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# --- Admin & Audit ---
class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int]
    action: str
    resource: str
    ip_address: Optional[str]
    status: str
    details: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class AdminStatsResponse(BaseModel):
    total_users: int
    total_patients: int
    total_clinicians: int
    pending_clinician_verifications: int
    total_screenings: int
    total_appointments: int
    high_indication_screenings: int
