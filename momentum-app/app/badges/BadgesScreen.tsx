import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BadgesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center">
        <Text className="text-2xl font-bold text-gray-900">Badges</Text>
        <Text className="text-gray-400 mt-2">Coming in Phase 2</Text>
      </View>
    </SafeAreaView>
  );
}
