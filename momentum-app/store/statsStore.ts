import { create } from 'zustand';
import { StatsOverview, PeriodStats, TaskStats } from '../types';
import statsService from '../services/statsService';

const STATS_TTL = 10 * 60 * 1000;

interface StatsState {
  overview: StatsOverview | null;
  weekly: PeriodStats | null;
  monthly: PeriodStats | null;
  taskStats: TaskStats | null;
  lastFetched: number | null;
  isLoading: boolean;
  error: string | null;
  loadAll: (force?: boolean) => Promise<void>;
}

export const useStatsStore = create<StatsState>((set, get) => ({
  overview: null,
  weekly: null,
  monthly: null,
  taskStats: null,
  lastFetched: null,
  isLoading: false,
  error: null,

  loadAll: async (force = false) => {
    const { lastFetched, overview } = get();
    const isFresh = lastFetched !== null && Date.now() - lastFetched < STATS_TTL;
    if (!force && overview && isFresh) return;

    set({ isLoading: true, error: null });
    try {
      const [overview, weekly, monthly, taskStats] = await Promise.all([
        statsService.getOverview(),
        statsService.getWeekly(),
        statsService.getMonthly(),
        statsService.getTaskStats(),
      ]);
      set({ overview, weekly, monthly, taskStats, lastFetched: Date.now(), isLoading: false });
    } catch {
      set({ error: 'Failed to load stats', isLoading: false });
    }
  },
}));
