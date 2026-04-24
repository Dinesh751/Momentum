import { create } from 'zustand';
import { Badge } from '../types';
import badgeService from '../services/badgeService';

interface BadgeState {
  badges: Badge[];
  isLoading: boolean;
  error: string | null;
  loadBadges: () => Promise<void>;
}

export const useBadgeStore = create<BadgeState>((set) => ({
  badges: [],
  isLoading: false,
  error: null,

  loadBadges: async () => {
    set({ isLoading: true, error: null });
    try {
      const badges = await badgeService.getBadges();
      set({ badges, isLoading: false });
    } catch {
      set({ error: 'Failed to load badges', isLoading: false });
    }
  },
}));
