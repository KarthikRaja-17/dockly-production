
// components/health/HealthGoals.tsx - UPDATED with Centralized Tracker State Management

import React, { useEffect } from "react";
import { Spin, Button, notification, Dropdown, Menu } from 'antd';
import {
  SyncOutlined,
  LinkOutlined,
  ReloadOutlined,
  DisconnectOutlined,
  MoreOutlined
} from '@ant-design/icons';
import { colors, shadows, HealthGoal } from "../../../services/health/types";

// NEW: Import centralized tracker hook return types instead of hooks themselves
import { FitbitHookReturn } from "../../../hooks/useFitbit";
import { GarminHookReturn } from "../../../hooks/useGarmin";

// Dashboard Design System Constants
const FONT_FAMILY = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const SPACING = {
  xs: 3,
  sm: 6,
  md: 12,
  lg: 18,
  xl: 24,
  xxl: 36,
};

// UPDATED: Enhanced interface with centralized tracker props - MADE OPTIONAL
interface HealthGoalsProps {
  isMobile: boolean;
  userId: string;
  username: string;
  onGoalClick?: (goal: HealthGoal) => void;
  onFitbitConnected?: () => void;
  onGarminConnected?: () => void;

  // NEW: Centralized tracker state and actions props - MADE OPTIONAL
  fitbitState?: FitbitHookReturn;
  fitbitActions?: FitbitHookReturn['actions'];
  garminState?: GarminHookReturn;
  garminActions?: GarminHookReturn['actions'];
}

// Default health goals for when no tracker is connected or during SSR
const getDefaultHealthGoals = (): HealthGoal[] => [
  {
    title: "Daily Steps",
    targetDate: "Daily Goal",
    current: "Connect Tracker",
    target: "10,000",
    progress: 0,
    subtext: "Connect your health tracker to track steps automatically",
    type: 'steps',
    icon: "👟",
    achieved: false
  },
  {
    title: "Weight Target",
    targetDate: "Set Goal",
    current: "No data",
    target: "Set goal",
    progress: 0,
    subtext: "Set your weight goal in your health tracker",
    type: 'weight',
    icon: "⚖️",
    achieved: false
  },
  {
    title: "Active Minutes",
    targetDate: "Daily Goal",
    current: "Connect Tracker",
    target: "150 min/week",
    progress: 0,
    subtext: "Track active minutes with your health tracker",
    type: 'exercise',
    icon: "💪",
    achieved: false
  },
  {
    title: "Calories Burned",
    targetDate: "Daily Goal",
    current: "Connect Tracker",
    target: "2000 cal",
    progress: 0,
    subtext: "Monitor calorie burn with fitness tracking",
    type: 'calories',
    icon: "🔥",
    achieved: false
  }
];

const HealthGoals: React.FC<HealthGoalsProps> = ({
  isMobile,
  userId,
  username,
  onGoalClick,
  onFitbitConnected,
  onGarminConnected,
  // NEW: Receive centralized tracker props with defaults
  fitbitState,
  fitbitActions,
  garminState,
  garminActions
}) => {
  // SAFETY: Add null checks and provide defaults for SSR/build compatibility
  const safeFitbitState = fitbitState || {
    isConnected: false,
    isLoading: false,
    isConnecting: false,
    isLoadingGoals: false,
    isSyncingGoals: false,
    isCheckingConnection: false,
    error: null,
    healthGoals: getDefaultHealthGoals(),
    goals: null
  };

  const safeGarminState = garminState || {
    isConnected: false,
    isLoading: false,
    isConnecting: false,
    isLoadingGoals: false,
    isSyncingGoals: false,
    isCheckingConnection: false,
    error: null,
    healthGoals: getDefaultHealthGoals(),
    goals: null
  };

  // Safe actions with no-op fallbacks
  const safeFitbitActions = fitbitActions || {
    connect: () => console.warn('Fitbit actions not available'),
    disconnect: () => Promise.resolve(),
    loadGoals: () => Promise.resolve(),
    syncGoals: () => Promise.resolve(),
    refreshConnection: () => Promise.resolve(),
    clearError: () => { }
  };

  const safeGarminActions = garminActions || {
    connect: () => console.warn('Garmin actions not available'),
    disconnect: () => Promise.resolve(),
    loadGoals: () => Promise.resolve(),
    syncGoals: () => Promise.resolve(),
    refreshConnection: () => Promise.resolve(),
    clearError: () => { }
  };

  // UPDATED: Use safe tracker state instead of potentially undefined props
  // MUTUAL EXCLUSIVITY - Determine which tracker to prioritize
  const hasAnyConnection = safeFitbitState.isConnected || safeGarminState.isConnected;
  const activeTracker = safeFitbitState.isConnected ? 'fitbit' : safeGarminState.isConnected ? 'garmin' : null;

  // Get health goals from the active tracker
  const healthGoals = activeTracker === 'fitbit'
    ? safeFitbitState.healthGoals || getDefaultHealthGoals()
    : activeTracker === 'garmin'
      ? safeGarminState.healthGoals || getDefaultHealthGoals()
      : getDefaultHealthGoals();

  // Get loading states from active tracker
  const isLoading = activeTracker === 'fitbit'
    ? safeFitbitState.isLoading
    : activeTracker === 'garmin'
      ? safeGarminState.isLoading
      : false;

  const isLoadingGoals = activeTracker === 'fitbit'
    ? safeFitbitState.isLoadingGoals
    : activeTracker === 'garmin'
      ? safeGarminState.isLoadingGoals
      : false;

  const isSyncingGoals = activeTracker === 'fitbit'
    ? safeFitbitState.isSyncingGoals
    : activeTracker === 'garmin'
      ? safeGarminState.isSyncingGoals
      : false;

  const error = activeTracker === 'fitbit'
    ? safeFitbitState.error
    : activeTracker === 'garmin'
      ? safeGarminState.error
      : null;

  // UPDATED: Handle mutual disconnection when connecting a different tracker
  const handleConnectFitbit = async () => {
    if (safeGarminState.isConnected && garminActions) {
      await safeGarminActions.disconnect();
    }
    safeFitbitActions.connect();
  };

  const handleConnectGarmin = async () => {
    if (safeFitbitState.isConnected && fitbitActions) {
      await safeFitbitActions.disconnect();
    }
    safeGarminActions.connect();
  };

  // UPDATED: Load goals when component mounts and tracker is connected - with null checks
  useEffect(() => {
    if (safeFitbitState.isConnected && !safeFitbitState.goals && !safeFitbitState.isLoadingGoals && fitbitActions) {
      console.log('DEBUG: Fitbit connected but no goals, loading goals...');
      safeFitbitActions.loadGoals();
    }
  }, [safeFitbitState.isConnected, safeFitbitState.goals, safeFitbitState.isLoadingGoals, fitbitActions]);

  useEffect(() => {
    if (safeGarminState.isConnected && !safeGarminState.goals && !safeGarminState.isLoadingGoals && garminActions) {
      console.log('DEBUG: Garmin connected but no goals, loading goals...');
      safeGarminActions.loadGoals();
    }
  }, [safeGarminState.isConnected, safeGarminState.goals, safeGarminState.isLoadingGoals, garminActions]);

  // Handle goal click
  const handleGoalClick = (goal: HealthGoal): void => {
    if (onGoalClick) {
      onGoalClick(goal);
    }
  };

  // UPDATED: Handle sync goals for active tracker
  const handleSyncGoals = async (): Promise<void> => {
    try {
      if (activeTracker === 'fitbit') {
        await safeFitbitActions.syncGoals();
      } else if (activeTracker === 'garmin') {
        await safeGarminActions.syncGoals();
      }
    } catch (error: any) {
      notification.error({
        message: 'Sync Failed',
        description: `Failed to sync goals from ${activeTracker}. Please try again.`
      });
    }
  };

  // UPDATED: Handle refresh goals for active tracker
  const handleRefreshGoals = async (): Promise<void> => {
    try {
      if (activeTracker === 'fitbit') {
        await safeFitbitActions.loadGoals();
      } else if (activeTracker === 'garmin') {
        await safeGarminActions.loadGoals();
      }
    } catch (error: any) {
      notification.error({
        message: 'Refresh Failed',
        description: 'Failed to refresh goals. Please try again.'
      });
    }
  };

  // UPDATED: Clear error from active tracker
  const clearError = () => {
    if (activeTracker === 'fitbit') {
      safeFitbitActions.clearError();
    } else if (activeTracker === 'garmin') {
      safeGarminActions.clearError();
    }
  };

  // Show loading state
  if (isLoading && !healthGoals.length) {
    return (
      <div
        style={{
          background: colors.surface,
          borderRadius: '12px',
          boxShadow: shadows.base,
          overflow: "hidden",
          height: isMobile ? "auto" : "500px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: SPACING.xl,
          fontFamily: FONT_FAMILY
        }}
      >
        <Spin size="large" />
        <div style={{ marginTop: SPACING.md, color: colors.textMuted }}>
          Loading health goals...
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: colors.surface,
        borderRadius: '12px',
        boxShadow: shadows.base,
        overflow: "hidden",
        height: isMobile ? "auto" : "500px",
        display: "flex",
        flexDirection: "column",
        transition: "box-shadow 0.3s",
        fontFamily: FONT_FAMILY
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: SPACING.lg,
          borderBottom: `1px solid ${colors.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "linear-gradient(to bottom, #ffffff, #fafbfc)",
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? SPACING.md : 0
        }}
      >
        <div
          style={{
            fontSize: isMobile ? "1rem" : "1.125rem",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: SPACING.sm,
            fontFamily: FONT_FAMILY
          }}
        >
          <div
            style={{
              width: isMobile ? "28px" : "32px",
              height: isMobile ? "28px" : "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: isMobile ? "18px" : "20px",
            }}
          >
            🎯
          </div>
          <span>Health Goals & Habits</span>
        </div>

        {/* UPDATED: HEALTH TRACKERS INTEGRATION - Use safe state */}
        <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.sm }}>
          {/* Loading indicator for any active operation */}
          {((safeFitbitState.isLoading || safeFitbitState.isConnecting || safeFitbitState.isSyncingGoals || safeFitbitState.isLoadingGoals) ||
            (safeGarminState.isLoading || safeGarminState.isConnecting || safeGarminState.isSyncingGoals || safeGarminState.isLoadingGoals)) && (
              <Spin size="small" />
            )}

          {/* Fitbit Controls */}
          {safeFitbitState.isConnected && (
            <>
              <Button
                type="text"
                size="small"
                icon={<SyncOutlined spin={safeFitbitState.isSyncingGoals} />}
                onClick={handleSyncGoals}
                disabled={safeFitbitState.isSyncingGoals || safeFitbitState.isLoadingGoals}
                title="Sync Fitbit Goals"
              />
              <Button
                type="text"
                size="small"
                icon={<ReloadOutlined spin={safeFitbitState.isLoadingGoals} />}
                onClick={handleRefreshGoals}
                disabled={safeFitbitState.isSyncingGoals || safeFitbitState.isLoadingGoals}
                title="Refresh Goals"
              />
              <Dropdown
                overlay={
                  <Menu>
                    <Menu.Item
                      key="sync"
                      icon={<SyncOutlined />}
                      onClick={handleSyncGoals}
                      disabled={safeFitbitState.isSyncingGoals}
                    >
                      Sync Goals
                    </Menu.Item>
                    <Menu.Item
                      key="disconnect"
                      icon={<DisconnectOutlined />}
                      onClick={safeFitbitActions.disconnect}
                      danger
                    >
                      Disconnect Fitbit
                    </Menu.Item>
                  </Menu>
                }
                trigger={['click']}
                placement="bottomRight"
              >
                <div style={{
                  fontSize: '0.75rem',
                  color: colors.healthPrimary,
                  fontWeight: '500',
                  cursor: 'pointer',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontFamily: FONT_FAMILY
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}>
                  Fitbit Connected
                  <MoreOutlined style={{ fontSize: '12px' }} />
                </div>
              </Dropdown>
            </>
          )}

          {/* Garmin Controls */}
          {safeGarminState.isConnected && (
            <>
              <Button
                type="text"
                size="small"
                icon={<SyncOutlined spin={safeGarminState.isSyncingGoals} />}
                onClick={handleSyncGoals}
                disabled={safeGarminState.isSyncingGoals || safeGarminState.isLoadingGoals}
                title="Sync Garmin Goals"
              />
              <Button
                type="text"
                size="small"
                icon={<ReloadOutlined spin={safeGarminState.isLoadingGoals} />}
                onClick={handleRefreshGoals}
                disabled={safeGarminState.isSyncingGoals || safeGarminState.isLoadingGoals}
                title="Refresh Goals"
              />
              <Dropdown
                overlay={
                  <Menu>
                    <Menu.Item
                      key="sync"
                      icon={<SyncOutlined />}
                      onClick={handleSyncGoals}
                      disabled={safeGarminState.isSyncingGoals}
                    >
                      Sync Goals
                    </Menu.Item>
                    <Menu.Item
                      key="disconnect"
                      icon={<DisconnectOutlined />}
                      onClick={safeGarminActions.disconnect}
                      danger
                    >
                      Disconnect Garmin
                    </Menu.Item>
                  </Menu>
                }
                trigger={['click']}
                placement="bottomRight"
              >
                <div style={{
                  fontSize: '0.75rem',
                  color: '#0288d1',
                  fontWeight: '500',
                  cursor: 'pointer',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontFamily: FONT_FAMILY
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(2, 136, 209, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}>
                  Garmin Connected
                  <MoreOutlined style={{ fontSize: '12px' }} />
                </div>
              </Dropdown>
            </>
          )}

          {/* Connection Options - Only show when no tracker is connected */}
          {!hasAnyConnection && (
            <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.sm }}>
              <Button
                type="primary"
                size="small"
                icon={<LinkOutlined />}
                onClick={handleConnectFitbit}
                loading={safeFitbitState.isConnecting}
                disabled={safeFitbitState.isConnecting || safeGarminState.isConnecting}
                style={{
                  backgroundColor: colors.healthPrimary,
                  borderColor: colors.healthPrimary
                }}
              >
                {safeFitbitState.isConnecting ? 'Connecting...' : 'Connect Fitbit'}
              </Button>

              <Button
                type="default"
                size="small"
                icon={<LinkOutlined />}
                onClick={handleConnectGarmin}
                loading={safeGarminState.isConnecting}
                disabled={safeGarminState.isConnecting || safeFitbitState.isConnecting}
                style={{
                  borderColor: '#0288d1',
                  color: '#0288d1'
                }}
              >
                {safeGarminState.isConnecting ? 'Connecting...' : 'Connect Garmin'}
              </Button>

              <Button
                type="text"
                size="small"
                icon={<ReloadOutlined />}
                onClick={() => {
                  safeFitbitActions.refreshConnection();
                  safeGarminActions.refreshConnection();
                }}
                disabled={safeFitbitState.isCheckingConnection || safeGarminState.isCheckingConnection}
                title="Refresh Connection Status"
              />
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div
          style={{
            padding: SPACING.md,
            backgroundColor: "#fef2f2",
            color: "#dc2626",
            fontSize: "0.875rem",
            fontFamily: FONT_FAMILY,
            borderBottom: `1px solid ${colors.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span>{error}</span>
          <Button
            type="text"
            size="small"
            onClick={clearError}
            style={{ color: '#dc2626' }}
          >
            ✕
          </Button>
        </div>
      )}

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: SPACING.lg,
        }}
      >
        {/* Connection Status */}
        {!hasAnyConnection && (
          <div
            style={{
              background: "#fef3c7",
              border: "1px solid #f59e0b",
              borderRadius: '8px',
              padding: SPACING.md,
              marginBottom: SPACING.md,
              fontFamily: FONT_FAMILY,
              fontSize: "0.875rem",
              color: "#92400e",
              display: 'flex',
              justifyContent: "center",
              alignItems: 'center',
              flexDirection: 'column',
            }}
          >
            <div style={{ fontWeight: '600', marginBottom: SPACING.xs, textAlign: "center" }}>
              📱 Connect Your Health Tracker for Real Goals
            </div>
            <div style={{ marginBottom: SPACING.sm, textAlign: "center" }}>
              Connect your health tracker to see your actual daily steps, weight targets, and exercise goals automatically.
            </div>
            <div style={{
              display: 'flex',
              gap: SPACING.md,
              flexWrap: 'wrap',
              justifyContent: "center",
              alignItems: 'center',
              flexDirection: 'column',
            }}>
              <div style={{ textAlign: 'center' }}>
                <Button
                  type="primary"
                  icon={<LinkOutlined />}
                  onClick={handleConnectFitbit}
                  loading={safeFitbitState.isConnecting}
                  disabled={safeFitbitState.isConnecting || safeGarminState.isConnecting}
                  style={{
                    backgroundColor: colors.healthPrimary,
                    borderColor: colors.healthPrimary,
                    marginBottom: SPACING.xs
                  }}
                >
                  {safeFitbitState.isConnecting ? 'Opening...' : 'Connect Fitbit'}
                </Button>
                <div style={{ fontSize: '0.75rem', color: '#92400e' }}>
                  Steps, Weight, Exercise Goals
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <Button
                  type="default"
                  icon={<LinkOutlined />}
                  onClick={handleConnectGarmin}
                  loading={safeGarminState.isConnecting}
                  disabled={safeGarminState.isConnecting || safeFitbitState.isConnecting}
                  style={{
                    borderColor: '#0288d1',
                    color: '#0288d1',
                    marginBottom: SPACING.xs
                  }}
                >
                  {safeGarminState.isConnecting ? 'Opening...' : 'Connect Garmin'}
                </Button>
                <div style={{ fontSize: '0.75rem', color: '#92400e' }}>
                  Steps, Weight, Body Battery Goals
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tracker-Specific Goals Summary */}
        {hasAnyConnection && (
          <div
            style={{
              background: activeTracker === 'fitbit'
                ? 'linear-gradient(to right, #e0f2fe, #b3e5fc)'
                : 'linear-gradient(to right, #e3f2fd, #bbdefb)',
              border: `1px solid ${activeTracker === 'fitbit' ? '#0288d1' : '#1976d2'}`,
              borderRadius: '8px',
              padding: SPACING.md,
              marginBottom: SPACING.md,
              fontFamily: FONT_FAMILY
            }}
          >
            <div style={{
              fontWeight: '600',
              marginBottom: SPACING.sm,
              color: activeTracker === 'fitbit' ? '#01579b' : '#0d47a1'
            }}>
              {activeTracker === 'fitbit' ? 'Fitbit Goals' : 'Garmin Goals'} ({healthGoals.length} active)
            </div>
            <div style={{ fontSize: '0.875rem', color: activeTracker === 'fitbit' ? '#01579b' : '#0d47a1' }}>
              {healthGoals.filter(g => g.achieved).length} of {healthGoals.length} goals achieved
              {activeTracker === 'garmin' && ' • Includes Body Battery and Stress tracking'}
            </div>
          </div>
        )}

        {/* Goals Display */}
        {healthGoals.map((goal: any, index: any) => (
          <div
            key={`${goal.type}-${index}`}
            style={{
              background: colors.background,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              padding: SPACING.md,
              marginBottom: SPACING.md,
              cursor: "pointer",
              transition: "all 0.2s",
              fontFamily: FONT_FAMILY
            }}
            onClick={() => handleGoalClick(goal)}
            onMouseEnter={(e) => {
              const primaryColor = activeTracker === 'fitbit' ? colors.healthPrimary : '#0288d1';
              e.currentTarget.style.borderColor = primaryColor;
              e.currentTarget.style.boxShadow = "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = colors.border;
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: SPACING.md
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: SPACING.sm,
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  fontFamily: FONT_FAMILY
                }}
              >
                <span style={{ fontSize: "1rem" }}>{goal.icon}</span>
                {goal.title}
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: colors.textMuted,
                  backgroundColor: goal.achieved ? '#dcfce7' : '#dbeafe',
                  padding: `${SPACING.xs}px ${SPACING.sm}px`,
                  borderRadius: '8px',
                  fontFamily: FONT_FAMILY
                }}
              >
                {goal.targetDate}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: SPACING.sm,
                fontSize: "0.875rem",
                fontFamily: FONT_FAMILY
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  color: colors.text
                }}
              >
                {goal.current}
              </div>
              <div
                style={{
                  color: colors.textMuted
                }}
              >
                Goal: {goal.target}
              </div>
            </div>

            <div
              style={{
                height: "8px",
                backgroundColor: colors.border,
                borderRadius: "4px",
                overflow: "hidden",
                marginBottom: SPACING.sm,
              }}
            >
              <div
                style={{
                  height: "100%",
                  borderRadius: "4px",
                  backgroundColor: goal.achieved
                    ? '#10b981'
                    : (activeTracker === 'fitbit' ? colors.healthPrimary : '#0288d1'),
                  width: `${Math.max(0, Math.min(100, goal.progress))}%`,
                  transition: "width 0.3s ease",
                  position: "relative",
                  minWidth: goal.progress > 0 ? '2px' : '0px'
                }}
              />
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                color: colors.textMuted,
                fontFamily: FONT_FAMILY
              }}
            >
              {goal.subtext}
            </div>
          </div>
        ))}

        {/* Loading Goals State */}
        {hasAnyConnection && (isLoadingGoals || isSyncingGoals) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: SPACING.lg,
              color: colors.textMuted,
              fontFamily: FONT_FAMILY
            }}
          >
            <Spin size="small" style={{ marginRight: SPACING.sm }} />
            {isSyncingGoals
              ? `Syncing goals from ${activeTracker}...`
              : 'Loading goals...'}
          </div>
        )}

        {/* Empty State */}
        {hasAnyConnection && healthGoals.length === 0 && !isLoadingGoals && !isSyncingGoals && (
          <div
            style={{
              textAlign: 'center',
              padding: SPACING.xl,
              color: colors.textMuted,
              fontFamily: FONT_FAMILY
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: SPACING.md }}>🎯</div>
            <div style={{ fontWeight: '600', marginBottom: SPACING.sm }}>
              No Goals Found
            </div>
            <div style={{ fontSize: '0.875rem', marginBottom: SPACING.md }}>
              Set up goals in your {activeTracker === 'fitbit' ? 'Fitbit' : 'Garmin'} app to see them here.
            </div>
            <Button
              type="primary"
              icon={<SyncOutlined />}
              onClick={handleSyncGoals}
              style={{
                backgroundColor: activeTracker === 'fitbit' ? colors.healthPrimary : '#0288d1',
                borderColor: activeTracker === 'fitbit' ? colors.healthPrimary : '#0288d1'
              }}
            >
              Sync Goals
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthGoals;