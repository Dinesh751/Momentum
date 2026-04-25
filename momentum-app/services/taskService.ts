import api from './api';
import { ApiResponse, CreateTaskPayload, Task, UpdateTaskPayload } from '../types';

const taskService = {
  getByDate: async (date: string): Promise<Task[]> => {
    const { data } = await api.get<ApiResponse<Task[]>>(`/tasks?date=${date}`);
    return data.data;
  },

  getIncompleteBefore: async (before: string, after?: string): Promise<Task[]> => {
    const params = after
      ? `before=${before}&after=${after}`
      : `before=${before}`;
    const { data } = await api.get<ApiResponse<Task[]>>(`/tasks/incomplete-before?${params}`);
    return data.data;
  },

  create: async (payload: CreateTaskPayload): Promise<Task[]> => {
    const { data } = await api.post<ApiResponse<Task[]>>('/tasks', payload);
    return data.data;
  },

  update: async (id: number, payload: UpdateTaskPayload): Promise<Task> => {
    const { data } = await api.put<ApiResponse<Task>>(`/tasks/${id}`, payload);
    return data.data;
  },

  remove: async (id: number): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },

  complete: async (id: number): Promise<Task> => {
    const { data } = await api.patch<ApiResponse<Task>>(`/tasks/${id}/complete`);
    return data.data;
  },

  uncomplete: async (id: number): Promise<Task> => {
    const { data } = await api.patch<ApiResponse<Task>>(`/tasks/${id}/uncomplete`);
    return data.data;
  },
};

export default taskService;
