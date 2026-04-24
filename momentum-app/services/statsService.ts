import api from './api';
import { ApiResponse, StatsOverview, PeriodStats, TaskStats } from '../types';

const statsService = {
  getOverview: async (): Promise<StatsOverview> => {
    const res = await api.get<ApiResponse<StatsOverview>>('/stats/overview');
    return res.data.data;
  },
  getWeekly: async (): Promise<PeriodStats> => {
    const res = await api.get<ApiResponse<PeriodStats>>('/stats/weekly');
    return res.data.data;
  },
  getMonthly: async (): Promise<PeriodStats> => {
    const res = await api.get<ApiResponse<PeriodStats>>('/stats/monthly');
    return res.data.data;
  },
  getTaskStats: async (): Promise<TaskStats> => {
    const res = await api.get<ApiResponse<TaskStats>>('/stats/tasks');
    return res.data.data;
  },
};

export default statsService;
