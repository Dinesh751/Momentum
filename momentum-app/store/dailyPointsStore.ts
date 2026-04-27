import { create } from 'zustand';
import { DailyPoints } from '../types';
import dailyPointsService from '../services/dailyPointsService';

const DAILY_POINTS_TTL = 3 * 60 * 1000;

interface DailyPointsState {
  dailyPoints: DailyPoints | null;
  loadedDate: string | null;
  lastFetched: number | null;
  isLoading: boolean;
  error: string | null;
  loadForDate: (date: string, force?: boolean) => Promise<void>;
}

export const useDailyPointsStore = create<DailyPointsState>((set, get) => ({
  dailyPoints: null,
  loadedDate: null,
  lastFetched: null,
  isLoading: false,
  error: null,

  loadForDate: async (date, force = false) => {
    const { loadedDate, lastFetched, isLoading } = get();

    const isSameDate = loadedDate === date;
    const isFresh = lastFetched !== null && Date.now() - lastFetched < DAILY_POINTS_TTL;

    if (!force && isSameDate && isFresh) return;
    if (!force && isSameDate && isLoading) return;

    set({ isLoading: true, loadedDate: date, error: null });
    try {
      const dailyPoints = await dailyPointsService.getForDate(date);
      if (get().loadedDate === date) {
        set({ dailyPoints, lastFetched: Date.now(), isLoading: false });
      }
    } catch {
      set({ isLoading: false, error: 'Failed to load daily points' });
    }
  },
}));
