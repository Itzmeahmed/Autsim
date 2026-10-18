# Auti AIgnosis — Data Privacy Governance Rules (PRIVACY_RULES.md)

> **CORE PRINCIPLE**  
> Child developmental and behavioral records constitute **Sensitive Personal Data (SPD)** and **Protected Health Information (PHI)**. Data handling must comply with the Digital Personal Data Protection (DPDP) Act 2023, HIPAA Privacy Rule principles, and GDPR data protection standards.

---

## 1. Principles of Data Minimization
1. **Purpose Limitation**:
   Data collected from caregivers and children must be strictly limited to what is medically and operationally necessary for:
   - User account provisioning and authentication
   - Administration of the 20-item screening questionnaire
   - Generating 5-domain developmental triage profiles
   - Facilitating clinical consultation appointments with verified specialists
2. **Prohibited Collection**:
   The platform must NEVER collect:
   - Biometric identifiers or facial recognition scans
   - Precise GPS coordinates (only city/state or preferred language is retained)
   - Aadhaar, PAN, SSN, or national identity card numbers
   - Financial payment card details (managed via external certified payment PCI-DSS gateways)

---

## 2. De-Identification & Anonymization (HIPAA Safe Harbor)
1. **Research & Modeling Isolation**:
   Any dataset utilized for ML model training, benchmarking, or statistical reporting must have all direct and indirect identifiers stripped.
2. **Safe Harbor Fields**:
   Direct identifiers (names, full dates of birth, phone numbers, email addresses) must never be joined with screening score vectors in raw research datasets.
3. **Synthetic / Pseudonymized IDs**:
   All patient entities must be referenced internally through opaque primary keys or random UUIDs.

---

## 3. Caregiver Consent & Notice
1. **Explicit Informed Consent**:
   Before initiating an AI screening questionnaire, parents/caregivers must be presented with a clear consent notice specifying:
   - The screening nature of the tool (informational, not diagnostic).
   - How questionnaire responses will be processed by the ML screening model.
   - That records will be shared only with verified clinicians whom the parent explicitly books.
2. **Multilingual Consent**:
   Consent notices must be provided natively in the caregiver's preferred language (English, Kannada, Hindi).

---

## 4. Caregiver Rights & Data Governance
1. **Right to Access & Portability**:
   Parents may download a clinical summary report of their screening results and consultation history.
2. **Right to Erasure (Right to be Forgotten)**:
   Caregivers may request account deletion. Upon verification, all associated screening responses, patient profile data, and appointment logs must be purged or irreversibly anonymized within 30 days, subject to statutory medical record retention obligations.
3. **No Secondary Commercial Use**:
   Screening records and developmental profiles must NEVER be sold, shared with data brokers, or used for third-party targeted advertising.
