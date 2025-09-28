"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Input,
  Button,
  Select,
  Card,
  Typography,
  Space,
  Tag,
  Dropdown,
  Modal,
  Form,
  message,
  Row,
  Col,
  Avatar,
  Empty,
  Tooltip,
  Table,
  TableColumnsType,
  Spin,
  Popconfirm,
  Checkbox,
  Radio,
} from "antd";
import {
  SearchOutlined,
  PlusOutlined,
  HeartOutlined,
  HeartFilled,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  AppstoreOutlined,
  TableOutlined,
  LinkOutlined,
  BookOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  MailOutlined,
  TagOutlined,
  CalendarOutlined,
  DollarOutlined,
  HomeOutlined,
  StarOutlined,
  StarFilled,
  LockOutlined,
  CheckCircleOutlined,
  CodeOutlined,
  BgColorsOutlined,
  GlobalOutlined,
  UsergroupAddOutlined,
  ToolOutlined,
  ReadOutlined,
  PlayCircleOutlined,
  EllipsisOutlined,
  IdcardOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  addBookmark,
  getBookmarks,
  deleteBookmark,
  toggleFavorite,
  getCategories,
  getStats,
} from "../../../services/bookmarks";
import { Bookmark, BookmarkFormData } from "../../../types/bookmarks";
import { useGlobalLoading } from "../../loadingContext";
import ExtensionDownloadModal from "../../../pages/bookmarks/smdownload";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "../../userContext";
import { getUsersFamilyMembers } from "../../../services/family";
import { CustomButton, PRIMARY_COLOR } from "../../comman";
import ShareModal from "../../../pages/components/ShareModal";

const { Title, Text, Paragraph } = Typography;
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

// Add category icons mapping
const categoryIcons: Record<string, React.ReactElement> = {
  Tech: <CodeOutlined style={{ fontSize: "12px" }} />,
  Design: <BgColorsOutlined style={{ fontSize: "12px" }} />,
  News: <GlobalOutlined style={{ fontSize: "12px" }} />,
  Social: <UsergroupAddOutlined style={{ fontSize: "12px" }} />,
  Tools: <ToolOutlined style={{ fontSize: "12px" }} />,
  Education: <ReadOutlined style={{ fontSize: "12px" }} />,
  Entertainment: <PlayCircleOutlined style={{ fontSize: "12px" }} />,
  Others: <EllipsisOutlined style={{ fontSize: "12px" }} />,
};

// Updated hub options with icons
const hubOptions = [
  {
    value: "family",
    label: "Family",
    color: "#eb2f96",
    icon: <TeamOutlined style={{ fontSize: "12px" }} />,
  },
  {
    value: "planner",
    label: "Planner",
    color: "#9254de",
    icon: <CalendarOutlined style={{ fontSize: "12px" }} />,
  },
  {
    value: "finance",
    label: "Finance",
    color: "#13c2c2",
    icon: <DollarOutlined style={{ fontSize: "12px" }} />,
  },
  {
    value: "health",
    label: "Health",
    color: "#f5222d",
    icon: <HeartOutlined style={{ fontSize: "12px" }} />,
  },
  {
    value: "home",
    label: "Home",
    color: "#fa8c16",
    icon: <HomeOutlined style={{ fontSize: "12px" }} />,
  },
  {
    value: "none",
    label: "None (Utilities)",
    color: "#faad14",
    icon: <BookOutlined style={{ fontSize: "12px" }} />,
  },
];

const Bookmarks: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const router = useRouter();
  const { loading, setLoading } = useGlobalLoading();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingBookmarkId, setEditingBookmarkId] = useState<string | null>(
    null
  );
  const [form] = Form.useForm();
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // Add specific loading state for bookmark form submission
  const [bookmarkFormLoading, setBookmarkFormLoading] = useState(false);

  // Share modal states - simplified to use common ShareModal
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [currentShareBookmark, setCurrentShareBookmark] =
    useState<Bookmark | null>(null);

  const username = useCurrentUser()?.user_name || "";
  const [familyMembers, setFamilyMembers] = useState([]);

  // New states for custom category functionality
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState("");

  // New states for password functionality
  const [savePassword, setSavePassword] = useState(false);
  const [passwordSaveOption, setPasswordSaveOption] = useState(" ");

  // New states for password modal
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [passwordForm] = Form.useForm();

  // Responsive state
  const [windowSize, setWindowSize] = useState({ width: 1200, height: 800 });
  const [currentBreakpoint, setCurrentBreakpoint] = useState("desktop");
  const [searchTerm, setSearchTerm] = useState("");

  // Handle window resize for responsiveness
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setWindowSize({ width, height });

      if (width < 576) {
        setCurrentBreakpoint("small-mobile");
      } else if (width < 768) {
        setCurrentBreakpoint("mobile");
      } else if (width < 992) {
        setCurrentBreakpoint("tablet");
      } else {
        setCurrentBreakpoint("desktop");
      }
    };

    handleResize(); // Set initial values
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Responsive helper functions
  const isMobile = () => windowSize.width < 768;
  const isTablet = () => windowSize.width >= 768 && windowSize.width < 992;
  const isDesktop = () => windowSize.width >= 992;
  const isSmallMobile = () => windowSize.width < 576;

  const showModal = () => {
    router.push(`/${username}/bookmarks/download`);
  };

  useEffect(() => {
    loadBookmarks();
    loadCategories();
    fetchFamilyMembers();
  }, []);

  useEffect(() => {
    loadBookmarks();
  }, [searchQuery, selectedCategory, sortBy]);

  const filteredFamilyMembers = familyMembers
    .filter((member: any) => member.relationship !== "me")
    .filter((member: any) => member.status?.toLowerCase() !== "pending") // ✅ Added pending filter
    .filter((member: any) => member.email && member.email.trim())
    .filter((member: any) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
        search: searchQuery || undefined,
        category: selectedCategory !== "All" ? selectedCategory : undefined,
        sortBy: sortBy,
        // Don't pass hub parameter to get bookmarks from all hubs
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
            // Ensure hubs is always an array - now coming from backend
            hubs: bookmark.hubs || ["none"],
          }));
        setBookmarks(normalizedBookmarks);
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

  const loadCategories = async () => {
    try {
      const response = await getCategories();
      const { status, payload } = response.data;
      if (status) {
        setCategories(["All", ...payload.categories]);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const filteredBookmarks = useMemo(() => {
    let filtered = bookmarks;
    if (showOnlyFavorites) {
      filtered = filtered.filter((bookmark) => bookmark.isFavorite);
    }
    return filtered;
  }, [bookmarks, showOnlyFavorites]);

  const handleFavoritesClick = () => {
    setShowOnlyFavorites(!showOnlyFavorites);
    if (!showOnlyFavorites) {
      setSearchQuery("");
      setSelectedCategory("All");
    }
  };

  const handleToggleFavorite = async (id: string) => {
    setBookmarks((prev) =>
      prev.map((bookmark) =>
        bookmark.id === id
          ? { ...bookmark, isFavorite: !bookmark.isFavorite }
          : bookmark
      )
    );

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
        setBookmarks((prev) =>
          prev.map((bookmark) =>
            bookmark.id === id
              ? {
                  ...bookmark,
                  ...updatedBookmark,
                  createdAt: bookmark.createdAt || bookmark.created_at,
                  created_at: bookmark.created_at || bookmark.createdAt,
                }
              : bookmark
          )
        );
        message.success(
          updatedBookmark.isFavorite
            ? `"${updatedBookmark.title}" added to favorites`
            : `"${updatedBookmark.title}" removed from favorites`
        );
      } else {
        message.error(msg || "Failed to update favorite status");
        setBookmarks((prev) =>
          prev.map((bookmark) =>
            bookmark.id === id
              ? { ...bookmark, isFavorite: !bookmark.isFavorite }
              : bookmark
          )
        );
      }
    } catch (error) {
      message.error("Failed to update favorite status");
      console.error("Error toggling favorite:", error);
      setBookmarks((prev) =>
        prev.map((bookmark) =>
          bookmark.id === id
            ? { ...bookmark, isFavorite: !bookmark.isFavorite }
            : bookmark
        )
      );
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
        loadCategories();
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

      // Check if category is a custom one (not in predefined list)
      const predefinedCategories = [
        "Tech",
        "Design",
        "News",
        "Social",
        "Tools",
        "Education",
        "Entertainment",
        "Others",
      ];
      const isCustomCategory = !predefinedCategories.includes(
        bookmark.category
      );

      form.setFieldsValue({
        title: bookmark.title,
        url: displayUrl,
        description: bookmark.description,
        category: isCustomCategory ? "Others" : bookmark.category,
        customCategory: isCustomCategory ? bookmark.category : "",
        tags: bookmark.tags?.join(", ") || "",
        hubs: bookmark.hubs || ["none"],
        id: bookmark.id,
        savePassword: false,
        passwordSaveOption: "",
      });

      setShowCustomCategory(isCustomCategory);
      setCustomCategory(isCustomCategory ? bookmark.category : "");
      setSavePassword(false);
      setPasswordSaveOption("");
      setAddModalVisible(true);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    message.success("URL copied to clipboard");
  };

  // Simplified share handler using common ShareModal
  const handleShareBookmark = (bookmark: Bookmark, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentShareBookmark(bookmark);
    setShareModalVisible(true);
  };

  const openCreateModal = () => {
    setModalMode("create");
    form.resetFields();
    setShowCustomCategory(false);
    setCustomCategory("");
    setSavePassword(false);
    setPasswordSaveOption("");

    // Set default hub as family
    const defaultHubs = ["family"];
    form.setFieldsValue({
      hubs: defaultHubs,
      savePassword: false,
      passwordSaveOption: "",
    });
    setAddModalVisible(true);
  };

  const closeModal = () => {
    setAddModalVisible(false);
    form.resetFields();
    setEditingBookmarkId(null);
    setShowCustomCategory(false);
    setCustomCategory("");
    setSavePassword(false);
    setPasswordSaveOption("");
  };

  const handleCategoryChange = (value: string) => {
    if (value === "Others") {
      setShowCustomCategory(true);
    } else {
      setShowCustomCategory(false);
      setCustomCategory("");
      form.setFieldsValue({ customCategory: "" });
    }
  };

  const handlePasswordCheckboxChange = (e: any) => {
    const checked = e.target.checked;
    setSavePassword(checked);
    if (!checked) {
      setPasswordSaveOption("");
      form.setFieldsValue({ passwordSaveOption: "" });
    }
  };

  const handlePasswordSaveOptionChange = (e: any) => {
    const value = e.target.value;
    setPasswordSaveOption(value);

    // Open password modal when "dockly" is selected
    if (value === "dockly") {
      setPasswordModalVisible(true);
      passwordForm.resetFields();
    }
  };

  const handlePasswordModalOk = async () => {
    try {
      const values = await passwordForm.validateFields();
      // Here you can handle the password value if needed
      // For now, just close the modal
      setPasswordModalVisible(false);
      passwordForm.resetFields();
      message.success("Password saved with Dockly");
    } catch (error) {
      console.error("Password validation failed:", error);
    }
  };

  const handleAddBookmark = async () => {
    try {
      setBookmarkFormLoading(true); // Set loading state to true

      const values = await form.validateFields();
      const normalizedUrl = normalizeUrl(values.url);
      const favicon = getFaviconFromUrl(normalizedUrl);

      // Determine the final category
      const finalCategory =
        showCustomCategory && customCategory.trim()
          ? customCategory.trim()
          : values.category;

      // Get hubs value, ensure it's an array and filter out "none" if other hubs are selected
      let hubsValue = Array.isArray(values.hubs) ? values.hubs : [values.hubs];

      // Ensure we never send an empty array
      if (!hubsValue || hubsValue.length === 0) {
        hubsValue = ["family"];
      }

      // If multiple hubs are selected and "none" is among them, remove "none"
      if (hubsValue.length > 1 && hubsValue.includes("none")) {
        hubsValue = hubsValue.filter((hub: string) => hub !== "none");
      }

      // If no valid hubs after filtering, set default
      if (hubsValue.length === 0) {
        hubsValue = ["family"];
      }

      // Prepare the bookmark data
      const bookmarkData = {
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
        hubs: hubsValue, // Send as array
        // Add password-related fields if password saving is enabled
        ...(values.savePassword && {
          savePassword: true,
          passwordSaveOption: values.passwordSaveOption,
        }),
      };

      if (modalMode === "create") {
        const response = await addBookmark(bookmarkData);
        const { status, message: msg } = response.data;
        if (status) {
          const hubLabels = hubsValue
            .map(
              (hub: string) =>
                hubOptions.find((h) => h.value === hub)?.label || "Utilities"
            )
            .join(", ");
          message.success(
            msg || `Bookmark added to ${hubLabels} successfully!`
          );
          loadBookmarks();
          loadCategories();
        } else {
          message.error(msg || "Failed to add bookmark");
        }
      } else {
        // For edit mode, include the bookmark ID and editing flag
        const editBookmarkData = {
          ...bookmarkData,
          id: values.id,
          editing: true,
        };

        const response = await addBookmark(editBookmarkData);
        const { status, message: msg } = response.data;
        if (status) {
          message.success(msg || "Bookmark updated successfully!");
          loadBookmarks();
          loadCategories();
        } else {
          message.error(msg || "Failed to update bookmark");
        }
      }
      closeModal();
    } catch (error) {
      console.error("Error saving bookmark:", error);
      message.error("Failed to save bookmark");
    } finally {
      setBookmarkFormLoading(false); // Set loading state to false
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

  const getDropdownMenu = (bookmark: Bookmark) => ({
    items: [
      {
        key: "edit",
        icon: <EditOutlined />,
        label: "Edit",
        onClick: () => handleEdit(bookmark.id),
      },
      {
        type: "divider" as const,
      },
      {
        key: "delete",
        icon: <DeleteOutlined />,
        label: "Delete",
        danger: true,
        onClick: () => handleDelete(bookmark.id),
      },
    ],
  });

  const getHubsDisplay = (hubs: string[] | undefined) => {
    if (!hubs || hubs.length === 0) {
      const defaultHub = hubOptions.find((h) => h.value === "family");
      return defaultHub
        ? [
            {
              label: defaultHub.label,
              color: defaultHub.color,
              icon: defaultHub.icon,
              value: defaultHub.value,
            },
          ]
        : [];
    }

    return hubs.map((hub) => {
      const hubOption = hubOptions.find((h) => h.value === hub);
      return hubOption
        ? {
            label: hubOption.label,
            color: hubOption.color,
            icon: hubOption.icon,
            value: hubOption.value,
          }
        : {
            label: "Utilities",
            color: "#faad14",
            icon: <BookOutlined style={{ fontSize: "12px" }} />,
            value: "none",
          };
    });
  };

  const renderBookmarkCard = (bookmark: Bookmark) => {
    if (!bookmark.url || !bookmark.url.match(/^https?:\/\//i)) {
      return null;
    }

    const hubsToDisplay = getHubsDisplay(bookmark.hubs);
    const categoryIcon =
      categoryIcons[bookmark.category] || categoryIcons["Others"];

    // Responsive card height and spacing
    const cardHeight = isSmallMobile()
      ? "160px"
      : isMobile()
      ? "170px"
      : "180px";
    const cardPadding = isSmallMobile() ? "8px" : "10px";
    const titleFontSize = isSmallMobile() ? "14px" : "15px";
    const iconSize = isSmallMobile() ? 24 : 28;

    return (
      <Card
        key={bookmark.id}
        hoverable
        style={{
          borderRadius: "12px",
          overflow: "hidden",
          transition: "all 0.3s ease",
          border: "1px solid #f0f0f0",
          backgroundColor: "#ffffff",
          height: cardHeight,
          fontFamily: FONT_FAMILY,
        }}
        bodyStyle={{
          padding: cardPadding,
          height: "calc(100% - 40px)",
          display: "flex",
          flexDirection: "column",
        }}
        actions={[
          <Tooltip title="Edit" key="edit">
            <Button
              type="text"
              icon={
                <EditOutlined
                  style={{ fontSize: isSmallMobile() ? "12px" : "14px" }}
                />
              }
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(bookmark.id);
              }}
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: FONT_FAMILY,
                fontSize: isSmallMobile() ? "10px" : "12px",
                padding: "4px",
              }}
            />
          </Tooltip>,
          <Tooltip title="Share" key="share">
            <Button
              type="text"
              icon={
                <ShareAltOutlined
                  style={{ fontSize: isSmallMobile() ? "12px" : "14px" }}
                />
              }
              onClick={(e) => {
                e.stopPropagation();
                handleShareBookmark(bookmark, e);
              }}
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: FONT_FAMILY,
                fontSize: isSmallMobile() ? "10px" : "12px",
                padding: "4px",
              }}
            />
          </Tooltip>,
          <Tooltip title="Copy URL" key="copy">
            <Button
              type="text"
              icon={
                <CopyOutlined
                  style={{ fontSize: isSmallMobile() ? "12px" : "14px" }}
                />
              }
              onClick={(e) => {
                e.stopPropagation();
                handleCopyUrl(bookmark.url);
              }}
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: FONT_FAMILY,
                fontSize: isSmallMobile() ? "10px" : "12px",
                padding: "4px",
              }}
            />
          </Tooltip>,
          <Tooltip title="Delete" key="delete">
            <Popconfirm
              title="Are you sure you want to delete this bookmark?"
              onConfirm={(e) => {
                e?.stopPropagation();
                handleDelete(bookmark.id);
              }}
              onCancel={(e) => e?.stopPropagation()}
              okText="Yes, Delete"
              cancelText="No"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="text"
                icon={
                  <DeleteOutlined
                    style={{
                      fontSize: isSmallMobile() ? "12px" : "14px",
                      color: "#ff4d4f",
                    }}
                  />
                }
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: FONT_FAMILY,
                  fontSize: isSmallMobile() ? "10px" : "12px",
                  padding: "4px",
                }}
              />
            </Popconfirm>
          </Tooltip>,
        ]}
        onMouseEnter={(e) => {
          if (!isMobile()) {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.15)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isMobile()) {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
          }
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            flex: "1 0 auto",
          }}
        >
          <div
            style={{
              flex: "0 0 auto",
              marginBottom: isSmallMobile() ? "4px" : "6px",
            }}
          >
            {/* Top row with favicon, category tag, hub tags, and favorite button */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: isSmallMobile() ? "4px" : "6px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <Avatar
                  src={bookmark.favicon || getFaviconFromUrl(bookmark.url)}
                  size={iconSize}
                  style={{
                    marginRight: isSmallMobile() ? "6px" : "8px",
                    backgroundColor: "#f5f5f5",
                    flexShrink: 0,
                  }}
                  icon={<LinkOutlined />}
                />
                <Tag
                  color={categoryColors[bookmark.category] || "#666"}
                  style={{
                    margin: 0,
                    borderRadius: "8px",
                    fontSize: isSmallMobile() ? "10px" : "11px",
                    padding: isSmallMobile() ? "1px 4px" : "2px 6px",
                    fontFamily: FONT_FAMILY,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  {React.cloneElement(categoryIcon, {
                    style: {
                      fontSize: isSmallMobile() ? "8px" : "10px",
                      color: "#fff",
                    },
                  })}
                  {isSmallMobile()
                    ? bookmark.category.substring(0, 4) +
                      (bookmark.category.length > 4 ? "..." : "")
                    : bookmark.category}
                </Tag>
              </div>

              {/* Right side: Hub Tags + Favorite Button */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: isSmallMobile() ? "2px" : "4px",
                }}
              >
                {/* Hub Tags with icons */}
                <div
                  style={{ display: "flex", alignItems: "center", gap: "2px" }}
                >
                  <Tooltip
                    title={hubsToDisplay.map((hub) => hub.label).join(", ")}
                    placement="topRight"
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "2px",
                      }}
                    >
                      {hubsToDisplay
                        .slice(0, isSmallMobile() ? 1 : 2)
                        .map((hub, index) => (
                          <div
                            key={index}
                            style={{
                              width: isSmallMobile() ? "16px" : "20px",
                              height: isSmallMobile() ? "16px" : "20px",
                              borderRadius: "6px",
                              backgroundColor: hub.color,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#fff",
                            }}
                          >
                            {React.cloneElement(hub.icon, {
                              style: {
                                fontSize: isSmallMobile() ? "8px" : "10px",
                                color: "#fff",
                              },
                            })}
                          </div>
                        ))}
                      {hubsToDisplay.length > (isSmallMobile() ? 1 : 2) && (
                        <div
                          style={{
                            width: isSmallMobile() ? "16px" : "20px",
                            height: isSmallMobile() ? "16px" : "20px",
                            borderRadius: "6px",
                            backgroundColor: "#f0f0f0",
                            border: "1px solid #e1e8ed",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#666",
                            fontSize: isSmallMobile() ? "7px" : "8px",
                            fontWeight: "bold",
                            fontFamily: FONT_FAMILY,
                          }}
                        >
                          +{hubsToDisplay.length - (isSmallMobile() ? 1 : 2)}
                        </div>
                      )}
                    </div>
                  </Tooltip>
                </div>

                {/* Favorite Button */}
                <Tooltip
                  title={
                    bookmark.isFavorite
                      ? "Remove from favorites"
                      : "Add to favorites"
                  }
                >
                  <Button
                    type="text"
                    size="small"
                    icon={
                      bookmark.isFavorite ? (
                        <StarFilled
                          style={{
                            color: "#f09e06ff",
                            fontSize: isSmallMobile() ? "12px" : "14px",
                          }}
                        />
                      ) : (
                        <StarOutlined
                          style={{
                            fontSize: isSmallMobile() ? "12px" : "14px",
                          }}
                        />
                      )
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(bookmark.id);
                    }}
                    style={{
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: FONT_FAMILY,
                      padding: "4px",
                      minWidth: isSmallMobile() ? "24px" : "28px",
                      height: isSmallMobile() ? "24px" : "28px",
                      flexShrink: 0,
                    }}
                  />
                </Tooltip>
              </div>
            </div>

            {/* Title */}
            <Title
              level={5}
              style={{
                margin: 0,
                lineHeight: "1.2",
                color: "#1f1f1f",
                fontSize: titleFontSize,
                fontWeight: 600,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: isSmallMobile() ? 1 : 2,
                WebkitBoxOrient: "vertical",
                fontFamily: FONT_FAMILY,
                marginBottom: "3px",
              }}
            >
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#1890ff",
                  textDecoration: "none",
                  fontFamily: FONT_FAMILY,
                }}
              >
                {bookmark.title}
              </a>
            </Title>

            <Text
              type="secondary"
              style={{
                fontSize: isSmallMobile() ? "10px" : "11px",
                display: "block",
                marginBottom: isSmallMobile() ? "4px" : "6px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontFamily: FONT_FAMILY,
              }}
            >
              {new URL(bookmark.url).hostname}
            </Text>
          </div>

          {!isSmallMobile() && (
            <div
              style={{
                flex: "1 0 auto",
                marginBottom: "6px",
                maxHeight: "18px",
              }}
            >
              <Paragraph
                style={{
                  margin: 0,
                  color: "#595959",
                  fontSize: "13px",
                  lineHeight: "1.3",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "100%",
                  fontFamily: FONT_FAMILY,
                }}
              >
                {bookmark.description || " "}
              </Paragraph>
            </div>
          )}

          <div style={{ flex: "0 0 auto" }}>
            {Array.isArray(bookmark.tags) && bookmark.tags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                {bookmark.tags
                  .slice(0, isSmallMobile() ? 1 : 2)
                  .map((tag, index) => (
                    <Tag
                      key={index}
                      style={{
                        margin: 0,
                        backgroundColor: "#f6f8fa",
                        border: "1px solid #e1e8ed",
                        borderRadius: "5px",
                        fontSize: isSmallMobile() ? "10px" : "11px",
                        padding: "1px 6px",
                        color: "#586069",
                        maxWidth: isSmallMobile() ? "60px" : "80px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      {tag}
                    </Tag>
                  ))}
                {bookmark.tags &&
                  bookmark.tags.length > (isSmallMobile() ? 1 : 2) && (
                    <Tooltip
                      title={bookmark.tags
                        .slice(isSmallMobile() ? 1 : 2)
                        .join(", ")}
                    >
                      <Tag
                        style={{
                          margin: 0,
                          fontSize: isSmallMobile() ? "10px" : "11px",
                          backgroundColor: "#f0f0f0",
                          border: "1px solid #e1e8ed",
                          borderRadius: "5px",
                          padding: "1px 6px",
                          color: "#666",
                          fontFamily: FONT_FAMILY,
                        }}
                      >
                        +{bookmark.tags.length - (isSmallMobile() ? 1 : 2)}
                      </Tag>
                    </Tooltip>
                  )}
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  };

  const tableColumns: TableColumnsType<Bookmark> = [
    {
      title: "Bookmark",
      dataIndex: "title",
      key: "title",
      width: isMobile() ? "40%" : "25%",
      render: (_, bookmark) => (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: isMobile() ? "8px" : "12px",
          }}
        >
          <Avatar
            src={bookmark.favicon || getFaviconFromUrl(bookmark.url)}
            size={isMobile() ? "default" : "large"}
            style={{ backgroundColor: "#f5f5f5", marginTop: "4px" }}
            icon={<LinkOutlined />}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ marginBottom: "4px" }}>
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#1890ff",
                  textDecoration: "none",
                  fontWeight: 500,
                  fontSize: isMobile() ? "14px" : "15px",
                  fontFamily: FONT_FAMILY,
                }}
              >
                {bookmark.title}
              </a>
            </div>

            <Text
              type="secondary"
              style={{
                fontSize: isMobile() ? "12px" : "13px",
                fontFamily: FONT_FAMILY,
              }}
            >
              {new URL(bookmark.url).hostname}
            </Text>
          </div>
        </div>
      ),
    },
    ...(isMobile()
      ? []
      : ([
          {
            title: "Sub Category",
            dataIndex: "category",
            key: "category",
            width: "15%",
            render: (category: string) => {
              const categoryIcon =
                categoryIcons[category] || categoryIcons["Others"];
              return (
                <Tag
                  color={categoryColors[category] || "#666"}
                  style={{
                    borderRadius: "12px",
                    fontSize: "13px",
                    fontFamily: FONT_FAMILY,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    width: "fit-content",
                  }}
                >
                  {React.cloneElement(categoryIcon, {
                    style: {
                      fontSize: "12px",
                      color: "#fff",
                    },
                  })}
                  {category}
                </Tag>
              );
            },
          },
          {
            title: "Hubs",
            dataIndex: "hubs",
            key: "hubs",
            width: "20%",
            render: (hubs: string[]) => {
              const hubsToDisplay = getHubsDisplay(hubs);
              return (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "4px",
                    alignItems: "center",
                  }}
                >
                  {hubsToDisplay.slice(0, 1).map((hub, index) => (
                    <Tooltip key={index} title={hub.label}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          backgroundColor: hub.color,
                          color: "#fff",
                          borderRadius: "8px",
                          fontSize: "12px",
                          fontFamily: FONT_FAMILY,
                          margin: 0,
                          padding: "4px 8px",
                        }}
                      >
                        {React.cloneElement(hub.icon, {
                          style: {
                            fontSize: "12px",
                            color: "#fff",
                          },
                        })}
                        <span>{hub.label}</span>
                      </div>
                    </Tooltip>
                  ))}
                  {hubsToDisplay.length > 1 && (
                    <Tooltip
                      title={hubsToDisplay
                        .slice(1)
                        .map((h) => h.label)
                        .join(", ")}
                    >
                      <Tag
                        style={{
                          borderRadius: "8px",
                          fontSize: "12px",
                          fontFamily: FONT_FAMILY,
                          margin: 0,
                          backgroundColor: "#f0f0f0",
                          color: "#666",
                        }}
                      >
                        +{hubsToDisplay.length - 1}
                      </Tag>
                    </Tooltip>
                  )}
                </div>
              );
            },
          },
          {
            title: "Added",
            dataIndex: "createdAt",
            key: "createdAt",
            width: "15%",
            render: (_, bookmark) => {
              const dateValue =
                bookmark.createdAt || bookmark.created_at || bookmark.dateAdded;
              if (!dateValue) {
                return (
                  <Text
                    type="secondary"
                    style={{ fontSize: "14px", fontFamily: FONT_FAMILY }}
                  >
                    N/A
                  </Text>
                );
              }
              try {
                const date = new Date(dateValue);
                if (isNaN(date.getTime())) {
                  return (
                    <Text
                      type="secondary"
                      style={{ fontSize: "14px", fontFamily: FONT_FAMILY }}
                    >
                      N/A
                    </Text>
                  );
                }
                return (
                  <Text
                    type="secondary"
                    style={{ fontSize: "14px", fontFamily: FONT_FAMILY }}
                  >
                    {date.toLocaleDateString()}
                  </Text>
                );
              } catch (error) {
                return (
                  <Text
                    type="secondary"
                    style={{ fontSize: "14px", fontFamily: FONT_FAMILY }}
                  >
                    N/A
                  </Text>
                );
              }
            },
          },
        ] as TableColumnsType<Bookmark>)),
    {
      title: "Actions",
      key: "actions",
      width: isMobile() ? "25%" : "12%",
      render: (_, bookmark) => (
        <Space size={isMobile() ? "small" : "middle"}>
          <Tooltip
            title={
              bookmark.isFavorite ? "Remove from favorites" : "Add to favorites"
            }
          >
            <Button
              type="text"
              size={isMobile() ? "small" : "middle"}
              icon={
                bookmark.isFavorite ? (
                  <StarFilled style={{ color: "#f09e06ff" }} />
                ) : (
                  <StarOutlined />
                )
              }
              onClick={() => handleToggleFavorite(bookmark.id)}
              style={{ fontFamily: FONT_FAMILY }}
            />
          </Tooltip>
          <Tooltip title="Share">
            <Button
              type="text"
              size={isMobile() ? "small" : "middle"}
              icon={<ShareAltOutlined />}
              onClick={(e) => handleShareBookmark(bookmark, e)}
              style={{ fontFamily: FONT_FAMILY }}
            />
          </Tooltip>
          <Dropdown menu={getDropdownMenu(bookmark)} trigger={["click"]}>
            <Button
              type="text"
              size={isMobile() ? "small" : "middle"}
              icon={<MoreOutlined />}
              style={{ fontFamily: FONT_FAMILY }}
            />
          </Dropdown>
        </Space>
      ),
    },
  ];

  // Responsive grid columns
  const getGridColumns = () => {
    if (isSmallMobile()) return { xs: 24, sm: 12, md: 12, lg: 8, xl: 6 };
    if (isMobile()) return { xs: 24, sm: 12, md: 8, lg: 6, xl: 6 };
    return { xs: 24, sm: 12, md: 8, lg: 6 };
  };

  return (
    <div
      style={{
        marginTop: isMobile() ? "60px" : "70px",
        minHeight: "100vh",
        padding: isMobile() ? "12px" : "24px",
        marginLeft: isMobile() ? "0px" : "40px",
        fontFamily: FONT_FAMILY,
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        {/* Header Section - Responsive */}
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: isMobile() ? "16px" : "24px" }}
        >
          <Col xs={24} sm={16} md={18} lg={16}>
            <Row align="middle" gutter={12}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  minWidth: isMobile() ? 250 : 300,
                }}
              >
                {/* Icon box (square) */}
                <div
                  style={{
                    width: isMobile() ? 36 : 44,
                    height: isMobile() ? 36 : 44,
                    backgroundColor: "#dc2626",
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: isMobile() ? 18 : 22,
                    color: "#fff",
                    marginRight: isMobile() ? 8 : 12,
                  }}
                >
                  <IdcardOutlined />
                </div>

                {/* Text column */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <Title
                    level={isMobile() ? 5 : 4}
                    style={{
                      margin: 0,
                      fontSize: isMobile() ? 20 : 26,
                      fontFamily: FONT_FAMILY,
                      fontWeight: 600,
                      color: "#1a1a1a",
                    }}
                  >
                    {showOnlyFavorites ? "Favorite Accounts" : "Accounts"}
                  </Title>
                  <Text
                    style={{
                      color: "#6b7280",
                      fontSize: isMobile() ? 12 : 14,
                      fontFamily: FONT_FAMILY,
                      marginTop: 2,
                    }}
                  >
                    Your saved links from all hubs
                  </Text>
                </div>
              </div>
            </Row>
          </Col>
          <Col
            xs={24}
            sm={8}
            md={6}
            lg={8}
            style={{ marginTop: isMobile() ? "12px" : "0" }}
          >
            <Space
              size={isMobile() ? "small" : "middle"}
              style={{
                width: "100%",
                justifyContent: isMobile() ? "center" : "flex-end",
              }}
            >
              {/* Favorites Filter Heart Button */}
              <Tooltip
                title={
                  showOnlyFavorites
                    ? "Show all bookmarks"
                    : "Show only favorites"
                }
              >
                <Button
                  type={showOnlyFavorites ? "primary" : "default"}
                  icon={
                    showOnlyFavorites ? (
                      <StarFilled style={{ color: "#fff" }} />
                    ) : (
                      <StarOutlined style={{ color: "#f09e06ff" }} />
                    )
                  }
                  size={isMobile() ? "middle" : "large"}
                  onClick={handleFavoritesClick}
                  style={{
                    borderRadius: "12px",
                    height: isMobile() ? "40px" : "48px",
                    minWidth: isMobile() ? "40px" : "48px",
                    borderColor: showOnlyFavorites ? "#f09e06ff" : "#f09e06ff",
                    backgroundColor: showOnlyFavorites
                      ? "#f09e06ff"
                      : "transparent",
                    fontFamily: FONT_FAMILY,
                  }}
                />
              </Tooltip>
              <Tooltip title="Add bookmark">
                <CustomButton
                  label="Add Bookmark" // Tooltip text
                  onClick={openCreateModal}
                  // style={{
                  //   borderRadius: "12px",
                  //   background: PRIMARY_COLOR,
                  //   borderColor: PRIMARY_COLOR,
                  //   height: isMobile() ? "40px" : "48px",
                  //   fontFamily: FONT_FAMILY,
                  // }}
                />
              </Tooltip>

              {!isSmallMobile() && (
                <Button
                  type="default"
                  icon={<DownloadOutlined />}
                  size={isMobile() ? "middle" : "large"}
                  onClick={showModal}
                  style={{
                    borderRadius: "12px",
                    borderColor: "#1890ff",
                    color: "#2563eb",
                    height: isMobile() ? "40px" : "48px",
                    fontSize: isMobile() ? "14px" : "16px",
                    fontWeight: "600",
                    minWidth: isMobile() ? "120px" : "160px",
                    background:
                      "linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)",
                    boxShadow: "0 2px 8px rgba(24, 144, 255, 0.15)",
                    transition: "all 0.3s ease",
                    fontFamily: FONT_FAMILY,
                  }}
                  onMouseEnter={(e) => {
                    if (!isMobile()) {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 16px rgba(24, 144, 255, 0.25)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isMobile()) {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 2px 8px rgba(24, 144, 255, 0.15)";
                    }
                  }}
                >
                  {isMobile() ? "Extension" : "Download Extension"}
                </Button>
              )}
            </Space>
          </Col>
        </Row>

        {/* Search and Filters Row - Enhanced Responsive Design */}
        <div
          style={{
            marginBottom: isMobile() ? "16px" : "24px",
          }}
        >
          {isSmallMobile() ? (
            // Small Mobile Layout - Stacked vertically
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {/* Search bar - full width */}
              <Input
                placeholder="Search bookmarks..."
                prefix={<SearchOutlined />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="middle"
                style={{
                  borderRadius: "8px",
                  fontFamily: FONT_FAMILY,
                  width: "100%",
                }}
                disabled={showOnlyFavorites}
              />

              {/* Controls row */}
              <div
                style={{ display: "flex", gap: "6px", alignItems: "center" }}
              >
                <Select
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  size="middle"
                  style={{
                    flex: 1,
                    fontFamily: FONT_FAMILY,
                  }}
                  disabled={showOnlyFavorites}
                  placeholder="Category"
                >
                  {categories.map((cat) => (
                    <Option
                      key={cat}
                      value={cat}
                      style={{ fontFamily: FONT_FAMILY }}
                    >
                      {cat}
                    </Option>
                  ))}
                </Select>

                <Select
                  value={sortBy}
                  onChange={setSortBy}
                  size="middle"
                  style={{
                    flex: 1,
                    fontFamily: FONT_FAMILY,
                  }}
                  placeholder="Sort"
                >
                  <Option value="newest" style={{ fontFamily: FONT_FAMILY }}>
                    Newest
                  </Option>
                  <Option value="oldest" style={{ fontFamily: FONT_FAMILY }}>
                    Oldest
                  </Option>
                  <Option value="title" style={{ fontFamily: FONT_FAMILY }}>
                    Title A-Z
                  </Option>
                  <Option
                    value="title-desc"
                    style={{ fontFamily: FONT_FAMILY }}
                  >
                    Title Z-A
                  </Option>
                  <Option value="category" style={{ fontFamily: FONT_FAMILY }}>
                    Category
                  </Option>
                </Select>

                <Tooltip
                  title={
                    viewMode === "grid"
                      ? "Switch to Table View"
                      : "Switch to Grid View"
                  }
                >
                  <Button
                    shape="circle"
                    icon={
                      viewMode === "grid" ? (
                        <TableOutlined />
                      ) : (
                        <AppstoreOutlined />
                      )
                    }
                    onClick={() =>
                      setViewMode(viewMode === "grid" ? "table" : "grid")
                    }
                    size="middle"
                    style={{
                      fontFamily: FONT_FAMILY,
                      height: "32px",
                      width: "32px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderColor: "#d9d9d9",
                      color: "#595959",
                      flexShrink: 0,
                    }}
                  />
                </Tooltip>
              </div>
            </div>
          ) : isMobile() ? (
            // Regular Mobile Layout - 2 rows
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {/* Search bar - full width */}
              <Input
                placeholder="Search bookmarks..."
                prefix={<SearchOutlined />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="large"
                style={{
                  borderRadius: "8px",
                  fontFamily: FONT_FAMILY,
                  width: "100%",
                }}
                disabled={showOnlyFavorites}
              />

              {/* Controls row */}
              <div
                style={{ display: "flex", gap: "8px", alignItems: "center" }}
              >
                <Select
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  size="large"
                  style={{
                    width: "110px",
                    fontFamily: FONT_FAMILY,
                  }}
                  disabled={showOnlyFavorites}
                  placeholder="Category"
                >
                  {categories.map((cat) => (
                    <Option
                      key={cat}
                      value={cat}
                      style={{ fontFamily: FONT_FAMILY }}
                    >
                      {cat}
                    </Option>
                  ))}
                </Select>

                <Select
                  value={sortBy}
                  onChange={setSortBy}
                  size="large"
                  style={{
                    width: "110px",
                    fontFamily: FONT_FAMILY,
                  }}
                  placeholder="Sort"
                >
                  <Option value="newest" style={{ fontFamily: FONT_FAMILY }}>
                    Newest
                  </Option>
                  <Option value="oldest" style={{ fontFamily: FONT_FAMILY }}>
                    Oldest
                  </Option>
                  <Option value="title" style={{ fontFamily: FONT_FAMILY }}>
                    Title A-Z
                  </Option>
                  <Option
                    value="title-desc"
                    style={{ fontFamily: FONT_FAMILY }}
                  >
                    Title Z-A
                  </Option>
                  <Option value="category" style={{ fontFamily: FONT_FAMILY }}>
                    Category
                  </Option>
                </Select>

                <Tooltip
                  title={
                    viewMode === "grid"
                      ? "Switch to Table View"
                      : "Switch to Grid View"
                  }
                >
                  <Button
                    shape="circle"
                    icon={
                      viewMode === "grid" ? (
                        <TableOutlined />
                      ) : (
                        <AppstoreOutlined />
                      )
                    }
                    onClick={() =>
                      setViewMode(viewMode === "grid" ? "table" : "grid")
                    }
                    size="large"
                    style={{
                      fontFamily: FONT_FAMILY,
                      height: "40px",
                      width: "40px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderColor: "#d9d9d9",
                      color: "#595959",
                      flexShrink: 0,
                      marginLeft: "auto",
                    }}
                  />
                </Tooltip>
              </div>
            </div>
          ) : (
            // Desktop/Tablet Layout - Single row (preserved original layout)
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: isTablet() ? "12px" : "16px",
                width: "100%",
              }}
            >
              {/* Search Input - Flexible width */}
              <div
                style={{
                  flex: "1 1 auto",
                  minWidth: isTablet() ? "250px" : "300px",
                }}
              >
                <Input
                  placeholder="Search bookmarks..."
                  prefix={<SearchOutlined />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="large"
                  style={{
                    borderRadius: "8px",
                    fontFamily: FONT_FAMILY,
                    width: "100%",
                  }}
                  disabled={showOnlyFavorites}
                />
              </div>

              {/* Category Select - Fixed width */}
              <div
                style={{
                  flex: "0 0 auto",
                  width: isTablet() ? "120px" : "140px",
                }}
              >
                <Select
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  size="large"
                  style={{
                    width: "100%",
                    fontFamily: FONT_FAMILY,
                  }}
                  disabled={showOnlyFavorites}
                  placeholder="Category"
                >
                  {categories.map((cat) => (
                    <Option
                      key={cat}
                      value={cat}
                      style={{ fontFamily: FONT_FAMILY }}
                    >
                      {cat}
                    </Option>
                  ))}
                </Select>
              </div>

              {/* Sort Select - Fixed width */}
              <div
                style={{
                  flex: "0 0 auto",
                  width: isTablet() ? "120px" : "140px",
                }}
              >
                <Select
                  value={sortBy}
                  onChange={setSortBy}
                  size="large"
                  style={{
                    width: "100%",
                    fontFamily: FONT_FAMILY,
                  }}
                  placeholder="Sort"
                >
                  <Option value="newest" style={{ fontFamily: FONT_FAMILY }}>
                    {isTablet() ? "Newest" : "Newest First"}
                  </Option>
                  <Option value="oldest" style={{ fontFamily: FONT_FAMILY }}>
                    {isTablet() ? "Oldest" : "Oldest First"}
                  </Option>
                  <Option value="title" style={{ fontFamily: FONT_FAMILY }}>
                    Title A-Z
                  </Option>
                  <Option
                    value="title-desc"
                    style={{ fontFamily: FONT_FAMILY }}
                  >
                    Title Z-A
                  </Option>
                  <Option value="category" style={{ fontFamily: FONT_FAMILY }}>
                    {isTablet() ? "Category" : "Sub Category"}
                  </Option>
                </Select>
              </div>

              {/* View Toggle Button - Fixed width */}
              <div style={{ flex: "0 0 auto" }}>
                <Tooltip
                  title={
                    viewMode === "grid"
                      ? "Switch to Table View"
                      : "Switch to Grid View"
                  }
                >
                  <Button
                    shape="circle"
                    icon={
                      viewMode === "grid" ? (
                        <TableOutlined />
                      ) : (
                        <AppstoreOutlined />
                      )
                    }
                    onClick={() =>
                      setViewMode(viewMode === "grid" ? "table" : "grid")
                    }
                    size="large"
                    style={{
                      fontFamily: FONT_FAMILY,
                      height: "48px",
                      width: "48px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderColor: "#d9d9d9",
                      color: "#595959",
                    }}
                  />
                </Tooltip>
              </div>
            </div>
          )}
        </div>

        {/* Content Area */}
        {filteredBookmarks.length === 0 ? (
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: isMobile() ? "32px 16px" : "48px",
              textAlign: "center",
              border: "1px solid #f0f0f0",
              fontFamily: FONT_FAMILY,
            }}
          >
            <Empty
              description={
                <span
                  style={{
                    fontSize: isMobile() ? "16px" : "19px",
                    color: "#999",
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  {showOnlyFavorites
                    ? "No favorite bookmarks yet. Start adding some bookmarks to favorites!"
                    : searchQuery || selectedCategory !== "All"
                    ? "No bookmarks match your current filters"
                    : "No bookmarks yet. Add your first bookmark to get started!"}
                </span>
              }
            />
          </div>
        ) : viewMode === "grid" ? (
          <Row gutter={[isMobile() ? 12 : 16, isMobile() ? 12 : 16]}>
            {filteredBookmarks
              .map((bookmark) => renderBookmarkCard(bookmark))
              .filter((card) => card !== null)
              .map((card, index) => (
                <Col {...getGridColumns()} key={filteredBookmarks[index].id}>
                  {card}
                </Col>
              ))}
          </Row>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <Table
              columns={tableColumns}
              dataSource={filteredBookmarks}
              rowKey="id"
              pagination={{
                pageSize: isMobile() ? 5 : 10,
                showSizeChanger: !isMobile(),
                showQuickJumper: !isMobile(),
                showTotal: (total, range) =>
                  isMobile()
                    ? `${total} bookmarks`
                    : `${range[0]}-${range[1]} of ${total} bookmarks`,
                responsive: true,
              }}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "8px",
                fontFamily: FONT_FAMILY,
              }}
              rowHoverable
              scroll={{ x: isMobile() ? 600 : undefined }}
            />
          </div>
        )}

        {/* ShareModal Component */}
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

        {/* Password Modal - Responsive */}
        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <LockOutlined style={{ color: "#1677ff" }} />
              <span
                style={{
                  fontFamily: FONT_FAMILY,
                  color: "#1f2937",
                  fontSize: isMobile() ? "16px" : "18px",
                }}
              >
                Enter Credentials
              </span>
            </div>
          }
          open={passwordModalVisible}
          onCancel={() => {
            setPasswordModalVisible(false);
            passwordForm.resetFields();
          }}
          onOk={handlePasswordModalOk}
          centered
          width={isMobile() ? "90vw" : 380}
          okText="Save"
          cancelText="Cancel"
          destroyOnClose
          style={{
            fontFamily: FONT_FAMILY,
          }}
          styles={{
            body: {
              background: "#ffffff",
              padding: isMobile() ? "16px" : "20px",
            },
            content: {
              borderRadius: "12px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
            },
          }}
        >
          <Form form={passwordForm} layout="vertical" style={{ marginTop: 12 }}>
            {/* Username field */}
            <Form.Item
              name="username"
              label={
                <span style={{ fontFamily: FONT_FAMILY, color: "#374151" }}>
                  Username
                </span>
              }
              rules={[{ required: true, message: "Please enter username" }]}
            >
              <Input
                placeholder="Enter username for this bookmark"
                size={isMobile() ? "middle" : "large"}
                style={{
                  fontFamily: FONT_FAMILY,
                  borderRadius: "8px",
                }}
              />
            </Form.Item>

            {/* Password field */}
            <Form.Item
              name="password"
              label={
                <span style={{ fontFamily: FONT_FAMILY, color: "#374151" }}>
                  Password
                </span>
              }
              rules={[{ required: true, message: "Please enter password" }]}
            >
              <Input.Password
                placeholder="Enter password for this bookmark"
                size={isMobile() ? "middle" : "large"}
                style={{
                  fontFamily: FONT_FAMILY,
                  borderRadius: "8px",
                }}
              />
            </Form.Item>
          </Form>

          <div
            style={{
              fontSize: 11,
              color: "#6b7280",
              marginTop: 8,
              fontFamily: FONT_FAMILY,
            }}
          >
            Your credentials will be securely saved with Dockly
          </div>
        </Modal>
        <Modal
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <LockOutlined style={{ color: "#1677ff" }} />
              <span
                style={{
                  fontFamily: FONT_FAMILY,
                  color: "#1f2937",
                  fontSize: isMobile() ? "16px" : "18px",
                }}
              >
                Enter Credentials
              </span>
            </div>
          }
          open={passwordModalVisible}
          onCancel={() => {
            setPasswordModalVisible(false);
            passwordForm.resetFields();
          }}
          onOk={handlePasswordModalOk}
          centered
          width={isMobile() ? "90vw" : 380}
          okText="Save"
          cancelText="Cancel"
          destroyOnClose
          style={{
            fontFamily: FONT_FAMILY,
          }}
          styles={{
            body: {
              background: "#ffffff",
              padding: isMobile() ? "16px" : "20px",
            },
            content: {
              borderRadius: "12px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
            },
          }}
        >
          <Form form={passwordForm} layout="vertical" style={{ marginTop: 12 }}>
            {/* Username field */}
            <Form.Item
              name="username"
              label={
                <span style={{ fontFamily: FONT_FAMILY, color: "#374151" }}>
                  Username
                </span>
              }
              rules={[{ required: true, message: "Please enter username" }]}
            >
              <Input
                placeholder="Enter username for this bookmark"
                size={isMobile() ? "middle" : "large"}
                style={{
                  fontFamily: FONT_FAMILY,
                  borderRadius: "8px",
                }}
              />
            </Form.Item>

            {/* Password field */}
            <Form.Item
              name="password"
              label={
                <span style={{ fontFamily: FONT_FAMILY, color: "#374151" }}>
                  Password
                </span>
              }
              rules={[{ required: true, message: "Please enter password" }]}
            >
              <Input.Password
                placeholder="Enter password for this bookmark"
                size={isMobile() ? "middle" : "large"}
                style={{
                  fontFamily: FONT_FAMILY,
                  borderRadius: "8px",
                }}
              />
            </Form.Item>
          </Form>

          <div
            style={{
              fontSize: 11,
              color: "#6b7280",
              marginTop: 8,
              fontFamily: FONT_FAMILY,
            }}
          >
            Your credentials will be securely saved with Dockly
          </div>
        </Modal>

        {/* Add/Edit Bookmark Modal - Responsive */}
        <Modal
          title={
            <span
              style={{
                fontFamily: FONT_FAMILY,
                color: "#1f2937",
                fontSize: isMobile() ? "14px" : "15px",
              }}
            >
              {modalMode === "create" ? "Add New Bookmark" : "Edit Bookmark"}
            </span>
          }
          open={addModalVisible}
          onCancel={closeModal}
          footer={null}
          width={isMobile() ? "85vw" : isTablet() ? "60vw" : "40vw"} // narrower
          style={{
            top: isMobile() ? 8 : 12,
            fontFamily: FONT_FAMILY,
          }}
          styles={{
            body: {
              background: "#ffffff",
              padding: isMobile() ? "8px" : "12px", // less padding
              maxHeight: "80vh", // fit in 11 inch screen
              overflowY: "auto",
            },
            content: {
              borderRadius: "8px",
              boxShadow: "0 12px 28px rgba(0, 0, 0, 0.08)",
            },
          }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleAddBookmark}
            style={{ marginTop: "8px" }}
          >
            <Form.Item
              name="title"
              label={
                <span
                  style={{
                    fontFamily: FONT_FAMILY,
                    color: "#374151",
                    fontSize: "13px",
                  }}
                >
                  Title
                </span>
              }
              rules={[
                { required: true, message: "Please enter bookmark title" },
              ]}
            >
              <Input
                placeholder="Enter bookmark title"
                size="small"
                style={{
                  fontFamily: FONT_FAMILY,
                  borderRadius: "4px",
                  height: "28px",
                }}
              />
            </Form.Item>

            <Form.Item
              name="url"
              label={
                <span
                  style={{
                    fontFamily: FONT_FAMILY,
                    color: "#374151",
                    fontSize: "13px",
                  }}
                >
                  URL
                </span>
              }
              normalize={(value) => normalizeUrl(value)}
              rules={[
                { required: true, message: "Please enter URL" },
                {
                  validator: (_, value) =>
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
                size="small"
                style={{
                  fontFamily: FONT_FAMILY,
                  borderRadius: "4px",
                  height: "28px",
                }}
              />
            </Form.Item>

            {/* Save Password Checkbox */}
            <Form.Item
              name="savePassword"
              valuePropName="checked"
              style={{ marginBottom: "8px" }}
            >
              <Checkbox
                onChange={handlePasswordCheckboxChange}
                style={{ fontFamily: FONT_FAMILY, fontSize: "12px" }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    color: "#374151",
                  }}
                >
                  <LockOutlined style={{ fontSize: "12px" }} />
                  Save Password
                </span>
              </Checkbox>
            </Form.Item>

            {/* Password Options */}
            {savePassword && (
              <Form.Item
                name="passwordSaveOption"
                label={
                  <span
                    style={{
                      fontFamily: FONT_FAMILY,
                      color: "#374151",
                      fontSize: "13px",
                    }}
                  >
                    Password Save Option
                  </span>
                }
                initialValue="external"
              >
                <Radio.Group
                  value={passwordSaveOption}
                  onChange={handlePasswordSaveOptionChange}
                  style={{ width: "100%", fontSize: "12px" }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: isMobile() ? "column" : "row",
                      gap: isMobile() ? "6px" : "12px",
                    }}
                  >
                    <Radio value="dockly" style={{ fontFamily: FONT_FAMILY }}>
                      Save with Dockly
                    </Radio>
                    {/* <Radio value="external" style={{ fontFamily: FONT_FAMILY }}>
                      Save in External Vault
                    </Radio> */}
                  </div>
                </Radio.Group>
              </Form.Item>
            )}
            <Form.Item
              name="description"
              label={
                <span
                  style={{
                    fontFamily: FONT_FAMILY,
                    color: "#374151",
                    fontSize: "13px",
                  }}
                >
                  Description
                </span>
              }
            >
              <Input.TextArea
                placeholder="Brief description"
                rows={2}
                style={{
                  fontFamily: FONT_FAMILY,
                  borderRadius: "4px",
                  fontSize: "12px",
                }}
              />
            </Form.Item>

            <Form.Item
              name="category"
              label={
                <span
                  style={{
                    fontFamily: FONT_FAMILY,
                    color: "#374151",
                    fontSize: "13px",
                  }}
                >
                  Sub Category
                </span>
              }
              rules={[
                { required: true, message: "Please select Sub Category" },
              ]}
            >
              <Select
                placeholder="Select Sub Category"
                size="small"
                style={{ fontFamily: FONT_FAMILY, fontSize: "12px" }}
                onChange={handleCategoryChange}
              >
                <Option value="Tech">
                  <CodeOutlined
                    style={{ fontSize: "12px", color: "#af630bff" }}
                  />{" "}
                  Tech
                </Option>
                <Option value="Design">
                  <BgColorsOutlined
                    style={{ fontSize: "12px", color: "#9f0aaaff" }}
                  />{" "}
                  Design
                </Option>
                <Option value="News">
                  <GlobalOutlined
                    style={{ fontSize: "12px", color: "#fa541c" }}
                  />{" "}
                  News
                </Option>
                <Option value="Social">
                  <UsergroupAddOutlined
                    style={{ fontSize: "12px", color: "#52c41a" }}
                  />{" "}
                  Social
                </Option>
                <Option value="Tools">
                  <ToolOutlined
                    style={{ fontSize: "12px", color: "#2c0447ff" }}
                  />{" "}
                  Tools
                </Option>
                <Option value="Education">
                  <ReadOutlined
                    style={{ fontSize: "12px", color: "#13c2c2" }}
                  />{" "}
                  Education
                </Option>
                <Option value="Entertainment">
                  <PlayCircleOutlined
                    style={{ fontSize: "12px", color: "#a01010ff" }}
                  />{" "}
                  Entertainment
                </Option>
                <Option value="Others">
                  <EllipsisOutlined
                    style={{ fontSize: "12px", color: "#3a1e1eff" }}
                  />{" "}
                  Others
                </Option>
              </Select>
            </Form.Item>

            {/* Custom Category Input */}
            {showCustomCategory && (
              <Form.Item
                name="customCategory"
                label={
                  <span
                    style={{
                      fontFamily: FONT_FAMILY,
                      color: "#374151",
                      fontSize: "13px",
                    }}
                  >
                    Custom Sub Category
                  </span>
                }
                rules={[
                  {
                    required: showCustomCategory,
                    message: "Please enter custom Sub Category",
                  },
                  {
                    max: 50,
                    message: "Sub Category cannot exceed 50 characters",
                  },
                ]}
              >
                <Input
                  placeholder="Enter custom category"
                  size="small"
                  style={{
                    fontFamily: FONT_FAMILY,
                    borderRadius: "4px",
                    height: "28px",
                    fontSize: "12px",
                  }}
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                />
              </Form.Item>
            )}

            {/* Hubs */}
            <Form.Item
              name="hubs"
              label={
                <span
                  style={{
                    fontFamily: FONT_FAMILY,
                    color: "#374151",
                    fontSize: "13px",
                  }}
                >
                  Hubs
                </span>
              }
              rules={[
                { required: true, message: "Please select at least one hub" },
              ]}
            >
              <Select
                mode="multiple"
                placeholder="Select hubs"
                size="small"
                style={{ fontFamily: FONT_FAMILY, fontSize: "12px" }}
                maxTagCount="responsive"
                optionLabelProp="label"
              >
                {hubOptions.map((hub) => (
                  <Option key={hub.value} value={hub.value} label={hub.label}>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          backgroundColor: hub.color,
                          borderRadius: "3px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {React.cloneElement(hub.icon, {
                          style: { fontSize: "8px", color: "#fff" },
                        })}
                      </div>
                      {hub.label}
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="id" hidden>
              <Input />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="small"
                  loading={bookmarkFormLoading} // Use the specific loading state
                  style={{
                    fontFamily: FONT_FAMILY,
                    borderRadius: "4px",
                    minWidth: "100px",
                    fontSize: "12px",
                  }}
                >
                  {modalMode === "create" ? "Add Bookmark" : "Update Bookmark"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default Bookmarks;
