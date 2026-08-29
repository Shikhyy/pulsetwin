import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { StationStatus } from '../features/factory/geometry/StationMesh';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(ms: number): string {
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${min}m ${sec}s`;
}

export function formatPercent(value: number, decimals = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function getRiskColor(risk: number): string {
  if (risk > 0.7) return '#B83030';
  if (risk > 0.4) return '#C8902A';
  return '#2A9D4E';
}
