import { ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoadingScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
      <ActivityIndicator size="large" color="#4f46e5" />
    </SafeAreaView>
  );
}
