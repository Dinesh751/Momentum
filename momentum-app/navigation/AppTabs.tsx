import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DashboardScreen from '../app/dashboard/DashboardScreen';
import TasksScreen from '../app/tasks/TasksScreen';
import StreaksScreen from '../app/streaks/StreaksScreen';
import BadgesScreen from '../app/badges/BadgesScreen';
import StatsScreen from '../app/stats/StatsScreen';

export type AppTabsParamList = {
  Dashboard: undefined;
  Tasks: undefined;
  Streaks: undefined;
  Badges: undefined;
  Stats: undefined;
};

const Tab = createBottomTabNavigator<AppTabsParamList>();

const TAB_ICONS: Record<keyof AppTabsParamList, [string, string]> = {
  Dashboard: ['grid', 'grid-outline'],
  Tasks:     ['checkmark-circle', 'checkmark-circle-outline'],
  Streaks:   ['flame', 'flame-outline'],
  Badges:    ['trophy', 'trophy-outline'],
  Stats:     ['bar-chart', 'bar-chart-outline'],
};

export default function AppTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const [active, inactive] = TAB_ICONS[route.name as keyof AppTabsParamList];
        return {
          headerShown: false,
          tabBarActiveTintColor: '#818cf8',
          tabBarInactiveTintColor: '#3b3b5c',
          tabBarStyle: {
            backgroundColor: '#0d0d1a',
            borderTopColor: 'rgba(255,255,255,0.06)',
            borderTopWidth: 1,
            height: 60 + insets.bottom,
            paddingBottom: insets.bottom + 8,
            paddingTop: 8,
          },
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={(focused ? active : inactive) as any}
              size={size}
              color={color}
            />
          ),
        };
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Tasks" component={TasksScreen} />
      <Tab.Screen name="Streaks" component={StreaksScreen} />
      <Tab.Screen name="Badges" component={BadgesScreen} />
      <Tab.Screen name="Stats" component={StatsScreen} />
    </Tab.Navigator>
  );
}
