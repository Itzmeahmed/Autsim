# Auti AIgnosis — Security Verification Checklist (SECURITY_CHECKLIST.md)

This checklist provides a systematic audit framework for all security controls in Auti AIgnosis prior to staging and production deployment.

---

## 1. Authentication & Session Management
- [x] **OTP Expiration**: OTP tokens expire after 300 seconds (5 minutes).
- [x] **OTP Attempt Limit**: Maximum 5 attempts before token is invalidated.
- [x] **OTP Resend Cooldown**: 60-second cooldown between consecutive OTP requests.
- [x] **Brute-Force Protection**: Rapid consecutive failures lock out the active OTP session.
- [x] **Session Expiration**: JWT access tokens configured with 24-hour expiration (`ACCESS_TOKEN_EXPIRE_MINUTES`).
- [x] **Secure Token Invalidation**: Logout cleanses client memory and state.
- [x] **Production Secret Guard**: In production, hardcoded dev secret keys are rejected.

---

## 2. Authorization & Role-Based Access Control (RBAC)
- [x] **Server-Side Enforcement**: All authorization decisions occur in backend FastAPI dependency injections (`deps.py`).
- [x] **Role Separation**: Three roles strictly separated (`patient`, `clinician`, `admin`).
- [x] **IDOR Prevention (Patient Profile)**: Patients can only access their own profile.
- [x] **IDOR Prevention (Screening History)**: Patients can only view their own screening submissions.
- [x] **IDOR Prevention (Clinical Notes)**: Clinicians can only create/update notes for appointments assigned to them.
- [x] **IDOR Prevention (Clinician Patient Access)**: Clinicians can only review medical profiles of patients with an active consultation/booking.
- [x] **Admin Route Isolation**: Non-admin roles receive HTTP 403 Forbidden on administrative endpoints.

---

## 3. Data Protection in Transit & at Rest
- [x] **TLS / HTTPS**: Production configuration enforces TLS 1.3 encryption.
- [x] **Database ORM**: SQLAlchemy ORM parameterized queries used exclusively; no raw string SQL concatenation.
- [x] **Credential Hashing**: Passwords stored using salted `bcrypt` hashes.
- [x] **Raw Dataset Protection**: Dataset quarantined in `/data/raw/`, excluded from web-accessible directories (`/public`, `/static`).
- [x] **Sensitive Health Information**: No patient names, phone numbers, or clinical notes exposed in logs or URLs.

---

## 4. API & Network Gateway Hardening
- [x] **CORS Allowlist**: Explicit origin allowlist configured; wildcard `*` with credentials disabled in production.
- [x] **Security Headers**:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Content-Security-Policy` and `Strict-Transport-Security` configured.
- [x] **Error Sanitization**: Global exception handler masks internal stack traces and database errors.
- [x] **Input Validation**: Pydantic v2 schemas reject malformed payloads, out-of-range ages, and non-binary questionnaire responses.

---

## 5. Machine Learning & Clinical Safety
- [x] **No Diagnostic Assertions**: AI outputs explicitly framed as screening indications ("Higher Indication" / "Lower Indication").
- [x] **Mandatory Statutory Notice**: Clinical non-diagnosis disclaimer appended to all screening outputs.
- [x] **Explainability Attribution**: 5-domain developmental breakdown provided without claiming disease certainty.
- [x] **Model Versioning**: Serialized models accompanied by immutable metadata ledger.
- [x] **No Data Leakage**: Stratified train/test split executed prior to fitting preprocessing transforms.

---

## 6. Audit & Accountability
- [x] **Comprehensive Audit Logging**: All logins, failed attempts, screenings, bookings, and admin actions logged.
- [x] **Log Sanitization**: Passwords, OTP codes, and JWT secrets stripped from audit log messages.
- [x] **Audit Immutability**: Application users cannot modify or truncate audit log tables.
