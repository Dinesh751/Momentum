import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useTaskStore } from '../store/taskStore';
import { useStreakStore } from '../store/streakStore';
import { useBadgeStore } from '../store/badgeStore';
import { useDailyPointsStore } from '../store/dailyPointsStore';
import { useStatsStore } from '../store/statsStore';
import { localDateISO } from '../utils/date';

// Force-refreshes all stores when the app comes back to the foreground
// after being backgrounded — handles the overnight / midnight scheduler scenario.
export function useAppForeground() {
  const appState = useRef<AppStateStatus>(AppState.currentState);

  const loadTasks = useTaskStore((s) => s.loadTasks);
  const loadStreak = useStreakStore((s) => s.loadStreak);
  const loadBadges = useBadgeStore((s) => s.loadBadges);
  const loadForDate = useDailyPointsStore((s) => s.loadForDate);
  const loadStats = useStatsStore((s) => s.loadAll);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (appState.current !== 'active' && nextState === 'active') {
        const today = localDateISO();
        loadTasks(today, true);
        loadStreak(true);
        loadBadges(true);
        loadForDate(today, true);
        loadStats(true);
      }
      appState.current = nextState;
    });

    return () => subscription.remove();
  }, [loadTasks, loadStreak, loadBadges, loadForDate, loadStats]);
}
