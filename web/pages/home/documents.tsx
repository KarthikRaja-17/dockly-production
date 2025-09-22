'use client';

import React, { useEffect, useState } from 'react';
import { Card, Button, List, Modal, Form, Upload, Typography, message, Space, Avatar } from 'antd';
import { UploadOutlined, DeleteOutlined, FileOutlined } from '@ant-design/icons';
import { deleteHomeDocument, getHomeDocuments, uploadHomeDocument } from '../../services/home';

const { Text } = Typography;
const { Item: FormItem } = Form;

interface Document {
    id: string;
    name: string;
    webViewLink: string;
}

interface Props {
    isMobile: boolean;
}

const Documents: React.FC<Props> = ({ isMobile }) => {
    // Initialize with default data
    const [documentsData, setDocumentsData] = useState<Document[]>([
        {
            id: '1',
            name: 'Sample_Document_1.pdf',
            webViewLink: 'https://example.com/sample1.pdf',
        },
        {
            id: '2',
            name: 'Meeting_Notes.docx',
            webViewLink: 'https://example.com/meeting_notes.docx',
        },
        {
            id: '3',
            name: 'Project_Plan.txt',
            webViewLink: 'https://example.com/project_plan.txt',
        },
    ]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const res = await getHomeDocuments();
            if (res.status === 1) {
                setDocumentsData(res.payload.files || []);
            }
        } catch (err) {
            console.error(err);
            // Optionally keep default data if fetch fails
            message.error('Failed to fetch documents, displaying default data');
        }
    };

    const handleUpload = async () => {
        const values = await form.validateFields();
        const file = values.file.file as File;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('hub', 'Home');

        try {
            const res = await uploadHomeDocument(formData);
            if (res.status === 1) {
                message.success('File uploaded successfully');
                setIsModalOpen(false);
                form.resetFields();
                fetchDocuments();
            } else {
                message.error(res.message || 'Upload failed');
            }
        } catch (err) {
            message.error('Upload error');
            console.error(err);
        }
    };

    const handleDelete = async (fileId: string) => {
        try {
            const res = await deleteHomeDocument(fileId);
            if (res.status === 1) {
                message.success('File deleted');
                fetchDocuments();
            } else {
                message.error(res.message);
            }
        } catch (err) {
            message.error('Delete error');
            console.error(err);
        }
    };

    return (
        <Card
            title={
                <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: '16px', fontWeight: 600, color: '#000', margin: 0 }}>📄 Documents</Text>
                    <Button
                        type="text"
                        onClick={() => setIsModalOpen(true)}
                        icon={<UploadOutlined />}
                        style={{ color: '#000', padding: '4px 8px' }}
                    />
                </Space>
            }
            style={{
                borderRadius: '8px',
                border: '1px solid #d9d9d9',
                width: '100%',
                height: '360px',
                marginBottom: '16px',
            }}
            bodyStyle={{ padding: '12px', height: 'calc(100% - 57px)', overflow: 'hidden' }}
            headStyle={{ borderBottom: '1px solid #f0f0f0', minHeight: '57px' }}
        >
            <div style={{ height: '100%', overflowY: 'auto', paddingRight: '4px' }}>
                <List
                    itemLayout="horizontal"
                    dataSource={documentsData}
                    renderItem={(item) => (
                        <List.Item style={{ padding: '6px 0', borderBottom: '1px solid #f5f5f5' }}>
                            <List.Item.Meta
                                avatar={
                                    <Avatar size="small" style={{ backgroundColor: '#000', color: '#fff' }}>
                                        <FileOutlined />
                                    </Avatar>
                                }
                                title={
                                    <a
                                        href={item.webViewLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ fontSize: '13px', fontWeight: 500, color: '#000' }}
                                    >
                                        {item.name}
                                    </a>
                                }
                            />
                            <Button
                                type="text"
                                size="small"
                                icon={<DeleteOutlined />}
                                onClick={() => handleDelete(item.id)}
                                style={{ color: '#666', padding: '2px 6px' }}
                            />
                        </List.Item>
                    )}
                />
            </div>

            <Modal
                title="Upload Document"
                open={isModalOpen}
                onOk={handleUpload}
                onCancel={() => {
                    setIsModalOpen(false);
                    form.resetFields();
                }}
                width={isMobile ? '90%' : 600}
            >
                <Form form={form} layout="vertical">
                    <FormItem
                        name="file"
                        label="Upload Document"
                        rules={[{ required: true, message: 'Please upload a file!' }]}
                    >
                        <Upload
                            beforeUpload={() => false}
                            maxCount={1}
                            accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                        >
                            <Button icon={<UploadOutlined />}>Select File</Button>
                        </Upload>
                    </FormItem>
                </Form>
            </Modal>
        </Card>
    );
};

export default Documents;