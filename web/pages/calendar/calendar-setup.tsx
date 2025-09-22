
'use client';
import React, { useEffect, useState } from 'react';
import { Card, Button, Typography, Row, Col } from 'antd';
import {
  ArrowRightOutlined,
  CalendarOutlined,
  BellOutlined,
  TeamOutlined,
  FileDoneOutlined,
} from '@ant-design/icons';
import 'antd/dist/reset.css';

import { useRouter } from 'next/navigation';
import { useGlobalLoading } from '../../app/loadingContext';
const { Title, Paragraph } = Typography;

const CalendarIntroBoard: React.FC = () => {
  const [isCalendarUser, setIsCalendarUser] = useState(false);
  const { loading, setLoading } = useGlobalLoading();
  const [username, setUsername] = useState<string | null>(null);

  const handleGetStarted = async () => {
    setLoading(true);
    try {
      setTimeout(() => {
        setIsCalendarUser(true);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error setting up calendar hub:', error);
      setLoading(false);
    }
  };

  const router = useRouter();

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, [])
  const handlesubmit = () => {
    localStorage.setItem("calendar", "1");
    router.push(`/${username}/calendar`);
  }

  return (
    <Card style={{ padding: '0px 24px' }} loading={loading}>
      {!isCalendarUser ? (
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
                src="/manager/calendar.png"
                alt="Calendar Illustration"
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
                      [Calendar Illustration Placeholder]
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
                <Title level={1}>Welcome to Your Calendar Hub</Title>
                <Paragraph style={{ maxWidth: 500, fontSize: 18 }}>
                  Your central command center for managing all your schedules, appointments, and reminders in one place.
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
                  onClick={handlesubmit}
                >
                  Get Started
                  <ArrowRightOutlined />
                </Button>
              </div>
            </Col>
          </Row>

          <Row gutter={[24, 24]} style={{ marginTop: 30 }}>
            <Col xs={24} sm={12}>
              <CalendarInfoCard
                icon={<CalendarOutlined />}
                title="Calendar Integration"
                description="Connect and sync all your calendars in one view with events from Google, Apple, Outlook, and Yahoo."
              />
            </Col>

            <Col xs={24} sm={12}>
              <CalendarInfoCard
                icon={<BellOutlined />}
                title="Smart Notifications"
                description="Get timely reminders for upcoming events, bills, and important deadlines that matter to you."
              />
            </Col>

            <Col xs={24} sm={12}>
              <CalendarInfoCard
                icon={<TeamOutlined />}
                title="Family Sharing"
                description="Share schedules with family members and coordinate events together for better planning."
              />
            </Col>

            <Col xs={24} sm={12}>
              <CalendarInfoCard
                icon={<FileDoneOutlined />}
                title="Bill & Task Tracking"
                description="Track bill due dates, account-related events, and important tasks all in your calendar view."
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
              To set up your Calendar Hub, we'll connect securely to your calendar accounts. This allows us to:
            </Paragraph>
            <ul style={{ fontSize: 16, marginLeft: 20 }}>
              <li>Import and display all your events in one unified view</li>
              <li>Sync changes across all your connected calendars automatically</li>
              <li>Add bill due dates and financial events from your accounts</li>
              <li>Send smart notifications based on your preferences</li>
            </ul>
            <Paragraph style={{ fontSize: 16 }}>
              You'll be able to connect multiple calendar accounts including Google Calendar, Apple Calendar, Outlook, and Yahoo Calendar.
            </Paragraph>
          </div>

          <div style={{ textAlign: 'center', padding: '20px', marginTop: '30px' }}>
            <Button
              type="primary"
              size="large"
              onClick={handleGetStarted}
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
              Connect Your Calendars
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
          Calendar Hub Setup (Placeholder)
        </div>
      )}
    </Card>
  );
};

const CalendarInfoCard = (props: any) => {
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

export default CalendarIntroBoard;
function setUsername(storedUsername: string) {
  throw new Error('Function not implemented.');
}

