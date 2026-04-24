import { create } from 'zustand';
import { Streak } from '../types';
import streakService from '../services/streakService';

interface StreakState {
  streak: Streak | null;
  isLoading: boolean;
  error: string | null;
  loadStreak: () => Promise<void>;
}

export const useStreakStore = create<StreakState>((set) => ({
  streak: null,
  isLoading: false,
  error: null,

  loadStreak: async () => {
    set({ isLoading: true, error: null });
    try {
      const streak = await streakService.getStreak();
      set({ streak, isLoading: false });
    } catch {
      set({ error: 'Failed to load streak', isLoading: false });
    }
  },
}));
