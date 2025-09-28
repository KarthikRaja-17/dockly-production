  import React, { useState } from "react";
import { ShareAltOutlined } from "@ant-design/icons";
import { colors, shadows, WellnessTaskData } from "../../../services/health/types";

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

// Mockup data for when user has no tasks
const mockWellnessTasks: WellnessTaskData[] = [
  {
    id: 1,
    icon: "💧",
    text: "Drink 8 glasses of water",
    date: "2025-09-18",
    details: "Stay hydrated throughout the day. Track your water intake and aim for at least 64oz daily. Consider adding lemon or cucumber for variety.",
    completed: true,
    recurring: false
  },
  {
    id: 2,
    icon: "🏃‍♂️",
    text: "30-minute morning walk",
    date: "2025-09-18",
    details: "Get some fresh air and light cardio to start the day. Track your steps and try to maintain a brisk pace. Listen to podcasts or music while walking.",
    completed: true,
    recurring: false
  },
  {
    id: 3,
    icon: "🧘‍♀️",
    text: "10-minute meditation",
    date: "2025-09-18",
    details: "Practice mindfulness using Headspace or Calm app. Focus on breathing exercises and stress reduction. Best done in the morning or before bed.",
    completed: false,
    recurring: false
  },
];

interface WellnessTasksProps {
  isMobile: boolean;
  wellnessTasks?: WellnessTaskData[];
  wellnessLoading: boolean;
  onAddTask: () => void;
  onToggleTask: (id: number) => void;
  onEditTask: (task: WellnessTaskData) => void;
  onDeleteTask: (id: number) => void;
  onShareTask?: (task: WellnessTaskData) => void;
}

const TaskItem: React.FC<{
  task: WellnessTaskData;
  isMobile: boolean;
  onToggle: (id: number) => void;
  onEdit: (task: WellnessTaskData) => void;
  onDelete: (id: number) => void;
  onShare?: (task: WellnessTaskData) => void;
  isMockup?: boolean;
  onAddTask?: () => void;
}> = ({ task, isMobile, onToggle, onEdit, onDelete, onShare, isMockup = false, onAddTask }) => {
  console.log("Rendering TaskItem:", task);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const mockupStyles = isMockup ? {
    opacity: isHovered ? 1 : 0.8,
    border: isHovered ? `2px solid ${colors.healthPrimary}` : '2px dashed #cbd5e1',
    cursor: 'pointer',
    transform: isHovered ? 'translateY(-1px)' : 'translateY(0)',
    boxShadow: isHovered ? '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)' : 'none',
  } : {};

  const mockupTextColor = isMockup ? '#94a3b8' : (task.completed ? colors.textMuted : colors.text);

  // Format date for display
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return ""; // or return "N/A"
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };
  return (
    <div
      style={{
        background: colors.background,
        borderRadius: '8px',
        padding: SPACING.md,
        marginBottom: SPACING.md,
        border: isMockup ? undefined : `1px solid ${colors.border}`,
        cursor: isMockup ? "pointer" : "pointer",
        transition: "all 0.2s",
        fontFamily: FONT_FAMILY,
        position: 'relative',
        ...mockupStyles
      }}
      onClick={isMockup ? onAddTask : () => setIsExpanded(!isExpanded)}
      onMouseEnter={isMockup ? () => setIsHovered(true) : undefined}
      onMouseLeave={isMockup ? () => setIsHovered(false) : undefined}
    >
      <div style={{ display: "flex", alignItems: "center", gap: SPACING.md }}>
        <div
          onClick={isMockup ? undefined : (e) => {
            e.stopPropagation();
            onToggle(task.id!);
          }}
          style={{
            width: isMobile ? "24px" : "20px",
            height: isMobile ? "24px" : "20px",
            border: `2px solid ${isMockup ? '#e2e8f0' : colors.border}`,
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
            flexShrink: 0,
            background: task.completed ? (isMockup ? '#e2e8f0' : colors.healthPrimary) : "transparent",
            borderColor: task.completed ? (isMockup ? '#e2e8f0' : colors.healthPrimary) : (isMockup ? '#e2e8f0' : colors.border),
            color: isMockup ? '#94a3b8' : "white",
            fontSize: "14px",
            cursor: isMockup ? "default" : "pointer"
          }}
        >
          {task.completed && "✓"}
        </div>

        <div
          style={{
            width: isMobile ? "20px" : "24px",
            height: isMobile ? "20px" : "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: isMobile ? "14px" : "16px",
            flexShrink: 0,
            filter: isMockup ? 'grayscale(0.5)' : 'none'
          }}
        >
          {task.icon}
        </div>

        <div
          style={{
            flex: 1,
            fontSize: isMobile ? "0.8125rem" : "0.875rem",
            fontWeight: "500",
            textDecoration: task.completed ? "line-through" : "none",
            color: mockupTextColor,
            transition: "all 0.2s",
            fontFamily: FONT_FAMILY
          }}
        >
          {task.text}
        </div>

        {!isMockup && (
          <div style={{ display: "flex", gap: SPACING.xs }}>
            {task?.recurring && (
              <div style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                color: colors.danger,
                padding: "4px",
              }}>
                🔄
              </div>
            )}

            {!task.completed && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(task);
                }}
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
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#dbeafe";
                  e.currentTarget.style.color = colors.primary;
                  e.currentTarget.style.transform = "scale(1.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = colors.textMuted;
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                ✏️
              </button>
            )}

            {onShare && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onShare(task);
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: colors.textMuted,
                  padding: "4px",
                  transition: "all 0.2s",
                  borderRadius: "4px",
                  width: "28px",
                  height: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#dbeafe";
                  e.currentTarget.style.color = colors.primary;
                  e.currentTarget.style.transform = "scale(1.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = colors.textMuted;
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <ShareAltOutlined style={{ fontSize: "14px" }} />
              </button>
            )}

            {task?.completed &&
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm("Are you sure you want to delete this task?")) {
                    onDelete(task.id!);
                  }
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: colors.danger,
                  padding: "4px 0px",
                }}
              >
                🗑️
              </button>
            }
          </div>
        )}

        {isMockup && task?.recurring && (
          <div style={{
            background: "none",
            border: "none",
            fontSize: "14px",
            color: '#cbd5e1',
            padding: "4px 0px",
          }}>
            🔄
          </div>
        )}
      </div>

      {isExpanded && !isMockup && (
        <div
          style={{
            marginTop: SPACING.md,
            paddingTop: SPACING.md,
            borderTop: `1px solid ${colors.border}`,
            fontSize: isMobile ? "0.75rem" : "0.8125rem",
            color: colors.textMuted,
            lineHeight: "1.5",
            opacity: 0,
            animation: "fadeIn 0.3s ease forwards",
            fontFamily: FONT_FAMILY
          }}
        >
          {/* Task Details */}
          {task.details && (
            <div style={{ marginBottom: SPACING.md }}>
              <strong style={{ color: colors.text, display: 'block', marginBottom: SPACING.xs }}>
                📝 Details:
              </strong>
              {task.details}
            </div>
          )}

          {/* Date Information */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: SPACING.md,
            marginBottom: SPACING.md
          }}>
            {(task.start_date || task.startDate) && (
              <div>
                <strong style={{ color: colors.text, display: 'block', marginBottom: SPACING.xs }}>
                  🚀 Start Date:
                </strong>
                {formatDate(task?.start_date)}
              </div>
            )}

            {(task.due_date || task.dueDate) && (
              <div>
                <strong style={{ color: colors.text, display: 'block', marginBottom: SPACING.xs }}>
                  ⏰ Due Date:
                </strong>
                {formatDate(task.due_date)}
              </div>
            )}
          </div>

          {/* Status Information */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: SPACING.md,
            marginBottom: SPACING.md
          }}>
            <div>
              <strong style={{ color: colors.text, marginRight: SPACING.xs }}>
                📊 Status:
              </strong>
              <span style={{
                background: task.completed ? colors.success : colors.warning,
                color: 'white',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '500'
              }}>
                {task.completed ? 'Completed' : 'Pending'}
              </span>
            </div>

            {task.recurring && (
              <div>
                <strong style={{ color: colors.text, marginRight: SPACING.xs }}>
                  🔄 Recurring:
                </strong>
                <span style={{
                  background: colors.primary,
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}>
                  Yes
                </span>
              </div>
            )}
          </div>

          {/* Tagged IDs (if any) */}
          {task.tagged_ids && task.tagged_ids.length > 0 && (
            <div>
              <strong style={{ color: colors.text, display: 'block', marginBottom: SPACING.xs }}>
                🏷️ Tags:
              </strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: SPACING.xs }}>
                {task.tagged_ids.map((tagId, index) => (
                  <span
                    key={index}
                    style={{
                      background: '#f1f5f9',
                      color: colors.text,
                      padding: '2px 6px',
                      borderRadius: '8px',
                      fontSize: '0.7rem',
                      border: `1px solid ${colors.border}`
                    }}
                  >
                    {tagId}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

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
          {task.details}
        </div>
      )}

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
};

const WellnessTasks: React.FC<WellnessTasksProps> = ({
  isMobile,
  wellnessTasks = [],
  wellnessLoading,
  onAddTask,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  onShareTask,
}) => {
  const [hovered, setHovered] = useState(false);
  const hasUserTasks = wellnessTasks.length > 0;
  const displayTasks = hasUserTasks ? wellnessTasks : mockWellnessTasks;
  const taskCount = hasUserTasks ? wellnessTasks.length : 0;

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
            fontWeight: "600",
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
            ✅
          </div>
          <span>Wellness & Maintenance ({taskCount})</span>
          {wellnessLoading && (
            <span style={{ fontSize: "12px", color: colors.textMuted, fontFamily: FONT_FAMILY }}>
              Loading...
            </span>
          )}
        </div>
        <button
          onClick={onAddTask}
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
          <span style={{ fontSize: "20px", fontWeight: "semibold", color: "white" }}>+</span>
        </button>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: SPACING.lg,
        }}
      >
        {wellnessLoading ? (
          <div
            style={{
              textAlign: "center",
              padding: "2rem",
              color: colors.textMuted,
              fontFamily: FONT_FAMILY
            }}
          >
            Loading wellness tasks...
          </div>
        ) : (
          <>
            {!hasUserTasks && (
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
                  <strong>👆 Click "+" to add your first wellness task</strong>
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#94a3b8',
                  fontFamily: FONT_FAMILY
                }}>
                  Here are some examples to inspire your wellness journey:
                </div>
              </div>
            )}

            {displayTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                isMobile={isMobile}
                onToggle={onToggleTask}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onShare={onShareTask}
                isMockup={!hasUserTasks}
                onAddTask={onAddTask}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default WellnessTasks;