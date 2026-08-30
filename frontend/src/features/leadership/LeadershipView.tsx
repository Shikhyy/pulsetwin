import React from 'react';
import { ArrowUpRight, ArrowDownRight, ShieldCheck, DollarSign, Activity, Download } from 'lucide-react';

interface KPI {
  title: string;
  value: string;
  trend: string;
  trendPositive: boolean;
  icon: React.ReactNode;
  sub?: string;
}

const kpis: KPI[] = [
  {
    title: 'OEE',
    value: '78.4%',
    trend: '+2.1%',
    trendPositive: true,
    icon: <Activity className="w-4 h-4 text-accent" />,
    sub: 'Overall Equipment Effectiveness',
  },
  {
    title: 'First Pass Yield',
    value: '94.2%',
    trend: '-0.5%',
    trendPositive: false,
    icon: <ShieldCheck className="w-4 h-4 text-state-normal" />,
    sub: 'Units passing first inspection',
  },
  {
    title: 'Prevented Defects',
    value: '142',
    trend: '+15',
    trendPositive: true,
    icon: <Activity className="w-4 h-4 text-state-attention" />,
    sub: 'Month to date',
  },
  {
    title: 'Est. Savings',
    value: '$24.5k',
    trend: '+$4.2k',
    trendPositive: true,
    icon: <DollarSign className="w-4 h-4 text-state-predicted" />,
    sub: 'Month to date',
  },
];

function KPICard({ kpi }: { kpi: KPI }) {
  const TrendIcon = kpi.trendPositive ? ArrowUpRight : ArrowDownRight;
  const trendColor = kpi.trendPositive ? 'text-state-normal' : 'text-state-critical';

  return (
    <div className="card flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="label-xs">{kpi.title}</span>
        {kpi.icon}
      </div>
      <div className="flex items-end gap-2 mt-1">
        <span className="font-mono text-xl font-bold text-text-primary tabular-nums">{kpi.value}</span>
        <div className={`flex items-center gap-0.5 mb-0.5 ${trendColor}`}>
          <TrendIcon className="w-3 h-3" />
          <span className="font-mono text-[11px]">{kpi.trend}</span>
        </div>
      </div>
      {kpi.sub && (
        <p className="text-[10px] text-text-muted">{kpi.sub}</p>
      )}
    </div>
  );
}

export const LeadershipView: React.FC = () => {
  return (
    <div className="flex flex-col gap-5 p-4 bg-root text-text-primary h-full overflow-y-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-text-primary">Leadership Overview</h2>
          <p className="text-[10px] text-text-muted mt-0.5">Meridian Assembly Plant Alpha · MTD</p>
        </div>
        <button className="btn-ghost flex items-center gap-1.5">
          <Download className="w-3 h-3" />
          Export
        </button>
      </div>

      {/* KPI grid — 2 columns for panel width */}
      <div className="grid grid-cols-2 gap-3">
        {kpis.map((kpi, i) => (
          <KPICard key={i} kpi={kpi} />
        ))}
      </div>

      {/* Divider */}
      <div className="divider" />

      {/* Top opportunity */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="label-sm">Top Optimization Opportunity</span>
          <span className="text-[10px] bg-state-normal/10 text-state-normal border border-state-normal/30 px-1.5 py-0.5 rounded font-mono">
            88% conf.
          </span>
        </div>

        <div className="card flex flex-col gap-3">
          <p className="text-xs text-text-secondary leading-relaxed">
            Reducing the cycle time on{' '}
            <span className="text-text-primary font-medium">ST-18 (E-Coat Oven)</span>{' '}
            by 5% and adjusting temperature ramp parameters could yield an estimated{' '}
            <span className="text-text-primary font-medium">12% reduction</span>{' '}
            in downstream dimensional defects.
          </p>

          {/* Mini impact bars */}
          <div className="flex flex-col gap-2">
            {[
              { label: 'Throughput impact', value: '+5.4%', color: 'bg-state-normal', pct: 54 },
              { label: 'Defect reduction', value: '-12.5%', color: 'bg-state-predicted', pct: 72 },
            ].map(item => (
              <div key={item.label} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="label-xs">{item.label}</span>
                  <span className="font-mono text-[11px] text-text-primary">{item.value}</span>
                </div>
                <div className="h-1 bg-surface-3 rounded overflow-hidden">
                  <div className={`h-full rounded ${item.color}`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          <button className="text-xs text-accent hover:text-accent-hover font-medium transition-colors text-left">
            Open in Investigation Mode →
          </button>
        </div>
      </div>

      {/* Recent events */}
      <div className="flex flex-col gap-2">
        <span className="label-sm">Recent Significant Events</span>
        {[
          { time: '2h ago', event: 'Prediction prevented ST-18 blockage', type: 'good' },
          { time: '4h ago', event: 'Torque drift corrected at ST-12', type: 'neutral' },
          { time: '18h ago', event: 'Planned maintenance completed — ST-25', type: 'neutral' },
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-2.5 py-2 border-b border-border last:border-0">
            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${item.type === 'good' ? 'bg-state-normal' : 'bg-text-muted'}`} />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-text-secondary">{item.event}</p>
              <p className="text-[10px] text-text-muted mt-0.5">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
