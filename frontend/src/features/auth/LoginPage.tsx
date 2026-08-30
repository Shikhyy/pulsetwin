import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Activity } from 'lucide-react';

interface Props {
  onLogin: () => void;
}

const ROLES = [
  { id: 'operator', label: 'Operator', email: 'operator@pulsetwin.io', description: 'Station-level operations' },
  { id: 'engineer', label: 'Process Engineer', email: 'engineer@pulsetwin.io', description: 'Root cause & simulation' },
  { id: 'manager', label: 'Plant Manager', email: 'manager@pulsetwin.io', description: 'KPIs & leadership view' },
];

export default function LoginPage({ onLogin }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate auth delay
    await new Promise(r => setTimeout(r, 600));
    localStorage.setItem('token', 'mock-token');
    onLogin();
    navigate('/app');
  };

  const handleQuickAccess = async (roleEmail: string, roleId: string) => {
    setSelectedRole(roleId);
    setEmail(roleEmail);
    setPassword('demo1234');
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    localStorage.setItem('token', 'mock-token');
    onLogin();
    navigate('/app');
  };

  return (
    <div className="h-screen w-screen bg-root flex overflow-y-auto overflow-x-hidden">
      
      {/* Left side: Branding / Context */}
      <div className="hidden lg:flex w-[480px] flex-col border-r border-border bg-surface p-10 shrink-0">
        <div className="flex items-center gap-2 mb-12">
          <div className="w-7 h-7 relative">
            <div className="absolute inset-0 border-2 border-accent rounded-sm" />
            <div className="absolute inset-1 bg-accent rounded-sm opacity-60" />
          </div>
          <span className="text-sm font-bold tracking-tight text-text-primary">PulseTwin</span>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <div className="label-xs mb-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-state-normal animate-status-blink" />
            Meridian Assembly Plant Alpha — Live
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary mb-3 leading-tight">
            Every station.<br />Every unit.<br />Every moment.
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed max-w-sm">
            Real-time digital twin, predictive intelligence, and simulation for mixed-model vehicle assembly.
          </p>

          {/* Mini stat grid */}
          <div className="mt-10 grid grid-cols-2 gap-3">
            {[
              { v: '40', l: 'Stations' },
              { v: '3', l: 'Zones' },
              { v: '88%', l: 'Prediction Acc.' },
              { v: '<50ms', l: 'Event Latency' },
            ].map(s => (
              <div key={s.l} className="bg-surface-2 border border-border rounded p-3">
                <div className="font-mono text-lg font-bold text-text-primary">{s.v}</div>
                <div className="text-[10px] uppercase tracking-widest text-text-muted mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1 text-[10px] text-text-muted">
          <Activity className="w-3 h-3" />
          <span>PulseTwin Prototype · Demo Environment</span>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Back to landing */}
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary mb-8 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to overview
          </Link>

          {/* Logo (mobile only) */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-6 h-6 relative">
              <div className="absolute inset-0 border-2 border-accent rounded-sm" />
              <div className="absolute inset-1 bg-accent rounded-sm opacity-60" />
            </div>
            <span className="text-sm font-bold tracking-tight">PulseTwin</span>
          </div>

          <div className="mb-8">
            <h1 className="text-xl font-bold text-text-primary mb-1">Sign in</h1>
            <p className="text-sm text-text-secondary">Access your plant intelligence dashboard.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="label-xs block mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@plant.io"
                className="w-full px-3 py-2 bg-surface-2 border border-border rounded text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="label-xs block mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-surface-2 border border-border rounded text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-accent hover:bg-accent-hover disabled:opacity-60 text-white text-sm font-semibold rounded transition-colors mt-1"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[10px] text-text-muted uppercase tracking-widest">Demo Quick Access</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Role quick-access */}
          <div className="flex flex-col gap-2">
            {ROLES.map(role => (
              <button
                key={role.id}
                onClick={() => handleQuickAccess(role.email, role.id)}
                disabled={loading}
                className={`flex items-center justify-between px-3 py-2.5 border rounded text-left transition-all disabled:opacity-60 ${
                  selectedRole === role.id
                    ? 'border-accent/60 bg-accent/10'
                    : 'border-border hover:border-border-strong bg-surface-2 hover:bg-surface-3'
                }`}
              >
                <div>
                  <div className="text-xs font-semibold text-text-primary">{role.label}</div>
                  <div className="text-[10px] text-text-muted mt-0.5">{role.description}</div>
                </div>
                <div className="text-[10px] text-text-muted font-mono shrink-0 ml-3">demo1234</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
