import React from 'react';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { getFileUrl } from '../services/appwrite';
import { AdminBadge } from './AdminBadge';
import {
  CheckCircle2,
  Circle,
  Calendar,
  Clock,
  CheckSquare,
  Pencil,
  Trash2,
  AlertCircle,
  Paperclip,
  Download,
  Image as ImageIcon,
  FileText,
} from 'lucide-react';

const PRIORITIES = [
  { level: 0, label: 'Baja', color: '#64748b', bgColor: 'rgba(100, 116, 139, 0.1)' },
  { level: 1, label: 'Media', color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)' },
  { level: 2, label: 'Alta', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.1)' },
  { level: 3, label: 'Urgente', color: '#f43f5e', bgColor: 'rgba(244, 63, 94, 0.1)' },
];

export function TaskCard({ task }) {
  const { toggleTaskDone, openEditTaskModal, removeTask } = useTasks();
  const { isAdmin } = useAuth();

  const isOverdue = task.dueAt && task.dueAt < Date.now() && !task.done;
  const rawStatus = String(task.status || 'PENDIENTE').toUpperCase();
  const status = task.done
    ? 'COMPLETADA'
    : isOverdue
    ? 'VENCIDA'
    : rawStatus;

  const statusColorStyleMap = {
    COMPLETADA: { borderLeftColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.05)' },
    VENCIDA: { borderLeftColor: '#f43f5e', backgroundColor: 'rgba(244, 63, 94, 0.05)' },
    EN_PROGRESO: { borderLeftColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.05)' },
    PENDIENTE: { borderLeftColor: 'var(--primary)', backgroundColor: 'transparent' },
  };
  const statusColorStyle = statusColorStyleMap[status] || statusColorStyleMap.PENDIENTE;

  const statusBadgeMap = {
    COMPLETADA: { color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)' },
    VENCIDA: { color: '#f43f5e', bgColor: 'rgba(244, 63, 94, 0.1)', borderColor: 'rgba(244, 63, 94, 0.2)' },
    EN_PROGRESO: { color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.2)' },
    PENDIENTE: { color: 'var(--on-surface-variant)', bgColor: 'var(--surface-variant)', borderColor: 'var(--outline)' },
  };
  const statusBadge = statusBadgeMap[status] || statusBadgeMap.PENDIENTE;

  const statusLabelMap = {
    COMPLETADA: 'Completada',
    VENCIDA: 'Vencida',
    EN_PROGRESO: 'En progreso',
    PENDIENTE: 'Pendiente',
  };
  const statusLabel = statusLabelMap[status] || status;

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
      className="group relative glass-card rounded-2xl border-l-4 p-4 transition-all hover:scale-[1.01] cursor-pointer"
      style={{ 
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        ...statusColorStyle
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 10px 25px -5px var(--primary)30`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
      }}
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
            className="mt-0.5 transition-colors focus:outline-none"
            style={{ color: 'var(--on-surface-variant)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = task.done ? '#10b981' : 'var(--primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--on-surface-variant)';
            }}
          >
            {task.done ? (
              <CheckCircle2 className="w-6 h-6" style={{ color: '#10b981', fill: 'rgba(16, 185, 129, 0.2)' }} />
            ) : (
              <Circle className="w-6 h-6" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <h3
              className={`font-semibold text-base tracking-tight leading-snug ${
                task.done ? 'line-through' : ''
              }`}
              style={{ color: task.done ? 'var(--on-surface-variant)' : 'var(--on-surface)' }}
            >
              {task.title}
            </h3>

            {task.description && (
              <p className="text-xs line-clamp-2 mt-1 font-normal" style={{ color: 'var(--on-surface-variant)' }}>
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
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border" style={{ 
                color: statusBadge.color,
                backgroundColor: statusBadge.bgColor,
                borderColor: statusBadge.borderColor
              }}>
                {statusLabel}
              </span>

              {/* Priority Badge */}
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border" style={{ 
                color: priorityInfo.color,
                backgroundColor: priorityInfo.bgColor,
                borderColor: `${priorityInfo.color}40`
              }}>
                {priorityInfo.label}
              </span>

              {/* Category Badge */}
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border" style={{ 
                backgroundColor: 'var(--surface-variant)',
                color: 'var(--on-surface-variant)',
                borderColor: 'var(--outline)'
              }}>
                {task.category || 'General'}
              </span>

              {/* Subtasks Count */}
              {task.subtasks && task.subtasks.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border" style={{ 
                  backgroundColor: 'var(--surface-variant)',
                  color: 'var(--on-surface-variant)',
                  borderColor: 'var(--outline)'
                }}>
                  <CheckSquare className="w-3 h-3" style={{ color: 'var(--primary)' }} />
                  {task.subtasks.length} sub-puntos
                </span>
              )}
            </div>

            {/* Due Date Indicator */}
            {task.dueAt && (
              <div className={`flex items-center gap-1.5 mt-2.5 text-xs font-medium`}
                style={{ color: isOverdue ? '#f43f5e' : 'var(--on-surface-variant)' }}
              >
                {isOverdue ? <AlertCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                <span>{formatRelative(task.dueAt)} ({formatDate(task.dueAt)})</span>
              </div>
            )}

            {/* Attachments */}
            {task.attachments && task.attachments.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {task.attachments.map((att) => (
                  <a
                    key={att.id}
                    href={att.url || getFileUrl(att.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium border transition-all hover:scale-105"
                    style={{ 
                      backgroundColor: 'var(--surface-variant)',
                      borderColor: 'var(--outline)',
                      color: 'var(--primary)'
                    }}
                    onClick={(e) => e.stopPropagation()}
                    title={att.name}
                  >
                    {att.mimeType?.startsWith('image/') ? <ImageIcon className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                    <span className="max-w-[80px] truncate">{att.name}</span>
                    <Download className="w-2.5 h-2.5" />
                  </a>
                ))}
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
            className="p-1.5 rounded-lg transition-all"
            style={{ color: 'var(--on-surface-variant)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--primary)';
              e.currentTarget.style.backgroundColor = 'var(--primary)10';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--on-surface-variant)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title="Editar tarea"
          >
            <Pencil className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={handleDelete}
            className="p-1.5 rounded-lg transition-all"
            style={{ color: 'var(--on-surface-variant)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#f43f5e';
              e.currentTarget.style.backgroundColor = 'rgba(244, 63, 94, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--on-surface-variant)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            title="Eliminar tarea"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
