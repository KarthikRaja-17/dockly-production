"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button, Form, Input, Select, message, Spin, Checkbox, Dropdown, Menu } from "antd";
import { PlusOutlined, EditOutlined, CheckOutlined, CloseOutlined, ReloadOutlined, MoreOutlined } from "@ant-design/icons";
import { addWeeklyTask, getWeeklyTasks, updateWeeklyTask, deleteWeeklyTask, getUsersFamilyMembers } from "../../../services/family";
import { CustomModal } from "../../../app/comman";

const FONT_FAMILY =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

interface Task {
  id: string;
  title: string;
  schedule: string;
  assigned_to: string;
  completed: boolean;
  tagged_ids?: string[];
}

interface FamilyMember {
  id: number;
  name: string;
  color: string;
  type: "family" | "pets";
  initials: string;
  status?: "pending" | "accepted";
  user_id?: string;
  role?: string;
}

interface WeeklyTasksProps {
  familyMembers?: FamilyMember[];
}

const WeeklyTasks: React.FC<WeeklyTasksProps> = ({
  familyMembers = [],
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [resetLoading, setResetLoading] = useState(false);
  // Inline editing states
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskData, setEditingTaskData] = useState<Task>({
    id: "",
    title: "",
    schedule: "",
    assigned_to: "",
    completed: false,
  });
  const titleInputRef = useRef<any>(null);

  // Hover state for badge flip
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);
  // State to track actively open dropdown (clicked)
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  // Focus title input when editing starts
  useEffect(() => {
    if (editingTaskId && titleInputRef.current) {
      setTimeout(() => {
        titleInputRef.current?.focus();
        titleInputRef.current?.select();
      }, 100);
    }
  }, [editingTaskId]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await getWeeklyTasks();
      if (response?.data?.status === 1) {
        setTasks(response.data?.payload?.tasks || []);
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      message.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = () => {
    setEditingTask(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    form.setFieldsValue(task);
    setModalVisible(true);
    // Close the dropdown when edit is clicked
    setActiveDropdownId(null);
  };

  // Handle double-click to edit task inline
  const handleTaskDoubleClick = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTaskId(task.id);
    setEditingTaskData({
      id: task.id,
      title: task.title,
      schedule: task.schedule,
      assigned_to: task.assigned_to,
      completed: task.completed,
    });
  };

  // Save inline edited task
  const handleSaveInlineEdit = async (task: Task) => {
    // Validate required fields
    if (!editingTaskData.title.trim()) {
      message.error("Please enter a task title");
      return;
    }

    setLoading(true);
    try {
      const res = await updateWeeklyTask({
        id: task.id,
        title: editingTaskData.title,
        schedule: editingTaskData.schedule,
        assigned_to: editingTaskData.assigned_to,
        completed: editingTaskData.completed,
      });

      if (res.data?.status === 1) {
        message.success("Task updated successfully");
        await fetchTasks();
        setEditingTaskId(null);
        setEditingTaskData({
          id: "",
          title: "",
          schedule: "",
          assigned_to: "",
          completed: false,
        });
      } else {
        message.error("Failed to update task");
      }
    } catch (err) {
      console.error("Error updating task:", err);
      message.error("Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  // Cancel inline editing
  const handleCancelInlineEdit = () => {
    setEditingTaskId(null);
    setEditingTaskData({
      id: "",
      title: "",
      schedule: "",
      assigned_to: "",
      completed: false,
    });
  };

  const handleToggleTask = async (task: Task) => {
    try {
      await updateWeeklyTask({
        id: task.id,
        title: task.title,
        schedule: task.schedule,
        assigned_to: task.assigned_to,
        completed: !task.completed
      });
      fetchTasks();
    } catch (error) {
      console.error("Failed to toggle task:", error);
      message.error("Failed to update task");
    }
  };

  const getAssigneeColor = (assignedTo: string) => {
    if (assignedTo === "All" || !assignedTo) return "#97a9ffff"; // default blue for "All"
    const member = familyMembers.find(m => m.name === assignedTo);
    return member ? member.color : "#a0aff8ff"; // fallback to blue
  };

  // Function to determine if text should be white or dark based on background color
  const getTextColor = (backgroundColor: string) => {
    // Convert hex to RGB
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return white for dark backgrounds, dark for light backgrounds
    return luminance > 0.5 ? '#333333' : '#ffffff';
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingTask) {
        await updateWeeklyTask({ ...values, id: editingTask.id });
        message.success("Task updated successfully");
      } else {
        await addWeeklyTask(values);
        message.success("Task added successfully");
      }
      setModalVisible(false);
      form.resetFields();
      fetchTasks();
    } catch (error) {
      console.error("Failed to save task:", error);
      message.error("Failed to save task");
    }
  };

  const handleReset = () => {
    // TODO: Implement backend integration for reset functionality
    message.info("Reset functionality will be integrated with backend later");
  };

  const getAssigneeInitials = (assignedTo: string) => {
    if (assignedTo === "All" || !assignedTo) return "All";
    const member = familyMembers.find(m => m.name === assignedTo);
    return member ? member.name.charAt(0).toUpperCase() : assignedTo.charAt(0).toUpperCase();
  };

  // Filter out family members where role is "me"
  const filteredFamilyMembers = familyMembers.filter(member => member.role !== "me");

  const familyMemberOptions = [
    { label: "All", value: "All" },
    ...filteredFamilyMembers.map(member => ({
      label: member.name,
      value: member.name
    }))
  ];

  const handleResetAll = async () => {
    const completedTasks = tasks.filter(task => task.completed);
    
    if (completedTasks.length === 0) {
      message.info('No completed tasks to reset');
      return;
    }

    setResetLoading(true);
    
    try {
      const updatePromises = completedTasks.map(task =>
        updateWeeklyTask({
          id: task.id,
          title: task.title,
          schedule: task.schedule,
          assigned_to: task.assigned_to,
          completed: false,
          tagged_ids: task.tagged_ids,
        })
      );

      const results = await Promise.all(updatePromises);
      
      // Check if all updates were successful
      const allSuccessful = results.every(result => result.status === 1);
      
      if (allSuccessful) {
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.completed ? { ...task, completed: false } : task
          )
        );
        message.success(`Successfully reset ${completedTasks.length} completed tasks`);
      } else {
        message.error('Some tasks failed to reset');
        // Refresh the list to get the current state
        fetchTasks();
      }
    } catch (error) {
      message.error('Failed to reset tasks');
    } finally {
      setResetLoading(false);
    }
  };

  const completedCount = tasks.filter(t => t.completed).length;

  // Create dropdown menu for each task
  const getDropdownMenu = (task: Task) => (
    <Menu
      items={[
        {
          key: 'edit',
          label: 'Edit',
          onClick: () => handleEditTask(task),
        }
      ]}
    />
  );

  // Handle dropdown visibility change
  const handleDropdownVisibleChange = (taskId: string, visible: boolean) => {
    if (visible) {
      setActiveDropdownId(taskId);
    } else {
      setActiveDropdownId(null);
    }
  };

  return (
    <>
      <div
        style={{
          backgroundColor: "#f9fafb",
          borderRadius: "8px",
          padding: "12px",
          height: "460px",
          fontFamily: FONT_FAMILY,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "12px",
            paddingBottom: "8px",
            borderBottom: "2px solid #e5e7eb",
            flexShrink: 0,
          }}
        >
          <div>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "#374151",
                margin: "0 0 4px 0",
                fontFamily: FONT_FAMILY,
              }}
            >
              Weekly Tasks
            </h3>
            <div
              style={{
                fontSize: "12px",
                color: "#6b7280",
                fontFamily: FONT_FAMILY,
              }}
            >
              {completedCount}/{tasks.length} complete
            </div>
          </div>
          <Button
            type="text"
            size="small"
            icon={<ReloadOutlined />}
            onClick={handleResetAll}
            style={{
              color: "#6b7280",
              fontSize: "12px",
              height: "24px",
              width: "24px",
              minWidth: "24px",
              padding: 0,
            }}
            title="Reset"
          />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            flex: 1,
            overflowY: "hidden",
            overflowX: "hidden",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            minHeight: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.overflowY = "auto";
            // Add scrollbar styles
            const style = document.createElement('style');
            style.textContent = `
              .task-scroll::-webkit-scrollbar { width: 6px; }
              .task-scroll::-webkit-scrollbar-track { background: transparent; }
              .task-scroll::-webkit-scrollbar-thumb { background-color: rgba(0,0,0,0.2); border-radius: 3px; }
              .task-scroll::-webkit-scrollbar-thumb:hover { background-color: rgba(0,0,0,0.3); }
            `;
            document.head.appendChild(style);
            e.currentTarget.className += ' task-scroll';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.overflowY = "hidden";
            // Remove scrollbar styles
            const styles = document.querySelectorAll('style');
            styles.forEach(style => {
              if (style.textContent?.includes('.task-scroll::-webkit-scrollbar')) {
                style.remove();
              }
            });
            e.currentTarget.className = e.currentTarget.className.replace(' task-scroll', '');
          }}
        >
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "30px" }}>
              <Spin size="large" />
            </div>
          ) : tasks.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                color: "#6b7280",
                fontSize: "10px",
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              No tasks added yet.
            </div>
          ) : (
            tasks.map((task) => {
              const assigneeColor = getAssigneeColor(task.assigned_to);
              const textColor = getTextColor(assigneeColor);
              const isHovered = hoveredTaskId === task.id;
              const isDropdownActive = activeDropdownId === task.id;
              // Show more button if hovered OR dropdown is actively open
              const shouldShowMoreButton = isHovered || isDropdownActive;

              return (
                <div
                  key={task.id}
                  style={{
                    backgroundColor: "white",
                    borderRadius: "6px",
                    padding: "8px",
                    border: `1px solid ${assigneeColor}`,
                    transition: "all 0.2s",
                    cursor: "pointer",
                    flexShrink: 0,
                    minHeight: "60px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
                    setHoveredTaskId(task.id);

                    // Clear existing timeout if hovering again quickly
                    if (timeoutRef.current) {
                      clearTimeout(timeoutRef.current);
                    }

                    // Auto flip back after 2s
                    timeoutRef.current = setTimeout(() => {
                      setHoveredTaskId((prev) => {
                        // only reset if dropdown is not active for this task
                        return activeDropdownId === task.id ? prev : null;
                      });
                    }, 2000);
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "none";

                    // Clear timeout if leaving early
                    if (timeoutRef.current) {
                      clearTimeout(timeoutRef.current);
                    }

                    // Only clear hover if dropdown is not actively open
                    if (activeDropdownId !== task.id) {
                      setHoveredTaskId(null);
                    }
                  }}
                >
                  {/* Inline Edit Mode */}
                  {editingTaskId === task.id ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        width: "100%",
                      }}
                    >
                      {/* Title Input */}
                      <Input
                        ref={titleInputRef}
                        value={editingTaskData.title}
                        onChange={(e) => {
                          setEditingTaskData({
                            ...editingTaskData,
                            title: e.target.value,
                          });
                        }}
                        placeholder="Task title"
                        style={{
                          fontFamily: FONT_FAMILY,
                          fontSize: "12px",
                          fontWeight: 500,
                        }}
                        onPressEnter={() => handleSaveInlineEdit(task)}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") {
                            handleCancelInlineEdit();
                          }
                        }}
                      />

                      {/* Schedule Input */}
                      <Input
                        value={editingTaskData.schedule}
                        onChange={(e) => {
                          setEditingTaskData({
                            ...editingTaskData,
                            schedule: e.target.value,
                          });
                        }}
                        placeholder="Schedule"
                        style={{
                          fontFamily: FONT_FAMILY,
                          fontSize: "10px",
                        }}
                      />

                      {/* Assigned To Selection */}
                      <Select
                        value={editingTaskData.assigned_to}
                        onChange={(value) => {
                          setEditingTaskData({
                            ...editingTaskData,
                            assigned_to: value,
                          });
                        }}
                        options={familyMemberOptions}
                        placeholder="Assigned to"
                        style={{
                          fontFamily: FONT_FAMILY,
                          fontSize: "10px",
                        }}
                      />

                      {/* Action Buttons */}
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          justifyContent: "flex-end",
                        }}
                      >
                        <Button
                          size="small"
                          icon={<CloseOutlined />}
                          onClick={handleCancelInlineEdit}
                          style={{ fontSize: "10px" }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="primary"
                          size="small"
                          icon={<CheckOutlined />}
                          onClick={() => handleSaveInlineEdit(task)}
                          loading={loading}
                          style={{ fontSize: "10px" }}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Display Mode */
                    <div
                      onDoubleClick={(e) => handleTaskDoubleClick(task, e)}
                      style={{
                        cursor: "pointer",
                        width: "100%",
                      }}
                      title="Double-click to edit"
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "8px",
                          marginBottom: "4px",
                        }}
                      >
                        <Checkbox
                          checked={task.completed}
                          onChange={() => handleToggleTask(task)}
                          style={{ marginTop: "2px" }}
                        />
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: "12px",
                              fontWeight: 500,
                              fontFamily: FONT_FAMILY,
                              textDecoration: task.completed ? "line-through" : "none",
                              opacity: task.completed ? 0.6 : 1,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {task.title}
                          </div>
                          <div
                            style={{
                              fontSize: "10px",
                              color: "#6b7280",
                              fontFamily: FONT_FAMILY,
                              marginTop: "2px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {task.schedule}
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "2px",
                          }}
                        >
                          {/* Flippable Badge */}
                          <div
                            style={{
                              position: "relative",
                              width: "26px",
                              height: "20px",
                              perspective: "100px",
                            }}
                          >
                            {/* Front Side - Initials */}
                            <div
                              style={{
                                position: "absolute",
                                width: "100%",
                                height: "100%",
                                backfaceVisibility: "hidden",
                                transition: "transform 0.3s ease-in-out",
                                transform: shouldShowMoreButton ? "rotateY(180deg)" : "rotateY(0deg)",
                                fontSize: "10px",
                                padding: "1px 5px",
                                borderRadius: "8px",
                                backgroundColor: assigneeColor,
                                color: textColor,
                                fontWeight: 500,
                                fontFamily: FONT_FAMILY,
                                textAlign: "center",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {getAssigneeInitials(task.assigned_to)}
                            </div>

                            {/* Back Side - More Button */}
                            <div
                              style={{
                                position: "absolute",
                                width: "100%",
                                height: "100%",
                                backfaceVisibility: "hidden",
                                transition: "transform 0.3s ease-in-out",
                                transform: shouldShowMoreButton ? "rotateY(0deg)" : "rotateY(-180deg)",
                              }}
                            >
                              <Dropdown
                                overlay={getDropdownMenu(task)}
                                trigger={['click']}
                                placement="bottomRight"
                                open={isDropdownActive}
                                onOpenChange={(visible) => handleDropdownVisibleChange(task.id, visible)}
                              >
                                <div
                                  style={{
                                    fontSize: "10px",
                                    padding: "1px 5px",
                                    borderRadius: "8px",
                                    backgroundColor: assigneeColor,
                                    color: textColor,
                                    fontWeight: 500,
                                    fontFamily: FONT_FAMILY,
                                    textAlign: "center",
                                    cursor: "pointer",
                                    height: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreOutlined style={{ fontSize: "12px" }} />
                                </div>
                              </Dropdown>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <button
          onClick={handleAddTask}
          style={{
            width: "100%",
            padding: "6px",
            border: "2px dashed #e5e7eb",
            backgroundColor: "transparent",
            borderRadius: "6px",
            color: "#6b7280",
            fontSize: "11px",
            cursor: "pointer",
            transition: "all 0.2s",
            marginTop: "8px",
            fontFamily: FONT_FAMILY,
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#2563eb";
            e.currentTarget.style.color = "#2563eb";
            e.currentTarget.style.backgroundColor = "#eff6ff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#e5e7eb";
            e.currentTarget.style.color = "#6b7280";
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          + Add task
        </button>
      </div>

      <CustomModal
        isVisible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        width={500}
      >
        <div style={{ padding: "24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                backgroundColor: "#e6f4ff",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PlusOutlined style={{ color: "#1890ff", fontSize: "18px" }} />
            </div>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "#262626",
                  fontFamily: FONT_FAMILY,
                }}
              >
                {editingTask ? "Edit Task" : "Add New Task"}
              </h3>
              <p
                style={{
                  margin: "4px 0 0 0",
                  fontSize: "14px",
                  color: "#6b7280",
                  fontFamily: FONT_FAMILY,
                }}
              >
                Manage weekly tasks for your family
              </p>
            </div>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            style={{ fontFamily: FONT_FAMILY }}
          >
            <Form.Item
              name="title"
              label="Task Name"
              rules={[{ required: true, message: "Please enter task name" }]}
            >
              <Input
                placeholder="e.g., Science fair project materials"
                style={{ fontFamily: FONT_FAMILY }}
              />
            </Form.Item>

            <Form.Item
              name="schedule"
              label="Schedule"
            >
              <Input
                placeholder="e.g., Due this week"
                style={{ fontFamily: FONT_FAMILY }}
              />
            </Form.Item>

            <Form.Item
              name="assigned_to"
              label="Assigned To"
              initialValue="All"
            >
              <Select
                placeholder="Select assignee"
                options={familyMemberOptions}
                style={{ fontFamily: FONT_FAMILY }}
              />
            </Form.Item>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                marginTop: "24px",
              }}
            >
              <Button
                onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                }}
                style={{ fontFamily: FONT_FAMILY }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                style={{
                  backgroundColor: "#1890ff",
                  borderColor: "#1890ff",
                  fontFamily: FONT_FAMILY,
                }}
              >
                {editingTask ? "Update Task" : "Add Task"}
              </Button>
            </div>
          </Form>
        </div>
      </CustomModal>
    </>
  );
};

export default WeeklyTasks;