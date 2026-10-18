# Auti AIgnosis — Clinical & Engineering Governance Rules

> **MANDATORY CLINICAL DIRECTIVE**  
> Auti AIgnosis is an **AI-assisted autism screening and clinical triage system**.  
> It must **NEVER** claim to provide an autonomous, automated, or medical diagnosis of Autism Spectrum Disorder (ASD).

---

## 1. Overview & Purpose
This directory contains the operational, clinical safety, data integrity, machine learning, and security governance rules for the **Auti AIgnosis** platform. Adherence to these rules is strictly required across all development, research, training, and deployment workflows.

## 2. Rule Architecture Index

| Document | Scope & Purpose |
|---|---|
| [DATASET_RULES.md](file:///c:/Users/HP/OneDrive/Documents/autism/rules/DATASET_RULES.md) | Autism dataset ingestion, validation, class distribution, de-identification, and leakage prevention. |
| [ML_RULES.md](file:///c:/Users/HP/OneDrive/Documents/autism/rules/ML_RULES.md) | Reproducible training, model comparison, evaluation metrics, fairness, and input validation schemas. |
| [SECURITY_RULES.md](file:///c:/Users/HP/OneDrive/Documents/autism/rules/SECURITY_RULES.md) | Zero-trust architecture, authentication, RBAC, session lifecycles, and cryptographic standards. |
| [PRIVACY_RULES.md](file:///c:/Users/HP/OneDrive/Documents/autism/rules/PRIVACY_RULES.md) | Healthcare data privacy, HIPAA/DPDP Act compliance, data minimization, and audit rights. |
| [CLINICAL_SAFETY_RULES.md](file:///c:/Users/HP/OneDrive/Documents/autism/rules/CLINICAL_SAFETY_RULES.md) | Screening vs diagnosis demarcation, statutory disclaimers, clinician-in-the-loop, and emergency crisis routing. |
| [API_SECURITY_RULES.md](file:///c:/Users/HP/OneDrive/Documents/autism/rules/API_SECURITY_RULES.md) | REST API hardening, rate limiting, CORS, input sanitization, and generic error propagation. |
| [FRONTEND_SECURITY_RULES.md](file:///c:/Users/HP/OneDrive/Documents/autism/rules/FRONTEND_SECURITY_RULES.md) | Client-side security, XSS/CSRF prevention, token storage, and accessible multilingual UX. |
| [DATABASE_SECURITY_RULES.md](file:///c:/Users/HP/OneDrive/Documents/autism/rules/DATABASE_SECURITY_RULES.md) | Parameterized queries, ORM safety, encryption at rest, constraint enforcement, and audit logs. |
| [TESTING_RULES.md](file:///c:/Users/HP/OneDrive/Documents/autism/rules/TESTING_RULES.md) | Automated testing requirements for auth, IDOR, screening edge cases, ML pipelines, and code coverage. |
| [DEPLOYMENT_RULES.md](file:///c:/Users/HP/OneDrive/Documents/autism/rules/DEPLOYMENT_RULES.md) | Staged deployment gates (Dev → Test → Security Review → Staging → Prod), secrets isolation, and backups. |
| [CODE_QUALITY_RULES.md](file:///c:/Users/HP/OneDrive/Documents/autism/rules/CODE_QUALITY_RULES.md) | Static typing, linting, error handling, formatting, and clean architecture standards. |
| [AI_OUTPUT_RULES.md](file:///c:/Users/HP/OneDrive/Documents/autism/rules/AI_OUTPUT_RULES.md) | Non-diagnostic language requirements, probability presentation, explainability bounds, and disclaimers. |

---

## 3. Core Principles Summary
1. **Never Claim Diagnosis**: All outputs are probabilistic screening indications ("Higher Indication" vs "Lower Indication").
2. **Never Blindly Trust Data**: All data must be validated for schema, nulls, duplicates, and leakage before ingestion.
3. **No Target Leakage**: Preprocessing transforms (scaling, one-hot encoding) must be fit exclusively on training splits.
4. **Zero-Trust Backend**: Frontend UI hiding is not security. All authorization, ownership, and role checks occur on the backend.
5. **No Exposed Secrets**: No hardcoded keys, passwords, or tokens in source code, logs, or client-side assets.
6. **Automated Enforcement**: All scripts in `/scripts` must pass clean before production releases.
