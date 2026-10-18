"""
Auti AIgnosis - Appointment Booking & Clinical Scheduling Engine
Prevents double booking with transactional backend validation.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.app.core.database import get_db
from backend.app.models.models import (
    User, Appointment, PatientProfile, ClinicianProfile, AppointmentStatus, UserRole
)
from backend.app.schemas.schemas import (
    AppointmentCreateRequest, AppointmentResponse, AppointmentStatusUpdate,
    AppointmentActionRequest
)
from backend.app.api.deps import get_current_user
from backend.app.services.audit_service import record_audit_event

router = APIRouter(prefix="/appointments", tags=["Appointments"])

STANDARD_TIME_SLOTS = [
    "09:30 AM", "10:30 AM", "11:30 AM",
    "02:00 PM", "03:00 PM", "04:00 PM"
]

@router.get("/slots")
def get_available_slots(
    clinician_id: int,
    date: str,
    db: Session = Depends(get_db)
):
    """Calculates available appointment times for a clinician on a given date."""
    clinician = db.query(ClinicianProfile).filter(ClinicianProfile.id == clinician_id).first()
    if not clinician:
        raise HTTPException(status_code=404, detail="Clinician not found.")
        
    # Query booked appointments
    booked = db.query(Appointment.appointment_time).filter(
        Appointment.clinician_id == clinician_id,
        Appointment.appointment_date == date,
        Appointment.status.in_(["Confirmed", "Pending"])
    ).all()
    
    booked_times = set([b[0] for b in booked])
    available = [slot for slot in STANDARD_TIME_SLOTS if slot not in booked_times]
    
    return {
        "clinician_id": clinician_id,
        "date": date,
        "all_slots": STANDARD_TIME_SLOTS,
        "booked_slots": list(booked_times),
        "available_slots": available
    }

@router.post("/", response_model=AppointmentResponse)
def book_appointment(
    data: AppointmentCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Reserves an appointment slot.
    Strictly validates slot availability in backend to prevent double-booking.
    """
    patient = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A registered patient profile is required before booking an appointment."
        )
            
    clinician = db.query(ClinicianProfile).filter(ClinicianProfile.id == data.clinician_id).first()
    if not clinician:
        raise HTTPException(status_code=404, detail="Selected clinician does not exist.")
        
    # Concurrency / Double Booking check
    existing_conflict = db.query(Appointment).filter(
        Appointment.clinician_id == data.clinician_id,
        Appointment.appointment_date == data.appointment_date,
        Appointment.appointment_time == data.appointment_time,
        Appointment.status.in_(["Confirmed", "Pending"])
    ).first()
    
    if existing_conflict:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Unable to book this appointment because the slot is no longer available. Please select another time."
        )
        
    appt = Appointment(
        patient_id=patient.id,
        clinician_id=data.clinician_id,
        appointment_date=data.appointment_date,
        appointment_time=data.appointment_time,
        status="Confirmed",
        reason_for_visit=data.reason_for_visit or "Follow-up discussion on AI screening indication"
    )
    db.add(appt)
    db.commit()
    db.refresh(appt)
    
    record_audit_event(
        db, action="APPOINTMENT_BOOKED",
        resource=f"appointment:{appt.id}",
        user_id=current_user.id,
        details=f"Clinician: {clinician.full_name} | Date: {data.appointment_date} {data.appointment_time}"
    )
    
    return AppointmentResponse(
        id=appt.id,
        patient_id=appt.patient_id,
        clinician_id=appt.clinician_id,
        appointment_date=appt.appointment_date,
        appointment_time=appt.appointment_time,
        status=appt.status,
        reason_for_visit=appt.reason_for_visit,
        patient_name=patient.full_name,
        child_name=patient.child_name,
        clinician_name=clinician.full_name,
        clinician_specialty=clinician.specialty,
        created_at=appt.created_at
    )

@router.patch("/{appointment_id}/status", response_model=AppointmentResponse)
def update_appointment_status(
    appointment_id: int,
    data: AppointmentStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found.")
        
    # Enforce strict RBAC and IDOR protection
    if current_user.role == UserRole.PATIENT.value:
        if not appt.patient or appt.patient.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Unauthorized: You cannot modify appointments belonging to other patients."
            )
        if data.status not in ("Cancelled",):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Patients are only authorized to cancel their appointments."
            )
    elif current_user.role == UserRole.CLINICIAN.value:
        if not current_user.clinician_profile or appt.clinician_id != current_user.clinician_profile.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Unauthorized: Clinicians can only update appointments assigned to them."
            )
    elif current_user.role != UserRole.ADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized role for appointment status update."
        )
        
    appt.status = data.status
    db.commit()
    db.refresh(appt)
    
    record_audit_event(
        db, action="APPOINTMENT_STATUS_UPDATED",
        resource=f"appointment:{appt.id}",
        user_id=current_user.id,
        details=f"New status: {data.status}"
    )
    
    return AppointmentResponse(
        id=appt.id,
        patient_id=appt.patient_id,
        clinician_id=appt.clinician_id,
        appointment_date=appt.appointment_date,
        appointment_time=appt.appointment_time,
        status=appt.status,
        reason_for_visit=appt.reason_for_visit,
        patient_name=appt.patient.full_name if appt.patient else "Patient",
        child_name=appt.patient.child_name if appt.patient else "Child",
        clinician_name=appt.clinician.full_name if appt.clinician else "Clinician",
        clinician_specialty=appt.clinician.specialty if appt.clinician else "Specialty",
        created_at=appt.created_at
    )

@router.post("/{appointment_id}/action", response_model=AppointmentResponse)
def handle_appointment_action(
    appointment_id: int,
    data: AppointmentActionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Allows clinician to accept, reject, or reschedule an appointment request."""
    appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found.")
        
    if current_user.role == UserRole.CLINICIAN.value:
        if not current_user.clinician_profile or appt.clinician_id != current_user.clinician_profile.id:
            raise HTTPException(status_code=403, detail="Unauthorized: Only the assigned clinician can process this appointment.")
    elif current_user.role != UserRole.ADMIN.value:
        raise HTTPException(status_code=403, detail="Unauthorized role.")
        
    action = data.action.lower()
    if action == "accept":
        appt.status = "Confirmed"
    elif action == "reject":
        appt.status = "Cancelled"
    elif action == "reschedule":
        if not data.new_date or not data.new_time:
            raise HTTPException(status_code=400, detail="New date and time required for rescheduling.")
        appt.status = "Rescheduled"
        appt.appointment_date = data.new_date
        appt.appointment_time = data.new_time
    else:
        raise HTTPException(status_code=400, detail="Invalid action. Use 'accept', 'reject', or 'reschedule'.")
        
    db.commit()
    db.refresh(appt)
    
    record_audit_event(
        db, action=f"APPOINTMENT_{action.upper()}",
        resource=f"appointment:{appt.id}",
        user_id=current_user.id,
        details=f"Clinician action: {action}"
    )
    
    return AppointmentResponse(
        id=appt.id,
        patient_id=appt.patient_id,
        clinician_id=appt.clinician_id,
        appointment_date=appt.appointment_date,
        appointment_time=appt.appointment_time,
        status=appt.status,
        reason_for_visit=appt.reason_for_visit,
        patient_name=appt.patient.full_name if appt.patient else "Patient",
        child_name=appt.patient.child_name if appt.patient else "Child",
        clinician_name=appt.clinician.full_name if appt.clinician else "Clinician",
        clinician_specialty=appt.clinician.specialty if appt.clinician else "Specialty",
        created_at=appt.created_at
    )

