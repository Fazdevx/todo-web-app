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

  // Extract unique team member names
  const teamMembers = useMemo(() => {
    const membersMap = new Map();
    tasks.forEach((t) => {
      const name = t.assignedToName || t.createdBy || 'Sin asignar';
      membersMap.set(name, (membersMap.get(name) || 0) + 1);
    });
    return Array.from(membersMap.entries()).map(([name, count]) => ({ name, count }));
  }, [tasks]);

  // Compute team statistics
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.done).length;
    const pending = tasks.filter((t) => !t.done).length;
    const overdue = tasks.filter((t) => t.dueAt && t.dueAt < Date.now() && !t.done).length;
    return { total, completed, pending, overdue };
  }, [tasks]);

  // Filter tasks by selected user, search query, and status filter
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Galileo Admin Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-950 via-orange-950/30 to-slate-950 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
          <ShieldCheck className="w-64 h-64 text-orange-500" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs font-bold uppercase tracking-wider mb-3">
              <ShieldCheck className="w-4 h-4 text-orange-400" /> Galileo Admin Panel
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Supervisión Institucional de Tareas
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Monitorea las asignaciones docentes y administrativas, filtra las tareas por miembro del equipo y gestiona la productividad.
            </p>
          </div>

          <button
            onClick={openNewTaskModal}
            className="px-5 py-3 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-sm shadow-xl shadow-orange-600/30 transition-all self-start md:self-auto"
          >
            + Asignar Nueva Tarea
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Tareas</p>
            <h3 className="text-2xl font-extrabold text-white tracking-tight">{stats.total}</h3>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pendientes</p>
            <h3 className="text-2xl font-extrabold text-blue-400 tracking-tight">{stats.pending}</h3>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completadas</p>
            <h3 className="text-2xl font-extrabold text-emerald-400 tracking-tight">{stats.completed}</h3>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Vencidas</p>
            <h3 className="text-2xl font-extrabold text-rose-400 tracking-tight">{stats.overdue}</h3>
          </div>
        </div>

      </div>

      {/* Team Filter & Search Toolbar */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        
        {/* Search & Status Filters */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar tareas o docentes..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500"
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
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  statusFilter === f.id
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

        </div>

        {/* Team Members Filter Pills */}
        <div className="pt-3 border-t border-slate-800/80">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Filtrar por Miembro del Equipo ({teamMembers.length})
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedUser('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                selectedUser === 'ALL'
                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              👥 Todos ({tasks.length})
            </button>

            {teamMembers.map((m) => (
              <button
                key={m.name}
                onClick={() => setSelectedUser(m.name)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                  selectedUser === m.name
                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>👤 {m.name}</span>
                <span className="px-1.5 py-0.2 bg-slate-800 rounded-full text-[10px]">{m.count}</span>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Task List Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-tight">
            Tareas Asignadas ({filteredTasks.length})
          </h2>
          {selectedUser !== 'ALL' && (
            <span className="text-xs text-orange-400 font-bold bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
              Viendo tareas de: {selectedUser}
            </span>
          )}
        </div>

        {filteredTasks.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-3xl border border-slate-800">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 text-slate-600 flex items-center justify-center mx-auto mb-3">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-300">No se encontraron tareas</h3>
            <p className="text-xs text-slate-500 mt-1">Prueba cambiando el filtro de usuario o la búsqueda</p>
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
