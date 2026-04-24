import { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import { useTaskStore } from '../../store/taskStore';
import { useStreakStore } from '../../store/streakStore';
import { useBadgeStore } from '../../store/badgeStore';
import { useDailyPointsStore } from '../../store/dailyPointsStore';
import { useStatsStore } from '../../store/statsStore';
import { DEFAULT_DAILY_THRESHOLD } from '../../constants';

const BG = '#08080f';
const CARD = '#12121e';
const CARD_BORDER = 'rgba(255,255,255,0.07)';
const TEXT_PRIMARY = '#ffffff';
const TEXT_SECONDARY = '#6b6b9a';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 5)  return 'Burning the midnight oil';
  if (h < 12) return "Let's crush it today";
  if (h < 17) return 'Keep the momentum going';
  return 'Finish strong tonight';
};

const formatDate = (date: Date) =>
  date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

const getProgressMessage = (pct: number, goalMet: boolean) => {
  if (goalMet) return "Goal crushed! You're unstoppable 🔥";
  if (pct >= 75) return "Almost there — push through! 💪";
  if (pct >= 40) return "Good pace, keep building! ⚡";
  if (pct > 0)   return "You've started — don't stop now!";
  return "Add tasks and start earning points";
};

export default function DashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const { tasks, loadTasks } = useTaskStore();
  const { streak, loadStreak } = useStreakStore();
  const { badges, loadBadges } = useBadgeStore();
  const { dailyPoints, loadForDate } = useDailyPointsStore();
  const { overview, loadAll: loadStats } = useStatsStore();
  const navigation = useNavigation();

  const todayISO = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadTasks();
    loadStreak();
    loadBadges();
    loadForDate(todayISO);
    loadStats();
  }, []);

  const pointsEarned = tasks.filter((t) => t.completed).reduce((sum, t) => sum + t.points, 0);
  const completedCount = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;
  const threshold = dailyPoints?.thresholdPts ?? DEFAULT_DAILY_THRESHOLD;
  const progress = Math.min((pointsEarned / threshold) * 100, 100);
  const goalMet = pointsEarned >= threshold;
  const firstName = user?.displayName?.split(' ')[0] ?? 'there';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24 }}>
          <Text style={{ color: TEXT_SECONDARY, fontSize: 14, fontWeight: '500' }}>
            {getGreeting()},
          </Text>
          <Text style={{ color: TEXT_PRIMARY, fontSize: 30, fontWeight: '900', letterSpacing: -0.5, marginTop: 2 }}>
            {firstName} ⚡
          </Text>
          <Text style={{ color: '#3b3b5c', fontSize: 13, marginTop: 2 }}>
            {formatDate(new Date())}
          </Text>
        </View>

        {/* Daily progress hero */}
        <View
          style={{
            marginHorizontal: 20,
            marginBottom: 16,
            backgroundColor: '#1a1040',
            borderRadius: 24,
            padding: 24,
            borderWidth: 1,
            borderColor: 'rgba(99,102,241,0.25)',
            shadowColor: '#6366f1',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ color: '#a5b4fc', fontSize: 13, fontWeight: '600' }}>Daily Progress</Text>
            {goalMet && (
              <View style={{ backgroundColor: 'rgba(99,102,241,0.3)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 }}>
                <Text style={{ color: '#c7d2fe', fontSize: 12, fontWeight: '700' }}>Goal Crushed 🎯</Text>
              </View>
            )}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: 4 }}>
            <Text style={{ color: '#ffffff', fontSize: 64, fontWeight: '900', lineHeight: 68 }}>
              {pointsEarned}
            </Text>
            <Text style={{ color: '#6366f1', fontSize: 20, fontWeight: '700', marginBottom: 10, marginLeft: 6 }}>
              / {threshold}
            </Text>
            <Text style={{ color: '#6b6b9a', fontSize: 14, marginBottom: 12, marginLeft: 4 }}>pts</Text>
          </View>

          <Text style={{ color: '#7c7ca8', fontSize: 13, marginBottom: 16 }}>
            {getProgressMessage(progress, goalMet)}
          </Text>

          {/* Progress bar */}
          <View style={{ height: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 4 }}>
            <View
              style={{
                height: 8,
                width: `${progress}%`,
                backgroundColor: goalMet ? '#818cf8' : '#6366f1',
                borderRadius: 4,
                shadowColor: '#6366f1',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.8,
                shadowRadius: 6,
              }}
            />
          </View>
          <Text style={{ color: '#52527a', fontSize: 12, marginTop: 10 }}>
            {Math.round(progress)}% of daily goal · {completedCount}/{totalTasks} tasks done
          </Text>
        </View>

        {/* Tasks summary */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Tasks' as never)}
          style={{
            marginHorizontal: 20,
            marginBottom: 16,
            backgroundColor: CARD,
            borderRadius: 16,
            padding: 20,
            borderWidth: 1,
            borderColor: CARD_BORDER,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ color: TEXT_PRIMARY, fontWeight: '600', fontSize: 15 }}>Today's Tasks</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: '#818cf8', fontSize: 14, fontWeight: '500' }}>View all</Text>
              <Ionicons name="chevron-forward" size={16} color="#818cf8" />
            </View>
          </View>

          {totalTasks === 0 ? (
            <Text style={{ color: TEXT_SECONDARY, fontSize: 14 }}>No tasks yet — add some to earn points!</Text>
          ) : (
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <View style={{ flex: 1, borderRadius: 999, height: 6, backgroundColor: 'rgba(255,255,255,0.08)' }}>
                  <View
                    style={{
                      borderRadius: 999,
                      height: 6,
                      width: `${(completedCount / totalTasks) * 100}%`,
                      backgroundColor: '#6366f1',
                    }}
                  />
                </View>
                <Text style={{ color: TEXT_SECONDARY, fontSize: 12, marginLeft: 12, fontWeight: '500' }}>
                  {completedCount}/{totalTasks}
                </Text>
              </View>
              <Text style={{ color: TEXT_SECONDARY, fontSize: 14 }}>
                {completedCount === totalTasks
                  ? 'All done! Great job 🎉'
                  : `${totalTasks - completedCount} task${totalTasks - completedCount !== 1 ? 's' : ''} remaining`}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Streak + Badges row */}
        <View style={{ flexDirection: 'row', marginHorizontal: 20, marginBottom: 16, gap: 12 }}>
          {/* Streak */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Streaks' as never)}
            style={{
              flex: 1,
              backgroundColor: '#1a0e00',
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: 'rgba(249,115,22,0.25)',
              shadowColor: '#f97316',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <View style={{ width: 40, height: 40, backgroundColor: 'rgba(249,115,22,0.15)', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Ionicons name="flame" size={20} color="#f97316" />
            </View>
            <Text style={{ color: '#6b6b9a', fontSize: 14, fontWeight: '600' }}>Streak</Text>
            {streak ? (
              <>
                <Text style={{ color: '#ffffff', fontSize: 24, fontWeight: '900', marginTop: 2 }}>
                  {streak.currentStreak}
                  <Text style={{ fontSize: 14, fontWeight: '400', color: TEXT_SECONDARY }}> days</Text>
                </Text>
                <Text style={{ color: '#f97316', fontSize: 12, marginTop: 2 }}>
                  {streak.streakStage.charAt(0) + streak.streakStage.slice(1).toLowerCase()}
                </Text>
              </>
            ) : (
              <Text style={{ color: TEXT_SECONDARY, fontSize: 12, marginTop: 2 }}>No streak yet</Text>
            )}
          </TouchableOpacity>

          {/* Badges */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Badges' as never)}
            style={{
              flex: 1,
              backgroundColor: '#130f00',
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: 'rgba(245,158,11,0.25)',
              shadowColor: '#f59e0b',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <View style={{ width: 40, height: 40, backgroundColor: 'rgba(245,158,11,0.15)', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Ionicons name="trophy" size={20} color="#f59e0b" />
            </View>
            <Text style={{ color: '#6b6b9a', fontSize: 14, fontWeight: '600' }}>Badges</Text>
            {badges.length > 0 ? (
              <>
                <Text style={{ color: '#ffffff', fontSize: 24, fontWeight: '900', marginTop: 2 }}>
                  {badges.filter((b) => b.earned).length}
                  <Text style={{ fontSize: 14, fontWeight: '400', color: TEXT_SECONDARY }}> / {badges.length}</Text>
                </Text>
                <Text style={{ color: '#f59e0b', fontSize: 12, marginTop: 2 }}>earned</Text>
              </>
            ) : (
              <Text style={{ color: TEXT_SECONDARY, fontSize: 12, marginTop: 2 }}>Tap to view</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Consistency card */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Stats' as never)}
          style={{
            marginHorizontal: 20,
            backgroundColor: '#0a1a0f',
            borderRadius: 20,
            padding: 20,
            borderWidth: 1,
            borderColor: 'rgba(16,185,129,0.2)',
            shadowColor: '#10b981',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.12,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(16,185,129,0.15)', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="trending-up-outline" size={17} color="#10b981" />
              </View>
              <Text style={{ color: TEXT_PRIMARY, fontWeight: '700', fontSize: 15 }}>Overall Consistency</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ color: '#10b981', fontSize: 13, fontWeight: '600' }}>View stats</Text>
              <Ionicons name="chevron-forward" size={16} color="#10b981" />
            </View>
          </View>

          {overview ? (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12 }}>
                <Text style={{ color: '#ffffff', fontSize: 44, fontWeight: '900', lineHeight: 48 }}>
                  {overview.consistencyPercent}
                </Text>
                <Text style={{ color: '#10b981', fontSize: 20, fontWeight: '700', marginBottom: 6, marginLeft: 2 }}>%</Text>
              </View>
              <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 3 }}>
                <View
                  style={{
                    height: 6,
                    width: `${overview.consistencyPercent}%`,
                    backgroundColor: '#10b981',
                    borderRadius: 3,
                    shadowColor: '#10b981',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.6,
                    shadowRadius: 6,
                  }}
                />
              </View>
              <Text style={{ color: '#3b5c47', fontSize: 12, marginTop: 10 }}>
                {overview.lifetimePoints.toLocaleString()} lifetime pts · {overview.badgesEarned} badges earned
              </Text>
            </>
          ) : (
            <Text style={{ color: TEXT_SECONDARY, fontSize: 14 }}>Tap to view your stats</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
