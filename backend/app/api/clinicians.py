"""
Auti AIgnosis - Clinician Directory & Clinical Review Endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from backend.app.core.database import get_db
from backend.app.models.models import (
    User, ClinicianProfile, PatientProfile, Appointment, Screening, ClinicalNote, UserRole
)
from backend.app.schemas.schemas import ClinicianProfileResponse
from backend.app.api.deps import get_current_user, get_clinician_user

router = APIRouter(prefix="/clinicians", tags=["Clinicians"])

@router.get("/", response_model=List[ClinicianProfileResponse])
def get_clinicians_directory(db: Session = Depends(get_db)):
    """Returns directory of verified clinical specialists available for booking."""
    clinicians = db.query(ClinicianProfile).filter(ClinicianProfile.is_verified_by_admin == True).all()
    # Fallback to all clinicians if none are explicitly verified in early demo stage
    if not clinicians:
        clinicians = db.query(ClinicianProfile).all()
    return clinicians

@router.get("/{clinician_id}", response_model=ClinicianProfileResponse)
def get_clinician_details(clinician_id: int, db: Session = Depends(get_db)):
    clinician = db.query(ClinicianProfile).filter(ClinicianProfile.id == clinician_id).first()
    if not clinician:
        raise HTTPException(status_code=404, detail="Clinician profile not found.")
    return clinician

@router.get("/me/dashboard")
def get_clinician_dashboard(
    current_user: User = Depends(get_clinician_user),
    db: Session = Depends(get_db)
):
    """Summarizes today's appointments, pending consultations, and recent screenings."""
    profile = db.query(ClinicianProfile).filter(ClinicianProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Clinician profile record not found.")
        
    appointments = db.query(Appointment).filter(Appointment.clinician_id == profile.id).all()
    
    total_appts = len(appointments)
    pending_requests = sum(1 for a in appointments if a.status == "Pending")
    confirmed_appts = sum(1 for a in appointments if a.status == "Confirmed")
    completed_appts = sum(1 for a in appointments if a.status == "Completed")
    
    # Unique patients
    patient_ids = list(set([a.patient_id for a in appointments]))
    
    return {
        "clinician_id": profile.id,
        "clinician_name": profile.full_name,
        "specialty": profile.specialty,
        "metrics": {
            "total_appointments": total_appts,
            "today_appointments": confirmed_appts + pending_requests,
            "new_requests": pending_requests,
            "completed": completed_appts,
            "total_patients": len(patient_ids)
        }
    }

@router.get("/me/patient/{patient_id}")
def get_clinician_patient_detail(
    patient_id: int,
    current_user: User = Depends(get_clinician_user),
    db: Session = Depends(get_db)
):
    """
    Authorized clinical view of patient:
    Patient Profile -> Screening History -> AI Results -> Responses -> Clinical Notes.
    Enforces authorization: Clinician must be assigned or booked with this patient.
    """
    clinician = db.query(ClinicianProfile).filter(ClinicianProfile.user_id == current_user.id).first()
    if not clinician:
        raise HTTPException(status_code=403, detail="Clinician profile not found.")
        
    # Check authorization relation
    has_appointment = db.query(Appointment).filter(
        Appointment.clinician_id == clinician.id,
        Appointment.patient_id == patient_id
    ).first()
    
    if not has_appointment and current_user.role != UserRole.ADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: No active consultation or appointment exists between your account and this patient."
        )
        
    patient = db.query(PatientProfile).filter(PatientProfile.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient record not found.")
        
    # Screening history
    screenings = db.query(Screening).filter(Screening.patient_id == patient_id).order_by(Screening.created_at.desc()).all()
    screening_list = []
    for s in screenings:
        res = s.result
        responses = [{"question_id": r.question_id, "text": r.question_text, "domain": r.domain, "value": r.response_value} for r in s.responses]
        screening_list.append({
            "id": s.id,
            "child_age": s.child_age,
            "total_score": s.total_score,
            "created_at": s.created_at,
            "result": {
                "screening_indication": res.screening_indication if res else "Pending",
                "probability_score": res.probability_score if res else 0.0,
                "developmental_profile": res.developmental_profile if res else {},
                "key_contributing_areas": res.key_contributing_areas if res else [],
                "explanation": res.explanation if res else "",
                "disclaimer": res.disclaimer if res else "",
                "model_version": res.model_version if res else "v1.0.0"
            } if res else None,
            "responses": responses
        })
        
    # Appointment history
    appointments = db.query(Appointment).filter(
        Appointment.patient_id == patient_id,
        Appointment.clinician_id == clinician.id
    ).order_by(Appointment.created_at.desc()).all()
    
    # Consultation notes
    notes = db.query(ClinicalNote).filter(
        ClinicalNote.patient_id == patient_id,
        ClinicalNote.clinician_id == clinician.id
    ).order_by(ClinicalNote.created_at.desc()).all()
    
    return {
        "patient": {
            "id": patient.id,
            "full_name": patient.full_name,
            "child_name": patient.child_name,
            "age": patient.age,
            "gender": patient.gender,
            "preferred_language": patient.preferred_language,
            "parent_guardian_name": patient.parent_guardian_name,
            "medical_history_notes": patient.medical_history_notes
        },
        "screenings": screening_list,
        "appointments": [
            {
                "id": a.id,
                "date": a.appointment_date,
                "time": a.appointment_time,
                "status": a.status,
                "reason": a.reason_for_visit
            } for a in appointments
        ],
        "clinical_notes": [
            {
                "id": n.id,
                "appointment_id": n.appointment_id,
                "consultation_notes": n.consultation_notes,
                "follow_up_recommendations": n.follow_up_recommendations,
                "observation_summary": n.observation_summary,
                "created_at": n.created_at
            } for n in notes
        ]
    }
