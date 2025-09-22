"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  DatePicker,
  Form,
  Modal,
  Select,
  TimePicker,
  Input,
  Button,
  Checkbox,
  Typography,
  Row,
  Col,
  Tag,
  message,
  Avatar,
  Space,
  Badge,
  Progress,
  Menu,
  Dropdown,
  Popconfirm,
} from "antd";
import {
  CalendarOutlined,
  DeleteOutlined,
  EditOutlined,
  GoogleOutlined,
  MailOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  CheckSquareOutlined,
  MoreOutlined,
  ShareAltOutlined,
  FireOutlined,
  SearchOutlined,
  TeamOutlined,
  HomeOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import { Calendar } from "lucide-react";
import dayjs from "dayjs";
import {
  addWeeklyGoal,
  addWeeklyTodo,
  deleteWeeklyGoal,
  deleteWeeklyTodo,
  getAllPlannerData,
  updateWeeklyGoal,
  updateWeeklyTodo,
  shareGoal,
  shareTodo,
  getHabits,
  updateHabit,
  addHabit,
  deleteHabit,
  editHabit,
} from "../../services/planner";
import { showNotification } from "../../utils/notification";
import { useCurrentUser } from "../../app/userContext";
import { useGlobalLoading } from "../../app/loadingContext";
import MiniCalendar from "../components/miniCalendar";
import CustomCalendar from "../components/customCalendar";
import FamilyTasksComponent from "../components/familyTasksProjects";
import NotesLists from "../family-hub/components/familyNotesLists";
import {
  deleteProjects,
  DeleteTask,
  getUsersFamilyMembers,
  getUserFamilyGroups,
  addProject,
  addTask,
  updateTask,
  getProjects,
  getTasks,
} from "../../services/family";
import BookmarkHub from "../components/bookmarks";
import { useSearchParams } from "next/navigation";
import { API_URL } from "../../services/apiConfig";
import { addEvent } from "../../services/google";
import FileHub from "../../pages/components/files";

const { Title, Text } = Typography;

// Enhanced Professional color palette with better contrast
const COLORS = {
  primary: "#1a1a1a",
  secondary: "#4a4a4a",
  accent: "#6366F1",
  success: "#059669",
  warning: "#d97706",
  error: "#dc2626",
  background: "#ffffff",
  surface: "#ffffff",
  surfaceSecondary: "#ffffff",
  surfaceElevated: "#ffffff",
  border: "#ffffff",
  borderLight: "#f1f5f9",
  borderMedium: "#cbd5e1",
  text: "#1a1a1a",
  textSecondary: "#64748b",
  textTertiary: "#94a3b8",
  overlay: "rgba(0, 0, 0, 0.5)",
  shadowLight: "rgba(0, 0, 0, 0.05)",
  shadowMedium: "rgba(0, 0, 0, 0.1)",
  shadowHeavy: "rgba(0, 0, 0, 0.15)",
  shadowElevated: "rgba(0, 0, 0, 0.2)",
  habit: "#8b5cf6",
  mood: "#ec4899",
  energy: "#f59e0b",
  time: "#10b981",
};

const SPACING = {
  xs: 3,
  sm: 6,
  md: 12,
  lg: 18,
  xl: 24,
  xxl: 36,
};

const FONT_FAMILY =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

type Task = {
  id: number;
  title: string;
  assignee: string;
  type: string;
  completed: boolean;
  due: string;
  dueDate?: string;
  timeSpent?: number; // in minutes
  estimatedTime?: number; // in minutes
};

type Project = {
  color?: string;
  id: string;
  title: string;
  description: string;
  due_date: string;
  progress: number;
  tasks: Task[];
  visibility: string;
  source: string;
  timeSpent?: number;
  estimatedTime?: number;
  created_by?: string;
  creator_name?: string;
  family_groups?: string[];
};

interface ConnectedAccount {
  userName: string;
  email: string;
  displayName: string;
  accountType: string;
  provider: string;
  color: string;
}

// Updated HabitTracker interface - removed target, current, streak
interface HabitTracker {
  id: string;
  name: string;
  description: string;
  frequency: "daily" | "weekly" | "monthly";
  status: boolean; // Changed from target/current to status
  color: string;
  icon: string;
  lastCompleted?: string;
}

interface MoodEntry {
  id: string;
  date: string;
  mood: number; // 1-5 scale
  energy: number; // 1-5 scale
  productivity: number; // 1-5 scale
  notes?: string;
  weather?: string;
}

interface FamilyGroup {
  id: string;
  name: string;
  ownerName: string;
  memberCount: number;
}

const PRIMARY_COLOR = COLORS.accent;

// Updated function to create unique account identifiers
const createAccountIdentifier = (account: ConnectedAccount): string => {
  return `${account.email}-${account.provider}`;
};

// Updated function to get provider icon
const getProviderIcon = (provider: string) => {
  switch (provider.toLowerCase()) {
    case "google":
      return <GoogleOutlined />;
    case "outlook":
      return <MailOutlined />;
    case "dockly":
    default:
      return "D";
  }
};

// Updated function to get provider display name
const getProviderDisplayName = (provider: string): string => {
  switch (provider.toLowerCase()) {
    case "google":
      return "Google";
    case "outlook":
      return "Outlook";
    case "dockly":
      return "Dockly";
    default:
      return provider.charAt(0).toUpperCase() + provider.slice(1);
  }
};

// Enhanced CalendarAccountFilter as Select Component - FIXED INFINITE LOOP
const CalendarAccountFilter: React.FC<{
  connectedAccounts: ConnectedAccount[];
  onFilterChange: (filteredAccountIds: string[]) => void;
  onConnectAccount: () => void;
}> = ({ connectedAccounts, onFilterChange, onConnectAccount }) => {
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>(["all"]);
  const [isLoading, setIsLoading] = useState(false);
  // Memoize account IDs to prevent infinite loops
  const allAccountIds = useMemo(
    () => connectedAccounts.map((acc) => createAccountIdentifier(acc)),
    [connectedAccounts]
  );

  // Use callback to prevent infinite re-renders
  const handleFilterUpdate = useCallback(() => {
    if (connectedAccounts.length > 0 && selectedAccounts.includes("all")) {
      onFilterChange(allAccountIds);
    } else if (!selectedAccounts.includes("all")) {
      onFilterChange(selectedAccounts);
    }
  }, [
    selectedAccounts,
    connectedAccounts.length,
    allAccountIds,
    onFilterChange,
  ]);

  // Fixed useEffect with proper dependencies
  useEffect(() => {
    handleFilterUpdate();
  }, [handleFilterUpdate]);

  const handleSelectChange = useCallback((values: string[]) => {
    if (values.includes("all")) {
      setSelectedAccounts(["all"]);
    } else {
      setSelectedAccounts(values);
    }
  }, []);

  const handleConnectClick = async () => {
    setIsLoading(true);
    try {
      await onConnectAccount(); // wait until fetching completes
    } finally {
      setIsLoading(false);
    }
  };

  if (connectedAccounts.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: SPACING.xs,
          padding: `${SPACING.sm}px ${SPACING.md}px`,
          background: COLORS.surfaceSecondary,
          borderRadius: "8px",
          border: `1px solid ${COLORS.borderLight}`,
          fontFamily: FONT_FAMILY,
        }}
      >
        <GoogleOutlined
          style={{ color: COLORS.textSecondary, fontSize: "14px" }}
        />
        <Text
          style={{
            color: COLORS.textSecondary,
            fontSize: "13px",
            fontWeight: 500,
            fontFamily: FONT_FAMILY,
          }}
        >
          No accounts connected
        </Text>
        <Button
          type="primary"
          size="small"
          icon={<PlusOutlined />}
          onClick={handleConnectClick}
          loading={isLoading}
          style={{
            backgroundColor: COLORS.accent,
            borderColor: COLORS.accent,
            borderRadius: "6px",
            height: "28px",
            fontWeight: 600,
            fontSize: "12px",
            fontFamily: FONT_FAMILY,
          }}
        >
          {isLoading ? "Connecting..." : "Connect"}
        </Button>
      </div>
    );
  }

  return (
    <Select
      mode="multiple"
      value={selectedAccounts}
      onChange={handleSelectChange}
      placeholder="Select accounts"
      style={{
        minWidth: "200px",
        maxWidth: "350px",
        fontFamily: FONT_FAMILY,
        color: COLORS.textSecondary,
      }}
      size="middle"
      suffixIcon={<CalendarOutlined style={{ color: COLORS.textSecondary }} />}
      tagRender={(props) => {
        const { label, value, closable, onClose } = props;
        if (value === "all") {
          return (
            <Tag
              color="blue"
              closable={closable}
              onClose={onClose}
              style={{
                margin: "2px",
                borderRadius: "4px",
                fontSize: "11px",
                fontWeight: 500,
                fontFamily: FONT_FAMILY,
              }}
            >
              All Accounts
            </Tag>
          );
        }

        const account = connectedAccounts.find(
          (acc) => createAccountIdentifier(acc) === value
        );
        if (!account) return <span />;

        return (
          <Tag
            closable={closable}
            onClose={onClose}
            style={{
              margin: "2px",
              borderRadius: "4px",
              fontSize: "11px",
              fontWeight: 500,
              fontFamily: FONT_FAMILY,
              background: `${account.color}15`,
              borderColor: account.color,
              color: account.color,
            }}
          >
            <Avatar
              size={14}
              style={{ backgroundColor: account.color, marginRight: "4px" }}
            >
              {getProviderIcon(account.provider)}
            </Avatar>
            {account.email.split("@")[0]}
          </Tag>
        );
      }}
    >
      <Select.Option key="all" value="all" style={{ fontFamily: FONT_FAMILY }}>
        <div style={{ display: "flex", alignItems: "center", gap: SPACING.xs }}>
          <Avatar size={20} style={{ backgroundColor: COLORS.accent }}>
            <CalendarOutlined style={{ fontSize: "12px" }} />
          </Avatar>
          <Text
            style={{
              fontSize: "13px",
              fontWeight: 500,
              fontFamily: FONT_FAMILY,
            }}
          >
            All Accounts
          </Text>
        </div>
      </Select.Option>
      {connectedAccounts
        .filter((account) => account.email)
        .map((account) => {
          const accountId = createAccountIdentifier(account);
          return (
            <Select.Option
              key={accountId}
              value={accountId}
              style={{ fontFamily: FONT_FAMILY, color: COLORS.textSecondary }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: SPACING.xs,
                }}
              >
                <Avatar size={20} style={{ backgroundColor: account.color }}>
                  {getProviderIcon(account.provider)}
                </Avatar>
                <div>
                  <Text
                    style={{
                      fontSize: "13px",
                      fontWeight: 500,
                      fontFamily: FONT_FAMILY,
                    }}
                  >
                    {account.email.split("@")[0]}
                  </Text>
                  <Text
                    style={{
                      fontSize: "11px",
                      color: COLORS.textSecondary,
                      display: "block",
                      fontFamily: FONT_FAMILY,
                    }}
                  >
                    {getProviderDisplayName(account.provider)}
                  </Text>
                </div>
              </div>
            </Select.Option>
          );
        })}
    </Select>
  );
};

const ConnectAccountModal: React.FC<{
  isVisible: boolean;
  onClose: () => void;
  onConnect: () => void;
}> = ({ isVisible, onClose, onConnect }) => {
  return (
    <Modal
      open={isVisible}
      onCancel={onClose}
      footer={null}
      width={450}
      centered
    >
      <div
        style={{
          textAlign: "center",
          padding: "18px",
          fontFamily: FONT_FAMILY,
        }}
      >
        <CalendarOutlined
          style={{
            fontSize: "48px",
            color: COLORS.accent,
            marginBottom: "18px",
          }}
        />
        <Title
          level={4}
          style={{
            marginBottom: "12px",
            color: COLORS.text,
            fontFamily: FONT_FAMILY,
          }}
        >
          Connect Your Google Calendar
        </Title>
        <Text
          style={{
            display: "block",
            marginBottom: "18px",
            color: COLORS.textSecondary,
            fontFamily: FONT_FAMILY,
            fontSize: "14px",
          }}
        >
          To view and manage your calendar events, please connect your Google
          account. You can connect multiple accounts to see all your events in
          one place.
        </Text>
        <div
          style={{
            background: COLORS.surfaceSecondary,
            padding: "12px",
            borderRadius: "6px",
            marginBottom: "18px",
          }}
        >
          <Text
            style={{
              fontSize: "13px",
              color: COLORS.textSecondary,
              fontFamily: FONT_FAMILY,
            }}
          >
            🔒 Your data is secure and we only access your calendar events
          </Text>
        </div>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Button
            type="primary"
            size="large"
            icon={<GoogleOutlined />}
            onClick={onConnect}
            style={{
              width: "100%",
              height: "42px",
              backgroundColor: COLORS.accent,
              borderColor: COLORS.accent,
              borderRadius: "6px",
              fontFamily: FONT_FAMILY,
            }}
          >
            Connect Google Account
          </Button>
          <Button
            type="text"
            onClick={onClose}
            style={{ width: "100%", fontFamily: FONT_FAMILY }}
          >
            Maybe Later
          </Button>
        </Space>
      </div>
    </Modal>
  );
};

// Updated Habit Tracker Component - checkbox moved to the left of fire emoji
const HabitTracker: React.FC<{
  habits: HabitTracker[];
  onToggleHabit: (habitId: string) => void;
  selectedDate: string;
  onAddHabit: () => void;
  onEditHabit: (habit: HabitTracker) => void;
  onDeleteHabit: (habitId: string) => void;
}> = ({ habits, onToggleHabit, selectedDate, onAddHabit ,onEditHabit, onDeleteHabit}) => {
  const todayHabits = habits.slice(0, 4); // Show top 4 habits
  const maxItems = 2; // number of habit slots to show

  // Add empty slots if habits are fewer
  const habitsWithPlaceholders = [
    ...todayHabits,
    ...Array(Math.max(maxItems - todayHabits.length, 0)).fill({}),
  ];

  return (
    <div
      style={{
        background: COLORS.surface,
        borderRadius: "12px",
        fontFamily: FONT_FAMILY,
      }}
    >
      <Space direction="vertical" size="small" style={{ width: "100%" }}>
        {habitsWithPlaceholders.map((habit: any, index: number) => {
          const isFuture = dayjs(selectedDate).isAfter(dayjs(), "day");

          // If habit has no id, it's a placeholder
          if (!habit?.id) {
            return (
              <div
                key={`empty-habit-${index}`}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  padding: SPACING.lg,
                  backgroundColor: COLORS.surfaceSecondary,
                  borderRadius: "8px",
                  border: `2px dashed ${COLORS.borderMedium}`,
                  marginBottom: SPACING.sm,
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
                onClick={(e) => {
                  e.stopPropagation(); // ← prevent parent handlers
                  e.preventDefault();
                  onAddHabit();
                }}
              >
                {/* Circle with numbering just like goals */}
                <div
                  style={{
                    width: "22px",
                    height: "20px",
                    backgroundColor: COLORS.borderMedium,
                    color: COLORS.textSecondary,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    fontWeight: 600,
                    marginRight: SPACING.xs,
                    flexShrink: 0,
                  }}
                >
                  {index + 1}
                </div>

                {/* Placeholder text */}
                <Text
                  style={{
                    color: COLORS.textTertiary,
                    fontStyle: "italic",
                    fontSize: "13px",
                    fontWeight: 500,
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  Add Habit {index + 1}
                </Text>
              </div>
            );
          }

          const menu = (
            <Menu>
              <Menu.Item key="edit" onClick={() => onEditHabit(habit)}>
                Edit
              </Menu.Item>
              <Menu.Item key="delete" danger onClick={() => onDeleteHabit(habit.id)}>
                Delete
              </Menu.Item>
            </Menu>
          );

          // Normal habit card with checkbox moved to the left of fire emoji
          return (
            <div
              key={habit.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: SPACING.sm,
                background: COLORS.surfaceSecondary,
                borderRadius: "8px",
                border: `1px solid ${COLORS.borderLight}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: SPACING.sm,
                }}
              >
                {/* Moved checkbox to the left */}
                <Checkbox
                  checked={habit.status}
                  onChange={() => onToggleHabit(habit.id)}
                  disabled={isFuture}
                  style={{
                    transform: "scale(1.1)",
                  }}
                />
                <div
                  style={{
                    fontSize: "16px",
                    color: habit.color,
                  }}
                >
                  {habit.icon}
                </div>
                <div>
                  <Text
                    style={{
                      fontSize: "13px",
                      fontWeight: 500,
                      fontFamily: FONT_FAMILY,
                      textDecoration: habit.status ? "line-through" : "none",
                      color: habit.status ? COLORS.textSecondary : COLORS.text,
                    }}
                  >
                    {habit.name}
                  </Text>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: SPACING.xs,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: "11px",
                        color: habit.status ? COLORS.success : COLORS.textSecondary,
                        fontFamily: FONT_FAMILY,
                        fontWeight: 500,
                      }}
                    >
                      {habit.status ? "Completed" : "Not completed"}
                    </Text>
                  </div>
                </div>
              </div>
              
              {/* Menu button on the right */}
              <Dropdown overlay={menu} trigger={["click"]}>
                <Button 
                  size="small" 
                  icon={<MoreOutlined />}
                  style={{
                    borderRadius: "6px",
                  }}
                />
              </Dropdown>
            </div>
          );
        })}
      </Space>
    </div>
  );
};

// Combined Goal Share & Tag Modal Component
const GoalShareTagModal: React.FC<{
  isVisible: boolean;
  onClose: () => void;
  goal: any;
  loading: boolean;
  onShare: (goal: any, email: string) => void;
  onTag: (goal: any, emails: string[]) => void;
  familyMembers: any[];
}> = ({ isVisible, onClose, goal, loading, onShare, onTag, familyMembers }) => {
  const [shareForm] = Form.useForm();
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  const handleEmailShare = async () => {
    try {
      const values = await shareForm.validateFields();
      await onShare(goal, values.email);
      handleClose();
    } catch (error) {
      console.error("Share validation failed:", error);
    }
  };

  const handleMemberShare = async () => {
    if (!selectedMemberIds.length) {
      message.warning("Please select at least one member.");
      return;
    }

    const selectedMembers = familyMembers.filter((member: any) =>
      selectedMemberIds.includes(member.id)
    );

    const emails = selectedMembers
      .map((member: any) => member.email)
      .filter((email: string) => !!email);

    await onTag(goal, emails);
    handleClose();
  };

  const handleClose = () => {
    onClose();
    shareForm.resetFields();
    setSelectedMemberIds([]);
  };

  return (
    <Modal
      title={null}
      open={isVisible}
      onCancel={handleClose}
      footer={null}
      centered
      width={520}
      destroyOnClose
      style={{
        fontFamily: FONT_FAMILY,
      }}
      styles={{
        body: {
          padding: "0px",
          background: "#ffffff",
          borderRadius: "16px",
          overflow: "hidden",
        },
        header: {
          padding: "0px",
          marginBottom: "0px",
          border: "none",
        },
        mask: {
          backdropFilter: "blur(8px)",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        },
        content: {
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15)",
          border: "1px solid #e5e7eb",
        },
      }}
    >
      {goal && (
        <div>
          {/* Header with Goal Info */}
          <div
            style={{
              padding: "20px 20px 16px",
              borderBottom: "1px solid #e5e7eb",
              background: "#ffffff",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  background: "#f3f4f6",
                  borderRadius: "50%",
                  padding: "10px",
                  marginRight: "12px",
                }}
              >
                <TrophyOutlined
                  style={{
                    color: COLORS.success,
                    fontSize: "18px",
                  }}
                />
              </div>
              <Text
                style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "#1f2937",
                  fontFamily: FONT_FAMILY,
                }}
              >
                Share Goal
              </Text>
            </div>

            {/* Goal Preview */}
            <div
              style={{
                padding: 16,
                backgroundColor: COLORS.surfaceSecondary,
                borderRadius: 8,
                border: `1px solid ${COLORS.borderLight}`,
                fontFamily: FONT_FAMILY,
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    background: `linear-gradient(135deg, ${COLORS.success}, ${COLORS.success}dd)`,
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 4px 12px ${COLORS.success}30`,
                  }}
                >
                  <TrophyOutlined style={{ color: "white" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      marginBottom: 4,
                      color: COLORS.text,
                      fontFamily: FONT_FAMILY,
                      fontSize: "16px",
                    }}
                  >
                    {goal.text}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: COLORS.textSecondary,
                      fontFamily: FONT_FAMILY,
                    }}
                  >
                    Goal • Due: {goal.date} • {goal.time}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Tag
                    color={goal.completed ? "green" : "orange"}
                    style={{
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontFamily: FONT_FAMILY,
                    }}
                  >
                    {goal.completed ? "Completed" : "In Progress"}
                  </Tag>
                </div>
              </div>
              {goal.completed && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 12,
                    color: COLORS.success,
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  <CheckCircleOutlined />
                  <span>This goal has been completed!</span>
                </div>
              )}
            </div>

            <Input
              placeholder="Search family members..."
              prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
              style={{
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                color: "#374151",
                fontFamily: FONT_FAMILY,
                height: "36px",
              }}
            />
          </div>

          {/* Family Members Grid OR Empty State */}
          <div style={{ padding: "16px 20px" }}>
            {familyMembers.filter((m: any) => m.relationship !== "me").length > 0 ? (
              <div
                style={{
                  maxHeight: "280px",
                  overflowY: "auto",
                  marginBottom: "20px",
                  scrollbarWidth: "none", // Firefox
                  msOverflowStyle: "none",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "10px",
                  }}
                >
                  {familyMembers
                    .filter((member: any) => member.relationship !== "me")
                    .map((member: any) => (
                      <div
                        key={member.id}
                        onClick={() => {
                          setSelectedMemberIds((prev) =>
                            prev.includes(member.id)
                              ? prev.filter((id) => id !== member.id)
                              : [...prev, member.id]
                          );
                        }}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          cursor: "pointer",
                          padding: "12px 8px",
                          borderRadius: "12px",
                          transition: "all 0.3s ease",
                          background: selectedMemberIds.includes(member.id)
                            ? "#f0f9ff"
                            : "transparent",
                          border: selectedMemberIds.includes(member.id)
                            ? "2px solid #3b82f6"
                            : "2px solid transparent",
                        }}
                        onMouseEnter={(e) => {
                          if (!selectedMemberIds.includes(member.id)) {
                            e.currentTarget.style.background = "#f9fafb";
                            e.currentTarget.style.transform = "scale(1.02)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!selectedMemberIds.includes(member.id)) {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.transform = "scale(1)";
                          }
                        }}
                      >
                        <div
                          style={{
                            position: "relative",
                            marginBottom: "8px",
                          }}
                        >
                          <Avatar
                            size={60}
                            style={{
                              background: selectedMemberIds.includes(member.id)
                                ? "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
                                : "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
                              fontSize: "24px",
                              fontWeight: "600",
                              border: selectedMemberIds.includes(member.id)
                                ? "3px solid #3b82f6"
                                : "3px solid #e5e7eb",
                              boxShadow: selectedMemberIds.includes(member.id)
                                ? "0 4px 20px rgba(59, 130, 246, 0.3)"
                                : "0 2px 8px rgba(0, 0, 0, 0.1)",
                              transition: "all 0.3s ease",
                              color: "#ffffff",
                            }}
                          >
                            {member.name?.charAt(0)?.toUpperCase() || "U"}
                          </Avatar>
                          {selectedMemberIds.includes(member.id) && (
                            <div
                              style={{
                                position: "absolute",
                                bottom: "-2px",
                                right: "-2px",
                                width: "20px",
                                height: "20px",
                                background: "#10b981",
                                borderRadius: "50%",
                                border: "2px solid #ffffff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 2px 8px rgba(16, 185, 129, 0.4)",
                              }}
                            >
                              <CheckCircleOutlined
                                style={{
                                  fontSize: "10px",
                                  color: "#fff",
                                }}
                              />
                            </div>
                          )}
                        </div>
                        <Text
                          style={{
                            color: "#374151",
                            fontSize: "13px",
                            fontWeight: selectedMemberIds.includes(member.id)
                              ? 600
                              : 500,
                            fontFamily: FONT_FAMILY,
                            textAlign: "center",
                            lineHeight: "1.2",
                            maxWidth: "80px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {member.name}
                        </Text>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  color: "#6b7280",
                  fontFamily: FONT_FAMILY,
                }}
              >
                <TeamOutlined style={{ fontSize: "40px", marginBottom: "12px" }} />
                <div style={{ fontSize: "15px", fontWeight: 500 }}>
                  No family members added yet
                </div>
                <div style={{ fontSize: "13px", color: "#9ca3af", marginTop: "4px" }}>
                  Add family members to start sharing goals.
                </div>
              </div>
            )}

            {/* Share Button */}
            {selectedMemberIds.length > 0 && (
              <Button
                type="primary"
                block
                size="large"
                onClick={handleMemberShare}
                loading={loading}
                style={{
                  borderRadius: "12px",
                  height: "44px",
                  fontSize: "15px",
                  fontWeight: 600,
                  fontFamily: FONT_FAMILY,
                  marginBottom: "20px",
                  background: "#255198ff",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                  transition: "all 0.3s ease",
                }}
              >
                Share with {selectedMemberIds.length} member
                {selectedMemberIds.length > 1 ? "s" : ""}
              </Button>
            )}

            {/* Email Share Section */}
            <div
              style={{
                borderTop: "1px solid #e5e7eb",
                paddingTop: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    background: "#f3f4f6",
                    borderRadius: "50%",
                    padding: "6px",
                    marginRight: "10px",
                  }}
                >
                  <MailOutlined
                    style={{
                      color: "#374151",
                      fontSize: "14px",
                    }}
                  />
                </div>
                <Text
                  style={{
                    color: "#374151",
                    fontSize: "15px",
                    fontWeight: 600,
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  Or share via email
                </Text>
              </div>

              <Form form={shareForm} onFinish={handleEmailShare}>
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "flex-start",
                  }}
                >
                  <Form.Item
                    name="email"
                    rules={[
                      {
                        required: true,
                        message: "Please enter an email address",
                      },
                      {
                        type: "email",
                        message: "Please enter a valid email address",
                      },
                    ]}
                    style={{ flex: 1, marginBottom: 0 }}
                  >
                    <Input
                      placeholder="Enter email address"
                      style={{
                        background: "#f9fafb",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        color: "#374151",
                        fontFamily: FONT_FAMILY,
                        height: "40px",
                        fontSize: "14px",
                      }}
                    />
                  </Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    style={{
                      height: "40px",
                      minWidth: "100px",
                      fontFamily: FONT_FAMILY,
                      borderRadius: "8px",
                      fontWeight: 600,
                      background: "#10b981",
                      border: "none",
                      boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
                      fontSize: "14px",
                    }}
                  >
                    Send
                  </Button>
                </div>
              </Form>

              <div
                style={{
                  marginTop: "12px",
                  fontSize: "12px",
                  color: "#6b7280",
                  fontFamily: FONT_FAMILY,
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <MailOutlined style={{ fontSize: "11px" }} />
                <span>Email will be sent with goal details</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

// Combined Task Share & Tag Modal Component
const TaskShareTagModal: React.FC<{
  isVisible: boolean;
  onClose: () => void;
  task: any;
  loading: boolean;
  onShare: (task: any, email: string) => void;
  onTag: (task: any, emails: string[]) => void;
  familyMembers: any[];
}> = ({ isVisible, onClose, task, loading, onShare, onTag, familyMembers }) => {
  const [shareForm] = Form.useForm();
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  const handleEmailShare = async () => {
    try {
      const values = await shareForm.validateFields();
      await onShare(task, values.email);
      handleClose();
    } catch (error) {
      console.error("Share validation failed:", error);
    }
  };

  const handleMemberShare = async () => {
    if (!selectedMemberIds.length) {
      message.warning("Please select at least one member.");
      return;
    }

    const selectedMembers = familyMembers.filter((member: any) =>
      selectedMemberIds.includes(member.id)
    );

    const emails = selectedMembers
      .map((member: any) => member.email)
      .filter((email: string) => !!email);

    await onTag(task, emails);
    handleClose();
  };

  const handleClose = () => {
    onClose();
    shareForm.resetFields();
    setSelectedMemberIds([]);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return COLORS.error;
      case "medium":
        return COLORS.warning;
      case "low":
        return COLORS.success;
      default:
        return COLORS.textSecondary;
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "high":
        return "HIGH";
      case "medium":
        return "MEDIUM";
      case "low":
        return "LOW";
      default:
        return "MEDIUM";
    }
  };

  return (
    <Modal
      title={null}
      open={isVisible}
      onCancel={handleClose}
      footer={null}
      centered
      width={520}
      destroyOnClose
      style={{
        fontFamily: FONT_FAMILY,
      }}
      styles={{
        body: {
          padding: "0px",
          background: "#ffffff",
          borderRadius: "16px",
          overflow: "hidden",
        },
        header: {
          padding: "0px",
          marginBottom: "0px",
          border: "none",
        },
        mask: {
          backdropFilter: "blur(8px)",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        },
        content: {
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15)",
          border: "1px solid #e5e7eb",
        },
      }}
    >
      {task && (
        <div>
          {/* Header with Task Info */}
          <div
            style={{
              padding: "20px 20px 16px",
              borderBottom: "1px solid #e5e7eb",
              background: "#ffffff",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  background: "#f3f4f6",
                  borderRadius: "50%",
                  padding: "10px",
                  marginRight: "12px",
                }}
              >
                <CheckSquareOutlined
                  style={{
                    color: COLORS.warning,
                    fontSize: "18px",
                  }}
                />
              </div>
              <Text
                style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "#1f2937",
                  fontFamily: FONT_FAMILY,
                }}
              >
                Share Task
              </Text>
            </div>

            {/* Task Preview */}
            <div
              style={{
                padding: 16,
                backgroundColor: COLORS.surfaceSecondary,
                borderRadius: 8,
                border: `1px solid ${COLORS.borderLight}`,
                fontFamily: FONT_FAMILY,
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    background: `linear-gradient(135deg, ${COLORS.warning}, ${COLORS.warning}dd)`,
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 4px 12px ${COLORS.warning}30`,
                  }}
                >
                  <CheckSquareOutlined style={{ color: "white" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      marginBottom: 4,
                      color: COLORS.text,
                      fontFamily: FONT_FAMILY,
                      fontSize: "16px",
                    }}
                  >
                    {task.text}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: COLORS.textSecondary,
                      fontFamily: FONT_FAMILY,
                    }}
                  >
                    Task • Due: {task.date} • {task.time}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Tag
                    color={task.completed ? "green" : "orange"}
                    style={{
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontFamily: FONT_FAMILY,
                    }}
                  >
                    {task.completed ? "Completed" : "Pending"}
                  </Tag>
                </div>
              </div>

              <div style={{ marginBottom: 8 }}>
                <Tag
                  color={getPriorityColor(task.priority)}
                  style={{
                    fontSize: 10,
                    padding: "2px 6px",
                    borderRadius: 4,
                    fontFamily: FONT_FAMILY,
                    fontWeight: 600,
                  }}
                >
                  {getPriorityText(task.priority)}
                </Tag>
              </div>

              {task.completed && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 12,
                    color: COLORS.success,
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  <CheckCircleOutlined />
                  <span>This task has been completed!</span>
                </div>
              )}
            </div>

            <Input
              placeholder="Search family members..."
              prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
              style={{
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                color: "#374151",
                fontFamily: FONT_FAMILY,
                height: "36px",
              }}
            />
          </div>

          {/* Family Members Grid OR Empty State */}
          <div style={{ padding: "16px 20px" }}>
            {familyMembers.filter((m: any) => m.relationship !== "me").length > 0 ? (
              <div
                style={{
                  maxHeight: "280px",
                  overflowY: "auto",
                  marginBottom: "20px",
                  scrollbarWidth: "none", // Firefox
                  msOverflowStyle: "none",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "10px",
                  }}
                >
                  {familyMembers
                    .filter((member: any) => member.relationship !== "me")
                    .map((member: any) => (
                      <div
                        key={member.id}
                        onClick={() => {
                          setSelectedMemberIds((prev) =>
                            prev.includes(member.id)
                              ? prev.filter((id) => id !== member.id)
                              : [...prev, member.id]
                          );
                        }}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          cursor: "pointer",
                          padding: "12px 8px",
                          borderRadius: "12px",
                          transition: "all 0.3s ease",
                          background: selectedMemberIds.includes(member.id)
                            ? "#f0f9ff"
                            : "transparent",
                          border: selectedMemberIds.includes(member.id)
                            ? "2px solid #3b82f6"
                            : "2px solid transparent",
                        }}
                        onMouseEnter={(e) => {
                          if (!selectedMemberIds.includes(member.id)) {
                            e.currentTarget.style.background = "#f9fafb";
                            e.currentTarget.style.transform = "scale(1.02)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!selectedMemberIds.includes(member.id)) {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.transform = "scale(1)";
                          }
                        }}
                      >
                        <div
                          style={{
                            position: "relative",
                            marginBottom: "8px",
                          }}
                        >
                          <Avatar
                            size={60}
                            style={{
                              background: selectedMemberIds.includes(member.id)
                                ? "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
                                : "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
                              fontSize: "24px",
                              fontWeight: "600",
                              border: selectedMemberIds.includes(member.id)
                                ? "3px solid #3b82f6"
                                : "3px solid #e5e7eb",
                              boxShadow: selectedMemberIds.includes(member.id)
                                ? "0 4px 20px rgba(59, 130, 246, 0.3)"
                                : "0 2px 8px rgba(0, 0, 0, 0.1)",
                              transition: "all 0.3s ease",
                              color: "#ffffff",
                            }}
                          >
                            {member.name?.charAt(0)?.toUpperCase() || "U"}
                          </Avatar>
                          {selectedMemberIds.includes(member.id) && (
                            <div
                              style={{
                                position: "absolute",
                                bottom: "-2px",
                                right: "-2px",
                                width: "20px",
                                height: "20px",
                                background: "#10b981",
                                borderRadius: "50%",
                                border: "2px solid #ffffff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 2px 8px rgba(16, 185, 129, 0.4)",
                              }}
                            >
                              <CheckCircleOutlined
                                style={{
                                  fontSize: "10px",
                                  color: "#fff",
                                }}
                              />
                            </div>
                          )}
                        </div>
                        <Text
                          style={{
                            color: "#374151",
                            fontSize: "13px",
                            fontWeight: selectedMemberIds.includes(member.id)
                              ? 600
                              : 500,
                            fontFamily: FONT_FAMILY,
                            textAlign: "center",
                            lineHeight: "1.2",
                            maxWidth: "80px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {member.name}
                        </Text>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  color: "#6b7280",
                  fontFamily: FONT_FAMILY,
                }}
              >
                <TeamOutlined style={{ fontSize: "40px", marginBottom: "12px" }} />
                <div style={{ fontSize: "15px", fontWeight: 500 }}>
                  No family members added yet
                </div>
                <div style={{ fontSize: "13px", color: "#9ca3af", marginTop: "4px" }}>
                  Add family members to start sharing tasks.
                </div>
              </div>
            )}

            {/* Share Button */}
            {selectedMemberIds.length > 0 && (
              <Button
                type="primary"
                block
                size="large"
                onClick={handleMemberShare}
                loading={loading}
                style={{
                  borderRadius: "12px",
                  height: "44px",
                  fontSize: "15px",
                  fontWeight: 600,
                  fontFamily: FONT_FAMILY,
                  marginBottom: "20px",
                  background: "#255198ff",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                  transition: "all 0.3s ease",
                }}
              >
                Share with {selectedMemberIds.length} member
                {selectedMemberIds.length > 1 ? "s" : ""}
              </Button>
            )}

            {/* Email Share Section */}
            <div
              style={{
                borderTop: "1px solid #e5e7eb",
                paddingTop: "20px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    background: "#f3f4f6",
                    borderRadius: "50%",
                    padding: "6px",
                    marginRight: "10px",
                  }}
                >
                  <MailOutlined
                    style={{
                      color: "#374151",
                      fontSize: "14px",
                    }}
                  />
                </div>
                <Text
                  style={{
                    color: "#374151",
                    fontSize: "15px",
                    fontWeight: 600,
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  Or share via email
                </Text>
              </div>

              <Form form={shareForm} onFinish={handleEmailShare}>
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "flex-start",
                  }}
                >
                  <Form.Item
                    name="email"
                    rules={[
                      {
                        required: true,
                        message: "Please enter an email address",
                      },
                      {
                        type: "email",
                        message: "Please enter a valid email address",
                      },
                    ]}
                    style={{ flex: 1, marginBottom: 0 }}
                  >
                    <Input
                      placeholder="Enter email address"
                      style={{
                        background: "#f9fafb",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        color: "#374151",
                        fontFamily: FONT_FAMILY,
                        height: "40px",
                        fontSize: "14px",
                      }}
                    />
                  </Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    style={{
                      height: "40px",
                      minWidth: "100px",
                      fontFamily: FONT_FAMILY,
                      borderRadius: "8px",
                      fontWeight: 600,
                      background: "#10b981",
                      border: "none",
                      boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
                      fontSize: "14px",
                    }}
                  >
                    Send
                  </Button>
                </div>
              </Form>

              <div
                style={{
                  marginTop: "12px",
                  fontSize: "12px",
                  color: "#6b7280",
                  fontFamily: FONT_FAMILY,
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                }}
              >
                <MailOutlined style={{ fontSize: "11px" }} />
                <span>Email will be sent with task details</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

// Enhanced PlannerTitle with new CalendarAccountFilter and Family Group Selector
const PlannerTitle: React.FC<{
  connectedAccounts: ConnectedAccount[];
  onFilterChange: (filteredAccountIds: string[]) => void;
  onConnectAccount: () => void;
  familyGroups: FamilyGroup[];
  selectedFamilyGroup: string | null;
  onFamilyGroupChange: (groupId: string) => void;
  showFamilySelector: boolean;
}> = ({ 
  connectedAccounts, 
  onFilterChange, 
  onConnectAccount,
  familyGroups,
  selectedFamilyGroup,
  onFamilyGroupChange,
  showFamilySelector
}) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: SPACING.xl,
        padding: `${SPACING.xs}px ${SPACING.sm}px`,
        borderRadius: "16px",
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
            width: "42px",
            height: "42px",
            background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accent}dd)`,
            color: "white",
            borderRadius: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 6px 20px ${COLORS.accent}30`,
          }}
        >
          <Calendar size={22} />
        </div>
        <div>
          <h1
            style={{
              fontSize: "26px",
              fontWeight: 600,
              color: COLORS.text,
              margin: 0,
              lineHeight: 1.2,
              fontFamily: FONT_FAMILY,
            }}
          >
            Planner
          </h1>
          <Text
            style={{
              color: COLORS.textSecondary,
              fontSize: "14px",
              fontWeight: 400,
              display: "block",
              marginTop: "2px",
              fontFamily: FONT_FAMILY,
            }}
          >
            Organize your life efficiently
          </Text>
        </div>
      </div>
      
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: SPACING.md,
        }}
      >
        {/* Family Group Selector */}
        {showFamilySelector && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              background: "white",
              padding: "8px 16px",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
            }}
          >
            <HomeOutlined style={{ color: "#6b7280", fontSize: "16px" }} />
            <Select
              value={selectedFamilyGroup}
              onChange={onFamilyGroupChange}
              style={{ 
                minWidth: "200px",
                fontFamily: FONT_FAMILY
              }}
              size="middle"
              suffixIcon={<SwapOutlined style={{ color: "#6b7280" }} />}
            >
              {familyGroups.map((group) => (
                <Select.Option key={group.id} value={group.id}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontWeight: 500 }}>{group.name}</span>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 500,
                        color: "#fff",
                        background: "#3b82f6",
                        borderRadius: "9999px",
                        padding: "2px 6px",
                        lineHeight: 1,
                        display: "inline-block",
                        minWidth: "20px",
                        textAlign: "center",
                      }}
                    >
                      {group.memberCount}
                    </span>
                  </div>
                </Select.Option>
              ))}
            </Select>
          </div>
        )}
        
        <CalendarAccountFilter
          connectedAccounts={connectedAccounts}
          onFilterChange={onFilterChange}
          onConnectAccount={onConnectAccount}
        />
      </div>
    </div>
  );
};

const Planner = () => {
  const userId = useCurrentUser()?.uid;
  const [goals, setGoals] = useState<
    {
      id: string;
      text: string;
      completed: boolean;
      date: string;
      time: string;
    }[]
  >([]);
  const [todos, setTodos] = useState<
    {
      id: string;
      text: string;
      completed: boolean;
      priority: "high" | "medium" | "low";
      date: string;
      time: string;
      goal_id?: string;
    }[]
  >([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [familyGroups, setFamilyGroups] = useState<FamilyGroup[]>([]);
  const [selectedFamilyGroup, setSelectedFamilyGroup] = useState<string | null>(null);
  const [showFamilySelector, setShowFamilySelector] = useState(false);
  const [pendingProject, setPendingProject] = useState<any>(null);
  const [selectedFamilyGroupsForProject, setSelectedFamilyGroupsForProject] = useState<string[]>([]);
  const { loading, setLoading } = useGlobalLoading();
  const [backup, setBackup] = useState(null);
  const [isGoalModalVisible, setIsGoalModalVisible] = useState(false);
  const [isEventModalVisible, setIsEventModalVisible] = useState(false);
  const [isTodoModalVisible, setIsTodoModalVisible] = useState(false);
  const [isProjectModalVisible, setIsProjectModalVisible] = useState(false);
  const [isConnectAccountModalVisible, setIsConnectAccountModalVisible] =
    useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [editingTodo, setEditingTodo] = useState<any>(null);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [connectedAccounts, setConnectedAccounts] = useState<
    ConnectedAccount[]
  >([]);
  const [filteredAccountIds, setFilteredAccountIds] = useState<string[]>([]);
  const [personColors, setPersonColors] = useState<{
    [person: string]: { color: string; email: string };
  }>({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"Day" | "Week" | "Month" | "Year">("Week");
  const searchParams = useSearchParams();
  const viewParam = searchParams?.get("view");
  const [eventForm] = Form.useForm();
  const [goalForm] = Form.useForm();
  const [todoForm] = Form.useForm();
  const [projectForm] = Form.useForm();
  const [editingHabit, setEditingHabit] = useState<HabitTracker | null>(null);
  const [notes, setNotes] = useState<
    { id: string; title: string; description: string; created_at: string }[]
  >([]);
  const [editingNote, setEditingNote] = useState<{
    id: string;
    title: string;
    description: string;
  } | null>(null);
  const [isNoteModalVisible, setIsNoteModalVisible] = useState(false);
  const [noteForm] = Form.useForm();
  const [expandedSection, setExpandedSection] = useState<
    "habits" | "goals" | "todos" | null
  >("habits");

  // Combined Share/Tag Modal States
  const [isGoalShareTagModalVisible, setIsGoalShareTagModalVisible] = useState(false);
  const [isTaskShareTagModalVisible, setIsTaskShareTagModalVisible] = useState(false);
  const [sharingGoal, setSharingGoal] = useState<any>(null);
  const [sharingTask, setSharingTask] = useState<any>(null);  
  const currentUser = useCurrentUser();
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  
  // Advanced Features State
  const [isHabitModalOpen, setHabitModalOpen] = useState(false);
  // Updated: removed target field from newHabit
  const [newHabit, setNewHabit] = useState({
    name: "",
    description: "",
    frequency: "daily",
  });

  // Advanced Features State
  const [habits, setHabits] = useState<HabitTracker[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    dayjs().format("YYYY-MM-DD")
  );
  const [todayMood, setTodayMood] = useState<MoodEntry | undefined>(undefined);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(
    null
  );
  const isFuture = dayjs(selectedDate).isAfter(dayjs(), "day");

  useEffect(() => {
    if (view === "Day") {
      setExpandedSection("habits");
    } else {
      setExpandedSection("goals");
    }
  }, [view]);

  // Fetch family groups
  const fetchFamilyGroups = async () => {
    try {
      const response = await getUserFamilyGroups();
      const { status, payload } = response;
      if (status === 1) {
        setFamilyGroups(payload.groups || []);
        
        // Show family selector if user has multiple family groups
        if (payload.groups && payload.groups.length > 1) {
          setShowFamilySelector(true);
          // Check if there's a stored selection, otherwise use first group
          const storedGroupId = localStorage.getItem('selectedPlannerFamilyGroup');
          if (storedGroupId && payload.groups.find((g: any) => g.id === storedGroupId)) {
            setSelectedFamilyGroup(storedGroupId);
          } else {
            const firstGroup = payload.groups[0];
            if (firstGroup.id) {
              setSelectedFamilyGroup(firstGroup.id);
              localStorage.setItem('selectedPlannerFamilyGroup', firstGroup.id);
            }
          }
        } else if (payload.groups && payload.groups.length === 1) {
          // Single family group
          const singleGroup = payload.groups[0];
          if (singleGroup.id) {
            setSelectedFamilyGroup(singleGroup.id);
            localStorage.setItem('selectedPlannerFamilyGroup', singleGroup.id);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch family groups:", error);
    }
  };

  // Handle family group change - FIXED TO RESET ACCOUNT FILTER
  const handleFamilyGroupChange = async (groupId: string) => {
    setSelectedFamilyGroup(groupId);
    localStorage.setItem('selectedPlannerFamilyGroup', groupId);
    
    // IMPORTANT: Reset the account filter to show all accounts from the new family group
    setFilteredAccountIds([]);
    
    // Refresh planner data with new family group
    await fetchAllPlannerData();
  };

  // Updated handleEditHabit to open modal instead of directly calling API
  const handleEditHabit = (habit: any) => {
    setEditingHabit(habit);
    setNewHabit({
      name: habit.name,
      description: habit.description,
      frequency: habit.frequency || "daily",
    });
    setHabitModalOpen(true);
  };

  // Actual API call for editing habits (called from modal)
  const submitEditHabit = async (habitData: any) => {
    try {
      const res = await editHabit({ 
        habit: { 
          ...habitData,
          id: editingHabit?.id, 
          editedBy: userId 
        } 
      });
      if (res.data.status === 1) {
        message.success("Habit updated!");
        fetchHabits();
        setHabitModalOpen(false);
        setEditingHabit(null);
      } else {
        message.error(res.data.message || "Failed to edit habit");
      }
    } catch (err) {
      message.error("Failed to edit habit");
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    try {
      const res = await deleteHabit(habitId);
      if (res.data.status === 1) {
        message.success("Habit deleted!");
        fetchHabits();
      } else {
        message.error(res.data.message || "Failed to delete habit");
      }
    } catch (err) {
      message.error("Failed to delete habit");
    }
  };

  // Helper functions
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return COLORS.error;
      case "medium":
        return COLORS.warning;
      case "low":
        return COLORS.success;
      default:
        return COLORS.textSecondary;
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "high":
        return "HIGH";
      case "medium":
        return "MEDIUM";
      case "low":
        return "LOW";
      default:
        return "MEDIUM";
    }
  };

  useEffect(() => {
    if (viewParam && ["Day", "Week", "Month", "Year"].includes(viewParam)) {
      setView(viewParam as "Day" | "Week" | "Month" | "Year");
    }
  }, [viewParam]);

  const formatDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getDateRange = (date: Date, viewType: string) => {
    const start = new Date(date);
    const end = new Date(date);

    switch (viewType) {
      case "Day":
        break;
      case "Week":
        const dayOfWeek = start.getDay();
        start.setDate(start.getDate() - dayOfWeek);
        end.setDate(start.getDate() + 6);
        break;
      case "Month":
        start.setDate(1);
        end.setMonth(end.getMonth() + 1);
        end.setDate(0);
        break;
      case "Year":
        start.setMonth(0, 1);
        end.setMonth(11, 31);
        break;
    }

    return { start, end };
  };

  const getFilteredGoals = () => {
    const { start, end } = getDateRange(currentDate, view);
    const startStr = formatDateString(start);
    const endStr = formatDateString(end);
    return goals.filter((goal) => goal.date >= startStr && goal.date <= endStr);
  };

  const getFilteredTodos = () => {
    const { start, end } = getDateRange(currentDate, view);
    const startStr = formatDateString(start);
    const endStr = formatDateString(end);
    return todos.filter((todo) => todo.date >= startStr && todo.date <= endStr);
  };

  const getViewTitle = (type: "Goals" | "Tasks") => {
    switch (view) {
      case "Day":
        return `Daily ${type}`;
      case "Week":
        return `Weekly ${type}`;
      case "Month":
        return `Monthly ${type}`;
      case "Year":
        return `Yearly ${type}`;
      default:
        return `Weekly ${type}`;
    }
  };

  // Updated fetchHabits function to handle status instead of target/current
  const fetchHabits = async () => {
    if (!userId) return;
    try {
      const res = await getHabits({ userId, date: selectedDate });
      if (res.data.status === 1) {
        const payload = res.data.payload || [];
        const formatted = payload.map(
          (h: any): HabitTracker => ({
            id: String(h.id),
            name: h.name,
            description: h.description || "",
            frequency: "daily", // backend doesn't store frequency yet
            status: h.status || false, // Updated: use status instead of target/current
            color: COLORS.habit, // or randomize
            icon: "🔥", // pick emoji or allow user to choose
            lastCompleted: h.last_completed,
          })
        );
        setHabits(formatted);
      }
    } catch (err) {
      message.error("Failed to fetch habits");
    }
  };

  useEffect(() => {
    fetchHabits();
  }, [selectedDate, userId]);

  const getFilteredCalendarEvents = () => {
    if (filteredAccountIds.length === 0) {
      return calendarEvents;
    }

    // Filter events based on active account IDs
    return calendarEvents.filter((event) => {
      const eventAccountId = `${event.source_email}-${event.provider}`;
      return filteredAccountIds.includes(eventAccountId);
    });
  };

  // Use useCallback to prevent infinite loops
  const handleAccountFilterChange = useCallback((filteredIds: string[]) => {
    setFilteredAccountIds(filteredIds);
  }, []);

  const handleConnectAccount = () => {
    window.location.href = `${API_URL}/add-googleCalendar?username=${currentUser?.user_name}&userId=${currentUser?.uid}`;
  };

  const handleToggleHabit = async (habitId: string) => {
    try {
      const res = await updateHabit({
        habit: { id: habitId, editedBy: userId, progress_date: selectedDate },
      });
      if (res.data.status === 1) {
        fetchHabits(); // refresh from backend
      } else {
        message.error(res.data.message || "Failed to update habit");
      }
    } catch (err) {
      message.error("Failed to update habit");
    }
  };

  // Updated handleAddHabit function - removed target field and fixed form reset
  const handleAddHabit = async () => {
    try {
      const payload = {
        habit: {
          userId,
          addedBy: userId,
          name: newHabit.name,
          description: newHabit.description,
        },
      };
      const res = await addHabit(payload);
      if (res.data.status === 1) {
        message.success("Habit added!");
        fetchHabits();
        setHabitModalOpen(false);
        // Reset form after successful addition
        setNewHabit({ name: "", description: "", frequency: "daily" });
        setEditingHabit(null);
      } else {
        message.error(res.data.message || "Failed to add habit");
      }
    } catch (err) {
      message.error("Failed to add habit");
    }
  };

  // Updated function to handle opening add habit modal with form reset
  const handleOpenAddHabitModal = () => {
    setEditingHabit(null);
    setNewHabit({ name: "", description: "", frequency: "daily" });
    setHabitModalOpen(true);
  };

  // Delete Functions
  const handleDeleteGoal = async (goalId: string) => {
    console.log("Deleting goal with ID:", goalId);
    setLoading(true);
    try {
      const response = await deleteWeeklyGoal({ id: goalId });
      const { status, message: msg } = response.data;

      if (status) {
        message.success("Goal deleted successfully");
        await fetchAllPlannerData();
      } else {
        message.error(msg || "Failed to delete goal");
      }
    } catch (error) {
      console.error("Delete goal error:", error);
      message.error("Failed to delete goal");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    // console.log("🚀 ~ handleDeleteTodo ~ todoId:", todoId);
    setLoading(true);
    try {
      const response = await deleteWeeklyTodo({ id: todoId });
      const { status, message: msg } = response.data;

      if (status) {
        message.success("Todo deleted successfully");
        await fetchAllPlannerData();
      } else {
        message.error(msg || "Failed to delete todo");
      }
    } catch (error) {
      console.error("Error deleting todo:", error);
      message.error("Failed to delete todo");
    } finally {
      setLoading(false);
    }
  };

  // Combined Share Functions
  const handleShareGoal = async (goal: any, email: string) => {
    setLoading(true);
    try {
      const payload = {
        email: [email],
        goal: {
          title: goal.text,
          date: goal.date,
          time: goal.time,
          completed: goal.completed,
        },
      };

      const response = await shareGoal(payload);
      const { status, message: msg } = response.data;

      if (status) {
        message.success("Goal shared successfully!");
      } else {
        message.error(msg || "Failed to share goal");
      }
    } catch (error) {
      console.error("Share goal error:", error);
      message.error("Something went wrong while sharing goal");
    } finally {
      setLoading(false);
    }
  };

  const handleTagGoal = async (goal: any, emails: string[]) => {
    setLoading(true);
    try {
      await shareGoal({
        email: emails,
        goal: {
          id: goal.id,
          title: goal.text,
          date: goal.date,
          time: goal.time,
          completed: goal.completed,
        },
        tagged_members: emails,
      });
      message.success("Goal shared successfully!");
    } catch (err) {
      message.error("Failed to share goal.");
    } finally {
      setLoading(false);
    }
  };

  const handleShareTodo = async (todo: any, email: string) => {
    setLoading(true);
    try {
      const payload = {
        email: [email],
        todo: {
          title: todo.text,
          date: todo.date,
          time: todo.time,
          priority: todo.priority,
          completed: todo.completed,
        },
      };

      const response = await shareTodo(payload);
      const { status, message: msg } = response.data;

      if (status) {
        message.success("Task shared successfully!");
      } else {
        message.error(msg || "Failed to share todo");
      }
    } catch (error) {
      console.error("Share todo error:", error);
      message.error("Something went wrong while sharing todo");
    } finally {
      setLoading(false);
    }
  };

  const handleTagTask = async (task: any, emails: string[]) => {
    setLoading(true);
    try {
      const payload = {
        email: emails,
        tagged_members: emails,
        todo: {
          id: task.id,
          title: task.text,
          date: task.date,
          time: task.time,
          priority: task.priority,
          completed: task.completed,
        },
      };

      const response = await shareTodo(payload);
      const { status, message: msg } = response.data;

      if (status) {
        message.success("Task shared successfully!");
      } else {
        message.error(msg || "Failed to share task.");
      }
    } catch (err) {
      message.error("Failed to share task.");
      console.error("Task tag error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Statistics calculations
  const filteredGoalsData = getFilteredGoals();
  const filteredTodosData = getFilteredTodos();
  const completedGoals = filteredGoalsData.filter((g) => g.completed).length;
  const completedTodos = filteredTodosData.filter((t) => t.completed).length;
  const totalProjects = projects.length;
  const completedProjects = projects.filter((p) => p.progress === 100).length;
  const totalEvents = getFilteredCalendarEvents().length;

  const handleEditNote = (note: {
    id: string;
    title: string;
    description: string;
  }) => {
    noteForm.setFieldsValue({
      title: note.title,
      description: note.description,
    });
    setEditingNote(note);
    setIsNoteModalVisible(true);
  };

  const publicProjects = projects.filter((p) => p.visibility === "public");

  const filteredProjects = projects.filter((proj) => proj.source === "planner");


  const getAvailableGoals = () => {
    return getFilteredGoals();
  };

  const handleAddEvent = () => {
    setLoading(true);
    eventForm
      .validateFields()
      .then(async (values) => {
        try {
          const payload = {
            is_all_day: false,
            title: values.title,
            date: values.date.format("YYYY-MM-DD"),
            start_time: values.time.format("h:mm A"),
            end_time: values.time.add(1, "hour").format("h:mm A"), // give default 1h
            location: "",
            description: "",
          };
          const response = await addEvent(payload);
          const { message: msg, status } = response.data;

          if (status) {
            showNotification("Success", msg, "success");
          } else {
            showNotification("Error", msg, "error");
          }

          setIsEventModalVisible(false);
          await fetchAllPlannerData();
          eventForm.resetFields();
        } catch (err) {
          showNotification("Error", "Something went wrong", "error");
        } finally {
          setLoading(false);
        }
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const handleAddProjects = async (project: {
    title: string;
    description: string;
    due_date: string;
    visibility: "public" | "private";
  }) => {
    // If project is public and user has multiple family groups, show family selector
    if (project.visibility === "public" && familyGroups.length > 1) {
      setPendingProject({
        ...project,
        source: "planner",
        meta: {
          visibility: project.visibility
        }
      });
      setSelectedFamilyGroupsForProject([]);
      // Show modal for family group selection (we'll need to add this modal)
      message.info("Please select family groups for this project");
    } else {
      // Private project or single family group, proceed directly
      setLoading(true);
      try {
        const projectData: any = {
          ...project,
          source: "planner",
          meta: {
            visibility: project.visibility
          }
        };

        // For public projects with single family group, include it
        if (project.visibility === "public" && familyGroups.length === 1) {
          projectData.family_groups = [familyGroups[0].id];
        }

        await addProject(projectData);
        message.success("Project added");
        fetchProjects();
      } catch {
        message.error("Failed to add project");
      }
      setLoading(false);
    }
  };

  const handleAddTask = async (
    projectId: string,
    taskData?: { title: string; due_date: string; assignee?: string }
  ) => {
    if (!taskData) return;
    setLoading(true);
    try {
      await addTask({
        project_id: projectId,
        title: taskData.title,
        assignee: taskData.assignee || "All",
        type: "low",
        due_date: taskData.due_date,
        completed: false,
      });
      fetchProjects();
    } catch {
      message.error("Failed to add task");
    }
    setLoading(false);
  };

  const handleDeleteTask = async (projectId: string, taskId: number) => {
    setLoading(true);
    try {
      await DeleteTask({ id: taskId }); // call your API
      await fetchProjects(); // refresh projects & tasks
      message.success("Task deleted");
    } catch {
      message.error("Failed to delete task");
    }
    setLoading(false);
  };

  const handleDeleteProject = async (projectId: string) => {
    setLoading(true);
    try {
      await deleteProjects({ id: projectId }); // call API
      await fetchProjects(); // refresh list
      message.success("Project deleted");
    } catch {
      message.error("Failed to delete project");
    }
    setLoading(false);
  };

  const handleToggleTask = async (projectId: string, taskId: number) => {
    setLoading(true);
    const project = projects.find((p) => p.id === projectId);
    const task = project?.tasks.find((t) => t.id === taskId);
    if (!task) return;

    try {
      await updateTask({ id: taskId, completed: !task.completed });
      fetchProjects();
    } catch {
      message.error("Failed to toggle task");
    }
    setLoading(false);
  };

  const handleUpdateTask = (task: Task): void => {
    setLoading(true);
    updateTask({
      id: task.id,
      title: task.title,
      due_date: task.dueDate,
      assignee: task.assignee,
      type: task.type,
    })
      .then(() => {
        message.success("Task updated");
        fetchProjects();
      })
      .catch(() => {
        message.error("Failed to update task");
      });
    setLoading(false);
  };

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const projRes = await getProjects({ source: "planner" });
      const rawProjects = projRes.data.payload.projects || [];

      const projectsWithTasks = await Promise.all(
        rawProjects.map(async (proj: any) => {
          const taskRes = await getTasks({ project_id: proj.id });
          const rawTasks = taskRes.data.payload.tasks || [];

          const tasks = rawTasks.map(
            (task: any, i: number): Task => ({
              id:
                typeof task.id === "number"
                  ? task.id
                  : parseInt(task.id) || i + 1,
              title: task.title,
              assignee: task.assignee,
              type: task.type,
              completed: task.completed,
              due: task.completed
                ? "Completed"
                : `Due ${dayjs(task.due_date).format("MMM D")}`,
              dueDate: task.due_date ? String(task.due_date) : "",
              timeSpent: task.timeSpent || 0,
              estimatedTime: task.estimatedTime || 60,
            })
          );

          return {
            id: proj.id,
            title: proj.title,
            description: proj.description,
            due_date: proj.due_date,
            color: proj.color || COLORS.accent,
            progress: tasks.length
              ? Math.round(
                  (tasks.filter((t: Task) => t.completed).length /
                    tasks.length) *
                    100
                )
              : 0,
            tasks,
            visibility: proj.meta?.visibility || "public",
            source: proj.source || "",
            timeSpent: tasks.reduce(
              (acc: number, task: Task) => acc + (task.timeSpent || 0),
              0
            ),
            estimatedTime: tasks.reduce(
              (acc: number, task: Task) => acc + (task.estimatedTime || 0),
              0
            ),
            created_by: proj.created_by,
            creator_name: proj.creator_name,
            family_groups: proj.family_groups || [],
          };
        })
      );

      setProjects(projectsWithTasks);
    } catch (err) {
      // Handle error
    }
    setLoading(false);
  }, [setLoading]);

  const getDueDateByView = (activeView: string, activeDate: Date) => {
    const formatted = (date: Date) => dayjs(date).format("YYYY-MM-DD");

    const getWeekEndDate = () => {
      const day = activeDate.getDay();
      const diff = 6 - day;
      const weekend = new Date(activeDate);
      weekend.setDate(activeDate.getDate() + diff);
      return formatted(weekend);
    };

    const getMonthEndDate = () => {
      const year = activeDate.getFullYear();
      const month = activeDate.getMonth();
      return formatted(new Date(year, month + 1, 0));
    };

    const getYearEndDate = () => {
      const year = activeDate.getFullYear();
      return formatted(new Date(year, 11, 31));
    };

    switch (activeView) {
      case "Day":
        return formatted(activeDate);
      case "Week":
        return getWeekEndDate();
      case "Month":
        return getMonthEndDate();
      case "Year":
        return getYearEndDate();
      default:
        return getWeekEndDate();
    }
  };

  const handleAddGoal = async () => {
    setLoading(true);
    goalForm.validateFields().then(async (values) => {
      try {
        const formattedDate = dayjs(values.date).format("YYYY-MM-DD");
        const time = dayjs().format("h:mm A");

        const goalPayload = {
          ...values,
          date: formattedDate,
          time,
          backup: backup,
        };

        let response;
        if (editingGoal) {
          response = await updateWeeklyGoal({
            id: editingGoal.id,
            ...goalPayload,
          });
        } else {
          response = await addWeeklyGoal(goalPayload);
        }
        const { message: msg, status } = response.data;
        const prefix =
          view === "Day"
            ? "Daily"
            : view === "Month"
            ? "Monthly"
            : view === "Year"
            ? "Yearly"
            : "Weekly";

        const fullMessage = status
          ? `${prefix} ${
              editingGoal ? "goal updated" : "goal added"
            } successfully`
          : msg;
        showNotification(
          status ? "Success" : "Error",
          fullMessage,
          status ? "success" : "error"
        );
        await fetchAllPlannerData();
        setIsGoalModalVisible(false);
        setEditingGoal(null);
        goalForm.resetFields();
      } catch (error) {
        showNotification("Error", "Something went wrong", "error");
      } finally {
        setLoading(false);
      }
    });
  };

  // Single comprehensive fetch function - UPDATED to reset account filter when family group changes
  const fetchAllPlannerData = useCallback(
    async (
      preserveView: boolean = false,
      preservedDate: Date | null = null
    ) => {
      setLoading(true);
      try {
        // Determine filter parameters
        const show_dockly = true; // Always show Dockly data
        const show_google = connectedAccounts.length > 0; // Show Google if accounts connected

        // Convert account IDs back to emails for backend compatibility
        const filtered_emails =
          filteredAccountIds.length > 0
            ? filteredAccountIds.map((id) => id.split("-")[0]) // Extract email from account ID
            : undefined;

        // Include family_group_id parameter if selected - THIS IS THE KEY FIX
        const params: any = {
          show_dockly,
          show_google,
          filtered_emails,
        };

        // IMPORTANT: Only include family_group_id if one is selected
        if (selectedFamilyGroup) {
          params.family_group_id = selectedFamilyGroup;
        }

        const response = await getAllPlannerData(params);

        const payload = response.data.payload;

        // Process goals
        const rawGoals = payload.goals || [];
        const formattedGoals = rawGoals.map((item: any) => ({
          id: item.id,
          text: item.goal,
          completed: item.completed ?? item.goal_status === 2,
          date: dayjs(item.date).format("YYYY-MM-DD"),
          time: dayjs(item.time, ["h:mm A", "HH:mm"]).format("h:mm A"),
        }));
        setGoals(formattedGoals);

        // Process todos
        const rawTodos = payload.todos || [];
        const formattedTodos = rawTodos.map((item: any) => ({
          id: item.id,
          text: item.text,
          completed: item.completed ?? false,
          priority: item.priority || "medium",
          date: dayjs(item.date).format("YYYY-MM-DD"),
          time: dayjs(item.time, ["h:mm A", "HH:mm"]).format("h:mm A"),
          goal_id: item.goal_id,
        }));
        setTodos(formattedTodos);

        // Process events
        const rawEvents = payload.events || [];

        // Deduplicate: prefer Dockly over Google
        const deduplicateEvents = (events: any[]) => {
          const normalizeKey = (e: any) => {
            const title = e.summary || e.text || e.goal || e.title || "";
            const cleanTitle = title.toLowerCase().trim();

            // Use YYYY-MM-DD as date key
            const date =
              e.start?.dateTime?.split("T")[0] ||
              (e.date ? dayjs(e.date).format("YYYY-MM-DD") : "");

            return `${cleanTitle}-${date}`;
          };

          // collect Dockly keys
          const docklyKeys = new Set(
            events
              .filter((e) => e.provider === "dockly")
              .map((e) => normalizeKey(e))
          );

          return events.filter((e) => {
            if (e.provider === "google") {
              const key = normalizeKey(e);
              return !docklyKeys.has(key);
            }
            return true;
          });
        };

        const filteredEvents = deduplicateEvents(rawEvents);
        setCalendarEvents(transformEvents(filteredEvents));

        // Process connected accounts
        const connectedAccountsData = payload.connected_accounts || [];

        // Only update if actually different to prevent infinite loops
        if (
          JSON.stringify(connectedAccountsData) !==
          JSON.stringify(connectedAccounts)
        ) {
          setConnectedAccounts(connectedAccountsData);
        }

        // Set up person colors
        const newPersonColors: {
          [key: string]: { color: string; email: string };
        } = {};
        connectedAccountsData.forEach((account: any) => {
          const colorToUse =
            account.provider === "dockly" ? PRIMARY_COLOR : account.color;
          newPersonColors[account.userName] = {
            color: colorToUse,
            email: account.email,
          };
        });
        setPersonColors(newPersonColors);

        // Set backup email
        if (connectedAccountsData.length > 0) {
          setBackup(connectedAccountsData[0].email);
        }

        // Process notes
        const rawNotes = payload.notes || [];
        setNotes(rawNotes);

        // Process family members - FILTERED BY FAMILY GROUP
        const rawFamilyMembers = payload.family_members || [];
        setFamilyMembers(rawFamilyMembers);

        // FIXED: Update filtered account IDs to include all accounts from the current family group
        if (connectedAccountsData.length > 0) {
          const allAccountIds = connectedAccountsData.map((acc: any) =>
            createAccountIdentifier(acc)
          );
          // Only reset if currently empty or if we want to show all accounts
          if (filteredAccountIds.length === 0) {
            setFilteredAccountIds(allAccountIds);
          }
        }

        // Show connect modal if no Google accounts connected
        if (
          connectedAccountsData.filter((acc: any) => acc.provider === "google")
            .length === 0
        ) {
          setIsConnectAccountModalVisible(true);
        }

        if (preservedDate) {
          setCurrentDate(preservedDate);
        }
      } catch (error) {
        console.error("Error fetching planner data:", error);
        message.error("Failed to load planner data");
      } finally {
        setLoading(false);
      }
    },
    [setLoading, connectedAccounts, filteredAccountIds, selectedFamilyGroup] // Keep selectedFamilyGroup dependency
  );

  const handleAddTodo = () => {
    setLoading(true);
    todoForm.validateFields().then(async (values) => {
      try {
        const formattedDate = dayjs(values.date).format("YYYY-MM-DD");
        const time = dayjs().format("h:mm A");

        const todoPayload = {
          ...values,
          date: formattedDate,
          time,
          backup: backup,
        };

        let response;
        if (editingTodo) {
          response = await updateWeeklyTodo({
            id: editingTodo.id,
            ...todoPayload,
          });
        } else {
          response = await addWeeklyTodo(todoPayload);
        }

        const { status, message: backendMsg } = response.data;

        const prefix =
          view === "Day"
            ? "Daily"
            : view === "Month"
            ? "Monthly"
            : view === "Year"
            ? "Yearly"
            : "Weekly";

        const action = editingTodo ? "task updated" : "task added";
        const msg = status ? `${prefix} ${action} successfully` : backendMsg;

        showNotification(
          status ? "Success" : "Error",
          msg,
          status ? "success" : "error"
        );
        await fetchAllPlannerData();
        setIsTodoModalVisible(false);
        setEditingTodo(null);
        todoForm.resetFields();
      } catch (error) {
        showNotification("Error", "Something went wrong", "error");
      } finally {
        setLoading(false);
      }
    });
  };

  const transformEvents = (rawEvents: any[]): any[] => {
    return rawEvents.map((event, index) => {
      // Attempt to extract standard Google Calendar fields
      const startDateTime = event.start?.dateTime ?? null;
      const endDateTime = event.end?.dateTime ?? null;
      const startDate = event.start?.date ?? null;
      const endDate = event.end?.date ?? null;
      const creatorEmail =
        event.creator?.email || event.source_email || "Unknown";
      const isGoogleEvent = event.kind === "calendar#event";

      // Fallback: if manual event was added via Planner modal
      const manualDate = event.date;
      const manualTime = event.time;

      // Determine start
      const start = startDateTime
        ? dayjs(startDateTime)
        : startDate
        ? dayjs(startDate)
        : manualDate
        ? dayjs(`${manualDate} ${manualTime || "00:00"}`)
        : null;

      // Determine end
      let end: dayjs.Dayjs | null = null;
      if (endDateTime) {
        end = dayjs(endDateTime);
      } else if (endDate) {
        end = isGoogleEvent
          ? dayjs(endDate).subtract(1, "day") // Google all-day events end on the *next* day
          : dayjs(endDate);
      } else if (start) {
        end = start.add(1, "hour");
      }

      const formattedStart = start?.format("YYYY-MM-DD") ?? "";
      const formattedEnd = end?.format("YYYY-MM-DD") ?? "";
      const isAllDay = formattedStart !== formattedEnd;

      return {
        id: event.id || index.toString(),
        title: event.summary || event.title || "Untitled Event",
        startTime: isAllDay
          ? "12:00 AM"
          : start?.format("hh:mm A") ?? "12:00 AM",
        endTime: isAllDay ? "11:59 PM" : end?.format("hh:mm A") ?? "11:59 PM",
        date: formattedStart || "N/A",
        person: creatorEmail.split("@")[0],
        color: event.account_color || event.color || COLORS.accent,
        is_all_day: isAllDay,
        start_date: formattedStart,
        end_date: formattedEnd,
        source_email: event.source_email || creatorEmail,
        provider: event.provider,
        type: event.type || "event",
      };
    });
  };

  // Initialize data on mount
  useEffect(() => {
    fetchFamilyGroups();
    fetchProjects();
    fetchMembers();
    fetchAllPlannerData();
    // fetchWeeklyGoals();
    // fetchWeeklyTodo();
  }, []);

  // Fetch planner data when family group changes - FIXED to include fetchMembers
  useEffect(() => {
    if (selectedFamilyGroup !== null) {
      fetchAllPlannerData();
      fetchMembers(); // Also refresh members when family group changes
    }
  }, [selectedFamilyGroup]); // Remove fetchAllPlannerData from dependencies to avoid infinite loop

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  const fetchMembers = async () => {
    try {
      const params: any = {};
      if (selectedFamilyGroup) {
        params.family_group_id = selectedFamilyGroup;
      }
      const res = await getUsersFamilyMembers(params);
      if (res?.payload?.members) {
        // Remove 'me' from the dropdown list
        const filtered = res.payload.members.filter(
          (m: any) => m.relationship !== "me"
        );
        setFamilyMembers(filtered);
      }
    } catch (err) {
      console.error("Failed to fetch family members", err);
    }
  };

  const handleToggleTodo = async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    const updatedCompleted = !todo.completed;

    try {
      // Optimistically update the UI
      setTodos((prevTodos) =>
        prevTodos.map((t) =>
          t.id === id ? { ...t, completed: updatedCompleted } : t
        )
      );

      // Send update to backend
      await updateWeeklyTodo({
        id: todo.id,
        uid: userId,
        text: todo.text,
        date: todo.date,
        time: todo.time,
        priority: todo.priority,
        goal_id: todo.goal_id,
        completed: updatedCompleted,
        sync_to_google: false,
      });
    } catch (err) {
      // Revert UI on failure
      setTodos((prevTodos) =>
        prevTodos.map((t) =>
          t.id === id ? { ...t, completed: !updatedCompleted } : t
        )
      );
      showNotification("Error", "Failed to update todo status", "error");
    }
  };

  const handleEditGoal = (goal: any) => {
    setEditingGoal(goal);
    goalForm.setFieldsValue({
      goal: goal.text,
      date: dayjs(goal.date),
      time: dayjs(goal.time, "h:mm A"),
    });
    setIsGoalModalVisible(true);
  };

  const handleEditTodo = (todo: any) => {
    setEditingTodo(todo);
    todoForm.setFieldsValue({
      text: todo.text,
      priority: todo.priority,
      date: dayjs(todo.date),
      time: dayjs(todo.time, "h:mm A"),
      goal_id: todo.goal_id,
    });
    setIsTodoModalVisible(true);
  };

  const handleDateSelect = (date: Date) => {
    setCurrentDate(date);
    setSelectedDate(dayjs(date).format("YYYY-MM-DD"));
  };

  const handleMiniCalendarMonthChange = (date: Date) => {
    setCurrentDate(date);
    setSelectedDate(dayjs(date).format("YYYY-MM-DD"));
  };

  const handleMainCalendarDateChange = (date: Date) => {
    setCurrentDate(date);
    setSelectedDate(dayjs(date).format("YYYY-MM-DD"));
  };

  const filteredGoalsData2 = getFilteredGoals();
  const filteredTodosData2 = getFilteredTodos();
  const filteredCalendarEvents = getFilteredCalendarEvents();
  const maxItems = view === "Day" ? 2 : 3;
  
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: COLORS.background,
        marginTop: "50px",
        fontFamily: FONT_FAMILY,
      }}
    >
      <div
        style={{
          padding: SPACING.lg,
          backgroundColor: COLORS.background,
          minHeight: "100vh",
        }}
      >
        <PlannerTitle
          connectedAccounts={connectedAccounts}
          onFilterChange={handleAccountFilterChange}
          onConnectAccount={handleConnectAccount}
          familyGroups={familyGroups}
          selectedFamilyGroup={selectedFamilyGroup}
          onFamilyGroupChange={handleFamilyGroupChange}
          showFamilySelector={showFamilySelector}
        />

        <Row
          gutter={[SPACING.sm, SPACING.sm]}
          style={{ marginBottom: SPACING.sm }}
        >
          <Col span={17}>
            <div
              style={{
                background: COLORS.surface,
                borderRadius: "16px",
                border: `1px solid ${COLORS.borderLight}`,
                boxShadow: `0 4px 16px ${COLORS.shadowLight}`,
                overflow: "hidden",
              }}
            >
              <CustomCalendar
                data={{ events: filteredCalendarEvents, meals: [] }}
                personColors={personColors}
                source="planner"
                allowMentions={true}
                fetchEvents={fetchAllPlannerData}
                view={view}
                onViewChange={setView}
                goals={filteredGoalsData2}
                todos={filteredTodosData2}
                onToggleTodo={handleToggleTodo}
                onAddGoal={() => setIsGoalModalVisible(true)}
                onAddTodo={() => setIsTodoModalVisible(true)}
                enabledHashmentions={true}
                currentDate={currentDate}
                onDateChange={handleMainCalendarDateChange}
                setCurrentDate={setCurrentDate}
                setBackup={setBackup}
                backup={backup}
                connectedAccounts={connectedAccounts || []}
                familyMembers={familyMembers}
              />
            </div>
          </Col>
          <Col span={7}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: SPACING.sm,
              }}
            >
              <div
                style={{
                  background: COLORS.surface,
                  borderRadius: "14px",
                  border: `1px solid ${COLORS.borderLight}`,
                  boxShadow: `0 4px 16px ${COLORS.shadowLight}`,
                  overflow: "hidden",
                }}
              >
                <MiniCalendar
                  currentDate={currentDate}
                  onDateSelect={handleDateSelect}
                  onMonthChange={handleMiniCalendarMonthChange}
                  events={filteredCalendarEvents}
                  view={view}
                />
              </div>
              {view === "Day" && (
                <div
                  style={{
                    background: COLORS.surface,
                    borderRadius: "14px",
                    border: `1px solid ${COLORS.borderLight}`,
                    boxShadow: `0 4px 16px ${COLORS.shadowLight}`,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: SPACING.lg,
                      borderBottom: `1px solid ${COLORS.borderLight}`,
                      cursor: "pointer",
                      background: COLORS.surfaceElevated,
                    }}
                    onClick={() =>
                      expandedSection === "habits"
                        ? setExpandedSection(null)
                        : setExpandedSection("habits")
                    }
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
                          width: "32px",
                          height: "32px",
                          background: `linear-gradient(135deg, ${COLORS.habit}, ${COLORS.habit}dd)`,
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: `0 2px 8px ${COLORS.habit}20`,
                          fontSize: "18px",
                        }}
                      >
                        <FireOutlined style={{ color: "white" }} />
                      </div>
                      <Text
                        strong
                        style={{
                          fontSize: "14px",
                          color: COLORS.text,
                          fontFamily: FONT_FAMILY,
                        }}
                      >
                        Daily Habits
                      </Text>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: SPACING.xs,
                      }}
                    >
                      <Button
                        type="primary"
                        size="small"
                        icon={<PlusOutlined />}
                        style={{
                          backgroundColor: COLORS.accent,
                          borderColor: COLORS.accent,
                          borderRadius: "6px",
                          width: "28px",
                          height: "28px",
                          padding: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        onClick={handleOpenAddHabitModal}
                      />
                      <span
                        style={{
                          fontSize: "12px",
                          color: COLORS.textSecondary,
                          transform:
                            expandedSection === "habits"
                              ? "rotate(180deg)"
                              : "rotate(0deg)",
                          transition: "transform 0.2s ease",
                        }}
                      >
                        ▼
                      </span>
                    </div>
                  </div>
                  {expandedSection === "habits" && (
                    <div
                      style={{
                        padding: SPACING.lg,
                        maxHeight: "147px",
                        overflowY: "auto",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      <HabitTracker
                        habits={habits}
                        onToggleHabit={handleToggleHabit}
                        selectedDate={selectedDate}
                        onAddHabit={handleOpenAddHabitModal}
                        onEditHabit={handleEditHabit}
                        onDeleteHabit={handleDeleteHabit}
                      />
                    </div>
                  )}
                </div>
              )}
              <div
                style={{
                  background: COLORS.surface,
                  borderRadius: "14px",
                  border: `1px solid ${COLORS.borderLight}`,
                  boxShadow: `0 4px 16px ${COLORS.shadowLight}`,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: SPACING.lg,
                    borderBottom: `1px solid ${COLORS.borderLight}`,
                    cursor: "pointer",
                    background: COLORS.surfaceElevated,
                  }}
                  onClick={() =>
                    expandedSection === "goals"
                      ? setExpandedSection(null)
                      : setExpandedSection("goals")
                  }
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
                        width: "32px",
                        height: "32px",
                        background: `linear-gradient(135deg, ${COLORS.success}, ${COLORS.success}dd)`,
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: `0 2px 8px ${COLORS.success}20`,
                      }}
                    >
                      <TrophyOutlined
                        style={{ color: "white", fontSize: "16px" }}
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: SPACING.xs,
                      }}
                    >
                      <Text
                        strong
                        style={{
                          fontSize: "14px",
                          color: COLORS.text,
                          fontFamily: FONT_FAMILY,
                        }}
                      >
                        {getViewTitle("Goals")}
                      </Text>
                      <Badge
                        count={`${filteredGoalsData2.length}`}
                        style={{
                          backgroundColor: COLORS.success,
                          fontSize: "10px",
                          fontWeight: 500,
                        }}
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: SPACING.xs,
                    }}
                  >
                    <Button
                      type="primary"
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsGoalModalVisible(true);
                      }}
                      style={{
                        backgroundColor: COLORS.accent,
                        borderColor: COLORS.accent,
                        borderRadius: "6px",
                        width: "28px",
                        height: "28px",
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "12px",
                        color: COLORS.textSecondary,
                        transform:
                          expandedSection === "goals"
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                        transition: "transform 0.2s ease",
                      }}
                    >
                      ▼
                    </span>
                  </div>
                </div>
                {expandedSection === "goals" && (
                  <div
                    style={{
                      padding: SPACING.lg,
                      maxHeight: view === "Day" ? "147px" : "223px",
                      overflowY: "auto",
                      fontFamily: FONT_FAMILY,
                    }}
                  >
                    {[
                      ...filteredGoalsData2,
                      ...Array(
                        Math.max(maxItems, filteredGoalsData2.length + 1) -
                          filteredGoalsData2.length
                      ).fill({}),
                    ].map((goal, index) => (
                      <div
                        key={goal.id || `empty-goal-${index}`}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          padding: SPACING.lg,
                          backgroundColor: COLORS.surfaceSecondary,
                          borderRadius: "8px",
                          border: goal?.id
                            ? `1px solid ${COLORS.success}20`
                            : `2px dashed ${COLORS.borderMedium}`,
                          marginBottom: SPACING.sm,
                          transition: "all 0.2s ease",
                        }}
                      >
                        <div
                          style={{
                            width: "22px",
                            height: "20px",
                            backgroundColor: goal?.id
                              ? COLORS.success
                              : COLORS.borderMedium,
                            color: goal?.id
                              ? COLORS.surface
                              : COLORS.textSecondary,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "11px",
                            fontWeight: 600,
                            marginRight: SPACING.xs,
                            flexShrink: 0,
                          }}
                        >
                          {goal?.completed ? "✓" : index + 1}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          {goal?.id ? (
                            <>
                              <div
                                style={{
                                  fontSize: "13px",
                                  fontWeight: 500,
                                  color: goal.completed
                                    ? COLORS.textSecondary
                                    : COLORS.text,
                                  textDecoration: goal.completed
                                    ? "line-through"
                                    : "none",
                                  marginBottom: SPACING.xs,
                                  wordBreak: "break-word",
                                  lineHeight: "1.3",
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  maxHeight: "2.6em",
                                  fontFamily: FONT_FAMILY,
                                }}
                                title={goal.text}
                              >
                                {goal.text}
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <Text
                                  style={{
                                    fontSize: "11px",
                                    color: COLORS.textSecondary,
                                    fontWeight: 500,
                                    fontFamily: FONT_FAMILY,
                                  }}
                                >
                                  {goal.date}
                                </Text>
                                {goal?.id && (
                                  <Dropdown
                                    menu={{
                                      items: [
                                        {
                                          key: "edit",
                                          label: "Edit",
                                          icon: <EditOutlined />,
                                          onClick: () => handleEditGoal(goal),
                                        },
                                        {
                                          key: "shareTag",
                                          label: "Share",
                                          icon: <ShareAltOutlined />,
                                          onClick: () => {
                                            setSharingGoal(goal);
                                            setIsGoalShareTagModalVisible(true);
                                          },
                                        },
                                        {
                                          key: "delete",
                                          label: (
                                            <Popconfirm
                                              title="Delete Goal"
                                              description="Are you sure you want to delete this goal?"
                                              okText="Delete"
                                              okType="danger"
                                              cancelText="Cancel"
                                              onConfirm={() =>
                                                handleDeleteGoal(goal.id)
                                              }
                                            >
                                              <span style={{ color: "red" }}>
                                                <DeleteOutlined /> Delete
                                              </span>
                                            </Popconfirm>
                                          ),
                                          danger: true,
                                        },
                                      ],
                                    }}
                                    trigger={["click"]}
                                    placement="bottomRight"
                                  >
                                    <Button
                                      type="text"
                                      size="small"
                                      icon={<MoreOutlined />}
                                      style={{
                                        fontSize: "10px",
                                        color: COLORS.textSecondary,
                                        padding: "2px 4px",
                                        borderRadius: "4px",
                                        width: "20px",
                                        height: "20px",
                                      }}
                                    />
                                  </Dropdown>
                                )}
                              </div>
                            </>
                          ) : (
                            <Text
                              style={{
                                color: COLORS.textTertiary,
                                fontStyle: "italic",
                                fontSize: "13px",
                                cursor: "pointer",
                                fontWeight: 500,
                                fontFamily: FONT_FAMILY,
                              }}
                              onClick={() => setIsGoalModalVisible(true)}
                            >
                              Add Goal {index + 1}
                            </Text>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div
                style={{
                  background: COLORS.surface,
                  borderRadius: "14px",
                  border: `1px solid ${COLORS.borderLight}`,
                  boxShadow: `0 4px 16px ${COLORS.shadowLight}`,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: SPACING.lg,
                    borderBottom: `1px solid ${COLORS.borderLight}`,
                    cursor: "pointer",
                    background: COLORS.surfaceElevated,
                  }}
                  onClick={() =>
                    setExpandedSection(
                      expandedSection === "todos" ? null : "todos"
                    )
                  }
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
                        width: "32px",
                        height: "32px",
                        background: `linear-gradient(135deg, ${COLORS.warning}, ${COLORS.warning}dd)`,
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: `0 2px 8px ${COLORS.warning}20`,
                      }}
                    >
                      <CheckSquareOutlined
                        style={{ color: "white", fontSize: "16px" }}
                      />
                    </div>
                    <div>
                      <Text
                        strong
                        style={{
                          fontSize: "14px",
                          color: COLORS.text,
                          fontFamily: FONT_FAMILY,
                        }}
                      >
                        {getViewTitle("Tasks")}
                      </Text>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: SPACING.xs,
                          marginTop: "2px",
                        }}
                      >
                        <Badge
                          count={`${completedTodos}/${filteredTodosData2.length}`}
                          style={{
                            backgroundColor: COLORS.warning,
                            fontSize: "10px",
                            fontWeight: 500,
                          }}
                        />
                        {filteredTodosData2.length > 0 && (
                          <Progress
                            percent={Math.round(
                              (completedTodos / filteredTodosData2.length) * 100
                            )}
                            strokeColor={COLORS.warning}
                            trailColor={COLORS.borderLight}
                            showInfo={false}
                            strokeWidth={3}
                            style={{ width: "40px" }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: SPACING.xs,
                    }}
                  >
                    <Button
                      type="primary"
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsTodoModalVisible(true);
                      }}
                      style={{
                        backgroundColor: COLORS.accent,
                        borderColor: COLORS.accent,
                        borderRadius: "6px",
                        width: "28px",
                        height: "28px",
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "12px",
                        color: COLORS.textSecondary,
                        transform:
                          expandedSection === "todos"
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                        transition: "transform 0.2s ease",
                      }}
                    >
                      ▼
                    </span>
                  </div>
                </div>
                {expandedSection === "todos" && (
                  <div
                    style={{
                      padding: SPACING.lg,
                      maxHeight: view === "Day" ? "147px" : "223px",
                      overflowY: "auto",
                      fontFamily: FONT_FAMILY,
                    }}
                  >
                    {[
                      ...filteredTodosData2,
                      ...Array(
                        Math.max(3, filteredTodosData2.length + 1) -
                          filteredTodosData2.length
                      ).fill({}),
                    ].map((todo, index) => (
                      <div
                        key={todo.id || `empty-todo-${index}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          padding: SPACING.lg,
                          backgroundColor: COLORS.surfaceSecondary,
                          borderRadius: "8px",
                          border: todo?.id
                            ? `1px solid ${getPriorityColor(todo.priority)}20`
                            : `2px dashed ${COLORS.borderMedium}`,
                          marginBottom: SPACING.sm,
                          transition: "all 0.2s ease",
                        }}
                      >
                        {todo?.id ? (
                          <>
                            <Checkbox
                              checked={todo.completed}
                              onChange={() => handleToggleTodo(todo.id)}
                              style={{
                                marginRight: SPACING.xs,
                                transform: "scale(0.9)",
                              }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div
                                style={{
                                  fontSize: "13px",
                                  fontWeight: 500,
                                  color: todo.completed
                                    ? COLORS.textSecondary
                                    : COLORS.text,
                                  textDecoration: todo.completed
                                    ? "line-through"
                                    : "none",
                                  marginBottom: SPACING.xs,
                                  wordBreak: "break-word",
                                  lineHeight: 1.3,
                                  fontFamily: FONT_FAMILY,
                                }}
                              >
                                {todo.text}
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <Text
                                  style={{
                                    fontSize: "11px",
                                    color: COLORS.textSecondary,
                                    fontWeight: 500,
                                    fontFamily: FONT_FAMILY,
                                  }}
                                >
                                  {todo.date}
                                </Text>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: SPACING.xs,
                                  }}
                                >
                                  <Tag
                                    color={getPriorityColor(todo.priority)}
                                    style={{
                                      fontSize: "9px",
                                      fontWeight: 600,
                                      padding: "1px 4px",
                                      borderRadius: "3px",
                                      fontFamily: FONT_FAMILY,
                                      lineHeight: "1",
                                      minWidth: "35px",
                                      textAlign: "center",
                                    }}
                                  >
                                    {getPriorityText(todo.priority)}
                                  </Tag>
                                  <Dropdown
                                    menu={{
                                      items: [
                                        {
                                          key: "edit",
                                          label: "Edit",
                                          icon: <EditOutlined />,
                                          onClick: () => handleEditTodo(todo),
                                        },
                                        {
                                          key: "shareTag",
                                          label: "Share ",
                                          icon: <ShareAltOutlined />,
                                          onClick: () => {
                                            setSharingTask(todo);
                                            setIsTaskShareTagModalVisible(true);
                                          },
                                        },
                                        {
                                          key: "delete",
                                          label: (
                                            <Popconfirm
                                              title="Delete Task"
                                              description="Are you sure you want to delete this task?"
                                              okText="Delete"
                                              okType="danger"
                                              cancelText="Cancel"
                                              onConfirm={() =>
                                                handleDeleteTodo(todo.id)
                                              }
                                            >
                                              <span style={{ color: "red" }}>
                                                <DeleteOutlined /> Delete
                                              </span>
                                            </Popconfirm>
                                          ),
                                          danger: true,
                                        },
                                      ],
                                    }}
                                    trigger={["click"]}
                                    placement="bottomRight"
                                  >
                                    <Button
                                      type="text"
                                      size="small"
                                      icon={<MoreOutlined />}
                                      style={{
                                        fontSize: "10px",
                                        color: COLORS.textSecondary,
                                        padding: "2px 4px",
                                        borderRadius: "4px",
                                        width: "20px",
                                        height: "20px",
                                      }}
                                    />
                                  </Dropdown>
                                </div>
                              </div>
                            </div>
                          </>
                        ) : (
                          <Text
                            style={{
                              color: COLORS.textTertiary,
                              fontStyle: "italic",
                              fontSize: "13px",
                              cursor: "pointer",
                              paddingLeft: SPACING.sm,
                              fontWeight: 500,
                              fontFamily: FONT_FAMILY,
                            }}
                            onClick={() => setIsTodoModalVisible(true)}
                          >
                            Add Task {index + 1}
                          </Text>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Col>
        </Row>
        <Row gutter={[SPACING.xs, SPACING.xs]}>
          <Col span={10}>
            <FamilyTasksComponent
              title="Projects"
              projects={filteredProjects}
              onAddProject={handleAddProjects}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onDeleteProject={handleDeleteProject}
              showAssigneeInputInEdit={false}
              showAvatarInTask={false}
              showVisibilityToggle={true}
              showAssigneeField={false}
              source="planner"
              fetchProjects={fetchProjects}
              showCreator={false}
            />
          </Col>
          <Col span={7}>
            <BookmarkHub hub={"planner"} />
          </Col>
          <Col span={7}>
            <NotesLists currentHub="planner" />
          </Col>
        </Row>
        <Row gutter={[SPACING.xs, SPACING.xs]} style={{ marginTop: 10 }}>
          <Col span={10}>
            <FileHub hubName="Planner" title="Files" />
          </Col>
        </Row>
        {/* Modals */}
        <ConnectAccountModal
          isVisible={isConnectAccountModalVisible}
          onClose={() => setIsConnectAccountModalVisible(false)}
          onConnect={handleConnectAccount}
        />

        {/* Combined Share & Tag Modals */}
        <GoalShareTagModal
          isVisible={isGoalShareTagModalVisible}
          onClose={() => {
            setIsGoalShareTagModalVisible(false);
            setSharingGoal(null);
          }}
          goal={sharingGoal}
          loading={loading}
          onShare={handleShareGoal}
          onTag={handleTagGoal}
          familyMembers={familyMembers}
        />

        <TaskShareTagModal
          isVisible={isTaskShareTagModalVisible}
          onClose={() => {
            setIsTaskShareTagModalVisible(false);
            setSharingTask(null);
          }}
          task={sharingTask}
          loading={loading}
          onShare={handleShareTodo}
          onTag={handleTagTask}
          familyMembers={familyMembers}
        />

        <Modal
          title={
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: SPACING.xs,
                fontSize: "16px",
                fontWeight: 600,
                fontFamily: FONT_FAMILY,
              }}
            >
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accent}dd)`,
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CalendarOutlined
                  style={{ color: "white", fontSize: "14px" }}
                />
              </div>
              Add New Event
            </div>
          }
          open={isEventModalVisible}
          onCancel={() => setIsEventModalVisible(false)}
          footer={[
            <Button
              key="cancel"
              onClick={() => setIsEventModalVisible(false)}
              style={{
                borderRadius: "6px",
                height: "36px",
                fontWeight: 500,
                fontFamily: FONT_FAMILY,
              }}
            >
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              onClick={handleAddEvent}
              style={{
                backgroundColor: COLORS.accent,
                borderColor: COLORS.accent,
                borderRadius: "6px",
                height: "36px",
                fontWeight: 500,
                fontFamily: FONT_FAMILY,
              }}
            >
              Add Event
            </Button>,
          ]}
          width={500}
        >
          <Form
            form={eventForm}
            layout="vertical"
            style={{ marginTop: SPACING.sm, fontFamily: FONT_FAMILY }}
          >
            <Form.Item
              name="title"
              label={
                <Text
                  strong
                  style={{ fontSize: "13px", fontFamily: FONT_FAMILY }}
                >
                  Event Title
                </Text>
              }
              rules={[
                { required: true, message: "Please enter the event title" },
              ]}
            >
              <Input
                placeholder="Event title"
                style={{
                  borderRadius: "6px",
                  height: "36px",
                  fontSize: "13px",
                  fontFamily: FONT_FAMILY,
                }}
              />
            </Form.Item>
            <Form.Item
              name="date"
              label={
                <Text
                  strong
                  style={{ fontSize: "13px", fontFamily: FONT_FAMILY }}
                >
                  Date
                </Text>
              }
              rules={[{ required: true, message: "Please select a date" }]}
              initialValue={dayjs()}
            >
              <DatePicker
                style={{
                  width: "100%",
                  borderRadius: "6px",
                  height: "36px",
                  fontFamily: FONT_FAMILY,
                }}
                disabledDate={(current) =>
                  current && current < dayjs().startOf("day")
                }
              />
            </Form.Item>
            <Form.Item
              name="time"
              label={
                <Text
                  strong
                  style={{ fontSize: "13px", fontFamily: FONT_FAMILY }}
                >
                  Time
                </Text>
              }
              rules={[{ required: true, message: "Please select a time" }]}
              initialValue={dayjs().add(10, "minute").startOf("minute")}
            >
              <TimePicker
                use12Hours
                format="h:mm A"
                minuteStep={10}
                showSecond={false}
                style={{
                  width: "100%",
                  borderRadius: "6px",
                  height: "36px",
                  fontFamily: FONT_FAMILY,
                }}
              />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title={
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: SPACING.xs,
                fontSize: "16px",
                fontWeight: 600,
                fontFamily: FONT_FAMILY,
              }}
            >
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  background: `linear-gradient(135deg, ${COLORS.success}, ${COLORS.success}dd)`,
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TrophyOutlined style={{ color: "white", fontSize: "14px" }} />
              </div>
              {editingGoal ? "Edit Goal" : "Add New Goal"}
            </div>
          }
          open={isGoalModalVisible}
          onCancel={() => {
            setIsGoalModalVisible(false);
            setEditingGoal(null);
            goalForm.resetFields();
          }}
          footer={[
            <Button
              key="cancel"
              onClick={() => {
                setIsGoalModalVisible(false);
                setEditingGoal(null);
                goalForm.resetFields();
              }}
              style={{
                borderRadius: "6px",
                height: "36px",
                fontWeight: 500,
                fontFamily: FONT_FAMILY,
              }}
              disabled={loading}
            >
              
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              onClick={handleAddGoal}
              loading={loading}
              style={{
                backgroundColor: COLORS.accent,
                borderColor: COLORS.accent,
                borderRadius: "6px",
                height: "36px",
                fontWeight: 500,
                fontFamily: FONT_FAMILY,
              }}
            >
              {editingGoal ? "Update Goal" : "Add Goal"}
            </Button>,
          ]}
          width={500}
        >
          <Form
            form={goalForm}
            layout="vertical"
            style={{ marginTop: SPACING.sm, fontFamily: FONT_FAMILY }}
          >
            <Form.Item
              name="goal"
              label={
                <Text
                  strong
                  style={{ fontSize: "13px", fontFamily: FONT_FAMILY }}
                >
                  Goal
                </Text>
              }
              rules={[{ required: true, message: "Please enter your goal" }]}
            >
              <Input
                placeholder="Enter your Goal.."
                style={{
                  borderRadius: "6px",
                  height: "36px",
                  fontSize: "13px",
                  fontFamily: FONT_FAMILY,
                }}
              />
            </Form.Item>
            <Form.Item
              name="date"
              label={
                <Text
                  strong
                  style={{ fontSize: "13px", fontFamily: FONT_FAMILY }}
                >
                  Due Date
                </Text>
              }
              rules={[{ required: true, message: "Please select a due date" }]}
              initialValue={dayjs(getDueDateByView(view, currentDate))}
            >
              <DatePicker
                format="YYYY-MM-DD"
                disabledDate={(current) =>
                  current && current < dayjs().startOf("day")
                }
                style={{
                  borderRadius: "6px",
                  height: "36px",
                  width: "100%",
                  fontFamily: FONT_FAMILY,
                }}
              />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title={
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: SPACING.xs,
                fontSize: "16px",
                fontWeight: 600,
                fontFamily: FONT_FAMILY,
              }}
            >
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  background: `linear-gradient(135deg, ${COLORS.warning}, ${COLORS.warning}dd)`,
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CheckSquareOutlined
                  style={{ color: "white", fontSize: "14px" }}
                />
              </div>
              {editingTodo ? "Edit Task" : "Add New Task"}
            </div>
          }
          open={isTodoModalVisible}
          onCancel={() => {
            setIsTodoModalVisible(false);
            setEditingTodo(null);
            todoForm.resetFields();
          }}
          footer={[
            <Button
              key="cancel"
              onClick={() => {
                setIsTodoModalVisible(false);
                setEditingTodo(null);
                todoForm.resetFields();
              }}
              style={{
                borderRadius: "6px",
                height: "36px",
                fontWeight: 500,
                fontFamily: FONT_FAMILY,
              }}
              disabled={loading}
            >
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              onClick={handleAddTodo}
              loading={loading}
              style={{
                backgroundColor: COLORS.accent,
                borderColor: COLORS.accent,
                borderRadius: "6px",
                height: "36px",
                fontWeight: 500,
                fontFamily: FONT_FAMILY,
              }}
            >
              {editingTodo ? "Update Task" : "Add Task"}
            </Button>,
          ]}
          width={500}
        >
          <Form
            form={todoForm}
            layout="vertical"
            style={{ marginTop: SPACING.sm, fontFamily: FONT_FAMILY }}
          >
            <Form.Item
              name="text"
              label={
                <Text
                  strong
                  style={{ fontSize: "13px", fontFamily: FONT_FAMILY }}
                >
                  Task
                </Text>
              }
              rules={[{ required: true, message: "Please enter the task" }]}
            >
              <Input
                placeholder="Task title"
                style={{
                  borderRadius: "6px",
                  height: "36px",
                  fontSize: "13px",
                  fontFamily: FONT_FAMILY,
                }}
              />
            </Form.Item>

            <Space direction="horizontal" style={{ width: "100%" }}>
              <Form.Item
                name="date"
                label={
                  <Text
                    strong
                    style={{ fontSize: "13px", fontFamily: FONT_FAMILY }}
                  >
                    Due Date
                  </Text>
                }
                rules={[{ required: true, message: "Please select due date" }]}
                initialValue={dayjs(getDueDateByView(view, currentDate))}
              >
                <DatePicker
                  format="YYYY-MM-DD"
                  disabledDate={(current) =>
                    current && current < dayjs().startOf("day")
                  }
                  style={{
                    borderRadius: "6px",
                    height: "36px",
                    fontFamily: FONT_FAMILY,
                  }}
                />
              </Form.Item>

              <Form.Item
                name="goal_id"
                label={
                  <Text
                    strong
                    style={{ fontSize: "13px", fontFamily: FONT_FAMILY }}
                  >
                    Goal
                  </Text>
                }
              >
                <Select
                  placeholder="Select a goal (optional)"
                  allowClear
                  style={{
                    borderRadius: "6px",
                    minWidth: "180px",
                    height: "36px",
                    fontFamily: FONT_FAMILY,
                  }}
                  dropdownStyle={{
                    maxHeight: "200px",
                    overflow: "auto",
                  }}
                  optionLabelProp="label"
                >
                  {getAvailableGoals().map((goal) => (
                    <Select.Option 
                      key={goal.id} 
                      value={goal.id}
                      label={goal.text.length > 30 ? `${goal.text.substring(0, 30)}...` : goal.text}
                      title={goal.text}
                    >
                      <div
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "100%",
                          lineHeight: "1.4",
                        }}
                        title={goal.text}
                      >
                        {goal.text}
                      </div>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Space>

            <Form.Item
              name="priority"
              label={
                <Text
                  strong
                  style={{ fontSize: "13px", fontFamily: FONT_FAMILY }}
                >
                  Priority
                </Text>
              }
              rules={[{ required: true, message: "Please select a priority" }]}
              initialValue="medium"
            >
              <Select style={{ borderRadius: "6px", fontFamily: FONT_FAMILY }}>
                <Select.Option value="low">Low</Select.Option>
                <Select.Option value="medium">Medium</Select.Option>
                <Select.Option value="high">High</Select.Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>

        {/* Updated Habit Modal - form reset handled properly */}
        <Modal
          title={editingHabit ? "Edit Habit" : "Add Habit"}
          open={isHabitModalOpen}
          onCancel={() => {
            setHabitModalOpen(false);
            setEditingHabit(null);
            setNewHabit({ name: "", description: "", frequency: "daily" });
          }}
          onOk={editingHabit ? () => submitEditHabit(newHabit) : handleAddHabit}
          okText={editingHabit ? "Save Changes" : "Add"}
        >
          <Form layout="vertical">
            <Form.Item label="Name" required>
              <Input
                value={newHabit.name}
                onChange={(e) =>
                  setNewHabit({ ...newHabit, name: e.target.value })
                }
              />
            </Form.Item>
            <Form.Item label="Description">
              <Input
                value={newHabit.description}
                onChange={(e) =>
                  setNewHabit({ ...newHabit, description: e.target.value })
                }
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default Planner;