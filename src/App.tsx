import React, { useState, useEffect } from 'react';
import { PortalProvider, usePortal } from './context/PortalContext';
import { LoginView } from './components/auth/LoginView';
import { AppShell } from './components/layout/AppShell';
import { StudentDashboard } from './components/student/StudentDashboard';
import { FacultyDashboard } from './components/faculty/FacultyDashboard';
import { HODDashboard } from './components/hod/HODDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';

const MainApp: React.FC = () => {
  const { currentUser } = usePortal();
  const [currentTab, setCurrentTab] = useState<string>('overview');

  // Adjust default tab based on user role when logging in
  useEffect(() => {
    if (!currentUser) return;
    switch (currentUser.role) {
      case 'student':
        setCurrentTab('overview');
        break;
      case 'faculty':
        setCurrentTab('attendance');
        break;
      case 'hod':
        setCurrentTab('overview');
        break;
      case 'admin':
        setCurrentTab('overview');
        break;
    }
  }, [currentUser?.role]);

  if (!currentUser) {
    return <LoginView />;
  }

  return (
    <AppShell currentTab={currentTab} onSelectTab={setCurrentTab}>
      {currentUser.role === 'student' && (
        <StudentDashboard activeTab={currentTab} onTabChange={setCurrentTab} />
      )}
      {currentUser.role === 'faculty' && (
        <FacultyDashboard activeTab={currentTab} onTabChange={setCurrentTab} />
      )}
      {currentUser.role === 'hod' && (
        <HODDashboard activeTab={currentTab} onTabChange={setCurrentTab} />
      )}
      {currentUser.role === 'admin' && (
        <AdminDashboard activeTab={currentTab} onTabChange={setCurrentTab} />
      )}
    </AppShell>
  );
};

export default function App() {
  return (
    <PortalProvider>
      <MainApp />
    </PortalProvider>
  );
}
