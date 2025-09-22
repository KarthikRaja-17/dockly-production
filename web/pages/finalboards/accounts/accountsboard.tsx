'use client';
import React from 'react';
import { Card, Button, Divider, Space, Typography, List, Avatar } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface Account {
  name: string;
  icon: string;
  type: string;
}

const DocklyAccounts: React.FC = () => {
  const selectedAccounts = [
    'Chase Bank', 'Gmail', 'Amazon', 'Netflix', 'Spotify', 'Instagram', 'LinkedIn', 'Dropbox',
  ];

  const allAccounts: Account[] = [
    { name: 'Chase Bank', icon: '/manager/chase.png', type: 'Financial' },
    { name: 'Gmail', icon: '/manager/gmail.png', type: 'Email' },
    { name: 'Amazon', icon: '/manager/amazon.png', type: 'Shopping' },
    { name: 'Netflix', icon: '/manager/netflix.jpg', type: 'Entertainment' },
    { name: 'Spotify', icon: '/manager/spotify.jpg', type: 'Entertainment' },
    { name: 'Instagram', icon: '/manager/instagram.jpg', type: 'Social' },
    { name: 'LinkedIn', icon: '/manager/linkdin.jpg', type: 'Social' },
    { name: 'Dropbox', icon: '/manager/dropbox.jpg', type: 'Cloud Storage' },
  ];

  const filteredAccounts = allAccounts.filter((account) => selectedAccounts.includes(account.name));

  const categories = [
    {
      title: 'Recently Used',
      items: filteredAccounts,
    },
    {
      title: 'Financial',
      icon: '💰',
      items: filteredAccounts.filter((account) => account.type === 'Financial'),
    },
    {
      title: 'Shopping',
      icon: '🛍️',
      items: filteredAccounts.filter((account) => account.type === 'Shopping'),
    },
    {
      title: 'Entertainment',
      icon: '🎬',
      items: filteredAccounts.filter((account) => account.type === 'Entertainment'),
    },
    {
      title: 'Social',
      icon: '👥',
      items: filteredAccounts.filter((account) => account.type === 'Social'),
    },
    {
      title: 'Favorites',
      items: filteredAccounts.slice(0, 4), // Example: First 4 accounts as favorites
    },
  ].filter((category) => category.items.length > 0); // Only show categories with items

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <Title level={3} style={{ marginBottom: '20px' }}>Connected</Title>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card
          title="Connected Items"
          style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}
          extra={<Button type="link">View All</Button>}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {categories.map((category, index) => (
              <div key={index}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                  {category.icon && <span style={{ marginRight: '8px' }}>
                    <img
                    src={category.icon}
                    alt={category.title}
                    style={{ width: '50px', height: '50px', marginRight: '20px' }}
                  />
                    <img src="" alt="" />
                    </span>}
                  <Text strong>{category.title}</Text>
                </div>
                <List
                  grid={{ gutter: 16, column: 1 }}
                  dataSource={category.items}
                  renderItem={(item) => (
                    <List.Item>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar style={{ backgroundColor: '#f0f0f0', color: '#000', marginRight: '10px' }}>
                            {item.icon}
                          </Avatar>
                          <div>
                            <Text strong>{item.name}</Text>
                            <br />
                            <Text type="secondary">{item.type}</Text>
                          </div>
                        </div>
                        <Button type="link">Launch</Button>
                      </div>
                    </List.Item>
                  )}
                />
                {category.title === 'Connected Items' && (
                  <Card
                    style={{ marginTop: '20px', borderRadius: '8px' }}
                    title="Add New Item"
                  >
                    <Text>
                      Add accounts, services, websites, or bookmarks to keep track of all your important links in one place
                    </Text>
                    <div style={{ marginTop: '10px' }}>
                      <Button style={{ marginRight: '10px' }}>Add Account</Button>
                      <Button style={{ marginRight: '10px' }}>Save Bookmark</Button>
                      <Button>Create Category</Button>
                    </div>
                  </Card>
                )}
                <Divider />
              </div>
            ))}
          </Space>
        </Card>
      </Space>
    </div>
  );
};

export default DocklyAccounts;