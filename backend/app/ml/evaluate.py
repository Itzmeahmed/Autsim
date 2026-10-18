"""
Auti AIgnosis - AI Screening Pipeline: Evaluation
Generates clinical diagnostic metrics reports for model validation.
"""

import os
import json

def load_evaluation_report(metadata_path: str = "backend/app/ml/models/model_metadata.json") -> dict:
    """Loads and formats the model evaluation report."""
    if not os.path.exists(metadata_path):
        return {"error": "Model evaluation report has not been generated yet. Run train.py first."}
    
    with open(metadata_path, "r") as f:
        data = json.load(f)
    return data

def print_evaluation_summary():
    report = load_evaluation_report()
    if "error" in report:
        print(report["error"])
        return
        
    print("=" * 60)
    print(f"Auti AIgnosis Screening Model Evaluation Summary ({report.get('model_version')})")
    print(f"Top Performer: {report.get('best_model')}")
    print("=" * 60)
    
    metrics = report.get("metrics", {})
    print(f"{'Model':<20} | {'Accuracy':<8} | {'Precision':<10} | {'Recall':<8} | {'F1-Score':<8} | {'ROC-AUC':<8}")
    print("-" * 75)
    for model_name, m in metrics.items():
        print(f"{model_name:<20} | {m['accuracy']:<8.4f} | {m['precision']:<10.4f} | {m['recall']:<8.4f} | {m['f1_score']:<8.4f} | {m['roc_auc']:<8.4f}")
    print("=" * 60)

if __name__ == "__main__":
    print_evaluation_summary()
