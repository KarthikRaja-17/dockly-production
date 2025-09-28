
'use client';
import React, { useEffect, useState } from 'react';
import { Result, Button, Card, Typography, Space, Divider } from 'antd';
import { CheckCircleOutlined, HomeOutlined, MailOutlined, CalendarOutlined } from '@ant-design/icons';
import { useCurrentUser } from '../../app/userContext';

const { Title, Text, Paragraph } = Typography;

const PaymentSuccess: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        // Trigger entrance animation
        setTimeout(() => setIsVisible(true), 100);
        // Show details with delay
        setTimeout(() => setShowDetails(true), 800);
    }, []);
    const user = useCurrentUser();
    const handleGoHome = () => {
        window.location.href = `/${user?.username}/dashboard`;
    };

    const handleContactSupport = () => {
        window.location.href = 'mailto:support@dockly.me';
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
        >
            {/* Background Animation */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0.1,
                    background: 'radial-gradient(circle at 20% 80%, #120078 0%, transparent 50%), radial-gradient(circle at 80% 20%, #120078 0%, transparent 50%)',
                    animation: 'backgroundPulse 4s ease-in-out infinite alternate',
                }}
            />

            <Card
                style={{
                    maxWidth: '600px',
                    width: '100%',
                    borderRadius: '20px',
                    boxShadow: isVisible
                        ? '0 20px 60px rgba(0,0,0,0.15), 0 8px 25px rgba(0,0,0,0.1)'
                        : '0 5px 15px rgba(0,0,0,0.08)',
                    border: 'none',
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
                    opacity: isVisible ? 1 : 0,
                    transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                    overflow: 'hidden',
                    position: 'relative',
                }}
            >
                {/* Success Animation Circle */}
                <div
                    style={{
                        position: 'absolute',
                        top: '-50px',
                        right: '-50px',
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #52c41a, #73d13d)',
                        opacity: 0.1,
                        transform: isVisible ? 'scale(3)' : 'scale(1)',
                        transition: 'transform 1.5s ease-out',
                    }}
                />

                <div style={{ padding: '40px 20px' }}>
                    <Result
                        icon={
                            <CheckCircleOutlined
                                style={{
                                    color: '#52c41a',
                                    fontSize: '72px',
                                    animation: isVisible ? 'successBounce 1s ease-out 0.3s both' : 'none',
                                }}
                            />
                        }
                        title={
                            <Title
                                level={1}
                                style={{
                                    color: '#262626',
                                    marginBottom: '8px',
                                    fontSize: '32px',
                                    fontWeight: 700,
                                    opacity: showDetails ? 1 : 0,
                                    transform: showDetails ? 'translateY(0)' : 'translateY(20px)',
                                    transition: 'all 0.6s ease-out 0.4s',
                                }}
                            >
                                Payment Successful!
                            </Title>
                        }
                        subTitle={
                            <div
                                style={{
                                    opacity: showDetails ? 1 : 0,
                                    transform: showDetails ? 'translateY(0)' : 'translateY(20px)',
                                    transition: 'all 0.6s ease-out 0.6s',
                                }}
                            >
                                <Paragraph
                                    style={{
                                        fontSize: '18px',
                                        color: '#595959',
                                        marginBottom: '24px',
                                        lineHeight: 1.6,
                                    }}
                                >
                                    Thank you for your purchase! Your subscription has been activated successfully.
                                </Paragraph>
                            </div>
                        }
                    />

                    <Divider
                        style={{
                            margin: '32px 0',
                            opacity: showDetails ? 1 : 0,
                            transition: 'opacity 0.6s ease-out 0.8s',
                        }}
                    />

                    {/* Success Details */}
                    <div
                        style={{
                            opacity: showDetails ? 1 : 0,
                            transform: showDetails ? 'translateY(0)' : 'translateY(20px)',
                            transition: 'all 0.6s ease-out 1s',
                        }}
                    >
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                            <Card
                                style={{
                                    background: 'linear-gradient(135deg, #f6ffed 0%, #f0f9ec 100%)',
                                    border: '1px solid #d9f7be',
                                    borderRadius: '12px',
                                }}
                            >
                                <Space align="center">
                                    <CalendarOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                                    <div>
                                        <Text strong style={{ display: 'block', color: '#262626' }}>
                                            Trial Period Active
                                        </Text>
                                        <Text type="secondary">
                                            Your free trial has started. Enjoy full access to all features!
                                        </Text>
                                    </div>
                                </Space>
                            </Card>

                            <Space
                                size="middle"
                                style={{
                                    width: '100%',
                                    justifyContent: 'center',
                                    marginTop: '32px',
                                }}
                            >
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<HomeOutlined />}
                                    onClick={handleGoHome}
                                    style={{
                                        borderRadius: '8px',
                                        height: '48px',
                                        paddingLeft: '24px',
                                        paddingRight: '24px',
                                        fontSize: '16px',
                                        fontWeight: 600,
                                        background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                                        border: 'none',
                                        boxShadow: '0 4px 15px rgba(24, 144, 255, 0.4)',
                                        transform: 'translateY(0)',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(24, 144, 255, 0.5)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(24, 144, 255, 0.4)';
                                    }}
                                >
                                    Go to Dashboard
                                </Button>

                                <Button
                                    size="large"
                                    icon={<MailOutlined />}
                                    onClick={handleContactSupport}
                                    style={{
                                        borderRadius: '8px',
                                        height: '48px',
                                        paddingLeft: '24px',
                                        paddingRight: '24px',
                                        fontSize: '16px',
                                        fontWeight: 600,
                                        border: '2px solid #d9d9d9',
                                        background: 'white',
                                        color: '#595959',
                                        transform: 'translateY(0)',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.borderColor = '#1890ff';
                                        e.currentTarget.style.color = '#1890ff';
                                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.borderColor = '#d9d9d9';
                                        e.currentTarget.style.color = '#595959';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    Contact Support
                                </Button>
                            </Space>

                            <Text
                                type="secondary"
                                style={{
                                    display: 'block',
                                    textAlign: 'center',
                                    marginTop: '24px',
                                    fontSize: '14px',
                                }}
                            >
                                You'll receive a confirmation email shortly with your receipt and subscription details.
                            </Text>
                        </Space>
                    </div>
                </div>
            </Card>

            <style>{`
        @keyframes successBounce {
          0% { transform: scale(0) rotate(0deg); opacity: 0; }
          50% { transform: scale(1.2) rotate(180deg); opacity: 1; }
          100% { transform: scale(1) rotate(360deg); opacity: 1; }
        }

        @keyframes backgroundPulse {
          0% { opacity: 0.1; transform: scale(1); }
          100% { opacity: 0.2; transform: scale(1.1); }
        }
      `}</style>
        </div>
    );
};

export default PaymentSuccess;
