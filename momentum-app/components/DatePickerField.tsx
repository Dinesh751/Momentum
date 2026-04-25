import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { localDateISO, offsetLocalDateISO } from '../utils/date';

interface Preset {
  label: string;
  value: string;
}

interface Props {
  label: string;
  value: string;
  onChange: (date: string) => void;
  minDate?: string;
  presets?: Preset[];
}

const formatDisplay = (dateStr: string): string => {
  const today = localDateISO();
  if (dateStr === today) return 'Today';
  if (dateStr === offsetLocalDateISO(today, 1)) return 'Tomorrow';
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export default function DatePickerField({ label, value, onChange, minDate, presets }: Props) {
  const [presetVisible, setPresetVisible] = useState(false);

  const stepDate = (days: number) => {
    const next = offsetLocalDateISO(value, days);
    if (minDate && next < minDate) return;
    onChange(next);
  };

  const canGoBack = !minDate || offsetLocalDateISO(value, -1) >= minDate;

  return (
    <>
      <View className="mb-4">
        <Text className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
          {label}
        </Text>
        <View
          className="flex-row items-center rounded-xl"
          style={{
            backgroundColor: '#f8fafc',
            borderWidth: 1.5,
            borderColor: '#e2e8f0',
            overflow: 'hidden',
          }}
        >
          <TouchableOpacity
            onPress={() => stepDate(-1)}
            disabled={!canGoBack}
            style={{ paddingHorizontal: 14, paddingVertical: 13, opacity: canGoBack ? 1 : 0.3 }}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          >
            <Ionicons name="chevron-back" size={18} color="#6366f1" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => presets && setPresetVisible(true)}
            style={{ flex: 1, alignItems: 'center', paddingVertical: 13 }}
            activeOpacity={presets ? 0.6 : 1}
          >
            <Text className="text-gray-800 font-semibold text-sm">{formatDisplay(value)}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => stepDate(1)}
            style={{ paddingHorizontal: 14, paddingVertical: 13 }}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          >
            <Ionicons name="chevron-forward" size={18} color="#6366f1" />
          </TouchableOpacity>
        </View>
        {presets && (
          <Text className="text-xs text-gray-400 mt-1.5 ml-1">Tap date to pick a preset</Text>
        )}
      </View>

      {presets && (
        <Modal
          visible={presetVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setPresetVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', paddingHorizontal: 32 }}
            onPress={() => setPresetVisible(false)}
          >
            <View
              className="bg-white rounded-2xl overflow-hidden"
              onStartShouldSetResponder={() => true}
            >
              <View className="px-5 pt-5 pb-3">
                <Text className="text-base font-bold text-gray-900">Quick Select</Text>
                <Text className="text-xs text-gray-400 mt-0.5">{label}</Text>
              </View>
              <ScrollView>
                {presets.map((preset) => {
                  const isSelected = value === preset.value;
                  return (
                    <TouchableOpacity
                      key={preset.label}
                      onPress={() => { onChange(preset.value); setPresetVisible(false); }}
                      className="flex-row items-center justify-between px-5 py-4"
                      style={{ borderTopWidth: 1, borderTopColor: '#f3f4f6' }}
                      activeOpacity={0.7}
                    >
                      <Text
                        className="text-sm font-medium"
                        style={{ color: isSelected ? '#4f46e5' : '#374151' }}
                      >
                        {preset.label}
                      </Text>
                      <View className="flex-row items-center" style={{ gap: 8 }}>
                        <Text className="text-xs text-gray-400">
                          {new Date(preset.value + 'T12:00:00').toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                          })}
                        </Text>
                        {isSelected && <Ionicons name="checkmark" size={16} color="#4f46e5" />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              <TouchableOpacity
                className="items-center py-4"
                style={{ borderTopWidth: 1, borderTopColor: '#f3f4f6' }}
                onPress={() => setPresetVisible(false)}
              >
                <Text className="text-sm font-medium text-gray-400">Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </>
  );
}
