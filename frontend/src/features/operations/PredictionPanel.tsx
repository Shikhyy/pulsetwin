import React from 'react';
import { usePredictionStore } from '../../stores/predictionStore';
import Badge from '../../components/ui/Badge';
import { TrendingUp, Clock, ArrowRight } from 'lucide-react';

export default function PredictionPanel({ stationId }: { stationId: string }) {
  const prediction = usePredictionStore(s => s.getHighestRisk(stationId));

  if (!prediction) {
    return (
      <div className="flex flex-col gap-2 p-3 bg-surface-2 border border-border rounded">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-text-muted" />
          <span className="label-xs">Prediction</span>
        </div>
        <p className="text-xs text-text-muted">No active predictions for this station.</p>
      </div>
    );
  }

  const pct = Math.round(prediction.probability * 100);
  const confPct = Math.round(prediction.confidence * 100);

  return (
    <div className="flex flex-col gap-3 p-3 bg-[#0A1222] border border-[#1C3A5A] rounded">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-state-predicted" />
          <span className="text-xs font-semibold text-text-primary">
            {prediction.type.replace(/_/g, ' ')}
          </span>
        </div>
        <Badge classType="PREDICTED" />
      </div>

      {/* Probability */}
      <div className="flex items-end gap-3">
        <div className="font-mono text-3xl font-bold text-state-predicted tabular-nums leading-none">
          {pct}%
        </div>
        <div className="flex flex-col gap-0.5 pb-1">
          <div className="flex items-center gap-1 text-[10px] text-text-muted">
            <Clock className="w-3 h-3" />
            Within {prediction.horizonMinutes}min
          </div>
        </div>
      </div>

      {/* Confidence bar */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="label-xs">Model Confidence</span>
          <span className="font-mono text-[11px] text-text-primary">{confPct}%</span>
        </div>
        <div className="h-1 bg-surface-3 rounded overflow-hidden">
          <div
            className="h-full bg-state-predicted rounded transition-all"
            style={{ width: `${confPct}%` }}
          />
        </div>
      </div>

      <p className="text-[11px] text-text-secondary leading-relaxed">
        Risk detected based on recent telemetry trends and historical patterns.
      </p>

      <button className="flex items-center gap-1.5 text-[11px] text-state-predicted hover:text-text-primary transition-colors font-medium">
        View supporting evidence <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  );
}
