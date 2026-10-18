# Auti AIgnosis — Security Patch Notes (PATCH_NOTES.md)

Chronological changelog of security fixes, architectural hardening, and governance controls implemented in Auti AIgnosis.

---

## Release: v1.1.0-Security-Hardening (2026-10-04)

### 1. Insecure Direct Object Reference (IDOR) Mitigations
- **Patched `backend/app/api/clinical_notes.py`**:
  - Enforced appointment doctor identity validation (`appt.clinician_id == clinician.id`). Clinicians can no longer create or alter notes for consultations assigned to other specialists.
- **Patched `backend/app/api/appointments.py`**:
  - Restricted `update_appointment_status` to authorized owners: patients can only cancel their own appointments; clinicians can update statuses of their assigned consultations; admins have auditable oversight.
  - Eliminated arbitrary fallback query in `book_appointment` that could accidentally bind bookings to unintended patient profiles.
- **Patched `backend/app/api/clinicians.py`**:
  - Enforced relationship check in `get_clinician_patient_detail`. Clinicians can only inspect medical history, screening scores, and responses for patients who have an active appointment with them.
- **Patched `backend/app/api/screening.py`**:
  - Enforced RBAC check on `get_screening_result` to restrict clinician access to booked patients only.

### 2. API Gateway & Transport Hardening
- **Patched `backend/main.py`**:
  - Removed insecure CORS wildcard `allow_origins=["*"]` when credentials are permitted. Replaced with explicit `settings.CORS_ORIGINS`.
  - Added HTTP security headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`, and HSTS configuration.
  - Masked internal database and stack trace errors via generic 500 error response handler.

### 3. Authentication & Configuration Security
- **Patched `backend/app/core/config.py`**:
  - Added environment verification. Production mode (`ENV=production`) enforces minimum 256-bit entropy on `SECRET_KEY` and rejects default development placeholders.
- **Patched `backend/app/services/otp_service.py`**:
  - Disabled static mock OTP bypass in production environments. Enforced cryptographically secure random 6-digit generation via `secrets` module.

### 4. Input Validation & Machine Learning Pipeline
- **Patched `backend/app/schemas/schemas.py`**:
  - Added Pydantic field validators on `ScreeningSubmitRequest`: constrained child age between 2 and 16 years, and questionnaire responses strictly to binary `{0, 1}`.
- **Leakage-Free Preprocessing**:
  - Isolated feature scaling and one-hot encoding strictly to training fold (`X_train`) via `ColumnTransformer`. Created `/data/processed/train_features.csv` and `/data/processed/test_features.csv`.
- **Statutory Clinical Disclaimers**:
  - Verified that all AI inference outputs append mandatory non-diagnostic notice.

### 5. Automated Verification Scripts
- Added cross-platform automated security, dataset, and ML audit tools under `/scripts/`:
  - `dataset_validate.py` (and executable wrapper `dataset_validate`)
  - `security_check.py` (and executable wrapper `security_check`)
  - `ml_validate.py` (and executable wrapper `ml_validate`)
  - `test_all.py` (and executable wrapper `test_all`)
