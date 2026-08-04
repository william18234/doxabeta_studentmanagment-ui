import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ConnectionSettingsModal } from './ConnectionSettingsModal';
import { ShieldCheck, UserCheck, GraduationCap, LogOut, Settings, Wifi } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
}

export const Header: React.FC<HeaderProps> = () => {
  const { user, logout, connectionMode, loginAsDemoUser } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const roleConfigs = {
    ADMIN: {
      label: 'ADMIN',
      badgeClass: 'text-purple-600 dark:text-purple-400',
      icon: <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
    },
    MENTOR: {
      label: 'MENTOR',
      badgeClass: 'text-blue-600 dark:text-blue-400',
      icon: <UserCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
    },
    STUDENT: {
      label: 'STUDENT',
      badgeClass: 'text-emerald-600 dark:text-emerald-400',
      icon: <GraduationCap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
    }
  };

  const userRole = user?.role || 'STUDENT';
  const roleMeta = roleConfigs[userRole];

  return (
    <>
      <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 z-30 transition-colors">
        {/* Left Side: API Connected Pill */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/80 px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2 border border-slate-200/60 dark:border-slate-700/60 cursor-pointer transition-colors"
            title="Configure Backend Connection"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse"></span>
            <span>API Connected:</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              {connectionMode === 'PROXY'
                ? 'Express Proxy API'
                : connectionMode === 'DIRECT_8080'
                ? 'localhost:8080'
                : 'Render API'}
            </span>
            <Settings className="w-3 h-3 text-slate-400 ml-1" />
          </button>
        </div>

        {/* Right Side: Demo Role Switcher & User Profile */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="text-right cursor-pointer group flex items-center gap-2 px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Click to switch role view"
            >
              <div>
                <span className="text-[10px] block text-slate-400 font-bold uppercase leading-none text-right">Current Role</span>
                <span className={`text-xs font-extrabold uppercase leading-none block mt-0.5 ${roleMeta.badgeClass}`}>
                  {userRole}
                </span>
              </div>
              <span className="text-[10px] text-slate-400">▼</span>
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-1.5 z-50 text-xs">
                <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700/50 mb-1">
                  Switch Demo Role
                </div>

                <button
                  onClick={() => {
                    loginAsDemoUser('admin');
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
                    userRole === 'ADMIN' ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 font-bold' : 'text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <div>
                    <div className="font-semibold text-xs">Admin Mode</div>
                    <div className="text-[10px] opacity-75">Full access & overview</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    loginAsDemoUser('mentor');
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
                    userRole === 'MENTOR' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-bold' : 'text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="font-semibold text-xs">Mentor Mode</div>
                    <div className="text-[10px] opacity-75">Mentees, Reviews, Cohorts</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    loginAsDemoUser('student');
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
                    userRole === 'STUDENT' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold' : 'text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div className="font-semibold text-xs">Student Mode</div>
                    <div className="text-[10px] opacity-75">Daily Hours & Submissions</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Logout button */}
          <button
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md transition-colors cursor-pointer"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      <ConnectionSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
};

