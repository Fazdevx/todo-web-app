// ---------------------------------------------------------------------------
// Notas del bloque "IDEAS / PENDIENTES / PREOCUPACIONES" de la hoja impresa.
// ---------------------------------------------------------------------------
// El documento escaneado tiene renglones en blanco para anotar ideas sueltas que
// todavia no son tareas. Se guardan en localStorage (una hoja por dia y por
// usuario) para NO agregar atributos ni collections nuevas en Appwrite.
// Cuando una nota madura se puede convertir en tarea con un clic y desaparece
// de la hoja (ver PlannerPage).

import { dayKey } from './planner';

const STORAGE_PREFIX = 'galileo-planner-notes';
const MAX_NOTE_LENGTH = 200;

function storageKey(userId, dayTs) {
  return `${STORAGE_PREFIX}:${userId || 'anon'}:${dayKey(dayTs)}`;
}

export function loadPlannerNotes(userId, dayTs) {
  try {
    const raw = window.localStorage.getItem(storageKey(userId, dayTs));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((n) => n && typeof n.text === 'string')
      .map((n) => ({
        id: String(n.id || Date.now() + Math.random()),
        text: n.text.slice(0, MAX_NOTE_LENGTH),
        createdAt: Number(n.createdAt) || Date.now(),
      }));
  } catch {
    return [];
  }
}

export function savePlannerNotes(userId, dayTs, notes) {
  try {
    window.localStorage.setItem(storageKey(userId, dayTs), JSON.stringify(notes));
  } catch {
    // localStorage lleno o bloqueado: la hoja sigue funcionando sin persistir.
  }
}

export function createNote(text) {
  return {
    id: `${Date.now()}-${Math.round(Math.random() * 1e6)}`,
    text: String(text).trim().slice(0, MAX_NOTE_LENGTH),
    createdAt: Date.now(),
  };
}

export { MAX_NOTE_LENGTH };