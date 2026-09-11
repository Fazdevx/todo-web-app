import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import {
  ClipboardList,
  ShieldCheck,
  Calendar,
  Settings,
  LogOut,
  User,
  LayoutDashboard
} from 'lucide-react';

export function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { activeTab, setActiveTab } = useTasks();

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b backdrop-blur-xl" style={{ borderColor: 'var(--outline-variant)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Brand Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-xl sm:text-2xl tracking-tight leading-none" style={{ color: 'var(--on-surface)' }}>
                  Galileo<span style={{ color: 'var(--primary)' }}>Agenda</span>
                </h1>
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border" style={{ 
                    backgroundColor: 'var(--primary)20', 
                    color: 'var(--primary)',
                    borderColor: 'var(--primary)40'
                  }}>
                    <ShieldCheck className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} /> Admin
                  </span>
                )}
              </div>
              <span className="text-[10px] font-semibold tracking-wide hidden sm:block mt-1" style={{ color: 'var(--on-surface-variant)' }}>
                Colegio y Academia
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 p-1.5 rounded-2xl border" style={{ 
            backgroundColor: 'var(--surface-variant)', 
            borderColor: 'var(--outline)' 
          }}>
            <button
              onClick={() => setActiveTab('agenda')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'agenda'
                  ? 'text-white shadow-lg'
                  : ''
              }`}
              style={activeTab === 'agenda' ? { 
                background: 'var(--primary)',
                boxShadow: `0 10px 25px -5px var(--primary)40`
              } : { 
                color: 'var(--on-surface-variant)',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'agenda') {
                  e.target.style.backgroundColor = 'var(--surface-variant)';
                  e.target.style.color = 'var(--on-surface)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'agenda') {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = 'var(--on-surface-variant)';
                }
              }}
            >
              <ClipboardList className="w-4 h-4" />
              Agenda
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'admin'
                    ? 'text-white shadow-lg'
                    : ''
                }`}
                style={activeTab === 'admin' ? { 
                  background: 'var(--primary)',
                  boxShadow: `0 10px 25px -5px var(--primary)40`
                } : { 
                  color: 'var(--on-surface-variant)',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'admin') {
                    e.target.style.backgroundColor = 'var(--surface-variant)';
                    e.target.style.color = 'var(--on-surface)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'admin') {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = 'var(--on-surface-variant)';
                  }
                }}
              >
                <LayoutDashboard className="w-4 h-4" />
                Panel Admin
              </button>
            )}

            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'calendar'
                  ? 'text-white shadow-lg'
                  : ''
              }`}
              style={activeTab === 'calendar' ? { 
                background: 'var(--primary)',
                boxShadow: `0 10px 25px -5px var(--primary)40`
              } : { 
                color: 'var(--on-surface-variant)',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'calendar') {
                  e.target.style.backgroundColor = 'var(--surface-variant)';
                  e.target.style.color = 'var(--on-surface)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'calendar') {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = 'var(--on-surface-variant)';
                }
              }}
            >
              <Calendar className="w-4 h-4" />
              Calendario
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'settings'
                  ? 'text-white shadow-lg'
                  : ''
              }`}
              style={activeTab === 'settings' ? { 
                background: 'var(--primary)',
                boxShadow: `0 10px 25px -5px var(--primary)40`
              } : { 
                color: 'var(--on-surface-variant)',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== 'settings') {
                  e.target.style.backgroundColor = 'var(--surface-variant)';
                  e.target.style.color = 'var(--on-surface)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== 'settings') {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = 'var(--on-surface-variant)';
                }
              }}
            >
              <Settings className="w-4 h-4" />
              Ajustes
            </button>
          </nav>

          {/* Right User Profile & Logout */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border" style={{ 
              backgroundColor: 'var(--surface-variant)', 
              borderColor: 'var(--outline)' 
            }}>
              <div className="w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center" style={{ 
                backgroundColor: 'var(--primary)20', 
                color: 'var(--primary)' 
              }}>
                {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
              </div>
              <span className="text-sm font-semibold hidden sm:inline max-w-[130px] truncate" style={{ color: 'var(--on-surface)' }}>
                {user?.name}
              </span>
            </div>

            <button
              onClick={logout}
              title="Cerrar Sesión"
              className="p-2 rounded-xl transition-all"
              style={{ color: 'var(--on-surface-variant)' }}
              onMouseEnter={(e) => {
                e.target.style.color = '#f43f5e';
                e.target.style.backgroundColor = 'rgba(244, 63, 94, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = 'var(--on-surface-variant)';
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
