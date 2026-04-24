import { create } from 'zustand';
import { DailyPoints } from '../types';
import dailyPointsService from '../services/dailyPointsService';

interface DailyPointsState {
  dailyPoints: DailyPoints | null;
  loadedDate: string | null;
  isLoading: boolean;
  loadForDate: (date: string) => Promise<void>;
}

export const useDailyPointsStore = create<DailyPointsState>((set, get) => ({
  dailyPoints: null,
  loadedDate: null,
  isLoading: false,

  loadForDate: async (date: string) => {
    if (get().loadedDate === date && get().isLoading) return;
    set({ isLoading: true, loadedDate: date });
    try {
      const dailyPoints = await dailyPointsService.getForDate(date);
      // Discard if a newer request came in while this was in flight
      if (get().loadedDate === date) {
        set({ dailyPoints, isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
