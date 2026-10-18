# Auti AIgnosis — Security Governance Rules (SECURITY_RULES.md)

> **CORE PRINCIPLE**  
> Healthcare platforms demand a **Zero-Trust, Defense-in-Depth** security posture. Client-side state must NEVER be trusted for authorization, clinical status, or access privileges.

---

## 1. Authentication Security Standards
1. **Patient Authentication (Mobile + OTP)**:
   - **Expiration**: OTP tokens expire strictly after `300 seconds` (5 minutes).
   - **Attempt Limits**: Maximum of `5 attempts` per generated OTP. Exceeding 5 attempts immediately revokes the OTP and invalidates the session state.
   - **Resend Cooldown**: A compulsory `60-second cooldown` prevents SMS flooding and abuse.
   - **Replay Protection**: Upon successful verification, the OTP is deleted from memory/store immediately.
   - **Production Randomization**: In staging and production environments (`ENV != 'development'`), OTPs must be cryptographically generated 6-digit integers. Mock codes (`123456`) are disabled.
2. **Staff Authentication (Clinicians & Administrators)**:
   - Secure email and password authentication using salted **bcrypt** password hashing (minimum 12 rounds).
   - JWT tokens signed with SHA-256 HMAC (`HS256`) and an entropy-rich secret key (minimum 256 bits).
   - Token payload includes `sub` (user_id), `role`, and `exp` timestamp.

---

## 2. Role-Based Access Control (RBAC) & Authorization
The platform defines three distinct authorization tiers:
- **`patient`**: Access strictly limited to own child profile, own screening submissions, own appointment bookings, and assigned clinician consultation notes.
- **`clinician`**: Access limited to verified clinician profile, professional scheduling queue, and assigned patients with confirmed or completed appointments.
- **`admin`**: Access to platform management, clinician verification queue, account activation toggles, and security audit logs.

### Backend Authorization Mandate
- **Never Trust Frontend State**: Hiding UI buttons, navigation items, or tabs on the frontend is an ergonomics feature, NOT a security control.
- **Server-Side Enforcement**: Every protected endpoint must execute backend dependency guards (`get_current_user`, `get_patient_user`, `get_clinician_user`, `get_admin_user`).

---

## 3. Insecure Direct Object Reference (IDOR) Prevention
1. **Ownership Verification**:
   Endpoints referencing resource IDs (e.g., `patient_id`, `screening_id`, `appointment_id`, `note_id`) must explicitly verify that the requesting user owns or is authorized for that entity:
   ```python
   # Example: Verifying screening ownership
   if current_user.role == "patient" and screening.patient.user_id != current_user.id:
       raise HTTPException(status_code=403, detail="Access denied to requested resource.")
   ```
2. **Clinician Access Boundary**:
   A clinician cannot query medical records of arbitrary patients. The backend must verify that a valid consultation appointment exists between the clinician and patient before releasing clinical records.

---

## 4. Secret Management & Cryptographic Hygiene
1. **Zero Secrets in Code**: No API keys, JWT signing keys, database passwords, or third-party credentials may exist in the codebase.
2. **Configuration Source**: All environment variables must load via `.env` with fallback to secure runtime configuration.
3. **Repository Quarantine**:
   The root `.gitignore` must strictly exclude:
   ```
   .env
   *.key
   *.pem
   credentials/
   secrets/
   ```
4. **Sample Template**: All required variables are documented with safe placeholders in `.env.example`.

---

## 5. Audit Trail & Logging
1. **Mandatory Audited Events**:
   - `LOGIN_SUCCESS`, `LOGIN_FAILED`, `LOGOUT`
   - `OTP_REQUESTED`, `OTP_FAILED`, `OTP_LOCKED`
   - `SCREENING_SUBMITTED`, `SCREENING_ACCESSED`
   - `APPOINTMENT_BOOKED`, `APPOINTMENT_CANCELLED`, `APPOINTMENT_STATUS_UPDATED`
   - `CLINICAL_NOTE_SAVED`, `CLINICAL_NOTE_ACCESSED`
   - `CLINICIAN_VERIFIED`, `CLINICIAN_UNVERIFIED`
   - `USER_ACTIVATED`, `USER_DEACTIVATED`
   - `PERMISSION_DENIED`
2. **Sanitization in Logs**:
   - **NEVER** write plaintext passwords, secret keys, or OTP values to log files.
   - Strip full credit card numbers, sensitive clinical diagnoses, and identifiable medical narratives from standard access logs.

---

## 6. Automated Security Verification Command
Run the automated security check suite:
```bash
python scripts/security_check.py
```
This script audits for hardcoded credentials, validates CORS configurations, scans dependency advisories, and inspects IDOR guards.
