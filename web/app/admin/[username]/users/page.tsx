'use client'
import React, { useEffect, useState } from 'react';
import { Row, Col, Space, Spin, Switch, Card, Typography } from 'antd';
import { CustomButton, CustomTitle } from '../../../comman';
import { Users } from 'lucide-react';
import { GetAllUsers, GetUserStats } from '../../../../services/admin/users';
import { useGlobalLoading } from '../../../loadingContext';
import UserStatsCard from '../../../../pages/admin/components/users/userStatsCard';
import UsersTable from '../../../../pages/admin/components/users/usersTable';

const { Title } = Typography;

const UserOverview: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const { loading, setLoading } = useGlobalLoading();
    const [userType, setUserType] = useState<'app' | 'waitlist'>('app');

    const fetchData = async () => {
        try {
            setLoading(true);
            const res1 = await GetAllUsers({}, userType);
            const usersData = await res1.data;

            const res2 = await GetUserStats({}, userType);
            const statsData = res2.data;

            setStats(statsData.payload);
            setUsers(usersData.payload);
        } catch (error) {
            console.error('Error fetching user data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [userType]);

    const handleUserUpdate = () => {
        fetchData();
    };

    const handleUserTypeChange = (checked: boolean) => {
        setStats(null);
        setUsers([]);
        setUserType(checked ? 'waitlist' : 'app');
    };

    return (
        <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh', marginTop: '60px' }}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {/* Header Section */}
                <Card
                    style={{
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        border: '1px solid #e8e8e8'
                    }}
                >
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 0'
                    }}>
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
                                <Users size={20} color="white" />
                            </div>
                            <div>
                                <Title level={3} style={{ margin: 0, color: '#262626', fontWeight: 600 }}>
                                    User Management
                                </Title>
                                <div style={{ color: '#8c8c8c', fontSize: '14px', marginTop: '2px' }}>
                                    Manage user accounts and permissions
                                </div>
                            </div>
                        </div>

                        {/* User Type Toggle */}
                        <Card
                            size="small"
                            style={{
                                backgroundColor: '#fafafa',
                                border: '1px solid #d9d9d9',
                                borderRadius: '6px',
                                boxShadow: 'none'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    color: userType === 'app' ? '#1890ff' : '#8c8c8c'
                                }}>
                                    App Users
                                </span>
                                <Switch
                                    checked={userType === 'waitlist'}
                                    onChange={handleUserTypeChange}
                                    size="small"
                                />
                                <span style={{
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    color: userType === 'waitlist' ? '#52c41a' : '#8c8c8c'
                                }}>
                                    Waitlist
                                </span>
                            </div>
                        </Card>
                    </div>
                </Card>

                {/* Stats Section */}
                <UserStatsCard users={stats} />

                {/* Table Section */}
                <UsersTable
                    users={users}
                    loading={loading}
                    onUserUpdate={handleUserUpdate}
                    userType={userType}
                />
            </Space>
        </div>
    );
};

export default UserOverview;