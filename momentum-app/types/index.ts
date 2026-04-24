export type Priority = 'HIGH' | 'MID' | 'LOW' | 'NONE';
export type RecurrenceType = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface User {
  email: string;
  displayName: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  priority: Priority;
  points: number;
  dueDate?: string;
  completed: boolean;
  completedAt?: string;
  recurring: boolean;
  recurrenceType?: RecurrenceType;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: string;
  recurring?: boolean;
  recurrenceType?: RecurrenceType;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  priority?: Priority;
  dueDate?: string;
  recurring?: boolean;
  recurrenceType?: RecurrenceType;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
