"""
Auti AIgnosis - AI-Assisted Autism Screening & Clinical Connection Platform
FastAPI Application Gateway & Service Orchestrator
"""

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time

from backend.app.core.config import settings
from backend.app.core.database import Base, engine
from backend.app.database.seed import seed_database
from backend.app.api import auth, patients, screening, clinicians, appointments, clinical_notes, admin
from backend.app.ml.model_manager import ModelManager

# Initialize Database Schema & Seed
Base.metadata.create_all(bind=engine)
seed_database()

# Eager load ML model
ModelManager.get_instance()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Secure, responsive, clinical connection and AI-assisted screening platform.",
    version="1.0.0"
)

# CORS Middleware - Restrict to explicit allowlist from settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Security Headers & Request Timing Middleware
@app.middleware("http")
async def add_security_headers_and_timing(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = f"{process_time:.4f}s"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    if settings.ENV == "production":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# Global Exception Handler to avoid leaking internal tracebacks
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Log internally
    print(f"[ERROR] Unhandled Exception at {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please try again or contact system support."}
    )

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(patients.router, prefix=settings.API_V1_STR)
app.include_router(screening.router, prefix=settings.API_V1_STR)
app.include_router(clinicians.router, prefix=settings.API_V1_STR)
app.include_router(appointments.router, prefix=settings.API_V1_STR)
app.include_router(clinical_notes.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "Auti AIgnosis Backend",
        "version": "1.0.0",
        "ml_model_status": "Ready",
        "model_version": ModelManager.get_instance().get_version()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
