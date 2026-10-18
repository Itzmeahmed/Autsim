"""
Auti AIgnosis - Configuration Settings

Values come from real environment variables first, then from a local `.env`
file (never committed). On Render/Vercel, set them in the dashboard instead.
"""

from typing import List, Optional

from pydantic_settings import BaseSettings, SettingsConfigDict

DEV_DEFAULT_SECRET = "autism-screening-clinical-platform-super-secret-key-2026"


def normalize_database_url(url: str) -> str:
    """Makes provider connection strings SQLAlchemy-compatible.

    Neon/Heroku-style URLs may start with `postgres://`, which SQLAlchemy 2.x rejects.
    """
    url = url.strip()
    if url.startswith("postgres://"):
        url = "postgresql://" + url[len("postgres://"):]
    return url


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    PROJECT_NAME: str = "Auti AIgnosis – AI-Assisted Autism Screening & Clinical Connection Platform"
    TAGLINE: str = "AI-Assisted Screening. Clinical Connection. Better Support."
    API_V1_STR: str = "/api"

    # Environment & Security: development | staging | production
    ENV: str = "development"
    SECRET_KEY: str = DEV_DEFAULT_SECRET
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Database (SQLite locally; set to your Neon/Supabase PostgreSQL URL when deployed)
    DATABASE_URL: str = "sqlite:///./autism.db"

    # OTP Configuration
    MOCK_OTP_MODE: bool = True
    OTP_EXPIRY_SECONDS: int = 300  # 5 minutes
    OTP_MAX_ATTEMPTS: int = 5
    OTP_RESEND_COOLDOWN_SECONDS: int = 60

    # Demo / seed controls
    # None = follow ENV (on only in development). Set explicitly to override.
    ENABLE_DEMO_LOGIN: Optional[bool] = None
    SEED_DEMO_DATA: Optional[bool] = None
    # Optional first-admin bootstrap for deployments that do not seed demo data
    ADMIN_EMAIL: Optional[str] = None
    ADMIN_PASSWORD: Optional[str] = None

    # CORS (comma-separated list of extra allowed origins, e.g. your Vercel URL)
    ALLOWED_ORIGINS: str = ""
    FRONTEND_URL: str = ""

    @property
    def is_production(self) -> bool:
        return self.ENV == "production"

    @property
    def database_url(self) -> str:
        return normalize_database_url(self.DATABASE_URL)

    @property
    def demo_login_enabled(self) -> bool:
        if self.is_production:
            return False
        if self.ENABLE_DEMO_LOGIN is not None:
            return self.ENABLE_DEMO_LOGIN
        return self.ENV == "development"

    @property
    def seed_demo_data(self) -> bool:
        if self.SEED_DEMO_DATA is not None:
            return self.SEED_DEMO_DATA
        return not self.is_production

    @property
    def cors_origins(self) -> List[str]:
        origins: List[str] = []
        if not self.is_production:
            origins += [
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:3000",
                "http://localhost:8000",
                "http://127.0.0.1:8000",
            ]
        extra = [o.strip().rstrip("/") for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]
        if self.FRONTEND_URL.strip():
            extra.append(self.FRONTEND_URL.strip().rstrip("/"))
        for origin in extra:
            if origin not in origins:
                origins.append(origin)
        return origins

    def validate_production_settings(self):
        """Ensures insecure development defaults are not used in production."""
        if self.is_production:
            if self.SECRET_KEY == DEV_DEFAULT_SECRET or len(self.SECRET_KEY) < 32:
                raise ValueError("CRITICAL SECURITY ERROR: SECRET_KEY must be a cryptographically secure key of at least 32 characters in production.")
            if self.MOCK_OTP_MODE:
                raise ValueError("CRITICAL SECURITY ERROR: MOCK_OTP_MODE must be False in production.")
            if self.database_url.startswith("sqlite"):
                raise ValueError("CRITICAL CONFIG ERROR: DATABASE_URL must point to PostgreSQL in production (SQLite files are wiped on restart on most hosts).")


settings = Settings()
settings.validate_production_settings()
