import React, { useState, useEffect, useCallback } from 'react';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { X, Plus, Trash2, Calendar, Tag, Flag, User, CheckCircle2, Paperclip, Image as ImageIcon, FileText, Upload, XCircle, Download } from 'lucide-react';

const CATEGORIES = ['General', 'Academia', 'Docencia', 'Administración', 'Trabajo', 'Personal'];
const PRIORITIES = [
  { value: 0, label: 'Baja', color: 'border-slate-600 bg-slate-800 text-slate-300' },
  { value: 1, label: 'Media', color: 'border-blue-500/50 bg-blue-500/10 text-blue-400' },
  { value: 2, label: 'Alta', color: 'border-amber-500/50 bg-amber-500/10 text-amber-400' },
  { value: 3, label: 'Urgente', color: 'border-rose-500/50 bg-rose-500/10 text-rose-400' },
];

const MAX_FILE_SIZE = 50 * 1024 * 1024;

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(1) + ' MB';
}

function getFileIcon(mimeType) {
  if (mimeType?.startsWith('image/')) return <ImageIcon className="w-4 h-4" />;
  if (mimeType === 'application/pdf') return <FileText className="w-4 h-4" />;
  return <Paperclip className="w-4 h-4" />;
}

export function TaskModal() {
  const { isModalOpen, closeModal, editingTask, addTask, editTask, uploadTaskFile, removeTaskFile } = useTasks();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [priority, setPriority] = useState(1);
  const [status, setStatus] = useState('PENDIENTE');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [assignedToName, setAssignedToName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title || '');
      setDescription(editingTask.description || '');
      setCategory(editingTask.category || 'General');
      setPriority(editingTask.priority ?? 1);
      setStatus(editingTask.status || 'PENDIENTE');
      setSubtasks(editingTask.subtasks || []);
      setAssignedToName(editingTask.assignedToName || user?.name || '');
      setFiles(editingTask.attachments || []);

      if (editingTask.dueAt) {
        const d = new Date(editingTask.dueAt);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        setDueDate(`${yyyy}-${mm}-${dd}`);

        const hh = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');
        setDueTime(`${hh}:${min}`);
      } else {
        setDueDate('');
        setDueTime('');
      }
    } else {
      setTitle('');
      setDescription('');
      setCategory('General');
      setPriority(1);
      setStatus('PENDIENTE');
      setDueDate('');
      setDueTime('');
      setSubtasks([]);
      setAssignedToName(user?.name || '');
      setFiles([]);
    }
    setError('');
    setUploading(false);
    setUploadProgress({});
  }, [editingTask, isModalOpen, user]);

  if (!isModalOpen) return null;

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    setSubtasks([...subtasks, newSubtask.trim()]);
    setNewSubtask('');
  };

  const handleRemoveSubtask = (index) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleFileSelect = async (selectedFiles) => {
    const fileArray = Array.from(selectedFiles);
    for (const file of fileArray) {
      if (file.size > MAX_FILE_SIZE) {
        setError(`El archivo "${file.name}" excede 50MB`);
        continue;
      }
      const tempId = Date.now() + Math.random();
      setFiles((prev) => [...prev, { id: tempId, name: file.name, size: file.size, mimeType: file.type, file }]);
    }
  };

  const handleUploadFiles = async (taskId) => {
    const pending = files.filter((f) => f.file);
    if (pending.length === 0) return;

    // For brand-new tasks there is no document id yet, so the upload is
    // deferred until handleSubmit() creates the task and calls us again with
    // the real id. Attachments are stored as file IDs on the task document.
    const targetId = taskId || editingTask?.id;
    if (!targetId) return;

    setUploading(true);
    setError('');

    for (const f of pending) {
      try {
        setUploadProgress((prev) => ({ ...prev, [f.id]: 0 }));
        const uploaded = await uploadTaskFile(targetId, f.file, (pct) => {
          setUploadProgress((prev) => ({ ...prev, [f.id]: pct }));
        });
        setFiles((prev) => prev.map((pf) => (pf.id === f.id ? { ...uploaded, id: uploaded.id } : pf)));
      } catch (err) {
        setError(`Error al subir "${f.name}": ${err.message}`);
      }
    }

    setUploading(false);
    setUploadProgress({});
  };

  const handleRemoveFile = async (fileId) => {
    const file = files.find((f) => f.id === fileId);
    if (file?.id && !file.id.toString().includes('temp')) {
      try {
        await removeTaskFile(editingTask?.id, file.id);
      } catch {}
    }
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('El título es obligatorio');
      return;
    }

    setIsSubmitting(true);
    setError('');

    let dueAt = null;
    if (dueDate) {
      const [y, m, d] = dueDate.split('-').map(Number);
      const [hh, mm] = (dueTime || '12:00').split(':').map(Number);
      dueAt = new Date(y, m - 1, d, hh, mm, 0, 0).getTime();
    }

    const payload = {
      ...(editingTask ? { id: editingTask.id } : {}),
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      status,
      done: status === 'COMPLETADA',
      dueAt,
      subtasks,
      assignedToName: assignedToName.trim() || user?.name,
      attachments: files.filter((f) => !f.file).map(({ id, name, size, mimeType, url }) => ({ id, name, size, mimeType, url })),
    };

    try {
      let savedId = editingTask ? editingTask.id : null;
      if (editingTask) {
        await editTask(payload);
      } else {
        const created = await addTask(payload);
        savedId = created.id;
      }
      // Upload any files that were selected but not yet uploaded. For new
      // tasks this can only happen now, once the document actually exists.
      if (savedId) {
        await handleUploadFiles(savedId);
      }
      closeModal();
    } catch (err) {
      setError(err.message || 'Error al guardar la tarea');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div className="relative w-full max-w-xl rounded-3xl p-6 sm:p-8 border shadow-2xl animate-in fade-in zoom-in duration-200" style={{ 
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--outline)'
      }}>

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--outline-variant)' }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm border" style={{ 
              backgroundColor: 'var(--primary)10',
              color: 'var(--primary)',
              borderColor: 'var(--primary)30'
            }}>
              G
            </div>
            <h2 className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--on-surface)' }}>
              {editingTask ? 'Editar Tarea Galileo' : 'Nueva Tarea Galileo'}
            </h2>
          </div>

          <button
            onClick={closeModal}
            className="p-2 rounded-lg transition-all"
            style={{ color: 'var(--on-surface-variant)' }}
            onMouseEnter={(e) => {
              e.target.style.color = 'var(--on-surface)';
              e.target.style.backgroundColor = 'var(--surface-variant)';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = 'var(--on-surface-variant)';
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl border text-sm font-medium" style={{ 
            backgroundColor: 'rgba(244, 63, 94, 0.05)',
            borderColor: 'rgba(244, 63, 94, 0.15)',
            color: '#f43f5e'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">

          {/* Title input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--on-surface-variant)' }}>
              Título *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Preparar material para examen simulacro"
              className="w-full px-4 py-3 rounded-xl text-sm font-medium transition-all focus:outline-none"
              style={{ 
                backgroundColor: 'var(--surface-variant)',
                borderColor: 'var(--outline)',
                color: 'var(--on-surface)',
                borderWidth: '1px',
                borderStyle: 'solid'
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--outline)'; }}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--on-surface-variant)' }}>
              Descripción
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Indicaciones o detalles adicionales..."
              className="w-full px-4 py-3 rounded-xl text-sm transition-all focus:outline-none"
              style={{ 
                backgroundColor: 'var(--surface-variant)',
                borderColor: 'var(--outline)',
                color: 'var(--on-surface)',
                borderWidth: '1px',
                borderStyle: 'solid'
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--outline)'; }}
            />
          </div>

          {/* Row: Category & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--on-surface-variant)' }}>
                <Tag className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} /> Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all focus:outline-none"
                style={{ 
                  backgroundColor: 'var(--surface-variant)',
                  borderColor: 'var(--outline)',
                  color: 'var(--on-surface)',
                  borderWidth: '1px',
                  borderStyle: 'solid'
                }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--on-surface-variant)' }}>
                <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#10b981' }} /> Estado
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all focus:outline-none"
                style={{ 
                  backgroundColor: 'var(--surface-variant)',
                  borderColor: 'var(--outline)',
                  color: 'var(--on-surface)',
                  borderWidth: '1px',
                  borderStyle: 'solid'
                }}
              >
                <option value="PENDIENTE">Pendiente</option>
                <option value="EN_PROGRESO">En Progreso</option>
                <option value="COMPLETADA">Completada</option>
              </select>
            </div>
          </div>

          {/* Priority Chips */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--on-surface-variant)' }}>
              <Flag className="w-3.5 h-3.5" style={{ color: '#f59e0b' }} /> Prioridad
            </label>
            <div className="grid grid-cols-4 gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className="py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center"
                  style={priority === p.value ? { 
                    backgroundColor: 'var(--primary)10',
                    color: 'var(--primary)',
                    borderColor: 'var(--primary)40',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  } : { 
                    backgroundColor: 'var(--surface-variant)',
                    color: 'var(--on-surface-variant)',
                    borderColor: 'var(--outline)',
                    borderWidth: '1px',
                    borderStyle: 'solid'
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Due Date & Time */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--on-surface-variant)' }}>
              <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} /> Fecha y Hora de Entrega
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all focus:outline-none"
                style={{ 
                  backgroundColor: 'var(--surface-variant)',
                  borderColor: 'var(--outline)',
                  color: 'var(--on-surface)',
                  borderWidth: '1px',
                  borderStyle: 'solid'
                }}
              />
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all focus:outline-none"
                style={{ 
                  backgroundColor: 'var(--surface-variant)',
                  borderColor: 'var(--outline)',
                  color: 'var(--on-surface)',
                  borderWidth: '1px',
                  borderStyle: 'solid'
                }}
              />
            </div>
          </div>

          {/* Assigned User Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--on-surface-variant)' }}>
              <User className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} /> Asignado a
            </label>
            <input
              type="text"
              value={assignedToName}
              onChange={(e) => setAssignedToName(e.target.value)}
              placeholder="Nombre del docente o responsable"
              className="w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all focus:outline-none"
              style={{ 
                backgroundColor: 'var(--surface-variant)',
                borderColor: 'var(--outline)',
                color: 'var(--on-surface)',
                borderWidth: '1px',
                borderStyle: 'solid'
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--outline)'; }}
            />
          </div>

          {/* File Attachments */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--on-surface-variant)' }}>
              <Paperclip className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} /> Archivos Adjuntos
            </label>

            <div className="flex gap-2 mb-2">
              <label className="flex-1 px-3.5 py-2.5 rounded-xl border border-dashed text-xs font-bold text-center cursor-pointer transition-all flex items-center justify-center gap-1.5" style={{ 
                backgroundColor: 'var(--surface-variant)',
                borderColor: 'var(--outline)',
                color: 'var(--primary)'
              }}>
                <Upload className="w-4 h-4" /> Seleccionar archivo
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => { handleFileSelect(e.target.files); e.target.value = ''; }}
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                />
              </label>
              {files.length > 0 && (
                <button
                  type="button"
                  onClick={handleUploadFiles}
                  disabled={uploading}
                  className="px-4 py-2.5 rounded-xl text-white font-bold text-xs transition-all"
                  style={{ 
                    background: 'var(--primary)',
                    opacity: uploading ? 0.6 : 1
                  }}
                >
                  {uploading ? 'Subiendo...' : 'Subir'}
                </button>
              )}
            </div>

            {/* File List */}
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {files.map((f) => (
                <div key={f.id} className="flex items-center justify-between p-2 rounded-xl border text-xs" style={{ 
                  backgroundColor: 'var(--surface-variant)',
                  borderColor: 'var(--outline-variant)',
                  color: 'var(--on-surface)'
                }}>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {getFileIcon(f.mimeType)}
                    <span className="truncate flex-1">{f.name}</span>
                    <span style={{ color: 'var(--on-surface-variant)' }}>{formatFileSize(f.size)}</span>
                    {uploadProgress[f.id] !== undefined && uploadProgress[f.id] < 100 && (
                      <span style={{ color: 'var(--primary)' }}>{uploadProgress[f.id]}%</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(f.id)}
                    className="p-1 rounded transition-colors shrink-0"
                    style={{ color: 'var(--on-surface-variant)' }}
                    onMouseEnter={(e) => { e.target.style.color = '#f43f5e'; }}
                    onMouseLeave={(e) => { e.target.style.color = 'var(--on-surface-variant)'; }}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Subtasks Checklist */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--on-surface-variant)' }}>
              Sub-puntos a tratar
            </label>

            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Añadir punto..."
                className="flex-1 px-3.5 py-2 rounded-xl text-sm focus:outline-none"
                style={{ 
                  backgroundColor: 'var(--surface-variant)',
                  borderColor: 'var(--outline)',
                  color: 'var(--on-surface)',
                  borderWidth: '1px',
                  borderStyle: 'solid'
                }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--outline)'; }}
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3.5 py-2 rounded-xl text-white font-bold transition-all"
                style={{ 
                  background: 'var(--primary)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {subtasks.map((st, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-xl border text-xs" style={{ 
                  backgroundColor: 'var(--surface-variant)',
                  borderColor: 'var(--outline-variant)',
                  color: 'var(--on-surface)'
                }}>
                  <span className="truncate flex-1">• {st}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(idx)}
                    className="p-1 transition-colors"
                    style={{ color: 'var(--on-surface-variant)' }}
                    onMouseEnter={(e) => { e.target.style.color = '#f43f5e'; }}
                    onMouseLeave={(e) => { e.target.style.color = 'var(--on-surface-variant)'; }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--outline-variant)' }}>
            <button
              type="button"
              onClick={closeModal}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm transition-all"
              style={{ 
                backgroundColor: 'var(--surface-variant)',
                color: 'var(--on-surface)',
                borderColor: 'var(--outline)',
                borderWidth: '1px',
                borderStyle: 'solid'
              }}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg transition-all disabled:opacity-50"
              style={{ 
                background: 'var(--primary)',
                boxShadow: '0 10px 25px -5px var(--primary)40'
              }}
            >
              {isSubmitting ? 'Guardando...' : editingTask ? 'Actualizar' : 'Crear Tarea'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}