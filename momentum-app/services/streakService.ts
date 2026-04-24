import api from './api';
import { Streak, ApiResponse } from '../types';

const streakService = {
  getStreak: async (): Promise<Streak> => {
    const res = await api.get<ApiResponse<Streak>>('/streaks');
    return res.data.data;
  },
};

export default streakService;
