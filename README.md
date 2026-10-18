# AUTI AIGNOSIS

> **Tagline:** *“AI-Assisted Screening. Clinical Connection. Better Support.”*

**Auti AIgnosis** is a production-grade, responsive healthcare web platform providing AI-assisted autism screening indications and direct clinical bridges to verified developmental pediatricians and child psychologists.

---

> [!IMPORTANT]
> **STATUTORY CLINICAL SAFETY NOTICE**
> The platform is strictly an **AI-assisted autism screening tool** and **does not diagnose autism**. Every screening result clearly states:
> 
> *“This screening result is for informational and screening support only. It is not a medical diagnosis. Please consult a qualified clinician for professional evaluation.”*

---

## Repository Architecture

```
Auti-Aignosis/
│
├── frontend/               # React 19 + TypeScript + Vite + Tailwind CSS SPA
├── backend/                # FastAPI + SQLAlchemy ORM backend services
├── ml/                     # ML training, evaluation, and inference pipeline
├── data/
│   ├── raw/                # Read-only source datasets (autism_screening_data.csv)
│   ├── processed/          # Leakage-free train/test feature matrices
│   └── reports/            # EDA summary and validation reports
│
├── security/
│   ├── SECURITY_CHECKLIST.md # Security audit and deployment checklist
│   ├── VULNERABILITY_LOG.md  # Comprehensive CVE and vulnerability tracker
│   └── PATCH_NOTES.md       # Chronological changelog of security patches
│
├── rules/
│   ├── README.md           # Governance system overview & index
│   ├── DATASET_RULES.md    # Dataset integrity, leakage prevention & PII rules
│   ├── ML_RULES.md         # Multi-model benchmarking & validation criteria
│   ├── SECURITY_RULES.md   # Zero-trust, RBAC & secret management standards
│   ├── PRIVACY_RULES.md    # Healthcare privacy (HIPAA / DPDP Act 2023)
│   ├── CLINICAL_SAFETY_RULES.md # Screening vs diagnosis & statutory notices
│   ├── API_SECURITY_RULES.md    # REST API security, CORS & error masking
│   ├── FRONTEND_SECURITY_RULES.md # Client-side XSS & session hygiene
│   ├── DATABASE_SECURITY_RULES.md # Parameterized ORM queries & audit trails
│   ├── TESTING_RULES.md    # Test coverage matrix & mandatory test suites
│   ├── DEPLOYMENT_RULES.md # Staged deployment gates & zero-downtime rules
│   ├── CODE_QUALITY_RULES.md    # PEP 8, TypeScript strictness & architecture
│   └── AI_OUTPUT_RULES.md  # Permissible phrasing & explainability bounds
│
├── scripts/
│   ├── dataset_validate    # Dataset schema, null, and privacy verification
│   ├── security_check      # Secrets, CORS, SQLi, and IDOR audit
│   ├── ml_validate         # Model thresholds (F1/Recall >= 0.90) & boundaries
│   └── test_all            # Unified test & audit runner
│
├── .env.example            # Environment configuration template
├── .gitignore              # Repository exclusion rules
└── README.md
```

---

## 1. System Architecture & Features

### 1.1 Multilingual Support
Native dynamic translation switching across three languages:
- **English**
- **Kannada (ಕನ್ನಡ)**
- **Hindi (हिन्दी)**
Translates all navigation, questions, result interpretations, clinician directory cards, and consultation note editors.

### 1.2 User Roles & Access Control (RBAC)
- **Patient / Parent / Caregiver**:
  - Secure mobile number + OTP authentication (with expiration, rate limiting, and attempt counts).
  - Child and caregiver profile management.
  - 20-item behavioral screening organized into 5 developmental domains.
  - Interactive developmental profile breakdown with visual intensity bars.
  - Direct connection to verified specialists and appointment booking with conflict prevention.
- **Clinician**:
  - Professional workspace with today's appointments, pending consultations, and total patients.
  - Access to authorized patient records: demographics, screening history, AI model probability, and individual question answers.
  - Dedicated clinical consultation notes editor with direct observation summary and follow-up guidance.
- **Platform Administrator**:
  - Centralized dashboard tracking active screenings, appointments, and verification status.
  - Clinician credential verification queue (Approve / Revoke).
  - User account management (Deactivate / Reactivate).
  - Searchable security and audit event logs.

---

## 2. Machine Learning Pipeline (Scikit-Learn)

Based on validated **AQ-10 & Q-CHAT** behavioral screening paradigms across 5 domains:
1. **Communication**
2. **Social Interaction**
3. **Sensory Responses**
4. **Repetitive Behaviors**
5. **Daily-Life Skills**

### Model Comparison & Validation Metrics
Trained and evaluated on stratified partitions with balanced class weights:
- **Random Forest (Selected Champion)**: Accuracy `99.17%`, Precision `97.67%`, Recall `100.00%`, **F1-Score `0.9882`**, ROC-AUC `0.9988`
- **Logistic Regression**: F1-Score `0.9882`, ROC-AUC `0.9995`
- **Support Vector Machine (SVM)**: F1-Score `0.9882`, ROC-AUC `0.9994`
- **Decision Tree**: F1-Score `0.9540`, ROC-AUC `0.9765`

Serialized model artifact: `backend/app/ml/models/best_screening_model.joblib` (Version `v1.0.0`).

---

## 3. Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, React Router 7.
- **Backend**: Python 3.13, FastAPI, Pydantic v2, SQLAlchemy ORM, Uvicorn.
- **Database**: SQLite (default zero-dependency local run) / PostgreSQL & Supabase compatible.
- **AI/ML**: Scikit-Learn, Pandas, NumPy, Joblib.
- **Security**: Salted bcrypt password hashing, HS256 JWT sessions, transactional concurrency guards.

---

## 4. Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 4.1 Backend Setup
```bash
# 1. Activate virtual environment
.\venv\Scripts\activate   # On Windows
# source venv/bin/activate # On Linux/macOS

# 2. Run Database Seeding (Pre-seeds demo patient, verified clinicians, admin)
python -m backend.app.database.seed

# 3. Train ML Model Pipeline (Pre-bundled)
python -m backend.app.ml.train

# 4. Start FastAPI Backend Gateway
python -m uvicorn backend.main:app --reload --port 8000
```
Backend API will be live at `http://127.0.0.1:8000` (Interactive Swagger docs at `http://127.0.0.1:8000/docs`).

### 4.2 Frontend Setup
```bash
cd frontend

# Install dependencies (already prepared)
npm install

# Start Vite Development Server
npm run dev
```
Frontend will be live at `http://localhost:5173`.

---

## 5. Demo Credentials & One-Click Role Switcher

The top navigation bar contains an **instant one-click role switcher**:
- **[ Patient Demo ]**: Logs in as `Priya Sharma` (Child: `Aarav Sharma`, 5 yrs).
- **[ Clinician Demo ]**: Logs in as `Dr. Ananya Sharma` (Developmental Specialist).
- **[ Admin Demo ]**: Logs in as `System Administrator`.

### Manual Credentials
| Role | Identifier / Email | Password / OTP |
|---|---|---|
| **Patient** | `+919876543210` | OTP: `123456` (Mock Mode enabled) |
| **Clinician 1** | `ananya.sharma@autiaignosis.org` | `Password@123` |
| **Clinician 2** | `rajesh.kulkarni@autiaignosis.org` | `Password@123` |
| **Administrator** | `admin@autiaignosis.org` | `Admin@12345` |

---

## 6. End-to-End Evaluation Flow (26 Steps)

1. Open `http://localhost:5173`.
2. Toggle languages (`English | ಕನ್ನಡ | हिन्दी`) to verify instant translation.
3. Enter mobile number `+919876543210` and click **Send OTP**.
4. Enter 6-digit OTP code `123456` and verify.
5. Patient Dashboard opens displaying Child Profile (`Aarav Sharma`), previous assessment, and upcoming appointment.
6. Click **Edit Profile** to modify child age/language preferences.
7. Click **Start AI Screening**.
8. Go through the 20-item behavioral questionnaire across the 5 domains.
9. Click **Submit & Analyze Screening**.
10. System processes responses through the Random Forest classifier.
11. Results screen displays:
    - Screening Indication badge (`Higher Indication` or `Lower Indication`).
    - 5-Domain developmental profile intensity bars.
    - Key contributing behavioral domains.
    - Prominent Clinical Safety Notice banner.
12. Click **Connect with a Clinician**.
13. View verified specialist cards (Dr. Ananya Sharma, Dr. Rajesh Kulkarni).
14. Click **Book Appointment**, choose date and slot, and confirm.
15. Use the top demo switcher to select **Clinician Demo**.
16. Clinician workspace displays today's consultations and pending requests.
17. Click **Open Patient Clinical File**.
18. Clinician reviews child demographics, screening score, and full 20 questionnaire answers.
19. Clinician documents observation notes and follow-up guidance in the Consultation Notes editor.
20. Click **Save Consultation Documentation** (saved to audit trail).
21. Switch to **Admin Demo** using the top switcher.
22. Admin Dashboard displays overall platform metrics.
23. Toggle clinician verification state (Approve / Revoke).
24. Toggle user account activation state (Deactivate / Activate).
25. Inspect chronological security and audit event logs.
26. Verify that patient-to-clinician and patient-to-admin IDOR or privilege escalation attempts are strictly blocked.

---

## 7. Testing & Verification Commands

```bash
# 1. Unified Platform Verification (Runs dataset, security, ML, and pytest test suites)
python scripts/test_all.py

# 2. Individual Automated Verification Commands
python scripts/dataset_validate.py   # Dataset schema, class balance, and privacy audit
python scripts/security_check.py      # Secret scanning, CORS, SQLi, and IDOR audit
python scripts/ml_validate.py         # Champion thresholds, edge cases & disclaimer checks

# 3. Backend Pytest Suite (16 comprehensive tests)
.\venv\Scripts\pytest -v backend\app\tests

# 4. Frontend Build & Bundle Inspection
cd frontend
npm run build
```
