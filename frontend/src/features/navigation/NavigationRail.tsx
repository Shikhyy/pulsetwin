import React, { useState, useRef } from 'react';
import { Eye, Search, FlaskConical, BarChart2, Briefcase, LogOut, Settings } from 'lucide-react';
import { useUiStore } from '../../stores/uiStore';
import { useTwinStore } from '../../stores/twinStore';
import { useNavigate } from 'react-router-dom';

type Mode = 'operations' | 'investigation' | 'simulation' | 'planning' | 'leadership';

const MODES: { id: Mode; icon: React.ReactNode; label: string; shortcut: string }[] = [
  { id: 'operations',    icon: <Eye size={18} />,         label: 'Operations',    shortcut: '1' },
  { id: 'investigation', icon: <Search size={18} />,      label: 'Investigation', shortcut: '2' },
  { id: 'simulation',    icon: <FlaskConical size={18} />, label: 'Simulation',    shortcut: '3' },
  { id: 'planning',      icon: <BarChart2 size={18} />,   label: 'Planning',      shortcut: '4' },
  { id: 'leadership',    icon: <Briefcase size={18} />,   label: 'Leadership',    shortcut: '5' },
];

interface TooltipProps {
  label: string;
  shortcut: string;
  visible: boolean;
}

function Tooltip({ label, shortcut, visible }: TooltipProps) {
  if (!visible) return null;
  return (
    <div className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 z-50 pointer-events-none">
      <div className="flex items-center gap-2 bg-surface-3 border border-border-strong px-2.5 py-1.5 rounded shadow-lg whitespace-nowrap">
        <span className="text-xs font-medium text-text-primary">{label}</span>
        <kbd className="text-[9px] font-mono text-text-muted border border-border px-1 rounded">{shortcut}</kbd>
      </div>
    </div>
  );
}

export default function NavigationRail() {
  const { mode, setMode } = useUiStore();
  const isConnected = useTwinStore(s => s.isConnected);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="w-14 border-r border-border h-full flex flex-col bg-surface z-20 shrink-0 items-center py-4 relative">
      {/* Logo mark */}
      <div className="mb-6 shrink-0">
        <div className="w-8 h-8 relative cursor-pointer" onClick={() => navigate('/')}>
          <div className="absolute inset-0 border-2 border-accent/70 rounded-sm" />
          <div className="absolute inset-1 bg-accent/50 rounded-sm" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[9px] font-bold text-white tracking-tight">PT</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="w-6 h-px bg-border mb-4 shrink-0" />

      {/* Mode buttons */}
      <nav className="flex flex-col gap-1 flex-1 items-center">
        {MODES.map((m) => {
          const isActive = mode === m.id;
          return (
            <div
              key={m.id}
              className="relative"
              onMouseEnter={() => setHoveredId(m.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Active indicator line */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-accent rounded-r" />
              )}

              <button
                onClick={() => {
                  setMode(m.id);
                  if (m.id !== 'operations' && m.id !== 'investigation') {
                    useTwinStore.getState().selectStation(null);
                    useTwinStore.getState().selectUnit(null);
                  }
                }}
                aria-label={m.label}
                className={`relative p-2.5 rounded transition-all duration-150 ${
                  isActive
                    ? 'bg-accent/15 text-accent'
                    : 'text-text-muted hover:text-text-primary hover:bg-surface-2'
                }`}
              >
                {m.icon}
              </button>

              <Tooltip label={m.label} shortcut={m.shortcut} visible={hoveredId === m.id} />
            </div>
          );
        })}
      </nav>

      {/* Bottom items */}
      <div className="flex flex-col gap-1 items-center mt-auto">
        <div className="w-6 h-px bg-border mb-2" />

        {/* Settings (placeholder) */}
        <div
          className="relative"
          onMouseEnter={() => setHoveredId('settings')}
          onMouseLeave={() => setHoveredId(null)}
        >
          <button
            className="p-2.5 rounded text-text-muted hover:text-text-primary hover:bg-surface-2 transition-colors"
            aria-label="Settings"
          >
            <Settings size={16} />
          </button>
          <Tooltip label="Settings" shortcut="," visible={hoveredId === 'settings'} />
        </div>

        {/* Logout */}
        <div
          className="relative"
          onMouseEnter={() => setHoveredId('logout')}
          onMouseLeave={() => setHoveredId(null)}
        >
          <button
            onClick={handleLogout}
            className="p-2.5 rounded text-text-muted hover:text-state-critical hover:bg-state-critical/10 transition-colors"
            aria-label="Sign out"
          >
            <LogOut size={16} />
          </button>
          <Tooltip label="Sign out" shortcut="⌘Q" visible={hoveredId === 'logout'} />
        </div>

        {/* Connection dot */}
        <div className="mt-2 mb-1">
          <div
            className={`w-2 h-2 rounded-full ${isConnected ? 'bg-state-normal' : 'bg-state-critical animate-status-blink'}`}
            title={isConnected ? 'Connected' : 'Disconnected'}
          />
        </div>
      </div>
    </div>
  );
}
