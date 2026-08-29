import os
import joblib
import pandas as pd
from datetime import datetime
from sklearn.linear_model import LogisticRegression
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from src.config import settings
from src.api.schemas import DefectPrediction
from src.models.evidence_builder import EvidenceBuilder
from src.data.synthetic_training_data import generate_defect_training_data

class DefectPredictor:
    def __init__(self):
        self.model_path = os.path.join(settings.MODEL_DIR, "defect_model.joblib")
        self.model = None
        self.version = "1.0.0"
        self.feature_names = [
            "torque_zscore", "torque_trend", "vibration_anomaly_count",
            "temperature_deviation", "cycle_time_deviation",
            "upstream_anomaly_count", "operator_shift_factor",
            "part_batch_quality", "station_history_failure_rate"
        ]
        self._load_or_train()

    def _load_or_train(self):
        if os.path.exists(self.model_path):
            self.model = joblib.load(self.model_path)
        else:
            self.train()

    def train(self, data: pd.DataFrame = None):
        if data is None:
            data = generate_defect_training_data(n_samples=5000, seed=settings.DEMO_SEED)
            
        X = data[self.feature_names]
        y = data["label"]
        
        self.model = Pipeline([
            ('imputer', SimpleImputer(strategy='mean')),
            ('scaler', StandardScaler()),
            ('classifier', LogisticRegression(class_weight='balanced', random_state=settings.DEMO_SEED))
        ])
        
        self.model.fit(X, y)
        joblib.dump(self.model, self.model_path)

    def predict(self, unit_id: str, station_id: str, features: dict) -> DefectPrediction:
        df = pd.DataFrame([features], columns=self.feature_names)
        
        prob = float(self.model.predict_proba(df)[0, 1])
        
        classifier = self.model.named_steps['classifier']
        scaler = self.model.named_steps['scaler']
        
        coef = classifier.coef_[0] / scaler.scale_
        coef_dict = dict(zip(self.feature_names, coef))
        
        evidence = EvidenceBuilder.build_logreg_evidence(coef_dict, features)
        
        if prob > 0.7:
            outcome = "FAIL"
        elif prob > 0.4:
            outcome = "MARGINAL"
        else:
            outcome = "PASS"
            
        valid_features = df.notna().sum(axis=1).iloc[0]
        completeness = float(valid_features) / len(self.feature_names)
        confidence = completeness * 0.85
        
        return DefectPrediction(
            production_unit_id=unit_id,
            station_id=station_id,
            probability=prob,
            predicted_inspection_outcome=outcome,
            horizon_stations=3,
            confidence=confidence,
            evidence=evidence,
            model_version=self.version,
            timestamp=datetime.utcnow().isoformat() + "Z"
        )
