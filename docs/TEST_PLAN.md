# Auti AIgnosis – Master Test Plan & Validation Matrix

## 1. Testing Strategy Overview
The Auti AIgnosis test suite encompasses unit tests, integration tests, security test cases, and clinical validation checks across both the FastAPI backend and React frontend.

---

## 2. Security & Functional Test Cases Matrix

| Test ID | Test Description | Precondition | Test Steps | Expected Result | Status |
|---|---|---|---|---|---|
| **TC-AUTH-001** | Valid Patient OTP Login | User enters registered mobile number | 1. Enter mobile number<br>2. Request OTP<br>3. Submit valid 6-digit OTP | User receives valid JWT and is redirected to Patient Dashboard | **PASSED** |
| **TC-AUTH-002** | Invalid OTP Protection | OTP has been dispatched | 1. Enter invalid OTP `000000`<br>2. Submit verification | System returns HTTP 400 Bad Request with remaining attempts count | **PASSED** |
| **TC-AUTH-003** | Clinician Password Authentication | Registered clinician in database | 1. Enter email `ananya.sharma@autiaignosis.org`<br>2. Enter password `Password@123` | System returns token with role `clinician` | **PASSED** |
| **TC-AUTH-004** | Admin Password Authentication | Registered admin in database | 1. Enter email `admin@autiaignosis.org`<br>2. Enter password `Admin@12345` | System returns token with role `admin` | **PASSED** |
| **TC-SEC-001** | Patient to Admin Privilege Escalation Guard | Authenticated with patient token | 1. Send GET request to `/api/admin/stats` with patient bearer token | System returns HTTP 403 Forbidden | **PASSED** |
| **TC-SEC-002** | Clinician to Admin Privilege Escalation Guard | Authenticated with clinician token | 1. Send GET request to `/api/admin/users` with clinician bearer token | System returns HTTP 403 Forbidden | **PASSED** |
| **TC-SCR-001** | Multilingual Questions Schema | Server running | 1. Query GET `/api/screening/questions` | Returns 20 items with translations in English, Kannada, and Hindi | **PASSED** |
| **TC-SCR-002** | ML Screening Inference & Disclaimer | Authenticated patient | 1. Submit 20 questionnaire answers to `/api/screening/submit` | Returns calculated indication, 5 domain percentages, and mandatory disclaimer | **PASSED** |
| **TC-APPT-001** | Appointment Double-Booking Prevention | Clinician has slot at 10:30 AM | 1. Patient A books 10:30 AM slot<br>2. Patient B attempts booking same slot | First booking succeeds; second booking returns HTTP 409 Conflict | **PASSED** |
| **TC-AUD-001** | Audit Log Trail Verification | Operations performed on platform | 1. Admin requests `/api/admin/audit-logs` | Chronological event logs returned with user IDs, timestamps, actions | **PASSED** |

---

## 3. Automated Execution Commands

```bash
# Run backend pytest suite with verbose output
.\venv\Scripts\pytest -v backend\app\tests

# Run frontend build & type check
cd frontend
npm run build
```
