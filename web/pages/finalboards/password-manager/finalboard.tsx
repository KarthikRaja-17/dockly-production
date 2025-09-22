'use client';
import React  from 'react';
import { Button, Card, List, Space, Tag, Typography } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useState } from 'react';

const { Title, Text } = Typography;

const PasswordManagers: React.FC = () => {
  const connectedManagers = [
    {
      name: 'LastPass',
      connectedDate: 'Apr 15, 2025',
      lastSync: 'Today at 9:45 AM',
      status: 'Active',
    },
  ];

  const availableManagers = [
    { name: '1Password', description: 'Premium password manager' },
    { name: 'Bitwarden', description: 'Open-source password manager' },
    { name: 'Dashlane', description: 'Security & password manager' },
    { name: 'Google Passwords', description: 'Chrome password manager' },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', backgroundColor: '#f5f7fa' }}>
      <div style={{ marginBottom: '24px' }}>
        <Space align="center">
          <LockOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
          <Title level={3} style={{ margin: 0, color: '#1f1f1f', fontSize: '20px', fontWeight: 600 }}>
            Connect Password Managers
          </Title>
        </Space>
        <Text style={{ display: 'block', marginTop: '8px', color: '#595959', fontSize: '14px' }}>
         🔒 Securely access and manage your passwords across services
        </Text>
        <Text style={{ display: 'block', marginTop: '16px', color: '#595959', fontSize: '14px' }}>
          Connecting a password manager helps you securely access your accounts and track password health across all your services.
        </Text>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <Title level={4} style={{ color: '#1f1f1f', fontSize: '16px', fontWeight: 600, textTransform: 'uppercase' }}>
          Connected (1)
        </Title>
        <List
          dataSource={connectedManagers}
          renderItem={(item) => (
            <Card
              style={{
                marginBottom: '16px',
                borderRadius: '8px',
                border: '1px solid #e8ecef',
                boxShadow: 'none',
                padding: '12px',
                backgroundColor: '#fff',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: '#ff4d4f',
                      borderRadius: '4px',
                      marginRight: '12px',
                    }}
                  />
                  <div>
                    <Text strong style={{ fontSize: '16px', color: '#1f1f1f' }}>{item.name}</Text>
                    <Text style={{ display: 'block', color: '#595959', fontSize: '12px' }}>
                      Connected on {item.connectedDate}
                    </Text>
                    <Text style={{ display: 'block', color: '#595959', fontSize: '12px', marginTop: '4px' }}>
                      Last sync: {item.lastSync}
                    </Text>
                  </div>
                </div>
                <Tag
                  color="green"
                  style={{
                    borderRadius: '12px',
                    padding: '2px 8px',
                    fontSize: '12px',
                    fontWeight: 500,
                    backgroundColor: '#e6f7e6',
                    color: '#2e7d32',
                    border: 'none',
                  }}
                >
                  {item.status}
                </Tag>
              </div>
              <Space style={{ marginTop: '12px' }}>
                <Button
                  style={{
                    borderRadius: '4px',
                    border: '1px solid #d9d9d9',
                    backgroundColor: '#fff',
                    color: '#1f1f1f',
                    fontSize: '12px',
                    height: '32px',
                  }}
                >
                  Sync Now
                </Button>
                <Button
                  style={{
                    borderRadius: '4px',
                    border: '1px solid #d9d9d9',
                    backgroundColor: '#fff',
                    color: '#1f1f1f',
                    fontSize: '12px',
                    height: '32px',
                  }}
                >
                  Settings
                </Button>
                <Button
                  danger
                  style={{
                    borderRadius: '4px',
                    border: '1px solid #ff4d4f',
                    backgroundColor: '#fff',
                    color: '#ff4d4f',
                    fontSize: '12px',
                    height: '32px',
                  }}
                >
                  Disconnect
                </Button>
              </Space>
            </Card>
          )}
        />
      </div>

      <div>
        <Title level={4} style={{ color: '#1f1f1f', fontSize: '16px', fontWeight: 600, textTransform: 'uppercase' }}>
          Available To Connect
        </Title>
        <List
          dataSource={availableManagers}
          renderItem={(item) => (
            <Card
              style={{
                marginBottom: '16px',
                borderRadius: '8px',
                border: '1px solid #e8ecef',
                boxShadow: 'none',
                padding: '12px',
                backgroundColor: '#fff',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor:
                        item.name === '1Password'
                          ? '#1677ff'
                          : item.name === 'Bitwarden'
                          ? '#1677ff'
                          : item.name === 'Dashlane'
                          ? '#389e0d'
                          : '#d9d9d9',
                      borderRadius: '4px',
                      marginRight: '12px',
                    }}
                  />
                  <div>
                    <Text strong style={{ fontSize: '16px', color: '#1f1f1f' }}>{item.name}</Text>
                    <Text style={{ display: 'block', color: '#595959', fontSize: '12px' }}>{item.description}</Text>
                  </div>
                </div>
                <Button
                  type="primary"
                  style={{
                    borderRadius: '4px',
                    backgroundColor: '#1677ff',
                    border: 'none',
                    fontSize: '12px',
                    height: '32px',
                  }}
                >
                  Connect
                </Button>
              </div>
            </Card>
          )}
        />
        <Card
          style={{
            marginBottom: '16px',
            borderRadius: '8px',
            border: '1px solid #e8ecef',
            boxShadow: 'none',
            padding: '12px',
            backgroundColor: '#fff',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#d9d9d9',
                  borderRadius: '4px',
                  marginRight: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: '#595959', fontSize: '20px' }}>+</Text>
              </div>
              <div>
                <Text strong style={{ fontSize: '16px', color: '#1f1f1f' }}>Add Custom Password Manager</Text>
                <Text style={{ display: 'block', color: '#595959', fontSize: '12px' }}>
                  Connect other password managers that aren't listed
                </Text>
              </div>
            </div>
            <Button
              style={{
                borderRadius: '4px',
                border: '1px solid #d9d9d9',
                backgroundColor: '#fff',
                color: '#1f1f1f',
                fontSize: '12px',
                height: '32px',
              }}
            >
              Add Custom
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PasswordManagers;