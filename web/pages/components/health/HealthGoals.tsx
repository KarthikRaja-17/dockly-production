// components/health/HealthGoals.tsx - Fixed TypeScript Issues

import React, { useEffect } from "react";
import { Spin, Button, notification } from 'antd';
import { SyncOutlined, LinkOutlined, ReloadOutlined } from '@ant-design/icons';
import { colors, shadows, HealthGoal, FitbitDashboardData, FitbitUserGoals } from "../../../services/health/types";
import { useFitbit } from "../../../hooks/useFitbit";

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

interface HealthGoalsProps {
  isMobile: boolean;
  userId: string;
  username: string;
  onGoalClick?: (goal: HealthGoal) => void;
  onFitbitConnected?: () => void;
}

const HealthGoals: React.FC<HealthGoalsProps> = ({
  isMobile,
  userId,
  username,
  onGoalClick,
  onFitbitConnected
}) => {
  // Use the updated Fitbit hook with proper typing
  const {
    isConnected,
    healthGoals,
    goals,
    dashboardData,
    isLoading,
    isConnecting,
    isSyncing,
    isSyncingGoals,
    isLoadingGoals,
    error,
    actions: {
      connect,
      disconnect,
      syncData,
      syncGoals,
      loadGoals,
      refreshConnection,
      clearError
    }
  } = useFitbit({
    userId,
    username,
    autoCheck: true,
    onConnected: (dashboardData?: FitbitDashboardData) => {
      console.log('DEBUG: Fitbit connected, dashboard data received:', dashboardData);
      if (onFitbitConnected) {
        onFitbitConnected();
      }
    }
  });

  // Load goals when component mounts and Fitbit is connected
  useEffect(() => {
    if (isConnected && !goals && !isLoadingGoals) {
      console.log('DEBUG: Fitbit connected but no goals, loading goals...');
      loadGoals();
    }
  }, [isConnected, goals, isLoadingGoals, loadGoals]);

  // Handle goal click
  const handleGoalClick = (goal: HealthGoal): void => {
    if (onGoalClick) {
      onGoalClick(goal);
    }
  };

  // Handle sync goals
  const handleSyncGoals = async (): Promise<void> => {
    try {
      await syncGoals();
    } catch (error: any) {
      notification.error({
        message: 'Sync Failed',
        description: 'Failed to sync goals from Fitbit. Please try again.'
      });
    }
  };

  // Handle refresh goals
  const handleRefreshGoals = async (): Promise<void> => {
    try {
      await loadGoals();
    } catch (error: any) {
      notification.error({
        message: 'Refresh Failed',
        description: 'Failed to refresh goals. Please try again.'
      });
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

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.sm }}>
          {(isLoading || isConnecting || isSyncing || isSyncingGoals || isLoadingGoals) && (
            <Spin size="small" />
          )}

          {isConnected ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.xs }}>
              <Button
                type="text"
                size="small"
                icon={<ReloadOutlined spin={isLoadingGoals} />}
                onClick={handleRefreshGoals}
                disabled={isSyncingGoals || isLoadingGoals}
                title="Refresh Goals"
              />
              <div style={{
                fontSize: '0.75rem',
                color: colors.healthPrimary,
                fontWeight: '500',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fontFamily: FONT_FAMILY
              }}>
                Fitbit Connected
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.sm }}>
              <Button
                type="primary"
                size="small"
                icon={<LinkOutlined />}
                onClick={connect}
                loading={isConnecting}
                disabled={isConnecting}
                style={{
                  backgroundColor: colors.healthPrimary,
                  borderColor: colors.healthPrimary
                }}
              >
                {isConnecting ? 'Connecting...' : 'Connect Fitbit'}
              </Button>
              <Button
                type="text"
                size="small"
                icon={<ReloadOutlined />}
                onClick={refreshConnection}
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
        {!isConnected && (
          <div
            style={{
              background: "#fef3c7",
              border: "1px solid #f59e0b",
              borderRadius: '8px',
              padding: SPACING.md,
              marginBottom: SPACING.md,
              fontFamily: FONT_FAMILY,
              fontSize: "0.875rem",
              color: "#92400e"
            }}
          >
            <div style={{ fontWeight: '600', marginBottom: SPACING.xs }}>
              📱 Connect Fitbit for Real Goals
            </div>
            <div>
              Connect your Fitbit account to see your actual daily steps, weight targets, and exercise goals automatically.
            </div>
          </div>
        )}

        {/* Goals Display */}
        {healthGoals.map((goal, index) => (
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
              e.currentTarget.style.borderColor = colors.healthPrimary;
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
                  backgroundColor: goal.achieved ? '#10b981' : colors.healthPrimary,
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
        {isConnected && (isLoadingGoals || isSyncingGoals) && (
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
            {isSyncingGoals ? 'Syncing goals from Fitbit...' : 'Loading goals...'}
          </div>
        )}

        {/* Debug Info (remove in production) */}
        {/* {process.env.NODE_ENV === 'development' && isConnected && (
          <div style={{
            marginTop: SPACING.md,
            padding: SPACING.sm,
            background: '#f5f5f5',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontFamily: 'monospace',
            color: '#666'
          }}>
            <strong>Debug Info:</strong><br />
            Connected: {isConnected ? 'Yes' : 'No'}<br />
            Goals loaded: {goals ? 'Yes' : 'No'}<br />
            Health goals count: {healthGoals.length}<br />
            Dashboard data: {dashboardData ? 'Yes' : 'No'}
          </div>
        )} */}
      </div>
    </div>
  );
};

export default HealthGoals;