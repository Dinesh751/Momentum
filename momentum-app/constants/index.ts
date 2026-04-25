import Constants from 'expo-constants';

const getApiBaseUrl = () => {
  // In development, derive the host from Expo's own server URI so it works on
  // both the iOS simulator (localhost) and physical devices (LAN IP via Expo Go).
  if (__DEV__) {
    const host = Constants.expoConfig?.hostUri?.split(':')[0] ?? 'localhost';
    return `http://${host}:8080/api/v1`;
  }
  return 'https://momentum-production-0e7d.up.railway.app/api/v1';
};

export const API_BASE_URL = getApiBaseUrl();

export const PRIORITY_POINTS: Record<string, number> = {
  HIGH: 10,
  MID: 5,
  LOW: 2,
  NONE: 0,
};

export const DEFAULT_DAILY_THRESHOLD = 10;
