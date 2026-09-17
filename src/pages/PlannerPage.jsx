import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import {
  buildDayPlan,
  addDays,
  dayAt,
  startOfDay,
  formatLongDate,
  formatTime,
  relativeDayLabel,
  PLANNER_SECTIONS,
  sectionTitle,
} from '../utils/planner';
import { loadPlannerNotes, savePlannerNotes, createNote } from '../utils/plannerNotes';
import {
  Clock3,
  CalendarDays,
  CalendarClock,
  Target,
  ListChecks,
  Lightbulb,
  Plus,
  Circle,
  CheckCircle2,
  Check,
  ArrowRight,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  StickyNote,
} from 'lucide-react';

const PRIORITIES = [
  { label: 'Baja', color: '#64748b', bg: 'rgba(100, 116, 139, 0.1)' },
  { label: 'Media', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)' },
  { label: 'Alta', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
  { label: 'Urgente', color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.12)' },
];

function priorityInfo(level) {
  return PRIORITIES[level] || PRIORITIES[1];
}

// Panel de tiza con una hoja de apuntes dentro, igual que cada bloque de la
// hoja impresa (FECHA, 3 PRIORIDADES, METAS, HORARIO, IDEAS).
const SHEET_TONE_BY_SECTION = {
  fecha: 'paper-progress',
  prioridades: 'paper-pending',
  metas: 'paper-done',
  horario: 'paper-pending',
  ideas: 'paper-overdue',
};

function PlannerSection({ id, icon: Icon, count, action, children }) {
  const title = sectionTitle(id);
  const hint = (PLANNER_SECTIONS.find((s) => s.id === id) || {}).hint;
  const sheetTone = SHEET_TONE_BY_SECTION[id] || 'paper-pending';

  return (
    <section className="chalk-panel">
      <header className="chalk-panel-header flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {Icon && <Icon className="w-5 h-5 shrink-0" style={{ color: 'var(--primary)' }} />}
          <div className="min-w-0">
            <h2 className="chalk-text text-[19px] leading-tight truncate" style={{ color: 'var(--on-surface)' }}>
              {title}
            </h2>
            {hint && (
              <p className="chalk-text text-[14px] truncate" style={{ color: 'var(--on-surface-variant)' }}>
                {hint}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {typeof count === 'number' && count > 0 && (
            <span
              className="chalk-pill chalk-text px-2.5 py-0.5 text-[15px]"
              style={{ color: 'var(--primary)' }}
            >
              {count}
            </span>
          )}
          {action}
        </div>
      </header>

      <div className="p-2.5 sm:p-3">
        <div className={`notebook-plain ${sheetTone} px-4 sm:px-5 py-3.5 pl-9 sm:pl-10`}>
          {children}
        </div>
      </div>
    </section>
  );
}

function AddButton({ onClick, title }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title || 'Agregar'}
      className="chalk-pill p-1.5 transition-all"
      style={{ color: 'var(--primary)' }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--on-primary)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.07)'; e.currentTarget.style.color = 'var(--primary)'; }}
    >
      <Plus className="w-4 h-4" />
    </button>
  );
}

// Renglon vacio de la hoja (las lineas en blanco del documento escaneado).
function BlankLine({ text, onClick, actionLabel }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-left border-b border-dashed transition-colors"
      style={{ borderColor: 'var(--outline)', color: 'var(--on-surface-variant)' }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-variant)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
    >
      <span className="text-[11px] font-medium italic truncate">{text}</span>
      {actionLabel && <span className="text-[10px] font-bold shrink-0" style={{ color: 'var(--primary)' }}>{actionLabel}</span>}
    </button>
  );
}

// Una tarea dentro de cualquier seccion (prioridades, metas, horario).
function TaskLine({ task, rank, showTime, dense, now, onToggle, onEdit }) {
  const isOverdue = task.dueAt && task.dueAt < now && !task.done;
  const info = priorityInfo(task.priority);

  return (
    <div
      className="group flex items-start gap-2.5 px-2.5 py-2 rounded-xl border-b border-dashed transition-colors"
      style={{ borderColor: 'var(--outline)' }}
    >
      <button
        type="button"
        onClick={() => onToggle(task)}
        className="mt-0.5 shrink-0"
        title={task.done ? 'Marcar como pendiente' : 'Marcar como cumplida'}
      >
        {task.done
          ? <CheckCircle2 className="w-4 h-4" style={{ color: '#3f9d76' }} />
          : <Circle className="w-4 h-4" style={{ color: 'var(--on-surface-variant)' }} />}
      </button>

      {rank ? (
        <span
          className="mt-0.5 w-5 h-5 shrink-0 rounded-full text-[10px] font-black flex items-center justify-center border"
          style={{ borderColor: 'var(--outline)', backgroundColor: 'var(--surface-variant)', color: 'var(--primary)' }}
        >
          {rank}
        </span>
      ) : null}

      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onEdit(task)}>
        <p
          className={`text-xs sm:text-sm font-semibold break-words ${task.done ? 'line-through' : ''}`}
          style={{ color: task.done ? 'var(--on-surface-variant)' : 'var(--on-surface)' }}
        >
          {task.title}
        </p>
        <div className="flex flex-wrap items-center gap-1.5 mt-1">
          {showTime && task.dueAt && (
            <span className="text-[10px] font-bold" style={{ color: 'var(--on-surface-variant)' }}>
              {formatTime(task.dueAt)}
            </span>
          )}
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ color: info.color, backgroundColor: info.bg }}>
            {info.label}
          </span>
          {!dense && task.category && (
            <span
              className="text-[10px] font-medium px-1.5 py-0.5 rounded-md"
              style={{ color: 'var(--on-surface-variant)', backgroundColor: 'var(--surface-variant)' }}
            >
              {task.category}
            </span>
          )}
          {isOverdue && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold" style={{ color: '#b7465f' }}>
              <AlertCircle className="w-3 h-3" /> Vencida
            </span>
          )}
          {task.personal && (
            <span className="text-[10px] font-bold" style={{ color: 'var(--primary)' }}>Personal</span>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onEdit(task)}
        className="p-1 rounded-lg opacity-60 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0"
        style={{ color: 'var(--on-surface-variant)' }}
        title="Ver o editar tarea"
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pantalla "Planificador": la hoja escaneada trasladada al frontend.
// Las secciones no cambian la base de datos: se derivan de las tareas que ya
// existen (dueAt, priority, done, personal, ...).
// ---------------------------------------------------------------------------
export function PlannerPage() {
  const { user } = useAuth();
  const {
    tasks,
    loading,
    toggleTaskDone,
    openEditTaskModal,
    openNewTaskModal,
    addTask,
    setActiveTab,
    setFilter,
  } = useTasks();

  const [planDate, setPlanDate] = useState(() => startOfDay(Date.now()));
  const [now, setNow] = useState(() => Date.now());
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState('');
  const [busyNoteId, setBusyNoteId] = useState(null);
  const [error, setError] = useState('');

  // Reloj minimo para marcar la fila de la hora actual en el horario.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);

  // Las notas del bloque IDEAS viven solo en este dispositivo (localStorage).
  useEffect(() => {
    setNotes(loadPlannerNotes(user?.id, planDate));
  }, [user?.id, planDate]);

  // Clasificacion de las tareas en las 5 secciones de la hoja.
  const plan = useMemo(() => buildDayPlan(tasks, planDate), [tasks, planDate]);

  const isToday = planDate === startOfDay(now);
  const relative = relativeDayLabel(planDate, now);

  const persistNotes = (next) => {
    setNotes(next);
    savePlannerNotes(user?.id, planDate, next);
  };

  const handleAddNote = () => {
    const text = noteText.trim();
    if (!text) return;
    persistNotes([createNote(text), ...notes]);
    setNoteText('');
  };

  const handleRemoveNote = (noteId) => persistNotes(notes.filter((n) => n.id !== noteId));

  // Convierte una nota de la hoja en una tarea real usando los atributos de
  // siempre (sin tocar el esquema): sin fecha -> sigue en IDEAS;
  // programada hoy -> pasa a METAS y al HORARIO.
  const handlePromoteNote = async (note, scheduleToday) => {
    setBusyNoteId(note.id);
    setError('');
    try {
      await addTask({
        title: note.text,
        description: '',
        category: 'General',
        priority: 1,
        status: 'PENDIENTE',
        done: false,
        personal: false,
        subtasks: [],
        dueAt: scheduleToday ? dayAt(planDate, 12, 0) : null,
      });
      handleRemoveNote(note.id);
    } catch (e) {
      setError(`No se pudo convertir la nota en tarea: ${e.message}`);
    } finally {
      setBusyNoteId(null);
    }
  };

  const handleToggle = (task) => toggleTaskDone(task);
  const handleEdit = (task) => openEditTaskModal(task);

  // ---- FECHA: navegacion entre hojas diarias --------------------------------
  const goPrevDay = () => setPlanDate(addDays(planDate, -1));
  const goNextDay = () => setPlanDate(addDays(planDate, 1));
  const goToday = () => setPlanDate(startOfDay(Date.now()));

  const headerButtonClass = 'chalk-pill px-3 py-2 text-xs font-bold transition-all';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5 pb-24">
      {/* Encabezado: marca + navegacion de dias (bloque FECHA de la hoja) */}
      <div className="chalk-panel px-5 py-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="chalk-pill p-2.5" style={{ color: 'var(--primary)' }}>
            <CalendarClock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="chalk-title" style={{ color: 'var(--on-surface)', fontSize: '2rem' }}>
              Planificador <span style={{ color: 'var(--primary)' }}>Galileo</span>
            </h1>
            <p className="chalk-text text-[15px] mt-0.5" style={{ color: 'var(--on-surface-variant)' }}>
              La misma agenda, clasificada en las 5 secciones de la hoja diaria
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={goPrevDay}
            className={headerButtonClass}
            style={{ color: 'var(--on-surface-variant)' }}
            title="Día anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={goToday}
            className={`${headerButtonClass} inline-flex items-center gap-1.5`}
            style={isToday
              ? { backgroundColor: 'var(--primary)', color: 'var(--on-primary)', borderColor: 'transparent' }
              : { color: 'var(--on-surface-variant)' }}
          >
            <Check className="w-3.5 h-3.5" /> Hoy
          </button>
          <button
            type="button"
            onClick={goNextDay}
            className={headerButtonClass}
            style={{ color: 'var(--on-surface-variant)' }}
            title="Día siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => openNewTaskModal({ dueAt: dayAt(planDate, 12, 0) })}
            className="px-4 py-2 text-xs font-bold transition-all inline-flex items-center gap-1.5 hover:scale-105"
            style={{ background: 'var(--primary)', color: 'var(--on-primary)', borderRadius: '14px' }}
          >
            <Plus className="w-4 h-4" /> Nueva tarea
          </button>
        </div>
      </div>

      {/* Aviso: pendientes de dias anteriores (la hoja solo cubre un dia) */}
      {plan.overdue.length > 0 && (
        <button
          type="button"
          onClick={() => { setFilter('Vencidas'); setActiveTab('agenda'); }}
          className="chalk-panel w-full flex items-center gap-3 px-4 py-3 text-left transition-all hover:scale-[1.01]"
          style={{ borderColor: 'rgba(255, 170, 187, 0.45)' }}
        >
          <AlertCircle className="w-5 h-5 shrink-0" style={{ color: '#ffb3c4' }} />
          <span className="chalk-text text-[15px] flex-1" style={{ color: 'var(--on-surface)' }}>
            Tienes {plan.overdue.length} {plan.overdue.length === 1 ? 'tarea vencida' : 'tareas vencidas'} de días
            anteriores. Esta hoja solo muestra lo programado para la fecha elegida.
          </span>
          <span className="chalk-text text-[15px] shrink-0" style={{ color: '#ffb3c4' }}>Ver vencidas</span>
        </button>
      )}

      {error && (
        <div
          className="chalk-panel px-4 py-3 text-xs font-semibold"
          style={{ borderColor: 'rgba(255, 170, 187, 0.45)', color: '#ffb3c4' }}
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Columna izquierda de la hoja */}
        <div className="lg:col-span-2 space-y-5">
          {/* 1. FECHA */}
          <PlannerSection id="fecha" icon={CalendarDays}>
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="chalk-text text-[26px] leading-tight" style={{ color: 'var(--on-surface)' }}>
                    {formatLongDate(planDate)}
                  </p>
                  <p className="text-[11px] font-semibold mt-1" style={{ color: 'var(--on-surface-variant)' }}>
                    {relative || 'Día seleccionado'} · {plan.stats.done} de {plan.stats.total} tareas cumplidas
                  </p>
                </div>
                {relative && (
                  <span
                    className="paper-tag text-[10px] font-black uppercase tracking-wider px-2.5 py-1 shrink-0"
                    style={{ backgroundColor: 'rgba(47, 53, 66, 0.08)', color: 'var(--on-surface)', borderColor: 'rgba(47, 53, 66, 0.16)' }}
                  >
                    {relative}
                  </span>
                )}
              </div>

              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface-variant)' }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${plan.stats.progress}%`, background: 'var(--primary)' }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { label: 'Programadas', value: plan.stats.total },
                  { label: 'Pendientes', value: plan.stats.pending },
                  { label: 'Cumplidas', value: plan.stats.done },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="paper-tag py-2"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.55)', borderColor: 'rgba(47, 53, 66, 0.14)' }}
                  >
                    <p className="chalk-text text-[20px] leading-none" style={{ color: 'var(--on-surface)' }}>{item.value}</p>
                    <p className="text-[10px] font-semibold" style={{ color: 'var(--on-surface-variant)' }}>{item.label}</p>
                  </div>
                ))}
              </div>

              {loading && (
                <p className="text-[10px] font-medium text-center" style={{ color: 'var(--on-surface-variant)' }}>
                  Sincronizando tareas con Appwrite...
                </p>
              )}
            </div>
          </PlannerSection>

          {/* 2. 3 PRIORIDADES */}
          <PlannerSection
            id="prioridades"
            icon={Target}
            count={plan.prioritySlots.filter((s) => s.task).length}
            action={
              <AddButton
                title="Anotar una prioridad del día"
                onClick={() => openNewTaskModal({ dueAt: dayAt(planDate, 8, 0), priority: 3 })}
              />
            }
          >
            <div className="space-y-1">
              {plan.prioritySlots.map((slot) => (
                slot.task ? (
                  <TaskLine
                    key={slot.task.id}
                    task={slot.task}
                    rank={slot.slot}
                    showTime
                    now={now}
                    onToggle={handleToggle}
                    onEdit={handleEdit}
                  />
                ) : (
                  <BlankLine
                    key={`libre-${slot.slot}`}
                    text={`Renglón ${slot.slot} libre`}
                    actionLabel="+ Anotar"
                    onClick={() => openNewTaskModal({ dueAt: dayAt(planDate, 8, 0), priority: 3 })}
                  />
                )
              ))}
            </div>
            <p className="text-[10px] font-medium mt-3 px-1 leading-relaxed" style={{ color: 'var(--on-surface-variant)' }}>
              Se llenan solos con las 3 tareas de mayor prioridad (Alta / Urgente) programadas para esta fecha.
            </p>
          </PlannerSection>

          {/* 3. METAS DEL DIA */}
          <PlannerSection
            id="metas"
            icon={ListChecks}
            count={plan.goals.length}
            action={
              <AddButton
                title="Anotar una meta del día"
                onClick={() => openNewTaskModal({ dueAt: dayAt(planDate, 12, 0) })}
              />
            }
          >
            {plan.goals.length === 0 ? (
              <div className="space-y-1">
                {[0, 1, 2].map((i) => (
                  <BlankLine
                    key={`meta-libre-${i}`}
                    text="Meta pendiente de anotar"
                    actionLabel="+ Anotar"
                    onClick={() => openNewTaskModal({ dueAt: dayAt(planDate, 12, 0) })}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {plan.goals.map((task) => (
                  <TaskLine
                    key={task.id}
                    task={task}
                    showTime
                    now={now}
                    onToggle={handleToggle}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            )}
            <p className="text-[10px] font-medium mt-3 px-1 leading-relaxed" style={{ color: 'var(--on-surface-variant)' }}>
              Todo lo programado para esta fecha que no entró en los 3 renglones de prioridades.
            </p>
          </PlannerSection>
        </div>

        {/* Columna derecha de la hoja */}
        <div className="lg:col-span-3 space-y-5">
          {/* 4. HORARIO */}
          <PlannerSection id="horario" icon={Clock3} count={plan.dayTasks.length}>
            <div className="space-y-0.5">
              {plan.schedule.map((row) => {
                const isCurrentHour = isToday && new Date(now).getHours() === row.hour;
                return (
                  <div
                    key={row.hour}
                    className="flex items-stretch gap-2 rounded-xl px-1.5"
                    style={isCurrentHour ? { backgroundColor: 'rgba(255, 235, 156, 0.6)' } : undefined}
                  >
                    <div className="w-14 shrink-0 pt-2.5">
                      <span
                        className="text-[11px] font-extrabold"
                        style={{ color: isCurrentHour ? 'var(--primary)' : 'var(--on-surface-variant)' }}
                      >
                        {row.label}
                      </span>
                    </div>
                    <div
                      className="flex-1 min-w-0 border-b border-dashed py-1"
                      style={{ borderColor: isCurrentHour ? 'var(--primary)' : 'var(--outline)' }}
                    >
                      {row.tasks.length === 0 ? (
                        <button
                          type="button"
                          onClick={() => openNewTaskModal({ dueAt: dayAt(planDate, row.hour, 0) })}
                          className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-semibold transition-all"
                          style={{ color: 'var(--on-surface-variant)' }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.backgroundColor = 'var(--surface-variant)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--on-surface-variant)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                          <Plus className="w-3 h-3" /> Agregar
                        </button>
                      ) : (
                        row.tasks.map((task) => (
                          <TaskLine
                            key={task.id}
                            task={task}
                            dense
                            now={now}
                            onToggle={handleToggle}
                            onEdit={handleEdit}
                          />
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {plan.offSchedule.length > 0 && (
              <div
                className="mt-3 p-2.5 rounded-xl border"
                style={{ borderColor: 'var(--outline)', backgroundColor: 'var(--surface-variant)' }}
              >
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--on-surface-variant)' }}>
                  Fuera del horario impreso (antes de 05:00 / después de 22:00)
                </p>
                {plan.offSchedule.map((task) => (
                  <TaskLine
                    key={task.id}
                    task={task}
                    dense
                    showTime
                    now={now}
                    onToggle={handleToggle}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            )}

            {plan.stats.total === 0 && (
              <p className="text-[10px] font-medium mt-3 px-1" style={{ color: 'var(--on-surface-variant)' }}>
                No hay tareas con fecha para este día. Usa "+ Agregar" en la hora que quieras ocupar.
              </p>
            )}
          </PlannerSection>

          {/* 5. IDEAS / PENDIENTES / PREOCUPACIONES */}
          <PlannerSection
            id="ideas"
            icon={Lightbulb}
            count={notes.length + plan.ideas.length}
            action={<AddButton title="Anotar una tarea sin fecha" onClick={() => openNewTaskModal()} />}
          >
            {/* Renglon para escribir una idea suelta (queda en este dispositivo) */}
            <div className="flex items-center gap-2 mb-3">
              <input
                type="text"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddNote();
                  }
                }}
                placeholder="Escribe una idea, pendiente o preocupación..."
                className="chalk-text flex-1 min-w-0 px-1.5 py-1 text-[19px] bg-transparent border-b border-dashed focus:outline-none"
                style={{ borderColor: 'var(--outline)', color: 'var(--on-surface)' }}
              />
              <button
                type="button"
                onClick={handleAddNote}
                className="p-2 shrink-0 transition-transform hover:scale-105"
                style={{ background: 'var(--primary)', color: 'var(--on-primary)', borderRadius: '12px' }}
                title="Anotar en la hoja"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {notes.length > 0 && (
              <div className="space-y-1 mb-3">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="flex items-start gap-2 px-2.5 py-2 rounded-xl border-b border-dashed"
                    style={{ borderColor: 'var(--outline)' }}
                  >
                    <StickyNote className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: 'var(--primary)' }} />
                    <span className="flex-1 min-w-0 text-xs font-medium break-words" style={{ color: 'var(--on-surface)' }}>
                      {note.text}
                    </span>
                    <button
                      type="button"
                      disabled={busyNoteId === note.id}
                      onClick={() => handlePromoteNote(note, false)}
                      className="p-1 rounded-lg shrink-0 disabled:opacity-40"
                      style={{ color: 'var(--primary)' }}
                      title="Convertir en tarea (queda sin fecha)"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={busyNoteId === note.id}
                      onClick={() => handlePromoteNote(note, true)}
                      className="p-1 rounded-lg shrink-0 disabled:opacity-40"
                      style={{ color: 'var(--primary)' }}
                      title="Convertir en tarea de este día (12:00)"
                    >
                      <CalendarDays className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveNote(note.id)}
                      className="p-1 rounded-lg shrink-0"
                      style={{ color: 'var(--on-surface-variant)' }}
                      title="Borrar nota"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--on-surface-variant)' }}>
              Tareas todavía sin fecha ({plan.ideas.length})
            </p>
            {plan.ideas.length === 0 ? (
              <div className="space-y-1">
                {[0, 1, 2].map((i) => (
                  <BlankLine
                    key={`idea-libre-${i}`}
                    text="Sin pendientes sueltos"
                    actionLabel="+ Tarea sin fecha"
                    onClick={() => openNewTaskModal()}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {plan.ideas.map((task) => (
                  <TaskLine
                    key={task.id}
                    task={task}
                    dense
                    now={now}
                    onToggle={handleToggle}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            )}

            <p className="text-[10px] font-medium mt-3 px-1 leading-relaxed" style={{ color: 'var(--on-surface-variant)' }}>
              Las notas se guardan solo en este dispositivo. Al convertirlas en tarea aparecen en la Agenda,
              en Metas y en el Horario (con la flecha de calendario se programan para este día a las 12:00).
            </p>
          </PlannerSection>
        </div>
      </div>
    </div>
  );
}