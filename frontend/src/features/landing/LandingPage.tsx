import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Activity,
  Cpu,
  FlaskConical,
  Search,
  BarChart2,
  Zap,
  Shield,
  GitMerge,
  ChevronRight,
} from 'lucide-react';

// ─── Mini 3D preview using canvas (no Three.js overhead on landing) ──────────
function FactoryPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    const H = canvas.height = canvas.offsetHeight * window.devicePixelRatio;

    const stations = [
      // Row 1 - Zone A
      ...Array.from({ length: 7 }, (_, i) => ({ x: 120 + i * 60, y: 130, zone: 0, status: i === 3 ? 'warn' : 'run' })),
      // Row 2 - Zone A lower
      ...Array.from({ length: 7 }, (_, i) => ({ x: 120 + i * 60, y: 190, zone: 0, status: i === 5 ? 'idle' : 'run' })),
      // Row 3 - Zone B
      ...Array.from({ length: 5 }, (_, i) => ({ x: 120 + i * 60, y: 270, zone: 1, status: i === 2 ? 'crit' : 'run' })),
      // Row 4 - Zone C
      ...Array.from({ length: 8 }, (_, i) => ({ x: 120 + i * 60, y: 350, zone: 2, status: 'run' })),
    ];

    const zoneColors = ['#1A3D2A22', '#3D2A0A22', '#0A2A3D22'];
    const statusColors: Record<string, string> = {
      run: '#2A9D4E',
      warn: '#C8902A',
      crit: '#B83030',
      idle: '#4A5270',
    };

    let t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Background
      ctx.fillStyle = '#0D0F12';
      ctx.fillRect(0, 0, W, H);

      // Grid
      ctx.strokeStyle = '#1C2030';
      ctx.lineWidth = 0.5;
      for (let gx = 0; gx < W; gx += 30) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
      }
      for (let gy = 0; gy < H; gy += 30) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
      }

      // Zone fills
      const zoneRects = [
        { x: 80, y: 100, w: 440, h: 120, z: 0, label: 'BODY CONSTRUCTION' },
        { x: 80, y: 240, w: 320, h: 60, z: 1, label: 'PAINT' },
        { x: 80, y: 320, w: 490, h: 60, z: 2, label: 'FINAL ASSEMBLY' },
      ];
      zoneRects.forEach(zr => {
        ctx.fillStyle = zoneColors[zr.z];
        ctx.fillRect(zr.x, zr.y, zr.w, zr.h);
        ctx.fillStyle = '#4A5270';
        ctx.font = `${8 * window.devicePixelRatio}px Inter, sans-serif`;
        ctx.fillText(zr.label, zr.x + 8, zr.y + 14);
      });

      // Conveyor lines
      ctx.strokeStyle = '#2A3048';
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 4]);
      for (let i = 0; i < stations.length - 1; i++) {
        const s = stations[i], n = stations[i + 1];
        if (Math.abs(s.y - n.y) < 5) {
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(n.x, n.y);
          ctx.stroke();
        }
      }
      ctx.setLineDash([]);

      // Stations
      stations.forEach((s) => {
        const col = statusColors[s.status];
        const blink = s.status === 'crit' && Math.sin(t * 4) > 0;
        const r = 8;

        // Glow for active
        if (s.status === 'warn' || s.status === 'crit') {
          const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, r * 2.5);
          grd.addColorStop(0, col + '55');
          grd.addColorStop(1, col + '00');
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.arc(s.x, s.y, r * 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Body
        ctx.fillStyle = '#1C2030';
        ctx.strokeStyle = blink ? '#B83030' : col;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(s.x - r, s.y - r, r * 2, r * 2, 2);
        ctx.fill();
        ctx.stroke();

        // Status dot
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Animated pulse ring on critical station
      const critStation = stations.find(s => s.status === 'crit');
      if (critStation) {
        const progress = (t % 2) / 2;
        const radius = 10 + progress * 30;
        ctx.strokeStyle = `rgba(184,48,48,${0.8 * (1 - progress)})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(critStation.x, critStation.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Legend
      const items = [['run', 'Running'], ['warn', 'Warning'], ['crit', 'Critical'], ['idle', 'Idle']];
      items.forEach(([key, label], i) => {
        const lx = 80 + i * 110, ly = H / window.devicePixelRatio - 20;
        ctx.fillStyle = statusColors[key];
        ctx.beginPath(); ctx.arc(lx, ly * window.devicePixelRatio, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#8B93AB';
        ctx.font = `${9 * window.devicePixelRatio}px Inter, sans-serif`;
        ctx.fillText(label, lx + 10, ly * window.devicePixelRatio + 4);
      });

      t += 0.016;
      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ imageRendering: 'auto' }}
    />
  );
}

// ─── Feature Card ─────────────────────────────────────────────────────────────
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  tag?: string;
}

function FeatureCard({ icon, title, description, tag }: FeatureCardProps) {
  return (
    <div className="group border border-border bg-surface hover:bg-surface-2 rounded p-5 flex flex-col gap-3 transition-colors duration-200">
      <div className="flex items-start justify-between">
        <div className="p-2 bg-surface-2 group-hover:bg-surface-3 rounded border border-border transition-colors">
          {icon}
        </div>
        {tag && (
          <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted border border-border px-1.5 py-0.5 rounded">
            {tag}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-text-primary mb-1">{title}</h3>
        <p className="text-xs text-text-secondary leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// ─── Product Loop ─────────────────────────────────────────────────────────────
const LOOP_STEPS = ['OBSERVE', 'UNDERSTAND', 'PREDICT', 'SIMULATE', 'DECIDE', 'VERIFY'];

function ProductLoop() {
  return (
    <div className="flex items-center gap-0 overflow-x-auto">
      {LOOP_STEPS.map((step, i) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center shrink-0 px-4 py-2">
            <div className="text-[10px] font-bold tracking-widest text-text-muted uppercase">{step}</div>
          </div>
          {i < LOOP_STEPS.length - 1 && (
            <ChevronRight className="w-3 h-3 text-border-strong shrink-0" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Stat Item ────────────────────────────────────────────────────────────────
interface StatProps { value: string; label: string; }
function Stat({ value, label }: StatProps) {
  return (
    <div className="flex flex-col items-center gap-1 px-6 py-4">
      <div className="font-mono text-2xl font-bold text-text-primary tabular-nums">{value}</div>
      <div className="text-[10px] font-semibold uppercase tracking-widest text-text-muted text-center">{label}</div>
    </div>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-screen bg-root text-text-primary font-sans overflow-y-auto overflow-x-hidden">

      {/* ── Top Nav ────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border bg-root/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-14">
          <div className="flex items-center gap-3">
            {/* Logo mark */}
            <div className="flex items-center gap-1">
              <div className="w-6 h-6 relative">
                <div className="absolute inset-0 border-2 border-accent rounded-sm" />
                <div className="absolute inset-1 bg-accent rounded-sm opacity-60" />
              </div>
              <span className="text-sm font-bold tracking-tight text-text-primary">PulseTwin</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <span className="text-xs text-text-muted font-medium">Industrial Intelligence Platform</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-xs text-text-muted hover:text-text-primary transition-colors">Platform</a>
            <a href="#architecture" className="text-xs text-text-muted hover:text-text-primary transition-colors">Architecture</a>
            <a href="#stats" className="text-xs text-text-muted hover:text-text-primary transition-colors">Capabilities</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="btn-ghost text-xs"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/login')}
              className="btn-accent text-xs"
            >
              Request Demo
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Copy */}
          <div className="flex flex-col gap-6 animate-fade-in-up">
            {/* Eyebrow */}
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-state-normal animate-status-blink" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-state-normal">
                Live — Meridian Assembly Plant Alpha
              </span>
            </div>

            <div>
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-text-primary leading-tight">
                The factory floor,<br />
                <span className="text-accent">fully observed.</span>
              </h1>
              <p className="mt-4 text-base text-text-secondary leading-relaxed max-w-lg">
                PulseTwin combines machine telemetry, PLC signals, predictive models, and simulation 
                into a real-time industrial digital twin — so plant teams can see, understand, and 
                act on what's happening across the entire assembly line.
              </p>
            </div>

            {/* Product loop */}
            <div className="border border-border rounded bg-surface-2 overflow-hidden">
              <div className="px-4 py-2 border-b border-border">
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Product Loop</span>
              </div>
              <div className="px-2 py-1">
                <ProductLoop />
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded transition-colors"
              >
                Enter Platform <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-5 py-2.5 border border-border hover:border-border-strong text-text-primary text-sm font-medium rounded transition-colors"
              >
                View Demo Scenario
              </button>
            </div>

            {/* Trust line */}
            <p className="text-xs text-text-muted">
              No setup required for demo · Pre-loaded with 40-station factory data
            </p>
          </div>

          {/* Right: Factory Preview */}
          <div className="relative">
            <div className="border border-border rounded overflow-hidden bg-root" style={{ height: '420px' }}>
              {/* Header bar of the preview */}
              <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-surface">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-surface-3" />
                  <div className="w-2.5 h-2.5 rounded-full bg-surface-3" />
                  <div className="w-2.5 h-2.5 rounded-full bg-surface-3" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-[10px] text-text-muted font-mono">Factory Viewport — Line 1 · 40 Stations</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-state-normal animate-status-blink" />
                  <span className="text-[9px] text-state-normal font-mono">LIVE</span>
                </div>
              </div>
              {/* Canvas preview */}
              <div className="h-full" style={{ height: 'calc(100% - 37px)' }}>
                <FactoryPreview />
              </div>
            </div>
            {/* Floating alert card */}
            <div className="absolute -bottom-4 -left-4 bg-surface border border-state-attention/40 rounded shadow-xl p-3 w-52 animate-fade-in-up">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-state-attention mt-1 animate-status-blink shrink-0" />
                <div>
                  <div className="text-[10px] font-bold text-state-attention uppercase tracking-wide">Bottleneck Detected</div>
                  <div className="text-[10px] text-text-secondary mt-0.5">ST-18 · E-Coat Oven · 88% confidence</div>
                  <div className="text-[10px] text-text-muted mt-0.5">Predicted 12m before event</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ──────────────────────────────────────────────────────── */}
      <section id="stats" className="border-y border-border bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border">
            <Stat value="40" label="Production Stations" />
            <Stat value="3" label="Assembly Zones" />
            <Stat value="<50ms" label="Event Latency" />
            <Stat value="88%" label="Prediction Accuracy" />
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-10">
          <div className="label-xs mb-2">Platform Capabilities</div>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">
            Every layer of your assembly line — visible.
          </h2>
          <p className="mt-2 text-sm text-text-secondary max-w-xl">
            From raw PLC telemetry to executive KPIs, PulseTwin provides the full operational intelligence stack 
            for mixed-model vehicle assembly environments.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <FeatureCard
            icon={<Activity className="w-4 h-4 text-accent" />}
            title="Real-Time Digital Twin"
            description="Every station, vehicle, and conveyor segment is mirrored in real time using WebSocket-driven telemetry. State changes propagate in under 50ms."
            tag="Core"
          />
          <FeatureCard
            icon={<Zap className="w-4 h-4 text-state-attention" />}
            title="Predictive Intelligence"
            description="ML models predict bottlenecks, quality defects, and equipment degradation before they occur. Confidence and horizon clearly communicated."
            tag="ML"
          />
          <FeatureCard
            icon={<FlaskConical className="w-4 h-4 text-state-predicted" />}
            title="Simulation Engine"
            description="Run what-if scenarios against the live factory state. Compare throughput, defect rate, and downstream impact before making changes."
            tag="Sim"
          />
          <FeatureCard
            icon={<Search className="w-4 h-4 text-text-secondary" />}
            title="Root Cause Analysis"
            description="Trace any quality issue upstream through the Digital Thread. Evidence from multiple telemetry sources assembled automatically."
          />
          <FeatureCard
            icon={<BarChart2 className="w-4 h-4 text-state-normal" />}
            title="Leadership Dashboard"
            description="OEE, First Pass Yield, prevented defects, and estimated savings — all rolled up with explainable evidence, not just numbers."
          />
          <FeatureCard
            icon={<Cpu className="w-4 h-4 text-text-secondary" />}
            title="OT / PLC Integration"
            description="Native support for PLC/SCADA signal ingestion, sensor data gaps, and mixed instrumentation profiles (RICH, PARTIAL, SENSOR_POOR)."
          />
        </div>
      </section>

      {/* ── Architecture Brief ─────────────────────────────────────────────── */}
      <section id="architecture" className="border-t border-border bg-surface">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <div className="label-xs mb-2">System Architecture</div>
              <h2 className="text-2xl font-bold tracking-tight text-text-primary mb-4">
                Built for the plant floor, not the cloud demo.
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed mb-6">
                PulseTwin is designed around a real-time event bus, not a polling dashboard. 
                Every state change — whether from a torque sensor, a PLC signal, or an ML model — 
                flows through the same event pipeline.
              </p>
              <div className="flex flex-col gap-3">
                {[
                  { icon: <GitMerge className="w-3.5 h-3.5 text-accent" />, label: 'Event-driven architecture — no polling' },
                  { icon: <Shield className="w-3.5 h-3.5 text-state-normal" />, label: 'Safety-first: human operators remain accountable' },
                  { icon: <Activity className="w-3.5 h-3.5 text-state-attention" />, label: 'Evidence before prediction — confidence always visible' },
                  { icon: <Zap className="w-3.5 h-3.5 text-state-predicted" />, label: 'Progressive complexity — spatial before abstract' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="p-1.5 bg-surface-2 border border-border rounded">
                      {item.icon}
                    </div>
                    <span className="text-xs text-text-secondary">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Architecture diagram (text-based) */}
            <div className="card font-mono text-xs text-text-muted leading-relaxed">
              <div className="label-xs mb-3">System Layers</div>
              {[
                { layer: 'PLC / OT', detail: 'Sensors · Torque · Environmental', color: '#4A5270' },
                { layer: 'Telemetry Ingestion', detail: 'WebSocket · Event Bus · Kafka', color: '#3B4468' },
                { layer: 'Digital Twin State', detail: 'Station · Vehicle · Flow', color: '#3B82F6' },
                { layer: 'ML / Prediction', detail: 'Bottleneck · Defect · Anomaly', color: '#2A6EC8' },
                { layer: 'Simulation Engine', detail: 'What-if · Comparison · ROI', color: '#7B2AC8' },
                { layer: 'Experience Layer', detail: '3D Viewport · Panels · HUD', color: '#2A9D4E' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 py-1.5 border-b border-border last:border-0">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
                  <div className="flex-1 min-w-0">
                    <span className="text-text-primary font-medium">{item.layer}</span>
                    <span className="text-text-muted ml-2">·</span>
                    <span className="text-text-muted ml-2">{item.detail}</span>
                  </div>
                  {i < 5 && (
                    <ChevronRight className="w-3 h-3 text-border-strong shrink-0 rotate-90" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────────────────────── */}
      <section className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-text-primary mb-1">Ready to see your factory?</h2>
            <p className="text-sm text-text-secondary">
              Pre-loaded with 40-station assembly line data. No configuration required.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded transition-colors"
            >
              Launch PulseTwin <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-surface">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 relative">
              <div className="absolute inset-0 border-2 border-border-strong rounded-sm" />
              <div className="absolute inset-1 bg-surface-3 rounded-sm" />
            </div>
            <span className="text-xs text-text-muted font-medium">PulseTwin</span>
            <span className="text-xs text-text-muted">— Industrial Intelligence Platform</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-text-muted">Prototype · Demo Environment</span>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-state-normal" />
              <span className="text-[10px] text-state-normal font-mono">All systems operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
