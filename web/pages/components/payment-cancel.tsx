
'use client';
import React, { useEffect, useState } from 'react';
import { Result, Button, Card, Typography, Space, Divider, Alert } from 'antd';
import { CloseCircleOutlined, HomeOutlined, ReloadOutlined, MailOutlined } from '@ant-design/icons';
import { useCurrentUser } from '../../app/userContext';

const { Title, Text, Paragraph } = Typography;

const PaymentCancel: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const user = useCurrentUser();
    useEffect(() => {
        // Trigger entrance animation
        setTimeout(() => setIsVisible(true), 100);
        // Show details with delay
        setTimeout(() => setShowDetails(true), 800);
    }, []);

    const handleRetryPayment = () => {
        // window.location.href = '/pricing';
    };

    const handleGoHome = () => {
        window.location.href = `${user?.username || ''}/dashboard`;
    };

    const handleContactSupport = () => {
        window.location.href = 'mailto:support@dockly.me';
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #fff1f0 0%, #ffece6 100%)',
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
                    background: 'radial-gradient(circle at 20% 80%, #ff4d4f 0%, transparent 50%), radial-gradient(circle at 80% 20%, #ff4d4f 0%, transparent 50%)',
                    animation: 'backgroundPulse 4s ease-in-out infinite alternate',
                }}
            />

            <Card
                style={{
                    maxWidth: '600px',
                    width: '100%',
                    borderRadius: '20px',
                    boxShadow: isVisible
                        ? '0 20px 60px rgba(255,77,79,0.15), 0 8px 25px rgba(0,0,0,0.1)'
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
                {/* Cancel Animation Circle */}
                <div
                    style={{
                        position: 'absolute',
                        top: '-50px',
                        right: '-50px',
                        width: '100px',
                        height: '100px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #ff4d4f, #ff7875)',
                        opacity: 0.1,
                        transform: isVisible ? 'scale(3)' : 'scale(1)',
                        transition: 'transform 1.5s ease-out',
                    }}
                />

                <div style={{ padding: '40px 20px' }}>
                    <Result
                        icon={
                            <CloseCircleOutlined
                                style={{
                                    color: '#ff4d4f',
                                    fontSize: '72px',
                                    animation: isVisible ? 'cancelShake 1s ease-out 0.3s both' : 'none',
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
                                Payment Cancelled
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
                                    Your payment was cancelled and no charges were made to your account.
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

                    {/* Cancel Details */}
                    <div
                        style={{
                            opacity: showDetails ? 1 : 0,
                            transform: showDetails ? 'translateY(0)' : 'translateY(20px)',
                            transition: 'all 0.6s ease-out 1s',
                        }}
                    >
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                            <Alert
                                message="No worries!"
                                description="You can return to complete your subscription anytime. Your account remains active and you can upgrade whenever you're ready."
                                type="info"
                                showIcon
                                style={{
                                    borderRadius: '12px',
                                    border: '1px solid #91d5ff',
                                    background: 'linear-gradient(135deg, #e6f7ff 0%, #f0f9ff 100%)',
                                }}
                            />

                            <Card
                                style={{
                                    background: 'linear-gradient(135deg, #f6ffed 0%, #f0f9ec 100%)',
                                    border: '1px solid #d9f7be',
                                    borderRadius: '12px',
                                }}
                            >
                                <Text strong style={{ display: 'block', color: '#262626', marginBottom: '8px' }}>
                                    What happens next?
                                </Text>
                                <ul style={{ margin: 0, paddingLeft: '20px', color: '#595959' }}>
                                    <li style={{ marginBottom: '4px' }}>Your account remains active with current features</li>
                                    <li style={{ marginBottom: '4px' }}>No charges have been processed</li>
                                    <li>You can upgrade anytime from your dashboard</li>
                                </ul>
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
                                    icon={<ReloadOutlined />}
                                    onClick={handleRetryPayment}
                                    style={{
                                        borderRadius: '8px',
                                        height: '48px',
                                        paddingLeft: '24px',
                                        paddingRight: '24px',
                                        fontSize: '16px',
                                        fontWeight: 600,
                                        background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                                        border: 'none',
                                        boxShadow: '0 4px 15px rgba(82, 196, 26, 0.4)',
                                        transform: 'translateY(0)',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(82, 196, 26, 0.5)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(82, 196, 26, 0.4)';
                                    }}
                                >
                                    Try Again
                                </Button>

                                <Button
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
                                    Go to Dashboard
                                </Button>
                            </Space>

                            <Button
                                type="link"
                                icon={<MailOutlined />}
                                onClick={handleContactSupport}
                                style={{
                                    display: 'block',
                                    margin: '16px auto 0',
                                    color: '#8c8c8c',
                                    fontSize: '14px',
                                }}
                            >
                                Need help? Contact Support
                            </Button>

                            <Text
                                type="secondary"
                                style={{
                                    display: 'block',
                                    textAlign: 'center',
                                    marginTop: '24px',
                                    fontSize: '14px',
                                }}
                            >
                                Questions about our pricing or features? We're here to help!
                            </Text>
                        </Space>
                    </div>
                </div>
            </Card>

            <style>{`
        @keyframes cancelShake {
          0% { transform: scale(0) rotate(0deg); opacity: 0; }
          25% { transform: scale(1.1) rotate(-5deg); opacity: 1; }
          50% { transform: scale(1) rotate(5deg); opacity: 1; }
          75% { transform: scale(1.05) rotate(-2deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }

        @keyframes backgroundPulse {
          0% { opacity: 0.1; transform: scale(1); }
          100% { opacity: 0.2; transform: scale(1.1); }
        }
      `}</style>
        </div>
    );
};

export default PaymentCancel;
