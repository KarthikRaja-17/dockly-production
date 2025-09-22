'use client';
import React, { useState, useEffect } from 'react';
import {
    Card,
    Table,
    Tag,
    Button,
    Space,
    Avatar,
    Dropdown,
    Modal,
    Form,
    Input,
    Select,
    message,
    Popconfirm,
    Checkbox,
    Row,
    Col,
    Typography,
    Spin,
} from 'antd';
import {
    EyeOutlined,
    MoreOutlined,
    UserOutlined,
    KeyOutlined,
    TeamOutlined,
    AppstoreOutlined,
    FileTextOutlined,
    IdcardOutlined,
    LockOutlined,
    FolderOpenOutlined,
    HomeOutlined,
    DollarOutlined,
    HeartOutlined,
    DeleteOutlined,
    PlusOutlined,
    SettingOutlined,
} from '@ant-design/icons';
import { getUsersFamilyMembers } from '../../../services/family';
import {
    AddUserPermissions,
    DeleteUserPermission,
    GetAllBoards,
    GetAllHubs,
    GetUserMenus,
} from '../../../services/admin/users'; // Assuming you have these services

const { Title, Text } = Typography;

interface FamilyMember {
    id: string;
    user_id: string;
    name: string;
    email: string;
    relationship: string;
    sharedItems: any;
    permissions: any;
    color: string;
}

interface Permission {
    id: string;
    title: string;
    is_active: boolean;
    display_order: number;
    icon: string;
    board_name?: string;
    hub_name?: string;
}

interface UserMenus {
    boards: Permission[];
    hubs: Permission[];
}

const ManageAccess: React.FC = () => {
    const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
    const [loading, setLoading] = useState(false);
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [permissionsModalVisible, setPermissionsModalVisible] = useState(false);
    const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
    const [userMenus, setUserMenus] = useState<UserMenus | null>(null);
    const [availableBoards, setAvailableBoards] = useState<any[]>([]);
    const [availableHubs, setAvailableHubs] = useState<any[]>([]);
    const [actionLoading, setActionLoading] = useState(false);

    const PRIMARY_COLOR = '#6366f1';

    useEffect(() => {
        fetchFamilyMembers();
    }, []);

    const fetchFamilyMembers = async () => {
        setLoading(true);
        try {
            const response = await getUsersFamilyMembers({});
            if (response.status === 1) {
                setFamilyMembers(response.payload.members || []);
            } else {
                message.error(response.message);
            }
        } catch (error) {
            message.error('Failed to fetch family members');
        }
        setLoading(false);
    };

    const getIconComponent = (iconName: string) => {
        const icons: { [key: string]: React.ReactNode } = {
            TeamOutlined: <TeamOutlined />,
            DollarOutlined: <DollarOutlined />,
            HomeOutlined: <HomeOutlined />,
            HeartOutlined: <HeartOutlined />,
            FileTextOutlined: <FileTextOutlined />,
            IdcardOutlined: <IdcardOutlined />,
            LockOutlined: <LockOutlined />,
            FolderOpenOutlined: <FolderOpenOutlined />,
            AppstoreOutlined: <AppstoreOutlined />,
        };
        return icons[iconName] || <AppstoreOutlined />;
    };

    const getRelationshipColor = (relationship: string) => {
        const colors: { [key: string]: string } = {
            'me': '#6366f1',
            'spouse': '#ec4899', 
            'son': '#3b82f6',
            'daughter': '#f59e0b',
            'parent': '#10b981',
            'sibling': '#8b5cf6',
            'paid_user': '#6366f1',
        };
        return colors[relationship.toLowerCase()] || '#6b7280';
    };

    const getRelationshipTag = (relationship: string) => {
        const tagColors: { [key: string]: string } = {
            'me': 'blue',
            'spouse': 'magenta',
            'son': 'cyan',
            'daughter': 'orange',
            'parent': 'green',
            'sibling': 'purple',
            'paid_user': 'blue',
        };
        
        return (
            <Tag 
                color={tagColors[relationship.toLowerCase()] || 'default'}
                style={{ 
                    borderRadius: '12px', 
                    fontSize: '11px',
                    fontWeight: 500,
                    textTransform: 'capitalize'
                }}
            >
                {relationship === 'paid_user' ? 'Owner' : relationship}
            </Tag>
        );
    };

    const handleMenuClick = async (key: string, record: FamilyMember) => {
        switch (key) {
            case 'view':
                setSelectedMember(record);
                setViewModalVisible(true);
                break;
            case 'permissions':
                if (!record.user_id) {
                    message.warning('Cannot manage permissions for pending invites');
                    return;
                }
                setSelectedMember(record);
                await fetchUserPermissions(record.user_id);
                await fetchAvailableMenus();
                setPermissionsModalVisible(true);
                break;
        }
    };

    const fetchUserPermissions = async (uid: string) => {
        try {
            const response = await GetUserMenus(uid);
            if (response.data.status === 1) {
                setUserMenus(response.data.payload);
            }
        } catch (error) {
            message.error('Failed to fetch user permissions');
        }
    };

    const fetchAvailableMenus = async () => {
        try {
            const [boardsRes, hubsRes] = await Promise.all([
                GetAllBoards(),
                GetAllHubs(),
            ]);
            setAvailableBoards(boardsRes.data.payload || []);
            setAvailableHubs(hubsRes.data.payload || []);
        } catch (error) {
            message.error('Failed to fetch available menus');
        }
    };

    const handleRemovePermission = async (
        permissionId: string,
        userId: string,
        type: string
    ) => {
        setActionLoading(true);
        try {
            const response = await DeleteUserPermission(permissionId, userId);
            if (response.data.status === 1) {
                message.success('Permission removed successfully');
                if (selectedMember) {
                    await fetchUserPermissions(selectedMember.user_id);
                }
            } else {
                message.error(response.data.message);
            }
        } catch (error) {
            message.error('Failed to remove permission');
        }
        setActionLoading(false);
    };

    const handleAddPermissions = async (selectedPermissions: {
        boards: string[];
        hubs: string[];
    }) => {
        if (!selectedMember) return;

        setActionLoading(true);
        try {
            const permissions = [
                ...selectedPermissions.boards.map((id) => ({
                    target_type: 'boards',
                    target_id: id,
                })),
                ...selectedPermissions.hubs.map((id) => ({
                    target_type: 'hubs',
                    target_id: id,
                })),
            ];

            const response = await AddUserPermissions(selectedMember.user_id, permissions);
            if (response.data.status === 1) {
                message.success('Permissions added successfully');
                await fetchUserPermissions(selectedMember.user_id);
            } else {
                message.error(response.data.message);
            }
        } catch (error) {
            message.error('Failed to add permissions');
        }
        setActionLoading(false);
    };

    const actionMenuItems = (record: FamilyMember) => [
        {
            key: 'view',
            icon: <EyeOutlined />,
            label: 'View Details',
            onClick: () => handleMenuClick('view', record),
        },
        {
            key: 'permissions',
            icon: <KeyOutlined />,
            label: 'Manage Permissions',
            onClick: () => handleMenuClick('permissions', record),
            disabled: !record.user_id,
        },
    ];

    const columns = [
        {
            title: 'Family Member',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: FamilyMember) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                        size={40}
                        style={{
                            backgroundColor: record.color || getRelationshipColor(record.relationship),
                            marginRight: '12px',
                            fontWeight: 600,
                            fontSize: '14px'
                        }}
                        icon={!text ? <UserOutlined /> : null}
                    >
                        {text ? text.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : ''}
                    </Avatar>
                    <div>
                        <div style={{
                            fontWeight: 500,
                            color: '#262626',
                            fontSize: '14px',
                        }}>
                            {record.name}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: (email: string) => (
                <div style={{
                    fontSize: '14px',
                    color: '#262626',
                }}>
                    {email}
                </div>
            ),
        },
        {
            title: 'Relationship',
            dataIndex: 'relationship',
            key: 'relationship',
            render: (relationship: string) => getRelationshipTag(relationship),
        },
        {
            title: 'Status',
            key: 'status',
            render: (text: any, record: FamilyMember) => (
                <Tag
                    color={record.user_id ? 'success' : 'warning'}
                    style={{ borderRadius: '4px', fontSize: '12px' }}
                >
                    {record.user_id ? 'Active' : 'Pending'}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (text: any, record: FamilyMember) => (
                <Dropdown
                    menu={{ items: actionMenuItems(record) }}
                    trigger={['click']}
                    placement="bottomRight"
                >
                    <Button
                        type="text"
                        icon={<MoreOutlined />}
                        size="small"
                        style={{ color: '#8c8c8c' }}
                    />
                </Dropdown>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ 
                backgroundColor: '#fff',
                padding: '24px',
                borderRadius: '12px',
                marginTop: '70px',
                marginBottom: '20px',
                border: '1px solid #e8e8e8',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            backgroundColor: PRIMARY_COLOR,
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '16px'
                        }}>
                            <SettingOutlined style={{ fontSize: '24px', color: '#fff' }} />
                        </div>
                        <div>
                            <Title level={2} style={{ margin: 0, color: '#262626', fontSize: '28px' }}>
                                Access Management
                            </Title>
                            <Text style={{ color: '#8c8c8c', fontSize: '14px' }}>
                                Manage family member permissions and access levels
                            </Text>
                        </div>
                    </div>
                </div>
            </div>

            {/* Family Members Table */}
            <Card
                title={
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '16px',
                        fontWeight: 500,
                        color: '#262626',
                    }}>
                        <TeamOutlined style={{ marginRight: '8px', color: PRIMARY_COLOR }} />
                        Family Members
                    </div>
                }
                style={{
                    borderRadius: '12px',
                    border: '1px solid #e8e8e8',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
            >
                <Table
                    columns={columns}
                    dataSource={familyMembers}
                    rowKey={(record) => record.id || record.email}
                    loading={loading}
                    size="middle"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: false,
                        showQuickJumper: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
                    }}
                    style={{ 
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                    }}
                />
            </Card>

            {/* View Details Modal */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <EyeOutlined style={{ marginRight: '8px', color: PRIMARY_COLOR }} />
                        Member Details
                    </div>
                }
                open={viewModalVisible}
                onCancel={() => setViewModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setViewModalVisible(false)}>
                        Close
                    </Button>,
                ]}
                width={500}
            >
                {selectedMember && (
                    <div style={{ padding: '16px 0' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '20px',
                        }}>
                            <Avatar
                                size={64}
                                style={{
                                    backgroundColor: selectedMember.color || getRelationshipColor(selectedMember.relationship),
                                    marginRight: '16px',
                                    fontSize: '20px',
                                    fontWeight: 600
                                }}
                            >
                                {selectedMember.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </Avatar>
                            <div>
                                <Title level={4} style={{ margin: 0, color: '#262626' }}>
                                    {selectedMember.name}
                                </Title>
                                <Text type="secondary" style={{ fontSize: '14px' }}>
                                    {selectedMember.email}
                                </Text>
                                <br />
                                <div style={{ marginTop: '8px' }}>
                                    {getRelationshipTag(selectedMember.relationship)}
                                    <Tag
                                        color={selectedMember.user_id ? 'success' : 'warning'}
                                        style={{ marginLeft: '8px', borderRadius: '4px' }}
                                    >
                                        {selectedMember.user_id ? 'Active' : 'Pending'}
                                    </Tag>
                                </div>
                            </div>
                        </div>

                        <Card size="small" style={{ backgroundColor: '#fafafa' }}>
                            <Row gutter={[16, 12]}>
                                <Col span={12}>
                                    <Text strong style={{ fontSize: '12px', color: '#8c8c8c' }}>
                                        RELATIONSHIP
                                    </Text>
                                    <div style={{ fontSize: '14px', color: '#262626', textTransform: 'capitalize' }}>
                                        {selectedMember.relationship === 'paid_user' ? 'Owner' : selectedMember.relationship}
                                    </div>
                                </Col>
                                <Col span={12}>
                                    <Text strong style={{ fontSize: '12px', color: '#8c8c8c' }}>
                                        STATUS
                                    </Text>
                                    <div style={{ fontSize: '14px', color: '#262626' }}>
                                        {selectedMember.user_id ? 'Active Member' : 'Pending Invite'}
                                    </div>
                                </Col>
                                <Col span={24}>
                                    <Text strong style={{ fontSize: '12px', color: '#8c8c8c' }}>
                                        EMAIL
                                    </Text>
                                    <div style={{ fontSize: '14px', color: '#262626' }}>
                                        {selectedMember.email}
                                    </div>
                                </Col>
                            </Row>
                        </Card>
                    </div>
                )}
            </Modal>

            {/* Permissions Management Modal */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <KeyOutlined style={{ marginRight: '8px', color: PRIMARY_COLOR }} />
                        Manage Permissions
                        {selectedMember && (
                            <Tag style={{ marginLeft: '8px', fontSize: '11px' }}>
                                {selectedMember.name}
                            </Tag>
                        )}
                    </div>
                }
                open={permissionsModalVisible}
                onCancel={() => {
                    setPermissionsModalVisible(false);
                    setUserMenus(null);
                    setAvailableBoards([]);
                    setAvailableHubs([]);
                }}
                footer={null}
                width={700}
            >
                <div style={{ padding: '16px 0' }}>
                    <UserPermissionsManager
                        userId={selectedMember?.user_id}
                        userMenus={userMenus}
                        availableBoards={availableBoards}
                        availableHubs={availableHubs}
                        onRemovePermission={handleRemovePermission}
                        onAddPermissions={handleAddPermissions}
                        loading={actionLoading}
                        primaryColor={PRIMARY_COLOR}
                    />
                </div>
            </Modal>
        </div>
    );
};

// User Permissions Manager Component
const UserPermissionsManager: React.FC<{
    userId: string | undefined;
    userMenus: UserMenus | null;
    availableBoards: any[];
    availableHubs: any[];
    onRemovePermission: (id: string, userId: any, type: 'boards' | 'hubs') => void;
    onAddPermissions: (permissions: { boards: string[]; hubs: string[] }) => void;
    loading: boolean;
    primaryColor: string;
}> = ({
    userId,
    userMenus,
    availableBoards,
    availableHubs,
    onRemovePermission,
    onAddPermissions,
    loading,
    primaryColor,
}) => {
    const [addPermissionModalVisible, setAddPermissionModalVisible] = useState(false);
    const [selectedBoards, setSelectedBoards] = useState<string[]>([]);
    const [selectedHubs, setSelectedHubs] = useState<string[]>([]);

    const getIconComponent = (iconName: string) => {
        const icons: { [key: string]: React.ReactNode } = {
            TeamOutlined: <TeamOutlined />,
            DollarOutlined: <DollarOutlined />,
            HomeOutlined: <HomeOutlined />,
            HeartOutlined: <HeartOutlined />,
            FileTextOutlined: <FileTextOutlined />,
            IdcardOutlined: <IdcardOutlined />,
            LockOutlined: <LockOutlined />,
            FolderOpenOutlined: <FolderOpenOutlined />,
            AppstoreOutlined: <AppstoreOutlined />,
        };
        return icons[iconName] || <AppstoreOutlined />;
    };

    const handleAddPermissions = () => {
        onAddPermissions({ boards: selectedBoards, hubs: selectedHubs });
        setSelectedBoards([]);
        setSelectedHubs([]);
        setAddPermissionModalVisible(false);
    };

    const getAvailableBoardsOptions = () => {
        if (!userMenus) return availableBoards;
        const currentBoardIds = userMenus.boards.map((b) => b.id);
        return availableBoards.filter((board) => !currentBoardIds.includes(board.id));
    };

    const getAvailableHubsOptions = () => {
        if (!userMenus) return availableHubs;
        const currentHubIds = userMenus.hubs.map((h) => h.id);
        return availableHubs.filter((hub) => !currentHubIds.includes(hub.id));
    };

    if (!userId) {
        return (
            <div style={{ textAlign: 'center', padding: '40px', color: '#8c8c8c' }}>
                <UserOutlined style={{ fontSize: '32px', marginBottom: '12px' }} />
                <div>Cannot manage permissions for pending invites</div>
                <div style={{ fontSize: '12px', marginTop: '4px' }}>
                    Please wait for the member to accept the invitation
                </div>
            </div>
        );
    }

    return (
        <div>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
            }}>
                <Title level={5} style={{ margin: 0, color: '#262626' }}>
                    Current Permissions
                </Title>
                <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => setAddPermissionModalVisible(true)}
                    style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
                >
                    Add Permissions
                </Button>
            </div>

            {userMenus ? (
                <Row gutter={[16, 16]}>
                    {/* Boards Section */}
                    <Col span={12}>
                        <Card
                            size="small"
                            title={
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    fontSize: '14px',
                                }}>
                                    <AppstoreOutlined
                                        style={{ marginRight: '6px', color: primaryColor }}
                                    />
                                    Boards ({userMenus.boards.length})
                                </div>
                            }
                            style={{ backgroundColor: '#fafafa' }}
                        >
                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {userMenus.boards.length > 0 ? (
                                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                        {userMenus.boards.map((board) => (
                                            <Card
                                                key={board.id}
                                                size="small"
                                                style={{
                                                    backgroundColor: '#fff',
                                                    border: '1px solid #e8e8e8',
                                                }}
                                            >
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    padding: '4px 0'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        <span style={{
                                                            color: primaryColor,
                                                            fontSize: '16px',
                                                            marginRight: '8px',
                                                        }}>
                                                            {getIconComponent(board.icon)}
                                                        </span>
                                                        <div>
                                                            <div style={{
                                                                fontSize: '13px',
                                                                fontWeight: 500,
                                                                color: '#262626',
                                                            }}>
                                                                {board.title}
                                                            </div>
                                                            {board.board_name && (
                                                                <div style={{ fontSize: '11px', color: '#8c8c8c' }}>
                                                                    {board.board_name}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Button
                                                        type="text"
                                                        danger
                                                        size="small"
                                                        icon={<DeleteOutlined style={{ fontSize: '12px' }} />}
                                                        onClick={() => onRemovePermission(board.id, userId, 'boards')}
                                                        loading={loading}
                                                    />
                                                </div>
                                            </Card>
                                        ))}
                                    </Space>
                                ) : (
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '20px',
                                        color: '#8c8c8c',
                                    }}>
                                        <AppstoreOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
                                        <div style={{ fontSize: '12px' }}>No board permissions</div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </Col>

                    {/* Hubs Section */}
                    <Col span={12}>
                        <Card
                            size="small"
                            title={
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    fontSize: '14px',
                                }}>
                                    <FileTextOutlined
                                        style={{ marginRight: '6px', color: primaryColor }}
                                    />
                                    Hubs ({userMenus.hubs.length})
                                </div>
                            }
                            style={{ backgroundColor: '#fafafa' }}
                        >
                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {userMenus.hubs.length > 0 ? (
                                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                        {userMenus.hubs.map((hub) => (
                                            <Card
                                                key={hub.id}
                                                size="small"
                                                style={{
                                                    backgroundColor: '#fff',
                                                    border: '1px solid #e8e8e8',
                                                }}
                                            >
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    padding: '4px 0'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        <span style={{
                                                            color: primaryColor,
                                                            fontSize: '16px',
                                                            marginRight: '8px',
                                                        }}>
                                                            {getIconComponent(hub.icon)}
                                                        </span>
                                                        <div>
                                                            <div style={{
                                                                fontSize: '13px',
                                                                fontWeight: 500,
                                                                color: '#262626',
                                                            }}>
                                                                {hub.title}
                                                            </div>
                                                            {hub.hub_name && (
                                                                <div style={{ fontSize: '11px', color: '#8c8c8c' }}>
                                                                    {hub.hub_name}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Button
                                                        type="text"
                                                        danger
                                                        size="small"
                                                        icon={<DeleteOutlined style={{ fontSize: '12px' }} />}
                                                        onClick={() => onRemovePermission(hub.id, userId, 'hubs')}
                                                        loading={loading}
                                                    />
                                                </div>
                                            </Card>
                                        ))}
                                    </Space>
                                ) : (
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '20px',
                                        color: '#8c8c8c',
                                    }}>
                                        <FileTextOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
                                        <div style={{ fontSize: '12px' }}>No hub permissions</div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </Col>
                </Row>
            ) : (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Spin size="large" />
                    <div style={{ marginTop: '12px', color: '#8c8c8c' }}>Loading permissions...</div>
                </div>
            )}

            {/* Add Permissions Modal */}
            <Modal
                title="Add New Permissions"
                open={addPermissionModalVisible}
                onCancel={() => {
                    setAddPermissionModalVisible(false);
                    setSelectedBoards([]);
                    setSelectedHubs([]);
                }}
                onOk={handleAddPermissions}
                confirmLoading={loading}
                okText="Add Selected"
                okButtonProps={{
                    disabled: selectedBoards.length === 0 && selectedHubs.length === 0,
                    style: { backgroundColor: primaryColor, borderColor: primaryColor }
                }}
                width={600}
            >
                <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
                    <Col span={12}>
                        <Title level={5} style={{ fontSize: '14px', color: '#262626' }}>
                            Available Boards
                        </Title>
                        <Card
                            size="small"
                            style={{
                                maxHeight: '250px',
                                overflowY: 'auto',
                                backgroundColor: '#fafafa',
                            }}
                        >
                            <Checkbox.Group
                                value={selectedBoards}
                                onChange={setSelectedBoards}
                                style={{ width: '100%' }}
                            >
                                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                    {getAvailableBoardsOptions().map((board) => (
                                        <Checkbox
                                            key={board.id}
                                            value={board.id}
                                            style={{ width: '100%' }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <span style={{ marginRight: '6px', color: primaryColor }}>
                                                    {getIconComponent(board.icon)}
                                                </span>
                                                <div>
                                                    <div style={{ fontSize: '13px', fontWeight: 500 }}>
                                                        {board.title}
                                                    </div>
                                                    {board.board_name && (
                                                        <div style={{ fontSize: '11px', color: '#8c8c8c' }}>
                                                            {board.board_name}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Checkbox>
                                    ))}
                                </Space>
                            </Checkbox.Group>
                            {getAvailableBoardsOptions().length === 0 && (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '20px',
                                    color: '#8c8c8c',
                                    fontSize: '12px',
                                }}>
                                    All boards are assigned
                                </div>
                            )}
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Title level={5} style={{ fontSize: '14px', color: '#262626' }}>
                            Available Hubs
                        </Title>
                        <Card
                            size="small"
                            style={{
                                maxHeight: '250px',
                                overflowY: 'auto',
                                backgroundColor: '#fafafa',
                            }}
                        >
                            <Checkbox.Group
                                value={selectedHubs}
                                onChange={setSelectedHubs}
                                style={{ width: '100%' }}
                            >
                                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                    {getAvailableHubsOptions().map((hub) => (
                                        <Checkbox
                                            key={hub.id}
                                            value={hub.id}
                                            style={{ width: '100%' }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                <span style={{ marginRight: '6px', color: primaryColor }}>
                                                    {getIconComponent(hub.icon)}
                                                </span>
                                                <div>
                                                    <div style={{ fontSize: '13px', fontWeight: 500 }}>
                                                        {hub.title}
                                                    </div>
                                                    {hub.hub_name && (
                                                        <div style={{ fontSize: '11px', color: '#8c8c8c' }}>
                                                            {hub.hub_name}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Checkbox>
                                    ))}
                                </Space>
                            </Checkbox.Group>
                            {getAvailableHubsOptions().length === 0 && (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '20px',
                                    color: '#8c8c8c',
                                    fontSize: '12px',
                                }}>
                                    All hubs are assigned
                                </div>
                            )}
                        </Card>
                    </Col>
                </Row>

                {selectedBoards.length > 0 || selectedHubs.length > 0 ? (
                    <Card
                        size="small"
                        style={{
                            marginTop: '12px',
                            backgroundColor: '#f0f9ff',
                            border: '1px solid #bae7ff',
                        }}
                    >
                        <Text strong style={{ fontSize: '12px', color: '#0958d9' }}>
                            Selected:
                        </Text>
                        <div style={{ marginTop: '4px' }}>
                            {selectedBoards.length > 0 && (
                                <Tag color="blue">Boards: {selectedBoards.length}</Tag>
                            )}
                            {selectedHubs.length > 0 && (
                                <Tag color="green">Hubs: {selectedHubs.length}</Tag>
                            )}
                        </div>
                    </Card>
                ) : null}
            </Modal>
        </div>
    );
};

export default ManageAccess;