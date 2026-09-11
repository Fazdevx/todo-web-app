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
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2" style={{ color: 'var(--on-surface)' }}>
            Mi Agenda <span className="font-extrabold" style={{ color: 'var(--primary)' }}>Galileo</span>
          </h1>
          <p className="text-xs sm:text-sm font-medium mt-1" style={{ color: 'var(--on-surface-variant)' }}>
            {pendingCount} pendientes · {doneCount} completadas
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-3" style={{ color: 'var(--on-surface-variant)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar tarea o docente..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none"
            style={{ 
              backgroundColor: 'var(--surface-variant)', 
              borderColor: 'var(--outline)',
              color: 'var(--on-surface)'
            }}
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
              filter === f ? '' : ''
            }`}
            style={filter === f ? { 
              background: 'var(--primary)',
              color: 'var(--on-primary)',
              boxShadow: `0 10px 25px -5px var(--primary)40`
            } : { 
              backgroundColor: 'var(--surface-variant)',
              color: 'var(--on-surface-variant)',
              borderColor: 'var(--outline)'
            }}
            onMouseEnter={(e) => {
              if (filter !== f) {
                e.target.style.color = 'var(--on-surface)';
              }
            }}
            onMouseLeave={(e) => {
              if (filter !== f) {
                e.target.style.color = 'var(--on-surface-variant)';
              }
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Category Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t no-scrollbar" style={{ borderColor: 'var(--outline-variant)' }}>
        <button
          onClick={() => setCategory(null)}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            category === null ? '' : ''
          }`}
          style={category === null ? { 
            backgroundColor: 'var(--surface-variant)',
            color: 'var(--on-surface)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          } : { 
            backgroundColor: 'var(--surface-variant)',
            color: 'var(--on-surface-variant)',
            borderColor: 'var(--outline)'
          }}
          onMouseEnter={(e) => {
            if (category !== null) {
              e.target.style.color = 'var(--on-surface)';
            }
          }}
          onMouseLeave={(e) => {
            if (category !== null) {
              e.target.style.color = 'var(--on-surface-variant)';
            }
          }}
        >
          <Tag className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} /> Todas las categorías
        </button>

        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              category === c ? '' : ''
            }`}
            style={category === c ? { 
              backgroundColor: 'var(--primary)20',
              color: 'var(--primary)',
              borderColor: 'var(--primary)40',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            } : { 
              backgroundColor: 'var(--surface-variant)',
              color: 'var(--on-surface-variant)',
              borderColor: 'var(--outline)'
            }}
            onMouseEnter={(e) => {
              if (category !== c) {
                e.target.style.color = 'var(--on-surface)';
              }
            }}
            onMouseLeave={(e) => {
              if (category !== c) {
                e.target.style.color = 'var(--on-surface-variant)';
              }
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Tasks Grid */}
      {loading ? (
        <div className="py-20 text-center" style={{ color: 'var(--on-surface-variant)' }}>Cargando tareas...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="glass-panel p-16 text-center rounded-3xl border">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border" style={{ 
            backgroundColor: 'var(--primary)10', 
            color: 'var(--primary)',
            borderColor: 'var(--primary)20'
          }}>
            <ClipboardCheck className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold" style={{ color: 'var(--on-surface)' }}>No hay tareas en esta vista</h3>
          <p className="text-xs mt-1 max-w-sm mx-auto" style={{ color: 'var(--on-surface-variant)' }}>
            Toca el botón + para crear tu primera tarea o cambia los filtros seleccionados
          </p>
          <button
            onClick={openNewTaskModal}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold shadow-lg transition-all"
            style={{ 
              background: 'var(--primary)',
              boxShadow: `0 10px 25px -5px var(--primary)40`
            }}
            onMouseEnter={(e) => {
              e.target.style.filter = 'brightness(1.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.filter = 'brightness(1)';
            }}
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
        className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-30 w-14 h-14 rounded-2xl text-white shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center group"
        style={{ 
          background: 'var(--primary)',
          boxShadow: `0 20px 40px -10px var(--primary)60`
        }}
        title="Nueva Tarea"
      >
        <Plus className="w-7 h-7 stroke-[3] group-hover:rotate-90 transition-transform" />
      </button>

    </div>
  );
}
