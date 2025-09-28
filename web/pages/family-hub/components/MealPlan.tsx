"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button, Form, Input, Select, message, Spin, Dropdown, Menu } from "antd";
import { PlusOutlined, EditOutlined, CheckOutlined, CloseOutlined, MoreOutlined } from "@ant-design/icons";
import { addMeal, deleteMeal, getMeals, getUsersFamilyMembers, updateMeal } from "../../../services/family";
import { CustomModal } from "../../../app/comman";

const { TextArea } = Input;

const FONT_FAMILY =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const daysOfWeek = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

interface Meal {
  id: string;
  title: string;
  day: string;
  details: string;
  assigned_to: string;
}

interface FamilyMember {
  id: number;
  name: string;
  color: string;
  type: "family" | "pets";
  initials: string;
  status?: "pending" | "accepted";
  user_id?: string;
}

interface MealPlanProps {
  familyMembers?: FamilyMember[];
}

const MealPlan: React.FC<MealPlanProps> = ({
  familyMembers = [],
}) => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // Inline editing states
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [editingMealData, setEditingMealData] = useState<Meal>({
    id: "",
    title: "",
    day: "",
    details: "",
    assigned_to: "",
  });
  const titleInputRef = useRef<any>(null);

  // Hover state for badge flip
  const [hoveredMealId, setHoveredMealId] = useState<string | null>(null);
  // State to track actively open dropdown (clicked)
  const [activeMealDropdownId, setActiveMealDropdownId] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchMeals();
  }, []);

  // Focus title input when editing starts
  useEffect(() => {
    if (editingMealId && titleInputRef.current) {
      setTimeout(() => {
        titleInputRef.current?.focus();
        titleInputRef.current?.select();
      }, 100);
    }
  }, [editingMealId]);

  const fetchMeals = async () => {
    setLoading(true);
    try {
      const response = await getMeals();
      if (response?.data?.status === 1) {
        setMeals(response.data?.payload?.meals || []);
      }
    } catch (error) {
      console.error("Failed to fetch meals:", error);
      message.error("Failed to load meals");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMeal = () => {
    setEditingMeal(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditMeal = (meal: Meal) => {
    setEditingMeal(meal);
    form.setFieldsValue(meal);
    setModalVisible(true);
    // Close the dropdown when edit is clicked
    setActiveMealDropdownId(null);
  };

  // Handle double-click to edit meal inline
  const handleMealDoubleClick = (meal: Meal, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingMealId(meal.id);
    setEditingMealData({
      id: meal.id,
      title: meal.title,
      day: meal.day,
      details: meal.details,
      assigned_to: meal.assigned_to,
    });
  };

  // Save inline edited meal
  const handleSaveInlineEdit = async (meal: Meal) => {
    // Validate required fields
    if (!editingMealData.title.trim()) {
      message.error("Please enter a meal title");
      return;
    }

    if (!editingMealData.day.trim()) {
      message.error("Please select a day");
      return;
    }

    setLoading(true);
    try {
      const res = await updateMeal({
        id: meal.id,
        title: editingMealData.title,
        day: editingMealData.day,
        details: editingMealData.details,
        assigned_to: editingMealData.assigned_to,
      });

      if (res.data?.status === 1) {
        message.success("Meal updated successfully");
        await fetchMeals();
        setEditingMealId(null);
        setEditingMealData({
          id: "",
          title: "",
          day: "",
          details: "",
          assigned_to: "",
        });
      } else {
        message.error("Failed to update meal");
      }
    } catch (err) {
      console.error("Error updating meal:", err);
      message.error("Failed to update meal");
    } finally {
      setLoading(false);
    }
  };

  // Cancel inline editing
  const handleCancelInlineEdit = () => {
    setEditingMealId(null);
    setEditingMealData({
      id: "",
      title: "",
      day: "",
      details: "",
      assigned_to: "",
    });
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingMeal) {
        await updateMeal({ ...values, id: editingMeal.id });
        message.success("Meal updated successfully");
      } else {
        await addMeal(values);
        message.success("Meal added successfully");
      }
      setModalVisible(false);
      form.resetFields();
      fetchMeals();
    } catch (error) {
      console.error("Failed to save meal:", error);
      message.error("Failed to save meal");
    }
  };

  const getAssigneeInitials = (assignedTo: string) => {
    if (assignedTo === "All" || !assignedTo) return "All";
    const member = familyMembers.find(m => m.name === assignedTo);
    return member ? member.initials || member.name.charAt(0).toUpperCase() : assignedTo.charAt(0).toUpperCase();
  };

  const getAssigneeColor = (assignedTo: string) => {
    if (assignedTo === "All" || !assignedTo) return "#3355ff"; // default blue for "All"
    const member = familyMembers.find(m => m.name === assignedTo);
    return member ? member.color : "#3355ff"; // fallback to blue
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

  const familyMemberOptions = [
    { label: "All", value: "All" },
    ...familyMembers.map(member => ({
      label: member.name,
      value: member.name
    }))
  ];

  // Create dropdown menu for each meal
  const getDropdownMenu = (meal: Meal) => (
    <Menu
      items={[
        {
          key: 'edit',
          label: 'Edit',
          onClick: () => handleEditMeal(meal),
        }
      ]}
    />
  );

  // Handle dropdown visibility change
  const handleDropdownVisibleChange = (mealId: string, visible: boolean) => {
    if (visible) {
      setActiveMealDropdownId(mealId);
    } else {
      setActiveMealDropdownId(null);
    }
  };

  // Group meals by day
  const mealsByDay = daysOfWeek.map(day => ({
    day,
    meal: meals.find(meal => meal.day === day)
  }));

  return (
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
            Meal Plan
          </h3>
          <div
            style={{
              fontSize: "12px",
              color: "#6b7280",
              fontFamily: FONT_FAMILY,
            }}
          >
            This Week
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "30px" }}>
          <Spin size="large" />
        </div>
      ) : (
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
              .meal-scroll::-webkit-scrollbar { width: 6px; }
              .meal-scroll::-webkit-scrollbar-track { background: transparent; }
              .meal-scroll::-webkit-scrollbar-thumb { background-color: rgba(0,0,0,0.2); border-radius: 3px; }
              .meal-scroll::-webkit-scrollbar-thumb:hover { background-color: rgba(0,0,0,0.3); }
            `;
            document.head.appendChild(style);
            e.currentTarget.className += ' meal-scroll';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.overflowY = "hidden";
            // Remove scrollbar styles
            const styles = document.querySelectorAll('style');
            styles.forEach(style => {
              if (style.textContent?.includes('.meal-scroll::-webkit-scrollbar')) {
                style.remove();
              }
            });
            e.currentTarget.className = e.currentTarget.className.replace(' meal-scroll', '');
          }}
        >
          {mealsByDay.map(({ day, meal }) => {
            const assigneeColor = meal ? getAssigneeColor(meal.assigned_to) : "#dee2f5ff";
            const textColor = meal ? getTextColor(assigneeColor) : "#ffffff";
            const isHovered = hoveredMealId === meal?.id;
            const isDropdownActive = activeMealDropdownId === meal?.id;
            // Show more button if hovered OR dropdown is actively open
            const shouldShowMoreButton = meal && (isHovered || isDropdownActive);
            
            return (
              <div
                key={day}
                style={{
                  backgroundColor: "white",
                  borderRadius: "6px",
                  padding: "8px",
                  border: `1px solid ${assigneeColor}`,
                  transition: "all 0.2s",
                  cursor: "pointer",
                  minHeight: "70px",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
                  if (meal) {
                    setHoveredMealId(meal.id);

                    // Clear existing timeout if hovering again quickly
                    if (timeoutRef.current) {
                      clearTimeout(timeoutRef.current);
                    }

                    // Auto flip back after 2s
                    timeoutRef.current = setTimeout(() => {
                      setHoveredMealId((prev) => {
                        // only reset if dropdown is not active for this meal
                        return activeMealDropdownId === meal.id ? prev : null;
                      });
                    }, 2000);
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  
                  if (meal) {
                    // Clear timeout if leaving early
                    if (timeoutRef.current) {
                      clearTimeout(timeoutRef.current);
                    }

                    // Only clear hover if dropdown is not actively open
                    if (activeMealDropdownId !== meal.id) {
                      setHoveredMealId(null);
                    }
                  }
                }}
              >
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: 600,
                    color: "#6b7280",
                    textTransform: "uppercase",
                    marginBottom: "2px",
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  {day}
                </div>
                {meal ? (
                  <>
                    {/* Inline Edit Mode */}
                    {editingMealId === meal.id ? (
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
                          value={editingMealData.title}
                          onChange={(e) => {
                            setEditingMealData({
                              ...editingMealData,
                              title: e.target.value,
                            });
                          }}
                          placeholder="Meal title"
                          style={{
                            fontFamily: FONT_FAMILY,
                            fontSize: "12px",
                            fontWeight: 500,
                          }}
                          onPressEnter={() => handleSaveInlineEdit(meal)}
                          onKeyDown={(e) => {
                            if (e.key === "Escape") {
                              handleCancelInlineEdit();
                            }
                          }}
                        />

                        {/* Day Selection */}
                        <Select
                          value={editingMealData.day}
                          onChange={(value) => {
                            setEditingMealData({
                              ...editingMealData,
                              day: value,
                            });
                          }}
                          options={daysOfWeek.map(d => ({ label: d, value: d }))}
                          style={{
                            fontFamily: FONT_FAMILY,
                            fontSize: "10px",
                          }}
                        />

                        {/* Details TextArea */}
                        <TextArea
                          value={editingMealData.details}
                          onChange={(e) => {
                            setEditingMealData({
                              ...editingMealData,
                              details: e.target.value,
                            });
                          }}
                          placeholder="Meal details"
                          rows={2}
                          style={{
                            fontFamily: FONT_FAMILY,
                            fontSize: "10px",
                          }}
                        />

                        {/* Assigned To Selection */}
                        <Select
                          value={editingMealData.assigned_to}
                          onChange={(value) => {
                            setEditingMealData({
                              ...editingMealData,
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
                            onClick={() => handleSaveInlineEdit(meal)}
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
                        onDoubleClick={(e) => handleMealDoubleClick(meal, e)}
                        style={{
                          cursor: "pointer",
                          width: "100%",
                        }}
                        title="Double-click to edit"
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontSize: "12px",
                                fontWeight: 500,
                                marginBottom: "2px",
                                fontFamily: FONT_FAMILY,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {meal.title}
                            </div>
                            <div
                              style={{
                                fontSize: "10px",
                                color: "#6b7280",
                                fontFamily: FONT_FAMILY,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {meal.details}
                            </div>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: "2px",
                              marginLeft: "8px",
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
                                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                }}
                              >
                                {getAssigneeInitials(meal.assigned_to)}
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
                                  overlay={getDropdownMenu(meal)}
                                  trigger={['click']}
                                  placement="bottomRight"
                                  open={isDropdownActive}
                                  onOpenChange={(visible) => handleDropdownVisibleChange(meal.id, visible)}
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
                                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
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
                  </>
                ) : (
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#9ca3af",
                      fontStyle: "italic",
                      fontFamily: FONT_FAMILY,
                    }}
                    onClick={() => {
                      setEditingMeal(null);
                      form.setFieldsValue({ day });
                      setModalVisible(true);
                    }}
                  >
                    No meal planned - Click to add
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={handleAddMeal}
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
        + Add meal
      </button>

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
                backgroundColor: "#fff2e6",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PlusOutlined style={{ color: "#fa8c16", fontSize: "18px" }} />
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
                {editingMeal ? "Edit Meal" : "Add New Meal"}
              </h3>
              <p
                style={{
                  margin: "4px 0 0 0",
                  fontSize: "14px",
                  color: "#6b7280",
                  fontFamily: FONT_FAMILY,
                }}
              >
                Plan your family meals for the week
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
              label="Meal Name"
              rules={[{ required: true, message: "Please enter meal name" }]}
            >
              <Input
                placeholder="e.g., Spaghetti Bolognese"
                style={{ fontFamily: FONT_FAMILY }}
              />
            </Form.Item>

            <Form.Item
              name="day"
              label="Day"
              rules={[{ required: true, message: "Please select a day" }]}
            >
              <Select
                placeholder="Select day"
                options={daysOfWeek.map(day => ({ label: day, value: day }))}
                style={{ fontFamily: FONT_FAMILY }}
              />
            </Form.Item>

            <Form.Item
              name="details"
              label="Details"
            >
              <Input.TextArea
                placeholder="e.g., Cook: John • Prep: 30 min"
                rows={3}
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
                {editingMeal ? "Update Meal" : "Add Meal"}
              </Button>
            </div>
          </Form>
        </div>
      </CustomModal>
    </div>
  );
};

export default MealPlan;