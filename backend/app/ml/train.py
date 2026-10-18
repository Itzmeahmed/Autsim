"""
Auti AIgnosis - AI Screening Pipeline: Model Training
Trains and evaluates multiple candidate models (Logistic Regression, Random Forest, Decision Tree, SVM).
Ensures class imbalance handling (class_weight='balanced') and computes comprehensive metrics.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_validate
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, roc_auc_score
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

from backend.app.ml.dataset_loader import load_or_create_dataset
from backend.app.ml.preprocessing import preprocess_features

def train_and_compare_models(output_dir: str = "backend/app/ml/models"):
    """
    Trains 4 standard clinical screening estimators, evaluates them thoroughly,
    selects the highest F1-performing model, and exports the production bundle.
    """
    os.makedirs(output_dir, exist_ok=True)
    
    # 1. Load data & preprocess
    df = load_or_create_dataset()
    X, y, feature_names = preprocess_features(df)
    
    # Stratified Train/Test Split (80% train, 20% test)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    
    candidates = {
        "RandomForest": RandomForestClassifier(
            n_estimators=100,
            max_depth=6,
            class_weight="balanced",
            random_state=42
        ),
        "LogisticRegression": Pipeline([
            ("scaler", StandardScaler()),
            ("clf", LogisticRegression(class_weight="balanced", max_iter=1000, random_state=42))
        ]),
        "DecisionTree": DecisionTreeClassifier(
            max_depth=5,
            class_weight="balanced",
            random_state=42
        ),
        "SVM": Pipeline([
            ("scaler", StandardScaler()),
            ("clf", SVC(probability=True, class_weight="balanced", kernel="rbf", random_state=42))
        ])
    }
    
    evaluation_results = {}
    best_model_name = None
    best_f1 = -1.0
    best_pipeline = None
    
    for name, model in candidates.items():
        # Fit model on training partition
        model.fit(X_train, y_train)
        
        # Predict on validation/test partition
        y_pred = model.predict(X_test)
        if hasattr(model, "predict_proba"):
            y_proba = model.predict_proba(X_test)[:, 1]
        elif hasattr(model, "decision_function"):
            y_proba = model.decision_function(X_test)
        else:
            y_proba = y_pred
            
        acc = float(accuracy_score(y_test, y_pred))
        prec = float(precision_score(y_test, y_pred, zero_division=0))
        rec = float(recall_score(y_test, y_pred, zero_division=0))
        f1 = float(f1_score(y_test, y_pred, zero_division=0))
        roc = float(roc_auc_score(y_test, y_proba))
        cm = confusion_matrix(y_test, y_pred).tolist()
        
        evaluation_results[name] = {
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "roc_auc": round(roc, 4),
            "confusion_matrix": cm
        }
        
        # Selection criterion based on F1-score (harmonic mean of precision and recall)
        if f1 > best_f1:
            best_f1 = f1
            best_model_name = name
            best_pipeline = model
            
    # Persist the primary winning model and metadata
    metadata = {
        "model_version": "v1.0.0",
        "best_model": best_model_name,
        "features": feature_names,
        "sample_count": len(df),
        "positive_prevalence": float(np.mean(y)),
        "metrics": evaluation_results
    }
    
    model_path = os.path.join(output_dir, "best_screening_model.joblib")
    meta_path = os.path.join(output_dir, "model_metadata.json")
    
    joblib.dump(best_pipeline, model_path)
    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=2)
        
    print(f"--- Model Training Complete ---")
    print(f"Selected Best Model: {best_model_name} (F1 Score: {best_f1:.4f})")
    print(f"Artifacts saved to {output_dir}")
    return metadata

if __name__ == "__main__":
    train_and_compare_models()
