import { create } from 'zustand';
import { StatsOverview, PeriodStats, TaskStats } from '../types';
import statsService from '../services/statsService';

interface StatsState {
  overview: StatsOverview | null;
  weekly: PeriodStats | null;
  monthly: PeriodStats | null;
  taskStats: TaskStats | null;
  isLoading: boolean;
  error: string | null;
  loadAll: () => Promise<void>;
}

export const useStatsStore = create<StatsState>((set) => ({
  overview: null,
  weekly: null,
  monthly: null,
  taskStats: null,
  isLoading: false,
  error: null,

  loadAll: async () => {
    set({ isLoading: true, error: null });
    try {
      const [overview, weekly, monthly, taskStats] = await Promise.all([
        statsService.getOverview(),
        statsService.getWeekly(),
        statsService.getMonthly(),
        statsService.getTaskStats(),
      ]);
      set({ overview, weekly, monthly, taskStats, isLoading: false });
    } catch {
      set({ error: 'Failed to load stats', isLoading: false });
    }
  },
}));
