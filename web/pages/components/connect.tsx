import React, { useEffect, useState } from 'react';
import { Modal, Button, Card, Avatar, Typography, Space, Badge, Tooltip } from 'antd';
import { Apple, Mail, Chrome, Check, UserPlus, User, Folder, Plus, X } from 'lucide-react';
import { CatppuccinFolderConnection } from './icons';
import { ACTIVE_BG_COLOR, PRIMARY_COLOR } from '../../app/comman';
import { API_URL } from '../../services/apiConfig';
import { useCurrentUser } from '../../app/userContext';
import { getUserConnectedAccounts, removeConnectedAccount } from '../../services/dashboard';
import { useGlobalLoading } from '../../app/loadingContext';
import { trimGooglePhotoUrl } from './layout/header';
import { showNotification } from '../../utils/notification';
// import { trimGooglePhotoUrl } from '../..//';

const FONT_FAMILY = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const { Title, Text } = Typography;

interface FolderConnectionModalProps {
    isModalVisible: boolean;
    setIsModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

type ConnectedAccount = {
    provider: string;
    email?: string;
    user_object?: string;
    [key: string]: any;
};

const FolderConnectionModal: React.FC<FolderConnectionModalProps> = ({ isModalVisible, setIsModalVisible }) => {
    const [connections, setConnections] = useState({
        apple: false,
        outlook: false,
        google: false,
        dropbox: false
    });
    const { loading, setLoading } = useGlobalLoading();
    const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([]);
    const currentUser = useCurrentUser();

    useEffect(() => {
        getConnectedAccounts();
    }, []);

    const getConnectedAccounts = async () => {
        setLoading(true);
        const response = await getUserConnectedAccounts({});
        const { status, payload } = response.data;

        if (status) {
            const connected = { apple: false, outlook: false, google: false, dropbox: false };
            payload.connectedAccounts.forEach((acc: ConnectedAccount) => {
                if (acc.provider in connected) {
                    connected[acc.provider as keyof typeof connected] = true;
                }
            });
            setConnectedAccounts(payload.connectedAccounts);
            setConnections(connected);
        }

        setLoading(false);
    };

    const handleConnect = (service: string) => {
        if (service === 'google') {
            window.location.href = `${API_URL}/add-googleCalendar?username=${currentUser?.user_name}&userId=${currentUser?.uid}`;
        }
        else if (service === "outlook") {
            window.location.href = `${API_URL}/add-microsoftAccount?username=${currentUser?.user_name}&userId=${currentUser?.uid}`;
        }
        else if (service === "dropbox") {
            window.location.href = `${API_URL}/add-dropbox?username=${currentUser?.user_name}&userId=${currentUser?.uid}`;
        }
    };

    const handleDisconnectAccount = async (accountId: string, provider: string) => {
        try {
            setLoading(true);
            console.log("Disconnecting accountId:", accountId);
            const res = await removeConnectedAccount(Number(accountId));
            const { status, message } = res.data;

            if (status) {
                showNotification("Success", `${provider} account disconnected successfully`, "success");
                getConnectedAccounts(); // Refresh list
            } else {
                showNotification("Error", message || "Failed to disconnect account", "error");
            }
        } catch (error) {
            console.error("Error disconnecting account:", error);
            showNotification("Error", "Something went wrong while disconnecting account", "error");
        } finally {
            setLoading(false);
        }
    };


    const renderConnectedAccounts = (provider: string) => {
        const accounts = connectedAccounts.filter(acc => acc.provider === provider);
        if (!accounts.length) return null;

        return (
            <div style={{
                marginTop: 12,
                background: `linear-gradient(135deg, ${PRIMARY_COLOR}08 0%, ${PRIMARY_COLOR}03 100%)`,
                borderRadius: 12,
                padding: '16px',
                border: `1px solid ${PRIMARY_COLOR}15`
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 12
                }}>
                    <Text style={{
                        fontFamily: FONT_FAMILY,
                        fontWeight: 600,
                        color: '#2c3e50',
                        fontSize: '13px'
                    }}>
                        Connected Accounts ({accounts.length})
                    </Text>
                    <Button
                        type="text"
                        size="small"
                        icon={<Plus size={14} />}
                        onClick={() => handleConnect(provider)}
                        style={{
                            fontFamily: FONT_FAMILY,
                            color: PRIMARY_COLOR,
                            fontSize: '12px',
                            height: '24px',
                            padding: '0 8px'
                        }}
                    >
                        Add
                    </Button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {accounts.map((acc, idx) => {
                        let userData = null;
                        try {
                            userData = acc.user_object ? JSON.parse(acc.user_object) : null;
                        } catch (_) { }

                        const picture = provider === 'google'
                            ? trimGooglePhotoUrl(userData?.picture)
                            : userData?.picture;

                        return (
                            <div key={idx} style={{
                                display: 'flex',
                                alignItems: 'center',
                                background: 'white',
                                borderRadius: 8,
                                padding: '8px 12px',
                                boxShadow: `0 2px 8px ${PRIMARY_COLOR}10`,
                                border: `1px solid ${PRIMARY_COLOR}10`,
                                minWidth: '200px',
                                position: 'relative'
                            }}>
                                <Avatar
                                    size={28}
                                    src={picture}
                                    icon={!picture && <User size={14} />}
                                    style={{
                                        marginRight: 10,
                                        border: `1.5px solid ${PRIMARY_COLOR}20`
                                    }}
                                />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <Text style={{
                                        fontFamily: FONT_FAMILY,
                                        fontWeight: 500,
                                        fontSize: '13px',
                                        color: '#2c3e50',
                                        display: 'block',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {userData?.email || acc.email}
                                    </Text>
                                    <Text style={{
                                        fontFamily: FONT_FAMILY,
                                        fontSize: '11px',
                                        color: '#52c41a'
                                    }}>
                                        Active
                                    </Text>
                                </div>
                                <Tooltip title="Disconnect">
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<X size={12} />}
                                        onClick={() => handleDisconnectAccount(acc.id, provider)}
                                        style={{
                                            width: 20,
                                            height: 20,
                                            padding: 0,
                                            color: '#999',
                                            marginLeft: 8
                                        }}
                                    />
                                </Tooltip>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const connectionData = [
        {
            key: 'google',
            name: 'Google',
            description: 'Files, Calendar & Photos',
            icon: <Chrome size={20} style={{ color: '#4285f4' }} />,
            color: '#4285f4',
            bgColor: '#4285f408',
        },
        {
            key: 'dropbox',
            name: 'Dropbox',
            description: 'Cloud Storage & Files',
            icon: <Folder size={20} style={{ color: '#0061FF' }} />,
            color: '#0061FF',
            bgColor: '#0061FF08',
        },
        {
            key: 'outlook',
            name: 'Microsoft 365',
            description: 'Email, Calendar & OneDrive',
            icon: <Mail size={20} style={{ color: '#0078d4' }} />,
            color: '#0078d4',
            bgColor: '#0078d408',
        },
        {
            key: 'apple',
            name: 'Apple iCloud',
            description: 'Photos, Files & Calendar',
            icon: <Apple size={20} style={{ color: '#000' }} />,
            color: '#000',
            bgColor: '#00000008',
        },
    ];

    const connectedCount = Object.values(connections).filter(Boolean).length;

    return (
        <Modal
            open={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            footer={null}
            width={650}
            centered
            closeIcon={
                <div style={{
                    fontSize: '18px',
                    color: '#666',
                    transition: 'all 0.2s ease',
                    fontFamily: FONT_FAMILY
                }}>
                    ×
                </div>
            }
            styles={{
                body: {
                    padding: 0,
                    background: 'white',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    maxHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                    fontFamily: FONT_FAMILY
                }
            }}
        >
            {/* Compact Header */}
            <div style={{
                padding: '24px 32px 20px',
                background: `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, ${PRIMARY_COLOR}dd 100%)`,
                position: 'sticky',
                top: 0,
                zIndex: 10,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: 'white',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        boxShadow: `0 4px 16px ${PRIMARY_COLOR}30`,
                    }}>
                        <CatppuccinFolderConnection />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <Title level={4} style={{
                                margin: 0,
                                color: 'white',
                                fontFamily: FONT_FAMILY,
                                fontWeight: 600
                            }}>
                                Account Connections
                            </Title>
                            <Badge
                                count={connectedCount}
                                style={{
                                    backgroundColor: 'rgba(255,255,255,0.2)',
                                    color: 'white',
                                    border: '1px solid rgba(255,255,255,0.3)'
                                }}
                            />
                        </div>
                        <Text style={{
                            color: 'rgba(255,255,255,0.9)',
                            fontSize: '14px',
                            fontFamily: FONT_FAMILY,
                            fontWeight: 300
                        }}>
                            Sync your files, calendars, and health data securely
                        </Text>
                    </div>
                </div>
            </div>

            {/* Compact Body */}
            <div style={{
                padding: '24px 32px',
                overflowY: 'auto',
                flexGrow: 1,
            }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                    {connectionData.map((service) => {
                        const key = service.key as keyof typeof connections;
                        const isConnected = connections[key];
                        const accountCount = connectedAccounts.filter(acc => acc.provider === service.key).length;

                        return (
                            <Card
                                key={service.key}
                                style={{
                                    borderRadius: '12px',
                                    boxShadow: isConnected
                                        ? `0 2px 12px ${service.color}15`
                                        : `0 2px 8px ${PRIMARY_COLOR}08`,
                                    border: isConnected
                                        ? `1px solid ${service.color}20`
                                        : `1px solid ${PRIMARY_COLOR}10`,
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    background: 'white',
                                    fontFamily: FONT_FAMILY
                                }}
                                bodyStyle={{ padding: '20px' }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                    e.currentTarget.style.boxShadow = isConnected
                                        ? `0 4px 16px ${service.color}25`
                                        : `0 4px 12px ${PRIMARY_COLOR}15`;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = isConnected
                                        ? `0 2px 12px ${service.color}15`
                                        : `0 2px 8px ${PRIMARY_COLOR}08`;
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
                                        <Avatar
                                            size={40}
                                            style={{
                                                backgroundColor: service.bgColor,
                                                border: `2px solid ${service.color}15`,
                                            }}
                                        >
                                            {service.icon}
                                        </Avatar>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                                                <Title level={5} style={{
                                                    margin: 0,
                                                    fontFamily: FONT_FAMILY,
                                                    fontWeight: 600,
                                                    color: '#2c3e50',
                                                    fontSize: '15px'
                                                }}>
                                                    {service.name}
                                                </Title>
                                                {isConnected && (
                                                    <Badge
                                                        count={accountCount}
                                                        size="small"
                                                        style={{
                                                            backgroundColor: service.color,
                                                            fontSize: '10px'
                                                        }}
                                                    />
                                                )}
                                            </div>
                                            <Text style={{
                                                fontFamily: FONT_FAMILY,
                                                fontSize: '13px',
                                                color: '#666',
                                                display: 'block',
                                                marginBottom: 4
                                            }}>
                                                {service.description}
                                            </Text>
                                            <Text style={{
                                                fontFamily: FONT_FAMILY,
                                                fontSize: '12px',
                                                color: isConnected ? service.color : '#999',
                                                fontWeight: 500
                                            }}>
                                                {isConnected ? '✓ Connected' : 'Not Connected'}
                                            </Text>
                                        </div>
                                    </div>

                                    <Button
                                        type={isConnected ? 'default' : 'primary'}
                                        onClick={() => handleConnect(service.key)}
                                        icon={isConnected ? <Check size={14} /> : <Plus size={14} />}
                                        loading={loading}
                                        size="middle"
                                        style={{
                                            borderRadius: 8,
                                            fontFamily: FONT_FAMILY,
                                            fontWeight: 500,
                                            fontSize: '13px',
                                            background: isConnected
                                                ? 'transparent'
                                                : `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, ${PRIMARY_COLOR}dd 100%)`,
                                            color: isConnected ? service.color : '#fff',
                                            border: isConnected ? `1px solid ${service.color}30` : 'none',
                                            minWidth: '90px'
                                        }}
                                    >
                                        {isConnected ? 'Manage' : 'Connect'}
                                    </Button>
                                </div>
                                {isConnected && renderConnectedAccounts(service.key)}
                            </Card>
                        );
                    })}
                </Space>
            </div>

            {/* Footer */}
            <div style={{
                padding: '16px 32px',
                borderTop: `1px solid ${PRIMARY_COLOR}10`,
                textAlign: 'center',
                background: `${PRIMARY_COLOR}02`,
            }}>
                <Text style={{
                    fontSize: 12,
                    color: '#666',
                    fontFamily: FONT_FAMILY,
                    fontWeight: 400
                }}>
                    🔒 Your data is encrypted and secure. We never access your personal files.
                </Text>
            </div>
        </Modal>
    );
};

export default FolderConnectionModal;