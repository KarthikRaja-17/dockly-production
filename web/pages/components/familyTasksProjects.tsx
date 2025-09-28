"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Checkbox,
  Modal,
  Progress,
  Input,
  DatePicker,
  Space,
  Avatar,
  Select,
  Empty,
  Typography,
  Tooltip,
  Badge,
  Radio,
  message,
  Collapse,
  List,
  Dropdown,
  Menu,
  Form,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  ProjectOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  TagOutlined,
  EyeOutlined,
  DownOutlined,
  UpOutlined,
  DeleteOutlined,
  MoreOutlined,
  ShareAltOutlined,
  SearchOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  deleteProjects,
  getUsersFamilyMembers,
  shareProject,
  updateProject,
} from "../../services/family";
import { CustomButton, PRIMARY_COLOR } from "../../app/comman";

const { Text, Title } = Typography;

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
};

type Project = {
  id: string;
  color?: string;
  title: string;
  description: string;
  due_date: string;
  progress: number;
  tasks: Task[];
  status?: string;
  created_by?: string;
  creator_name?: string;
  family_groups?: string[];
};

const priorityColor: { [key: string]: string } = {
  high: "#FF3B30",
  medium: "#FF9500",
  low: "#34C759",
  default: "#6D6D80",
};

interface Props {
  title?: string;
  projects?: Project[];
  onAddProject?: (project: {
    title: string;
    description: string;
    due_date: string;
    visibility: "public" | "private";
  }) => void;
  onAddTask?: (
    projectId: string,
    taskData?: { title: string; due_date: string }
  ) => void;
  onToggleTask?: (projectId: string, taskId: number) => void;
  onUpdateTask?: (task: Task) => void;
  onDeleteTask?: (projectId: string, taskId: number) => Promise<void>;
  onDeleteProject?: (projectId: string) => Promise<void>;
  showAssigneeInputInEdit?: boolean;
  showAvatarInTask?: boolean;
  familyMembers?: { name: string; email?: string; status?: string }[];
  showVisibilityToggle?: boolean;
  showAssigneeField?: boolean;
  source: "familyhub" | "planner";
  showCreator?: boolean;
  fetchProjects: () => Promise<void>;
}

const FamilyTasksComponent: React.FC<Props> = ({
  title = "Projects & Tasks",
  projects = [],
  onAddProject,
  onAddTask,
  onToggleTask,
  onUpdateTask,
  onDeleteTask,
  onDeleteProject,
  familyMembers,
  source,
  showAssigneeInputInEdit = true,
  showAvatarInTask = true,
  showVisibilityToggle = false,
  showAssigneeField = false,
  showCreator = false,
  fetchProjects,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [assignees, setAssignees] = useState<
    { label: string; value: string }[]
  >([]);
  const [editTaskModal, setEditTaskModal] = useState(false);
  const [newProject, setNewProject] = useState<{
    title: string;
    description: string;
    due_date: string;
    visibility: "public" | "private";
  }>({
    title: "",
    description: "",
    due_date: "",
    visibility: "private",
  });
  const [form] = Form.useForm();
  const [editingTask, setEditingTask] = useState<{
    projectId: string;
    task: Task | null;
  }>({ projectId: "", task: null });
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDueDate, setTaskDueDate] = useState<dayjs.Dayjs | null>(null);
  const [taskAssignee, setTaskAssignee] = useState<string>("All");

  const [viewMoreProject, setViewMoreProject] = useState<Project | null>(null);
  const [viewMoreModalVisible, setViewMoreModalVisible] = useState(false);
  const [showAllProjects, setShowAllProjects] = useState(false);

  const [loadingProject, setLoadingProject] = useState(false);
  const [loadingTask, setLoadingTask] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [tagLoading, setTagLoading] = useState(false);
  const [familyMember, setFamilyMember] = useState<any[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([]);
  const filledProjects = projects.filter((p) => p.title.trim());
  const [editProjectModal, setEditProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(
    new Set()
  );
  const [searchTerm, setSearchTerm] = useState("");

  const toggleProjectExpansion = (projectId: string) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  useEffect(() => {
    const accepted = familyMember
      .filter((m) => m.email && m.status?.toLowerCase() !== "pending")
      .map((m) => ({
        label: m.name,
        value: m.email,
      }));
    setAssignees(accepted);
  }, [familyMember]);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await getUsersFamilyMembers({});
      if (res?.payload?.members) {
        const filtered = res.payload.members.filter(
          (m: any) =>
            m.relationship !== "me" && m.status?.toLowerCase() !== "pending"
        );
        setFamilyMember(filtered);
      }
    } catch (err) {
      console.error("Failed to fetch family members", err);
    }
  };

  const handleShareProject = async (selectedIds: number[]) => {
    setSelectedMemberIds(selectedIds);

    if (!selectedProject) return;

    const emails = familyMember
      .filter(
        (m: any) =>
          selectedIds.includes(m.id) && m.status?.toLowerCase() !== "pending"
      )
      .map((m: any) => m.email)
      .filter(Boolean);

    try {
      await shareProject({
        email: emails,
        tagged_members: emails,
        project: {
          id: selectedProject.id,
          title: selectedProject.title,
          description: selectedProject.description,
          deadline: selectedProject.due_date,
          status: selectedProject.status,
        },
      });

      const memberNames = familyMember
        .filter((m: any) => selectedIds.includes(m.id))
        .map((m: any) => m.name)
        .join(", ");

      message.success(`Project tagged with ${memberNames}!`);
      setSelectedMemberIds([]);
    } catch (err) {
      console.error("Share project failed:", err);
      message.error("Failed to tag project.");
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <ExclamationCircleOutlined style={{ color: "#FF3B30" }} />;
      case "medium":
        return <ClockCircleOutlined style={{ color: "#FF9500" }} />;
      case "low":
        return <CheckCircleOutlined style={{ color: "#34C759" }} />;
      default:
        return <CheckCircleOutlined style={{ color: "#6D6D80" }} />;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "#34C759";
    if (progress >= 50) return "#FF9500";
    return "#2563eb";
  };

  const getStatusBadge = (progress: number) => {
    if (progress === 100) return { text: "Completed", color: "#34C759" };
    if (progress >= 80) return { text: "Almost Done", color: "#34C759" };
    if (progress >= 50) return { text: "In Progress", color: "#FF9500" };
    if (progress > 0) return { text: "Started", color: "#2563eb" };
    return { text: "Not Started", color: "#6D6D80" };
  };

  const filteredFamilyMembers = familyMember
    .filter((member: any) => member.relationship !== "me")
    .filter((member: any) => member.status?.toLowerCase() !== "pending") // ✅ Added pending filter
    .filter((member: any) => member.email && member.email.trim())
    .filter((member: any) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const displayedProjects = showAllProjects
    ? filledProjects
    : filledProjects.slice(0, 4);
  const hasMoreProjects = filledProjects.length > 4;

  const renderProjectHeader = (proj: Project) => {
    const completedTasks = proj.tasks.filter((t) => t.completed).length;
    const totalTasks = proj.tasks.length;
    const isExpanded = expandedProjects.has(proj.id);

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "10px 12px",
          cursor: "pointer",
        }}
        onClick={() => toggleProjectExpansion(proj.id)}
      >
        <div
          style={{
            width: 32,
            height: 32,
            background: "#4CAF5015",
            borderRadius: 6,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: 14,
            marginRight: "12px",
            flexShrink: 0,
          }}
        >
          📋
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <Text
            style={{
              fontWeight: 500,
              fontSize: "14px",
              color: "#262626",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: "block",
              fontFamily: FONT_FAMILY,
            }}
          >
            {proj.title}
            {proj.progress === 100 && (
              <span
                style={{
                  marginLeft: 6,
                  color: "#34C759",
                  fontSize: 11,
                }}
              >
                ✅
              </span>
            )}
          </Text>

          <Text
            style={{
              fontSize: "12px",
              color: "#6b7280",
              fontFamily: FONT_FAMILY,
            }}
          >
            {totalTasks} tasks • Due {dayjs(proj.due_date).format("MMM D")}
          </Text>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Dropdown
            menu={{
              items: [
                {
                  key: "edit",
                  icon: (
                    <EditOutlined
                      style={{ fontSize: "14px", color: "#595959" }}
                    />
                  ),
                  label: (
                    <span
                      style={{
                        fontSize: "14px",
                        color: "#262626",
                        fontFamily: FONT_FAMILY,
                        fontWeight: 400,
                      }}
                    >
                      Edit
                    </span>
                  ),
                  onClick: () => {
                    setEditingProject(proj);
                    setEditProjectModal(true);
                  },
                  style: {
                    padding: "8px 12px",
                    borderRadius: "6px",
                    margin: "2px 0",
                  },
                },
                {
                  key: "tag",
                  icon: (
                    <TagOutlined
                      style={{ fontSize: "14px", color: "#595959" }}
                    />
                  ),
                  label: (
                    <span
                      style={{
                        fontSize: "14px",
                        color: "#262626",
                        fontFamily: FONT_FAMILY,
                        fontWeight: 400,
                      }}
                    >
                      Tag
                    </span>
                  ),
                  onClick: () => {
                    setSelectedProject(proj);
                    setTagModalOpen(true);
                  },
                  style: {
                    padding: "8px 12px",
                    borderRadius: "6px",
                    margin: "2px 0",
                  },
                },
                {
                  type: "divider",
                  style: {
                    margin: "4px 0",
                  },
                },
                {
                  key: "delete",
                  icon: (
                    <DeleteOutlined
                      style={{ fontSize: "14px", color: "#ff4d4f" }}
                    />
                  ),
                  label: (
                    <span
                      style={{
                        fontSize: "14px",
                        color: "#ff4d4f",
                        fontFamily: FONT_FAMILY,
                        fontWeight: 400,
                      }}
                    >
                      Delete
                    </span>
                  ),
                  onClick: async () => {
                    try {
                      await deleteProjects({ id: proj.id });
                      await fetchProjects();
                      message.success("Project deleted successfully");
                    } catch (err) {
                      console.error("Delete project failed:", err);
                      message.error("Failed to delete project");
                    }
                  },
                  style: {
                    padding: "8px 12px",
                    borderRadius: "6px",
                    margin: "2px 0",
                  },
                },
              ],
              style: {
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                border: "1px solid #f0f0f0",
                padding: "4px",
                minWidth: "120px",
              },
            }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button
              type="text"
              size="small"
              icon={<MoreOutlined />}
              onClick={(e) => e.stopPropagation()}
              style={{
                color: "#9ca3af",
                fontSize: "14px",
                width: "28px",
                height: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "6px",
              }}
            />
          </Dropdown>

          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              setEditingTask({ projectId: proj.id, task: null });
              setEditTaskModal(true);
            }}
            style={{
              borderRadius: 6,
              background: PRIMARY_COLOR,
              borderColor: PRIMARY_COLOR,
              fontSize: 11,
              height: 24,
              width: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              marginRight: "8px",
            }}
          />
          <Button
            type="text"
            size="small"
            icon={isExpanded ? <UpOutlined /> : <DownOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              toggleProjectExpansion(proj.id);
            }}
            style={{
              width: "28px",
              height: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />
        </div>
      </div>
    );
  };

  const renderExpandedContent = (proj: Project) => {
    const status = getStatusBadge(proj.progress);
    const completedTasks = proj.tasks.filter((t) => t.completed).length;
    const totalTasks = proj.tasks.length;

    return (
      <div
        style={{
          borderTop: "1px solid #f0f0f0",
          backgroundColor: "#ffffff",
        }}
      >
        {showCreator && proj.creator_name && (
          <div
            style={{
              fontSize: "11px",
              color: "#666",
              marginBottom: "8px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "10px",
            }}
          >
            <UserOutlined style={{ fontSize: "10px" }} />
            Created by {proj.creator_name}
          </div>
        )}
        <div style={{ padding: "10px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "1px",
            }}
          >
            <Badge
              color={status.color}
              text={status.text}
              style={{ fontSize: "12px", fontFamily: FONT_FAMILY }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <CalendarOutlined
                style={{ color: "#6b7280", fontSize: "12px" }}
              />
              <Text
                style={{
                  color: "#6b7280",
                  fontSize: "12px",
                  fontFamily: FONT_FAMILY,
                }}
              >
                {dayjs(proj.due_date).format("MMM D")}
              </Text>
            </div>
            <Text
              style={{
                color: "#6b7280",
                fontSize: "12px",
                fontFamily: FONT_FAMILY,
              }}
            >
              {completedTasks}/{totalTasks} tasks
            </Text>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Progress
              percent={proj.progress}
              strokeColor={getProgressColor(proj.progress)}
              trailColor="#f0f0f0"
              showInfo={false}
              strokeWidth={6}
              style={{ flex: 1 }}
            />
            <Text
              style={{
                fontSize: "12px",
                color: getProgressColor(proj.progress),
                fontWeight: 600,
                fontFamily: FONT_FAMILY,
              }}
            >
              {proj.progress}%
            </Text>
          </div>
        </div>

        {proj.tasks.length === 0 ? (
          <Text
            style={{
              color: "#6b7280",
              fontSize: "12px",
              padding: "10px",
              fontFamily: FONT_FAMILY,
            }}
          >
            No tasks yet
          </Text>
        ) : (
          <div style={{ padding: "10px" }}>
            {proj.tasks.map((task, idx) => (
              <div
                key={task.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                  padding: "8px 0",
                  borderBottom:
                    idx < proj.tasks.length - 1 ? "1px solid #f0f0f0" : "none",
                }}
              >
                <Checkbox
                  checked={task.completed}
                  onChange={() => onToggleTask?.(proj.id, task.id)}
                  style={{ marginTop: "2px" }}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "13px",
                      fontFamily: FONT_FAMILY,
                      fontWeight: 600,
                      color: task.completed ? "#6b7280" : "#374151",
                      textDecoration: task.completed ? "line-through" : "none",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      marginBottom: "2px",
                    }}
                  >
                    {task.title}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    {task.due && (
                      <Text
                        style={{
                          fontSize: "10px",
                          color: "#9ca3af",
                          fontFamily: FONT_FAMILY,
                        }}
                      >
                        <ClockCircleOutlined style={{ marginRight: "2px" }} />
                        {task.due}
                      </Text>
                    )}
                    {showAvatarInTask && (
                      <Tooltip title={task.assignee}>
                        <Avatar
                          size={14}
                          style={{
                            backgroundColor:
                              priorityColor[task.type] || "#6D6D80",
                            color: "#ffffff",
                            fontSize: "8px",
                            fontWeight: 600,
                          }}
                        >
                          {task.assignee ? task.assignee[0].toUpperCase() : "?"}
                        </Avatar>
                      </Tooltip>
                    )}
                  </div>
                </div>

                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setEditingTask({ projectId: proj.id, task });
                    setEditTaskModal(true);
                  }}
                  style={{
                    color: "#9ca3af",
                    width: "24px",
                    height: "24px",
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                />
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={async () => {
                    try {
                      await onDeleteTask?.(proj.id, task.id);
                      message.success("Task deleted");
                    } catch (err) {
                      message.error("Failed to delete task");
                    }
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ fontFamily: FONT_FAMILY }}>
      <Card
        style={{
          padding: 0,
          backgroundColor: "#ffffff",
          width: "100%",
          borderRadius: 12,
          position: "relative",
          height: "360px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1)",
          border: "1px solid rgba(0,0,0,0.06)",
          fontFamily: FONT_FAMILY,
          display: "flex",
          flexDirection: "column",
        }}
        bodyStyle={{
          display: "flex",
          flexDirection: "column",
          padding: "16px",
          height: "100%",
        }}
      >
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Avatar
              style={{
                backgroundColor: PRIMARY_COLOR,
                color: "#fff",
                fontSize: "18px",
              }}
              size={40}
              icon={<ProjectOutlined />}
            />
            <div>
              <Title
                level={4}
                style={{
                  margin: 0,
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "#262626",
                  fontFamily: FONT_FAMILY,
                }}
              >
                {title}
              </Title>
              <Text
                type="secondary"
                style={{
                  fontSize: "13px",
                  fontFamily: FONT_FAMILY,
                }}
              >
                {filledProjects.length} active projects
              </Text>
            </div>
          </div>

          <CustomButton
            label="Add Project" // tooltip text
            onClick={() => setModalVisible(true)}
          />
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            paddingRight: "6px",
          }}
        >
          {filledProjects.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                textAlign: "center",
                padding: "20px",
              }}
            >
              <div
                onClick={() => setModalVisible(true)}
                style={{
                  padding: "16px",
                  border: "2px dashed #f0f0f0",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  width: "100%",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#2563eb60";
                  e.currentTarget.style.background = "#2563eb05";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#f0f0f0";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <PlusOutlined
                  style={{
                    fontSize: "20px",
                    color: "#999",
                    marginBottom: "6px",
                  }}
                />
                <Text
                  style={{
                    color: "#999",
                    fontSize: "12px",
                    display: "block",
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  Add New Project
                </Text>
                <Text
                  style={{
                    color: "#bbb",
                    fontSize: "10px",
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  Project description...
                </Text>
              </div>
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {displayedProjects.map((proj) => {
                const isExpanded = expandedProjects.has(proj.id);
                return (
                  <div
                    key={proj.id}
                    style={{
                      backgroundColor: "#fafafa",
                      borderRadius: "12px",
                      border: "1px solid #f0f0f0",
                      transition: "all 0.2s ease",
                      overflow: "hidden",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f5f5f5";
                      e.currentTarget.style.borderColor = "#d9d9d9";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#fafafa";
                      e.currentTarget.style.borderColor = "#f0f0f0";
                    }}
                  >
                    {renderProjectHeader(proj)}
                    {isExpanded && renderExpandedContent(proj)}
                  </div>
                );
              })}

              {hasMoreProjects && !showAllProjects && (
                <div
                  style={{
                    textAlign: "center",
                    marginTop: "8px",
                    paddingTop: "8px",
                    borderTop: "1px solid #f0f0f0",
                  }}
                >
                  <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => setShowAllProjects(true)}
                    style={{
                      color: "#2563eb",
                      fontSize: "12px",
                      fontWeight: 500,
                      padding: "4px 8px",
                      height: "24px",
                      fontFamily: FONT_FAMILY,
                    }}
                  >
                    View More ({filledProjects.length - 4})
                  </Button>
                </div>
              )}

              {showAllProjects && hasMoreProjects && (
                <div
                  style={{
                    textAlign: "center",
                    marginTop: "8px",
                    paddingTop: "8px",
                    borderTop: "1px solid #f0f0f0",
                  }}
                >
                  <Button
                    type="link"
                    onClick={() => setShowAllProjects(false)}
                    style={{
                      color: "#6b7280",
                      fontSize: "12px",
                      height: "24px",
                      fontFamily: FONT_FAMILY,
                    }}
                  >
                    Show Less
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <Modal
          title={
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontFamily: FONT_FAMILY,
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  backgroundColor: "#e8f0fe",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ProjectOutlined
                  style={{ color: PRIMARY_COLOR, fontSize: "16px" }}
                />
              </div>
              <div>
                <span
                  style={{
                    fontSize: "18px",
                    fontWeight: 600,
                    color: "#202124",
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  Create New Project
                </span>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#5f6368",
                    marginTop: "2px",
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  Add project details and set a due date
                </div>
              </div>
            </div>
          }
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
          }}
          footer={null}
          width={500}
          style={{ borderRadius: "12px", fontFamily: FONT_FAMILY }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={async (values) => {
              const trimmedValues = {
                ...values,
                title: values.title.trim(),
                description: values.description.trim(),
                due_date: dayjs(values.due_date).format("YYYY-MM-DD"), // Ensure due_date is formatted correctly
              };

              if (!trimmedValues.title) {
                form.setFields([
                  { name: "title", errors: ["Project name cannot be empty"] },
                ]);
                return;
              }
              if (!trimmedValues.description) {
                form.setFields([
                  {
                    name: "description",
                    errors: ["Description cannot be empty"],
                  },
                ]);
                return;
              }

              setLoadingProject(true);
              try {
                await onAddProject?.(trimmedValues);
                await fetchProjects(); // Refresh the projects list
                message.success("Project added successfully");
              } catch (error) {
                console.error("Failed to add project:", error);
                message.error("Failed to add project");
              } finally {
                setLoadingProject(false);
                setModalVisible(false);
                form.resetFields();
              }
            }}
            style={{ marginTop: "20px", fontFamily: FONT_FAMILY }}
          >
            <Form.Item
              name="title"
              label={
                <span style={{ fontFamily: FONT_FAMILY, fontWeight: 500 }}>
                  Project Name
                </span>
              }
              rules={[
                { required: true, message: "Please enter a project name" },
              ]}
            >
              <Input
                placeholder="Enter project name"
                style={{ borderRadius: "8px", fontFamily: FONT_FAMILY }}
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="description"
              label={
                <span style={{ fontFamily: FONT_FAMILY, fontWeight: 500 }}>
                  Description
                </span>
              }
              rules={[
                { required: true, message: "Please enter a description" },
              ]}
            >
              <Input.TextArea
                placeholder="Describe your project"
                rows={4}
                style={{ borderRadius: "8px", fontFamily: FONT_FAMILY }}
              />
            </Form.Item>

            <Form.Item
              name="due_date"
              label={
                <span style={{ fontFamily: FONT_FAMILY, fontWeight: 500 }}>
                  Due Date
                </span>
              }
              rules={[{ required: true, message: "Please select a due date" }]}
            >
              <DatePicker
                placeholder="Select due date"
                style={{
                  width: "100%",
                  borderRadius: "8px",
                  fontFamily: FONT_FAMILY,
                }}
                size="large"
                disabledDate={(current) =>
                  current && current < dayjs().startOf("day")
                }
              />
            </Form.Item>

            {showVisibilityToggle && (
              <Form.Item
                name="visibility"
                label={
                  <span style={{ fontFamily: FONT_FAMILY, fontWeight: 500 }}>
                    Visibility
                  </span>
                }
                initialValue="private"
                rules={[
                  { required: true, message: "Please select visibility" },
                ]}
              >
                <Radio.Group style={{ display: "flex", gap: "16px" }}>
                  <Radio.Button value="private" style={{ borderRadius: "8px" }}>
                    Only Me
                  </Radio.Button>
                  <Radio.Button value="public" style={{ borderRadius: "8px" }}>
                    Family
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>
            )}

            <Form.Item
              style={{ marginBottom: 0, textAlign: "right", marginTop: "24px" }}
            >
              <Space size="middle">
                <Button
                  size="large"
                  onClick={() => {
                    setModalVisible(false);
                    form.resetFields();
                  }}
                  style={{ borderRadius: "8px", fontFamily: FONT_FAMILY }}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  loading={loadingProject}
                  style={{
                    backgroundColor: PRIMARY_COLOR,
                    borderColor: PRIMARY_COLOR,
                    borderRadius: "8px",
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  Create Project
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <EditOutlined style={{ color: PRIMARY_COLOR }} />
              <span>Edit Task</span>
            </div>
          }
          open={editTaskModal && editingTask?.task !== null}
          onCancel={() => setEditTaskModal(false)}
          onOk={async () => {
            if (editingTask.task && onUpdateTask) {
              setLoadingEdit(true);
              await onUpdateTask(editingTask.task);
              setLoadingEdit(false);
              setEditTaskModal(false);
            }
          }}
          confirmLoading={loadingEdit}
          okText="Save Changes"
          cancelText="Cancel"
          okButtonProps={{
            style: {
              backgroundColor: PRIMARY_COLOR,
              borderColor: PRIMARY_COLOR,
              borderRadius: "8px",
              fontFamily: FONT_FAMILY,
            },
          }}
          style={{
            borderRadius: "12px",
            fontFamily: FONT_FAMILY,
          }}
        >
          <div style={{ padding: "16px 0" }}>
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              <div>
                <Text
                  strong
                  style={{
                    color: "#262626",
                    marginBottom: "8px",
                    display: "block",
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  Task Name
                </Text>
                <Input
                  placeholder="Enter task name"
                  value={editingTask.task?.title}
                  onChange={(e) =>
                    setEditingTask((prev) => ({
                      ...prev,
                      task: prev.task && {
                        ...prev.task,
                        title: e.target.value,
                      },
                    }))
                  }
                  style={{
                    borderRadius: "8px",
                    fontFamily: FONT_FAMILY,
                  }}
                />
              </div>
              <div>
                <Text
                  strong
                  style={{
                    color: "#262626",
                    marginBottom: "8px",
                    display: "block",
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  Due Date
                </Text>
                <DatePicker
                  placeholder="Select due date"
                  style={{
                    width: "100%",
                    borderRadius: "8px",
                    fontFamily: FONT_FAMILY,
                  }}
                  value={
                    editingTask.task?.dueDate
                      ? dayjs(editingTask.task.dueDate)
                      : null
                  }
                  disabledDate={(current) =>
                    current && current < dayjs().startOf("day")
                  }
                  onChange={(_, dateString) => {
                    const dateStr = Array.isArray(dateString)
                      ? dateString[0] ?? ""
                      : dateString;
                    setEditingTask((prev) => ({
                      ...prev,
                      task: prev.task && {
                        ...prev.task,
                        dueDate: dateStr,
                        due: dateStr
                          ? `Due ${dayjs(dateStr).format("MMM D")}`
                          : "",
                      },
                    }));
                  }}
                />
              </div>
              {showAssigneeInputInEdit && (
                <div>
                  <Text
                    strong
                    style={{
                      color: "#262626",
                      marginBottom: "8px",
                      display: "block",
                      fontFamily: FONT_FAMILY,
                    }}
                  >
                    Assignee
                  </Text>
                  <Select
                    placeholder="Select assignee"
                    value={editingTask.task?.assignee}
                    onChange={(val) =>
                      setEditingTask((prev) => ({
                        ...prev,
                        task: prev.task && {
                          ...prev.task,
                          assignee: val,
                          type: val,
                        },
                      }))
                    }
                    options={assignees}
                    style={{
                      width: "100%",
                      borderRadius: "8px",
                      fontFamily: FONT_FAMILY,
                    }}
                  />
                </div>
              )}
            </Space>
          </div>
        </Modal>

        <Modal
          title="Add New Task"
          open={editTaskModal && editingTask?.task === null}
          onCancel={() => {
            setEditTaskModal(false);
            form.resetFields();
          }}
          footer={null}
          style={{ fontFamily: FONT_FAMILY }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={async (values) => {
              if (!editingTask?.projectId) return;

              const trimmedValues = {
                ...values,
                title: values.title.trim(),
              };

              if (!trimmedValues.title) {
                form.setFields([
                  { name: "title", errors: ["Task title cannot be empty"] },
                ]);
                return;
              }

              const payload = {
                title: trimmedValues.title,
                due_date: dayjs(values.due_date).format("YYYY-MM-DD"),
                assignee: showAssigneeField ? values.assignee : "All",
              };

              setLoadingTask(true);
              try {
                await onAddTask?.(editingTask.projectId, payload);
                await fetchProjects(); // Refresh projects to update tasks
                message.success("Task added successfully");
              } catch (error) {
                console.error("Failed to add task:", error);
                message.error("Failed to add task");
              } finally {
                setLoadingTask(false);
                setEditTaskModal(false);
                form.resetFields();
              }
            }}
            style={{ marginTop: "16px", fontFamily: FONT_FAMILY }}
          >
            <Form.Item
              name="title"
              label={
                <span style={{ fontFamily: FONT_FAMILY, fontWeight: 500 }}>
                  Task Title
                </span>
              }
              rules={[{ required: true, message: "Please enter a task title" }]}
            >
              <Input
                placeholder="Enter task title"
                style={{ borderRadius: "8px", fontFamily: FONT_FAMILY }}
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="due_date"
              label={
                <span style={{ fontFamily: FONT_FAMILY, fontWeight: 500 }}>
                  Due Date
                </span>
              }
              rules={[{ required: true, message: "Please select a due date" }]}
            >
              <DatePicker
                style={{
                  width: "100%",
                  borderRadius: "8px",
                  fontFamily: FONT_FAMILY,
                }}
                size="large"
                disabledDate={(current) =>
                  current && current < dayjs().startOf("day")
                }
              />
            </Form.Item>

            {showAssigneeField && (
              <Form.Item
                name="assignee"
                label={
                  <span style={{ fontFamily: FONT_FAMILY, fontWeight: 500 }}>
                    Assignee
                  </span>
                }
                rules={[
                  { required: true, message: "Please select an assignee" },
                ]}
                initialValue="All"
              >
                <Select
                  placeholder="Select assignee"
                  style={{ width: "100%", fontFamily: FONT_FAMILY }}
                  size="large"
                  options={assignees}
                />
              </Form.Item>
            )}

            <Form.Item
              style={{ marginBottom: 0, textAlign: "right", marginTop: "24px" }}
            >
              <Space size="middle">
                <Button
                  size="large"
                  onClick={() => {
                    setEditTaskModal(false);
                    form.resetFields();
                  }}
                  style={{ borderRadius: "8px", fontFamily: FONT_FAMILY }}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  loading={loadingTask}
                  style={{
                    backgroundColor: PRIMARY_COLOR,
                    borderColor: PRIMARY_COLOR,
                    borderRadius: "8px",
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  Add Task
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title={null}
          open={tagModalOpen}
          onCancel={() => {
            setTagModalOpen(false);
            setSelectedProject(null);
            setSelectedEmails([]);
            setSelectedMemberIds([]);
            setSearchTerm("");
          }}
          footer={null}
          centered
          width={520}
          destroyOnHidden
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
          {selectedProject && (
            <div>
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
                    <TagOutlined
                      style={{
                        color: "#374151",
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
                    Tag Project
                  </Text>
                </div>

                <Input
                  placeholder="Search family members..."
                  prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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

              <div style={{ padding: "16px 20px" }}>
                {filteredFamilyMembers.length > 0 ? (
                  <div
                    style={{
                      maxHeight: "280px",
                      overflowY: "auto",
                      marginBottom: "20px",
                      scrollbarWidth: "none",
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
                      {filteredFamilyMembers.map((member: any) => (
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
                                background: selectedMemberIds.includes(
                                  member.id
                                )
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
                              icon={<UserOutlined />}
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
                                  boxShadow:
                                    "0 2px 8px rgba(16, 185, 129, 0.4)",
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
                    <TeamOutlined
                      style={{ fontSize: "40px", marginBottom: "12px" }}
                    />
                    <div style={{ fontSize: "15px", fontWeight: 500 }}>
                      {searchTerm
                        ? "No members found"
                        : "No family members added yet"}
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#9ca3af",
                        marginTop: "4px",
                      }}
                    >
                      {searchTerm
                        ? "Try adjusting your search terms"
                        : "Add family members to start tagging projects."}
                    </div>
                  </div>
                )}

                {selectedMemberIds.length > 0 && (
                  <Button
                    type="primary"
                    block
                    size="large"
                    onClick={async () => {
                      setTagLoading(true);
                      await handleShareProject(selectedMemberIds);
                      setTagLoading(false);
                      setTagModalOpen(false);
                      setSelectedEmails([]);
                      setSelectedMemberIds([]);
                      setSearchTerm("");
                    }}
                    loading={tagLoading}
                    style={{
                      borderRadius: "12px",
                      height: "44px",
                      fontSize: "15px",
                      fontWeight: 600,
                      fontFamily: FONT_FAMILY,
                      background: PRIMARY_COLOR,
                      border: "none",
                      boxShadow: `0 4px 12px ${PRIMARY_COLOR}30`,
                      transition: "all 0.3s ease",
                    }}
                  >
                    Tag with {selectedMemberIds.length} member
                    {selectedMemberIds.length > 1 ? "s" : ""}
                  </Button>
                )}
              </div>
            </div>
          )}
        </Modal>

        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <EditOutlined style={{ color: PRIMARY_COLOR }} />
              <span>Edit Project</span>
            </div>
          }
          open={editProjectModal}
          onCancel={() => {
            setEditProjectModal(false);
            setEditingProject(null);
          }}
          onOk={async () => {
            if (editingProject) {
              await updateProject({
                id: editingProject.id,
                title: editingProject.title,
                description: editingProject.description,
                due_date: editingProject.due_date,
              });
              await fetchProjects();
              message.success("Project updated!");
              setEditProjectModal(false);
            }
          }}
          okText="Save Changes"
          cancelText="Cancel"
          okButtonProps={{
            style: {
              backgroundColor: PRIMARY_COLOR,
              borderColor: PRIMARY_COLOR,
              borderRadius: "8px",
              fontFamily: FONT_FAMILY,
            },
          }}
          style={{ fontFamily: FONT_FAMILY }}
        >
          {editingProject && (
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              <div>
                <Text
                  strong
                  style={{
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  Project Name
                </Text>
                <Input
                  value={editingProject.title}
                  onChange={(e) =>
                    setEditingProject({
                      ...editingProject,
                      title: e.target.value,
                    })
                  }
                  style={{
                    fontFamily: FONT_FAMILY,
                  }}
                />
              </div>
              <div>
                <Text
                  strong
                  style={{
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  Description
                </Text>
                <Input.TextArea
                  rows={3}
                  value={editingProject.description}
                  onChange={(e) =>
                    setEditingProject({
                      ...editingProject,
                      description: e.target.value,
                    })
                  }
                  style={{
                    fontFamily: FONT_FAMILY,
                  }}
                />
              </div>
              <div>
                <Text
                  strong
                  style={{
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  Due Date
                </Text>
                <DatePicker
                  value={
                    editingProject.due_date
                      ? dayjs(editingProject.due_date)
                      : null
                  }
                  onChange={(_, dateString) =>
                    setEditingProject({
                      ...editingProject,
                      due_date: Array.isArray(dateString)
                        ? dateString[0] ?? ""
                        : dateString,
                    })
                  }
                  style={{
                    width: "100%",
                    fontFamily: FONT_FAMILY,
                  }}
                  disabledDate={(current) =>
                    current && current < dayjs().startOf("day")
                  }
                />
              </div>
            </Space>
          )}
        </Modal>
      </Card>
    </div>
  );
};

export default FamilyTasksComponent;
