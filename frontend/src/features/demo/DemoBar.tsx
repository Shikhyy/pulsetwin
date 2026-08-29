import React, { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface DemoBarProps {
  isPanelOpen?: boolean;
}

export default function DemoBar({ isPanelOpen = false }: DemoBarProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const triggerScenario = async () => {
    setLoading(true);
    setStatus('Triggering...');
    try {
      const res = await fetch(`${API_URL}/api/demo/trigger-scenario`, { method: 'POST' });
      const data = await res.json();
      setStatus(data.success ? 'Scenario triggered!' : data.message || 'Failed');
      setTimeout(() => setStatus(''), 4000);
    } catch {
      setStatus('Error — is the backend running?');
      setTimeout(() => setStatus(''), 4000);
    } finally {
      setLoading(false);
    }
  };

  const reset = async () => {
    setLoading(true);
    setStatus('Resetting...');
    try {
      const res = await fetch(`${API_URL}/api/demo/reset`, { method: 'POST' });
      const data = await res.json();
      setStatus(data.success ? 'Reset complete' : 'Failed');
      setTimeout(() => setStatus(''), 4000);
    } catch {
      setStatus('Error — is the backend running?');
      setTimeout(() => setStatus(''), 4000);
    } finally {
      setLoading(false);
    }
  };

  const rightClass = isPanelOpen ? 'right-[340px]' : 'right-0';

  return (
    <div className={`absolute bottom-0 left-12 ${rightClass} h-10 bg-surface-2 border-t border-border z-10 flex items-center px-4 justify-between`}>
      <div className="flex items-center gap-4">
        <span className="text-[10px] font-bold tracking-widest text-[#C8902A] uppercase border border-[#C8902A]/30 px-1.5 py-0.5 rounded bg-[#C8902A]/10">Demo Mode</span>
        <span className="text-xs text-text-secondary font-mono">
          {status || 'T+18min: Bottleneck developing at ST-18'}
        </span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={triggerScenario}
          disabled={loading}
          className="px-3 py-1 bg-surface border border-border rounded text-xs text-text-primary hover:bg-surface-3 transition-colors flex items-center gap-1 disabled:opacity-50"
        >
          ▶ Trigger Scenario
        </button>
        <button
          onClick={reset}
          disabled={loading}
          className="px-3 py-1 bg-surface border border-border rounded text-xs text-text-primary hover:bg-surface-3 transition-colors flex items-center gap-1 disabled:opacity-50"
        >
          ⟳ Reset
        </button>
      </div>
    </div>
  );
}
