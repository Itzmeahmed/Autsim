# Auti AIgnosis – Software Requirements Specification (SRS)

## 1. Functional Requirements

### 1.1 Authentication & Authorization (FR-AUTH)
- **FR-AUTH-1**: The system shall support patient login via mobile number and a 6-digit cryptographic OTP.
- **FR-AUTH-2**: The system shall enforce a 5-minute expiration period on dispatched OTPs and a 60-second cooldown period on resend requests.
- **FR-AUTH-3**: The system shall support password-based authentication for clinicians and administrators using salted bcrypt hashing.
- **FR-AUTH-4**: The system shall enforce strict Role-Based Access Control (`patient`, `clinician`, `admin`) on all backend endpoints.

### 1.2 Screening & AI Assessment (FR-SCR)
- **FR-SCR-1**: The questionnaire shall encompass 20 structured items across 5 clinical domains: Communication, Social Interaction, Sensory Responses, Repetitive Behaviors, Daily-Life Skills.
- **FR-SCR-2**: The system shall compute domain sub-scores and run inference using a trained Scikit-learn Random Forest model.
- **FR-SCR-3**: The screening result shall explicitly return:
  1. `screening_indication`: "Higher Indication" or "Lower Indication".
  2. `probability_score`: Floating-point confidence measure.
  3. `developmental_profile`: Domain breakdown (0 to 100%).
  4. `disclaimer`: Mandatory non-diagnostic statutory text.

### 1.3 Clinical Bridge & Appointments (FR-CLIN)
- **FR-CLIN-1**: Verified clinicians shall be displayed in a public directory with specialties, languages, and hours.
- **FR-CLIN-2**: The appointment booking system shall prevent double-booking conflicts on the backend.
- **FR-CLIN-3**: Clinicians shall be able to record consultation notes, observations, and follow-up plans for authorized patients.

---

## 2. Non-Functional Requirements

### 2.1 Security & Privacy
- Zero persistent storage of cleartext passwords or sensitive tokens.
- Parameterized database operations through SQLAlchemy to eliminate SQL injection vulnerabilities.
- Mitigation of IDOR through caller identity verification against resource ownership.

### 2.2 Performance
- API response times under normal load $\le 100\text{ ms}$.
- Client bundle compressed payload $\le 500\text{ KB}$ with fast first-contentful paint.

### 2.3 Internationalization
- Real-time language switching without page reloads across English, Kannada, and Hindi.
