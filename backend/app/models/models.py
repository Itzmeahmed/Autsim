"""
Auti AIgnosis - Relational Database Models (SQLAlchemy ORM)
Enforces proper foreign keys, audit timestamps, and indexing.
"""

from datetime import datetime, timezone
import enum
from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float, Enum, JSON
)
from sqlalchemy.orm import relationship

from backend.app.core.database import Base

class UserRole(str, enum.Enum):
    PATIENT = "patient"
    CLINICIAN = "clinician"
    ADMIN = "admin"

class AppointmentStatus(str, enum.Enum):
    PENDING = "Pending"
    CONFIRMED = "Confirmed"
    RESCHEDULED = "Rescheduled"
    CANCELLED = "Cancelled"
    COMPLETED = "Completed"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    role = Column(String(50), nullable=False, default=UserRole.PATIENT.value)
    phone_number = Column(String(20), unique=True, index=True, nullable=True)
    email = Column(String(120), unique=True, index=True, nullable=True)
    hashed_password = Column(String(255), nullable=True)
    full_name = Column(String(120), nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    patient_profile = relationship("PatientProfile", back_populates="user", uselist=False)
    clinician_profile = relationship("ClinicianProfile", back_populates="user", uselist=False)
    notifications = relationship("Notification", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")

class PatientProfile(Base):
    __tablename__ = "patient_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    full_name = Column(String(120), nullable=False)
    child_name = Column(String(120), nullable=False)
    date_of_birth = Column(String(50), nullable=True)
    age = Column(Integer, default=5)
    gender = Column(String(20), default="Prefer not to say")
    parent_guardian_name = Column(String(120), nullable=True)
    relationship_to_child = Column(String(50), default="Parent")
    consent_given = Column(Boolean, default=True)
    preferred_language = Column(String(20), default="English")
    medical_history_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    user = relationship("User", back_populates="patient_profile")
    screenings = relationship("Screening", back_populates="patient")
    appointments = relationship("Appointment", back_populates="patient")

class ClinicianProfile(Base):
    __tablename__ = "clinician_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    full_name = Column(String(120), nullable=False)
    specialty = Column(String(120), default="Developmental Pediatrician / Child Psychologist")
    qualification = Column(String(120), default="MD, DCH (Pediatrics)")
    experience_years = Column(Integer, default=8)
    languages = Column(String(120), default="English, Kannada, Hindi")
    bio = Column(Text, nullable=True)
    availability_hours = Column(String(120), default="10:00 AM - 04:00 PM")
    is_verified_by_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    user = relationship("User", back_populates="clinician_profile")
    appointments = relationship("Appointment", back_populates="clinician")
    clinical_notes = relationship("ClinicalNote", back_populates="clinician")

class Screening(Base):
    __tablename__ = "screenings"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patient_profiles.id"), nullable=False)
    child_age = Column(Integer, default=5)
    child_gender = Column(String(20), default="m")
    total_score = Column(Integer, default=0)
    status = Column(String(50), default="Completed")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    patient = relationship("PatientProfile", back_populates="screenings")
    responses = relationship("ScreeningResponse", back_populates="screening", cascade="all, delete-orphan")
    result = relationship("ScreeningResult", back_populates="screening", uselist=False, cascade="all, delete-orphan")
    observation = relationship("BehavioralObservation", back_populates="screening", uselist=False, cascade="all, delete-orphan")

class BehavioralObservation(Base):
    __tablename__ = "behavioral_observations"
    
    id = Column(Integer, primary_key=True, index=True)
    screening_id = Column(Integer, ForeignKey("screenings.id"), unique=True, nullable=False)
    consent_given = Column(Boolean, default=True)
    facial_expression_patterns = Column(JSON, nullable=True)
    movement_patterns = Column(JSON, nullable=True)
    attention_orientation_patterns = Column(JSON, nullable=True)
    summary_indicators = Column(JSON, nullable=True)
    duration_seconds = Column(Integer, default=30)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    screening = relationship("Screening", back_populates="observation")

class ScreeningResponse(Base):
    __tablename__ = "screening_responses"
    
    id = Column(Integer, primary_key=True, index=True)
    screening_id = Column(Integer, ForeignKey("screenings.id"), nullable=False)
    question_id = Column(String(20), nullable=False)
    question_text = Column(Text, nullable=False)
    domain = Column(String(50), nullable=False)
    response_value = Column(Integer, default=0)
    response_text = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    screening = relationship("Screening", back_populates="responses")

class ScreeningResult(Base):
    __tablename__ = "screening_results"
    
    id = Column(Integer, primary_key=True, index=True)
    screening_id = Column(Integer, ForeignKey("screenings.id"), unique=True, nullable=False)
    screening_indication = Column(String(50), nullable=False)
    probability_score = Column(Float, nullable=False)
    developmental_profile = Column(JSON, nullable=False) # e.g. {"Communication": 75.0, ...}
    key_contributing_areas = Column(JSON, nullable=False) # e.g. ["Social Interaction", "Sensory Responses"]
    explanation = Column(Text, nullable=False)
    disclaimer = Column(Text, nullable=False)
    model_version = Column(String(50), default="v1.0.0")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    screening = relationship("Screening", back_populates="result")

class Appointment(Base):
    __tablename__ = "appointments"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patient_profiles.id"), nullable=False)
    clinician_id = Column(Integer, ForeignKey("clinician_profiles.id"), nullable=False)
    appointment_date = Column(String(50), nullable=False) # YYYY-MM-DD
    appointment_time = Column(String(50), nullable=False) # e.g. 10:30 AM
    status = Column(String(50), default=AppointmentStatus.PENDING.value)
    consultation_type = Column(String(50), default="Video Consultation")
    reason_for_visit = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    patient = relationship("PatientProfile", back_populates="appointments")
    clinician = relationship("ClinicianProfile", back_populates="appointments")
    clinical_note = relationship("ClinicalNote", back_populates="appointment", uselist=False)

class ClinicalNote(Base):
    __tablename__ = "clinical_notes"
    
    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, ForeignKey("appointments.id"), unique=True, nullable=False)
    clinician_id = Column(Integer, ForeignKey("clinician_profiles.id"), nullable=False)
    patient_id = Column(Integer, ForeignKey("patient_profiles.id"), nullable=False)
    consultation_notes = Column(Text, nullable=False)
    follow_up_recommendations = Column(Text, nullable=True)
    observation_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    appointment = relationship("Appointment", back_populates="clinical_note")
    clinician = relationship("ClinicianProfile", back_populates="clinical_notes")

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(120), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    notification_type = Column(String(50), default="info")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    user = relationship("User", back_populates="notifications")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)
    resource = Column(String(100), nullable=False)
    ip_address = Column(String(50), nullable=True)
    status = Column(String(50), default="SUCCESS")
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    user = relationship("User", back_populates="audit_logs")
