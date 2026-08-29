import numpy as np
from typing import List, Dict, Any

def compute_rolling_stats(values: List[float], window: int) -> Dict[str, float]:
    if not values:
        return {"mean": np.nan, "std": np.nan, "trend": np.nan, "last_value": np.nan}
    
    recent_values = values[-window:] if len(values) >= window else values
    
    mean_val = float(np.mean(recent_values))
    std_val = float(np.std(recent_values)) if len(recent_values) > 1 else 0.0
    
    trend = 0.0
    if len(recent_values) > 1:
        x = np.arange(len(recent_values))
        m, _ = np.polyfit(x, recent_values, 1)
        trend = float(m)
        
    return {
        "mean": mean_val,
        "std": std_val,
        "trend": trend,
        "last_value": float(recent_values[-1])
    }

def compute_bottleneck_features(observations: List[Dict[str, Any]], station_config: Dict[str, Any]) -> Dict[str, float]:
    # Extract historical values
    cycle_times = [obs.get('cycle_time') for obs in observations if obs.get('cycle_time') is not None]
    
    ct_stats = compute_rolling_stats(cycle_times, 20)
    
    latest_obs = observations[-1] if observations else {}
    
    # Compute base features or use NaN if not available (never impute to 0)
    features = {
        "cycle_time_mean_20": ct_stats["mean"],
        "cycle_time_std_20": ct_stats["std"],
        "cycle_time_trend": ct_stats["trend"],
        "utilization": latest_obs.get("utilization", np.nan),
        "queue_length": latest_obs.get("queue_length", np.nan),
        "queue_growth_rate": latest_obs.get("queue_growth_rate", np.nan),
        "starvation_minutes": latest_obs.get("starvation_minutes", np.nan),
        "blockage_minutes": latest_obs.get("blockage_minutes", np.nan),
        "downstream_buffer_fill": latest_obs.get("downstream_buffer_fill", np.nan),
        "upstream_capacity_ratio": latest_obs.get("upstream_capacity_ratio", np.nan),
        "equipment_health_score": latest_obs.get("equipment_health_score", np.nan),
        "vibration_zscore": latest_obs.get("vibration_zscore", np.nan),
        "temperature_zscore": latest_obs.get("temperature_zscore", np.nan),
        "anomaly_count_30min": latest_obs.get("anomaly_count_30min", np.nan)
    }
    
    return features

def compute_defect_features(observations: List[Dict[str, Any]], unit_context: Dict[str, Any]) -> Dict[str, float]:
    latest_obs = observations[-1] if observations else {}
    
    return {
        "torque_zscore": latest_obs.get("torque_zscore", np.nan),
        "torque_trend": latest_obs.get("torque_trend", np.nan),
        "vibration_anomaly_count": latest_obs.get("vibration_anomaly_count", np.nan),
        "temperature_deviation": latest_obs.get("temperature_deviation", np.nan),
        "cycle_time_deviation": latest_obs.get("cycle_time_deviation", np.nan),
        "upstream_anomaly_count": latest_obs.get("upstream_anomaly_count", np.nan),
        "operator_shift_factor": latest_obs.get("operator_shift_factor", np.nan),
        "part_batch_quality": latest_obs.get("part_batch_quality", np.nan),
        "station_history_failure_rate": latest_obs.get("station_history_failure_rate", np.nan)
    }
