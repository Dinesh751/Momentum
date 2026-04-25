import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetworkStore } from '../store/networkStore';

export default function OfflineBanner() {
  const isOffline = useNetworkStore((s) => s.isOffline);
  if (!isOffline) return null;

  return (
    <View
      className="mx-4 mb-3 rounded-xl px-4 py-3 flex-row items-center"
      style={{ backgroundColor: '#fffbeb', borderWidth: 1, borderColor: '#fcd34d' }}
    >
      <Ionicons name="cloud-offline-outline" size={18} color="#d97706" />
      <Text className="flex-1 text-sm ml-2" style={{ color: '#92400e' }}>
        No internet connection — showing cached data
      </Text>
    </View>
  );
}
