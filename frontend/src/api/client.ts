/**
 * Axios API Client Configuration
 * Centralized HTTP client with interceptors for auth and error handling
 */

import axios, { AxiosError } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from '../types';

// Base URL from environment variable or default to localhost
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create Axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// REQUEST INTERCEPTOR
// ============================================

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
    const token = localStorage.getItem('authToken');
    
    console.log('📤 API Request:', {
      url: config.url,
      method: config.method,
      hasToken: !!token,
      currentAuthHeader: config.headers?.Authorization,
    });
    
    // Add Authorization header if token exists
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token attached to request:', token.substring(0, 20) + '...');
    } else if (!token) {
      console.log('⚠️ No token found in localStorage');
    }
    
    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// ============================================
// RESPONSE INTERCEPTOR
// ============================================

apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      url: response.config.url,
      status: response.status,
      hasData: !!response.data,
    });
    // Return successful response data
    return response;
  },
  (error: AxiosError<ApiError>) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
    });
    
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          console.log('🚫 401 Unauthorized - Clearing token');
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          break;
          
        case 403:
          // Forbidden
          console.error('Access forbidden:', data.message);
          break;
          
        case 404:
          // Not found
          console.error('Resource not found:', data.message);
          break;
          
        case 429:
          // Too many requests
          console.error('Rate limit exceeded:', data.message);
          break;
          
        case 500:
          // Server error
          console.error('Server error:', data.message);
          break;
          
        default:
          console.error('API Error:', data.message);
      }
      
      return Promise.reject(data);
    } else if (error.request) {
      // Request made but no response received
      console.error('Network error: No response from server');
      return Promise.reject({
        success: false,
        error: 'NETWORK_ERROR',
        message: 'Unable to connect to server. Please check your internet connection.',
        statusCode: 0,
      });
    } else {
      // Error in request setup
      console.error('Request error:', error.message);
      return Promise.reject({
        success: false,
        error: 'REQUEST_ERROR',
        message: error.message,
        statusCode: 0,
      });
    }
  }
);

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Set authentication token
 */
export const setAuthToken = (token: string) => {
  console.log('💾 Saving token to localStorage:', token.substring(0, 20) + '...');
  localStorage.setItem('authToken', token);
  // Also set it in axios defaults for immediate use
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  console.log('✅ Token saved and set in Axios headers');
};

/**
 * Clear authentication token
 */
export const clearAuthToken = () => {
  console.log('🗑️ Clearing auth token');
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  delete apiClient.defaults.headers.common['Authorization'];
};

/**
 * Get current auth token
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

export default apiClient;
