
'use client';
import React, { useEffect, useState } from 'react';
import { Card, Button, Typography, Row, Col, Modal } from 'antd';
import {
  ArrowRightOutlined,
  FileTextOutlined,
  CheckSquareOutlined,
  TeamOutlined,
  FolderOutlined,
} from '@ant-design/icons';
import 'antd/dist/reset.css';
import { useRouter } from 'next/navigation';
import { useGlobalLoading } from '../../app/loadingContext';

const { Title, Paragraph } = Typography;

const ProjectsIntroBoard: React.FC = () => {
  const router = useRouter();
  const [isProjectUser, setIsProjectUser] = useState(false);
  const { loading, setLoading } = useGlobalLoading();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [step, setStep] = useState(1);

  const handleGetStarted = async () => {
    setLoading(true);
    try {
      setTimeout(() => {
        setIsProjectUser(true);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error setting up projects hub:', error);
      setLoading(false);
    }
  };

  const [username, setUsername] = useState<string | null>(null);
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, [])

  const showModal = () => {
    setIsModalVisible(true);
    // localStorage.setItem("health", "1");
    // router.push(`/${username}/health`);
  };



  const handleCancel = () => {
    setIsModalVisible(false);
    localStorage.setItem("projects", "1");
    router.push(`/${username}/projects`);
  };


  return (
    <Card style={{ padding: '0px 24px', margin: "40px" }} loading={loading}>
      {!isProjectUser ? (
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
                src="/manager/projectshub.png"
                alt="Projects Illustration"
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
                      [Projects Illustration Placeholder]
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
                <Title level={1}>Welcome to Your Projects Hub</Title>
                <Paragraph style={{ maxWidth: 500, fontSize: 18 }}>
                  Your central workspace for planning, tracking, and completing all your personal and family projects in one organized place.
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
              <ProjectInfoCard
                icon={<FileTextOutlined />}
                title="Project Templates"
                description="Choose from ready-made templates for common projects like weddings, home renovations, goals tracking, and more."
              />
            </Col>

            <Col xs={24} sm={12}>
              <ProjectInfoCard
                icon={<CheckSquareOutlined />}
                title="Task Management"
                description="Create, assign, and track tasks with deadlines, priorities, and progress tracking for all your projects."
              />
            </Col>

            <Col xs={24} sm={12}>
              <ProjectInfoCard
                icon={<TeamOutlined />}
                title="Collaboration"
                description="Share projects with family members or collaborators and coordinate tasks together for seamless teamwork."
              />
            </Col>

            <Col xs={24} sm={12}>
              <ProjectInfoCard
                icon={<FolderOutlined />}
                title="Document Storage"
                description="Attach important files, notes, receipts, and references to your projects for easy access when you need them."
              />
            </Col>
          </Row>

          <div style={{ marginTop: '40px', width: '100%', textAlign: 'left' }}>
            <Title level={3} style={{ color: '#1a1a1a', fontSize: '20px', fontWeight: 'bold' }}>
              Popular Project Templates
            </Title>
            <Row gutter={[24, 24]} style={{ marginTop: 10 }}>
              <Col xs={24} sm={12} md={6}>
                <Card hoverable style={{ borderRadius: '8px', border: '1px solid #e8ecef', background: '#fff' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontSize: '20px', marginRight: '8px' }}>🏡</span>
                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Home Renovation</span>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card hoverable style={{ borderRadius: '8px', border: '1px solid #e8ecef', background: '#fff' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontSize: '20px', marginRight: '8px' }}>💍</span>
                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Wedding Planning</span>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card hoverable style={{ borderRadius: '8px', border: '1px solid #e8ecef', background: '#fff' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontSize: '20px', marginRight: '8px' }}>🎯</span>
                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Goal Tracking</span>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card hoverable style={{ borderRadius: '8px', border: '1px solid #e8ecef', background: '#fff' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontSize: '20px', marginRight: '8px' }}>✈️</span>
                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Trip Planning</span>
                  </div>
                </Card>
              </Col>
            </Row>
          </div>

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
              To set up your Projects Hub, we'll guide you through creating your first project board:
            </Paragraph>
            <ul style={{ fontSize: 16, marginLeft: 20 }}>
              <li>Choose from templates or start from scratch with a custom project</li>
              <li>Define tasks, deadlines, and project milestones</li>
              <li>Connect related accounts, documents, and resources</li>
              <li>Invite family members or collaborators if needed</li>
            </ul>
            <Paragraph style={{ fontSize: 16 }}>
              Your projects will sync across all your devices and integrate with your calendar for deadline reminders.
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
              Create Your First Project
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
          Projects Hub Setup (Placeholder)
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
            key="blank"
            type="primary"
            onClick={handleCancel}
            style={{ background: '#0052cc', borderColor: '#0052cc' }}
          >
            Start with Blank Project
          </Button>,
        ]}
        style={{ borderRadius: '8px' }}
      >
        <Paragraph style={{ fontSize: '16px', color: '#666', marginBottom: '20px' }}>
          Choose a template or start with a blank project to organize your ideas, tasks, and resources.
        </Paragraph>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Button block style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ marginRight: '8px' }}>🏡</span> Home Renovation
            </Button>
          </Col>
          <Col span={12}>
            <Button block style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ marginRight: '8px' }}>💍</span> Wedding Planning
            </Button>
          </Col>
          <Col span={12}>
            <Button block style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ marginRight: '8px' }}>🎯</span> Goal Tracking
            </Button>
          </Col>
          <Col span={12}>
            <Button block style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ marginRight: '8px' }}>✈️</span> Trip Planning
            </Button>
          </Col>
        </Row>
      </Modal>
    </Card>
  );
};

const ProjectInfoCard = (props: any) => {
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

export default ProjectsIntroBoard;
