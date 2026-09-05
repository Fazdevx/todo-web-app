import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
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
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-orange-500 font-bold text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Cargando Agenda Galileo...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-100 font-sans pb-24 md:pb-12">
      <Navbar />

      <main className="animate-in fade-in duration-200">
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
    <AuthProvider>
      <TaskProvider>
        <MainContent />
      </TaskProvider>
    </AuthProvider>
  );
}

export default App;
