import React, { useState } from "react";
import { colors, shadows, MedicationData } from "../../../services/health/types";
import { Button, Popconfirm } from "antd";
import { DeleteOutlined, EditOutlined, ShareAltOutlined } from "@ant-design/icons";

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

// Mock medication data
const mockMedications: MedicationData[] = [
  {
    id: 1,
    name: "Lisinopril",
    dosage: "10mg",
    conditionTreated: "High Blood Pressure",
    prescribingDoctor: "Dr. Sarah Johnson",
    schedule: "Once daily",
    refillDaysLeft: 15,
    icon: "💊",
    created_at: "2024-08-01"
  },
  {
    id: 2,
    name: "Metformin",
    dosage: "500mg",
    conditionTreated: "Type 2 Diabetes",
    prescribingDoctor: "Dr. Michael Chen",
    schedule: "Twice daily",
    refillDaysLeft: 5,
    icon: "🔸",
    isRefillSoon: true,
    created_at: "2024-08-10"
  },
  {
    id: 3,
    name: "Atorvastatin",
    dosage: "20mg",
    conditionTreated: "High Cholesterol",
    prescribingDoctor: "Dr. Sarah Johnson",
    schedule: "Once daily",
    refillDaysLeft: 22,
    icon: "🟡",
    created_at: "2024-07-25"
  },
];

interface MedicationsProps {
  isMobile: boolean;
  medications?: MedicationData[];
  medicationsLoading?: boolean;
  onAddMedication: () => void;
  onEditMedication: (medication: MedicationData) => void;
  onDeleteMedication: (id: number) => void;
  onShareMedication?: (medication: MedicationData) => void; // Added sharing prop
}

const MedicationItem: React.FC<{
  medication: MedicationData;
  isMobile: boolean;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onEditMedication: (medication: MedicationData) => void;
  onDeleteMedication: (id: number) => void;
  onShareMedication?: (medication: MedicationData) => void; // Added sharing prop
  isMockup?: boolean;
  onAddMedication?: () => void;
}> = ({
  medication,
  isMobile,
  isExpanded,
  onToggleExpanded,
  onEditMedication,
  onDeleteMedication,
  onShareMedication, // Added sharing prop
  isMockup = false,
  onAddMedication
}) => {
    const [isHovered, setIsHovered] = useState(false);

    // Calculate dynamic refill status based on creation date
    const calculateRefillStatus = (medication: MedicationData) => {
      const creationDate = medication.created_at;
      const initialSupplyDays = medication.refillDaysLeft;

      if (!creationDate) {
        if (medication.refillDaysLeft != null) {
          if (medication.refillDaysLeft <= 0) {
            return {
              remainingDays: medication.refillDaysLeft,
              status: 'overdue',
              message: 'Overdue - Refill needed',
              color: colors.danger
            };
          } else if (medication.refillDaysLeft <= 7) {
            return {
              remainingDays: medication.refillDaysLeft,
              status: 'soon',
              message: `${medication.refillDaysLeft} days left - Refill soon`,
              color: colors.warning
            };
          } else {
            return {
              remainingDays: medication.refillDaysLeft,
              status: 'normal',
              message: `${medication.refillDaysLeft} days left`,
              color: colors.textMuted
            };
          }
        }

        return {
          remainingDays: null,
          status: 'unknown',
          message: 'Refill info not available',
          color: colors.textMuted
        };
      }

      const createdDate = new Date(creationDate);
      const today = new Date();
      const daysPassed = Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      const remainingDays = initialSupplyDays - daysPassed;

      if (remainingDays <= 0) {
        return {
          remainingDays,
          status: 'overdue',
          message: remainingDays === 0 ? 'Refill today' : 'Overdue - Refill needed',
          color: colors.danger
        };
      } else if (remainingDays <= 7) {
        return {
          remainingDays,
          status: 'soon',
          message: `${remainingDays} days left - Refill soon`,
          color: colors.warning
        };
      } else {
        return {
          remainingDays,
          status: 'normal',
          message: `${remainingDays} days left`,
          color: colors.textMuted
        };
      }
    };

    const {
      icon,
      name,
      dosage,
      conditionTreated,
      prescribingDoctor,
      schedule,
      refillDaysLeft,
    } = medication;

    const refillStatus = calculateRefillStatus(medication);

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
          cursor: "pointer",
          fontFamily: FONT_FAMILY,
          overflow: "hidden",
          transition: "all 0.2s ease-in-out",
          position: 'relative',
          ...mockupStyles
        }}
        onClick={isMockup ? onAddMedication : onToggleExpanded}
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
        {/* Always visible: Icon, Name, and Expand Arrow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: SPACING.md,
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: isMobile ? "36px" : "40px",
              height: isMobile ? "36px" : "40px",
              borderRadius: '8px',
              background: isMockup ? '#e2e8f0' : colors.healthLight,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: isMobile ? "18px" : "20px",
              flexShrink: 0,
              filter: isMockup ? 'grayscale(0.5)' : 'none'
            }}
          >
            {icon || "💊"}
          </div>
          {/* Details */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: isMobile ? "0.8125rem" : "0.875rem",
                fontWeight: 600,
                marginBottom: SPACING.xs,
                fontFamily: FONT_FAMILY,
                color: isMockup ? colors.textMuted : colors.text
              }}
            >
              {name || "Unnamed Medication"}
            </div>
            <div
              style={{
                fontSize: isMobile ? "0.6875rem" : "0.75rem",
                color: colors.textMuted,
                fontFamily: FONT_FAMILY
              }}
            >
              {dosage || "N/A"} • {conditionTreated || "Unknown"} •{" "}
              {prescribingDoctor || "Doctor not specified"}
            </div>
          </div>

          {/* Schedule & Refill */}
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: isMobile ? "0.8125rem" : "0.875rem",
                fontWeight: 500,
                marginBottom: SPACING.xs,
                fontFamily: FONT_FAMILY,
                color: isMockup ? colors.textMuted : colors.text
              }}
            >
              {schedule || "No schedule"}
            </div>
            <div
              style={{
                fontSize: isMobile ? "0.6875rem" : "0.75rem",
                color: isMockup ? colors.textMuted : refillStatus.color,
                fontWeight: refillStatus.status === 'overdue' || refillStatus.status === 'soon' ? "500" : "normal",
                fontFamily: FONT_FAMILY
              }}
            >
              {refillStatus.message}
            </div>
          </div>

          {/* Schedule & Expand Arrow */}
          {!isMockup && (
            <div style={{ textAlign: "right", display: "flex", alignItems: "center", gap: SPACING.sm }}>
              <div>
                {(refillStatus.status === 'soon' || refillStatus.status === 'overdue') && (
                  <div
                    style={{
                      fontSize: isMobile ? "0.6875rem" : "0.75rem",
                      color: refillStatus.color,
                      fontWeight: "500",
                      fontFamily: FONT_FAMILY
                    }}
                  >
                    {refillStatus.status === 'overdue' ? '⚠️ Overdue' : '⏰ Soon'}
                  </div>
                )}
              </div>

              {/* Expand/Collapse Arrow */}
              <div
                style={{
                  fontSize: "16px",
                  color: colors.textMuted,
                  transition: "transform 0.2s",
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

          {/* Show refill status for mockup */}
          {isMockup && (refillStatus.status === 'soon' || refillStatus.status === 'overdue') && (
            <div style={{ textAlign: "right", display: "flex", alignItems: "center", gap: SPACING.sm }}>
              <div
                style={{
                  fontSize: isMobile ? "0.6875rem" : "0.75rem",
                  color: colors.textMuted,
                  fontWeight: "500",
                  fontFamily: FONT_FAMILY
                }}
              >
                {refillStatus.status === 'overdue' ? '⚠️' : '⏰'}
              </div>
            </div>
          )}
        </div>

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
            {/* Detailed Information */}
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
                  DOSAGE
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    fontFamily: FONT_FAMILY
                  }}
                >
                  {dosage || "N/A"}
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
                  DOCTOR
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    fontFamily: FONT_FAMILY
                  }}
                >
                  {prescribingDoctor || "Not specified"}
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
                  REFILL
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    color: refillStatus.color,
                    fontFamily: FONT_FAMILY
                  }}
                >
                  {refillStatus.message}
                </div>
              </div>
            </div>

            {/* Action Buttons - Following bookmarks pattern */}
            <div
              style={{
                borderTop: "1px solid #f0f0f0",
                padding: "8px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "#fafafa",
                width: "100%",
                maxWidth: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  flex: 1,
                  maxWidth: "100%",
                }}
              >
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined style={{ fontSize: "14px" }} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditMedication(medication);
                  }}
                  style={{
                    width: "28px",
                    height: "28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                />

                <div
                  style={{
                    borderLeft: "1px solid #e0e0e0",
                    height: "16px",
                    alignSelf: "center",
                  }}
                />

                {/* Share Button - Following bookmarks pattern */}
                {onShareMedication && (
                  <>
                    <Button
                      type="text"
                      size="small"
                      icon={<ShareAltOutlined style={{ fontSize: "14px" }} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onShareMedication(medication);
                      }}
                      style={{
                        width: "28px",
                        height: "28px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    />

                    <div
                      style={{
                        borderLeft: "1px solid #e0e0e0",
                        height: "16px",
                        alignSelf: "center",
                      }}
                    />
                  </>
                )}

                {medication.id != null && (
                  <Popconfirm
                    title="Are you sure to delete this medication?"
                    onConfirm={(e) => {
                      if (e) e.stopPropagation();
                      onDeleteMedication(medication.id!);
                    }}
                    onCancel={(e) => { if (e) e.stopPropagation(); }}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button
                      type="text"
                      size="small"
                      icon={<DeleteOutlined style={{ fontSize: "14px", color: "#ff0207ff" }} />}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      style={{
                        width: "28px",
                        height: "28px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    />
                  </Popconfirm>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

const Medications: React.FC<MedicationsProps> = ({
  isMobile,
  medications = [],
  medicationsLoading = false,
  onAddMedication,
  onEditMedication,
  onDeleteMedication,
  onShareMedication, // Added sharing prop
}) => {
  const [expandedMedications, setExpandedMedications] = useState<Set<number | string>>(new Set());
  const [hovered, setHovered] = useState(false);

  const hasUserMedications = medications.length > 0;
  const displayMedications = hasUserMedications ? medications : mockMedications;

  const toggleExpanded = (medicationId: number | string) => {
    const newExpanded = new Set(expandedMedications);
    if (newExpanded.has(medicationId)) {
      newExpanded.delete(medicationId);
    } else {
      newExpanded.add(medicationId);
    }
    setExpandedMedications(newExpanded);
  };

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
            💊
          </div>
          <span>Medications ({hasUserMedications ? medications.length : 0})</span>
          {!hasUserMedications && (
            <span style={{
              fontSize: "11px",
              color: colors.textMuted,
              fontFamily: FONT_FAMILY,
              fontWeight: "normal",
              opacity: 0.7
            }}>
              Examples below
            </span>
          )}
          {medicationsLoading && (
            <span style={{ fontSize: "12px", color: colors.textMuted, fontFamily: FONT_FAMILY }}>
              Loading...
            </span>
          )}
        </div>
        <button
          onClick={onAddMedication}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
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
            transform: hovered ? "translateY(-3px)" : "translateY(0)",
          }}
        >
          <span style={{ fontSize: "20px", fontWeight: "semibold", color: "white", }}>+</span>
        </button>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: SPACING.lg,
        }}
      >
        {medicationsLoading ? (
          <div
            style={{
              textAlign: "center",
              padding: "2rem",
              color: colors.textMuted,
              fontFamily: FONT_FAMILY
            }}
          >
            Loading medications...
          </div>
        ) : (
          <>
            {!hasUserMedications && (
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
                  <strong>👆 Click "+" to add your first medication</strong>
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#94a3b8',
                  fontFamily: FONT_FAMILY
                }}>
                  Here are examples of medications you might want to track:
                </div>
              </div>
            )}

            {displayMedications.map((medication, index) => {
              const medicationKey = medication.id ?? index;
              const isExpanded = expandedMedications.has(medicationKey);

              return (
                <MedicationItem
                  key={medicationKey}
                  medication={medication}
                  isMobile={isMobile}
                  isExpanded={isExpanded}
                  onToggleExpanded={() => toggleExpanded(medicationKey)}
                  onEditMedication={onEditMedication}
                  onDeleteMedication={onDeleteMedication}
                  onShareMedication={onShareMedication} // Pass sharing handler
                  isMockup={!hasUserMedications}
                  onAddMedication={onAddMedication}
                />
              );
            })}
          </>
        )}
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

export default Medications;