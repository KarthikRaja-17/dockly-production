
import { FitbitUserGoals, HealthGoal } from '../health/types';

// services/fitbit/types.ts
export interface FitbitConnectionStatus {
  connected: boolean;
  user_info?: FitbitUserInfo;
  connected_at?: string;
  expires_at?: string;
}

export interface FitbitUserInfo {
  id: string;
  fitbit_user_id: string;
  display_name: string;
  avatar: string;
  member_since: string;
}

export interface FitbitDailyData {
  id?: string;
  user_id: string;
  date: string;
  steps: number;
  calories_burned: number;
  distance: number;
  floors_climbed: number;
  active_minutes: number;
  sedentary_minutes: number;
  resting_heart_rate: number;
  weight?: number;
  bmi?: number;
  body_fat_percentage?: number;
  created_at?: string;
  updated_at?: string;
}

export interface FitbitSleepData {
  id?: string;
  user_id: string;
  date: string;
  duration_minutes: number;
  efficiency: number;
  minutes_asleep: number;
  minutes_awake: number;
  minutes_to_fall_asleep: number;
  time_in_bed: number;
  deep_sleep_minutes: number;
  light_sleep_minutes: number;
  rem_sleep_minutes: number;
  wake_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface FitbitActivity {
  id?: string;
  user_id: string;
  activity_date: string;
  activity_type: string;
  duration_minutes: number;
  calories_burned: number;
  distance: number;
  average_heart_rate: number;
  peak_heart_rate: number;
  created_at?: string;
}

export interface FitbitSyncLog {
  id?: number;
  user_id: string;
  sync_date: string;
  sync_type: string;
  data_types: string;
  records_synced: number;
  status: string;
  error_message?: string;
  created_at?: string;
}

export interface FitbitStats {
  total_days: number;
  avg_daily_steps: number;
  avg_daily_calories: number;
  total_steps_30_days: number;
  total_calories_30_days: number;
}

export interface FitbitDashboardData {
  daily_data: FitbitDailyData[];
  sleep_data: FitbitSleepData[];
  activities: FitbitActivity[];
  fitbit_connected: boolean;
  user_info: FitbitUserInfo;
  latest_sync: FitbitSyncLog;
  stats: FitbitStats;
}

export interface FitbitVitalData {
  label: string;
  value: string;
  meta: string;
}

export interface FitbitApiResponse<T = any> {
  status: number;
  message: string;
  payload: T;
}

// Hook state interface
export interface FitbitState {
  // Connection state
  isConnected: boolean;
  userInfo: FitbitUserInfo | null;
  
  // Data state
  dashboardData: FitbitDashboardData | null;
  dailyData: FitbitDailyData[];
  sleepData: FitbitSleepData[];
  activities: FitbitActivity[];
  syncLogs: FitbitSyncLog[];
  
  // Loading states
  isLoading: boolean;
  isConnecting: boolean;
  isSyncing: boolean;
  isCheckingConnection: boolean;
  
  // Error state
  error: string | null;
    // NEW: Goals properties - ADD THESE TO YOUR EXISTING INTERFACE
  goals: FitbitUserGoals | null;
  healthGoals: HealthGoal[];
  isLoadingGoals: boolean;
  isSyncingGoals: boolean;
}

// Hook actions interface
export interface FitbitActions {
  // Connection actions
  connect: () => void;
  disconnect: () => Promise<void>;
  checkConnection: () => Promise<void>;
  
  // Data actions
  syncData: () => Promise<void>;
  fetchDashboard: () => Promise<void>;
  fetchDailyData: (params?: FitbitDataParams) => Promise<void>;
  fetchSleepData: (params?: FitbitDataParams) => Promise<void>;
  fetchActivities: (params?: FitbitDataParams) => Promise<void>;
  fetchSyncLogs: (params?: { limit?: number }) => Promise<void>;
  
  // Utility actions
  getVitalsData: () => FitbitVitalData[];
  clearError: () => void;

  // NEW: Goals actions - ADD THESE TO YOUR EXISTING INTERFACE
  loadGoals: () => Promise<void>;
  syncGoals: () => Promise<void>;

}

export interface FitbitDataParams {
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export interface FitbitConnectParams {
  username: string;
  userId: string;
}

export interface FitbitHookReturn extends FitbitState {
  actions: FitbitActions;
}