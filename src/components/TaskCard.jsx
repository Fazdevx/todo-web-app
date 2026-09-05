import React from 'react';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { AdminBadge } from './AdminBadge';
import {
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  CheckSquare,
  Pencil,
  Trash2,
  AlertCircle
} from 'lucide-react';

const PRIORITIES = [
  { level: 0, label: 'Baja', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
  { level: 1, label: 'Media', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { level: 2, label: 'Alta', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { level: 3, label: 'Urgente', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
];

export function TaskCard({ task }) {
  const { toggleTaskDone, openEditTaskModal, removeTask } = useTasks();
  const { isAdmin } = useAuth();

  const isOverdue = task.dueAt && task.dueAt < Date.now() && !task.done;
  const status = task.done
    ? 'COMPLETADA'
    : isOverdue
    ? 'VENCIDA'
    : task.status || 'PENDIENTE';

  const statusColor = {
    COMPLETADA: 'border-l-emerald-500 bg-emerald-500/5',
    VENCIDA: 'border-l-rose-500 bg-rose-500/5',
    EN_PROGRESO: 'border-l-blue-500 bg-blue-500/5',
    PENDIENTE: 'border-l-slate-500 bg-slate-500/5',
  }[status];

  const statusBadge = {
    COMPLETADA: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    VENCIDA: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    EN_PROGRESO: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    PENDIENTE: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  }[status];

  const priorityInfo = PRIORITIES[task.priority] || PRIORITIES[1];

  const formatDate = (ts) => {
    if (!ts) return null;
    const d = new Date(ts);
    return d.toLocaleDateString('es', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const formatRelative = (ts) => {
    if (!ts) return null;
    const diff = ts - Date.now();
    const abs = Math.abs(diff);
    const min = 60_000, hour = 60 * min, day = 24 * hour;
    const sign = diff < 0 ? 'hace ' : 'en ';
    if (abs < hour) return `${sign}${Math.round(abs / min)} min`;
    if (abs < day) return `${sign}${Math.round(abs / hour)} h`;
    if (abs < 7 * day) return `${sign}${Math.round(abs / day)} d`;
    return formatDate(ts);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`¿Eliminar la tarea "${task.title}"?`)) {
      removeTask(task.id);
    }
  };

  return (
    <div
      onClick={() => openEditTaskModal(task)}
      className={`group relative glass-card rounded-2xl border-l-4 ${statusColor} p-4 transition-all hover:scale-[1.01] hover:shadow-xl hover:shadow-indigo-500/5 cursor-pointer`}
    >
      <div className="flex items-start justify-between gap-3">
        
        {/* Left Checkbox & Info */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleTaskDone(task);
            }}
            className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors focus:outline-none"
          >
            {task.done ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400 fill-emerald-500/20" />
            ) : (
              <Circle className="w-6 h-6 hover:stroke-emerald-400" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <h3
              className={`font-semibold text-base tracking-tight leading-snug text-slate-100 ${
                task.done ? 'line-through text-slate-400' : ''
              }`}
            >
              {task.title}
            </h3>

            {task.description && (
              <p className="text-xs text-slate-400 line-clamp-2 mt-1 font-normal">
                {task.description}
              </p>
            )}

            {/* Badges & Metadata */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              
              {/* Assigned User Badge (Shown in Admin or if assigned) */}
              {(isAdmin || task.assignedToName) && (
                <AdminBadge
                  assignedToName={task.assignedToName}
                  createdBy={task.createdBy}
                  isAdmin={isAdmin}
                />
              )}

              {/* Status Badge */}
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusBadge}`}>
                {status}
              </span>

              {/* Priority Badge */}
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${priorityInfo.color}`}>
                {priorityInfo.label}
              </span>

              {/* Category Badge */}
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                {task.category || 'General'}
              </span>

              {/* Subtasks Count */}
              {task.subtasks && task.subtasks.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700">
                  <CheckSquare className="w-3 h-3 text-indigo-400" />
                  {task.subtasks.length} sub-puntos
                </span>
              )}
            </div>

            {/* Due Date Indicator */}
            {task.dueAt && (
              <div className={`flex items-center gap-1.5 mt-2.5 text-xs font-medium ${
                isOverdue ? 'text-rose-400' : 'text-slate-400'
              }`}>
                {isOverdue ? <AlertCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                <span>{formatRelative(task.dueAt)} ({formatDate(task.dueAt)})</span>
              </div>
            )}

          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openEditTaskModal(task);
            }}
            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all"
            title="Editar tarea"
          >
            <Pencil className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={handleDelete}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
            title="Eliminar tarea"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
