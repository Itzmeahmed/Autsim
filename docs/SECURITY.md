# Auti AIgnosis – Security Architecture & Maintenance Policy

## 1. Security Overview & Core Principles
**Auti AIgnosis** handles sensitive developmental health indicators and demographic records for children and families. Security is treated as an immutable design requirement rather than an operational afterthought.

### Core Security Tenets
1. **Zero Diagnostic Overreach**: AI models strictly evaluate behavioral screening vectors. The system explicitly bars automated medical diagnoses.
2. **Strict Identity Isolation**: Patients can never access peer patient records, clinical consultation notes, or administrative controls.
3. **Least Privilege & Role-Based Access Control**:
   - `patient`: Scoped strictly to the authenticated parent's child profile and personal bookings.
   - `clinician`: Access restricted strictly to assigned/booked patients.
   - `admin`: Restricted administrative control over clinician verification and audit traces.

---

## 2. Threat Modeling & Safeguards

| Threat Vector | Mitigation Strategy | Implemented Mechanism |
|---|---|---|
| **OTP Brute-Forcing** | Limit consecutive failed verification attempts and enforce expiration. | Max 5 attempts per OTP; 300s expiration; 60s resend cooldown. |
| **Insecure Direct Object Reference (IDOR)** | Backend validation of resource ownership against authenticated JWT claim. | Endpoints inspect `current_user.id` against foreign keys in `patient_profiles` and `screenings`. |
| **Privilege Escalation** | Scoped role-checking dependencies. | `require_role(["admin"])` and `require_role(["clinician"])` guards on all privileged routes. |
| **SQL Injection (SQLi)** | Parameterized query execution. | SQLAlchemy ORM abstracting all database queries. |
| **Double Booking Race Conditions** | Transactional slot availability verification. | Concurrency check on `(clinician_id, date, time)` before record creation. |
| **Sensitive Data Exposure** | Password hashing & clean serialization. | Salted bcrypt (`gensalt()`); Pydantic schemas filter internal fields. |

---

## 3. Vulnerability Severity Matrix

| Severity Level | Definition | SLA for Patch Resolution |
|---|---|---|
| **CRITICAL** | Remote code execution, authentication bypass, unauthorized access to all patient medical records. | $\le 24$ hours |
| **HIGH** | Insecure Direct Object Reference (IDOR) leaking single patient screening, clinician privilege escalation. | $\le 72$ hours |
| **MEDIUM** | Rate limiting circumvention, unhandled server traceback disclosure in non-production environments. | $\le 7$ calendar days |
| **LOW** | Minor UI inconsistencies or non-sensitive log format errors. | Next sprint release cycle |

---

## 4. Release Security Checklist
Before any release or production rollout, the following verification commands must pass:
- [x] Dependency audit: `pip check` and `npm audit`.
- [x] Automated test suite: `pytest -v backend/app/tests`.
- [x] Static type verification: `npm run build` (`tsc -b && vite build`).
- [x] Verify no plaintext credentials exist in source repositories (`.env.example` used).
- [x] Verify non-diagnostic statutory banners render across all screening interfaces.
