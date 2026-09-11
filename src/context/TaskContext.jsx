import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  loadTasks,
  createTask as apiCreateTask,
  updateTask as apiUpdateTask,
  deleteTask as apiDeleteTask,
  subscribeTasks,
  uploadFile,
  deleteFile,
} from '../services/appwrite';

const TaskContext = createContext();

export function TaskProvider({ children }) {
  const { user, isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('Todas');
  const [category, setCategory] = useState(null);
  const [selectedUserFilter, setSelectedUserFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('agenda');
  const [editingTask, setEditingTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await loadTasks(user.id, isAdmin);
      setTasks(data);
    } catch (e) {
      console.error('Failed to load tasks', e);
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin]);

  // Load tasks on mount and setup Realtime subscription
  useEffect(() => {
    if (!user) {
      setTasks([]);
      return;
    }

    fetchTasks();

    const unsub = subscribeTasks(() => {
      fetchTasks();
    });

    return () => {
      if (unsub && typeof unsub === 'function') {
        try { unsub(); } catch {}
      }
    };
  }, [user, fetchTasks]);

  const addTask = async (taskData) => {
    const newTask = await apiCreateTask({
      ...taskData,
      createdBy: user.id,
      assignedTo: taskData.assignedTo || user.id,
      assignedToName: taskData.assignedToName || user.name,
    });
    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  };

  const editTask = async (taskData) => {
    const updated = await apiUpdateTask(taskData);
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    return updated;
  };

  const removeTask = async (taskId) => {
    await apiDeleteTask(taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const uploadTaskFile = async (taskId, file, onProgress) => {
    const uploaded = await uploadFile(file, onProgress);
    // The task may not be in local state yet (e.g. just created this save),
    // so fall back to a stub with a valid id instead of crashing.
    const existing = tasks.find((t) => t.id === taskId);
    const task = existing || { id: taskId, attachments: [] };
    const attachments = [...(task.attachments || []), uploaded];
    const updated = await apiUpdateTask({ ...task, attachments });
    setTasks((prev) => {
      const has = prev.some((t) => t.id === updated.id);
      return has ? prev.map((t) => (t.id === updated.id ? updated : t)) : [updated, ...prev];
    });
    return uploaded;
  };

  const removeTaskFile = async (taskId, fileId) => {
    await deleteFile(fileId);
    const existing = tasks.find((t) => t.id === taskId);
    const task = existing || { id: taskId, attachments: [] };
    const attachments = (task.attachments || []).filter((a) => a.id !== fileId);
    const updated = await apiUpdateTask({ ...task, attachments });
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const toggleTaskDone = async (task) => {
    const newDone = !task.done;
    const updatedTask = {
      ...task,
      done: newDone,
      status: newDone ? 'COMPLETADA' : 'PENDIENTE',
      completedAt: newDone ? Date.now() : null,
    };
    // Optimistic UI update
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updatedTask : t)));
    try {
      await apiUpdateTask(updatedTask);
    } catch {
      // Revert if error
      fetchTasks();
    }
  };

  const openNewTaskModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const openEditTaskModal = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingTask(null);
    setIsModalOpen(false);
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        filter,
        setFilter,
        category,
        setCategory,
        selectedUserFilter,
        setSelectedUserFilter,
        searchQuery,
        setSearchQuery,
        activeTab,
        setActiveTab,
        editingTask,
        isModalOpen,
        openNewTaskModal,
        openEditTaskModal,
        closeModal,
        fetchTasks,
      addTask,
      editTask,
      removeTask,
      toggleTaskDone,
      uploadTaskFile,
      removeTaskFile,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}
