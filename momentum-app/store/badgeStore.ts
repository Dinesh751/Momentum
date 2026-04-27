import { create } from 'zustand';
import { Badge } from '../types';
import badgeService from '../services/badgeService';

const BADGE_TTL = 10 * 60 * 1000;

interface BadgeState {
  badges: Badge[];
  lastFetched: number | null;
  isLoading: boolean;
  error: string | null;
  loadBadges: (force?: boolean) => Promise<void>;
}

export const useBadgeStore = create<BadgeState>((set, get) => ({
  badges: [],
  lastFetched: null,
  isLoading: false,
  error: null,

  loadBadges: async (force = false) => {
    const { lastFetched, badges } = get();
    const isFresh = lastFetched !== null && Date.now() - lastFetched < BADGE_TTL;
    if (!force && badges.length > 0 && isFresh) return;

    set({ isLoading: true, error: null });
    try {
      const badges = await badgeService.getBadges();
      set({ badges, lastFetched: Date.now(), isLoading: false });
    } catch {
      set({ error: 'Failed to load badges', isLoading: false });
    }
  },
}));
