'use client'
import React, { useEffect, useState } from 'react';
import { Card, Button, Typography, Row, Col, List, Checkbox, Avatar, Space, Divider } from 'antd';
import {
  ArrowRightOutlined,
  HeartOutlined,
  FileTextOutlined,
  BellOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import 'antd/dist/reset.css';
import { useRouter } from 'next/navigation';
import { useGlobalLoading } from '../../app/loadingContext';
const { Title, Text, Paragraph } = Typography;

const HealthApp: React.FC = () => {
  const router = useRouter();
  const [view, setView] = useState<'intro' | 'wizard' | 'board'>('intro');
  const { loading, setLoading } = useGlobalLoading();
  const [step, setStep] = useState(1);
  const [selectedApp, setSelectedApp] = useState<string | null>(null);

  const apps = [
    { icon: '🍎', name: 'Apple Health', description: 'Connect to Apple Health to sync your health and fitness data from your iPhone and Apple Watch.' },
    { icon: '⌚', name: 'Fitbit', description: 'Connect your Fitbit device to sync steps, sleep, heart rate, and more with Dockly.' },
    { icon: '🏃', name: 'Garmin Connect', description: 'Connect Garmin Connect to import your activities, heart rate, and sleep data.' },
    { icon: '📱', name: 'Samsung Health', description: 'Connect Samsung Health to sync data from your Galaxy phone or Galaxy Watch.' },
    { icon: '❤️', name: 'Google Fit', description: 'Connect Google Fit to import your activities and health metrics.' },
    { icon: '⚖️', name: 'Withings Health Mate', description: 'Connect your Withings devices to sync weight, blood pressure, and sleep data.' },
  ];

  const dataOptions = [
    { icon: '👣', name: 'Steps', description: 'Daily step count and activity', checked: true },
    { icon: '😴', name: 'Sleep', description: 'Sleep duration and quality metrics', checked: true },
    { icon: '❤️', name: 'Heart Rate', description: 'Resting and active heart rate data', checked: true },
    { icon: '🏋️', name: 'Workouts', description: 'Workout sessions and exercise data', checked: true },
    { icon: '⚖️', name: 'Weight', description: 'Body weight and composition', checked: true },
    { icon: '🥗', name: 'Nutrition', description: 'Calorie intake and nutrition data', checked: false },
    { icon: '🩸', name: 'Blood Pressure', description: 'Systolic and diastolic readings', checked: false },
    { icon: '📊', name: 'Blood Glucose', description: 'Blood glucose measurements', checked: false },
  ];

  const handleGetStarted = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setView('wizard');
    }, 1000);
  };

  const handleAppSelect = (appName: string) => {
    setSelectedApp(appName);
    setStep(2);
  };

  const handleContinue = () => {
    setStep(3);
  };

  const handleAuthorize = () => {
    setStep(4);
  };

  const [username, setUsername] = useState<string | null>(null);
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, [])


  const handleFinish = () => {
    setStep(1);
    setSelectedApp(null);
    setView('board');
    localStorage.setItem("health", "1");
    router.push(`/${username}/health`);
  };

  const HealthInfoCard = ({ title, description, icon, style }: { title: string; description: string; icon: React.ReactNode; style?: React.CSSProperties }) => {
    return (
      <Card
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

  const HealthIntroBoard = () => (
    <Card style={{ padding: '0px 24px' }} loading={loading}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
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
              src="/manager/healthhub.png"
              alt="Health Illustration"
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
                    align-items: 'center',
                    justify-content: center,
                    color: #666,
                    font-size: 16px,
                  ">
                    [Health Illustration Placeholder]
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
              <Title level={1}>Welcome to Your Health Board</Title>
              <Paragraph style={{ maxWidth: 500, fontSize: 18 }}>
                Your complete health command center that helps you track, manage, and optimize your wellness in one place.
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
                onClick={handleGetStarted}
              >
                Get Started
                <ArrowRightOutlined />
              </Button>
            </div>
          </Col>
        </Row>
        <Row gutter={[24, 24]} style={{ marginTop: 30 }}>
          <Col xs={24} sm={12}>
            <HealthInfoCard
              icon={<HeartOutlined />}
              title="Fitness Tracker Integration"
              description="Connect your fitness devices and apps to automatically sync activity, sleep, and workout data."
            />
          </Col>
          <Col xs={24} sm={12}>
            <HealthInfoCard
              icon={<FileTextOutlined />}
              title="Medical Records"
              description="Store and organize your medical records, prescriptions, and insurance information securely."
            />
          </Col>
          <Col xs={24} sm={12}>
            <HealthInfoCard
              icon={<BellOutlined />}
              title="Medication Reminders"
              description="Set up personalized medication schedules with timely reminders to stay on track with your health regimen."
            />
          </Col>
          <Col xs={24} sm={12}>
            <HealthInfoCard
              icon={<TeamOutlined />}
              title="Family Health"
              description="Manage health information for family members and share relevant data with caregivers securely."
            />
          </Col>
        </Row>
        <div
          style={{
            backgroundColor: '#e6f7ff',
            padding: '20px',
            borderRadius: 8,
            marginTop: 30,
            width: '100%',
            textAlign: 'left',
          }}
        >
          <Title level={3} style={{ color: '#1890ff' }}>
            How does it work?
          </Title>
          <Paragraph style={{ fontSize: 18 }}>
            To set up your Health Board, we'll connect securely to your health and fitness apps. This allows us to:
          </Paragraph>
          <ul style={{ fontSize: 16, marginLeft: 20 }}>
            <li>Sync fitness data from apps like Apple Health, Google Fit, Fitbit, and Garmin</li>
            <li>Scan and store medical documents securely with OCR technology</li>
            <li>Track medications and get refill reminders before you run out</li>
            <li>Monitor health trends with personalized dashboards and insights</li>
          </ul>
          <Paragraph style={{ fontSize: 16 }}>
            Your health data is encrypted and protected. You control exactly what information is stored and who can access it.
          </Paragraph>
        </div>
      </div>
    </Card>
  );

  const HealthConnectionWizard = () => (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      {step === 1 && (
        <div>
          <Title level={2} style={{ textAlign: 'center', marginBottom: '20px' }}>
            Connect a Health or Fitness App
          </Title>
          <Paragraph style={{ marginBottom: '20px', textAlign: 'center' }}>
            Connect your preferred health or fitness app to automatically sync your data with Dockly's Health Board.
          </Paragraph>
          <List
            grid={{ gutter: 16, column: 2 }}
            dataSource={apps}
            renderItem={(app) => (
              <List.Item>
                <Card
                  hoverable
                  onClick={() => handleAppSelect(app.name)}
                  style={{ textAlign: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: '10px' }}
                >
                  <Avatar size={40} style={{ marginBottom: '10px' }}>
                    {app.icon}
                  </Avatar>
                  <Title level={5} style={{ margin: '10px 0' }}>
                    {app.name}
                  </Title>
                  <Text>{app.description}</Text>
                </Card>
              </List.Item>
            )}
          />
        </div>
      )}
      {step === 2 && (
        <div>
          <Title level={2} style={{ textAlign: 'center', marginBottom: '20px' }}>
            Choose Data to Sync for {selectedApp}
          </Title>
          <Title level={4} style={{ marginBottom: '20px' }}>
            Connecting to Dockly Health Board
          </Title>
          <Paragraph style={{ marginBottom: '20px' }}>
            Select which health data you want to import from {selectedApp}:
          </Paragraph>
          <List
            dataSource={dataOptions}
            renderItem={(item) => (
              <List.Item style={{ padding: '8px 0' }}>
                <Checkbox defaultChecked={item.checked}>
                  <Space>
                    <Avatar size={24} style={{ marginRight: '8px' }}>
                      {item.icon}
                    </Avatar>
                    <div>
                      <Text strong>{item.name}</Text>
                      <br />
                      <Text>{item.description}</Text>
                    </div>
                  </Space>
                </Checkbox>
              </List.Item>
            )}
          />
          <Paragraph style={{ margin: '20px 0' }}>
            <Avatar size={24} style={{ marginRight: '8px' }}>
              ℹ️
            </Avatar>
            <Text>
              Dockly never shares your health data with third parties. Your data is used only to display in your Health Board and for personalized insights.
            </Text>
          </Paragraph>
          <Button
            type="primary"
            onClick={handleContinue}
            style={{ backgroundColor: '#1890ff', borderColor: '#1890ff', marginTop: '10px' }}
          >
            Continue →
          </Button>
        </div>
      )}
      {step === 3 && (
        <div>
          <Title level={2} style={{ textAlign: 'center', marginBottom: '20px' }}>
            Connect Your {selectedApp} Account
          </Title>
          <Paragraph style={{ marginBottom: '20px' }}>
            Follow the steps to authorize {selectedApp}:
          </Paragraph>
          <Paragraph style={{ marginBottom: '20px' }}>
            <Text strong>Connect to {selectedApp}</Text>
            <br />
            You'll be redirected to {selectedApp} to authorize Dockly to access your health data.
          </Paragraph>
          <List
            dataSource={[
              { step: 1, title: `Sign in to your ${selectedApp} account`, description: 'Sign in to your account when prompted' },
              { step: 2, title: 'Approve permissions', description: 'Review and approve the data permissions you selected' },
              { step: 3, title: 'Return to Dockly', description: "You'll be automatically returned to complete setup" },
            ]}
            renderItem={(item) => (
              <List.Item style={{ padding: '8px 0' }}>
                <Space>
                  <Avatar size={24}>{item.step}</Avatar>
                  <div>
                    <Text strong>{item.title}</Text>
                    <br />
                    <Text>{item.description}</Text>
                  </div>
                </Space>
              </List.Item>
            )}
          />
          <Paragraph style={{ margin: '20px 0' }}>
            <Avatar size={24} style={{ marginRight: '8px' }}>
              ⚠️
            </Avatar>
            <Text>Make sure you have the latest version of the {selectedApp} app installed.</Text>
          </Paragraph>
          <Button
            type="primary"
            onClick={handleAuthorize}
            style={{ backgroundColor: '#1890ff', borderColor: '#1890ff', marginTop: '10px' }}
          >
            Authorize {selectedApp}
          </Button>
        </div>
      )}
      {step === 4 && (
        <div>
          <Title level={2} style={{ textAlign: 'center', marginBottom: '20px' }}>
            Successfully Connected!
          </Title>
          <Paragraph style={{ marginBottom: '20px' }}>
            Your {selectedApp} account has been connected to Dockly. Your health data will begin syncing shortly.
          </Paragraph>
          <Divider style={{ margin: '20px 0' }}>Connected Account</Divider>
          <Paragraph style={{ marginBottom: '20px' }}>
            <Text strong>{selectedApp}</Text> Connected just now • Active
          </Paragraph>
          <Divider style={{ margin: '20px 0' }}>Data Being Synced</Divider>
          <List
            dataSource={dataOptions.filter((opt) => opt.checked).map((opt) => opt.name)}
            renderItem={(item) => (
              <List.Item style={{ padding: '8px 0' }}>
                <Space>
                  <Avatar size={24} style={{ marginRight: '8px' }}>
                    {dataOptions.find((opt) => opt.name === item)?.icon}
                  </Avatar>
                  <Text>{item}</Text>
                </Space>
              </List.Item>
            )}
          />
          <Paragraph style={{ margin: '20px 0' }}>
            <Avatar size={24} style={{ marginRight: '8px' }}>
              ℹ️
            </Avatar>
            <Text>Initial sync may take a few minutes. Historical data will appear on your Health Board once syncing is complete.</Text>
          </Paragraph>
          <Button
            type="primary"
            onClick={handleFinish}
            style={{ backgroundColor: '#1890ff', borderColor: '#1890ff', marginTop: '10px' }}
          >
            Return to Health Board
          </Button>
        </div>
      )}
    </div>
  );

  const HealthBoard = () => (
    <div
      style={{
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '400px',
        fontSize: '24px',
        color: '#666',
      }}
    >
      Health Board Dashboard (Placeholder)
    </div>
  );

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      {view === 'intro' && <HealthIntroBoard />}
      {view === 'wizard' && <HealthConnectionWizard />}
      {view === 'board' && <HealthBoard />}
    </div>
  );
};

export default HealthApp;