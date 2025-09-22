'use client';
import React, { useEffect, useState } from 'react';
import { Card, Button, List, Input, Typography, message, Modal } from 'antd';
import { FileTextOutlined, EditOutlined, PlusOutlined, EyeOutlined, DownOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import type { Guideline } from '../right-section';
import { addFamilyGuidelines, getFamilyGuidelines } from '../../../services/family';
import { useGlobalLoading } from '../../../app/loadingContext';

const { Title, Text } = Typography;

interface FamilyGuidelinesCardProps {
    guidelines?: Guideline[];
    setGuidelines: React.Dispatch<React.SetStateAction<Guideline[]>>;
    selectedUser: string;
    localStep: string;
    setLocalStep: (step: string) => void;
    isMobile: boolean;
}

const FamilyGuidelinesCard: React.FC<FamilyGuidelinesCardProps> = ({
    guidelines = [],
    setGuidelines,
    selectedUser,
    localStep,
    setLocalStep,
    isMobile,
}) => {
    const [username, setUsername] = useState<string>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('username') || selectedUser || '';
        }
        return selectedUser || '';
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedUser = localStorage.getItem('username') || selectedUser || '';
            setUsername(storedUser);
        }
    }, [selectedUser]);

    const [newGuideline, setNewGuideline] = useState<Guideline>({
        title: '',
        description: '',
        addedBy: username,
        addedTime: dayjs(),
    });
    const [editGuidelineIndex, setEditGuidelineIndex] = useState<number | null>(null);
    const { loading, setLoading } = useGlobalLoading();
    const [showAllModal, setShowAllModal] = useState<boolean>(false);

    const displayedGuidelines = Array.isArray(guidelines) ? guidelines.slice(0, 2) : [];
    const hasMoreItems = (guidelines ?? []).length > 2;

    useEffect(() => {
        setNewGuideline((prev) => ({
            ...prev,
            addedBy: username,
        }));
    }, [username]);

    const handleAddGuideline = async () => {
        setLoading(true);
        if (!newGuideline.title.trim() || !newGuideline.description.trim() || !username) {
            message.error('Please fill in all guideline fields or ensure you are logged in.');
            setLoading(false);
            return;
        }
        try {
            const response = await addFamilyGuidelines({
                guidelines: {
                    title: newGuideline.title,
                    description: newGuideline.description,
                    addedBy: username,
                    addedTime: dayjs(),
                },
            });
            if (response.status) {
                setGuidelines([
                    ...guidelines,
                    { ...newGuideline, addedBy: username, addedTime: dayjs() },
                ]);
                setNewGuideline({ title: '', description: '', addedBy: username, addedTime: dayjs() });
                setLocalStep('family');
                message.success('Guideline added successfully!');
            } else {
                message.error('Failed to add guideline.');
            }
        } catch (error) {
            console.error('Error adding guideline:', error);
            message.error('An error occurred while adding the guideline.');
        } finally {
            setLoading(false);
        }
    };

    const handleEditGuideline = () => {
        if (!newGuideline.title.trim() || !newGuideline.description.trim() || !username || editGuidelineIndex === null) {
            message.error('Please fill in all guideline fields or ensure you are logged in.');
            return;
        }
        const updatedGuidelines = [...guidelines];
        updatedGuidelines[editGuidelineIndex] = {
            ...newGuideline,
            addedBy: guidelines[editGuidelineIndex].addedBy,
            addedTime: guidelines[editGuidelineIndex].addedTime,
            editedBy: username,
            editedTime: dayjs(),
        };
        setGuidelines(updatedGuidelines);
        setNewGuideline({ title: '', description: '', addedBy: username, addedTime: dayjs() });
        setEditGuidelineIndex(null);
        setLocalStep('family');
        message.success('Guideline updated successfully!');
    };

    const getGuidelines = async () => {
        try {
            const response = await getFamilyGuidelines();
            const { status, payload } = response;
            if (status) {
                setGuidelines(payload.guidelines || []);
            } else {
                console.warn('Failed to fetch guidelines:', response);
                setGuidelines([]);
            }
        } catch (error) {
            console.error('Error fetching guidelines:', error);
            message.error('Failed to fetch family guidelines.');
            setGuidelines([]);
        }
    };

    useEffect(() => {
        getGuidelines();
    }, []);

    const handleEditFromModal = (index: number) => {
        setNewGuideline(guidelines[index]);
        setEditGuidelineIndex(index);
        setLocalStep('editGuideline');
        setShowAllModal(false);
    };

    function getStoredUser(): string {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('username') || '';
        }
        return '';
    }

    return (
        <>
            <Card
                style={{
                    borderRadius: '10px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    marginBottom: '16px',
                    width: '100%',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                    <FileTextOutlined style={{ fontSize: '20px', color: '#13c2c2', marginRight: '10px' }} />
                    <Title level={4} style={{ color: '#13c2c2', margin: 0 }}>
                        Family Guidelines
                    </Title>
                </div>

                <List
                    dataSource={displayedGuidelines}
                    renderItem={(guideline, index) => (
                        <List.Item
                            actions={[
                                <Button
                                    type="link"
                                    icon={<EditOutlined />}
                                    onClick={() => {
                                        setNewGuideline(guideline);
                                        setEditGuidelineIndex(index);
                                        setLocalStep('editGuideline');
                                    }}
                                    style={{ padding: '0', color: '#1890ff' }}
                                    key="edit"
                                >
                                    Edit
                                </Button>,
                            ]}
                            style={{ flexWrap: isMobile ? 'wrap' : 'nowrap' }}
                        >
                            <List.Item.Meta
                                title={<Text style={{ fontSize: '14px' }}>{guideline.title}</Text>}
                                description={
                                    <div>
                                        <Text style={{ fontSize: '12px', color: '#666' }}>{guideline.description}</Text>
                                        <br />
                                        <Text style={{ fontSize: '12px', color: '#666' }}>
                                            Added by {guideline.addedBy} on {dayjs(guideline.addedTime).format('MMM D, YYYY h:mm A')}
                                        </Text>
                                        {guideline.editedBy && guideline.editedTime && (
                                            <>
                                                <br />
                                                <Text style={{ fontSize: '12px', color: '#666' }}>
                                                    Edited by {guideline.editedBy} on {dayjs(guideline.editedTime).format('MMM D, YYYY h:mm A')}
                                                </Text>
                                            </>
                                        )}
                                    </div>
                                }
                            />
                        </List.Item>
                    )}
                />

                {hasMoreItems && (
                    <div style={{ textAlign: 'center', marginTop: '16px', marginBottom: '16px' }}>
                        <Button
                            type="primary"
                            icon={<EyeOutlined />}
                            onClick={() => setShowAllModal(true)}
                            style={{
                                backgroundColor: '#13c2c2',
                                borderColor: '#13c2c2',
                                borderRadius: '20px',
                                padding: '5px 20px',
                                height: 'auto',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}
                        >
                            View All ({guidelines.length} guidelines) <DownOutlined />
                        </Button>
                    </div>
                )}

                <Button
                    type="link"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setNewGuideline({ title: '', description: '', addedBy: getStoredUser(), addedTime: dayjs() });
                        setEditGuidelineIndex(null);
                        setLocalStep('addGuideline');
                    }}
                    style={{ marginTop: '10px', padding: '0', color: '#1890ff', width: isMobile ? '100%' : 'auto' }}
                >
                    Add Guideline
                </Button>

                {(localStep === 'addGuideline' || localStep === 'editGuideline') && (
                    <div style={{ marginTop: '20px', padding: '20px', background: '#fafafa', borderRadius: '5px' }}>
                        <Title level={5}>{localStep === 'addGuideline' ? 'Add Guideline' : 'Edit Guideline'}</Title>
                        <Input
                            placeholder="Guideline Title"
                            value={newGuideline.title}
                            onChange={(e) => setNewGuideline({ ...newGuideline, title: e.target.value })}
                            style={{ marginBottom: '10px', borderRadius: '5px', padding: '10px' }}
                        />
                        <Input.TextArea
                            placeholder="Description"
                            value={newGuideline.description}
                            onChange={(e) => setNewGuideline({ ...newGuideline, description: e.target.value })}
                            style={{ marginBottom: '10px', borderRadius: '5px', padding: '10px' }}
                            rows={4}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: isMobile ? 'wrap' : 'nowrap', gap: '10px' }}>
                            <Button
                                onClick={() => {
                                    setNewGuideline({ title: '', description: '', addedBy: getStoredUser(), addedTime: dayjs() });
                                    setEditGuidelineIndex(null);
                                    setLocalStep('family');
                                }}
                                style={{ borderRadius: '20px', padding: '5px 15px', flex: isMobile ? '1 1 100%' : 'none' }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                loading={loading}
                                onClick={() => (localStep === 'addGuideline' ? handleAddGuideline() : handleEditGuideline())}
                                style={{
                                    borderRadius: '20px',
                                    padding: '5px 15px',
                                    backgroundColor: '#1890ff',
                                    borderColor: '#1890ff',
                                    flex: isMobile ? '1 1 100%' : 'none',
                                }}
                            >
                                {localStep === 'addGuideline' ? 'Add' : 'Save'}
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
            <Modal
                open={showAllModal}
                title={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ fontSize: '20px', color: '#13c2c2', marginRight: '10px' }}>
                            <FileTextOutlined />
                        </div>
                        <div style={{ color: '#13c2c2', fontSize: '18px', fontWeight: 600 }}>
                            All Family Guidelines ({guidelines.length})
                        </div>
                    </div>
                }
                onCancel={() => setShowAllModal(false)}
                footer={null}
                width={isMobile ? '95%' : 800}
                style={{ top: 20 }}
            >
                <List
                    dataSource={guidelines}
                    renderItem={(guideline, index) => (
                        <List.Item
                            actions={[
                                <Button
                                    type="link"
                                    icon={<EditOutlined />}
                                    onClick={() => handleEditFromModal(index)}
                                    style={{ padding: '0', color: '#1890ff' }}
                                    key="edit"
                                >
                                    Edit
                                </Button>,
                            ]}
                            style={{
                                flexWrap: isMobile ? 'wrap' : 'nowrap',
                                padding: '16px',
                                marginBottom: '12px',
                                background: '#fafafa',
                                borderRadius: '8px',
                                border: '1px solid #f0f0f0',
                            }}
                        >
                            <List.Item.Meta
                                title={
                                    <span style={{ fontSize: '16px', fontWeight: 600, color: '#262626' }}>
                                        {guideline.title}
                                    </span>
                                }
                                description={
                                    <div style={{ marginTop: '8px' }}>
                                        <span style={{ fontSize: '14px', color: '#595959', lineHeight: '1.5' }}>
                                            {guideline.description}
                                        </span>
                                        <br />
                                        <div style={{ marginTop: '12px' }}>
                                            <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
                                                Added by <strong>{guideline.addedBy}</strong> on{' '}
                                                {dayjs(guideline.addedTime).format('MMM D, YYYY h:mm A')}
                                            </span>
                                            {guideline.editedBy && guideline.editedTime && (
                                                <>
                                                    <br />
                                                    <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
                                                        Edited by <strong>{guideline.editedBy}</strong> on{' '}
                                                        {dayjs(guideline.editedTime).format('MMM D, YYYY h:mm A')}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                }
                            />
                        </List.Item>
                    )}
                />
            </Modal>
        </>
    );
};

export default React.memo(FamilyGuidelinesCard);