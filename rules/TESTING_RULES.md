# Auti AIgnosis — Testing Governance Rules (TESTING_RULES.md)

> **CORE PRINCIPLE**  
> Clinical software systems require rigorous automated test suites. Untested code must not be merged or deployed.

---

## 1. Test Suite Categories & Coverage Mandate
1. **Minimum Coverage**: The backend test suite must maintain at least **80% code coverage** across all API routes, authentication logic, and ML inference pipelines.
2. **Deterministic & Isolated**: Tests must use an isolated in-memory or ephemeral test database and execute without relying on external third-party network services.

---

## 2. Mandatory Test Coverage Matrix

### 2.1 Authentication & OTP Tests
- `test_valid_otp_login`: Verifies successful token generation with correct credentials.
- `test_expired_otp`: Asserts rejection and HTTP 400 when OTP exceeds expiration window.
- `test_invalid_otp`: Verifies error message and remaining attempt decrement.
- `test_otp_brute_force_lockout`: Asserts HTTP 429 after 5 failed attempts.
- `test_otp_resend_cooldown`: Asserts HTTP 429 when resending before cooldown interval.

### 2.2 Authorization & IDOR Tests
- `test_patient_access_own_record`: Verifies patient can read their own profile and screenings.
- `test_patient_cannot_access_other_patient`: Asserts HTTP 403 when patient attempts to view another patient's records.
- `test_clinician_access_authorized_patient`: Verifies clinician can access patient with active booking.
- `test_clinician_cannot_access_unauthorized_patient`: Asserts HTTP 403 when clinician attempts to access an unassigned patient.
- `test_admin_privilege_enforcement`: Asserts non-admin users cannot access administrative endpoints.

### 2.3 Screening & ML Pipeline Tests
- `test_screening_submission_valid`: Validates 20-item submission and complete output schema.
- `test_screening_missing_items`: Asserts HTTP 422 when responses are omitted.
- `test_screening_invalid_values`: Asserts HTTP 422 when values are outside binary range.
- `test_screening_disclaimer_present`: Verifies the statutory clinical disclaimer is present in every result.
- `test_screening_explainability_domains`: Verifies all 5 developmental domains are calculated.

### 2.4 Clinical Appointment Scheduling Tests
- `test_appointment_booking_valid`: Verifies slot reservation.
- `test_appointment_double_booking_conflict`: Asserts HTTP 409 Conflict when the same slot is booked twice.
- `test_appointment_unauthorized_status_update`: Asserts HTTP 403 when an unauthorized caller updates status.

### 2.5 Security & Injection Tests
- `test_sql_injection_resilience`: Verifies SQL injection strings in inputs are safely sanitized by ORM.
- `test_security_headers_present`: Verifies nosniff, DENY, and XSS headers in responses.

---

## 3. Execution Commands
```bash
# Backend test suite execution
pytest -v backend/app/tests

# Security validation runner
python scripts/security_check.py

# Complete unified verification
python scripts/test_all.py
```
