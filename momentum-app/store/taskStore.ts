import { create } from 'zustand';
import { CreateTaskPayload, Task } from '../types';
import taskService from '../services/taskService';

const todayISO = () => new Date().toISOString().split('T')[0];

const tomorrowISO = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

interface TaskState {
  tasks: Task[];
  selectedDate: string;
  isLoading: boolean;
  error: string | null;
  carriedOverIds: number[];
  loadTasks: (date?: string) => Promise<void>;
  addTask: (payload: CreateTaskPayload) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  toggleComplete: (task: Task) => Promise<void>;
  completeAndDismiss: (task: Task) => Promise<void>;
  moveToTomorrow: (id: number) => Promise<void>;
  carryOverFromYesterday: (tasks: Task[]) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  selectedDate: todayISO(),
  isLoading: false,
  error: null,
  carriedOverIds: [],

  loadTasks: async (date) => {
    const targetDate = date ?? todayISO();
    set({ isLoading: true, error: null, selectedDate: targetDate });
    try {
      const tasks = await taskService.getByDate(targetDate);
      set({ tasks });
    } catch {
      set({ error: 'Failed to load tasks' });
    } finally {
      set({ isLoading: false });
    }
  },

  addTask: async (payload) => {
    const task = await taskService.create(payload);
    set((state) => ({ tasks: [...state.tasks, task] }));
  },

  deleteTask: async (id) => {
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
    try {
      await taskService.remove(id);
    } catch {
      get().loadTasks(get().selectedDate);
    }
  },

  toggleComplete: async (task) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === task.id ? { ...t, completed: !t.completed } : t
      ),
    }));
    try {
      const updated = task.completed
        ? await taskService.uncomplete(task.id)
        : await taskService.complete(task.id);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === updated.id ? updated : t)),
      }));
    } catch {
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === task.id ? { ...t, completed: task.completed } : t
        ),
      }));
    }
  },

  // Swipe left: marks complete and removes from the visible list
  completeAndDismiss: async (task) => {
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== task.id) }));
    try {
      if (!task.completed) {
        await taskService.complete(task.id);
      }
    } catch {
      get().loadTasks(get().selectedDate);
    }
  },

  // Swipe right: reschedules to tomorrow and removes from today's list
  moveToTomorrow: async (id) => {
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
    try {
      await taskService.update(id, { dueDate: tomorrowISO() });
    } catch {
      get().loadTasks(get().selectedDate);
    }
  },

  carryOverFromYesterday: async (tasks) => {
    const today = todayISO();
    await Promise.all(tasks.map((t) => taskService.update(t.id, { dueDate: today })));
    set((state) => ({
      carriedOverIds: [...state.carriedOverIds, ...tasks.map((t) => t.id)],
    }));
    await get().loadTasks(today);
  },
}));
