import React from 'react';
import {
  Users,
  UserCheck,
  FolderGit2,
  Clock,
  Star,
  FileText,
  LayoutDashboard,
  Lock,
  ShieldCheck,
  GraduationCap,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type TabType =
  | 'students'
  | 'mentors'
  | 'cohorts'
  | 'daily-hours'
  | 'reviews'
  | 'assignments'
  | 'admin';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen = false, onClose }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  interface NavItem {
    id: TabType;
    label: string;
    icon: React.ReactNode;
    requiresAdmin?: boolean;
  }

  const managementItems: NavItem[] = [
    { id: 'students', label: 'Students', icon: <Users className="w-4 h-4" /> },
    { id: 'mentors', label: 'Mentors', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'cohorts', label: 'Cohorts', icon: <FolderGit2 className="w-4 h-4" /> },
  ];

  const activityItems: NavItem[] = [
    { id: 'daily-hours', label: 'Daily Hours', icon: <Clock className="w-4 h-4" /> },
    { id: 'assignments', label: 'Assignments', icon: <FileText className="w-4 h-4" /> },
    { id: 'reviews', label: 'Performance Reviews', icon: <Star className="w-4 h-4" /> },
  ];

  const adminItems: NavItem[] = [
    { id: 'admin', label: 'System Overview', icon: <LayoutDashboard className="w-4 h-4" />, requiresAdmin: true },
  ];

  const handleSelectTab = (tabId: TabType) => {
    setActiveTab(tabId);
    if (onClose) {
      onClose();
    }
  };

  const renderNavGroup = (title: string, items: NavItem[]) => (
    <div className="mb-4">
      <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest px-3 mb-1.5">
        {title}
      </div>
      <div className="space-y-0.5">
        {items.map(item => {
          const isSelected = activeTab === item.id;
          const isLocked = item.requiresAdmin && !isAdmin;

          return (
            <button
              key={item.id}
              onClick={() => handleSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 md:py-2 rounded-md transition-all cursor-pointer text-xs ${
                isSelected
                  ? 'bg-blue-600/15 text-blue-400 font-semibold border-l-2 border-blue-500'
                  : isLocked
                  ? 'text-slate-500 hover:bg-slate-800/60'
                  : 'text-slate-300 hover:bg-slate-800 font-medium'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isSelected ? 'text-blue-400' : isLocked ? 'text-slate-600' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </div>

              {isLocked && (
                <span className="flex items-center gap-1 text-[9px] font-bold bg-slate-800 px-1.5 py-0.5 rounded text-amber-400">
                  <Lock className="w-2.5 h-2.5" />
                  <span>ADMIN</span>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  const getRoleIcon = () => {
    if (user?.role === 'ADMIN') return <ShieldCheck className="w-4 h-4 text-purple-400" />;
    if (user?.role === 'MENTOR') return <UserCheck className="w-4 h-4 text-blue-400" />;
    return <GraduationCap className="w-4 h-4 text-emerald-400" />;
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-40 md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Drawer Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 md:w-64 bg-slate-900 flex flex-col shrink-0 border-r border-slate-800 shadow-2xl md:shadow-xl select-none transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Sidebar Header Brand */}
        <div className="p-4 md:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-lg shadow-md">
              D
            </div>
            <div>
              <h1 className="text-white font-bold text-sm leading-tight uppercase tracking-wider">InternFlow</h1>
              <p className="text-slate-400 text-[10px] leading-none uppercase font-semibold">DoxabetaCloud Academy</p>
            </div>
          </div>

          {/* Close button for Mobile screen */}
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Close navigation"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 py-4 px-3 space-y-2 overflow-y-auto">
          {renderNavGroup('Management', managementItems)}
          {renderNavGroup('Activities', activityItems)}
          {renderNavGroup('Admin Toolset', adminItems)}
        </nav>

        {/* Footer User Profile Card */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3 px-3 py-2 bg-slate-800/60 rounded-lg border border-slate-700/50">
            <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs font-bold text-white uppercase shrink-0">
              {user?.name ? user.name.slice(0, 2) : 'US'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <p className="text-white text-xs font-bold truncate">{user?.name || 'User'}</p>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                {getRoleIcon()}
                <span className="truncate font-mono uppercase text-blue-400 font-semibold">{user?.role}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

