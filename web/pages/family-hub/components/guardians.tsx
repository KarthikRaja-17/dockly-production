import React, { useEffect, useState } from "react";
import { Card, Progress, Button, Badge, Table, Typography, Row, Col, Modal, Upload, message, Form, Input, Space } from "antd";
import { CheckOutlined, ExportOutlined, PlusOutlined, EyeOutlined, FileTextOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { addBeneficiary, deleteFamilyDocument, getBeneficiaries, getFamilyDocuments, getGuardians, updateBeneficiary, uploadFamilyDocument } from "../../../services/family";
import EstatePlanningCard from "./estateplanning";
import FamilyInviteForm from "../FamilyInviteForm";
import { showNotification } from "../../../utils/notification";
import { PRIMARY_COLOR } from "../../../app/comman";
import FileHub from "../../components/files";

interface DriveFile { id: string; name: string; webViewLink: string; }

const { Title, Text, Paragraph } = Typography;
const FONT_FAMILY = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const GuardianSection: React.FC = () => {
  const [guardians, setGuardians] = useState<any[]>([]);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [editingBeneficiary, setEditingBeneficiary] = useState<any | null>(null);
  const [beneficiaryModalVisible, setBeneficiaryModalVisible] = useState(false);
  const [guardianInviteVisible, setGuardianInviteVisible] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<DriveFile[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    async function fetchGuardians() {
      const uid = localStorage.getItem("userId");
      if (uid) {
        const result = await getGuardians(uid);
        setGuardians(result);
      }
    }
    fetchGuardians();
  }, []);

  useEffect(() => {
    async function fetchData() {
      const userId = localStorage.getItem("userId");
      if (userId) {
        const res = await getBeneficiaries(userId);
        if (res.status === 1) {
          // Format the updated date to mm/dd/yyyy
          const formattedBeneficiaries = res.payload.map((beneficiary: any) => ({
            ...beneficiary,
            updated: new Date(beneficiary.updated).toLocaleDateString('en-US', {
              month: '2-digit',
              day: '2-digit',
              year: 'numeric'
            })
          }));
          setBeneficiaries(formattedBeneficiaries);
        }
      }
    }
    fetchData();
  }, []);

  const fetchFamilyDocs = async () => {
    try {
      const uid = localStorage.getItem("userId");
      const res = await getFamilyDocuments(uid, "EstateDocuments");
      if (res.status === 1) setUploadedDocs(res.payload.files || []);
    } catch (err) {
      console.error("Fetch error", err);
    }
  };

  useEffect(() => {
    fetchFamilyDocs();
  }, []);

  useEffect(() => {
    if (editingBeneficiary && beneficiaryModalVisible) {
      form.setFieldsValue({
        account: editingBeneficiary.account,
        primary_beneficiary: editingBeneficiary.primary_beneficiary,
        secondary_beneficiary: editingBeneficiary.secondary_beneficiary,
      });
    } else if (!editingBeneficiary && beneficiaryModalVisible) {
      form.resetFields();
    }
  }, [editingBeneficiary, beneficiaryModalVisible, form]);

  const handleUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("hub", "Family");
      formData.append("docType", "EstateDocuments");
      const res = await uploadFamilyDocument(formData);
      if (res.status === 1) {
        showNotification("Success", "File uploaded successfully", "success");
        setUploadModalVisible(false);
        fetchFamilyDocs();
        if (onSuccess) onSuccess({}, new XMLHttpRequest());
      } else {
        showNotification("Error", res.message || "Upload failed", "error");
        if (onError) onError(new Error(res.message));
      }
    } catch (err) {
      console.error("Upload error", err);
      showNotification("Error", "Upload failed", "error");
      if (onError) onError(err as Error);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      const res = await deleteFamilyDocument(fileId);
      if (res.status === 1) {
        message.success("File deleted");
        fetchFamilyDocs();
      } else {
        message.error(res.message || "Failed to delete file");
      }
    } catch (err) {
      console.error("Delete error:", err);
      message.error("Error deleting file");
    }
  };

  const getAccessTagColor = (itemKey: string) => {
    switch (itemKey.toLowerCase()) {
      case "home": return { bg: "#fef3c7", text: "#92400e" };
      case "family": return { bg: "#dbeafe", text: "#1e3a8a" };
      case "finance": return { bg: "#fef2f2", text: "#991b1b" };
      case "health": return { bg: "#f3e8ff", text: "#6b21a8" };
      case "fullaccess": case "full": return { bg: "#e0f2fe", text: "#0369a1" };
      default: return { bg: "#e5e7eb", text: "#374151" };
    }
  };

  const cardStyle = {
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    height: "400px",
    display: "flex",
    flexDirection: "column" as const,
    overflow: "hidden",
  };

  const beneficiaryCardStyle = {
    ...cardStyle,
    height: "360px",
  };

  return (
    <div style={{ maxWidth: "100%", margin: "0 auto", padding: "12px", backgroundColor: "#f9fafb", minHeight: "100vh", fontFamily: FONT_FAMILY }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", paddingBottom: "12px", borderBottom: "2px solid #e5e7eb" }}>
        <Title level={2} style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#111827", display: "flex", alignItems: "center", gap: "8px", fontFamily: FONT_FAMILY }}>
          <SafetyCertificateOutlined style={{ fontSize: "22px", color: "#007AFF" }} />
          Guardians & Estate Planning
        </Title>
      </div>
      <Row gutter={[16, 16]} style={{ marginBottom: "20px" }}>
        <Col span={12}>
          <Card style={cardStyle} hoverable>
            <div style={{ margin: "-24px -24px 12px -24px", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f0f4f8" }}>
              <Title level={4} style={{ margin: 0, display: "flex", alignItems: "center", gap: "6px", fontSize: "18px", fontFamily: FONT_FAMILY }}>
                🛡 Guardians & Access Management
              </Title>
              <Button type="primary" icon={<PlusOutlined />} size="small" onClick={() => setGuardianInviteVisible(true)} style={{ borderRadius: "6px", fontSize: "12px", backgroundColor: PRIMARY_COLOR, color: "#fff", fontFamily: FONT_FAMILY }} />
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "0 8px" }}>
              {guardians.map((guardian, index) => (
                <div key={index} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px", marginBottom: "6px", backgroundColor: "#f0f4f8", borderRadius: "6px", border: "1px solid #e5e7eb" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, color: "#111827", fontSize: "13px", fontFamily: FONT_FAMILY }}>{guardian.name}</div>
                    <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "1px", fontFamily: FONT_FAMILY }}>{guardian.relationship}</div>
                  </div>
                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                    {Object.keys(guardian.sharedItems ?? {}).length > 0 ? (
                      Object.keys(guardian.sharedItems).map((itemKey) => (
                        <span key={itemKey} style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "8px", backgroundColor: getAccessTagColor(itemKey).bg, color: getAccessTagColor(itemKey).text, fontWeight: 500, fontFamily: FONT_FAMILY }}>
                          {itemKey.charAt(0).toUpperCase() + itemKey.slice(1)}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "8px", backgroundColor: "#f3f4f6", color: "#9ca3af", fontWeight: 500, fontFamily: FONT_FAMILY }}>No Access</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <Paragraph style={{ fontSize: "12px", color: "#30353f", margin: "12px 0 0 0", lineHeight: 1.5, fontFamily: FONT_FAMILY }}>
              Guardians can access specific areas of your Dockly account in case of emergency. Configure their access levels based on your needs.
            </Paragraph>
          </Card>
        </Col>
        <Col span={12}>
          <Card style={cardStyle} hoverable>
            <EstatePlanningCard onDocumentUploaded={fetchFamilyDocs} />
          </Card>
        </Col>
        <Col span={12}>
          <Card style={beneficiaryCardStyle} hoverable>
            <div style={{ margin: "-24px -24px 12px -24px", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f0f4f8" }}>
              <Title level={4} style={{ margin: 0, fontSize: "18px", fontFamily: FONT_FAMILY }}>💰 Beneficiary Designations</Title>
              <Button type="primary" icon={<PlusOutlined />} size="small" onClick={() => { setEditingBeneficiary(null); setBeneficiaryModalVisible(true); }} style={{ fontFamily: FONT_FAMILY, backgroundColor: PRIMARY_COLOR, color: "#fff" }} />
            </div>
            <Table
              size="middle"
              bordered
              columns={[
                { title: "Account/Policy", dataIndex: "account", width: "25%" },
                { title: "Primary Beneficiary", dataIndex: "primary_beneficiary", width: "25%" },
                { title: "Secondary Beneficiary", dataIndex: "secondary_beneficiary", width: "25%" },
                { title: "Last Updated", dataIndex: "updated", width: "15%" },
                {
                  title: "Action",
                  width: "13%",
                  render: (_, record) => (
                    <Button type="primary" size="small" onClick={() => { setEditingBeneficiary(record); setBeneficiaryModalVisible(true); }} style={{ fontFamily: FONT_FAMILY, backgroundColor: PRIMARY_COLOR, color: "#fff" }}>
                      Edit
                    </Button>
                  ),
                },
              ]}
              dataSource={beneficiaries}
              rowKey="id"
              pagination={false}
              scroll={{ y: 200 }}
              style={{ backgroundColor: "#fff" }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <div>
            <FileHub hubName="Family" title="Additional Estate Documents" />
          </div>
        </Col>
      </Row>
      <Modal open={uploadModalVisible} title="Upload Document to Family Folder" onCancel={() => setUploadModalVisible(false)} footer={null}>
        <Upload.Dragger name="file" customRequest={handleUpload} multiple={false} showUploadList={false}>
          <p className="ant-upload-drag-icon"><FileTextOutlined /></p>
          <p className="ant-upload-text">Click or drag file to upload</p>
          <p className="ant-upload-hint">The file will be uploaded into the Family folder in your Dockly Drive.</p>
        </Upload.Dragger>
      </Modal>
      <Modal open={beneficiaryModalVisible} onCancel={() => { setBeneficiaryModalVisible(false); setEditingBeneficiary(null); form.resetFields(); }} title={editingBeneficiary ? "Edit Beneficiary" : "Add Beneficiary"} footer={null} style={{ top: 20 }}>
        <Form form={form} layout="vertical" onFinish={async (values) => {
          const beneficiary = {
            userId: localStorage.getItem("userId"),
            account: values.account,
            primary_beneficiary: values.primary_beneficiary,
            secondary_beneficiary: values.secondary_beneficiary,
            updated: new Date().toISOString().split("T")[0], // Sending ISO date to server
            addedBy: localStorage.getItem("userId"),
          };
          try {
            // Call addBeneficiary (unchanged functionality as per request)
            if (editingBeneficiary) {
              await updateBeneficiary({ beneficiary: { ...beneficiary, id: editingBeneficiary.id } });
            } else {
              await addBeneficiary({ beneficiary });
            }
            setBeneficiaryModalVisible(false);
            setEditingBeneficiary(null);
            form.resetFields();
            // Refresh beneficiaries list with mm/dd/yyyy format
            const res = await getBeneficiaries(localStorage.getItem("userId")!);
            if (res.status === 1) {
              const formattedBeneficiaries = res.payload.map((beneficiary: any) => ({
                ...beneficiary,
                updated: new Date(beneficiary.updated).toLocaleDateString('en-US', {
                  month: '2-digit',
                  day: '2-digit',
                  year: 'numeric'
                })
              }));
              setBeneficiaries(formattedBeneficiaries);
            }
          } catch (err) {
            console.error("Error adding/updating beneficiary:", err);
            showNotification("Error", "Failed to add/update beneficiary", "error");
          }
        }} style={{ marginTop: "16px", fontFamily: FONT_FAMILY }}>
          <Form.Item name="account" label="Account/Policy" rules={[{ required: true, message: "Please enter account/policy name" }]}>
            <Input placeholder="Enter account or policy name" style={{ fontFamily: FONT_FAMILY }} />
          </Form.Item>
          <Form.Item name="primary_beneficiary" label="Primary Beneficiary" rules={[{ required: true, message: "Please enter primary beneficiary" }]}>
            <Input placeholder="Enter primary beneficiary name" style={{ fontFamily: FONT_FAMILY }} />
          </Form.Item>
          <Form.Item name="secondary_beneficiary" label="Secondary Beneficiary">
            <Input placeholder="Enter secondary beneficiary name" style={{ fontFamily: FONT_FAMILY }} />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Button type="primary" htmlType="submit" style={{ fontFamily: FONT_FAMILY, backgroundColor: PRIMARY_COLOR, color: "#fff" }}>{editingBeneficiary ? "Update Beneficiary" : "Add Beneficiary"}</Button>
          </Form.Item>
        </Form>
      </Modal>
      <FamilyInviteForm visible={guardianInviteVisible} onCancel={() => setGuardianInviteVisible(false)} onSubmit={(formData) => { console.log("Guardian invited:", formData); setGuardianInviteVisible(false); }} isGuardianMode={true} />
    </div>
  );
};

export default GuardianSection;