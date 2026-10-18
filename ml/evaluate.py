"""
Auti AIgnosis - Machine Learning Pipeline: Evaluation & Reporting
Generates comprehensive clinical screening metrics reports, comparing
candidates across Accuracy, Precision, Recall, F1, and Confusion Matrices.
"""

import os
import sys
import json
from typing import Dict, Any

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

def load_evaluation_report(metadata_path: str = "data/reports/ml_validation_report.json") -> dict:
    """Loads and formats the model evaluation report."""
    if not os.path.exists(metadata_path):
        fallback_path = "backend/app/ml/models/model_metadata.json"
        if os.path.exists(fallback_path):
            metadata_path = fallback_path
        else:
            return {"error": "Model evaluation report has not been generated yet. Run train.py first."}
    
    with open(metadata_path, "r") as f:
        data = json.load(f)
    return data

def print_evaluation_summary() -> Dict[str, Any]:
    """Prints formatted benchmark summary and asserts screening safety thresholds."""
    report = load_evaluation_report()
    if "error" in report:
        print(f"[ERROR] {report['error']}")
        return report
        
    print("=" * 80)
    print(f"Auti AIgnosis — Screening Model Evaluation Summary ({report.get('model_version')})")
    print(f"Selected Champion Estimator: {report.get('best_model')}")
    print(f"Selection Rationale: {report.get('selection_rationale')}")
    print("=" * 80)
    
    metrics = report.get("metrics", {})
    header = f"{'Model':<18} | {'Accuracy':<8} | {'Precision':<10} | {'Recall':<8} | {'F1-Score':<8} | {'ROC-AUC':<8} | {'FN':<4} | {'FP':<4}"
    print(header)
    print("-" * 80)
    for model_name, m in metrics.items():
        fn = m.get("false_negatives", "N/A")
        fp = m.get("false_positives", "N/A")
        print(f"{model_name:<18} | {m['accuracy']:<8.4f} | {m['precision']:<10.4f} | {m['recall']:<8.4f} | {m['f1_score']:<8.4f} | {m['roc_auc']:<8.4f} | {fn:<4} | {fp:<4}")
    print("=" * 80)
    
    # Assert threshold sanity for clinical screening safety
    best_name = report.get("best_model")
    if best_name and best_name in metrics:
        best_m = metrics[best_name]
        f1_ok = best_m["f1_score"] >= 0.90
        recall_ok = best_m["recall"] >= 0.90
        print(f"Screening Thresholds Check: F1 >= 0.90: {'PASSED' if f1_ok else 'FAILED'} | Recall >= 0.90: {'PASSED' if recall_ok else 'FAILED'}")
    
    return report

if __name__ == "__main__":
    print_evaluation_summary()
