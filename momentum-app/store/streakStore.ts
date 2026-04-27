import { create } from 'zustand';
import { Streak } from '../types';
import streakService from '../services/streakService';

const STREAK_TTL = 5 * 60 * 1000;

interface StreakState {
  streak: Streak | null;
  lastFetched: number | null;
  isLoading: boolean;
  error: string | null;
  loadStreak: (force?: boolean) => Promise<void>;
}

export const useStreakStore = create<StreakState>((set, get) => ({
  streak: null,
  lastFetched: null,
  isLoading: false,
  error: null,

  loadStreak: async (force = false) => {
    const { lastFetched, streak } = get();
    const isFresh = lastFetched !== null && Date.now() - lastFetched < STREAK_TTL;
    if (!force && streak && isFresh) return;

    set({ isLoading: true, error: null });
    try {
      const streak = await streakService.getStreak();
      set({ streak, lastFetched: Date.now(), isLoading: false });
    } catch {
      set({ error: 'Failed to load streak', isLoading: false });
    }
  },
}));
