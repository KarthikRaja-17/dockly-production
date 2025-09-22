
'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  Typography,
  Select,
  Input,
  Button,
  Row,
  Col,
  Checkbox,
  Progress,
  Space,
  Statistic,
  Divider,
} from 'antd';
import {
  LockOutlined,
  CheckCircleOutlined,
  CheckOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import MainLayout from '../../../pages/components/layout/mainLayout';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;
const { Option } = Select;

const steps = ['Selection', 'Setup', 'Integration', 'Complete'];

const PasswordSetupWizard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPasswordManager, setSelectedPasswordManager] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  interface PasswordManager {
    name: string;
    price: string;
    description: string;
    icon: string;
  }

  const [selectedManagerData, setSelectedManagerData] = useState<PasswordManager | null>(null);

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const handleReturnToDashboard = () => {
    const dataToDisplay = `
      Collected Data:
      Password Manager: ${selectedManagerData?.name || 'Not selected'}
      Price: ${selectedManagerData?.price || 'N/A'}
      Description: ${selectedManagerData?.description || 'N/A'}
      Email: ${email || 'Not provided'}
    `;
    alert(dataToDisplay); // Using alert to display data; alternatively, this could be logged or shown in a modal
    console.log(dataToDisplay);
  };

  const passwordManagers = [
    { name: '1Password', price: '$36/year', description: 'Best overall option for most users', icon: '/api/placeholder/48/48' },
    { name: 'Bitwarden', price: '$12/year', description: 'Great free option with premium features', icon: '/api/placeholder/48/48' },
    { name: 'LastPass', price: '$36/year', description: 'Popular choice with wide compatibility', icon: '/api/placeholder/48/48' },
    { name: 'Dashlane', price: '$40/year', description: 'Advanced features for security', icon: '/api/placeholder/48/48' },
    { name: 'Google Passwords', price: 'Free', description: 'Integrated with Google services', icon: '/api/placeholder/48/48' },
    { name: 'Apple Keychain', price: 'Free', description: 'Built-in for Apple devices', icon: '/api/placeholder/48/48' },
  ];

  const renderHeader = () => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 30px', borderBottom: '1px solid #e5e7eb' }}>
      <div style={{ fontSize: '22px', fontWeight: 700, color: '#3355ff' }}>Dockly</div>
      <div style={{ flex: 1, marginLeft: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {steps.map((label, i) => (
            <div key={label} style={{ textAlign: 'center', flex: 1, position: 'relative' }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '12px',
                backgroundColor: i === currentStep ? '#3355ff' : i < currentStep ? '#10b981' : '#f0f4f8',
                color: i <= currentStep ? 'white' : '#6b7280',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                fontSize: '12px',
                fontWeight: 600,
                zIndex: 2,
                position: 'relative',
              }}>
                {i < currentStep ? <CheckOutlined /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  left: '50%',
                  width: '100%',
                  height: '4px',
                  backgroundColor: i < currentStep ? '#10b981' : '#e5e7eb',
                  zIndex: 1,
                }} />
              )}
              <Text style={{ fontSize: '12px', color: i === currentStep ? '#3355ff' : '#6b7280' }}>{label}</Text>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSelectionStep = () => (
    <>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
        <Title level={3} style={{ margin: '0', marginRight: '8px' }}>Let's set up your password manager</Title>
      </div>
      <Text type="secondary" style={{ display: 'block', marginBottom: '24px' }}>
        Dockly works best with a password manager for secure, cross-device access to all your accounts.
      </Text>
      <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px', borderRadius: '8px', marginBottom: '32px' }}>
        <LockOutlined style={{ fontSize: '20px', color: '#16a34a', marginRight: '12px' }} />
        <Text style={{ color: '#16a34a' }}>
          <strong>Security first.</strong> Dockly never stores your actual passwords - we work with your password manager to keep your accounts secure.
        </Text>
      </div>
      <div style={{ marginBottom: '24px' }}>
        <Text strong style={{ fontSize: '16px' }}>Which password manager do you currently use?</Text>
      </div>
      <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
        {passwordManagers.map(({ name, icon }) => (
          <Col span={8} key={name}>
            <Card
              hoverable
              style={{
                textAlign: 'center',
                borderRadius: '12px',
                border: selectedPasswordManager === name ? '2px solid #8b5cf6' : '1px solid #d1d5db',
              }}
              onClick={() => {
                const selected = passwordManagers.find(manager => manager.name === name);
                setSelectedPasswordManager(name);
                setSelectedManagerData(selected ?? null);
              }}
            >
              <div style={{ marginBottom: '12px' }}>
                <img src={icon} alt={name} />
              </div>
              <Text strong>{name}</Text>
            </Card>
          </Col>
        ))}
      </Row>
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={12}>
          <label style={{ fontSize: '14px', fontWeight: 500, display: 'block', marginBottom: '8px' }}>
            I use multiple password managers
          </label>
          <Select defaultValue="Select additional..." style={{ width: '100%' }}>
            {passwordManagers.map(manager => (
              <Option key={manager.name} value={manager.name}>{manager.name}</Option>
            ))}
          </Select>
        </Col>
        <Col span={12}>
          <label style={{ fontSize: '14px', fontWeight: 500, display: 'block', marginBottom: '8px' }}>
            Other (please specify)
          </label>
          <Input placeholder="Enter name..." />
        </Col>
      </Row>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <Button
          type="primary"
          onClick={() => setCurrentStep(1)}
        >
          I don't use a password manager yet. Help me choose one
        </Button>
      </div>
    </>
  );

  const renderSetupStep = () => (
    <>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
        <Title level={3} style={{ margin: '0', marginRight: '8px' }}>Choose a password manager</Title>
      </div>
      <Text type="secondary" style={{ display: 'block', marginBottom: '24px' }}>
        A good password manager is essential for your online security and works across all your devices.
      </Text>
      <div style={{ marginBottom: '32px' }}>
        <Text strong style={{ fontSize: '16px', marginBottom: '16px', display: 'block' }}>
          Why use a password manager?
        </Text>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card style={{ borderRadius: '12px', backgroundColor: '#eff6ff' }}>
              <Text style={{ color: '#2563eb' }}>Store unique, strong passwords for all your accounts</Text>
            </Card>
          </Col>
          <Col span={12}>
            <Card style={{ borderRadius: '12px', backgroundColor: '#eff6ff' }}>
              <Text style={{ color: '#2563eb' }}>Sync across all your devices (phone, tablet, computer)</Text>
            </Card>
          </Col>
          <Col span={12}>
            <Card style={{ borderRadius: '12px', backgroundColor: '#eff6ff' }}>
              <Text style={{ color: '#2563eb' }}>Protect against data breaches and hacking attempts</Text>
            </Card>
          </Col>
          <Col span={12}>
            <Card style={{ borderRadius: '12px', backgroundColor: '#eff6ff' }}>
              <Text style={{ color: '#2563eb' }}>Auto-fill logins for quick, easy access</Text>
            </Card>
          </Col>
        </Row>
      </div>
      <Text strong style={{ fontSize: '16px', marginBottom: '16px', display: 'block' }}>
        Top recommended password managers
      </Text>
      <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
        {passwordManagers.slice(0, 3).map(({ name, price, description, icon }) => (
          <Col span={8} key={name}>
            <Card
              hoverable
              style={{
                textAlign: 'center',
                borderRadius: '12px',
                border: selectedPasswordManager === name ? '2px solid #8b5cf6' : '1px solid #d1d5db',
              }}
              onClick={() => {
                const selected = passwordManagers.find(manager => manager.name === name);
                setSelectedPasswordManager(name);
                setSelectedManagerData(selected ?? null);
              }}
            >
              <div style={{ marginBottom: '12px' }}>
                <img src={icon} alt={name} />
              </div>
              <Text strong>{name}</Text>
              <Text style={{ display: 'block', color: '#6b7280', marginTop: '4px' }}>{price}</Text>
              <Text style={{ display: 'block', color: '#16a34a', marginTop: '4px' }}>{description}</Text>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );

  const renderIntegrationStep = () => {
    const selectedManager = selectedPasswordManager || '1Password';
    return (
      <>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <Title level={3} style={{ margin: '0', marginRight: '8px' }}>
            Connect {selectedManager} with Dockly
          </Title>
        </div>
        <Text type="secondary" style={{ display: 'block', marginBottom: '24px' }}>
          Your passwords stay private. Dockly never stores your actual passwords—we integrate with {selectedManager} for safe and easy access.
        </Text>
        <div style={{ marginBottom: '32px' }}>
          <Select defaultValue="Browser Extension (Recommended)" style={{ width: '100%', marginBottom: '16px' }}>
            <Option value="Browser Extension (Recommended)">Browser Extension (Recommended)</Option>
            <Option value={`${selectedManager} CLI (Advanced)`}>{selectedManager} CLI (Advanced)</Option>
            <Option value="Manual (No integration)">Manual (No integration)</Option>
          </Select>
          <div style={{ marginBottom: '16px' }}>
            <Text strong style={{ display: 'block', marginBottom: '8px' }}>{selectedManager} Account Email</Text>
            <Input
              placeholder="Enter email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <Text>Enable auto-fill when using Dockly</Text>
          </div>
          <Checkbox checked>Allow password health monitoring in Dockly</Checkbox>
          <Checkbox checked>Save new accounts created in {selectedManager}</Checkbox>
          <Checkbox checked>
            To complete this integration, we'll need permission from your {selectedManager} browser extension. You'll see a popup requesting access when you click "Connect".
          </Checkbox>
        </div>
        <Divider>Integration Status</Divider>
        <Text>{selectedManager} App on this device</Text>
        <Text>{selectedManager} browser extension</Text>
        <Text>{selectedManager} integration with Dockly pending</Text>
      </>
    );
  };

  const renderCompleteStep = () => {
    const selectedManager = selectedPasswordManager || '1Password';
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
          <CheckCircleOutlined style={{ fontSize: '64px', color: '#10b981', marginRight: '16px' }} />
          <div>
            <Title level={3} style={{ margin: '0' }}>Password manager successfully set up!</Title>
          </div>
        </div>
        <Text style={{ display: 'block', marginBottom: '24px' }}>
          Your {selectedManager} account is now connected to Dockly. You're ready to start managing all your accounts securely from one place.
        </Text>
        <Row gutter={16} style={{ marginBottom: '32px', justifyContent: 'center' }}>
          <Col>
            <Statistic title="Passwords managed" value={34} />
          </Col>
          <Col>
            <Statistic title="Password health score" value={85} suffix="%" />
          </Col>
        </Row>
        {selectedManagerData && (
          <div style={{ marginBottom: '32px' }}>
            <Text strong style={{ display: 'block', marginBottom: '8px' }}>Selected Password Manager Details</Text>
            <Text style={{ display: 'block' }}>Name: {selectedManagerData.name}</Text>
            <Text style={{ display: 'block' }}>Price: {selectedManagerData.price}</Text>
            <Text style={{ display: 'block' }}>Description: {selectedManagerData.description}</Text>
          </div>
        )}
        <Text strong style={{ display: 'block', marginBottom: '16px' }}>Next Steps to Secure Your Accounts</Text>
        <Space direction="vertical" size="middle" style={{ width: '100%', textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
          <Text>
            <InfoCircleOutlined style={{ marginRight: '8px', color: '#2563eb' }} />
            Install the {selectedManager} app on all your devices
          </Text>
          <Text>
            <InfoCircleOutlined style={{ marginRight: '8px', color: '#2563eb' }} />
            Fix the 5 weak passwords identified in your accounts
          </Text>
          <Text>
            <InfoCircleOutlined style={{ marginRight: '8px', color: '#2563eb' }} />
            Enable two-factor authentication for your critical accounts
          </Text>
        </Space>
      </div>
    );
  };

  const renderContent = () => {
    switch (currentStep) {
      case 0: return renderSelectionStep();
      case 1: return renderSetupStep();
      case 2: return renderIntegrationStep();
      case 3: return renderCompleteStep();
      default: return null;
    }
  };
  const [username, setUsername] = useState<string>("");
    console.log("🚀 ~ PasswordSetupWizard ~ username:", username)
    const router = useRouter();
  
    useEffect(() => {
      const username = localStorage.getItem("username") || "";
      setUsername(username);
      if (localStorage.getItem('password-manager') === null) {
        router.push(`/${username}/password-manager/setup`);
      }
    }, []);

  const isNextDisabled = () => {
    if (currentStep === 0 || currentStep === 1) {
      return !selectedPasswordManager;
    }
    if (currentStep === 2) {
      return !email.trim();
    }
    return false;
  };

  return (
    <div style={{ maxWidth: '1400px', margin: "80px 10px 10px 60px", padding: '20px', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)' }}>
      {renderHeader()}
      <div style={{ padding: '40px' }}>{renderContent()}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
          {currentStep > 0 && (
            <>
              {currentStep === 1 && (
                <Button type="link" style={{ color: '#3355ff', marginBottom: '8px' }} onClick={handleBack}>
                  Compare all features
                </Button>
              )}
              <Button onClick={handleBack} style={{ marginRight: '16px' }}>
                Back
              </Button>
            </>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {currentStep === 2 && (
            <Button onClick={handleNext} style={{ marginRight: '16px' }}>
              Skip
            </Button>
          )}
          {currentStep < steps.length - 1 && (
            <Button
              type="primary"
              onClick={handleNext}
              disabled={isNextDisabled()}
            >
              {currentStep === 2 ? 'Connect' : 'Continue'}
            </Button>
          )}
          {currentStep === steps.length - 1 && (
            <Button
              type="primary"
              onClick={handleReturnToDashboard}
            >
              Return to Dashboard
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
export default PasswordSetupWizard;

