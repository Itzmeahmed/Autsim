# Auti AIgnosis — Exploratory Data Analysis & Statistical Summary

> **Screening Classification Dataset: Exploratory Analysis**  
> Generated from 1,200 validated behavioral screening observations modeled on the AQ-10 and Q-CHAT paradigms.

---

## 1. Summary Statistics
- **Total Observations**: 1,200
- **Total Predictor Variables**: 25
- **Class 0 (Lower Indication)**: 780 (65.0%)
- **Class 1 (Higher Indication)**: 420 (35.0%)
- **Missing / Null Count**: 0 across all 26 columns (100% complete)
- **Duplicate Observations**: 0 duplicate rows detected

---

## 2. Demographic Breakdown
- **Age Distribution**:
  - Minimum Age: 2 years
  - Maximum Age: 16 years
  - Mean Age: 9.12 years (Standard Deviation: 4.26)
- **Gender Balance**:
  - Male (m): 730 (60.8%)
  - Female (): 470 (39.2%)
- **Neonatal Jaundice**:
  - History Present: 307 (25.6%)
  - History Absent: 893 (74.4%)
- **Family History of ASD / Neurodevelopmental Traits**:
  - Positive Family History: 253 (21.1%)
  - Negative Family History: 947 (78.9%)

---

## 3. Domain Contribution & Mean Response Rates
Comparison of average indicator rates across the 5 developmental screening domains:

| Screening Domain | Higher Indication Group (Class 1) Mean | Lower Indication Group (Class 0) Mean | Separation Delta |
|---|---|---|---|
| Communication | 0.668 | 0.223 | +0.445 |
| Social Interaction | 0.676 | 0.220 | +0.456 |
| Sensory Responses | 0.650 | 0.216 | +0.434 |
| Repetitive Behaviors | 0.660 | 0.222 | +0.438 |
| Daily-Life Skills | 0.666 | 0.209 | +0.457 |

---

## 4. Leakage & Contamination Assessment
1. **Target Leakage**: No post-hoc clinician diagnosis or outcome labels exist within the feature columns.
2. **Train/Test Contamination**: Full feature scaling and one-hot encoding are isolated strictly to the training fold.
3. **Data Quality Status**: PASSED all schema integrity, type validation, and range checks.
