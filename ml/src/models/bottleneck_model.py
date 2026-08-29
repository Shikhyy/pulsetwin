import os
import joblib
import pandas as pd
from datetime import datetime
from sklearn.ensemble import HistGradientBoostingClassifier
from src.config import settings
from src.api.schemas import BottleneckPrediction, Evidence
from src.models.evidence_builder import EvidenceBuilder
from src.data.synthetic_training_data import generate_bottleneck_training_data

class BottleneckPredictor:
    def __init__(self):
        self.model_path = os.path.join(settings.MODEL_DIR, "bottleneck_model.joblib")
        self.model = None
        self.version = "1.0.0"
        self.feature_names = [
            "cycle_time_mean_20", "cycle_time_std_20", "cycle_time_trend",
            "utilization", "queue_length", "queue_growth_rate",
            "starvation_minutes", "blockage_minutes", "downstream_buffer_fill",
            "upstream_capacity_ratio", "equipment_health_score",
            "vibration_zscore", "temperature_zscore", "anomaly_count_30min"
        ]
        self._load_or_train()

    def _load_or_train(self):
        if os.path.exists(self.model_path):
            self.model = joblib.load(self.model_path)
        else:
            self.train()

    def train(self, data: pd.DataFrame = None):
        if data is None:
            data = generate_bottleneck_training_data(n_samples=5000, seed=settings.DEMO_SEED)
            
        X = data[self.feature_names]
        y = data["label"]
        
        self.model = HistGradientBoostingClassifier(
            max_iter=100, 
            random_state=settings.DEMO_SEED,
            early_stopping=True,
            validation_fraction=0.1
        )
        self.model.fit(X, y)
        joblib.dump(self.model, self.model_path)

    def predict(self, station_id: str, features: dict) -> BottleneckPrediction:
        df = pd.DataFrame([features], columns=self.feature_names)
        
        valid_features = df.notna().sum(axis=1).iloc[0]
        completeness = float(valid_features) / len(self.feature_names)
        
        prob = float(self.model.predict_proba(df)[0, 1])
        
        proxy_importances = {
            "cycle_time_mean_20": 0.8 if features.get("cycle_time_mean_20", 0) > 480 else 0.1,
            "cycle_time_trend": 0.7 if features.get("cycle_time_trend", 0) > 0.5 else -0.1,
            "equipment_health_score": -0.6 if features.get("equipment_health_score", 1) < 0.8 else 0.1,
            "downstream_buffer_fill": 0.5,
            "queue_growth_rate": 0.4
        }
        
        evidence = EvidenceBuilder.build_gbm_evidence(proxy_importances, features)
        
        horizon = 35 if df["cycle_time_trend"].fillna(0).iloc[0] > 0.5 else 60
        
        confidence = completeness * 0.9 + 0.1
        
        if prob > 0.8:
            risk = "CRITICAL"
        elif prob > 0.6:
            risk = "HIGH"
        elif prob > 0.4:
            risk = "MODERATE"
        else:
            risk = "LOW"
            
        return BottleneckPrediction(
            station_id=station_id,
            probability=prob,
            horizon_minutes=horizon,
            confidence=confidence,
            risk_level=risk,
            evidence=evidence,
            model_version=self.version,
            timestamp=datetime.utcnow().isoformat() + "Z",
            data_completeness=completeness
        )
