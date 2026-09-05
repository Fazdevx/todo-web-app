import React, { useState, useEffect } from 'react';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { X, Plus, Trash2, Calendar, Tag, Flag, User, CheckCircle2 } from 'lucide-react';

const CATEGORIES = ['General', 'Academia', 'Docencia', 'Administración', 'Trabajo', 'Personal'];
const PRIORITIES = [
  { value: 0, label: 'Baja', color: 'border-slate-600 bg-slate-800 text-slate-300' },
  { value: 1, label: 'Media', color: 'border-blue-500/50 bg-blue-500/10 text-blue-400' },
  { value: 2, label: 'Alta', color: 'border-amber-500/50 bg-amber-500/10 text-amber-400' },
  { value: 3, label: 'Urgente', color: 'border-rose-500/50 bg-rose-500/10 text-rose-400' },
];

export function TaskModal() {
  const { isModalOpen, closeModal, editingTask, addTask, editTask } = useTasks();
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

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title || '');
      setDescription(editingTask.description || '');
      setCategory(editingTask.category || 'General');
      setPriority(editingTask.priority ?? 1);
      setStatus(editingTask.status || 'PENDIENTE');
      setSubtasks(editingTask.subtasks || []);
      setAssignedToName(editingTask.assignedToName || user?.name || '');

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
    }
    setError('');
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
    };

    try {
      if (editingTask) {
        await editTask(payload);
      } else {
        await addTask(payload);
      }
      closeModal();
    } catch (err) {
      setError(err.message || 'Error al guardar la tarea');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-sm border border-orange-500/30">
              G
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              {editingTask ? 'Editar Tarea Galileo' : 'Nueva Tarea Galileo'}
            </h2>
          </div>

          <button
            onClick={closeModal}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          
          {/* Title input */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Título *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Preparar material para examen simulacro"
              className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all font-medium"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Descripción
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Indicaciones o detalles adicionales..."
              className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-sm"
            />
          </div>

          {/* Row: Category & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-orange-400" /> Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-white focus:outline-none focus:border-orange-500 text-sm font-medium"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-slate-900 text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Estado
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-white focus:outline-none focus:border-orange-500 text-sm font-medium"
              >
                <option value="PENDIENTE" className="bg-slate-900">Pendiente</option>
                <option value="EN_PROGRESO" className="bg-slate-900">En Progreso</option>
                <option value="COMPLETADA" className="bg-slate-900">Completada</option>
              </select>
            </div>
          </div>

          {/* Priority Chips */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Flag className="w-3.5 h-3.5 text-amber-400" /> Prioridad
            </label>
            <div className="grid grid-cols-4 gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                    priority === p.value
                      ? `${p.color} ring-2 ring-orange-500/50 shadow-md`
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Due Date & Time */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-orange-400" /> Fecha y Hora de Entrega
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-white focus:outline-none focus:border-orange-500 text-sm font-medium"
              />
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-white focus:outline-none focus:border-orange-500 text-sm font-medium"
              />
            </div>
          </div>

          {/* Assigned User Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-orange-400" /> Asignado a
            </label>
            <input
              type="text"
              value={assignedToName}
              onChange={(e) => setAssignedToName(e.target.value)}
              placeholder="Nombre del docente o responsable"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 text-sm font-medium"
            />
          </div>

          {/* Subtasks Checklist */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
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
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-white text-sm focus:outline-none focus:border-orange-500"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {subtasks.map((st, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-200">
                  <span className="truncate flex-1">• {st}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(idx)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={closeModal}
              className="px-5 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 font-semibold text-sm transition-all"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-sm shadow-lg shadow-orange-500/25 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Guardando...' : editingTask ? 'Actualizar' : 'Crear Tarea'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
