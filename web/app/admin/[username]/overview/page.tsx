'use client';
import React, { useState, useEffect } from 'react';
import {
    Row,
    Col,
    Card,
    Statistic,
    Table,
    Progress,
    List,
    Form,
    Input,
    Button,
    Select,
    Badge,
    Tag,
    Typography,
    Space,
    Alert,
    Avatar,
    Tooltip,
    Dropdown
} from 'antd';
import {
    UserOutlined,
    TeamOutlined,
    StopOutlined,
    UserAddOutlined,
    DatabaseOutlined,
    ApiOutlined,
    ExclamationCircleOutlined,
    DollarCircleOutlined,
    PieChartOutlined,
    LineChartOutlined,
    BarChartOutlined,
    // ShieldOutlined,
    LockOutlined,
    DesktopOutlined,
    SoundOutlined,
    SettingOutlined,
    FileTextOutlined,
    // TrendingUpOutlined,
    CalendarOutlined,
    CreditCardOutlined,
    BellOutlined,
    SafetyCertificateOutlined,
    MoreOutlined,
    DeleteOutlined,
    EyeOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const AdminDashboard: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [announcementForm] = Form.useForm();

    // Mock data for dashboard
    const userStats = {
        total_users: 12847,
        active_users: 9634,
        suspended_users: 156,
        new_users: 324
    };

    const storageUsage = [
        { plan: 'Free', used: 45, total: 100, color: '#52c41a' },
        { plan: 'Pro', used: 78, total: 100, color: '#1890ff' },
        { plan: 'Premium', used: 92, total: 100, color: '#722ed1' }
    ];

    const apiStats = {
        total_calls: 1245632,
        success_rate: 99.2,
        error_count: 127,
        avg_response: 45
    };

    const recentErrors = [
        { id: 1, error: 'Database connection timeout', count: 23, time: '2 min ago' },
        { id: 2, error: 'API rate limit exceeded', count: 15, time: '5 min ago' },
        { id: 3, error: 'Authentication failed', count: 8, time: '12 min ago' }
    ];

    const monthlyRevenue = [
        { month: 'Jan', revenue: 45230 },
        { month: 'Feb', revenue: 52340 },
        { month: 'Mar', revenue: 48920 },
        { month: 'Apr', revenue: 61850 },
        { month: 'May', revenue: 58420 },
        { month: 'Jun', revenue: 67200 }
    ];

    const subscriptionData = {
        active_paid: 3248,
        free_users: 9599,
        conversion_rate: 25.3
    };

    const renewalsData = [
        { id: 1, user: 'John Doe', plan: 'Pro', amount: '$29', status: 'success', date: '2025-01-15' },
        { id: 2, user: 'Jane Smith', plan: 'Premium', amount: '$59', status: 'failed', date: '2025-01-14' },
        { id: 3, user: 'Bob Wilson', plan: 'Pro', amount: '$29', status: 'success', date: '2025-01-13' }
    ];

    const loginAttempts = {
        successful: 8542,
        failed: 324,
        success_rate: 96.3
    };

    const connectedDevices = [
        { id: 1, user: 'Alice Johnson', device: 'MacBook Pro', location: 'New York', lastSeen: '2 min ago', status: 'online' },
        { id: 2, user: 'Mike Chen', device: 'iPhone 15', location: 'San Francisco', lastSeen: '5 min ago', status: 'online' },
        { id: 3, user: 'Sarah Davis', device: 'Windows PC', location: 'London', lastSeen: '1 hour ago', status: 'offline' }
    ];

    const suspiciousActivities = [
        { id: 1, activity: 'Multiple login attempts from different IPs', user: 'user123@email.com', severity: 'high', time: '10 min ago' },
        { id: 2, activity: 'Large data download detected', user: 'testuser@email.com', severity: 'medium', time: '1 hour ago' }
    ];

    const moduleUsage = [
        { module: 'Planner', usage: 89 },
        { module: 'Notes', usage: 76 },
        { module: 'Files', usage: 62 },
        { module: 'Finance', usage: 45 }
    ];

    const growthData = [
        { month: 'Jan', users: 1200 },
        { month: 'Feb', users: 1580 },
        { month: 'Mar', users: 1320 },
        { month: 'Apr', users: 1890 },
        { month: 'May', users: 2100 },
        { month: 'Jun', users: 2450 }
    ];

    const reportedAccounts = [
        { id: 1, user: 'spammer@email.com', reason: 'Spam content', reports: 15, status: 'pending' },
        { id: 2, user: 'abusive@email.com', reason: 'Abusive behavior', reports: 8, status: 'reviewing' },
        { id: 3, user: 'fake@email.com', reason: 'Fake account', reports: 12, status: 'suspended' }
    ];

    const handleAnnouncement = async (values: any) => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            console.log('Announcement sent:', values);
            announcementForm.resetFields();
            setLoading(false);
        }, 1000);
    };

    const UserStatsCards = () => {
        const stats = [
            {
                title: 'Total Users',
                value: userStats.total_users,
                icon: <TeamOutlined />,
                color: '#1890ff',
                bgColor: '#e6f7ff'
            },
            {
                title: 'Active Users',
                value: userStats.active_users,
                icon: <UserOutlined />,
                color: '#52c41a',
                bgColor: '#f6ffed'
            },
            {
                title: 'Suspended',
                value: userStats.suspended_users,
                icon: <StopOutlined />,
                color: '#ff4d4f',
                bgColor: '#fff2f0'
            }
        ];

        return (
            <Row gutter={[16, 16]}>
                {stats.map((stat, index) => (
                    <Col xs={24} sm={8} key={index}>
                        <Card
                            size="small"
                            style={{
                                borderRadius: '8px',
                                border: '1px solid #e8e8e8',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                backgroundColor: '#fff'
                            }}
                            bodyStyle={{ padding: '16px' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <div
                                    style={{
                                        width: '44px',
                                        height: '44px',
                                        backgroundColor: stat.bgColor,
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: '12px',
                                        border: `1px solid ${stat.color}15`
                                    }}
                                >
                                    <span style={{ color: stat.color, fontSize: '18px' }}>
                                        {stat.icon}
                                    </span>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <Text
                                        style={{
                                            fontSize: '12px',
                                            color: '#8c8c8c',
                                            display: 'block',
                                            marginBottom: '4px',
                                            fontWeight: 500
                                        }}
                                    >
                                        {stat.title}
                                    </Text>
                                    <Statistic
                                        value={stat.value}
                                        valueStyle={{
                                            fontSize: '24px',
                                            fontWeight: 600,
                                            color: '#262626',
                                            lineHeight: 1
                                        }}
                                    />
                                </div>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>
        );
    };

    const UsersTable = () => {
        const mockUsers = [
            { key: 1, name: 'John Doe', email: 'john@email.com', role: 'Admin', plan: 'Premium', status: 'Active' },
            { key: 2, name: 'Jane Smith', email: 'jane@email.com', role: 'User', plan: 'Pro', status: 'Active' },
            { key: 3, name: 'Bob Wilson', email: 'bob@email.com', role: 'User', plan: 'Free', status: 'Suspended' }
        ];

        const columns = [
            {
                title: 'User',
                key: 'user',
                render: (record: any) => (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar size={32} style={{ marginRight: '12px', backgroundColor: '#f0f0f0' }}>
                            {record.name[0]}
                        </Avatar>
                        <div>
                            <div style={{ fontWeight: 500, color: '#262626', fontSize: '14px' }}>
                                {record.name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                                {record.email}
                            </div>
                        </div>
                    </div>
                ),
            },
            {
                title: 'Role',
                dataIndex: 'role',
                render: (role: string) => (
                    <Tag color={role === 'Admin' ? 'red' : 'blue'} style={{ borderRadius: '4px', fontSize: '12px' }}>
                        {role}
                    </Tag>
                ),
            },
            {
                title: 'Plan',
                dataIndex: 'plan',
                render: (plan: string) => (
                    <Tag
                        color={plan === 'Premium' ? 'gold' : plan === 'Pro' ? '#1890ff' : 'default'}
                        style={{ borderRadius: '4px', fontSize: '12px' }}
                    >
                        {plan}
                    </Tag>
                ),
            },
            {
                title: 'Status',
                dataIndex: 'status',
                render: (status: string) => (
                    <Tag
                        color={status === 'Active' ? 'success' : 'error'}
                        style={{ borderRadius: '4px', fontSize: '12px' }}
                    >
                        {status}
                    </Tag>
                ),
            },
            {
                title: 'Actions',
                key: 'actions',
                render: () => (
                    <Dropdown
                        menu={{
                            items: [
                                { key: 'view', icon: <EyeOutlined />, label: 'View' },
                                { key: 'delete', icon: <DeleteOutlined />, label: 'Delete', danger: true }
                            ]
                        }}
                        trigger={['click']}
                    >
                        <Button type="text" icon={<MoreOutlined />} size="small" />
                    </Dropdown>
                ),
            },
        ];

        return (
            <Card
                title={
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: '16px', fontWeight: 500, color: '#262626' }}>
                        <UserOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                        Users Table
                    </div>
                }
                style={{
                    borderRadius: '8px',
                    border: '1px solid #e8e8e8',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                }}
                bodyStyle={{ padding: '16px' }}
            >
                <Table
                    columns={columns}
                    dataSource={mockUsers}
                    size="small"
                    pagination={{ pageSize: 5, size: 'small' }}
                />
            </Card>
        );
    };

    return (
        <div style={{ padding: '20px', backgroundColor: '#fff', minHeight: '100vh', marginTop: 55 }}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {/* Header */}
                <Card
                    style={{
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        border: '1px solid #e8e8e8'
                    }}
                    bodyStyle={{ padding: '16px' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            backgroundColor: '#1890ff',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '16px'
                        }}>
                            <SettingOutlined size={20} style={{ color: 'white' }} />
                        </div>
                        <div>
                            <Title level={3} style={{ margin: 0, color: '#262626', fontWeight: 600 }}>
                                Admin Dashboard
                            </Title>
                            <div style={{ color: '#8c8c8c', fontSize: '14px', marginTop: '2px' }}>
                                Complete system overview and management
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Row 1 - User Overview */}
                <UserStatsCards />

                {/* Row 2 - User Table */}
                <UsersTable />

                {/* Row 3 - System Monitoring */}
                <Row gutter={[16, 16]}>
                    <Col span={12}>
                        <Card
                            title={
                                <div style={{ display: 'flex', alignItems: 'center', fontSize: '16px', fontWeight: 500, color: '#262626' }}>
                                    <DatabaseOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                                    Storage Usage by Plan
                                </div>
                            }
                            style={{
                                borderRadius: '8px',
                                border: '1px solid #e8e8e8',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                            }}
                            bodyStyle={{ padding: '16px' }}
                        >
                            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                {storageUsage.map((item, index) => (
                                    <div key={index}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <Text style={{ fontSize: '14px', fontWeight: 500, color: '#262626' }}>
                                                {item.plan} Plan
                                            </Text>
                                            <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>
                                                {item.used}% used
                                            </Text>
                                        </div>
                                        <Progress
                                            percent={item.used}
                                            strokeColor={item.color}
                                            size="small"
                                            showInfo={false}
                                        />
                                    </div>
                                ))}
                            </Space>
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Row gutter={[0, 16]}>
                            <Col span={24}>
                                <Card
                                    title={
                                        <div style={{ display: 'flex', alignItems: 'center', fontSize: '16px', fontWeight: 500, color: '#262626' }}>
                                            <ApiOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                                            API Usage Stats
                                        </div>
                                    }
                                    style={{
                                        borderRadius: '8px',
                                        border: '1px solid #e8e8e8',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                                    }}
                                    bodyStyle={{ padding: '16px' }}
                                    size="small"
                                >
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Statistic
                                                title={<span style={{ fontSize: '12px', color: '#8c8c8c' }}>Total Calls</span>}
                                                value={apiStats.total_calls}
                                                valueStyle={{ fontSize: '16px', color: '#262626', fontWeight: 600 }}
                                            />
                                        </Col>
                                        <Col span={12}>
                                            <Statistic
                                                title={<span style={{ fontSize: '12px', color: '#8c8c8c' }}>Success Rate</span>}
                                                value={apiStats.success_rate}
                                                suffix="%"
                                                valueStyle={{ fontSize: '16px', color: '#52c41a', fontWeight: 600 }}
                                            />
                                        </Col>
                                    </Row>
                                </Card>
                            </Col>
                            <Col span={24}>
                                <Card
                                    title={
                                        <div style={{ display: 'flex', alignItems: 'center', fontSize: '16px', fontWeight: 500, color: '#262626' }}>
                                            <ExclamationCircleOutlined style={{ marginRight: '8px', color: '#ff4d4f' }} />
                                            Error Log
                                        </div>
                                    }
                                    style={{
                                        borderRadius: '8px',
                                        border: '1px solid #e8e8e8',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                                    }}
                                    bodyStyle={{ padding: '16px' }}
                                    size="small"
                                >
                                    <List
                                        size="small"
                                        dataSource={recentErrors}
                                        renderItem={item => (
                                            <List.Item style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                                                <div style={{ width: '100%' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Text style={{ fontSize: '12px', color: '#262626', fontWeight: 500 }}>
                                                            {item.error}
                                                        </Text>
                                                        <Badge count={item.count} style={{ backgroundColor: '#ff4d4f' }} />
                                                    </div>
                                                    <Text style={{ fontSize: '11px', color: '#8c8c8c' }}>
                                                        {item.time}
                                                    </Text>
                                                </div>
                                            </List.Item>
                                        )}
                                    />
                                </Card>
                            </Col>
                        </Row>
                    </Col>
                </Row>

                {/* Row 4 - Billing & Subscriptions */}
                <Row gutter={[16, 16]}>
                    <Col span={12}>
                        <Card
                            title={
                                <div style={{ display: 'flex', alignItems: 'center', fontSize: '16px', fontWeight: 500, color: '#262626' }}>
                                    <LineChartOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                                    Monthly Revenue
                                </div>
                            }
                            style={{
                                borderRadius: '8px',
                                border: '1px solid #e8e8e8',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                            }}
                            bodyStyle={{ padding: '16px' }}
                        >
                            <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafafa', borderRadius: '6px' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <DollarCircleOutlined style={{ fontSize: '32px', color: '#52c41a', marginBottom: '8px' }} />
                                    <div style={{ fontSize: '24px', fontWeight: 600, color: '#262626' }}>$67,200</div>
                                    <div style={{ fontSize: '12px', color: '#8c8c8c' }}>June Revenue</div>
                                    <div style={{ fontSize: '12px', color: '#52c41a', marginTop: '4px' }}>↑ 15.2% vs last month</div>
                                </div>
                            </div>
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Row gutter={[0, 16]}>
                            <Col span={24}>
                                <Card
                                    title={
                                        <div style={{ display: 'flex', alignItems: 'center', fontSize: '16px', fontWeight: 500, color: '#262626' }}>
                                            <PieChartOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                                            User Distribution
                                        </div>
                                    }
                                    style={{
                                        borderRadius: '8px',
                                        border: '1px solid #e8e8e8',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                                    }}
                                    bodyStyle={{ padding: '16px' }}
                                    size="small"
                                >
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Statistic
                                                title={<span style={{ fontSize: '12px', color: '#8c8c8c' }}>Paid Users</span>}
                                                value={subscriptionData.active_paid}
                                                valueStyle={{ fontSize: '16px', color: '#52c41a', fontWeight: 600 }}
                                            />
                                        </Col>
                                        <Col span={12}>
                                            <Statistic
                                                title={<span style={{ fontSize: '12px', color: '#8c8c8c' }}>Free Users</span>}
                                                value={subscriptionData.free_users}
                                                valueStyle={{ fontSize: '16px', color: '#1890ff', fontWeight: 600 }}
                                            />
                                        </Col>
                                    </Row>
                                </Card>
                            </Col>
                            <Col span={24}>
                                <Card
                                    title={
                                        <div style={{ display: 'flex', alignItems: 'center', fontSize: '16px', fontWeight: 500, color: '#262626' }}>
                                            <CreditCardOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                                            Recent Transactions
                                        </div>
                                    }
                                    style={{
                                        borderRadius: '8px',
                                        border: '1px solid #e8e8e8',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                                    }}
                                    bodyStyle={{ padding: '16px' }}
                                    size="small"
                                >
                                    <List
                                        size="small"
                                        dataSource={renewalsData.slice(0, 3)}
                                        renderItem={item => (
                                            <List.Item style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                                    <div>
                                                        <Text style={{ fontSize: '12px', color: '#262626', fontWeight: 500 }}>
                                                            {item.user}
                                                        </Text>
                                                        <br />
                                                        <Text style={{ fontSize: '11px', color: '#8c8c8c' }}>
                                                            {item.plan} - {item.amount}
                                                        </Text>
                                                    </div>
                                                    <Tag color={item.status === 'success' ? 'success' : 'error'} style={{ fontSize: '11px' }}>
                                                        {item.status}
                                                    </Tag>
                                                </div>
                                            </List.Item>
                                        )}
                                    />
                                </Card>
                            </Col>
                        </Row>
                    </Col>
                </Row>

                {/* Row 5 - Security */}
                <Row gutter={[16, 16]}>
                    <Col span={12}>
                        <Card
                            title={
                                <div style={{ display: 'flex', alignItems: 'center', fontSize: '16px', fontWeight: 500, color: '#262626' }}>
                                    {/* <ShieldOutlined style={{ marginRight: '8px', color: '#1890ff' }} /> */}
                                    Login Attempts
                                </div>
                            }
                            style={{
                                borderRadius: '8px',
                                border: '1px solid #e8e8e8',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                            }}
                            bodyStyle={{ padding: '16px' }}
                        >
                            <Row gutter={16}>
                                <Col span={8}>
                                    <Statistic
                                        title={<span style={{ fontSize: '12px', color: '#8c8c8c' }}>Successful</span>}
                                        value={loginAttempts.successful}
                                        valueStyle={{ fontSize: '16px', color: '#52c41a', fontWeight: 600 }}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title={<span style={{ fontSize: '12px', color: '#8c8c8c' }}>Failed</span>}
                                        value={loginAttempts.failed}
                                        valueStyle={{ fontSize: '16px', color: '#ff4d4f', fontWeight: 600 }}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic
                                        title={<span style={{ fontSize: '12px', color: '#8c8c8c' }}>Success Rate</span>}
                                        value={loginAttempts.success_rate}
                                        suffix="%"
                                        valueStyle={{ fontSize: '16px', color: '#1890ff', fontWeight: 600 }}
                                    />
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Row gutter={[0, 16]}>
                            <Col span={24}>
                                <Card
                                    title={
                                        <div style={{ display: 'flex', alignItems: 'center', fontSize: '16px', fontWeight: 500, color: '#262626' }}>
                                            <DesktopOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                                            Connected Devices
                                        </div>
                                    }
                                    style={{
                                        borderRadius: '8px',
                                        border: '1px solid #e8e8e8',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                                    }}
                                    bodyStyle={{ padding: '16px' }}
                                    size="small"
                                >
                                    <List
                                        size="small"
                                        dataSource={connectedDevices.slice(0, 2)}
                                        renderItem={item => (
                                            <List.Item style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                                    <div>
                                                        <Text style={{ fontSize: '12px', color: '#262626', fontWeight: 500 }}>
                                                            {item.device}
                                                        </Text>
                                                        <br />
                                                        <Text style={{ fontSize: '11px', color: '#8c8c8c' }}>
                                                            {item.user} - {item.location}
                                                        </Text>
                                                    </div>
                                                    <Badge
                                                        status={item.status === 'online' ? 'success' : 'default'}
                                                        text={
                                                            <span style={{ fontSize: '11px', color: '#8c8c8c' }}>
                                                                {item.lastSeen}
                                                            </span>
                                                        }
                                                    />
                                                </div>
                                            </List.Item>
                                        )}
                                    />
                                </Card>
                            </Col>
                            <Col span={24}>
                                <Card
                                    title={
                                        <div style={{ display: 'flex', alignItems: 'center', fontSize: '16px', fontWeight: 500, color: '#262626' }}>
                                            <ExclamationCircleOutlined style={{ marginRight: '8px', color: '#ff4d4f' }} />
                                            Suspicious Activity
                                        </div>
                                    }
                                    style={{
                                        borderRadius: '8px',
                                        border: '1px solid #e8e8e8',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                                    }}
                                    bodyStyle={{ padding: '16px' }}
                                    size="small"
                                >
                                    {suspiciousActivities.map((activity, index) => (
                                        <Alert
                                            key={activity.id}
                                            type={activity.severity === 'high' ? 'error' : 'warning'}
                                            message={activity.activity}
                                            description={
                                                <div style={{ fontSize: '11px', color: '#8c8c8c' }}>
                                                    {activity.user} • {activity.time}
                                                </div>
                                            }
                                            showIcon
                                            style={{ marginBottom: index < suspiciousActivities.length - 1 ? '8px' : 0 }}
                                        />
                                    ))}
                                </Card>
                            </Col>
                        </Row>
                    </Col>
                </Row>

                {/* Row 6 - Reports & Analytics */}
                <Row gutter={[16, 16]}>
                    <Col span={12}>
                        <Card
                            title={
                                <div style={{ display: 'flex', alignItems: 'center', fontSize: '16px', fontWeight: 500, color: '#262626' }}>
                                    <BarChartOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                                    Most-used Modules
                                </div>
                            }
                            style={{
                                borderRadius: '8px',
                                border: '1px solid #e8e8e8',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                            }}
                            bodyStyle={{ padding: '16px' }}
                        >
                            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                {moduleUsage.map((module, index) => (
                                    <div key={index}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <Text style={{ fontSize: '14px', fontWeight: 500, color: '#262626' }}>
                                                {module.module}
                                            </Text>
                                            <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>
                                                {module.usage}%
                                            </Text>
                                        </div>
                                        <Progress
                                            percent={module.usage}
                                            size="small"
                                            showInfo={false}
                                            strokeColor={
                                                module.usage > 80 ? '#52c41a' :
                                                    module.usage > 60 ? '#1890ff' :
                                                        module.usage > 40 ? '#faad14' : '#ff4d4f'
                                            }
                                        />
                                    </div>
                                ))}
                            </Space>
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card
                            title={
                                <div style={{ display: 'flex', alignItems: 'center', fontSize: '16px', fontWeight: 500, color: '#262626' }}>
                                    {/* <TrendingUpOutlined style={{ marginRight: '8px', color: '#1890ff' }} /> */}
                                    New Users Growth
                                </div>
                            }
                            style={{
                                borderRadius: '8px',
                                border: '1px solid #e8e8e8',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                            }}
                            bodyStyle={{ padding: '16px' }}
                        >
                            <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafafa', borderRadius: '6px' }}>
                                <div style={{ textAlign: 'center' }}>
                                    {/* <TrendingUpOutlined style={{ fontSize: '32px', color: '#52c41a', marginBottom: '8px' }} /> */}
                                    <div style={{ fontSize: '24px', fontWeight: 600, color: '#262626' }}>+2,450</div>
                                    <div style={{ fontSize: '12px', color: '#8c8c8c' }}>New users in June</div>
                                    <div style={{ fontSize: '12px', color: '#52c41a', marginTop: '4px' }}>↑ 22.8% growth rate</div>
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>

                {/* Row 7 - Admin Tools */}
                <Row gutter={[16, 16]}>
                    <Col span={8}>
                        <Card
                            title={
                                <div style={{ display: 'flex', alignItems: 'center', fontSize: '16px', fontWeight: 500, color: '#262626' }}>
                                    <SoundOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                                    Send Announcement
                                </div>
                            }
                            style={{
                                borderRadius: '8px',
                                border: '1px solid #e8e8e8',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                            }}
                            bodyStyle={{ padding: '16px' }}
                        >
                            <Form
                                form={announcementForm}
                                layout="vertical"
                                onFinish={handleAnnouncement}
                                size="small"
                            >
                                <Form.Item
                                    name="title"
                                    label={<span style={{ fontSize: '12px', color: '#8c8c8c', fontWeight: 500 }}>Title</span>}
                                    rules={[{ required: true, message: 'Please enter title' }]}
                                >
                                    <Input placeholder="Announcement title" />
                                </Form.Item>
                                <Form.Item
                                    name="message"
                                    label={<span style={{ fontSize: '12px', color: '#8c8c8c', fontWeight: 500 }}>Message</span>}
                                    rules={[{ required: true, message: 'Please enter message' }]}
                                >
                                    <TextArea rows={3} placeholder="Announcement message" />
                                </Form.Item>
                                <Form.Item>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={loading}
                                        icon={<BellOutlined />}
                                        style={{ width: '100%', borderRadius: '6px' }}
                                        size="small"
                                    >
                                        Send Announcement
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card
                            title={
                                <div style={{ display: 'flex', alignItems: 'center', fontSize: '16px', fontWeight: 500, color: '#262626' }}>
                                    <SafetyCertificateOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                                    Role Management
                                </div>
                            }
                            style={{
                                borderRadius: '8px',
                                border: '1px solid #e8e8e8',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                            }}
                            bodyStyle={{ padding: '16px' }}
                        >
                            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                                <div>
                                    <Text style={{ fontSize: '12px', color: '#8c8c8c', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
                                        Select User
                                    </Text>
                                    <Select
                                        placeholder="Choose user to modify"
                                        style={{ width: '100%' }}
                                        size="small"
                                    >
                                        <Option value="user1">john@email.com</Option>
                                        <Option value="user2">jane@email.com</Option>
                                        <Option value="user3">bob@email.com</Option>
                                    </Select>
                                </div>
                                <div>
                                    <Text style={{ fontSize: '12px', color: '#8c8c8c', fontWeight: 500, display: 'block', marginBottom: '6px' }}>
                                        Assign Role
                                    </Text>
                                    <Select
                                        placeholder="Select role"
                                        style={{ width: '100%' }}
                                        size="small"
                                    >
                                        <Option value="admin">Admin</Option>
                                        <Option value="support">Support</Option>
                                        <Option value="moderator">Moderator</Option>
                                        <Option value="user">User</Option>
                                    </Select>
                                </div>
                                <Button
                                    type="primary"
                                    style={{ width: '100%', borderRadius: '6px' }}
                                    size="small"
                                >
                                    Update Role
                                </Button>
                            </Space>
                        </Card>
                    </Col>
                    <Col span={8}>
                        <Card
                            title={
                                <div style={{ display: 'flex', alignItems: 'center', fontSize: '16px', fontWeight: 500, color: '#262626' }}>
                                    <ExclamationCircleOutlined style={{ marginRight: '8px', color: '#ff4d4f' }} />
                                    Reported Accounts
                                </div>
                            }
                            style={{
                                borderRadius: '8px',
                                border: '1px solid #e8e8e8',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                            }}
                            bodyStyle={{ padding: '16px', maxHeight: '280px', overflowY: 'auto' }}
                        >
                            <List
                                size="small"
                                dataSource={reportedAccounts}
                                renderItem={item => (
                                    <List.Item style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                                        <div style={{ width: '100%' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                <Text style={{ fontSize: '12px', color: '#262626', fontWeight: 500 }}>
                                                    {item.user}
                                                </Text>
                                                <Badge count={item.reports} style={{ backgroundColor: '#ff4d4f' }} />
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Text style={{ fontSize: '11px', color: '#8c8c8c' }}>
                                                    {item.reason}
                                                </Text>
                                                <Tag
                                                    color={
                                                        item.status === 'suspended' ? 'error' :
                                                            item.status === 'reviewing' ? 'warning' : 'processing'
                                                    }
                                                    style={{ fontSize: '10px' }}
                                                >
                                                    {item.status}
                                                </Tag>
                                            </div>
                                        </div>
                                    </List.Item>
                                )}
                            />
                        </Card>
                    </Col>
                </Row>
            </Space>
        </div>
    );
};

export default AdminDashboard;