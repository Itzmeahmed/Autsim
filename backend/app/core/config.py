"""
Auti AIgnosis - Configuration Settings
"""

import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Auti AIgnosis – AI-Assisted Autism Screening & Clinical Connection Platform"
    TAGLINE: str = "AI-Assisted Screening. Clinical Connection. Better Support."
    API_V1_STR: str = "/api"
    
    # Environment & Security
    ENV: str = os.getenv("ENV", "development")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "autism-screening-clinical-platform-super-secret-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./autism.db")
    
    # OTP Configuration
    MOCK_OTP_MODE: bool = True
    OTP_EXPIRY_SECONDS: int = 300 # 5 minutes
    OTP_MAX_ATTEMPTS: int = 5
    OTP_RESEND_COOLDOWN_SECONDS: int = 60
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ]
    
    def validate_production_settings(self):
        """Ensures insecure development defaults are not used in production."""
        if self.ENV == "production":
            dev_default = "autism-screening-clinical-platform-super-secret-key-2026"
            if self.SECRET_KEY == dev_default or len(self.SECRET_KEY) < 32:
                raise ValueError("CRITICAL SECURITY ERROR: SECRET_KEY must be a cryptographically secure key of at least 32 characters in production.")
            if self.MOCK_OTP_MODE:
                raise ValueError("CRITICAL SECURITY ERROR: MOCK_OTP_MODE must be False in production.")

    class Config:
        case_sensitive = True

settings = Settings()
settings.validate_production_settings()
