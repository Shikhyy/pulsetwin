import React from 'react';

interface BadgeProps { classType: 'MEASURED' | 'INFERRED' | 'PREDICTED' | 'SIMULATED' | 'UNKNOWN'; }

export default function Badge({ classType }: BadgeProps) {
  const styles = {
    MEASURED: 'bg-[#1A3D2A] text-[#2A9D4E]',
    INFERRED: 'bg-[#3D2A0A] text-[#C8902A]',
    PREDICTED: 'bg-[#0A2A3D] text-[#3B82F6]',
    SIMULATED: 'bg-[#2A0A3D] text-[#9333EA]',
    UNKNOWN: 'bg-[#1C2030] text-[#8B93AB]'
  };

  return (
    <span className={`text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded ${styles[classType]}`}>
      {classType}
    </span>
  );
}
