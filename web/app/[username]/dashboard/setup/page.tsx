'use client';
import { Button, Card, Col, Grid, Layout, Row, Space, Tag, Typography } from "antd";
import { GoogleOutlined } from "@ant-design/icons";
import React, { useEffect } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Settings, Mail, Apple, Zap, Calendar1Icon } from "lucide-react";
import CalendarView from "../../../../pages/components/CalendarSection";
import { ArrowRightIcon, BookmarkIcon, CheckCircleIcon, ChevronRightIcon, CloudIcon, DollarSignIcon, FileTextIcon, FolderOpenIcon, HeartIcon, HomeIcon, MapPinIcon, ShieldIcon, SparklesIcon, UsersIcon, ZapIcon } from "../../../../pages/components/icons";
import { useCurrentUser } from "../../../userContext";

const { Header, Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { useBreakpoint } = Grid;

const CalendarIcon = Calendar1Icon;

const DashboardSetup = () => {
    const router = useRouter();
    const [activeStep, setActiveStep] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const screens = useBreakpoint();
    const currentUser = useCurrentUser();
    const currentUserName = currentUser?.user_name || ""

    const hubs = [
        { icon: CalendarIcon, name: 'Planner', description: 'Unified calendar and to-do lists for everything', color: 'linear-gradient(to right, #2b6cb069, #2c7a7b69)' },
        { icon: BookmarkIcon, name: 'Accounts', description: 'Easy access to all your frequently visited sites', color: 'linear-gradient(to right, #2c7a7b69, #2f855a69)' },
        { icon: ShieldIcon, name: 'Vault', description: 'Unified password manager with secure access', color: 'linear-gradient(to right, #b7791f69, #c5303069)' },
    ];

    const boards = [
        { icon: UsersIcon, name: 'Family', description: 'Shared planning and digital legacy management', color: 'linear-gradient(to right, #b8328069, #9f123969)' },
        { icon: HomeIcon, name: 'Home', description: 'Property management and maintenance tracking', color: 'linear-gradient(to right, #4c51bf69, #6b46c169)' },
        { icon: DollarSignIcon, name: 'Finance', description: 'Complete financial dashboard and budgeting', color: 'linear-gradient(to right, #05966969, #2c7a7b69)' },
        { icon: HeartIcon, name: 'Health', description: 'Health tracking and medical records', color: 'linear-gradient(to right, #c5303069, #b8328069)' },
        { icon: MapPinIcon, name: 'Lifestyle', description: 'Travel, hobbies, and personal interests', color: 'linear-gradient(to right, #d9770669, #dd6b2069)' },
        { icon: FolderOpenIcon, name: 'Projects', description: 'Collaborative project management workspace', color: 'linear-gradient(to right, #6b46c169, #9748d169)' },
    ];

    const steps = [
        {
            title: 'Connect Your Digital Life',
            description: 'Link your calendars, accounts, and services',
            icon: ZapIcon,
            features: ['Google Calendar', 'Microsoft Outlook', 'Apple iCloud', 'Social Accounts'],
        },
        {
            title: 'Organize Your Data',
            description: 'Set up your Hubs for centralized management',
            icon: CloudIcon,
            features: ['File Storage', 'Password Manager', 'Bookmarks', 'Documents'],
        },
        {
            title: 'Customize Your Boards',
            description: 'Create specialized workspaces for different areas of life',
            icon: SparklesIcon,
            features: ['Family Planning', 'Financial Tracking', 'Health Records', 'Project Management'],
        },
    ];
    const [username, setUsername] = useState<string | null>(null);
    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            setUsername(storedUsername);
        }
    }, [])
    const handlesubmit = () => {
        // localStorage.setItem("dashboard", "1");
        // router.push(`/${username}/dashboard`);
        setIsOpen(true)
    }

    return (
        <Layout style={{ minHeight: '100vh', background: '#fff', overflow: 'hidden', marginTop: '-40px' }}>
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-160px', right: '-160px', width: '320px', height: '320px', background: '#6b46c1', borderRadius: '50%', mixBlendMode: 'multiply', filter: 'blur(64px)', opacity: 0.1, animation: 'pulse 5s infinite' }}></div>
                {/* <div style={{ position: 'absolute', bottom: '-160px', left: '-160px', width: '320px', height: '320px', background: '#2b6cb0', borderRadius: '50%', mixBlendMode: 'multiply', filter: 'blur(64px)', opacity: 0.1, animation: 'pulse 5s infinite 1s' }}></div> */}
                <div style={{ position: 'absolute', top: '160px', left: '50%', width: '240px', height: '240px', background: '#2c7a7b', borderRadius: '50%', mixBlendMode: 'multiply', filter: 'blur(64px)', opacity: 0.1, animation: 'pulse 5s infinite 2s' }}></div>
            </div>

            <style>{`
            @keyframes pulse {
              0% { transform: scale(1); opacity: 0.1; }
              50% { transform: scale(1.15); opacity: 0.2; }
              100% { transform: scale(1); opacity: 0.1; }
            }
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-8px); }
            }
          `}</style>

            <Content style={{ padding: '48px 24px', position: 'relative', zIndex: 10 }}>
                {/* Hero Section */}
                <div style={{ maxWidth: '1280px', margin: '0 auto', textAlign: 'center' }}>
                    {/* <Tag color="purple" icon={<StarIcon style={{ verticalAlign: 'middle', marginRight: '8px', color: '#d97706' }} />} style={{ marginBottom: '32px', padding: '8px 16px', borderRadius: '999px', background: '#f3e8ff', color: '#6b46c1', fontSize: '14px' }}>
                        Connect and Organize Your Digital Life
                    </Tag> */}
                    <Row
                        gutter={24}
                        style={{
                            marginTop: 75,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Title level={1} style={{ fontSize: screens.md ? '62px' : '48px', color: '#1f2937', marginBottom: '24px', fontWeight: 'bold', lineHeight: 1.1 }}>
                            Welcome to <span style={{ background: 'linear-gradient(to right, #9748d1, #b83280, #2b6cb0)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>Dockly</span>
                        </Title>
                        <Paragraph style={{ fontSize: screens.md ? '20px' : '20px', color: '#4b5563', marginBottom: '48px', maxWidth: '768px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
                            Your complete digital command center. Manage everything from calendars and finances to family planning and personal projects - all in one beautifully organized place.
                        </Paragraph>
                    </Row>
                    <Space direction={screens.sm ? 'horizontal' : 'vertical'} size="middle" style={{ marginBottom: '64px', justifyContent: 'center' }}>
                        <Button onClick={handlesubmit} type="primary" size="large" style={{ background: 'linear-gradient(to right, #6b46c1, #2b6cb0)', border: 'none', padding: '12px 32px', borderRadius: '12px', fontSize: '18px', fontWeight: '600', transition: 'all 0.3s', transform: 'scale(1)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} >
                            Get Started  <span style={{ marginLeft: '8px', transition: 'transform 0.3s', display: 'inline-block' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}><ArrowRightIcon /></span>
                        </Button>
                        <Button size="large" style={{ border: '1px solid #d1d5db', color: '#1f2937', padding: '12px 32px', borderRadius: '12px', fontSize: '18px', fontWeight: '600', background: '#f9fafb', transition: 'all 0.3s', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} >
                            Watch Demo
                        </Button>
                    </Space>
                    <Card style={{ maxWidth: '1126px', margin: '0 auto', background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 8px 32px rgba(0,0,0,0.05)', padding: '32px' }}>
                        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                            {[
                                { icon: CalendarIcon, label: 'Planner', active: true },
                                { icon: DollarSignIcon, label: 'Finance', active: false },
                                { icon: FileTextIcon, label: 'Files', active: false },
                                { icon: UsersIcon, label: 'Family', active: false },
                            ].map((item, index) => (
                                <Col xs={12} md={6} key={index}>
                                    <div style={{
                                        padding: '16px',
                                        borderRadius: '12px',
                                        background: item.active ? 'linear-gradient(to right, #6b46c1, #2b6cb0)' : '#f9fafb',
                                        color: item.active ? '#fff' : '#4b5563',
                                        textAlign: 'center',
                                        transition: 'all 0.3s',
                                        cursor: 'pointer',
                                        boxShadow: item.active ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                                    }} onMouseEnter={e => {
                                        if (!item.active) (e.target as HTMLElement).style.background = '#e5e7eb';
                                    }} onMouseLeave={e => {
                                        if (!item.active) (e.target as HTMLElement).style.background = '#f9fafb';
                                    }}>
                                        {React.createElement(item.icon, { style: { width: '24px', height: '24px' } })}
                                        <Text style={{ fontSize: '14px', fontWeight: '500', color: item.active ? '#fff' : 'black', marginLeft: 4 }}>{item.label}</Text>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                        <Text style={{ color: '#6b7280', fontSize: '14px' }}>
                            {/* <CalendarSection />
                             */}
                            <CalendarView />
                        </Text>
                    </Card>
                </div>

                {/* Getting Started Steps */}
                <div style={{ maxWidth: '1280px', margin: '80px auto', background: '#f9fafb', padding: '48px', borderRadius: '16px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                        <Title level={2} style={{ fontSize: screens.md ? '48px' : '36px', color: '#1f2937', marginBottom: '16px', fontWeight: 'bold' }}>
                            Get Started in Minutes
                        </Title>
                        <Paragraph style={{ fontSize: '20px', color: '#4b5563', maxWidth: '640px', margin: '0 auto', lineHeight: 1.6 }}>
                            Simple setup process to connect all your digital services and create your personal command center
                        </Paragraph>
                    </div>
                    <Row gutter={[32, 32]}>
                        {steps.map((step, index) => (
                            <Col xs={24} md={8} key={index}>
                                <Card
                                    style={{
                                        background: activeStep === index ? '#ede9fe' : '#fff',
                                        border: activeStep === index ? '1px solid #6b46c1' : '1px solid #e5e7eb',
                                        borderRadius: '16px',
                                        padding: '32px',
                                        transition: 'all 0.5s',
                                        transform: activeStep === index ? 'scale(1.05)' : 'scale(1)',
                                        boxShadow: activeStep === index ? '0 8px 32px rgba(0,0,0,0.1)' : 'none',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={() => setActiveStep(index)}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', background: 'linear-gradient(to right, #6b46c1, #2b6cb0)', borderRadius: '16px', marginBottom: '24px', animation: activeStep === index ? 'bounce 1s infinite' : 'none' }}>
                                        {React.createElement(step.icon, { style: { color: '#fff', width: '32px', height: '32px' } })}
                                    </div>
                                    <Title level={3} style={{ color: '#1f2937', marginBottom: '16px', fontWeight: 'bold', fontSize: '24px' }}>{step.title}</Title>
                                    <Paragraph style={{ color: '#4b5563', marginBottom: '24px', lineHeight: 1.6, fontSize: '16px' }}>{step.description}</Paragraph>
                                    <Space direction="vertical" size="small">
                                        {step.features.map((feature, featureIndex) => (
                                            <div key={featureIndex} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <CheckCircleIcon style={{ color: '#2f855a', width: '16px', height: '16px' }} />
                                                <Text style={{ color: '#4b5563', fontSize: '14px' }}>{feature}</Text>
                                            </div>
                                        ))}
                                    </Space>
                                    <div style={{ position: 'absolute', top: '16px', right: '16px', color: '#6b46c1', fontWeight: 'bold', fontSize: '24px' }}>{index + 1}</div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>

                {/* Hubs Section */}
                <div style={{ maxWidth: '1280px', margin: '80px auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                        <Title level={2} style={{ fontSize: screens.md ? '48px' : '36px', color: '#1f2937', marginBottom: '16px', fontWeight: 'bold' }}>
                            Powerful <span style={{ background: 'linear-gradient(to right, #9748d1, #2b6cb0)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>Hubs</span>
                        </Title>
                        <Paragraph style={{ fontSize: '20px', color: '#4b5563', maxWidth: '640px', margin: '0 auto', lineHeight: 1.6 }}>
                            Centralized utilities that bring together all your digital services and data
                        </Paragraph>
                    </div>
                    <Row gutter={[24, 24]}>
                        {hubs.map((hub, index) => (
                            <Col xs={24} md={12} lg={8} key={index}>
                                <Card
                                    style={{
                                        background: '#fff',
                                        borderRadius: '16px',
                                        border: '1px solid #e5e7eb',
                                        padding: '32px',
                                        transition: 'all 0.3s',
                                        transform: 'scale(1)',
                                        boxShadow: '0 4px 16px rgba(0,0,0,0.05)'
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.transform = 'scale(1.05)';
                                        e.currentTarget.style.border = '1px solid #d1d5db';
                                        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.border = '1px solid #e5e7eb';
                                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.05)';
                                    }}
                                >
                                    <div style={{ width: '56px', height: '56px', background: hub.color, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', transition: 'transform 0.3s' }} onMouseEnter={e => (e.target as HTMLElement).style.transform = 'scale(1.1)'} onMouseLeave={e => (e.target as HTMLElement).style.transform = 'scale(1)'}>
                                        <hub.icon style={{ color: '#fff', width: '28px', height: '28px' }} />
                                    </div>
                                    <Title level={3} style={{ color: '#1f2937', marginBottom: '12px', fontWeight: 'bold', fontSize: '24px' }}>{hub.name}</Title>
                                    <Paragraph style={{ color: '#4b5563', marginBottom: '16px', lineHeight: 1.6, fontSize: '16px' }}>{hub.description}</Paragraph>
                                    <div style={{ display: 'flex', alignItems: 'center', color: '#6b46c1', fontWeight: '500', transition: 'transform 0.3s' }} >
                                        <Text style={{ color: '#6b46c1', fontSize: '14px' }}>Learn more</Text>
                                        <ChevronRightIcon style={{ width: '16px', height: '16px', marginLeft: '4px' }} />
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>

                {/* Boards Section */}
                <div style={{ maxWidth: '1280px', margin: '80px auto', background: '#f9fafb', padding: '48px', borderRadius: '16px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                        <Title level={2} style={{ fontSize: screens.md ? '48px' : '36px', color: '#1f2937', marginBottom: '16px', fontWeight: 'bold' }}>
                            Specialized <span style={{ background: 'linear-gradient(to right, #2c7a7b, #2f855a)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>Boards</span>
                        </Title>
                        <Paragraph style={{ fontSize: '20px', color: '#4b5563', maxWidth: '640px', margin: '0 auto', lineHeight: 1.6 }}>
                            Domain-specific workspaces tailored for different areas of your life
                        </Paragraph>
                    </div>
                    <Row gutter={[24, 24]}>
                        {boards.map((board, index) => (
                            <Col xs={24} md={12} lg={8} key={index}>
                                <Card
                                    style={{
                                        background: '#fff',
                                        borderRadius: '16px',
                                        border: '1px solid #e5e7eb',
                                        padding: '32px',
                                        transition: 'all 0.3s',
                                        transform: 'scale(1)',
                                        boxShadow: '0 4px 16px rgba(0,0,0,0.05)'
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.transform = 'scale(1.05)';
                                        e.currentTarget.style.border = '1px solid #d1d5db';
                                        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.border = '1px solid #e5e7eb';
                                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.05)';
                                    }}
                                >
                                    <div style={{ width: '56px', height: '56px', background: board.color, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', transition: 'transform 0.3s' }} >
                                        {React.createElement(board.icon, { style: { color: '#fff', width: '28px', height: '28px' } })}
                                    </div>
                                    <Title level={3} style={{ color: '#1f2937', marginBottom: '12px', fontWeight: 'bold', fontSize: '24px' }}>{board.name}</Title>
                                    <Paragraph style={{ color: '#4b5563', marginBottom: '16px', lineHeight: 1.6, fontSize: '16px' }}>{board.description}</Paragraph>
                                    <div style={{ display: 'flex', alignItems: 'center', color: '#2c7a7b', fontWeight: '500', transition: 'transform 0.3s' }} onMouseEnter={e => (e.target as HTMLElement).style.transform = 'translateX(8px)'} onMouseLeave={e => (e.target as HTMLElement).style.transform = 'translateX(0)'}>
                                        <Text style={{ color: '#2c7a7b', fontSize: '14px' }}>Explore</Text>
                                        <ChevronRightIcon style={{ width: '16px', height: '16px', marginLeft: '4px' }} />
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                    <SetupModal isOpen={isOpen} setIsOpen={setIsOpen} currentUserName={currentUserName} />
                </div>
            </Content>
        </Layout>
    );
}

export default DashboardSetup;


interface SetupModalProps {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    currentUserName: string;
}

const SetupModal: React.FC<SetupModalProps> = ({ isOpen, setIsOpen, currentUserName }) => {
    const router = useRouter();

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        zIndex: 10000,
                        width: '100%',
                        height: '100%',
                        // background: 'rgba(0,0,0,0.4)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px',
                    }}
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        style={{
                            background: 'white',
                            borderRadius: '24px',
                            padding: '32px',
                            maxWidth: '900px',
                            width: '100%',
                            display: 'flex',
                            gap: '24px',
                            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
                            position: 'relative',
                            flexWrap: 'wrap',
                        }}
                    >
                        {/* Close Button */}
                        <div
                            onClick={() => setIsOpen(false)}
                            style={{
                                position: 'absolute',
                                top: '16px',
                                right: '16px',
                                cursor: 'pointer',
                                fontSize: '20px',
                                fontWeight: 'bold',
                                color: '#64748b',
                            }}
                        >
                            ✕
                        </div>

                        {/* Connect Accounts Card */}
                        <motion.div
                            whileHover={{ y: -6, scale: 1.02 }}
                            style={{
                                flex: 1,
                                background: 'linear-gradient(135deg, #e0f7fa, #fce4ec)',
                                borderRadius: '20px',
                                padding: '28px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                            }}
                        >
                            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1a202c' }}>
                                <Zap size={20} style={{ marginRight: '8px', color: '#ec4899' }} />
                                Connect Your Accounts
                            </h3>
                            <p style={{ color: '#475569', fontWeight: 500 }}>
                                Sync your calendar and mail to get the most out of your dashboard.
                            </p>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                {/* <IconButton icon={<Google color="#EA4335" />} label="Google" /> */}
                                <IconButton icon={<Mail color="#0284C7" />} label="Outlook" />
                                <IconButton icon={<Apple color="#000" />} label="Apple" />
                                <IconButton icon={<GoogleOutlined style={{ color: "#0284C7", fontSize: 20 }} />} label="Google" />
                                {/* <IconButton icon={<Github color="#6B7280" />} label="GitHub" />
                                <IconButton icon={<Linkedin color="#0077b5" />} label="LinkedIn" /> */}
                            </div>
                            <Button
                                style={{
                                    marginTop: 'auto',
                                    background: '#ec4899',
                                    color: 'white',
                                    padding: '12px 20px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                }}
                                onClick={() => router.push(`/${currentUserName}/accounts/setup`)}
                            >
                                Connect Now
                            </Button>
                        </motion.div>

                        {/* Setup First Board Card */}
                        <motion.div
                            whileHover={{ y: -6, scale: 1.02 }}
                            style={{
                                flex: 1,
                                background: 'linear-gradient(135deg, #e0f2f1, #ede7f6)',
                                borderRadius: '20px',
                                padding: '28px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                            }}
                        >
                            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1a202c' }}>
                                <Settings size={20} style={{ marginRight: '8px', color: '#6366f1' }} />
                                Set Up Your First Board
                            </h3>
                            <p style={{ color: '#475569', fontWeight: 500 }}>
                                Organize your tasks, goals, or project workflows into beautiful boards.
                            </p>
                            <ul style={{ paddingLeft: '20px', color: '#334155', fontWeight: '500' }}>
                                <li>➤ Choose a board template</li>
                                <li>➤ Add your first task</li>
                                <li>➤ Invite your team</li>
                            </ul>
                            <button
                                style={{
                                    marginTop: 'auto',
                                    background: '#6366f1',
                                    color: 'white',
                                    padding: '12px 20px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                }}

                            >
                                <Plus size={16} />
                                Create Board
                            </button>
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const IconButton: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
    <button
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '8px 12px',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '14px',
            color: '#1f2937',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}
    >
        {icon}
        {label}
    </button>
);