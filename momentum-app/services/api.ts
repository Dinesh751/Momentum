import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants';
import { useNetworkStore } from '../store/networkStore';

type LogoutCallback = () => void;
let onForceLogout: LogoutCallback | null = null;

export function registerLogoutCallback(cb: LogoutCallback) {
  onForceLogout = cb;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let pendingRequests: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (response) => {
    useNetworkStore.getState().setOffline(false);
    return response;
  },
  async (error) => {
    if (!error.response) {
      useNetworkStore.getState().setOffline(true);
    }

    const original = error.config;

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        pendingRequests.push((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          resolve(api(original));
        });
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
      const { accessToken, refreshToken: newRefresh } = data.data;

      await AsyncStorage.multiSet([
        ['accessToken', accessToken],
        ['refreshToken', newRefresh],
      ]);

      pendingRequests.forEach((cb) => cb(accessToken));
      pendingRequests = [];

      original.headers.Authorization = `Bearer ${accessToken}`;
      return api(original);
    } catch {
      pendingRequests = [];
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'userEmail', 'userDisplayName']);
      onForceLogout?.();
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
