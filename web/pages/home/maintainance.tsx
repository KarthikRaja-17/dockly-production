"use client";
import React, { useState, useEffect } from "react";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ShareAltOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  MailOutlined,
  UserOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import {
  Card,
  Tabs,
  Button,
  Modal,
  Input,
  Select,
  DatePicker,
  message,
  Popconfirm,
  Spin,
  Alert,
  Checkbox,
  Avatar,
  Form,
} from "antd";
import { Home, FileText } from "lucide-react";
import moment from "moment";
import {
  addMaintenanceTask,
  getMaintenanceTasks,
  updateMaintenanceTask,
  deleteMaintenanceTask,
  Task,
  shareMaintenanceTask,
} from "../../services/home";
import { getUsersFamilyMembers } from "../../services/family";
import { CustomButton, PRIMARY_COLOR } from "../../app/comman";

const { TabPane } = Tabs;
const { Option } = Select;

interface MaintenanceSectionProps {
  hasAdvancedFeatures?: boolean;
}

interface PredefinedTask {
  category: "home" | "auto" | "completed";
  name: string;
  icon: string;
  desc: string;
}

interface TaskFormData {
  category: string;
  name: string;
  details: string;
  date: string;
  priority: string;
  propertyIcon: string;
  isRecurring: boolean;
}

const FONT_FAMILY =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const MaintenanceSection: React.FC<MaintenanceSectionProps> = ({
  hasAdvancedFeatures = true,
}) => {
  const [formData, setFormData] = useState<TaskFormData>({
    category: "",
    name: "",
    details: "",
    date: "",
    priority: "",
    propertyIcon: "",
    isRecurring: false,
  });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [errorMessage, setErrorMessage] = useState("");
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [currentShareTask, setCurrentShareTask] = useState<Task | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [shareForm] = Form.useForm();
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const predefined: PredefinedTask[] = [
    {
      category: "home",
      name: "Replace HVAC Filters",
      icon: "🏠",
      desc: "Monthly maintenance",
    },
    {
      category: "home",
      name: "Check Smoke/CO Detectors",
      icon: "🏠",
      desc: "Annual check",
    },
    { category: "auto", name: "Oil Change", icon: "🚗", desc: "Set Schedule" },
    {
      category: "auto",
      name: "Rotate Tires",
      icon: "🚗",
      desc: "Set Schedule",
    },
  ];

  const categories = {
    home: { title: "Home" },
    auto: { title: "Vehicle" },
    completed: { title: "Completed" },
  };

  const categoryOrder = ["home", "auto", "completed"];

  const gradientColors = [
    "linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)",
    "linear-gradient(135deg, #fefcbf 0%, #fef3c7 100%)",
    "linear-gradient(135deg, #d1fae5 0%, #c7f0e0 100%)",
    "linear-gradient(135deg, #fed7e2 0%, #fce7f3 100%)",
  ];

  const sectionCardStyle: React.CSSProperties = {
    background: "#ffffff",
    borderRadius: "0.75rem",
    boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    overflow: "hidden",
    transition: "box-shadow 0.3s",
    height: "500px",
    display: "flex",
    flexDirection: "column",
  };

  const sectionHeaderStyle: React.CSSProperties = {
    padding: "1.25rem",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "linear-gradient(to bottom, #ffffff, #fafbfc)",
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: "1.125rem",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    margin: 0,
  };

  const sectionIconStyle: React.CSSProperties = {
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  };

  const maintenanceContentStyle: React.CSSProperties = {
    padding: "1.5rem",
    maxHeight: "340px",
    overflowY: "auto",
    flex: 1,
  };

  const noDataStyle: React.CSSProperties = {
    border: "1px dashed #d9d9d9",
    borderRadius: "4px",
    padding: "20px",
    textAlign: "center",
    margin: "1.5rem",
    backgroundColor: "#fafafa",
    marginTop: "1.5rem",
  };

  const placeholderCardStyle: React.CSSProperties = {
    background: "#e2e8f0",
    borderRadius: "0.5rem",
    padding: "1.25rem",
    marginBottom: "1rem",
    cursor: "pointer",
    transition: "all 0.2s",
    position: "relative",
    border: "1px dashed #6b7280",
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    color: "#6b7280",
  };

  const placeholderIconStyle: React.CSSProperties = {
    fontSize: "2rem",
    color: "#6b7280",
  };

  const placeholderNameStyle: React.CSSProperties = {
    fontWeight: 600,
    fontSize: "1rem",
    color: "#6b7280",
  };

  const placeholderDescStyle: React.CSSProperties = {
    fontSize: "0.8125rem",
    color: "#9ca3af",
  };

  const arrowStyle: React.CSSProperties = {
    position: "absolute",
    right: "1rem",
    color: "#6b7280",
    opacity: 0,
    transition: "opacity 0.2s",
    pointerEvents: "none",
    fontSize: "16px",
  };

  const toggleExpand = (name: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(name)) {
        newSet.delete(name);
      } else {
        newSet.add(name);
      }
      return newSet;
    });
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "HIGH":
        return "#ef4444";
      case "MEDIUM":
        return "#f59e0b";
      case "LOW":
        return "#10b981";
      default:
        return "#64748b";
    }
  };

  const TaskSubCard: React.FC<{
    predefined: PredefinedTask;
    task?: Task;
    expanded: boolean;
    gradientIndex?: number;
  }> = ({ predefined, task, expanded, gradientIndex = 0 }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [localLoading, setLocalLoading] = useState(false);

    const taskCardStyle: React.CSSProperties = {
      background: task
        ? gradientColors[gradientIndex % gradientColors.length]
        : "#e2e8f0",
      borderRadius: "0.5rem",
      padding: "1.25rem",
      marginBottom: "1rem",
      cursor: "pointer",
      transition: "all 0.2s",
      position: "relative",
      border: task ? "1px solid #e2e8f0" : "1px dashed #6b7280",
      color: task ? "#000000" : "#6b7280",
      opacity: task?.completed ? 0.7 : 1,
    };

    const taskProviderStyle: React.CSSProperties = {
      fontWeight: 600,
      marginBottom: "0.75rem",
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      fontSize: "0.9375rem",
      color: task ? (task.completed ? "#64748b" : "#000000") : "#6b7280",
      textDecoration: task?.completed ? "line-through" : "none",
    };

    const coverageGridStyle: React.CSSProperties = {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "0.75rem",
      fontSize: "0.8125rem",
    };

    const coverageItemStyle: React.CSSProperties = {
      display: "flex",
      justifyContent: "space-between",
      padding: "0.25rem 0",
    };

    const coverageLabelStyle: React.CSSProperties = {
      color: task ? "#64748b" : "#9ca3af",
    };

    const coverageValueStyle: React.CSSProperties = {
      fontWeight: 600,
      color: task ? "#000000" : "#6b7280",
    };

    const descStyle: React.CSSProperties = {
      fontSize: "0.8125rem",
      color: task ? "#64748b" : "#9ca3af",
      marginTop: "0.5rem",
    };

    const detailItemStyle: React.CSSProperties = {
      fontSize: "0.875rem",
      marginBottom: "0.5rem",
    };

    const detailLabelStyle: React.CSSProperties = {
      color: task ? "#64748b" : "#9ca3af",
      marginBottom: "0.25rem",
      fontSize: "0.75rem",
      fontWeight: 600,
      textTransform: "uppercase",
    };

    const detailValueStyle: React.CSSProperties = {
      fontWeight: 500,
      color: task ? "#000000" : "#6b7280",
    };

    const propertyItemDetailsStyle: React.CSSProperties = {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "1rem",
      marginTop: "1.25rem",
      paddingTop: "1.25rem",
      borderTop: "1px solid #e2e8f0",
    };

    const actionButtonsStyle: React.CSSProperties = {
      display: "flex",
      gap: "12px",
      marginTop: "1.25rem",
      justifyContent: "flex-end",
    };

    const handleEdit = (e: React.MouseEvent) => {
      e.stopPropagation();
      setEditingTask(task!);
      setFormData({
        category: predefined.category,
        name: task!.text,
        details: task!.details || "",
        date: task!.date || "",
        priority: task!.priority || "",
        propertyIcon: task!.propertyIcon || predefined.icon,
        isRecurring: !!task!.isRecurring,
      });
      setIsModalVisible(true);
    };

    const handleDelete = async () => {
      try {
        setLocalLoading(true);
        await deleteMaintenanceTask(task!.id);
        message.success("Task deleted successfully");
        fetchTasks();
      } catch (error) {
        console.error("Delete error:", error);
        message.error("Failed to delete task");
      } finally {
        setLocalLoading(false);
      }
    };

    const handleShareTask = (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentShareTask(task ?? null);
      setSelectedMemberIds([]);
      setShareModalVisible(true);
      shareForm.resetFields();
      setSearchTerm("");
    };

    const handleCardClick = () => {
      if (task) {
        toggleExpand(predefined.name);
      } else {
        setFormData({
          category: predefined.category,
          name: predefined.name,
          details: predefined.desc,
          date: "",
          priority: "",
          propertyIcon: predefined.icon,
          isRecurring:
            predefined.desc.includes("Monthly") ||
            predefined.desc.includes("Annual"),
        });
        setEditingTask(null);
        setIsModalVisible(true);
      }
    };

    const arrowContent = task ? "→" : <PlusOutlined />;
    const arrowColor = task ? PRIMARY_COLOR : "#6b7280";

    return (
      <div
        style={taskCardStyle}
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={taskProviderStyle}>
          <span>{predefined.icon}</span>
          <span>{predefined.name}</span>
        </div>
        {task ? (
          <div style={coverageGridStyle}>
            <div style={coverageItemStyle}>
              <span style={coverageLabelStyle}>Due Date</span>
              <span style={coverageValueStyle}>{task.date}</span>
            </div>
            <div style={coverageItemStyle}>
              <span style={coverageLabelStyle}>Priority</span>
              <span style={coverageValueStyle}>{task.priority}</span>
            </div>
          </div>
        ) : (
          <div style={descStyle}>{predefined.desc}</div>
        )}
        {task && expanded && (
          <div>
            <div style={propertyItemDetailsStyle}>
              <div style={detailItemStyle}>
                <div style={detailLabelStyle}>Details</div>
                <div style={detailValueStyle}>
                  <FileText size={16} />
                  {task.details || "N/A"}
                </div>
              </div>
              <div style={detailItemStyle}>
                <div style={detailLabelStyle}>Recurring</div>
                <div style={detailValueStyle}>
                  {task.isRecurring ? "Yes" : "No"}
                </div>
              </div>
              <div style={detailItemStyle}>
                <div style={detailLabelStyle}>Completed</div>
                <div style={detailValueStyle}>
                  <Checkbox
                    checked={task.completed}
                    onChange={() => toggleTaskCompletion(task.id)}
                  />
                </div>
              </div>
            </div>
            <div style={actionButtonsStyle}>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleEdit}
                style={{ borderRadius: "6px" }}
                loading={localLoading}
              />
              <Button
                type="primary"
                icon={<ShareAltOutlined />}
                onClick={handleShareTask}
                style={{
                  borderRadius: "6px",
                  backgroundColor: "#10b981",
                  borderColor: "#10b981",
                }}
                loading={localLoading}
              />
              {task.completed && (
                <Popconfirm
                  title="Are you sure to delete this task?"
                  onConfirm={handleDelete}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button
                    type="primary"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={(e) => e.stopPropagation()}
                    style={{ borderRadius: "6px" }}
                    loading={localLoading}
                  />
                </Popconfirm>
              )}
            </div>
          </div>
        )}
        <div
          style={{
            position: "absolute",
            right: "1rem",
            top: "50%",
            transform: "translateY(-50%)",
            color: arrowColor,
            opacity: isHovered ? 1 : 0,
            transition: "opacity 0.2s",
            pointerEvents: "none",
            fontSize: "16px",
          }}
        >
          {arrowContent}
        </div>
      </div>
    );
  };

  const PlaceholderCard: React.FC<{ onAdd: () => void }> = ({ onAdd }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <div
        style={placeholderCardStyle}
        onClick={onAdd}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={placeholderIconStyle}>
          <PlusOutlined />
        </div>
        <div>
          <div style={placeholderNameStyle}>Add Custom Task</div>
          <div style={placeholderDescStyle}>Add a new maintenance task</div>
        </div>
        <div style={{ ...arrowStyle, opacity: isHovered ? 1 : 0 }}>
          <PlusOutlined />
        </div>
      </div>
    );
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await getMaintenanceTasks({ is_active: 1 });
      if (response.status === 1 && response.payload.tasks) {
        const mappedTasks = response.payload.tasks.map((task: any) => ({
          ...task,
          text: task.name || "Unnamed Task",
          id: String(task.id),
          date: task.date || "No Date",
          completed: !!task.completed,
          priority: task.priority || undefined,
          details: task.details || undefined,
          propertyIcon: task.property_icon || undefined,
          isRecurring: !!task.is_recurring,
          created_at: task.created_at || undefined,
          updated_at: task.updated_at || undefined,
          is_active: task.is_active ?? 1,
        }));
        setTasks(mappedTasks);
      } else {
        message.error(response.message || "Failed to fetch tasks");
        setTasks([]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      message.error("Failed to fetch tasks");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFamilyMembers = async () => {
    try {
      const res = await getUsersFamilyMembers({});
      if (res.status) {
        const filtered = (res.payload.members || []).filter(
          (m: any) =>
            m.relationship !== "me" && m.status?.toLowerCase() !== "pending"
        );
        setFamilyMembers(filtered);
      }
    } catch (error) {
      message.error("Failed to fetch family members");
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchFamilyMembers();
  }, []);

  const toggleTaskCompletion = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    try {
      const response = await updateMaintenanceTask(taskId, {
        completed: !task.completed,
      });
      if (response.status === 1) {
        message.success("Task updated successfully");
        fetchTasks();
      } else {
        message.error(response.message || "Failed to update task");
      }
    } catch (error) {
      console.error("Update task error:", error);
      message.error("Failed to update task");
    }
  };

  const handleAdd = () => {
    setFormData({
      category: activeTab,
      name: "",
      details: "",
      date: "",
      priority: "",
      propertyIcon: "",
      isRecurring: false,
    });
    setEditingTask(null);
    setErrorMessage("");
    setIsModalVisible(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    try {
      if (!formData.category || !formData.name || !formData.date) {
        setErrorMessage("Please fill in all required fields.");
        setLoading(false);
        return;
      }

      const taskData: Partial<Task> = {
        text: formData.name,
        date: formData.date
          ? moment(formData.date).format("YYYY-MM-DD")
          : undefined,
        priority: formData.priority,
        details: formData.details,
        propertyIcon:
          formData.propertyIcon || (formData.category === "home" ? "🏡" : "🚗"),
        isRecurring: formData.isRecurring,
        completed: false,
        is_active: 1,
      };

      if (editingTask) {
        await updateMaintenanceTask(editingTask.id, taskData);
        message.success("Task updated successfully");
      } else {
        await addMaintenanceTask(taskData);
        message.success("Task added successfully");
      }
      setIsModalVisible(false);
      setFormData({
        category: "",
        name: "",
        details: "",
        date: "",
        priority: "",
        propertyIcon: "",
        isRecurring: false,
      });
      setEditingTask(null);
      fetchTasks();
    } catch (error: any) {
      console.error("Save error:", error);
      setErrorMessage(
        `Failed to ${editingTask ? "update" : "add"} task: ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setFormData({
      category: "",
      name: "",
      details: "",
      date: "",
      priority: "",
      propertyIcon: "",
      isRecurring: false,
    });
    setEditingTask(null);
    setErrorMessage("");
  };
  const handleShareTask = async () => {
    if (!currentShareTask || selectedMemberIds.length === 0) {
      message.warning("Please select family members to share with");
      return;
    }

    const selectedMembers = familyMembers.filter(
      (member: any) =>
        selectedMemberIds.includes(member.id) &&
        member.status?.toLowerCase() !== "pending"
    );

    const emails = selectedMembers
      .map((member: any) => member.email)
      .filter((email: string) => !!email);

    if (emails.length === 0) {
      message.warning("No valid emails found for selected members");
      return;
    }

    try {
      setLoading(true);

      // Correct call: pass a single object matching the expected shape
      await shareMaintenanceTask({
        task: currentShareTask,
        email: emails, // string | string[]
        tagged_members: [], // or whatever you need to pass
      });

      const memberNames = selectedMembers.map((m: any) => m.name).join(", ");
      message.success(`Task shared with ${memberNames}!`);

      setShareModalVisible(false);
      setCurrentShareTask(null);
      setSelectedMemberIds([]);
    } catch (err: any) {
      console.error("Error sharing task:", err, err?.response?.data);
      message.error("Failed to share task");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailShare = async () => {
    try {
      const values = await shareForm.validateFields();
      if (!currentShareTask) {
        message.error("No task selected for sharing");
        return;
      }

      setLoading(true);

      await shareMaintenanceTask({
        task: currentShareTask,
        email: values.email, // string | string[]
        tagged_members: [], // optional
      });

      message.success("Task shared via email!");
      setShareModalVisible(false);
      shareForm.resetFields();
      setCurrentShareTask(null);
      setSelectedMemberIds([]);
    } catch (err) {
      console.error("Error sharing task via email:", err);
      message.error("Failed to share task via email");
    } finally {
      setLoading(false);
    }
  };

  const filteredFamilyMembers = familyMembers
    .filter((member: any) => member.relationship !== "me")
    .filter((member: any) => member.status?.toLowerCase() !== "pending")
    .filter((member: any) => member.email && member.email.trim())
    .filter((member: any) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const getTaskCategory = (
    propertyIcon: string | undefined
  ): "home" | "auto" => {
    if (propertyIcon === "🏡" || propertyIcon === "🏠") return "home";
    if (propertyIcon === "🚗" || propertyIcon === "🚙") return "auto";
    return "home"; // default
  };

  const renderTasks = (category: string) => {
    if (category === "completed") {
      const completedTasks = tasks.filter((t) => t.completed);
      return (
        <div style={maintenanceContentStyle}>
          {completedTasks.map((tsk, index) => (
            <TaskSubCard
              key={tsk.id}
              predefined={{
                category: "completed",
                name: tsk.text,
                icon: tsk.propertyIcon || "✅",
                desc: "Completed task",
              }}
              task={tsk}
              expanded={expandedItems.has(tsk.text)}
              gradientIndex={index}
            />
          ))}
        </div>
      );
    } else {
      const catPre = predefined.filter((p) => p.category === category);
      const catTasks = tasks.filter(
        (t) => getTaskCategory(t.propertyIcon) === category && !t.completed
      );
      if (catPre.length === 0 && catTasks.length === 0) return null;
      return (
        <div style={maintenanceContentStyle}>
          {catPre.map((p, index) => {
            const tsk = catTasks.find((t) => t.text === p.name);
            return (
              <TaskSubCard
                key={p.name}
                predefined={p}
                task={tsk}
                expanded={expandedItems.has(p.name)}
                gradientIndex={index}
              />
            );
          })}
          {catTasks
            .filter(
              (t) =>
                !predefined.some(
                  (p) => p.category === category && p.name === t.text
                )
            )
            .map((tsk, index) => (
              <TaskSubCard
                key={tsk.id}
                predefined={{
                  category: category as "home" | "auto" | "completed",
                  name: tsk.text,
                  icon: tsk.propertyIcon || "⚙️",
                  desc: "Custom task",
                }}
                task={tsk}
                expanded={expandedItems.has(tsk.text)}
                gradientIndex={catPre.length + index}
              />
            ))}
          <PlaceholderCard onAdd={handleAdd} />
        </div>
      );
    }
  };

  if (loading) {
    return (
      <Card
        style={sectionCardStyle}
        bodyStyle={{
          padding: 0,
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={sectionHeaderStyle}>
          <h2 style={sectionTitleStyle}>
            <div style={sectionIconStyle}>🔧</div>
            <span>Property Maintenance</span>
          </h2>
          <CustomButton
            label="Add Task" // tooltip
            // icon={<PlusOutlined />}
            // size="small"
            onClick={handleAdd}
            // style={{
            //   backgroundColor: PRIMARY_COLOR,
            //   borderColor: PRIMARY_COLOR,
            //   color: "#fff",
            //   borderRadius: "6px",
            //   height: "32px",
            //   padding: "0 8px",
            //   width: "30px",
            //   display: "flex",
            //   alignItems: "center",
            //   gap: "2px",
            //   justifyContent: "center",
            // }}
          />
        </div>
        <div style={maintenanceContentStyle}>
          <div style={{ padding: "2rem", textAlign: "center" }}>
            <Spin />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card
        style={sectionCardStyle}
        bodyStyle={{
          padding: 0,
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={sectionHeaderStyle}>
          <h2 style={sectionTitleStyle}>
            <div style={sectionIconStyle}>🔧</div>
            <span>Property Maintenance</span>
          </h2>
          <CustomButton
            label="Add Property Maintenance" // tooltip text
            // icon={<PlusOutlined />}
            onClick={handleAdd}
            // style={{
            //   backgroundColor: PRIMARY_COLOR,
            //   borderColor: PRIMARY_COLOR,
            //   borderRadius: "6px",
            //   height: "32px",
            //   width: "32px",
            //   display: "flex",
            //   alignItems: "center",
            //   justifyContent: "center",
            //   padding: 0,
            // }}
          />

        </div>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            marginTop: "0.5rem",
          }}
          tabBarStyle={{
            padding: "1rem 1.5rem 0",
            background: "#ffffff",
            margin: 0,
          }}
        >
          <TabPane tab="Home" key="home" style={{ flex: 1 }}>
            {renderTasks("home")}
          </TabPane>
          <TabPane tab="Vehicle" key="auto" style={{ flex: 1 }}>
            {renderTasks("auto")}
          </TabPane>
          <TabPane tab="Completed" key="completed" style={{ flex: 1 }}>
            {renderTasks("completed")}
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "8px 0",
              borderBottom: "1px solid #f0f0f0",
              paddingBottom: "16px",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background: `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, #096dd9 100%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 4px 12px ${PRIMARY_COLOR}30`,
              }}
            >
              <Home style={{ fontSize: "20px", color: "white" }} />
            </div>
            <div>
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "#1a202c",
                  lineHeight: 1.2,
                  marginBottom: "2px",
                }}
              >
                {editingTask
                  ? `Edit ${editingTask.text}`
                  : "Add Maintenance Task"}
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "#64748b",
                  fontWeight: 400,
                }}
              >
                {editingTask
                  ? "Update task information"
                  : "Add a new maintenance task"}
              </div>
            </div>
          </div>
        }
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
        width={700}
        style={{ top: 20 }}
        bodyStyle={{
          padding: "24px",
          maxHeight: "70vh",
          overflowY: "auto",
          background: "#fafbfc",
        }}
        maskStyle={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
      >
        <form onSubmit={handleFormSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "#374151",
                marginBottom: "8px",
                display: "block",
              }}
            >
              Category
            </label>
            <Select
              size="large"
              value={formData.category}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, category: value }))
              }
              placeholder="Select category"
              style={{
                width: "100%",
                borderRadius: "10px",
                fontSize: "15px",
                height: "48px",
              }}
              dropdownStyle={{
                borderRadius: "12px",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
              }}
            >
              {categoryOrder
                .filter((cat) => cat !== "completed")
                .map((category) => (
                  <Option key={category} value={category}>
                    {categories[category as keyof typeof categories].title}
                  </Option>
                ))}
            </Select>
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "#374151",
                marginBottom: "8px",
                display: "block",
              }}
            >
              Task Name
            </label>
            <Input
              size="large"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter task name"
              style={{
                borderRadius: "10px",
                border: "2px solid #e2e8f0",
                fontSize: "15px",
                height: "48px",
                background: "white",
                transition: "all 0.2s ease",
              }}
            />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "20px",
              marginBottom: "20px",
            }}
          >
            <div>
              <label
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: "8px",
                  display: "block",
                }}
              >
                Due Date
              </label>
              <DatePicker
                value={formData.date ? moment(formData.date) : null}
                onChange={(date) =>
                  setFormData((prev) => ({
                    ...prev,
                    date: date ? date.format("YYYY-MM-DD") : "",
                  }))
                }
                format="YYYY-MM-DD"
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  border: "2px solid #e2e8f0",
                  fontSize: "15px",
                  height: "48px",
                  background: "white",
                  transition: "all 0.2s ease",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: "8px",
                  display: "block",
                }}
              >
                Priority
              </label>
              <Select
                size="large"
                value={formData.priority}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, priority: value }))
                }
                placeholder="Select priority"
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  fontSize: "15px",
                  height: "48px",
                }}
              >
                <Option value="HIGH">High</Option>
                <Option value="MEDIUM">Medium</Option>
                <Option value="LOW">Low</Option>
              </Select>
            </div>
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "#374151",
                marginBottom: "8px",
                display: "block",
              }}
            >
              Details
            </label>
            <Input.TextArea
              rows={4}
              value={formData.details}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, details: e.target.value }))
              }
              placeholder="Enter details"
              style={{
                borderRadius: "10px",
                border: "2px solid #e2e8f0",
                fontSize: "15px",
                background: "white",
                transition: "all 0.2s ease",
              }}
            />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "#374151",
                marginBottom: "8px",
                display: "block",
              }}
            >
              Property Icon
            </label>
            <Select
              size="large"
              value={formData.propertyIcon}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, propertyIcon: value }))
              }
              placeholder="Select property icon"
              style={{
                width: "100%",
                borderRadius: "10px",
                fontSize: "15px",
                height: "48px",
              }}
            >
              <Option value="🏡">Home 🏡</Option>
              <Option value="🚗">Vehicle 🚗</Option>
              <Option value="🏖️">Vacation Property 🏖️</Option>
            </Select>
          </div>
          <div style={{ marginBottom: "20px" }}>
            <Checkbox
              checked={formData.isRecurring}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  isRecurring: e.target.checked,
                }))
              }
            >
              Is Recurring
            </Checkbox>
          </div>
          {errorMessage && (
            <Alert
              message="Error"
              description={errorMessage}
              type="error"
              showIcon
              closable
              onClose={() => setErrorMessage("")}
              style={{ marginBottom: "16px", borderRadius: "8px" }}
            />
          )}
          <div
            style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}
          >
            <Button
              size="large"
              onClick={handleModalCancel}
              style={{
                borderRadius: "10px",
                height: "48px",
                padding: "0 24px",
                fontSize: "15px",
                fontWeight: 500,
                border: "2px solid #e2e8f0",
                color: "#64748b",
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              style={{
                borderRadius: "10px",
                fontSize: "15px",
                fontWeight: 600,
                background: `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, #096dd9 100%)`,
                border: "none",
                boxShadow: `0 4px 12px ${PRIMARY_COLOR}30`,
                height: "48px",
                padding: "0 32px",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = `0 6px 16px ${PRIMARY_COLOR}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = `0 4px 12px ${PRIMARY_COLOR}30`;
              }}
            >
              {loading ? "Saving..." : editingTask ? "Update Task" : "Add Task"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        title={null}
        open={shareModalVisible}
        onCancel={() => {
          setShareModalVisible(false);
          setCurrentShareTask(null);
          setSelectedMemberIds([]);
          shareForm.resetFields();
          setSearchTerm("");
        }}
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
        {currentShareTask && (
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
                  <ShareAltOutlined
                    style={{
                      color: "#374151",
                      fontSize: "18px",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: "18px",
                    fontWeight: 600,
                    color: "#1f2937",
                    fontFamily: FONT_FAMILY,
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                  }}
                >
                  Share Task
                </span>
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
                        <span
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
                            wordBreak: "break-word",
                            overflowWrap: "break-word",
                          }}
                        >
                          {member.name}
                        </span>
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
                  <div
                    style={{
                      fontSize: "15px",
                      fontWeight: 500,
                      wordBreak: "break-word",
                      overflowWrap: "break-word",
                    }}
                  >
                    {searchTerm
                      ? "No members found"
                      : "No family members added yet"}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#9ca3af",
                      marginTop: "4px",
                      wordBreak: "break-word",
                      overflowWrap: "break-word",
                    }}
                  >
                    {searchTerm
                      ? "Try adjusting your search terms"
                      : "Add family members to start sharing tasks."}
                  </div>
                </div>
              )}
              {selectedMemberIds.length > 0 && (
                <Button
                  type="primary"
                  block
                  size="large"
                  onClick={handleShareTask}
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
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                  }}
                >
                  Share with {selectedMemberIds.length} member
                  {selectedMemberIds.length > 1 ? "s" : ""}
                </Button>
              )}
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
                  <span
                    style={{
                      color: "#374151",
                      fontSize: "15px",
                      fontWeight: 600,
                      fontFamily: FONT_FAMILY,
                      wordBreak: "break-word",
                      overflowWrap: "break-word",
                    }}
                  >
                    Or share via email
                  </span>
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
                          wordBreak: "break-all",
                          overflowWrap: "break-word",
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
                        flexShrink: 0,
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
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
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
    </>
  );
};

export default MaintenanceSection;