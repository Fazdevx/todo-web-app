import React, { useMemo } from 'react';
import { useTasks } from '../context/TaskContext';
import { TaskCard } from '../components/TaskCard';
import {
  Search,
  Plus,
  ClipboardCheck,
  Tag,
  ListTodo,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

const FILTERS = ['Todas', 'Pendientes', 'Hechas', 'Próximas', 'Vencidas'];
const CATEGORIES = ['General', 'Academia', 'Docencia', 'Administración', 'Trabajo', 'Personal'];

/**
 * Columna de la pizarra: marco dibujado con tiza que agrupa una pila
 * de hojas de apuntes (las tarjetas de tarea).
 */
function BoardColumn({ icon: Icon, title, hint, tone, count, emptyText, children }) {
  const hasTasks = React.Children.count(children) > 0;
  const accent = tone || 'var(--primary)';

  return (
    <section className="chalk-panel">
      <header className="chalk-panel-header flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <Icon className="w-5 h-5 shrink-0" style={{ color: accent }} />
          <div className="min-w-0">
            <h2 className="chalk-title truncate" style={{ color: 'var(--on-surface)', fontSize: '1.7rem' }}>
              {title}
            </h2>
            {hint && (
              <p className="chalk-text text-[15px] truncate" style={{ color: 'var(--on-surface-variant)' }}>
                {hint}
              </p>
            )}
          </div>
        </div>
        <span className="chalk-pill chalk-text px-3 py-0.5 shrink-0" style={{ color: accent, fontSize: '1.1rem' }}>
          {count}
        </span>
      </header>

      <div className="p-3 sm:p-4">
        {hasTasks ? (
          <div className="paper-stack flex flex-col gap-4">{children}</div>
        ) : (
          <p className="chalk-text text-center py-7" style={{ color: 'var(--on-surface-variant)', fontSize: '1.15rem' }}>
            {emptyText || 'Sin tareas'}
          </p>
        )}
      </div>
    </section>
  );
}

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

  // Vista general separada: pendientes / hechas en una zona y vencidas en otra
  const groups = useMemo(() => {
    const now = Date.now();
    const pending = [];
    const done = [];
    const overdue = [];

    filteredTasks.forEach((t) => {
      if (t.done) done.push(t);
      else if (t.dueAt && t.dueAt < now) overdue.push(t);
      else pending.push(t);
    });

    const byDueDate = (a, b) => (a.dueAt || Infinity) - (b.dueAt || Infinity);

    return {
      pending: pending.sort(byDueDate),
      overdue: overdue.sort(byDueDate),
      done: done.sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0)),
    };
  }, [filteredTasks]);

  const pendingCount = tasks.filter((t) => !t.done).length;
  const doneCount = tasks.length - pendingCount;
  const overdueCount = tasks.filter((t) => t.dueAt && t.dueAt < Date.now() && !t.done).length;

  const showPending = filter === 'Todas' || filter === 'Pendientes' || filter === 'Próximas';
  const showDone = filter === 'Todas' || filter === 'Hechas';
  const showOverdue =
    filter === 'Todas' ||
    filter === 'Vencidas' ||
    (filter === 'Pendientes' && groups.overdue.length > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-24">

      {/* Encabezado escrito con tiza */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1
            className="chalk-title flex items-center gap-2"
            style={{ color: 'var(--on-surface)', fontSize: '2.3rem' }}
          >
            Mi Agenda <span style={{ color: 'var(--primary)' }}>Galileo</span>
          </h1>
          <p className="chalk-text text-[16px] mt-1" style={{ color: 'var(--on-surface-variant)' }}>
            {pendingCount} pendientes · {doneCount} completadas · {overdueCount} vencidas
          </p>
        </div>

        {/* Buscador */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-3" style={{ color: 'var(--on-surface-variant)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar tarea o docente..."
            className="chalk-pill w-full pl-10 pr-4 py-2.5 text-sm focus:outline-none"
            style={{ color: 'var(--on-surface)' }}
          />
        </div>
      </div>

      {/* Filtros de estado, estilo tiza */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              filter === f ? '' : 'chalk-pill'
            }`}
            style={filter === f ? {
              background: 'var(--primary)',
              color: 'var(--on-primary)',
              boxShadow: '0 10px 25px -14px rgba(0, 0, 0, 0.85)'
            } : {
              color: 'var(--on-surface-variant)'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Categorías, estilo tiza */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
        <button
          onClick={() => setCategory(null)}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            category === null ? '' : 'chalk-pill'
          }`}
          style={category === null ? {
            backgroundColor: 'var(--primary)',
            color: 'var(--on-primary)'
          } : {
            color: 'var(--on-surface-variant)'
          }}
        >
          <Tag className="w-3.5 h-3.5" /> Todas las categorías
        </button>

        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              category === c ? '' : 'chalk-pill'
            }`}
            style={category === c ? {
              backgroundColor: 'var(--primary)',
              color: 'var(--on-primary)'
            } : {
              color: 'var(--on-surface-variant)'
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Vista general: pendientes y hechas a la izquierda, vencidas a la derecha */}
      {loading ? (
        <div className="chalk-text text-center py-20" style={{ color: 'var(--on-surface-variant)', fontSize: '1.4rem' }}>
          Cargando tareas...
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="chalk-panel px-6 py-14 text-center">
          <div className="w-16 h-16 chalk-pill flex items-center justify-center mx-auto mb-4" style={{ color: 'var(--primary)' }}>
            <ClipboardCheck className="w-8 h-8" />
          </div>
          <h3 className="chalk-title" style={{ color: 'var(--on-surface)', fontSize: '1.9rem' }}>
            No hay tareas en esta vista
          </h3>
          <p className="chalk-text text-[16px] mt-1 max-w-sm mx-auto" style={{ color: 'var(--on-surface-variant)' }}>
            Toca el botón + para crear tu primera tarea o cambia los filtros seleccionados
          </p>
          <button
            onClick={openNewTaskModal}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold transition-all hover:scale-105"
            style={{ background: 'var(--primary)', color: 'var(--on-primary)', borderRadius: '14px' }}
          >
            <Plus className="w-4 h-4" /> Crear Tarea
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

          {/* Zona izquierda: pendientes + hechas */}
          <div className="order-2 lg:order-1 lg:col-span-2 space-y-5">
            {showPending && (
              <BoardColumn
                icon={ListTodo}
                title="Pendientes"
                hint="Por hacer y tareas próximas"
                count={groups.pending.length}
                emptyText="Sin pendientes anotados"
              >
                {groups.pending.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </BoardColumn>
            )}

            {showDone && (
              <BoardColumn
                icon={CheckCircle2}
                title="Hechas"
                hint="Tareas ya completadas"
                tone="#9ce5be"
                count={groups.done.length}
                emptyText="Todavía no marcaste tareas como hechas"
              >
                {groups.done.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </BoardColumn>
            )}
          </div>

          {/* Zona derecha: vencidas */}
          {showOverdue && (
            <div className="order-1 lg:order-2 lg:sticky lg:top-24">
              <BoardColumn
                icon={AlertTriangle}
                title="Vencidas"
                hint="Se pasó la fecha límite"
                tone="#ffb3c4"
                count={groups.overdue.length}
                emptyText="¡Bien! Nada vencido por aquí"
              >
                {groups.overdue.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </BoardColumn>
            </div>
          )}

        </div>
      )}

      {/* Botón flotante para crear tarea */}
      <button
        onClick={openNewTaskModal}
        className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-30 w-14 h-14 rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center group"
        style={{
          background: 'var(--primary)',
          color: 'var(--on-primary)',
          boxShadow: '0 20px 40px -14px rgba(0, 0, 0, 0.85)'
        }}
        title="Nueva Tarea"
      >
        <Plus className="w-7 h-7 stroke-[3] group-hover:rotate-90 transition-transform" />
      </button>

    </div>
  );
}
