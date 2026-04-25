export type Priority = 'HIGH' | 'MID' | 'LOW' | 'NONE';
export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export interface User {
  email: string;
  displayName: string;
}

export interface UserProfile {
  email: string;
  displayName: string;
  timezone: string;
  lifetimePoints: number;
  joinedAt: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  priority: Priority;
  points: number;
  dueDate?: string;
  completed: boolean;
  completedAt?: string;
  recurring: boolean;
  recurringDays: DayOfWeek[];
  recurringGroupId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: string;
  recurring?: boolean;
  recurringDays?: DayOfWeek[];
  startDate?: string;
  endDate?: string;
}

export interface SeriesSummary {
  recurringGroupId: string;
  pattern: string;
  firstDate: string;
  lastDate: string;
  totalOccurrences: number;
  completedOccurrences: number;
  remainingOccurrences: number;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  priority?: Priority;
  dueDate?: string;
  recurring?: boolean;
  recurringDays?: DayOfWeek[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface StatsOverview {
  lifetimePoints: number;
  currentStreak: number;
  longestStreak: number;
  streakStage: string;
  badgesEarned: number;
  consistencyPercent: number;
}

export interface DailyStatEntry {
  date: string;
  pointsEarned: number;
  threshold: number;
  totalPossible: number;
  thresholdMet: boolean;
  graceDay: boolean;
}

export interface PeriodStats {
  days: DailyStatEntry[];
  totalPointsEarned: number;
  daysThresholdMet: number;
  consistencyPercent: number;
}

export interface TaskStats {
  totalCreated: number;
  totalCompleted: number;
  completionRate: number;
  highCompleted: number;
  midCompleted: number;
  lowCompleted: number;
  noneCompleted: number;
}

export interface DailyPoints {
  date: string;
  pointsEarned: number;
  thresholdPts: number;
  totalPossiblePts: number;
  thresholdMet: boolean;
  consistencyPercent: number;
}

export type StreakStage = 'BEGINNER' | 'BUILDING' | 'HABIT' | 'COMMITTED';

export interface Streak {
  currentStreak: number;
  longestStreak: number;
  streakStage: StreakStage;
  currentThreshold: number;
  graceDaysUsedThisWeek: number;
  lastActivityDate: string | null;
}

export interface Badge {
  code: string;
  name: string;
  description: string;
  earned: boolean;
  earnedAt: string | null;
}
