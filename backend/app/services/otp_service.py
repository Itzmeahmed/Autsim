"""
Auti AIgnosis - Secure One-Time Password (OTP) Engine
Handles generation, expiration, rate limiting, and attempt counts.
"""

import time
import secrets
from typing import Dict, Any, Tuple
from fastapi import HTTPException, status

from backend.app.core.config import settings

def normalize_phone(phone: str) -> str:
    """Normalizes phone numbers by stripping spaces/formatting and standardizing E.164 format."""
    cleaned = "".join(ch for ch in phone if ch.isdigit() or ch == "+")
    if not cleaned.startswith("+"):
        if len(cleaned) == 10:
            cleaned = "+91" + cleaned
        elif len(cleaned) == 12 and cleaned.startswith("91"):
            cleaned = "+" + cleaned
        else:
            cleaned = "+" + cleaned
    return cleaned

class OTPStore:
    """In-memory rate-limited OTP store with expiration and attempt tracking."""
    def __init__(self):
        # Key: normalized_phone -> Dict with otp, expires_at, attempts, last_sent_at, resend_count
        self._store: Dict[str, Dict[str, Any]] = {}
        
    def generate_otp(self, phone_number: str) -> Tuple[str, int]:
        phone_key = normalize_phone(phone_number)
        now = time.time()
        record = self._store.get(phone_key)
        
        # Enforce resend cooldown
        if record and (now - record.get("last_sent_at", 0)) < settings.OTP_RESEND_COOLDOWN_SECONDS:
            remaining = int(settings.OTP_RESEND_COOLDOWN_SECONDS - (now - record.get("last_sent_at", 0)))
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Please wait {remaining} seconds before requesting a new OTP."
            )
            
        # Development default or cryptographically randomized 6-digit code via secrets
        if settings.ENV == "development" and settings.MOCK_OTP_MODE:
            otp_code = "123456"
        else:
            otp_code = f"{secrets.randbelow(900000) + 100000}"
            
        expires_at = now + settings.OTP_EXPIRY_SECONDS
        
        self._store[phone_number] = {
            "otp": otp_code,
            "expires_at": expires_at,
            "attempts": 0,
            "last_sent_at": now
        }
        
        return otp_code, settings.OTP_EXPIRY_SECONDS

    def verify_otp(self, phone_number: str, submitted_otp: str) -> bool:
        now = time.time()
        record = self._store.get(phone_number)
        
        # In development mock mode only, permit standard demo code 123456
        if settings.ENV == "development" and settings.MOCK_OTP_MODE and submitted_otp == "123456":
            return True
            
        if not record:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No active OTP found for this phone number. Please request a new OTP."
            )
            
        # Check expiration
        if now > record["expires_at"]:
            self._store.pop(phone_number, None)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="OTP has expired. Please request a new OTP."
            )
            
        # Check attempts limit
        record["attempts"] += 1
        if record["attempts"] > settings.OTP_MAX_ATTEMPTS:
            self._store.pop(phone_number, None)
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many incorrect OTP attempts. Please request a new OTP."
            )
            
        if record["otp"] != submitted_otp.strip():
            remaining_attempts = settings.OTP_MAX_ATTEMPTS - record["attempts"]
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid OTP entered. {remaining_attempts} attempts remaining."
            )
            
        # Verification successful: invalidate token to prevent replay
        self._store.pop(phone_number, None)
        return True

otp_service = OTPStore()
