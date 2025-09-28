"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Layout,
  Card,
  Input,
  Button,
  Typography,
  Row,
  Col,
  List,
  Tag,
  Upload,
  message,
  Space,
  Modal,
  Form,
  Select,
  Steps,
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
  ThunderboltOutlined,
  StarOutlined,
  StarFilled,
  UserAddOutlined,
  CloseOutlined,
  CheckOutlined,
  ExclamationCircleOutlined,
  FileOutlined,
  CarOutlined,
  IdcardOutlined,
  BankOutlined,
  MedicineBoxOutlined,
  HistoryOutlined,
  TabletOutlined,
  UserOutlined,
  MailOutlined,
  SettingOutlined,
  RightOutlined,
  LeftOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import WeatherWidget from "./WeatherWidget";
import TopNewsWidget from "./TopNewsWidget";
import MarketsWidget from "./MarketsWidget";
import ConnectAccounts from "../finance/connectaccounts";
import { useRouter } from "next/navigation";
import FolderConnectionModal from "../components/connect";
import { useCurrentUser } from "../../app/userContext";
import { useGlobalLoading } from "../../app/loadingContext";
import { uploadDocklyRootFile } from "../../services/home";
import { capitalizeEachWord } from "../../app/comman";
import AddNoteModal from "../dashboard/AddNoteModal";
import AddBookmarkModal from "../dashboard/AddBookmarkModal";
import AddEventModal from "../dashboard/AddEventModal";
import {
  fetchSharedItemNotifications,
  getRecentActivities,
  markNotificationAsRead,
  respondToNotification,
} from "../../services/dashboard";
import { ConnectorSDKCallbackMetadata } from "@quiltt/react";
import { getAllPlannerData } from "../../services/planner";
import { API_URL } from "../../services/apiConfig";
import RecentActivity from "./RecentActivity";
// import { getMockConnectedAccounts } from "../../services/accounts";

const { Option } = Select;
const { Header, Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { Dragger } = Upload;
const { TextArea } = Input;
const { Step } = Steps;

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

const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  if (hour < 20) return "Good Evening";
  return "Good night";
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

interface ConnectedAccount {
  userName: string;
  email: string;
  displayName: string;
  accountType: string;
  provider: string;
  color: string;
}

interface GetStartedNotification {
  id: string;
  message: string;
  type: 'setup-profile' | 'connect-gmail' | 'connect-bank' | 'configure-settings';
  created_at: string;
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
  const [isConnectModalVisible, setIsConnectModalVisible] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [addNoteModalVisible, setAddNoteModalVisible] = useState(false);
  const [addBookmarkModalVisible, setAddBookmarkModalVisible] = useState(false);
  const [addEventModalVisible, setAddEventModalVisible] = useState(false);
  const [upcomingActivities, setUpcomingActivities] = useState<any[]>([]);
  const [connectedAccounts, setConnectedAccounts] = useState<
    ConnectedAccount[]
  >([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);

  // Get Started Flow State
  const [showGetStarted, setShowGetStarted] = useState(false);
  const [getStartedStep, setGetStartedStep] = useState(0);
  const [getStartedNotifications, setGetStartedNotifications] = useState<GetStartedNotification[]>([]);
  const [completedGetStartedSteps, setCompletedGetStartedSteps] = useState<number[]>([]);
  const [settingsForm] = Form.useForm();

  const [isDragActive, setIsDragActive] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const router = useRouter();
  const user = useCurrentUser();
  const username = user?.user_name;
  const { loading, setLoading } = useGlobalLoading();

  const [aiInput, setAiInput] = useState("");

  // Helper function to get button text based on step
  const getStepButtonText = (step: number) => {
    switch (step) {
      case 0: // setup-profile
      case 3: // configure-settings
        return "Setup";
      case 1: // connect-gmail
      case 2: // connect-bank
        return "Connect";
      default:
        return "Continue";
    }
  };

  // Helper function to get button text based on notification type
  const getNotificationButtonText = (type: string) => {
    switch (type) {
      case 'setup-profile':
      case 'configure-settings':
        return "Setup";
      case 'connect-gmail':
      case 'connect-bank':
        return "Connect";
      default:
        return "Go";
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Check if user is new and should see Get Started flow
  useEffect(() => {
    if (username) {
      const hasSeenGetStarted = localStorage.getItem(`get-started-completed-${username}`);
      const savedNotifications = localStorage.getItem(`get-started-notifications-${username}`);
      const savedCompletedSteps = localStorage.getItem(`get-started-completed-steps-${username}`);
      
      if (!hasSeenGetStarted) {
        setShowGetStarted(true);
      }
      
      if (savedNotifications) {
        try {
          const parsed = JSON.parse(savedNotifications);
          setGetStartedNotifications(parsed);
        } catch (e) {
          console.error('Error parsing saved get started notifications:', e);
        }
      }
      
      if (savedCompletedSteps) {
        try {
          const parsed = JSON.parse(savedCompletedSteps);
          setCompletedGetStartedSteps(parsed);
        } catch (e) {
          console.error('Error parsing completed steps:', e);
        }
      }
    }
  }, [username]);

  // Fetch connected accounts on component mount
  useEffect(() => {
    const fetchConnectedAccounts = async () => {
      setLoadingAccounts(true);
      try {
        const response = await getAllPlannerData({
          show_dockly: true,
          show_google: true,
        });

        if (response.data.status === 1) {
          const connectedAccountsData =
            response.data.payload.connected_accounts || [];
          setConnectedAccounts(connectedAccountsData);
        }
      } catch (error) {
        console.error("Failed to fetch connected accounts:", error);
        message.error("Failed to load connected accounts");
      }
      setLoadingAccounts(false);
    };

    fetchConnectedAccounts();
  }, []);

  const handleConnectSuccess = (metadata: ConnectorSDKCallbackMetadata) => {
    console.log("Successfully connected:", metadata.connectionId);
    setIsConnectModalVisible(false);
    router.push(`/${username}/finance-hub/setup`);
  };

  // Helper function to add notification if it doesn't exist
  const addNotificationIfNotExists = (stepType: GetStartedNotification['type'], message: string) => {
    if (!getStartedNotifications.some(notif => notif.type === stepType)) {
      const newNotification: GetStartedNotification = {
        id: `get-started-${stepType}-${Date.now()}`,
        message: message,
        type: stepType,
        created_at: new Date().toISOString(),
      };

      const updatedNotifications = [...getStartedNotifications, newNotification];
      setGetStartedNotifications(updatedNotifications);
      
      if (username) {
        localStorage.setItem(`get-started-notifications-${username}`, JSON.stringify(updatedNotifications));
      }
      
      return updatedNotifications;
    }
    return getStartedNotifications;
  };

  // Get Started Flow Functions
  const handleGetStartedSkip = (step: number) => {
    const stepData = {
      0: { type: 'setup-profile' as const, message: 'Setup your profile page' },
      1: { type: 'connect-gmail' as const, message: 'Connect Gmail account' },
      2: { type: 'connect-bank' as const, message: 'Connect your bank account' },
      3: { type: 'configure-settings' as const, message: 'Configure your settings' },
    };

    const stepInfo = stepData[step as keyof typeof stepData];
    if (stepInfo && username) {
      // Add current step to notifications if not already present
      addNotificationIfNotExists(stepInfo.type, stepInfo.message);
    }

    if (step < 3) {
      setGetStartedStep(step + 1);
    } else {
      handleGetStartedComplete();
    }
  };

  const handleGetStartedGo = (step: number) => {
    // Mark current step as completed
    const newCompletedSteps = [...completedGetStartedSteps, step];
    setCompletedGetStartedSteps(newCompletedSteps);
    if (username) {
      localStorage.setItem(`get-started-completed-steps-${username}`, JSON.stringify(newCompletedSteps));
    }

    // Add all remaining uncompleted steps as notifications
    const allSteps = [
      { step: 0, type: 'setup-profile' as const, message: 'Setup your profile page' },
      { step: 1, type: 'connect-gmail' as const, message: 'Connect Gmail account' },
      { step: 2, type: 'connect-bank' as const, message: 'Connect your bank account' },
      { step: 3, type: 'configure-settings' as const, message: 'Configure your settings' },
    ];

    // Find all uncompleted steps (excluding current step)
    const uncompletedSteps = allSteps.filter(stepInfo => 
      stepInfo.step !== step && !newCompletedSteps.includes(stepInfo.step)
    );
    
    let updatedNotifications = [...getStartedNotifications];
    
    if (uncompletedSteps.length > 0 && username) {
      uncompletedSteps.forEach(stepInfo => {
        if (!updatedNotifications.some(notif => notif.type === stepInfo.type)) {
          const newNotification: GetStartedNotification = {
            id: `get-started-${stepInfo.type}-${Date.now()}-${stepInfo.step}`,
            message: stepInfo.message,
            type: stepInfo.type,
            created_at: new Date().toISOString(),
          };
          updatedNotifications.push(newNotification);
        }
      });

      setGetStartedNotifications(updatedNotifications);
      localStorage.setItem(`get-started-notifications-${username}`, JSON.stringify(updatedNotifications));
    }

    // Handle the "Go" button action for each step
    switch (step) {
      case 0:
        // Setup profile - close modal and navigate to profile setup
        setShowGetStarted(false);
        if (username) {
          localStorage.setItem(`get-started-completed-${username}`, 'true');
        }
        router.push(`/${username}/profile/setup`);
        break;
      case 1:
        // Connect Gmail - close modal and redirect to Google Calendar connection
        setShowGetStarted(false);
        if (username) {
          localStorage.setItem(`get-started-completed-${username}`, 'true');
        }
        window.location.href = `${API_URL}/add-googleCalendar?username=${username}&userId=${user?.uid}`;
        break;
      case 2:
        // Connect bank - close modal and navigate to finance
        setShowGetStarted(false);
        if (username) {
          localStorage.setItem(`get-started-completed-${username}`, 'true');
        }
        setIsConnectModalVisible(true);
        break;
      case 3:
        // Settings - validate and navigate to preferences
        settingsForm.validateFields().then(() => {
          setShowGetStarted(false);
          if (username) {
            localStorage.setItem(`get-started-completed-${username}`, 'true');
          }
          router.push(`/${username}/profile#preferences`);
        }).catch(() => {
          message.error('Please complete all required settings');
        });
        break;
    }
  };

  const handleGetStartedComplete = () => {
    setShowGetStarted(false);
    if (username) {
      localStorage.setItem(`get-started-completed-${username}`, 'true');
    }
    message.success('Welcome to your dashboard! You\'re all set up.');
  };

  const handleGetStartedClose = () => {
    // When modal is closed, add all uncompleted steps as notifications
    const allSteps = [
      { step: 0, type: 'setup-profile' as const, message: 'Setup your profile page' },
      { step: 1, type: 'connect-gmail' as const, message: 'Connect Gmail account' },
      { step: 2, type: 'connect-bank' as const, message: 'Connect your bank account' },
      { step: 3, type: 'configure-settings' as const, message: 'Configure your settings' },
    ];

    // Filter out completed steps and steps that are already in notifications
    const uncompletedSteps = allSteps.filter(stepInfo => 
      !completedGetStartedSteps.includes(stepInfo.step) &&
      !getStartedNotifications.some(notif => notif.type === stepInfo.type)
    );
    
    if (uncompletedSteps.length > 0 && username) {
      const newNotifications = uncompletedSteps.map(stepInfo => ({
        id: `get-started-${stepInfo.type}-${Date.now()}-${stepInfo.step}`,
        message: stepInfo.message,
        type: stepInfo.type,
        created_at: new Date().toISOString(),
      }));

      const updatedNotifications = [...getStartedNotifications, ...newNotifications];
      setGetStartedNotifications(updatedNotifications);
      localStorage.setItem(`get-started-notifications-${username}`, JSON.stringify(updatedNotifications));
    }

    setShowGetStarted(false);
    if (username) {
      localStorage.setItem(`get-started-completed-${username}`, 'true');
    }
  };

  const handleGetStartedNotificationGo = (notificationType: string) => {
    switch (notificationType) {
      case 'setup-profile':
        router.push(`/${username}/profile/setup`);
        break;
      case 'connect-gmail':
        window.location.href = `${API_URL}/add-googleCalendar?username=${username}&userId=${user?.uid}`;
        break;
      case 'connect-bank':
        setIsConnectModalVisible(true);
        break;
      case 'configure-settings':
        router.push(`/${username}/profile#preferences`);
        break;
    }

    // Remove the notification after clicking "Go"
    if (username) {
      const updatedNotifications = getStartedNotifications.filter(n => n.type !== notificationType);
      setGetStartedNotifications(updatedNotifications);
      localStorage.setItem(`get-started-notifications-${username}`, JSON.stringify(updatedNotifications));
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <div style={{ textAlign: 'center', padding: '16px 24px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              border: '2px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              backgroundColor: '#f8fafc'
            }}>
              <UserOutlined style={{ fontSize: '20px', color: '#3b82f6' }} />
            </div>
            <Title level={4} style={{ 
              fontFamily: FONT_FAMILY, 
              marginBottom: '8px', 
              color: '#1f2937', 
              fontSize: '18px',
              fontWeight: 600,
              letterSpacing: '-0.2px',
              textAlign: 'center'
            }}>
              Setup Your Profile
            </Title>
            <Text style={{ 
              fontSize: '13px', 
              color: '#6b7280', 
              fontFamily: FONT_FAMILY, 
              lineHeight: '1.5',
              display: 'block',
              maxWidth: '320px',
              margin: '0 auto',
              textAlign: 'center'
            }}>
              Complete your profile to personalize your experience and help others recognize you in your family network.
            </Text>
          </div>
        );
      case 1:
        return (
          <div style={{ textAlign: 'center', padding: '16px 24px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              border: '2px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              backgroundColor: '#f8fafc'
            }}>
              <MailOutlined style={{ fontSize: '20px', color: '#10b981' }} />
            </div>
            <Title level={4} style={{ 
              fontFamily: FONT_FAMILY, 
              marginBottom: '8px', 
              color: '#1f2937', 
              fontSize: '18px',
              fontWeight: 600,
              letterSpacing: '-0.2px',
              textAlign: 'center'
            }}>
              Connect Gmail Account
            </Title>
            <Text style={{ 
              fontSize: '13px', 
              color: '#6b7280', 
              fontFamily: FONT_FAMILY, 
              lineHeight: '1.5',
              display: 'block',
              maxWidth: '320px',
              margin: '0 auto',
              textAlign: 'center'
            }}>
              Connect your Gmail to sync emails, contacts, and calendar events seamlessly across all your devices.
            </Text>
          </div>
        );
      case 2:
        return (
          <div style={{ textAlign: 'center', padding: '16px 24px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              border: '2px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              backgroundColor: '#f8fafc'
            }}>
              <BankOutlined style={{ fontSize: '20px', color: '#8b5cf6' }} />
            </div>
            <Title level={4} style={{ 
              fontFamily: FONT_FAMILY, 
              marginBottom: '8px', 
              color: '#1f2937', 
              fontSize: '18px',
              fontWeight: 600,
              letterSpacing: '-0.2px',
              textAlign: 'center'
            }}>
              Connect Bank Account
            </Title>
            <Text style={{ 
              fontSize: '13px', 
              color: '#6b7280', 
              fontFamily: FONT_FAMILY, 
              lineHeight: '1.5',
              display: 'block',
              maxWidth: '320px',
              margin: '0 auto',
              textAlign: 'center'
            }}>
              Securely connect your bank accounts to track finances, monitor spending, and manage your money effectively.
            </Text>
          </div>
        );
      case 3:
        return (
          <div style={{ textAlign: 'center', padding: '16px 24px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              border: '2px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              backgroundColor: '#f8fafc'
            }}>
              <SettingOutlined style={{ fontSize: '20px', color: '#f59e0b' }} />
            </div>
            <Title level={4} style={{ 
              fontFamily: FONT_FAMILY, 
              marginBottom: '8px', 
              color: '#1f2937', 
              fontSize: '18px',
              fontWeight: 600,
              letterSpacing: '-0.2px',
              textAlign: 'center'
            }}>
              Configure Settings
            </Title>
            <div style={{ marginBottom: '12px' }}>
              <Text style={{ 
                fontSize: '13px', 
                color: '#6b7280', 
                fontFamily: FONT_FAMILY, 
                lineHeight: '1.5',
                display: 'block',
                maxWidth: '320px',
                margin: '0 auto',
                textAlign: 'center'
              }}>
                Please update your timezone, configure push notifications, and select a backup account to complete your setup.
              </Text>
            </div>
            <div style={{ 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px',
              marginTop: '12px',
              maxWidth: '280px',
              margin: '12px auto 0',
              background: '#f8fafc',
              textAlign: 'left'
            }}>
              <Text style={{ 
                fontSize: '11px', 
                color: '#4b5563', 
                fontFamily: FONT_FAMILY,
                display: 'block',
                lineHeight: '1.4'
              }}>
                <strong style={{ color: '#1f2937', fontWeight: 600, display: 'block', marginBottom: '8px' }}>What you need to do:</strong>
                
                <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <div style={{ 
                    width: '4px', 
                    height: '4px', 
                    borderRadius: '50%', 
                    backgroundColor: '#3b82f6', 
                    marginTop: '4px', 
                    marginRight: '8px',
                    flexShrink: 0 
                  }}></div>
                  Set your preferred timezone
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <div style={{ 
                    width: '4px', 
                    height: '4px', 
                    borderRadius: '50%', 
                    backgroundColor: '#3b82f6', 
                    marginTop: '4px', 
                    marginRight: '8px',
                    flexShrink: 0 
                  }}></div>
                  Enable or disable push notifications
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <div style={{ 
                    width: '4px', 
                    height: '4px', 
                    borderRadius: '50%', 
                    backgroundColor: '#3b82f6', 
                    marginTop: '4px', 
                    marginRight: '8px',
                    flexShrink: 0 
                  }}></div>
                  Add a backup email account for security
                </div>
              </Text>
            </div>
          </div>
        );
      default:
        return null;
    }
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
        message.error("Failed to load notifications");
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

  useEffect(() => {
    const fetchUpcomingActivities = async () => {
      try {
        const res = await getAllPlannerData({
          show_dockly: true,
          show_google: true,
        });

        const now = new Date();
        const todayStr = now.toISOString().split("T")[0]; // YYYY-MM-DD

        const normalizeEvents = (res.data?.payload?.upcoming_events || []).map(
          (e: any) => ({
            id: e.id,
            summary: e.summary,
            start: e.start, // has dateTime/date
            end: e.end,
            provider: "calendar",
          })
        );

        // --- Separate today's and future ---
        let todayEvents: any[] = [];
        let futureEvents: any[] = [];

        normalizeEvents.forEach((event: any) => {
          const startRaw = event.start?.dateTime || event.start?.date;
          if (!startRaw) return;

          const startDateStr = startRaw.split("T")[0];

          if (startDateStr === todayStr) {
            todayEvents.push(event);
          } else if (new Date(startRaw) > now) {
            futureEvents.push(event);
          }
        });

        // Sort by time
        const sortByTime = (arr: any[]) =>
          arr.sort(
            (a, b) =>
              new Date(a.start?.dateTime || a.start?.date).getTime() -
              new Date(b.start?.dateTime || b.start?.date).getTime()
          );

        todayEvents = sortByTime(todayEvents);
        futureEvents = sortByTime(futureEvents);

        // --- Merge ---
        let upcoming: any[] = [...todayEvents];
        if (upcoming.length < 2) {
          upcoming = [
            ...upcoming,
            ...futureEvents.slice(0, 2 - upcoming.length),
          ];
        }

        // Map to UI format
        const mappedUpcoming = upcoming.map((event) => ({
          id: event.id,
          title: event.summary || "Untitled",
          time: event.start?.dateTime
            ? new Date(event.start.dateTime).toLocaleString([], {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
              })
            : event.start?.date
            ? new Date(event.start.date).toLocaleDateString([], {
                month: "short",
                day: "numeric",
              })
            : "",
          rawDate: event.start?.dateTime || event.start?.date,
          color: "#3b82f6",
        }));

        setUpcomingActivities(mappedUpcoming);
      } catch (err) {
        console.error("Error fetching upcoming activities", err);
      }
    };

    fetchUpcomingActivities();
  }, []);

  const handleOk = () => {
    if (!username) {
      console.error("Username not found in localStorage");
      return;
    }

    if (!upcomingActivities || upcomingActivities.length === 0) {
      router.push(`/${username}/planner?view=Month`);
      return;
    }

    // Get the first upcoming activity date
    const firstDateStr = upcomingActivities[0].rawDate;
    if (!firstDateStr) {
      router.push(`/${username}/planner?view=Month`);
      return;
    }

    const firstDate = new Date(firstDateStr);
    const now = new Date();

    const todayStr = now.toISOString().split("T")[0];
    const firstDateStrOnly = firstDate.toISOString().split("T")[0];

    // ✅ Check if today
    if (firstDateStrOnly === todayStr) {
      router.push(`/${username}/planner?view=Day`);
      return;
    }

    // ✅ Check if within this week
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday (or adjust for Monday)
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    if (firstDate >= startOfWeek && firstDate <= endOfWeek) {
      router.push(`/${username}/planner?view=Week`);
      return;
    }

    // ✅ Otherwise default to Month view
    router.push(`/${username}/planner?view=Month`);
  };

  const handleDismissNotification = async (id: number) => {
    try {
      await markNotificationAsRead(id);
      setSharedNotifications((prev) => prev.filter((notif) => notif.id !== id));
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

  function fetchEvents() {
    // This function would refresh calendar events after adding a new event
    console.log("Refreshing calendar events...");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f9fafa",
        marginTop: 50,
        marginLeft: "3px",
        fontFamily: FONT_FAMILY,
      }}
    >
      <div
        style={mobileOverlayStyle}
        onClick={() => setMobileMenuVisible(false)}
      />
      <Layout style={{ background: "#f9fafa" }}>
        <Content style={{ padding: SPACING.lg, overflow: "auto" }}>
          <div style={{ maxWidth: "1800px", margin: "0 5px" }}>
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
                {getGreeting()}, {capitalizeEachWord(username)}!
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
            </div> */}
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
                },
              }}
            >
              <Row gutter={[24, 24]}>
                <Col xs={24} lg={8}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "16px",
                    }}
                  >
                    <Title
                      level={5}
                      style={{
                        margin: 0,
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        color: "#4b5563",
                        fontSize: "14px",
                      }}
                    >
                      <TabletOutlined style={{ color: "#6b7280" }} />
                      Actions & Notifications
                    </Title>
                  </div>
                  <div>
                    <List
                      dataSource={[...notifications, ...sharedNotifications, ...getStartedNotifications]}
                      loading={loadingNotifications}
                      locale={{
                        emptyText: (
                          <div style={{ padding: "0" }}>
                            <div
                              style={{
                                marginTop: "8px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                              }}
                            ></div>
                          </div>
                        ),
                      }}
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
                                  item.taskType === "family_request"
                                    ? "#dcfce7"
                                    : item.type ? "#e0f2fe" : "#fef2f2",
                                borderRadius: "6px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              {item.type ? (
                                item.type === 'setup-profile' ? <UserOutlined style={{ color: "#0284c7", fontSize: "11px" }} /> :
                                item.type === 'connect-gmail' ? <MailOutlined style={{ color: "#0284c7", fontSize: "11px" }} /> :
                                item.type === 'connect-bank' ? <BankOutlined style={{ color: "#0284c7", fontSize: "11px" }} /> :
                                item.type === 'configure-settings' ? <SettingOutlined style={{ color: "#0284c7", fontSize: "11px" }} /> :
                                <BellOutlined style={{ color: "#0284c7", fontSize: "11px" }} />
                              ) : (
                                <BellOutlined
                                  style={{
                                    color:
                                      item.taskType === "family_request"
                                        ? "#10b981"
                                        : "#ef4444",
                                    fontSize: "11px",
                                  }}
                                />
                              )}
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
                                {item.message}
                              </Text>
                              <br />
                              <Text
                                style={{
                                  fontSize: "10px",
                                  color: "#6b7280",
                                  fontFamily: FONT_FAMILY,
                                }}
                              >
                                {item.created_at
                                  ? new Date(item.created_at).toLocaleString()
                                  : "Just now"}
                              </Text>
                            </div>
                            <div style={{ display: "flex", gap: "4px" }}>
                              {item.type && (
                                <Button
                                  type="primary"
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleGetStartedNotificationGo(item.type);
                                  }}
                                  style={{ 
                                    padding: "2px 8px",
                                    fontSize: "10px",
                                    height: "20px",
                                    lineHeight: "16px"
                                  }}
                                >
                                  {getNotificationButtonText(item.type)}
                                </Button>
                              )}
                              {item.taskType === "family_request" && (
                                <>
                                  <Button
                                    type="text"
                                    size="small"
                                    icon={
                                      <CheckOutlined
                                        style={{ color: "#10b981" }}
                                      />
                                    }
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      try {
                                        const res = await respondToNotification(
                                          {
                                            id: item.id,
                                            response: "accepted",
                                          }
                                        );
                                        if (res?.data?.status === 1) {
                                          message.success(
                                            "Family invite accepted"
                                          );
                                          setNotifications((prev) =>
                                            prev.filter((n) => n.id !== item.id)
                                          );
                                        }
                                      } catch (err) {
                                        message.error(
                                          "Failed to respond to invite"
                                        );
                                      }
                                    }}
                                    style={{ padding: "2px" }}
                                  />
                                  <Button
                                    type="text"
                                    size="small"
                                    icon={
                                      <CloseOutlined
                                        style={{ color: "#ef4444" }}
                                      />
                                    }
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setNotifications((prev) =>
                                        prev.filter((n) => n.id !== item.id)
                                      );
                                    }}
                                    style={{ padding: "2px" }}
                                  />
                                </>
                              )}
                              {item.taskType === "tagged" && (
                                <Button
                                  type="text"
                                  size="small"
                                  icon={
                                    <CloseOutlined
                                      style={{ color: "#ef4444" }}
                                    />
                                  }
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDismissNotification(item.id);
                                  }}
                                  style={{ padding: "2px" }}
                                />
                              )}
                            </div>
                          </div>
                        </List.Item>
                      )}
                    />
                  </div>
                </Col>
                <Col xs={24} lg={8}>
                  {/* Upcoming Activities */}
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
                        onClick={handleOk}
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
                        dataSource={upcomingActivities}
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
                    <RecentActivity compact={true}/>
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
                            onClick={() => setAddEventModalVisible(true)}
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
                            onClick={() => setAddBookmarkModalVisible(true)}
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
                          border: `2px dashed ${
                            isDragActive ? "#3b82f6" : "#d1d5db"
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

      {/* Enhanced Get Started Modal */}
      <Modal
        title={null}
        open={showGetStarted}
        onCancel={handleGetStartedClose}
        footer={null}
        width={780}
        centered
        closeIcon={
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            border: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            color: '#6b7280',
            transition: 'all 0.2s ease',
            fontFamily: FONT_FAMILY,
            cursor: 'pointer',
            backgroundColor: '#ffffff',
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)'
          }}>
            ×
          </div>
        }
        maskStyle={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
        style={{
          boxShadow: '0 16px 32px -8px rgba(0, 0, 0, 0.2)'
        }}
        styles={{
          content: {
            padding: 0,
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid #e5e7eb'
          }
        }}
      >
        <div style={{ 
          background: "#ffffff", 
          borderRadius: "16px", 
          overflow: 'hidden'
        }}>
          {/* Header Section */}
          <div style={{
            background: '#ffffff',
            padding: '24px 32px 20px',
            textAlign: 'center',
            borderBottom: '1px solid #f1f5f9'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              border: '2px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
              backgroundColor: '#f8fafc'
            }}>
              <div style={{ color: '#4b5563', fontSize: '24px' }}>🚀</div>
            </div>
            <Title level={3} style={{ 
              color: "#1f2937", 
              fontFamily: FONT_FAMILY, 
              marginBottom: "8px",
              fontSize: '30px',
              fontWeight: 600,
              letterSpacing: '-0.3px',
              textAlign: 'center'
            }}>
              Welcome to Your Dashboard!
            </Title>
            <Text style={{ 
              fontSize: "14px", 
              color: "#64748b", 
              fontFamily: FONT_FAMILY,
              lineHeight: '1.5',
              display: 'block',
              maxWidth: '400px',
              margin: '0 auto',
              textAlign: 'center'
            }}>
              Let's get you set up in just a few simple steps. This will only take a couple of minutes to complete.
            </Text>
          </div>

          {/* Progress Steps */}
          <div style={{ padding: '20px 32px 16px', backgroundColor: '#fafbfc' }}>
            <Steps 
              current={getStartedStep} 
              style={{ marginBottom: "20px" }}
              size="small"
            >
              <Step 
                title="Profile Setup" 
                icon={<UserOutlined style={{ fontSize: '14px' }} />} 
                description="Complete your personal profile"
                style={{ 
                  fontFamily: FONT_FAMILY,
                }}
              />
              <Step 
                title="Gmail Connect" 
                icon={<MailOutlined style={{ fontSize: '14px' }} />} 
                description="Sync your email account"
                style={{ 
                  fontFamily: FONT_FAMILY,
                }}
              />
              <Step 
                title="Bank Link" 
                icon={<BankOutlined style={{ fontSize: '14px' }} />} 
                description="Connect financial accounts"
                style={{ 
                  fontFamily: FONT_FAMILY,
                }}
              />
              <Step 
                title="Preferences" 
                icon={<SettingOutlined style={{ fontSize: '14px' }} />} 
                description="Configure your settings"
                style={{ 
                  fontFamily: FONT_FAMILY,
                }}
              />
            </Steps>
          </div>

          {/* Content Section */}
          <div style={{ 
            padding: '0 32px',
            minHeight: '160px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff'
          }}>
            {getStepContent(getStartedStep)}
          </div>

          {/* Footer Actions */}
          <div style={{ 
            padding: '20px 32px 24px',
            borderTop: '1px solid #f1f5f9',
            background: '#fafbfc',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              {getStartedStep > 0 && (
                <Button 
                  icon={<LeftOutlined />}
                  onClick={() => setGetStartedStep(getStartedStep - 1)}
                  style={{ 
                    fontFamily: FONT_FAMILY,
                    height: '32px',
                    padding: '0 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 500,
                    border: '1px solid #e5e7eb',
                    color: '#4b5563',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
                  }}
                >
                  Back
                </Button>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ 
                display: 'flex', 
                gap: '6px',
                alignItems: 'center'
              }}>
                <Text style={{ 
                  color: '#64748b', 
                  fontSize: '12px',
                  fontFamily: FONT_FAMILY,
                  fontWeight: 500,
                  marginRight: '6px'
                }}>
                  Step {getStartedStep + 1} of 4
                </Text>
                
                <div style={{ display: 'flex', gap: '3px' }}>
                  {[0, 1, 2, 3].map((stepIndex) => (
                    <div
                      key={stepIndex}
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: stepIndex <= getStartedStep ? '#3b82f6' : '#e5e7eb',
                        transition: 'background-color 0.3s ease'
                      }}
                    />
                  ))}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  onClick={() => handleGetStartedSkip(getStartedStep)}
                  style={{ 
                    fontFamily: FONT_FAMILY,
                    height: '32px',
                    padding: '0 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#64748b',
                    borderColor: '#e5e7eb',
                    background: '#ffffff',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
                  }}
                >
                  Skip for Now
                </Button>
                <Button
                  type="primary"
                  icon={getStartedStep === 3 ? <CheckOutlined /> : <RightOutlined />}
                  onClick={() => handleGetStartedGo(getStartedStep)}
                  style={{ 
                    fontFamily: FONT_FAMILY,
                    height: '32px',
                    padding: '0 20px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    background: '#1f2937',
                    border: 'none',
                    boxShadow: '0 3px 12px rgba(31, 41, 55, 0.15)'
                  }}
                >
                  {getStartedStep === 3 ? "Complete Setup" : getStepButtonText(getStartedStep)}
                </Button>
              </div>
            </div>
          </div>
        </div>
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
          console.log("Note added successfully from dashboard");
        }}
      />

      <AddBookmarkModal
        visible={addBookmarkModalVisible}
        onCancel={() => setAddBookmarkModalVisible(false)}
        onSuccess={() => {
          console.log("Bookmark added successfully from dashboard");
        }}
      />

      <AddEventModal
        visible={addEventModalVisible}
        onCancel={() => setAddEventModalVisible(false)}
        connectedAccounts={connectedAccounts}
        onSuccess={() => {
          // Refresh calendar data
          fetchEvents();
          console.log("Event added successfully from dashboard");
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
        .ant-steps-item-finish .ant-steps-item-icon {
          background-color: #52c41a;
          border-color: #52c41a;
        }
        .ant-steps-item-process .ant-steps-item-icon {
          background-color: #1f2937;
          border-color: #1f2937;
        }
        .ant-steps-item-wait .ant-steps-item-icon {
          background-color: #f5f5f5;
          border-color: #d9d9d9;
        }
        .ant-steps-item-title {
          font-family: ${FONT_FAMILY};
          font-weight: 600;
          font-size: 13px;
        }
        .ant-steps-item-description {
          font-family: ${FONT_FAMILY};
          font-size: 11px;
          color: #6b7280;
        }
        .ant-modal-close-x {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ant-modal-close-x:hover {
          background-color: #f3f4f6;
          border-color: #d1d5db;
        }
      `}</style>
    </div>
  );
}

export default App;