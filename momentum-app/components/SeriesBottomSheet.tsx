import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import seriesService from '../services/seriesService';
import { SeriesSummary } from '../types';
import { localDateISO } from '../utils/date';

interface Props {
  visible: boolean;
  groupId: string;
  fromDate: string;
  onClose: () => void;
  onDeleted: () => void;
}

const formatDate = (dateStr: string) =>
  new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

export default function SeriesBottomSheet({ visible, groupId, fromDate, onClose, onDeleted }: Props) {
  const [summary, setSummary] = useState<SeriesSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setIsLoading(true);
    setError(null);
    seriesService.getSummary(groupId)
      .then(setSummary)
      .catch(() => setError('Failed to load series details'))
      .finally(() => setIsLoading(false));
  }, [visible, groupId]);

  const isFromTomorrow = fromDate > localDateISO();
  const deleteLabel = isFromTomorrow ? 'Delete From Tomorrow' : 'Delete From Today';
  const deleteSubtitle = isFromTomorrow
    ? `Tomorrow + future (today is already done)`
    : `Today + future`;

  const handleDelete = () => {
    Alert.alert(
      deleteLabel,
      isFromTomorrow
        ? "Delete tomorrow's and all future occurrences? Today's completed task will be kept."
        : "Delete today's and all future occurrences of this task?",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await seriesService.deleteSeries(groupId, fromDate);
              onDeleted();
            } catch {
              Alert.alert('Error', 'Failed to delete tasks');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        className="flex-1"
        style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        onPress={onClose}
      >
        <View className="flex-1 justify-end">
          <View
            className="bg-white rounded-t-3xl px-6 pt-4 pb-10"
            onStartShouldSetResponder={() => true}
          >
            {/* Handle bar */}
            <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-5" />

            {/* Header */}
            <View className="flex-row items-center justify-between mb-5">
              <View className="flex-row items-center" style={{ gap: 10 }}>
                <View
                  className="w-9 h-9 rounded-xl items-center justify-center"
                  style={{ backgroundColor: '#eef2ff' }}
                >
                  <Ionicons name="repeat" size={18} color="#4f46e5" />
                </View>
                <Text className="text-lg font-bold text-gray-900">Recurring Series</Text>
              </View>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close" size={22} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            {isLoading ? (
              <ActivityIndicator color="#4f46e5" style={{ paddingVertical: 32 }} />
            ) : error ? (
              <Text className="text-center text-red-400 text-sm py-8">{error}</Text>
            ) : summary ? (
              <>
                {/* Pattern */}
                <View
                  className="rounded-xl p-4 mb-4"
                  style={{ backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0' }}
                >
                  <View className="flex-row items-center mb-3">
                    <Ionicons name="calendar-outline" size={16} color="#6366f1" style={{ marginRight: 8 }} />
                    <Text className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                      Repeats on
                    </Text>
                  </View>
                  <Text className="text-gray-800 font-semibold text-base">{summary.pattern}</Text>
                </View>

                {/* Date range */}
                <View className="flex-row mb-4" style={{ gap: 10 }}>
                  <View
                    className="flex-1 rounded-xl p-4"
                    style={{ backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0' }}
                  >
                    <Text className="text-xs text-gray-400 mb-1">Start</Text>
                    <Text className="text-sm font-semibold text-gray-800">
                      {formatDate(summary.firstDate)}
                    </Text>
                  </View>
                  <View
                    className="flex-1 rounded-xl p-4"
                    style={{ backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0' }}
                  >
                    <Text className="text-xs text-gray-400 mb-1">End</Text>
                    <Text className="text-sm font-semibold text-gray-800">
                      {formatDate(summary.lastDate)}
                    </Text>
                  </View>
                </View>

                {/* Stats row */}
                <View className="flex-row mb-6" style={{ gap: 10 }}>
                  {[
                    { label: 'Total', value: summary.totalOccurrences, color: '#6366f1' },
                    { label: 'Done', value: summary.completedOccurrences, color: '#10b981' },
                    { label: 'Left', value: summary.remainingOccurrences, color: '#f59e0b' },
                  ].map(({ label, value, color }) => (
                    <View
                      key={label}
                      className="flex-1 rounded-xl items-center py-3"
                      style={{ backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0' }}
                    >
                      <Text className="text-xl font-bold" style={{ color }}>{value}</Text>
                      <Text className="text-xs text-gray-400 mt-0.5">{label}</Text>
                    </View>
                  ))}
                </View>

                {/* Actions */}
                {isDeleting ? (
                  <ActivityIndicator color="#4f46e5" style={{ paddingVertical: 16 }} />
                ) : (
                  <TouchableOpacity
                    className="rounded-xl py-4 items-center"
                    style={{ backgroundColor: '#fef2f2', borderWidth: 1.5, borderColor: '#fecaca' }}
                    onPress={handleDelete}
                  >
                    <Text className="font-bold text-base" style={{ color: '#ef4444' }}>
                      {deleteLabel}
                    </Text>
                    <Text className="text-xs mt-0.5" style={{ color: '#fca5a5' }}>
                      {deleteSubtitle} ({summary.remainingOccurrences} tasks)
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
