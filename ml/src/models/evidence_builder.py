from typing import List, Dict, Any
from src.api.schemas import Evidence

class EvidenceBuilder:
    @staticmethod
    def build_gbm_evidence(feature_importances: Dict[str, float], feature_values: Dict[str, float], feature_thresholds: Dict[str, float] = None) -> List[Evidence]:
        evidence_list = []
        
        sorted_features = sorted(feature_importances.items(), key=lambda x: abs(x[1]), reverse=True)
        max_imp = max([abs(v) for _, v in sorted_features]) if sorted_features else 1.0
        
        for feat_name, importance in sorted_features[:5]:
            val = feature_values.get(feat_name, float('nan'))
            if str(val).lower() == 'nan':
                continue
                
            threshold = feature_thresholds.get(feat_name, 0.0) if feature_thresholds else 0.0
            direction = "contributing" if importance > 0 else "mitigating"
            strength = abs(importance) / (max_imp if max_imp > 0 else 1.0)
            
            desc = f"{feat_name.replace('_', ' ').capitalize()} is {val:.2f}"
            if threshold:
                desc += f" (threshold: {threshold:.2f})"
                
            evidence_list.append(Evidence(
                signal=feat_name,
                direction=direction,
                strength=strength,
                description=desc,
                value=val,
                threshold=threshold,
                data_class="MEASURED"
            ))
            
        return evidence_list
        
    @staticmethod
    def build_logreg_evidence(coefficients: Dict[str, float], feature_values: Dict[str, float]) -> List[Evidence]:
        evidence_list = []
        
        contributions = {}
        for feat, coef in coefficients.items():
            val = feature_values.get(feat, 0.0)
            if str(val).lower() != 'nan':
                contributions[feat] = coef * val
                
        sorted_contrib = sorted(contributions.items(), key=lambda x: abs(x[1]), reverse=True)
        max_contrib = abs(sorted_contrib[0][1]) if sorted_contrib else 1.0
        
        for feat, contrib in sorted_contrib[:5]:
            val = feature_values.get(feat, 0.0)
            direction = "contributing" if contrib > 0 else "mitigating"
            strength = abs(contrib) / (max_contrib if max_contrib > 0 else 1.0)
            
            evidence_list.append(Evidence(
                signal=feat,
                direction=direction,
                strength=strength,
                description=f"{feat.replace('_', ' ').title()}: {val:.2f} (impact factor: {contrib:.2f})",
                value=val,
                threshold=0.0,
                data_class="MEASURED"
            ))
            
        return evidence_list
