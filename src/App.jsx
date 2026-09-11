import React from 'react';
import { useAuth } from './context/AuthContext';
import { TaskProvider, useTasks } from './context/TaskContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { TaskModal } from './components/TaskModal';
import { AuthPage } from './pages/AuthPage';
import { AgendaPage } from './pages/AgendaPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { CalendarPage } from './pages/CalendarPage';
import { SettingsPage } from './pages/SettingsPage';

function MainContent() {
  const { user, loading } = useAuth();
  const { activeTab } = useTasks();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-bold text-sm" style={{ backgroundColor: 'var(--bg)', color: 'var(--primary)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }}></div>
          <span>Cargando Agenda Galileo...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen text-slate-100 font-sans pb-24 md:pb-12 relative" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="flower-pattern"></div>
      <div className="flower-decoration flower-decoration-1"></div>
      <div className="flower-decoration flower-decoration-2"></div>
      
      <Navbar />

      <main className="animate-in fade-in duration-200 relative z-10">
        {activeTab === 'agenda' && <AgendaPage />}
        {activeTab === 'admin' && <AdminDashboard />}
        {activeTab === 'calendar' && <CalendarPage />}
        {activeTab === 'settings' && <SettingsPage />}
      </main>

      <TaskModal />
      <BottomNav />
    </div>
  );
}

export function App() {
  return (
    <TaskProvider>
      <MainContent />
    </TaskProvider>
  );
}

export default App;
