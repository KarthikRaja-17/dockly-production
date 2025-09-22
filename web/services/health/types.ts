// types.ts

export interface MedicationData {
  id?: number;
  name: string;
  dosage: string;
  conditionTreated: string;
  prescribingDoctor?: string;  // optional
  schedule: string;
  refillDaysLeft: number;
  icon?: string;               // optional
  isRefillSoon?: boolean;      // optional
  editing?: boolean;
  created_at?: string;    // optional
}

export interface WellnessTaskData {
  id?: number;
  icon: string;
  text: string;
  date: string;
  recurring?: boolean;   // <-- optional
  details?: string;      // details might also be optional
  completed?: boolean;   // usually UI toggles it, so safe as optional
  editing?: boolean;
}

export interface HealthcareProviderData {
  id?: number;
  name: string;
  specialty: string;
  phone?: string;
  practiceName?: string;
  address?: string;
  icon?: string;
  notes?: string;
  editing?: boolean;
}

// insurance.ts
export interface InsuranceAccountData {
  id?: number;
  providerName: string;
  planName: string;
  accountType?: string;  // <-- make optional here too
  details: Array<{
    label: string;
    value: string;
  }>;
  contactInfo?: string;
  logoText?: string;
  gradientStyle?: string;
  notes?: string;
}

// ==================== NEW: FITBIT GOALS TYPES ====================

// Fitbit Goals Data Types
export interface FitbitUserGoals {
  id: string;
  user_id: string;
  
  // Daily Activity Goals
  daily_steps_goal: number;
  daily_calories_goal: number;
  daily_distance_goal: number;
  daily_active_minutes_goal: number;
  daily_floors_goal: number;
  
  // Weekly Goals
  weekly_distance_goal: number;
  weekly_floors_goal: number;
  
  // Body Goals
  weight_goal: number;
  weight_goal_date: string;
  starting_weight: number;
  body_fat_goal: number;
  
  // Metadata
  created_at: string;
  updated_at: string;
  is_active: number;
}

// Goal Progress Calculation
export interface GoalProgress {
  steps?: {
    current: number;
    target: number;
    progress: number;
  };
  weight?: {
    current: number;
    target: number;
    starting: number;
    progress: number;
  };
  calories?: {
    current: number;
    target: number;
    progress: number;
  };
  active_minutes?: {
    current: number;
    target: number;
    progress: number;
  };
}

// Enhanced Fitbit Dashboard Data (with goals)
export interface FitbitDashboardData {
  daily_data: Array<{
    id: string;
    user_id: string;
    date: string;
    steps: number;
    calories_burned: number;
    distance: number;
    floors_climbed: number;
    active_minutes: number;
    sedentary_minutes: number;
    resting_heart_rate: number;
    weight: number;
    bmi: number;
    body_fat_percentage: number;
    created_at: string;
    updated_at: string;
  }>;
  sleep_data: Array<{
    id: string;
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
    created_at: string;
    updated_at: string;
  }>;
  activities: Array<{
    id: string;
    user_id: string;
    activity_date: string;
    activity_type: string;
    duration_minutes: number;
    calories_burned: number;
    distance: number;
    average_heart_rate: number;
    peak_heart_rate: number;
    created_at: string;
  }>;
  user_goals: FitbitUserGoals;
  goal_progress: GoalProgress;
  fitbit_connected: boolean;
  user_info: {
    id: string;
    fitbit_user_id: string;
    display_name: string;
    avatar: string;
    member_since: string;
    connected_at: string;
  };
  latest_sync: {
    sync_date: string;
    status: string;
    records_synced: number;
  };
  stats: {
    total_days: number;
    avg_daily_steps: number;
    avg_daily_calories: number;
    total_steps_30_days: number;
    total_calories_30_days: number;
  };
}

// API Response Types
export interface FitbitGoalsApiResponse {
  status: number;
  message: string;
  payload: {
    goals: FitbitUserGoals;
    source: 'cached' | 'live';
    last_updated: string;
  };
}

export interface FitbitSyncGoalsResponse {
  status: number;
  message: string;
  payload: {
    goals: FitbitUserGoals;
  };
}

export interface FitbitDashboardApiResponse {
  status: number;
  message: string;
  payload: FitbitDashboardData;
}

// Health Goals Component Types
export interface HealthGoal {
  title: string;
  targetDate: string;
  current: string;
  target: string;
  progress: number;
  subtext: string;
  type: 'steps' | 'weight' | 'exercise' | 'calories' | 'custom';
  icon: string;
  achieved?: boolean;
}

// Goal Type Mapping
export enum GoalType {
  STEPS = 'steps',
  WEIGHT = 'weight',
  EXERCISE = 'exercise',
  CALORIES = 'calories',
  CUSTOM = 'custom'
}

// Fitbit Data Status
export enum FitbitDataStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  SYNCING = 'syncing',
  ERROR = 'error'
}

// Sync Status
export enum SyncStatus {
  SUCCESS = 'success',
  FAILED = 'failed',
  PENDING = 'pending',
  TRIGGERED = 'triggered'
}

// Component Props
export interface HealthGoalsProps {
  isMobile: boolean;
  userId: string;
  username?: string;
  onGoalClick?: (goal: HealthGoal) => void;
  showSyncButton?: boolean;
  refreshInterval?: number;
}

// Error Types
export interface FitbitGoalsError {
  code: string;
  message: string;
  details?: any;
}

// Configuration
export interface FitbitGoalsConfig {
  autoRefresh: boolean;
  refreshInterval: number;
  showDefaultGoals: boolean;
  enableManualSync: boolean;
}

// Utility Types
export type GoalMetrics = Pick<FitbitUserGoals, 
  'daily_steps_goal' | 
  'daily_calories_goal' | 
  'daily_active_minutes_goal' | 
  'weight_goal'
>;

export type CurrentMetrics = {
  steps: number;
  calories: number;
  active_minutes: number;
  weight: number;
  date: string;
};

// Helper Functions Types
export type GoalProcessor = (
  userGoals: FitbitUserGoals,
  currentData: FitbitDashboardData['daily_data'][0],
  goalProgress: GoalProgress
) => HealthGoal[];

export type ProgressCalculator = (
  current: number,
  target: number,
  starting?: number
) => {
  progress: number;
  remaining: number;
  achieved: boolean;
};

// ==================== EXISTING COLOR AND SHADOW DEFINITIONS ====================

export const colors = {
  primary: "#2563eb",
  primaryDark: "#1e40af",
  primaryLight: "#dbeafe",
  secondary: "#64748b",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  background: "#f8fafc",
  surface: "#ffffff",
  text: "#1e293b",
  textMuted: "#64748b",
  border: "#e2e8f0",
  healthPrimary: "#10b981",
  healthLight: "#d1fae5",
  radius: "0.75rem",
  radiusSm: "0.5rem",
};

export const shadows = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  base: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
};