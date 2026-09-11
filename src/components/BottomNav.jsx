import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { ClipboardList, LayoutDashboard, Calendar, Settings } from 'lucide-react';

export function BottomNav() {
  const { isAdmin } = useAuth();
  const { activeTab, setActiveTab } = useTasks();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-xl px-2 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-2xl" style={{ 
      borderColor: 'var(--outline-variant)',
      backgroundColor: 'var(--surface)' 
    }}>
      <div className="flex items-center justify-around">
        <button
          onClick={() => setActiveTab('agenda')}
          className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
            activeTab === 'agenda' ? '' : ''
          }`}
          style={activeTab === 'agenda' ? { 
            color: 'var(--primary)',
            backgroundColor: 'var(--primary)10'
          } : { 
            color: 'var(--on-surface-variant)'
          }}
          onMouseEnter={(e) => {
            if (activeTab !== 'agenda') {
              e.target.style.color = 'var(--on-surface)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'agenda') {
              e.target.style.color = 'var(--on-surface-variant)';
            }
          }}
        >
          <ClipboardList className="w-5 h-5" />
          <span>Agenda</span>
        </button>

        {isAdmin && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
              activeTab === 'admin' ? '' : ''
            }`}
            style={activeTab === 'admin' ? { 
              color: 'var(--primary)',
              backgroundColor: 'var(--primary)10'
            } : { 
              color: 'var(--on-surface-variant)'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== 'admin') {
                e.target.style.color = 'var(--on-surface)';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== 'admin') {
                e.target.style.color = 'var(--on-surface-variant)';
              }
            }}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Admin</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
            activeTab === 'calendar' ? '' : ''
          }`}
          style={activeTab === 'calendar' ? { 
            color: 'var(--primary)',
            backgroundColor: 'var(--primary)10'
          } : { 
            color: 'var(--on-surface-variant)'
          }}
          onMouseEnter={(e) => {
            if (activeTab !== 'calendar') {
              e.target.style.color = 'var(--on-surface)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'calendar') {
              e.target.style.color = 'var(--on-surface-variant)';
            }
          }}
        >
          <Calendar className="w-5 h-5" />
          <span>Calendario</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
            activeTab === 'settings' ? '' : ''
          }`}
          style={activeTab === 'settings' ? { 
            color: 'var(--primary)',
            backgroundColor: 'var(--primary)10'
          } : { 
            color: 'var(--on-surface-variant)'
          }}
          onMouseEnter={(e) => {
            if (activeTab !== 'settings') {
              e.target.style.color = 'var(--on-surface)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'settings') {
              e.target.style.color = 'var(--on-surface-variant)';
            }
          }}
        >
          <Settings className="w-5 h-5" />
          <span>Ajustes</span>
        </button>
      </div>
    </div>
  );
}
