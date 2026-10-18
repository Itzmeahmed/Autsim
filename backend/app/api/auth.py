"""
Auti AIgnosis - Authentication Endpoints
Supports Patient Mobile + OTP and Clinician/Admin Email + Password Login.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from datetime import timedelta

from backend.app.core.database import get_db
from backend.app.core.config import settings
from backend.app.core.security import verify_password, create_access_token
from backend.app.models.models import User, UserRole, PatientProfile, ClinicianProfile
from backend.app.schemas.schemas import (
    SendOtpRequest, SendOtpResponse, VerifyOtpRequest, LoginRequest, TokenResponse,
    PatientRegisterRequest
)
from backend.app.services.otp_service import otp_service
from backend.app.services.audit_service import record_audit_event
from backend.app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/patient/register", response_model=TokenResponse)
def register_patient(req: PatientRegisterRequest, request: Request, db: Session = Depends(get_db)):
    """Verifies OTP and creates a complete Patient and Child Profile account."""
    phone = req.phone_number.strip()
    otp_service.verify_otp(phone, req.otp)
    
    # Locate or provision user account
    user = db.query(User).filter(User.phone_number == phone).first()
    if not user:
        user = User(
            role=UserRole.PATIENT.value,
            phone_number=phone,
            full_name=req.caregiver_name.strip(),
            is_active=True,
            is_verified=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        profile = PatientProfile(
            user_id=user.id,
            full_name=req.caregiver_name.strip(),
            child_name=req.child_name.strip(),
            age=req.child_age,
            gender=req.child_gender,
            parent_guardian_name=req.caregiver_name.strip(),
            relationship_to_child=req.relationship_to_child,
            consent_given=req.consent_given,
            preferred_language=req.preferred_language,
            medical_history_notes=req.medical_history_notes
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    else:
        user.full_name = req.caregiver_name.strip()
        profile = user.patient_profile
        if not profile:
            profile = PatientProfile(
                user_id=user.id,
                full_name=req.caregiver_name.strip(),
                child_name=req.child_name.strip(),
                age=req.child_age,
                gender=req.child_gender,
                parent_guardian_name=req.caregiver_name.strip(),
                relationship_to_child=req.relationship_to_child,
                consent_given=req.consent_given,
                preferred_language=req.preferred_language,
                medical_history_notes=req.medical_history_notes
            )
            db.add(profile)
        else:
            profile.full_name = req.caregiver_name.strip()
            profile.child_name = req.child_name.strip()
            profile.age = req.child_age
            profile.gender = req.child_gender
            profile.parent_guardian_name = req.caregiver_name.strip()
            profile.relationship_to_child = req.relationship_to_child
            profile.consent_given = req.consent_given
            profile.preferred_language = req.preferred_language
            profile.medical_history_notes = req.medical_history_notes
        db.commit()
        db.refresh(profile)
        
    access_token = create_access_token({"sub": str(user.id), "role": user.role})
    record_audit_event(
        db, action="PATIENT_REGISTER_SUCCESS", resource=f"user:{user.id}",
        user_id=user.id, ip_address=request.client.host if request.client else "127.0.0.1"
    )
    
    return TokenResponse(
        access_token=access_token,
        user_id=user.id,
        role=user.role,
        full_name=profile.child_name,
        profile_id=profile.id
    )

@router.post("/send-otp", response_model=SendOtpResponse)
def send_otp(req: SendOtpRequest, request: Request, db: Session = Depends(get_db)):
    """Initiates an OTP verification sequence for patient login."""
    phone = req.phone_number.strip()
    if not phone or len(phone) < 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide a valid mobile number with country code."
        )
        
    otp_code, expiry = otp_service.generate_otp(phone)
    record_audit_event(
        db, action="OTP_REQUESTED", resource=f"auth:{phone}",
        ip_address=request.client.host if request.client else "127.0.0.1",
        details="OTP dispatched to client."
    )
    
    return SendOtpResponse(
        message="OTP sent successfully to your mobile number.",
        phone_number=phone,
        expires_in_seconds=expiry,
        mock_otp=otp_code if settings.MOCK_OTP_MODE else None
    )

@router.post("/verify-otp", response_model=TokenResponse)
def verify_otp(req: VerifyOtpRequest, request: Request, db: Session = Depends(get_db)):
    """Verifies OTP and returns secure JWT access token."""
    phone = req.phone_number.strip()
    otp_service.verify_otp(phone, req.otp)
    
    # Locate or provision user account
    user = db.query(User).filter(User.phone_number == phone).first()
    if not user:
        user = User(
            role=UserRole.PATIENT.value,
            phone_number=phone,
            full_name="Parent / Caregiver",
            is_active=True,
            is_verified=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Provision initial profile
        profile = PatientProfile(
            user_id=user.id,
            full_name="Parent / Caregiver",
            child_name="Aarav",
            age=5,
            gender="Male",
            preferred_language="English"
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    else:
        profile = user.patient_profile
        
    access_token = create_access_token({"sub": str(user.id), "role": user.role})
    record_audit_event(
        db, action="PATIENT_OTP_LOGIN_SUCCESS", resource=f"user:{user.id}",
        user_id=user.id, ip_address=request.client.host if request.client else "127.0.0.1"
    )
    
    return TokenResponse(
        access_token=access_token,
        user_id=user.id,
        role=user.role,
        full_name=profile.full_name if profile else user.full_name,
        profile_id=profile.id if profile else None
    )

@router.post("/login", response_model=TokenResponse)
def login_staff(req: LoginRequest, request: Request, db: Session = Depends(get_db)):
    """Clinician and Administrator password authentication."""
    user = db.query(User).filter(User.email == req.email.strip().lower()).first()
    if not user or not user.hashed_password or not verify_password(req.password, user.hashed_password):
        record_audit_event(
            db, action="LOGIN_FAILED", resource=f"email:{req.email}",
            status="FAILURE", ip_address=request.client.host if request.client else "127.0.0.1"
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password credentials."
        )
        
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact the administrator."
        )
        
    access_token = create_access_token({"sub": str(user.id), "role": user.role})
    profile_id = None
    if user.role == UserRole.CLINICIAN.value and user.clinician_profile:
        profile_id = user.clinician_profile.id
    elif user.role == UserRole.PATIENT.value and user.patient_profile:
        profile_id = user.patient_profile.id
        
    record_audit_event(
        db, action=f"{user.role.upper()}_LOGIN_SUCCESS", resource=f"user:{user.id}",
        user_id=user.id, ip_address=request.client.host if request.client else "127.0.0.1"
    )
    
    return TokenResponse(
        access_token=access_token,
        user_id=user.id,
        role=user.role,
        full_name=user.full_name,
        profile_id=profile_id
    )

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    """Retrieves identity and profile details of authenticated caller."""
    profile_data = None
    if current_user.role == UserRole.PATIENT.value and current_user.patient_profile:
        p = current_user.patient_profile
        profile_data = {
            "id": p.id,
            "full_name": p.full_name,
            "child_name": p.child_name,
            "age": p.age,
            "gender": p.gender,
            "preferred_language": p.preferred_language,
            "parent_guardian_name": p.parent_guardian_name
        }
    elif current_user.role == UserRole.CLINICIAN.value and current_user.clinician_profile:
        c = current_user.clinician_profile
        profile_data = {
            "id": c.id,
            "full_name": c.full_name,
            "specialty": c.specialty,
            "qualification": c.qualification,
            "experience_years": c.experience_years,
            "languages": c.languages,
            "is_verified_by_admin": c.is_verified_by_admin
        }
        
    return {
        "user_id": current_user.id,
        "email": current_user.email,
        "phone_number": current_user.phone_number,
        "role": current_user.role,
        "full_name": current_user.full_name,
        "profile": profile_data
    }

@router.post("/demo-login/{role}")
def demo_login(role: str, db: Session = Depends(get_db)):
    """Helper route to instantly authenticate as any demo role (Patient, Clinician, Admin)."""
    role = role.lower()
    if role not in ["patient", "clinician", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role specified for demo.")
        
    user = db.query(User).filter(User.role == role).first()
    if not user:
        raise HTTPException(status_code=404, detail="Demo user not found. Database seeding required.")
        
    token = create_access_token({"sub": str(user.id), "role": user.role})
    profile_id = None
    if user.role == UserRole.PATIENT.value and user.patient_profile:
        profile_id = user.patient_profile.id
    elif user.role == UserRole.CLINICIAN.value and user.clinician_profile:
        profile_id = user.clinician_profile.id
        
    return TokenResponse(
        access_token=token,
        user_id=user.id,
        role=user.role,
        full_name=user.full_name,
        profile_id=profile_id
    )
