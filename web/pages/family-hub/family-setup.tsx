'use client';
import React, { useEffect, useState } from 'react';
import { Card, Button, Typography, Row, Col, Modal } from 'antd';
import {
  ArrowRightOutlined,
  UserOutlined,
  CalendarOutlined,
  FileTextOutlined,
  CheckSquareOutlined,
} from '@ant-design/icons';
import 'antd/dist/reset.css';

import { useRouter, useParams } from 'next/navigation';
import { useGlobalLoading } from '../../app/loadingContext';

const { Title, Paragraph } = Typography;

const FamilyIntroBoard: React.FC = () => {
  const [isFamilyUser, setIsFamilyUser] = useState(false);
  const { loading, setLoading } = useGlobalLoading();
  const [isModalVisible, setIsModalVisible] = useState(false);
  // const [showSharing, setShowSharing] = useState(false);
  const [username, setUsername] = useState<string>('');
  const router = useRouter();
  // const params = useParams();

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handleGetStarted = async () => {
    setLoading(true);
    localStorage.setItem('family-hub', '1');
    router.push(`/${username}/family-hub`);
    // try {
    //   setTimeout(() => {
    //     setIsFamilyUser(true);
    //     setLoading(false);
    //     setShowSharing(true);
    //     localStorage.setItem('family-hub', '1');
    //     router.push(`/${username}/family-hub`);
    //   }, 1000);
    // } catch (error) {
    //   console.error('Error setting up family hub:', error);
    //   setLoading(false);
    // }
  };

  const showModal = () => {
    setIsModalVisible(true);
    localStorage.setItem('family-hub', '1');
    router.push(`/${username}/family-hub`);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    localStorage.setItem('family-hub', '1');
    router.push(`/${username}/family-hub`);
  };



  return (
    <Card style={{ padding: '0 16px', width: '100%' }} loading={loading}>
      {!isFamilyUser ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              padding: '16px 0',
            }}
          >
            {/* Logo commented out */}
          </div>

          <Row
            gutter={[16, 16]}
            style={{
              marginTop: 40,
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
            }}
          >
            <Col xs={24} md={12}>
              <img
                src="/manager/familyhub.jpg"
                alt="Family Illustration"
                style={{
                  width: '100%',
                  maxWidth: '100%',
                  maxHeight: '300px',
                  borderRadius: 12,
                  objectFit: 'cover',
                }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = `
                    <div style="
                      width: 100%;
                      height: 200px;
                      background: #e8ecef;
                      borderRadius: 12px;
                      display: flex;
                      alignItems: 'center';
                      justifyContent: 'center';
                      color: #666;
                      fontSize: 14px;
                    ">
                      [Family Illustration Placeholder]
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
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  padding: '0 16px',
                }}
              >
                <Title
                  level={1}
                  style={{
                    fontSize: 'clamp(24px, 5vw, 28px)',
                    marginBottom: 16,
                  }}
                >
                  Welcome to Your Family Hub
                </Title>
                <Paragraph
                  style={{
                    maxWidth: '100%',
                    fontSize: 'clamp(14px, 4vw, 16px)',
                  }}
                >
                  Your central command center for managing family schedules, documents, tasks, and important information in one collaborative space.
                </Paragraph>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginLeft: 16,
                }}
              >
                <Button
                  type="primary"
                  size="large"
                  style={{
                    borderRadius: 10,
                    background: '#0052cc',
                    marginTop: 16,
                    padding: '8px 16px',
                    fontSize: 'clamp(14px, 3.5vw, 16px)',
                    width: '100%',
                    maxWidth: '250px',
                  }}
                  onClick={showModal}
                >
                  Get Started
                  <ArrowRightOutlined />
                </Button>
              </div>
            </Col>
          </Row>

          <Row
            gutter={[16, 16]}
            style={{
              marginTop: 24,
              width: '100%',
            }}
          >
            <Col xs={24} sm={12}>
              <FamilyInfoCard
                icon={<UserOutlined />}
                title="Family Profiles"
                description="Create profiles for each family member and customize access levels for shared information and documents."
              />
            </Col>
            <Col xs={24} sm={12}>
              <FamilyInfoCard
                icon={<CalendarOutlined />}
                title="Shared Calendar"
                description="Coordinate family schedules, events, appointments, and activities with a collaborative calendar."
              />
            </Col>
            <Col xs={24} sm={12}>
              <FamilyInfoCard
                icon={<FileTextOutlined />}
                title="Important Documents"
                description="Store and organize family records, school documents, health information, and essential paperwork."
              />
            </Col>
            <Col xs={24} sm={12}>
              <FamilyInfoCard
                icon={<CheckSquareOutlined />}
                title="Task Management"
                description="Create and assign tasks, chores, and to-do lists that the whole family can see and update."
              />
            </Col>
          </Row>

          <div
            style={{
              backgroundColor: '#e6f7ff',
              padding: '16px',
              borderRadius: 8,
              marginTop: 24,
              width: '100%',
              textAlign: 'left',
            }}
          >
            <Title
              level={3}
              style={{
                color: '#1890ff',
                fontSize: 'clamp(18px, 4.5vw, 20px)',
              }}
            >
              How does it work?
            </Title>
            <Paragraph
              style={{
                fontSize: 'clamp(14px, 4vw, 16px)',
              }}
            >
              To set up your Family Hub, we'll guide you through a few simple steps:
            </Paragraph>
            <ul
              style={{
                fontSize: 'clamp(12px, 3.5vw, 14px)',
                marginLeft: 20,
              }}
            >
              <li>Add family members and customize their profiles and access levels</li>
              <li>Connect and sync family calendars from Google, Apple, or Outlook</li>
              <li>Upload important family documents and organize them in categories</li>
              <li>Create shared task lists and set up reminder notifications</li>
            </ul>
            <Paragraph
              style={{
                fontSize: 'clamp(12px, 3.5vw, 14px)',
              }}
            >
              Your Family Hub is protected with advanced security to ensure your family's information stays private and secure.
            </Paragraph>
          </div>

          <div
            style={{
              textAlign: 'center',
              padding: '16px',
              marginTop: '24px',
              width: '100%',
            }}
          >
            <Button
              type="primary"
              size="large"
              onClick={handleGetStarted}
              style={{
                background: '#0052cc',
                borderColor: '#0052cc',
                borderRadius: '4px',
                fontSize: 'clamp(14px, 3.5vw, 16px)',
                height: '40px',
                width: '100%',
                maxWidth: '250px',
              }}
            >
              Set Up Your Family Hub
            </Button>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '300px',
            fontSize: 'clamp(18px, 5vw, 20px)',
            color: '#666',
          }}
        >
          Family Hub Setup (Placeholder)
        </div>
      )}

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: 'clamp(20px, 5vw, 22px)', color: '#0052cc', marginRight: '10px' }}>D</span>
            <span style={{ fontWeight: 'bold' }}>Dockly</span>
          </div>
        }
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button
            key="start"
            type="primary"
            onClick={handleGetStarted}
            style={{ background: '#0052cc', borderColor: '#0052cc' }}
          >
            Start Family Hub Setup
          </Button>,
        ]}
        style={{ borderRadius: '8px', width: '100%', maxWidth: '500px' }}
      >
        <Paragraph
          style={{
            fontSize: 'clamp(12px, 3.5vw, 14px)',
            color: '#666',
          }}
        >
          Ready to set up your Family Hub? Let's get started by adding family members, connecting calendars, and organizing your family's important information.
        </Paragraph>
      </Modal>
    </Card>
  );
};

const FamilyInfoCard = (props: any) => {
  const { title, description, icon, style } = props;
  return (
    <Card
      hoverable
      style={{
        width: '100%',
        marginBottom: 16,
        ...style,
      }}
    >
      <Title
        level={4}
        style={{
          display: 'flex',
          alignItems: 'center',
          fontSize: 'clamp(16px, 4vw, 18px)',
        }}
      >
        {icon}
        <span style={{ marginLeft: 8 }}>{title}</span>
      </Title>
      <Paragraph
        style={{
          fontSize: 'clamp(12px, 3.5vw, 14px)',
        }}
      >
        {description}
      </Paragraph>
    </Card>
  );
};

export default FamilyIntroBoard;