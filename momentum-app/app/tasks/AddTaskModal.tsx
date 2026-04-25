import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Switch,
  ScrollView,
} from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { useTaskStore } from '../../store/taskStore';
import { DayOfWeek, Priority } from '../../types';
import DatePickerField from '../../components/DatePickerField';
import { localDateISO, offsetLocalDateISO } from '../../utils/date';

interface Props {
  visible: boolean;
  onClose: () => void;
  selectedDate?: string;
}

type FormData = { title: string };

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

const buildEndDatePresets = (startDate: string) => {
  const today = localDateISO();
  return [
    { label: '+1 Week',   value: offsetLocalDateISO(today, 7) },
    { label: '+1 Month',  value: offsetLocalDateISO(today, 30) },
    { label: '+3 Months', value: offsetLocalDateISO(today, 90) },
    { label: '+6 Months', value: offsetLocalDateISO(today, 180) },
    { label: '+1 Year',   value: offsetLocalDateISO(today, 365) },
  ].filter((p) => p.value > startDate);
};

export default function AddTaskModal({ visible, onClose, selectedDate }: Props) {
  const addTask = useTaskStore((s) => s.addTask);
  const existingTasks = useTaskStore((s) => s.tasks);
  const defaultDate = selectedDate ?? localDateISO();
  const [selectedPriority, setSelectedPriority] = useState<Priority>('NONE');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringDays, setRecurringDays] = useState<DayOfWeek[]>(ALL_DAYS);
  const [startDate, setStartDate] = useState(() => defaultDate);
  const [endDate, setEndDate] = useState(() => offsetLocalDateISO(defaultDate, 365));
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  const titleValue = watch('title', '');
  const isDuplicate =
    !isRecurring &&
    !!titleValue?.trim() &&
    existingTasks.some(
      (t) => t.title.toLowerCase() === titleValue.trim().toLowerCase()
    );

  const handleClose = () => {
    reset();
    setSelectedPriority('NONE');
    setIsRecurring(false);
    setRecurringDays(ALL_DAYS);
    setStartDate(defaultDate);
    setEndDate(offsetLocalDateISO(defaultDate, 365));
    setSubmitError(null);
    onClose();
  };

  const handleRecurringToggle = (value: boolean) => {
    setIsRecurring(value);
    if (value) {
      setRecurringDays(ALL_DAYS);
      setStartDate(defaultDate);
      setEndDate(offsetLocalDateISO(defaultDate, 365));
    }
  };

  const toggleDay = (day: DayOfWeek) => {
    setRecurringDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const onSubmit = async ({ title }: FormData) => {
    if (isRecurring && recurringDays.length === 0) {
      setSubmitError('Select at least one recurring day');
      return;
    }
    if (isRecurring && endDate <= startDate) {
      setSubmitError('End date must be after start date');
      return;
    }
    setSubmitError(null);
    try {
      await addTask({
        title,
        priority: selectedPriority,
        ...(isRecurring
          ? { recurring: true, recurringDays, startDate, endDate }
          : {}),
      });
      handleClose();
    } catch {
      setSubmitError('Failed to add task. Please try again.');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        className="flex-1"
        style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        onPress={handleClose}
      >
        <KeyboardAvoidingView
          className="flex-1 justify-end"
          behavior="padding"
        >
          <View
            className="bg-white rounded-t-3xl px-6 pt-4"
            style={{ paddingBottom: 32 }}
            onStartShouldSetResponder={() => true}
          >
            <ScrollView showsVerticalScrollIndicator={false} bounces={false} keyboardShouldPersistTaps="handled">
              {/* Handle bar */}
              <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-6" />

              {/* Header */}
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-bold text-gray-900">New Task</Text>
                <TouchableOpacity onPress={handleClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="close" size={22} color="#9ca3af" />
                </TouchableOpacity>
              </View>

              {/* Title input */}
              <Controller
                control={control}
                name="title"
                rules={{
                  required: 'Title is required',
                  maxLength: { value: 255, message: 'Max 255 characters' },
                }}
                render={({ field: { onChange, value } }) => (
                  <View className="mb-5">
                    <Text className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                      Task Title
                    </Text>
                    <View
                      className="rounded-xl px-4 py-3.5"
                      style={{
                        backgroundColor: '#f8fafc',
                        borderWidth: 1.5,
                        borderColor: errors.title ? '#ef4444' : '#e2e8f0',
                      }}
                    >
                      <TextInput
                        className="text-gray-900 text-base"
                        placeholder="What do you need to do?"
                        placeholderTextColor="#94a3b8"
                        value={value}
                        onChangeText={onChange}
                      />
                    </View>
                    {errors.title && (
                      <Text className="text-red-500 text-xs mt-1.5 ml-1">{errors.title.message}</Text>
                    )}
                    {!errors.title && isDuplicate && (
                      <View className="flex-row items-center mt-1.5 ml-1" style={{ gap: 4 }}>
                        <Ionicons name="warning-outline" size={13} color="#d97706" />
                        <Text style={{ color: '#d97706', fontSize: 12, fontWeight: '500' }}>
                          A task with this name already exists for this date
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              />

              {/* Priority selector */}
              <View className="mb-5">
                <Text className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                  Priority
                </Text>
                <View className="flex-row" style={{ gap: 8 }}>
                  {PRIORITIES.map((p) => {
                    const selected = selectedPriority === p.value;
                    return (
                      <TouchableOpacity
                        key={p.value}
                        className="flex-1 py-3 rounded-xl items-center"
                        style={{
                          backgroundColor: selected ? p.bg : '#f8fafc',
                          borderWidth: 1.5,
                          borderColor: selected ? p.color : '#e2e8f0',
                        }}
                        onPress={() => setSelectedPriority(p.value)}
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

              {/* Recurring toggle */}
              <View className="mb-5">
                <View className="flex-row items-center justify-between mb-3">
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
                  <View>
                    {/* Day chips */}
                    <View className="flex-row justify-between mb-4">
                      {DAYS.map((d) => {
                        const selected = recurringDays.includes(d.value);
                        return (
                          <TouchableOpacity
                            key={d.value}
                            onPress={() => toggleDay(d.value)}
                            style={{
                              width: 38,
                              height: 38,
                              borderRadius: 19,
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: selected ? '#4f46e5' : '#f1f5f9',
                              borderWidth: 1.5,
                              borderColor: selected ? '#4f46e5' : '#e2e8f0',
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 12,
                                fontWeight: '700',
                                color: selected ? 'white' : '#94a3b8',
                              }}
                            >
                              {d.short}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                    {recurringDays.length === 0 && (
                      <Text className="text-red-400 text-xs mb-3 text-center">
                        Select at least one day
                      </Text>
                    )}

                    {/* Date range pickers */}
                    <DatePickerField
                      label="Start Date"
                      value={startDate}
                      onChange={(d) => {
                        setStartDate(d);
                        if (endDate <= d) setEndDate(offsetLocalDateISO(d, 365));
                      }}
                      minDate={localDateISO()}
                    />

                    <DatePickerField
                      label="End Date"
                      value={endDate}
                      onChange={setEndDate}
                      minDate={offsetLocalDateISO(startDate, 1)}
                      presets={buildEndDatePresets(startDate)}
                    />
                  </View>
                )}
              </View>

              {/* Submit error */}
              {submitError && (
                <Text className="text-red-500 text-sm text-center mb-4">{submitError}</Text>
              )}

              {/* Submit */}
              <TouchableOpacity
                className="bg-indigo-600 rounded-xl py-4"
                style={{ alignItems: 'center', justifyContent: 'center' }}
                onPress={handleSubmit(onSubmit)}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={{ color: 'white', fontWeight: '700', fontSize: 16, textAlign: 'center' }}>
                    {isRecurring ? 'Add Recurring Task' : 'Add Task'}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  );
}
