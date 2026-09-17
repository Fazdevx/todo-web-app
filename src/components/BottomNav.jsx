import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { ClipboardList, CalendarClock, LayoutDashboard, Calendar, Settings } from 'lucide-react';

export function BottomNav() {
  const { isAdmin } = useAuth();
  const { activeTab, setActiveTab } = useTasks();

  // Las mismas secciones que la barra superior. "Planificador" agrega las 5
  // secciones de la hoja diaria escaneada (FECHA, 3 PRIORIDADES, METAS,
  // HORARIO e IDEAS / PENDIENTES / PREOCUPACIONES).
  const tabs = [
    { id: 'agenda', label: 'Agenda', icon: ClipboardList },
    { id: 'planner', label: 'Planificador', icon: CalendarClock },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin', icon: LayoutDashboard }] : []),
    { id: 'calendar', label: 'Calendario', icon: Calendar },
    { id: 'settings', label: 'Ajustes', icon: Settings },
  ];

  return (
    <div className="board-bottombar md:hidden fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-xl px-1.5 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-2xl" style={{
      borderColor: 'rgba(238, 244, 240, 0.32)'
    }}>
      <div className="flex items-center justify-between gap-0.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              title={tab.label}
              className="flex-1 min-w-0 flex flex-col items-center gap-1 px-1 py-1.5 rounded-xl text-[10px] sm:text-[11px] font-bold transition-all"
              style={isActive ? {
                color: 'var(--primary)',
                backgroundColor: 'var(--primary)10'
              } : {
                color: 'var(--on-surface-variant)'
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.color = 'var(--on-surface)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.color = 'var(--on-surface-variant)';
              }}
            >
              <Icon className="w-5 h-5" />
              <span className="truncate max-w-full">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}