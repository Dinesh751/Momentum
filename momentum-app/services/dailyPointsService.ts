import api from './api';
import { DailyPoints, ApiResponse } from '../types';

const dailyPointsService = {
  getForDate: async (date: string): Promise<DailyPoints> => {
    const res = await api.get<ApiResponse<DailyPoints>>('/daily-points', { params: { date } });
    return res.data.data;
  },
};

export default dailyPointsService;
