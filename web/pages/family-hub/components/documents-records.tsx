'use client';

import React, { useState } from 'react';
import { Card, Button, Typography, Space, Modal, Upload, message } from 'antd';
import { FileTextOutlined, PlusOutlined, UploadOutlined, EyeOutlined, DownloadOutlined } from '@ant-design/icons';
import { showNotification } from '../../../utils/notification';

const { Text } = Typography;

interface Document {
    icon: string;
    name: string;
    meta: string;
    bg: string;
    color: string;
    file?: File;
}

const DocumentsRecordsSection: React.FC = () => {
    const [isDocumentModalVisible, setIsDocumentModalVisible] = useState(false);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
    const [documents, setDocuments] = useState<Document[]>([

    ]);

    const handleAddDocument = (file: File) => {
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
        const newDocument: Document = {
            icon: '📄',
            name: file.name,
            meta: `Uploaded ${new Date().toLocaleDateString()} • ${file.name.split('.').pop()?.toUpperCase()} • ${fileSizeMB} MB`,
            bg: '#f3f4f6',
            color: '#374151',
            file: file, // ⬅️ store the actual file
        };
        setDocuments([...documents, newDocument]);
        setIsDocumentModalVisible(false);
        showNotification("Success", "Document uploaded successfully", "success");
        return false;
    };

    const handleViewDocument = (doc: Document) => {
        if (!doc.file) {
            showNotification("Error", "No file available to view.", "error");
            return;
        }
        const fileURL = URL.createObjectURL(doc.file);
        window.open(fileURL, '_blank');
    };

    const handleDownloadDocument = (doc: Document) => {
        if (!doc.file) {
            showNotification("Error", "No file available for download.", "error");
            return;
        }
        const url = URL.createObjectURL(doc.file);
        const link = document.createElement('a');
        link.href = url;
        link.download = doc.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showNotification("Success", `Downloading ${doc.name}`, "success");
    };

    return (
        <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
            <Card
                title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>
                            <FileTextOutlined style={{ marginRight: 8 }} />
                            Documents & Records
                        </span>
                        <Button icon={<PlusOutlined />} onClick={() => setIsDocumentModalVisible(true)}>
                            Add
                        </Button>
                    </div>
                }
            >
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                    {documents.map((doc, i) => (
                        <div
                            key={i}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: 16,
                                border: '1px solid #e5e7eb',
                                borderRadius: 8,
                                backgroundColor: '#fff',
                                flexWrap: 'wrap',
                                gap: 16,
                            }}
                        >
                            <div style={{ display: 'flex', gap: 16, flex: 1, alignItems: 'center', minWidth: 0 }}>
                                <div
                                    style={{
                                        fontSize: 24,
                                        backgroundColor: doc.bg,
                                        color: doc.color,
                                        padding: 12,
                                        borderRadius: '50%',
                                        width: 48,
                                        height: 48,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    {doc.icon}
                                </div>
                                <div style={{ overflow: 'hidden' }}>
                                    <Text strong style={{ fontSize: 14, display: 'block' }} ellipsis>
                                        {doc.name}
                                    </Text>
                                    <Text type="secondary" style={{ fontSize: 12 }} ellipsis>
                                        {doc.meta}
                                    </Text>
                                </div>
                            </div>
                            <Space wrap>
                                <Button icon={<EyeOutlined />} onClick={() => handleViewDocument(doc)}>
                                    View
                                </Button>
                                <Button icon={<DownloadOutlined />} onClick={() => handleDownloadDocument(doc)}>
                                    Download
                                </Button>
                            </Space>
                        </div>
                    ))}
                </Space>
            </Card>

            <Modal
                title="Upload Document"
                open={isDocumentModalVisible}
                onCancel={() => setIsDocumentModalVisible(false)}
                footer={null}
            >
                <Upload
                    beforeUpload={handleAddDocument}
                    accept=".pdf,.jpg,.jpeg,.png"
                    showUploadList={false}
                >
                    <Button icon={<UploadOutlined />}>Select Document</Button>
                </Upload>
            </Modal>

            <Modal
                title={selectedDocument?.name || 'Document Details'}
                open={isViewModalVisible}
                onCancel={() => {
                    setIsViewModalVisible(false);
                    setSelectedDocument(null);
                }}
                footer={null}
            >
                {selectedDocument && (
                    <div style={{ padding: 16 }}>
                        <div style={{ marginBottom: 16 }}>
                            <Text strong>Name:</Text> {selectedDocument.name}
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <Text strong>Details:</Text> {selectedDocument.meta}
                        </div>
                        <div>
                            <Text strong>Preview:</Text>
                            <div
                                style={{
                                    backgroundColor: '#f9fafb',
                                    padding: 16,
                                    borderRadius: 8,
                                    textAlign: 'center',
                                    marginTop: 8,
                                }}
                            >
                                <Text type="secondary">
                                    Placeholder preview for <b>{selectedDocument.name}</b>. Actual file content would be displayed here if stored in a backend.
                                </Text>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default DocumentsRecordsSection;
