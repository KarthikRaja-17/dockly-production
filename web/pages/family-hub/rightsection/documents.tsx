'use client';
import React, { useState } from 'react';
import { Card, Button, List, Typography, Input, Select, Upload, message } from 'antd';
import {
    FolderOutlined,
    EditOutlined,
    PlusOutlined,
    UploadOutlined,
    EyeOutlined,
    DownloadOutlined,
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { FamilyMember } from './sharedtasks';

const { Title, Text } = Typography;
const { Option } = Select;

interface Document {
    id: string;
    title: string;
    category: string;
    file: UploadFile | null;
    fileUrl?: string;
    uploadedBy: string;
    uploadTime: Dayjs;
    addedBy: string;
    addedTime: Dayjs;
    editedBy?: string;
    editedTime?: Dayjs;
}

interface ImportantDocumentsCardProps {
    documents: Document[];
    setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
    familyMembers: FamilyMember[];
    selectedUser: string;
    setSelectedUser: (user: string) => void;
    localStep: string;
    setLocalStep: (step: string) => void;
    isMobile: boolean;
}

const ImportantDocumentsCard: React.FC<ImportantDocumentsCardProps> = ({
    documents,
    setDocuments,
    familyMembers,
    selectedUser,
    setSelectedUser,
    localStep,
    setLocalStep,
    isMobile,
}) => {
    const [newDocument, setNewDocument] = useState<Document>({
        id: '',
        title: '',
        category: '',
        file: null,
        uploadedBy: selectedUser,
        uploadTime: dayjs(),
        addedBy: selectedUser,
        addedTime: dayjs(),
    });
    const [editDocumentIndex, setEditDocumentIndex] = useState<number | null>(null);

    const uploadProps: UploadProps = {
        beforeUpload: (file) => {
            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
                message.error('File must be smaller than 2MB!');
                return false;
            }
            setNewDocument({
                ...newDocument,
                file: {
                    uid: Date.now().toString(),
                    name: file.name,
                    status: 'done',
                    url: URL.createObjectURL(file),
                    originFileObj: file,
                },
            });
            return false;
        },
        fileList: newDocument.file ? [newDocument.file] : [],
    };

    const handleAddDocument = () => {
        if (!newDocument.title.trim() || !newDocument.category || !newDocument.file || !selectedUser) {
            message.error('Please fill in all fields, upload a file, and select a family member.');
            return;
        }
        const newDoc = {
            ...newDocument,
            id: Date.now().toString(),
            uploadTime: dayjs(),
            addedBy: selectedUser,
            addedTime: dayjs(),
            uploadedBy: selectedUser,
            fileUrl: newDocument.file?.url || newDocument.fileUrl || '',
        };
        setDocuments([...documents, newDoc]);
        setNewDocument({
            id: '',
            title: '',
            category: '',
            file: null,
            uploadedBy: selectedUser,
            uploadTime: dayjs(),
            addedBy: selectedUser,
            addedTime: dayjs(),
        });
        setLocalStep('family');
        message.success('Document added successfully!');
    };

    const handleEditDocument = () => {
        if (!newDocument.title.trim() || !newDocument.category || !selectedUser || editDocumentIndex === null) {
            message.error('Please fill in all fields and select a family member.');
            return;
        }
        const updatedDocuments = [...documents];
        updatedDocuments[editDocumentIndex] = {
            ...newDocument,
            uploadTime: dayjs(),
            editedBy: selectedUser,
            editedTime: dayjs(),
            fileUrl: newDocument.file?.url || newDocument.fileUrl || '',
        };
        setDocuments(updatedDocuments);
        setNewDocument({
            id: '',
            title: '',
            category: '',
            file: null,
            uploadedBy: selectedUser,
            uploadTime: dayjs(),
            addedBy: selectedUser,
            addedTime: dayjs(),
        });
        setEditDocumentIndex(null);
        setLocalStep('family');
        message.success('Document updated successfully!');
    };

    const handleViewDocument = (fileUrl?: string) => {
        if (fileUrl) {
            window.open(fileUrl, '_blank');
        } else {
            message.error('No file available to view.');
        }
    };

    const handleDownloadDocument = (file?: UploadFile | null, title?: string) => {
        if (file && file.url) {
            const link = document.createElement('a');
            link.href = file.url;
            link.download = title || file.name || 'document';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            message.error('No file available to download.');
        }
    };

    return (
        <Card
            style={{
                borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                marginBottom: '16px',
                width: '100%',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <FolderOutlined style={{ fontSize: '20px', color: '#722ed1', marginRight: '10px' }} />
                <Title level={4} style={{ color: '#722ed1', margin: 0 }}>
                    Important Family Documents
                </Title>
            </div>
            <List
                dataSource={documents}
                renderItem={(doc, index) => (
                    <List.Item
                        actions={[
                            <Button
                                type="link"
                                icon={<EditOutlined />}
                                onClick={() => {
                                    setNewDocument(doc);
                                    setEditDocumentIndex(index);
                                    setLocalStep('editDocument');
                                }}
                                style={{ padding: '0', color: '#1890ff' }}
                            >
                                Edit
                            </Button>,
                            doc.fileUrl ? (
                                <>
                                    <Button
                                        type="link"
                                        icon={<EyeOutlined />}
                                        onClick={() => handleViewDocument(doc.fileUrl)}
                                        style={{ padding: '0', color: '#1890ff' }}
                                    >
                                        View
                                    </Button>
                                    <Button
                                        type="link"
                                        icon={<DownloadOutlined />}
                                        onClick={() => handleDownloadDocument(doc.file, doc.title)}
                                        style={{ padding: '0', color: '#1890ff' }}
                                    >
                                        Download
                                    </Button>
                                </>
                            ) : (
                                <Text style={{ fontSize: '12px', color: '#666' }}>No file available</Text>
                            ),
                        ]}
                        style={{ flexWrap: isMobile ? 'wrap' : 'nowrap' }}
                    >
                        <List.Item.Meta
                            title={<Text style={{ fontSize: '14px' }}>{doc.title}</Text>}
                            description={
                                <div>
                                    <Text style={{ fontSize: '12px', color: '#666' }}>{doc.category}</Text>
                                    <br />
                                    <Text style={{ fontSize: '12px', color: '#666' }}>
                                        Uploaded by {doc.uploadedBy} on {doc.uploadTime.format('MMM D, YYYY h:mm A')}
                                    </Text>
                                    <br />
                                    <Text style={{ fontSize: '12px', color: '#666' }}>
                                        Added by {doc.addedBy} on {doc.addedTime.format('MMM D, YYYY h:mm A')}
                                    </Text>
                                    {doc.editedBy && doc.editedTime && (
                                        <>
                                            <br />
                                            <Text style={{ fontSize: '12px', color: '#666' }}>
                                                Edited by {doc.editedBy} on {doc.editedTime.format('MMM D, YYYY h:mm A')}
                                            </Text>
                                        </>
                                    )}
                                </div>
                            }
                        />
                    </List.Item>
                )}
            />
            <Button
                type="link"
                icon={<PlusOutlined />}
                onClick={() => {
                    setNewDocument({
                        id: '',
                        title: '',
                        category: '',
                        file: null,
                        uploadedBy: selectedUser,
                        uploadTime: dayjs(),
                        addedBy: selectedUser,
                        addedTime: dayjs(),
                    });
                    setEditDocumentIndex(null);
                    setLocalStep('addDocument');
                }}
                style={{
                    marginTop: '10px',
                    padding: isMobile ? '0 8px' : '0',
                    color: '#1890ff',
                    fontSize: isMobile ? '16px' : '12px',
                    width: isMobile ? '100%' : 'auto',
                }}
            >
                {isMobile ? 'Add' : 'Add Document'}
            </Button>
            {(localStep === 'addDocument' || localStep === 'editDocument') && (
                <div style={{ marginTop: '20px', padding: '20px', background: '#fafafa', borderRadius: '5px' }}>
                    <Title level={5}>{localStep === 'addDocument' ? 'Add Family Document' : 'Edit Family Document'}</Title>
                    <Input
                        placeholder="Document Title"
                        value={newDocument.title}
                        onChange={(e) => setNewDocument({ ...newDocument, title: e.target.value })}
                        style={{ marginBottom: '10px', borderRadius: '5px', padding: '10px' }}
                    />
                    <Select
                        placeholder="Select Category"
                        value={newDocument.category || undefined}
                        onChange={(value) => setNewDocument({ ...newDocument, category: value })}
                        style={{ width: '100%', marginBottom: '10px', borderRadius: '5px' }}
                    >
                        {[
                            { label: 'Home Management', children: ['Property Information', 'Mortgage & Loans', 'Home Maintenance', 'Utilities', 'Insurance', 'Important Documents', 'others'] },
                            { label: 'Financial Dashboard', children: [] },
                            { label: 'Family Records', children: ['Insurance Information', 'Medical Records'] },
                            { label: 'Travel Planning', children: [] },
                        ]
                            .flatMap((category) => category.children)
                            .filter((child, index, self) => self.indexOf(child) === index)
                            .map((child) => (
                                <Option key={child} value={child}>{child}</Option>
                            ))}
                    </Select>
                    <Upload {...uploadProps}>
                        <Button icon={<UploadOutlined />}
                            style={{ borderRadius: '5px', marginBottom: '10px' }}
                        >
                            Upload File
                        </Button>
                    </Upload>
                    <Select
                        placeholder="Uploaded By"
                        value={selectedUser || undefined}
                        onChange={(value) => {
                            setSelectedUser(value);
                            setNewDocument({ ...newDocument, uploadedBy: value, addedBy: value });
                        }}
                        style={{ width: '100%', marginBottom: '20px', borderRadius: '5px' }}
                    >
                        {familyMembers.map((member) => (
                            <Option key={member.name} value={member.name}>
                                {member.name}
                            </Option>
                        ))}
                    </Select>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
                        {/* Add your form buttons or content here */}
                    </div>
                </div>
            )}
        </Card>
    );
}
export default ImportantDocumentsCard;