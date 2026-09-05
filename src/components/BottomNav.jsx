import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { ClipboardList, LayoutDashboard, Calendar, Settings } from 'lucide-react';

export function BottomNav() {
  const { isAdmin } = useAuth();
  const { activeTab, setActiveTab } = useTasks();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800/90 bg-slate-950/95 backdrop-blur-xl px-2 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-2xl">
      <div className="flex items-center justify-around">
        <button
          onClick={() => setActiveTab('agenda')}
          className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
            activeTab === 'agenda'
              ? 'text-orange-500 bg-orange-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ClipboardList className="w-5 h-5" />
          <span>Agenda</span>
        </button>

        {isAdmin && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
              activeTab === 'admin'
                ? 'text-orange-500 bg-orange-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Admin</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
            activeTab === 'calendar'
              ? 'text-orange-500 bg-orange-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span>Calendario</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
            activeTab === 'settings'
              ? 'text-orange-500 bg-orange-500/10'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span>Ajustes</span>
        </button>
      </div>
    </div>
  );
}
