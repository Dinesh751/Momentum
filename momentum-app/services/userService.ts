import api from './api';
import { ApiResponse, UserProfile } from '../types';

const userService = {
  getProfile: async (): Promise<UserProfile> => {
    const { data } = await api.get<ApiResponse<UserProfile>>('/users/me');
    return data.data;
  },

  updateProfile: async (payload: { displayName?: string; timezone?: string }): Promise<UserProfile> => {
    const { data } = await api.put<ApiResponse<UserProfile>>('/users/me', payload);
    return data.data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.put('/users/me/password', { currentPassword, newPassword });
  },

  deleteAccount: async (): Promise<void> => {
    await api.delete('/users/me');
  },
};

export default userService;
