import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  FolderGit2,
  Clock,
  Star,
  FileText,
  Database,
  RotateCcw,
  Code2,
  Copy,
  Download,
  ShieldAlert,
  CheckCircle2
} from 'lucide-react';
import { AdminOverview } from '../types';
import { apiService, ApiError } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ErrorBanner } from '../components/ErrorBanner';

export const AdminView: React.FC = () => {
  const { authHeader, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'raw-json'>('overview');
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [rawJson, setRawJson] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [seedSuccessMsg, setSeedSuccessMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

  const fetchAdminData = async () => {
    if (!authHeader) return;
    setIsLoading(true);
    setError(null);
    try {
      if (activeTab === 'overview') {
        const data = await apiService.getAdminOverview(authHeader);
        setOverview(data);
      } else {
        const json = await apiService.getAdminRawJson(authHeader);
        setRawJson(json);
      }
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [authHeader, activeTab]);

  const handleSeedDatabase = async () => {
    if (!authHeader) return;
    if (!confirm('Are you sure you want to reset and seed the database with baseline DoxabetaCloud Academy records?')) return;
    try {
      const res = await apiService.seedAdminData(authHeader);
      setSeedSuccessMsg(res.message);
      setTimeout(() => setSeedSuccessMsg(null), 4000);
      fetchAdminData();
    } catch (err: any) {
      setError(err);
    }
  };

  const handleCopyJson = () => {
    if (!rawJson) return;
    navigator.clipboard.writeText(JSON.stringify(rawJson, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    if (!rawJson) return;
    const blob = new Blob([JSON.stringify(rawJson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `doxabeta-admin-raw-json-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isAdmin) {
    return (
      <div className="p-8 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-2xl space-y-4 max-w-2xl mx-auto my-8">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-rose-600 dark:text-rose-400" />
          <div>
            <h2 className="text-lg font-bold text-rose-900 dark:text-rose-200">403 Access Forbidden</h2>
            <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
              Admin priviliges are required to access `/api/admin/**`
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          You are currently logged in as <strong>{user?.name}</strong> with role <strong>{user?.role}</strong>.
          The backend security model strictly restricts access to administrative endpoints (`/api/admin/overview`, `/api/admin/raw-json`, `/api/admin/seed`) to users with role `ADMIN`.
        </p>
        <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-rose-200 dark:border-rose-800 text-xs">
          <p className="font-semibold text-slate-800 dark:text-slate-200">Want to test Admin view?</p>
          <p className="text-[11px] text-slate-500 mt-1">
            Click the Role badge in the top navigation bar and select <strong>Switch to Admin Mode</strong> or log in as `admin / admin123`.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ErrorBanner error={error} onDismiss={() => setError(null)} onRetry={fetchAdminData} />

      {seedSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-200 dark:border-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{seedSuccessMsg}</span>
        </div>
      )}

      {/* Header & Admin Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Admin Control Dashboard</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            System metrics, database seed & raw JSON inspect (`/api/admin/**`)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSeedDatabase}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg transition-all shadow-xs cursor-pointer"
            title="POST /api/admin/seed - Reset database to baseline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Seed Baseline Data (`POST /seed`)</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'overview'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Overview Statistics (`GET /api/admin/overview`)
        </button>

        <button
          onClick={() => setActiveTab('raw-json')}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'raw-json'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Raw Database JSON (`GET /api/admin/raw-json`)
        </button>
      </div>

      {/* TAB 1: OVERVIEW STATISTICS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-12 text-slate-400 text-xs">Loading overview stats...</div>
          ) : overview ? (
            <>
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-white dark:bg-slate-900 border rounded-2xl shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-medium">Total Students</span>
                    <Users className="w-4 h-4 text-indigo-600" />
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{overview.totalStudents}</p>
                  <p className="text-[11px] text-emerald-600 font-medium">{overview.activeStudents} Active Interns</p>
                </div>

                <div className="p-4 bg-white dark:bg-slate-900 border rounded-2xl shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-medium">Faculty Mentors</span>
                    <UserCheck className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{overview.totalMentors}</p>
                  <p className="text-[11px] text-slate-400">Senior Cloud Architects</p>
                </div>

                <div className="p-4 bg-white dark:bg-slate-900 border rounded-2xl shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-medium">Total Hours Logged</span>
                    <Clock className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{overview.totalHoursLogged} hrs</p>
                  <p className="text-[11px] text-slate-400">Across all projects</p>
                </div>

                <div className="p-4 bg-white dark:bg-slate-900 border rounded-2xl shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-medium">Avg Review Score</span>
                    <Star className="w-4 h-4 text-amber-500" />
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{overview.averageRating} / 5.0</p>
                  <p className="text-[11px] text-amber-600 font-medium">Performance Rating</p>
                </div>
              </div>

              {/* Activity Timeline */}
              <div className="p-5 bg-white dark:bg-slate-900 border rounded-2xl shadow-xs space-y-4">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Recent System Activity Stream</h3>
                <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800">
                  {Array.isArray(overview?.recentActivities) && overview.recentActivities.length > 0 ? (
                    overview.recentActivities.map(act => (
                      <div key={act.id} className="pt-3 first:pt-0 flex items-start justify-between text-xs">
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{act.description}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Actor: {act.actor}</p>
                        </div>
                        <span className="font-mono text-[10px] text-slate-400 shrink-0">
                          {act.timestamp ? new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 py-2">No recent system activity logged.</p>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* TAB 2: RAW JSON VIEW */}
      {activeTab === 'raw-json' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Response from GET `/api/admin/raw-json`
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyJson}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
              </button>

              <button
                onClick={handleDownloadJson}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .json</span>
              </button>
            </div>
          </div>

          <div className="p-4 bg-slate-950 text-emerald-400 font-mono text-xs rounded-2xl overflow-x-auto max-h-[500px] border border-slate-800">
            {isLoading ? (
              <span className="text-slate-500">Fetching raw database payload...</span>
            ) : (
              <pre>{JSON.stringify(rawJson, null, 2)}</pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
