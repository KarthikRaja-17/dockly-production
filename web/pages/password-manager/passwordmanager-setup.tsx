// ```tsx
'use client';
import React, { useEffect, useState } from 'react';
import { Card, Button, Typography, Row, Col, Modal } from 'antd';
import {
  ArrowRightOutlined,
  LockOutlined,
  DashboardOutlined,
  RocketOutlined,
  AlertOutlined,
} from '@ant-design/icons';
import 'antd/dist/reset.css';
import { useRouter } from 'next/navigation';
import { useGlobalLoading } from '../../app/loadingContext';

const { Title, Paragraph } = Typography;

const VaultIntroBoard: React.FC = () => {
  const router = useRouter();
  const [isVaultUser, setIsVaultUser] = useState(false);
  const { loading, setLoading } = useGlobalLoading();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleGetStarted = async () => {
    setLoading(true);
    try {
      setTimeout(() => {
        setIsVaultUser(true);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error setting up vault hub:', error);
      setLoading(false);
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };
  const [username, setUsername] = useState<string | null>(null);
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, [])

  const handleCancel = () => {
    setIsModalVisible(false);
    localStorage.setItem("password-manager", "1");
    router.push(`/${username}/password-manager`);
  };

  return (
    <Card style={{ padding: '0px 24px' }} loading={loading}>
      {!isVaultUser ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              padding: '20px 0',
            }}
          >
            {/* <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>Dockly</div>
            <div style={{ fontSize: '18px', color: '#555' }}>JS</div> */}
          </div>

          <Row
            gutter={24}
            style={{
              marginTop: 40,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Col xs={24} md={12}>
              <img
                src="/manager/vaulthub.webp"
                alt="Vault Illustration"
                style={{
                  width: '100%',
                  maxWidth: '100%',
                  height: '400px',
                  borderRadius: 12,
                  objectFit: 'cover',
                }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = `
                    <div style="
                      width: 100%;
                      height: 400px;
                      background: #e8ecef;
                      border-radius: 12px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      color: #666;
                      font-size: 16px;
                    ">
                      [Vault Illustration Placeholder]
                    </div>
                  `;
                }}
              />
            </Col>
            <Col xs={24} md={12}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'start',
                  justifyContent: 'center',
                  padding: '0 20px',
                }}
              >
                <Title level={1}>Welcome to Your Vault Hub</Title>
                <Paragraph style={{ maxWidth: 500, fontSize: 18 }}>
                  Your central dashboard for connecting and managing your preferred password managers like 1Password, LastPass, and Bitwarden in one organized place.
                </Paragraph>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginLeft: 20,
                }}
              >
                <Button
                  type="primary"
                  size="large"
                  style={{
                    borderRadius: 10,
                    background: '#0052cc',
                    marginTop: 20,
                    padding: '10px 20px',
                  }}
                  onClick={showModal}
                >
                  Get Started
                  <ArrowRightOutlined />
                </Button>
              </div>
            </Col>
          </Row>

          <Row gutter={[24, 24]} style={{ marginTop: 30 }}>
            <Col xs={24} sm={12}>
              <VaultInfoCard
                icon={<LockOutlined />}
                title="Password Manager Integration"
                description="Connect your existing 1Password, LastPass, Bitwarden, or other password managers to access all your credentials."
              />
            </Col>

            <Col xs={24} sm={12}>
              <VaultInfoCard
                icon={<DashboardOutlined />}
                title="Security Dashboard"
                description="View the security status of all your connected password managers in one unified dashboard."
              />
            </Col>

            <Col xs={24} sm={12}>
              <VaultInfoCard
                icon={<RocketOutlined />}
                title="Quick Access"
                description="Launch any of your password managers directly from Dockly with a single tap when you need them."
              />
            </Col>

            <Col xs={24} sm={12}>
              <VaultInfoCard
                icon={<AlertOutlined />}
                title="Security Alerts"
                description="Get notified when your password managers report security concerns or when it's time to review your passwords."
              />
            </Col>
          </Row>

          <div
            style={{
              backgroundColor: '#e6f7ff',
              padding: '20px',
              borderRadius: 8,
              marginTop: 30,
              width: 1350,
              textAlign: 'left',
            }}
          >
            <Title level={3} style={{ color: '#1890ff' }}>
              How does it work?
            </Title>
            <Paragraph style={{ fontSize: 18 }}>
              To set up your Vault Hub, we'll help you connect your existing password managers to Dockly. This allows you to:
            </Paragraph>
            <ul style={{ fontSize: 16, marginLeft: 20 }}>
              <li>Connect 1Password, LastPass, Bitwarden, or other password managers</li>
              <li>Access all your connected password managers from one dashboard</li>
              <li>Receive security alerts from your password managers in one place</li>
              <li>Monitor overall password health across all your services</li>
            </ul>
            <Paragraph style={{ fontSize: 16 }}>
              Dockly never stores your actual passwords - we simply provide a secure interface to your trusted password managers.
            </Paragraph>
          </div>

          <div style={{ textAlign: 'center', padding: '20px', marginTop: '30px' }}>
            <Button
              type="primary"
              size="large"
              onClick={showModal}
              style={{
                background: '#0052cc',
                borderColor: '#0052cc',
                borderRadius: '4px',
                fontSize: '16px',
                height: '40px',
                width: '100%',
                maxWidth: '300px',
              }}
            >
              Connect Password Managers
            </Button>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '400px',
            fontSize: '24px',
            color: '#666',
          }}
        >
          Vault Hub Setup (Placeholder)
        </div>
      )}

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '24px', color: '#0052cc', marginRight: '10px' }}>D</span>
            <span style={{ fontWeight: 'bold' }}>Dockly</span>
          </div>
        }
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button
            key="launch"
            type="primary"
            onClick={handleCancel}
            style={{ background: '#0052cc', borderColor: '#0052cc' }}
          >
            Launch Connection Wizard
          </Button>,
        ]}
        style={{ borderRadius: '8px' }}
      >
        <Paragraph style={{ fontSize: '16px', color: '#666' }}>
          Let's connect your preferred password managers like 1Password, LastPass, or Bitwarden to Dockly.
        </Paragraph>
      </Modal>
    </Card>
  );
};

const VaultInfoCard = (props: any) => {
  const { title, description, icon, style } = props;
  return (
    <Card
      variant="outlined"
      hoverable
      style={{
        width: '100%',
        maxWidth: 650,
        marginBottom: 0,
        ...style,
      }}
    >
      <Title level={4} style={{ display: 'flex', alignItems: 'center' }}>
        {icon}
        <span style={{ marginLeft: 8 }}>{title}</span>
      </Title>
      <Paragraph style={{ fontSize: 16 }}>{description}</Paragraph>
    </Card>
  );
};

export default VaultIntroBoard;
