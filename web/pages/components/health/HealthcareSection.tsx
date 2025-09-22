import React, { useState } from "react";
import {
  colors,
  shadows,
  HealthcareProviderData,
  InsuranceAccountData,
} from "../../../services/health/types";
import { Button, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

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

// Mock data for healthcare providers
const mockProviders: HealthcareProviderData[] = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    specialty: "Primary Care Physician",
    phone: "(555) 123-4567",
    practiceName: "Metro Family Health Center",
    address: "123 Health Street, Medical City, MC 12345",
    icon: "🩺",
    notes: "Annual physical due in March. Great bedside manner, accepts most insurance plans."
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    specialty: "Cardiologist",
    phone: "(555) 234-5678",
    practiceName: "Heart & Vascular Institute",
    address: "456 Cardiac Ave, Medical City, MC 12345",
    icon: "❤️",
    notes: "Referred by Dr. Johnson. Specializes in preventive cardiology and heart health."
  },
  {
    id: 3,
    name: "Dr. Emily Rodriguez",
    specialty: "Dentist",
    phone: "(555) 345-6789",
    practiceName: "Bright Smile Dental",
    address: "789 Dental Drive, Medical City, MC 12345",
    icon: "🦷",
    notes: "6-month cleanings. Very thorough, uses latest technology. Next appointment in October."
  },
];

// Mock data for insurance accounts
const mockInsuranceAccounts: InsuranceAccountData[] = [
  {
    id: 1,
    providerName: "Blue Cross Blue Shield",
    planName: "Premium PPO Plan",
    accountType: "Health Insurance",
    details: [
      { label: "Member ID", value: "BCB123456789" },
      { label: "Group #", value: "GRP-9876543" },
      { label: "Deductible", value: "$2,500 / year" },
      { label: "Copay", value: "$25 PCP / $50 Specialist" }
    ],
    contactInfo: "1-800-BCBS-HELP (1-800-227-4357)",
    logoText: "BCBS",
    gradientStyle: "linear-gradient(135deg, #1e40af, #3b82f6)",
    notes: "Covers most providers in network. Pre-authorization required for imaging and specialist procedures."
  },
  {
    id: 2,
    providerName: "Delta Dental",
    planName: "PPO Plus Coverage",
    accountType: "Dental Insurance",
    details: [
      { label: "Member ID", value: "DD987654321" },
      { label: "Annual Maximum", value: "$2,000" },
      { label: "Preventive", value: "100% covered" },
      { label: "Basic/Major", value: "80%/50% covered" }
    ],
    contactInfo: "1-800-DELTA-OK (1-800-335-8265)",
    logoText: "DD",
    gradientStyle: "linear-gradient(135deg, #059669, #10b981)",
    notes: "Great coverage for preventive care. No waiting period for cleanings and exams."
  },
  {
    id: 3,
    providerName: "VSP Vision Care",
    planName: "Signature Plan",
    accountType: "Vision Insurance",
    details: [
      { label: "Member ID", value: "VSP445566778" },
      { label: "Exam Frequency", value: "Every 12 months" },
      { label: "Frame Allowance", value: "$200 every 24 months" },
      { label: "Lens Copay", value: "$25" }
    ],
    contactInfo: "1-800-VSP-CARE (1-800-877-2273)",
    logoText: "VSP",
    gradientStyle: "linear-gradient(135deg, #7c3aed, #a855f7)",
    notes: "Wide network includes LensCrafters, Pearle Vision. Online ordering available for contacts."
  }
];

interface HealthcareSectionProps {
  isMobile: boolean;
  providers?: HealthcareProviderData[];
  insuranceAccounts?: InsuranceAccountData[];
  providersLoading: boolean;
  insuranceLoading: boolean;
  onAddProvider: () => void;
  onViewProvider: (provider: HealthcareProviderData) => void;
  onEditProvider: (provider: HealthcareProviderData) => void;
  onDeleteProvider: (id: number) => void;
  onAddInsurance: () => void;
  onViewInsurance: (insurance: InsuranceAccountData) => void;
  onEditInsurance: (insurance: InsuranceAccountData) => void;
  onDeleteInsurance: (id: number) => void;
}

const ProviderItem: React.FC<{
  provider: HealthcareProviderData;
  isMobile: boolean;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onEditProvider: (provider: HealthcareProviderData) => void;
  onDeleteProvider: (id: number) => void;
  isMockup?: boolean;
  onAddProvider?: () => void;
}> = ({
  provider,
  isMobile,
  isExpanded,
  onToggleExpanded,
  onEditProvider,
  onDeleteProvider,
  isMockup = false,
  onAddProvider
}) => {
    const [isHovered, setIsHovered] = useState(false);

    const formatProviderContact = (provider: HealthcareProviderData) => {
      const parts: string[] = [];
      if (provider.phone) {
        parts.push(provider.phone);
      }
      if (provider.practiceName) {
        parts.push(provider.practiceName);
      }
      return parts.join(" • ");
    };

    const mockupStyles = isMockup ? {
      opacity: isHovered ? 1 : 0.8,
      border: isHovered ? `2px solid ${colors.healthPrimary}` : '2px dashed #cbd5e1',
      cursor: 'pointer',
      transform: isHovered ? 'translateY(-1px)' : 'translateY(0)',
      boxShadow: isHovered ? '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)' : 'none',
    } : {};

    return (
      <div
        style={{
          background: colors.background,
          borderRadius: '8px',
          padding: SPACING.md,
          marginBottom: SPACING.md,
          border: isMockup ? undefined : `1px solid ${colors.border}`,
          cursor: isMockup ? "pointer" : "pointer",
          fontFamily: FONT_FAMILY,
          overflow: "hidden",
          transition: "all 0.2s ease-in-out",
          position: 'relative',
          ...mockupStyles
        }}
        onClick={isMockup ? onAddProvider : onToggleExpanded}
        onMouseEnter={isMockup ? () => setIsHovered(true) : (e) => {
          if (!isMockup) {
            e.currentTarget.style.borderColor = colors.healthPrimary;
            e.currentTarget.style.boxShadow = "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)";
            e.currentTarget.style.transform = "translateY(-1px)";
          }
        }}
        onMouseLeave={isMockup ? () => setIsHovered(false) : (e) => {
          if (!isMockup) {
            e.currentTarget.style.borderColor = colors.border;
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.style.transform = "translateY(0)";
          }
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: SPACING.md,
          }}
        >
          <div
            style={{
              width: isMobile ? "36px" : "40px",
              height: isMobile ? "36px" : "40px",
              borderRadius: "8px",
              background: isMockup ? '#e2e8f0' : colors.healthLight,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: isMobile ? "18px" : "20px",
              flexShrink: 0,
              filter: isMockup ? 'grayscale(0.5)' : 'none'
            }}
          >
            {provider.icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: isMobile ? "0.8125rem" : "0.875rem",
                fontWeight: 600,
                color: isMockup ? colors.textMuted : "#111827",
                fontFamily: FONT_FAMILY,
                marginBottom: SPACING.xs,
              }}
            >
              {provider.name}
            </div>
            <div
              style={{
                fontSize: isMobile ? "0.6875rem" : "0.75rem",
                color: isMockup ? colors.textMuted : colors.text,
                fontFamily: FONT_FAMILY,
                marginBottom: SPACING.xs,
              }}
            >
              {provider.specialty}
            </div>
            <div
              style={{
                fontSize: isMobile ? "0.6875rem" : "0.75rem",
                color: colors.textMuted,
                fontFamily: FONT_FAMILY,
              }}
            >
              {formatProviderContact(provider)}
            </div>
          </div>

          {!isMockup && (
            <div
              style={{
                display: "flex",
                gap: SPACING.xs,
                alignItems: "center",
              }}
            >
              <button
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: colors.textMuted,
                  padding: "4px",
                  transition: "all 0.2s",
                  borderRadius: "4px"
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (provider.phone) {
                    window.open(`tel:${provider.phone}`);
                  }
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.healthLight;
                  e.currentTarget.style.color = colors.healthPrimary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = colors.textMuted;
                }}
              >
                📞
              </button>
              <button
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: colors.textMuted,
                  padding: "4px",
                  transition: "all 0.2s",
                  borderRadius: "4px"
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  // Calendar integration placeholder
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.healthLight;
                  e.currentTarget.style.color = colors.healthPrimary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = colors.textMuted;
                }}
              >
                📅
              </button>
              <div
                style={{
                  fontSize: "16px",
                  color: colors.textMuted,
                  transition: "transform 0.2s",
                  padding: "4px",
                  display: "flex",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  style={{
                    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                  }}
                >
                  <path
                    d="M7 4L14 10L7 16"
                    stroke={colors.textMuted}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Show expanded details only for real providers, show notes for mockup */}
        {isExpanded && !isMockup && (
          <div
            style={{
              marginTop: SPACING.md,
              paddingTop: SPACING.md,
              borderTop: `1px solid ${colors.border}`,
              animation: "fadeIn 0.2s ease-in-out",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
                gap: SPACING.md,
                marginBottom: SPACING.md,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "0.6875rem",
                    color: colors.textMuted,
                    textTransform: "uppercase",
                    fontWeight: 500,
                    marginBottom: SPACING.xs,
                    fontFamily: FONT_FAMILY
                  }}
                >
                  SPECIALTY
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    fontFamily: FONT_FAMILY
                  }}
                >
                  {provider.specialty || "Not specified"}
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: "0.6875rem",
                    color: colors.textMuted,
                    textTransform: "uppercase",
                    fontWeight: 500,
                    marginBottom: SPACING.xs,
                    fontFamily: FONT_FAMILY
                  }}
                >
                  PRACTICE
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    fontFamily: FONT_FAMILY
                  }}
                >
                  {provider.practiceName || "Not specified"}
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: "0.6875rem",
                    color: colors.textMuted,
                    textTransform: "uppercase",
                    fontWeight: 500,
                    marginBottom: SPACING.xs,
                    fontFamily: FONT_FAMILY
                  }}
                >
                  PHONE
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    fontFamily: FONT_FAMILY
                  }}
                >
                  {provider.phone || "Not available"}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: SPACING.sm, justifyContent: "flex-end" }}>
              <Button
                icon={<EditOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  onEditProvider(provider);
                }}
                style={{
                  padding: `${SPACING.sm}px ${SPACING.md}px`,
                  background: colors.healthPrimary,
                  color: "white",
                  border: "none",
                  borderRadius: '6px',
                  cursor: "pointer",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  transition: "all 0.2s",
                  fontFamily: FONT_FAMILY,
                  display: "flex",
                  alignItems: "center",
                  gap: SPACING.xs,
                }}
              >
              </Button>

              {provider.id != null && (
                <Popconfirm
                  title="Are you sure to delete this provider?"
                  onConfirm={(e) => {
                    if (e) e.stopPropagation();
                    onDeleteProvider(provider.id!);
                  }}
                  onCancel={(e) => { if (e) e.stopPropagation(); }}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button
                    icon={<DeleteOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    style={{
                      padding: `${SPACING.sm}px ${SPACING.md}px`,
                      background: colors.surface,
                      color: colors.danger,
                      border: `1px solid ${colors.danger}`,
                      borderRadius: '6px',
                      cursor: "pointer",
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      transition: "all 0.2s",
                      fontFamily: FONT_FAMILY,
                      display: "flex",
                      alignItems: "center",
                      gap: SPACING.xs,
                    }}
                  >
                  </Button>
                </Popconfirm>
              )}
            </div>
          </div>
        )}

        {/* Show notes for mockup providers */}
        {isMockup && (
          <div
            style={{
              marginTop: SPACING.sm,
              fontSize: isMobile ? "0.7rem" : "0.75rem",
              color: '#cbd5e1',
              lineHeight: "1.4",
              fontFamily: FONT_FAMILY,
              fontStyle: 'italic'
            }}
          >
            {provider.notes}
          </div>
        )}
      </div>
    );
  };

const InsuranceItem: React.FC<{
  account: InsuranceAccountData;
  isMobile: boolean;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onEditInsurance: (account: InsuranceAccountData) => void;
  onDeleteInsurance: (id: number) => void;
  isMockup?: boolean;
  onAddInsurance?: () => void;
}> = ({
  account,
  isMobile,
  isExpanded,
  onToggleExpanded,
  onEditInsurance,
  onDeleteInsurance,
  isMockup = false,
  onAddInsurance
}) => {
    const [isHovered, setIsHovered] = useState(false);

    const mockupStyles = isMockup ? {
      opacity: isHovered ? 1 : 0.8,
      border: isHovered ? `2px solid ${colors.healthPrimary}` : '2px dashed #cbd5e1',
      cursor: 'pointer',
      transform: isHovered ? 'translateY(-1px)' : 'translateY(0)',
      boxShadow: isHovered ? '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)' : 'none',
    } : {};

    return (
      <div
        style={{
          background: isMockup ? colors.background : (account.gradientStyle || colors.background),
          borderRadius: '8px',
          padding: SPACING.md,
          marginBottom: SPACING.md,
          border: isMockup ? undefined : `1px solid ${colors.border}`,
          cursor: "pointer",
          fontFamily: FONT_FAMILY,
          overflow: "hidden",
          transition: "all 0.2s ease-in-out",
          position: "relative",
          ...mockupStyles
        }}
        onClick={isMockup ? onAddInsurance : onToggleExpanded}
        onMouseEnter={isMockup ? () => setIsHovered(true) : (e) => {
          if (!isMockup) {
            e.currentTarget.style.borderColor = colors.healthPrimary;
            e.currentTarget.style.boxShadow = "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)";
            e.currentTarget.style.transform = "translateY(-1px)";
          }
        }}
        onMouseLeave={isMockup ? () => setIsHovered(false) : (e) => {
          if (!isMockup) {
            e.currentTarget.style.borderColor = colors.border;
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.style.transform = "translateY(0)";
          }
        }}
      >
        {isMockup && (
          <>

          </>
        )}

        {/* Logo */}
        <div
          style={{
            position: "absolute",
            top: SPACING.md,
            right: "55px",
            width: isMobile ? "36px" : "40px",
            height: isMobile ? "36px" : "40px",
            borderRadius: "8px",
            background: isMockup ? '#e2e8f0' : "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 600,
            fontSize: isMobile ? "0.8125rem" : "0.875rem",
            color: isMockup ? colors.textMuted : colors.text,
          }}
        >
          {account.logoText}
        </div>

        {/* Expand/Collapse Arrow */}
        {!isMockup && (
          <div
            style={{
              position: "absolute",
              top: SPACING.md,
              right: SPACING.md,
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "rgba(255, 255, 255, 0.9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "14px",
              transition: "all 0.2s",
              backdropFilter: "blur(10px)",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              style={{
                transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
              }}
            >
              <path
                d="M7 4L14 10L7 16"
                stroke={colors.textMuted}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}

        {/* Card content */}
        <div
          style={{
            fontSize: isMobile ? "0.6875rem" : "0.75rem",
            color: isMockup ? colors.textMuted : colors.textMuted,
            fontFamily: FONT_FAMILY,
            marginBottom: SPACING.xs,
          }}
        >
          {account.providerName}
        </div>
        <div
          style={{
            fontSize: isMobile ? "0.8125rem" : "0.875rem",
            fontWeight: 600,
            color: isMockup ? colors.textMuted : "#111827",
            fontFamily: FONT_FAMILY,
            marginBottom: SPACING.xs,
          }}
        >
          {account.planName}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
            gap: SPACING.sm,
            marginBottom: SPACING.xs,
          }}
        >
          {account.details?.map((detail, detailIndex) => (
            <div
              key={detailIndex}
              style={{ fontSize: isMobile ? "0.6875rem" : "0.75rem", fontFamily: FONT_FAMILY }}
            >
              <div
                style={{
                  color: colors.textMuted,
                  marginBottom: "2px",
                }}
              >
                {detail.label}
              </div>
              <div style={{ fontWeight: 500, color: isMockup ? colors.textMuted : colors.text }}>{detail.value}</div>
            </div>
          ))}
        </div>
        {account.contactInfo && (
          <div
            style={{
              fontSize: isMobile ? "0.6875rem" : "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.5px",
              fontFamily: FONT_FAMILY,
              color: isMockup ? colors.textMuted : colors.text,
            }}
          >
            Customer Service: {account.contactInfo}
          </div>
        )}

        {/* Expanded Details */}
        {isExpanded && !isMockup && (
          <div
            style={{
              marginTop: SPACING.md,
              paddingTop: SPACING.md,
              borderTop: `1px solid ${colors.border}`,
              animation: "fadeIn 0.2s ease-in-out",
            }}
          >
            {account?.notes && (
              <div
                style={{
                  fontSize: isMobile ? "0.6875rem" : "0.75rem",
                  fontWeight: 600,
                  letterSpacing: "0.5px",
                  fontFamily: FONT_FAMILY,
                  marginBottom: SPACING.md,
                }}
              >
                Additional Notes: {account.notes}
              </div>
            )}

            <div style={{ display: "flex", gap: SPACING.sm, justifyContent: "flex-end" }}>
              <Button
                icon={<EditOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  onEditInsurance(account);
                }}
                style={{
                  padding: `${SPACING.sm}px ${SPACING.md}px`,
                  background: colors.healthPrimary,
                  color: "white",
                  border: "none",
                  borderRadius: '6px',
                  cursor: "pointer",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  transition: "all 0.2s",
                  fontFamily: FONT_FAMILY,
                  display: "flex",
                  alignItems: "center",
                  gap: SPACING.xs,
                }}
              >
              </Button>

              {account.id != null && (
                <Popconfirm
                  title="Are you sure to delete this insurance account?"
                  onConfirm={(e) => {
                    if (e) e.stopPropagation();
                    onDeleteInsurance(account.id!);
                  }}
                  onCancel={(e) => { if (e) e.stopPropagation(); }}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button
                    icon={<DeleteOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    style={{
                      padding: `${SPACING.sm}px ${SPACING.md}px`,
                      background: colors.surface,
                      color: colors.danger,
                      border: `1px solid ${colors.danger}`,
                      borderRadius: '6px',
                      cursor: "pointer",
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      transition: "all 0.2s",
                      fontFamily: FONT_FAMILY,
                      display: "flex",
                      alignItems: "center",
                      gap: SPACING.xs,
                    }}
                  >
                  </Button>
                </Popconfirm>
              )}
            </div>
          </div>
        )}

        {/* Show notes for mockup insurance */}
        {isMockup && account.notes && (
          <div
            style={{
              marginTop: SPACING.sm,
              fontSize: isMobile ? "0.7rem" : "0.75rem",
              color: '#cbd5e1',
              lineHeight: "1.4",
              fontFamily: FONT_FAMILY,
              fontStyle: 'italic'
            }}
          >
            {account.notes}
          </div>
        )}
      </div>
    );
  };

const HealthcareSection: React.FC<HealthcareSectionProps> = ({
  isMobile,
  providers = [],
  insuranceAccounts = [],
  providersLoading,
  insuranceLoading,
  onAddProvider,
  onViewProvider,
  onEditProvider,
  onDeleteProvider,
  onAddInsurance,
  onViewInsurance,
  onEditInsurance,
  onDeleteInsurance,
}) => {
  const [expandedProviders, setExpandedProviders] = useState<Set<number | string>>(new Set());
  const [expandedInsurance, setExpandedInsurance] = useState<Set<number | string>>(new Set());
  const [providerButtonHovered, setProviderButtonHovered] = useState(false);
  const [insuranceButtonHovered, setInsuranceButtonHovered] = useState(false);

  const hasUserProviders = providers.length > 0;
  const hasUserInsurance = insuranceAccounts.length > 0;
  const displayProviders = hasUserProviders ? providers : mockProviders;
  const displayInsurance = hasUserInsurance ? insuranceAccounts : mockInsuranceAccounts;

  const toggleProviderExpanded = (providerId: number | string) => {
    const newExpanded = new Set(expandedProviders);
    if (newExpanded.has(providerId)) {
      newExpanded.delete(providerId);
    } else {
      newExpanded.add(providerId);
    }
    setExpandedProviders(newExpanded);
  };

  const toggleInsuranceExpanded = (insuranceId: number | string) => {
    const newExpanded = new Set(expandedInsurance);
    if (newExpanded.has(insuranceId)) {
      newExpanded.delete(insuranceId);
    } else {
      newExpanded.add(insuranceId);
    }
    setExpandedInsurance(newExpanded);
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        gap: SPACING.lg,
        fontFamily: FONT_FAMILY
      }}
    >
      {/* Healthcare Providers */}
      <div
        style={{
          background: colors.surface,
          borderRadius: "12px",
          boxShadow: shadows.base,
          overflow: "hidden",
          height: isMobile ? "auto" : "500px",
          display: "flex",
          flexDirection: "column",
          transition: "box-shadow 0.3s",
          fontFamily: FONT_FAMILY
        }}
      >
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
              👨‍⚕️
            </div>
            <span>Healthcare Providers ({hasUserProviders ? providers.length : 0})</span>
            {providersLoading && (
              <span style={{ fontSize: "12px", color: colors.textMuted, fontFamily: FONT_FAMILY }}>
                Loading...
              </span>
            )}
          </div>
          <button
            onClick={onAddProvider}
            onMouseEnter={() => setProviderButtonHovered(true)}
            onMouseLeave={() => setProviderButtonHovered(false)}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              border: "1px solid transparent",
              background: colors.success,
              display: "flex",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
              color: colors.textMuted,
              fontSize: "14px",
              fontFamily: FONT_FAMILY,
              boxShadow: "rgba(140, 197, 146, 0.81) 0px 4px 15px",
              transform: providerButtonHovered ? "translateY(-3px)" : "translateY(0)",
            }}
          >
            <span style={{ fontSize: "20px", fontWeight: "semibold", color: "white", }}>+</span>
          </button>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: SPACING.lg,
          }}
        >
          {providersLoading ? (
            <div
              style={{
                textAlign: "center",
                color: colors.textMuted,
                fontFamily: FONT_FAMILY
              }}
            >
              Loading healthcare providers...
            </div>
          ) : (
            <>
              {!hasUserProviders && (
                <div
                  style={{
                    marginBottom: SPACING.lg,
                    padding: SPACING.md,
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}
                >
                  <div style={{
                    fontSize: '0.8125rem',
                    color: colors.textMuted,
                    fontFamily: FONT_FAMILY,
                    marginBottom: SPACING.xs
                  }}>
                    <strong>👆 Click "+" to add your first healthcare provider</strong>
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#94a3b8',
                    fontFamily: FONT_FAMILY
                  }}>
                    Here are some examples of providers you might want to track:
                  </div>
                </div>
              )}

              {displayProviders.map((provider, index) => {
                const providerKey = provider.id ?? index;
                const isExpanded = expandedProviders.has(providerKey);

                return (
                  <ProviderItem
                    key={providerKey}
                    provider={provider}
                    isMobile={isMobile}
                    isExpanded={isExpanded}
                    onToggleExpanded={() => toggleProviderExpanded(providerKey)}
                    onEditProvider={onEditProvider}
                    onDeleteProvider={onDeleteProvider}
                    isMockup={!hasUserProviders}
                    onAddProvider={onAddProvider}
                  />
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* Insurance & Healthcare Accounts */}
      <div
        style={{
          background: colors.surface,
          borderRadius: "12px",
          boxShadow: shadows.base,
          overflow: "hidden",
          height: isMobile ? "auto" : "500px",
          display: "flex",
          flexDirection: "column",
          transition: "box-shadow 0.3s",
          fontFamily: FONT_FAMILY
        }}
      >
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
              🛡️
            </div>
            <span>Insurance & Healthcare Accounts ({hasUserInsurance ? insuranceAccounts.length : 0})</span>
            {insuranceLoading && (
              <span style={{ fontSize: "12px", color: colors.textMuted, fontFamily: FONT_FAMILY }}>
                Loading...
              </span>
            )}
          </div>
          <button
            onClick={onAddInsurance}
            onMouseEnter={() => setInsuranceButtonHovered(true)}
            onMouseLeave={() => setInsuranceButtonHovered(false)}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              border: "1px solid transparent",
              background: colors.success,
              display: "flex",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
              color: colors.textMuted,
              fontSize: "14px",
              fontFamily: FONT_FAMILY,
              boxShadow: "rgba(140, 197, 146, 0.81) 0px 4px 15px",
              transform: insuranceButtonHovered ? "translateY(-3px)" : "translateY(0)",
            }}
          >
            <span style={{ fontSize: "20px", fontWeight: "semibold", color: "white", }}>+</span>
          </button>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: SPACING.lg,
          }}
        >
          {insuranceLoading ? (
            <div
              style={{
                textAlign: "center",
                color: colors.textMuted,
                fontFamily: FONT_FAMILY
              }}
            >
              Loading insurance accounts...
            </div>
          ) : (
            <>
              {!hasUserInsurance && (
                <div
                  style={{
                    marginBottom: SPACING.lg,
                    padding: SPACING.md,
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}
                >
                  <div style={{
                    fontSize: '0.8125rem',
                    color: colors.textMuted,
                    fontFamily: FONT_FAMILY,
                    marginBottom: SPACING.xs
                  }}>
                    <strong>👆 Click "+" to add your first insurance account</strong>
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#94a3b8',
                    fontFamily: FONT_FAMILY
                  }}>
                    Here are examples of insurance accounts you might want to track:
                  </div>
                </div>
              )}

              {displayInsurance.map((account, index) => {
                const accountKey = account.id ?? index;
                const isExpanded = expandedInsurance.has(accountKey);

                return (
                  <InsuranceItem
                    key={accountKey}
                    account={account}
                    isMobile={isMobile}
                    isExpanded={isExpanded}
                    onToggleExpanded={() => toggleInsuranceExpanded(accountKey)}
                    onEditInsurance={onEditInsurance}
                    onDeleteInsurance={onDeleteInsurance}
                    isMockup={!hasUserInsurance}
                    onAddInsurance={onAddInsurance}
                  />
                );
              })}
            </>
          )}
        </div>
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default HealthcareSection;