import React, { useState } from 'react';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserCheck, GraduationCap, Lock, Key, ArrowRight, AlertCircle, Wifi } from 'lucide-react';
import { ConnectionSettingsModal } from './ConnectionSettingsModal';

const maskValue = (value: string) => value ? `${value.slice(0, 1)}***${value.slice(-1)}` : '***';

export const LoginScreen: React.FC = () => {
  const { login, loginAsDemoUser, isLoading, authError, clearAuthError, connectionMode } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();
    await login(username, password);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Subtle Indigo Background Ambient Accents */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Logo size="lg" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">InternFlow</h1>
            <p className="text-xs text-indigo-200/80 font-medium mt-1">
              DoxabetaCloud Academy Student Management Portal
            </p>
          </div>
        </div>

        {/* Login Box */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 shadow-2xl backdrop-blur-md space-y-5">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>HTTP Basic Auth Login</span>
            </h2>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-indigo-300 transition-colors"
              title="Backend Settings & Connection Status"
            >
              <Wifi className="w-3 h-3 text-emerald-400" />
              <span>{connectionMode === 'PROXY' ? 'Proxy API' : 'Port 8080'}</span>
            </button>
          </div>

          {authError && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-xs text-rose-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{authError.message}</p>
                {authError.details && <p className="text-[11px] opacity-80 mt-1">{authError.details}</p>}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Username</label>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  placeholder="***"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
                placeholder="***"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>{isLoading ? 'Authenticating...' : 'Sign In with Basic Auth'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Demo Login Quick Switcher */}
          <div className="pt-4 border-t border-slate-700/80 space-y-2">
            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider text-center">
              Quick Demo Accounts
            </p>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setUsername('admin');
                  setPassword('admin123');
                  loginAsDemoUser('admin');
                }}
                className="p-2 bg-slate-900/90 hover:bg-purple-950/40 border border-slate-700 hover:border-purple-600 rounded-xl text-center space-y-1 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-purple-400 mx-auto" />
                <span className="block text-[11px] font-bold text-white">Admin</span>
                <span className="block text-[9px] text-slate-400 font-mono">{maskValue('admin123')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setUsername('mentor');
                  setPassword('mentor123');
                  loginAsDemoUser('mentor');
                }}
                className="p-2 bg-slate-900/90 hover:bg-blue-950/40 border border-slate-700 hover:border-blue-600 rounded-xl text-center space-y-1 transition-all cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-blue-400 mx-auto" />
                <span className="block text-[11px] font-bold text-white">Mentor</span>
                <span className="block text-[9px] text-slate-400 font-mono">{maskValue('mentor123')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setUsername('student');
                  setPassword('student123');
                  loginAsDemoUser('student');
                }}
                className="p-2 bg-slate-900/90 hover:bg-emerald-950/40 border border-slate-700 hover:border-emerald-600 rounded-xl text-center space-y-1 transition-all cursor-pointer"
              >
                <GraduationCap className="w-4 h-4 text-emerald-400 mx-auto" />
                <span className="block text-[11px] font-bold text-white">Student</span>
                <span className="block text-[9px] text-slate-400 font-mono">{maskValue('student123')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-slate-500">
          © {new Date().getFullYear()} DoxabetaCloud Academy. All backend REST authorization enforced server-side.
        </p>
      </div>

      <ConnectionSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};
