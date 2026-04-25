import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  message?: string;
  onRetry: () => void;
}

export default function ErrorScreen({ message = "Check your connection and try again", onRetry }: Props) {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 items-center justify-center px-8">
        <Ionicons name="cloud-offline-outline" size={48} color="#d1d5db" />
        <Text className="text-gray-700 font-semibold text-base mt-4 mb-1">
          Something went wrong
        </Text>
        <Text className="text-gray-400 text-sm text-center mb-6">{message}</Text>
        <TouchableOpacity onPress={onRetry} className="bg-indigo-600 px-6 py-3 rounded-xl">
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
