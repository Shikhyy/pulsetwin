import React from 'react';
import { Eye, Search, FlaskConical, BarChart2, Briefcase } from 'lucide-react';
import { useUiStore } from '../../stores/uiStore';

export default function NavigationRail() {
  const { mode, setMode } = useUiStore();
  const modes = [
    { id: 'operations', icon: <Eye size={20} />, label: 'Operations' },
    { id: 'investigation', icon: <Search size={20} />, label: 'Investigation' },
    { id: 'simulation', icon: <FlaskConical size={20} />, label: 'Simulation' },
    { id: 'planning', icon: <BarChart2 size={20} />, label: 'Planning' },
    { id: 'leadership', icon: <Briefcase size={20} />, label: 'Leadership' }
  ] as const;

  return (
    <div className="w-12 border-r border-border h-full flex flex-col bg-surface z-10 shrink-0 items-center py-4 gap-6">
      <div className="font-bold text-lg text-text-primary tracking-tighter mb-4">PT</div>
      {modes.map(m => (
        <button 
          key={m.id} 
          onClick={() => setMode(m.id)}
          className={`p-2 rounded transition-colors ${mode === m.id ? 'bg-[#3B82F6]/20 text-[#3B82F6]' : 'text-text-muted hover:text-text-primary hover:bg-surface-2'}`}
          title={m.label}
        >
          {m.icon}
        </button>
      ))}
    </div>
  );
}
