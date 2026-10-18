# Auti AIgnosis — Dataset Governance Rules (DATASET_RULES.md)

> **MANDATORY PRINCIPLE**  
> An autism screening dataset must **NEVER be blindly trusted**. Clinical, statistical, and privacy validation is mandatory before any data touches the modeling pipeline.

---

## 1. Directory Structure Mandate
The dataset architecture is partitioned into three strictly separated tiers:
```
data/
├── raw/         # READ-ONLY original source datasets. Never edit or overwrite in-place.
├── processed/   # Preprocessed, leakage-free feature matrices (train_features.csv, test_features.csv).
├── reports/     # Automated statistical validation, EDA summaries, and drift audit logs.
└── README.md    # Source provenance, licensing, methodology, and limitations documentation.
```

### Protection & Immutability Rules
1. **Never modify the original dataset directly**: All transformations must execute programmatically via a reproducible pipeline script.
2. **Access Control**: Raw datasets in `/data/raw/` must NEVER be exposed publicly. They must never be placed inside `/frontend/public/`, `/frontend/src/assets/`, or static web directories.
3. **No Direct Browser Downloads**: Raw patient or research data must not be downloadable via public client APIs.

---

## 2. Ingestion & Pre-Screening Protocol
Before any dataset is admitted into training or evaluation, the data pipeline must programmatically verify:
1. **Row & Column Dimensions**: Explicit count of observations and feature attributes.
2. **Feature Inventory**: Canonical catalog of all column names and expected semantic meanings.
3. **Data Types**: Strict verification of integer, floating-point, boolean, and categorical types.
4. **Missing Values**: Systematic count and percentage of `NaN`, `null`, `None`, empty strings, or sentinel values (`-1`, `999`).
5. **Duplicate Observations**: Identification and deduplication of repeated records.
6. **Class Distribution**: Quantified balance between target classes (e.g., typical developmental indication vs elevated screening indication).
7. **Sensitive Columns**: Audit for Protected Health Information (PHI) or Personally Identifiable Information (PII).
8. **Data Leakage Risk**: Inspection for target leakage or post-outcome indicators.

---

## 3. Prevention of Data Leakage

```
RAW DATA
   ↓
Validation (/data/reports/dataset_validation_report.json)
   ↓
Cleaning & De-Identification
   ↓
Removal of Post-Outcome & Contaminated Columns
   ↓
Stratified Train/Test Split (Fit transforms NEVER touch test set)
   ↓
Fit Preprocessing Pipeline ONLY on Training Data (Imputation, Scaler, One-Hot)
   ↓
Transform Test/Validation Data using Fitted Pipeline
   ↓
Model Training on Train Set
   ↓
Unbiased Evaluation on Held-Out Test Set
```

### Specific Anti-Leakage Constraints
- **Train/Test Contamination**: Never normalize, standardize, impute, or encode categorical features on the full dataset prior to the train/test split.
- **Outcome Leakage**: Never include features derived from post-assessment clinician diagnoses, outcome summaries, or diagnostic triage notes as predictors for the screening model.
- **Deduplication Across Partitions**: Ensure duplicate or near-duplicate records do not span both training and test partitions.
- **Test Set Quarantine**: The test partition must remain sealed until final evaluation. Do not tune hyperparameters on the test partition.

---

## 4. Target Variable Semantics
1. **Explicit Determination**: Do not assume column names represent clinical diagnoses. In this system, the target column is explicitly defined as:
   - Target Column: `screening_indication`
   - Label `0`: *Lower screening indication* (developmental milestones within typical range).
   - Label `1`: *Higher screening indication* (recommends referral to child psychologist/developmental pediatrician).
2. **Diagnostic Claim Prohibition**: The target label must **NEVER** be renamed or described as:
   - `"autism_diagnosis"`
   - `"has_autism"`
   - `"definitive_asd"`
3. **Dataset Nomenclature**: This dataset is officially designated as a:
   > **"Screening classification dataset"**  
   > It is **NOT** a "clinical diagnostic dataset".

---

## 5. Protected Health Information (PHI) & Privacy
Autism screening records contain sensitive developmental and behavioral data.
- **Zero Raw PII**: The dataset must never contain real patient names, telephone numbers, physical addresses, National IDs, Social Security numbers, or specific IP addresses.
- **Pseudonymization**: Record identifiers must be synthetic UUIDs or hash-based anonymized tokens.
- **Prohibited Surfaces**: Sensitive health identifiers must never appear in:
  - Git commits or public repositories
  - Frontend code, client-side bundles, or browser console logs
  - Screenshots, demonstration recordings, or marketing collateral
  - Error messages, stack traces, or exception payloads
  - Serialized model artifact attributes or metadata strings

---

## 6. Automated Validation Command
Every dataset modification must pass automated validation:
```bash
python scripts/dataset_validate.py
```
Outputs must be recorded in `/data/reports/dataset_validation_report.json`.
