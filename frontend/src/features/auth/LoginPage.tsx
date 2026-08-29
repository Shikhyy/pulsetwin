import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('token', 'mock-token');
    onLogin();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-root text-text-primary font-sans">
      <div className="w-full max-w-md p-8 bg-surface border border-border rounded shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">PulseTwin</h1>
          <p className="text-sm text-text-muted">Industrial Intelligence Platform</p>
        </div>
        
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 bg-surface-2 border border-border rounded text-sm focus:outline-none focus:border-accent text-text-primary" />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2 bg-surface-2 border border-border rounded text-sm focus:outline-none focus:border-accent text-text-primary" />
          </div>
          <button type="submit" className="w-full mt-4 py-2 bg-accent hover:bg-blue-600 text-white text-sm font-semibold rounded transition-colors">Sign In</button>
        </form>
        
        <div className="mt-8 border-t border-border pt-6">
          <div className="text-xs text-text-muted mb-3 text-center">Demo Quick Access</div>
          <div className="flex gap-2 justify-center">
            {['Operator', 'Engineer', 'Manager'].map(role => (
              <button 
                key={role} 
                onClick={() => { setEmail(`${role.toLowerCase()}@pulsetwin.io`); setPassword('demo1234'); }}
                className="px-3 py-1.5 bg-surface-2 hover:bg-surface-3 border border-border rounded text-xs text-text-secondary transition-colors"
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
