"""
Auti AIgnosis - Admin Dashboard & Governance Endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.app.core.database import get_db
from backend.app.models.models import (
    User, ClinicianProfile, PatientProfile, Screening, ScreeningResult, Appointment, AuditLog, UserRole
)
from backend.app.schemas.schemas import AdminStatsResponse, AuditLogResponse
from backend.app.api.deps import get_admin_user
from backend.app.services.audit_service import record_audit_event

router = APIRouter(prefix="/admin", tags=["Admin Portal"])

@router.get("/stats", response_model=AdminStatsResponse)
def get_admin_stats(
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    total_patients = db.query(PatientProfile).count()
    total_clinicians = db.query(ClinicianProfile).count()
    pending_verifications = db.query(ClinicianProfile).filter(ClinicianProfile.is_verified_by_admin == False).count()
    total_screenings = db.query(Screening).count()
    total_appointments = db.query(Appointment).count()
    high_indication = db.query(ScreeningResult).filter(ScreeningResult.screening_indication == "Higher Indication").count()
    
    return AdminStatsResponse(
        total_users=total_users,
        total_patients=total_patients,
        total_clinicians=total_clinicians,
        pending_clinician_verifications=pending_verifications,
        total_screenings=total_screenings,
        total_appointments=total_appointments,
        high_indication_screenings=high_indication
    )

@router.get("/clinicians")
def list_clinicians_admin(
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    clinicians = db.query(ClinicianProfile).all()
    results = []
    for c in clinicians:
        results.append({
            "id": c.id,
            "user_id": c.user_id,
            "full_name": c.full_name,
            "email": c.user.email if c.user else "",
            "specialty": c.specialty,
            "qualification": c.qualification,
            "experience_years": c.experience_years,
            "languages": c.languages,
            "is_verified_by_admin": c.is_verified_by_admin,
            "is_active": c.user.is_active if c.user else True
        })
    return results

@router.post("/clinicians/{clinician_id}/verify")
def set_clinician_verification(
    clinician_id: int,
    verified: bool = Query(True),
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    clinician = db.query(ClinicianProfile).filter(ClinicianProfile.id == clinician_id).first()
    if not clinician:
        raise HTTPException(status_code=404, detail="Clinician record not found.")
        
    clinician.is_verified_by_admin = verified
    db.commit()
    
    action = "CLINICIAN_VERIFIED" if verified else "CLINICIAN_UNVERIFIED"
    record_audit_event(
        db, action=action,
        resource=f"clinician:{clinician.id}",
        user_id=current_user.id,
        details=f"Admin {current_user.full_name} updated status to {verified}"
    )
    
    return {"message": f"Clinician verification set to {verified}.", "clinician_id": clinician.id, "is_verified": verified}

@router.get("/users")
def list_users(
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    users = db.query(User).order_by(User.id.desc()).all()
    results = []
    for u in users:
        results.append({
            "id": u.id,
            "role": u.role,
            "email": u.email,
            "phone_number": u.phone_number,
            "full_name": u.full_name,
            "is_active": u.is_active,
            "is_verified": u.is_verified,
            "created_at": u.created_at
        })
    return results

@router.patch("/users/{user_id}/status")
def toggle_user_active_status(
    user_id: int,
    is_active: bool = Query(...),
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Administrators cannot deactivate their own active session.")
        
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User account not found.")
        
    target_user.is_active = is_active
    db.commit()
    
    record_audit_event(
        db, action="USER_STATUS_CHANGED",
        resource=f"user:{target_user.id}",
        user_id=current_user.id,
        details=f"Status modified to is_active={is_active}"
    )
    
    return {"message": "User status updated successfully.", "user_id": user_id, "is_active": is_active}

@router.get("/audit-logs", response_model=List[AuditLogResponse])
def get_audit_logs(
    limit: int = 50,
    current_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()
    return logs
