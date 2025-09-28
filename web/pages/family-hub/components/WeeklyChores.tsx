"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button, Form, Input, Select, message, Spin, Checkbox, Dropdown, Menu } from "antd";
import { PlusOutlined, EditOutlined, CheckOutlined, CloseOutlined, ReloadOutlined, MoreOutlined } from "@ant-design/icons";
import { addChore, getChores, updateChore, deleteChore } from "../../../services/family";
import { CustomModal } from "../../../app/comman";

const { TextArea } = Input;

const FONT_FAMILY =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

interface Chore {
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

interface WeeklyChoresProps {
  familyMembers?: FamilyMember[];
}

const WeeklyChores: React.FC<WeeklyChoresProps> = ({
  familyMembers = [],
}) => {
  const [chores, setChores] = useState<Chore[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingChore, setEditingChore] = useState<Chore | null>(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [resetLoading, setResetLoading] = useState(false);
  // Inline editing states
  const [editingChoreId, setEditingChoreId] = useState<string | null>(null);
  const [editingChoreData, setEditingChoreData] = useState<Chore>({
    id: "",
    title: "",
    schedule: "",
    assigned_to: "",
    completed: false,
  });
  const titleInputRef = useRef<any>(null);

  // Hover state for badge flip
  const [hoveredChoreId, setHoveredChoreId] = useState<string | null>(null);
  // State to track actively open dropdown (clicked)
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  useEffect(() => {
    fetchChores();
  }, []);

  // Focus title input when editing starts
  useEffect(() => {
    if (editingChoreId && titleInputRef.current) {
      setTimeout(() => {
        titleInputRef.current?.focus();
        titleInputRef.current?.select();
      }, 100);
    }
  }, [editingChoreId]);

  const fetchChores = async () => {
    setLoading(true);
    try {
      const response = await getChores();
      if (response?.data?.status === 1) {
        setChores(response.data?.payload?.chores || []);
      }
    } catch (error) {
      console.error("Failed to fetch chores:", error);
      message.error("Failed to load chores");
    } finally {
      setLoading(false);
    }
  };

  const handleAddChore = () => {
    setEditingChore(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditChore = (chore: Chore) => {
    setEditingChore(chore);
    form.setFieldsValue(chore);
    setModalVisible(true);
    // Close the dropdown when edit is clicked
    setActiveDropdownId(null);
  };

  // Handle double-click to edit chore inline
  const handleChoreDoubleClick = (chore: Chore, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChoreId(chore.id);
    setEditingChoreData({
      id: chore.id,
      title: chore.title,
      schedule: chore.schedule,
      assigned_to: chore.assigned_to,
      completed: chore.completed,
    });
  };

  // Save inline edited chore
  const handleSaveInlineEdit = async (chore: Chore) => {
    // Validate required fields
    if (!editingChoreData.title.trim()) {
      message.error("Please enter a chore title");
      return;
    }

    setLoading(true);
    try {
      const res = await updateChore({
        id: chore.id,
        title: editingChoreData.title,
        schedule: editingChoreData.schedule,
        assigned_to: editingChoreData.assigned_to,
        completed: editingChoreData.completed,
      });

      if (res.data?.status === 1) {
        message.success("Chore updated successfully");
        await fetchChores();
        setEditingChoreId(null);
        setEditingChoreData({
          id: "",
          title: "",
          schedule: "",
          assigned_to: "",
          completed: false,
        });
      } else {
        message.error("Failed to update chore");
      }
    } catch (err) {
      console.error("Error updating chore:", err);
      message.error("Failed to update chore");
    } finally {
      setLoading(false);
    }
  };
  const handleResetAll = async () => {
    const completedChores = chores.filter(chore => chore.completed);
    
    if (completedChores.length === 0) {
      message.info('No completed chores to reset');
      return;
    }

    setResetLoading(true);
    
    try {
      const updatePromises = completedChores.map(chore =>
        updateChore({
          id: chore.id,
          title: chore.title,
          schedule: chore.schedule,
          assigned_to: chore.assigned_to,
          completed: false,
          tagged_ids: chore.tagged_ids,
        })
      );

      const results = await Promise.all(updatePromises);
      
      // Check if all updates were successful
      const allSuccessful = results.every(result => result.status === 1);
      
      if (allSuccessful) {
        setChores(prevChores =>
          prevChores.map(chore =>
            chore.completed ? { ...chore, completed: false } : chore
          )
        );
        message.success(`Successfully reset ${completedChores.length} completed chores`);
      } else {
        message.error('Some chores failed to reset');
        // Refresh the list to get the current state
        fetchChores();
      }
    } catch (error) {
      message.error('Failed to reset chores');
    } finally {
      setResetLoading(false);
    }
  };

  // Cancel inline editing
  const handleCancelInlineEdit = () => {
    setEditingChoreId(null);
    setEditingChoreData({
      id: "",
      title: "",
      schedule: "",
      assigned_to: "",
      completed: false,
    });
  };

  const handleToggleChore = async (chore: Chore) => {
    try {
      await updateChore({
        id: chore.id,
        title: chore.title,
        schedule: chore.schedule,
        assigned_to: chore.assigned_to,
        completed: !chore.completed
      });
      fetchChores();
    } catch (error) {
      console.error("Failed to toggle chore:", error);
      message.error("Failed to update chore");
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
      if (editingChore) {
        await updateChore({ ...values, id: editingChore.id });
        message.success("Chore updated successfully");
      } else {
        await addChore(values);
        message.success("Chore added successfully");
      }
      setModalVisible(false);
      form.resetFields();
      fetchChores();
    } catch (error) {
      console.error("Failed to save chore:", error);
      message.error("Failed to save chore");
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

  const completedCount = chores.filter(c => c.completed).length;

  // Create dropdown menu for each chore
  const getDropdownMenu = (chore: Chore) => (
    <Menu
      items={[
        {
          key: 'edit',
          label: 'Edit',
          onClick: () => handleEditChore(chore),
        }
      ]}
    />
  );

  // Handle dropdown visibility change
  const handleDropdownVisibleChange = (choreId: string, visible: boolean) => {
    if (visible) {
      setActiveDropdownId(choreId);
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
              Weekly Chores
            </h3>
            <div
              style={{
                fontSize: "12px",
                color: "#6b7280",
                fontFamily: FONT_FAMILY,
              }}
            >
              {completedCount}/{chores.length} complete
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
              .chore-scroll::-webkit-scrollbar { width: 6px; }
              .chore-scroll::-webkit-scrollbar-track { background: transparent; }
              .chore-scroll::-webkit-scrollbar-thumb { background-color: rgba(0,0,0,0.2); border-radius: 3px; }
              .chore-scroll::-webkit-scrollbar-thumb:hover { background-color: rgba(0,0,0,0.3); }
            `;
            document.head.appendChild(style);
            e.currentTarget.className += ' chore-scroll';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.overflowY = "hidden";
            // Remove scrollbar styles
            const styles = document.querySelectorAll('style');
            styles.forEach(style => {
              if (style.textContent?.includes('.chore-scroll::-webkit-scrollbar')) {
                style.remove();
              }
            });
            e.currentTarget.className = e.currentTarget.className.replace(' chore-scroll', '');
          }}
        >
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "30px" }}>
              <Spin size="large" />
            </div>
          ) : chores.length === 0 ? (
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
              No chores added yet.
            </div>
          ) : (
            chores.map((chore) => {
              const assigneeColor = getAssigneeColor(chore.assigned_to);
              const textColor = getTextColor(assigneeColor);
              const isHovered = hoveredChoreId === chore.id;
              const isDropdownActive = activeDropdownId === chore.id;
              // Show more button if hovered OR dropdown is actively open
              const shouldShowMoreButton = isHovered || isDropdownActive;
              
              return (
                <div
                  key={chore.id}
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
                    setHoveredChoreId(chore.id);

                    // Clear existing timeout if hovering again quickly
                    if (timeoutRef.current) {
                      clearTimeout(timeoutRef.current);
                    }

                    // Auto flip back after 2s
                    timeoutRef.current = setTimeout(() => {
                      setHoveredChoreId((prev) => {
                        // only reset if dropdown is not active for this chore
                        return activeDropdownId === chore.id ? prev : null;
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
                    if (activeDropdownId !== chore.id) {
                      setHoveredChoreId(null);
                    }
                  }}
                >
                  {/* Inline Edit Mode */}
                  {editingChoreId === chore.id ? (
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
                        value={editingChoreData.title}
                        onChange={(e) => {
                          setEditingChoreData({
                            ...editingChoreData,
                            title: e.target.value,
                          });
                        }}
                        placeholder="Chore title"
                        style={{
                          fontFamily: FONT_FAMILY,
                          fontSize: "12px",
                          fontWeight: 500,
                        }}
                        onPressEnter={() => handleSaveInlineEdit(chore)}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") {
                            handleCancelInlineEdit();
                          }
                        }}
                      />

                      {/* Schedule Input */}
                      <Input
                        value={editingChoreData.schedule}
                        onChange={(e) => {
                          setEditingChoreData({
                            ...editingChoreData,
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
                        value={editingChoreData.assigned_to}
                        onChange={(value) => {
                          setEditingChoreData({
                            ...editingChoreData,
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
                          onClick={() => handleSaveInlineEdit(chore)}
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
                      onDoubleClick={(e) => handleChoreDoubleClick(chore, e)}
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
                          checked={chore.completed}
                          onChange={() => handleToggleChore(chore)}
                          style={{ marginTop: "2px" }}
                        />
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: "12px",
                              fontWeight: 500,
                              fontFamily: FONT_FAMILY,
                              textDecoration: chore.completed ? "line-through" : "none",
                              opacity: chore.completed ? 0.6 : 1,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {chore.title}
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
                            {chore.schedule}
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
                              {getAssigneeInitials(chore.assigned_to)}
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
                                overlay={getDropdownMenu(chore)}
                                trigger={['click']}
                                placement="bottomRight"
                                open={isDropdownActive}
                                onOpenChange={(visible) => handleDropdownVisibleChange(chore.id, visible)}
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
          onClick={handleAddChore}
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
          + Add chore
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
                backgroundColor: "#f6ffed",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PlusOutlined style={{ color: "#52c41a", fontSize: "18px" }} />
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
                {editingChore ? "Edit Chore" : "Add New Chore"}
              </h3>
              <p
                style={{
                  margin: "4px 0 0 0",
                  fontSize: "14px",
                  color: "#6b7280",
                  fontFamily: FONT_FAMILY,
                }}
              >
                Organize household chores for your family
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
              label="Chore Name"
              rules={[{ required: true, message: "Please enter chore name" }]}
            >
              <Input
                placeholder="e.g., Take out trash"
                style={{ fontFamily: FONT_FAMILY }}
              />
            </Form.Item>

            <Form.Item
              name="schedule"
              label="Schedule"
            >
              <Input
                placeholder="e.g., Monday & Thursday"
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
                  backgroundColor: "#52c41a",
                  borderColor: "#52c41a",
                  fontFamily: FONT_FAMILY,
                }}
              >
                {editingChore ? "Update Chore" : "Add Chore"}
              </Button>
            </div>
          </Form>
        </div>
      </CustomModal>
    </>
  );
};

export default WeeklyChores;