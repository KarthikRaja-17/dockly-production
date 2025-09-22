'use client';
import React, { useState } from 'react';
import {
    Button,
    Steps,
    Typography,
    Space,
    Card,
    Alert,
    Divider,
    Tag
} from 'antd';
import {
    DownloadOutlined,
    ChromeOutlined,
    FolderOpenOutlined,
    SettingOutlined,
    CheckCircleOutlined,
    RocketOutlined,
    BookOutlined,
    StarOutlined
} from '@ant-design/icons';
import { PRIMARY_COLOR } from '../../../comman';

const { Title, Text } = Typography;
const { Step } = Steps;

const ExtensionDownloadPage: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(0);

    const nextStep = () => {
        if (currentStep < 4) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 0) setCurrentStep(currentStep - 1);
    };

    const installationSteps = [
        {
            title: 'Download Extension',
            icon: <DownloadOutlined />,
            content: (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '20px',
                        padding: '04px',
                        marginBottom: '24px',
                        color: 'white'
                    }}>
                        {/* <BookOutlined style={{ fontSize: '18px', marginBottom: '16px' }} /> */}
                        <Title level={3} style={{ color: 'white', margin: '0 0 8px 0' }}>
                            Dockly Smart Bookmarks
                        </Title>
                        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px' }}>
                            Your intelligent bookmark companion
                        </Text>
                    </div>

                    <Button
                        type="primary"
                        size="large"
                        icon={<DownloadOutlined />}
                        href="/docklySM.zip"
                        download
                        style={{
                            height: '50px',
                            borderRadius: '25px',
                            fontSize: '16px',
                            fontWeight: '600',
                            background: 'linear-gradient(135deg, #1890ff, #096dd9)',
                            border: 'none',
                            boxShadow: '0 4px 15px rgba(24, 144, 255, 0.3)',
                            minWidth: '200px'
                        }}
                    >
                        Download Extension
                    </Button>

                    <div style={{ marginTop: '20px' }}>
                        <Tag color="blue">Version 1.0</Tag>
                        <Tag color="green">Chrome Compatible</Tag>
                    </div>
                </div>
            )
        },
        {
            title: 'Extract Files',
            icon: <FolderOpenOutlined />,
            content: (
                <div style={{ padding: '20px 0' }}>
                    <Alert
                        message="Extract the ZIP file"
                        description="After downloading, extract the ZIP file to a folder on your computer. Remember this location!"
                        type="info"
                        showIcon
                        style={{ marginBottom: '20px' }}
                    />
                    <Card>
                        <Title level={4}>Extraction Steps:</Title>
                        <ul>
                            <li>Right-click on the downloaded ZIP file</li>
                            <li>Select "Extract All..." or "Extract Here"</li>
                            <li>Choose a memorable location (e.g., Desktop)</li>
                        </ul>
                    </Card>
                </div>
            )
        },
        {
            title: 'Open Chrome Settings',
            icon: <ChromeOutlined />,
            content: (
                <Card style={{ marginTop: 16 }}>
                    <Title level={4}>Open Chrome Extensions</Title>
                    <Text>
                        <b>Recommended:</b> Paste <Text code>chrome://extensions/</Text> into Chrome's address bar
                    </Text>
                    <Divider>OR</Divider>
                    <Text>
                        1. Click Chrome's menu (⋮) → More tools → Extensions
                    </Text>
                </Card>
            )
        },
        {
            title: 'Enable Developer Mode',
            icon: <SettingOutlined />,
            content: (
                <Card style={{ marginTop: 16 }}>
                    <Alert
                        message="Important"
                        description="Enable Developer Mode in the top-right of the Extensions page"
                        type="warning"
                        showIcon
                        style={{ marginBottom: '16px' }}
                    />
                    <Text>Once enabled, you can load unpacked extensions manually.</Text>
                </Card>
            )
        },
        {
            title: 'Load Extension',
            icon: <RocketOutlined />,
            content: (
                <Card style={{ marginTop: 16 }}>
                    <Title level={4}>Load Your Extension</Title>
                    <ol>
                        <li>Click "Load unpacked"</li>
                        <li>Select the extracted folder</li>
                        <li><Text strong>Success! 🎉</Text> Dockly Smart Bookmarks is now installed.</li>
                    </ol>
                    <Alert
                        message="Pro Tip"
                        description="Pin Dockly by clicking the puzzle icon in Chrome's toolbar"
                        type="success"
                        showIcon
                        icon={<StarOutlined />}
                        style={{ marginTop: '16px' }}
                    />
                </Card>
            )
        }
    ];

    return (
        <div style={{ padding: '40px max(5vw, 60px)' }}>
            <div style={{
                // background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '24px',
                borderRadius: '16px',
                textAlign: 'center',
                color: 'white',
                // marginBottom: '40px'
            }}>
                {/* <BookOutlined style={{ fontSize: '40px', marginBottom: '12px' }} /> */}
                <Title level={2} style={{ color: PRIMARY_COLOR, margin: '0 0 8px' }}>
                    Install Dockly Smart Bookmarks
                </Title>
                <Text>Follow these simple steps to get started</Text>
            </div>

            <Steps
                current={currentStep}
                direction="horizontal"
                style={{ marginBottom: '32px' }}
            >
                {installationSteps.map((step, index) => (
                    <Step
                        key={index}
                        title={step.title}
                        icon={step.icon}
                        status={currentStep === index ? 'process' : currentStep > index ? 'finish' : 'wait'}
                    />
                ))}
            </Steps>

            <Card style={{ marginBottom: '32px' }}>
                {installationSteps[currentStep].content}
            </Card>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button onClick={prevStep} disabled={currentStep === 0}>
                    Previous
                </Button>

                <div style={{ display: 'flex', gap: '8px' }}>
                    {installationSteps.map((_, index) => (
                        <div
                            key={index}
                            style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: currentStep === index ? '#1890ff' : '#d9d9d9'
                            }}
                        />
                    ))}
                </div>

                {currentStep < installationSteps.length - 1 ? (
                    <Button type="primary" onClick={nextStep}>
                        Next
                    </Button>
                ) : (
                    <Button type="primary" icon={<CheckCircleOutlined />} disabled>
                        Completed
                    </Button>
                )}
            </div>
        </div>
    );
};

export default ExtensionDownloadPage;
