import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { registerLogoutCallback } from '../services/api';
import { User } from '../types';

const STORAGE_KEYS = ['accessToken', 'refreshToken', 'userEmail', 'userDisplayName'] as const;

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loadStoredAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,

  loadStoredAuth: async () => {
    try {
      const pairs = await AsyncStorage.multiGet(['accessToken', 'userEmail', 'userDisplayName']);
      const [accessToken, email, displayName] = pairs.map(([, v]) => v);

      if (accessToken && email && displayName) {
        set({ user: { email, displayName }, accessToken, isAuthenticated: true });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const { accessToken, refreshToken, displayName } = data.data;

    await AsyncStorage.multiSet([
      ['accessToken', accessToken],
      ['refreshToken', refreshToken],
      ['userEmail', email],
      ['userDisplayName', displayName],
    ]);

    set({ user: { email, displayName }, accessToken, isAuthenticated: true });
  },

  register: async (email, password, displayName) => {
    const { data } = await api.post('/auth/register', { email, password, displayName });
    const { accessToken, refreshToken } = data.data;

    await AsyncStorage.multiSet([
      ['accessToken', accessToken],
      ['refreshToken', refreshToken],
      ['userEmail', email],
      ['userDisplayName', displayName],
    ]);

    set({ user: { email, displayName }, accessToken, isAuthenticated: true });
  },

  logout: async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (refreshToken) await api.post('/auth/logout', { refreshToken });
    } catch {
      // logout errors are non-critical
    } finally {
      await AsyncStorage.multiRemove([...STORAGE_KEYS]);
      set({ user: null, accessToken: null, isAuthenticated: false });
    }
  },
}));

// Called by api.ts when a token refresh fails — clears state without importing authStore in api.ts
registerLogoutCallback(async () => {
  await AsyncStorage.multiRemove([...STORAGE_KEYS]);
  useAuthStore.setState({ user: null, accessToken: null, isAuthenticated: false });
});
