import { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStreakStore } from '../../store/streakStore';
import { StreakStage } from '../../types';

// ─── Stage config ────────────────────────────────────────────────────────────

const STAGE_CONFIG: Record<
  StreakStage,
  { label: string; color: string; bg: string; icon: keyof typeof Ionicons.glyphMap; next: string | null }
> = {
  BEGINNER: {
    label: 'Beginner',
    color: '#6366f1',
    bg: '#eef2ff',
    icon: 'sparkles-outline',
    next: 'Reach a 7-day streak to unlock Building',
  },
  BUILDING: {
    label: 'Building',
    color: '#f59e0b',
    bg: '#fffbeb',
    icon: 'trending-up-outline',
    next: 'Reach a 14-day streak to unlock Habit',
  },
  HABIT: {
    label: 'Habit',
    color: '#10b981',
    bg: '#ecfdf5',
    icon: 'leaf-outline',
    next: 'Reach a 30-day streak to unlock Committed',
  },
  COMMITTED: {
    label: 'Committed',
    color: '#ef4444',
    bg: '#fef2f2',
    icon: 'flame',
    next: null,
  },
};

// Milestone day targets per stage (used for the progress arc)
const STAGE_MILESTONES: Record<StreakStage, number> = {
  BEGINNER: 7,
  BUILDING: 14,
  HABIT: 30,
  COMMITTED: 100,
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <View
      className="flex-1 bg-white rounded-2xl p-4"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View
        className="w-9 h-9 rounded-xl items-center justify-center mb-3"
        style={{ backgroundColor: color + '20' }}
      >
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text className="text-2xl font-bold text-gray-900">{value}</Text>
      <Text className="text-xs text-gray-400 mt-0.5">{label}</Text>
    </View>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <Ionicons name="cloud-offline-outline" size={48} color="#d1d5db" />
      <Text className="text-gray-700 font-semibold text-base mt-4 mb-1">
        Couldn't load streak
      </Text>
      <Text className="text-gray-400 text-sm text-center mb-6">
        Check your connection and try again
      </Text>
      <TouchableOpacity
        onPress={onRetry}
        className="bg-indigo-600 px-6 py-3 rounded-xl"
      >
        <Text className="text-white font-semibold">Retry</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function StreaksScreen() {
  const { streak, isLoading, error, loadStreak } = useStreakStore();

  useEffect(() => {
    loadStreak();
  }, []);

  if (isLoading && !streak) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#4f46e5" />
      </SafeAreaView>
    );
  }

  if (error && !streak) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <ErrorState onRetry={loadStreak} />
      </SafeAreaView>
    );
  }

  if (!streak) return null;

  const stage = STAGE_CONFIG[streak.streakStage];
  const milestone = STAGE_MILESTONES[streak.streakStage];
  const progressToNextStage = Math.min(streak.currentStreak / milestone, 1);
  const daysToNextStage = Math.max(milestone - streak.currentStreak, 0);

  const lastActive = streak.lastActivityDate
    ? new Date(streak.lastActivityDate + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    : 'No activity yet';

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-gray-50">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Header */}
        <View className="px-5 pt-4 pb-2">
          <Text className="text-2xl font-bold text-gray-900">Streak</Text>
          <Text className="text-gray-400 text-sm mt-0.5">Keep the momentum going</Text>
        </View>

        {/* Hero card — current streak */}
        <View
          className="mx-5 mt-4 rounded-2xl p-6"
          style={{ backgroundColor: stage.color }}
        >
          <View className="flex-row items-center mb-4">
            <View
              className="w-9 h-9 rounded-xl items-center justify-center mr-3"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <Ionicons name={stage.icon} size={20} color="white" />
            </View>
            <Text className="text-white font-semibold text-base">{stage.label}</Text>
          </View>

          <View className="flex-row items-baseline mb-1">
            <Text className="text-white font-bold" style={{ fontSize: 64, lineHeight: 72 }}>
              {streak.currentStreak}
            </Text>
            <Text className="text-white text-lg ml-2 opacity-80">
              {streak.currentStreak === 1 ? 'day' : 'days'}
            </Text>
          </View>
          <Text className="text-white opacity-70 text-sm mb-5">current streak</Text>

          {/* Progress bar toward next stage */}
          <View>
            <View className="flex-row justify-between mb-1.5">
              <Text className="text-white opacity-70 text-xs">
                {streak.streakStage === 'COMMITTED'
                  ? 'Max stage reached 🏆'
                  : `${daysToNextStage} day${daysToNextStage !== 1 ? 's' : ''} to next stage`}
              </Text>
              <Text className="text-white opacity-70 text-xs">
                {Math.round(progressToNextStage * 100)}%
              </Text>
            </View>
            <View
              style={{
                height: 6,
                backgroundColor: 'rgba(255,255,255,0.25)',
                borderRadius: 3,
              }}
            >
              <View
                style={{
                  height: 6,
                  backgroundColor: 'white',
                  borderRadius: 3,
                  width: `${progressToNextStage * 100}%`,
                }}
              />
            </View>
          </View>
        </View>

        {/* Stats row */}
        <View className="flex-row mx-5 mt-4" style={{ gap: 12 }}>
          <StatCard
            icon="trophy-outline"
            label="Longest streak"
            value={`${streak.longestStreak}d`}
            color="#f59e0b"
          />
          <StatCard
            icon="flash-outline"
            label="Daily threshold"
            value={`${streak.currentThreshold} pts`}
            color="#6366f1"
          />
          <StatCard
            icon="umbrella-outline"
            label="Grace days used"
            value={`${streak.graceDaysUsedThisWeek}/2`}
            color="#10b981"
          />
        </View>

        {/* Last active */}
        <View
          className="mx-5 mt-4 bg-white rounded-2xl px-5 py-4 flex-row items-center"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <View className="w-9 h-9 bg-indigo-50 rounded-xl items-center justify-center mr-4">
            <Ionicons name="calendar-outline" size={18} color="#6366f1" />
          </View>
          <View>
            <Text className="text-xs text-gray-400">Last active</Text>
            <Text className="text-sm font-semibold text-gray-800 mt-0.5">{lastActive}</Text>
          </View>
        </View>

        {/* Stage progression */}
        <View
          className="mx-5 mt-4 bg-white rounded-2xl p-5"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <Text className="text-sm font-semibold text-gray-800 mb-4">Stage Progression</Text>

          {(Object.keys(STAGE_CONFIG) as StreakStage[]).map((s, i, arr) => {
            const cfg = STAGE_CONFIG[s];
            const reached =
              Object.keys(STAGE_CONFIG).indexOf(s) <=
              Object.keys(STAGE_CONFIG).indexOf(streak.streakStage);
            const isActive = s === streak.streakStage;
            const thresholds: Record<StreakStage, string> = {
              BEGINNER: 'Day 1  ·  10 pts/day',
              BUILDING: 'Day 7  ·  12 pts/day',
              HABIT: 'Day 14  ·  15 pts/day',
              COMMITTED: 'Day 30  ·  20 pts/day',
            };

            return (
              <View key={s} className="flex-row items-start">
                {/* Timeline dot + line */}
                <View className="items-center mr-4" style={{ width: 20 }}>
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: reached ? cfg.color : '#e5e7eb',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {reached && (
                      <Ionicons
                        name={isActive ? cfg.icon : 'checkmark'}
                        size={11}
                        color="white"
                      />
                    )}
                  </View>
                  {i < arr.length - 1 && (
                    <View
                      style={{
                        width: 2,
                        height: 32,
                        backgroundColor: reached ? cfg.color + '40' : '#e5e7eb',
                        marginTop: 2,
                      }}
                    />
                  )}
                </View>

                {/* Stage info */}
                <View className="flex-1 pb-6">
                  <View className="flex-row items-center">
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: reached ? '#111827' : '#9ca3af' }}
                    >
                      {cfg.label}
                    </Text>
                    {isActive && (
                      <View
                        className="ml-2 px-2 py-0.5 rounded-md"
                        style={{ backgroundColor: cfg.bg }}
                      >
                        <Text style={{ fontSize: 10, fontWeight: '700', color: cfg.color }}>
                          Current
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-xs text-gray-400 mt-0.5">{thresholds[s]}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Next stage nudge */}
        {stage.next && (
          <View
            className="mx-5 mt-4 rounded-2xl px-5 py-4 flex-row items-center"
            style={{ backgroundColor: stage.bg }}
          >
            <Ionicons name="arrow-forward-circle-outline" size={22} color={stage.color} style={{ marginRight: 12 }} />
            <Text className="text-sm flex-1" style={{ color: stage.color, fontWeight: '600' }}>
              {stage.next}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
