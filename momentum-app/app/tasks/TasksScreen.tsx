import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TasksStackParamList } from '../../navigation/TasksStack';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTaskStore } from '../../store/taskStore';
import { useDailyPointsStore } from '../../store/dailyPointsStore';
import { useBacklogStore } from '../../store/backlogStore';
import taskService from '../../services/taskService';
import { DEFAULT_DAILY_THRESHOLD } from '../../constants';
import { Task, Priority } from '../../types';
import AddTaskModal from './AddTaskModal';
import OfflineBanner from '../../components/OfflineBanner';
import SeriesBottomSheet from '../../components/SeriesBottomSheet';
import { localDateISO, offsetLocalDateISO } from '../../utils/date';

const PRIORITY_COLORS: Record<Priority, { text: string; bg: string }> = {
  HIGH: { text: '#ef4444', bg: '#fef2f2' },
  MID:  { text: '#f59e0b', bg: '#fffbeb' },
  LOW:  { text: '#3b82f6', bg: '#eff6ff' },
  NONE: { text: '#9ca3af', bg: '#f9fafb' },
};

const todayISO = () => localDateISO();
const offsetDateISO = (dateStr: string, days: number) => offsetLocalDateISO(dateStr, days);

const formatDateLabel = (dateStr: string) => {
  const today = todayISO();
  if (dateStr === today) return 'Today';
  if (dateStr === offsetDateISO(today, -1)) return 'Yesterday';
  if (dateStr === offsetDateISO(today, 1)) return 'Tomorrow';
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' });
};

const formatDateSub = (dateStr: string) =>
  new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

function TomorrowAction({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="items-center justify-center rounded-l-2xl"
      style={{ width: 88, backgroundColor: '#6366f1' }}
    >
      <Ionicons name="arrow-forward-circle" size={26} color="white" />
      <Text style={{ color: 'white', fontSize: 12, fontWeight: '700', marginTop: 4 }}>
        Tomorrow
      </Text>
    </TouchableOpacity>
  );
}

function TaskCard({
  task,
  onToggle,
  onDelete,
  onMoveToTomorrow,
  onSeriesTap,
  isToday,
  isCarriedOver,
}: {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  onMoveToTomorrow: () => void;
  onSeriesTap: (task: Task) => void;
  isToday: boolean;
  isCarriedOver: boolean;
}) {
  const swipeableRef = useRef<Swipeable>(null);
  const colors = PRIORITY_COLORS[task.priority];
  const stripColor = task.completed ? '#e5e7eb' : colors.text;

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={() => <TomorrowAction onPress={onMoveToTomorrow} />}
      onSwipeableLeftOpen={onMoveToTomorrow}
      friction={2}
      overshootFriction={8}
      containerStyle={{ marginHorizontal: 16, marginBottom: 12 }}
    >
      <View
        className="bg-white rounded-2xl"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.06,
          shadowRadius: 4,
          elevation: 2,
          flexDirection: 'row',
          overflow: 'hidden',
        }}
      >
        <View style={{ width: 4, backgroundColor: stripColor }} />

        <View className="flex-row items-center px-4 py-4" style={{ flex: 1 }}>
          <Pressable
            onPress={isToday ? onToggle : undefined}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={task.completed ? 'checkmark-circle' : 'ellipse-outline'}
              size={26}
              color={task.completed ? '#4f46e5' : isToday ? '#d1d5db' : '#e5e7eb'}
            />
          </Pressable>

          <View className="flex-1 mx-3">
            <Text
              className="text-base font-semibold"
              style={{
                color: task.completed ? '#9ca3af' : '#111827',
                textDecorationLine: task.completed ? 'line-through' : 'none',
              }}
            >
              {task.title}
            </Text>
            {(isCarriedOver || !!task.recurringGroupId) && (
            <View className="flex-row flex-wrap mt-1" style={{ gap: 4 }}>
              {isCarriedOver && (
                <View
                  className="self-start flex-row items-center px-2 py-0.5 rounded-md"
                  style={{ backgroundColor: '#fef3c7' }}
                >
                  <Ionicons name="time-outline" size={10} color="#d97706" style={{ marginRight: 3 }} />
                  <Text style={{ fontSize: 10, fontWeight: '700', color: '#d97706' }}>
                    Carried over
                  </Text>
                </View>
              )}
              {task.recurringGroupId && (
                <TouchableOpacity
                  onPress={() => onSeriesTap(task)}
                  className="self-start flex-row items-center px-2 py-0.5 rounded-md"
                  style={{ backgroundColor: '#eef2ff' }}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <Ionicons name="repeat" size={10} color="#4f46e5" style={{ marginRight: 3 }} />
                  <Text style={{ fontSize: 10, fontWeight: '700', color: '#4f46e5' }}>
                    Recurring
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            )}
            {task.description ? (
              <Text
                className="text-sm mt-0.5"
                numberOfLines={1}
                style={{
                  color: '#9ca3af',
                  textDecorationLine: task.completed ? 'line-through' : 'none',
                }}
              >
                {task.description}
              </Text>
            ) : null}
          </View>

          <View className="items-end mr-3">
            {task.priority !== 'NONE' && (
              <View className="px-2 py-0.5 rounded-md mb-1" style={{ backgroundColor: colors.bg }}>
                <Text className="text-xs font-bold" style={{ color: colors.text }}>
                  {task.priority}
                </Text>
              </View>
            )}
            <Text className="text-xs font-medium text-gray-400">{task.points} pts</Text>
          </View>

          <Pressable
            onPress={task.completed ? undefined : onDelete}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{ opacity: task.completed ? 0.3 : 1 }}
          >
            <Ionicons name="trash-outline" size={18} color="#d1d5db" />
          </Pressable>
        </View>
      </View>
    </Swipeable>
  );
}

function ProgressHeader({ selectedDate }: { selectedDate: string }) {
  const navigation = useNavigation<NativeStackNavigationProp<TasksStackParamList>>();
  const tasks = useTaskStore((s) => s.tasks);
  const dailyPoints = useDailyPointsStore((s) => s.dailyPoints);
  const backlogCount = useBacklogStore((s) => s.tasks.length);
  const threshold = dailyPoints?.thresholdPts ?? DEFAULT_DAILY_THRESHOLD;
  const pointsEarned = tasks.filter((t) => t.completed).reduce((sum, t) => sum + t.points, 0);
  const completedCount = tasks.filter((t) => t.completed).length;
  const progress = Math.min((pointsEarned / threshold) * 100, 100);
  const goalMet = pointsEarned >= threshold;

  return (
    <View>
      <View className="flex-row items-center px-4 pt-4 pb-3">
        {/* Spacer to keep date centred */}
        <View style={{ width: 80 }} />

        <View className="flex-1 items-center">
          <Text className="text-2xl font-bold text-gray-900">{formatDateLabel(selectedDate)}</Text>
          <Text className="text-gray-400 text-sm mt-0.5">{formatDateSub(selectedDate)}</Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('Backlog')}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#eef2ff',
            borderRadius: 20,
            paddingHorizontal: 10,
            paddingVertical: 6,
            gap: 5,
            marginRight: 4,
          }}
        >
          <Ionicons name="file-tray-outline" size={15} color="#4f46e5" />
          <Text style={{ fontSize: 12, fontWeight: '700', color: '#4f46e5' }}>Backlog</Text>
          {backlogCount > 0 && (
            <View
              style={{
                backgroundColor: '#4f46e5',
                borderRadius: 8,
                minWidth: 16,
                height: 16,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 4,
              }}
            >
              <Text style={{ color: 'white', fontSize: 9, fontWeight: '800' }}>
                {backlogCount > 99 ? '99+' : backlogCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View className="mx-4 mb-5 bg-indigo-600 rounded-2xl p-5">
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
            style={{ height: 6, backgroundColor: 'white', borderRadius: 3, width: `${progress}%` }}
          />
        </View>
        <View className="flex-row justify-between mt-2.5">
          <Text className="text-indigo-300 text-xs">
            {completedCount} of {tasks.length} tasks done
          </Text>
          <Text className="text-indigo-300 text-xs">{Math.round(progress)}%</Text>
        </View>
      </View>

      <View className="flex-row justify-between items-center px-4 mb-3">
        <Text className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Tasks</Text>
        <Text className="text-xs text-gray-400">
          {tasks.filter((t) => !t.completed).length} remaining
        </Text>
      </View>
    </View>
  );
}

function DayStrip({
  selectedDate,
  onPrev,
  onNext,
}: {
  selectedDate: string;
  onPrev: () => void;
  onNext: () => void;
}) {
  const prevRef = useRef(onPrev);
  const nextRef = useRef(onNext);
  useEffect(() => { prevRef.current = onPrev; }, [onPrev]);
  useEffect(() => { nextRef.current = onNext; }, [onNext]);

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > Math.abs(gs.dy) && Math.abs(gs.dx) > 20,
      onPanResponderRelease: (_, gs) => {
        if (gs.dx > 60) nextRef.current();   // swipe right → tomorrow (right side of strip)
        else if (gs.dx < -60) prevRef.current(); // swipe left → yesterday (left side of strip)
      },
    })
  ).current;

  const prevDate = offsetDateISO(selectedDate, -1);
  const nextDate = offsetDateISO(selectedDate, 1);

  return (
    <View
      {...pan.panHandlers}
      style={{
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        paddingVertical: 12,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 12,
      }}
    >
      <TouchableOpacity onPress={onPrev} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons name="chevron-back" size={22} color="#9ca3af" />
      </TouchableOpacity>

      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        <TouchableOpacity
          onPress={onPrev}
          style={{ flex: 1, alignItems: 'center', paddingVertical: 6 }}
        >
          <Text style={{ fontSize: 13, color: '#9ca3af', fontWeight: '500' }} numberOfLines={1}>
            {formatDateLabel(prevDate)}
          </Text>
        </TouchableOpacity>

        <View
          style={{
            backgroundColor: '#eef2ff',
            borderRadius: 20,
            paddingHorizontal: 18,
            paddingVertical: 8,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#4f46e5' }}>
            {formatDateLabel(selectedDate)}
          </Text>
        </View>

        <TouchableOpacity
          onPress={onNext}
          style={{ flex: 1, alignItems: 'center', paddingVertical: 6 }}
        >
          <Text style={{ fontSize: 13, color: '#9ca3af', fontWeight: '500' }} numberOfLines={1}>
            {formatDateLabel(nextDate)}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={onNext} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons name="chevron-forward" size={22} color="#9ca3af" />
      </TouchableOpacity>
    </View>
  );
}

type DayRange = '1d' | '3d' | '7d' | 'all';

const RANGE_OPTIONS: { label: string; value: DayRange }[] = [
  { label: '1d', value: '1d' },
  { label: '3d', value: '3d' },
  { label: '7d', value: '7d' },
  { label: 'All', value: 'all' },
];

function CarryOverPrompt({
  tasks,
  selectedRange,
  onRangeChange,
  onConfirm,
  onSkip,
  isConfirming,
  isRangeLoading,
  rangeError,
}: {
  tasks: Task[];
  selectedRange: DayRange;
  onRangeChange: (range: DayRange) => void;
  onConfirm: (selectedIds: number[]) => void;
  onSkip: () => void;
  isConfirming: boolean;
  isRangeLoading: boolean;
  rangeError: string | null;
}) {
  const [selectedIds, setSelectedIds] = useState<number[]>(() => tasks.map((t) => t.id));

  useEffect(() => {
    setSelectedIds(tasks.map((t) => t.id));
  }, [tasks]);

  const toggleId = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const canConfirm = !isConfirming && !isRangeLoading && tasks.length > 0;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onSkip}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
        <View className="bg-white rounded-t-3xl" style={{ maxHeight: '75%' }}>

          {/* Fixed header */}
          <View className="px-6 pt-5">
            <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-5" />

            <View className="flex-row items-center mb-1">
              <View
                className="w-8 h-8 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: '#fef3c7' }}
              >
                <Ionicons name="time-outline" size={18} color="#d97706" />
              </View>
              <Text className="text-lg font-bold text-gray-900">
                {tasks.length} incomplete task{tasks.length > 1 ? 's' : ''} from the past
              </Text>
            </View>
            <Text className="text-sm text-gray-400 mb-4 ml-11">
              Select which ones to add to today
            </Text>

            {/* Range selector */}
            <View className="flex-row mb-4" style={{ gap: 8 }}>
              {RANGE_OPTIONS.map((opt) => {
                const active = selectedRange === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => onRangeChange(opt.value)}
                    className="flex-1 items-center py-2 rounded-xl"
                    style={{
                      backgroundColor: active ? '#eef2ff' : '#f8fafc',
                      borderWidth: 1.5,
                      borderColor: active ? '#6366f1' : '#e2e8f0',
                    }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '700', color: active ? '#4f46e5' : '#9ca3af' }}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Scrollable task list */}
          <ScrollView style={{ maxHeight: 200 }} className="px-6">
            {isRangeLoading ? (
              <ActivityIndicator color="#6366f1" style={{ paddingVertical: 24 }} />
            ) : rangeError ? (
              <Text className="text-center text-red-400 text-sm py-6">{rangeError}</Text>
            ) : tasks.length === 0 ? (
              <Text className="text-center text-gray-400 text-sm py-6">
                No incomplete tasks in this range
              </Text>
            ) : (
              tasks.map((t) => {
                const selected = selectedIds.includes(t.id);
                return (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => toggleId(t.id)}
                    className="flex-row items-center py-3 border-b border-gray-50"
                    style={{ opacity: selected ? 1 : 0.4 }}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={selected ? 'checkmark-circle' : 'ellipse-outline'}
                      size={22}
                      color={selected ? '#4f46e5' : '#d1d5db'}
                      style={{ marginRight: 10 }}
                    />
                    <Text
                      className="text-gray-700 text-sm flex-1"
                      numberOfLines={1}
                      style={{ textDecorationLine: selected ? 'none' : 'line-through' }}
                    >
                      {t.title}
                    </Text>
                    <View
                      className="px-2 py-0.5 rounded-md ml-2"
                      style={{ backgroundColor: PRIORITY_COLORS[t.priority].bg }}
                    >
                      <Text style={{ fontSize: 10, fontWeight: '700', color: PRIORITY_COLORS[t.priority].text }}>
                        {t.priority}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>

          {/* Fixed footer */}
          <View className="px-6 pt-4 pb-10">
            <TouchableOpacity
              className="bg-indigo-600 rounded-xl py-4 mb-3"
              onPress={() => onConfirm(selectedIds)}
              disabled={!canConfirm}
              style={{ opacity: canConfirm ? 1 : 0.6 }}
            >
              {isConfirming ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text
                  className="text-white font-bold text-base"
                  style={{ textAlign: 'center' }}
                >
                  {selectedIds.length > 0
                    ? `Add to Today`
                    : 'Discard All'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity className="items-center py-2" onPress={onSkip}>
              <Text className="text-gray-400 font-medium text-sm">Skip for now</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}

function EmptyState() {
  return (
    <View className="items-center py-12 px-8">
      <View className="w-16 h-16 bg-indigo-50 rounded-2xl items-center justify-center mb-4">
        <Ionicons name="checkmark-done-outline" size={32} color="#a5b4fc" />
      </View>
      <Text className="text-gray-700 font-semibold text-base mb-1">No tasks yet</Text>
      <Text className="text-gray-400 text-sm text-center">
        Tap the + button to add your first task for today
      </Text>
    </View>
  );
}

const afterDateForRange = (range: DayRange): string | undefined => {
  if (range === '1d') return offsetDateISO(todayISO(), -1);
  if (range === '3d') return offsetDateISO(todayISO(), -3);
  if (range === '7d') return offsetDateISO(todayISO(), -7);
  return undefined;
};

export default function TasksScreen() {
  const {
    tasks, selectedDate, isLoading, loadTasks,
    toggleComplete, deleteTask, moveToTomorrow,
    carriedOverIds, carryOverFromYesterday,
  } = useTaskStore();
  const loadDailyPoints = useDailyPointsStore((s) => s.loadForDate);
  const loadBacklog = useBacklogStore((s) => s.loadBacklog);
  const [modalVisible, setModalVisible] = useState(false);
  const [seriesTask, setSeriesTask] = useState<Task | null>(null);
  const [carryOverTasks, setCarryOverTasks] = useState<Task[]>([]);
  const [carryOverLoading, setCarryOverLoading] = useState(false);
  const [carryOverRange, setCarryOverRange] = useState<DayRange>('3d');
  const [isRangeLoading, setIsRangeLoading] = useState(false);
  const [rangeError, setRangeError] = useState<string | null>(null);
  const isPast = selectedDate < todayISO();

  useEffect(() => {
    loadBacklog();
  }, []);

  useEffect(() => {
    loadTasks();
    loadDailyPoints(todayISO());
    taskService.getIncompleteBefore(todayISO(), afterDateForRange('3d'))
      .then((fetched) => {
        if (fetched.length > 0) setCarryOverTasks(fetched);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadDailyPoints(selectedDate);
  }, [selectedDate]);

  const handleRangeChange = async (range: DayRange) => {
    setCarryOverRange(range);
    setIsRangeLoading(true);
    setRangeError(null);
    try {
      const fetched = await taskService.getIncompleteBefore(todayISO(), afterDateForRange(range));
      setCarryOverTasks(fetched);
    } catch {
      setRangeError('Failed to load tasks for this range');
    } finally {
      setIsRangeLoading(false);
    }
  };

  const goToPrevDay = useCallback(() => {
    loadTasks(offsetDateISO(selectedDate, -1));
  }, [selectedDate, loadTasks]);

  const goToNextDay = useCallback(() => {
    loadTasks(offsetDateISO(selectedDate, 1));
  }, [selectedDate, loadTasks]);

  return (
    <>
      <SafeAreaView edges={['top']} className="flex-1 bg-gray-50">
        {isLoading && tasks.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#4f46e5" />
          </View>
        ) : (
          <View className="flex-1">
            <OfflineBanner />
            <FlatList
              data={tasks}
              keyExtractor={(item) => item.id.toString()}
              ListHeaderComponent={<ProgressHeader selectedDate={selectedDate} />}
              ListEmptyComponent={<EmptyState />}
              renderItem={({ item }) => (
                <TaskCard
                  task={item}
                  onToggle={() => toggleComplete(item)}
                  onDelete={() => deleteTask(item.id)}
                  onMoveToTomorrow={() => moveToTomorrow(item.id)}
                  onSeriesTap={setSeriesTask}
                  isToday={selectedDate === todayISO()}
                  isCarriedOver={carriedOverIds.includes(item.id)}
                />
              )}
              refreshControl={
                <RefreshControl
                  refreshing={isLoading}
                  onRefresh={() => loadTasks(selectedDate)}
                  tintColor="#4f46e5"
                />
              }
              contentContainerStyle={{ paddingBottom: 80 }}
              showsVerticalScrollIndicator={false}
              style={{ flex: 1 }}
            />

            {/* DayStrip in normal flow — FlatList stops here, no touch overlap */}
            <DayStrip
              selectedDate={selectedDate}
              onPrev={goToPrevDay}
              onNext={goToNextDay}
            />

            {!isPast && (
              <TouchableOpacity
                className="absolute right-5 w-14 h-14 bg-indigo-600 rounded-full items-center justify-center"
                style={{
                  bottom: 80,
                  shadowColor: '#4f46e5',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.4,
                  shadowRadius: 8,
                  elevation: 8,
                }}
                onPress={() => setModalVisible(true)}
              >
                <Ionicons name="add" size={28} color="white" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </SafeAreaView>

      <AddTaskModal visible={modalVisible} onClose={() => setModalVisible(false)} selectedDate={selectedDate} />

      {seriesTask?.recurringGroupId && (
        <SeriesBottomSheet
          visible={!!seriesTask}
          groupId={seriesTask.recurringGroupId}
          fromDate={
            seriesTask.completed && seriesTask.dueDate === todayISO()
              ? offsetDateISO(todayISO(), 1)
              : todayISO()
          }
          onClose={() => setSeriesTask(null)}
          onDeleted={() => {
            setSeriesTask(null);
            loadTasks(selectedDate);
          }}
        />
      )}

      {carryOverTasks.length > 0 && (
        <CarryOverPrompt
          tasks={carryOverTasks}
          selectedRange={carryOverRange}
          onRangeChange={handleRangeChange}
          isConfirming={carryOverLoading}
          isRangeLoading={isRangeLoading}
          rangeError={rangeError}
          onConfirm={async (selectedIds) => {
            setCarryOverLoading(true);
            const toMove = carryOverTasks.filter((t) => selectedIds.includes(t.id));
            const toDelete = carryOverTasks.filter((t) => !selectedIds.includes(t.id));
            await Promise.all([
              toMove.length > 0 ? carryOverFromYesterday(toMove) : Promise.resolve(),
              ...toDelete.map((t) => taskService.remove(t.id)),
            ]);
            setCarryOverLoading(false);
            setCarryOverTasks([]);
          }}
          onSkip={() => setCarryOverTasks([])}
        />
      )}
    </>
  );
}
