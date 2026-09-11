import React, { useState, useMemo } from 'react';
import { useTasks } from '../context/TaskContext';
import { TaskCard } from '../components/TaskCard';
import {
  ShieldCheck,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Layers
} from 'lucide-react';

export function AdminDashboard() {
  const { tasks, openNewTaskModal } = useTasks();
  const [selectedUser, setSelectedUser] = useState('ALL');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const teamMembers = useMemo(() => {
    const membersMap = new Map();
    tasks.forEach((t) => {
      const name = t.assignedToName || t.createdBy || 'Sin asignar';
      membersMap.set(name, (membersMap.get(name) || 0) + 1);
    });
    return Array.from(membersMap.entries()).map(([name, count]) => ({ name, count }));
  }, [tasks]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.done).length;
    const pending = tasks.filter((t) => !t.done).length;
    const overdue = tasks.filter((t) => t.dueAt && t.dueAt < Date.now() && !t.done).length;
    return { total, completed, pending, overdue };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const userName = t.assignedToName || t.createdBy || 'Sin asignar';
      const matchesUser = selectedUser === 'ALL' || userName === selectedUser;

      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        userName.toLowerCase().includes(q) ||
        (t.category && t.category.toLowerCase().includes(q));

      const isOverdue = t.dueAt && t.dueAt < Date.now() && !t.done;
      let matchesStatus = true;
      if (statusFilter === 'PENDING') matchesStatus = !t.done;
      if (statusFilter === 'COMPLETED') matchesStatus = t.done;
      if (statusFilter === 'OVERDUE') matchesStatus = isOverdue;

      return matchesUser && matchesSearch && matchesStatus;
    });
  }, [tasks, selectedUser, search, statusFilter]);

  const headerGradient = {
    background: 'linear-gradient(135deg, var(--surface), var(--primary)08, var(--surface))'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Galileo Admin Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border relative overflow-hidden" style={{ borderColor: 'var(--outline)', ...headerGradient }}>
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none" style={{ color: 'var(--primary)' }}>
          <ShieldCheck className="w-64 h-64" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider mb-3" style={{ 
              backgroundColor: 'var(--primary)10', 
              color: 'var(--primary)',
              borderColor: 'var(--primary)20'
            }}>
              <ShieldCheck className="w-4 h-4" style={{ color: 'var(--primary)' }} /> Galileo Admin Panel
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--on-surface)' }}>
              Supervisión Institucional de Tareas
            </h1>
            <p className="text-sm mt-1 max-w-2xl" style={{ color: 'var(--on-surface-variant)' }}>
              Monitorea las asignaciones docentes y administrativas, filtra las tareas por miembro del equipo y gestiona la productividad.
            </p>
          </div>

          <button
            onClick={openNewTaskModal}
            className="px-5 py-3 rounded-2xl text-white font-extrabold text-sm shadow-xl transition-all self-start md:self-auto"
            style={{ 
              background: 'var(--primary)',
              boxShadow: '0 10px 25px -5px var(--primary)40'
            }}
            onMouseEnter={(e) => { e.target.style.filter = 'brightness(1.1)'; }}
            onMouseLeave={(e) => { e.target.style.filter = 'brightness(1)'; }}
          >
            + Asignar Nueva Tarea
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="glass-card p-5 rounded-2xl border flex items-center gap-4" style={{ borderColor: 'var(--outline-variant)' }}>
          <div className="p-3.5 rounded-xl border" style={{ 
            backgroundColor: 'var(--primary)10', 
            color: 'var(--primary)',
            borderColor: 'var(--primary)20'
          }}>
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--on-surface-variant)' }}>Total Tareas</p>
            <h3 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--on-surface)' }}>{stats.total}</h3>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border flex items-center gap-4" style={{ borderColor: 'var(--outline-variant)' }}>
          <div className="p-3.5 rounded-xl border" style={{ 
            backgroundColor: 'var(--primary)10', 
            color: 'var(--primary)',
            borderColor: 'var(--primary)20'
          }}>
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--on-surface-variant)' }}>Pendientes</p>
            <h3 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--on-surface)' }}>{stats.pending}</h3>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border flex items-center gap-4" style={{ borderColor: 'var(--outline-variant)' }}>
          <div className="p-3.5 rounded-xl border" style={{ 
            backgroundColor: 'var(--primary)10', 
            color: 'var(--primary)',
            borderColor: 'var(--primary)20'
          }}>
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--on-surface-variant)' }}>Completadas</p>
            <h3 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--on-surface)' }}>{stats.completed}</h3>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border flex items-center gap-4" style={{ borderColor: 'var(--outline-variant)' }}>
          <div className="p-3.5 rounded-xl border" style={{ 
            backgroundColor: 'var(--primary)10', 
            color: 'var(--primary)',
            borderColor: 'var(--primary)20'
          }}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--on-surface-variant)' }}>Vencidas</p>
            <h3 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--on-surface)' }}>{stats.overdue}</h3>
          </div>
        </div>

      </div>

      {/* Team Filter & Search Toolbar */}
      <div className="glass-panel p-5 rounded-2xl border space-y-4" style={{ borderColor: 'var(--outline)' }}>

        {/* Search & Status Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3" style={{ color: 'var(--on-surface-variant)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar tareas o docentes..."
              className="w-full pl-10 pr-4 py-2 rounded-xl text-sm focus:outline-none transition-all"
              style={{ 
                backgroundColor: 'var(--surface-variant)',
                borderColor: 'var(--outline)',
                color: 'var(--on-surface)',
                borderWidth: '1px',
                borderStyle: 'solid'
              }}
            />
          </div>

          {/* Status Quick Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {[
              { id: 'ALL', label: 'Todas' },
              { id: 'PENDING', label: 'Pendientes' },
              { id: 'COMPLETED', label: 'Completadas' },
              { id: 'OVERDUE', label: 'Vencidas' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all"
                style={statusFilter === f.id ? { 
                  backgroundColor: 'var(--primary)',
                  color: 'var(--on-primary)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                } : { 
                  backgroundColor: 'var(--surface-variant)',
                  color: 'var(--on-surface-variant)',
                  borderColor: 'var(--outline)',
                  borderWidth: '1px',
                  borderStyle: 'solid'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

        </div>

        {/* Team Members Filter Pills */}
        <div className="pt-3 border-t" style={{ borderColor: 'var(--outline-variant)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4" style={{ color: 'var(--primary)' }} />
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--on-surface-variant)' }}>
              Filtrar por Miembro del Equipo ({teamMembers.length})
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedUser('ALL')}
              className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all"
              style={selectedUser === 'ALL' ? { 
                backgroundColor: 'var(--primary)20',
                color: 'var(--primary)',
                borderColor: 'var(--primary)40',
                borderWidth: '1px',
                borderStyle: 'solid',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              } : { 
                backgroundColor: 'var(--surface-variant)',
                color: 'var(--on-surface-variant)',
                borderColor: 'var(--outline)',
                borderWidth: '1px',
                borderStyle: 'solid'
              }}
            >
              👥 Todos ({tasks.length})
            </button>

            {teamMembers.map((m) => (
              <button
                key={m.name}
                onClick={() => setSelectedUser(m.name)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5"
                style={selectedUser === m.name ? { 
                  backgroundColor: 'var(--primary)20',
                  color: 'var(--primary)',
                  borderColor: 'var(--primary)40',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                } : { 
                  backgroundColor: 'var(--surface-variant)',
                  color: 'var(--on-surface-variant)',
                  borderColor: 'var(--outline)',
                  borderWidth: '1px',
                  borderStyle: 'solid'
                }}
              >
                <span>👤 {m.name}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px]" style={{ backgroundColor: 'var(--surface)', color: 'var(--on-surface-variant)' }}>{m.count}</span>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Task List Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight" style={{ color: 'var(--on-surface)' }}>
            Tareas Asignadas ({filteredTasks.length})
          </h2>
          {selectedUser !== 'ALL' && (
            <span className="text-xs font-bold px-3 py-1 rounded-full border" style={{ 
              color: 'var(--primary)',
              backgroundColor: 'var(--primary)10',
              borderColor: 'var(--primary)20'
            }}>
              Viendo tareas de: {selectedUser}
            </span>
          )}
        </div>

        {filteredTasks.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-3xl border" style={{ borderColor: 'var(--outline)' }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ 
              backgroundColor: 'var(--surface-variant)',
              color: 'var(--on-surface-variant)'
            }}>
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold" style={{ color: 'var(--on-surface)' }}>No se encontraron tareas</h3>
            <p className="text-xs mt-1" style={{ color: 'var(--on-surface-variant)' }}>Prueba cambiando el filtro de usuario o la búsqueda</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}