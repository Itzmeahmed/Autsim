# Auti AIgnosis — Database Security Governance Rules (DATABASE_SECURITY_RULES.md)

> **CORE PRINCIPLE**  
> Database operations must maintain absolute protection against **SQL Injection**, data corruption, and unauthorized data leakage. All relational access is mediated by parameterized ORM layers.

---

## 1. Absolute Prohibition of Dynamic SQL Concatenation
1. **Parameterized Queries & ORM**:
   - Every database query must execute through SQLAlchemy ORM abstractions or explicitly parameterized bound statements.
   - Raw string concatenation (e.g., `f"SELECT * FROM users WHERE id = '{uid}'"`) is **strictly forbidden**.
2. **Input Sanitation Prior to DB**:
   - Filter and sanitize inputs at the API layer before committing data to database sessions.

---

## 2. Relational Integrity & Schema Constraints
1. **Foreign Key Integrity**:
   - Relational tables (`screenings`, `screening_responses`, `appointments`, `clinical_notes`) must enforce foreign key constraints with explicit `ondelete` strategies (e.g., `CASCADE` or `RESTRICT`).
2. **Unique Constraints**:
   - Unique indexes must prevent duplicate patient records (`phone_number`, `email`).
   - Transactional slot uniqueness prevents double booking of clinician appointment hours.
3. **Column Constraints**:
   - Non-nullable constraints (`nullable=False`) enforced on critical audit columns: timestamps, user roles, screening scores.

---

## 3. Storage Encryption & Data at Rest
1. **Password & Credential Hashing**:
   - Passwords must be hashed using `bcrypt` with unique cryptographic salts prior to persistence. Plaintext passwords must never enter the database engine.
2. **Production DB Encryption**:
   - In production deployments (PostgreSQL on AWS RDS, GCP Cloud SQL, or Supabase), Transparent Data Encryption (TDE) or LUKS disk volume encryption (AES-256) is mandatory.
3. **Encrypted Transport**:
   - Production database connections must enforce SSL/TLS mode (`sslmode=require`).

---

## 4. Immutable Audit Trail
1. **Audit Ledger Structure**:
   The `audit_logs` table records every critical security and clinical interaction with:
   - `id`: Auto-incrementing primary key
   - `user_id`: Actor identity (nullable for unauthenticated attempts)
   - `action`: Standardized event code (`LOGIN`, `SCREENING_SUBMITTED`, etc.)
   - `resource`: Target entity reference
   - `ip_address`: Network origin
   - `status`: Outcome (`SUCCESS` or `FAILURE`)
   - `timestamp`: UTC creation timestamp
2. **Immutability**:
   Audit log rows must never be updated or deleted by application users or clinicians.

---

## 5. Backup & Disaster Recovery
1. **Automated Backups**: Daily encrypted database snapshots retained with 30-day versioning.
2. **Point-In-Time Recovery (PITR)**: Production databases must support recovery to any second within the retention window.
3. **Backup Restoration Testing**: Recovery procedures must be rehearsed quarterly.
