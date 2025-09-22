"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  Upload,
  Button,
  message,
  Table,
  Tooltip,
  Dropdown,
  Avatar,
  Typography,
  Input,
  Select,
  Space,
  Tag,
} from "antd";
import {
  PlusOutlined,
  UploadOutlined,
  FolderOpenOutlined,
  MoreOutlined,
  EyeOutlined,
  DownloadOutlined,
  DeleteOutlined,
  SearchOutlined,
  FilterOutlined,
  UserOutlined,
  PictureOutlined,
  PlayCircleOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  FileZipOutlined,
} from "@ant-design/icons";
import type { UploadRequestOption } from "rc-upload/lib/interface";
import type { MenuProps } from "antd";
import dayjs from "dayjs";
import {
  deleteHubDocumentFile,
  downloadDriveFile,
  getHubDocumentFiles,
  uploadHubDocumentFile,
} from "../../services/files";
import { UploadCloud } from "lucide-react";
import { PRIMARY_COLOR } from "../../app/comman";
import { showNotification } from "../../utils/notification";

const { Text, Title } = Typography;
const { Option } = Select;

const FONT_FAMILY =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

interface FileRecord {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  modifiedTime: string;
  webViewLink: string;
}

interface MemberFiles {
  user_id: string;
  username: string;
  email: string;
  files: FileRecord[];
}

interface FileHubProps {
  hubName: "Home" | "Family" | "Finance" | "Health" | "Planner";
  title?: string;
}

const FileHub: React.FC<FileHubProps> = ({ hubName, title }) => {
  const [documentRecords, setDocumentRecords] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [filesByMember, setFilesByMember] = useState<MemberFiles[]>([]);
  const [searchText, setSearchText] = useState("");
  const [selectedMember, setSelectedMember] = useState<string>("all");

  const fetchDocumentRecords = async () => {
    try {
      const res = await getHubDocumentFiles(hubName);
      if (res.status === 1) {
        setFilesByMember(res.payload.payload?.files_by_member || []);
      }
    } catch (err) {
      console.error("Failed to fetch documents", err);
    }
  };

  useEffect(() => {
    fetchDocumentRecords();
  }, [hubName]);

  const handleUpload = async (options: UploadRequestOption) => {
  const { file, onSuccess, onError } = options;
  const actualFile = file as File;

  try {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", actualFile);

    const res = await uploadHubDocumentFile(hubName, formData);

    if (res.status === 1) {
      showNotification("Success", "File uploaded successfully", "success");
      fetchDocumentRecords();
      if (onSuccess) onSuccess({}, new XMLHttpRequest());
    } else {
      showNotification("Error", res.message || "Upload failed", "error");
      if (onError) onError(new Error(res.message));
    }
  } catch (err) {
    console.error("Upload error", err);
    showNotification("Error", "Upload failed", "error");
    if (onError) onError(err as Error);
  } finally {
    setUploading(false);
  }
};

const handleDownload = async (item: any) => {
  try {
    const response = await downloadDriveFile({
      fileId: item.id,
      provider: "google",
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

    showNotification("Success", `${item.name} downloaded successfully`, "success");
  } catch (error) {
    console.error("Download error:", error);
    showNotification("Error", `Failed to download ${item.name}`, "error");
  }
};

const handleDelete = async (item: any) => {
  try {
    await deleteHubDocumentFile(item.id);
    showNotification("Success", `${item.name} deleted successfully`, "success");
    fetchDocumentRecords();
  } catch {
    showNotification("Error", `Failed to delete ${item.name}`, "error");
  }
};

  const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return <FolderOpenOutlined />;
    if (mimeType.includes("image")) return <PictureOutlined />;
    if (mimeType.includes("video")) return <PlayCircleOutlined />;
    if (mimeType.includes("pdf")) return <FilePdfOutlined />;
    if (mimeType.includes("document")) return <FolderOpenOutlined />;
    if (mimeType.includes("spreadsheet")) return <FileExcelOutlined />;
    if (mimeType.includes("presentation")) return <FilePptOutlined />;
    if (mimeType.includes("zip") || mimeType.includes("archive"))
      return <FileZipOutlined />;
    return <FolderOpenOutlined />;
  };

  const getFileIconColor = (mimeType?: string) => {
    if (!mimeType) return "#5f6368";
    if (mimeType.includes("image")) return "#34a853";
    if (mimeType.includes("video")) return "#ea4335";
    if (mimeType.includes("pdf")) return "#ea4335";
    if (mimeType.includes("document")) return "#4285f4";
    if (mimeType.includes("spreadsheet")) return "#34a853";
    if (mimeType.includes("presentation")) return "#ff9900";
    if (mimeType.includes("zip") || mimeType.includes("archive"))
      return "#9aa0a6";
    return "#5f6368";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Get unique members for filter
  const uniqueMembers = filesByMember.map((member) => ({
    id: member.user_id,
    username: member.username,
    email: member.email,
  }));

  // Flatten files from all members for table display
  const allTableData = filesByMember.flatMap((member: MemberFiles) =>
    member.files
      .filter(
        (file: FileRecord) =>
          file.mimeType !== "application/vnd.google-apps.folder"
      )
      .map((file: FileRecord) => ({
        ...file,
        memberUsername: member.username,
        memberEmail: member.email,
        memberUserId: member.user_id,
        key: `${member.user_id}-${file.id}`,
      }))
  );

  // Apply filters
  const filteredTableData = allTableData.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesMember =
      selectedMember === "all" || item.memberUserId === selectedMember;
    return matchesSearch && matchesMember;
  });

  const getMenuItems = (record: any): MenuProps["items"] => [
    {
      key: "view",
      label: "View",
      icon: <EyeOutlined />,
      onClick: () => window.open(record.webViewLink, "_blank"),
    },
    {
      key: "download",
      label: "Download",
      icon: <DownloadOutlined />,
      onClick: () => handleDownload(record),
    },
    {
      key: "delete",
      label: "Delete",
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => handleDelete(record),
    },
  ];

  const columns = [
    {
      title: "File",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: any) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "8px 0",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
              border: "1px solid #e5e7eb",
              color: getFileIconColor(record.mimeType),
            }}
          >
            {getFileIcon(record.mimeType)}
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: FONT_FAMILY,
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
                color: "#1f2937",
                marginBottom: "2px",
                transition: "color 0.2s ease",
              }}
              onClick={(e) => {
                e.stopPropagation();
                window.open(record.webViewLink, "_blank");
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#2563eb";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#1f2937";
              }}
            >
              {text}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Text
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                  fontFamily: FONT_FAMILY,
                }}
              >
                {formatFileSize(record.size)}
              </Text>
              <div
                style={{
                  width: "2px",
                  height: "2px",
                  borderRadius: "50%",
                  backgroundColor: "#d1d5db",
                }}
              />
              <Text
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                  fontFamily: FONT_FAMILY,
                }}
              >
                {dayjs(record.modifiedTime).format("MMM D, YYYY")}
              </Text>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Owner",
      dataIndex: "memberUsername",
      key: "owner",
      width: 180,
      render: (text: string, record: any) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "8px 0",
          }}
        >
          <Avatar
            size={32}
            style={{
              backgroundColor: "#f3f4f6",
              color: "#374151",
              fontSize: "13px",
              fontWeight: 500,
              border: "2px solid #e5e7eb",
            }}
            icon={<UserOutlined />}
          >
            {text?.charAt(0)?.toUpperCase()}
          </Avatar>
          <div>
            <div
              style={{
                fontFamily: FONT_FAMILY,
                fontSize: "13px",
                fontWeight: 500,
                color: "#1f2937",
                marginBottom: "1px",
              }}
            >
              {text}
            </div>
            <Tooltip title={record.memberEmail}>
              <Text
                style={{
                  fontSize: "11px",
                  color: "#6b7280",
                  fontFamily: FONT_FAMILY,
                }}
              >
                {record.memberEmail.length > 20
                  ? `${record.memberEmail.substring(0, 20)}...`
                  : record.memberEmail}
              </Text>
            </Tooltip>
          </div>
        </div>
      ),
    },
    {
      title: "",
      key: "actions",
      width: 50,
      render: (_: any, record: any) => (
        <Dropdown
          menu={{ items: getMenuItems(record) }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Button
            type="text"
            icon={<MoreOutlined />}
            style={{
              border: "none",
              boxShadow: "none",
              padding: "8px",
              fontFamily: FONT_FAMILY,
              width: "32px",
              height: "32px",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f3f4f6";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <div style={{ fontFamily: FONT_FAMILY }}>
      <Card
        style={{
          padding: 0,
          backgroundColor: "#ffffff",
          width: "100%",
          borderRadius: 16,
          position: "relative",
          height: "360px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)",
          border: "1px solid rgba(0,0,0,0.04)",
          fontFamily: FONT_FAMILY,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        bodyStyle={{
          display: "flex",
          flexDirection: "column",
          padding: "0",
          height: "100%",
        }}
      >
        {/* Compact Header without blue background */}
        <div
          style={{
            background: "#ffffff",
            padding: "12px 20px",
            flexShrink: 0,
            borderRadius: "16px 16px 0 0",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "10px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  backgroundColor:"#2563eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid #e5e7eb",
                }}
              >
                <FolderOpenOutlined
                  style={{ fontSize: "16px", color: "#ffffffff" }}
                />
              </div>
              <div>
                <Title
                  level={3}
                  style={{
                    margin: 0,
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#1f2937",
                    fontFamily: FONT_FAMILY,
                    letterSpacing: "-0.025em",
                  }}
                >
                  {title || `${hubName} Documents`}
                </Title>
                <Text
                  style={{
                    fontSize: "12px",
                    fontFamily: FONT_FAMILY,
                    color: "#6b7280",
                  }}
                >
                  {allTableData.length} documents
                </Text>
              </div>
            </div>

            <Upload showUploadList={false} customRequest={handleUpload}>
              <Button
                type="primary"
                shape="default"
                icon={<UploadOutlined />}
                loading={uploading}
                style={{
                  borderRadius: 6,
                  background: PRIMARY_COLOR,
                  borderColor: PRIMARY_COLOR,
                  fontSize: 16,
                  height: 28,
                  width: 28,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, #6366F1 0%, #1e40af 100%)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(59, 130, 246, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, #6366F1 0%, #1d4ed8 100%)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 8px rgba(59, 130, 246, 0.3)";
                }}
              />
            </Upload>
          </div>

          {/* Filter Bar */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              alignItems: "center",
            }}
          >
            <Input
              placeholder="Search files..."
              prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{
                flex: 1,
                borderRadius: "6px",
                border: "1px solid #d1d5db",
                background: "#ffffff",
                color: "#1f2937",
                fontSize: "13px",
                height: "32px",
                caretColor: "#1f2937",
              }}
            />
            {hubName === "Family" && (
              <Select
                value={selectedMember}
                onChange={setSelectedMember}
                style={{
                  width: 140,
                  height: "32px",
                }}
                dropdownStyle={{
                  borderRadius: "8px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                }}
              >
                <Option value="all">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <FilterOutlined style={{ fontSize: "12px" }} />
                    All Members
                  </div>
                </Option>
                {uniqueMembers.map((member) => (
                  <Option key={member.id} value={member.id}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Avatar size={20} style={{ fontSize: "10px" }}>
                        {member.username?.charAt(0)?.toUpperCase()}
                      </Avatar>
                      {member.username}
                    </div>
                  </Option>
                ))}
              </Select>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div
          style={{
            flex: 1,
            padding: "20px",
            overflowY: "auto",
            background: "#f8fafc",
          }}
        >
          {filteredTableData.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                textAlign: "center",
                padding: "40px 20px",
              }}
            >
              {allTableData.length === 0 ? (
                <div>
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "16px",
                      background:
                        "linear-gradient(135deg, #6366F1 0%,  #463a81ff 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 20px",
                      boxShadow: "0 8px 32px rgba(59, 130, 246, 0.2)",
                    }}
                  >
                    <FolderOpenOutlined
                      style={{ fontSize: "32px", color: "#ffffff" }}
                    />
                  </div>
                  <Title
                    level={4}
                    style={{
                      color: "#374151",
                      fontFamily: FONT_FAMILY,
                      marginBottom: "8px",
                      fontSize: "18px",
                      fontWeight: 600,
                    }}
                  >
                    No documents yet
                  </Title>
                  <Text
                    style={{
                      color: "#6b7280",
                      fontSize: "14px",
                      fontFamily: FONT_FAMILY,
                      marginBottom: "24px",
                      display: "block",
                    }}
                  >
                    Upload your first document to get started
                  </Text>
                  <Upload showUploadList={false} customRequest={handleUpload}>
                    <Button
                      type="primary"
                      icon={<UploadOutlined />}
                      size="large"
                      loading={uploading}
                      style={{
                        borderRadius: "8px",
                        background:
                          "linear-gradient(135deg, #6366F1 0%, #463a81ff 100%)",
                        border: "none",
                        fontSize: "14px",
                        height: "44px",
                        paddingLeft: "20px",
                        paddingRight: "20px",
                        fontWeight: 500,
                        boxShadow: "0 4px 16px rgba(59, 130, 246, 0.3)",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow =
                          "0 6px 20px rgba(59, 130, 246, 0.4)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow =
                          "0 4px 16px rgba(59, 130, 246, 0.3)";
                      }}
                    >
                      Upload Document
                    </Button>
                  </Upload>
                </div>
              ) : (
                <div>
                  <div
                    style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "12px",
                      background: "#f3f4f6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 16px",
                    }}
                  >
                    <SearchOutlined
                      style={{ fontSize: "24px", color: "#9ca3af" }}
                    />
                  </div>
                  <Title
                    level={4}
                    style={{
                      color: "#374151",
                      fontFamily: FONT_FAMILY,
                      marginBottom: "8px",
                      fontSize: "16px",
                      fontWeight: 500,
                    }}
                  >
                    No files match your filters
                  </Title>
                  <Text
                    style={{
                      color: "#6b7280",
                      fontSize: "14px",
                      fontFamily: FONT_FAMILY,
                    }}
                  >
                    Try adjusting your search or filter criteria
                  </Text>
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                background: "#ffffff",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
              }}
            >
              <Table
                dataSource={filteredTableData}
                columns={columns}
                pagination={false}
                size="small"
                showHeader={false}
                style={{
                  fontSize: "14px",
                  fontFamily: FONT_FAMILY,
                }}
                rowClassName={() => "modern-table-row"}
                onRow={(record, index) => ({
                  style: {
                    borderBottom:
                      index === filteredTableData.length - 1
                        ? "none"
                        : "1px solid #f1f5f9",
                    transition: "all 0.2s ease",
                  },
                  onMouseEnter: (e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      "#f1f5f9";
                    (e.currentTarget as HTMLElement).style.transform =
                      "translateX(2px)";
                  },
                  onMouseLeave: (e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "";
                    (e.currentTarget as HTMLElement).style.transform =
                      "translateX(0)";
                  },
                })}
              />
            </div>
          )}
        </div>

        {/* Active Filters Display */}
        {(searchText || selectedMember !== "all") && (
          <div
            style={{
              padding: "10px 20px",
              borderTop: "1px solid #e5e7eb",
              background: "#f9fafb",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            <Text
              style={{
                fontSize: "12px",
                color: "#6b7280",
                fontFamily: FONT_FAMILY,
                fontWeight: 500,
              }}
            >
              Active filters:
            </Text>
            {searchText && (
              <Tag
                closable
                onClose={() => setSearchText("")}
                style={{
                  borderRadius: "6px",
                  border: "1px solid #e5e7eb",
                  background: "#ffffff",
                  color: "#374151",
                  fontSize: "11px",
                  fontFamily: FONT_FAMILY,
                }}
              >
                Search: "{searchText}"
              </Tag>
            )}
            {selectedMember !== "all" && (
              <Tag
                closable
                onClose={() => setSelectedMember("all")}
                style={{
                  borderRadius: "6px",
                  border: "1px solid #e5e7eb",
                  background: "#ffffff",
                  color: "#374151",
                  fontSize: "11px",
                  fontFamily: FONT_FAMILY,
                }}
              >
                Owner:{" "}
                {uniqueMembers.find((m) => m.id === selectedMember)?.username}
              </Tag>
            )}
          </div>
        )}
      </Card>

      <style jsx>{`
        .modern-table-row .ant-table-cell {
          border-bottom: none !important;
          padding: 14px 18px !important;
        }
        .ant-table-tbody > tr:hover > td {
          background: transparent !important;
        }
      `}</style>
    </div>
  );
};

export default FileHub;