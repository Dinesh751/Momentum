import { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/AppStack';
import { useAuthStore } from '../../store/authStore';
import { useTaskStore } from '../../store/taskStore';
import { useStreakStore } from '../../store/streakStore';
import { useBadgeStore } from '../../store/badgeStore';
import { useDailyPointsStore } from '../../store/dailyPointsStore';
import { useStatsStore } from '../../store/statsStore';
import { DEFAULT_DAILY_THRESHOLD } from '../../constants';
import LoadingScreen from '../../components/LoadingScreen';
import ErrorBanner from '../../components/ErrorBanner';
import OfflineBanner from '../../components/OfflineBanner';
import { localDateISO } from '../../utils/date';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const formatDate = (date: Date) =>
  date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

export default function DashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const { tasks, isLoading: tasksLoading, error: tasksError, loadTasks } = useTaskStore();
  const { streak, error: streakError, loadStreak } = useStreakStore();
  const { badges, error: badgesError, loadBadges } = useBadgeStore();
  const { dailyPoints, isLoading: pointsLoading, error: pointsError, loadForDate } = useDailyPointsStore();
  const { overview, error: statsError, loadAll: loadStats } = useStatsStore();
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const [refreshing, setRefreshing] = useState(false);

  const todayISO = localDateISO();

  const loadAll = useCallback(() => {
    loadTasks();
    loadStreak();
    loadBadges();
    loadForDate(todayISO);
    loadStats();
  }, [todayISO]);

  useEffect(() => {
    loadAll();
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.allSettled([
      loadTasks(),
      loadStreak(),
      loadBadges(),
      loadForDate(todayISO),
      loadStats(),
    ]);
    setRefreshing(false);
  }, [todayISO]);

  const isInitialLoading = tasksLoading && tasks.length === 0 && !dailyPoints && pointsLoading;
  const loadError = tasksError || pointsError || streakError || badgesError || statsError;

  if (isInitialLoading) return <LoadingScreen />;

  const pointsEarned = tasks.filter((t) => t.completed).reduce((sum, t) => sum + t.points, 0);
  const completedCount = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;
  const threshold = dailyPoints?.thresholdPts ?? DEFAULT_DAILY_THRESHOLD;
  const progress = Math.min((pointsEarned / threshold) * 100, 100);
  const goalMet = pointsEarned >= threshold;
  const firstName = user?.displayName?.split(' ')[0] ?? 'there';

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <OfflineBanner />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#4f46e5" />
        }
      >
        {loadError && (
          <ErrorBanner message="Some data failed to load" onRetry={loadAll} />
        )}

        {/* Header */}
        <View className="flex-row items-start justify-between px-5 pt-4 pb-6">
          <View>
            <Text className="text-gray-400 text-sm">{getGreeting()},</Text>
            <Text className="text-2xl font-bold text-gray-900">{firstName} 👋</Text>
            <Text className="text-gray-400 text-sm mt-0.5">{formatDate(new Date())}</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings')}
            className="w-9 h-9 rounded-xl items-center justify-center mt-1"
            style={{ backgroundColor: '#f1f5f9' }}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons name="settings-outline" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        {/* Daily progress card */}
        <View className="mx-5 mb-4 bg-indigo-600 rounded-2xl p-5">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-indigo-200 text-sm font-medium">Daily Progress</Text>
            {goalMet && (
              <View
                style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: 999,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                }}
              >
                <Text className="text-white text-xs font-semibold">Goal met 🎯</Text>
              </View>
            )}
          </View>
          <View className="flex-row items-baseline mb-4">
            <Text className="text-white text-4xl font-bold">{pointsEarned}</Text>
            <Text className="text-indigo-300 text-base ml-1">/ {threshold} pts</Text>
          </View>
          <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3 }}>
            <View
              style={{
                height: 6,
                backgroundColor: 'white',
                borderRadius: 3,
                width: `${progress}%`,
              }}
            />
          </View>
          <Text className="text-indigo-300 text-xs mt-2.5">
            {Math.round(progress)}% of daily goal
          </Text>
        </View>

        {/* Tasks summary */}
        <TouchableOpacity
          className="mx-5 mb-4 bg-white rounded-2xl p-5"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 4,
            elevation: 2,
          }}
          onPress={() => navigation.navigate('Tasks' as never)}
        >
          <View className="flex-row justify-between items-center mb-3">
            <Text className="font-semibold text-gray-800">Today's Tasks</Text>
            <View className="flex-row items-center">
              <Text className="text-indigo-600 text-sm font-medium">View all</Text>
              <Ionicons name="chevron-forward" size={16} color="#4f46e5" />
            </View>
          </View>

          {totalTasks === 0 ? (
            <Text className="text-gray-400 text-sm">No tasks yet — add some to earn points!</Text>
          ) : (
            <View>
              <View className="flex-row items-center mb-2">
                <View
                  className="flex-1 rounded-full"
                  style={{ height: 6, backgroundColor: '#e2e8f0' }}
                >
                  <View
                    className="rounded-full bg-indigo-500"
                    style={{
                      height: 6,
                      width: `${(completedCount / totalTasks) * 100}%`,
                    }}
                  />
                </View>
                <Text className="text-xs text-gray-400 ml-3 font-medium">
                  {completedCount}/{totalTasks}
                </Text>
              </View>
              <Text className="text-gray-400 text-sm">
                {completedCount === totalTasks
                  ? 'All done! Great job 🎉'
                  : `${totalTasks - completedCount} task${totalTasks - completedCount !== 1 ? 's' : ''} remaining`}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Streak + Badges row */}
        <View className="flex-row mx-5 mb-4" style={{ gap: 12 }}>
          <TouchableOpacity
            className="flex-1 bg-white rounded-2xl p-4"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.06,
              shadowRadius: 4,
              elevation: 2,
            }}
            onPress={() => navigation.navigate('Streaks' as never)}
          >
            <View className="w-10 h-10 bg-orange-50 rounded-xl items-center justify-center mb-3">
              <Ionicons name="flame" size={20} color="#f97316" />
            </View>
            <Text className="font-semibold text-gray-700 text-sm">Streak</Text>
            {streak ? (
              <>
                <Text className="text-2xl font-bold text-gray-900 mt-0.5">
                  {streak.currentStreak}
                  <Text className="text-sm font-normal text-gray-400"> days</Text>
                </Text>
                <Text className="text-gray-400 text-xs mt-0.5 capitalize">
                  {streak.streakStage.charAt(0) + streak.streakStage.slice(1).toLowerCase()}
                </Text>
              </>
            ) : (
              <Text className="text-gray-400 text-xs mt-0.5">No streak yet</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-white rounded-2xl p-4"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.06,
              shadowRadius: 4,
              elevation: 2,
            }}
            onPress={() => navigation.navigate('Badges' as never)}
          >
            <View className="w-10 h-10 bg-yellow-50 rounded-xl items-center justify-center mb-3">
              <Ionicons name="trophy" size={20} color="#eab308" />
            </View>
            <Text className="font-semibold text-gray-700 text-sm">Badges</Text>
            {badges.length > 0 ? (
              <>
                <Text className="text-2xl font-bold text-gray-900 mt-0.5">
                  {badges.filter((b) => b.earned).length}
                  <Text className="text-sm font-normal text-gray-400"> / {badges.length}</Text>
                </Text>
                <Text className="text-gray-400 text-xs mt-0.5">earned</Text>
              </>
            ) : (
              <Text className="text-gray-400 text-xs mt-0.5">Tap to view</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Overall consistency card */}
        <TouchableOpacity
          className="mx-5 bg-white rounded-2xl p-5"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 4,
            elevation: 2,
          }}
          onPress={() => navigation.navigate('Stats' as never)}
        >
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center" style={{ gap: 8 }}>
              <View className="w-8 h-8 bg-indigo-50 rounded-lg items-center justify-center">
                <Ionicons name="trending-up-outline" size={16} color="#6366f1" />
              </View>
              <Text className="font-semibold text-gray-800">Overall Consistency</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-indigo-600 text-sm font-medium">View stats</Text>
              <Ionicons name="chevron-forward" size={16} color="#4f46e5" />
            </View>
          </View>

          {overview ? (
            <>
              <View className="flex-row items-baseline mb-3">
                <Text className="text-3xl font-bold text-gray-900">
                  {overview.consistencyPercent}
                </Text>
                <Text className="text-gray-400 text-base ml-0.5">%</Text>
              </View>
              <View style={{ height: 6, backgroundColor: '#e0e7ff', borderRadius: 3 }}>
                <View
                  style={{
                    height: 6,
                    width: `${overview.consistencyPercent}%`,
                    backgroundColor: '#4f46e5',
                    borderRadius: 3,
                  }}
                />
              </View>
              <Text className="text-gray-400 text-xs mt-2">
                {overview.lifetimePoints.toLocaleString()} lifetime pts · {overview.badgesEarned} badges
              </Text>
            </>
          ) : (
            <Text className="text-gray-400 text-sm">Tap to view your stats</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
