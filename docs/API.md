# Auti AIgnosis – RESTful API Documentation

Base URL: `/api`

## 1. Authentication Endpoints

### `POST /api/auth/send-otp`
Dispatches a 6-digit verification code to the specified phone number.
- **Request Body**:
  ```json
  { "phone_number": "+919876543210" }
  ```
- **Response** (HTTP 200):
  ```json
  {
    "message": "OTP sent successfully to your mobile number.",
    "phone_number": "+919876543210",
    "expires_in_seconds": 300,
    "mock_otp": "123456"
  }
  ```

### `POST /api/auth/verify-otp`
Verifies OTP code and provisions or returns the patient session.
- **Request Body**:
  ```json
  { "phone_number": "+919876543210", "otp": "123456" }
  ```
- **Response** (HTTP 200):
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "user_id": 1,
    "role": "patient",
    "full_name": "Priya Sharma",
    "profile_id": 1
  }
  ```

### `POST /api/auth/login`
Authenticates clinician and administrative personnel.
- **Request Body**:
  ```json
  { "email": "ananya.sharma@autiaignosis.org", "password": "Password@123" }
  ```

---

## 2. Patient & Screening Endpoints

### `GET /api/screening/questions`
Retrieves the 20 structured items across the 5 domains in English, Kannada, and Hindi.

### `POST /api/screening/submit`
Executes ML inference over responses and computes the 5-domain developmental profile.
- **Headers**: `Authorization: Bearer <token>`
- **Response** (HTTP 200):
  ```json
  {
    "id": 1,
    "screening_id": 1,
    "screening_indication": "Higher Indication",
    "probability_score": 0.742,
    "developmental_profile": {
      "Communication": 75.0,
      "Social Interaction": 75.0,
      "Sensory Responses": 50.0,
      "Repetitive Behaviors": 75.0,
      "Daily-Life Skills": 50.0
    },
    "key_contributing_areas": ["Communication", "Social Interaction", "Repetitive Behaviors"],
    "explanation": "Recorded responses indicate higher behavioral indications...",
    "disclaimer": "This screening result is for informational and screening support only. It is not a medical diagnosis. Please consult a qualified clinician for professional evaluation.",
    "model_version": "v1.0.0"
  }
  ```

---

## 3. Clinician & Appointment Endpoints

### `GET /api/clinicians/`
Returns the verified clinicians directory.

### `GET /api/appointments/slots?clinician_id=1&date=2026-10-15`
Returns available slots with backend double-booking prevention.

### `POST /api/appointments/`
Reserves a consultation slot.

### `POST /api/clinical-notes/`
Allows authenticated clinicians to document observations and follow-up guidance.

---

## 4. Admin Endpoints

### `GET /api/admin/stats`
Returns system metrics (total screenings, appointments, verified clinicians).

### `POST /api/admin/clinicians/{id}/verify?verified=true`
Sets verification status for clinical practitioners.

### `GET /api/admin/audit-logs`
Returns chronological security traces.
