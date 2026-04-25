import { useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useBadgeStore } from '../../store/badgeStore';
import { Badge } from '../../types';
import LoadingScreen from '../../components/LoadingScreen';
import ErrorScreen from '../../components/ErrorScreen';
import OfflineBanner from '../../components/OfflineBanner';

// ─── Badge visual config ─────────────────────────────────────────────────────

const BADGE_META: Record<
  string,
  { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }
> = {
  FIRST_STEP:        { icon: 'footsteps-outline',           color: '#10b981', bg: '#ecfdf5' },
  ON_FIRE:           { icon: 'flame',                        color: '#f97316', bg: '#fff7ed' },
  WEEK_WARRIOR:      { icon: 'shield-checkmark-outline',     color: '#6366f1', bg: '#eef2ff' },
  DIAMOND_HABIT:     { icon: 'diamond-outline',              color: '#06b6d4', bg: '#ecfeff' },
  CENTURY_CLUB:      { icon: 'trophy',                       color: '#eab308', bg: '#fefce8' },
  SHARPSHOOTER:      { icon: 'flash',                        color: '#ef4444', bg: '#fef2f2' },
  OVERACHIEVER:      { icon: 'rocket-outline',               color: '#8b5cf6', bg: '#f5f3ff' },
  PERFECT_WEEK:      { icon: 'star',                         color: '#f59e0b', bg: '#fffbeb' },
  POINT_MILLIONAIRE: { icon: 'cash-outline',                 color: '#059669', bg: '#ecfdf5' },
  '10K_CLUB':        { icon: 'infinite-outline',             color: '#4f46e5', bg: '#eef2ff' },
  CLEAN_SWEEP:       { icon: 'checkmark-done-circle-outline', color: '#0ea5e9', bg: '#f0f9ff' },
  EARLY_BIRD:        { icon: 'sunny-outline',                color: '#f59e0b', bg: '#fffbeb' },
};

const FALLBACK_META = { icon: 'ribbon-outline' as keyof typeof Ionicons.glyphMap, color: '#9ca3af', bg: '#f9fafb' };

// ─── Badge card ──────────────────────────────────────────────────────────────

function BadgeCard({ badge }: { badge: Badge }) {
  const meta = BADGE_META[badge.code] ?? FALLBACK_META;

  const earnedDate = badge.earnedAt
    ? new Date(badge.earnedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <View
      className="bg-white rounded-2xl p-4"
      style={{
        flex: 1,
        margin: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: badge.earned ? 0.08 : 0.04,
        shadowRadius: 4,
        elevation: badge.earned ? 3 : 1,
        opacity: badge.earned ? 1 : 0.5,
      }}
    >
      <View
        className="w-12 h-12 rounded-2xl items-center justify-center mb-3"
        style={{ backgroundColor: badge.earned ? meta.bg : '#f3f4f6' }}
      >
        <Ionicons
          name={badge.earned ? meta.icon : 'lock-closed-outline'}
          size={24}
          color={badge.earned ? meta.color : '#9ca3af'}
        />
      </View>

      <Text
        className="text-sm font-bold mb-0.5"
        style={{ color: badge.earned ? '#111827' : '#9ca3af' }}
        numberOfLines={2}
      >
        {badge.name}
      </Text>

      <Text
        className="text-xs leading-4"
        style={{ color: badge.earned ? '#6b7280' : '#d1d5db' }}
        numberOfLines={3}
      >
        {badge.description}
      </Text>

      {badge.earned && earnedDate && (
        <View className="flex-row items-center mt-2">
          <Ionicons name="checkmark-circle" size={12} color={meta.color} style={{ marginRight: 3 }} />
          <Text style={{ fontSize: 10, color: meta.color, fontWeight: '700' }}>
            {earnedDate}
          </Text>
        </View>
      )}
    </View>
  );
}

// ─── Animated badge card (earned badges get staggered entrance) ───────────────

function AnimatedBadgeCard({ badge, index }: { badge: Badge; index: number }) {
  const scaleAnim = useRef(new Animated.Value(badge.earned ? 0.6 : 1)).current;
  const opacityAnim = useRef(new Animated.Value(badge.earned ? 0 : 1)).current;

  useEffect(() => {
    if (!badge.earned) return;
    const delay = Math.min(index * 50, 400);
    Animated.parallel([
      Animated.sequence([
        Animated.delay(delay),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 7,
          tension: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  if (!badge.earned) return <BadgeCard badge={badge} />;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], opacity: opacityAnim }}>
      <BadgeCard badge={badge} />
    </Animated.View>
  );
}

// ─── Header ──────────────────────────────────────────────────────────────────

function BadgesHeader({ total, earned }: { total: number; earned: number }) {
  const pct = total > 0 ? Math.round((earned / total) * 100) : 0;

  return (
    <View>
      <View className="px-5 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900">Badges</Text>
        <Text className="text-gray-400 text-sm mt-0.5">Your achievements</Text>
      </View>

      <OfflineBanner />

      {/* Summary card */}
      <View className="mx-5 mt-4 mb-2 bg-indigo-600 rounded-2xl p-5">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-indigo-200 text-sm font-medium">Badges earned</Text>
            <View className="flex-row items-baseline mt-1">
              <Text className="text-white text-4xl font-bold">{earned}</Text>
              <Text className="text-indigo-300 text-base ml-1">/ {total}</Text>
            </View>
          </View>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: 'rgba(255,255,255,0.15)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="trophy" size={32} color="rgba(255,255,255,0.9)" />
          </View>
        </View>

        <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3 }}>
          <View
            style={{
              height: 6,
              backgroundColor: 'white',
              borderRadius: 3,
              width: `${pct}%`,
            }}
          />
        </View>
        <Text className="text-indigo-300 text-xs mt-2">{pct}% complete</Text>
      </View>

      {/* Encouragement when no badges earned yet */}
      {earned === 0 && total > 0 && (
        <View
          className="mx-5 mb-2 rounded-2xl px-4 py-4 flex-row items-center"
          style={{ backgroundColor: '#fffbeb', borderWidth: 1, borderColor: '#fde68a' }}
        >
          <Ionicons name="sparkles-outline" size={22} color="#d97706" style={{ marginRight: 12 }} />
          <View className="flex-1">
            <Text className="text-sm font-semibold" style={{ color: '#92400e' }}>
              Start earning badges!
            </Text>
            <Text className="text-xs mt-0.5" style={{ color: '#b45309' }}>
              Complete tasks and build your streak to unlock achievements
            </Text>
          </View>
        </View>
      )}

      <Text className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-5 mb-1 mt-3">
        All Badges
      </Text>
    </View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function BadgesScreen() {
  const { badges, isLoading, error, loadBadges } = useBadgeStore();

  useEffect(() => {
    loadBadges();
  }, []);

  if (isLoading && badges.length === 0) return <LoadingScreen />;
  if (error && badges.length === 0) return <ErrorScreen onRetry={loadBadges} />;

  const earnedCount = badges.filter((b) => b.earned).length;

  // Sort: earned first (newest first), then locked
  const sorted = [...badges].sort((a, b) => {
    if (a.earned && !b.earned) return -1;
    if (!a.earned && b.earned) return 1;
    if (a.earned && b.earned) {
      return new Date(b.earnedAt!).getTime() - new Date(a.earnedAt!).getTime();
    }
    return 0;
  });

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-gray-50">
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.code}
        numColumns={2}
        ListHeaderComponent={
          <BadgesHeader total={badges.length} earned={earnedCount} />
        }
        renderItem={({ item, index }) => (
          <AnimatedBadgeCard badge={item} index={index} />
        )}
        contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={{ paddingHorizontal: 4 }}
      />
    </SafeAreaView>
  );
}
