from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Any, Dict

class Evidence(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    signal: str
    direction: str  # 'contributing' | 'mitigating'
    strength: float  # 0-1, normalized importance
    description: str  # human-readable
    value: float
    threshold: float
    data_class: str  # 'MEASURED' | 'INFERRED' | 'PREDICTED' | 'SIMULATED' | 'UNKNOWN'

class BottleneckPrediction(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    station_id: str
    probability: float  # 0-1
    horizon_minutes: int  # predicted time to bottleneck
    confidence: float  # 0-1, based on data completeness
    risk_level: str  # 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'
    evidence: List[Evidence]
    model_version: str
    timestamp: str
    data_completeness: float

class DefectPrediction(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    production_unit_id: str
    station_id: str
    probability: float
    predicted_inspection_outcome: str  # 'PASS' | 'FAIL' | 'MARGINAL'
    horizon_stations: int
    confidence: float
    evidence: List[Evidence]
    model_version: str
    timestamp: str

class AnomalyResult(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    entity_id: str
    signal: str
    value: float
    is_anomaly: bool
    anomaly_score: float
    zscore: float
    method_used: str  # 'isolation_forest' | 'zscore_fallback'
    timestamp: str

class BatchPredictionRequest(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    bottleneck_inputs: Optional[List[Dict[str, Any]]] = None
    defect_inputs: Optional[List[Dict[str, Any]]] = None
    anomaly_inputs: Optional[List[Dict[str, Any]]] = None

class BatchPredictionResponse(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    bottlenecks: List[BottleneckPrediction] = []
    defects: List[DefectPrediction] = []
    anomalies: List[AnomalyResult] = []

class ModelInfo(BaseModel):
    model_config = ConfigDict(protected_namespaces=())
    model_name: str
    version: str
    trained_at: str
    status: str
    metadata: Dict[str, Any]

