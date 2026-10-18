# Auti AIgnosis — Raw Dataset Storage (data/raw/README.md)

> **DATA ACCESS AND ACCESS RESTRICTION NOTICE**  
> The raw autism screening dataset is stored in this directory as a read-only research artifact.  
> It must **NEVER** be committed to public repositories, embedded in frontend web assets, or made accessible via public API endpoints.

---

## 1. Storage & Security Constraints
1. **Directory Immutability**:
   - Files in this directory (`data/raw/autism_screening_data.csv`) are strictly **READ-ONLY**.
   - Do not edit, clean, impute, or modify the raw file in-place.
   - All transformations are performed by reproducible scripts saving to `data/processed/`.
2. **Access Control**:
   - This directory is excluded from frontend bundles, static web serving paths, and public distribution archives.
   - Authorized clinical researchers and engineers must obtain approval before accessing raw datasets.

---

## 2. Ingestion & Reproduction Instructions
If obtaining or regenerating the validated research dataset:
```bash
# Execute dataset validation and report generation
python scripts/dataset_validate.py
```
This script validates data integrity, checks missing values, asserts that no personal identifiable information (PII) exists, and verifies class balance.
