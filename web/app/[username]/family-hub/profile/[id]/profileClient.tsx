"use client";

import React, { useEffect, useState } from "react";
import {
  Layout,
  Avatar,
  Button,
  Typography,
  Card,
  Form,
  Row,
  Col,
  Upload,
  message,
} from "antd";
import {
  EditOutlined,
  FileTextOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import {
  getFamilyDocumentRecordFiles,
  getPersonalInfo,
  resolveFamilyMemberUserId,
  uploadFamilyDocumentRecordFile,
} from "../../../../../services/family";

import { downloadDriveFile } from "../../../../../services/files";
import type { UploadRequestOption } from "rc-upload/lib/interface";
import PersonalInfoSection from "../../../../../pages/family-hub/components/personal-info";
import MedicalInfoPage from "../../../../../pages/family-hub/components/medical-info";
import AssetsDevicesSection from "../../../../../pages/family-hub/components/assets-devices";
import SchoolActivities from "../../../../../pages/family-hub/components/school-activities";

const { Title, Text } = Typography;

interface ProfileClientProps {
  memberId?: string;
  onBack?: () => void;
}

interface SchoolActivitiesProps {
  isEditing: boolean;          // ✅ add this line
  // any other props you need
}

const ProfileClient: React.FC<ProfileClientProps> = ({ memberId }) => {
  const [resolvedUserId, setResolvedUserId] = useState<string | null>(null);
  const [resolvedUsername, setResolvedUsername] = useState<string | null>(null);
  const [personalInfo, setPersonalInfo] = useState<any>(null);
  const [localUserName, setLocalUserName] = useState<string | null>(null);
  const [documentRecords, setDocumentRecords] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchResolvedUserId = async () => {
      if (!memberId) {
        // No memberId passed, fallback to localStorage
        const storedUserId = localStorage.getItem("userId");
        const storedUserName = localStorage.getItem("username");
        if (storedUserId) setResolvedUserId(storedUserId);
        if (storedUserName) setResolvedUsername(storedUserName);
        return;
      }

      if (memberId.startsWith("USER")) {
        setResolvedUserId(memberId);
      } else {
        const res = await resolveFamilyMemberUserId(memberId);

        if (res.status === 1) {
          setResolvedUserId(res.payload.userId);
          setResolvedUsername(res.payload.userName);
        } else {
          // If no family member found in backend → fallback
          const storedUserId = localStorage.getItem("userId");
          const storedUserName = localStorage.getItem("username");
          if (storedUserId) setResolvedUserId(storedUserId);
          if (storedUserName) setResolvedUsername(storedUserName);
        }
      }
    };

    fetchResolvedUserId();
  }, [memberId]);

  useEffect(() => {
    const fetchPersonal = async () => {
      if (!resolvedUserId) return;
      const res = await getPersonalInfo({ userId: resolvedUserId });
      if (res.status === 1 && res.payload) {
        setPersonalInfo(res.payload);
      }
    };

    fetchPersonal();
  }, [resolvedUserId]);

  const fetchDocumentRecords = async () => {
    try {
      if (!resolvedUserId) return; // wait until we know which user
      const res = await getFamilyDocumentRecordFiles(resolvedUserId);
      if (res.status === 1) {
        setDocumentRecords(res.payload.files);
      }
    } catch (err) {
      console.error("Failed to fetch documents", err);
    }
  };

  useEffect(() => {
    fetchDocumentRecords();
  }, [resolvedUserId]); // refetch whenever user changes

  const handleUpload = async (options: UploadRequestOption) => {
    const { file, onSuccess, onError } = options;
    const actualFile = file as File;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", actualFile);
      if (resolvedUserId) {
        formData.append("userId", resolvedUserId); // 🔑 tell backend whose Drive
      }

      const res = await uploadFamilyDocumentRecordFile(formData);

      if (res.status === 1) {
        message.success("File uploaded successfully");
        fetchDocumentRecords();
        if (onSuccess) onSuccess({}, new XMLHttpRequest());
      } else {
        message.error(res.message || "Upload failed");
        if (onError) onError(new Error(res.message));
      }
    } catch (err) {
      console.error("Upload error", err);
      if (onError) onError(err as Error);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (item: any) => {
    try {
      const response = await downloadDriveFile({
        fileId: item.id,
        provider: "all",
      });
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = item.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      message.success(`${item.name} downloaded successfully`);
    } catch (error) {
      console.error("Download error:", error);
      message.error(`Failed to download ${item.name}`);
    }
  };

  useEffect(() => {
    const storedName = localStorage.getItem("username");
    if (storedName) {
      setLocalUserName(storedName);
    }
  }, []);

  // Callback function to refresh documents when uploaded from personal info
  const handleDocumentUploaded = () => {
    fetchDocumentRecords();
  };

  return (
    <div style={{ width: "100%" }}>
      <Card
        style={{
          background: "linear-gradient(135deg, #3355ff, #8b5cf6)",
          color: "white",
          border: "none",
          borderRadius: 8,
          marginBottom: 16,
        }}
        bodyStyle={{ padding: 16 }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <Avatar
            size={60}
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(10px)",
              fontSize: 24,
              fontWeight: 600,
            }}
          >
            {(resolvedUsername?.[0] ?? localUserName?.[0] ?? "F").toUpperCase()}
          </Avatar>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Title
              level={3}
              style={{ color: "white", margin: 0, fontSize: 20 }}
            >
              {resolvedUsername ||
                localUserName ||
                personalInfo?.firstName ||
                `${personalInfo?.preferredName ?? ""} ${
                  personalInfo?.lastName ?? ""
                }` ||
                "Family Member"}
            </Title>
            <Text style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: 14 }}>
              {[
                personalInfo?.relationship,
                personalInfo?.dateOfBirth
                  ? `${dayjs().diff(
                      personalInfo.dateOfBirth,
                      "year"
                    )} years old`
                  : null,
                personalInfo?.dateOfBirth
                  ? `Born ${dayjs(personalInfo.dateOfBirth).format(
                      "MMMM D, YYYY"
                    )}`
                  : null,
              ]
                .filter(Boolean)
                .join(" • ")}
            </Text>
          </div>
          <Button
            type={isEditing ? "primary" : "default"}
            icon={<EditOutlined />}
            onClick={() => setIsEditing(!isEditing)}
            style={{
              backgroundColor: isEditing
                ? "rgba(255, 255, 255, 0.2)"
                : "rgba(255, 255, 255, 0.1)",
              borderColor: "rgba(255, 255, 255, 0.3)",
              color: "white",
            }}
          >
            {isEditing ? "Done" : "Edit"}
          </Button>
        </div>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <div
            style={{
              maxHeight: "100%",
              maxWidth: "100%",
              overflowY: "auto",
              padding: "8px",
              border: "1px solid #f0f0f0",
              borderRadius: "8px",
              backgroundColor: "#ffffffff",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {resolvedUserId && (
                <PersonalInfoSection
                  memberId={resolvedUserId}
                  isEditing={isEditing}
                  onDocumentUploaded={handleDocumentUploaded}
                />
              )}
              {resolvedUserId && (
                <MedicalInfoPage
                  memberId={resolvedUserId}
                  isEditing={isEditing}
                />
              )}
            </div>
          </div>
        </Col>

        <Col xs={24} lg={10}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Card
              title={
                <span>
                  <FileTextOutlined style={{ marginRight: 8 }} /> 
                  Documents & Records
                </span>
              }
              extra={
                <Upload showUploadList={false} customRequest={handleUpload}>
                  <Button
                    type="text"
                    icon={<PlusOutlined />}
                    size="small"
                    style={{ color: "#1890ff" }}
                    loading={uploading}
                  />
                </Upload>
              }
              style={{ borderRadius: 8 }}
              bodyStyle={{ padding: 12 }}
              headStyle={{ padding: "8px 16px", minHeight: "auto" }}
            >
              <div
                style={{
                  marginBottom: "8px",
                  maxHeight: "200px",
                  overflowY: "auto",
                  paddingRight: "2px",
                }}
              >
                {documentRecords.length > 0 ? (
                  documentRecords.map((doc, index) => {
                    const ext = doc.name.split(".").pop();
                    const iconMap: Record<string, string> = {
                      pdf: "📄",
                      jpg: "📷",
                      jpeg: "📷",
                      png: "🖼",
                      docx: "📝",
                      txt: "📃",
                      default: "📁",
                    };
                    const icon = iconMap[ext?.toLowerCase()] || iconMap.default;

                    return (
                      <div
                        key={index}
                        style={{
                          padding: "8px",
                          borderBottom:
                            index < documentRecords.length - 1
                              ? "1px solid #f0f0f0"
                              : "none",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <div style={{ fontSize: 16 }}>{icon}</div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 12 }}>
                                {doc.name}
                              </div>
                              <div style={{ fontSize: 10, color: "#6b7280" }}>
                                Uploaded{" "}
                                {dayjs(doc.modifiedTime).format("MMM D, YYYY")}{" "}
                                • {(doc.size / 1024 / 1024).toFixed(1)} MB
                              </div>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 4 }}>
                            <Button
                              size="small"
                              style={{ fontSize: 10, padding: "2px 6px" }}
                              onClick={() =>
                                window.open(doc.webViewLink, "_blank")
                              }
                            >
                              View
                            </Button>
                            <Button
                              size="small"
                              style={{ fontSize: 10, padding: "2px 6px" }}
                              onClick={() => handleDownload(doc)}
                            >
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ padding: 8, color: "#6b7280", fontSize: 12 }}>
                    No documents uploaded yet.
                  </div>
                )}
              </div>
            </Card>

            {resolvedUserId && (
              <AssetsDevicesSection memberId={resolvedUserId} />
            )}
            <SchoolActivities/>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default ProfileClient;