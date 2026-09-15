// ---------------------------------------------------------------------------
// Planificador Galileo - secciones derivadas de la hoja impresa
// ---------------------------------------------------------------------------
// La hoja escaneada ("Documento escaneado 13.pdf") organiza el dia en cinco
// bloques:
//
//   1. FECHA
//   2. 3 PRIORIDADES
//   3. METAS DEL DIA
//   4. ?CUAL ES TU HORARIO HOY?   (05:00 -> 22:00)
//   5. IDEAS / PENDIENTES / PREOCUPACIONES
//
// La clasificacion es 100% de frontend y NO toca la base de datos: se reutiliza
// el esquema que ya existe en Appwrite (dueAt, priority, done/status, personal,
// subtasks, ...) para decidir en que bloque cae cada tarea:
//
//   * dueAt del dia seleccionado        -> entra al plan de ese dia
//   * mayor priority (0..3)             -> ocupa los 3 cupos de "3 PRIORIDADES"
//   * dueAt con hora (05:00 - 22:00)    -> se ubica en esa fila del horario
//   * sin dueAt (sin fecha)             -> "IDEAS / PENDIENTES / PREOCUPACIONES"
//
// No se agregan atributos ni collections nuevas.

// Filas impresas en la hoja: 05:00, 06:00, ... , 22:00
export const DAY_START_HOUR = 5;
export const DAY_END_HOUR = 22;

export const HOUR_SLOTS = Array.from(
  { length: DAY_END_HOUR - DAY_START_HOUR + 1 },
  (_, i) => DAY_START_HOUR + i
);

// La hoja tiene exactamente 3 renglones en "3 PRIORIDADES".
export const PRIORITY_SLOT_COUNT = 3;

// Titulos tomados literalmente del documento escaneado.
export const PLANNER_SECTIONS = [
  { id: 'fecha', title: 'FECHA', hint: 'El día que estás planificando' },
  { id: 'prioridades', title: '3 PRIORIDADES', hint: 'Las 3 tareas más importantes del día' },
  { id: 'metas', title: 'METAS DEL DÍA', hint: 'El resto de tareas programadas para el día' },
  { id: 'horario', title: '¿CUÁL ES TU HORARIO HOY?', hint: 'Tus tareas ubicadas en su hora' },
  { id: 'ideas', title: 'IDEAS / PENDIENTES / PREOCUPACIONES', hint: 'Sin fecha todavía: anótalas aquí' },
];

export function sectionTitle(id) {
  return (PLANNER_SECTIONS.find((s) => s.id === id) || {}).title || '';
}

// ------------------------------- Fechas ------------------------------------

export function startOfDay(ts = Date.now()) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function isSameDay(a, b) {
  if (!a || !b) return false;
  return startOfDay(a) === startOfDay(b);
}

// Timestamp de `hour:minute` dentro del dia indicado (hora local).
export function dayAt(dayTs, hour, minute = 0) {
  const d = new Date(dayTs);
  d.setHours(hour, minute, 0, 0);
  return d.getTime();
}

export function addDays(dayTs, amount) {
  const d = new Date(dayTs);
  d.setDate(d.getDate() + amount);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function hourLabel(hour) {
  return `${String(hour).padStart(2, '0')}:00`;
}

// 'YYYY-MM-DD' (mismo formato que el input date del modal de tareas).
export function dateToInputValue(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// 'HH:mm' (mismo formato que el input time del modal de tareas).
export function timeToInputValue(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function dayKey(ts = Date.now()) {
  return dateToInputValue(startOfDay(ts));
}

export function formatLongDate(ts) {
  const text = new Date(ts).toLocaleDateString('es', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatShortDate(ts) {
  return new Date(ts).toLocaleDateString('es', { day: '2-digit', month: 'short' });
}

export function formatTime(ts) {
  return new Date(ts).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
}

// 'Hoy' / 'Mañana' / 'Ayer' o null si la fecha esta mas lejos.

// --------------------------- Clasificacion ---------------------------------

const PRIORITY_WEIGHT = { 0: 0, 1: 1, 2: 2, 3: 3 };

function priorityOf(task) {
  const value = task?.priority;
  return PRIORITY_WEIGHT[value] ?? 1;
}

// Las tareas del dia ordenadas por prioridad (mayor primero) y, a igual
// prioridad, por la hora mas temprana.
export function rankByPriority(tasks = []) {
  return [...tasks].sort(
    (a, b) => priorityOf(b) - priorityOf(a) || (a.dueAt || 0) - (b.dueAt || 0)
  );
}

/**
 * Reparte las tareas del usuario en las cinco secciones de la hoja impresa.
 * Solo lee atributos que ya existen (dueAt, priority, done, createdAt).
 *
 * @param {Array} tasks  tareas ya mapeadas por `docToTask`
 * @param {number} dayTs dia a planificar (cualquier timestamp dentro del dia)
 */
export function buildDayPlan(tasks = [], dayTs = Date.now()) {
  const day = startOfDay(dayTs);

  // Tareas con fecha dentro del dia elegido.
  const dayTasks = tasks
    .filter((t) => t.dueAt && isSameDay(t.dueAt, day))
    .sort((a, b) => (a.dueAt || 0) - (b.dueAt || 0));

  const pendingDayTasks = dayTasks.filter((t) => !t.done);
  const doneDayTasks = dayTasks.filter((t) => t.done);

  // 3 PRIORIDADES: los 3 cupos de mayor prioridad del dia.
  const rankedPending = rankByPriority(pendingDayTasks);
  const priorityTasks = rankedPending.slice(0, PRIORITY_SLOT_COUNT);
  const priorityIds = new Set(priorityTasks.map((t) => t.id));

  const prioritySlots = Array.from({ length: PRIORITY_SLOT_COUNT }, (_, i) => ({
    slot: i + 1,
    task: priorityTasks[i] || null,
  }));

  // METAS DEL DIA: el resto del dia (pendientes primero, cumplidas al final).
  const goals = [
    ...pendingDayTasks.filter((t) => !priorityIds.has(t.id)),
    ...doneDayTasks,
  ];

  // ?CUAL ES TU HORARIO HOY?: una fila por cada hora impresa en la hoja.
  const schedule = HOUR_SLOTS.map((hour) => ({ hour, label: hourLabel(hour), tasks: [] }));
  const offSchedule = [];
  for (const t of dayTasks) {
    const hour = new Date(t.dueAt).getHours();
    const row = schedule[hour - DAY_START_HOUR];
    if (row) row.tasks.push(t);
    else offSchedule.push(t); // antes de 05:00 o despues de 22:00
  }

  // IDEAS / PENDIENTES / PREOCUPACIONES: pendientes que aun no tienen fecha.
  const ideas = tasks
    .filter((t) => !t.dueAt && !t.done)
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  // Pendientes de dias anteriores (no entran al dia, solo se avisan).
  const overdue = tasks
    .filter((t) => t.dueAt && !t.done && startOfDay(t.dueAt) < day)
    .sort((a, b) => (a.dueAt || 0) - (b.dueAt || 0));

  return {
    date: day,
    dayTasks,
    pendingDayTasks,
    doneDayTasks,
    prioritySlots,
    goals,
    schedule,
    offSchedule,
    ideas,
    overdue,
    stats: {
      total: dayTasks.length,
      done: doneDayTasks.length,
      pending: pendingDayTasks.length,
      progress: dayTasks.length ? Math.round((doneDayTasks.length / dayTasks.length) * 100) : 0,
    },
  };
}
export function relativeDayLabel(ts, now = Date.now()) {
  const diff = Math.round((startOfDay(ts) - startOfDay(now)) / 86400000);
  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Mañana';
  if (diff === -1) return 'Ayer';
  return null;
}