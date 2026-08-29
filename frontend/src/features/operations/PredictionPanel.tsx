import React from 'react';
import { usePredictionStore } from '../../stores/predictionStore';
import Badge from '../../components/ui/Badge';

export default function PredictionPanel({ stationId }: { stationId: string }) {
  const prediction = usePredictionStore((s) => s.getHighestRisk(stationId));
  if (!prediction) return null;

  return (
    <div className="flex flex-col p-4 bg-[#0A1222] rounded border border-[#1C3A5A] gap-3">
      <div className="flex justify-between items-center">
        <div className="text-sm font-semibold text-[#E8ECF4]">{prediction.type.replace('_', ' ').toUpperCase()}</div>
        <Badge classType="PREDICTED" />
      </div>
      <div className="font-mono text-4xl text-[#3B82F6] font-bold">{(prediction.probability * 100).toFixed(0)}%</div>
      <div className="text-sm text-[#8B93AB]">Possible risk detected based on telemetry. Likely within {prediction.horizonMinutes} minutes.</div>
      <div className="flex items-center gap-2 mt-2">
        <div className="text-xs text-[#4A5270]">Confidence</div>
        <div className="flex-1 h-1.5 bg-[#141720] rounded overflow-hidden">
          <div className="h-full bg-[#3B82F6]" style={{ width: `${prediction.confidence * 100}%` }} />
        </div>
        <div className="text-xs text-[#E8ECF4]">{(prediction.confidence * 100).toFixed(0)}%</div>
      </div>
      <button className="text-xs text-[#3B82F6] hover:text-[#E8ECF4] mt-2 flex items-center gap-1 transition-colors">
        View Evidence ↓
      </button>
    </div>
  );
}
