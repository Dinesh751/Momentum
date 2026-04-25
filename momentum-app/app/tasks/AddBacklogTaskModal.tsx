import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { useBacklogStore } from '../../store/backlogStore';
import { Priority, Task } from '../../types';

interface Props {
  visible: boolean;
  onClose: () => void;
  taskToEdit?: Task;
}

type FormData = { title: string };

const PRIORITIES: { value: Priority; label: string; color: string; bg: string }[] = [
  { value: 'HIGH', label: 'HIGH', color: '#ef4444', bg: '#fef2f2' },
  { value: 'MID',  label: 'MID',  color: '#f59e0b', bg: '#fffbeb' },
  { value: 'LOW',  label: 'LOW',  color: '#3b82f6', bg: '#eff6ff' },
  { value: 'NONE', label: 'NONE', color: '#9ca3af', bg: '#f9fafb' },
];

export default function AddBacklogTaskModal({ visible, onClose, taskToEdit }: Props) {
  const addTask = useBacklogStore((s) => s.addTask);
  const editTask = useBacklogStore((s) => s.editTask);
  const isEditMode = !!taskToEdit;
  const [selectedPriority, setSelectedPriority] = useState<Priority>(taskToEdit?.priority ?? 'NONE');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ defaultValues: { title: taskToEdit?.title ?? '' } });

  useEffect(() => {
    if (visible) {
      reset({ title: taskToEdit?.title ?? '' });
      setSelectedPriority(taskToEdit?.priority ?? 'NONE');
      setSubmitError(null);
    }
  }, [visible, taskToEdit]);

  const handleClose = () => {
    reset();
    setSelectedPriority('NONE');
    setSubmitError(null);
    onClose();
  };

  const onSubmit = async ({ title }: FormData) => {
    setSubmitError(null);
    try {
      if (isEditMode && taskToEdit) {
        await editTask(taskToEdit.id, title, selectedPriority);
      } else {
        await addTask(title, selectedPriority);
      }
      handleClose();
    } catch {
      setSubmitError(`Failed to ${isEditMode ? 'update' : 'add'} task. Please try again.`);
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
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View
            className="bg-white rounded-t-3xl px-6 pt-4 pb-10"
            onStartShouldSetResponder={() => true}
          >
            <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-6" />

            <View className="flex-row justify-between items-center mb-6">
              <View>
                <Text className="text-xl font-bold text-gray-900">
                  {isEditMode ? 'Edit Task' : 'Add to Backlog'}
                </Text>
                <Text className="text-xs text-gray-400 mt-0.5">
                  {isEditMode ? 'Update title or priority' : 'No date yet — schedule it later'}
                </Text>
              </View>
              <TouchableOpacity onPress={handleClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close" size={22} color="#9ca3af" />
              </TouchableOpacity>
            </View>

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
                      placeholder="What do you want to do someday?"
                      placeholderTextColor="#94a3b8"
                      value={value}
                      onChangeText={onChange}
                      autoFocus
                    />
                  </View>
                  {errors.title && (
                    <Text className="text-red-500 text-xs mt-1.5 ml-1">{errors.title.message}</Text>
                  )}
                </View>
              )}
            />

            <View className="mb-6">
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

            {submitError && (
              <Text className="text-red-500 text-sm text-center mb-4">{submitError}</Text>
            )}

            <TouchableOpacity
              className="bg-indigo-600 rounded-xl py-4 items-center"
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-base">
                  {isEditMode ? 'Save Changes' : 'Save to Backlog'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  );
}
