import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Sidebar, TabType } from './components/Sidebar';
import { FooterStatusBar } from './components/FooterStatusBar';
import { LoginScreen } from './components/LoginScreen';

import { StudentsView } from './views/StudentsView';
import { MentorsView } from './views/MentorsView';
import { CohortsView } from './views/CohortsView';
import { DailyHoursView } from './views/DailyHoursView';
import { ReviewsView } from './views/ReviewsView';
import { AssignmentsView } from './views/AssignmentsView';
import { AdminView } from './views/AdminView';

const MainDashboardContent: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('students');

  // Intelligent role-based redirect after authentication
  useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN') {
        setActiveTab('admin');
      } else if (user.role === 'MENTOR') {
        setActiveTab('students');
      } else if (user.role === 'STUDENT') {
        setActiveTab('daily-hours');
      }
    }
  }, [user?.role]);

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <div className="h-screen w-full bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex overflow-hidden font-sans antialiased">
      {/* High Density Left Dark Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <Header activeTab={activeTab} />

        <main className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto min-h-0 bg-slate-50/60 dark:bg-slate-950/60">
          {activeTab === 'students' && <StudentsView />}
          {activeTab === 'mentors' && <MentorsView />}
          {activeTab === 'cohorts' && <CohortsView />}
          {activeTab === 'daily-hours' && <DailyHoursView />}
          {activeTab === 'reviews' && <ReviewsView />}
          {activeTab === 'assignments' && <AssignmentsView />}
          {activeTab === 'admin' && <AdminView />}
        </main>

        <FooterStatusBar activeTab={activeTab} />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainDashboardContent />
    </AuthProvider>
  );
}

