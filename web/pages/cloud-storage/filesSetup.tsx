// ```tsx
'use client';
import React, { useEffect, useState } from 'react';
import { Card, Button, Typography, Row, Col, Modal } from 'antd';
import {
  ArrowRightOutlined,
  CloudOutlined,
  SearchOutlined,
  FolderOpenOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import 'antd/dist/reset.css';
import { useRouter } from 'next/navigation';
import { useGlobalLoading } from '../../app/loadingContext';
const { Title, Paragraph } = Typography;

const FilesIntroBoard: React.FC = () => {
  const router = useRouter();
  const [isFilesUser, setIsFilesUser] = useState(false);
  const { loading, setLoading } = useGlobalLoading();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleGetStarted = async () => {
    setLoading(true);
    try {
      setTimeout(() => {
        setIsFilesUser(true);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error setting up files hub:', error);
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
    localStorage.setItem("cloud-storage", "1");
    router.push(`/${username}/cloud-storage`);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    localStorage.setItem("cloud-storage", "1");
    router.push(`/${username}/cloud-storage`);
  };

  return (
    <Card style={{ padding: '0px 24px' }} loading={loading}>
      {!isFilesUser ? (
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
                src="/manager/fileshub.webp"
                alt="Files Illustration"
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
                      [Files Illustration Placeholder]
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
                <Title level={1}>Welcome to Your Files Hub</Title>
                <Paragraph style={{ maxWidth: 500, fontSize: 18 }}>
                  Your unified dashboard for managing all your cloud storage services, documents, and files in one organized place.
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
              <FilesInfoCard
                icon={<CloudOutlined />}
                title="Multi-Cloud Integration"
                description="Connect and access Google Drive, Dropbox, OneDrive, and iCloud in a single view without switching apps."
              />
            </Col>

            <Col xs={24} sm={12}>
              <FilesInfoCard
                icon={<SearchOutlined />}
                title="Universal Search"
                description="Find your files instantly with powerful search across all your connected cloud storage accounts."
              />
            </Col>

            <Col xs={24} sm={12}>
              <FilesInfoCard
                icon={<FolderOpenOutlined />}
                title="Smart Organization"
                description="Categorize documents by type, project, or board regardless of which cloud service they're stored in."
              />
            </Col>

            <Col xs={24} sm={12}>
              <FilesInfoCard
                icon={<TeamOutlined />}
                title="Family Sharing"
                description="Securely share selected documents with family members while maintaining privacy for personal files."
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
              Setting up your Files Hub is simple. We'll help you connect your cloud storage accounts securely. This allows you to:
            </Paragraph>
            <ul style={{ fontSize: 16, marginLeft: 20 }}>
              <li>Access all your files from different cloud services in one dashboard</li>
              <li>Search across services to find any document instantly</li>
              <li>Organize important documents by categories relevant to your life</li>
              <li>Get notifications for storage limits, shared files, and important document updates</li>
            </ul>
            <Paragraph style={{ fontSize: 16 }}>
              Your data remains secure, as Dockly only requests access permissions to help you organize and access your files.
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
              Connect Your Storage Accounts
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
          Files Hub Setup (Placeholder)
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
          Ready to connect your cloud storage? Click below to launch the connection wizard and start organizing your files from multiple cloud services.
        </Paragraph>
      </Modal>
    </Card>
  );
};

const FilesInfoCard = (props: any) => {
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

export default FilesIntroBoard;
