"""
Auti AIgnosis - Machine Learning Pipeline: Preprocessing & Domain Mapping
Extracts developmental domain scores and transforms feature representations without target leakage.
"""

import pandas as pd
import numpy as np
from typing import Tuple, Dict, Any, List

# Clinical domain mapping to questionnaire items based on AQ-10 & Q-CHAT
DOMAINS = {
    "Communication": ["Q1", "Q5", "Q9", "Q13"],
    "Social Interaction": ["Q2", "Q6", "Q10", "Q14"],
    "Sensory Responses": ["Q3", "Q7", "Q11", "Q15"],
    "Repetitive Behaviors": ["Q4", "Q8", "Q12", "Q16"],
    "Daily-Life Skills": ["Q17", "Q18", "Q19", "Q20"]
}

def compute_domain_scores(responses: Dict[str, int]) -> Dict[str, float]:
    """
    Computes percentage scores (0.0 to 100.0%) for each developmental screening domain.
    """
    scores = {}
    for domain, questions in DOMAINS.items():
        domain_vals = [responses.get(q, 0) for q in questions]
        max_possible = len(questions)
        pct = (sum(domain_vals) / max_possible) * 100.0
        scores[domain] = round(pct, 1)
    return scores

def preprocess_features(df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray, List[str]]:
    """
    Prepares feature matrix X and target vector y with domain aggregates.
    Ensures no post-outcome columns or target leakage.
    """
    data = df.copy()
    
    # Calculate domain aggregates as explicit features
    for domain, questions in DOMAINS.items():
        data[f"domain_{domain.replace(' ', '_').lower()}"] = data[questions].sum(axis=1)
        
    # Demographic encodings
    data["gender_enc"] = data["gender"].astype(str).str.lower().map(lambda x: 1 if x in ["m", "male"] else 0)
    data["jaundice_enc"] = data["jaundice"].astype(str).str.lower().map(lambda x: 1 if x in ["yes", "y", "true", "1"] else 0)
    data["family_history_enc"] = data["family_history"].astype(str).str.lower().map(lambda x: 1 if x in ["yes", "y", "true", "1"] else 0)
    
    feature_cols = [f"Q{i+1}" for i in range(20)] + [
        "domain_communication",
        "domain_social_interaction",
        "domain_sensory_responses",
        "domain_repetitive_behaviors",
        "domain_daily_life_skills",
        "gender_enc",
        "jaundice_enc",
        "family_history_enc",
        "age"
    ]
    
    # Clean column names (replace dashes)
    data = data.rename(columns={"domain_daily-life_skills": "domain_daily_life_skills"})
    
    X = data[feature_cols].values
    y = data["screening_indication"].values if "screening_indication" in data else np.zeros(len(data))
    
    return X, y, feature_cols

def transform_single_submission(
    responses: Dict[str, int],
    age: int = 6,
    gender: str = "m",
    jaundice: str = "no",
    family_history: str = "no"
) -> np.ndarray:
    """
    Transforms a single user screening questionnaire submission into a model feature vector.
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
