"use client";

import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Typography,
  Button,
  Card,
  Row,
  Col,
  Alert,
  Select,
  Checkbox,
  Tabs,
  Upload,
  message,
} from "antd";
import {
  FileTextOutlined,
  EditOutlined,
  UserOutlined,
  ContactsOutlined,
  IdcardOutlined,
  UploadOutlined,
  SaveOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
} from "@ant-design/icons";
import {
  addPersonalInfo,
  getPersonalInfo,
  updatePersonalInfo,
  uploadFamilyDocumentRecordFile,
} from "../../../services/family";
import type { UploadRequestOption } from "rc-upload/lib/interface";

const { Title } = Typography;
const { TabPane } = Tabs;

interface FormValues {
  firstName: string;
  middleName: string;
  lastName: string;
  preferredName: string;
  nicknames: string;
  relationship: string;
  dateOfBirth: string;
  age: string;
  birthplace: string;
  gender: string;
  phoneNumber: string;
  primaryEmail: string;
  additionalEmails: string;
  sameAsPrimary: boolean;
  ssn: string;
  birthCertNumber: string;
  stateId: string;
  passport: string;
  license: string;
  studentId: string;
  primaryContact: string;
  primaryContactPhone: string;
  secondaryContact: string;
  secondaryContactPhone: string;
}

interface PersonalInfoSectionProps {
  memberId?: string | string[];
  onDocumentUploaded?: () => void;
  fullWidth?: boolean;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  memberId,
  onDocumentUploaded,
  fullWidth = false,
}) => {
  const [form] = Form.useForm<FormValues>();
  const userId = Array.isArray(memberId) ? memberId[0] : memberId || "";
  const [personalId, setPersonalId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("basic");
  const [uploading, setUploading] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchPersonalInfo = async () => {
      try {
        if (!userId) return;
        const response = await getPersonalInfo({ userId });
        if (response.status === 1 && response.payload) {
          form.setFieldsValue(response.payload);
          setPersonalId(response.payload.id);
        }
      } catch (error) {
        console.error("Failed to fetch personal info:", error);
      }
    };

    fetchPersonalInfo();
  }, [form, userId]);

  const onFinish = async (values: FormValues) => {
    try {
      const payload = {
        ...values,
        addedBy: userId,
        editedBy: userId,
        userId: userId,
      };

      const response = personalId
        ? await updatePersonalInfo({ personal_info: payload })
        : await addPersonalInfo({ personal_info: payload });

      if (response.status === 1) {
        message.success("Personal information saved successfully");
        setIsEditing(false);
      } else {
        message.error(
          response.message || "Failed to save personal information"
        );
      }
    } catch (error) {
      console.error("Failed to save:", error);
      message.error("Failed to save personal information");
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Save the form when switching from edit to view mode
      form.submit();
    } else {
      setIsEditing(true);
    }
  };

  const handleDocumentUpload = async (
    options: UploadRequestOption,
    documentType: string
  ) => {
    const { file, onSuccess, onError } = options;
    const actualFile = file as File;

    try {
      setUploading(documentType);
      const formData = new FormData();
      formData.append("file", actualFile);
      if (userId) {
        formData.append("userId", userId);
      }

      const res = await uploadFamilyDocumentRecordFile(formData);

      if (res.status === 1) {
        message.success(`${documentType} uploaded successfully`);
        if (onDocumentUploaded) {
          onDocumentUploaded();
        }
        if (onSuccess) onSuccess({}, new XMLHttpRequest());
      } else {
        message.error(res.message || "Upload failed");
        if (onError) onError(new Error(res.message));
      }
    } catch (err) {
      console.error("Upload error", err);
      message.error(`Failed to upload ${documentType}`);
      if (onError) onError(err as Error);
    } finally {
      setUploading(null);
    }
  };

  const basicInfoPanel = (
    <>
      {/* Personal Details */}
      <Row gutter={16}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item label="First Name" name="firstName">
            <Input
              readOnly={!isEditing}
              style={{ cursor: isEditing ? "text" : "default" }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item label="Middle Name" name="middleName">
            <Input
              readOnly={!isEditing}
              style={{ cursor: isEditing ? "text" : "default" }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item label="Last Name" name="lastName">
            <Input
              readOnly={!isEditing}
              style={{ cursor: isEditing ? "text" : "default" }}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item label="Preferred Name" name="preferredName">
            <Input
              readOnly={!isEditing}
              style={{ cursor: isEditing ? "text" : "default" }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item label="Nickname(s)" name="nicknames">
            <Input
              readOnly={!isEditing}
              style={{ cursor: isEditing ? "text" : "default" }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item label="Relationship" name="relationship">
            <Input
              readOnly={!isEditing}
              style={{ cursor: isEditing ? "text" : "default" }}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item label="Date of Birth" name="dateOfBirth">
            <Input
              type="date"
              readOnly={!isEditing}
              style={{ cursor: isEditing ? "text" : "default" }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item label="Age" name="age">
            <Input
              readOnly={!isEditing}
              style={{ cursor: isEditing ? "text" : "default" }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item label="Birthplace" name="birthplace">
            <Input
              readOnly={!isEditing}
              style={{ cursor: isEditing ? "text" : "default" }}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item label="Gender" name="gender">
            <Select
              disabled={!isEditing}
              style={{ cursor: isEditing ? "pointer" : "default" }}
            >
              <Select.Option value="Female">Female</Select.Option>
              <Select.Option value="Male">Male</Select.Option>
              <Select.Option value="Other">Other</Select.Option>
              <Select.Option value="Prefer not to say">
                Prefer not to say
              </Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item label="Phone Number" name="phoneNumber">
            <Input
              readOnly={!isEditing}
              style={{ cursor: isEditing ? "text" : "default" }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item label="Primary Email" name="primaryEmail">
            <Input
              readOnly={!isEditing}
              style={{ cursor: isEditing ? "text" : "default" }}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item label="Additional Email(s)" name="additionalEmails">
            <Input
              readOnly={!isEditing}
              style={{ cursor: isEditing ? "text" : "default" }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="sameAsPrimary" valuePropName="checked">
            <Checkbox disabled={!isEditing}>
              Same as primary account holder
            </Checkbox>
          </Form.Item>
        </Col>
      </Row>
    </>
  );

  const emergencyContactsPanel = (
    <>
      <Row gutter={16}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item label="Primary Contact" name="primaryContact">
            <Input
              readOnly={!isEditing}
              style={{ cursor: isEditing ? "text" : "default" }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item label="Phone" name="primaryContactPhone">
            <Input
              readOnly={!isEditing}
              style={{ cursor: isEditing ? "text" : "default" }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item label="Secondary Contact" name="secondaryContact">
            <Input
              readOnly={!isEditing}
              style={{ cursor: isEditing ? "text" : "default" }}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item label="Phone" name="secondaryContactPhone">
            <Input
              readOnly={!isEditing}
              style={{ cursor: isEditing ? "text" : "default" }}
            />
          </Form.Item>
        </Col>
      </Row>
    </>
  );

  const identificationPanel = (
    <>
      <Alert
        message="🔒 Sensitive Information - Access restricted to guardians only"
        type="warning"
        style={{ marginBottom: 16 }}
      />
      <Row gutter={16}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item label="Social Security Number" name="ssn">
            <Input.Password
              readOnly={!isEditing}
              style={{ cursor: isEditing ? "text" : "default" }}
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
              addonAfter={
                <Upload
                  showUploadList={false}
                  customRequest={(options) =>
                    handleDocumentUpload(options, "Social Security Number")
                  }
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                >
                  <Button
                    type="text"
                    icon={<UploadOutlined />}
                    size="small"
                    loading={uploading === "Social Security Number"}
                    style={{
                      border: "none",
                      backgroundColor: "transparent",
                      color: "#1677ff",
                      padding: "0 4px",
                      height: "24px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  />
                </Upload>
              }
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item label="Birth Certificate Number" name="birthCertNumber">
            <Input.Password
              readOnly={!isEditing}
              style={{ cursor: isEditing ? "text" : "default" }}
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
              addonAfter={
                <Upload
                  showUploadList={false}
                  customRequest={(options) =>
                    handleDocumentUpload(options, "Birth Certificate")
                  }
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                >
                  <Button
                    type="text"
                    icon={<UploadOutlined />}
                    size="small"
                    loading={uploading === "Birth Certificate"}
                    style={{
                      border: "none",
                      backgroundColor: "transparent",
                      color: "#1677ff",
                      padding: "0 4px",
                      height: "24px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  />
                </Upload>
              }
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item label="State ID Number" name="stateId">
            <Input
              readOnly={!isEditing}
              style={{ cursor: isEditing ? "text" : "default" }}
              suffix={
                <Upload
                  showUploadList={false}
                  customRequest={(options) =>
                    handleDocumentUpload(options, "State ID")
                  }
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                >
                  <Button
                    type="text"
                    icon={<UploadOutlined />}
                    size="small"
                    loading={uploading === "State ID"}
                    style={{
                      border: "none",
                      backgroundColor: "transparent",
                      color: "#1677ff",
                      padding: "0 4px",
                      height: "24px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  />
                </Upload>
              }
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item label="Passport Number" name="passport">
            <Input
              readOnly={!isEditing}
              style={{ cursor: isEditing ? "text" : "default" }}
              suffix={
                <Upload
                  showUploadList={false}
                  customRequest={(options) =>
                    handleDocumentUpload(options, "Passport")
                  }
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                >
                  <Button
                    type="text"
                    icon={<UploadOutlined />}
                    size="small"
                    loading={uploading === "Passport"}
                    style={{
                      border: "none",
                      backgroundColor: "transparent",
                      color: "#1677ff",
                      padding: "0 4px",
                      height: "24px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  />
                </Upload>
              }
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item label="Driver's License" name="license">
            <Input
              readOnly={!isEditing}
              style={{ cursor: isEditing ? "text" : "default" }}
              suffix={
                <Upload
                  showUploadList={false}
                  customRequest={(options) =>
                    handleDocumentUpload(options, "Driver's License")
                  }
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                >
                  <Button
                    type="text"
                    icon={<UploadOutlined />}
                    size="small"
                    loading={uploading === "Driver's License"}
                    style={{
                      border: "none",
                      backgroundColor: "transparent",
                      color: "#1677ff",
                      padding: "0 4px",
                      height: "24px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  />
                </Upload>
              }
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item label="Student ID" name="studentId">
            <Input
              readOnly={!isEditing}
              style={{ cursor: isEditing ? "text" : "default" }}
              suffix={
                <Upload
                  showUploadList={false}
                  customRequest={(options) =>
                    handleDocumentUpload(options, "Student ID")
                  }
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                >
                  <Button
                    type="text"
                    icon={<UploadOutlined />}
                    size="small"
                    loading={uploading === "Student ID"}
                    style={{
                      border: "none",
                      backgroundColor: "transparent",
                      color: "#1677ff",
                      padding: "0 4px",
                      height: "24px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  />
                </Upload>
              }
            />
          </Form.Item>
        </Col>
      </Row>
    </>
  );

  const sectionCardStyle: React.CSSProperties = {
    background: "#ffffff",
    borderRadius: "0.75rem",
    boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    overflow: "hidden",
    transition: "box-shadow 0.3s",
    height: fullWidth ? "auto" : "500px",
    minHeight: fullWidth ? "400px" : "500px",
    display: "flex",
    flexDirection: "column",
  };

  const sectionHeaderStyle: React.CSSProperties = {
    padding: "1.25rem",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "linear-gradient(to bottom, #ffffff, #fafbfc)",
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: "1.125rem",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    margin: 0,
  };

  const sectionIconStyle: React.CSSProperties = {
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  };

  const tabContentStyle: React.CSSProperties = {
    padding: "1.5rem",
    maxHeight: fullWidth ? "none" : "340px",
    overflowY: fullWidth ? "visible" : "auto",
    flex: 1,
  };

  return (
    <Card
      style={sectionCardStyle}
      bodyStyle={{
        padding: 0,
        flex: 1,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={sectionHeaderStyle}>
        <h2 style={sectionTitleStyle}>
          <div style={sectionIconStyle}>
            <FileTextOutlined />
          </div>
          <span>Personal Information</span>
        </h2>
        <Button
          type={isEditing ? "primary" : "default"}
          icon={isEditing ? <SaveOutlined /> : <EditOutlined />}
          onClick={handleEditToggle}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            border: isEditing ? "1px solid #1890ff" : "1px solid #d9d9d9",
            backgroundColor: isEditing ? "#1890ff" : "#ffffff",
            color: isEditing ? "#ffffff" : "#000000",
          }}
        >
          {isEditing ? "Save" : "Edit"}
        </Button>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        id="personal-info-form"
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            marginTop: "0.5rem",
          }}
          tabBarStyle={{
            padding: "1rem 1.5rem 0",
            background: "#ffffff",
            margin: 0,
          }}
        >
          <TabPane
            tab={
              <span
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <UserOutlined />
                Basic Information
              </span>
            }
            key="basic"
            style={{ flex: 1 }}
          >
            <div style={tabContentStyle}>{basicInfoPanel}</div>
          </TabPane>

          <TabPane
            tab={
              <span
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <ContactsOutlined />
                Emergency Contacts
              </span>
            }
            key="emergency"
            style={{ flex: 1 }}
          >
            <div style={tabContentStyle}>{emergencyContactsPanel}</div>
          </TabPane>

          <TabPane
            tab={
              <span
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <IdcardOutlined />
                Identification Documents
              </span>
            }
            key="identification"
            style={{ flex: 1 }}
          >
            <div style={tabContentStyle}>{identificationPanel}</div>
          </TabPane>
        </Tabs>
      </Form>
    </Card>
  );
};

export default PersonalInfoSection;
