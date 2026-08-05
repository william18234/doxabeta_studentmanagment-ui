import React from 'react';
import { TabType } from './Sidebar';
import { useAuth } from '../context/AuthContext';

interface FooterStatusBarProps {
  activeTab: TabType;
}

export const FooterStatusBar: React.FC<FooterStatusBarProps> = ({ activeTab }) => {
  const { connectionMode } = useAuth();

  const endpointMap: Record<TabType, { method: string; path: string }> = {
    students: { method: 'GET', path: '/api/students' },
    mentors: { method: 'GET', path: '/api/mentors' },
    cohorts: { method: 'GET', path: '/api/cohorts' },
    'daily-hours': { method: 'GET', path: '/api/daily-hours' },
    reviews: { method: 'GET', path: '/api/reviews' },
    assignments: { method: 'GET', path: '/api/assignments' },
    admin: { method: 'GET', path: '/api/admin/overview' }
  };

  const endpoint = endpointMap[activeTab] || { method: 'GET', path: '/api' };

  return (
    <footer className="h-8 bg-slate-900 border-t border-slate-800 flex items-center justify-between px-4 shrink-0 text-[10px] text-slate-400 font-mono z-20">
      <div className="flex items-center gap-4">
        <span>
          Method: <span className="text-emerald-400 uppercase font-bold">{endpoint.method}</span>
        </span>
        <span className="hidden sm:inline">
          Endpoint: <span className="text-blue-400 font-medium">{endpoint.path}</span>
        </span>
        <span>
          Status: <span className="text-emerald-400 font-medium">200 OK</span>
        </span>
        <span className="hidden md:inline text-slate-500">
          Mode: <span className="text-slate-300">{connectionMode}</span>
        </span>
      </div>

      <div className="flex items-center gap-4 text-[10px]">
        <span className="text-slate-400 font-medium">InternFlow v1.0.4-stable</span>
        <span className="hidden sm:inline text-slate-500">© 2026 DoxabetaCloud Academy</span>
      </div>
    </footer>
  );
};
