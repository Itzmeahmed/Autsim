# Auti AIgnosis — Machine Learning Governance Rules (ML_RULES.md)

> **CORE MANDATE**  
> The machine learning model is an **automated screening classifier**, NOT a diagnostic engine. Model training, evaluation, validation, and deployment must adhere to the highest standards of clinical machine learning safety.

---

## 1. Model Development & Comparison Workflow
1. **Model Pipeline Separation**:
   - Preprocessing must be enclosed within reproducible scikit-learn `Pipeline` and `ColumnTransformer` constructs.
   - All transformations (scaling, imputations, one-hot encodings) must be fit strictly on the training partition (`X_train`) and applied downstream to evaluation partitions (`X_test`).
2. **Fixed Random Seeds**:
   - Random state must be explicitly seeded (`random_state=42`) across dataset partitioning, k-fold splits, and stochastic estimators to guarantee reproducible weights.
3. **Mandatory Multi-Model Benchmark Comparison**:
   Every training cycle must benchmark at least 4 standard clinical baseline estimators:
   - **Logistic Regression**: Linear reference model with L2 regularization and standard feature scaling.
   - **Decision Tree**: Interpretable baseline with constrained tree depth (`max_depth <= 6`) to prevent over-fitting.
   - **Random Forest**: Non-linear ensemble model with stratified bootstrap sampling (`n_estimators=100`, balanced class weights).
   - **Support Vector Machine (SVM)**: Radial Basis Function (RBF) kernel with calibrated probability estimates.

---

## 2. Model Evaluation & Selection Criteria
1. **Never Select by Accuracy Alone**:
   In healthcare screening, overall accuracy is deceptive due to class imbalance and the disproportionate clinical cost of False Negatives (FN).
2. **Mandatory Recorded Metrics**:
   Every model candidate must be evaluated across:
   - **Accuracy**: Overall fraction of correct predictions.
   - **Precision**: Positive Predictive Value (`TP / (TP + FP)`).
   - **Recall (Sensitivity)**: True Positive Rate (`TP / (TP + FN)`).
   - **F1-Score**: Harmonic mean of Precision and Recall (`2 * (P * R) / (P + R)`).
   - **ROC-AUC**: Area under the Receiver Operating Characteristic curve.
   - **Confusion Matrix**: Full breakdown of `[TN, FP, FN, TP]`.
3. **Clinical Priority for Screening**:
   - **Minimize False Negatives**: A child with developmental delays should not be missed by the screening tool. High recall is paramount.
   - **Champion Selection**: The champion model is selected based on maximized **F1-Score** and **Recall**, provided False Positives do not degrade precision below clinical usability thresholds (> 90%).

---

## 3. Strict Input Schema Validation
Prediction endpoints must never permit raw or unvalidated client inputs to reach the ML model. The following checks are strictly enforced before vectorization:

```
Client / Mobile App
       ↓
Pydantic v2 Schema Validation
       ↓
Business Range Checks (Age: 2-16 yrs, Responses: 0 or 1)
       ↓
Unexpected / Unknown Field Rejection
       ↓
NaN, None, Infinity & Missing Field Verification
       ↓
Vectorization & Preprocessing Transform
       ↓
ML Estimator Inference
       ↓
Calibrated Output & Statutory Clinical Notice
```

### Specific Validation Directives
- **Required Fields**: Exactly 20 questionnaire items (`Q1` to `Q20`), child age, child gender, jaundice at birth, family history of ASD.
- **Allowed Ranges**:
  - Questionnaire responses: binary discrete integers (`0` or `1`).
  - Child age: bounded between `2` and `16` years inclusive.
  - Gender: strictly validated against `["m", "f", "Male", "Female"]`.
  - Binary medical history: strictly validated against `["yes", "no"]`.
- **Rejection**: Requests containing missing questions, negative ages, NaN, Inf, or unrecognized keys must be rejected immediately with HTTP 422/400.

---

## 4. Model Versioning & Artifact Traceability
1. **Metadata Serialization**:
   Every exported model artifact (`.joblib`) must be accompanied by an immutable metadata ledger (`model_metadata.json`) containing:
   - Model version tag (e.g., `v1.0.0`)
   - Champion architecture name
   - Training sample size and positive prevalence
   - Full ordered feature attribute list
   - Validation performance metrics across all candidate estimators
   - Timestamp and training environment hashes
2. **Storage Location**:
   Serialized models are managed exclusively under `/ml/models/` and `/backend/app/ml/models/`.

---

## 5. Explainability & Domain Attribution
1. **Domain Groupings**:
   Explainability is structured around the 5 clinical screening domains:
   - **Communication** (`Q1, Q5, Q9, Q13`)
   - **Social Interaction** (`Q2, Q6, Q10, Q14`)
   - **Sensory Responses** (`Q3, Q7, Q11, Q15`)
   - **Repetitive Behaviors** (`Q4, Q8, Q12, Q16`)
   - **Daily-Life Skills** (`Q17, Q18, Q19, Q20`)
2. **Permissible Explanatory Language**:
   - **ALLOWED**: *"This developmental area contributed to the model's screening output."*
   - **FORBIDDEN**: *"This feature proves the child has autism."*
   - Internal technical parameters (such as raw node splits, Gini impurity values, or uncalibrated log-odds) must never be displayed directly to patients or caregivers.

---

## 6. Automated Model Validation Command
Every newly trained model must be validated through:
```bash
python scripts/ml_validate.py
```
This script confirms artifact integrity, verifies input schema boundaries, tests prediction latency, and ensures F1 and Recall meet safety thresholds before deployment.
