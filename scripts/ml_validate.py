#!/usr/bin/env python3
"""
Auti AIgnosis — Automated Machine Learning Validation Script
Verifies model artifact presence, metadata integrity, clinical safety thresholds
(F1 >= 0.90, Recall >= 0.90), input boundary validation, and inference latency.
"""

import os
import sys
import json
import time

# Ensure project root is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ml.predict import run_screening_prediction, DISCLAIMER_TEXT
from ml.evaluate import load_evaluation_report

def run_ml_validation() -> bool:
    print("=" * 70)
    print("AUTI AIGNOSIS — MACHINE LEARNING SAFETY & MODEL VALIDATION")
    print("=" * 70)
    
    failures = 0

    # 1. Verify model artifacts existence
    print("\n[CHECK 1] Verifying serialized model artifacts & metadata...")
    required_paths = [
        "ml/models/best_screening_model.joblib",
        "ml/models/model_metadata.json",
        "backend/app/ml/models/best_screening_model.joblib",
        "backend/app/ml/models/model_metadata.json",
        "data/reports/ml_validation_report.json"
    ]
    for p in required_paths:
        if os.path.exists(p):
            print(f"  [PASS] Artifact exists: {p}")
        else:
            print(f"  [FAIL] Missing model artifact: {p}")
            failures += 1

    # 2. Inspect metadata & 4-model comparison
    print("\n[CHECK 2] Auditing benchmark comparison across 4 candidate models...")
    report = load_evaluation_report()
    if "error" in report:
        print(f"  [FAIL] Failed to load evaluation report: {report['error']}")
        return False
        
    metrics = report.get("metrics", {})
    required_models = ["RandomForest", "LogisticRegression", "DecisionTree", "SVM"]
    for m in required_models:
        if m in metrics:
            perf = metrics[m]
            print(f"  [PASS] Model '{m}': Acc={perf['accuracy']:.4f}, Prec={perf['precision']:.4f}, Rec={perf['recall']:.4f}, F1={perf['f1_score']:.4f}, ROC={perf['roc_auc']:.4f}")
        else:
            print(f"  [FAIL] Benchmark missing model candidate: {m}")
            failures += 1

    # 3. Clinical screening thresholds check on selected champion
    print("\n[CHECK 3] Evaluating champion performance against clinical safety thresholds...")
    best_model = report.get("best_model")
    best_perf = metrics.get(best_model, {})
    f1 = best_perf.get("f1_score", 0.0)
    rec = best_perf.get("recall", 0.0)
    fn = best_perf.get("false_negatives", 999)
    
    print(f"  Champion Selected: {best_model}")
    print(f"  F1-Score: {f1:.4f} (Threshold >= 0.9000)")
    print(f"  Recall: {rec:.4f} (Threshold >= 0.9000)")
    print(f"  False Negatives on Test Partition: {fn}")
    
    if f1 < 0.90:
        print(f"  [FAIL] Champion F1-score {f1:.4f} is below clinical safety threshold of 0.90!")
        failures += 1
    else:
        print(f"  [PASS] Champion F1-score satisfies clinical standard.")
        
    if rec < 0.90:
        print(f"  [FAIL] Champion Recall {rec:.4f} is below clinical safety threshold of 0.90!")
        failures += 1
    else:
        print(f"  [PASS] Champion Recall satisfies clinical standard.")

    # 4. Live inference testing
    print("\n[CHECK 4] Testing live model inference & explainability output...")
    # Profile A: Low indication (all 0s)
    low_input = {f"Q{i+1}": 0 for i in range(20)}
    start_t = time.time()
    low_res = run_screening_prediction(low_input, age=5, gender="m")
    low_time = (time.time() - start_t) * 1000
    print(f"  Typical Profile Inference: Indication='{low_res['screening_indication']}', Score={low_res['probability_score']} (Latency: {low_time:.1f}ms)")
    if low_res["screening_indication"] != "Lower Indication":
        print(f"  [FAIL] Expected 'Lower Indication' for all-zero responses, got '{low_res['screening_indication']}'")
        failures += 1
    else:
        print(f"  [PASS] Typical profile classified correctly.")

    # Profile B: High indication (all 1s)
    high_input = {f"Q{i+1}": 1 for i in range(20)}
    start_t = time.time()
    high_res = run_screening_prediction(high_input, age=7, gender="f")
    high_time = (time.time() - start_t) * 1000
    print(f"  Elevated Profile Inference: Indication='{high_res['screening_indication']}', Score={high_res['probability_score']} (Latency: {high_time:.1f}ms)")
    if high_res["screening_indication"] != "Higher Indication":
        print(f"  [FAIL] Expected 'Higher Indication' for all-one responses, got '{high_res['screening_indication']}'")
        failures += 1
    else:
        print(f"  [PASS] Elevated profile classified correctly.")

    # 5. Statutory clinical disclaimer verification
    print("\n[CHECK 5] Verifying mandatory non-diagnostic statutory notice...")
    if DISCLAIMER_TEXT not in low_res["disclaimer"]:
        print("  [FAIL] Statutory disclaimer missing or altered in screening prediction output!")
        failures += 1
    else:
        print("  [PASS] Statutory disclaimer verified verbatim in prediction payload.")

    # 6. Model input schema boundary rejection tests
    print("\n[CHECK 6] Testing model input boundary validation...")
    # Test age under 2
    try:
        run_screening_prediction(low_input, age=1)
        print("  [FAIL] Model failed to reject invalid age < 2!")
        failures += 1
    except ValueError:
        print("  [PASS] Underage input (age=1) correctly rejected with ValueError.")

    # Test age over 16
    try:
        run_screening_prediction(low_input, age=20)
        print("  [FAIL] Model failed to reject invalid age > 16!")
        failures += 1
    except ValueError:
        print("  [PASS] Overage input (age=20) correctly rejected with ValueError.")

    # Test missing question items
    incomplete_input = {f"Q{i+1}": 0 for i in range(19)}
    try:
        run_screening_prediction(incomplete_input, age=5)
        print("  [FAIL] Model failed to reject incomplete questionnaire (<20 items)!")
        failures += 1
    except ValueError:
        print("  [PASS] Incomplete questionnaire (19 items) correctly rejected with ValueError.")

    # Test non-binary response value
    invalid_val_input = {f"Q{i+1}": 0 for i in range(20)}
    invalid_val_input["Q1"] = 5
    try:
        run_screening_prediction(invalid_val_input, age=5)
        print("  [FAIL] Model failed to reject non-binary response value (val=5)!")
        failures += 1
    except ValueError:
        print("  [PASS] Non-binary response value (val=5) correctly rejected with ValueError.")

    print("\n" + "=" * 70)
    if failures == 0:
        print("ML VALIDATION SUMMARY: ALL CHECKS PASSED (0 ANOMALIES DETECTED)")
        print("=" * 70)
        return True
    else:
        print(f"ML VALIDATION SUMMARY: FAILED WITH {failures} ANOMALIES")
        print("=" * 70)
        return False

if __name__ == "__main__":
    success = run_ml_validation()
    sys.exit(0 if success else 1)
