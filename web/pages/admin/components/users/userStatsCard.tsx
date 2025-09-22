'use client';
import React, { useMemo } from 'react';
import { Card, Statistic, Row, Col, Typography } from 'antd';
import { UserOutlined, TeamOutlined, StopOutlined, UserAddOutlined } from '@ant-design/icons';
import { PRIMARY_COLOR, FONT_FAMILY, COLORS } from '../../../../app/comman';

const { Text } = Typography;

interface UserStats {
    total_users: number;
    active_users: number;
    suspended_users: number;
    new_users: number;
}

const UserStatsCard: React.FC<{ users: UserStats }> = ({ users }) => {
    const stats = useMemo(() => {
        const safeUsers = users || {};
        const total = safeUsers.total_users || 0;
        const active = safeUsers.active_users || 0;
        const suspended = safeUsers.suspended_users || 0;
        const newUsers = safeUsers.new_users || 0;

        return [
            {
                title: 'Total Users',
                value: total,
                icon: <TeamOutlined />,
                color: '#1890ff',
                bgColor: '#e6f7ff'
            },
            {
                title: 'Active Users',
                value: active,
                icon: <UserOutlined />,
                color: '#52c41a',
                bgColor: '#f6ffed'
            },
            {
                title: 'Suspended',
                value: suspended,
                icon: <StopOutlined />,
                color: '#ff4d4f',
                bgColor: '#fff2f0'
            },
            {
                title: 'New (30 days)',
                value: newUsers,
                icon: <UserAddOutlined />,
                color: '#722ed1',
                bgColor: '#f9f0ff'
            },
        ];
    }, [users]);

    return (
        <Row gutter={[16, 16]}>
            {stats.map((stat, index) => (
                <Col xs={24} sm={12} lg={6} key={index}>
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
                                        lineHeight: 1,
                                        fontFamily: FONT_FAMILY
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

export default UserStatsCard;