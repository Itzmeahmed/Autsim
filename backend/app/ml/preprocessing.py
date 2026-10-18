"""
Auti AIgnosis - AI Screening Pipeline: Preprocessing
Extracts developmental domain scores and transforms feature representations.
"""

import pandas as pd
import numpy as np
from typing import Tuple, Dict, Any

# Clinical domain mapping to questionnaire items
DOMAINS = {
    "Communication": ["Q1", "Q5", "Q9", "Q13"],
    "Social Interaction": ["Q2", "Q6", "Q10", "Q14"],
    "Sensory Responses": ["Q3", "Q7", "Q11", "Q15"],
    "Repetitive Behaviors": ["Q4", "Q8", "Q12", "Q16"],
    "Daily-Life Skills": ["Q17", "Q18", "Q19", "Q20"]
}

def compute_domain_scores(responses: Dict[str, int]) -> Dict[str, float]:
    """
    Computes percentage scores (0.0 to 10.0 or 0-100%) for each developmental domain.
    """
    scores = {}
    for domain, questions in DOMAINS.items():
        domain_vals = [responses.get(q, 0) for q in questions]
        max_possible = len(questions)
        pct = (sum(domain_vals) / max_possible) * 100.0
        scores[domain] = round(pct, 1)
    return scores

def preprocess_features(df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray, list]:
    """
    Prepares feature matrix X and target vector y with engineered domain aggregates.
    """
    data = df.copy()
    
    # Calculate domain aggregates as explicit features
    for domain, questions in DOMAINS.items():
        data[f"domain_{domain.replace(' ', '_').lower()}"] = data[questions].sum(axis=1)
        
    # Demographic encodings
    gender_map = {"m": 1, "f": 0}
    yes_no_map = {"yes": 1, "no": 0}
    
    data["gender_enc"] = data["gender"].str.lower().map(lambda x: 1 if x in ["m", "male"] else 0)
    data["jaundice_enc"] = data["jaundice"].str.lower().map(lambda x: 1 if x in ["yes", "y", "true", "1"] else 0)
    data["family_history_enc"] = data["family_history"].str.lower().map(lambda x: 1 if x in ["yes", "y", "true", "1"] else 0)
    
    feature_cols = [f"Q{i+1}" for i in range(20)] + [
        "domain_communication",
        "domain_social_interaction",
        "domain_sensory_responses",
        "domain_repetitive_behaviors",
        "domain_daily-life_skills",
        "gender_enc",
        "jaundice_enc",
        "family_history_enc",
        "age"
    ]
    
    X = data[feature_cols].values
    y = data["screening_indication"].values if "screening_indication" in data else np.zeros(len(data))
    
    return X, y, feature_cols

def transform_single_submission(responses: Dict[str, int], age: int = 6, gender: str = "m", jaundice: str = "no", family_history: str = "no") -> np.ndarray:
    """
    Transforms a single user screening questionnaire submission into model feature vector.
    """
    q_vals = [responses.get(f"Q{i+1}", 0) for i in range(20)]
    
    domain_scores = [
        sum(responses.get(q, 0) for q in DOMAINS["Communication"]),
        sum(responses.get(q, 0) for q in DOMAINS["Social Interaction"]),
        sum(responses.get(q, 0) for q in DOMAINS["Sensory Responses"]),
        sum(responses.get(q, 0) for q in DOMAINS["Repetitive Behaviors"]),
        sum(responses.get(q, 0) for q in DOMAINS["Daily-Life Skills"])
    ]
    
    gender_enc = 1 if str(gender).lower() in ["m", "male"] else 0
    jaundice_enc = 1 if str(jaundice).lower() in ["yes", "y", "true", "1"] else 0
    family_history_enc = 1 if str(family_history).lower() in ["yes", "y", "true", "1"] else 0
    
    full_vector = q_vals + domain_scores + [gender_enc, jaundice_enc, family_history_enc, float(age)]
    return np.array([full_vector])
