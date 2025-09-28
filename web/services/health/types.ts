// Enhanced types.ts - Updated with new wellness task date fields

// ==================== FAMILY MEMBER INTERFACE ====================
export interface FamilyMember {
  id: number;
  name: string;
  role: string;
  type: "family" | "pets";
  color: string;
  initials: string;
  status?: "pending" | "accepted";
  isPet?: boolean;
  user_id?: string;
  email?: string; // Added for tagging functionality
}

// ==================== NEW: HEALTH-SPECIFIC FAMILY MEMBER INTERFACES ====================

// Family member interface specifically for health context (dropdown selection)
export interface FamilyMemberForHealth {
  user_id: string;
  name: string;
  relationship: string;
  email: string;
}

// Enhanced family members API response for health
export interface FamilyMembersForHealthResponse {
  familyMembers: FamilyMemberForHealth[];
  count: number;
  hasMembers: boolean;
}

// ==================== TAGGING SUPPORT INTERFACES ====================

// Generic tagging support mixin
export interface TaggingSupport {
  tagged_ids?: string[];
  tagged_members?: string[];
}

// Sharing request interface
export interface SharingRequest<T> {
  email: string | string[];
  tagged_members?: string[];
  [key: string]: T | string | string[] | undefined;
}

// Sharing response interface
export interface SharingResponse {
  status: number;
  message: string;
  payload: {
    notifications_created: Array<{
      notification_id: number;
      member_name: string;
      member_email: string;
      receiver_uid: string;
    }>;
  };
  errors?: Array<[string, string]>;
}

// Generic sharing function type
export type ShareFunction<T> = (
  emails: string | string[],
  item: T,
  taggedMembers?: string[]
) => Promise<SharingResponse>;

// ==================== HEALTH SUMMARY TYPES ====================

// Health Summary Info Interfaces
export interface HealthSummaryInfoData {
  id?: number;
  bloodType?: string;
  dateOfBirth?: string;
  height?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  primaryDoctor?: string;
  medicalRecordNumber?: string;
}

export interface HealthSummaryInfoResponse {
  id: number;
  bloodType: string;
  dateOfBirth: string;
  height: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  primaryDoctor: string;
  medicalRecordNumber: string;
  createdAt: string;
  updatedAt: string;
}

// User Allergies Interfaces
export interface UserAllergyData {
  id?: number;
  allergyName: string;
  severityLevel: 'mild' | 'moderate' | 'severe' | 'critical';
  allergyType?: string;
  reactionSymptoms?: string;
  notes?: string;
  editing?: boolean;
}

export interface UserAllergyResponse {
  id: number;
  allergyName: string;
  severityLevel: string;
  allergyType: string;
  reactionSymptoms: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// User Conditions Interfaces
export interface UserConditionData {
  id?: number;
  conditionName: string;
  status: 'active' | 'controlled' | 'resolved' | 'chronic';
  diagnosisDate?: string;
  treatingDoctor?: string;
  notes?: string;
  editing?: boolean;
}

export interface UserConditionResponse {
  id: number;
  conditionName: string;
  status: string;
  diagnosisDate: string;
  treatingDoctor: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== ENHANCED FAMILY MEDICAL HISTORY TYPES ====================

// Enhanced Family Medical History Interfaces with permissions
export interface FamilyMedicalHistoryData {
  id?: number;
  familyMemberUserId?: string;
  familyMemberName?: string;
  familyMemberRelation?: string;
  conditionName: string;
  ageOfOnset?: number;
  status?: string;
  notes?: string;
  editing?: boolean;
  
  // NEW: Permission fields from backend
  canEdit?: boolean;
  canDelete?: boolean;
  addedBy?: string;
}

// Enhanced backend response structure
export interface FamilyMedicalHistoryResponse {
  id: number;
  familyMemberUserId: string;
  familyMemberName: string;
  familyMemberRelation: string;
  conditionName: string;
  ageOfOnset: number;
  status: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  addedBy: string;
  canEdit: boolean;
  canDelete: boolean;
}

// Enhanced API response with stats and family members
export interface FamilyMedicalHistoryApiResponse {
  familyHistory: FamilyMedicalHistoryResponse[];
  familyMembers: FamilyMemberForHealth[];
  stats: {
    totalRecords: number;
    editableRecords: number;
    readOnlyRecords: number;
    familyMembersCount: number;
  };
}

// Stats interface for family medical history
export interface FamilyMedicalHistoryStats {
  totalRecords: number;
  editableRecords: number;
  readOnlyRecords: number;
  membersWithHistory: number;
  familyMembersCount: number;
}

// Permission types for family medical history
export interface FamilyMedicalHistoryPermissions {
  canEdit: boolean;
  canDelete: boolean;
  isReadOnly: boolean;
  addedBy: string;
  permissionText: string;
  permissionIcon: 'lock' | 'unlock';
}

// ==================== MEDICATION TYPES ====================

export interface MedicationData extends TaggingSupport {
  id?: number;
  name: string;
  dosage: string;
  conditionTreated: string;
  prescribingDoctor?: string;
  schedule: string;
  refillDaysLeft: number;
  icon?: string;
  isRefillSoon?: boolean;
  editing?: boolean;
  created_at?: string;
}

export interface MedicationResponse {
  id: number;
  name: string;
  dosage: string;
  conditionTreated: string;
  prescribingDoctor: string;
  schedule: string;
  refillDaysLeft: number;
  icon: string;
  isRefillSoon: boolean;
  tagged_ids: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MedicationSharingRequest extends SharingRequest<MedicationData> {
  medication: MedicationData;
}

// ==================== ENHANCED WELLNESS TASK TYPES ====================

// UPDATED: Enhanced wellness task interface with conditional date fields
export interface WellnessTaskData extends TaggingSupport {
  id?: number;
  icon: string;
  text: string;
  
  // LEGACY: Keep for backward compatibility
  date?: string;
  
  // NEW: Conditional date fields for recurring tasks
  start_date?: string;
  due_date?: string;
  
  recurring?: boolean;
  details?: string;
  completed?: boolean;
  editing?: boolean;
  
  // Form helpers
  startDate?: string;  // Alternative naming for forms
  dueDate?: string;    // Alternative naming for forms
}

// UPDATED: Backend response with new date fields
export interface WellnessTaskResponse {
  id: number;
  icon: string;
  text: string;
  
  // LEGACY: Backward compatibility
  date?: string;
  
  // NEW: Separate date fields
  start_date?: string;
  due_date?: string;
  
  recurring: boolean;
  details: string;
  completed: boolean;
  tagged_ids: string[];
  createdAt: string;
  updatedAt: string;
}

// UPDATED: Sharing request with new date structure
export interface WellnessTaskSharingRequest extends SharingRequest<WellnessTaskData> {
  wellness_task: {
    id?: number;
    icon: string;
    text: string;
    start_date?: string;
    due_date?: string;
    recurring?: boolean;
    details?: string;
    completed?: boolean;
  };
}

// NEW: Upcoming tasks API response for reminders
export interface UpcomingWellnessTasksResponse {
  status: number;
  message: string;
  payload: {
    tasks: Array<{
      id: number;
      icon: string;
      text: string;
      start_date: string;
      due_date: string;
      recurring: boolean;
      details: string;
      days_until_start: number;
    }>;
    date_range: {
      from: string;
      to: string;
    };
  };
}

// NEW: Validation helpers for wellness tasks
export interface WellnessTaskValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// NEW: Date validation specific to wellness tasks
export type WellnessTaskDateValidator = (
  startDate?: string,
  dueDate?: string,
  recurring?: boolean
) => WellnessTaskValidation;

// ==================== HEALTHCARE PROVIDER TYPES ====================

export interface HealthcareProviderData extends TaggingSupport {
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

export interface HealthcareProviderResponse {
  id: number;
  name: string;
  specialty: string;
  phone: string;
  practiceName: string;
  address: string;
  icon: string;
  notes: string;
  tagged_ids: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProviderSharingRequest extends SharingRequest<HealthcareProviderData> {
  provider: HealthcareProviderData;
}

// ==================== INSURANCE TYPES ====================

export interface InsuranceAccountData extends TaggingSupport {
  id?: number;
  providerName: string;
  planName: string;
  accountType?: string;
  details: Array<{
    label: string;
    value: string;
  }>;
  contactInfo?: string;
  logoText?: string;
  gradientStyle?: string;
  notes?: string;
  editing?: boolean;
}

export interface InsuranceAccountResponse {
  id: number;
  providerName: string;
  planName: string;
  accountType: string;
  details: Array<{
    label: string;
    value: string;
  }>;
  contactInfo: string;
  logoText: string;
  gradientStyle: string;
  notes: string;
  tagged_ids: string[];
  createdAt: string;
  updatedAt: string;
}

export interface InsuranceSharingRequest extends SharingRequest<InsuranceAccountData> {
  insurance_account: InsuranceAccountData;
}

// ==================== HEALTH DASHBOARD STATE TYPES ====================

// Combined health data state interface
export interface HealthDataState {
  // Data states
  medications: MedicationData[];
  wellnessTasks: WellnessTaskData[];
  providers: HealthcareProviderData[];
  insuranceAccounts: InsuranceAccountData[];
  healthInfo: HealthSummaryInfoData;
  allergies: UserAllergyData[];
  conditions: UserConditionData[];
  familyHistory: FamilyMedicalHistoryData[];
  
  // NEW: Family members for health context
  familyMembers: FamilyMemberForHealth[];
  familyHistoryStats?: FamilyMedicalHistoryStats;

  // Loading states
  medicationsLoading: boolean;
  wellnessLoading: boolean;
  providersLoading: boolean;
  insuranceLoading: boolean;
  healthInfoLoading: boolean;
  allergiesLoading: boolean;
  conditionsLoading: boolean;
  familyHistoryLoading: boolean;
  familyMembersLoading: boolean;
  generalLoading: boolean;
}

// Health data actions interface
export interface HealthDataActions {
  // Load functions
  loadAllHealthData: () => Promise<void>;
  loadMedications: () => Promise<void>;
  loadWellnessTasks: () => Promise<void>;
  loadProviders: () => Promise<void>;
  loadInsuranceAccounts: () => Promise<void>;
  loadHealthSummaryInfo: () => Promise<void>;
  loadAllergies: () => Promise<void>;
  loadConditions: () => Promise<void>;
  loadFamilyMedicalHistory: () => Promise<void>;
  loadFamilyMembers: () => Promise<void>;

  // Medication actions
  handleAddMedication: (medicationData: MedicationData) => Promise<void>;
  handleEditMedication: (id: number, medicationData: MedicationData) => Promise<void>;
  handleDeleteMedication: (id: number) => Promise<void>;

  // UPDATED: Wellness task actions
  handleAddWellnessTask: (taskData: WellnessTaskData) => Promise<void>;
  handleEditWellnessTask: (id: number, taskData: WellnessTaskData) => Promise<void>;
  handleDeleteWellnessTask: (id: number) => Promise<void>;
  handleToggleWellnessTask: (id: number) => Promise<void>;

  // Provider actions
  handleAddProvider: (providerData: HealthcareProviderData) => Promise<void>;
  handleEditProvider: (id: number, providerData: HealthcareProviderData) => Promise<void>;
  handleDeleteProvider: (id: number) => Promise<void>;

  // Insurance actions
  handleAddInsurance: (insuranceData: InsuranceAccountData) => Promise<void>;
  handleEditInsurance: (id: number, insuranceData: InsuranceAccountData) => Promise<void>;
  handleDeleteInsurance: (id: number) => Promise<void>;

  // Health summary actions
  handleSaveHealthInfo: (infoData: HealthSummaryInfoData) => Promise<void>;
  handleAddAllergy: (allergyData: UserAllergyData) => Promise<void>;
  handleEditAllergy: (id: number, allergyData: UserAllergyData) => Promise<void>;
  handleDeleteAllergy: (id: number) => Promise<void>;
  handleAddCondition: (conditionData: UserConditionData) => Promise<void>;
  handleEditCondition: (id: number, conditionData: UserConditionData) => Promise<void>;
  handleDeleteCondition: (id: number) => Promise<void>;
  
  // Enhanced family medical history actions
  handleAddFamilyHistory: (historyData: FamilyMedicalHistoryData) => Promise<void>;
  handleEditFamilyHistory: (id: number, historyData: FamilyMedicalHistoryData) => Promise<void>;
  handleDeleteFamilyHistory: (id: number) => Promise<void>;
}

// ==================== COMPONENT PROPS INTERFACES ====================

// Health Summary component props
export interface HealthSummaryProps {
  isMobile: boolean;
  userId: string;
  username: string;
  
  // Health info props
  healthInfo: HealthSummaryInfoData;
  healthInfoLoading: boolean;
  onEditHealthInfo: () => void;
  
  // Allergies props
  allergies: UserAllergyData[];
  allergiesLoading: boolean;
  onAddAllergy: () => void;
  onEditAllergy: (allergy: UserAllergyData) => void;
  onViewAllergy: (allergy: UserAllergyData) => void;
  onDeleteAllergy: (id: number) => Promise<void>;
  
  // Conditions props
  conditions: UserConditionData[];
  conditionsLoading: boolean;
  onAddCondition: () => void;
  onViewCondition: (condition: UserConditionData) => void;
  onEditCondition: (condition: UserConditionData) => void;
  onDeleteCondition: (id: number) => Promise<void>;
  
  // Enhanced family history props with permissions
  familyHistory: FamilyMedicalHistoryData[];
  familyMembers: FamilyMemberForHealth[];
  familyHistoryStats?: FamilyMedicalHistoryStats;
  familyHistoryLoading: boolean;
  onAddFamilyHistory: (familyMembers: FamilyMemberForHealth[]) => void;
  onViewFamilyHistory: (history: FamilyMedicalHistoryData) => void;
  onEditFamilyHistory: (history: FamilyMedicalHistoryData, familyMembers: FamilyMemberForHealth[]) => void;
  onDeleteFamilyHistory: (id: number) => Promise<void>;
  
  // Health tracker callback props
  onFitbitConnected?: () => void;
  onGarminConnected?: () => void;
}

// ==================== FITBIT GOALS TYPES ====================

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

// ==================== VALIDATION AND UTILITY TYPES ====================

// Validation result type
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Permission check result
export interface PermissionCheckResult {
  canEdit: boolean;
  canDelete: boolean;
  reason?: string;
}

// Data transformation types
export type DataTransformer<TInput, TOutput> = (input: TInput) => TOutput;
export type DataValidator<T> = (data: T) => ValidationResult;

// ==================== COLOR AND SHADOW DEFINITIONS ====================

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