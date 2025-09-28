"use client";
import React, { useState, useMemo } from "react";
import { Input, Button, Avatar, Typography, Form, message } from "antd";
import {
  ShareAltOutlined,
  SearchOutlined,
  MailOutlined,
  CheckCircleOutlined,
  UserOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { CustomModal } from "../../app/comman";
import { shareItem, ShareItemParams } from "../../services/bookmarks";

const { Text } = Typography;

const FONT_FAMILY =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

interface ShareModalProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  item: any;
  itemType:
    | "bookmark"
    | "note"
    | "project"
    | "goal"
    | "todo"
    | "maintenance_task";
  familyMembers: any[];
  loading?: boolean;
  itemPreview?: React.ReactNode;
  onShareSuccess?: (message: string) => void;
  currentHubId?: string; // Add this to determine current context for projects
  currentBoardId?: string; // Add this to determine current context for projects
}

const ShareModal: React.FC<ShareModalProps> = ({
  isVisible,
  onClose,
  title,
  item,
  itemType,
  familyMembers = [], // ✅ default to []
  loading: externalLoading = false,
  itemPreview,
  onShareSuccess,
  currentHubId,
  currentBoardId,
}) => {
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [shareSearchTerm, setShareSearchTerm] = useState("");
  const [shareForm] = Form.useForm();
  const [internalLoading, setInternalLoading] = useState(false);

  // Use either external loading or internal loading
  const isLoading = externalLoading || internalLoading;

  // Hub and Board ID mappings based on your provided data
  const HUB_IDS = {
    bookmarks: "2a2b3c4d-1111-2222-3333-abcdef784512", // Accounts
    notes: "1a2b3c4d-1111-2222-3333-abcdef123744", // Notes & Lists
    planner: "3a2b3c4d-1111-2222-3333-abcdef985623", // Planner
  };

  const BOARD_IDS = {
    family: "1a2b3c4d-1111-2222-3333-abcdef123456", // Family
    home: "3c4d5e6f-3333-4444-5555-cdef12345678", // Home
  };

  // Get target permissions based on item type
  const getTargetPermissions = useMemo(() => {
    switch (itemType) {
      case "bookmark":
        return [{ target_type: "hubs", target_id: HUB_IDS.bookmarks }];
      case "note":
        return [{ target_type: "hubs", target_id: HUB_IDS.notes }];
      case "project":
        // Projects can be in both Planner hub and Family board
        // Use current context to determine which permission to check
        if (currentHubId === HUB_IDS.planner) {
          return [{ target_type: "hubs", target_id: HUB_IDS.planner }];
        } else if (currentBoardId === BOARD_IDS.family) {
          return [{ target_type: "board", target_id: BOARD_IDS.family }];
        } else {
          // If no context provided, check both
          return [
            { target_type: "hubs", target_id: HUB_IDS.planner },
            { target_type: "board", target_id: BOARD_IDS.family },
          ];
        }
      case "goal":
      case "todo":
        return [{ target_type: "hubs", target_id: HUB_IDS.planner }];
      case "maintenance_task":
        return [{ target_type: "board", target_id: BOARD_IDS.home }];
      default:
        return [];
    }
  }, [itemType, currentHubId, currentBoardId]);

  // Filter family members based on permissions
  const permissionFilteredMembers = useMemo(() => {
    if (!Array.isArray(familyMembers)) return []; // ✅ guard
    return familyMembers.filter((member: any) => {
      if (member.relationship === "me") return true;
      const memberPermissions = Array.isArray(member.permissions)
        ? member.permissions
        : [];
      return getTargetPermissions.some((target) =>
        memberPermissions.some(
          (permission: any) =>
            permission.target_type === target.target_type &&
            permission.target_id === target.target_id
        )
      );
    });
  }, [familyMembers, getTargetPermissions]);

  const handleClose = () => {
    onClose();
    setSelectedMemberIds([]);
    setShareSearchTerm("");
    shareForm.resetFields();
  };

  // Transform item data based on type
  const getItemData = () => {
    switch (itemType) {
      case "bookmark":
        return {
          id: item.id,
          title: item.title,
          url: item.url,
          category: item.category,
          hub: Array.isArray(item.hubs)
            ? item.hubs.join(",")
            : item.hub || "none",
        };
      case "note":
        return {
          id: item.id,
          title: item.title,
          description: item.description,
          hub: Array.isArray(item.hubs)
            ? item.hubs.join(",")
            : item.hub || "none",
          created_at: item.created_at,
        };
      default:
        return item;
    }
  };

  const handleShareToMembers = async () => {
    if (selectedMemberIds.length === 0) {
      message.warning("Please select family members to share with");
      return;
    }

    const selectedMembers = permissionFilteredMembers.filter(
      (member: any) =>
        selectedMemberIds.includes(member.id) &&
        member.relationship !== "me" &&
        member.status?.toLowerCase() !== "pending" &&
        member.email?.trim()
    );

    const emails = selectedMembers.map((member: any) => member.email);

    if (emails.length === 0) {
      message.warning(
        "Selected family members don't have valid email addresses"
      );
      return;
    }

    try {
      setInternalLoading(true);

      const shareParams: ShareItemParams = {
        email: emails,
        item_type: itemType,
        item_data: getItemData(),
        tagged_members: emails,
      };

      const response = await shareItem(shareParams);

      if (response.data.status === 1) {
        const memberNames = selectedMembers.map((m: any) => m.name).join(", ");
        const successMessage = `${
          itemType.charAt(0).toUpperCase() + itemType.slice(1)
        } shared with ${memberNames}!`;
        message.success(successMessage);

        if (onShareSuccess) {
          onShareSuccess(successMessage);
        }

        handleClose();
      } else {
        message.error(response.data.message || `Failed to share ${itemType}`);
      }
    } catch (error) {
      console.error(`Error sharing ${itemType}:`, error);
      message.error(`Failed to share ${itemType}. Please try again.`);
    } finally {
      setInternalLoading(false);
    }
  };

  const handleEmailShare = async () => {
    try {
      const values = await shareForm.validateFields();

      if (!item) {
        message.error(`No ${itemType} selected for sharing`);
        return;
      }

      setInternalLoading(true);

      const shareParams: ShareItemParams = {
        email: values.email,
        item_type: itemType,
        item_data: getItemData(),
      };

      const response = await shareItem(shareParams);

      if (response.data.status === 1) {
        const successMessage = `${
          itemType.charAt(0).toUpperCase() + itemType.slice(1)
        } shared via email!`;
        message.success(successMessage);

        if (onShareSuccess) {
          onShareSuccess(successMessage);
        }

        handleClose();
      } else {
        message.error(
          response.data.message || `Failed to share ${itemType} via email`
        );
      }
    } catch (error) {
      console.error(`Error sharing ${itemType} via email:`, error);
      message.error(`Failed to share ${itemType} via email. Please try again.`);
    } finally {
      setInternalLoading(false);
    }
  };

  const filteredFamilyMembers = (permissionFilteredMembers || [])
    .filter((member: any) => member.relationship !== "me")
    .filter((member: any) => member.status?.toLowerCase() !== "pending")
    .filter((member: any) => member.email && member.email.trim())
    .filter((member: any) =>
      member.name.toLowerCase().includes(shareSearchTerm.toLowerCase())
    );

  return (
    <CustomModal isVisible={isVisible} onClose={handleClose} width={520}>
      <div>
        {/* Header with Search */}
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
            <Text
              style={{
                fontSize: "18px",
                fontWeight: 600,
                color: "#1f2937",
                fontFamily: FONT_FAMILY,
                wordBreak: "break-word",
                overflowWrap: "break-word",
              }}
            >
              {title}
            </Text>
          </div>

          {/* Item Preview */}
          {itemPreview && (
            <div style={{ marginBottom: "16px" }}>{itemPreview}</div>
          )}

          <Input
            placeholder="Search family members..."
            prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
            value={shareSearchTerm}
            onChange={(e) => setShareSearchTerm(e.target.value)}
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

        {/* Family Members Grid */}
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
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
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
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: 500,
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                }}
              >
                {shareSearchTerm
                  ? "No members found"
                  : "No eligible family members"}
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
                {shareSearchTerm
                  ? "Try adjusting your search terms"
                  : "Family members need access permissions to this section."}
              </div>
            </div>
          )}

          {/* Share Button */}
          {selectedMemberIds.length > 0 && (
            <Button
              type="primary"
              block
              size="large"
              onClick={handleShareToMembers}
              loading={isLoading}
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
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
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
                      wordBreak: "break-all",
                      overflowWrap: "break-word",
                    }}
                  />
                </Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isLoading}
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
              <span>Email will be sent with {itemType} details</span>
            </div>
          </div>
        </div>
      </div>
    </CustomModal>
  );
};

export default ShareModal;
