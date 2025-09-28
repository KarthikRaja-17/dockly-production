"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  Typography,
  Space,
  Tag,
  Dropdown,
  Modal,
  Form,
  message,
  Avatar,
  Empty,
  Button,
  Input,
  Select,
  Row,
  Col,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  StarFilled,
  StarOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  ShareAltOutlined,
  IdcardOutlined,
  LinkOutlined,
  DownOutlined,
  UpOutlined,
  CodeOutlined,
  BgColorsOutlined,
  GlobalOutlined,
  UsergroupAddOutlined,
  ToolOutlined,
  ReadOutlined,
  PlayCircleOutlined,
  EllipsisOutlined,
} from "@ant-design/icons";
import {
  addBookmark,
  getBookmarks,
  deleteBookmark,
  toggleFavorite,
  shareBookmarks,
} from "../../services/bookmarks";
import { Bookmark, BookmarkFormData } from "../../types/bookmarks";
import { useGlobalLoading } from "../../app/loadingContext";
import { useCurrentUser } from "../../app/userContext";
import { getUsersFamilyMembers } from "../../services/family";
import { CustomButton, PRIMARY_COLOR } from "../../app/comman";
import ShareModal from "./ShareModal";

const { Title, Text } = Typography;
const { Option } = Select;

const FONT_FAMILY =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const categoryColors: Record<string, string> = {
  Tech: "#af630bff",
  Design: "#9f0aaaff",
  News: "#fa541c",
  Social: "#52c41a",
  Tools: "#2c0447ff",
  Education: "#13c2c2",
  Entertainment: "#a01010ff",
  Others: "#3a1e1eff",
};
interface BookmarkHubProps {
  title?: string;
  icon?: React.ReactNode;
  category?: string;
  maxItems?: number;
  showAddButton?: boolean;
  onBookmarkAdded?: () => void;
  hub: string; // Required prop
}

const BookmarkHub: React.FC<BookmarkHubProps> = ({
  title = "Accounts",
  icon = <IdcardOutlined />,
  category,
  maxItems = 1000000000000,
  showAddButton = true,
  onBookmarkAdded,
  hub = "default", // Default value to prevent undefined
}) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const { loading, setLoading } = useGlobalLoading();
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingBookmarkId, setEditingBookmarkId] = useState<string | null>(
    null
  );
  const [form] = Form.useForm();

  // Combined share modal states
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [currentShareBookmark, setCurrentShareBookmark] =
    useState<Bookmark | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [shareForm] = Form.useForm();
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);

  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [expandedBookmarks, setExpandedBookmarks] = useState<Set<string>>(
    new Set()
  );
  const [searchTerm, setSearchTerm] = useState("");

  // Utility function to safely capitalize hub
  const capitalizeHub = (hub: string | undefined): string => {
    if (!hub) return "Default";
    return hub.charAt(0).toUpperCase() + hub.slice(1);
  };

  // Helper function to sort bookmarks - Favorites at top
  const sortBookmarksByFavorite = (bookmarksToSort: Bookmark[]): Bookmark[] => {
    return [...bookmarksToSort].sort((a, b) => {
      // First, sort by favorite status (favorites first)
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;

      // If both have same favorite status, maintain original order (by creation date)
      const aDate = new Date(a.createdAt || a.created_at || 0);
      const bDate = new Date(b.createdAt || b.created_at || 0);
      return bDate.getTime() - aDate.getTime(); // Newest first within each group
    });
  };

  useEffect(() => {
    loadBookmarks();
    fetchFamilyMembers();
  }, [category, hub]);

  const normalizeUrl = (url: string): string => {
    if (!url || typeof url !== "string") return "";
    const trimmedUrl = url.trim();
    if (trimmedUrl.match(/^https?:\/\//i)) return trimmedUrl;
    return `https://${trimmedUrl}`;
  };

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      const response = await getBookmarks({
        category: category !== "All" ? category : undefined,
        sortBy: "newest",
        hub,
      });

      const { status, message: msg, payload } = response.data;
      if (status) {
        const normalizedBookmarks = payload.bookmarks
          .filter(
            (bookmark: any) => bookmark.url && typeof bookmark.url === "string"
          )
          .map((bookmark: any) => ({
            ...bookmark,
            isFavorite: bookmark.isFavorite ?? bookmark.is_favorite ?? false,
            createdAt:
              bookmark.createdAt ?? bookmark.created_at ?? bookmark.createdAt,
            url: normalizeUrl(bookmark.url),
            // Ensure hubs is always an array
            hubs: bookmark.hubs || [hub],
          }))
          .slice(0, maxItems);

        // Sort bookmarks with favorites at top
        const sortedBookmarks = sortBookmarksByFavorite(normalizedBookmarks);
        setBookmarks(sortedBookmarks);
      } else {
        message.error(msg || "Failed to load bookmarks");
      }
    } catch (error) {
      message.error("Failed to load bookmarks");
      console.error("Error loading bookmarks:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFamilyMembers = async () => {
    try {
      const res = await getUsersFamilyMembers({});
      if (res.status) {
        const members = res.payload?.members || [];
        const filtered = members.filter(
          (m: any) =>
            m.relationship !== "me" && m.status?.toLowerCase() !== "pending"
        );
        setFamilyMembers(filtered);
      }
    } catch (error) {
      message.error("Failed to fetch family members");
    }
  };

  const handleToggleExpand = (bookmarkId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedBookmarks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(bookmarkId)) {
        newSet.delete(bookmarkId);
      } else {
        newSet.add(bookmarkId);
      }
      return newSet;
    });
  };

  const handleTitleClick = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(url, "_blank");
  };

  const handleToggleFavorite = async (id: string) => {
    // Optimistically update the UI first
    setBookmarks((prev) => {
      const updated = prev.map((bookmark) =>
        bookmark.id === id
          ? { ...bookmark, isFavorite: !bookmark.isFavorite }
          : bookmark
      );
      // Sort immediately after toggling favorite
      return sortBookmarksByFavorite(updated);
    });

    try {
      const response = await toggleFavorite(id);
      const { status, message: msg, payload } = response.data;

      if (status) {
        const updatedBookmark = {
          ...payload.bookmark,
          isFavorite:
            payload.bookmark.isFavorite ??
            payload.bookmark.is_favorite ??
            false,
        };

        setBookmarks((prev) => {
          const updated = prev.map((bookmark) =>
            bookmark.id === id
              ? {
                  ...bookmark,
                  ...updatedBookmark,
                  createdAt: bookmark.createdAt || bookmark.created_at,
                  created_at: bookmark.created_at || bookmark.createdAt,
                }
              : bookmark
          );
          // Sort again to ensure correct order
          return sortBookmarksByFavorite(updated);
        });

        message.success(
          updatedBookmark.isFavorite
            ? `"${updatedBookmark.title}" added to favorites`
            : `"${updatedBookmark.title}" removed from favorites`
        );
      } else {
        message.error(msg || "Failed to update favorite status");
        // Revert the optimistic update
        setBookmarks((prev) => {
          const reverted = prev.map((bookmark) =>
            bookmark.id === id
              ? { ...bookmark, isFavorite: !bookmark.isFavorite }
              : bookmark
          );
          return sortBookmarksByFavorite(reverted);
        });
      }
    } catch (error) {
      message.error("Failed to update favorite status");
      console.error("Error toggling favorite:", error);
      // Revert the optimistic update
      setBookmarks((prev) => {
        const reverted = prev.map((bookmark) =>
          bookmark.id === id
            ? { ...bookmark, isFavorite: !bookmark.isFavorite }
            : bookmark
        );
        return sortBookmarksByFavorite(reverted);
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const bookmark = bookmarks.find((b) => b.id === id);
      const response = await deleteBookmark(bookmark);
      const { status, message: msg } = response.data;

      if (status) {
        setBookmarks((prev) => prev.filter((b) => b.id !== id));
        if (bookmark) {
          message.success(`"${bookmark.title}" has been deleted`);
        }
        loadBookmarks();
      } else {
        message.error(msg || "Failed to delete bookmark");
      }
    } catch (error) {
      message.error("Failed to delete bookmark");
      console.error("Error deleting bookmark:", error);
    }
  };

  const handleEdit = (id: string) => {
    const bookmark = bookmarks.find((b) => b.id === id);
    if (bookmark) {
      setModalMode("edit");
      setEditingBookmarkId(id);
      const displayUrl = bookmark.url.replace(/^https?:\/\//i, "");

      const predefinedCategories = [
        "Tech",
        "Design",
        "News",
        "Social",
        "Tools",
        "Education",
        "Entertainment",
        "Add Custom Category",
      ];
      const isCustomCategory = !predefinedCategories.includes(
        bookmark.category
      );

      if (isCustomCategory) {
        setShowCustomCategory(true);
        setCustomCategory(bookmark.category);
        form.setFieldsValue({
          title: bookmark.title,
          url: displayUrl,
          description: bookmark.description,
          category: "Add Custom Category",
          tags: bookmark.tags?.join(", ") || "",
          id: bookmark.id,
        });
      } else {
        setShowCustomCategory(false);
        setCustomCategory("");
        form.setFieldsValue({
          title: bookmark.title,
          url: displayUrl,
          description: bookmark.description,
          category: bookmark.category,
          tags: bookmark.tags?.join(", ") || "",
          id: bookmark.id,
        });
      }
      setAddModalVisible(true);
    }
  };

  // Add handleCopyUrl function
  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    message.success("URL copied to clipboard");
  };

  // Combined share/tag handler
  const handleShareBookmark = (bookmark: Bookmark, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentShareBookmark(bookmark);
    setSelectedMemberIds([]);
    setShareModalVisible(true);
    shareForm.resetFields();
  };
  const openCreateModal = () => {
    setModalMode("create");
    setShowCustomCategory(false);
    setCustomCategory("");
    form.resetFields();
    setAddModalVisible(true);
  };

  const closeModal = () => {
    setAddModalVisible(false);
    setShowCustomCategory(false);
    setCustomCategory("");
    form.resetFields();
    setEditingBookmarkId(null);
  };

  const handleCategoryChange = (value: string) => {
    if (value === "Add Custom Category") {
      setShowCustomCategory(true);
    } else {
      setShowCustomCategory(false);
      setCustomCategory("");
    }
  };

  const handleAddBookmark = async () => {
    try {
      const values = await form.validateFields();
      const normalizedUrl = normalizeUrl(values.url);
      const favicon = getFaviconFromUrl(normalizedUrl);

      const finalCategory =
        values.category === "Add Custom Category" && customCategory.trim()
          ? customCategory.trim()
          : values.category;

      if (modalMode === "create") {
        const bookmarkData: BookmarkFormData = {
          title: values.title,
          url: normalizedUrl,
          description: values.description,
          category: finalCategory,
          tags: values.tags
            ? values.tags
                .split(",")
                .map((tag: string) => tag.trim())
                .filter(Boolean)
            : [],
          favicon,
          // FIX: Send hubs as array instead of hub as string
          hubs: [hub],
        };
        const response = await addBookmark(bookmarkData);
        const { status, message: msg } = response.data;
        if (status) {
          message.success(
            msg || `Bookmark added to ${capitalizeHub(hub)} hub successfully!`
          );
          loadBookmarks();
          onBookmarkAdded?.();
        } else {
          message.error(msg || "Failed to add bookmark");
        }
      } else {
        const bookmarkData = {
          id: values.id,
          editing: true,
          title: values.title,
          url: normalizedUrl,
          description: values.description,
          category: finalCategory,
          tags: values.tags
            ? values.tags
                .split(",")
                .map((tag: string) => tag.trim())
                .filter(Boolean)
            : [],
          // FIX: Send hubs as array instead of hub as string
          hubs: [hub],
        };
        const response = await addBookmark(bookmarkData);
        const { status, message: msg } = response.data;
        if (status) {
          message.success(msg || "Bookmark updated successfully!");
          loadBookmarks();
          onBookmarkAdded?.();
        } else {
          message.error(msg || "Failed to update bookmark");
        }
      }
      closeModal();
    } catch (error) {
      console.error("Error saving bookmark:", error);
      message.error("Failed to save bookmark");
    }
  };

  const getFaviconFromUrl = (url: string): string => {
    if (!url || typeof url !== "string") return "";
    const normalizedUrl = normalizeUrl(url);
    try {
      const parsedUrl = new URL(normalizedUrl);
      return `${parsedUrl.origin}/favicon.ico`;
    } catch (err) {
      return "";
    }
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              minWidth: 0,
              flex: 1,
            }}
          >
            <Avatar
              style={{
                backgroundColor: "#dc2626",
                color: "#fff",
                fontSize: "18px",
                flexShrink: 0,
              }}
              size={40}
              icon={icon}
            />
            <div style={{ minWidth: 0, flex: 1 }}>
              <Title
                level={4}
                style={{
                  margin: 0,
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "#262626",
                  fontFamily: FONT_FAMILY,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  lineHeight: "1.3",
                  maxHeight: "2.6em", // 2 lines * 1.3 line height
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                }}
                title={title} // Add title attribute for tooltip on hover
              >
                {title}
              </Title>
              <Text
                type="secondary"
                style={{
                  fontSize: "13px",
                  fontFamily: FONT_FAMILY,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                }}
              >
                {bookmarks.length} Bookmarks • {capitalizeHub(hub)} Hub
              </Text>
            </div>
          </div>

          {showAddButton && (
            <CustomButton
              label="Add Bookmark" // tooltip text
              onClick={() => setAddModalVisible(true)}
            />
          )}
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            paddingRight: "6px",
          }}
        >
          {bookmarks.length === 0 ? (
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
                onClick={openCreateModal}
                style={{
                  padding: "16px",
                  border: "2px dashed #f0f0f0",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  width: "100%",
                  maxWidth: "100%",
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
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                  }}
                >
                  Add New Bookmark
                </Text>
                <Text
                  style={{
                    color: "#bbb",
                    fontSize: "10px",
                    fontFamily: FONT_FAMILY,
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                  }}
                >
                  Bookmark description...
                </Text>
              </div>
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {bookmarks.map((bookmark) => {
                const isExpanded = expandedBookmarks.has(bookmark.id);

                return (
                  <div
                    key={bookmark.id}
                    style={{
                      backgroundColor: "#fafafa",
                      borderRadius: "12px",
                      border: "1px solid #f0f0f0",
                      transition: "all 0.2s ease",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                      maxWidth: "100%",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "12px 16px",
                        cursor: "pointer",
                        minWidth: 0,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement!.style.backgroundColor =
                          "#f5f5f5";
                        e.currentTarget.parentElement!.style.borderColor =
                          "#d9d9d9";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement!.style.backgroundColor =
                          "#fafafa";
                        e.currentTarget.parentElement!.style.borderColor =
                          "#f0f0f0";
                      }}
                    >
                      <Avatar
                        src={
                          bookmark.favicon || getFaviconFromUrl(bookmark.url)
                        }
                        size={32}
                        style={{
                          backgroundColor: "#f5f5f5",
                          marginRight: "12px",
                          flexShrink: 0,
                        }}
                        icon={<LinkOutlined />}
                      />

                      <div
                        style={{ flex: 1, minWidth: 0 }}
                        onClick={(e) => handleTitleClick(bookmark.url, e)}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "8px",
                            minWidth: 0,
                          }}
                        >
                          <Text
                            style={{
                              fontWeight: 500,
                              fontSize: "14px",
                              color: "#262626",
                              fontFamily: FONT_FAMILY,
                              cursor: "pointer",
                              flex: 1,
                              minWidth: 0,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              lineHeight: "1.4",
                              maxHeight: "2.8em", // 2 lines * 1.4 line height
                              wordBreak: "break-word",
                              overflowWrap: "break-word",
                            }}
                            title={bookmark.title} // Add title attribute for tooltip on hover
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = "#1890ff";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = "#262626";
                            }}
                          >
                            {bookmark.title}
                          </Text>

                          <Button
                            type="text"
                            size="small"
                            icon={
                              bookmark.isFavorite ? (
                                <StarFilled
                                  style={{
                                    color: "#f09e06ff",
                                    fontSize: "14px",
                                  }}
                                />
                              ) : (
                                <StarOutlined style={{ fontSize: "14px" }} />
                              )
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFavorite(bookmark.id);
                            }}
                            style={{
                              width: "24px",
                              height: "24px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              marginTop: "2px", // Slight adjustment to align with text
                            }}
                          />
                        </div>
                      </div>

                      <Button
                        type="text"
                        size="small"
                        icon={isExpanded ? <UpOutlined /> : <DownOutlined />}
                        onClick={(e) => handleToggleExpand(bookmark.id, e)}
                        style={{
                          width: "28px",
                          height: "28px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginLeft: "8px",
                          flexShrink: 0,
                        }}
                      />
                    </div>

                    {isExpanded && (
                      <div
                        style={{
                          borderTop: "1px solid #f0f0f0",
                          backgroundColor: "#ffffff",
                          padding: "16px",
                          flex: 1,
                          maxWidth: "100%",
                        }}
                      >
                        {bookmark.description && (
                          <div style={{ marginBottom: "12px" }}>
                            <div
                              style={{
                                fontSize: "13px",
                                lineHeight: "1.5",
                                fontFamily: FONT_FAMILY,
                                color: "rgba(0,0,0,0.45)",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                wordBreak: "break-word",
                                overflowWrap: "break-word",
                                wordWrap: "break-word",
                                hyphens: "auto",
                                maxWidth: "100%",
                              }}
                            >
                              {bookmark.description}
                            </div>
                          </div>
                        )}

                        <div style={{ marginBottom: "12px" }}>
                          <Text
                            type="secondary"
                            style={{
                              fontSize: "12px",
                              fontFamily: FONT_FAMILY,
                              wordBreak: "break-all",
                              overflowWrap: "break-word",
                            }}
                          >
                            {new URL(bookmark.url).hostname}
                          </Text>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "16px",
                            flexWrap: "wrap",
                            maxWidth: "100%",
                          }}
                        >
                          <Tag
                            color={categoryColors[bookmark.category] || "#666"}
                            style={{
                              fontSize: "11px",
                              padding: "2px 6px",
                              borderRadius: "6px",
                              margin: 0,
                              fontFamily: FONT_FAMILY,
                              maxWidth: "150px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              wordBreak: "break-all",
                              overflowWrap: "break-word",
                            }}
                          >
                            {bookmark.category}
                          </Tag>

                          {bookmark.tags && bookmark.tags.length > 0 && (
                            <>
                              {bookmark.tags
                                .slice(0, 3)
                                .map((tag: string, index: number) => (
                                  <Tag
                                    key={index}
                                    style={{
                                      fontSize: "10px",
                                      padding: "2px 6px",
                                      backgroundColor: "#f0f0f0",
                                      border: "1px solid #e0e0e0",
                                      borderRadius: "4px",
                                      margin: 0,
                                      fontFamily: FONT_FAMILY,
                                      maxWidth: "100px",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                      wordBreak: "break-all",
                                      overflowWrap: "break-word",
                                    }}
                                  >
                                    {tag}
                                  </Tag>
                                ))}
                              {bookmark.tags.length > 3 && (
                                <Text
                                  type="secondary"
                                  style={{
                                    fontSize: "11px",
                                    fontFamily: FONT_FAMILY,
                                  }}
                                >
                                  +{bookmark.tags.length - 3} more
                                </Text>
                              )}
                            </>
                          )}
                        </div>

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
                              icon={
                                <EditOutlined style={{ fontSize: "14px" }} />
                              }
                              onClick={() => handleEdit(bookmark.id)}
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

                            <Button
                              type="text"
                              size="small"
                              icon={
                                <ShareAltOutlined
                                  style={{ fontSize: "14px" }}
                                />
                              }
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShareBookmark(bookmark, e);
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

                            <Button
                              type="text"
                              size="small"
                              icon={
                                <CopyOutlined style={{ fontSize: "14px" }} />
                              }
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyUrl(bookmark.url);
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

                            <Popconfirm
                              title="Are you sure to delete this bookmark?"
                              onConfirm={() => handleDelete(bookmark.id)}
                              okText="Yes, Delete"
                              cancelText="No"
                              okButtonProps={{ danger: true }}
                            >
                              <Button
                                type="text"
                                size="small"
                                icon={
                                  <DeleteOutlined
                                    style={{
                                      fontSize: "14px",
                                      color: "#ff0207ff",
                                    }}
                                  />
                                }
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
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>
      {currentShareBookmark && (
        <ShareModal
          isVisible={shareModalVisible}
          onClose={() => {
            setShareModalVisible(false);
            setCurrentShareBookmark(null);
          }}
          title="Share Bookmark"
          item={currentShareBookmark}
          itemType="bookmark"
          familyMembers={familyMembers}
          loading={loading}
          currentHubId="2a2b3c4d-1111-2222-3333-abcdef784512" // Accounts hub ID
          onShareSuccess={(message) => {
            // Optional: handle success callback
            console.log("Share success:", message);
          }}
        />
      )}
      <Modal
        title={
          <span style={{ fontFamily: FONT_FAMILY }}>
            {modalMode === "create"
              ? `Add New Bookmark to ${capitalizeHub(hub)} Hub`
              : "Edit Bookmark"}
          </span>
        }
        open={addModalVisible}
        onCancel={closeModal}
        footer={null}
        style={{ top: 20, fontFamily: FONT_FAMILY }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddBookmark}
          style={{ marginTop: "16px" }}
        >
          <Form.Item
            name="title"
            label={<span style={{ fontFamily: FONT_FAMILY }}>Title</span>}
            rules={[{ required: true, message: "Please enter bookmark title" }]}
          >
            <Input
              placeholder="Enter bookmark title"
              style={{
                fontFamily: FONT_FAMILY,
                wordBreak: "break-word",
                overflowWrap: "break-word",
              }}
            />
          </Form.Item>
          <Form.Item
            name="url"
            label={<span style={{ fontFamily: FONT_FAMILY }}>URL</span>}
            normalize={(value: string) => normalizeUrl(value)}
            rules={[
              { required: true, message: "Please enter URL" },
              {
                validator: (_: any, value: string) =>
                  value &&
                  normalizeUrl(value).match(/^https?:\/\/[\w\-]+(\.[\w\-]+)+/)
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error(
                          "Please enter a valid URL, e.g., www.example.com"
                        )
                      ),
              },
            ]}
          >
            <Input
              placeholder="www.example.com"
              style={{
                fontFamily: FONT_FAMILY,
                wordBreak: "break-all",
                overflowWrap: "break-word",
              }}
            />
          </Form.Item>
          <Form.Item
            name="description"
            label={<span style={{ fontFamily: FONT_FAMILY }}>Description</span>}
          >
            <Input.TextArea
              placeholder="Brief description of the bookmark"
              rows={3}
              style={{
                fontFamily: FONT_FAMILY,
                wordBreak: "break-word",
                overflowWrap: "break-word",
                resize: "vertical",
              }}
            />
          </Form.Item>
          <Form.Item
            name="category"
            label={
              <span style={{ fontFamily: FONT_FAMILY }}>Sub Category</span>
            }
            rules={[{ required: true, message: "Please select Sub Category" }]}
          >
            <Select
              placeholder="Select Sub Category"
              style={{ fontFamily: FONT_FAMILY }}
              onChange={handleCategoryChange}
            >
              <Option value="Tech" style={{ fontFamily: FONT_FAMILY }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <CodeOutlined
                    style={{ fontSize: "14px", color: "#af630bff" }}
                  />
                  Tech
                </div>
              </Option>
              <Option value="Design" style={{ fontFamily: FONT_FAMILY }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <BgColorsOutlined
                    style={{ fontSize: "14px", color: "#9f0aaaff" }}
                  />
                  Design
                </div>
              </Option>
              <Option value="News" style={{ fontFamily: FONT_FAMILY }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <GlobalOutlined
                    style={{ fontSize: "14px", color: "#fa541c" }}
                  />
                  News
                </div>
              </Option>
              <Option value="Social" style={{ fontFamily: FONT_FAMILY }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <UsergroupAddOutlined
                    style={{ fontSize: "14px", color: "#52c41a" }}
                  />
                  Social
                </div>
              </Option>
              <Option value="Tools" style={{ fontFamily: FONT_FAMILY }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <ToolOutlined
                    style={{ fontSize: "14px", color: "#2c0447ff" }}
                  />
                  Tools
                </div>
              </Option>
              <Option value="Education" style={{ fontFamily: FONT_FAMILY }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <ReadOutlined
                    style={{ fontSize: "14px", color: "#13c2c2" }}
                  />
                  Education
                </div>
              </Option>
              <Option value="Entertainment" style={{ fontFamily: FONT_FAMILY }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <PlayCircleOutlined
                    style={{ fontSize: "14px", color: "#a01010ff" }}
                  />
                  Entertainment
                </div>
              </Option>
              <Option
                value="Add Custom Category"
                style={{ fontFamily: FONT_FAMILY }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <EllipsisOutlined
                    style={{ fontSize: "14px", color: "#3a1e1eff" }}
                  />
                  Add Custom Category
                </div>
              </Option>
            </Select>
          </Form.Item>
          {showCustomCategory && (
            <Form.Item
              label={
                <span style={{ fontFamily: FONT_FAMILY }}>
                  Custom Sub Category
                </span>
              }
              rules={[
                { required: true, message: "Please enter custom Sub Category" },
                {
                  max: 50,
                  message: "Sub Category name cannot exceed 50 characters",
                },
              ]}
            >
              <Input
                placeholder="Enter custom Sub Category name"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                style={{
                  fontFamily: FONT_FAMILY,
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                }}
              />
            </Form.Item>
          )}
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                style={{
                  fontFamily: FONT_FAMILY,
                  backgroundColor: PRIMARY_COLOR, // ✅ Your custom color
                  borderColor: PRIMARY_COLOR, // ✅ Match border with background
                }}
              >
                {modalMode === "create" ? "Add Bookmark" : "Update Bookmark"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BookmarkHub;
