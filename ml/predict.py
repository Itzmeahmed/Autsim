"""
Auti AIgnosis - Machine Learning Pipeline: Prediction & Explainability
Computes screening indication, 5-domain developmental breakdown,
and formats strictly non-diagnostic outputs with mandatory statutory notice.
"""

import os
import sys
import joblib
from typing import Dict, Any, List
import numpy as np

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ml.preprocessing import compute_domain_scores, transform_single_submission

DISCLAIMER_TEXT = (
    "This screening result is for screening support and informational purposes only. "
    "It is not a medical diagnosis and should not replace evaluation by a qualified healthcare professional."
)

class ScreeningPredictor:
    """Predictor instance that manages model inference and explainability."""
    def __init__(self, model_path: str = "ml/models/best_screening_model.joblib"):
        if not os.path.exists(model_path):
            fallback = "backend/app/ml/models/best_screening_model.joblib"
            model_path = fallback if os.path.exists(fallback) else None
            
        self.model = joblib.load(model_path) if model_path and os.path.exists(model_path) else None

    def predict(
        self,
        responses: Dict[str, int],
        age: int = 6,
        gender: str = "m",
        jaundice: str = "no",
        family_history: str = "no"
    ) -> Dict[str, Any]:
        """
        Executes ML prediction over questionnaire responses with strict input bounds.
        """
        # Validate input ranges
        if not (2 <= age <= 16):
            raise ValueError(f"Age must be between 2 and 16 years, got {age}.")
        if len(responses) != 20:
            raise ValueError(f"Exactly 20 responses (Q1-Q20) are required, got {len(responses)}.")
        for q, v in responses.items():
            if v not in (0, 1):
                raise ValueError(f"Response for {q} must be 0 or 1, got {v}.")

        domain_scores = compute_domain_scores(responses)

        # Identify key contributing areas (domains scoring >= 50%)
        sorted_domains = sorted(domain_scores.items(), key=lambda item: item[1], reverse=True)
        key_contributing = [domain for domain, score in sorted_domains if score >= 50.0]
        if not key_contributing:
            key_contributing = [sorted_domains[0][0]] if sorted_domains else ["General Observations"]

        prob_score = 0.5
        if self.model is not None:
            try:
                feature_vector = transform_single_submission(
                    responses=responses,
                    age=age,
                    gender=gender,
                    jaundice=jaundice,
                    family_history=family_history
                )
                if hasattr(self.model, "predict_proba"):
                    probs = self.model.predict_proba(feature_vector)[0]
                    prob_score = float(probs[1])
                else:
                    pred = self.model.predict(feature_vector)[0]
                    prob_score = 0.85 if pred == 1 else 0.15
            except Exception as e:
                avg_score = np.mean(list(domain_scores.values()))
                prob_score = float(avg_score / 100.0)
        else:
            avg_score = np.mean(list(domain_scores.values()))
            prob_score = float(avg_score / 100.0)

        # Calibrated decision threshold based on sensitivity requirements
        if prob_score >= 0.50:
            indication = "Higher Indication"
            explanation = (
                f"These recorded responses in {', '.join(key_contributing[:3])} "
                f"contributed to the current screening output indicating developmental patterns that warrant clinical consultation."
            )
        else:
            indication = "Lower Indication"
            explanation = (
                f"Recorded responses indicate lower likelihood across core developmental benchmarks, "
                f"though periodic developmental monitoring with a healthcare professional remains encouraged."
            )

        return {
            "screening_indication": indication,
            "probability_score": round(prob_score, 4),
            "developmental_profile": domain_scores,
            "key_contributing_areas": key_contributing,
            "explanation": explanation,
            "disclaimer": DISCLAIMER_TEXT,
            "model_version": "v1.1.0",
            "total_score": sum(responses.values())
        }

_default_predictor = None

def run_screening_prediction(
    responses: Dict[str, int],
    age: int = 6,
    gender: str = "m",
    jaundice: str = "no",
    family_history: str = "no"
) -> Dict[str, Any]:
    global _default_predictor
    if _default_predictor is None:
        _default_predictor = ScreeningPredictor()
    return _default_predictor.predict(
        responses=responses,
        age=age,
        gender=gender,
        jaundice=jaundice,
        family_history=family_history
    )
