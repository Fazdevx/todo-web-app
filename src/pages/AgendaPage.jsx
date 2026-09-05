import React, { useMemo } from 'react';
import { useTasks } from '../context/TaskContext';
import { TaskCard } from '../components/TaskCard';
import { Search, Plus, ClipboardCheck, Tag } from 'lucide-react';

const FILTERS = ['Todas', 'Pendientes', 'Hechas', 'Próximas', 'Vencidas'];
const CATEGORIES = ['General', 'Academia', 'Docencia', 'Administración', 'Trabajo', 'Personal'];

export function AgendaPage() {
  const {
    tasks,
    filter,
    setFilter,
    category,
    setCategory,
    searchQuery,
    setSearchQuery,
    openNewTaskModal,
    loading
  } = useTasks();

  const filteredTasks = useMemo(() => {
    const now = Date.now();
    const sevenDays = now + 7 * 24 * 60 * 60 * 1000;

    return tasks.filter((t) => {
      const isOverdue = t.dueAt && t.dueAt < now && !t.done;
      const byCategory = !category || t.category === category;

      let byFilter = true;
      if (filter === 'Pendientes') byFilter = !t.done;
      else if (filter === 'Hechas') byFilter = t.done;
      else if (filter === 'Próximas') byFilter = t.dueAt && t.dueAt >= now && t.dueAt <= sevenDays && !t.done;
      else if (filter === 'Vencidas') byFilter = isOverdue;

      const q = searchQuery.toLowerCase();
      const bySearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        (t.assignedToName && t.assignedToName.toLowerCase().includes(q));

      return byCategory && byFilter && bySearch;
    });
  }, [tasks, filter, category, searchQuery]);

  const pendingCount = tasks.filter((t) => !t.done).length;
  const doneCount = tasks.length - pendingCount;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-24">
      
      {/* Header Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Mi Agenda <span className="text-orange-500 font-extrabold">Galileo</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
            {pendingCount} pendientes · {doneCount} completadas
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar tarea o docente..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {/* Filter Bar (Status) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filter === f
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Category Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-slate-800/60 no-scrollbar">
        <button
          onClick={() => setCategory(null)}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            category === null
              ? 'bg-slate-700 text-white shadow-md'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Tag className="w-3.5 h-3.5 text-orange-400" /> Todas las categorías
        </button>

        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              category === c
                ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 shadow-md'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Tasks Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-500">Cargando tareas...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="glass-panel p-16 text-center rounded-3xl border border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center mx-auto mb-4 border border-orange-500/20">
            <ClipboardCheck className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-200">No hay tareas en esta vista</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Toca el botón + para crear tu primera tarea o cambia los filtros seleccionados
          </p>
          <button
            onClick={openNewTaskModal}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold shadow-lg shadow-orange-600/30 transition-all"
          >
            <Plus className="w-4 h-4" /> Crear Tarea
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <button
        onClick={openNewTaskModal}
        className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-30 w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-600 to-orange-500 text-white shadow-2xl shadow-orange-500/50 hover:scale-105 active:scale-95 transition-all flex items-center justify-center group"
        title="Nueva Tarea"
      >
        <Plus className="w-7 h-7 stroke-[3] group-hover:rotate-90 transition-transform" />
      </button>

    </div>
  );
}
