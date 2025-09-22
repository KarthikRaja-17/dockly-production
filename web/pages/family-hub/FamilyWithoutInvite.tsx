
'use client';
import React, { useState, useEffect } from 'react';
import { Modal, Card, Button, Input, Checkbox, Typography, notification, Tag, Divider, message } from 'antd';
import { useParams, useRouter } from 'next/navigation';
import { addFamilyMember, addFamilyMemberWithoutInvite } from '../../services/family';
import { Hubs } from '../../app/comman';
import { showNotification } from '../../utils/notification';
const { Text, Title } = Typography;
import { UserAddOutlined, MailOutlined, UserOutlined, CheckCircleOutlined, SendOutlined, ShareAltOutlined } from '@ant-design/icons';
import { useGlobalLoading } from '../../app/loadingContext';


function validatePhone(phone: string): boolean {
    return /^\d{10,15}$/.test(phone.replace(/\D/g, ''));
}

// Define types
type PermissionState = {
    type: 'Full Access' | 'Custom Access';
    allowAdd?: boolean;
    allowEdit?: boolean;
    allowDelete?: boolean;
    allowInvite?: boolean;
    notify?: boolean;
};

type FormDataState = {
    name: string;
    relationship: string;
    email: string;
    phone: string;
    accessCode: string;
    method: 'Email' | 'Mobile' | 'Access Code';
    permissions: PermissionState;
    sharedItems: { [category: string]: string[] };
};

interface FamilyInviteFormProps {
    visible: boolean;
    onCancel: () => void;
    onSubmit: (formData: FormDataState) => void;
    isEditMode?: boolean;
    initialData?: FormDataState;
    isGuardianMode?: boolean;
}

const FamilyWithoutInviteForm: React.FC<FamilyInviteFormProps> = ({ visible, onCancel, onSubmit, isEditMode = false, initialData, isGuardianMode = false }) => {
    const [step, setStep] = useState<'add' | 'permissions' | 'share' | 'review' | 'sent'>('add');
    const [selectedMethod, setSelectedMethod] = useState<'Email' | 'Mobile' | 'Access Code'>('Email');
    const [formData, setFormData] = useState<FormDataState>(
        initialData || {
            name: '',
            relationship: isGuardianMode ? '🛡 Guardian' : '',
            email: '',
            phone: '',
            accessCode: '',
            method: 'Email',
            permissions: { type: 'Custom Access' },
            sharedItems: {},
        }
    );
    const [pendingMember, setPendingMember] = useState<FormDataState | null>(null);
    const [username, setUsername] = useState<string>('');
    const [systemNotification, setSystemNotification] = useState(null);
    const { loading, setLoading } = useGlobalLoading();
    const router = useRouter();
    const params = useParams();

    useEffect(() => {
        let storedUsername = localStorage.getItem('username') || (params && params.username);
        if (Array.isArray(storedUsername)) {
            storedUsername = storedUsername[0];
        }
        if (storedUsername) {
            setUsername(storedUsername);
        }
    }, [params?.username]);

    useEffect(() => {
        if (!visible) {
            setStep('add');
            setFormData({
                name: '',
                relationship: isGuardianMode ? '🛡 Guardian' : '',
                email: '',
                phone: '',
                accessCode: '',
                method: 'Email',
                permissions: { type: 'Custom Access' },
                sharedItems: {},
            });
            setPendingMember(null);
            setSelectedMethod('Email');
        } else if (isEditMode && initialData) {
            setFormData(initialData);
            setSelectedMethod(initialData.method);
        }
    }, [visible, isEditMode, initialData, isGuardianMode]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    

    const handleSendInvitation = async () => {
        setLoading(true);
        try {
            // Get the current family group ID from localStorage or context
            const currentFamilyGroupId = localStorage.getItem('currentFamilyGroupId') || localStorage.getItem('fuser');
            
            const payload = {
            name: formData.name,
            relationship: formData.relationship,
            permissions: formData.permissions,
            sharedItems: formData.sharedItems,
            username, // from local storage / params
            family_group_id: currentFamilyGroupId
            };

            const response = await addFamilyMemberWithoutInvite(payload);
            const status = response?.status ?? false;

            if (status) {
            onSubmit(formData);
            setPendingMember(formData);
            setStep('sent');
            } else {
            showNotification('Error', response?.message || 'Failed to add member', 'error');
            }
        } catch (error) {
            console.error('Error in handleSendInvitation:', error);
            notification.error({
            message: 'Error Adding Member',
            description: 'Unable to add family member without invite. Please try again.',
            placement: 'topRight',
            duration: 3,
            });
        } finally {
            setLoading(false);
        }
        };

    const isFormValid = () => {
        return !!(
            formData.name &&
            (isGuardianMode || formData.relationship)
        );
    };

    const renderAddForm = () => (
        <div style={{ padding: '0', borderRadius: '12px', overflow: 'hidden' }}>
            {/* Gradient Header */}
            <div
                style={{
                    background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                    padding: '10px 24px',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    borderTopLeftRadius: '1px',
                    borderTopRightRadius: '1px',
                    marginTop: '0px',
                }}
            >
                <UserAddOutlined style={{ fontSize: 20 }} />
                <Title level={4} style={{ color: 'white', margin: 0 }}>
                    {isGuardianMode ? 'Add Guardian' : 'Add Family Member'}
                </Title>
            </div>

            {/* Content */}
            <div style={{ padding: '15px', backgroundColor: '#fff' }}>
                {/* Contact Method Title */}

                <Text type="secondary">Please enter a display name.</Text>
                        <Input
                                    name="name"
                                    placeholder="Display Name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    size="large"
                                    prefix={<UserOutlined />}
                                    style={{ margin: "8px 0 24px", borderRadius: 8, caretColor: "#1890ff" }} // Added caretColor
                                />

                {!isGuardianMode && (
                    <>
                        <Text strong>Select Relationship</Text>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 12, marginBottom: 25 }}>
                            {[
                                { label: 'Spouse/Partner', emoji: '❤' },
                                { label: 'Child', emoji: '😊' },
                                { label: 'Parent', emoji: '🧑‍🤝‍🧑' },
                                { label: 'Guardian', emoji: '🛡' },
                            ].map(({ label, emoji }) => {
                                const fullLabel = `${emoji} ${label}`;
                                return (
                                    <Button
                                        key={fullLabel}
                                        type={formData.relationship === fullLabel ? 'primary' : 'default'}
                                        shape="round"
                                        size="middle"
                                        onClick={() => setFormData({ ...formData, relationship: fullLabel })}
                                        style={{
                                            fontWeight: 500,
                                            borderColor: formData.relationship === fullLabel ? '#3b82f6' : undefined,
                                        }}
                                    >
                                        {fullLabel}
                                    </Button>
                                );
                            })}
                        </div>
                    </>
                )}

                {/* Footer Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                        onClick={onCancel}
                        size="large"
                        shape="round"
                        style={{
                            borderRadius: 8,
                            padding: '6px 24px',
                            fontWeight: 500,
                            background: '#fff',
                            border: '1px solid #d9d9d9',
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        size="large"
                        shape="round"
                        disabled={!isFormValid()}
                        onClick={handleSendInvitation}
                        style={{
                            background: 'linear-gradient(90deg,rgb(141, 138, 200)rgb(155, 116, 244)6)',
                            border: 'none',
                            padding: '6px 24px',
                            fontWeight: 500,
                        }}
                    >
                        Continue
                    </Button>
                </div>
            </div>
        </div>
    );

    const renderSent = () => (
        <div style={{ textAlign: 'center', padding: '10px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>Invitation Sent!</h3>
            <p style={{ marginBottom: '20px' }}>
                An invitation has been sent to {pendingMember?.name || 'the family member'}.
            </p>
            <Button
                type="primary"
                onClick={() => {
                    console.log('Done clicked, closing modal');
                    onCancel(); // Close the modal
                }}
                style={{ borderRadius: '20px', padding: '5px 15px', backgroundColor: '#1890ff', borderColor: '#1890ff' }}
            >
                Done
            </Button>
        </div>
    );


    return (
        <Modal
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={600}
            centered
            style={{
                borderRadius: '12px',
                padding: 0,
                caretColor: "transparent"
            }}
            styles={{
                body: {
                    padding: 24,
                    borderRadius: '0 0 12px 12px',
                    maxHeight: '70vh',
                    overflowY: 'auto',
                    background: '#fff',
                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                    caretColor: "transparent"
                },
            }}
        >
            {step === 'add' && renderAddForm()}
            {step === 'sent' && renderSent()}
        </Modal>
    );
};

export default FamilyWithoutInviteForm;