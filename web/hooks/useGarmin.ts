// hooks/useGarmin.ts - Comprehensive Garmin Integration with UI Logic
import { useState, useEffect, useCallback, useRef } from 'react';
import { notification } from 'antd';
import { API_URL } from '../services/apiConfig';
import {
  getGarminConnectionStatus,
  disconnectGarmin,
  syncGarminData,
  getGarminDashboard,
  getGarminDailyData,
  getGarminSleepData,
  getGarminActivities,
  getGarminSyncLogs,
  getGarminGoals,
  syncGarminGoals,
  getGarminBodyData,
  syncGarminBodyData,
  initializeGarminOAuth
} from '../services/apiConfig';

// Import types from the centralized types file
import { HealthGoal } from '../services/health/types';

// Garmin-specific types
export interface GarminDashboardData {
  daily_data: any[];
  sleep_data: any[];
  activities: any[];
  user_goals: GarminUserGoals | null;
  goal_progress: any;
  garmin_connected: boolean;
  user_info: GarminUserInfo;
  latest_sync: any;
  stats: any;
}

export interface GarminUserGoals {
  daily_steps_goal?: number;
  daily_calories_goal?: number;
  daily_distance_goal?: number;
  daily_active_minutes_goal?: number;
  weekly_distance_goal?: number;
  weekly_active_minutes_goal?: number;
  weight_goal?: number;
  weight_goal_date?: string;
  starting_weight?: number;
  body_fat_goal?: number;
}

export interface GarminVitalData {
  label: string;
  value: string;
  meta: string;
}

export interface GarminUserInfo {
  id?: string;
  garmin_user_id?: string;
  display_name?: string;
  email?: string;
  profile_image?: string;
  connected_at?: string;
}

export interface GarminState {
  // Connection state
  isConnected: boolean;
  userInfo: GarminUserInfo | null;
  
  // Data state
  dashboardData: GarminDashboardData | null;
  dailyData: any[];
  sleepData: any[];
  activities: any[];
  syncLogs: any[];
  bodyData: any[];
  
  // Loading states
  isLoading: boolean;
  isConnecting: boolean;
  isSyncing: boolean;
  isCheckingConnection: boolean;
  
  // Error state
  error: string | null;

  // Goals-related state
  goals: GarminUserGoals | null;
  healthGoals: HealthGoal[];
  isLoadingGoals: boolean;
  isSyncingGoals: boolean;

  // Body data state
  isLoadingBodyData: boolean;
  isSyncingBodyData: boolean;

  // UI-specific states
  polling: boolean;
  pollCount: number;
  connectionChecking: boolean;
}

export interface GarminActions {
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
  
  // Body data actions
  loadBodyData: () => Promise<void>;
  syncBodyData: () => Promise<void>;
  
  // Utility actions
  getVitalsData: () => GarminVitalData[];
  clearError: () => void;
}

export interface GarminHookReturn extends GarminState {
  actions: GarminActions;
}

interface UseGarminProps {
  userId: string;
  username: string;
  onConnected?: (dashboardData?: GarminDashboardData) => void;
  autoCheck?: boolean;
}

export const useGarmin = ({
  userId,
  username,
  onConnected,
  autoCheck = true
}: UseGarminProps): GarminHookReturn => {
  // Complete state management with UI-specific states
  const [state, setState] = useState<GarminState>({
    // Connection state
    isConnected: false,
    userInfo: null,
    
    // Data state
    dashboardData: null,
    dailyData: [],
    sleepData: [],
    activities: [],
    syncLogs: [],
    bodyData: [],
    
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

    // Body data state
    isLoadingBodyData: false,
    isSyncingBodyData: false,

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
  const fallbackVitalsData: GarminVitalData[] = [
    { label: 'Weight', value: '--', meta: 'Connect Garmin for data' },
    { label: 'Blood Pressure', value: '--', meta: 'Manual entry required' },
    { label: 'Heart Rate', value: '--', meta: 'Connect Garmin for data' },
    { label: 'BMI', value: '--', meta: 'Connect Garmin for data' },
    { label: 'Stress Level', value: '--', meta: 'Connect Garmin for data' },
    { label: 'Body Battery', value: '--', meta: 'Connect Garmin for data' }
  ];

  // Update state helper
  const updateState = useCallback((updates: Partial<GarminState>) => {
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
      current: "Connect Garmin",
      target: "10,000",
      progress: 0,
      subtext: "Connect Garmin to track your steps automatically",
      type: 'steps',
      icon: "👟",
      achieved: false
    },
    {
      title: "Weight Target",
      targetDate: "Set in Garmin",
      current: "No data",
      target: "Set goal",
      progress: 0,
      subtext: "Set your weight goal in Garmin Connect",
      type: 'weight',
      icon: "⚖️",
      achieved: false
    },
    {
      title: "Active Minutes",
      targetDate: "Daily Goal",
      current: "Connect Garmin",
      target: "150 min/week",
      progress: 0,
      subtext: "Track active minutes with Garmin",
      type: 'exercise',
      icon: "💪",
      achieved: false
    },
    {
      title: "Body Battery",
      targetDate: "Daily Goal",
      current: "Connect Garmin",
      target: "80+",
      progress: 0,
      subtext: "Monitor energy levels with Garmin",
      type: 'custom',
      icon: "🔋",
      achieved: false
    }
  ], []);

  // Process Garmin goals into health goals format
  const processGarminGoals = useCallback((goalsData: GarminUserGoals, dashboardData: GarminDashboardData): HealthGoal[] => {
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

    // Weight Goal - Enhanced logic for Garmin
    if (goalsData.weight_goal && goalsData.weight_goal > 0) {
      const current = latestData?.weight || 0;
      const target = goalsData.weight_goal;
      const starting = goalsData.starting_weight;
      
      let progress = 0;
      let progressText = "";
      
      if (current > 0) {
        if (starting && starting !== current && starting !== target) {
          const totalChange = Math.abs(starting - target);
          
          if (starting < target) {
            // Weight gain goal
            const currentChange = Math.max(0, current - starting);
            progress = totalChange > 0 ? Math.min(100, (currentChange / totalChange) * 100) : 0;
            const remaining = Math.max(0, target - current);
            progressText = remaining > 0 
              ? `Gained ${currentChange.toFixed(1)} lbs of ${totalChange.toFixed(1)} lbs goal`
              : `Goal achieved! Gained ${currentChange.toFixed(1)} lbs 🎉`;
          } else if (starting > target) {
            // Weight loss goal
            const currentChange = Math.max(0, starting - current);
            progress = totalChange > 0 ? Math.min(100, (currentChange / totalChange) * 100) : 0;
            const remaining = Math.max(0, current - target);
            progressText = remaining > 0 
              ? `Lost ${currentChange.toFixed(1)} lbs of ${totalChange.toFixed(1)} lbs goal`
              : `Goal achieved! Lost ${currentChange.toFixed(1)} lbs 🎉`;
          }
        } else {
          // Fallback calculation
          if (current <= target) {
            progress = (current / target) * 100;
            const remaining = target - current;
            progressText = remaining > 0 
              ? `${current.toFixed(1)} lbs of ${target.toFixed(1)} lbs target (${remaining.toFixed(1)} lbs to go)`
              : `Target achieved! 🎉`;
          } else {
            progress = 100;
            const excess = current - target;
            progressText = `Target achieved! Currently ${excess.toFixed(1)} lbs above target`;
          }
        }
      } else {
        progressText = "Connect Garmin to track weight progress";
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
        title: "Active Minutes",
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

    // Body Battery Goal (Garmin-specific)
    if (latestData?.body_battery !== undefined) {
      const current = latestData.body_battery;
      const target = 80; // Garmin considers 80+ as good body battery
      const progress = target > 0 ? Math.min(100, (current / target) * 100) : 0;

      processedGoals.push({
        title: "Body Battery",
        targetDate: "Daily Target",
        current: `${current}`,
        target: `${target}+`,
        progress: Math.round(progress),
        subtext: current >= target ? `Excellent energy levels! 🎉` : `Focus on recovery to boost energy`,
        type: 'custom',
        icon: "🔋",
        achieved: current >= target
      });
    }

    return processedGoals;
  }, []);

  // Check Garmin connection status
  const checkConnection = useCallback(async (): Promise<void> => {
    if (!userId) return;

    console.log('DEBUG: Checking Garmin connection status');
    updateState({ isCheckingConnection: true, connectionChecking: true, error: null });

    try {
      const response = await getGarminConnectionStatus({ uid: userId });
      console.log('DEBUG: Garmin connection status response:', response.data);

      if (response.data.status === 1) {
        const isConnected = response.data.payload.connected;
        updateState({
          isConnected,
          userInfo: response.data.payload.user_info || null,
          isCheckingConnection: false,
          connectionChecking: false
        });

        if (isConnected) {
          console.log('DEBUG: Garmin is connected, fetching data');
          await fetchDashboard();
        } else {
          console.log('DEBUG: Garmin is not connected');
          updateState({
            dashboardData: null,
            dailyData: [],
            sleepData: [],
            activities: [],
            syncLogs: [],
            bodyData: [],
            goals: null,
            healthGoals: getDefaultHealthGoals()
          });
        }
      }
    } catch (error: any) {
      console.error("Error checking Garmin connection:", error);
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
    console.log('DEBUG: Manually refreshing Garmin connection status');

    const loadingKey = 'garmin-refresh-loading';
    notification.open({
      key: loadingKey,
      message: 'Checking Connection',
      description: 'Verifying your Garmin connection status...',
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
          description: 'Your Garmin account is connected and data has been refreshed.'
        });
      } else {
        notification.warning({
          message: 'Not Connected',
          description: 'Garmin connection not found. Please try connecting again.'
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
      const response = await getGarminDashboard({ uid: userId });
      console.log('DEBUG: Garmin dashboard data response:', response.data);

      if (response.data.status === 1) {
        const dashboardData = response.data.payload;
        updateState({
          dashboardData,
          dailyData: dashboardData.daily_data || [],
          sleepData: dashboardData.sleep_data || [],
          activities: dashboardData.activities || [],
          isLoading: false
        });
        console.log('DEBUG: Garmin data updated successfully');
      }
    } catch (error: any) {
      console.error("Error fetching Garmin data:", error);
      updateState({
        error: error.message,
        isLoading: false
      });
    }
  }, [userId, updateState, state.isLoading]);

  // Connect to Garmin with OAuth 1.0a in new tab + polling
  const connect = useCallback((): void => {
    if (!userId || !username) {
      notification.error({
        message: 'Connection Error',
        description: 'User information is required to connect Garmin.'
      });
      return;
    }

    console.log('DEBUG: Starting Garmin connection process via OAuth 1.0a');
    updateState({ isConnecting: true, error: null });

    // Use the OAuth helper function
    initializeGarminOAuth(userId, username)
      .then((result: any) => {
        console.log('DEBUG: Garmin OAuth successful:', result);
        
        notification.success({
          message: 'Garmin Connected Successfully',
          description: 'Your health data is now being tracked automatically.'
        });

        // Update connection status
        updateState({ 
          isConnected: true, 
          isConnecting: false,
          polling: false,
          pollCount: 0
        });

        // Fetch data and trigger parent callback
        fetchDashboard().then(() => {
          if (onConnected) {
            onConnected();
          }
        });
      })
      .catch((error: any) => {
        console.error('DEBUG: Garmin OAuth failed:', error);
        updateState({ isConnecting: false });
        
        notification.error({
          message: 'Connection Failed',
          description: error.message || 'Failed to connect to Garmin. Please try again.'
        });
      });

    // Show notification
    notification.info({
      message: 'Garmin Authentication',
      description: 'Please complete the Garmin authentication in the new window. We\'ll automatically detect when you\'re connected.',
      duration: 6
    });

    // Start polling for connection status
    console.log('DEBUG: Starting automatic connection polling for Garmin');
    updateState({ polling: true, pollCount: 0 });
  }, [userId, username, updateState, fetchDashboard, onConnected]);

  // Disconnect from Garmin
  const disconnect = useCallback(async (): Promise<void> => {
    if (!userId) return;

    try {
      const response = await disconnectGarmin({ uid: userId });
      if (response.data.status === 1) {
        notification.success({
          message: 'Garmin Disconnected',
          description: 'Your Garmin account has been disconnected successfully.'
        });

        updateState({
          isConnected: false,
          userInfo: null,
          dashboardData: null,
          dailyData: [],
          sleepData: [],
          activities: [],
          syncLogs: [],
          bodyData: [],
          goals: null,
          healthGoals: getDefaultHealthGoals()
        });

        if (onConnected) {
          await onConnected(state.dashboardData || undefined);
        }
      } else {
        notification.error({
          message: 'Disconnect Failed',
          description: response.data.message || 'Failed to disconnect Garmin account.'
        });
      }
    } catch (error: any) {
      console.error("Error disconnecting Garmin:", error);
      notification.error({
        message: 'Disconnect Error',
        description: error.response?.data?.message || 'Failed to disconnect Garmin account.'
      });
    }
  }, [userId, onConnected, updateState, getDefaultHealthGoals]);

  // Manual sync
  const syncData = useCallback(async (): Promise<void> => {
    if (!userId) return;

    updateState({ isSyncing: true, error: null });

    try {
      const response = await syncGarminData({ uid: userId });
      if (response.data.status === 1) {
        notification.success({
          message: 'Sync Successful',
          description: 'Your Garmin data has been updated successfully.'
        });

        await fetchDashboard();

        if (onConnected) {
          await onConnected();
        }
      } else {
        notification.error({
          message: 'Sync Failed',
          description: response.data.message || 'Failed to sync Garmin data.'
        });
      }
    } catch (error: any) {
      console.error("Error syncing Garmin data:", error);
      notification.error({
        message: 'Sync Error',
        description: error.response?.data?.message || 'Failed to sync Garmin data.'
      });
    } finally {
      updateState({ isSyncing: false });
    }
  }, [userId, updateState, fetchDashboard, onConnected]);

  // Load Garmin goals
  const loadGoals = useCallback(async (): Promise<void> => {
    if (!userId) return;

    updateState({ isLoadingGoals: true, error: null });

    try {
      const response = await getGarminGoals({ uid: userId });
      
      if (response.data.status === 1) {
        const goals = response.data.payload.goals;
        updateState({
          goals,
          isLoadingGoals: false
        });

        if (state.dashboardData) {
          const healthGoals = processGarminGoals(goals, state.dashboardData);
          updateState({ healthGoals });
        }

        console.log('DEBUG: Garmin goals loaded successfully');
      } else {
        throw new Error(response.data.message || 'Failed to load goals');
      }

    } catch (error: any) {
      console.error('Error loading Garmin goals:', error);
      updateState({
        error: error.message,
        isLoadingGoals: false
      });
    }
  }, [userId, updateState, state.dashboardData, processGarminGoals]);

  // Sync goals from Garmin
  const syncGoals = useCallback(async (): Promise<void> => {
    if (!userId) return;

    updateState({ isSyncingGoals: true, error: null });

    try {
      const response = await syncGarminGoals({ uid: userId });
      
      if (response.data.status === 1) {
        const goals = response.data.payload.goals;
        updateState({
          goals,
          isSyncingGoals: false
        });

        if (state.dashboardData) {
          const healthGoals = processGarminGoals(goals, state.dashboardData);
          updateState({ healthGoals });
        }

        notification.success({
          message: 'Goals Synced',
          description: 'Your Garmin goals have been updated successfully.'
        });
      } else {
        throw new Error(response.data.message || 'Failed to sync goals');
      }

    } catch (error: any) {
      console.error('Error syncing Garmin goals:', error);
      notification.error({
        message: 'Goals Sync Error',
        description: error.message
      });
      updateState({
        error: error.message,
        isSyncingGoals: false
      });
    }
  }, [userId, updateState, state.dashboardData, processGarminGoals]);

  // Load body composition data
  const loadBodyData = useCallback(async (): Promise<void> => {
    if (!userId) return;

    updateState({ isLoadingBodyData: true, error: null });

    try {
      const response = await getGarminBodyData({ uid: userId });
      
      if (response.data.status === 1) {
        updateState({
          bodyData: response.data.payload.body_data || [],
          isLoadingBodyData: false
        });
        console.log('DEBUG: Garmin body data loaded successfully');
      } else {
        throw new Error(response.data.message || 'Failed to load body data');
      }

    } catch (error: any) {
      console.error('Error loading Garmin body data:', error);
      updateState({
        error: error.message,
        isLoadingBodyData: false
      });
    }
  }, [userId, updateState]);

  // Sync body composition data
  const syncBodyData = useCallback(async (): Promise<void> => {
    if (!userId) return;

    updateState({ isSyncingBodyData: true, error: null });

    try {
      const response = await syncGarminBodyData({ uid: userId });
      
      if (response.data.status === 1) {
        await loadBodyData();
        
        notification.success({
          message: 'Body Data Synced',
          description: 'Your Garmin body composition data has been updated.'
        });
      } else {
        throw new Error(response.data.message || 'Failed to sync body data');
      }

    } catch (error: any) {
      console.error('Error syncing Garmin body data:', error);
      notification.error({
        message: 'Body Data Sync Error',
        description: error.message
      });
      updateState({
        error: error.message,
        isSyncingBodyData: false
      });
    } finally {
      updateState({ isSyncingBodyData: false });
    }
  }, [userId, updateState, loadBodyData]);

  // Generate vitals data based on Garmin connection and data
  const getVitalsData = useCallback((): GarminVitalData[] => {
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
        label: 'Stress Level',
        value: latestDaily?.stress_score && latestDaily.stress_score > 0
          ? `${latestDaily.stress_score}/100`
          : '--',
        meta: latestDaily?.stress_score > 0
          ? (latestDaily.stress_score < 25 ? 'Low stress' :
            latestDaily.stress_score < 50 ? 'Moderate stress' :
              latestDaily.stress_score < 75 ? 'High stress' : 'Very high stress')
          : 'No recent data'
      },
      {
        label: 'Body Battery',
        value: latestDaily?.body_battery && latestDaily.body_battery > 0
          ? `${latestDaily.body_battery}/100`
          : '--',
        meta: latestDaily?.body_battery > 0
          ? (latestDaily.body_battery >= 80 ? 'Excellent energy' :
            latestDaily.body_battery >= 60 ? 'Good energy' :
              latestDaily.body_battery >= 40 ? 'Fair energy' : 'Low energy')
          : 'No recent data'
      }
    ];
  }, [state.isConnected, state.dashboardData, state.dailyData, fallbackVitalsData]);

  // Polling effect for automatic connection detection
  useEffect(() => {
    if (state.polling && state.pollCount < 60) { // Poll for max 5 minutes
      pollIntervalRef.current = setInterval(async () => {
        console.log(`DEBUG: Garmin polling attempt ${state.pollCount + 1}/60`);

        try {
          const response = await getGarminConnectionStatus({ uid: userId });

          if (response.data.status === 1 && response.data.payload.connected) {
            console.log('DEBUG: Garmin connection detected via polling!');

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
              message: 'Garmin Connected Successfully',
              description: 'Your health data is now being tracked automatically.'
            });

            return;
          }

          updateState({ pollCount: state.pollCount + 1 });

        } catch (error) {
          console.error('DEBUG: Garmin polling error:', error);
          updateState({ pollCount: state.pollCount + 1 });
        }
      }, 5000);
    }

    // Stop polling if max attempts reached
    if (state.pollCount >= 60) {
      console.log('DEBUG: Garmin polling timeout reached');
      updateState({ polling: false, pollCount: 0, isConnecting: false });

      notification.warning({
        message: 'Connection Check Timeout',
        description: 'Please use the "Refresh Status" button to check if Garmin was connected successfully.'
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
      console.log('DEBUG: Connected with dashboard data, loading Garmin goals...');
      loadGoals();
    }
  }, [state.isConnected, state.dashboardData, state.goals, state.isLoadingGoals, loadGoals]);

  // Update health goals when goals or dashboard data changes
  useEffect(() => {
    if (state.goals && state.dashboardData) {
      const healthGoals = processGarminGoals(state.goals, state.dashboardData);
      updateState({ healthGoals });
    } else if (!state.isConnected) {
      updateState({ healthGoals: getDefaultHealthGoals() });
    }
  }, [state.goals, state.dashboardData, state.isConnected, processGarminGoals, updateState, getDefaultHealthGoals]);

  // Actions object
  const actions: GarminActions = {
    connect,
    disconnect,
    checkConnection,
    refreshConnection,
    syncData,
    fetchDashboard,
    loadGoals,
    syncGoals,
    loadBodyData,
    syncBodyData,
    getVitalsData,
    clearError
  };

  return {
    ...state,
    actions
  };
};