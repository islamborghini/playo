/**
 * Task Management API Endpoints
 */

import apiClient from './client';
import type { Task, CreateTaskData, TaskStats, CompleteTaskResponse, ApiResponse } from '../types';

/**
 * Get all tasks for current user
 */
export const getTasks = async (filters?: {
  type?: string;
  category?: string;
  isActive?: boolean;
}): Promise<Task[]> => {
  const response = await apiClient.get<ApiResponse<Task[]>>('/tasks', { params: filters });
  return response.data.data!;
};

/**
 * Get single task by ID
 */
export const getTask = async (id: string): Promise<Task> => {
  const response = await apiClient.get<ApiResponse<Task>>(`/tasks/${id}`);
  return response.data.data!;
};

/**
 * Create new task
 */
export const createTask = async (data: CreateTaskData): Promise<Task> => {
  const response = await apiClient.post<ApiResponse<Task>>('/tasks', data);
  return response.data.data!;
};

/**
 * Update existing task
 */
export const updateTask = async (id: string, data: Partial<CreateTaskData>): Promise<Task> => {
  const response = await apiClient.put<ApiResponse<Task>>(`/tasks/${id}`, data);
  return response.data.data!;
};

/**
 * Delete task
 */
export const deleteTask = async (id: string): Promise<void> => {
  await apiClient.delete(`/tasks/${id}`);
};

/**
 * Complete a task and gain XP
 */
export const completeTask = async (id: string): Promise<CompleteTaskResponse> => {
  const response = await apiClient.post<CompleteTaskResponse>(`/tasks/${id}/complete`);
  
  // Update user data in localStorage if leveled up
  if (response.data.data.leveledUp) {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      user.level = response.data.data.newLevel;
      localStorage.setItem('user', JSON.stringify(user));
    }
  }
  
  return response.data;
};

/**
 * Get task statistics
 */
export const getTaskStats = async (): Promise<TaskStats> => {
  const response = await apiClient.get<ApiResponse<TaskStats>>('/tasks/stats');
  return response.data.data!;
};
