import React, { useState } from 'react';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserCheck, GraduationCap, Lock, Key, ArrowRight, AlertCircle, Wifi } from 'lucide-react';
import { ConnectionSettingsModal } from './ConnectionSettingsModal';

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
    <div className="min-h-screen bg-[#0a0d18] text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Logo size="lg" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">InternFlow</h1>
            <p className="text-xs text-slate-400 font-medium mt-1">
              DoxabetaCloud Academy Student Management Portal
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-[#141b2d] border border-slate-800/90 rounded-2xl p-6 sm:p-7 shadow-2xl backdrop-blur-md space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>HTTP Basic Auth Login</span>
            </h2>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-1 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Backend Settings & Connection Status"
            >
              <Wifi className="w-4 h-4 text-emerald-400" />
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
              <label className="block text-slate-300 font-semibold mb-2">Username</label>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 bg-[#0d1220] border border-slate-700/70 rounded-xl text-white placeholder:text-slate-600 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  placeholder="####"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-3 bg-[#0d1220] border border-slate-700/70 rounded-xl text-white placeholder:text-slate-600 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
                placeholder="*****"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#5243e3] hover:bg-[#4335ce] text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <span>{isLoading ? 'Authenticating...' : 'Sign In with Basic Auth'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider text-center">
              Quick Test Credentials
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setUsername('admin');
                  setPassword('admin123');
                  loginAsDemoUser('admin');
                }}
                className="p-2 bg-[#0d1220] hover:bg-purple-950/30 border border-slate-800 hover:border-purple-600/60 rounded-xl text-center space-y-1 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400 mx-auto" />
                <span className="block text-[11px] font-bold text-slate-200">Admin</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setUsername('mentor');
                  setPassword('mentor123');
                  loginAsDemoUser('mentor');
                }}
                className="p-2 bg-[#0d1220] hover:bg-blue-950/30 border border-slate-800 hover:border-blue-600/60 rounded-xl text-center space-y-1 transition-all cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5 text-blue-400 mx-auto" />
                <span className="block text-[11px] font-bold text-slate-200">Mentor</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setUsername('student');
                  setPassword('student123');
                  loginAsDemoUser('student');
                }}
                className="p-2 bg-[#0d1220] hover:bg-emerald-950/30 border border-slate-800 hover:border-emerald-600/60 rounded-xl text-center space-y-1 transition-all cursor-pointer"
              >
                <GraduationCap className="w-3.5 h-3.5 text-emerald-400 mx-auto" />
                <span className="block text-[11px] font-bold text-slate-200">Student</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-500 leading-relaxed">
          © 2026 DoxabetaCloud Academy. All backend REST authorization enforced server-side.
        </p>
      </div>

      <ConnectionSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};
