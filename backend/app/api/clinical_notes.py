"""
Auti AIgnosis - Clinical Consultation Notes
Enables verified clinicians to enter professional consultation notes and follow-up instructions.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from backend.app.core.database import get_db
from backend.app.models.models import User, ClinicalNote, Appointment, ClinicianProfile, UserRole
from backend.app.schemas.schemas import ClinicalNoteCreateRequest, ClinicalNoteResponse
from backend.app.api.deps import get_current_user, get_clinician_user
from backend.app.services.audit_service import record_audit_event

router = APIRouter(prefix="/clinical-notes", tags=["Clinical Notes"])

@router.post("/", response_model=ClinicalNoteResponse)
def create_or_update_clinical_note(
    data: ClinicalNoteCreateRequest,
    current_user: User = Depends(get_clinician_user),
    db: Session = Depends(get_db)
):
    """
    Saves clinician consultation documentation.
    Guarantees clinical authority: AI never writes final medical diagnoses.
    """
    clinician = db.query(ClinicianProfile).filter(ClinicianProfile.user_id == current_user.id).first()
    if not clinician:
        raise HTTPException(status_code=403, detail="Clinician profile required.")
        
    appt = db.query(Appointment).filter(Appointment.id == data.appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment record not found.")
        
    # Enforce IDOR protection: clinician must be assigned to this appointment
    if appt.clinician_id != clinician.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized: You can only record clinical notes for appointments assigned to you."
        )
        
    # Check or create note
    note = db.query(ClinicalNote).filter(ClinicalNote.appointment_id == data.appointment_id).first()
    if not note:
        note = ClinicalNote(
            appointment_id=data.appointment_id,
            clinician_id=clinician.id,
            patient_id=appt.patient_id,
            consultation_notes=data.consultation_notes,
            follow_up_recommendations=data.follow_up_recommendations,
            observation_summary=data.observation_summary
        )
        db.add(note)
    else:
        note.consultation_notes = data.consultation_notes
        note.follow_up_recommendations = data.follow_up_recommendations
        note.observation_summary = data.observation_summary
        
    # Mark appointment completed
    appt.status = "Completed"
    
    db.commit()
    db.refresh(note)
    
    record_audit_event(
        db, action="CLINICAL_NOTE_SAVED",
        resource=f"appointment:{appt.id}",
        user_id=current_user.id,
        details=f"Clinical notes added for patient {appt.patient_id} by Dr. {clinician.full_name}"
    )
    
    return note

@router.get("/appointment/{appointment_id}", response_model=ClinicalNoteResponse)
def get_note_by_appointment(
    appointment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    note = db.query(ClinicalNote).filter(ClinicalNote.appointment_id == appointment_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Clinical note not found for this appointment.")
        
    # Access control: user must be the patient, the clinician, or admin
    if current_user.role == UserRole.PATIENT.value:
        if note.patient.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Unauthorized to view these clinical notes.")
    elif current_user.role == UserRole.CLINICIAN.value:
        if note.clinician.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Unauthorized to view clinical notes of other clinicians.")
            
    return note
