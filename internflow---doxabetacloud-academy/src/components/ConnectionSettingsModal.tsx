import React, { useState } from 'react';
import { X, Server, CheckCircle2, AlertCircle, RefreshCw, Key, Globe, Database } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getBaseUrl } from '../services/api';

interface ConnectionSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectionSettingsModal: React.FC<ConnectionSettingsModalProps> = ({ isOpen, onClose }) => {
  const { user, authHeader, connectionMode, setConnectionMode } = useAuth();
  const [testResult, setTestResult] = useState<{ status: 'idle' | 'testing' | 'success' | 'error'; message?: string }>({ status: 'idle' });

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTestResult({ status: 'testing' });
    try {
      const url = `${getBaseUrl()}/health`;
      const res = await fetch(url, {
        headers: authHeader ? { Authorization: authHeader } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setTestResult({
          status: 'success',
          message: `Connected! Service: ${data.service || 'Backend'} (${res.status} OK)`
        });
      } else {
        setTestResult({
          status: 'error',
          message: `Server returned HTTP ${res.status}: ${res.statusText}`
        });
      }
    } catch (err: any) {
      setTestResult({
        status: 'error',
        message: err.message || 'Failed to reach endpoint. Verify host is running.'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <Server className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Backend Connection & Credentials</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs text-slate-600 dark:text-slate-300">
          {/* Connection Mode Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">
              Backend Routing Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setConnectionMode('PRODUCTION')}
                className={`p-3 text-left border rounded-xl flex flex-col gap-1 transition-all ${
                  connectionMode === 'PRODUCTION'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 font-medium ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs">Live Backend</span>
                  <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="text-[10px] opacity-80 leading-relaxed">
                  `onrender.com/api` (Live Production API)
                </span>
              </button>

              <button
                type="button"
                onClick={() => setConnectionMode('PROXY')}
                className={`p-3 text-left border rounded-xl flex flex-col gap-1 transition-all ${
                  connectionMode === 'PROXY'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 font-medium ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs">Express Proxy</span>
                  <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-[10px] opacity-80 leading-relaxed">
                  `/api` (Proxies backend or mock fallback)
                </span>
              </button>

              <button
                type="button"
                onClick={() => setConnectionMode('DIRECT_8080')}
                className={`p-3 text-left border rounded-xl flex flex-col gap-1 transition-all ${
                  connectionMode === 'DIRECT_8080'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 font-medium ring-2 ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 bg-white dark:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs">Port 8080</span>
                  <Server className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="text-[10px] opacity-80 leading-relaxed">
                  `localhost:8080/api` (Local dev server)
                </span>
              </button>
            </div>
          </div>

          {/* Current Configuration Summary */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-500 dark:text-slate-400">Current Base URL:</span>
              <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">{getBaseUrl()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-500 dark:text-slate-400">Authenticated User:</span>
              <span className="font-medium text-slate-900 dark:text-white">{user?.name} ({user?.username})</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-500 dark:text-slate-400">Active Role:</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                {user?.role}
              </span>
            </div>
          </div>

          {/* Basic Auth Header Preview */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5 text-slate-700 dark:text-slate-300 font-semibold">
              <Key className="w-3.5 h-3.5 text-amber-500" />
              <span>Authorization Header (HTTP Basic Auth)</span>
            </div>
            <div className="p-2.5 font-mono text-[11px] bg-slate-900 text-slate-200 rounded-lg overflow-x-auto break-all">
              {authHeader || 'None'}
            </div>
          </div>

          {/* Connection Test Action */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testResult.status === 'testing'}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-xs transition-all shadow-xs cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testResult.status === 'testing' ? 'animate-spin' : ''}`} />
                <span>Test Backend Health (`/api/health`)</span>
              </button>

              {testResult.status === 'success' && (
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verified</span>
                </div>
              )}
              {testResult.status === 'error' && (
                <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold text-xs">
                  <AlertCircle className="w-4 h-4" />
                  <span>Failed</span>
                </div>
              )}
            </div>

            {testResult.message && (
              <div
                className={`p-3 rounded-lg text-xs font-mono border ${
                  testResult.status === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-800'
                }`}
              >
                {testResult.message}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-medium text-xs rounded-lg transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
