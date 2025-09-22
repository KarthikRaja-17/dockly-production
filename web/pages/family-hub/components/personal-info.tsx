'use client';

import React, { useState, useEffect } from 'react';
import { Form, Input, Typography, Button, Card, Row, Col, Alert, Select, Checkbox, Collapse, Upload, message } from 'antd';
import {
    FileTextOutlined,
    EditOutlined,
    UserOutlined,
    PhoneOutlined,
    HomeOutlined,
    IdcardOutlined,
    ContactsOutlined,
    UploadOutlined
} from '@ant-design/icons';
import { addPersonalInfo, getPersonalInfo, updatePersonalInfo, uploadFamilyDocumentRecordFile } from '../../../services/family';
import type { UploadRequestOption } from 'rc-upload/lib/interface';

const { Title } = Typography;
const { Panel } = Collapse;

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
    isEditing?: boolean;
    onDocumentUploaded?: () => void; // Add callback prop for document upload
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({ 
    memberId, 
    isEditing = false,
    onDocumentUploaded // Receive callback from parent
}) => {
    const [form] = Form.useForm<FormValues>();
    const userId = Array.isArray(memberId) ? memberId[0] : memberId || '';
    const [personalId, setPersonalId] = useState<string | null>(null);
    const [activeKey, setActiveKey] = useState<string | string[]>([]);
    const [uploading, setUploading] = useState<string | null>(null);

    useEffect(() => {
        const fetchPersonalInfo = async () => {
            try {
                if (!userId) return;
                const response = await getPersonalInfo({ userId });
                if (response.status === 1 && response.payload) {
                    form.setFieldsValue(response.payload);
                    setPersonalId(response.payload.id); // save record ID
                }
            } catch (error) {
                console.error('Failed to fetch personal info:', error);
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
                // Edit state is now controlled by parent
            } else {
                console.error('Save failed:', response.message);
            }
        } catch (error) {
            console.error('Failed to save:', error);
        }
    };

    const handleDocumentUpload = async (options: UploadRequestOption, documentType: string) => {
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
                // Call parent callback to refresh documents list
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
            <Row gutter={16}>
                <Col xs={24} sm={12}><Form.Item label="First Name" name="firstName"><Input readOnly={!isEditing} style={{ cursor: isEditing ? 'text' : 'default' }} /></Form.Item></Col>
                <Col xs={24} sm={12}><Form.Item label="Middle Name" name="middleName"><Input readOnly={!isEditing} style={{ cursor: isEditing ? 'text' : 'default' }} /></Form.Item></Col>
            </Row>
            <Row gutter={16}>
                <Col xs={24} sm={12}><Form.Item label="Last Name" name="lastName"><Input readOnly={!isEditing} style={{ cursor: isEditing ? 'text' : 'default' }} /></Form.Item></Col>
                <Col xs={24} sm={12}><Form.Item label="Preferred Name" name="preferredName"><Input readOnly={!isEditing} style={{ cursor: isEditing ? 'text' : 'default' }} /></Form.Item></Col>
            </Row>
            <Row gutter={16}>
                <Col xs={24} sm={12}><Form.Item label="Nickname(s)" name="nicknames"><Input readOnly={!isEditing} style={{ cursor: isEditing ? 'text' : 'default' }} /></Form.Item></Col>
                <Col xs={24} sm={12}><Form.Item label="Relationship" name="relationship"><Input readOnly={!isEditing} style={{ cursor: isEditing ? 'text' : 'default' }} /></Form.Item></Col>
            </Row>
            <Row gutter={16}>
                <Col xs={24} sm={12}><Form.Item label="Date of Birth" name="dateOfBirth"><Input type="date" readOnly={!isEditing} style={{ cursor: isEditing ? 'text' : 'default' }} /></Form.Item></Col>
                <Col xs={24} sm={12}><Form.Item label="Age" name="age"><Input readOnly={!isEditing} style={{ cursor: isEditing ? 'text' : 'default' }} /></Form.Item></Col>
            </Row>
            <Row gutter={16}>
                <Col xs={24} sm={12}><Form.Item label="Birthplace" name="birthplace"><Input readOnly={!isEditing} style={{ cursor: isEditing ? 'text' : 'default' }} /></Form.Item></Col>
                <Col xs={24} sm={12}><Form.Item label="Gender" name="gender">
                    <Select disabled={!isEditing} style={{ cursor: isEditing ? 'pointer' : 'default' }}>
                        <Select.Option value="Female">Female</Select.Option>
                        <Select.Option value="Male">Male</Select.Option>
                        <Select.Option value="Other">Other</Select.Option>
                        <Select.Option value="Prefer not to say">Prefer not to say</Select.Option>
                    </Select>
                </Form.Item></Col>
            </Row>
        </>
    );

    const contactInfoPanel = (
        <>
            <Row gutter={16}>
                <Col xs={24} sm={12}><Form.Item label="Phone Number" name="phoneNumber"><Input readOnly={!isEditing} style={{ cursor: isEditing ? 'text' : 'default' }} /></Form.Item></Col>
                <Col xs={24} sm={12}><Form.Item label="Primary Email" name="primaryEmail"><Input readOnly={!isEditing} style={{ cursor: isEditing ? 'text' : 'default' }} /></Form.Item></Col>
            </Row>
            <Form.Item label="Additional Email(s)" name="additionalEmails"><Input readOnly={!isEditing} style={{ cursor: isEditing ? 'text' : 'default' }} /></Form.Item>
            <Form.Item name="sameAsPrimary" valuePropName="checked">
                <Checkbox disabled={!isEditing}>Same as primary account holder</Checkbox>
            </Form.Item>
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
                <Col xs={24} sm={12}>
                    <Form.Item label="Social Security Number" name="ssn">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Input.Password 
                                readOnly={!isEditing} 
                                style={{ cursor: isEditing ? 'text' : 'default', flex: 1 }} 
                            />
                            <Upload
                                showUploadList={false}
                                customRequest={(options) => handleDocumentUpload(options, "Social Security Number")}
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            >
                                <Button 
                                    icon={<UploadOutlined />}
                                    size="small"
                                    loading={uploading === "Social Security Number"}
                                    style={{ 
                                        backgroundColor: '#f0f0f0',
                                        borderColor: '#d9d9d9',
                                        color: '#595959'
                                    }}
                                />
                            </Upload>
                        </div>
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                    <Form.Item label="Birth Certificate Number" name="birthCertNumber">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Input.Password 
                                readOnly={!isEditing} 
                                style={{ cursor: isEditing ? 'text' : 'default', flex: 1 }} 
                            />
                            <Upload
                                showUploadList={false}
                                customRequest={(options) => handleDocumentUpload(options, "Birth Certificate")}
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            >
                                <Button 
                                    icon={<UploadOutlined />}
                                    size="small"
                                    loading={uploading === "Birth Certificate"}
                                    style={{ 
                                        backgroundColor: '#f0f0f0',
                                        borderColor: '#d9d9d9',
                                        color: '#595959'
                                    }}
                                />
                            </Upload>
                        </div>
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={16}>
                <Col xs={24} sm={12}>
                    <Form.Item label="State ID Number" name="stateId">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Input 
                                readOnly={!isEditing} 
                                style={{ cursor: isEditing ? 'text' : 'default', flex: 1 }} 
                            />
                            <Upload
                                showUploadList={false}
                                customRequest={(options) => handleDocumentUpload(options, "State ID")}
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            >
                                <Button 
                                    icon={<UploadOutlined />}
                                    size="small"
                                    loading={uploading === "State ID"}
                                    style={{ 
                                        backgroundColor: '#f0f0f0',
                                        borderColor: '#d9d9d9',
                                        color: '#595959'
                                    }}
                                />
                            </Upload>
                        </div>
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                    <Form.Item label="Passport Number" name="passport">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Input 
                                readOnly={!isEditing} 
                                style={{ cursor: isEditing ? 'text' : 'default', flex: 1 }} 
                            />
                            <Upload
                                showUploadList={false}
                                customRequest={(options) => handleDocumentUpload(options, "Passport")}
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            >
                                <Button 
                                    icon={<UploadOutlined />}
                                    size="small"
                                    loading={uploading === "Passport"}
                                    style={{ 
                                        backgroundColor: '#f0f0f0',
                                        borderColor: '#d9d9d9',
                                        color: '#595959'
                                    }}
                                />
                            </Upload>
                        </div>
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={16}>
                <Col xs={24} sm={12}>
                    <Form.Item label="Driver's License" name="license">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Input 
                                readOnly={!isEditing} 
                                style={{ cursor: isEditing ? 'text' : 'default', flex: 1 }} 
                            />
                            <Upload
                                showUploadList={false}
                                customRequest={(options) => handleDocumentUpload(options, "Driver's License")}
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            >
                                <Button 
                                    icon={<UploadOutlined />}
                                    size="small"
                                    loading={uploading === "Driver's License"}
                                    style={{ 
                                        backgroundColor: '#f0f0f0',
                                        borderColor: '#d9d9d9',
                                        color: '#595959'
                                    }}
                                />
                            </Upload>
                        </div>
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                    <Form.Item label="Student ID" name="studentId">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Input 
                                readOnly={!isEditing} 
                                style={{ cursor: isEditing ? 'text' : 'default', flex: 1 }} 
                            />
                            <Upload
                                showUploadList={false}
                                customRequest={(options) => handleDocumentUpload(options, "Student ID")}
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            >
                                <Button 
                                    icon={<UploadOutlined />}
                                    size="small"
                                    loading={uploading === "Student ID"}
                                    style={{ 
                                        backgroundColor: '#f0f0f0',
                                        borderColor: '#d9d9d9',
                                        color: '#595959'
                                    }}
                                />
                            </Upload>
                        </div>
                    </Form.Item>
                </Col>
            </Row>
        </>
    );

    const emergencyContactsPanel = (
        <>
            <Row gutter={16}>
                <Col xs={24} sm={12}><Form.Item label="Primary Contact" name="primaryContact"><Input readOnly={!isEditing} style={{ cursor: isEditing ? 'text' : 'default' }} /></Form.Item></Col>
                <Col xs={24} sm={12}><Form.Item label="Phone" name="primaryContactPhone"><Input readOnly={!isEditing} style={{ cursor: isEditing ? 'text' : 'default' }} /></Form.Item></Col>
            </Row>
            <Row gutter={16}>
                <Col xs={24} sm={12}><Form.Item label="Secondary Contact" name="secondaryContact"><Input readOnly={!isEditing} style={{ cursor: isEditing ? 'text' : 'default' }} /></Form.Item></Col>
                <Col xs={24} sm={12}><Form.Item label="Phone" name="secondaryContactPhone"><Input readOnly={!isEditing} style={{ cursor: isEditing ? 'text' : 'default' }} /></Form.Item></Col>
            </Row>
        </>
    );

    return (
        <Card
            title={
                <span>
                    <FileTextOutlined style={{ marginRight: 8 }} /> Personal Information
                </span>
            }
            style={{ borderRadius: 12 }}
        >
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Collapse
                    activeKey={activeKey}
                    onChange={setActiveKey}
                    accordion
                    style={{ backgroundColor: 'transparent', border: 'none' }}
                >
                    <Panel
                        header={
                            <span>
                                <UserOutlined style={{ marginRight: 8 }} />
                                Basic Information
                            </span>
                        }
                        key="basic"
                        style={{ marginBottom: 16 }}
                    >
                        {basicInfoPanel}
                    </Panel>

                    <Panel
                        header={
                            <span>
                                <PhoneOutlined style={{ marginRight: 8 }} />
                                Contact Information
                            </span>
                        }
                        key="contact"
                        style={{ marginBottom: 16 }}
                    >
                        {contactInfoPanel}
                    </Panel>

                    <Panel
                        header={
                            <span>
                                <IdcardOutlined style={{ marginRight: 8 }} />
                                Identification Documents
                            </span>
                        }
                        key="identification"
                        style={{ marginBottom: 16 }}
                    >
                        {identificationPanel}
                    </Panel>

                    <Panel
                        header={
                            <span>
                                <ContactsOutlined style={{ marginRight: 8 }} />
                                Emergency Contacts
                            </span>
                        }
                        key="emergency"
                        style={{ marginBottom: 16 }}
                    >
                        {emergencyContactsPanel}
                    </Panel>
                </Collapse>

                {isEditing && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                        <Button type="primary" htmlType="submit" style={{ borderRadius: 6, padding: '4px 24px' }}>
                            Save Changes
                        </Button>
                    </div>
                )}
            </Form>
        </Card>
    );
};

export default PersonalInfoSection;