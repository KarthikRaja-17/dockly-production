'use client'
import React, { useEffect, useState } from 'react';
import {
  List,
  Button,
  Typography,
  Input,
  Select,
  Pagination,
  Tag,
} from 'antd';
import {
  HistoryOutlined,
  StarOutlined,
  StarFilled,
  UserOutlined,
  LoginOutlined,
  LogoutOutlined,
  EditOutlined,
  CreditCardOutlined,
  PhoneOutlined,
  CheckCircleOutlined,
  FilterOutlined,
  ClockCircleOutlined,
  DesktopOutlined,
} from '@ant-design/icons';
import { getRecentActivities } from '../../services/apiConfig';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

interface Activity {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  ip_address: string;
  user_agent: string;
  timestamp: string;
}
// Constants for consistent styling
const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
};

const FONT_FAMILY = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const getActionConfig = (action: string) => {
  const configMap: {
    [key: string]: {
      icon: React.ReactNode;
      color: string;
      bg: string;
      title: string;
      description: string;
    }
  } = {
    CREATE: {
      icon: <UserOutlined />,
      color: '#10b981',
      bg: '#ecfdf5',
      title: 'Account Created',
      description: 'Welcome! Your account has been successfully created',
    },
    LOGIN: {
      icon: <LoginOutlined />,
      color: '#3b82f6',
      bg: '#eff6ff',
      title: 'Login from New Device',
      description: 'New login detected from Chrome on Windows',
    },
    LOGOUT: {
      icon: <LogoutOutlined />,
      color: '#f59e0b',
      bg: '#fffbeb',
      title: 'Signed Out',
      description: 'You have been signed out of your account',
    },
    UPDATE_EMAIL: {
      icon: <EditOutlined />,
      color: '#8b5cf6',
      bg: '#f3e8ff',
      title: 'Email Updated',
      description: 'Your email address has been successfully updated',
    },
    VERIFY_EMAIL: {
      icon: <CheckCircleOutlined />,
      color: '#06b6d4',
      bg: '#ecfeff',
      title: 'Email Verified',
      description: 'Your email address has been successfully verified',
    },
    SEND_OTP: {
      icon: <PhoneOutlined />,
      color: '#f97316',
      bg: '#fff7ed',
      title: 'Verification Code Sent',
      description: 'A verification code has been sent to your device',
    },
    VERIFY_OTP: {
      // icon: <ShieldCheckOutlined />,
      icon: <CheckCircleOutlined />,
      color: '#10b981',
      bg: '#ecfdf5',
      title: 'Security Code Verified',
      description: 'Your security code has been successfully verified',
    },
    CREATE_SESSION: {
      icon: <DesktopOutlined />,
      color: '#3b82f6',
      bg: '#eff6ff',
      title: 'New Session Started',
      description: 'A new session has been created for your account',
    },
    PLAN_SUBSCRIPTION: {
      icon: <CreditCardOutlined />,
      color: '#ec4899',
      bg: '#fdf2f8',
      title: 'Subscription Updated',
      description: 'Your subscription plan has been successfully updated',
    },
  };

  return configMap[action] || {
    icon: <HistoryOutlined />,
    color: '#6b7280',
    bg: '#f9fafb',
    title: 'Activity',
    description: 'An activity occurred on your account',
  };
};

interface RecentActivityProps {
  compact?: boolean;
  showHeader?: boolean;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ compact = false, showHeader = true }) => {
  const [starredItems, setStarredItems] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [activities, setActivities] = useState<Activity[] | null>(null);
  const pageSize = 10;
  const getActivities = async () => {
    const response = await getRecentActivities({});
    if (response?.data?.status) {
      setActivities(response.data.payload.activities);
    }
  }
  useEffect(() => {
    getActivities();
  }, [])
  const toggleStar = (id: string) => {
    setStarredItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };
  const filteredActivities = activities?.filter((activity: Activity) => {
    const config = getActionConfig(activity.action);
    const matchesSearch = activity.action.toLowerCase().includes(searchText.toLowerCase()) ||
      config.title.toLowerCase().includes(searchText.toLowerCase()) ||
      config.description.toLowerCase().includes(searchText.toLowerCase());
    const matchesFilter = filterAction === 'all' || activity.action === filterAction;
    return matchesSearch && matchesFilter;
  });

  // For compact view, only show latest 2 records
  const displayActivities = compact
    ? filteredActivities?.slice(0, 2)
    : filteredActivities?.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const uniqueActions: string[] = [];
  const set = new Set(activities ? activities.map(a => a.action) : []);

  Array.from(set).forEach((action) => {
    uniqueActions.push(action);
  });

  if (compact) {
    return (
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
              color: "#3b82f6",
            }}
          >
            See All →
          </Button>
        </div>
        <div style={{ maxHeight: "200px", overflowY: "auto" }}>
          <List
            dataSource={displayActivities}
            renderItem={(item) => {
              const actionConfig = getActionConfig(item.action);

              return (
                <List.Item
                  style={{
                    padding: SPACING.sm,
                    border: "none",
                    borderRadius: "8px",
                    marginBottom: SPACING.xs,
                    transition: "all 0.2s ease",
                    cursor: "pointer",
                    background: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f9fafb";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: SPACING.sm,
                      width: "100%",
                    }}
                  >
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        background: actionConfig.bg,
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        border: `1px solid ${actionConfig.color}20`,
                      }}
                    >
                      <span
                        style={{
                          color: actionConfig.color,
                          fontSize: "14px",
                        }}
                      >
                        {actionConfig.icon}
                      </span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#1f2937",
                          fontFamily: FONT_FAMILY,
                          display: "block",
                          marginBottom: "2px",
                        }}
                      >
                        {actionConfig.title}
                      </Text>
                      <Text
                        style={{
                          fontSize: "11px",
                          color: "#6b7280",
                          fontFamily: FONT_FAMILY,
                          display: "block",
                          lineHeight: "1.4",
                          marginBottom: "4px",
                        }}
                      >
                        {actionConfig.description}
                      </Text>
                      <Text
                        style={{
                          fontSize: "10px",
                          color: "#9ca3af",
                          fontFamily: FONT_FAMILY,
                        }}
                      >
                        {item.timestamp}
                      </Text>
                    </div>
                    <Button
                      type="text"
                      size="small"
                      icon={
                        starredItems.includes(item.id) ? (
                          <StarFilled style={{ color: "#f59e0b" }} />
                        ) : (
                          <StarOutlined style={{ color: "#d1d5db" }} />
                        )
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStar(item.id);
                      }}
                      style={{ padding: "2px", flexShrink: 0 }}
                    />
                  </div>
                </List.Item>
              );
            }}
          />
        </div>
      </div>
    );
  }

  // Full view
  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #f0f0f0',
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    }}>
      {showHeader && (
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #f0f0f0',
          background: 'linear-gradient(135deg, #fafafa 0%, #ffffff 100%)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
          }}>
            <Title
              level={3}
              style={{
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: SPACING.md,
                color: '#1f2937',
                fontFamily: FONT_FAMILY,
                fontWeight: 700,
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              }}>
                <ClockCircleOutlined style={{ color: '#ffffff', fontSize: '20px' }} />
              </div>
              Activity History
            </Title>
          </div>

          <div style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}>
            <Search
              placeholder="Search activities..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ flex: 1, minWidth: '250px', maxWidth: '400px' }}
              allowClear
              size="large"
            />
            <Select
              value={filterAction}
              onChange={setFilterAction}
              style={{ width: '180px' }}
              suffixIcon={<FilterOutlined />}
              size="large"
            >
              <Option value="all">All Actions</Option>
              {uniqueActions.map(action => (
                <Option key={action} value={action}>
                  {getActionConfig(action).title}
                </Option>
              ))}
            </Select>
          </div>
        </div>
      )}

      <div style={{ padding: '24px' }}>
        <List
          dataSource={displayActivities}
          renderItem={(item) => {
            const actionConfig = getActionConfig(item.action);

            return (
              <List.Item
                style={{
                  padding: '16px',
                  border: "1px solid #f0f0f0",
                  borderRadius: "12px",
                  marginBottom: "16px",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  background: "#ffffff",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#fafbfc";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.12)";
                  e.currentTarget.style.borderColor = actionConfig.color + "40";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#ffffff";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.04)";
                  e.currentTarget.style.borderColor = "#f0f0f0";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: SPACING.lg,
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      background: actionConfig.bg,
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      border: `2px solid ${actionConfig.color}30`,
                    }}
                  >
                    <span
                      style={{
                        color: actionConfig.color,
                        fontSize: "20px",
                      }}
                    >
                      {actionConfig.icon}
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text
                      style={{
                        fontSize: "16px",
                        fontWeight: 600,
                        color: "#1f2937",
                        fontFamily: FONT_FAMILY,
                        display: "block",
                        marginBottom: "4px",
                      }}
                    >
                      {actionConfig.title}
                    </Text>
                    <Text
                      style={{
                        fontSize: "14px",
                        color: "#6b7280",
                        fontFamily: FONT_FAMILY,
                        display: "block",
                        lineHeight: "1.5",
                        marginBottom: "8px",
                      }}
                    >
                      {actionConfig.description}
                    </Text>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <Text
                        style={{
                          fontSize: "12px",
                          color: "#9ca3af",
                          fontFamily: FONT_FAMILY,
                        }}
                      >
                        {item.timestamp}
                      </Text>
                      <Text
                        style={{
                          fontSize: "12px",
                          color: "#9ca3af",
                          fontFamily: FONT_FAMILY,
                        }}
                      >
                        • {item.ip_address}
                      </Text>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Tag
                      style={{
                        margin: 0,
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: 500,
                        border: `1px solid ${actionConfig.color}40`,
                        background: actionConfig.bg,
                        color: actionConfig.color,
                        padding: "4px 8px",
                      }}
                    >
                      {item.action.replace('_', ' ')}
                    </Tag>
                    <Button
                      type="text"
                      size="small"
                      icon={
                        starredItems.includes(item.id) ? (
                          <StarFilled style={{ color: "#f59e0b" }} />
                        ) : (
                          <StarOutlined style={{ color: "#d1d5db" }} />
                        )
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStar(item.id);
                      }}
                      style={{ padding: "6px", flexShrink: 0 }}
                    />
                  </div>
                </div>
              </List.Item>
            );
          }}
        />

        {(!compact && filteredActivities) && filteredActivities.length > pageSize && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: '1px solid #f0f0f0',
          }}>
            <Pagination
              current={currentPage}
              total={filteredActivities.length}
              pageSize={pageSize}
              onChange={setCurrentPage}
              showSizeChanger={false}
              showQuickJumper
              showTotal={(total, range) =>
                `${range[0]}-${range[1]} of ${total} activities`
              }
            // size="large"
            />
          </div>
        )}

        {(filteredActivities && filteredActivities.length === 0) && (
          <div style={{
            textAlign: 'center',
            padding: '64px 24px',
            color: '#8c8c8c',
          }}>
            <HistoryOutlined style={{ fontSize: '64px', color: '#d9d9d9', marginBottom: '24px' }} />
            <div>
              <Text style={{ fontSize: '18px', color: '#595959', fontWeight: 600 }}>No activities found</Text>
              <br />
              <Text style={{ fontSize: '14px', color: '#8c8c8c' }}>
                Try adjusting your search or filter criteria
              </Text>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;