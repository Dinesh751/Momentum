import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  message?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export default function ErrorBanner({
  message = 'Something went wrong',
  onRetry,
  onDismiss,
}: Props) {
  return (
    <View
      className="mx-4 mb-3 bg-red-50 rounded-xl px-4 py-3 flex-row items-center"
      style={{ borderWidth: 1, borderColor: '#fecaca' }}
    >
      <Ionicons name="warning-outline" size={18} color="#ef4444" />
      <Text className="flex-1 text-red-600 text-sm ml-2">{message}</Text>
      {onRetry && (
        <TouchableOpacity onPress={onRetry} className="ml-3">
          <Text className="text-red-600 font-semibold text-sm">Retry</Text>
        </TouchableOpacity>
      )}
      {onDismiss && (
        <TouchableOpacity onPress={onDismiss} className="ml-2">
          <Ionicons name="close" size={16} color="#ef4444" />
        </TouchableOpacity>
      )}
    </View>
  );
}
