import { create } from 'zustand';
import { CreateTaskPayload, Task } from '../types';
import taskService from '../services/taskService';
import { localDateISO, offsetLocalDateISO } from '../utils/date';

const todayISO = () => localDateISO();

const TASK_TTL = 2 * 60 * 1000;

interface TaskState {
  tasks: Task[];
  selectedDate: string;
  lastFetched: number | null;
  isLoading: boolean;
  error: string | null;
  carriedOverIds: number[];
  loadTasks: (date?: string, force?: boolean) => Promise<void>;
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
  lastFetched: null,
  isLoading: false,
  error: null,
  carriedOverIds: [],

  loadTasks: async (date, force = false) => {
    const targetDate = date ?? todayISO();
    const { lastFetched, selectedDate } = get();

    const isSameDate = selectedDate === targetDate;
    const isFresh = lastFetched !== null && Date.now() - lastFetched < TASK_TTL;
    if (!force && isSameDate && isFresh) return;

    set({ isLoading: true, error: null, selectedDate: targetDate });
    try {
      const tasks = await taskService.getByDate(targetDate);
      set({ tasks, lastFetched: Date.now() });
    } catch {
      set({ error: 'Failed to load tasks' });
    } finally {
      set({ isLoading: false });
    }
  },

  addTask: async (payload) => {
    const { selectedDate, loadTasks } = get();
    if (payload.recurring) {
      await taskService.create(payload);
      await loadTasks(selectedDate, true);
    } else {
      const created = await taskService.create({ dueDate: selectedDate, ...payload });
      set((state) => ({ tasks: [...state.tasks, ...created] }));
    }
  },

  deleteTask: async (id) => {
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
    try {
      await taskService.remove(id);
    } catch {
      get().loadTasks(get().selectedDate, true);
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

  completeAndDismiss: async (task) => {
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== task.id) }));
    try {
      if (!task.completed) {
        await taskService.complete(task.id);
      }
    } catch {
      get().loadTasks(get().selectedDate, true);
    }
  },

  moveToTomorrow: async (id) => {
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
    try {
      await taskService.update(id, { dueDate: offsetLocalDateISO(get().selectedDate, 1) });
    } catch {
      get().loadTasks(get().selectedDate, true);
    }
  },

  carryOverFromYesterday: async (tasks) => {
    const today = todayISO();
    await Promise.all(tasks.map((t) => taskService.update(t.id, { dueDate: today })));
    set((state) => ({
      carriedOverIds: [...state.carriedOverIds, ...tasks.map((t) => t.id)],
    }));
    await get().loadTasks(today, true);
  },
}));
