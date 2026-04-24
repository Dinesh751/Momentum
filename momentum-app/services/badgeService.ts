import api from './api';
import { Badge, ApiResponse } from '../types';

const badgeService = {
  getBadges: async (): Promise<Badge[]> => {
    const res = await api.get<ApiResponse<Badge[]>>('/badges');
    return res.data.data;
  },
};

export default badgeService;
