import { create } from 'zustand';
import { Task, DayOfWeek } from '../types';
import api from '../services/api';
import taskService from '../services/taskService';
import { ApiResponse } from '../types';
import { useTaskStore } from './taskStore';

export type SchedulePayload =
  | { recurring: false; date: string }
  | { recurring: true; recurringDays: DayOfWeek[]; startDate: string; endDate: string };

interface BacklogState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  loadBacklog: () => Promise<void>;
  addTask: (title: string, priority: Task['priority']) => Promise<void>;
  editTask: (id: number, title: string, priority: Task['priority']) => Promise<void>;
  removeTask: (id: number) => Promise<void>;
  schedule: (task: Task, payload: SchedulePayload) => Promise<void>;
}

export const useBacklogStore = create<BacklogState>((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,

  loadBacklog: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get<ApiResponse<Task[]>>('/tasks/backlog');
      set({ tasks: data.data });
    } catch {
      set({ error: 'Failed to load backlog' });
    } finally {
      set({ isLoading: false });
    }
  },

  addTask: async (title, priority) => {
    const created = await taskService.create({ title, priority });
    set((state) => ({ tasks: [created[0], ...state.tasks] }));
  },

  editTask: async (id, title, priority) => {
    await taskService.update(id, { title, priority });
    set((state) => ({
      tasks: state.tasks.map((t) => t.id === id ? { ...t, title, priority } : t),
    }));
  },

  removeTask: async (id) => {
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
    try {
      await taskService.remove(id);
    } catch {
      get().loadBacklog();
    }
  },

  schedule: async (task, payload) => {
    const { selectedDate, loadTasks } = useTaskStore.getState();

    if (!payload.recurring) {
      await taskService.update(task.id, { dueDate: payload.date });
      set((state) => ({ tasks: state.tasks.filter((t) => t.id !== task.id) }));
      if (payload.date === selectedDate) await loadTasks(selectedDate);
    } else {
      // Delete the backlog task and bulk-create the recurring series
      await taskService.remove(task.id);
      await taskService.create({
        title: task.title,
        priority: task.priority,
        recurring: true,
        recurringDays: payload.recurringDays,
        startDate: payload.startDate,
        endDate: payload.endDate,
      });
      set((state) => ({ tasks: state.tasks.filter((t) => t.id !== task.id) }));
      await loadTasks(selectedDate);
    }
  },
}));
