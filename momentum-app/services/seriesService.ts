import api from './api';
import { ApiResponse, SeriesSummary } from '../types';

const seriesService = {
  getSummary: async (groupId: string): Promise<SeriesSummary> => {
    const { data } = await api.get<ApiResponse<SeriesSummary>>(`/tasks/series/${groupId}`);
    return data.data;
  },

  deleteSeries: async (groupId: string, from?: string): Promise<void> => {
    const params = from ? `?from=${from}` : '';
    await api.delete(`/tasks/series/${groupId}${params}`);
  },
};

export default seriesService;
