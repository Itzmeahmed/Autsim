"""
Auti AIgnosis - Database Seeder
Seeds baseline demo users, clinical profiles, initial screening records, and audit logs.
"""

from datetime import datetime, timezone
from backend.app.core.database import SessionLocal, Base, engine
from backend.app.core.security import hash_password
from backend.app.models.models import (
    User, UserRole, PatientProfile, ClinicianProfile, Screening,
    ScreeningResponse, ScreeningResult, Appointment, ClinicalNote, AuditLog
)

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        # Check if already seeded
        if db.query(User).first():
            print("Database already contains records. Skipping seed.")
            return

        print("Seeding Auti AIgnosis database with demo profiles...")

        # 1. Admin Account
        admin = User(
            role=UserRole.ADMIN.value,
            email="admin@autiaignosis.org",
            phone_number="+919000000001",
            hashed_password=hash_password("Admin@12345"),
            full_name="Dr. Suresh Rao (Administrator)",
            is_active=True,
            is_verified=True
        )
        db.add(admin)

        # 2. Clinicians
        clinician1_user = User(
            role=UserRole.CLINICIAN.value,
            email="ananya.sharma@autiaignosis.org",
            phone_number="+919000000002",
            hashed_password=hash_password("Password@123"),
            full_name="Dr. Ananya Sharma",
            is_active=True,
            is_verified=True
        )
        db.add(clinician1_user)
        db.flush()

        c1_profile = ClinicianProfile(
            user_id=clinician1_user.id,
            full_name="Dr. Ananya Sharma",
            specialty="Developmental Specialist & Pediatrician",
            qualification="MBBS, MD (Pediatrics), DCH",
            experience_years=9,
            languages="English, Kannada, Hindi",
            bio="Specialist in neurodevelopmental screening, early behavioral intervention, and parent counseling.",
            availability_hours="10:00 AM - 01:00 PM, 02:00 PM - 05:00 PM",
            is_verified_by_admin=True
        )
        db.add(c1_profile)

        clinician2_user = User(
            role=UserRole.CLINICIAN.value,
            email="rajesh.kulkarni@autiaignosis.org",
            phone_number="+919000000003",
            hashed_password=hash_password("Password@123"),
            full_name="Dr. Rajesh Kulkarni",
            is_active=True,
            is_verified=True
        )
        db.add(clinician2_user)
        db.flush()

        c2_profile = ClinicianProfile(
            user_id=clinician2_user.id,
            full_name="Dr. Rajesh Kulkarni",
            specialty="Child Psychologist & Behavioral Therapist",
            qualification="Ph.D. in Clinical Child Psychology",
            experience_years=12,
            languages="English, Kannada",
            bio="Expertise in sensory modulation assessments, structured play therapies, and functional adaptive support.",
            availability_hours="11:00 AM - 04:00 PM",
            is_verified_by_admin=True
        )
        db.add(c2_profile)

        # 3. Patient / Parent Account
        patient_user = User(
            role=UserRole.PATIENT.value,
            email="priya.parent@example.com",
            phone_number="+919876543210",
            hashed_password=hash_password("Patient@123"),
            full_name="Priya Sharma",
            is_active=True,
            is_verified=True
        )
        db.add(patient_user)
        db.flush()

        p_profile = PatientProfile(
            user_id=patient_user.id,
            full_name="Priya Sharma",
            child_name="Aarav Sharma",
            date_of_birth="2021-04-15",
            age=5,
            gender="Male",
            parent_guardian_name="Priya Sharma (Mother)",
            preferred_language="English",
            medical_history_notes="Normal term delivery. Occasional sensitivity to loud blender noises."
        )
        db.add(p_profile)
        db.flush()

        # 4. Seed a baseline Completed Screening
        sample_screening = Screening(
            patient_id=p_profile.id,
            child_age=5,
            child_gender="m",
            total_score=14,
            status="Completed"
        )
        db.add(sample_screening)
        db.flush()

        sample_result = ScreeningResult(
            screening_id=sample_screening.id,
            screening_indication="Higher Indication",
            probability_score=0.742,
            developmental_profile={
                "Communication": 75.0,
                "Social Interaction": 75.0,
                "Sensory Responses": 50.0,
                "Repetitive Behaviors": 75.0,
                "Daily-Life Skills": 50.0
            },
            key_contributing_areas=["Communication", "Social Interaction", "Repetitive Behaviors"],
            explanation="Recorded responses indicate higher behavioral indications in reciprocal communication and repetitive routines.",
            disclaimer="This screening result is for informational and screening support only. It is not a medical diagnosis. Please consult a qualified clinician for professional evaluation.",
            model_version="v1.0.0"
        )
        db.add(sample_result)

        # 5. Seed a Confirmed Appointment
        sample_appointment = Appointment(
            patient_id=p_profile.id,
            clinician_id=c1_profile.id,
            appointment_date="2026-10-10",
            appointment_time="11:30 AM",
            status="Confirmed",
            reason_for_visit="Follow-up clinical consultation regarding preliminary AI screening findings."
        )
        db.add(sample_appointment)
        db.flush()

        # 6. Seed initial audit logs
        db.add(AuditLog(
            user_id=admin.id,
            action="SYSTEM_INITIALIZATION",
            resource="database",
            ip_address="127.0.0.1",
            status="SUCCESS",
            details="Auti AIgnosis database seeded with verified clinical and administrative structures."
        ))

        db.commit()
        print("Database seed completed successfully.")
        
    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
