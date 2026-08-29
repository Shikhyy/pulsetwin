import pandas as pd
import numpy as np
from datetime import datetime
from sklearn.ensemble import IsolationForest
from src.api.schemas import AnomalyResult

class AnomalyDetector:
    def __init__(self):
        self.models = {}
        self.data_buffers = {}
        self.window_size = 200
        
    def _get_key(self, entity_id: str, signal: str) -> str:
        return f"{entity_id}::{signal}"
        
    def predict(self, entity_id: str, signal: str, value: float) -> AnomalyResult:
        if str(value).lower() == 'nan' or value is None:
            return AnomalyResult(
                entity_id=entity_id,
                signal=signal,
                value=float('nan'),
                is_anomaly=False,
                anomaly_score=0.0,
                zscore=0.0,
                method_used="none",
                timestamp=datetime.utcnow().isoformat() + "Z"
            )
            
        key = self._get_key(entity_id, signal)
        
        if key not in self.data_buffers:
            self.data_buffers[key] = []
            
        self.data_buffers[key].append(value)
        if len(self.data_buffers[key]) > self.window_size:
            self.data_buffers[key].pop(0)
            
        buffer = self.data_buffers[key]
        n_samples = len(buffer)
        
        mean_val = np.mean(buffer)
        std_val = np.std(buffer) if n_samples > 1 else 0.0
        zscore = float((value - mean_val) / std_val) if std_val > 0 else 0.0
        
        if n_samples < 50:
            is_anomaly = abs(zscore) > 3.0
            return AnomalyResult(
                entity_id=entity_id,
                signal=signal,
                value=value,
                is_anomaly=is_anomaly,
                anomaly_score=abs(zscore) / 5.0,
                zscore=zscore,
                method_used="zscore_fallback",
                timestamp=datetime.utcnow().isoformat() + "Z"
            )
            
        if n_samples >= self.window_size or key not in self.models:
            X = np.array(buffer).reshape(-1, 1)
            model = IsolationForest(contamination=0.05, random_state=42)
            model.fit(X)
            self.models[key] = model
            
        model = self.models[key]
        pred = model.predict([[value]])[0]
        score = model.score_samples([[value]])[0]
        
        normalized_score = float(abs(score))
        
        return AnomalyResult(
            entity_id=entity_id,
            signal=signal,
            value=value,
            is_anomaly=bool(pred == -1),
            anomaly_score=normalized_score,
            zscore=zscore,
            method_used="isolation_forest",
            timestamp=datetime.utcnow().isoformat() + "Z"
        )
