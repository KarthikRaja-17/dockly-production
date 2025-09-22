// ......................................old.......................................
"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Layout,
  Menu,
  Card,
  Checkbox,
  Input,
  Button,
  Avatar,
  Badge,
  Progress,
  Typography,
  Row,
  Col,
  List,
  Tag,
  Divider,
  Upload,
  message,
  Space,
  Tooltip,
  Dropdown,
  Calendar,
  Statistic,
  Modal,
  Form,
  Select,
  DatePicker,
  TimePicker,
} from "antd";
import {
  DashboardOutlined,
  CalendarOutlined,
  TeamOutlined,
  DollarOutlined,
  HomeOutlined,
  HeartOutlined,
  FileTextOutlined,
  BookOutlined,
  FolderOutlined,
  LockOutlined,
  BellOutlined,
  SearchOutlined,
  RobotOutlined,
  ThunderboltOutlined,
  CloudUploadOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  StarOutlined,
  StarFilled,
  PlusOutlined,
  UserAddOutlined,
  FolderAddOutlined,
  GiftOutlined,
  DownOutlined,
  MenuOutlined,
  CloseOutlined,
  CheckOutlined,
  ExclamationCircleOutlined,
  FileOutlined,
  CarOutlined,
  IdcardOutlined,
  BankOutlined,
  BulbOutlined,
  MedicineBoxOutlined,
  EnterOutlined,
  LineChartOutlined,
  ReadOutlined,
  HistoryOutlined,
  TabletOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import WeatherWidget from "./WeatherWidget";
import TopNewsWidget from "./NewsWidget";
import MarketsWidget from "./MarketsWidget";
import ConnectAccounts from "../finance/connectaccounts";
import { addBookmark } from "../../services/bookmarks";
import { useRouter } from "next/navigation";
import FolderConnectionModal from "../components/connect";
import dayjs from "dayjs";
import { addEvent } from "../../services/google";
import { showNotification } from "../../utils/notification";
import { useCurrentUser } from "../../app/userContext";
import { useGlobalLoading } from "../../app/loadingContext";
import { uploadDocklyRootFile } from '../../services/home';
import { capitalizeEachWord } from "../../app/comman";
import AddNoteModal from "../dashboard/AddNoteModal";
import { fetchSharedItemNotifications, getRecentActivities, markNotificationAsRead, respondToNotification } from '../../services/dashboard';
import { ConnectorSDKCallbackMetadata } from "@quiltt/react";

const { Option } = Select;
const { Header, Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Dragger } = Upload;
const { TextArea } = Input;

const FONT_FAMILY =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const SPACING = {
  xs: 3,
  sm: 6,
  md: 12,
  lg: 18,
  xl: 24,
  xxl: 36,
};

const COLORS = {
  primary: "#1C1C1E",
  secondary: "#48484A",
  accent: "#1890FF",
  success: "#52C41A",
  warning: "#FAAD14",
  error: "#FF4D4F",
  background: "#FAFAFA",
  surface: "#FFFFFF",
  surfaceSecondary: "#F8F9FA",
  border: "#E8E8E8",
  borderLight: "#F0F0F0",
  text: "#1C1C1E",
  textSecondary: "#8C8C8C",
  textTertiary: "#BFBFBF",
  overlay: "rgba(0, 0, 0, 0.45)",
  shadowLight: "rgba(0, 0, 0, 0.04)",
  shadowMedium: "rgba(0, 0, 0, 0.08)",
  shadowHeavy: "rgba(0, 0, 0, 0.12)",
};

const defaultPersonColors = {
  John: { color: COLORS.accent, email: "john@example.com" },
  Sarah: { color: COLORS.warning, email: "sarah@example.com" },
  Emma: { color: COLORS.error, email: "emma@example.com" },
  Liam: { color: COLORS.success, email: "liam@example.com" },
  Family: { color: COLORS.secondary, email: "family@example.com" },
};

interface PersonData {
  color: string;
  email?: string;
}

interface PersonColors {
  [key: string]: PersonData;
}

interface ConnectedAccount {
  userName: string;
  email: string;
  displayName: string;
  accountType: string;
  provider: string;
  color: string;
}

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState(["dashboard"]);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [starredItems, setStarredItems] = useState<string[]>(["budget"]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [sharedNotifications, setSharedNotifications] = useState<any[]>([]);
  const [aiMessages, setAiMessages] = useState([
    { type: "ai", content: "Hi! How can I help you today?" },
  ]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [modalMode, setModalMode] = useState("create");
  const [isFolderModalVisible, setIsFolderModalVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isConnectModalVisible, setIsConnectModalVisible] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [addNoteModalVisible, setAddNoteModalVisible] = useState(false);

  const [eventForm] = Form.useForm();
  const [isAllDay, setIsAllDay] = useState(false);
  const [personColors] = useState<PersonColors>(defaultPersonColors);
  const [isDragActive, setIsDragActive] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [connectedAccounts] = useState<ConnectedAccount[]>([]);

  const router = useRouter();
  const user = useCurrentUser();
  const username = user?.user_name;
  const { loading, setLoading } = useGlobalLoading();

  const [aiInput, setAiInput] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const getPersonNames = (): string[] => {
    return Object.keys(personColors);
  };

  const getPersonData = (person: string): PersonData => {
    return personColors[person] || { color: COLORS.accent, email: "" };
  };

  const getConnectedAccount = (userName: string): ConnectedAccount | null => {
    return (
      connectedAccounts.find((account) => account.userName === userName) || null
    );
  };

  const handleEventSave = () => {
    setLoading(true);

    eventForm
      .validateFields()
      .then(async (values) => {
        const {
          title,
          date,
          startTime,
          endTime,
          startDate,
          endDate,
          person,
          location,
          description,
          invitee,
        } = values;

        const payload = isAllDay
          ? {
            is_all_day: true,
            title,
            start_date: startDate.format("YYYY-MM-DD"),
            end_date: endDate.format("YYYY-MM-DD"),
            location,
            description,
            person,
            invitee,
          }
          : {
            is_all_day: false,
            title,
            date: date.format("YYYY-MM-DD"),
            start_time: startTime.format("h:mm A"),
            end_time: endTime.format("h:mm A"),
            location,
            description,
            person,
            invitee,
          };

        try {
          const res = await addEvent(payload);
          const { status, message: responseMessage } = res.data;

          if (status === 1) {
            showNotification("Success", responseMessage, "success");
          } else {
            showNotification("Error", responseMessage, "error");
          }

          setIsModalVisible(false);
          eventForm.resetFields();
          setIsAllDay(false);
        } catch (err) {
          console.error("Save error:", err);
          showNotification("Error", "Something went wrong.", "error");
        }

        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const handleConnectSuccess = (metadata: ConnectorSDKCallbackMetadata) => {
    console.log("Successfully connected:", metadata.connectionId);
    setIsConnectModalVisible(false);
    router.push(`/${username}/finance-hub/setup`);
  };

  const mockData = {
    user: {
      name: "John Smith",
      email: "john.smith@example.com",
      avatar: "JS",
    },
    weather: {
      location: "Ashburn, VA",
      temperature: 72,
      condition: "Partly Cloudy",
      high: 78,
      low: 65,
      rain: 20,
    },
    news: [
      {
        title: "Fed Announces Rate Decision",
        time: "2 hours ago",
        important: true,
      },
      {
        title: "Tech Giants Report Earnings",
        time: "5 hours ago",
        important: false,
      },
    ],
    markets: [
      { name: "S&P 500", value: "5,487.03", change: "+0.85%", positive: true },
      { name: "NASDAQ", value: "17,862.31", change: "+1.24%", positive: true },
      { name: "DOW", value: "39,308.00", change: "-0.22%", positive: false },
    ],
    actions: [
      {
        id: "1",
        text: "Update weak passwords",
        detail: "3 accounts at risk",
        icon: <ExclamationCircleOutlined />,
        priority: "high",
      },
      {
        id: "2",
        text: "Pay mortgage",
        detail: "Due today - $1,450.00",
        icon: <DollarOutlined />,
        priority: "high",
      },
      {
        id: "3",
        text: "Car insurance payment",
        detail: "Due tomorrow - $132.50",
        icon: <CarOutlined />,
        priority: "medium",
      },
      {
        id: "4",
        text: "Renew passport",
        detail: "Expires in 45 days",
        icon: <IdcardOutlined />,
        priority: "medium",
      },
      {
        id: "7",
        text: "Schedule checkup",
        detail: "Annual physical due",
        icon: <MedicineBoxOutlined />,
        priority: "medium",
      },
    ],
    upcomingActivities: [
      { title: "Team Standup", time: "Today 9:00 AM", color: "#3b82f6" },
      { title: "Internet Bill Due", time: "Jun 25 - $89.99", color: "#f59e0b" },
    ],
    recentActivity: [
      {
        id: "1",
        name: "Tax Return 2024.pdf",
        time: "2 hours ago",
        type: "pdf",
        starred: false,
      },
      {
        id: "2",
        name: "Monthly Budget.xlsx",
        time: "5 hours ago",
        type: "excel",
        starred: true,
      },
    ],
  };

  const menuItems: MenuProps["items"] = [
    {
      key: "command-center",
      label: "COMMAND CENTER",
      type: "group",
    },
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "planner",
      icon: <CalendarOutlined />,
      label: "Planner",
    },
    {
      key: "hubs",
      label: "HUBS",
      type: "group",
    },
    {
      key: "family",
      icon: <TeamOutlined />,
      label: "Family",
    },
    {
      key: "finance",
      icon: <DollarOutlined />,
      label: "Finance",
    },
    {
      key: "home",
      icon: <HomeOutlined />,
      label: "Home",
    },
    {
      key: "health",
      icon: <HeartOutlined />,
      label: "Health",
    },
    {
      key: "utilities",
      label: "UTILITIES",
      type: "group",
    },
    {
      key: "notes",
      icon: <FileTextOutlined />,
      label: "Notes & Lists",
    },
    {
      key: "bookmarks",
      icon: <BookOutlined />,
      label: "Bookmarks",
    },
    {
      key: "files",
      icon: <FolderOutlined />,
      label: "Files",
    },
    {
      key: "vault",
      icon: <LockOutlined />,
      label: "Vault",
    },
  ];

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoadingNotifications(true);
      try {
        const response = await getRecentActivities({});
        if (response?.data?.status === 1) {
          setNotifications(response.data.payload.notifications || []);
        }
      } catch (err) {
        message.error('Failed to load notifications');
      }
      setLoadingNotifications(false);
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const res = await fetchSharedItemNotifications();
        if (res.data.status) {
          setSharedNotifications(res.data.payload.notifications || []);
        }
      } catch (err) {
        console.error("Failed to load shared notifications", err);
      }
    };

    loadNotifications();
  }, []);

  const handleDismissNotification = async (id: number) => {
    try {
      await markNotificationAsRead(id);
      setSharedNotifications(prev => prev.filter(notif => notif.id !== id));
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const toggleTask = (taskId: string) => {
    setCompletedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
    if (!completedTasks.includes(taskId)) {
      message.success("Task completed!");
    }
  };

  const toggleStar = (itemId: string) => {
    setStarredItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const toggleFilter = (filter: string) => {
    setActiveFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  const sendAiMessage = () => {
    if (!aiInput.trim()) return;

    const newMessages = [
      ...aiMessages,
      { type: "user", content: aiInput },
      {
        type: "ai",
        content: "I can help you with that! Let me analyze your data...",
      },
    ];
    setAiMessages(newMessages);
    setAiInput("");
  };

  const userMenuItems = [
    { key: "profile", label: "Profile Settings" },
    { key: "preferences", label: "Preferences" },
    { key: "logout", label: "Sign Out" },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "#ef4444";
      case "medium":
        return "#f59e0b";
      case "low":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const sidebarStyle: React.CSSProperties = {
    background: "#ffffff",
    borderRight: "1px solid #e5e7eb",
    height: "100vh",
    position: "fixed",
    left: 0,
    top: 0,
    zIndex: 1000,
    transition: "all 0.3s ease",
    transform: mobileMenuVisible ? "translateX(0)" : "translateX(-100%)",
  };

  const contentStyle: React.CSSProperties = {
    marginLeft: collapsed ? 80 : 260,
    transition: "margin-left 0.3s ease",
    minHeight: "100vh",
    background: "#f9fafa",
  };

  const mobileOverlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "rgba(0, 0, 0, 0.5)",
    zIndex: 999,
    display: mobileMenuVisible ? "block" : "none",
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const uploads = Array.from(files).map(async (file) => {
        try {
          const res = await uploadDocklyRootFile(file);
          if (res.status === 1) {
            message.success(`Uploaded: ${file.name}`);
          } else {
            message.error(res.message || `Failed to upload: ${file.name}`);
          }
        } catch (err) {
          console.error("Upload error:", err);
          message.error(`Error uploading: ${file.name}`);
        }
      });
      await Promise.all(uploads);
      e.target.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const uploads = Array.from(files).map(async (file) => {
        try {
          const res = await uploadDocklyRootFile(file);
          if (res.status === 1) {
            message.success(`Uploaded: ${file.name}`);
          } else {
            message.error(res.message || `Failed to upload: ${file.name}`);
          }
        } catch (err) {
          console.error("Upload error:", err);
          message.error(`Error uploading: ${file.name}`);
        }
      });

      await Promise.all(uploads);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f9fafa",
        marginTop: 50,
        fontFamily: FONT_FAMILY,
      }}
    >
      <div
        style={mobileOverlayStyle}
        onClick={() => setMobileMenuVisible(false)}
      />
      <Layout style={{ background: "#f9fafa" }}>
        <Content style={{ padding: SPACING.lg, overflow: "auto" }}>
          <div style={{ maxWidth: "1800px", margin: "0 50px" }}>
            <div
              style={{
                marginBottom: SPACING.lg,
                animation: "fadeIn 0.6s ease-out",
              }}
            >
              <Title
                level={2}
                style={{
                  margin: 0,
                  color: "#1f2937",
                  fontSize: "24px",
                  fontFamily: FONT_FAMILY,
                  fontWeight: 600,
                }}
              >
                Good morning, {capitalizeEachWord(username)}!
              </Title>
              <Text
                style={{
                  color: "#6b7280",
                  fontSize: "14px",
                  fontFamily: FONT_FAMILY,
                }}
              >
                {formatDate(currentTime)}
              </Text>
            </div>
            <div
              className="widgets-container"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: SPACING.lg,
                marginBottom: SPACING.sm,
              }}
            >
              <WeatherWidget />
              <TopNewsWidget />
              <MarketsWidget />
            </div>
            <Card
              title={
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: SPACING.sm,
                  }}
                >
                  <DashboardOutlined
                    style={{ color: "#3b82f6", fontSize: "16px" }}
                  />
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: "16px",
                      fontFamily: FONT_FAMILY,
                    }}
                  >
                    Command Center
                  </span>
                </div>
              }
              style={{ borderRadius: "12px", marginTop: SPACING.lg }}
              styles={{
                body: {
                  padding: SPACING.lg,
                }
              }}
            >
              <Row gutter={[24, 24]}>
                <Col xs={24} lg={8}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '16px'
                    }}
                  >
                    <Title
                      level={5}
                      style={{
                        margin: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#4b5563',
                        fontSize: '14px'
                      }}
                    >
                      <TabletOutlined style={{ color: '#6b7280' }} />
                      Actions & Notifications
                    </Title>
                    <Badge count={notifications.length + sharedNotifications.length} size="small" />
                  </div>
                  {/* <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                    <List
                      dataSource={[...notifications, ...sharedNotifications]}
                      loading={loadingNotifications}
                      locale={{
                        emptyText: (
                          <div style={{ padding: '0' }}>
                            <div
                              style={{
                                marginTop: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                              }}
                            >
                              <Title
                                level={5}
                                style={{
                                  margin: 0,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  color: '#4b5563',
                                  fontSize: '14px',
                                  fontWeight: '600'
                                }}
                              >
                                <BankOutlined style={{ color: '#6b7280' }} />
                                Connect Bank
                              </Title>
                              <Button
                                type="primary"
                                size="small"
                                onClick={() => setIsConnectModalVisible(true)}
                                style={{
                                  fontSize: '12px',
                                  padding: '0 12px',
                                  height: '26px'
                                }}
                              >
                                Connect
                              </Button>
                            </div>
                          </div>
                        )
                      }}
                      renderItem={(item) => (
                        <List.Item
                          style={{
                            padding: '8px',
                            border: 'none',
                            borderRadius: '8px',
                            marginBottom: '4px',
                            transition: 'background 0.2s ease',
                            cursor: 'default'
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <Text style={{ fontWeight: 500, fontSize: '14px', color: '#1f2937' }}>
                              {item.message}
                            </Text>
                            <div style={{ marginTop: '8px', display: 'flex', gap: '10px' }}>
                              {item.taskType === 'family_request' && (
                                <>
                                  <Button
                                    type="primary"
                                    size="small"
                                    icon={<CheckOutlined />}
                                    onClick={async () => {
                                      try {
                                        const res = await respondToNotification({
                                          id: item.id,
                                          response: 'accepted'
                                        });
                                        if (res?.data?.status === 1) {
                                          message.success('Family invite accepted');
                                          setNotifications((prev) => prev.filter((n) => n.id !== item.id));
                                        }
                                      } catch (err) {
                                        message.error('Failed to respond to invite');
                                      }
                                    }}
                                  />
                                  <Button
                                    danger
                                    size="small"
                                    icon={<CloseOutlined />}
                                    onClick={() => {
                                      setNotifications((prev) => prev.filter((n) => n.id !== item.id));
                                    }}
                                  />
                                </>
                              )}
                              {item.taskType === 'tagged' && (
                                <Button
                                  danger
                                  size="small"
                                  icon={<CloseOutlined />}
                                  onClick={() => handleDismissNotification(item.id)}
                                />
                              )}
                              <Button
                                type="primary"
                                size="small"
                                onClick={() => setIsConnectModalVisible(true)}
                                style={{
                                  fontSize: '12px',
                                  padding: '0 12px',
                                  height: '26px'
                                }}
                              >
                                Connect
                              </Button>
                            </div>
                          </div>
                        </List.Item>
                      )}
                    />
                  </div> */}
                </Col>
                <Col xs={24} lg={8}>
                  <div style={{ marginBottom: SPACING.xl }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: SPACING.md,
                      }}
                    >
                      <Title
                        level={5}
                        style={{
                          margin: 0,
                          display: "flex",
                          alignItems: "center",
                          gap: SPACING.sm,
                          color: "#4b5563",
                          fontSize: "13px",
                          fontFamily: FONT_FAMILY,
                          fontWeight: 600,
                        }}
                      >
                        <CalendarOutlined
                          style={{ color: "#6b7280", fontSize: "14px" }}
                        />
                        Upcoming Activities
                      </Title>
                      <Button
                        type="link"
                        size="small"
                        style={{
                          padding: 0,
                          fontSize: "11px",
                          fontFamily: FONT_FAMILY,
                        }}
                      >
                        View All →
                      </Button>
                    </div>
                    <div style={{ maxHeight: "220px", overflowY: "auto" }}>
                      <List
                        dataSource={mockData.upcomingActivities}
                        renderItem={(item) => (
                          <List.Item
                            style={{
                              padding: SPACING.sm,
                              border: "none",
                              borderRadius: "8px",
                              marginBottom: SPACING.xs,
                              transition: "background 0.2s ease",
                              cursor: "pointer",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = "#f9fafb")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "transparent")
                            }
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: SPACING.sm,
                                width: "100%",
                              }}
                            >
                              <div
                                style={{
                                  width: "3px",
                                  height: "24px",
                                  background: item.color,
                                  borderRadius: "2px",
                                }}
                              />
                              <div style={{ flex: 1 }}>
                                <Text
                                  style={{
                                    fontSize: "13px",
                                    fontWeight: 500,
                                    color: "#1f2937",
                                    fontFamily: FONT_FAMILY,
                                  }}
                                >
                                  {item.title}
                                </Text>
                                <br />
                                <Text
                                  style={{
                                    fontSize: "11px",
                                    color: "#6b7280",
                                    fontFamily: FONT_FAMILY,
                                  }}
                                >
                                  {item.time}
                                </Text>
                              </div>
                            </div>
                          </List.Item>
                        )}
                      />
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: SPACING.md,
                      }}
                    >
                      <Title
                        level={5}
                        style={{
                          margin: 0,
                          display: "flex",
                          alignItems: "center",
                          gap: SPACING.sm,
                          color: "#4b5563",
                          fontSize: "13px",
                          fontFamily: FONT_FAMILY,
                          fontWeight: 600,
                        }}
                      >
                        <HistoryOutlined
                          style={{ color: "#6b7280", fontSize: "14px" }}
                        />
                        Recent Activity
                      </Title>
                      <Button
                        type="link"
                        size="small"
                        style={{
                          padding: 0,
                          fontSize: "11px",
                          fontFamily: FONT_FAMILY,
                        }}
                      >
                        See All →
                      </Button>
                    </div>
                    <div style={{ maxHeight: "150px", overflowY: "auto" }}>
                      <List
                        dataSource={mockData.recentActivity}
                        renderItem={(item) => (
                          <List.Item
                            style={{
                              padding: SPACING.sm,
                              border: "none",
                              borderRadius: "8px",
                              marginBottom: SPACING.xs,
                              transition: "background 0.2s ease",
                              cursor: "pointer",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = "#f9fafb")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "transparent")
                            }
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: SPACING.sm,
                                width: "100%",
                              }}
                            >
                              <div
                                style={{
                                  width: "24px",
                                  height: "24px",
                                  background:
                                    item.type === "pdf"
                                      ? "#dbeafe"
                                      : item.type === "excel"
                                        ? "#dcfce7"
                                        : "#e0e7ff",
                                  borderRadius: "6px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <FileOutlined
                                  style={{
                                    color:
                                      item.type === "pdf"
                                        ? "#3b82f6"
                                        : item.type === "excel"
                                          ? "#10b981"
                                          : "#8b5cf6",
                                    fontSize: "11px",
                                  }}
                                />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <Text
                                  style={{
                                    fontSize: "12px",
                                    fontWeight: 500,
                                    color: "#1f2937",
                                    fontFamily: FONT_FAMILY,
                                  }}
                                >
                                  {item.name}
                                </Text>
                                <br />
                                <Text
                                  style={{
                                    fontSize: "10px",
                                    color: "#6b7280",
                                    fontFamily: FONT_FAMILY,
                                  }}
                                >
                                  {item.time}
                                </Text>
                              </div>
                              <Button
                                type="text"
                                size="small"
                                icon={
                                  starredItems.includes(item.id) ? (
                                    <StarFilled style={{ color: "#f59e0b" }} />
                                  ) : (
                                    <StarOutlined />
                                  )
                                }
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleStar(item.id);
                                }}
                                style={{ padding: "2px" }}
                              />
                            </div>
                          </List.Item>
                        )}
                      />
                    </div>
                  </div>
                </Col>
                <Col xs={24} lg={8}>
                  <Space
                    direction="vertical"
                    size="middle"
                    style={{ width: "100%" }}
                  >
                    <div>
                      <Title
                        level={5}
                        style={{
                          margin: `0 0 ${SPACING.sm}px 0`,
                          display: "flex",
                          alignItems: "center",
                          gap: SPACING.sm,
                          color: "#4b5563",
                          fontSize: "13px",
                          fontFamily: FONT_FAMILY,
                          fontWeight: 600,
                        }}
                      >
                        <SearchOutlined
                          style={{ color: "#6b7280", fontSize: "14px" }}
                        />
                        Search
                      </Title>
                      <Search
                        placeholder="Search accounts, documents, notes..."
                        style={{ marginBottom: SPACING.sm }}
                        size="middle"
                      />
                      <Space wrap>
                        {["Docs", "Accounts", "Notes"].map((filter) => (
                          <Tag
                            key={filter}
                            color={
                              activeFilters.includes(filter)
                                ? "blue"
                                : "default"
                            }
                            style={{
                              cursor: "pointer",
                              fontSize: "10px",
                              padding: "1px 6px",
                              borderRadius: "10px",
                              fontFamily: FONT_FAMILY,
                            }}
                            onClick={() => toggleFilter(filter)}
                          >
                            <FileOutlined
                              style={{ marginRight: "3px", fontSize: "10px" }}
                            />
                            {filter}
                          </Tag>
                        ))}
                      </Space>
                    </div>
                    <div>
                      <Title
                        level={5}
                        style={{
                          margin: `0 0 ${SPACING.sm}px 0`,
                          display: "flex",
                          alignItems: "center",
                          gap: SPACING.sm,
                          color: "#4b5563",
                          fontSize: "13px",
                          fontFamily: FONT_FAMILY,
                          fontWeight: 600,
                        }}
                      >
                        <ThunderboltOutlined
                          style={{ color: "#6b7280", fontSize: "14px" }}
                        />
                        Quick Actions
                      </Title>
                      <Row
                        gutter={[SPACING.sm, SPACING.sm]}
                        style={{ marginBottom: SPACING.sm }}
                      >
                        <Col span={12}>
                          <Button
                            onClick={() => setIsModalVisible(true)}
                            style={{
                              width: "100%",
                              height: "32px",
                              background: "#eff6ff",
                              color: "#39b5bcff",
                              border: "1px solid #a3f8f8ff",
                              fontSize: "12px",
                              fontWeight: 500,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: SPACING.sm,
                              fontFamily: FONT_FAMILY,
                            }}
                            icon={
                              <CalendarOutlined style={{ fontSize: "12px" }} />
                            }
                          >
                            Add Event
                          </Button>
                        </Col>
                        <Col span={12}>
                          <Button
                            onClick={() => setAddNoteModalVisible(true)}
                            style={{
                              width: "100%",
                              height: "32px",
                              background: "#fffbeb",
                              color: "#ca8a04",
                              border: "1px solid #fde68a",
                              fontSize: "12px",
                              fontWeight: 500,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: SPACING.sm,
                              fontFamily: FONT_FAMILY,
                            }}
                            icon={
                              <FileTextOutlined style={{ fontSize: "12px" }} />
                            }
                          >
                            Add Note
                          </Button>
                        </Col>
                        <Col span={12}>
                          <Button
                            style={{
                              width: "100%",
                              height: "32px",
                              background: "#faf5ff",
                              color: "#9333ea",
                              border: "1px solid #d8b4fe",
                              fontSize: "12px",
                              fontWeight: 500,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 8,
                              fontFamily: FONT_FAMILY,
                            }}
                            icon={<BookOutlined style={{ fontSize: "12px" }} />}
                            onClick={() => {
                              setModalMode("create");
                              setAddModalVisible(true);
                            }}
                          >
                            Bookmark
                          </Button>
                        </Col>
                        <Col span={12}>
                          <Button
                            onClick={() => setIsFolderModalVisible(true)}
                            style={{
                              width: "100%",
                              height: "32px",
                              background: "#fef2f2",
                              color: "#dc2626",
                              border: "1px solid #fecaca",
                              fontSize: "12px",
                              fontWeight: 500,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: SPACING.sm,
                              fontFamily: FONT_FAMILY,
                            }}
                            icon={
                              <UserAddOutlined style={{ fontSize: "12px" }} />
                            }
                          >
                            Account
                          </Button>
                        </Col>
                      </Row>
                      <div
                        onClick={handleClick}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        style={{
                          border: `2px dashed ${isDragActive ? "#3b82f6" : "#d1d5db"
                            }`,
                          borderRadius: "16px",
                          padding: "24px",
                          textAlign: "center",
                          backgroundColor: isDragActive ? "#eff6ff" : "#f9fafb",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                          opacity: 0,
                          animation: "fadeInUp 0.4s ease-out 1s forwards",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <Upload
                            style={{
                              color: isDragActive ? "#3b82f6" : "#9ca3af",
                              transition: "color 0.3s ease",
                            }}
                          />
                          <div>
                            <p
                              style={{
                                fontSize: "14px",
                                fontWeight: "500",
                                color: isDragActive ? "#3b82f6" : "#6b7280",
                                margin: "0 0 4px 0",
                              }}
                            >
                              Drag & Drop Files
                            </p>
                            <p
                              style={{
                                fontSize: "12px",
                                color: "#9ca3af",
                                margin: 0,
                              }}
                            >
                              or click to browse
                            </p>
                          </div>
                        </div>
                      </div>
                      <input
                        type="file"
                        multiple
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        style={{ display: "none" }}
                      />
                    </div>
                  </Space>
                </Col>
              </Row>
            </Card>
          </div>
        </Content>
      </Layout>
      <Modal
        title={
          <span style={{ fontFamily: "inherit" }}>
            {modalMode === "create" ? "Add New Bookmark" : "Edit Bookmark"}
          </span>
        }
        open={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        footer={null}
        style={{ top: 20 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={async (values) => {
            try {
              const payload = {
                ...values,
                tags: values.tags?.split(",").map((tag: string) => tag.trim()),
                favicon: "",
                is_favorite: false,
                editing: false,
              };
              await addBookmark(payload);
              message.success("Bookmark added successfully");
              setAddModalVisible(false);
              form.resetFields();
              router.push("/bookmarks");
            } catch (err) {
              console.error(err);
              message.error("Failed to add bookmark");
            }
          }}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Enter title" }]}
          >
            <Input placeholder="Enter title" />
          </Form.Item>
          <Form.Item
            name="url"
            label="URL"
            rules={[
              { required: true, message: "Enter URL" },
              {
                validator: (_, value) => {
                  if (!value) return Promise.reject(new Error("Enter URL"));
                  const urlPattern = /^https?:\/\/([\w-]+\.)+[\w-]{2,}(\/.*)?$/;
                  return urlPattern.test(value)
                    ? Promise.resolve()
                    : Promise.reject();
                },
              },
            ]}
          >
            <Input
              placeholder=" example.com"
              onBlur={(e) => {
                let value = e.target.value.trim();
                if (value && !/^https?:\/\//i.test(value)) {
                  form.setFieldsValue({
                    url: `https://${value}`,
                  });
                }
              }}
            />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Brief description" />
          </Form.Item>
          <Form.Item
            name="category"
            label="Resource Type"
            rules={[{ required: true, message: "Select category" }]}
          >
            <Select placeholder="Select type">
              <Option value="Tech">Tech</Option>
              <Option value="Design">Design</Option>
              <Option value="News">News</Option>
              <Option value="Social">Social</Option>
              <Option value="Tools">Tools</Option>
              <Option value="Education">Education</Option>
              <Option value="Entertainment">Entertainment</Option>
              <Option value="Others">Others</Option>
            </Select>
          </Form.Item>
          <Form.Item name="tags" label="Labels">
            <Input placeholder="e.g., react, frontend, tutorial" />
          </Form.Item>
          <Form.Item style={{ textAlign: "right" }}>
            <Space>
              <Button type="primary" htmlType="submit">
                Add Bookmark
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={
          <Space style={{ fontFamily: FONT_FAMILY }}>
            <PlusOutlined />
            Create New Event
          </Space>
        }
        open={isModalVisible}
        onOk={handleEventSave}
        onCancel={() => {
          setIsModalVisible(false);
          eventForm.resetFields();
          setIsAllDay(false);
        }}
        okText="Create Event"
        width={520}
        okButtonProps={{
          style: {
            backgroundColor: COLORS.accent,
            borderColor: COLORS.accent,
            fontFamily: FONT_FAMILY,
          },
        }}
        style={{ fontFamily: FONT_FAMILY }}
      >
        <Form
          form={eventForm}
          layout="vertical"
          style={{ marginTop: 12, fontFamily: FONT_FAMILY }}
          initialValues={{
            person: getPersonNames()[0] || "Family",
          }}
        >
          <Form.Item
            name="title"
            label="Event Title"
            rules={[{ required: true, message: "Please enter event title" }]}
          >
            <Input
              placeholder="Add a descriptive title"
              style={{ fontFamily: FONT_FAMILY }}
            />
          </Form.Item>
          {isAllDay ? (
            <Row gutter={12}>
              <Col span={12}>
                <Form.Item
                  name="startDate"
                  label="Start Date"
                  rules={[
                    { required: true, message: "Please select start date" },
                  ]}
                >
                  <DatePicker
                    style={{ width: "100%", fontFamily: FONT_FAMILY }}
                    disabledDate={(current) =>
                      current && current < dayjs().startOf("day")
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="endDate"
                  label="End Date"
                  rules={[
                    { required: true, message: "Please select end date" },
                  ]}
                >
                  <DatePicker
                    style={{ width: "100%", fontFamily: FONT_FAMILY }}
                    disabledDate={(current) =>
                      current && current < dayjs().startOf("day")
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
          ) : (
            <Row gutter={8}>
              <Col span={8}>
                <Form.Item
                  name="date"
                  label="Date"
                  rules={[{ required: true, message: "Please select date" }]}
                >
                  <DatePicker
                    style={{ width: "100%", fontFamily: FONT_FAMILY }}
                    disabledDate={(current) =>
                      current && current < dayjs().startOf("day")
                    }
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="startTime"
                  label={
                    <Space>
                      <ClockCircleOutlined />
                      Start Time
                    </Space>
                  }
                  rules={[
                    { required: true, message: "Please select start time" },
                  ]}
                >
                  <TimePicker
                    style={{ width: "100%", fontFamily: FONT_FAMILY }}
                    format="hh:mm A"
                    use12Hours
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="endTime"
                  label={
                    <Space>
                      <ClockCircleOutlined />
                      End Time
                    </Space>
                  }
                  rules={[
                    { required: true, message: "Please select end time" },
                  ]}
                >
                  <TimePicker
                    style={{ width: "100%", fontFamily: FONT_FAMILY }}
                    format="hh:mm A"
                    use12Hours
                  />
                </Form.Item>
              </Col>
            </Row>
          )}
          <Form.Item>
            <Checkbox
              checked={isAllDay}
              onChange={(e) => setIsAllDay(e.target.checked)}
              style={{ fontFamily: FONT_FAMILY }}
            >
              All day
            </Checkbox>
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="person"
                label="Assigned to"
                rules={[{ required: true, message: "Please select person" }]}
              >
                <Select
                  placeholder="Select person"
                  style={{ fontFamily: FONT_FAMILY }}
                >
                  {Object.keys(personColors).map((userName) => {
                    const account =
                      getConnectedAccount(userName) ||
                      connectedAccounts.find(
                        (acc) => acc.email === getPersonData(userName).email
                      );
                    return (
                      <Option key={userName} value={userName}>
                        <Space>
                          <Avatar
                            size="small"
                            style={{
                              backgroundColor: getPersonData(userName).color,
                            }}
                          >
                            {(account?.displayName || userName)
                              .charAt(0)
                              .toUpperCase()}
                          </Avatar>
                          {account?.displayName || userName}
                        </Space>
                      </Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="invitee" label="Invite">
                <Input
                  placeholder="Add email"
                  style={{ fontFamily: FONT_FAMILY }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="location"
            label={
              <Space>
                <EnvironmentOutlined />
                Location
              </Space>
            }
          >
            <Input
              placeholder="Add location or meeting link"
              style={{ fontFamily: FONT_FAMILY }}
            />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <TextArea
              rows={3}
              placeholder="Add notes, agenda, or additional details"
              style={{ fontFamily: FONT_FAMILY }}
            />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={
          <span style={{ fontFamily: FONT_FAMILY }}>
            Connect Your Financial Accounts
          </span>
        }
        open={isConnectModalVisible}
        onCancel={() => setIsConnectModalVisible(false)}
        footer={null}
        style={{ top: 20 }}
        width={600}
      >
        <ConnectAccounts onSuccess={handleConnectSuccess} />
      </Modal>
      <FolderConnectionModal
        isModalVisible={isFolderModalVisible}
        setIsModalVisible={setIsFolderModalVisible}
      />
      <AddNoteModal
        visible={addNoteModalVisible}
        onCancel={() => setAddNoteModalVisible(false)}
        onSuccess={() => {
          console.log('Note added successfully from dashboard');
        }}
      />
      <style>{`
        * {
          font-family: ${FONT_FAMILY};
        }
        @keyframes fadeIn {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .widgets-container {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .widgets-container .widget-card {
          height: 138px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          transform-origin: center;
          overflow: hidden;
        }
        .widgets-container:hover {
          margin-bottom: 10px;
        }
        .widgets-container:hover .widget-card {
          height: 278px;
          transform: translateY(-6px) scale(1.01);
          box-shadow: 0 16px 32px rgba(14, 13, 13, 0.1), 0 6px 12px rgba(0,0,0,0.06);
        }
        .ant-card {
          animation: fadeIn 0.6s ease-out;
        }
        .ant-card:nth-child(2) {
          animation-delay: 0.1s;
        }
        .ant-card:nth-child(3) {
          animation-delay: 0.2s;
        }
        .ant-badge-dot {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
        @media (max-width: 768px) {
          .ant-layout-sider {
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }
          .ant-layout-sider.mobile-open {
            transform: translateX(0);
          }
          .widgets-container .widget-card {
            height: 120px;
          }
          .widgets-container:hover .widget-card {
            height: 200px;
          }
        }
        ::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          borderRadius: 2px;
        }
        ::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          borderRadius: 2px;
        } 
        ::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
}

export default App;

