'use client';
import React, { useState } from 'react';
import {
    Button,
    Modal,
    Steps,
    Typography,
    Space,
    Card,
    Alert,
    Divider,
    Tag,
    Image
} from 'antd';
import {
    DownloadOutlined,
    ChromeOutlined,
    FolderOpenOutlined,
    SettingOutlined,
    CheckCircleOutlined,
    InfoCircleOutlined,
    RocketOutlined,
    BookOutlined,
    StarOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
interface ExtensionDownloadModalProps {
    isModalVisible: boolean;
    setIsModalVisible: (visible: boolean) => void;
}
const ExtensionDownloadModal: React.FC<ExtensionDownloadModalProps> = ({ setIsModalVisible, isModalVisible }) => {
    // const { isModalVisible, setIsModalVisible } = props;
    // const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const handleCancel = () => {
        setIsModalVisible(false);
        setCurrentStep(0);
    };

    const nextStep = () => {
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
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
                        padding: '30px',
                        marginBottom: '24px',
                        color: 'white'
                    }}>
                        <BookOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
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
                        href="/DocklySmartBookmarks-1.0.zip"
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
                        <Tag color="blue" style={{ borderRadius: '12px', padding: '4px 12px' }}>
                            Version 1.0
                        </Tag>
                        <Tag color="green" style={{ borderRadius: '12px', padding: '4px 12px' }}>
                            Chrome Compatible
                        </Tag>
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
                        style={{
                            marginBottom: '20px',
                            borderRadius: '12px',
                            border: '1px solid #1890ff20'
                        }}
                    />

                    <Card style={{
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #f6f9fc 0%, #ffffff 100%)',
                        border: '1px solid #e8f4fd'
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <FolderOpenOutlined style={{
                                fontSize: '40px',
                                color: '#1890ff',
                                marginBottom: '16px'
                            }} />
                            <Title level={4} style={{ margin: '0 0 8px 0' }}>
                                Extraction Steps:
                            </Title>
                            <div style={{ textAlign: 'left', marginTop: '16px' }}>
                                <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                                    <div style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        background: '#1890ff',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: '12px',
                                        fontSize: '12px',
                                        fontWeight: 'bold'
                                    }}>1</div>
                                    <Text>Right-click on the downloaded ZIP file</Text>
                                </div>
                                <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                                    <div style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        background: '#1890ff',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: '12px',
                                        fontSize: '12px',
                                        fontWeight: 'bold'
                                    }}>2</div>
                                    <Text>Select "Extract All..." or "Extract Here"</Text>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <div style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        background: '#1890ff',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: '12px',
                                        fontSize: '12px',
                                        fontWeight: 'bold'
                                    }}>3</div>
                                    <Text>Choose a memorable location (e.g., Desktop)</Text>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )
        },
        {
            title: 'Open Chrome Settings',
            icon: <ChromeOutlined />,
            content: (
                <div style={{ padding: '20px 0' }}>
                    <Card style={{
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #fff7e6 0%, #ffffff 100%)',
                        border: '1px solid #ffd59120'
                    }}>
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <ChromeOutlined style={{
                                fontSize: '48px',
                                color: '#fa8c16',
                                marginBottom: '16px'
                            }} />
                            <Title level={4} style={{ margin: '0 0 16px 0' }}>
                                Access Chrome Extensions
                            </Title>
                        </div>

                        <div style={{ textAlign: 'left' }}>
                            <div style={{ marginBottom: '16px' }}>
                                <Text strong style={{ color: '#fa8c16' }}>Method 1 (Recommended):</Text>
                                <div style={{
                                    background: '#fff',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    marginTop: '8px',
                                    border: '1px solid #ffd591'
                                }}>
                                    <Text code style={{
                                        background: '#f6f8fa',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}>
                                        chrome://extensions/
                                    </Text>
                                    <Text style={{ marginLeft: '8px' }}>← Copy and paste this in address bar</Text>
                                </div>
                            </div>

                            <Divider style={{ margin: '16px 0' }}>OR</Divider>

                            <div>
                                <Text strong style={{ color: '#fa8c16' }}>Method 2:</Text>
                                <div style={{ marginTop: '8px' }}>
                                    <Text>1. Click the three dots (⋮) in Chrome's top-right corner</Text><br />
                                    <Text>2. Go to "More tools" → "Extensions"</Text>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )
        },
        {
            title: 'Enable Developer Mode',
            icon: <SettingOutlined />,
            content: (
                <div style={{ padding: '20px 0' }}>
                    <Alert
                        message="Important Step!"
                        description="You need to enable Developer Mode to install unpacked extensions"
                        type="warning"
                        showIcon
                        style={{
                            marginBottom: '20px',
                            borderRadius: '12px'
                        }}
                    />

                    <Card style={{
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #f6ffed 0%, #ffffff 100%)',
                        border: '1px solid #b7eb8f20'
                    }}>
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <SettingOutlined style={{
                                fontSize: '48px',
                                color: '#52c41a',
                                marginBottom: '16px'
                            }} />
                            <Title level={4} style={{ margin: '0' }}>
                                Enable Developer Mode
                            </Title>
                        </div>

                        <div style={{
                            background: '#fff',
                            padding: '16px',
                            borderRadius: '12px',
                            border: '1px solid #d9f7be'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: '#52c41a',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '12px',
                                    fontSize: '14px',
                                    fontWeight: 'bold'
                                }}>1</div>
                                <Text style={{ fontSize: '16px' }}>
                                    Look for the "Developer mode" toggle in the top-right corner
                                </Text>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: '#52c41a',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '12px',
                                    fontSize: '14px',
                                    fontWeight: 'bold'
                                }}>2</div>
                                <Text style={{ fontSize: '16px' }}>
                                    Click the toggle to turn it ON (it should turn blue)
                                </Text>
                            </div>
                        </div>
                    </Card>
                </div>
            )
        },
        {
            title: 'Load Extension',
            icon: <RocketOutlined />,
            content: (
                <div style={{ padding: '20px 0' }}>
                    <Card style={{
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #e6f7ff 0%, #ffffff 100%)',
                        border: '1px solid #91d5ff20'
                    }}>
                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <RocketOutlined style={{
                                fontSize: '48px',
                                color: '#1890ff',
                                marginBottom: '16px'
                            }} />
                            <Title level={4} style={{ margin: '0 0 8px 0' }}>
                                Load Your Extension
                            </Title>
                            <Text style={{ color: '#666', fontSize: '16px' }}>
                                Final step to get Dockly running!
                            </Text>
                        </div>

                        <div style={{ textAlign: 'left' }}>
                            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'flex-start' }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: '#1890ff',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '16px',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    flexShrink: 0,
                                    marginTop: '4px'
                                }}>1</div>
                                <div>
                                    <Text strong style={{ fontSize: '16px', display: 'block', marginBottom: '4px' }}>
                                        Click "Load unpacked"
                                    </Text>
                                    <Text style={{ color: '#666' }}>
                                        This button appears after enabling Developer Mode
                                    </Text>
                                </div>
                            </div>

                            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'flex-start' }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: '#1890ff',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '16px',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    flexShrink: 0,
                                    marginTop: '4px'
                                }}>2</div>
                                <div>
                                    <Text strong style={{ fontSize: '16px', display: 'block', marginBottom: '4px' }}>
                                        Select the extracted folder
                                    </Text>
                                    <Text style={{ color: '#666' }}>
                                        Navigate to where you extracted the ZIP file
                                    </Text>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: '#52c41a',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '16px',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    flexShrink: 0,
                                    marginTop: '4px'
                                }}>3</div>
                                <div>
                                    <Text strong style={{ fontSize: '16px', display: 'block', marginBottom: '4px', color: '#52c41a' }}>
                                        Success! 🎉
                                    </Text>
                                    <Text style={{ color: '#666' }}>
                                        Dockly Smart Bookmarks is now installed and ready to use!
                                    </Text>
                                </div>
                            </div>
                        </div>

                        <Alert
                            message="Pro Tip"
                            description="Pin the extension to your toolbar by clicking the puzzle piece icon and then the pin icon next to Dockly Smart Bookmarks"
                            type="success"
                            showIcon
                            icon={<StarOutlined />}
                            style={{
                                marginTop: '20px',
                                borderRadius: '12px',
                                background: '#f6ffed'
                            }}
                        />
                    </Card>
                </div>
            )
        }
    ];

    return (
        <>

            <Modal
                title={null}
                visible={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                width={900}
                centered
                style={{ borderRadius: '20px' }}
                // bodyStyle={{
                //     padding: '0',
                //     borderRadius: '20px',
                //     overflow: 'hidden'
                // }}
                styles={{
                    body: {
                        padding: '0',
                        borderRadius: '20px',
                        overflow: 'hidden'
                    }
                }}
            >
                <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    padding: '24px',
                    textAlign: 'center',
                    color: 'white'
                }}>
                    <BookOutlined style={{ fontSize: '40px', marginBottom: '12px' }} />
                    <Title level={2} style={{ color: 'white', margin: '0 0 8px 0' }}>
                        Install Dockly Smart Bookmarks
                    </Title>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px' }}>
                        Follow these simple steps to get started
                    </Text>
                </div>

                <div style={{ padding: '32px' }}>
                    <Steps
                        current={currentStep}
                        direction="vertical"
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

                    <Card
                        style={{
                            borderRadius: '16px',
                            border: '1px solid #f0f0f0',
                            minHeight: '300px'
                        }}
                        bodyStyle={{ padding: '24px' }}
                    >
                        {installationSteps[currentStep].content}
                    </Card>

                    <div style={{
                        marginTop: '24px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <Button
                            onClick={prevStep}
                            disabled={currentStep === 0}
                            style={{ borderRadius: '8px' }}
                        >
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
                                        background: currentStep === index ? '#1890ff' : '#d9d9d9',
                                        transition: 'all 0.3s ease'
                                    }}
                                />
                            ))}
                        </div>

                        {currentStep < installationSteps.length - 1 ? (
                            <Button
                                type="primary"
                                onClick={nextStep}
                                style={{ borderRadius: '8px' }}
                            >
                                Next
                            </Button>
                        ) : (
                            <Button
                                type="primary"
                                icon={<CheckCircleOutlined />}
                                onClick={handleCancel}
                                style={{
                                    borderRadius: '8px',
                                    background: '#52c41a',
                                    borderColor: '#52c41a'
                                }}
                            >
                                Complete
                            </Button>
                        )}
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default ExtensionDownloadModal;