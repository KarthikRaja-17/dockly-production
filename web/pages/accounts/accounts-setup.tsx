
'use client';
import React, { useEffect, useState } from 'react';
import { Card, Button, Typography, Row, Col, Modal } from 'antd';
import {
  ArrowRightOutlined,
  BookOutlined,
  SafetyOutlined,
  AppstoreOutlined,
  TeamOutlined,
} from '@ant-design/icons';

import 'antd/dist/reset.css';
import { useRouter } from 'next/navigation';
import { useGlobalLoading } from '../../app/loadingContext';

const { Title, Paragraph } = Typography;

const AccountsIntroBoard: React.FC = () => {
  const [isAccountsUser, setIsAccountsUser] = useState(false);
  const { loading, setLoading } = useGlobalLoading();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, [])

  const handleGetStarted = async () => {
    setLoading(true);
    try {
      setTimeout(() => {
        setIsAccountsUser(true);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error setting up accounts hub:', error);
      setLoading(false);
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleSubmit = () => {
    localStorage.setItem("account", "1");
    router.push(`/${username}/accounts`);
  };

  return (
    <Card style={{ padding: '0px 24px' }} loading={loading}>
      {!isAccountsUser ? (
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
              marginTop: 75,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Col xs={24} md={12}>
              <img
                src="/manager/accounts.png"
                alt="Accounts Illustration"
                style={{
                  width: '100%',
                  maxWidth: '100%',
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
                      [Accounts Illustration Placeholder]
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
                <Title level={1}>Welcome to Your Accounts Hub</Title>
                <Paragraph style={{ maxWidth: 500, fontSize: 18 }}>
                  Your secure dashboard for managing all your online accounts, bookmarks, and credentials in one organized place.
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
              <AccountInfoCard
                icon={<BookOutlined />}
                title="Bookmark Integration"
                description="Import your browser bookmarks to quickly set up and organize all your important accounts in Dockly."
              />
            </Col>

            <Col xs={24} sm={12}>
              <AccountInfoCard
                icon={<SafetyOutlined />}
                title="Security Monitor"
                description="Get password health monitoring and security alerts across all your connected accounts."
              />
            </Col>

            <Col xs={24} sm={12}>
              <AccountInfoCard
                icon={<AppstoreOutlined />}
                title="Organized Boards"
                description="Group your accounts into custom boards for finance, entertainment, shopping, and more."
              />
            </Col>

            <Col xs={24} sm={12}>
              <AccountInfoCard
                icon={<TeamOutlined />}
                title="Family Sharing"
                description="Securely share selected accounts with family members while keeping your personal accounts private."
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
              To set up your Accounts Hub, we'll help you import your bookmarks and organize your accounts. This allows you to:
            </Paragraph>
            <ul style={{ fontSize: 16, marginLeft: 20 }}>
              <li>Quickly import accounts from your browser bookmarks</li>
              <li>Access all your accounts from one secure dashboard</li>
              <li>Monitor password health and account security status</li>
              <li>Get notifications for subscription renewals and account activity</li>
            </ul>
            <Paragraph style={{ fontSize: 16 }}>
              Your data is protected with bank-level encryption, and Dockly never stores your actual passwords.
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
              Connect Your Accounts
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
          Accounts Hub Setup (Placeholder)
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
            onClick={handleSubmit}
            style={{ background: '#0052cc', borderColor: '#0052cc' }}
          >
            Launch Connection Wizard
          </Button>,
        ]}
        style={{ borderRadius: '8px' }}
      >
        <Paragraph style={{ fontSize: '16px', color: '#666' }}>
          Ready to connect your accounts? Click below to launch the connection wizard and start organizing your accounts.
        </Paragraph>
      </Modal>
    </Card>
  );
};

const AccountInfoCard = (props: any) => {
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

export default AccountsIntroBoard;
