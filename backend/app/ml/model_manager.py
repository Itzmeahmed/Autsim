"""
Auti AIgnosis - AI Screening Pipeline: Model Manager
Manages loading, versioning, fallback training, and runtime execution of screening models.
"""

import os
import joblib
import json
from typing import Dict, Any, Optional

class ModelManager:
    _instance = None
    
    def __init__(self, model_dir: str = "backend/app/ml/models"):
        self.model_dir = model_dir
        self.model_path = os.path.join(model_dir, "best_screening_model.joblib")
        self.meta_path = os.path.join(model_dir, "model_metadata.json")
        self.model = None
        self.metadata = {}
        self.load_model()
        
    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = ModelManager()
        return cls._instance
        
    def load_model(self):
        """Loads serialized model or invokes auto-training if missing."""
        if not os.path.exists(self.model_path) or not os.path.exists(self.meta_path):
            print("Model artifacts not detected. Initializing automated baseline model training...")
            try:
                from backend.app.ml.train import train_and_compare_models
                self.metadata = train_and_compare_models(output_dir=self.model_dir)
            except Exception as e:
                print(f"Warning: Training initialization encountered an error: {e}")
                self.metadata = {"model_version": "v1.0.0-fallback", "best_model": "ClinicalHeuristicRules"}
                
        if os.path.exists(self.model_path):
            self.model = joblib.load(self.model_path)
            
        if os.path.exists(self.meta_path):
            with open(self.meta_path, "r") as f:
                self.metadata = json.load(f)
                
    def get_version(self) -> str:
        return self.metadata.get("model_version", "v1.0.0")
        
    def get_metadata(self) -> Dict[str, Any]:
        return self.metadata
