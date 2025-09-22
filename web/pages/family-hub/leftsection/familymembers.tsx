'use client';
import React, { useState } from 'react';
import { Card, Button, Avatar, List, Typography, Popconfirm, Modal, Alert } from 'antd';
import { UserOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { FamilyMember } from '../left-section';

const { Title, Text } = Typography;

// Predefined color palette for family members
const memberColors = [
    '#52c41a', // Green
    '#1890ff', // Blue
    '#f5222d', // Red
    '#fa8c16', // Orange
    '#722ed1', // Purple
];

interface FamilyMembersCardProps {
    familyMembers?: FamilyMember[];
    setFamilyMembers: (members: FamilyMember[]) => void;
    setIsModalVisible: (visible: boolean) => void;
    setEditMember: (member: FamilyMember | null) => void;
    onDelete: (uid: string) => void;
    isMobile: boolean;
}

const FamilyMembersCard: React.FC<FamilyMembersCardProps> = ({
    familyMembers = [], // ✅ Default to empty array
    setFamilyMembers,
    setIsModalVisible,
    setEditMember,
    onDelete,
    isMobile,
}) => {

    const [isViewAllModalVisible, setIsViewAllModalVisible] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    const formatPermissions = (permissions: FamilyMember['permissions']) => {
        if (permissions?.type === 'Full Access') {
            return 'Full Access';
        }

        const customPermissions = [
            permissions?.allowAdd && 'Add',
            permissions?.allowEdit && 'Edit',
            permissions?.allowDelete && 'Delete',
            permissions?.allowInvite && 'Invite',
        ].filter(Boolean);

        return customPermissions.join(', ') || 'No Access';
    };

    const formatSharedItems = (sharedItems: FamilyMember['sharedItems']) => {
        const items = Object.entries(sharedItems || {}).flatMap(([category, items]) =>
            Array.isArray(items) ? items.map((item) => `${category}: ${item}`) : []
        );
        return items.length > 0 ? items : ['None'];
    };

    const handleAddMember = () => {
        setIsAdding(true);
        setEditMember(null);
        setIsModalVisible(true);
    };

    const renderFamilyMember = (member: FamilyMember, index: number) => {
        const textColor = isAdding ? '#52c41a' : memberColors[index % memberColors.length];

        return (
            <List.Item
                actions={[
                    <Button
                        key="edit"
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => {
                            setEditMember(member);
                            setIsModalVisible(true);
                        }}
                        style={{ padding: '0', color: '#1890ff' }}
                    >
                        Edit
                    </Button>,
                    <Popconfirm
                        key="delete"
                        title="Are you sure you want to delete this family member?"
                        onConfirm={() => onDelete(member.uid)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                            type="link"
                            icon={<DeleteOutlined />}
                            style={{ padding: '0', color: '#ff4d4f' }}
                        >
                            Delete
                        </Button>
                    </Popconfirm>,
                ]}
                style={{ flexWrap: isMobile ? 'wrap' : 'nowrap', padding: '10px 0' }}
            >
                <List.Item.Meta
                    avatar={
                        <Avatar style={{ backgroundColor: textColor }}>
                            {member.name?.charAt(0).toUpperCase() || <UserOutlined />}
                        </Avatar>
                    }
                    title={
                        <Text strong style={{ fontSize: '14px', color: textColor }}>
                            {member.name}
                        </Text>
                    }
                    description={
                        <div style={{ fontSize: '12px', color: textColor }}>
                            <div>
                                <Text strong>Relationship: </Text>
                                <Text>{member.relationship.replace('❤️', '').replace('👶', '').replace('👴', '')}</Text>
                            </div>
                            <div>
                                <Text strong>Contact: </Text>
                                <Text>{member.phone || member.accessCode || 'N/A'}</Text>
                            </div>
                        </div>
                    }
                />
            </List.Item>
        );
    };

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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <UserOutlined style={{ fontSize: '20px', color: '#1890ff', marginRight: '10px' }} />
                        <Title level={4} style={{ color: '#1890ff', margin: 0 }}>
                            Family Members
                        </Title>
                    </div>
                    <Button
                        type="primary"
                        onClick={handleAddMember}
                        style={{ borderRadius: '20px', padding: '5px 15px' }}
                    >
                        Add Member
                    </Button>
                </div>
                {(familyMembers?.length ?? 0) === 0 && (

                    <div style={{ textAlign: 'center', marginTop: '20px' }}>
                        <div
                            style={{
                                width: '60px',
                                height: '60px',
                                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                                borderRadius: '50%',
                                margin: '20px auto',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <span style={{ fontSize: '30px' }}>👨‍👩‍👧</span>
                        </div>
                        <Text strong style={{ fontSize: '16px' }}>No family members added yet</Text>
                        <p style={{ color: '#666', margin: '10px 0 20px' }}>
                            Add family members to securely share important information like emergency contacts, important documents, and more.
                        </p>
                        <Alert
                            message="Please add a family member to enable adding contacts or schedules."
                            type="warning"
                            showIcon
                            style={{ marginBottom: '10px' }}
                        />
                        <Button
                            type="primary"
                            onClick={handleAddMember}
                            style={{ borderRadius: '20px', padding: '5px 15px' }}
                        >
                            Add Family Member
                        </Button>
                    </div>
                )}
                {(familyMembers?.length ?? 0) > 0 && (

                    <>
                        <List
                            dataSource={(familyMembers ?? []).slice(0, 2)}
                            renderItem={renderFamilyMember}
                        />
                        {(familyMembers?.length ?? 0) > 2 && (

                            <Button
                                type="link"
                                onClick={() => setIsViewAllModalVisible(true)}
                                style={{
                                    padding: '6px 16px',
                                    color: '#fff',
                                    marginTop: '16px',
                                    backgroundColor: 'rgb(32, 7, 250)',
                                    marginLeft: isMobile ? 0 : '200px',
                                    display: 'block',
                                    borderRadius: '20px',
                                    fontWeight: 500,
                                    fontSize: '14px',
                                    width: isMobile ? '100%' : 'fit-content',
                                    textAlign: 'center',
                                }}
                            >
                                <span style={{ padding: '0 4px' }}>View All Family Members ({(familyMembers?.length ?? 0)})</span>
                            </Button>
                        )}
                    </>
                )}
            </Card>
            <Modal
                title={null}
                open={isViewAllModalVisible}
                onCancel={() => setIsViewAllModalVisible(false)}
                footer={null}
                width={isMobile ? '90%' : '600px'}
                styles={{
                    body: {
                        padding: 0,
                        maxHeight: (familyMembers?.length ?? 0) > 5 ? '400px' : 'auto',
                        overflowY: (familyMembers?.length ?? 0) > 5 ? 'auto' : 'visible',
                    }
                }}
            >
                <div
                    style={{
                        position: 'sticky',
                        top: 0,
                        backgroundColor: '#fff',
                        zIndex: 1,
                        padding: '16px 24px',
                        borderBottom: '1px solid #f0f0f0',
                    }}
                >
                    <Title level={4} style={{ margin: 0 }}>
                        All Family Members
                    </Title>
                </div>
                <div style={{ padding: '16px 24px' }}>
                    <List
                        dataSource={familyMembers}
                        renderItem={renderFamilyMember}
                    />
                </div>
            </Modal>
        </>
    );
};

export default React.memo(FamilyMembersCard);