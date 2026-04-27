import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStatsStore } from '../../store/statsStore';
import { DailyStatEntry, PeriodStats } from '../../types';
import LoadingScreen from '../../components/LoadingScreen';
import ErrorScreen from '../../components/ErrorScreen';
import OfflineBanner from '../../components/OfflineBanner';

// ─── Bar chart ───────────────────────────────────────────────────────────────

function BarChart({ period }: { period: PeriodStats }) {
  const { days } = period;
  if (days.length === 0) return (
    <View className="items-center py-8">
      <Text className="text-gray-400 text-sm">No data for this period</Text>
    </View>
  );

  const maxPoints = Math.max(...days.map((d) => Math.max(d.pointsEarned, d.threshold)), 1);

  const barColor = (day: DailyStatEntry) => {
    if (day.graceDay) return '#e5e7eb';
    if (day.thresholdMet) return '#4f46e5';
    return '#fca5a5';
  };

  const dayLabel = (dateStr: string) => {
    const d = new Date(dateStr + 'T12:00:00');
    return days.length <= 7
      ? d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1)
      : d.getDate().toString();
  };

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 100, gap: 3 }}>
        {days.map((day) => {
          const barH = Math.max((day.pointsEarned / maxPoints) * 100, day.pointsEarned > 0 ? 4 : 0);
          const thresholdH = (day.threshold / maxPoints) * 100;

          return (
            <View key={day.date} style={{ flex: 1, alignItems: 'center', height: 100, justifyContent: 'flex-end' }}>
              {/* Threshold marker */}
              <View
                style={{
                  position: 'absolute',
                  bottom: thresholdH,
                  left: 0,
                  right: 0,
                  height: 1.5,
                  backgroundColor: '#c7d2fe',
                }}
              />
              {/* Points bar */}
              <View
                style={{
                  width: '100%',
                  height: barH,
                  backgroundColor: barColor(day),
                  borderRadius: 3,
                }}
              />
            </View>
          );
        })}
      </View>

      {/* X-axis labels */}
      <View style={{ flexDirection: 'row', gap: 3, marginTop: 6 }}>
        {days.map((day) => (
          <View key={day.date} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 10, color: '#9ca3af' }}>{dayLabel(day.date)}</Text>
          </View>
        ))}
      </View>

      {/* Legend */}
      <View className="flex-row mt-3" style={{ gap: 12 }}>
        <View className="flex-row items-center" style={{ gap: 4 }}>
          <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: '#4f46e5' }} />
          <Text style={{ fontSize: 11, color: '#6b7280' }}>Goal met</Text>
        </View>
        <View className="flex-row items-center" style={{ gap: 4 }}>
          <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: '#fca5a5' }} />
          <Text style={{ fontSize: 11, color: '#6b7280' }}>Missed</Text>
        </View>
        <View className="flex-row items-center" style={{ gap: 4 }}>
          <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: '#e5e7eb' }} />
          <Text style={{ fontSize: 11, color: '#6b7280' }}>Grace day</Text>
        </View>
        <View className="flex-row items-center" style={{ gap: 4 }}>
          <View style={{ width: 14, height: 1.5, backgroundColor: '#c7d2fe' }} />
          <Text style={{ fontSize: 11, color: '#6b7280' }}>Threshold</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Stat tile ────────────────────────────────────────────────────────────────

function StatTile({
  icon,
  label,
  value,
  color,
  sub,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  color: string;
  sub?: string;
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
      {sub && <Text className="text-xs font-semibold mt-1" style={{ color }}>{sub}</Text>}
    </View>
  );
}

// ─── Priority bar ─────────────────────────────────────────────────────────────

function PriorityBar({
  label,
  count,
  total,
  color,
  bg,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
  bg: string;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <View className="mb-3">
      <View className="flex-row justify-between mb-1">
        <View className="flex-row items-center" style={{ gap: 6 }}>
          <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: color }} />
          <Text className="text-sm text-gray-700">{label}</Text>
        </View>
        <Text className="text-sm font-semibold text-gray-900">{count}</Text>
      </View>
      <View style={{ height: 6, backgroundColor: bg, borderRadius: 3 }}>
        <View style={{ height: 6, width: `${pct}%`, backgroundColor: color, borderRadius: 3 }} />
      </View>
    </View>
  );
}

// ─── Card wrapper ─────────────────────────────────────────────────────────────

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View
      className="mx-5 mb-4 bg-white rounded-2xl p-5"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <Text className="text-sm font-semibold text-gray-800 mb-4">{title}</Text>
      {children}
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

type Period = 'weekly' | 'monthly';

export default function StatsScreen() {
  const { overview, weekly, monthly, taskStats, isLoading, error, loadAll } = useStatsStore();
  const [period, setPeriod] = useState<Period>('weekly');

  useEffect(() => {
    loadAll();
  }, []);

  if (isLoading && !overview) return <LoadingScreen />;
  if (error && !overview) return <ErrorScreen onRetry={() => loadAll(true)} />;

  const periodData = period === 'weekly' ? weekly : monthly;

  if (!overview && !isLoading) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-gray-50">
        <View className="px-5 pt-4 pb-4">
          <Text className="text-2xl font-bold text-gray-900">Stats</Text>
          <Text className="text-gray-400 text-sm mt-0.5">Your performance at a glance</Text>
        </View>
        <OfflineBanner />
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-16 h-16 bg-indigo-50 rounded-2xl items-center justify-center mb-4">
            <Ionicons name="bar-chart-outline" size={32} color="#a5b4fc" />
          </View>
          <Text className="text-gray-700 font-semibold text-base mb-2">No stats yet</Text>
          <Text className="text-gray-400 text-sm text-center">
            Complete some tasks to start tracking your performance
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  const totalPriorityCompleted = taskStats
    ? Number(taskStats.highCompleted) + Number(taskStats.midCompleted) +
      Number(taskStats.lowCompleted) + Number(taskStats.noneCompleted)
    : 0;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-gray-50">
      <OfflineBanner />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        {/* Header */}
        <View className="px-5 pt-4 pb-4">
          <Text className="text-2xl font-bold text-gray-900">Stats</Text>
          <Text className="text-gray-400 text-sm mt-0.5">Your performance at a glance</Text>
        </View>

        {/* Overview tiles — row 1 */}
        {overview && (
          <>
            <View className="flex-row mx-5 mb-3" style={{ gap: 12 }}>
              <StatTile
                icon="flash"
                label="Lifetime points"
                value={overview.lifetimePoints.toLocaleString()}
                color="#6366f1"
              />
              <StatTile
                icon="trending-up-outline"
                label="Consistency"
                value={`${overview.consistencyPercent}%`}
                color="#10b981"
              />
            </View>

            {/* Overview tiles — row 2 */}
            <View className="flex-row mx-5 mb-4" style={{ gap: 12 }}>
              <StatTile
                icon="flame"
                label="Current streak"
                value={`${overview.currentStreak}d`}
                color="#f97316"
                sub={overview.streakStage.charAt(0) + overview.streakStage.slice(1).toLowerCase()}
              />
              <StatTile
                icon="trophy-outline"
                label="Longest streak"
                value={`${overview.longestStreak}d`}
                color="#eab308"
              />
              <StatTile
                icon="ribbon-outline"
                label="Badges earned"
                value={overview.badgesEarned}
                color="#8b5cf6"
              />
            </View>
          </>
        )}

        {/* Period chart */}
        <Card title="Points history">
          {/* Toggle */}
          <View
            className="flex-row mb-5 p-1 rounded-xl"
            style={{ backgroundColor: '#f1f5f9' }}
          >
            {(['weekly', 'monthly'] as Period[]).map((p) => (
              <TouchableOpacity
                key={p}
                onPress={() => setPeriod(p)}
                className="flex-1 items-center py-2 rounded-lg"
                style={{ backgroundColor: period === p ? 'white' : 'transparent' }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '700',
                    color: period === p ? '#4f46e5' : '#9ca3af',
                  }}
                >
                  {p === 'weekly' ? 'Last 7 days' : 'Last 30 days'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {periodData ? (
            <>
              <BarChart period={periodData} />

              {/* Period summary */}
              <View
                className="flex-row mt-5 pt-4"
                style={{ borderTopWidth: 1, borderTopColor: '#f3f4f6', gap: 0 }}
              >
                <View className="flex-1 items-center">
                  <Text className="text-xl font-bold text-gray-900">
                    {periodData.totalPointsEarned}
                  </Text>
                  <Text className="text-xs text-gray-400 mt-0.5">pts earned</Text>
                </View>
                <View style={{ width: 1, backgroundColor: '#f3f4f6' }} />
                <View className="flex-1 items-center">
                  <Text className="text-xl font-bold text-gray-900">
                    {periodData.daysThresholdMet}
                  </Text>
                  <Text className="text-xs text-gray-400 mt-0.5">days goal met</Text>
                </View>
                <View style={{ width: 1, backgroundColor: '#f3f4f6' }} />
                <View className="flex-1 items-center">
                  <Text className="text-xl font-bold text-gray-900">
                    {periodData.consistencyPercent}%
                  </Text>
                  <Text className="text-xs text-gray-400 mt-0.5">consistency</Text>
                </View>
              </View>
            </>
          ) : (
            <ActivityIndicator color="#6366f1" />
          )}
        </Card>

        {/* Task stats */}
        {taskStats && (
          <Card title="Task breakdown">
            {/* Completion rate */}
            <View
              className="flex-row items-center mb-5 pb-4"
              style={{ borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}
            >
              <View className="flex-1">
                <Text className="text-xs text-gray-400 mb-1">Completion rate</Text>
                <View style={{ height: 8, backgroundColor: '#e0e7ff', borderRadius: 4 }}>
                  <View
                    style={{
                      height: 8,
                      width: `${taskStats.completionRate}%`,
                      backgroundColor: '#4f46e5',
                      borderRadius: 4,
                    }}
                  />
                </View>
              </View>
              <Text className="text-2xl font-bold text-gray-900 ml-4">
                {taskStats.completionRate}%
              </Text>
            </View>

            <View className="flex-row justify-between mb-4">
              <View>
                <Text className="text-2xl font-bold text-gray-900">{Number(taskStats.totalCompleted)}</Text>
                <Text className="text-xs text-gray-400">completed</Text>
              </View>
              <View className="items-end">
                <Text className="text-2xl font-bold text-gray-900">{Number(taskStats.totalCreated)}</Text>
                <Text className="text-xs text-gray-400">created</Text>
              </View>
            </View>

            {/* Priority breakdown */}
            <Text className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              By priority
            </Text>
            <PriorityBar label="High" count={Number(taskStats.highCompleted)} total={totalPriorityCompleted} color="#ef4444" bg="#fef2f2" />
            <PriorityBar label="Mid"  count={Number(taskStats.midCompleted)}  total={totalPriorityCompleted} color="#f59e0b" bg="#fffbeb" />
            <PriorityBar label="Low"  count={Number(taskStats.lowCompleted)}  total={totalPriorityCompleted} color="#3b82f6" bg="#eff6ff" />
            <PriorityBar label="None" count={Number(taskStats.noneCompleted)} total={totalPriorityCompleted} color="#9ca3af" bg="#f9fafb" />
          </Card>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}
