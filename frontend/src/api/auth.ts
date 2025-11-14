/**
 * Authentication API Endpoints
 */

import apiClient, { setAuthToken, clearAuthToken } from './client';
import type { AuthResponse, LoginCredentials, RegisterData, User, ApiResponse } from '../types';

/**
 * Login user
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', credentials);

  // Store token and user data
  if (response.data.success && response.data.data.tokens?.accessToken) {
    setAuthToken(response.data.data.tokens.accessToken);
    localStorage.setItem('user', JSON.stringify(response.data.data.user));
  }

  return response.data;
};

/**
 * Register new user
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/register', data);

  // Store token and user data
  if (response.data.success && response.data.data.tokens?.accessToken) {
    setAuthToken(response.data.data.tokens.accessToken);
    localStorage.setItem('user', JSON.stringify(response.data.data.user));
  }

  return response.data;
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  try {
    await apiClient.post('/auth/logout');
  } finally {
    // Always clear local storage even if API call fails
    clearAuthToken();
  }
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<ApiResponse<User>>('/auth/me');
  return response.data.data!;
};

/**
 * Refresh authentication token
 */
export const refreshToken = async (): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/refresh');

  if (response.data.success && response.data.data.tokens?.accessToken) {
    setAuthToken(response.data.data.tokens.accessToken);
    localStorage.setItem('user', JSON.stringify(response.data.data.user));
  }

  return response.data;
};

/**
 * Update user profile
 */
export const updateProfile = async (data: Partial<User>): Promise<User> => {
  const response = await apiClient.put<ApiResponse<User>>('/auth/profile', data);
  
  // Update local storage
  if (response.data.data) {
    localStorage.setItem('user', JSON.stringify(response.data.data));
  }
  
  return response.data.data!;
};

/**
 * Change password
 */
export const changePassword = async (oldPassword: string, newPassword: string): Promise<void> => {
  await apiClient.put('/auth/change-password', { oldPassword, newPassword });
};

/**
 * Get user profile (alias for getCurrentUser)
 */
export const getProfile = getCurrentUser;
