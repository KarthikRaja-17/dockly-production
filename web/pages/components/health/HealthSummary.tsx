// Enhanced HealthSummary.tsx - UPDATED to use centralized tracker props instead of internal hooks
import React from 'react';
import { Spin, Button, Typography, Dropdown, Menu, Badge, Tooltip } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  SyncOutlined,
  LinkOutlined,
  DisconnectOutlined,
  ReloadOutlined,
  EyeOutlined,
  TeamOutlined,
  LockOutlined,
  UnlockOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';

// Import enhanced types and services
import { colors, shadows, FamilyMemberForHealth } from '../../../services/health/types';
import {
  HealthSummaryInfoData,
  UserAllergyData,
  UserConditionData,
  FamilyMedicalHistoryData,
  FamilyMedicalHistoryStats,
  getAllergySeverityColor,
  getAllergySeverityTextColor,
  getConditionStatusColor,
  canEditFamilyMedicalHistory,
  canDeleteFamilyMedicalHistory,
  getFamilyMedicalHistoryPermissionText,
  getFamilyMemberNameById,
  getFamilyMemberRelationshipById,
} from '../../../services/health/healthSummary';

// NEW: Import centralized tracker hook return types
import { FitbitHookReturn } from '../../../hooks/useFitbit';
import { GarminHookReturn } from '../../../hooks/useGarmin';

const { Text } = Typography;

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

// Default vitals data for when no tracker is connected or during SSR
const getDefaultVitalsData = () => [
  { label: 'Weight', value: '--', meta: 'Connect tracker for data' },
  { label: 'Blood Pressure', value: '--', meta: 'Manual entry required' },
  { label: 'Heart Rate', value: '--', meta: 'Connect tracker for data' },
  { label: 'BMI', value: '--', meta: 'Connect tracker for data' },
  { label: 'Sleep Score', value: '--', meta: 'Connect tracker for data' },
  { label: 'Activity Level', value: '--', meta: 'Connect tracker for data' }
];

// UPDATED: Enhanced component props with centralized tracker props - MADE OPTIONAL
interface HealthSummaryProps {
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

  // Family history props with permissions and family member support
  familyHistory: FamilyMedicalHistoryData[];
  familyMembers: FamilyMemberForHealth[];
  familyHistoryStats?: FamilyMedicalHistoryStats;
  familyHistoryLoading: boolean;
  onAddFamilyHistory: (familyMembers: FamilyMemberForHealth[]) => void;
  onViewFamilyHistory: (history: FamilyMedicalHistoryData) => void;
  onEditFamilyHistory: (history: FamilyMedicalHistoryData, familyMembers: FamilyMemberForHealth[]) => void;
  onDeleteFamilyHistory: (id: number) => Promise<void>;

  // Health tracker callback props (kept for compatibility)
  onFitbitConnected?: () => void;
  onGarminConnected?: () => void;

  // NEW: Centralized tracker state and actions props - MADE OPTIONAL
  fitbitState?: FitbitHookReturn;
  fitbitActions?: FitbitHookReturn['actions'];
  garminState?: GarminHookReturn;
  garminActions?: GarminHookReturn['actions'];
}

const HealthSummary: React.FC<HealthSummaryProps> = ({
  isMobile,
  userId,
  username,
  healthInfo,
  healthInfoLoading,
  onEditHealthInfo,
  allergies = [],
  allergiesLoading,
  onAddAllergy,
  onEditAllergy,
  onViewAllergy,
  onDeleteAllergy,
  conditions = [],
  conditionsLoading,
  onAddCondition,
  onViewCondition,
  onEditCondition,
  onDeleteCondition,
  familyHistory = [],
  familyMembers = [],
  familyHistoryStats,
  familyHistoryLoading,
  onAddFamilyHistory,
  onViewFamilyHistory,
  onEditFamilyHistory,
  onDeleteFamilyHistory,
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
    isCheckingConnection: false,
    isSyncing: false,
    polling: false,
    error: null
  };

  const safeGarminState = garminState || {
    isConnected: false,
    isLoading: false,
    isConnecting: false,
    isCheckingConnection: false,
    isSyncing: false,
    polling: false,
    error: null
  };

  // Safe actions with no-op fallbacks
  const safeFitbitActions = fitbitActions || {
    connect: () => console.warn('Fitbit actions not available'),
    disconnect: () => Promise.resolve(),
    syncData: () => Promise.resolve(),
    refreshConnection: () => Promise.resolve(),
    getVitalsData: () => getDefaultVitalsData()
  };

  const safeGarminActions = garminActions || {
    connect: () => console.warn('Garmin actions not available'),
    disconnect: () => Promise.resolve(),
    syncData: () => Promise.resolve(),
    refreshConnection: () => Promise.resolve(),
    getVitalsData: () => getDefaultVitalsData()
  };

  // UPDATED: Use safe tracker state instead of potentially undefined props
  // MUTUAL EXCLUSIVITY - Determine which tracker to prioritize
  const hasAnyConnection = safeFitbitState.isConnected || safeGarminState.isConnected;
  const activeTracker = safeFitbitState.isConnected ? 'fitbit' : safeGarminState.isConnected ? 'garmin' : null;

  // Get vitals data from the active tracker
  const vitalsData = activeTracker === 'fitbit'
    ? safeFitbitActions.getVitalsData()
    : activeTracker === 'garmin'
      ? safeGarminActions.getVitalsData()
      : getDefaultVitalsData(); // fallback

  // ENHANCED: Calculate family medical history stats if not provided
  const calculatedStats = familyHistoryStats || {
    totalRecords: familyHistory.length,
    editableRecords: familyHistory.filter(h => h.canEdit === true).length,
    readOnlyRecords: familyHistory.filter(h => h.canEdit === false).length,
    membersWithHistory: new Set(familyHistory.map(h => h.familyMemberUserId).filter(Boolean)).size,
    familyMembersCount: familyMembers.length,
  };

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

  const handleAllergyClick = (allergy: UserAllergyData): void => {
    onEditAllergy(allergy);
  };

  const handleConditionClick = (condition: UserConditionData): void => {
    onEditCondition(condition);
  };

  // Family history click handler with permission checking
  const handleFamilyHistoryClick = (history: FamilyMedicalHistoryData): void => {
    if (canEditFamilyMedicalHistory(history)) {
      onEditFamilyHistory(history, familyMembers);
    } else {
      // For read-only records, just show view
      onViewFamilyHistory(history);
    }
  };

  // Add family history with family member validation
  const handleAddFamilyHistory = (): void => {
    if (familyMembers.length === 0) {
      return; // Button should be disabled, but double-check
    }
    onAddFamilyHistory(familyMembers);
  };

  return (
    <div style={{
      background: colors.surface,
      borderRadius: '12px',
      boxShadow: shadows.base,
      overflow: 'hidden',
      height: isMobile ? 'auto' : '500px',
      display: 'flex',
      flexDirection: 'column',
      transition: 'box-shadow 0.3s',
      fontFamily: FONT_FAMILY
    }}>
      {/* Header */}
      <div style={{
        padding: SPACING.lg,
        borderBottom: `1px solid ${colors.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(to bottom, #ffffff, #fafbfc)',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? SPACING.md : 0
      }}>
        <div style={{
          fontSize: isMobile ? '1rem' : '1.125rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: SPACING.sm,
          fontFamily: FONT_FAMILY
        }}>
          <div style={{
            width: isMobile ? '28px' : '32px',
            height: isMobile ? '28px' : '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: isMobile ? '18px' : '20px'
          }}>
            📊
          </div>
          <span>Health Summary</span>
          {/* Family history stats badge */}
          {calculatedStats.totalRecords > 0 && (
            <Tooltip title={`${calculatedStats.totalRecords} family medical records (${calculatedStats.editableRecords} editable, ${calculatedStats.readOnlyRecords} read-only)`}>
              <Badge
                count={calculatedStats.totalRecords}
                style={{ backgroundColor: colors.healthPrimary }}
              />
            </Tooltip>
          )}
          {/* Family members indicator */}
          {familyMembers.length > 0 && (
            <Tooltip title={`${familyMembers.length} family members connected`}>
              <TeamOutlined style={{ fontSize: '0.875rem', color: colors.healthPrimary }} />
            </Tooltip>
          )}
        </div>

        {/* UPDATED: HEALTH TRACKERS INTEGRATION - Use safe state */}
        <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.sm }}>
          {/* Loading indicator */}
          {((safeFitbitState.isCheckingConnection || safeFitbitState.isConnecting || safeFitbitState.polling) ||
            (safeGarminState.isCheckingConnection || safeGarminState.isConnecting || safeGarminState.polling)) && (
              <Spin size="small" />
            )}

          {/* Fitbit Controls */}
          {safeFitbitState.isConnected && (
            <>
              <Button
                type="text"
                size="small"
                icon={<SyncOutlined spin={safeFitbitState.isSyncing} />}
                onClick={safeFitbitActions.syncData}
                disabled={safeFitbitState.isSyncing}
                title="Sync Fitbit Data"
              />
              <Dropdown
                overlay={
                  <Menu>
                    <Menu.Item
                      key="sync"
                      icon={<SyncOutlined />}
                      onClick={safeFitbitActions.syncData}
                      disabled={safeFitbitState.isSyncing}
                    >
                      Sync Data
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
                icon={<SyncOutlined spin={safeGarminState.isSyncing} />}
                onClick={safeGarminActions.syncData}
                disabled={safeGarminState.isSyncing}
                title="Sync Garmin Data"
              />
              <Dropdown
                overlay={
                  <Menu>
                    <Menu.Item
                      key="sync"
                      icon={<SyncOutlined />}
                      onClick={safeGarminActions.syncData}
                      disabled={safeGarminState.isSyncing}
                    >
                      Sync Data
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

          {/* Connection Options */}
          {!hasAnyConnection && (
            <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.sm }}>
              <Button
                type="primary"
                size="small"
                icon={<LinkOutlined />}
                onClick={handleConnectFitbit}
                loading={safeFitbitState.isConnecting || safeFitbitState.polling}
                disabled={safeFitbitState.isConnecting || safeFitbitState.polling || safeFitbitState.isCheckingConnection ||
                  safeGarminState.isConnecting || safeGarminState.polling || safeGarminState.isCheckingConnection}
                style={{
                  backgroundColor: colors.healthPrimary,
                  borderColor: colors.healthPrimary
                }}
              >
                {safeFitbitState.polling ? 'Checking...' : safeFitbitState.isConnecting ? 'Opening...' : 'Connect Fitbit'}
              </Button>

              <Button
                type="default"
                size="small"
                icon={<LinkOutlined />}
                onClick={handleConnectGarmin}
                loading={safeGarminState.isConnecting || safeGarminState.polling}
                disabled={safeGarminState.isConnecting || safeGarminState.polling || safeGarminState.isCheckingConnection ||
                  safeFitbitState.isConnecting || safeFitbitState.polling || safeFitbitState.isCheckingConnection}
                style={{
                  borderColor: '#0288d1',
                  color: '#0288d1'
                }}
              >
                {safeGarminState.polling ? 'Checking...' : safeGarminState.isConnecting ? 'Opening...' : 'Connect Garmin'}
              </Button>

              {!safeFitbitState.polling && !safeGarminState.polling && (
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
              )}
            </div>
          )}
        </div>
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: SPACING.lg
      }}>
        {/* UPDATED: Connection Notice - use safe state */}
        {!hasAnyConnection && !safeFitbitState.isCheckingConnection && !safeFitbitState.isConnecting &&
          !safeGarminState.isCheckingConnection && !safeGarminState.isConnecting && (
            <div style={{
              background: 'linear-gradient(to right, #fef3c7, #fde68a)',
              border: '1px solid #f59e0b',
              borderRadius: '8px',
              padding: SPACING.md,
              marginBottom: SPACING.xl,
              textAlign: 'center',
              display: 'flex',
              justifyContent: "center",
              alignItems: 'center',
              flexDirection: 'column',
            }}>
              <div style={{ fontWeight: '600', marginBottom: SPACING.sm, color: '#92400e', fontFamily: FONT_FAMILY, textAlign: "center" }}>
                Connect Your Health Tracker for Real-Time Data
              </div>
              <div style={{ fontSize: '0.875rem', color: '#92400e', marginBottom: SPACING.md, fontFamily: FONT_FAMILY, textAlign: "center" }}>
                Choose your preferred tracker to automatically sync steps, heart rate, sleep, weight, and more health metrics.
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: SPACING.md, flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}>
                  <Button
                    type="primary"
                    icon={<LinkOutlined />}
                    onClick={handleConnectFitbit}
                    loading={safeFitbitState.isConnecting}
                    disabled={safeFitbitState.isConnecting || safeFitbitState.isCheckingConnection}
                    style={{
                      backgroundColor: colors.healthPrimary,
                      borderColor: colors.healthPrimary,
                      marginBottom: SPACING.xs
                    }}
                  >
                    {safeFitbitState.isConnecting ? 'Opening...' : 'Connect Fitbit'}
                  </Button>
                  <div style={{ fontSize: '0.75rem', color: '#92400e', fontFamily: FONT_FAMILY }}>
                    Steps, Heart Rate, Sleep, Weight
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <Button
                    type="default"
                    icon={<LinkOutlined />}
                    onClick={handleConnectGarmin}
                    loading={safeGarminState.isConnecting}
                    disabled={safeGarminState.isConnecting || safeGarminState.isCheckingConnection}
                    style={{
                      borderColor: '#0288d1',
                      color: '#0288d1',
                      marginBottom: SPACING.xs
                    }}
                  >
                    {safeGarminState.isConnecting ? 'Opening...' : 'Connect Garmin'}
                  </Button>
                  <div style={{ fontSize: '0.75rem', color: '#92400e', fontFamily: FONT_FAMILY }}>
                    Steps, Heart Rate, Sleep, Stress, Body Battery
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* Current Vitals */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
          gap: SPACING.md,
          marginBottom: SPACING.xl
        }}>
          {vitalsData.map((vital, index) => (
            <div key={index} style={{
              background: colors.background,
              borderRadius: '8px',
              padding: SPACING.md,
              border: `1px solid ${colors.border}`,
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              opacity: vital.value === '--' ? 0.6 : 1
            }}
              onMouseEnter={(e) => {
                if (vital.value !== '--') {
                  e.currentTarget.style.borderColor = activeTracker === 'fitbit' ? colors.healthPrimary : '#0288d1';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.border;
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
              <div style={{
                fontSize: '0.75rem',
                color: colors.textMuted,
                marginBottom: '0.25rem',
                textTransform: 'uppercase',
                fontFamily: FONT_FAMILY
              }}>
                {vital.label}
              </div>
              <div style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: vital.value === '--' ? colors.textMuted : (activeTracker === 'fitbit' ? colors.healthPrimary : '#0288d1'),
                marginBottom: '0.25rem',
                fontFamily: FONT_FAMILY
              }}>
                {vital.value}
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: colors.textMuted,
                fontFamily: FONT_FAMILY
              }}>
                {vital.meta}
              </div>
            </div>
          ))}
        </div>

        {/* FITBIT INTEGRATION - Data Summary */}
        {fitbit.isConnected && fitbit.dashboardData && fitbit.dashboardData.stats && (
          <div style={{
            background: 'linear-gradient(to right, #e0f2fe, #b3e5fc)',
            border: '1px solid #0288d1',
            borderRadius: '8px',
            padding: SPACING.md,
            marginBottom: SPACING.xl
          }}>
            <div style={{ fontWeight: '600', marginBottom: SPACING.sm, color: '#01579b', fontFamily: FONT_FAMILY }}>
              30-Day Fitbit Summary
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: SPACING.md,
              fontSize: '0.875rem',
              fontFamily: FONT_FAMILY
            }}>
              <div>
                <strong>Avg Daily Steps:</strong> {fitbit.dashboardData.stats.avg_daily_steps?.toLocaleString() || 'N/A'}
              </div>
              <div>
                <strong>Avg Daily Calories:</strong> {fitbit.dashboardData.stats.avg_daily_calories?.toLocaleString() || 'N/A'}
              </div>
              <div>
                <strong>Total Steps:</strong> {fitbit.dashboardData.stats.total_steps_30_days?.toLocaleString() || 'N/A'}
              </div>
              <div>
                <strong>Days Tracked:</strong> {fitbit.dashboardData.stats.total_days || 0}
              </div>
            </div>
            {fitbit.dashboardData.latest_sync && (
              <div style={{
                fontSize: '0.75rem',
                color: '#01579b',
                marginTop: SPACING.sm,
                fontFamily: FONT_FAMILY
              }}>
                Last sync: {new Date(fitbit.dashboardData.latest_sync.sync_date).toLocaleString()}
              </div>
            )}
          </div>
        )}

        {/* Essential Medical Information */}
        <div style={{ marginBottom: SPACING.xl }}>
          <div style={{
            fontWeight: '600',
            marginBottom: SPACING.md,
            color: colors.text,
            fontSize: '0.9375rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontFamily: FONT_FAMILY
          }}>
            <span>Essential Medical Information</span>
            {healthInfoLoading && <Spin size="small" />}
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={onEditHealthInfo}
            />
          </div>

          {healthInfo && Object.keys(healthInfo).length > 1 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: SPACING.md,
              marginBottom: SPACING.md
            }}>
              {healthInfo.bloodType && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: SPACING.sm,
                  background: colors.background,
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: `1px solid ${colors.border}`,
                  fontFamily: FONT_FAMILY
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.healthPrimary;
                    e.currentTarget.style.boxShadow = '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                  <span style={{ color: colors.textMuted }}>Blood Type</span>
                  <span style={{ fontWeight: '500' }}>{healthInfo.bloodType}</span>
                </div>
              )}
              {healthInfo.dateOfBirth && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: SPACING.sm,
                  background: colors.background,
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: `1px solid ${colors.border}`,
                  fontFamily: FONT_FAMILY
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.healthPrimary;
                    e.currentTarget.style.boxShadow = '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                  <span style={{ color: colors.textMuted }}>Date of Birth</span>
                  <span style={{ fontWeight: '500' }}>{new Date(healthInfo.dateOfBirth).toLocaleDateString()}</span>
                </div>
              )}
              {healthInfo.height && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: SPACING.sm,
                  background: colors.background,
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: `1px solid ${colors.border}`,
                  fontFamily: FONT_FAMILY
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.healthPrimary;
                    e.currentTarget.style.boxShadow = '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                  <span style={{ color: colors.textMuted }}>Height</span>
                  <span style={{ fontWeight: '500' }}>{healthInfo.height}</span>
                </div>
              )}
              {healthInfo.emergencyContactName && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: SPACING.sm,
                  background: colors.background,
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: `1px solid ${colors.border}`,
                  fontFamily: FONT_FAMILY
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.healthPrimary;
                    e.currentTarget.style.boxShadow = '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                  <span style={{ color: colors.textMuted }}>Emergency Contact</span>
                  <span style={{ fontWeight: '500' }}>{healthInfo.emergencyContactName}</span>
                </div>
              )}
              {healthInfo.primaryDoctor && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: SPACING.sm,
                  background: colors.background,
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: `1px solid ${colors.border}`,
                  fontFamily: FONT_FAMILY
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.healthPrimary;
                    e.currentTarget.style.boxShadow = '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                  <span style={{ color: colors.textMuted }}>Primary Doctor</span>
                  <span style={{ fontWeight: '500' }}>{healthInfo.primaryDoctor}</span>
                </div>
              )}
              {healthInfo.medicalRecordNumber && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: SPACING.sm,
                  background: colors.background,
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: `1px solid ${colors.border}`,
                  fontFamily: FONT_FAMILY
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.healthPrimary;
                    e.currentTarget.style.boxShadow = '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                  <span style={{ color: colors.textMuted }}>Medical Record #</span>
                  <span style={{ fontWeight: '500' }}>{healthInfo.medicalRecordNumber}</span>
                </div>
              )}
            </div>
          ) : (
            <div style={{
              padding: SPACING.md,
              background: colors.background,
              borderRadius: '8px',
              textAlign: 'center',
              color: colors.textMuted,
              fontSize: '0.875rem',
              fontFamily: FONT_FAMILY
            }}>
              No medical information added yet.
            </div>
          )}
        </div>

        {/* Allergies */}
        <div style={{ marginBottom: SPACING.xl }}>
          <div style={{
            fontWeight: '600',
            marginBottom: SPACING.md,
            color: colors.text,
            fontSize: '0.9375rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontFamily: FONT_FAMILY
          }}>
            <span>Allergies</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.sm }}>
              {allergiesLoading && <Spin size="small" />}
              <Button
                type="text"
                size="small"
                icon={<PlusOutlined />}
                onClick={onAddAllergy}
              />
            </div>
          </div>

          <div>
            {allergies.length > 0 ? (
              allergies.map((allergy) => (
                <div
                  key={allergy.id}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    backgroundColor: getAllergySeverityColor(allergy.severityLevel),
                    color: getAllergySeverityTextColor(allergy.severityLevel),
                    marginRight: SPACING.sm,
                    marginBottom: SPACING.sm,
                    padding: '0.375rem 0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    transform: 'scale(1)',
                    fontFamily: FONT_FAMILY
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <span style={{ marginRight: SPACING.sm }}>
                    {allergy.severityLevel === 'severe' || allergy.severityLevel === 'critical' ? '⚠️ ' : ''}
                    {allergy.allergyName}
                    {allergy.severityLevel !== 'mild' && ` (${allergy.severityLevel})`}
                  </span>
                  <Dropdown
                    overlay={
                      <Menu>
                        <Menu.Item
                          key="view"
                          icon={<EyeOutlined />}
                          onClick={() => onViewAllergy(allergy)}
                        >
                          View
                        </Menu.Item>
                        <Menu.Item
                          key="edit"
                          icon={<EditOutlined />}
                          onClick={() => handleAllergyClick(allergy)}
                        >
                          Edit
                        </Menu.Item>
                        <Menu.Item
                          key="delete"
                          icon={<DeleteOutlined />}
                          onClick={() => onDeleteAllergy(allergy.id!)}
                          danger
                        >
                          Delete
                        </Menu.Item>
                      </Menu>
                    }
                    trigger={['click']}
                    placement="bottomRight"
                  >
                    <Button
                      type="text"
                      size="small"
                      icon={<MoreOutlined />}
                      style={{
                        color: getAllergySeverityTextColor(allergy.severityLevel),
                        border: 'none',
                        background: 'transparent',
                        padding: '2px',
                        minWidth: 'auto',
                        height: 'auto'
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Dropdown>
                </div>
              ))
            ) : (
              <Text style={{ color: colors.textMuted, fontSize: '0.875rem', fontFamily: FONT_FAMILY }}>
                No allergies recorded.
              </Text>
            )}
          </div>
        </div>

        {/* Current Conditions */}
        <div style={{ marginBottom: SPACING.xl }}>
          <div style={{
            fontWeight: '600',
            marginBottom: SPACING.md,
            color: colors.text,
            fontSize: '0.9375rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontFamily: FONT_FAMILY
          }}>
            <span>Current Conditions</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.sm }}>
              {conditionsLoading && <Spin size="small" />}
              <Button
                type="text"
                size="small"
                icon={<PlusOutlined />}
                onClick={onAddCondition}
              />
            </div>
          </div>

          <div>
            {conditions.length > 0 ? (
              conditions.map((condition) => (
                <div
                  key={condition.id}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    backgroundColor: getConditionStatusColor(condition.status),
                    color: '#92400e',
                    marginRight: SPACING.sm,
                    marginBottom: SPACING.sm,
                    padding: '0.375rem 0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    transform: 'scale(1)',
                    fontFamily: FONT_FAMILY
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <span style={{ marginRight: SPACING.sm }}>
                    {condition.conditionName}
                    {condition.status !== 'active' && ` (${condition.status})`}
                  </span>
                  <Dropdown
                    overlay={
                      <Menu>
                        <Menu.Item
                          key="view"
                          icon={<EyeOutlined />}
                          onClick={() => onViewCondition(condition)}
                        >
                          View
                        </Menu.Item>
                        <Menu.Item
                          key="edit"
                          icon={<EditOutlined />}
                          onClick={() => handleConditionClick(condition)}
                        >
                          Edit
                        </Menu.Item>
                        <Menu.Item
                          key="delete"
                          icon={<DeleteOutlined />}
                          onClick={() => onDeleteCondition(condition.id!)}
                          danger
                        >
                          Delete
                        </Menu.Item>
                      </Menu>
                    }
                    trigger={['click']}
                    placement="bottomRight"
                  >
                    <Button
                      type="text"
                      size="small"
                      icon={<MoreOutlined />}
                      style={{
                        color: '#92400e',
                        border: 'none',
                        background: 'transparent',
                        padding: '2px',
                        minWidth: 'auto',
                        height: 'auto'
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Dropdown>
                </div>
              ))
            ) : (
              <Text style={{ color: colors.textMuted, fontSize: '0.875rem', fontFamily: FONT_FAMILY }}>
                No current conditions recorded.
              </Text>
            )}
          </div>
        </div>

        {/* Family Medical History with Permission System */}
        <div style={{ marginBottom: SPACING.md }}>
          <div style={{
            fontWeight: '600',
            marginBottom: SPACING.md,
            color: colors.text,
            fontSize: '0.9375rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontFamily: FONT_FAMILY
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.sm }}>
              <span>Family Medical History</span>
              <TeamOutlined style={{ fontSize: '0.875rem', color: colors.healthPrimary }} />
              {familyMembers.length > 0 && (
                <Tooltip title={`${familyMembers.length} family members available`}>
                  <Badge
                    count={familyMembers.length}
                    style={{ backgroundColor: colors.textMuted }}
                  />
                </Tooltip>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.sm }}>
              {familyHistoryLoading && <Spin size="small" />}
              <Tooltip title={
                familyMembers.length === 0
                  ? "Add family members first"
                  : "Add family medical history"
              }>
                <Button
                  type="text"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={handleAddFamilyHistory}
                  disabled={familyMembers.length === 0}
                />
              </Tooltip>
            </div>
          </div>

          {/* Family Members Status */}
          {familyMembers.length === 0 && (
            <div style={{
              padding: SPACING.md,
              background: 'linear-gradient(to right, #fef3c7, #fde68a)',
              border: '1px solid #f59e0b',
              borderRadius: '8px',
              marginBottom: SPACING.md,
              textAlign: 'center'
            }}>
              <div style={{ fontWeight: '600', marginBottom: SPACING.xs, color: '#92400e', fontFamily: FONT_FAMILY }}>
                No Family Members Added
              </div>
              <div style={{ fontSize: '0.875rem', color: '#92400e', fontFamily: FONT_FAMILY }}>
                Add family members first to track their medical history
              </div>
            </div>
          )}

          {/* Family Medical History Records with Permission System */}
          <div style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>
            {familyHistory.length > 0 ? (
              familyHistory.map((history) => (
                <div
                  key={history.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: SPACING.sm,
                    padding: SPACING.sm,
                    borderRadius: '8px',
                    backgroundColor: colors.background,
                    border: `1px solid ${colors.border}`,
                    cursor: canEditFamilyMedicalHistory(history) ? 'pointer' : 'default',
                    transition: 'all 0.2s',
                    fontFamily: FONT_FAMILY,
                    position: 'relative',
                    opacity: history.canEdit === false ? 0.85 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (canEditFamilyMedicalHistory(history)) {
                      e.currentTarget.style.borderColor = colors.healthPrimary;
                      e.currentTarget.style.boxShadow = '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  onClick={() => handleFamilyHistoryClick(history)}
                >
                  <div style={{ flex: 1 }}>
                    {/* Permission indicator */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: SPACING.xs,
                      marginBottom: SPACING.xs
                    }}>
                      <Tooltip title={
                        history.canEdit
                          ? "You can edit and delete this record"
                          : "This record is read-only (added by another family member)"
                      }>
                        {history.canEdit ? (
                          <UnlockOutlined
                            style={{
                              fontSize: '0.75rem',
                              color: colors.healthPrimary
                            }}
                          />
                        ) : (
                          <LockOutlined
                            style={{
                              fontSize: '0.75rem',
                              color: colors.textMuted
                            }}
                          />
                        )}
                      </Tooltip>
                      <Text style={{
                        fontSize: '0.75rem',
                        color: colors.textMuted,
                        fontFamily: FONT_FAMILY
                      }}>
                        {getFamilyMedicalHistoryPermissionText(history)}
                      </Text>
                      {history.canEdit === false && (
                        <Tooltip title="Read-only record">
                          <InfoCircleOutlined style={{ fontSize: '0.75rem', color: colors.textMuted }} />
                        </Tooltip>
                      )}
                    </div>

                    {/* Medical History Content with proper family member names */}
                    <div style={{ fontWeight: '500' }}>
                      <strong>
                        {history.familyMemberName ||
                          getFamilyMemberNameById(history.familyMemberUserId || '', familyMembers) ||
                          'Unknown Member'}
                      </strong>
                      {(history.familyMemberRelation ||
                        getFamilyMemberRelationshipById(history.familyMemberUserId || '', familyMembers)) && (
                          <span style={{ color: colors.textMuted, fontWeight: 'normal' }}>
                            {' '}({history.familyMemberRelation ||
                              getFamilyMemberRelationshipById(history.familyMemberUserId || '', familyMembers)})
                          </span>
                        )}
                      : {history.conditionName}
                    </div>

                    {/* Additional Details */}
                    <div style={{
                      fontSize: '0.8125rem',
                      color: colors.textMuted,
                      marginTop: SPACING.xs
                    }}>
                      {history.ageOfOnset && `Age of onset: ${history.ageOfOnset}`}
                      {history.ageOfOnset && history.status && ' • '}
                      {history.status && `Status: ${history.status}`}
                    </div>

                    {/* Notes Preview */}
                    {history.notes && (
                      <div style={{
                        fontSize: '0.8125rem',
                        color: colors.textMuted,
                        marginTop: SPACING.xs,
                        fontStyle: 'italic'
                      }}>
                        Notes: {history.notes.length > 50 ? `${history.notes.substring(0, 50)}...` : history.notes}
                      </div>
                    )}
                  </div>

                  {/* Action Dropdown with Permission Checking */}
                  <Dropdown
                    overlay={
                      <Menu>
                        <Menu.Item
                          key="view"
                          icon={<EyeOutlined />}
                          onClick={(e) => {
                            e.domEvent.stopPropagation();
                            onViewFamilyHistory(history);
                          }}
                        >
                          View Details
                        </Menu.Item>
                        {canEditFamilyMedicalHistory(history) && (
                          <Menu.Item
                            key="edit"
                            icon={<EditOutlined />}
                            onClick={(e) => {
                              e.domEvent.stopPropagation();
                              handleFamilyHistoryClick(history);
                            }}
                          >
                            Edit
                          </Menu.Item>
                        )}
                        {canDeleteFamilyMedicalHistory(history) && (
                          <Menu.Item
                            key="delete"
                            icon={<DeleteOutlined />}
                            onClick={(e) => {
                              e.domEvent.stopPropagation();
                              onDeleteFamilyHistory(history.id!);
                            }}
                            danger
                          >
                            Delete
                          </Menu.Item>
                        )}
                        {!canEditFamilyMedicalHistory(history) && !canDeleteFamilyMedicalHistory(history) && (
                          <Menu.Item
                            key="readonly"
                            icon={<InfoCircleOutlined />}
                            disabled
                          >
                            Read-only record
                          </Menu.Item>
                        )}
                      </Menu>
                    }
                    trigger={['click']}
                    placement="bottomRight"
                  >
                    <Button
                      type="text"
                      size="small"
                      icon={<MoreOutlined />}
                      style={{
                        color: colors.textMuted,
                        border: 'none',
                        background: 'transparent',
                        padding: '2px',
                        minWidth: 'auto',
                        height: 'auto',
                        marginLeft: SPACING.sm
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Dropdown>
                </div>
              ))
            ) : (
              <Text style={{ color: colors.textMuted, fontFamily: FONT_FAMILY }}>
                {familyMembers.length > 0
                  ? "No family medical history recorded yet."
                  : "Add family members first to track their medical history."
                }
              </Text>
            )}
          </div>

          {/* ENHANCED: Family Medical History Stats */}
          {/* {calculatedStats.totalRecords > 0 && (
            <div style={{
              marginTop: SPACING.md,
              padding: SPACING.sm,
              background: colors.healthLight,
              borderRadius: '6px',
              fontSize: '0.75rem',
              color: colors.textMuted,
              fontFamily: FONT_FAMILY
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: SPACING.sm }}>
                <Tooltip title="Total medical records">
                  <span>📊 Total: {calculatedStats.totalRecords}</span>
                </Tooltip>
                <Tooltip title="Family members with medical history">
                  <span>👥 Members: {calculatedStats.membersWithHistory}</span>
                </Tooltip>
                <Tooltip title="Records you can edit">
                  <span>✏️ Editable: {calculatedStats.editableRecords}</span>
                </Tooltip>
                {calculatedStats.readOnlyRecords > 0 && (
                  <Tooltip title="Read-only records added by others">
                    <span>🔒 Read-only: {calculatedStats.readOnlyRecords}</span>
                  </Tooltip>
                )}
              </div>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default HealthSummary;