import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useBacklogStore, SchedulePayload } from '../../store/backlogStore';
import { Task, Priority, DayOfWeek } from '../../types';
import AddBacklogTaskModal from './AddBacklogTaskModal';
import DatePickerField from '../../components/DatePickerField';
import { localDateISO, offsetLocalDateISO } from '../../utils/date';

const PRIORITY_COLORS: Record<Priority, { text: string; bg: string }> = {
  HIGH: { text: '#ef4444', bg: '#fef2f2' },
  MID:  { text: '#f59e0b', bg: '#fffbeb' },
  LOW:  { text: '#3b82f6', bg: '#eff6ff' },
  NONE: { text: '#9ca3af', bg: '#f9fafb' },
};

const PRIORITIES: { value: Priority; label: string; color: string; bg: string }[] = [
  { value: 'HIGH', label: 'HIGH', color: '#ef4444', bg: '#fef2f2' },
  { value: 'MID',  label: 'MID',  color: '#f59e0b', bg: '#fffbeb' },
  { value: 'LOW',  label: 'LOW',  color: '#3b82f6', bg: '#eff6ff' },
  { value: 'NONE', label: 'NONE', color: '#9ca3af', bg: '#f9fafb' },
];

const DAYS: { short: string; value: DayOfWeek }[] = [
  { short: 'Su', value: 'SUNDAY' },
  { short: 'Mo', value: 'MONDAY' },
  { short: 'Tu', value: 'TUESDAY' },
  { short: 'We', value: 'WEDNESDAY' },
  { short: 'Th', value: 'THURSDAY' },
  { short: 'Fr', value: 'FRIDAY' },
  { short: 'Sa', value: 'SATURDAY' },
];

const ALL_DAYS: DayOfWeek[] = DAYS.map((d) => d.value);

const buildEndDatePresets = (startDate: string) =>
  [
    { label: '+1 Week',   value: offsetLocalDateISO(startDate, 7) },
    { label: '+1 Month',  value: offsetLocalDateISO(startDate, 30) },
    { label: '+3 Months', value: offsetLocalDateISO(startDate, 90) },
    { label: '+6 Months', value: offsetLocalDateISO(startDate, 180) },
    { label: '+1 Year',   value: offsetLocalDateISO(startDate, 365) },
  ].filter((p) => p.value > startDate);

// ---------------------------------------------------------------------------

function ScheduleSheet({
  task,
  onSchedule,
  onClose,
}: {
  task: Task;
  onSchedule: (payload: SchedulePayload) => void;
  onClose: () => void;
}) {
  const today = localDateISO();
  const editTaskInStore = useBacklogStore((s) => s.editTask);

  const [localTask, setLocalTask] = useState(task);

  // Schedule state
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringDays, setRecurringDays] = useState<DayOfWeek[]>(ALL_DAYS);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(offsetLocalDateISO(today, 365));
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  // Inline edit state — only the title row changes, rest of sheet stays visible
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editPriority, setEditPriority] = useState<Priority>(task.priority);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const handleRecurringToggle = (value: boolean) => {
    setIsRecurring(value);
    if (value) {
      setRecurringDays(ALL_DAYS);
      setStartDate(today);
      setEndDate(offsetLocalDateISO(today, 365));
    }
  };

  const toggleDay = (day: DayOfWeek) => {
    setRecurringDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleConfirm = () => {
    if (isRecurring) {
      if (recurringDays.length === 0) { setScheduleError('Select at least one day'); return; }
      if (endDate <= startDate) { setScheduleError('End date must be after start date'); return; }
      onSchedule({ recurring: true, recurringDays, startDate, endDate });
    } else {
      onSchedule({ recurring: false, date: startDate });
    }
  };

  const openEdit = () => {
    setEditTitle(localTask.title);
    setEditPriority(localTask.priority);
    setEditError(null);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) { setEditError('Title is required'); return; }
    setIsSaving(true);
    try {
      await editTaskInStore(localTask.id, editTitle.trim(), editPriority);
      setLocalTask((prev) => ({ ...prev, title: editTitle.trim(), priority: editPriority }));
      setIsEditing(false);
    } catch {
      setEditError('Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity
        activeOpacity={1}
        className="flex-1"
        style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        onPress={onClose}
      >
        <View className="flex-1 justify-end">
          <View
            className="bg-white rounded-t-3xl px-6 pt-4"
            style={{ paddingBottom: 32 }}
            onStartShouldSetResponder={() => true}
          >
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
              <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-5" />

              {/* ── Task header row — morphs inline between display & edit ── */}
              {isEditing ? (
                /* Edit row: TextInput + save/cancel icons */
                <View className="mb-4">
                  <View className="flex-row items-center mb-3" style={{ gap: 8 }}>
                    <View
                      className="rounded-xl px-3 py-2.5"
                      style={{
                        flex: 1,
                        backgroundColor: '#f8fafc',
                        borderWidth: 1.5,
                        borderColor: editError ? '#ef4444' : '#6366f1',
                      }}
                    >
                      <TextInput
                        className="text-gray-900 text-base"
                        value={editTitle}
                        onChangeText={(t) => { setEditTitle(t); setEditError(null); }}
                        placeholder="Task title"
                        placeholderTextColor="#94a3b8"
                        autoFocus
                      />
                    </View>
                    {/* Save */}
                    <TouchableOpacity
                      onPress={handleSaveEdit}
                      disabled={isSaving}
                      className="w-9 h-9 rounded-xl items-center justify-center"
                      style={{ backgroundColor: '#eef2ff' }}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      {isSaving
                        ? <ActivityIndicator size="small" color="#4f46e5" />
                        : <Ionicons name="checkmark" size={18} color="#4f46e5" />
                      }
                    </TouchableOpacity>
                    {/* Cancel edit */}
                    <TouchableOpacity
                      onPress={() => setIsEditing(false)}
                      className="w-9 h-9 rounded-xl items-center justify-center"
                      style={{ backgroundColor: '#f1f5f9' }}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <Ionicons name="close" size={18} color="#9ca3af" />
                    </TouchableOpacity>
                  </View>

                  {editError && (
                    <Text className="text-red-500 text-xs mb-2 ml-1">{editError}</Text>
                  )}

                  {/* Priority chips — appear inline below input */}
                  <View className="flex-row" style={{ gap: 8 }}>
                    {PRIORITIES.map((p) => {
                      const selected = editPriority === p.value;
                      return (
                        <TouchableOpacity
                          key={p.value}
                          className="flex-1 py-2.5 rounded-xl items-center"
                          style={{
                            backgroundColor: selected ? p.bg : '#f8fafc',
                            borderWidth: 1.5,
                            borderColor: selected ? p.color : '#e2e8f0',
                          }}
                          onPress={() => setEditPriority(p.value)}
                        >
                          <Text
                            className="text-xs font-bold"
                            style={{ color: selected ? p.color : '#9ca3af' }}
                          >
                            {p.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ) : (
                /* Display row: calendar icon + title + pencil + close */
                <View className="flex-row items-center mb-5" style={{ gap: 10 }}>
                  <View
                    className="w-9 h-9 rounded-xl items-center justify-center"
                    style={{ backgroundColor: '#eef2ff' }}
                  >
                    <Ionicons name="calendar-outline" size={18} color="#4f46e5" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
                      {localTask.title}
                    </Text>
                    <Text className="text-xs text-gray-400 mt-0.5">Schedule this task</Text>
                  </View>
                  <TouchableOpacity
                    onPress={openEdit}
                    className="w-8 h-8 rounded-lg items-center justify-center"
                    style={{ backgroundColor: '#f8fafc' }}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Ionicons name="pencil-outline" size={15} color="#6b7280" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={onClose}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close" size={20} color="#9ca3af" />
                  </TouchableOpacity>
                </View>
              )}

              {/* Divider */}
              <View style={{ height: 1, backgroundColor: '#f1f5f9', marginBottom: 20 }} />

              {/* ── Scheduling controls — always visible ── */}
              <View className="flex-row items-center justify-between mb-5">
                <Text className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  Recurring
                </Text>
                <Switch
                  value={isRecurring}
                  onValueChange={handleRecurringToggle}
                  trackColor={{ false: '#e2e8f0', true: '#a5b4fc' }}
                  thumbColor={isRecurring ? '#4f46e5' : '#cbd5e1'}
                />
              </View>

              {isRecurring && (
                <View className="mb-5">
                  <View className="flex-row justify-between mb-2">
                    {DAYS.map((d) => {
                      const selected = recurringDays.includes(d.value);
                      return (
                        <TouchableOpacity
                          key={d.value}
                          onPress={() => toggleDay(d.value)}
                          style={{
                            width: 38, height: 38, borderRadius: 19,
                            alignItems: 'center', justifyContent: 'center',
                            backgroundColor: selected ? '#4f46e5' : '#f1f5f9',
                            borderWidth: 1.5,
                            borderColor: selected ? '#4f46e5' : '#e2e8f0',
                          }}
                        >
                          <Text style={{ fontSize: 12, fontWeight: '700', color: selected ? 'white' : '#94a3b8' }}>
                            {d.short}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  {recurringDays.length === 0 && (
                    <Text className="text-red-400 text-xs text-center mt-1">
                      Select at least one day
                    </Text>
                  )}
                </View>
              )}

              <DatePickerField
                label={isRecurring ? 'Start Date' : 'Date'}
                value={startDate}
                onChange={(d) => {
                  setStartDate(d);
                  if (isRecurring && endDate <= d) setEndDate(offsetLocalDateISO(d, 365));
                }}
                minDate={today}
              />

              {isRecurring && (
                <DatePickerField
                  label="End Date"
                  value={endDate}
                  onChange={setEndDate}
                  minDate={offsetLocalDateISO(startDate, 1)}
                  presets={buildEndDatePresets(startDate)}
                />
              )}

              {scheduleError && (
                <Text className="text-red-500 text-sm text-center mb-4">{scheduleError}</Text>
              )}

              <TouchableOpacity
                className="bg-indigo-600 rounded-xl py-4 items-center mt-2"
                onPress={handleConfirm}
              >
                <Text className="text-white font-bold text-base">
                  {isRecurring ? 'Schedule Recurring Task' : 'Schedule Task'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

// ---------------------------------------------------------------------------

function BacklogCard({
  task,
  onSchedule,
  onDelete,
}: {
  task: Task;
  onSchedule: () => void;
  onDelete: () => void;
}) {
  const colors = PRIORITY_COLORS[task.priority];

  return (
    <View
      className="bg-white rounded-2xl mx-4 mb-3"
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
      <View style={{ width: 4, backgroundColor: colors.text }} />

      <View className="flex-row items-center px-4 py-4" style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <Text className="text-base font-semibold text-gray-800" numberOfLines={2}>
            {task.title}
          </Text>
          {task.priority !== 'NONE' && (
            <View
              className="self-start mt-1 px-2 py-0.5 rounded-md"
              style={{ backgroundColor: colors.bg }}
            >
              <Text className="text-xs font-bold" style={{ color: colors.text }}>
                {task.priority}
              </Text>
            </View>
          )}
        </View>

        <View className="flex-row items-center ml-3" style={{ gap: 8 }}>
          <TouchableOpacity
            onPress={onSchedule}
            className="w-9 h-9 rounded-xl items-center justify-center"
            style={{ backgroundColor: '#eef2ff' }}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons name="calendar-outline" size={16} color="#4f46e5" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onDelete}
            className="w-9 h-9 rounded-xl items-center justify-center"
            style={{ backgroundColor: '#f9fafb' }}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons name="trash-outline" size={16} color="#d1d5db" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function EmptyBacklog() {
  return (
    <View className="items-center py-16 px-8">
      <View
        className="w-20 h-20 rounded-3xl items-center justify-center mb-5"
        style={{ backgroundColor: '#eef2ff' }}
      >
        <Ionicons name="file-tray-outline" size={36} color="#a5b4fc" />
      </View>
      <Text className="text-gray-700 font-bold text-lg mb-2">Backlog is empty</Text>
      <Text className="text-gray-400 text-sm text-center leading-5">
        Ideas and tasks without a date live here.{'\n'}Tap + to add one.
      </Text>
    </View>
  );
}

// ---------------------------------------------------------------------------

export default function BacklogScreen() {
  const navigation = useNavigation();
  const { tasks, isLoading, loadBacklog, removeTask, schedule } = useBacklogStore();
  const [addVisible, setAddVisible] = useState(false);
  const [scheduleTask, setScheduleTask] = useState<Task | null>(null);

  useEffect(() => { loadBacklog(); }, []);

  const handleDelete = (task: Task) => {
    Alert.alert(
      'Delete Task',
      `Delete "${task.title}" from your backlog?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => removeTask(task.id) },
      ]
    );
  };

  const handleSchedule = async (payload: SchedulePayload) => {
    if (!scheduleTask) return;
    const task = scheduleTask;
    setScheduleTask(null);
    await schedule(task, payload);
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-gray-50">
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-4 py-3 bg-white"
        style={{ borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-9 h-9 rounded-xl items-center justify-center"
          style={{ backgroundColor: '#f8fafc' }}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Ionicons name="chevron-back" size={20} color="#374151" />
        </TouchableOpacity>

        <View className="items-center">
          <Text className="text-base font-bold text-gray-900">Backlog</Text>
          {tasks.length > 0 && (
            <Text className="text-xs text-gray-400">
              {tasks.length} task{tasks.length !== 1 ? 's' : ''}
            </Text>
          )}
        </View>

        <TouchableOpacity
          onPress={() => setAddVisible(true)}
          className="w-9 h-9 rounded-xl items-center justify-center"
          style={{ backgroundColor: '#eef2ff' }}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Ionicons name="add" size={22} color="#4f46e5" />
        </TouchableOpacity>
      </View>

      {isLoading && tasks.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <BacklogCard
              task={item}
              onSchedule={() => setScheduleTask(item)}
              onDelete={() => handleDelete(item)}
            />
          )}
          ListEmptyComponent={<EmptyBacklog />}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Add modal */}
      <AddBacklogTaskModal
        visible={addVisible}
        onClose={() => setAddVisible(false)}
      />

      {/* Schedule sheet */}
      {scheduleTask && (
        <ScheduleSheet
          task={scheduleTask}
          onSchedule={handleSchedule}
          onClose={() => setScheduleTask(null)}
        />
      )}
    </SafeAreaView>
  );
}
