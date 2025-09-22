'use client';
import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Row, Col, Space, Divider } from 'antd';
import {
  ArrowRightOutlined,
  BarChartOutlined,
  CreditCardOutlined,
  DollarCircleOutlined,
  PieChartOutlined,
  CheckCircleOutlined,
  LineChartOutlined,
} from '@ant-design/icons';
import { bankConnect } from '../../services/apiConfig';
import { showNotification } from '../../utils/notification';
import { useCurrentUser } from '../../app/userContext';
import { useGlobalLoading } from '../../app/loadingContext';
import { useQuilttSession } from '@quiltt/react';
import SetupFinanceBoard from './setUpFinanceboard';
import { PRIMARY_COLOR } from '../../app/comman';
import { ShieldIcon } from 'lucide-react';

const { Title, Paragraph, Text } = Typography;

interface FinanceInfoCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FinanceIntroBoard = () => {
  const [isFinanceUser, setIsFinanceUser] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const { loading, setLoading } = useGlobalLoading();
  const { importSession, session } = useQuilttSession();
  const currentUser = useCurrentUser();

  useEffect(() => {
    if (session?.token) {
      setIsFinanceUser(true);
    }
  }, [session]);

  const handleGetStarted = async () => {
    setLoading(true);
    try {
      const response = await bankConnect({ currentUser });

      if (!response) {
        showNotification("Error", "Signup failed", "error");
        throw new Error("Signup failed");
      }

      if (response.data?.token) {
        const { token } = response.data;
        importSession(token);
        setIsFinanceUser(true);
      }
    } catch (error) {
      showNotification("Error", "Signup failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <BarChartOutlined style={{ fontSize: 18, color: '#1890ff' }} />,
      title: 'Financial Overview',
      description: 'Real-time updates and smart insights for your finances.',
    },
    {
      icon: <CreditCardOutlined style={{ fontSize: 18, color: '#52c41a' }} />,
      title: 'Bill Tracking',
      description: 'Never miss payments with automated tracking.',
    },
    {
      icon: <PieChartOutlined style={{ fontSize: 18, color: '#fa8c16' }} />,
      title: 'Budget Management',
      description: 'Track budgets with visual progress analysis.',
    },
    {
      icon: <DollarCircleOutlined style={{ fontSize: 18, color: '#eb2f96' }} />,
      title: 'Financial Goals',
      description: 'Set and track savings goals automatically.',
    },
  ];

  const benefits = [
    'Automatically import and categorize transactions',
    'Update account balances in real-time',
    'Identify recurring bills and subscriptions',
    'Provide personalized spending insights',
  ];

  return (
    <Card
      style={{
        borderRadius: 12,
        boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
        minHeight: '650px',
        width: '100%', // Ensure card takes full container width
        overflowX: 'hidden', // Prevent horizontal overflow
      }}
      loading={loading}
    >
      {!isFinanceUser ? (
        <>
          {/* Header Section */}
          <div
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              margin: '-16px -16px 16px -16px',
              padding: '12px 12px',
              borderRadius: '12px 12px 0 0',
              color: 'white',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: -40,
                right: -40,
                width: 80,
                height: 80,
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
                animation: 'float 6s ease-in-out infinite',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: -20,
                left: -20,
                width: 40,
                height: 40,
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
                animation: 'float 4s ease-in-out infinite reverse',
              }}
            />

            <Row align="middle" gutter={[16, 12]}>
              <Col xs={24} md={18}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <Title
                    level={1}
                    style={{ color: 'white', margin: '0 0 12px 0', fontSize: '1.8rem' }}
                  >
                    Welcome to Your Finance Board
                  </Title>
                  <Paragraph
                    style={{
                      color: 'rgba(255,255,255,0.9)',
                      fontSize: 14,
                      margin: '0 0 16px 0',
                      maxWidth: '100%', // Prevent text overflow
                    }}
                  >
                    Your complete financial command center that helps you track, manage, and
                    optimize your finances in one place.
                  </Paragraph>
                </div>
              </Col>
              <Col xs={24} md={6}>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="primary"
                    size="large"
                    loading={loading}
                    onClick={handleGetStarted}
                    style={{
                      borderRadius: 8,
                      background: '#e6e9edff',
                      borderColor: '#ecedeeff',
                      color: PRIMARY_COLOR,
                      padding: '8px 16px',
                      height: 'auto',
                      fontSize: 14,
                      fontWeight: 500,
                      transition: 'all 0.3s ease',
                      transform: loading ? 'scale(0.95)' : 'scale(1)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    Get Started <ArrowRightOutlined />
                  </Button>
                </div>
              </Col>
            </Row>
          </div>

          {/* Features Section */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {features.map((feature, index) => (
              <Col xs={24} sm={12} md={6} key={index}>
                <Card
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    borderRadius: 8,
                    border: '1px solid #e8e8e8',
                    transition: 'all 0.3s ease',
                    transform: hoveredCard === index ? 'translateY(-4px)' : 'translateY(0)',
                    boxShadow: hoveredCard === index
                      ? '0 6px 20px rgba(0,0,0,0.12)'
                      : '0 2px 6px rgba(0,0,0,0.06)',
                    height: 160,
                    width: '100%', // Ensure card fits container
                  }}
                >
                  <div style={{ textAlign: 'center', padding: '6px 0' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        marginBottom: 6,
                        marginTop: 24,
                      }}
                    >
                      {feature.icon}
                      <Title
                        level={5}
                        style={{
                          margin: 0,
                          fontSize: 16,
                          fontWeight: 600,
                        }}
                      >
                        {feature.title}
                      </Title>
                    </div>
                    <Text
                      style={{
                        fontSize: 14,
                        color: '#2c1b1bff',
                        display: 'block',
                        lineHeight: 1.3,
                      }}
                    >
                      {feature.description}
                    </Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>

          <Divider style={{ margin: '12px 0' }} />

          {/* How it works section */}
          <Row gutter={[16, 0]} align="middle">
            <Col xs={24} md={16}>
              <div
                style={{
                  background: 'linear-gradient(135deg, #f6f9fc 0%, #e9f4ff 100%)',
                  padding: 16,
                  borderRadius: 8,
                  border: '1px solid #e6f7ff',
                  width: '100%', // Ensure full width without overflow
                  boxSizing: 'border-box', // Include padding in width calculation
                }}
              >
                <Title
                  level={4}
                  style={{
                    color: '#1890ff',
                    margin: '0 0 8px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 24,
                  }}
                >
                  <LineChartOutlined style={{ fontSize: 20 }} />
                  How does it work?
                </Title>
                <Paragraph
                  style={{
                    fontSize: 16,
                    margin: '0 0 8px 0',
                    color: '#666',
                  }}
                >
                  To set up your Finance Board, we'll connect securely to your financial
                  accounts. This allows us to:
                </Paragraph>
                <Space direction="vertical" size={6} style={{ width: '100%' }}>
                  {benefits.map((benefit, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 8,
                      }}
                    >
                      <CheckCircleOutlined
                        style={{
                          color: '#52c41a',
                          fontSize: 16,
                          marginTop: 4,
                        }}
                      />
                      <Text style={{ fontSize: 14, lineHeight: 1.5, color: '#382b2bff' }}>
                        {benefit}
                      </Text>
                    </div>
                  ))}
                </Space>
                <Paragraph
                  style={{
                    fontSize: 14,
                    margin: '12px 0 0 0',
                    color: '#666',
                  }}
                >
                  You'll be able to connect multiple accounts including checking, savings,
                  credit cards, loans, investments, and more of Your Connected Bank.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div
                style={{
                  textAlign: 'center',
                  padding: 16,
                }}
              >
                <div
                  style={{
                    width: 80,
                    height: 80,
                    margin: '0 auto 12px auto',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  <ShieldIcon
                    style={{
                      fontSize: 28,
                      color: 'white',
                    }}
                  />
                </div>
                <Title level={5} style={{ margin: '0 0 6px 0', fontSize: 18 }}>
                  Bank-Level Security
                </Title>
                <Text style={{ fontSize: 14, color: '#666' }}>
                  Your data is encrypted and protected with 256-bit SSL security
                </Text>
              </div>
            </Col>
          </Row>
        </>
      ) : (
        <SetupFinanceBoard />
      )}
    </Card>
  );
};

const FinanceInfoCard: React.FC<FinanceInfoCardProps> = ({ icon, title, description }) => {
  return (
    <Card
      hoverable
      style={{
        width: '100%',
        marginBottom: 0,
        borderRadius: 8,
        transition: 'all 0.3s ease',
      }}
    >
      <Title
        level={4}
        style={{ display: 'flex', alignItems: 'center', margin: '0 0 8px 0', fontSize: 14 }}
      >
        <span style={{ marginRight: 6, color: '#1890ff' }}>{icon}</span>
        <span>{title}</span>
      </Title>
      <Paragraph style={{ fontSize: 12, margin: 0, color: '#666' }}>
        {description}
      </Paragraph>
    </Card>
  );
};

export default FinanceIntroBoard;