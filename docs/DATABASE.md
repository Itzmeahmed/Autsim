# Auti AIgnosis – Database Architecture & Schema Specification

## 1. Relational Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USERS ||--o| PATIENT_PROFILES : "has one"
    USERS ||--o| CLINICIAN_PROFILES : "has one"
    USERS ||--o{ AUDIT_LOGS : "generates"
    USERS ||--o{ NOTIFICATIONS : "receives"
    PATIENT_PROFILES ||--o{ SCREENINGS : "submits"
    PATIENT_PROFILES ||--o{ APPOINTMENTS : "books"
    CLINICIAN_PROFILES ||--o{ APPOINTMENTS : "conducts"
    SCREENINGS ||--o{ SCREENING_RESPONSES : "contains"
    SCREENINGS ||--|| SCREENING_RESULTS : "yields"
    APPOINTMENTS ||--o| CLINICAL_NOTES : "documents"

    USERS {
        int id PK
        string role "patient, clinician, admin"
        string phone_number UK
        string email UK
        string hashed_password
        string full_name
        boolean is_active
        boolean is_verified
        datetime created_at
    }

    PATIENT_PROFILES {
        int id PK
        int user_id FK
        string full_name
        string child_name
        int age
        string gender
        string parent_guardian_name
        string preferred_language
        text medical_history_notes
    }

    CLINICIAN_PROFILES {
        int id PK
        int user_id FK
        string full_name
        string specialty
        string qualification
        int experience_years
        string languages
        text bio
        string availability_hours
        boolean is_verified_by_admin
    }

    SCREENINGS {
        int id PK
        int patient_id FK
        int child_age
        string child_gender
        int total_score
        string status
        datetime created_at
    }

    SCREENING_RESULTS {
        int id PK
        int screening_id FK, UK
        string screening_indication
        float probability_score
        json developmental_profile
        json key_contributing_areas
        text explanation
        text disclaimer
        string model_version
    }

    APPOINTMENTS {
        int id PK
        int patient_id FK
        int clinician_id FK
        string appointment_date
        string appointment_time
        string status
        text reason_for_visit
    }

    CLINICAL_NOTES {
        int id PK
        int appointment_id FK, UK
        int clinician_id FK
        int patient_id FK
        text consultation_notes
        text follow_up_recommendations
        text observation_summary
    }

    AUDIT_LOGS {
        int id PK
        int user_id FK
        string action
        string resource
        string ip_address
        string status
        text details
        datetime created_at
    }
```

---

## 2. Indexing & Integrity Strategies
- **Unique Indexes**: `users.phone_number`, `users.email`, `screening_results.screening_id`, `clinical_notes.appointment_id`.
- **Foreign Key Constraints**: All relational cascading rules (`cascade="all, delete-orphan"`) ensure zero orphaned screening responses or dangling patient appointments.
- **Audit Immutability**: `audit_logs` entries cannot be updated once inserted.
