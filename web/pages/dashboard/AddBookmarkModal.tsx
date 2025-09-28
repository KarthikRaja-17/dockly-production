"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Space,
  Checkbox,
  Radio,
  message,
} from "antd";
import {
  BookOutlined,
  LockOutlined,
  CodeOutlined,
  BgColorsOutlined,
  GlobalOutlined,
  UsergroupAddOutlined,
  ToolOutlined,
  ReadOutlined,
  PlayCircleOutlined,
  EllipsisOutlined,
  CalendarOutlined,
  TeamOutlined,
  DollarOutlined,
  HomeOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import { addBookmark, getCategories } from "../../services/bookmarks";
import { useGlobalLoading } from "../../app/loadingContext";

const { Option } = Select;
const { TextArea } = Input;

const FONT_FAMILY =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

// Hub options with icons
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

interface AddBookmarkModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
  defaultHub?: string;
}

const AddBookmarkModal: React.FC<AddBookmarkModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  defaultHub = "family",
}) => {
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const { loading, setLoading } = useGlobalLoading();
  const [categories, setCategories] = useState<string[]>([]);

  // Custom category state
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState("");

  // Password functionality states
  const [savePassword, setSavePassword] = useState(false);
  const [passwordSaveOption, setPasswordSaveOption] = useState("");
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);

  // Responsive state
  const [windowSize, setWindowSize] = useState({ width: 1200, height: 800 });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (visible) {
      loadCategories();
      // Reset form with default values
      form.resetFields();
      setShowCustomCategory(false);
      setCustomCategory("");
      setSavePassword(false);
      setPasswordSaveOption("");

      // Set default hub
      form.setFieldsValue({
        hubs: [defaultHub],
        savePassword: false,
        passwordSaveOption: "",
      });
    }
  }, [visible, defaultHub, form]);

  const isMobile = () => windowSize.width < 768;
  const isTablet = () => windowSize.width >= 768 && windowSize.width < 992;

  const normalizeUrl = (url: string): string => {
    if (!url || typeof url !== "string") return "";
    const trimmedUrl = url.trim();
    if (trimmedUrl.match(/^https?:\/\//i)) return trimmedUrl;
    return `https://${trimmedUrl}`;
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

  const loadCategories = async () => {
    try {
      const response = await getCategories();
      const { status, payload } = response.data;
      if (status) {
        setCategories(payload.categories);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    }
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
      setPasswordModalVisible(false);
      passwordForm.resetFields();
      message.success("Password saved with Dockly");
    } catch (error) {
      console.error("Password validation failed:", error);
    }
  };

  const handleAddBookmark = async () => {
    try {
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
        hubsValue = [defaultHub];
      }

      // If multiple hubs are selected and "none" is among them, remove "none"
      if (hubsValue.length > 1 && hubsValue.includes("none")) {
        hubsValue = hubsValue.filter((hub: string) => hub !== "none");
      }

      // If no valid hubs after filtering, set default
      if (hubsValue.length === 0) {
        hubsValue = [defaultHub];
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
        hubs: hubsValue,
        // Add password-related fields if password saving is enabled
        ...(values.savePassword && {
          savePassword: true,
          passwordSaveOption: values.passwordSaveOption,
        }),
      };

      setLoading(true);
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
        
        // Reset form and close modal
        form.resetFields();
        setShowCustomCategory(false);
        setCustomCategory("");
        setSavePassword(false);
        setPasswordSaveOption("");
        
        onCancel();
        onSuccess?.();
      } else {
        message.error(msg || "Failed to add bookmark");
      }
    } catch (error) {
      console.error("Error saving bookmark:", error);
      message.error("Failed to save bookmark");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    form.resetFields();
    setShowCustomCategory(false);
    setCustomCategory("");
    setSavePassword(false);
    setPasswordSaveOption("");
    onCancel();
  };

  return (
    <>
      {/* Main Add Bookmark Modal */}
      <Modal
        title={
          <span
            style={{
              fontFamily: FONT_FAMILY,
              color: "#1f2937",
              fontSize: isMobile() ? "14px" : "15px",
            }}
          >
            Add New Bookmark
          </span>
        }
        open={visible}
        onCancel={closeModal}
        footer={null}
        width={isMobile() ? "90vw" : isTablet() ? "60vw" : "45vw"}
        style={{
          top: isMobile() ? 8 : 12,
          fontFamily: FONT_FAMILY,
        }}
        styles={{
          body: {
            background: "#ffffff",
            padding: isMobile() ? "8px" : "12px",
            maxHeight: "80vh",
            overflowY: "auto",
          },
          content: {
            borderRadius: "8px",
            boxShadow: "0 12px 28px rgba(0, 0, 0, 0.08)",
          },
        }}
        destroyOnClose
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
            <TextArea
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
          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button
                onClick={closeModal}
                size="small"
                style={{
                  fontFamily: FONT_FAMILY,
                  borderRadius: "4px",
                  fontSize: "12px",
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="small"
                style={{
                  fontFamily: FONT_FAMILY,
                  borderRadius: "4px",
                  minWidth: "100px",
                  fontSize: "12px",
                }}
              >
                Add Bookmark
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Password Modal */}
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
    </>
  );
};

export default AddBookmarkModal;