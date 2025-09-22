// services/fitbit/api.ts - Standalone Fitbit API (doesn't modify apiConfig.ts)
import axios from 'axios';
import {
  FitbitApiResponse,
  FitbitConnectionStatus,
  FitbitDashboardData,
  FitbitDailyData,
  FitbitSleepData,
  FitbitActivity,
  FitbitSyncLog,
  FitbitDataParams,
  FitbitConnectParams
} from './types';

// Create a separate axios instance for Fitbit or use the existing one
let fitbitApi: any;

// Try to import the existing api instance, fallback to creating new one
try {
  const { api } = require('../apiConfig');
  fitbitApi = api;
} catch {
  // Fallback if apiConfig is not available
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/server/api';
  fitbitApi = axios.create({
    baseURL: API_URL,
    headers: { "Content-Type": "application/json" }
  });
  
  // Add auth interceptor for fallback instance
  if (typeof window !== "undefined") {
    fitbitApi.interceptors.request.use(
      (config: any) => {
        const token = localStorage.getItem("Dtoken");
        if (token) {
          config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
      },
      (error: any) => Promise.reject(error)
    );
  }
}

// Get the base API URL for OAuth redirect
export const getApiUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/server/api';
};

/**
 * Fitbit OAuth Connection
 */
export const connectFitbitAccount = async (params: FitbitConnectParams): Promise<void> => {
  const oauthUrl = `${getApiUrl()}/add-fitbit?username=${encodeURIComponent(params.username)}&userId=${encodeURIComponent(params.userId)}`;
  
  const newTab = window.open(oauthUrl, '_blank');
  
  if (!newTab) {
    throw new Error('Please allow popups/new tabs for this site to connect with Fitbit.');
  }
};

/**
 * Check Fitbit connection status
 */
export const getFitbitConnectionStatus = async (userId: string): Promise<FitbitApiResponse<FitbitConnectionStatus>> => {
  try {
    const response = await fitbitApi.get('/get/fitbit/connection-status', {
      params: { uid: userId }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error checking Fitbit connection:', error);
    throw new Error(error.response?.data?.message || 'Failed to check Fitbit connection status');
  }
};

/**
 * Disconnect Fitbit account
 */
export const disconnectFitbitAccount = async (userId: string): Promise<FitbitApiResponse> => {
  try {
    const response = await fitbitApi.post('/disconnect/fitbit', { uid: userId });
    return response.data;
  } catch (error: any) {
    console.error('Error disconnecting Fitbit:', error);
    throw new Error(error.response?.data?.message || 'Failed to disconnect Fitbit account');
  }
};

/**
 * Sync Fitbit data manually
 */
export const syncFitbitData = async (userId: string): Promise<FitbitApiResponse> => {
  try {
    const response = await fitbitApi.post('/sync/fitbit', { uid: userId });
    return response.data;
  } catch (error: any) {
    console.error('Error syncing Fitbit data:', error);
    throw new Error(error.response?.data?.message || 'Failed to sync Fitbit data');
  }
};

/**
 * Get Fitbit dashboard data (summary of all data)
 */
export const getFitbitDashboard = async (userId: string): Promise<FitbitApiResponse<FitbitDashboardData>> => {
  try {
    const response = await fitbitApi.get('/get/fitbit/dashboard', {
      params: { uid: userId }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching Fitbit dashboard:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch Fitbit dashboard data');
  }
};

/**
 * Get Fitbit daily activity data
 */
export const getFitbitDailyData = async (
  userId: string, 
  params?: FitbitDataParams
): Promise<FitbitApiResponse<{ daily_data: FitbitDailyData[] }>> => {
  try {
    const response = await fitbitApi.get('/get/fitbit/daily-data', {
      params: {
        uid: userId,
        ...params
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching Fitbit daily data:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch daily activity data');
  }
};

/**
 * Get Fitbit sleep data
 */
export const getFitbitSleepData = async (
  userId: string,
  params?: FitbitDataParams
): Promise<FitbitApiResponse<{ sleep_data: FitbitSleepData[] }>> => {
  try {
    const response = await fitbitApi.get('/get/fitbit/sleep-data', {
      params: {
        uid: userId,
        ...params
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching Fitbit sleep data:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch sleep data');
  }
};

/**
 * Get Fitbit activities/workouts
 */
export const getFitbitActivities = async (
  userId: string,
  params?: FitbitDataParams
): Promise<FitbitApiResponse<{ activities: FitbitActivity[] }>> => {
  try {
    const response = await fitbitApi.get('/get/fitbit/activities', {
      params: {
        uid: userId,
        ...params
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching Fitbit activities:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch activities data');
  }
};

/**
 * Get Fitbit sync logs
 */
export const getFitbitSyncLogs = async (
  userId: string,
  params?: { limit?: number }
): Promise<FitbitApiResponse<{ sync_logs: FitbitSyncLog[] }>> => {
  try {
    const response = await fitbitApi.get('/get/fitbit/sync-logs', {
      params: {
        uid: userId,
        ...params
      }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching Fitbit sync logs:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch sync logs');
  }
};

/**
 * Helper function to handle API responses
 */
export const handleFitbitApiResponse = <T>(response: FitbitApiResponse<T>): T => {
  if (response.status !== 1) {
    throw new Error(response.message || 'API request failed');
  }
  return response.payload;
};

/**
 * Batch fetch all Fitbit data
 */
export const fetchAllFitbitData = async (userId: string) => {
  try {
    const [dashboard, dailyData, sleepData, activities, syncLogs] = await Promise.allSettled([
      getFitbitDashboard(userId),
      getFitbitDailyData(userId, { limit: 30 }),
      getFitbitSleepData(userId, { limit: 30 }),
      getFitbitActivities(userId, { limit: 20 }),
      getFitbitSyncLogs(userId, { limit: 10 })
    ]);

    return {
      dashboard: dashboard.status === 'fulfilled' ? dashboard.value : null,
      dailyData: dailyData.status === 'fulfilled' ? dailyData.value : null,
      sleepData: sleepData.status === 'fulfilled' ? sleepData.value : null,
      activities: activities.status === 'fulfilled' ? activities.value : null,
      syncLogs: syncLogs.status === 'fulfilled' ? syncLogs.value : null,
      errors: [
        dashboard.status === 'rejected' ? dashboard.reason : null,
        dailyData.status === 'rejected' ? dailyData.reason : null,
        sleepData.status === 'rejected' ? sleepData.reason : null,
        activities.status === 'rejected' ? activities.reason : null,
        syncLogs.status === 'rejected' ? syncLogs.reason : null
      ].filter(Boolean)
    };
  } catch (error) {
    console.error('Error in batch fetch:', error);
    throw error;
  }
};