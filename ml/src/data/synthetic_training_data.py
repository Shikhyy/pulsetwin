import pandas as pd
import numpy as np

def generate_bottleneck_training_data(n_samples=5000, seed=42) -> pd.DataFrame:
    np.random.seed(seed)
    
    # Generate background noise features
    data = {
        "cycle_time_mean_20": np.random.normal(480, 10, n_samples),
        "cycle_time_std_20": np.random.exponential(5, n_samples),
        "cycle_time_trend": np.random.normal(0, 0.5, n_samples),
        "utilization": np.random.uniform(0.7, 0.95, n_samples),
        "queue_length": np.random.poisson(2, n_samples),
        "queue_growth_rate": np.random.normal(0, 0.5, n_samples),
        "starvation_minutes": np.random.exponential(2, n_samples),
        "blockage_minutes": np.random.exponential(3, n_samples),
        "downstream_buffer_fill": np.random.uniform(0.1, 0.9, n_samples),
        "upstream_capacity_ratio": np.random.uniform(0.8, 1.2, n_samples),
        "equipment_health_score": np.random.beta(8, 2, n_samples),
        "vibration_zscore": np.random.normal(0, 1, n_samples),
        "temperature_zscore": np.random.normal(0, 1, n_samples),
        "anomaly_count_30min": np.random.poisson(0.5, n_samples)
    }
    
    df = pd.DataFrame(data)
    
    # Inject ST-18 specific bottleneck pattern (T+35min, 8.5% rise)
    risk_score = (
        (df["cycle_time_mean_20"] - 480) / 40 +
        df["cycle_time_trend"] * 2 + 
        df["queue_growth_rate"] * 1.5 +
        (df["downstream_buffer_fill"] - 0.5) * 2 +
        (1.0 - df["equipment_health_score"]) * 3 +
        df["vibration_zscore"] * 0.5
    )
    
    # Introduce NaNs to simulate missing data (10% missing randomly)
    for col in df.columns:
        mask = np.random.rand(n_samples) < 0.1
        df.loc[mask, col] = np.nan
        
    df["label"] = (risk_score > 2.5).astype(int)
    
    return df

def generate_defect_training_data(n_samples=5000, seed=42) -> pd.DataFrame:
    np.random.seed(seed + 1)
    
    data = {
        "torque_zscore": np.random.normal(0, 1.2, n_samples),
        "torque_trend": np.random.normal(0, 0.3, n_samples),
        "vibration_anomaly_count": np.random.poisson(0.2, n_samples),
        "temperature_deviation": np.random.normal(0, 2.0, n_samples),
        "cycle_time_deviation": np.random.normal(0, 15, n_samples),
        "upstream_anomaly_count": np.random.poisson(0.1, n_samples),
        "operator_shift_factor": np.random.randint(0, 2, n_samples),
        "part_batch_quality": np.random.beta(5, 1, n_samples),
        "station_history_failure_rate": np.random.uniform(0.01, 0.05, n_samples)
    }
    
    df = pd.DataFrame(data)
    
    risk_score = (
        df["torque_zscore"].abs() * 2.0 +
        df["torque_trend"].abs() * 1.5 +
        df["vibration_anomaly_count"] * 1.0 +
        df["temperature_deviation"].abs() * 0.5 +
        (1.0 - df["part_batch_quality"]) * 3.0
    )
    
    # 5% missing data rate
    for col in df.columns:
        mask = np.random.rand(n_samples) < 0.05
        df.loc[mask, col] = np.nan
        
    df["label"] = (risk_score > 4.5).astype(int)
    
    return df
