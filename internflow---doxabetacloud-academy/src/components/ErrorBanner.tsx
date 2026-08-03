import React from 'react';
import { AlertTriangle, Lock, ShieldAlert, FileQuestion, X, RefreshCw } from 'lucide-react';
import { ApiError } from '../services/api';

interface ErrorBannerProps {
  error: ApiError | null;
  onDismiss?: () => void;
  onRetry?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ error, onDismiss, onRetry }) => {
  if (!error) return null;

  const is401 = error.status === 401;
  const is403 = error.status === 403;
  const is404 = error.status === 404;

  const config = is401
    ? {
        bg: 'bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800',
        text: 'text-amber-900 dark:text-amber-200',
        icon: <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
        title: '401 Authentication Required'
      }
    : is403
    ? {
        bg: 'bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800',
        text: 'text-rose-900 dark:text-rose-200',
        icon: <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />,
        title: '403 Access Forbidden (Role Security Restriction)'
      }
    : is404
    ? {
        bg: 'bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800',
        text: 'text-blue-900 dark:text-blue-200',
        icon: <FileQuestion className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />,
        title: '404 Resource Not Found'
      }
    : {
        bg: 'bg-slate-50 border-slate-200 dark:bg-slate-900 dark:border-slate-800',
        text: 'text-slate-900 dark:text-slate-200',
        icon: <AlertTriangle className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />,
        title: 'Backend Communication Error'
      };

  return (
    <div className={`p-4 mb-5 border rounded-xl shadow-xs transition-all ${config.bg} ${config.text}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {config.icon}
          <div>
            <h4 className="font-semibold text-sm leading-snug">{config.title}</h4>
            <p className="text-xs opacity-90 mt-1 leading-relaxed">{error.message}</p>
            {error.details && (
              <p className="text-xs font-mono opacity-80 mt-1.5 p-2 bg-black/5 dark:bg-white/5 rounded border border-black/10 dark:border-white/10">
                {error.details}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-white/80 hover:bg-white dark:bg-slate-800 dark:hover:bg-slate-700 shadow-xs border border-slate-200 dark:border-slate-700"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
