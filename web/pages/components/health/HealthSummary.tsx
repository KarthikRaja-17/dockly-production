// pages/components/health/HealthSummary.tsx - Simplified with useFitbit Hook
import React from 'react';
import { Spin, Button, Tag, Typography, Dropdown, Menu } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  SyncOutlined,
  LinkOutlined,
  DisconnectOutlined,
  ReloadOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { colors, shadows } from '../../../services/health/types';
import {
  HealthSummaryInfoData,
  UserAllergyData,
  UserConditionData,
  FamilyMedicalHistoryData,
  getAllergySeverityColor,
  getAllergySeverityTextColor,
  getConditionStatusColor
} from '../../../services/health/healthSummary';
// FITBIT INTEGRATION - Use the centralized hook
import { useFitbit } from '../../../hooks/useFitbit';

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
  onDeleteAllergy: (id: number) => void;

  // Conditions props
  conditions: UserConditionData[];
  conditionsLoading: boolean;
  onAddCondition: () => void;
  onViewCondition: (condition: UserConditionData) => void;
  onEditCondition: (condition: UserConditionData) => void;
  onDeleteCondition: (id: number) => void;

  // Family history props
  familyHistory: FamilyMedicalHistoryData[];
  familyHistoryLoading: boolean;
  onAddFamilyHistory: () => void;
  onViewFamilyHistory: (history: FamilyMedicalHistoryData) => void;
  onEditFamilyHistory: (history: FamilyMedicalHistoryData) => void;
  onDeleteFamilyHistory: (id: number) => void;

  // Fitbit callback prop
  onFitbitConnected?: () => void;
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
  familyHistoryLoading,
  onAddFamilyHistory,
  onViewFamilyHistory,
  onEditFamilyHistory,
  onDeleteFamilyHistory,
  onFitbitConnected
}) => {
  // FITBIT INTEGRATION - Use centralized hook with all logic
  const fitbit = useFitbit({
    userId,
    username,
    onConnected: onFitbitConnected,
    autoCheck: true
  });

  const vitalsData = fitbit.actions.getVitalsData();

  const handleAllergyClick = (allergy: UserAllergyData): void => {
    onEditAllergy(allergy);
  };

  const handleConditionClick = (condition: UserConditionData): void => {
    onEditCondition(condition);
  };

  const handleFamilyHistoryClick = (history: FamilyMedicalHistoryData): void => {
    onEditFamilyHistory(history);
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
      <div style={{
        padding: SPACING.lg,
        borderBottom: `1px solid ${colors.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(to bottom, #ffffff, #fafbfc)'
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
        </div>

        {/* FITBIT INTEGRATION - Simplified Controls using hook state */}
        <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.sm }}>
          {(fitbit.isCheckingConnection || fitbit.isConnecting || fitbit.polling) && (
            <Spin size="small" />
          )}

          {fitbit.isConnected ? (
            <>
              <Button
                type="text"
                size="small"
                icon={<SyncOutlined spin={fitbit.isSyncing} />}
                onClick={fitbit.actions.syncData}
                disabled={fitbit.isSyncing}
                title="Sync Fitbit Data"
              />
              <Dropdown
                overlay={
                  <Menu>
                    <Menu.Item
                      key="sync"
                      icon={<SyncOutlined />}
                      onClick={fitbit.actions.syncData}
                      disabled={fitbit.isSyncing}
                    >
                      Sync Data
                    </Menu.Item>
                    <Menu.Item
                      key="disconnect"
                      icon={<DisconnectOutlined />}
                      onClick={fitbit.actions.disconnect}
                      danger
                    >
                      Disconnect
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
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.sm }}>
              <Button
                type="primary"
                size="small"
                icon={<LinkOutlined />}
                onClick={fitbit.actions.connect}
                loading={fitbit.isConnecting || fitbit.polling}
                disabled={fitbit.isConnecting || fitbit.polling || fitbit.isCheckingConnection}
                style={{
                  backgroundColor: colors.healthPrimary,
                  borderColor: colors.healthPrimary
                }}
              >
                {fitbit.polling ? 'Checking...' : fitbit.isConnecting ? 'Opening...' : 'Connect Fitbit'}
              </Button>
              {!fitbit.polling && (
                <Button
                  type="text"
                  size="small"
                  icon={<ReloadOutlined />}
                  onClick={fitbit.actions.refreshConnection}
                  disabled={fitbit.isCheckingConnection}
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
        {/* FITBIT INTEGRATION - Connection Notice */}
        {!fitbit.isConnected && !fitbit.isCheckingConnection && !fitbit.isConnecting && (
          <div style={{
            background: 'linear-gradient(to right, #fef3c7, #fde68a)',
            border: '1px solid #f59e0b',
            borderRadius: '8px',
            padding: SPACING.md,
            marginBottom: SPACING.xl,
            textAlign: 'center'
          }}>
            <div style={{ fontWeight: '600', marginBottom: SPACING.sm, color: '#92400e', fontFamily: FONT_FAMILY }}>
              Connect Fitbit for Real-Time Health Data
            </div>
            <div style={{ fontSize: '0.875rem', color: '#92400e', marginBottom: SPACING.md, fontFamily: FONT_FAMILY }}>
              Get automatic tracking of steps, heart rate, sleep, weight, and more health metrics.
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: SPACING.sm }}>
              <Button
                type="primary"
                icon={<LinkOutlined />}
                onClick={fitbit.actions.connect}
                loading={fitbit.isConnecting}
                disabled={fitbit.isConnecting || fitbit.isCheckingConnection}
                style={{
                  backgroundColor: colors.healthPrimary,
                  borderColor: colors.healthPrimary
                }}
              >
                {fitbit.isConnecting ? 'Opening...' : 'Connect Fitbit Account'}
              </Button>
              <Button
                type="default"
                icon={<ReloadOutlined />}
                onClick={fitbit.actions.refreshConnection}
                disabled={fitbit.isCheckingConnection}
              >
                Refresh Status
              </Button>
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
                  e.currentTarget.style.borderColor = colors.healthPrimary;
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
                color: vital.value === '--' ? colors.textMuted : colors.healthPrimary,
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

        {/* Family Medical History */}
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
            <span>Family Medical History</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.sm }}>
              {familyHistoryLoading && <Spin size="small" />}
              <Button
                type="text"
                size="small"
                icon={<PlusOutlined />}
                onClick={onAddFamilyHistory}
              />
            </div>
          </div>

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
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontFamily: FONT_FAMILY
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.healthPrimary;
                    e.currentTarget.style.boxShadow = '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <strong>{history.familyMemberRelation}:</strong> {history.conditionName}
                    {history.ageOfOnset && ` (age ${history.ageOfOnset})`}
                    {history.status && `, ${history.status}`}
                  </div>
                  <Dropdown
                    overlay={
                      <Menu>
                        <Menu.Item
                          key="view"
                          icon={<EyeOutlined />}
                          onClick={() => onViewFamilyHistory(history)}
                        >
                          View
                        </Menu.Item>
                        <Menu.Item
                          key="edit"
                          icon={<EditOutlined />}
                          onClick={() => handleFamilyHistoryClick(history)}
                        >
                          Edit
                        </Menu.Item>
                        <Menu.Item
                          key="delete"
                          icon={<DeleteOutlined />}
                          onClick={() => onDeleteFamilyHistory(history.id!)}
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
                No family medical history recorded.
              </Text>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthSummary;