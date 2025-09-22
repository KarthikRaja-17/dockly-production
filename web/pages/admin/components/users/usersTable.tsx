'use client';
import React, { useState } from 'react';
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
    Divider,
    Typography,
} from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    MoreOutlined,
    EyeOutlined,
    PlusOutlined,
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
} from '@ant-design/icons';
import {
    PRIMARY_COLOR,
    FONT_FAMILY,
    CustomButton,
} from '../../../../app/comman';
import {
    AddUserPermissions,
    CreateUser,
    DeleteUserPermission,
    GetAllBoards,
    GetAllHubs,
    GetUserMenus,
    SuspendUser,
    UpdateUser,
} from '../../../../services/admin/users';

const { Option } = Select;
const { Title, Text } = Typography;

interface User {
    uid: string;
    user_name: string;
    email: string;
    phone: string;
    role: number;
    role_name: string;
    is_active: number;
    status: string;
    subscription: string;
    avatar: string;
    created_at: string;
    last_login: string;
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

const UsersTable: React.FC<{
    users: User[];
    loading: boolean;
    onUserUpdate: () => void;
    userType: 'app' | 'waitlist';
}> = ({ users, loading, onUserUpdate, userType }) => {
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [permissionsModalVisible, setPermissionsModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [userMenus, setUserMenus] = useState<UserMenus | null>(null);
    const [availableBoards, setAvailableBoards] = useState<any[]>([]);
    const [availableHubs, setAvailableHubs] = useState<any[]>([]);
    const [addForm] = Form.useForm();
    const [editForm] = Form.useForm();

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

    const handleMenuClick = async (key: string, record: User) => {
        switch (key) {
            case 'view':
                setSelectedUser(record);
                setViewModalVisible(true);
                break;
            case 'edit':
                setSelectedUser(record);
                editForm.setFieldsValue({
                    user_name: record.user_name,
                    email: record.email,
                    phone: record.phone,
                    role: record.role,
                });
                setEditModalVisible(true);
                break;
            case 'permissions':
                setSelectedUser(record);
                await fetchUserPermissions(record.uid);
                await fetchAvailableMenus();
                setPermissionsModalVisible(true);
                break;
            case 'delete':
                Modal.confirm({
                    title: 'Suspend User',
                    content: `Are you sure you want to suspend ${record.user_name}?`,
                    okText: 'Yes, Suspend',
                    okType: 'danger',
                    cancelText: 'Cancel',
                    onOk: () => handleSuspendUser(record.uid),
                });
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
                if (selectedUser) {
                    await fetchUserPermissions(selectedUser.uid);
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
        if (!selectedUser) return;

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

            const response = await AddUserPermissions(selectedUser.uid, permissions);
            if (response.data.status === 1) {
                message.success('Permissions added successfully');
                await fetchUserPermissions(selectedUser.uid);
            } else {
                message.error(response.data.message);
            }
        } catch (error) {
            message.error('Failed to add permissions');
        }
        setActionLoading(false);
    };

    const handleSuspendUser = async (uid: string) => {
        setActionLoading(true);
        try {
            const response = await SuspendUser(uid, userType);
            if (response.data.status === 1) {
                message.success('User suspended successfully');
                onUserUpdate();
            } else {
                message.error(response.data.message);
            }
        } catch (error) {
            message.error('Failed to suspend user');
        }
        setActionLoading(false);
    };

    const handleAddUser = async (values: any) => {
        setActionLoading(true);
        try {
            const response = await CreateUser(values, userType);
            if (response.data.status === 1) {
                message.success('User created successfully');
                setAddModalVisible(false);
                addForm.resetFields();
                onUserUpdate();
            } else {
                message.error(response.data.message);
            }
        } catch (error) {
            message.error('Failed to create user');
        }
        setActionLoading(false);
    };

    const handleEditUser = async (values: any) => {
        if (!selectedUser) return;
        setActionLoading(true);
        try {
            const response = await UpdateUser(selectedUser.uid, values, userType);
            if (response.data.status === 1) {
                message.success('User updated successfully');
                setEditModalVisible(false);
                editForm.resetFields();
                onUserUpdate();
            } else {
                message.error(response.data.message);
            }
        } catch (error) {
            message.error('Failed to update user');
        }
        setActionLoading(false);
    };

    const actionMenuItems = (record: User) => {
        if (userType === 'waitlist') {
            return [
                {
                    key: 'view',
                    icon: <EyeOutlined />,
                    label: 'View Details',
                    onClick: () => handleMenuClick('view', record),
                },
            ];
        }

        return [
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
            },
            {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Edit User',
                onClick: () => handleMenuClick('edit', record),
            },
            {
                type: 'divider' as const,
            },
            {
                key: 'delete',
                danger: true,
                label: (
                    <Popconfirm
                        title="Suspend User"
                        description={`Are you sure you want to suspend ${record.user_name}?`}
                        okText="Yes, Suspend"
                        cancelText="Cancel"
                        onConfirm={() => handleSuspendUser(record.uid)}>
                        <span>
                            <DeleteOutlined /> Suspend User
                        </span>
                    </Popconfirm>
                ),
            },
        ];
    };

    const columns = [
        {
            title: 'User',
            dataIndex: 'user',
            key: 'user',
            render: (text: string, record: User) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                        src={record.avatar}
                        size={36}
                        style={{
                            marginRight: '12px',
                            backgroundColor: '#f0f0f0',
                        }}
                        icon={<UserOutlined />}
                    />
                    <div>
                        <div
                            style={{
                                fontWeight: 500,
                                color: '#262626',
                                fontSize: '14px',
                                marginBottom: '2px',
                            }}>
                            {record.user_name}
                        </div>
                        <div
                            style={{
                                fontSize: '12px',
                                color: '#8c8c8c',
                            }}>
                            {record.email}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Role',
            dataIndex: 'role_name',
            key: 'role_name',
            render: (role: string) => (
                <Tag
                    color={
                        role === 'SuperAdmin'
                            ? 'red'
                            : role === 'Developer'
                                ? 'orange'
                                : role === 'PaidMember'
                                    ? 'blue'
                                    : 'default'
                    }
                    style={{ borderRadius: '4px', fontSize: '12px' }}>
                    {role}
                </Tag>
            ),
        },
        {
            title: 'Subscription',
            dataIndex: 'subscription',
            key: 'subscription',
            render: (subscription: string) => (
                <Tag
                    color={
                        subscription === 'Premium'
                            ? 'gold'
                            : subscription === 'Pro'
                                ? PRIMARY_COLOR
                                : 'default'
                    }
                    style={{ borderRadius: '4px', fontSize: '12px' }}>
                    {subscription}
                </Tag>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag
                    color={
                        status === 'Active'
                            ? 'success'
                            : status === 'Suspended'
                                ? 'error'
                                : 'warning'
                    }
                    style={{ borderRadius: '4px', fontSize: '12px' }}>
                    {status}
                </Tag>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (text: any, record: User) => (
                <Dropdown
                    menu={{ items: actionMenuItems(record) }}
                    trigger={['click']}
                    placement="bottomRight">
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
        <>
            <Card
                title={
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '16px',
                            fontWeight: 500,
                            color: '#262626',
                        }}>
                        <UserOutlined
                            style={{ marginRight: '8px', color: PRIMARY_COLOR }}
                        />
                        {userType === 'waitlist' ? 'Waitlist Users' : 'All Users'}
                    </div>
                }
                extra={
                    userType !== 'waitlist' && (
                        <CustomButton
                            onClick={() => setAddModalVisible(true)}
                            label={'Add User'}
                        />
                    )
                }
                style={{
                    borderRadius: '8px',
                    border: '1px solid #e8e8e8',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}
                // bodyStyle={{ padding: '16px' }}
                styles={{
                    body: {
                        padding: '16px',
                    },
                }}>
                <Table
                    columns={columns}
                    dataSource={users}
                    rowKey="uid"
                    loading={loading}
                    size="small"
                    pagination={{
                        pageSize: 8,
                        showSizeChanger: false,
                        showQuickJumper: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
                        size: 'small',
                    }}
                    style={{ fontFamily: FONT_FAMILY }}
                />
            </Card>

            {/* View User Modal */}
            <Modal
                title="User Details"
                open={viewModalVisible}
                onCancel={() => setViewModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setViewModalVisible(false)}>
                        Close
                    </Button>,
                ]}
                width={500}>
                {selectedUser && (
                    <div style={{ padding: '16px 0' }}>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '20px',
                            }}>
                            <Avatar
                                src={selectedUser.avatar}
                                size={64}
                                style={{ marginRight: '16px' }}
                                icon={<UserOutlined />}
                            />
                            <div>
                                <Title level={4} style={{ margin: 0, color: '#262626' }}>
                                    {selectedUser.user_name}
                                </Title>
                                <Text type="secondary" style={{ fontSize: '14px' }}>
                                    {selectedUser.email}
                                </Text>
                                <br />
                                <Tag
                                    color={selectedUser.status === 'Active' ? 'success' : 'error'}
                                    style={{ marginTop: '8px', borderRadius: '4px' }}>
                                    {selectedUser.status}
                                </Tag>
                            </div>
                        </div>

                        <Card size="small" style={{ backgroundColor: '#fafafa' }}>
                            <Row gutter={[16, 12]}>
                                <Col span={12}>
                                    <Text strong style={{ fontSize: '12px', color: '#8c8c8c' }}>
                                        Phone
                                    </Text>
                                    <div style={{ fontSize: '14px', color: '#262626' }}>
                                        {selectedUser.phone || 'N/A'}
                                    </div>
                                </Col>
                                <Col span={12}>
                                    <Text strong style={{ fontSize: '12px', color: '#8c8c8c' }}>
                                        Role
                                    </Text>
                                    <div style={{ fontSize: '14px', color: '#262626' }}>
                                        {selectedUser.role_name}
                                    </div>
                                </Col>
                                <Col span={12}>
                                    <Text strong style={{ fontSize: '12px', color: '#8c8c8c' }}>
                                        Subscription
                                    </Text>
                                    <div style={{ fontSize: '14px', color: '#262626' }}>
                                        {selectedUser.subscription}
                                    </div>
                                </Col>
                                <Col span={12}>
                                    <Text strong style={{ fontSize: '12px', color: '#8c8c8c' }}>
                                        Created
                                    </Text>
                                    <div style={{ fontSize: '14px', color: '#262626' }}>
                                        {new Date(selectedUser.created_at).toLocaleDateString()}
                                    </div>
                                </Col>
                            </Row>
                        </Card>
                    </div>
                )}
            </Modal>

            {/* User Permissions Modal */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <KeyOutlined style={{ marginRight: '8px', color: PRIMARY_COLOR }} />
                        Manage Permissions
                        {selectedUser && (
                            <Tag style={{ marginLeft: '8px', fontSize: '11px' }}>
                                {selectedUser.user_name}
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
                width={700}>
                <div style={{ padding: '16px 0' }}>
                    <UserPermissionsManager
                        userId={selectedUser?.uid}
                        userMenus={userMenus}
                        availableBoards={availableBoards}
                        availableHubs={availableHubs}
                        onRemovePermission={handleRemovePermission}
                        onAddPermissions={handleAddPermissions}
                        loading={actionLoading}
                    />
                </div>
            </Modal>

            {/* Add User Modal */}
            <Modal
                title="Add New User"
                open={addModalVisible}
                onCancel={() => {
                    setAddModalVisible(false);
                    addForm.resetFields();
                }}
                onOk={addForm.submit}
                confirmLoading={actionLoading}
                okText="Create User"
                width={500}
            >
                <Form
                    form={addForm}
                    layout="vertical"
                    onFinish={handleAddUser}
                    size="middle"
                >
                    <Form.Item
                        name="user_name"
                        label="User Name"
                        rules={[{ required: true, message: "Please enter user name" }]}
                        style={{ marginBottom: 20 }}
                    >
                        <Input placeholder="Enter User name" style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: "Please enter email" },
                            { type: "email", message: "Please enter valid email" },
                        ]}
                        style={{ marginBottom: 20 }}
                    >
                        <Input placeholder="Enter email address" style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item
                        name="phone"
                        label="Phone"
                        style={{ marginBottom: 20 }}
                    >
                        <Input placeholder="Enter phone number" style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item
                        name="role"
                        label="Role"
                        rules={[{ required: true, message: "Please select role" }]}
                        style={{ marginBottom: 0 }}
                    >
                        <Select placeholder="Select role" style={{ width: "100%" }}>
                            <Option value={0}>Guest</Option>
                            <Option value={1}>Paid Member</Option>
                            <Option value={2}>Super Admin</Option>
                            <Option value={3}>Developer</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Edit User Modal */}
            <Modal
                title="Edit User"
                open={editModalVisible}
                onCancel={() => {
                    setEditModalVisible(false);
                    editForm.resetFields();
                }}
                onOk={editForm.submit}
                confirmLoading={actionLoading}
                okText="Update User"
                width={400}>
                <Form
                    form={editForm}
                    layout="vertical"
                    onFinish={handleEditUser}
                    size="small">
                    <Form.Item
                        name="user_name"
                        label="Full Name"
                        rules={[{ required: true, message: 'Please enter full name' }]}>
                        <Input placeholder="Enter full name" />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Please enter email' },
                            { type: 'email', message: 'Please enter valid email' },
                        ]}>
                        <Input placeholder="Enter email address" />
                    </Form.Item>
                    <Form.Item name="phone" label="Phone">
                        <Input placeholder="Enter phone number" />
                    </Form.Item>
                    <Form.Item
                        name="role"
                        label="Role"
                        rules={[{ required: true, message: 'Please select role' }]}>
                        <Select placeholder="Select role">
                            <Option value={0}>Guest</Option>
                            <Option value={1}>Paid Member</Option>
                            <Option value={2}>Super Admin</Option>
                            <Option value={3}>Developer</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

// User Permissions Manager Component
const UserPermissionsManager: React.FC<{
    userId: string | undefined;
    userMenus: UserMenus | null;
    availableBoards: any[];
    availableHubs: any[];
    onRemovePermission: (
        id: string,
        userId: any,
        type: 'boards' | 'hubs'
    ) => void;
    onAddPermissions: (permissions: { boards: string[]; hubs: string[] }) => void;
    loading: boolean;
}> = ({
    userId,
    userMenus,
    availableBoards,
    availableHubs,
    onRemovePermission,
    onAddPermissions,
    loading,
}) => {
        const [addPermissionModalVisible, setAddPermissionModalVisible] =
            useState(false);
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
            return availableBoards.filter(
                (board) => !currentBoardIds.includes(board.id)
            );
        };

        const getAvailableHubsOptions = () => {
            if (!userMenus) return availableHubs;
            const currentHubIds = userMenus.hubs.map((h) => h.id);
            return availableHubs.filter((hub) => !currentHubIds.includes(hub.id));
        };

        return (
            <div>
                <div
                    style={{
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
                        onClick={() => setAddPermissionModalVisible(true)}>
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
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            fontSize: '14px',
                                        }}>
                                        <AppstoreOutlined
                                            style={{ marginRight: '6px', color: PRIMARY_COLOR }}
                                        />
                                        Boards ({userMenus.boards.length})
                                    </div>
                                }
                                style={{ backgroundColor: '#fafafa' }}
                                // bodyStyle={{ maxHeight: '300px', overflowY: 'auto' }}
                                styles={{
                                    body: { maxHeight: '300px', overflowY: 'auto' },
                                }}>
                                {userMenus.boards.length > 0 ? (
                                    <Space
                                        direction="vertical"
                                        size="small"
                                        style={{ width: '100%' }}>
                                        {userMenus.boards.map((board) => (
                                            <Card
                                                key={board.id}
                                                size="small"
                                                style={{
                                                    backgroundColor: '#fff',
                                                    border: '1px solid #e8e8e8',
                                                }}
                                                bodyStyle={{ padding: '8px 12px' }}>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                    }}>
                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        <span
                                                            style={{
                                                                color: PRIMARY_COLOR,
                                                                fontSize: '16px',
                                                                marginRight: '8px',
                                                            }}>
                                                            {getIconComponent(board.icon)}
                                                        </span>
                                                        <div>
                                                            <div
                                                                style={{
                                                                    fontSize: '13px',
                                                                    fontWeight: 500,
                                                                    color: '#262626',
                                                                }}>
                                                                {board.title}
                                                            </div>
                                                            <div style={{ fontSize: '11px', color: '#8c8c8c' }}>
                                                                {board.board_name}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        type="text"
                                                        danger
                                                        size="small"
                                                        icon={<DeleteOutlined style={{ fontSize: '12px' }} />}
                                                        onClick={() =>
                                                            onRemovePermission(board.id, userId, 'boards')
                                                        }
                                                        loading={loading}
                                                    />
                                                </div>
                                            </Card>
                                        ))}
                                    </Space>
                                ) : (
                                    <div
                                        style={{
                                            textAlign: 'center',
                                            padding: '20px',
                                            color: '#8c8c8c',
                                        }}>
                                        <AppstoreOutlined
                                            style={{ fontSize: '24px', marginBottom: '8px' }}
                                        />
                                        <div style={{ fontSize: '12px' }}>No board permissions</div>
                                    </div>
                                )}
                            </Card>
                        </Col>

                        {/* Hubs Section */}
                        <Col span={12}>
                            <Card
                                size="small"
                                title={
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            fontSize: '14px',
                                        }}>
                                        <FileTextOutlined
                                            style={{ marginRight: '6px', color: PRIMARY_COLOR }}
                                        />
                                        Hubs ({userMenus.hubs.length})
                                    </div>
                                }
                                style={{ backgroundColor: '#fafafa' }}
                                bodyStyle={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {userMenus.hubs.length > 0 ? (
                                    <Space
                                        direction="vertical"
                                        size="small"
                                        style={{ width: '100%' }}>
                                        {userMenus.hubs.map((hub) => (
                                            <Card
                                                key={hub.id}
                                                size="small"
                                                style={{
                                                    backgroundColor: '#fff',
                                                    border: '1px solid #e8e8e8',
                                                }}
                                                bodyStyle={{ padding: '8px 12px' }}>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                    }}>
                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        <span
                                                            style={{
                                                                color: PRIMARY_COLOR,
                                                                fontSize: '16px',
                                                                marginRight: '8px',
                                                            }}>
                                                            {getIconComponent(hub.icon)}
                                                        </span>
                                                        <div>
                                                            <div
                                                                style={{
                                                                    fontSize: '13px',
                                                                    fontWeight: 500,
                                                                    color: '#262626',
                                                                }}>
                                                                {hub.title}
                                                            </div>
                                                            <div style={{ fontSize: '11px', color: '#8c8c8c' }}>
                                                                {hub.hub_name}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        type="text"
                                                        danger
                                                        size="small"
                                                        icon={<DeleteOutlined style={{ fontSize: '12px' }} />}
                                                        onClick={() =>
                                                            onRemovePermission(hub.id, userId, 'hubs')
                                                        }
                                                        loading={loading}
                                                    />
                                                </div>
                                            </Card>
                                        ))}
                                    </Space>
                                ) : (
                                    <div
                                        style={{
                                            textAlign: 'center',
                                            padding: '20px',
                                            color: '#8c8c8c',
                                        }}>
                                        <FileTextOutlined
                                            style={{ fontSize: '24px', marginBottom: '8px' }}
                                        />
                                        <div style={{ fontSize: '12px' }}>No hub permissions</div>
                                    </div>
                                )}
                            </Card>
                        </Col>
                    </Row>
                ) : (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#8c8c8c' }}>
                        <KeyOutlined style={{ fontSize: '32px', marginBottom: '12px' }} />
                        <div>Loading permissions...</div>
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
                    }}
                    width={600}>
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
                                }}>
                                <Checkbox.Group
                                    value={selectedBoards}
                                    onChange={setSelectedBoards}
                                    style={{ width: '100%' }}>
                                    <Space
                                        direction="vertical"
                                        size="small"
                                        style={{ width: '100%' }}>
                                        {getAvailableBoardsOptions().map((board) => (
                                            <Checkbox
                                                key={board.id}
                                                value={board.id}
                                                style={{ width: '100%' }}>
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    <span
                                                        style={{ marginRight: '6px', color: PRIMARY_COLOR }}>
                                                        {getIconComponent(board.icon)}
                                                    </span>
                                                    <div>
                                                        <div style={{ fontSize: '13px', fontWeight: 500 }}>
                                                            {board.title}
                                                        </div>
                                                        <div style={{ fontSize: '11px', color: '#8c8c8c' }}>
                                                            {board.board_name}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Checkbox>
                                        ))}
                                    </Space>
                                </Checkbox.Group>
                                {getAvailableBoardsOptions().length === 0 && (
                                    <div
                                        style={{
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
                                }}>
                                <Checkbox.Group
                                    value={selectedHubs}
                                    onChange={setSelectedHubs}
                                    style={{ width: '100%' }}>
                                    <Space
                                        direction="vertical"
                                        size="small"
                                        style={{ width: '100%' }}>
                                        {getAvailableHubsOptions().map((hub) => (
                                            <Checkbox
                                                key={hub.id}
                                                value={hub.id}
                                                style={{ width: '100%' }}>
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    <span
                                                        style={{ marginRight: '6px', color: PRIMARY_COLOR }}>
                                                        {getIconComponent(hub.icon)}
                                                    </span>
                                                    <div>
                                                        <div style={{ fontSize: '13px', fontWeight: 500 }}>
                                                            {hub.title}
                                                        </div>
                                                        <div style={{ fontSize: '11px', color: '#8c8c8c' }}>
                                                            {hub.hub_name}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Checkbox>
                                        ))}
                                    </Space>
                                </Checkbox.Group>
                                {getAvailableHubsOptions().length === 0 && (
                                    <div
                                        style={{
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
                            }}>
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

export default UsersTable;
