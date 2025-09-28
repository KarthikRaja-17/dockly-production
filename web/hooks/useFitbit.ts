// hooks/useFitbit.ts - Comprehensive Fitbit Integration with UI Logic
import { useState, useEffect, useCallback, useRef } from 'react';
import { notification } from 'antd';
import { API_URL } from '../services/apiConfig';
import {
  connectFitbit,
  getFitbitConnectionStatus,
  disconnectFitbit,
  syncFitbitData,
  getFitbitDashboard,
  getFitbitDailyData,
  getFitbitSleepData,
  getFitbitActivities,
  getFitbitSyncLogs,
  getFitbitGoals,
  syncFitbitGoals
} from '../services/health/fitbit';

// Import types from the centralized types file
import { FitbitDashboardData, FitbitUserGoals, HealthGoal } from '../services/health/types';

// Additional types needed for this hook
export interface FitbitVitalData {
  label: string;
  value: string;
  meta: string;
}

export interface FitbitUserInfo {
  user_id?: string;
  display_name?: string;
  full_name?: string;
  member_since?: string;
}

export interface FitbitState {
  // Connection state
  isConnected: boolean;
  userInfo: FitbitUserInfo | null;
  
  // Data state
  dashboardData: FitbitDashboardData | null;
  dailyData: any[];
  sleepData: any[];
  activities: any[];
  syncLogs: any[];
  
  // Loading states
  isLoading: boolean;
  isConnecting: boolean;
  isSyncing: boolean;
  isCheckingConnection: boolean;
  
  // Error state
  error: string | null;

  // Goals-related state
  goals: FitbitUserGoals | null;
  healthGoals: HealthGoal[];
  isLoadingGoals: boolean;
  isSyncingGoals: boolean;

  // UI-specific states
  polling: boolean;
  pollCount: number;
  connectionChecking: boolean;
}

export interface FitbitActions {
  // Connection actions
  connect: () => void;
  disconnect: () => Promise<void>;
  checkConnection: () => Promise<void>;
  refreshConnection: () => Promise<void>;
  
  // Data actions
  syncData: () => Promise<void>;
  fetchDashboard: () => Promise<void>;
  
  // Goals actions
  loadGoals: () => Promise<void>;
  syncGoals: () => Promise<void>;
  
  // Utility actions
  getVitalsData: () => FitbitVitalData[];
  clearError: () => void;
}

export interface FitbitHookReturn extends FitbitState {
  actions: FitbitActions;
}

interface UseFitbitProps {
  userId: string;
  username: string;
  onConnected?: (dashboardData?: FitbitDashboardData) => void;
  autoCheck?: boolean;
}

export const useFitbit = ({
  userId,
  username,
  onConnected,
  autoCheck = true
}: UseFitbitProps): FitbitHookReturn => {
  // Complete state management with UI-specific states
  const [state, setState] = useState<FitbitState>({
    // Connection state
    isConnected: false,
    userInfo: null,
    
    // Data state
    dashboardData: null,
    dailyData: [],
    sleepData: [],
    activities: [],
    syncLogs: [],
    
    // Loading states
    isLoading: false,
    isConnecting: false,
    isSyncing: false,
    isCheckingConnection: false,
    
    // Error state
    error: null,

    // Goals-related state
    goals: null,
    healthGoals: [],
    isLoadingGoals: false,
    isSyncingGoals: false,

    // UI-specific states
    polling: false,
    pollCount: 0,
    connectionChecking: false
  });

  // Refs to prevent excessive API calls
  const lastCheckTime = useRef<number>(0);
  const isCheckingRef = useRef<boolean>(false);
  const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fallback vitals data for when not connected
  const fallbackVitalsData: FitbitVitalData[] = [
    { label: 'Weight', value: '--', meta: 'Connect Fitbit for data' },
    { label: 'Blood Pressure', value: '--', meta: 'Manual entry required' },
    { label: 'Heart Rate', value: '--', meta: 'Connect Fitbit for data' },
    { label: 'BMI', value: '--', meta: 'Connect Fitbit for data' },
    { label: 'Cholesterol', value: '--', meta: 'Manual entry required' },
    { label: 'Blood Sugar', value: '--', meta: 'Manual entry required' }
  ];

  // Update state helper
  const updateState = useCallback((updates: Partial<FitbitState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  // Default health goals generator
  const getDefaultHealthGoals = useCallback((): HealthGoal[] => [
    {
      title: "Daily Steps",
      targetDate: "Daily Goal",
      current: "Connect Fitbit",
      target: "10,000",
      progress: 0,
      subtext: "Connect Fitbit to track your steps automatically",
      type: 'steps',
      icon: "👟",
      achieved: false
    },
    {
      title: "Weight Target",
      targetDate: "Set in Fitbit",
      current: "No data",
      target: "Set goal",
      progress: 0,
      subtext: "Set your weight goal in the Fitbit app",
      type: 'weight',
      icon: "⚖️",
      achieved: false
    },
    {
      title: "Daily Exercise",
      targetDate: "Daily Goal",
      current: "Connect Fitbit",
      target: "30 min",
      progress: 0,
      subtext: "Track active minutes with Fitbit",
      type: 'exercise',
      icon: "💪",
      achieved: false
    }
  ], []);

  // Process Fitbit goals into health goals format
// Process Fitbit goals into health goals format - FIXED Weight Progress Calculation
const processFitbitGoals = useCallback((goalsData: FitbitUserGoals, dashboardData: FitbitDashboardData): HealthGoal[] => {
  const processedGoals: HealthGoal[] = [];
  const latestData = dashboardData.daily_data && dashboardData.daily_data.length > 0
    ? dashboardData.daily_data[0]
    : null;

  // Daily Steps Goal
  if (goalsData.daily_steps_goal && goalsData.daily_steps_goal > 0) {
    const current = latestData?.steps || 0;
    const target = goalsData.daily_steps_goal;
    const progress = target > 0 ? Math.min(100, (current / target) * 100) : 0;
    const remaining = Math.max(0, target - current);

    processedGoals.push({
      title: "Daily Steps",
      targetDate: "Daily Goal",
      current: `${current.toLocaleString()} steps`,
      target: target.toLocaleString(),
      progress: Math.round(progress),
      subtext: remaining > 0 ? `${remaining.toLocaleString()} steps to go today` : "Goal achieved! 🎉",
      type: 'steps',
      icon: "👟",
      achieved: progress >= 100
    });
  }

  // Weight Goal - FIXED LOGIC
  if (goalsData.weight_goal && goalsData.weight_goal > 0) {
    const current = latestData?.weight || 0;
    const target = goalsData.weight_goal;
    const starting = goalsData.starting_weight;
    
    let progress = 0;
    let progressText = "";
    
    if (current > 0) {
      // If we have a proper starting weight from Fitbit
      if (starting && starting !== current && starting !== target) {
        const totalChange = Math.abs(starting - target);
        
        if (starting < target) {
          // Weight gain goal: calculate progress from starting weight to target
          const currentChange = Math.max(0, current - starting);
          progress = totalChange > 0 ? Math.min(100, (currentChange / totalChange) * 100) : 0;
          const remaining = Math.max(0, target - current);
          progressText = remaining > 0 
            ? `Gained ${currentChange.toFixed(1)} lbs of ${totalChange.toFixed(1)} lbs goal`
            : `Goal achieved! Gained ${currentChange.toFixed(1)} lbs 🎉`;
        } else if (starting > target) {
          // Weight loss goal: calculate progress from starting weight to target
          const currentChange = Math.max(0, starting - current);
          progress = totalChange > 0 ? Math.min(100, (currentChange / totalChange) * 100) : 0;
          const remaining = Math.max(0, current - target);
          progressText = remaining > 0 
            ? `Lost ${currentChange.toFixed(1)} lbs of ${totalChange.toFixed(1)} lbs goal`
            : `Goal achieved! Lost ${currentChange.toFixed(1)} lbs 🎉`;
        }
      } else {
        // No reliable starting weight - calculate progress as percentage of target achieved
        // This handles cases where Fitbit doesn't provide starting_weight or starting_weight equals current
        if (current <= target) {
          // Assume weight gain goal (current weight is progress toward target)
          progress = (current / target) * 100;
          const remaining = target - current;
          progressText = remaining > 0 
            ? `${current.toFixed(1)} lbs of ${target.toFixed(1)} lbs target (${remaining.toFixed(1)} lbs to go)`
            : `Target achieved! 🎉`;
        } else {
          // Current weight exceeds target - assume already achieved or weight loss goal
          progress = 100;
          const excess = current - target;
          progressText = `Target achieved! Currently ${excess.toFixed(1)} lbs above target`;
        }
      }
    } else {
      progressText = "Connect Fitbit to track weight progress";
    }

    processedGoals.push({
      title: "Weight Target",
      targetDate: goalsData.weight_goal_date || "Ongoing Goal",
      current: current > 0 ? `${current.toFixed(1)} lbs` : "No data",
      target: `${target.toFixed(1)} lbs`,
      progress: Math.round(progress),
      subtext: progressText,
      type: 'weight',
      icon: "⚖️",
      achieved: progress >= 100
    });
  }

  // Active Minutes Goal
  if (goalsData.daily_active_minutes_goal && goalsData.daily_active_minutes_goal > 0) {
    const current = latestData?.active_minutes || 0;
    const target = goalsData.daily_active_minutes_goal;
    const progress = target > 0 ? Math.min(100, (current / target) * 100) : 0;
    const remaining = Math.max(0, target - current);

    processedGoals.push({
      title: "Daily Active Minutes",
      targetDate: "Daily Goal",
      current: `${current} minutes`,
      target: `${target} min`,
      progress: Math.round(progress),
      subtext: remaining > 0 ? `${remaining} minutes to go today` : `Goal achieved! +${current - target} extra minutes`,
      type: 'exercise',
      icon: "💪",
      achieved: progress >= 100
    });
  }

  return processedGoals;
}, []);

  // Check Fitbit connection status
  const checkConnection = useCallback(async (): Promise<void> => {
    if (!userId) return;

    console.log('DEBUG: Checking Fitbit connection status');
    updateState({ isCheckingConnection: true, connectionChecking: true, error: null });

    try {
      const response = await getFitbitConnectionStatus({ uid: userId });
      console.log('DEBUG: Connection status response:', response.data);

      if (response.data.status === 1) {
        const isConnected = response.data.payload.connected;
        updateState({
          isConnected,
          userInfo: response.data.payload.user_info || null,
          isCheckingConnection: false,
          connectionChecking: false
        });

        if (isConnected) {
          console.log('DEBUG: Fitbit is connected, fetching data');
          await fetchDashboard();
        } else {
          console.log('DEBUG: Fitbit is not connected');
          updateState({
            dashboardData: null,
            dailyData: [],
            sleepData: [],
            activities: [],
            syncLogs: [],
            goals: null,
            healthGoals: getDefaultHealthGoals()
          });
        }
      }
    } catch (error: any) {
      console.error("Error checking Fitbit connection:", error);
      updateState({
        error: error.message,
        isCheckingConnection: false,
        connectionChecking: false,
        isConnected: false
      });
    } finally {
      updateState({ isLoading: false });
    }
  }, [userId, updateState, getDefaultHealthGoals]);

  // Manual refresh connection status
  const refreshConnection = useCallback(async (): Promise<void> => {
    console.log('DEBUG: Manually refreshing Fitbit connection status');

    const loadingKey = 'fitbit-refresh-loading';
    notification.open({
      key: loadingKey,
      message: 'Checking Connection',
      description: 'Verifying your Fitbit connection status...',
      duration: 0
    });

    try {
      await checkConnection();

      notification.destroy(loadingKey);

      if (state.isConnected) {
        if (onConnected) {
          await onConnected(state.dashboardData || undefined);
        }

        notification.success({
          message: 'Connection Verified',
          description: 'Your Fitbit account is connected and data has been refreshed.'
        });
      } else {
        notification.warning({
          message: 'Not Connected',
          description: 'Fitbit connection not found. Please try connecting again.'
        });
      }
    } catch (error) {
      notification.destroy(loadingKey);
      notification.error({
        message: 'Refresh Failed',
        description: 'Failed to refresh connection status. Please try again.'
      });
    }
  }, [checkConnection, state.isConnected, onConnected]);

  // Fetch dashboard data
  const fetchDashboard = useCallback(async (): Promise<void> => {
    if (!userId || state.isLoading) return;

    updateState({ isLoading: true, error: null });

    try {
      const response = await getFitbitDashboard({ uid: userId });
      console.log('DEBUG: Dashboard data response:', response.data);

      if (response.data.status === 1) {
        const dashboardData = response.data.payload;
        updateState({
          dashboardData,
          dailyData: dashboardData.daily_data || [],
          sleepData: dashboardData.sleep_data || [],
          activities: dashboardData.activities || [],
          isLoading: false
        });
        console.log('DEBUG: Fitbit data updated successfully');
      }
    } catch (error: any) {
      console.error("Error fetching Fitbit data:", error);
      updateState({
        error: error.message,
        isLoading: false
      });
    }
  }, [userId, updateState, state.isLoading]);

  // Connect to Fitbit with OAuth in new tab + polling
  const connect = useCallback((): void => {
    if (!userId || !username) {
      notification.error({
        message: 'Connection Error',
        description: 'User information is required to connect Fitbit.'
      });
      return;
    }

    console.log('DEBUG: Starting Fitbit connection process via new tab');
    updateState({ isConnecting: true, error: null });

    // Create OAuth URL
    const oauthUrl = `${API_URL}/add-fitbit?username=${encodeURIComponent(username)}&userId=${encodeURIComponent(userId)}`;
    console.log('DEBUG: Opening OAuth URL in new tab:', oauthUrl);

    // Open new tab
    const newTab = window.open(oauthUrl, '_blank');

    if (!newTab) {
      notification.error({
        message: 'Tab Blocked',
        description: 'Please allow popups/new tabs for this site to connect with Fitbit.'
      });
      updateState({ isConnecting: false });
      return;
    }

    // Show notification
    notification.info({
      message: 'Fitbit Authentication',
      description: 'Please complete the Fitbit authentication in the new tab. We\'ll automatically detect when you\'re connected.',
      duration: 6
    });

    // Start polling for connection status
    console.log('DEBUG: Starting automatic connection polling');
    updateState({ polling: true, pollCount: 0 });
  }, [userId, username, updateState]);

  // Disconnect from Fitbit
  const disconnect = useCallback(async (): Promise<void> => {
    if (!userId) return;

    try {
      const response = await disconnectFitbit({ uid: userId });
      if (response.data.status === 1) {
        notification.success({
          message: 'Fitbit Disconnected',
          description: 'Your Fitbit account has been disconnected successfully.'
        });

        updateState({
          isConnected: false,
          userInfo: null,
          dashboardData: null,
          dailyData: [],
          sleepData: [],
          activities: [],
          syncLogs: [],
          goals: null,
          healthGoals: getDefaultHealthGoals()
        });

        if (onConnected) {
          await onConnected(state.dashboardData || undefined);
        }
      } else {
        notification.error({
          message: 'Disconnect Failed',
          description: response.data.message || 'Failed to disconnect Fitbit account.'
        });
      }
    } catch (error: any) {
      console.error("Error disconnecting Fitbit:", error);
      notification.error({
        message: 'Disconnect Error',
        description: error.response?.data?.message || 'Failed to disconnect Fitbit account.'
      });
    }
  }, [userId, onConnected, updateState, getDefaultHealthGoals]);

  // Manual sync
  const syncData = useCallback(async (): Promise<void> => {
    if (!userId) return;

    updateState({ isSyncing: true, error: null });

    try {
      const response = await syncFitbitData({ uid: userId });
      if (response.data.status === 1) {
        notification.success({
          message: 'Sync Successful',
          description: 'Your Fitbit data has been updated successfully.'
        });

        await fetchDashboard();

        if (onConnected) {
          await onConnected();
        }
      } else {
        notification.error({
          message: 'Sync Failed',
          description: response.data.message || 'Failed to sync Fitbit data.'
        });
      }
    } catch (error: any) {
      console.error("Error syncing Fitbit data:", error);
      notification.error({
        message: 'Sync Error',
        description: error.response?.data?.message || 'Failed to sync Fitbit data.'
      });
    } finally {
      updateState({ isSyncing: false });
    }
  }, [userId, updateState, fetchDashboard, onConnected]);

  // Load Fitbit goals
  const loadGoals = useCallback(async (): Promise<void> => {
    if (!userId) return;

    updateState({ isLoadingGoals: true, error: null });

    try {
      const response = await getFitbitGoals({ uid: userId });
      
      if (response.data.status === 1) {
        const goals = response.data.payload.goals;
        updateState({
          goals,
          isLoadingGoals: false
        });

        if (state.dashboardData) {
          const healthGoals = processFitbitGoals(goals, state.dashboardData);
          updateState({ healthGoals });
        }

        console.log('DEBUG: Goals loaded successfully');
      } else {
        throw new Error(response.data.message || 'Failed to load goals');
      }

    } catch (error: any) {
      console.error('Error loading Fitbit goals:', error);
      updateState({
        error: error.message,
        isLoadingGoals: false
      });
    }
  }, [userId, updateState, state.dashboardData, processFitbitGoals]);

  // Sync goals from Fitbit
  const syncGoals = useCallback(async (): Promise<void> => {
    if (!userId) return;

    updateState({ isSyncingGoals: true, error: null });

    try {
      const response = await syncFitbitGoals({ uid: userId });
      
      if (response.data.status === 1) {
        const goals = response.data.payload.goals;
        updateState({
          goals,
          isSyncingGoals: false
        });

        if (state.dashboardData) {
          const healthGoals = processFitbitGoals(goals, state.dashboardData);
          updateState({ healthGoals });
        }

        notification.success({
          message: 'Goals Synced',
          description: 'Your Fitbit goals have been updated successfully.'
        });
      } else {
        throw new Error(response.data.message || 'Failed to sync goals');
      }

    } catch (error: any) {
      console.error('Error syncing Fitbit goals:', error);
      notification.error({
        message: 'Goals Sync Error',
        description: error.message
      });
      updateState({
        error: error.message,
        isSyncingGoals: false
      });
    }
  }, [userId, updateState, state.dashboardData, processFitbitGoals]);

  // Generate vitals data based on Fitbit connection and data
  const getVitalsData = useCallback((): FitbitVitalData[] => {
    if (!state.isConnected || !state.dashboardData) {
      return fallbackVitalsData;
    }

    const latestDaily = state.dailyData && state.dailyData.length > 0
      ? state.dailyData[0]
      : null;

    return [
      {
        label: 'Weight',
        value: latestDaily?.weight && latestDaily.weight > 0
          ? `${latestDaily.weight} lbs`
          : '--',
        meta: latestDaily?.date || 'No recent data'
      },
      {
        label: 'Blood Pressure',
        value: '--',
        meta: 'Manual entry required'
      },
      {
        label: 'Heart Rate',
        value: latestDaily?.resting_heart_rate && latestDaily.resting_heart_rate > 0
          ? `${latestDaily.resting_heart_rate} bpm`
          : '--',
        meta: latestDaily?.resting_heart_rate > 0 ? 'Resting' : 'No recent data'
      },
      {
        label: 'BMI',
        value: latestDaily?.bmi && latestDaily.bmi > 0
          ? latestDaily.bmi.toFixed(1)
          : '--',
        meta: latestDaily?.bmi > 0
          ? (latestDaily.bmi < 18.5 ? 'Underweight' :
            latestDaily.bmi < 25 ? 'Normal' :
              latestDaily.bmi < 30 ? 'Overweight' : 'Obese')
          : 'No recent data'
      },
      {
        label: 'Cholesterol',
        value: '--',
        meta: 'Manual entry required'
      },
      {
        label: 'Blood Sugar',
        value: '--',
        meta: 'Manual entry required'
      }
    ];
  }, [state.isConnected, state.dashboardData, state.dailyData, fallbackVitalsData]);

  // Polling effect for automatic connection detection
  useEffect(() => {
    if (state.polling && state.pollCount < 60) { // Poll for max 5 minutes
      pollIntervalRef.current = setInterval(async () => {
        console.log(`DEBUG: Polling attempt ${state.pollCount + 1}/60`);

        try {
          const response = await getFitbitConnectionStatus({ uid: userId });

          if (response.data.status === 1 && response.data.payload.connected) {
            console.log('DEBUG: Fitbit connection detected via polling!');

            // Stop polling
            updateState({ polling: false, pollCount: 0, isConnecting: false });

            // Update connection status
            updateState({ isConnected: true });
            await fetchDashboard();

            // Trigger parent component refresh
            if (onConnected) {
              await onConnected();
            }

            notification.success({
              message: 'Fitbit Connected Successfully',
              description: 'Your health data is now being tracked automatically.'
            });

            return;
          }

          updateState({ pollCount: state.pollCount + 1 });

        } catch (error) {
          console.error('DEBUG: Polling error:', error);
          updateState({ pollCount: state.pollCount + 1 });
        }
      }, 5000);
    }

    // Stop polling if max attempts reached
    if (state.pollCount >= 60) {
      console.log('DEBUG: Polling timeout reached');
      updateState({ polling: false, pollCount: 0, isConnecting: false });

      notification.warning({
        message: 'Connection Check Timeout',
        description: 'Please use the "Refresh Status" button to check if Fitbit was connected successfully.'
      });
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [state.polling, state.pollCount, userId, onConnected, updateState, fetchDashboard]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      updateState({ polling: false, pollCount: 0 });
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [updateState]);

  // Initial connection check
  useEffect(() => {
    if (userId && autoCheck && !state.isConnected && !isCheckingRef.current) {
      const timeout = setTimeout(() => {
        checkConnection();
      }, 1000);
      
      return () => clearTimeout(timeout);
    }
  }, [userId, autoCheck, state.isConnected, checkConnection]);

  // Load goals when connected and dashboard data is available
  useEffect(() => {
    if (state.isConnected && state.dashboardData && !state.goals && !state.isLoadingGoals) {
      console.log('DEBUG: Connected with dashboard data, loading goals...');
      loadGoals();
    }
  }, [state.isConnected, state.dashboardData, state.goals, state.isLoadingGoals, loadGoals]);

  // Update health goals when goals or dashboard data changes
  useEffect(() => {
    if (state.goals && state.dashboardData) {
      const healthGoals = processFitbitGoals(state.goals, state.dashboardData);
      updateState({ healthGoals });
    } else if (!state.isConnected) {
      updateState({ healthGoals: getDefaultHealthGoals() });
    }
  }, [state.goals, state.dashboardData, state.isConnected, processFitbitGoals, updateState, getDefaultHealthGoals]);

  // Actions object
  const actions: FitbitActions = {
    connect,
    disconnect,
    checkConnection,
    refreshConnection,
    syncData,
    fetchDashboard,
    loadGoals,
    syncGoals,
    getVitalsData,
    clearError
  };

  return {
    ...state,
    actions
  };
};