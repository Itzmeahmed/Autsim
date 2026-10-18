"""
Auti AIgnosis - Patient Portal Endpoints
Provides profile management, screening history, and personal appointment records.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.app.core.database import get_db
from backend.app.models.models import User, PatientProfile, Screening, Appointment
from backend.app.schemas.schemas import (
    PatientProfileCreate, PatientProfileResponse, ScreeningSummaryResponse, AppointmentResponse
)
from backend.app.api.deps import get_patient_user, get_current_user

router = APIRouter(prefix="/patients", tags=["Patients"])

@router.get("/profile", response_model=PatientProfileResponse)
def get_patient_profile(
    current_user: User = Depends(get_patient_user),
    db: Session = Depends(get_db)
):
    profile = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Patient profile not created yet.")
    return profile

@router.post("/profile", response_model=PatientProfileResponse)
def create_or_update_patient_profile(
    data: PatientProfileCreate,
    current_user: User = Depends(get_patient_user),
    db: Session = Depends(get_db)
):
    profile = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
    if not profile:
        profile = PatientProfile(
            user_id=current_user.id,
            full_name=data.full_name,
            child_name=data.child_name,
            date_of_birth=data.date_of_birth,
            age=data.age,
            gender=data.gender,
            parent_guardian_name=data.parent_guardian_name,
            preferred_language=data.preferred_language,
            medical_history_notes=data.medical_history_notes
        )
        db.add(profile)
    else:
        profile.full_name = data.full_name
        profile.child_name = data.child_name
        profile.date_of_birth = data.date_of_birth
        profile.age = data.age
        profile.gender = data.gender
        profile.parent_guardian_name = data.parent_guardian_name
        profile.preferred_language = data.preferred_language
        profile.medical_history_notes = data.medical_history_notes
        
    db.commit()
    db.refresh(profile)
    return profile

@router.get("/screenings", response_model=List[ScreeningSummaryResponse])
def get_patient_screenings(
    current_user: User = Depends(get_patient_user),
    db: Session = Depends(get_db)
):
    profile = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
    if not profile:
        return []
    screenings = db.query(Screening).filter(Screening.patient_id == profile.id).order_by(Screening.created_at.desc()).all()
    return screenings

@router.get("/appointments", response_model=List[AppointmentResponse])
def get_patient_appointments(
    current_user: User = Depends(get_patient_user),
    db: Session = Depends(get_db)
):
    profile = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
    if not profile:
        return []
    appointments = db.query(Appointment).filter(Appointment.patient_id == profile.id).order_by(Appointment.created_at.desc()).all()
    
    results = []
    for appt in appointments:
        results.append(AppointmentResponse(
            id=appt.id,
            patient_id=appt.patient_id,
            clinician_id=appt.clinician_id,
            appointment_date=appt.appointment_date,
            appointment_time=appt.appointment_time,
            status=appt.status,
            reason_for_visit=appt.reason_for_visit,
            patient_name=profile.full_name,
            child_name=profile.child_name,
            clinician_name=appt.clinician.full_name if appt.clinician else "Doctor",
            clinician_specialty=appt.clinician.specialty if appt.clinician else "Clinician",
            created_at=appt.created_at
        ))
    return results
