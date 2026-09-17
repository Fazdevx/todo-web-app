import React from 'react';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { getFileUrl } from '../services/appwrite';
import { AdminBadge } from './AdminBadge';
import {
  Square,
  SquareCheck,
  Clock,
  ListChecks,
  Pencil,
  Trash2,
  AlertCircle,
  Download,
  Image as ImageIcon,
  FileText,
} from 'lucide-react';

// Colores pastel tipo resaltador para las etiquetas de la hoja
const PRIORITIES = [
  { level: 0, label: 'Baja', color: '#6b7488', bgColor: 'rgba(107, 116, 136, 0.16)', borderColor: 'rgba(107, 116, 136, 0.30)' },
  { level: 1, label: 'Media', color: '#2f6fb5', bgColor: 'rgba(166, 214, 255, 0.45)', borderColor: 'rgba(92, 158, 214, 0.35)' },
  { level: 2, label: 'Alta', color: '#9a7412', bgColor: 'rgba(255, 226, 148, 0.55)', borderColor: 'rgba(217, 167, 44, 0.38)' },
  { level: 3, label: 'Urgente', color: '#b7465f', bgColor: 'rgba(255, 170, 187, 0.50)', borderColor: 'rgba(217, 100, 127, 0.38)' },
];

// Estado -> hoja de apuntes pastel
const STATUS_PAPER = {
  COMPLETADA: 'paper-done',
  VENCIDA: 'paper-overdue',
  EN_PROGRESO: 'paper-progress',
  PENDIENTE: 'paper-pending',
};

const STATUS_BADGE = {
  COMPLETADA: { color: '#2f7d5a', bgColor: 'rgba(150, 224, 186, 0.50)', borderColor: 'rgba(70, 169, 122, 0.35)' },
  VENCIDA: { color: '#b7465f', bgColor: 'rgba(255, 170, 187, 0.50)', borderColor: 'rgba(217, 100, 127, 0.38)' },
  EN_PROGRESO: { color: '#2f6fb5', bgColor: 'rgba(166, 214, 255, 0.50)', borderColor: 'rgba(92, 158, 214, 0.35)' },
  PENDIENTE: { color: '#9a7412', bgColor: 'rgba(255, 235, 156, 0.55)', borderColor: 'rgba(217, 167, 44, 0.38)' },
};

const STATUS_LABEL = {
  COMPLETADA: 'Completada',
  VENCIDA: 'Vencida',
  EN_PROGRESO: 'En progreso',
  PENDIENTE: 'Pendiente',
};

export function TaskCard({ task }) {
  const { toggleTaskDone, openEditTaskModal, removeTask } = useTasks();
  const { isAdmin } = useAuth();

  const isOverdue = task.dueAt && task.dueAt < Date.now() && !task.done;
  const rawStatus = String(task.status || 'PENDIENTE').toUpperCase();
  const status = task.done ? 'COMPLETADA' : isOverdue ? 'VENCIDA' : rawStatus;

  const paperClass = STATUS_PAPER[status] || STATUS_PAPER.PENDIENTE;
  const statusBadge = STATUS_BADGE[status] || STATUS_BADGE.PENDIENTE;
  const statusLabel = STATUS_LABEL[status] || status;
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

  const tagClass = 'paper-tag inline-flex items-center gap-1 px-2 py-0.5 text-[11px]';

  return (
    <div
      onClick={() => openEditTaskModal(task)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openEditTaskModal(task);
        }
      }}
      role="button"
      tabIndex={0}
      className={`group notebook-paper ${paperClass} p-4 pl-14 pr-3.5 cursor-pointer focus:outline-none`}
    >
      <div className="flex items-start justify-between gap-2">
        {/* Casilla de la hoja + apuntes */}
        <div className="flex items-start gap-2.5 flex-1 min-w-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleTaskDone(task);
            }}
            className="mt-0.5 shrink-0 transition-transform hover:scale-110"
            style={{ color: task.done ? '#3f9d76' : 'var(--on-surface-variant)' }}
            title={task.done ? 'Marcar como pendiente' : 'Marcar como completada'}
          >
            {task.done ? (
              <SquareCheck className="w-[22px] h-[22px]" style={{ color: '#3f9d76' }} />
            ) : (
              <Square className="w-[22px] h-[22px]" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <h3
              className={`chalk-text text-[22px] leading-tight break-words ${
                task.done ? 'line-through opacity-70' : ''
              }`}
              style={{ color: 'var(--on-surface)' }}
            >
              {task.title}
            </h3>

            {task.description && (
              <p className="text-[11.5px] leading-relaxed line-clamp-2 mt-0.5" style={{ color: 'var(--on-surface-variant)' }}>
                {task.description}
              </p>
            )}

            {/* Etiquetas tipo resaltador pastel */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
              {(isAdmin || task.assignedToName) && (
                <AdminBadge
                  assignedToName={task.assignedToName}
                  createdBy={task.createdBy}
                  isAdmin={isAdmin}
                />
              )}

              <span
                className={tagClass}
                style={{ color: statusBadge.color, backgroundColor: statusBadge.bgColor, borderColor: statusBadge.borderColor }}
              >
                {statusLabel}
              </span>

              <span
                className={tagClass}
                style={{ color: priorityInfo.color, backgroundColor: priorityInfo.bgColor, borderColor: priorityInfo.borderColor }}
              >
                {priorityInfo.label}
              </span>

              <span
                className={tagClass}
                style={{
                  color: 'var(--on-surface-variant)',
                  backgroundColor: 'rgba(47, 53, 66, 0.06)',
                  borderColor: 'rgba(47, 53, 66, 0.14)',
                }}
              >
                {task.category || 'General'}
              </span>

              {task.subtasks && task.subtasks.length > 0 && (
                <span
                  className={tagClass}
                  style={{
                    color: 'var(--on-surface-variant)',
                    backgroundColor: 'rgba(47, 53, 66, 0.06)',
                    borderColor: 'rgba(47, 53, 66, 0.14)',
                  }}
                >
                  <ListChecks className="w-3 h-3" style={{ color: 'var(--primary)' }} />
                  {task.subtasks.length} sub-puntos
                </span>
              )}
            </div>

            {/* Fecha límite anotada a mano */}
            {task.dueAt && (
              <div
                className="chalk-text flex items-center gap-1.5 mt-2 text-[17px]"
                style={{ color: isOverdue ? '#b7465f' : 'var(--on-surface-variant)' }}
              >
                {isOverdue ? <AlertCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                <span>
                  {formatRelative(task.dueAt)} · {formatDate(task.dueAt)}
                </span>
              </div>
            )}

            {/* Adjuntos */}
            {task.attachments && task.attachments.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {task.attachments.map((att) => (
                  <a
                    key={att.id}
                    href={att.url || getFileUrl(att.id)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="paper-tag inline-flex items-center gap-1 px-2 py-1 text-[10px] transition-transform hover:scale-105"
                    style={{
                      backgroundColor: 'rgba(47, 53, 66, 0.06)',
                      borderColor: 'rgba(47, 53, 66, 0.14)',
                      color: 'var(--primary)',
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
        {/* Acciones de la hoja */}
        <div className="flex items-center gap-0.5 opacity-70 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openEditTaskModal(task);
            }}
            className="p-1.5 rounded-lg transition-all"
            style={{ color: 'var(--on-surface-variant)', backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--primary)';
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--on-surface-variant)';
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
            }}
            title="Editar tarea"
          >
            <Pencil className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="p-1.5 rounded-lg transition-all"
            style={{ color: 'var(--on-surface-variant)', backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#b7465f';
              e.currentTarget.style.backgroundColor = 'rgba(255, 170, 187, 0.45)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--on-surface-variant)';
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
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
