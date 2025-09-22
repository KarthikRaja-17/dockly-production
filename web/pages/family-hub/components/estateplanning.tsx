import React, { useEffect, useState } from 'react';
import { Card, Typography, Button, Upload, message, Space, Tooltip } from 'antd';
import { FileTextOutlined, MedicineBoxOutlined, SafetyOutlined, UploadOutlined, EyeOutlined, PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import { uploadFamilyDocument, getFamilyDocuments } from '../../../services/family';
import { PRIMARY_COLOR } from '../../../app/comman';

const { Title, Text } = Typography;
const FONT_FAMILY = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const categories = [
  { key: 'livingWill', label: 'Living Will / Advance Directive', icon: <MedicineBoxOutlined />, link: 'https://www.doyourownwill.com/living-will/' },
  { key: 'lastWill', label: 'Last Will and Testament', icon: <FileTextOutlined />, link: 'https://www.doyourownwill.com/' },
  { key: 'poa', label: 'Power of Attorney', icon: <SafetyOutlined />, link: 'https://www.doyourownwill.com/power-of-attorney/' },
];

interface EstatePlanningCardProps { onDocumentUploaded?: () => void; }

const EstatePlanningCard: React.FC<EstatePlanningCardProps> = ({ onDocumentUploaded }) => {
  const [uploadedDocuments, setUploadedDocuments] = useState<Record<string, any>>({});
  const [uploadingStates, setUploadingStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (userId) {
          const res = await getFamilyDocuments(userId, 'EstateDocuments');
          if (res.status === 1 && res.payload?.files) {
            const documentsMap: Record<string, any> = {};
            res.payload.files.forEach((file: any) => {
              const fileName = file.name.toLowerCase();
              let category = '';
              if (fileName.includes('living') || fileName.includes('advance') || fileName.includes('directive')) {
                category = 'livingWill';
              } else if (fileName.includes('will') || fileName.includes('testament')) {
                category = 'lastWill';
              } else if (fileName.includes('power') || fileName.includes('attorney') || fileName.includes('poa')) {
                category = 'poa';
              }
              if (category) {
                documentsMap[category] = { fileName: file.name, uploadDate: new Date().toISOString(), url: file.webViewLink };
              }
            });
            setUploadedDocuments(documentsMap);
          }
        }
      } catch (error) {
        console.error('Error loading documents:', error);
      }
    };
    loadDocuments();
  }, []);

  const handleUpload = async (file: File, category: string) => {
    setUploadingStates(prev => ({ ...prev, [category]: true }));
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('hub', 'Family');
      formData.append('docType', 'EstateDocuments');
      formData.append('category', category);
      const res = await uploadFamilyDocument(formData);
      if (res.status === 1 && res.payload?.file?.webViewLink) {
        message.success('Document uploaded successfully');
        setUploadedDocuments(prev => ({ ...prev, [category]: { fileName: file.name, uploadDate: new Date().toISOString(), url: res.payload.file.webViewLink } }));
        if (onDocumentUploaded) onDocumentUploaded();
      } else {
        message.error(res.message || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      message.error('Upload error');
    } finally {
      setUploadingStates(prev => ({ ...prev, [category]: false }));
    }
  };

  const handleCreateNew = (link: string) => window.open(link, '_blank');
  const handleViewDocument = (document: any) => document.url ? window.open(document.url, '_blank') : console.log('No file available to view.');

  return (
    <Card style={{ borderRadius: "8px", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)", height: "399px", display: "flex", flexDirection: "column", overflow: "hidden" ,    marginLeft: -24,marginTop: -23,
    marginRight: -24}}>
      <div style={{ margin: "-24px -24px 12px -24px", padding: "12px 16px", backgroundColor: "#f0f4f8" }}>
        <Title level={5} style={{ margin: 0, fontSize: "18px", fontWeight: 600, fontFamily: FONT_FAMILY, display: "flex", alignItems: "center" }}>📄 Estate Planning</Title>
        <Text type="secondary" style={{ fontSize: "12px", fontFamily: FONT_FAMILY }}>Manage your important legal documents</Text>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "0 8px" }}>
        {categories.map((category, index) => {
          const hasDocument = uploadedDocuments[category.key];
          return (
            <div key={category.key} style={{ padding: "8px", border: "1px solid #e5e7eb", borderRadius: "8px", backgroundColor: "#fafafa", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {category.icon}
                  <div>
                    <Text strong style={{ fontSize: "13px", fontFamily: FONT_FAMILY }}>{index + 1}. {category.label}</Text>
                    {hasDocument && (
                      <div>
                        <Text type="secondary" style={{ fontSize: "11px", fontFamily: FONT_FAMILY, backgroundColor: PRIMARY_COLOR, color: "#fff", padding: "2px 6px", borderRadius: "4px" }}>
                          Uploaded: {hasDocument.fileName}
                        </Text>
                      </div>
                    )}
                  </div>
                </div>
                <Space>
                  {!hasDocument && (
                            <Tooltip title="Create new one">
                              <Button
                                type="default"
                                size="small"
                                icon={<PlusOutlined />}
                                onClick={() => handleCreateNew(category.link)}
                                style={{ fontFamily: FONT_FAMILY }}
                              />
                            </Tooltip>
                          )}
                  {hasDocument ? (
                    <Button type="primary" size="small" icon={<EyeOutlined />} onClick={() => handleViewDocument(hasDocument)} style={{ fontFamily: FONT_FAMILY, backgroundColor: PRIMARY_COLOR, color: "#fff" }}>View</Button>
                  ) : (
                    <Upload showUploadList={false} beforeUpload={(file) => { handleUpload(file, category.key); return false; }} accept=".pdf,.doc,.docx,.txt" disabled={uploadingStates[category.key]}>
                      <Button type="primary" size="small" icon={uploadingStates[category.key] ? <LoadingOutlined /> : <UploadOutlined />} style={{ fontFamily: FONT_FAMILY,backgroundColor:PRIMARY_COLOR }} loading={uploadingStates[category.key]}>
                        {uploadingStates[category.key] ? '' : ''}
                      </Button>
                    </Upload>
                  )}
                </Space>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default EstatePlanningCard;