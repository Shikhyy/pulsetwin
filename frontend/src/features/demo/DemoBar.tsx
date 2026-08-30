import React, { useState } from 'react';
import { Play, RotateCcw, AlertTriangle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface DemoBarProps {
  isPanelOpen?: boolean;
}

export default function DemoBar({ isPanelOpen = false }: DemoBarProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ text: string; isError?: boolean } | null>(null);

  const clearStatus = () => setTimeout(() => setStatus(null), 4000);

  const triggerScenario = async () => {
    setLoading(true);
    setStatus({ text: 'Triggering scenario…' });
    try {
      const res = await fetch(`${API_URL}/api/demo/trigger-scenario`, { method: 'POST' });
      const data = await res.json();
      setStatus({ text: data.success ? '▸ Scenario triggered' : data.message || 'Failed' });
    } catch {
      setStatus({ text: 'Backend unavailable', isError: true });
    } finally {
      setLoading(false);
      clearStatus();
    }
  };

  const reset = async () => {
    setLoading(true);
    setStatus({ text: 'Resetting…' });
    try {
      const res = await fetch(`${API_URL}/api/demo/reset`, { method: 'POST' });
      const data = await res.json();
      setStatus({ text: data.success ? '✓ Reset complete' : 'Failed' });
    } catch {
      setStatus({ text: 'Backend unavailable', isError: true });
    } finally {
      setLoading(false);
      clearStatus();
    }
  };

  const rightClass = isPanelOpen ? 'right-[360px]' : 'right-0';

  return (
    <div
      className={`absolute bottom-0 left-14 ${rightClass} h-9 bg-surface border-t border-border z-10 flex items-center px-3 gap-4 transition-all duration-300`}
    >
      {/* Demo badge */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="label-xs border border-state-attention/40 bg-state-attention/10 text-state-attention px-1.5 py-0.5 rounded">
          DEMO
        </span>
      </div>

      {/* Status / default message */}
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        {status?.isError && <AlertTriangle className="w-3 h-3 text-state-critical shrink-0" />}
        <span
          className={`text-[11px] font-mono truncate ${
            status?.isError ? 'text-state-critical' : 'text-text-secondary'
          }`}
        >
          {status?.text ?? 'T+18min: Bottleneck developing at ST-18 · E-Coat Oven'}
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={triggerScenario}
          disabled={loading}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-2 hover:bg-surface-3 border border-border rounded text-[11px] text-text-primary transition-colors disabled:opacity-50"
        >
          <Play className="w-3 h-3" />
          Trigger
        </button>
        <button
          onClick={reset}
          disabled={loading}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-surface-2 hover:bg-surface-3 border border-border rounded text-[11px] text-text-primary transition-colors disabled:opacity-50"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>
    </div>
  );
}
