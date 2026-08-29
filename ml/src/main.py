from fastapi import FastAPI, HTTPException
from typing import List, Dict, Any
from datetime import datetime

from src.api.schemas import (
    BottleneckPrediction, DefectPrediction, AnomalyResult, 
    BatchPredictionResponse, BatchPredictionRequest, ModelInfo
)
from src.models.bottleneck_model import BottleneckPredictor
from src.models.defect_model import DefectPredictor
from src.models.anomaly_detector import AnomalyDetector
from src.config import settings

app = FastAPI(title="PulseTwin ML Service")

bottleneck_predictor = BottleneckPredictor()
defect_predictor = DefectPredictor()
anomaly_detector = AnomalyDetector()

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "models_loaded": bottleneck_predictor.model is not None and defect_predictor.model is not None
    }

@app.get("/models/info", response_model=List[ModelInfo])
async def get_models_info():
    return [
        ModelInfo(
            model_name="bottleneck_predictor",
            version=bottleneck_predictor.version,
            trained_at=datetime.utcnow().isoformat() + "Z",
            status="ready",
            metadata={"type": "HistGradientBoostingClassifier"}
        ),
        ModelInfo(
            model_name="defect_predictor",
            version=defect_predictor.version,
            trained_at=datetime.utcnow().isoformat() + "Z",
            status="ready",
            metadata={"type": "LogisticRegression"}
        )
    ]

@app.post("/models/train")
async def train_models():
    bottleneck_predictor.train()
    defect_predictor.train()
    return {"status": "success", "message": "Models retrained successfully"}

@app.post("/predictions/bottleneck", response_model=BottleneckPrediction)
async def predict_bottleneck(station_id: str, features: Dict[str, float]):
    try:
        return bottleneck_predictor.predict(station_id, features)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predictions/defect", response_model=DefectPrediction)
async def predict_defect(production_unit_id: str, station_id: str, features: Dict[str, float]):
    try:
        return defect_predictor.predict(production_unit_id, station_id, features)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predictions/anomaly", response_model=List[AnomalyResult])
async def predict_anomaly(entity_id: str, signals: Dict[str, float]):
    try:
        results = []
        for signal_name, value in signals.items():
            res = anomaly_detector.predict(entity_id, signal_name, value)
            results.append(res)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predictions/batch", response_model=BatchPredictionResponse)
async def batch_predict(request: BatchPredictionRequest):
    response = BatchPredictionResponse()
    
    if request.bottleneck_inputs:
        for inp in request.bottleneck_inputs:
            station_id = inp.get("station_id")
            features = inp.get("features", {})
            try:
                res = bottleneck_predictor.predict(station_id, features)
                response.bottlenecks.append(res)
            except Exception as e:
                pass
                
    if request.defect_inputs:
        for inp in request.defect_inputs:
            unit_id = inp.get("production_unit_id")
            station_id = inp.get("station_id")
            features = inp.get("features", {})
            try:
                res = defect_predictor.predict(unit_id, station_id, features)
                response.defects.append(res)
            except Exception as e:
                pass
                
    if request.anomaly_inputs:
        for inp in request.anomaly_inputs:
            entity_id = inp.get("entity_id")
            signals = inp.get("signals", {})
            try:
                for signal_name, value in signals.items():
                    res = anomaly_detector.predict(entity_id, signal_name, value)
                    response.anomalies.append(res)
            except Exception as e:
                pass
                
    return response

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=True)
