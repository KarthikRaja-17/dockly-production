"use client";

import React, { useState, useEffect } from "react";
import {
  Tabs,
  Form,
  Input,
  Button,
  Switch,
  Select,
  Space,
  Typography,
} from "antd";
import "antd/dist/reset.css"; // Import Ant Design CSS
import { useRouter } from "next/navigation";
import MainLayout from "../../../pages/components/layout/mainLayout";
import addNotificationsSettings from "../../../services/settings";
import { useCurrentUser } from "../../userContext";

const { TabPane } = Tabs;
const { Title } = Typography;
const { Option } = Select;

const SettingsPage: React.FC = () => {
  const [theme, setTheme] = useState<string>("light"); // Default to light theme
  const [username, setUsername] = useState<string>(""); // Username state
  const [notification, setNotification] = useState({}); // Username state
  const router = useRouter();
  const [form] = Form.useForm();
  const currentUser = useCurrentUser();
  console.log("🚀 ~ currentUser:", currentUser)

  // Detect system theme preference and update on change
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (theme === "system") {
        setTheme(e.matches ? "dark" : "light");
      }
    };

    // Set initial system theme
    if (theme === "system") {
      setTheme(mediaQuery.matches ? "dark" : "light");
    }

    // Listen for system theme changes
    mediaQuery.addEventListener("change", handleSystemThemeChange);
    return () =>
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, [theme]);

  // Handle username and redirection
  // useEffect(() => {
  //   const storedUsername = localStorage.getItem("username") || "";
  //   setUsername(storedUsername);
  //   if (!storedUsername) {
  //     router.push("/settings/setup");
  //   }
  // }, [router]);

  // Handle theme change
  const handleThemeChange = (value: string) => {
    if (value === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      setTheme(systemTheme);
    } else {
      setTheme(value);
    }
  };

  const addNotifications = async (values: any) => {
    const response = await addNotificationsSettings({ notifications: values });
    const { status, message, payload } = response.data
    if (status) {
      setNotification(payload.userNotifications);
    }
  }

  // Define theme-based styles
  const pageStyle = {
    minHeight: "100vh",
    maxWidth: "1800px",
    backgroundColor: theme === "dark" ? "#1a1a1a" : "#f0f2f5",
    color: theme === "dark" ? "#fff" : "#1f1f1f",
    padding: "24px",
    // display: "flex",
    // justifyContent: "center",
    // alignItems: "flex-start",
    margin: "75px",
  };

  const containerStyle = {
    padding: "24px",
    maxWidth: "1200px",
    // width: "auto",
    backgroundColor: theme === "dark" ? "#2c2c2c" : "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
    color: theme === "dark" ? "#fff" : "#1f1f1f",
  };

  const tabsStyle = {
    backgroundColor: theme === "dark" ? "#2c2c2c" : "#fff",
    padding: "16px",
    borderRadius: "8px",
    color: theme === "dark" ? "#fff" : "#1f1f1f",
  };

  const inputStyle = {
    borderRadius: "4px",
    padding: "8px",
    border: `1px solid ${theme === "dark" ? "#434343" : "#d9d9d9"}`,
    backgroundColor: theme === "dark" ? "#3a3a3a" : "#fff",
    color: theme === "dark" ? "#fff" : "#1f1f1f",
  };

  const buttonStyle = {
    borderRadius: "4px",
    padding: "8px 16px",
    backgroundColor: theme === "dark" ? "#40a9ff" : "#1890ff",
    border: "none",
    color: "#fff",
  };

  const defaultButtonStyle = {
    borderRadius: "4px",
    padding: "8px 16px",
    border: `1px solid ${theme === "dark" ? "#434343" : "#d9d9d9"}`,
    backgroundColor: theme === "dark" ? "#3a3a3a" : "#fff",
    color: theme === "dark" ? "#fff" : "#1f1f1f",
  };

  const dangerButtonStyle = {
    borderRadius: "4px",
    padding: "8px 16px",
    border: `1px solid ${theme === "dark" ? "#ff4d4f" : "#ff4d4f"}`,
    backgroundColor: theme === "dark" ? "#3a3a3a" : "#fff",
    color: theme === "dark" ? "#ff4d4f" : "#ff4d4f",
  };

  useEffect(() => {
    form.setFieldsValue({
      ...currentUser
    });

  }, [form])

  return (
    <>
      <div style={pageStyle}>
        <div style={containerStyle}>
          <Title
            level={2}
            style={{
              marginBottom: "24px",
              maxWidth: "1200px",
              color: theme === "dark" ? "#fff" : "#1f1f1f",
              fontWeight: 600,
            }}
          >
            Settings
          </Title>
          <Tabs defaultActiveKey="1" style={tabsStyle}>
            {/* Account Settings */}
            <TabPane tab="Account" key="1" style={{ padding: "16px" }}>
              <Form layout="vertical" style={{ maxWidth: "1200px" }}
                form={form}>
                {/* <Form.Item label="Full Name" style={{ marginBottom: "16px" }}>
                  <Input
                    placeholder="Enter your full name"
                    style={inputStyle}
                  />
                </Form.Item>
                <Form.Item label="Email" style={{ marginBottom: "16px" }}>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    style={inputStyle}
                  />
                </Form.Item> */}
                <Form.Item name="username" label="Username" style={{ marginBottom: "16px" }}>
                  <Input
                    placeholder="Enter new username"
                    style={inputStyle}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </Form.Item>
                {/* <Form.Item
                label="Two-Factor Authentication"
                style={{ marginBottom: "16px" }}
              >
                <Switch
                  style={{ backgroundColor: theme === "dark" ? "#40a9ff" : "#1890ff" }}
                /> */}
                <Button type="primary" style={buttonStyle}>
                  Save Changes
                </Button>
              </Form>
            </TabPane>

            {/* Preferences */}
            <TabPane tab="Preferences" key="2" style={{ padding: "16px" }}>
              <Form layout="vertical" style={{ maxWidth: "600px" }}
                form={form}>
                <Form.Item name="theme" label="Theme" style={{ marginBottom: "16px" }}>
                  <Select
                    defaultValue="light"
                    onChange={handleThemeChange}
                    style={{
                      ...inputStyle,
                      width: "100%",
                    }}
                  >
                    <Option value="light">Light</Option>
                    <Option value="dark">Dark</Option>
                    <Option value="system">System Default</Option>
                  </Select>
                </Form.Item>
                <Form.Item name="language" label="Language" style={{ marginBottom: "16px" }}>
                  <Select
                    defaultValue="en"
                    style={{
                      ...inputStyle,
                      width: "100%",
                    }}
                  >
                    <Option value="en">English</Option>
                    <Option value="es">Spanish</Option>
                    <Option value="fr">French</Option>
                  </Select>
                </Form.Item>
                <Button type="primary" style={buttonStyle}>
                  Save Preferences
                </Button>
              </Form>
            </TabPane>

            {/* Notifications */}
            <TabPane tab="Notifications" key="3" style={{ padding: "16px" }}>
              <Form
                layout="vertical"
                style={{ maxWidth: "600px" }}
                onFinish={addNotifications}
                initialValues={{
                  emailNotifications: true,
                  pushNotifications: true,
                  customReminder: 2,
                }}
                form={form}
              >
                <Form.Item
                  name="emailNotifications"
                  label="Email Notifications"
                  valuePropName="checked"
                  style={{ marginBottom: "16px" }}
                >
                  <Switch
                    style={{
                      backgroundColor: theme === "dark" ? "#40a9ff" : "#1890ff",
                    }}
                  />
                </Form.Item>

                <Form.Item
                  name="pushNotifications"
                  label="Push Notifications"
                  valuePropName="checked"
                  style={{ marginBottom: "16px" }}
                >
                  <Switch
                    style={{
                      backgroundColor: theme === "dark" ? "#40a9ff" : "#1890ff",
                    }}
                  />
                </Form.Item>

                <Form.Item
                  name="customReminder"
                  label="Custom Reminder (Days Before)"
                  style={{ marginBottom: "16px" }}
                >
                  <Input type="number" placeholder="e.g. 3" style={inputStyle} />
                </Form.Item>

                <Button type="primary" style={buttonStyle} htmlType="submit">
                  Update Notifications
                </Button>
              </Form>
            </TabPane>

            {/* Security */}
            <TabPane tab="Security" key="4" style={{ padding: "16px" }}>
              <Form layout="vertical" style={{ maxWidth: "600px" }}>
                <Form.Item
                  label="View Login History"
                  style={{ marginBottom: "16px" }}
                >
                  <Button style={defaultButtonStyle}>Show Access Logs</Button>
                </Form.Item>
                <Form.Item label="Export Data" style={{ marginBottom: "16px" }}>
                  <Button style={defaultButtonStyle}>Download Data</Button>
                </Form.Item>
                <Form.Item
                  label="Delete Account"
                  style={{ marginBottom: "16px" }}
                >
                  <Button danger style={dangerButtonStyle}>
                    Delete My Account
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>

            {/* Connected Services */}
            <TabPane
              tab="Connected Services"
              key="5"
              style={{ padding: "16px" }}
            >
              <p
                style={{
                  marginBottom: "16px",
                  color: theme === "dark" ? "#fff" : "#1f1f1f",
                  fontSize: "16px",
                }}
              >
                Manage your linked bank accounts, cloud services, and other
                integrations.
              </p>
              <Button type="default" style={defaultButtonStyle}>
                Manage Accounts
              </Button>
            </TabPane>

            {/* Subscription */}
            <TabPane tab="Subscription" key="6" style={{ padding: "16px" }}>
              <p
                style={{
                  marginBottom: "16px",
                  color: theme === "dark" ? "#fff" : "#1f1f1f",
                  fontSize: "16px",
                }}
              >
                View and manage your Dockly subscription plan and billing
                history.
              </p>
              <Space>
                <Button type="primary" style={buttonStyle}>
                  Upgrade Plan
                </Button>
                <Button style={defaultButtonStyle}>View Billing History</Button>
              </Space>
            </TabPane>

            {/* Support */}
            <TabPane tab="Support" key="7" style={{ padding: "16px" }}>
              <Button
                type="default"
                style={{
                  ...defaultButtonStyle,
                  marginBottom: "12px",
                  display: "block",
                }}
              >
                Help Center
              </Button>
              <Button
                type="default"
                style={{
                  ...defaultButtonStyle,
                  marginBottom: "12px",
                  display: "block",
                }}
              >
                Contact Support
              </Button>
              <Button
                type="default"
                style={{
                  ...defaultButtonStyle,
                  display: "block",
                }}
              >
                Send Feedback
              </Button>
            </TabPane>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default SettingsPage;
