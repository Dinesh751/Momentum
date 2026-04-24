import { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import { useTaskStore } from '../../store/taskStore';
import { DEFAULT_DAILY_THRESHOLD } from '../../constants';

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
  const { tasks, loadTasks } = useTaskStore();
  const navigation = useNavigation();

  useEffect(() => {
    loadTasks();
  }, []);

  const pointsEarned = tasks.filter((t) => t.completed).reduce((sum, t) => sum + t.points, 0);
  const completedCount = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;
  const progress = Math.min((pointsEarned / DEFAULT_DAILY_THRESHOLD) * 100, 100);
  const goalMet = pointsEarned >= DEFAULT_DAILY_THRESHOLD;
  const firstName = user?.displayName?.split(' ')[0] ?? 'there';

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        {/* Header */}
        <View className="px-5 pt-4 pb-6">
          <Text className="text-gray-400 text-sm">{getGreeting()},</Text>
          <Text className="text-2xl font-bold text-gray-900">{firstName} 👋</Text>
          <Text className="text-gray-400 text-sm mt-0.5">{formatDate(new Date())}</Text>
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
            <Text className="text-indigo-300 text-base ml-1">/ {DEFAULT_DAILY_THRESHOLD} pts</Text>
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
        <View className="flex-row mx-5" style={{ gap: 12 }}>
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
            <View className="w-10 h-10 bg-orange-50 rounded-xl items-center justify-center mb-3">
              <Ionicons name="flame" size={20} color="#f97316" />
            </View>
            <Text className="font-semibold text-gray-700 text-sm">Streak</Text>
            <Text className="text-gray-400 text-xs mt-0.5">Coming soon</Text>
          </View>

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
            <View className="w-10 h-10 bg-yellow-50 rounded-xl items-center justify-center mb-3">
              <Ionicons name="trophy" size={20} color="#eab308" />
            </View>
            <Text className="font-semibold text-gray-700 text-sm">Badges</Text>
            <Text className="text-gray-400 text-xs mt-0.5">Coming soon</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
