
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import {
    Layout,
    Input,
    Button,
    Card,
    Avatar,
    Typography,
    Space,
    Row,
    Col,
    Dropdown,
    Tooltip,
    Upload,
    Progress,
    Modal,
    Form,
    Select,
    message,
    Spin,
    Empty,
    Badge,
    Tag,
    Breadcrumb,
    Divider,
    Table,
    Pagination,
    MenuProps,
    Popconfirm,
    Checkbox,
    Drawer,
    List,
    Statistic,
    Timeline,
    Collapse,
    Alert,
    InputNumber,
    DatePicker,
    Descriptions,
    TreeSelect,
    Radio
} from 'antd';
import {
    SearchOutlined,
    AppstoreOutlined,
    UnorderedListOutlined,
    MoreOutlined,
    FolderOutlined,
    FileTextOutlined,
    FileExcelOutlined,
    PlayCircleOutlined,
    FileZipOutlined,
    FilePptOutlined,
    FilePdfOutlined,
    PictureOutlined,
    MinusOutlined,
    DownloadOutlined,
    DeleteOutlined,
    ShareAltOutlined,
    EyeOutlined,
    PlusOutlined,
    ReloadOutlined,
    HomeOutlined,
    CloudUploadOutlined,
    StarOutlined,
    TeamOutlined,
    ClockCircleOutlined,
    SortAscendingOutlined,
    SortDescendingOutlined,
    FilterOutlined,
    DownOutlined,
    UpOutlined,
    CloseOutlined,
    UploadOutlined,
    FolderAddOutlined,
    UserOutlined,
    EditOutlined,
    CopyOutlined,
    FolderOpenOutlined,
    StarFilled,
    CheckOutlined,
    BarChartOutlined,
    HistoryOutlined,
    BugOutlined,
    InfoCircleOutlined,
    HddOutlined,
    FileOutlined,
    CalendarOutlined,
    TagsOutlined,
    LinkOutlined,
    CloudOutlined,
    DatabaseOutlined,
    GoogleOutlined,
    WindowsOutlined
} from '@ant-design/icons';
import {
    listDriveFiles,
    uploadDriveFile,
    downloadDriveFile,
    deleteDriveFile,
    createDriveFolder,
    shareDriveFile,
    getDriveFileInfo,
    getDriveStorage,
    renameDriveFile,
    copyDriveFile,
    moveDriveFile,
    starDriveFile,
    bulkDownloadFiles,
    bulkDeleteFiles,
    bulkMoveFiles,
    bulkCopyFiles,
    bulkShareFiles,
    findDuplicateFiles,
    getStorageAnalytics,
    getActivityLog,
    logActivity,
    getAccountColor,
    getFileSource,
    getProviderDisplayName,
    getProviderIcon,
    type DriveFile,
    type DriveFolder,
    type StorageInfo,
    type ActivityLog,
    type DuplicateFile,
    type CloudProvider
} from '../../../services/files';
import { showNotification } from '../../../utils/notification';
import { PRIMARY_COLOR } from '../../comman';

// const PRIMARY_COLOR = '#1890ff';
const FONT_FAMILY = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

interface UploadProgress {
    [fileName: string]: {
        progress: number;
        status: 'uploading' | 'completed' | 'error';
    };
}

interface AccountFilter {
    email: string;
    displayName: string;
    photoLink?: string;
    provider: string;
}

const { Content } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;
const { Dragger } = Upload;
const { Panel } = Collapse;
const { RangePicker } = DatePicker;

// Provider Selection Modal Component
const ProviderSelectionModal: React.FC<{
    visible: boolean;
    onClose: () => void;
    onSelect: (provider: CloudProvider) => void;
    title: string;
    description: string;
    availableProviders?: string[];
}> = ({ visible, onClose, onSelect, title, description, availableProviders = [] }) => {
    const [selectedProvider, setSelectedProvider] = useState<CloudProvider>('google');

    // Filter provider options based on available connected accounts
    const providerOptions = [
        {
            value: 'google',
            label: (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    border: '2px solid transparent',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease',
                    backgroundColor: selectedProvider === 'google' ? '#e8f0fe' : '#fff',
                    borderColor: selectedProvider === 'google' ? '#4285f4' : '#e8eaed',
                    fontFamily: FONT_FAMILY,
                    opacity: availableProviders.includes('google') ? 1 : 0.5,
                    pointerEvents: availableProviders.includes('google') ? 'auto' : 'none'
                }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        backgroundColor: '#4285f4',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(66, 133, 244, 0.3)'
                    }}>
                        <span style={{ color: 'white', fontSize: '18px', fontWeight: 'bold', fontFamily: FONT_FAMILY }}>G</span>
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '16px', fontWeight: 600, color: '#202124', marginBottom: '4px', fontFamily: FONT_FAMILY }}>
                            Google Drive
                        </div>
                        <div style={{ fontSize: '12px', color: '#5f6368', fontFamily: FONT_FAMILY }}>
                            15GB free storage • Seamless integration
                            {!availableProviders.includes('google') && ' • Not Connected'}
                        </div>
                    </div>
                    {selectedProvider === 'google' && availableProviders.includes('google') && (
                        <CheckOutlined style={{ color: '#4285f4', fontSize: '18px' }} />
                    )}
                </div>
            )
        },
        {
            value: 'dropbox',
            label: (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    border: '2px solid transparent',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease',
                    backgroundColor: selectedProvider === 'dropbox' ? '#e8f5ff' : '#fff',
                    borderColor: selectedProvider === 'dropbox' ? '#0061ff' : '#e8eaed',
                    fontFamily: FONT_FAMILY,
                    opacity: availableProviders.includes('dropbox') ? 1 : 0.5,
                    pointerEvents: availableProviders.includes('dropbox') ? 'auto' : 'none'
                }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        backgroundColor: '#0061ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0, 97, 255, 0.3)'
                    }}>
                        <span style={{ color: 'white', fontSize: '18px', fontWeight: 'bold', fontFamily: FONT_FAMILY }}>D</span>
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '16px', fontWeight: 600, color: '#202124', marginBottom: '4px', fontFamily: FONT_FAMILY }}>
                            Dropbox
                        </div>
                        <div style={{ fontSize: '12px', color: '#5f6368', fontFamily: FONT_FAMILY }}>
                            2GB free storage • Advanced sync features
                            {!availableProviders.includes('dropbox') && ' • Not Connected'}
                        </div>
                    </div>
                    {selectedProvider === 'dropbox' && availableProviders.includes('dropbox') && (
                        <CheckOutlined style={{ color: '#0061ff', fontSize: '18px' }} />
                    )}
                </div>
            )
        }
    ].filter(option => availableProviders.includes(option.value));

    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: FONT_FAMILY }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: '#e8f0fe',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <CloudOutlined style={{ color: PRIMARY_COLOR, fontSize: '16px' }} />
                    </div>
                    <div>
                        <span style={{ fontSize: '18px', fontWeight: 600, color: '#202124', fontFamily: FONT_FAMILY }}>
                            {title}
                        </span>
                        <div style={{ fontSize: '12px', color: '#5f6368', marginTop: '2px', fontFamily: FONT_FAMILY }}>
                            {description}
                        </div>
                    </div>
                </div>
            }
            open={visible}
            onCancel={onClose}
            footer={[
                <Button key="cancel" onClick={onClose} style={{ fontFamily: FONT_FAMILY }}>
                    Cancel
                </Button>,
                <Button
                    key="select"
                    type="primary"
                    onClick={() => onSelect(selectedProvider)}
                    disabled={!availableProviders.includes(selectedProvider)}
                    style={{
                        backgroundColor: PRIMARY_COLOR,
                        borderColor: PRIMARY_COLOR,
                        fontFamily: FONT_FAMILY
                    }}
                >
                    Continue with {getProviderDisplayName(selectedProvider)}
                </Button>
            ]}
            width={520}
            style={{ borderRadius: '12px', fontFamily: FONT_FAMILY }}
        >
            <div style={{ marginTop: '16px' }}>
                <Radio.Group
                    value={selectedProvider}
                    onChange={(e) => setSelectedProvider(e.target.value)}
                    style={{ width: '100%' }}
                >
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        {providerOptions.map(option => (
                            <Radio
                                key={option.value}
                                value={option.value}
                                disabled={!availableProviders.includes(option.value)}
                                style={{
                                    width: '100%',
                                    margin: 0,
                                    fontFamily: FONT_FAMILY
                                }}
                            >
                                {option.label}
                            </Radio>
                        ))}
                    </Space>
                </Radio.Group>
                {availableProviders.length === 0 && (
                    <Alert
                        message="No Connected Accounts"
                        description="Please connect at least one cloud storage account to continue."
                        type="warning"
                        showIcon
                        style={{ marginTop: '16px', fontFamily: FONT_FAMILY }}
                    />
                )}
            </div>
        </Modal>
    );
};

// Folder Selection Modal Component
const FolderSelectionModal: React.FC<{
    visible: boolean;
    onClose: () => void;
    onSelect: (folderId: string, folderPath: string) => void;
    title: string;
    folderTreeData: any[];
}> = ({ visible, onClose, onSelect, title, folderTreeData }) => {
    const [selectedFolder, setSelectedFolder] = useState<string>('root');
    const [selectedPath, setSelectedPath] = useState<string>('');

    const handleFolderSelect = (value: string, node: any) => {
        setSelectedFolder(value);
        setSelectedPath(node.path || '');
    };

    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: FONT_FAMILY }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: '#e8f0fe',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <FolderOutlined style={{ color: PRIMARY_COLOR, fontSize: '16px' }} />
                    </div>
                    <span style={{ fontSize: '18px', fontWeight: 600, color: '#202124', fontFamily: FONT_FAMILY }}>
                        {title}
                    </span>
                </div>
            }
            open={visible}
            onCancel={onClose}
            footer={[
                <Button key="cancel" onClick={onClose} style={{ fontFamily: FONT_FAMILY }}>
                    Cancel
                </Button>,
                <Button
                    key="select"
                    type="primary"
                    onClick={() => onSelect(selectedFolder, selectedPath)}
                    style={{
                        backgroundColor: PRIMARY_COLOR,
                        borderColor: PRIMARY_COLOR,
                        fontFamily: FONT_FAMILY
                    }}
                >
                    Select Folder
                </Button>
            ]}
            width={480}
            style={{ borderRadius: '12px', fontFamily: FONT_FAMILY }}
        >
            <div style={{ marginTop: '16px' }}>
                <TreeSelect
                    style={{ width: '100%', borderRadius: '8px', fontFamily: FONT_FAMILY }}
                    dropdownStyle={{
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                        border: '1px solid #e8eaed'
                    }}
                    placeholder="Select destination folder"
                    allowClear
                    treeDefaultExpandAll
                    treeData={folderTreeData}
                    size="large"
                    showSearch
                    treeNodeFilterProp="title"
                    value={selectedFolder}
                    onChange={handleFolderSelect}
                />
            </div>
        </Modal>
    );
};

// Enhanced Upload Area Component with Provider and Folder Selection
const UploadArea: React.FC<{
    onUpload: (file: File, provider: CloudProvider, folderId: string, folderPath: string) => void;
    uploadProgress: UploadProgress;
    isUploading: boolean;
    availableAccounts: AccountFilter[];
    folderTreeData: any[];
}> = ({ onUpload, uploadProgress, isUploading, availableAccounts, folderTreeData }) => {
    const [showProviderModal, setShowProviderModal] = useState(false);
    const [showFolderModal, setShowFolderModal] = useState(false);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [selectedProvider, setSelectedProvider] = useState<CloudProvider>('google');

    const getAvailableProviders = () => {
        const providers = new Set<string>();
        availableAccounts.forEach(account => {
            providers.add(account.provider);
        });
        return Array.from(providers);
    };

    const handleFileSelect = (file: File) => {
        setPendingFile(file);
        setShowProviderModal(true);
    };

    const handleProviderSelect = (provider: CloudProvider) => {
        setSelectedProvider(provider);
        setShowProviderModal(false);
        setShowFolderModal(true);
    };

    const handleFolderSelect = (folderId: string, folderPath: string) => {
        if (pendingFile) {
            onUpload(pendingFile, selectedProvider, folderId, folderPath);
            setPendingFile(null);
        }
        setShowFolderModal(false);
    };

    const uploadProps = {
        name: 'file',
        multiple: true,
        showUploadList: false,
        beforeUpload: (file: File) => {
            handleFileSelect(file);
            return false;
        }
    };

    const connectedProviders = getAvailableProviders();

    return (
        <div style={{ marginBottom: '0px', fontFamily: FONT_FAMILY }}>
            <Dragger
                {...uploadProps}
                style={{
                    backgroundColor: '#f8f9fa',
                    border: '2px dashed #dadce0',
                    borderRadius: '12px',
                    padding: '24px 16px',
                    transition: 'all 0.3s ease',
                    fontFamily: FONT_FAMILY
                }}
            >
                <div style={{ textAlign: 'center', fontFamily: FONT_FAMILY }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        backgroundColor: '#e8f0fe',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px'
                    }}>
                        <CloudUploadOutlined style={{
                            fontSize: '32px',
                            color: PRIMARY_COLOR
                        }} />
                    </div>
                    <div style={{
                        fontSize: '18px',
                        color: '#202124',
                        marginBottom: '8px',
                        fontWeight: 600,
                        fontFamily: FONT_FAMILY
                    }}>
                        Drag files here or click to upload
                    </div>
                    <div style={{ fontSize: '14px', color: '#5f6368', marginBottom: '16px', fontFamily: FONT_FAMILY }}>
                        Choose provider and destination folder
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        {availableAccounts.map((account, index) => {
                            const color = getAccountColor(account.provider, index);
                            return (
                                <Tag 
                                    key={account.email} 
                                    style={{ 
                                        backgroundColor: color + '15',
                                        borderColor: color + '40',
                                        color: color,
                                        fontFamily: FONT_FAMILY,
                                        margin: '2px'
                                    }}
                                >
                                    {account.provider === 'google' ? 'Google Drive' : 
                                     account.provider === 'dropbox' ? 'Dropbox' : 'OneDrive'}
                                </Tag>
                            );
                        })}
                        {availableAccounts.length === 0 && (
                            <Tag color="orange" style={{ fontFamily: FONT_FAMILY }}>
                                No accounts connected
                            </Tag>
                        )}
                    </div>
                </div>
            </Dragger>

            {Object.keys(uploadProgress).length > 0 && (
                <Card
                    size="small"
                    style={{
                        marginTop: '16px',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        border: 'none',
                        fontFamily: FONT_FAMILY
                    }}
                    title={
                        <Space>
                            <CloudUploadOutlined style={{ color: PRIMARY_COLOR }} />
                            <span style={{ fontSize: '14px', fontWeight: 600, fontFamily: FONT_FAMILY }}>Upload Progress</span>
                        </Space>
                    }
                >
                    {Object.entries(uploadProgress).map(([filename, progress]) => (
                        <div key={filename} style={{ marginBottom: '12px', fontFamily: FONT_FAMILY }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '6px'
                            }}>
                                <Text style={{ fontSize: '13px', fontWeight: 500, fontFamily: FONT_FAMILY }}>{filename}</Text>
                                <Space size="small">
                                    {progress.status === 'completed' && (
                                        <Badge status="success" />
                                    )}
                                    {progress.status === 'error' && (
                                        <Badge status="error" />
                                    )}
                                    <Text style={{ fontSize: '12px', color: '#5f6368', fontFamily: FONT_FAMILY }}>
                                        {progress.progress}%
                                    </Text>
                                </Space>
                            </div>
                            <Progress
                                percent={progress.progress}
                                status={progress.status === 'error' ? 'exception' : progress.status === 'completed' ? 'success' : 'active'}
                                strokeColor={PRIMARY_COLOR}
                                size="small"
                                showInfo={false}
                                strokeLinecap="round"
                            />
                        </div>
                    ))}
                </Card>
            )}

            <ProviderSelectionModal
                visible={showProviderModal}
                onClose={() => {
                    setShowProviderModal(false);
                    setPendingFile(null);
                }}
                onSelect={handleProviderSelect}
                title="Choose Upload Destination"
                description="Select your cloud storage provider"
                availableProviders={connectedProviders}
            />

            <FolderSelectionModal
                visible={showFolderModal}
                onClose={() => {
                    setShowFolderModal(false);
                    setPendingFile(null);
                }}
                onSelect={handleFolderSelect}
                title="Select Upload Folder"
                folderTreeData={folderTreeData}
            />
        </div>
    );
};

// Bulk Actions Toolbar
const BulkActionsToolbar: React.FC<{
    selectedItems: string[];
    onClearSelection: () => void;
    onBulkDownload: () => void;
    onBulkDelete: () => void;
    onBulkMove: () => void;
    onBulkCopy: () => void;
    onBulkShare: () => void;
}> = ({
    selectedItems,
    onClearSelection,
    onBulkDownload,
    onBulkDelete,
    onBulkMove,
    onBulkCopy,
    onBulkShare
}) => {
        if (selectedItems.length === 0) return null;

        return (
            <div style={{
                position: 'fixed',
                bottom: '24px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#fff',
                padding: '12px 20px',
                borderRadius: '32px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                border: '1px solid #e8eaed',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontFamily: FONT_FAMILY
            }}>
                <div style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: '#e8f0fe',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Text style={{ fontSize: '14px', fontWeight: 600, color: PRIMARY_COLOR, fontFamily: FONT_FAMILY }}>
                        {selectedItems.length}
                    </Text>
                </div>
                <Text style={{ fontSize: '14px', fontWeight: 500, fontFamily: FONT_FAMILY }}>
                    items selected
                </Text>
                <Divider type="vertical" style={{ height: '24px' }} />
                <Space size="small">
                    <Tooltip title="Download">
                        <Button
                            type="text"
                            icon={<DownloadOutlined />}
                            onClick={onBulkDownload}
                            size="small"
                            style={{
                                borderRadius: '6px',
                                color: '#5f6368',
                                fontFamily: FONT_FAMILY
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="Move">
                        <Button
                            type="text"
                            icon={<FolderOpenOutlined />}
                            onClick={onBulkMove}
                            size="small"
                            style={{
                                borderRadius: '6px',
                                color: '#5f6368',
                                fontFamily: FONT_FAMILY
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="Copy">
                        <Button
                            type="text"
                            icon={<CopyOutlined />}
                            onClick={onBulkCopy}
                            size="small"
                            style={{
                                borderRadius: '6px',
                                color: '#5f6368',
                                fontFamily: FONT_FAMILY
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="Share">
                        <Button
                            type="text"
                            icon={<ShareAltOutlined />}
                            onClick={onBulkShare}
                            size="small"
                            style={{
                                borderRadius: '6px',
                                color: '#5f6368',
                                fontFamily: FONT_FAMILY
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="Delete">
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={onBulkDelete}
                            size="small"
                            style={{
                                borderRadius: '6px',
                                fontFamily: FONT_FAMILY
                            }}
                        />
                    </Tooltip>
                    <Divider type="vertical" style={{ height: '24px' }} />
                    <Button
                        type="text"
                        icon={<CloseOutlined />}
                        onClick={onClearSelection}
                        size="small"
                        style={{
                            borderRadius: '6px',
                            color: '#5f6368',
                            fontFamily: FONT_FAMILY
                        }}
                    />
                </Space>
            </div>
        );
    };

// Enhanced Header Bar with Provider Filtering
const HeaderBar: React.FC<{
    breadcrumbs: Array<{ id: string; name: string; path?: string }>;
    onNavigate: (index: number) => void;
    sortBy: string;
    onSortByChange: (value: string) => void;
    sortOrder: string;
    onSortOrderChange: () => void;
    viewMode: 'grid' | 'list';
    onViewModeChange: () => void;
    onRefresh: () => void;
    loading: boolean;
    extraIcon?: React.ReactNode;
    selectedAccount: string | null;
    onAccountChange: (accountEmail: string | null) => void;
    availableAccounts: AccountFilter[];
    selectedItems: string[];
    onToggleSelectAll: () => void;
    isAllSelected: boolean;
    storageInfo: StorageInfo | null;
    onShowAnalytics: () => void;
    onShowActivity: () => void;
    onShowDuplicates: () => void;
    selectedProviders: CloudProvider[];
    onProvidersChange: (providers: CloudProvider[]) => void;
    onNavigateHome: () => void;
}> = ({
    breadcrumbs,
    onNavigate,
    sortBy,
    onSortByChange,
    sortOrder,
    onSortOrderChange,
    viewMode,
    onViewModeChange,
    onRefresh,
    loading,
    extraIcon,
    selectedAccount,
    onAccountChange,
    availableAccounts,
    selectedItems,
    onToggleSelectAll,
    isAllSelected,
    storageInfo,
    onShowAnalytics,
    onShowActivity,
    onShowDuplicates,
    selectedProviders,
    onProvidersChange,
    onNavigateHome
}) => {

        // Helper function to get provider icon with account-specific colors
        const getProviderIconComponent = (provider: string, accountIndex: number) => {
            const color = getAccountColor(provider, accountIndex);

            const iconStyle = {
                width: '14px',
                height: '14px',
                borderRadius: '3px',
                backgroundColor: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '7px',
                color: 'white',
                fontWeight: 'bold' as const,
                fontFamily: FONT_FAMILY
            };

            if (provider === 'google') {
                return <div style={iconStyle}>G</div>;
            } else if (provider === 'dropbox') {
                return <div style={iconStyle}>D</div>;
            }
            return <UserOutlined style={{ fontSize: '10px' }} />;
        };

        const accountFilterOptions = [
        {
            value: null,
            label: "All Accounts", // 👈 Only plain text for selected value
            children: (
            <div
                style={{
                display: "flex",
                alignItems: "center",
                padding: "2px 0",
                fontFamily: FONT_FAMILY,
                }}
            >
                <div
                style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    backgroundColor: "#e8f0fe",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "6px",
                    flexShrink: 0,
                }}
                >
                <UserOutlined style={{ color: PRIMARY_COLOR, fontSize: "10px" }} />
                </div>
                <span
                style={{
                    fontSize: "12px",
                    color: "#202124",
                    fontWeight: 500,
                    fontFamily: FONT_FAMILY,
                }}
                >
                All Accounts
                </span>
            </div>
            ),
        },
        ...availableAccounts.map((account, index) => ({
            value: account.email,
            label: account.email, // 👈 only email goes in the box
            children: (
            <div
                style={{
                display: "flex",
                alignItems: "center",
                padding: "2px 0",
                fontFamily: FONT_FAMILY,
                minWidth: 0,
                maxWidth: "200px",
                }}
            >
                {account.photoLink ? (
                <Avatar
                    size={20}
                    src={account.photoLink}
                    style={{
                    marginRight: "6px",
                    border: `2px solid ${getAccountColor(account.provider, index)}`,
                    flexShrink: 0,
                    }}
                />
                ) : (
                <Avatar
                    size={20}
                    style={{
                    marginRight: "6px",
                    backgroundColor: getAccountColor(account.provider, index),
                    fontSize: "10px",
                    fontFamily: FONT_FAMILY,
                    flexShrink: 0,
                    }}
                >
                    {(account.displayName || account.email)[0].toUpperCase()}
                </Avatar>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                <div
                    style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    marginBottom: "1px",
                    }}
                >
                    <span
                    style={{
                        fontSize: "12px",
                        color: "#202124",
                        fontWeight: 500,
                        fontFamily: FONT_FAMILY,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        flex: 1,
                        minWidth: 0,
                    }}
                    >
                    {account.displayName || "Unknown"}
                    </span>
                    <div style={{ flexShrink: 0 }}>
                    {getProviderIconComponent(account.provider, index)}
                    </div>
                </div>
                <div
                    style={{
                    fontSize: "10px",
                    color: "#5f6368",
                    fontFamily: FONT_FAMILY,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    }}
                >
                    {account.email}
                </div>
                </div>
            </div>
            ),
        })),
        ];

        const providerFilterOptions = [
            {
                value: 'all',
                label: (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: FONT_FAMILY }}>
                        <div style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '4px',
                            background: 'linear-gradient(45deg, #4285f4, #0061ff)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <span style={{ color: 'white', fontSize: '8px', fontWeight: 'bold', fontFamily: FONT_FAMILY }}>ALL</span>
                        </div>
                        <span style={{ fontWeight: 500, fontFamily: FONT_FAMILY }}>All Providers</span>
                    </div>
                )
            },
            {
                value: 'google',
                label: (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: FONT_FAMILY }}>
                        <div style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '4px',
                            backgroundColor: '#4285f4',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <span style={{ color: 'white', fontSize: '10px', fontWeight: 'bold', fontFamily: FONT_FAMILY }}>G</span>
                        </div>
                        <span style={{ fontWeight: 500, fontFamily: FONT_FAMILY }}>Google Drive</span>
                    </div>
                )
            },
            {
                value: 'dropbox',
                label: (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: FONT_FAMILY }}>
                        <div style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '4px',
                            backgroundColor: '#0061ff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <span style={{ color: 'white', fontSize: '10px', fontWeight: 'bold', fontFamily: FONT_FAMILY }}>D</span>
                        </div>
                        <span style={{ fontWeight: 500, fontFamily: FONT_FAMILY }}>Dropbox</span>
                    </div>
                )
            }
        ];

        const selectedAccountData = availableAccounts.find(acc => acc.email === selectedAccount);
        const selectedAccountIndex = availableAccounts.findIndex(acc => acc.email === selectedAccount);

        const breadcrumbItems = [
            {
                title: <Button 
                    type="link" 
                    icon={<HomeOutlined />} 
                    onClick={onNavigateHome}
                    style={{ 
                        padding: 0, 
                        height: 'auto', 
                        color: PRIMARY_COLOR, 
                        fontFamily: FONT_FAMILY 
                    }} 
                />,
            },
            ...breadcrumbs.map((crumb, index) => ({
                title: (
                    <Button
                        type="link"
                        onClick={() => onNavigate(index)}
                        style={{
                            padding: 0,
                            height: 'auto',
                            color: index === breadcrumbs.length - 1 ? PRIMARY_COLOR : '#5f6368',
                            fontWeight: index === breadcrumbs.length - 1 ? 500 : 400,
                            fontSize: '13px',
                            fontFamily: FONT_FAMILY
                        }}
                    >
                        {crumb.name}
                    </Button>
                ),
                key: crumb.id,
            })),
        ];

        return (
            <div style={{ fontFamily: FONT_FAMILY }}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 24px',
                        borderBottom: '1px solid #e8eaed',
                        flexWrap: 'wrap',
                        gap: '16px',
                        fontFamily: FONT_FAMILY
                    }}
                >
                    {/* Left Section - Breadcrumbs and Selection */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                            <Checkbox
                                checked={isAllSelected}
                                onChange={onToggleSelectAll}
                                disabled={loading}
                                style={{ transform: 'scale(1.1)', flexShrink: 0 }}
                            />
                            <div style={{ minWidth: 0, flex: 1 }}>
                                <Breadcrumb items={breadcrumbItems} />
                            </div>
                        </div>
                        {selectedItems.length > 0 && (
                            <Badge
                                count={selectedItems.length}
                                style={{
                                    backgroundColor: PRIMARY_COLOR,
                                    boxShadow: '0 2px 6px rgba(24, 144, 255, 0.3)'
                                }}
                                showZero={false}
                            />
                        )}
                    </div>

                    {/* Right Section - Filters */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                        {/* Enhanced Filters */}
                        <Space size="middle">
                            {/* Provider Filter */}
                            <Tooltip title="Filter by cloud provider">
                                <Select
                                    mode="multiple"
                                    value={selectedProviders}
                                    onChange={onProvidersChange}
                                    style={{
                                        minWidth: 180,
                                        borderRadius: '8px',
                                        fontFamily: FONT_FAMILY
                                    }}
                                    size="middle"
                                    placeholder="All Providers"
                                    maxTagCount={1}
                                    maxTagTextLength={8}
                                    allowClear
                                    suffixIcon={<DatabaseOutlined style={{ color: PRIMARY_COLOR }} />}
                                >
                                    {providerFilterOptions.map(option => (
                                        <Select.Option key={option.value} value={option.value}>
                                            {option.label}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Tooltip>

                            <Tooltip title="Filter by account">
                                <Select
                                    value={selectedAccount ?? 'all'}
                                    onChange={onAccountChange}
                                    style={{
                                    minWidth: 220,
                                    maxWidth: 250,
                                    borderRadius: '8px',
                                    fontFamily: FONT_FAMILY,
                                    }}
                                    size="middle"
                                    placeholder="All Accounts"
                                    optionLabelProp="children" // 👈 Only text goes in the box
                                    allowClear
                                    suffixIcon={
                                    selectedAccount && selectedAccountData ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        {selectedAccountData.photoLink ? (
                                            <Avatar
                                            size={18}
                                            src={selectedAccountData.photoLink}
                                            style={{
                                                border: `2px solid ${getAccountColor(
                                                selectedAccountData.provider,
                                                selectedAccountIndex
                                                )}`,
                                            }}
                                            />
                                        ) : (
                                            <Avatar
                                            size={18}
                                            style={{
                                                backgroundColor: getAccountColor(
                                                selectedAccountData.provider,
                                                selectedAccountIndex
                                                ),
                                                fontSize: '10px',
                                                fontFamily: FONT_FAMILY,
                                            }}
                                            >
                                            {(selectedAccountData.displayName ||
                                                selectedAccountData.email ||
                                                'U')[0].toUpperCase()}
                                            </Avatar>
                                        )}
                                        {getProviderIconComponent(
                                            selectedAccountData.provider,
                                            selectedAccountIndex
                                        )}
                                        </div>
                                    ) : (
                                        <UserOutlined style={{ color: PRIMARY_COLOR }} />
                                    )
                                    }
                                    dropdownStyle={{
                                    maxWidth: '280px',
                                    }}
                                >
                                    {accountFilterOptions.map(option => (
                                    <Select.Option
                                        key={option.value ?? 'all'}
                                        value={option.value ?? 'all'}
                                    >
                                        {/* Shown in dropdown */}
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontWeight: 500 }}>{option.label}</span>
                                        </div>
                                    </Select.Option>
                                    ))}
                                </Select>
                            </Tooltip>

                            {/* Sort Controls */}
                            <Select
                                value={sortBy}
                                onChange={onSortByChange}
                                style={{
                                    width: 120,
                                    borderRadius: '8px',
                                    fontFamily: FONT_FAMILY
                                }}
                                size="middle"
                            >
                                <Select.Option value="modifiedTime">Modified</Select.Option>
                                <Select.Option value="name">Name</Select.Option>
                                <Select.Option value="size">Size</Select.Option>
                            </Select>

                            <Tooltip title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}>
                                <Button
                                    icon={
                                        sortOrder === 'asc'
                                            ? <SortAscendingOutlined />
                                            : <SortDescendingOutlined />
                                    }
                                    onClick={onSortOrderChange}
                                    size="middle"
                                    style={{
                                        borderColor: '#e8eaed',
                                        color: '#5f6368',
                                        borderRadius: '8px',
                                        fontFamily: FONT_FAMILY
                                    }}
                                />
                            </Tooltip>

                            <Tooltip title={`Switch to ${viewMode === 'grid' ? 'List' : 'Grid'} view`}>
                                <Button
                                    icon={
                                        viewMode === 'grid'
                                            ? <UnorderedListOutlined />
                                            : <AppstoreOutlined />
                                    }
                                    onClick={onViewModeChange}
                                    size="middle"
                                    style={{
                                        borderColor: '#e8eaed',
                                        color: '#5f6368',
                                        borderRadius: '8px',
                                        fontFamily: FONT_FAMILY
                                    }}
                                />
                            </Tooltip>

                            <Tooltip title="Refresh">
                                <Button
                                    icon={<ReloadOutlined spin={loading} />}
                                    onClick={onRefresh}
                                    disabled={loading}
                                    size="middle"
                                    style={{
                                        borderColor: '#e8eaed',
                                        color: '#5f6368',
                                        borderRadius: '8px',
                                        fontFamily: FONT_FAMILY
                                    }}
                                />
                            </Tooltip>

                            {extraIcon}
                        </Space>
                    </div>
                </div>
            </div>
        );
    };

// Enhanced Folders Section Component
const FoldersSection: React.FC<{
    folders: DriveFolder[];
    onFolderClick: (folderId: string, folderName: string, folderPath?: string) => void;
    onFileAction: (action: string, item: DriveFolder | DriveFile) => void;
    viewMode: 'grid' | 'list';
    selectedItems: string[];
    onItemSelect: (itemId: string, selected: boolean) => void;
    availableAccounts: AccountFilter[];
}> = ({ folders, onFolderClick, onFileAction, viewMode, selectedItems, onItemSelect, availableAccounts }) => {
    const [showAll, setShowAll] = useState(false);
    // Fixed: Show all folders in list view, limit only in grid view for better UX
    const displayFolders = showAll || viewMode === 'list'
        ? folders
        : folders.slice(0, 8);

    const getMenuItems = (folder: DriveFolder) => [
        {
            key: 'rename',
            label: 'Rename',
            icon: <EditOutlined />,
            onClick: () => onFileAction('rename', folder)
        },
        {
            key: 'copy',
            label: 'Make a copy',
            icon: <CopyOutlined />,
            onClick: () => onFileAction('copy', folder)
        },
        {
            key: 'move',
            label: 'Move',
            icon: <FolderOpenOutlined />,
            onClick: () => onFileAction('move', folder)
        },
        {
            key: 'share',
            label: 'Share',
            icon: <ShareAltOutlined />,
            onClick: () => onFileAction('share', folder)
        },
        {
            key: 'info',
            label: 'Details',
            icon: <InfoCircleOutlined />,
            onClick: () => onFileAction('info', folder)
        },
        {
            key: 'delete',
            label: (
                <Popconfirm
                    title="Delete folder?"
                    description={`Are you sure you want to delete "${folder.name}"?`}
                    okText="Delete"
                    okType="danger"
                    onConfirm={() => onFileAction('delete', folder)}
                >
                    <span style={{ color: 'red', fontFamily: FONT_FAMILY }}>Delete</span>
                </Popconfirm>
            ),
            icon: <DeleteOutlined />,
            danger: true,
        }
    ];

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        return date.toLocaleDateString();
    };

    const getFolderAccentColor = (folder: DriveFolder) => {
        if (!folder.source_email && !folder.provider) return PRIMARY_COLOR;

        const accountIndex = availableAccounts.findIndex(acc => acc.email === folder.source_email);
        const provider = folder.provider || getFileSource(folder);
        return getAccountColor(provider, accountIndex >= 0 ? accountIndex : 0);
    };

    if (folders.length === 0) return null;

    return (
        <div style={{ padding: '20px 24px', fontFamily: FONT_FAMILY }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FolderOutlined style={{ color: PRIMARY_COLOR, fontSize: '16px' }} />
                    <Text style={{ fontSize: '16px', fontWeight: 600, color: '#202124', fontFamily: FONT_FAMILY }}>
                        Folders
                    </Text>
                    <Badge
                        count={folders.length}
                        style={{ backgroundColor: '#e8f0fe', color: PRIMARY_COLOR }}
                    />
                </div>
                {/* Only show expand/collapse for grid view when there are more than 8 folders */}
                {viewMode === 'grid' && folders.length > 8 && (
                    <Button
                        type="text"
                        size="small"
                        icon={showAll ? <UpOutlined /> : <DownOutlined />}
                        onClick={() => setShowAll(!showAll)}
                        style={{
                            color: PRIMARY_COLOR,
                            fontSize: '13px',
                            height: '28px',
                            borderRadius: '6px',
                            fontFamily: FONT_FAMILY
                        }}
                    >
                        {showAll ? 'Show less' : `Show all (${folders.length})`}
                    </Button>
                )}
            </div>

            {viewMode === 'grid' ? (
                <Row gutter={[12, 12]}>
                    {displayFolders.map((folder) => {
                        const accentColor = getFolderAccentColor(folder);
                        return (
                            <Col xs={24} sm={12} md={8} lg={6} xl={4} key={folder.id}>
                                <div
                                    style={{
                                        padding: '12px',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        backgroundColor: '#fff',
                                        border: `2px solid ${accentColor}15`,
                                        position: 'relative',
                                        fontFamily: FONT_FAMILY,
                                        minHeight: '120px',
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = accentColor + '08';
                                        e.currentTarget.style.borderColor = accentColor + '30';
                                        e.currentTarget.style.boxShadow = `0 4px 12px ${accentColor}25`;
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#fff';
                                        e.currentTarget.style.borderColor = accentColor + '15';
                                        e.currentTarget.style.boxShadow = 'none';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '8px', minWidth: 0 }}>
                                        <Checkbox
                                            checked={selectedItems.includes(folder.id)}
                                            onChange={(e) => onItemSelect(folder.id, e.target.checked)}
                                            onClick={(e) => e.stopPropagation()}
                                            style={{ marginRight: '8px', flexShrink: 0 }}
                                        />
                                        <FolderOutlined
                                            style={{
                                                fontSize: '20px',
                                                color: accentColor,
                                                marginRight: '8px',
                                                cursor: 'pointer',
                                                flexShrink: 0
                                            }}
                                            onClick={() => onFolderClick(folder.id, folder.name, folder.path)}
                                        />
                                        <div
                                            style={{
                                                flex: 1,
                                                minWidth: 0,
                                                cursor: 'pointer',
                                                paddingRight: '24px'
                                            }}
                                            onClick={() => onFolderClick(folder.id, folder.name, folder.path)}
                                        >
                                            <Text
                                                style={{
                                                    fontSize: '14px',
                                                    color: '#202124',
                                                    fontWeight: 500,
                                                    fontFamily: FONT_FAMILY,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    display: 'block',
                                                    lineHeight: '20px'
                                                }}
                                                title={folder.name}
                                            >
                                                {folder.name}
                                            </Text>
                                        </div>
                                        <Dropdown
                                            menu={{ items: getMenuItems(folder) }}
                                            trigger={['click']}
                                        >
                                            <Button
                                                type="text"
                                                size="small"
                                                icon={<MoreOutlined />}
                                                style={{
                                                    color: accentColor,
                                                    position: 'absolute',
                                                    top: '8px',
                                                    right: '8px',
                                                    borderRadius: '6px'
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </Dropdown>
                                    </div>
                                    <div style={{ marginLeft: '28px', flex: 1, minWidth: 0 }}>
                                        <Text style={{ 
                                            fontSize: '11px', 
                                            color: '#5f6368', 
                                            fontFamily: FONT_FAMILY,
                                            display: 'block',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {/* Modified {formatDate(folder.modifiedTime)} */}
                                        </Text>
                                        <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                            {folder.shared && (
                                                <Tag color="blue" style={{ fontSize: '9px', fontFamily: FONT_FAMILY, margin: '1px 0' }}>
                                                    <TeamOutlined style={{ marginRight: '2px' }} />
                                                    Shared
                                                </Tag>
                                            )}
                                            {(folder.source_email || folder.provider) && (
                                                <Tag
                                                    style={{
                                                        fontSize: '9px',
                                                        backgroundColor: accentColor + '15',
                                                        borderColor: accentColor + '40',
                                                        color: accentColor,
                                                        fontFamily: FONT_FAMILY,
                                                        margin: '1px 0'
                                                    }}
                                                >
                                                    {folder.provider === 'google' || getFileSource(folder) === 'google' ? 'Google' :
                                                        folder.provider === 'dropbox' || getFileSource(folder) === 'dropbox' ? 'Dropbox' : 'OneDrive'}
                                                </Tag>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        );
                    })}
                </Row>
            ) : (
                <div>
                    {displayFolders.map((folder) => {
                        const accentColor = getFolderAccentColor(folder);
                        return (
                            <div
                                key={folder.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    marginBottom: '4px',
                                    borderLeft: `4px solid ${accentColor}`,
                                    backgroundColor: '#fff',
                                    fontFamily: FONT_FAMILY,
                                    minWidth: 0
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = accentColor + '08';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#fff';
                                }}
                            >
                                <Checkbox
                                    checked={selectedItems.includes(folder.id)}
                                    onChange={(e) => onItemSelect(folder.id, e.target.checked)}
                                    style={{ marginRight: '12px', flexShrink: 0 }}
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <FolderOutlined
                                    style={{
                                        fontSize: '18px',
                                        color: accentColor,
                                        marginRight: '16px',
                                        cursor: 'pointer',
                                        flexShrink: 0
                                    }}
                                    onClick={() => onFolderClick(folder.id, folder.name, folder.path)}
                                />
                                <div
                                    style={{ flex: 1, minWidth: 0, cursor: 'pointer', fontFamily: FONT_FAMILY }}
                                    onClick={() => onFolderClick(folder.id, folder.name, folder.path)}
                                >
                                    <Text style={{ 
                                        fontSize: '14px', 
                                        color: '#202124', 
                                        fontWeight: 500, 
                                        fontFamily: FONT_FAMILY,
                                        display: 'block',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {folder.name}
                                    </Text>
                                    <div style={{ marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                        <Text style={{ 
                                            fontSize: '12px', 
                                            color: '#5f6368', 
                                            fontFamily: FONT_FAMILY,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            maxWidth: '200px'
                                        }}>
                                            Modified {formatDate(folder.modifiedTime)}
                                        </Text>
                                        {folder.shared && (
                                            <Tag color="blue" style={{ fontSize: '10px', fontFamily: FONT_FAMILY }}>
                                                <TeamOutlined style={{ marginRight: '2px' }} />
                                                Shared
                                            </Tag>
                                        )}
                                        {(folder.source_email || folder.provider) && (
                                            <Tag
                                                style={{
                                                    fontSize: '10px',
                                                    backgroundColor: accentColor + '15',
                                                    borderColor: accentColor + '40',
                                                    color: accentColor,
                                                    fontFamily: FONT_FAMILY
                                                }}
                                            >
                                                {folder.provider === 'google' || getFileSource(folder) === 'google' ? 'Google' :
                                                    folder.provider === 'dropbox' || getFileSource(folder) === 'dropbox' ? 'Dropbox' : 'OneDrive'}
                                            </Tag>
                                        )}
                                    </div>
                                </div>
                                <Dropdown
                                    menu={{ items: getMenuItems(folder) }}
                                    trigger={['click']}
                                >
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<MoreOutlined />}
                                        style={{ color: '#5f6368', borderRadius: '6px', flexShrink: 0 }}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </Dropdown>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return <FileTextOutlined />;
    if (mimeType.includes('image')) return <PictureOutlined />;
    if (mimeType.includes('video')) return <PlayCircleOutlined />;
    if (mimeType.includes('pdf')) return <FilePdfOutlined />;
    if (mimeType.includes('document')) return <FileTextOutlined />;
    if (mimeType.includes('spreadsheet')) return <FileExcelOutlined />;
    if (mimeType.includes('presentation')) return <FilePptOutlined />;
    if (mimeType.includes('zip') || mimeType.includes('archive')) return <FileZipOutlined />;
    return <FileTextOutlined />;
};

const getFileIconColor = (mimeType?: string) => {
    if (!mimeType) return '#5f6368';
    if (mimeType.includes('image')) return '#34a853';
    if (mimeType.includes('video')) return '#ea4335';
    if (mimeType.includes('pdf')) return '#ea4335';
    if (mimeType.includes('document')) return '#4285f4';
    if (mimeType.includes('spreadsheet')) return '#34a853';
    if (mimeType.includes('presentation')) return '#ff9900';
    if (mimeType.includes('zip') || mimeType.includes('archive')) return '#9aa0a6';
    return '#5f6368';
};

const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
};

// Enhanced Files Section Component with unified data handling
const FilesSection: React.FC<{
    files: DriveFile[];
    onFileAction: (action: string, file: DriveFile) => void;
    viewMode: 'grid' | 'list';
    currentPage: number;
    pageSize: number;
    onPageChange: (page: number, size?: number) => void;
    selectedItems: string[];
    onItemSelect: (itemId: string, selected: boolean) => void;
    availableAccounts: AccountFilter[];
}> = ({ files, onFileAction, viewMode, currentPage, pageSize, onPageChange, selectedItems, onItemSelect, availableAccounts }) => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const displayFiles = files.slice(startIndex, endIndex);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        return date.toLocaleDateString();
    };

    const getFileAccentColor = (file: DriveFile) => {
        if (!file.source_email && !file.provider) return PRIMARY_COLOR;

        const accountIndex = availableAccounts.findIndex(acc => acc.email === file.source_email);
        const provider = file.provider || getFileSource(file);
        return getAccountColor(provider, accountIndex >= 0 ? accountIndex : 0);
    };

    const getMenuItems = (file: DriveFile) => [
        // Only show 'view' option if webViewLink exists (mainly for Google Drive files)
        ...(file.webViewLink ? [{
            key: 'view',
            label: 'Open',
            icon: <EyeOutlined />,
            onClick: () => onFileAction('view', file),
        }] : []),
        {
            key: 'download',
            label: 'Download',
            icon: <DownloadOutlined />,
            onClick: () => onFileAction('download', file),
        },
        {
            key: 'rename',
            label: 'Rename',
            icon: <EditOutlined />,
            onClick: () => onFileAction('rename', file),
        },
        {
            key: 'copy',
            label: 'Make a copy',
            icon: <CopyOutlined />,
            onClick: () => onFileAction('copy', file),
        },
        {
            key: 'move',
            label: 'Move',
            icon: <FolderOpenOutlined />,
            onClick: () => onFileAction('move', file),
        },
        // Only show star option for Google Drive files (Dropbox doesn't support starring)
        ...(file.starred !== undefined ? [{
            key: 'star',
            label: file.starred ? 'Remove star' : 'Add star',
            icon: file.starred ? <StarFilled style={{ color: '#fbbc04' }} /> : <StarOutlined />,
            onClick: () => onFileAction('star', file),
        }] : []),
        {
            key: 'share',
            label: 'Share',
            icon: <ShareAltOutlined />,
            onClick: () => onFileAction('share', file),
        },
        {
            key: 'info',
            label: 'Details',
            icon: <InfoCircleOutlined />,
            onClick: () => onFileAction('info', file),
        },
        {
            key: 'delete',
            label: (
                <Popconfirm
                    title="Delete file?"
                    description={`Are you sure you want to delete "${file.name}"?`}
                    okText="Delete"
                    okType="danger"
                    onConfirm={() => onFileAction('delete', file)}
                >
                    <span style={{ color: 'red', fontFamily: FONT_FAMILY }}>Delete</span>
                </Popconfirm>
            ),
            icon: <DeleteOutlined style={{ color: 'red' }} />,
        }
    ];

    if (files.length === 0) return null;

    // ------------------ LIST VIEW -------------------
    if (viewMode === 'list') {
        const columns = [
            {
                title: '',
                key: 'select',
                width: 50,
                render: (_: any, record: DriveFile) => (
                    <Checkbox
                        checked={selectedItems.includes(record.id)}
                        onChange={(e) => onItemSelect(record.id, e.target.checked)}
                    />
                )
            },
            {
                title: 'Name',
                dataIndex: 'name',
                key: 'name',
                ellipsis: true,
                render: (text: string, record: DriveFile) => {
                    const accentColor = getFileAccentColor(record);
                    return (
                        <div
                            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontFamily: FONT_FAMILY, minWidth: 0 }}
                            onClick={() => record.webViewLink ? onFileAction('view', record) : onFileAction('download', record)}
                        >
                            <div
                                style={{
                                    marginRight: '12px',
                                    color: getFileIconColor(record.mimeType),
                                    fontSize: '16px',
                                    flexShrink: 0
                                }}
                            >
                                {getFileIcon(record.mimeType)}
                            </div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                                    <Text style={{ 
                                        fontSize: '14px', 
                                        color: '#202124', 
                                        fontWeight: 500, 
                                        fontFamily: FONT_FAMILY,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        flex: 1,
                                        minWidth: 0
                                    }}>
                                        {text}
                                    </Text>
                                    {record.starred && (
                                        <StarFilled style={{ color: '#fbbc04', fontSize: '12px', flexShrink: 0 }} />
                                    )}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px', flexWrap: 'wrap' }}>
                                    {record.shared && (
                                        <Tag color="blue" style={{ fontSize: '10px', fontFamily: FONT_FAMILY }}>
                                            <TeamOutlined style={{ marginRight: '2px' }} />
                                            Shared
                                        </Tag>
                                    )}
                                    {(record.source_email || record.provider) && (
                                        <Tag
                                            style={{
                                                fontSize: '10px',
                                                backgroundColor: accentColor + '15',
                                                borderColor: accentColor + '40',
                                                color: accentColor,
                                                fontFamily: FONT_FAMILY
                                            }}
                                        >
                                            {record.provider === 'google' || getFileSource(record) === 'google' ? 'Google' :
                                                record.provider === 'dropbox' || getFileSource(record) === 'dropbox' ? 'Dropbox' : 'OneDrive'}
                                        </Tag>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                }
            },
            {
                title: 'Owner',
                dataIndex: 'owners',
                key: 'owners',
                width: 160,
                render: (owners: DriveFile['owners']) => (
                    <div style={{ display: 'flex', alignItems: 'center', fontFamily: FONT_FAMILY }}>
                        {owners && owners[0]?.photoLink ? (
                            <Avatar size="small" src={owners[0].photoLink} style={{ marginRight: '8px' }} />
                        ) : (
                            <Avatar size="small" style={{ marginRight: '8px', backgroundColor: PRIMARY_COLOR, fontFamily: FONT_FAMILY }}>
                                {(owners && owners[0]?.displayName || 'U')[0]}
                            </Avatar>
                        )}
                        <Text style={{ 
                            fontSize: '12px', 
                            color: '#5f6368', 
                            fontFamily: FONT_FAMILY,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}>
                            {owners && owners[0]?.displayName || 'Unknown'}
                        </Text>
                    </div>
                ),
            },
            {
                title: 'Last modified',
                dataIndex: 'modifiedTime',
                key: 'modifiedTime',
                width: 140,
                render: (text: string) => (
                    <Text style={{ fontSize: '12px', color: '#5f6368', fontFamily: FONT_FAMILY }}>{formatDate(text)}</Text>
                ),
            },
            {
                title: 'File size',
                dataIndex: 'size',
                key: 'size',
                width: 100,
                render: (size?: number) => (
                    <Text style={{ fontSize: '12px', color: '#5f6368', fontFamily: FONT_FAMILY }}>{formatFileSize(size)}</Text>
                ),
            },
            {
                title: '',
                key: 'actions',
                width: 60,
                render: (_: any, record: DriveFile) => (
                    <Dropdown menu={{ items: getMenuItems(record) }} trigger={['click']}>
                        <Button type="text" icon={<MoreOutlined />} style={{ color: '#5f6368', borderRadius: '6px' }} />
                    </Dropdown>
                ),
            },
        ];

        return (
            <div style={{ padding: '0 24px 24px', fontFamily: FONT_FAMILY }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <FileTextOutlined style={{ color: PRIMARY_COLOR, fontSize: '16px' }} />
                    <Text style={{ fontSize: '16px', fontWeight: 600, color: '#202124', fontFamily: FONT_FAMILY }}>Files</Text>
                    <Badge count={files.length} style={{ backgroundColor: '#e8f0fe', color: PRIMARY_COLOR }} />
                </div>
                <Table
                    columns={columns}
                    dataSource={displayFiles}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    style={{
                        backgroundColor: '#fff',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        fontFamily: FONT_FAMILY,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                    }}
                    className="custom-table"
                />
                {files.length > pageSize && (
                    <div
                        style={{
                            textAlign: 'center',
                            marginTop: '20px',
                            padding: '16px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '12px',
                        }}
                    >
                        <Pagination
                            current={currentPage}
                            total={files.length}
                            pageSize={pageSize}
                            onChange={onPageChange}
                            showSizeChanger
                            showQuickJumper
                            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} files`}
                            style={{ fontSize: '12px', fontFamily: FONT_FAMILY }}
                        />
                    </div>
                )}
            </div>
        );
    }

    // ------------------ GRID VIEW -------------------
    return (
        <div style={{ padding: '20px 24px', fontFamily: FONT_FAMILY }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <FileTextOutlined style={{ color: PRIMARY_COLOR, fontSize: '16px' }} />
                <Text style={{ fontSize: '16px', fontWeight: 600, color: '#202124', fontFamily: FONT_FAMILY }}>Files</Text>
                <Badge count={files.length} style={{ backgroundColor: '#e8f0fe', color: PRIMARY_COLOR }} />
            </div>
            <Row gutter={[12, 12]}>
                {displayFiles.map((file) => {
                    const accentColor = getFileAccentColor(file);
                    return (
                        <Col xs={12} sm={8} md={6} lg={4} xl={3} key={file.id}>
                            <div
                                style={{
                                    padding: '0',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    backgroundColor: '#fff',
                                    border: `2px solid ${accentColor}15`,
                                    overflow: 'hidden',
                                    position: 'relative',
                                    fontFamily: FONT_FAMILY,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                    minHeight: '200px',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.boxShadow = `0 6px 20px ${accentColor}25`;
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.borderColor = accentColor + '30';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.borderColor = accentColor + '15';
                                }}
                            >
                                <div
                                    style={{
                                        height: '120px',
                                        backgroundColor: '#f8f9fa',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundImage: file.thumbnailLink
                                            ? `url(${file.thumbnailLink})`
                                            : 'none',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        position: 'relative',
                                        borderBottom: `3px solid ${accentColor}20`
                                    }}
                                >
                                    <Checkbox
                                        checked={selectedItems.includes(file.id)}
                                        onChange={(e) => onItemSelect(file.id, e.target.checked)}
                                        style={{
                                            position: 'absolute',
                                            top: '8px',
                                            left: '8px',
                                            backgroundColor: 'rgba(255,255,255,0.95)',
                                            borderRadius: '4px',
                                            padding: '2px'
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    {!file.thumbnailLink && (
                                        <div style={{ fontSize: '32px', color: getFileIconColor(file.mimeType) }}>
                                            {getFileIcon(file.mimeType)}
                                        </div>
                                    )}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: '8px',
                                            right: '8px',
                                        }}
                                    >
                                        <Dropdown menu={{ items: getMenuItems(file) }} trigger={['click']}>
                                            <Button
                                                type="primary"
                                                size="small"
                                                icon={<MoreOutlined />}
                                                style={{
                                                    border: 'none',
                                                    color: accentColor,
                                                    backgroundColor: 'rgba(255,255,255,0.95)',
                                                    borderRadius: '6px'
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </Dropdown>
                                    </div>
                                </div>
                                <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px', minWidth: 0 }}>
                                        <Text
                                            style={{
                                                fontSize: '13px',
                                                color: '#202124',
                                                fontWeight: 500,
                                                flex: 1,
                                                cursor: 'pointer',
                                                fontFamily: FONT_FAMILY,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                minWidth: 0
                                            }}
                                            onClick={() => file.webViewLink ? onFileAction('view', file) : onFileAction('download', file)}
                                            title={file.name}
                                        >
                                            {file.name}
                                        </Text>
                                        {file.starred && (
                                            <StarFilled style={{ color: '#fbbc04', fontSize: '11px', flexShrink: 0 }} />
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px', minWidth: 0 }}>
                                        {file.owners && file.owners[0]?.photoLink ? (
                                            <Avatar
                                                size={16}
                                                src={file.owners[0].photoLink}
                                                style={{ marginRight: '6px', flexShrink: 0 }}
                                            />
                                        ) : (
                                            <Avatar
                                                size={16}
                                                style={{
                                                    marginRight: '6px',
                                                    backgroundColor: accentColor,
                                                    fontSize: '9px',
                                                    fontFamily: FONT_FAMILY,
                                                    flexShrink: 0
                                                }}
                                            >
                                                {(file.owners && file.owners[0]?.displayName?.[0] || 'U')}
                                            </Avatar>
                                        )}
                                        <Text
                                            style={{
                                                fontSize: '11px',
                                                color: '#5f6368',
                                                fontFamily: FONT_FAMILY,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                flex: 1,
                                                minWidth: 0
                                            }}
                                        >
                                            {formatDate(file.modifiedTime)}
                                        </Text>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', minWidth: 0 }}>
                                        <Text style={{ 
                                            fontSize: '11px', 
                                            color: '#5f6368', 
                                            fontFamily: FONT_FAMILY,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            flex: 1,
                                            minWidth: 0
                                        }}>
                                            {formatFileSize(file.size)}
                                        </Text>
                                        <Space size={4} style={{ flexShrink: 0 }}>
                                            {file.shared && (
                                                <Tooltip title="Shared">
                                                    <TeamOutlined style={{ color: accentColor, fontSize: '11px' }} />
                                                </Tooltip>
                                            )}
                                            {(file.source_email || file.provider) && (
                                                <Tag
                                                    style={{
                                                        fontSize: '8px',
                                                        margin: 0,
                                                        backgroundColor: accentColor + '15',
                                                        borderColor: accentColor + '40',
                                                        color: accentColor,
                                                        fontFamily: FONT_FAMILY
                                                    }}
                                                >
                                                    {file.provider === 'google' || getFileSource(file) === 'google' ? 'G' :
                                                        file.provider === 'dropbox' || getFileSource(file) === 'dropbox' ? 'D' : 'O'}
                                                </Tag>
                                            )}
                                        </Space>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    );
                })}
            </Row>
            {files.length > pageSize && (
                <div
                    style={{
                        textAlign: 'center',
                        marginTop: '20px',
                        padding: '16px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '12px',
                    }}
                >
                    <Pagination
                        current={currentPage}
                        total={files.length}
                        pageSize={pageSize}
                        onChange={onPageChange}
                        showSizeChanger
                        showQuickJumper
                        showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} files`}
                        style={{ fontSize: '12px', fontFamily: FONT_FAMILY }}
                    />
                </div>
            )}
        </div>
    );
};

// Helper function to sort arrays properly
const sortItems = <T extends { name: string; modifiedTime: string; size?: number }>(
    items: T[], 
    sortBy: 'name' | 'modifiedTime' | 'size', 
    sortOrder: 'asc' | 'desc'
): T[] => {
    return [...items].sort((a, b) => {
        let comparison = 0;
        
        switch (sortBy) {
            case 'name':
                comparison = a.name.localeCompare(b.name, undefined, { 
                    numeric: true, 
                    sensitivity: 'base' 
                });
                break;
            case 'modifiedTime':
                comparison = new Date(a.modifiedTime).getTime() - new Date(b.modifiedTime).getTime();
                break;
            case 'size':
                const sizeA = a.size || 0;
                const sizeB = b.size || 0;
                comparison = sizeA - sizeB;
                break;
            default:
                comparison = 0;
        }
        
        return sortOrder === 'desc' ? -comparison : comparison;
    });
};

// Main Files Manager Component
const FilesManager: React.FC = () => {
    const [files, setFiles] = useState<DriveFile[]>([]);
    const [folders, setFolders] = useState<DriveFolder[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'modifiedTime' | 'size'>('modifiedTime');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [currentFolder, setCurrentFolder] = useState<string>('root');
    const [currentFolderPath, setCurrentFolderPath] = useState<string>('');
    const [breadcrumbs, setBreadcrumbs] = useState<Array<{ id: string; name: string; path?: string }>>([
        { id: 'root', name: 'My Drive', path: '' }
    ]);
    const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
    const [isUploading, setIsUploading] = useState(false);
    const [showCreateFolder, setShowCreateFolder] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareFileId, setShareFileId] = useState<string>('');
    const [shareFilePath, setShareFilePath] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(16);
    const [showUploadArea, setShowUploadArea] = useState(true);
    const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
    const [availableAccounts, setAvailableAccounts] = useState<AccountFilter[]>([]);
    const [selectedProviders, setSelectedProviders] = useState<CloudProvider[]>(['all']);

    // Provider Selection States
    const [showProviderSelectionModal, setShowProviderSelectionModal] = useState(false);
    const [providerSelectionType, setProviderSelectionType] = useState<'upload' | 'folder'>('upload');

    // Enhanced features state
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [showActivity, setShowActivity] = useState(false);
    const [showDuplicates, setShowDuplicates] = useState(false);
    const [showRenameModal, setShowRenameModal] = useState(false);
    const [showMoveModal, setShowMoveModal] = useState(false);
    const [showCopyModal, setShowCopyModal] = useState(false);
    const [showBulkShareModal, setShowBulkShareModal] = useState(false);
    const [showBulkMoveModal, setShowBulkMoveModal] = useState(false);
    const [showBulkCopyModal, setShowBulkCopyModal] = useState(false);
    const [showFileInfoModal, setShowFileInfoModal] = useState(false);
    const [currentActionItem, setCurrentActionItem] = useState<DriveFile | DriveFolder | null>(null);
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
    const [duplicateFiles, setDuplicateFiles] = useState<DuplicateFile[]>([]);
    const [storageAnalytics, setStorageAnalytics] = useState<any>(null);

    // Additional state for new modals
    const [fileInfo, setFileInfo] = useState<any>(null);
    const [folderTreeData, setFolderTreeData] = useState<any[]>([]);

    const handleToggleUpload = () => setShowUploadArea(true);
    const handleAddFolder = () => {
        setProviderSelectionType('folder');
        setShowProviderSelectionModal(true);
    };

    const [form] = Form.useForm();
    const [shareForm] = Form.useForm();
    const [renameForm] = Form.useForm();
    const [moveForm] = Form.useForm();
    const [copyForm] = Form.useForm();
    const [bulkShareForm] = Form.useForm();
    const [bulkMoveForm] = Form.useForm();
    const [bulkCopyForm] = Form.useForm();

    // Extract unique accounts from files and folders
    const extractAvailableAccounts = useCallback((files: DriveFile[], folders: DriveFolder[]) => {
        const accountsMap = new Map<string, AccountFilter>();

        // Extract from files
        files.forEach(file => {
            if (file.source_email) {
                const provider = file.provider || getFileSource(file);
                accountsMap.set(file.source_email, {
                    email: file.source_email,
                    displayName: file.account_name || file.source_email.split('@')[0],
                    photoLink: file.owners?.[0]?.photoLink,
                    provider: provider
                });
            }
        });

        // Extract from folders
        folders.forEach(folder => {
            if (folder.source_email) {
                const provider = folder.provider || getFileSource(folder);
                accountsMap.set(folder.source_email, {
                    email: folder.source_email,
                    displayName: folder.account_name || folder.source_email.split('@')[0],
                    photoLink: folder.owners?.[0]?.photoLink,
                    provider: provider
                });
            }
        });

        return Array.from(accountsMap.values()).sort((a, b) =>
            a.displayName.localeCompare(b.displayName)
        );
    }, []);

    // Build folder tree for move/copy operations
    const buildFolderTree = useCallback((folders: DriveFolder[], currentItemId?: string) => {
        return [
            {
                title: 'My Drive',
                key: 'root',
                value: 'root',
                path: '',
                icon: <HomeOutlined />,
                children: folders
                    .filter(folder => folder.id !== currentItemId)
                    .map(folder => ({
                        title: folder.name,
                        key: folder.id,
                        value: folder.id,
                        path: folder.path || '',
                        icon: <FolderOutlined />,
                    }))
            }
        ];
    }, []);

    const fetchFiles = async () => {
        try {
            setLoading(true);
            const response = await listDriveFiles({
                folderId: currentFolder === 'root' ? undefined : currentFolder,
                folderPath: currentFolderPath,
                sortBy,
                sortOrder,
                pageSize: 100,
                providers: selectedProviders.length === 0 ? ['all'] : selectedProviders
            });

            if (response?.data) {
                // Create deep copies to avoid modifying original data
                let rawFiles = response.data.payload.files ? 
                    response.data.payload.files.map(file => ({ ...file })) : [];
                let rawFolders = response.data.payload.folders ? 
                    response.data.payload.folders.map(folder => ({ ...folder })) : [];

                // Apply frontend sorting to ensure correct order
                rawFiles = sortItems(rawFiles, sortBy, sortOrder);
                rawFolders = sortItems(rawFolders, sortBy, sortOrder);

                setFiles(rawFiles);
                setFolders(rawFolders);

                // Extract available accounts
                const accounts = extractAvailableAccounts(rawFiles, rawFolders);
                setAvailableAccounts(accounts);

                // Build folder tree for modals
                const tree = buildFolderTree(rawFolders);
                setFolderTreeData(tree);
            }
        } catch (error: any) {
            console.error('Error fetching files:', error);
            message.error('Failed to fetch files. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchStorageInfo = async () => {
        try {
            const response = await getDriveStorage(selectedProviders.length === 0 ? ['all'] : selectedProviders);
            if (response?.data) {
                setStorageInfo(response.data.payload);
            }
        } catch (error: any) {
            console.error('Error fetching storage info:', error);
        }
    };

    const fetchActivityLog = async () => {
        try {
            const response = await getActivityLog({ limit: 50 });
            if (response?.data) {
                setActivityLogs(response.data.payload.activities || []);
            }
        } catch (error: any) {
            console.error('Error fetching activity log:', error);
        }
    };

    const fetchDuplicates = async () => {
        try {
            const response = await findDuplicateFiles({
                folderId: currentFolder === 'root' ? undefined : currentFolder,
                folderPath: currentFolderPath,
                providers: selectedProviders.length === 0 ? ['all'] : selectedProviders
            });
            if (response?.data?.results) {
                const allDuplicates: DuplicateFile[] = [];
                response.data.results.forEach((result: any) => {
                    if (result.payload?.duplicates) {
                        allDuplicates.push(...result.payload.duplicates);
                    }
                });
                setDuplicateFiles(allDuplicates);
            }
        } catch (error: any) {
            console.error('Error finding duplicates:', error);
            message.error('Failed to find duplicate files.');
        }
    };

    const fetchStorageAnalytics = async () => {
        try {
            const response = await getStorageAnalytics(selectedProviders.length === 0 ? ['all'] : selectedProviders);
            if (response?.data?.results) {
                setStorageAnalytics(response.data.results);
            }
        } catch (error: any) {
            console.error('Error fetching storage analytics:', error);
        }
    };

    const fetchFileInfo = async (fileId: string, filePath?: string) => {
        try {
            const response = await getDriveFileInfo({
                fileId: filePath ? undefined : fileId,
                filePath: filePath
            });
            if (response?.data) {
                setFileInfo(response.data.payload);
            }
        } catch (error: any) {
            console.error('Error fetching file info:', error);
            message.error('Failed to fetch file information.');
        }
    };

    useEffect(() => {
        fetchFiles();
    }, [currentFolder, currentFolderPath, sortBy, sortOrder, selectedProviders]);

    useEffect(() => {
        fetchStorageInfo();
    }, [selectedProviders]);

    const logUserActivity = async (action: string, fileName: string, fileId?: string, filePath?: string, details?: string) => {
        try {
            await logActivity({ action, fileName, fileId, filePath, details });
        } catch (error) {
            console.error('Error logging activity:', error);
        }
    };

    const handleFileUpload = async (file: File, provider: CloudProvider, folderId: string, folderPath: string) => {
        setIsUploading(true);
        setUploadProgress(prev => ({
            ...prev,
            [file.name]: { progress: 0, status: 'uploading' }
        }));

        try {
            const uploadParams: any = { file, provider };

            // Set appropriate parent based on provider
            if (provider === 'google') {
                uploadParams.parentId = folderId === 'root' ? undefined : folderId;
            } else if (provider === 'dropbox') {
                uploadParams.folderPath = folderPath;
            }

            // Call API (already returns backend response)
            const response = await uploadDriveFile(uploadParams);

            if (response?.status === 1) {
                // ✅ Upload succeeded
                setUploadProgress(prev => ({
                    ...prev,
                    [file.name]: { progress: 100, status: 'completed' }
                }));

                showNotification(
                    'Success',
                    response?.data?.message || `${file.name} uploaded successfully to ${getProviderDisplayName(provider)}`,
                    'success'
                );

                await logUserActivity(
                    'upload',
                    file.name,
                    undefined,
                    folderPath,
                    `Uploaded to ${getProviderDisplayName(provider)} in ${breadcrumbs[breadcrumbs.length - 1].name}`
                );

                // Refresh files
                fetchFiles();
            } else {
                // ❌ Backend error
                setUploadProgress(prev => ({
                    ...prev,
                    [file.name]: { progress: 0, status: 'error' }
                }));

                showNotification(
                    'Error',
                    response?.data?.message || `Failed to upload ${file.name} to ${getProviderDisplayName(provider)}`,
                    'error'
                );
            }
        } catch (error: any) {
            console.error('Upload error:', error);

            setUploadProgress(prev => ({
                ...prev,
                [file.name]: { progress: 0, status: 'error' }
            }));

            showNotification(
                'Error',
                `Failed to upload ${file.name} to ${getProviderDisplayName(provider)}`,
                'error'
            );
        } finally {
            setIsUploading(false);

            // Clear progress after a delay
            setTimeout(() => {
                setUploadProgress(prev => {
                    const newProgress = { ...prev };
                    delete newProgress[file.name];
                    return newProgress;
                });
            }, 3000);
        }
    };

    const handleProviderSelection = async (provider: CloudProvider) => {
        setShowProviderSelectionModal(false);

        if (providerSelectionType === 'folder') {
            setShowCreateFolder(true);
            // Store selected provider for folder creation
            form.setFieldsValue({ provider });
        }
    };

    const handleFileAction = async (action: string, item: DriveFile | DriveFolder) => {
        const fileSource = item.provider || getFileSource(item);

        switch (action) {
            case 'view':
                if ('webViewLink' in item && item.webViewLink) {
                    window.open(item.webViewLink, '_blank');
                    await logUserActivity('view', item.name, item.id, item.path);
                }
                break;
            case 'download':
                if ('mimeType' in item) {
                    try {
                        const downloadParams: any = { provider: fileSource };

                        if (fileSource === 'google') {
                            downloadParams.fileId = item.id;
                        } else if (fileSource === 'dropbox') {
                            downloadParams.filePath = item.path || item.id;
                        }

                        const response = await downloadDriveFile(downloadParams);
                        const blob = new Blob([response.data]);
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = item.name;
                        document.body.appendChild(a);
                        a.click();
                        window.URL.revokeObjectURL(url);
                        document.body.removeChild(a);
                        message.success(`${item.name} downloaded successfully`);
                        await logUserActivity('download', item.name, item.id, item.path);
                    } catch (error: any) {
                        console.error('Download error:', error);
                        message.error(`Failed to download ${item.name}`);
                    }
                }
                break;
            case 'rename':
                setCurrentActionItem(item);
                setShowRenameModal(true);
                renameForm.setFieldsValue({ newName: item.name });
                break;
            case 'copy':
                setCurrentActionItem(item);
                setShowCopyModal(true);
                copyForm.setFieldsValue({ newName: `Copy of ${item.name}`, targetFolder: 'root' });
                break;
            case 'move':
                setCurrentActionItem(item);
                setShowMoveModal(true);
                moveForm.setFieldsValue({ targetFolder: 'root' });
                break;
            case 'star':
                if ('starred' in item && item.starred !== undefined && fileSource === 'google') {
                    try {
                        await starDriveFile({ fileId: item.id, starred: !item.starred });
                        message.success(`${item.starred ? 'Removed star from' : 'Added star to'} ${item.name}`);
                        await logUserActivity(item.starred ? 'unstar' : 'star', item.name, item.id, item.path);
                        fetchFiles();
                    } catch (error: any) {
                        console.error('Star error:', error);
                        message.error(`Failed to ${item.starred ? 'unstar' : 'star'} ${item.name}`);
                    }
                }
                break;
            case 'share':
                if (fileSource === 'google') {
                    setShareFileId(item.id);
                    setShareFilePath('');
                } else if (fileSource === 'dropbox') {
                    setShareFileId('');
                    setShareFilePath(item.path || item.id);
                }
                setShowShareModal(true);
                break;
            case 'info':
                setCurrentActionItem(item);
                await fetchFileInfo(item.id, item.path);
                setShowFileInfoModal(true);
                break;
            case 'delete':
                try {
                    const deleteParams: any = { provider: fileSource };

                    if (fileSource === 'google') {
                        deleteParams.fileId = item.id;
                    } else if (fileSource === 'dropbox') {
                        deleteParams.filePath = item.path || item.id;
                    }

                    await deleteDriveFile(deleteParams);
                    message.success(`${item.name} deleted successfully`);
                    await logUserActivity('delete', item.name, item.id, item.path);
                    fetchFiles();
                } catch (error: any) {
                    console.error('Delete error:', error);
                    message.error(`Failed to delete ${item.name}`);
                }
                break;
        }
    };

    const handleCreateFolder = async (values: any) => {
        try {
            const provider = values.provider || 'google';
            const createParams: any = {
                name: values.folderName,
                provider
            };

            if (provider === 'google') {
                createParams.parentId = currentFolder === 'root' ? undefined : currentFolder;
            } else if (provider === 'dropbox') {
                createParams.parentPath = currentFolderPath;
            }

            await createDriveFolder(createParams);

            setShowCreateFolder(false);
            form.resetFields();
            message.success(`Folder "${values.folderName}" created successfully in ${getProviderDisplayName(provider)}`);
            await logUserActivity('create_folder', values.folderName, undefined, currentFolderPath, `Created in ${getProviderDisplayName(provider)} - ${breadcrumbs[breadcrumbs.length - 1].name}`);
            fetchFiles();
        } catch (error: any) {
            console.error('Create folder error:', error);
            message.error('Failed to create folder');
        }
    };

    const handleShareFile = async (values: any) => {
        try {
            const sharedItem = [...files, ...folders].find(item => item.id === shareFileId || item.path === shareFilePath);
            const fileSource = sharedItem ? (sharedItem.provider || getFileSource(sharedItem)) : 'google';

            const shareParams: any = {
                email: values.email,
                provider: fileSource
            };

            if (fileSource === 'google') {
                shareParams.fileId = shareFileId;
                shareParams.role = values.role || 'reader';
            } else if (fileSource === 'dropbox') {
                shareParams.filePath = shareFilePath;
                shareParams.accessLevel = values.accessLevel || 'viewer';
            }

            await shareDriveFile(shareParams);

            setShowShareModal(false);
            setShareFileId('');
            setShareFilePath('');
            shareForm.resetFields();
            message.success('File shared successfully');

            if (sharedItem) {
                await logUserActivity('share', sharedItem.name, shareFileId || undefined, shareFilePath, `Shared with ${values.email}`);
            }
        } catch (error: any) {
            console.error('Share error:', error);
            message.error('Failed to share file');
        }
    };

    const handleRename = async (values: any) => {
        if (!currentActionItem) return;

        try {
            const fileSource = currentActionItem.provider || getFileSource(currentActionItem);
            const renameParams: any = {
                newName: values.newName,
                provider: fileSource
            };

            if (fileSource === 'google') {
                renameParams.fileId = currentActionItem.id;
            } else if (fileSource === 'dropbox') {
                renameParams.filePath = currentActionItem.path || currentActionItem.id;
            }

            await renameDriveFile(renameParams);

            setShowRenameModal(false);
            setCurrentActionItem(null);
            renameForm.resetFields();
            message.success(`Renamed to "${values.newName}" successfully`);
            await logUserActivity('rename', values.newName, currentActionItem.id, currentActionItem.path, `From "${currentActionItem.name}"`);
            fetchFiles();
        } catch (error: any) {
            console.error('Rename error:', error);
            message.error('Failed to rename');
        }
    };

    const handleCopy = async (values: any) => {
        if (!currentActionItem) return;

        try {
            const fileSource = currentActionItem.provider || getFileSource(currentActionItem);
            const copyParams: any = {
                name: values.newName,
                provider: fileSource
            };

            if (fileSource === 'google') {
                copyParams.fileId = currentActionItem.id;
                copyParams.parentId = values.targetFolder === 'root' ? undefined : values.targetFolder;
            } else if (fileSource === 'dropbox') {
                copyParams.filePath = currentActionItem.path || currentActionItem.id;
                copyParams.targetPath = values.targetFolder === 'root' ? '' : values.targetFolder;
            }

            const response = await copyDriveFile(copyParams);
            
            if (response?.status === 1 || response?.data) {
                setShowCopyModal(false);
                setCurrentActionItem(null);
                copyForm.resetFields();
                message.success(`${currentActionItem.name} copied successfully`);
                await logUserActivity('copy', currentActionItem.name, currentActionItem.id, currentActionItem.path);
                fetchFiles();
            } else {
                message.error('Failed to copy file');
            }
        } catch (error: any) {
            console.error('Copy error:', error);
            message.error('Failed to copy');
        }
    };

    const handleMove = async (values: any) => {
        if (!currentActionItem) return;

        try {
            const fileSource = currentActionItem.provider || getFileSource(currentActionItem);
            const moveParams: any = { provider: fileSource };

            if (fileSource === 'google') {
                moveParams.fileId = currentActionItem.id;
                moveParams.targetFolderId = values.targetFolder === 'root' ? 'root' : values.targetFolder;
            } else if (fileSource === 'dropbox') {
                moveParams.filePath = currentActionItem.path || currentActionItem.id;
                moveParams.targetFolderPath = values.targetFolder === 'root' ? '' : values.targetFolder;
            }

            const response = await moveDriveFile(moveParams);
            
            if (response?.status === 1 || response?.data) {
                setShowMoveModal(false);
                setCurrentActionItem(null);
                moveForm.resetFields();
                message.success(`${currentActionItem.name} moved successfully`);
                await logUserActivity('move', currentActionItem.name, currentActionItem.id, currentActionItem.path);
                fetchFiles();
            } else {
                message.error('Failed to move file');
            }
        } catch (error: any) {
            console.error('Move error:', error);
            message.error('Failed to move');
        }
    };

    // Fixed Bulk Operations
    const handleBulkDownload = async () => {
        try {
            // Separate items by provider
            const googleItems = selectedItems.filter(id => {
                const item = [...files, ...folders].find(f => f.id === id);
                return item && (item.provider === 'google' || getFileSource(item) === 'google');
            });

            const dropboxItems = selectedItems.filter(id => {
                const item = [...files, ...folders].find(f => f.id === id);
                return item && (item.provider === 'dropbox' || getFileSource(item) === 'dropbox');
            }).map(id => {
                const item = [...files, ...folders].find(f => f.id === id);
                return item?.path || id;
            });

            let response;
            const providers: CloudProvider[] = [];
            
            if (googleItems.length > 0) {
                providers.push('google');
                response = await bulkDownloadFiles({
                    fileIds: googleItems,
                    providers: ['google']
                });
            } else if (dropboxItems.length > 0) {
                providers.push('dropbox');
                response = await bulkDownloadFiles({
                    filePaths: dropboxItems,
                    providers: ['dropbox']
                });
            } else {
                throw new Error('No supported items selected');
            }

            if (response?.data) {
                const blob = new Blob([response.data]);
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'bulk-download.zip';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                message.success(`${selectedItems.length} files downloaded successfully`);
                await logUserActivity('bulk_download', `${selectedItems.length} files`, undefined, undefined);
                setSelectedItems([]);
            }
        } catch (error: any) {
            console.error('Bulk download error:', error);
            message.error('Failed to download files');
        }
    };

    const handleBulkDelete = async () => {
        try {
            // Separate items by provider
            const googleItems = selectedItems.filter(id => {
                const item = [...files, ...folders].find(f => f.id === id);
                return item && (item.provider === 'google' || getFileSource(item) === 'google');
            });

            const dropboxItems = selectedItems.filter(id => {
                const item = [...files, ...folders].find(f => f.id === id);
                return item && (item.provider === 'dropbox' || getFileSource(item) === 'dropbox');
            }).map(id => {
                const item = [...files, ...folders].find(f => f.id === id);
                return item?.path || id;
            });

            const providers: CloudProvider[] = [];
            if (googleItems.length > 0) providers.push('google');
            if (dropboxItems.length > 0) providers.push('dropbox');

            const response = await bulkDeleteFiles({
                fileIds: googleItems.length > 0 ? googleItems : undefined,
                filePaths: dropboxItems.length > 0 ? dropboxItems : undefined,
                providers
            });

            if (response?.data) {
                message.success(`${selectedItems.length} items deleted successfully`);
                await logUserActivity('bulk_delete', `${selectedItems.length} items`, undefined, undefined);
                setSelectedItems([]);
                fetchFiles();
            }
        } catch (error: any) {
            console.error('Bulk delete error:', error);
            message.error('Failed to delete items');
        }
    };

    const handleBulkMove = () => {
        setShowBulkMoveModal(true);
        bulkMoveForm.setFieldsValue({ targetFolder: 'root' });
    };

    const handleBulkCopy = () => {
        setShowBulkCopyModal(true);
        bulkCopyForm.setFieldsValue({ targetFolder: 'root' });
    };

    const handleBulkShare = () => {
        setShowBulkShareModal(true);
        bulkShareForm.setFieldsValue({ role: 'reader' });
    };

    const handleBulkMoveSubmit = async (values: any) => {
        try {
            // Separate items by provider
            const googleItems = selectedItems.filter(id => {
                const item = [...files, ...folders].find(f => f.id === id);
                return item && (item.provider === 'google' || getFileSource(item) === 'google');
            });

            const dropboxItems = selectedItems.filter(id => {
                const item = [...files, ...folders].find(f => f.id === id);
                return item && (item.provider === 'dropbox' || getFileSource(item) === 'dropbox');
            }).map(id => {
                const item = [...files, ...folders].find(f => f.id === id);
                return item?.path || id;
            });

            const providers: CloudProvider[] = [];
            if (googleItems.length > 0) providers.push('google');
            if (dropboxItems.length > 0) providers.push('dropbox');

            const response = await bulkMoveFiles({
                fileIds: googleItems.length > 0 ? googleItems : undefined,
                filePaths: dropboxItems.length > 0 ? dropboxItems : undefined,
                targetFolderId: values.targetFolder === 'root' ? 'root' : values.targetFolder,
                targetFolderPath: values.targetFolder === 'root' ? '' : values.targetFolder,
                providers
            });

            if (response?.data) {
                setShowBulkMoveModal(false);
                bulkMoveForm.resetFields();
                message.success(`${selectedItems.length} items moved successfully`);
                await logUserActivity('bulk_move', `${selectedItems.length} items`, undefined, undefined);
                setSelectedItems([]);
                fetchFiles();
            }
        } catch (error: any) {
            console.error('Bulk move error:', error);
            message.error('Failed to move items');
        }
    };

    const handleBulkCopySubmit = async (values: any) => {
        try {
            // Separate items by provider
            const googleItems = selectedItems.filter(id => {
                const item = [...files, ...folders].find(f => f.id === id);
                return item && (item.provider === 'google' || getFileSource(item) === 'google');
            });

            const dropboxItems = selectedItems.filter(id => {
                const item = [...files, ...folders].find(f => f.id === id);
                return item && (item.provider === 'dropbox' || getFileSource(item) === 'dropbox');
            }).map(id => {
                const item = [...files, ...folders].find(f => f.id === id);
                return item?.path || id;
            });

            const providers: CloudProvider[] = [];
            if (googleItems.length > 0) providers.push('google');
            if (dropboxItems.length > 0) providers.push('dropbox');

            const response = await bulkCopyFiles({
                fileIds: googleItems.length > 0 ? googleItems : undefined,
                filePaths: dropboxItems.length > 0 ? dropboxItems : undefined,
                targetFolderId: values.targetFolder === 'root' ? 'root' : values.targetFolder,
                targetFolderPath: values.targetFolder === 'root' ? '' : values.targetFolder,
                providers
            });

            if (response?.data) {
                setShowBulkCopyModal(false);
                bulkCopyForm.resetFields();
                message.success(`${selectedItems.length} items copied successfully`);
                await logUserActivity('bulk_copy', `${selectedItems.length} items`, undefined, undefined);
                setSelectedItems([]);
                fetchFiles();
            }
        } catch (error: any) {
            console.error('Bulk copy error:', error);
            message.error('Failed to copy items');
        }
    };

    const handleBulkShareSubmit = async (values: any) => {
        try {
            // Separate items by provider
            const googleItems = selectedItems.filter(id => {
                const item = [...files, ...folders].find(f => f.id === id);
                return item && (item.provider === 'google' || getFileSource(item) === 'google');
            });

            const dropboxItems = selectedItems.filter(id => {
                const item = [...files, ...folders].find(f => f.id === id);
                return item && (item.provider === 'dropbox' || getFileSource(item) === 'dropbox');
            }).map(id => {
                const item = [...files, ...folders].find(f => f.id === id);
                return item?.path || id;
            });

            const providers: CloudProvider[] = [];
            if (googleItems.length > 0) providers.push('google');
            if (dropboxItems.length > 0) providers.push('dropbox');

            const response = await bulkShareFiles({
                fileIds: googleItems.length > 0 ? googleItems : undefined,
                filePaths: dropboxItems.length > 0 ? dropboxItems : undefined,
                email: values.email,
                role: values.role || 'reader',
                accessLevel: values.accessLevel || 'viewer',
                providers
            });

            if (response?.data) {
                setShowBulkShareModal(false);
                bulkShareForm.resetFields();
                message.success(`${selectedItems.length} items shared successfully with ${values.email}`);
                await logUserActivity('bulk_share', `${selectedItems.length} items`, undefined, undefined, `Shared with ${values.email}`);
                setSelectedItems([]);
            }
        } catch (error: any) {
            console.error('Bulk share error:', error);
            message.error('Failed to share items');
        }
    };

    const navigateToFolder = (folderId: string, folderName: string, folderPath?: string) => {
        setCurrentFolder(folderId);
        setCurrentFolderPath(folderPath || '');
        setCurrentPage(1);
        setSelectedItems([]);
        if (folderId === 'root') {
            setBreadcrumbs([{ id: 'root', name: 'My Drive', path: '' }]);
        } else {
            setBreadcrumbs(prev => [...prev, { id: folderId, name: folderName, path: folderPath }]);
        }
    };

    const navigateToBreadcrumb = (index: number) => {
        const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
        setBreadcrumbs(newBreadcrumbs);
        const targetCrumb = newBreadcrumbs[newBreadcrumbs.length - 1];
        setCurrentFolder(targetCrumb.id);
        setCurrentFolderPath(targetCrumb.path || '');
        setCurrentPage(1);
        setSelectedItems([]);
    };

    const navigateHome = () => {
        setCurrentFolder('root');
        setCurrentFolderPath('');
        setCurrentPage(1);
        setSelectedItems([]);
        setBreadcrumbs([{ id: 'root', name: 'My Drive', path: '' }]);
        // Clear search when navigating home
        setSearchQuery('');
    };

    const handleItemSelect = (itemId: string, selected: boolean) => {
        if (selected) {
            setSelectedItems(prev => [...prev, itemId]);
        } else {
            setSelectedItems(prev => prev.filter(id => id !== itemId));
        }
    };

    const handleToggleSelectAll = () => {
        const allItems = [...files.map(f => f.id), ...folders.map(f => f.id)];
        if (selectedItems.length === allItems.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(allItems);
        }
    };

    const isAllSelected = selectedItems.length > 0 && selectedItems.length === (files.length + folders.length);

    // Filter files and folders by search query and selected account, then apply sorting
    const filteredFiles = sortItems(
        files.filter(file => {
            const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesAccount = !selectedAccount || file.source_email === selectedAccount;
            return matchesSearch && matchesAccount;
        }),
        sortBy,
        sortOrder
    );

    const filteredFolders = sortItems(
        folders.filter(folder => {
            const matchesSearch = folder.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesAccount = !selectedAccount || folder.source_email === selectedAccount;
            return matchesSearch && matchesAccount;
        }),
        sortBy,
        sortOrder
    );

    const handleSortByChange = (value: string) => {
        if (value === "name" || value === "size" || value === "modifiedTime") {
            setSortBy(value as "name" | "size" | "modifiedTime");
        }
    };

    const items: MenuProps['items'] = [
        // {
        //     key: 'upload',
        //     icon: <UploadOutlined />,
        //     label: 'Upload files',
        // },
        {
            key: 'folder',
            icon: <FolderAddOutlined />,
            label: 'Create folder',
        },
    ];

    const onClick: MenuProps['onClick'] = ({ key }) => {
        if (key === 'upload') handleToggleUpload();
        if (key === 'folder') handleAddFolder();
    };

    const handleToggleUploads = () => setShowUploadArea(prev => !prev);

    return (
        <Layout style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', marginTop: 50, marginLeft: 60, fontFamily: FONT_FAMILY }}>
            <Content style={{ fontFamily: FONT_FAMILY }}>
                {/* STICKY Enhanced Header */}
                <div style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    backgroundColor: '#fff',
                    borderBottom: `2px solid ${PRIMARY_COLOR}15`,
                    fontFamily: FONT_FAMILY
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 24px',
                        fontFamily: FONT_FAMILY
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                background: `linear-gradient(135deg, ${PRIMARY_COLOR}, #40a9ff)`,
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: '16px',
                                boxShadow: `0 4px 12px ${PRIMARY_COLOR}30`
                            }}>
                                <FolderOpenOutlined style={{
                                    fontSize: '18px',
                                    color: '#fff'
                                }} />
                            </div>
                            <div>
                                <Title level={3} style={{ margin: 0, color: '#202124', fontSize: '24px', fontWeight: 500, fontFamily: FONT_FAMILY }}>
                                    Files
                                </Title>
                                <Text style={{ fontSize: '14px', color: '#5f6368', fontFamily: FONT_FAMILY }}>
                                    Manage files across Google Drive and Dropbox
                                </Text>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {/* Search moved here beside New button */}
                            <Search
                                placeholder="Search files and folders..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '300px',
                                    borderRadius: '24px',
                                    fontFamily: FONT_FAMILY
                                }}
                                size="middle"
                                allowClear
                                prefix={<SearchOutlined style={{ color: '#5f6368' }} />}
                            />
                            <Dropdown
                                menu={{ items, onClick }}
                                trigger={['click']}
                                placement="bottomRight"
                            >
                                <Tooltip title="Quick actions">
                                    <Button
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        style={{
                                            backgroundColor: PRIMARY_COLOR,
                                            borderColor: PRIMARY_COLOR,
                                            borderRadius: '8px',
                                            height: '40px',
                                            boxShadow: `0 4px 12px ${PRIMARY_COLOR}30`,
                                            fontFamily: FONT_FAMILY
                                        }}
                                    >
                                        New
                                    </Button>
                                </Tooltip>
                            </Dropdown>
                        </div>
                    </div>
                </div>

                {/* STICKY Enhanced Search and Filters */}
                <div style={{
                    position: 'sticky',
                    top: '98px', // Adjusted to account for main header
                    zIndex: 99,
                    backgroundColor: '#fff',
                    borderBottom: '1px solid #e8eaed',
                    fontFamily: FONT_FAMILY
                }}>
                    <HeaderBar
                        sortBy={sortBy}
                        onSortByChange={handleSortByChange}
                        sortOrder={sortOrder}
                        onSortOrderChange={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        viewMode={viewMode}
                        onViewModeChange={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                        onRefresh={fetchFiles}
                        loading={loading}
                        breadcrumbs={breadcrumbs}
                        onNavigate={navigateToBreadcrumb}
                        selectedAccount={selectedAccount}
                        onAccountChange={setSelectedAccount}
                        availableAccounts={availableAccounts}
                        selectedItems={selectedItems}
                        onToggleSelectAll={handleToggleSelectAll}
                        isAllSelected={isAllSelected}
                        storageInfo={storageInfo}
                        onShowAnalytics={() => {
                            fetchStorageAnalytics();
                            setShowAnalytics(true);
                        }}
                        onShowActivity={() => {
                            fetchActivityLog();
                            setShowActivity(true);
                        }}
                        onShowDuplicates={() => {
                            fetchDuplicates();
                            setShowDuplicates(true);
                        }}
                        selectedProviders={selectedProviders}
                        onProvidersChange={setSelectedProviders}
                        onNavigateHome={navigateHome}
                        extraIcon={
                            <Button
                                type="text"
                                size="middle"
                                icon={showUploadArea ? <UpOutlined /> : <DownOutlined />}
                                onClick={handleToggleUploads}
                                style={{
                                    color: PRIMARY_COLOR,
                                    fontSize: '14px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    fontFamily: FONT_FAMILY
                                }}
                            />
                        }
                    />
                </div>

                {/* Enhanced Upload Area */}
                {showUploadArea && (
                    <div style={{ padding: '24px' }}>
                        <UploadArea
                            onUpload={handleFileUpload}
                            uploadProgress={uploadProgress}
                            isUploading={isUploading}
                            availableAccounts={availableAccounts}
                            folderTreeData={folderTreeData}
                        />
                    </div>
                )}

                {/* Bulk Actions Toolbar */}
                <BulkActionsToolbar
                    selectedItems={selectedItems}
                    onClearSelection={() => setSelectedItems([])}
                    onBulkDownload={handleBulkDownload}
                    onBulkDelete={handleBulkDelete}
                    onBulkMove={handleBulkMove}
                    onBulkCopy={handleBulkCopy}
                    onBulkShare={handleBulkShare}
                />

                {/* Content */}
                {loading ? (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '400px'
                    }}>
                        <Spin size="large" />
                    </div>
                ) : (
                    <>
                        {/* Enhanced Folders Section */}
                        <FoldersSection
                            folders={filteredFolders}
                            onFolderClick={navigateToFolder}
                            onFileAction={handleFileAction}
                            viewMode={viewMode}
                            selectedItems={selectedItems}
                            onItemSelect={handleItemSelect}
                            availableAccounts={availableAccounts}
                        />

                        {/* Enhanced Files Section */}
                        <FilesSection
                            files={filteredFiles}
                            onFileAction={handleFileAction}
                            viewMode={viewMode}
                            currentPage={currentPage}
                            pageSize={pageSize}
                            onPageChange={(page, size) => {
                                setCurrentPage(page);
                                if (size) setPageSize(size);
                            }}
                            selectedItems={selectedItems}
                            onItemSelect={handleItemSelect}
                            availableAccounts={availableAccounts}
                        />

                        {/* Enhanced Empty State */}
                        {filteredFiles.length === 0 && filteredFolders.length === 0 && (
                            <div style={{
                                textAlign: 'center',
                                padding: '80px 20px',
                                color: '#5f6368',
                                fontFamily: FONT_FAMILY
                            }}>
                                <Empty
                                    image={
                                        <div style={{
                                            width: '120px',
                                            height: '120px',
                                            margin: '0 auto 24px',
                                            backgroundColor: '#f8f9fa',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <CloudOutlined style={{ fontSize: '48px', color: '#e8eaed' }} />
                                        </div>
                                    }
                                    description={
                                        <div>
                                            <Text style={{ fontSize: '18px', color: '#5f6368', display: 'block', marginBottom: '8px', fontFamily: FONT_FAMILY }}>
                                                {searchQuery || selectedAccount ? 'No files found' : 'Your cloud drives are empty'}
                                            </Text>
                                            <Text style={{ fontSize: '14px', color: '#9aa0a6', fontFamily: FONT_FAMILY }}>
                                                {searchQuery || selectedAccount ? 'Try different search terms or account filter' : 'Upload files to get started with your cloud storage'}
                                            </Text>
                                        </div>
                                    }
                                />
                            </div>
                        )}
                    </>
                )}

                {/* Provider Selection Modal */}
                <ProviderSelectionModal
                    visible={showProviderSelectionModal}
                    onClose={() => setShowProviderSelectionModal(false)}
                    onSelect={handleProviderSelection}
                    title={providerSelectionType === 'upload' ? 'Choose Upload Destination' : 'Choose Provider for New Folder'}
                    description={providerSelectionType === 'upload' ? 'Select where you want to upload your file' : 'Select where you want to create the folder'}
                    availableProviders={availableAccounts.map(acc => acc.provider)}
                />

                {/* Enhanced Create Folder Modal */}
                <Modal
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: FONT_FAMILY }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                backgroundColor: '#e8f0fe',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <FolderOutlined style={{ color: PRIMARY_COLOR, fontSize: '16px' }} />
                            </div>
                            <div>
                                <span style={{ fontSize: '18px', fontWeight: 600, color: '#202124', fontFamily: FONT_FAMILY }}>
                                    New folder
                                </span>
                                <div style={{ fontSize: '12px', color: '#5f6368', marginTop: '2px', fontFamily: FONT_FAMILY }}>
                                    Create a new folder in your selected cloud provider
                                </div>
                            </div>
                        </div>
                    }
                    open={showCreateFolder}
                    onCancel={() => {
                        setShowCreateFolder(false);
                        form.resetFields();
                    }}
                    footer={null}
                    width={420}
                    style={{ borderRadius: '12px', fontFamily: FONT_FAMILY }}
                >
                    <Form
                        form={form}
                        onFinish={handleCreateFolder}
                        layout="vertical"
                        style={{ marginTop: '20px', fontFamily: FONT_FAMILY }}
                    >
                        <Form.Item
                            name="folderName"
                            label={<span style={{ fontFamily: FONT_FAMILY, fontWeight: 500 }}>Folder name</span>}
                            rules={[{ required: true, message: 'Please enter a folder name' }]}
                        >
                            <Input
                                placeholder="Untitled folder"
                                style={{ borderRadius: '8px', fontFamily: FONT_FAMILY }}
                                autoFocus
                                size="large"
                            />
                        </Form.Item>
                        <Form.Item
                            name="provider"
                            label={<span style={{ fontFamily: FONT_FAMILY, fontWeight: 500 }}>Cloud Provider</span>}
                            initialValue="google"
                            rules={[{ required: true, message: 'Please select a provider' }]}
                        >
                            <Select size="large" style={{ borderRadius: '8px', fontFamily: FONT_FAMILY }}>
                                <Select.Option value="google">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{
                                            width: '16px',
                                            height: '16px',
                                            backgroundColor: '#4285f4',
                                            borderRadius: '3px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontSize: '9px',
                                            fontWeight: 'bold'
                                        }}>G</div>
                                        Google Drive
                                    </div>
                                </Select.Option>
                                <Select.Option value="dropbox">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{
                                            width: '16px',
                                            height: '16px',
                                            backgroundColor: '#0061ff',
                                            borderRadius: '3px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontSize: '9px',
                                            fontWeight: 'bold'
                                        }}>D</div>
                                        Dropbox
                                    </div>
                                </Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item style={{ marginBottom: 0, textAlign: 'right', marginTop: '24px' }}>
                            <Space size="middle">
                                <Button
                                    size="large"
                                    onClick={() => {
                                        setShowCreateFolder(false);
                                        form.resetFields();
                                    }}
                                    style={{ borderRadius: '8px', fontFamily: FONT_FAMILY }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="primary"
                                    size="large"
                                    htmlType="submit"
                                    style={{
                                        backgroundColor: PRIMARY_COLOR,
                                        borderColor: PRIMARY_COLOR,
                                        borderRadius: '8px',
                                        fontFamily: FONT_FAMILY
                                    }}
                                >
                                    Create Folder
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Modal>

                {/* Share Modal */}
                <Modal
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: FONT_FAMILY }}>
                            <ShareAltOutlined style={{ color: PRIMARY_COLOR }} />
                            <span style={{ fontSize: '14px', fontWeight: 500, fontFamily: FONT_FAMILY }}>Share</span>
                        </div>
                    }
                    open={showShareModal}
                    onCancel={() => {
                        setShowShareModal(false);
                        setShareFileId('');
                        setShareFilePath('');
                        shareForm.resetFields();
                    }}
                    footer={null}
                    width={450}
                    style={{ borderRadius: '6px', fontFamily: FONT_FAMILY }}
                >
                    <Form
                        form={shareForm}
                        onFinish={handleShareFile}
                        layout="vertical"
                        style={{ marginTop: '16px', fontFamily: FONT_FAMILY }}
                    >
                        <Form.Item
                            name="email"
                            label={<span style={{ fontFamily: FONT_FAMILY }}>Add people</span>}
                            rules={[
                                { required: true, message: 'Please enter an email address' },
                                { type: 'email', message: 'Please enter a valid email address' }
                            ]}
                        >
                            <Input
                                placeholder="Enter email address"
                                style={{ borderRadius: '4px', fontFamily: FONT_FAMILY }}
                            />
                        </Form.Item>
                        <Form.Item
                            name="role"
                            label={<span style={{ fontFamily: FONT_FAMILY }}>Permission</span>}
                            initialValue="reader"
                        >
                            <Select style={{ borderRadius: '4px', fontFamily: FONT_FAMILY }}>
                                <Select.Option value="reader">Viewer</Select.Option>
                                <Select.Option value="commenter">Commenter</Select.Option>
                                <Select.Option value="writer">Editor</Select.Option>
                            </Select>
                        </Form.Item>
                        <Form.Item style={{ marginBottom: 0, textAlign: 'right', marginTop: '16px' }}>
                            <Space>
                                <Button
                                    onClick={() => {
                                        setShowShareModal(false);
                                        setShareFileId('');
                                        setShareFilePath('');
                                        shareForm.resetFields();
                                    }}
                                    style={{ borderRadius: '4px', fontFamily: FONT_FAMILY }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    style={{
                                        backgroundColor: PRIMARY_COLOR,
                                        borderColor: PRIMARY_COLOR,
                                        borderRadius: '4px',
                                        fontFamily: FONT_FAMILY
                                    }}
                                >
                                    Send
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Modal>

                {/* Rename Modal */}
                <Modal
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: FONT_FAMILY }}>
                            <EditOutlined style={{ color: PRIMARY_COLOR }} />
                            <span style={{ fontSize: '14px', fontWeight: 500, fontFamily: FONT_FAMILY }}>Rename</span>
                        </div>
                    }
                    open={showRenameModal}
                    onCancel={() => {
                        setShowRenameModal(false);
                        setCurrentActionItem(null);
                        renameForm.resetFields();
                    }}
                    footer={null}
                    width={350}
                    style={{ fontFamily: FONT_FAMILY }}
                >
                    <Form
                        form={renameForm}
                        onFinish={handleRename}
                        layout="vertical"
                        style={{ marginTop: '16px', fontFamily: FONT_FAMILY }}
                    >
                        <Form.Item
                            name="newName"
                            label={<span style={{ fontFamily: FONT_FAMILY }}>New name</span>}
                            rules={[{ required: true, message: 'Please enter a new name' }]}
                        >
                            <Input autoFocus style={{ fontFamily: FONT_FAMILY }} />
                        </Form.Item>
                        <Form.Item style={{ marginBottom: 0, textAlign: 'right', marginTop: '16px' }}>
                            <Space>
                                <Button
                                    onClick={() => {
                                        setShowRenameModal(false);
                                        setCurrentActionItem(null);
                                        renameForm.resetFields();
                                    }}
                                    style={{ fontFamily: FONT_FAMILY }}
                                >
                                    Cancel
                                </Button>
                                <Button type="primary" htmlType="submit" style={{ fontFamily: FONT_FAMILY }}>
                                    Rename
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Modal>

                {/* Move Modal */}
                <Modal
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: FONT_FAMILY }}>
                            <div style={{
                                width: '28px',
                                height: '28px',
                                backgroundColor: '#e8f0fe',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <FolderOpenOutlined style={{ color: PRIMARY_COLOR, fontSize: '14px' }} />
                            </div>
                            <div>
                                <span style={{ fontSize: '16px', fontWeight: 600, color: '#202124', fontFamily: FONT_FAMILY }}>
                                    Move to
                                </span>
                                {currentActionItem && (
                                    <div style={{ fontSize: '11px', color: '#5f6368', marginTop: '1px', fontFamily: FONT_FAMILY }}>
                                        {currentActionItem.name}
                                    </div>
                                )}
                            </div>
                        </div>
                    }
                    open={showMoveModal}
                    onCancel={() => {
                        setShowMoveModal(false);
                        setCurrentActionItem(null);
                        moveForm.resetFields();
                    }}
                    footer={null}
                    width={450}
                    style={{ borderRadius: '8px', fontFamily: FONT_FAMILY }}
                >
                    <Form
                        form={moveForm}
                        onFinish={handleMove}
                        layout="vertical"
                        style={{ fontFamily: FONT_FAMILY, marginTop: '16px' }}
                    >
                        <Form.Item
                            name="targetFolder"
                            label={
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: FONT_FAMILY }}>
                                    <FolderOutlined style={{ color: PRIMARY_COLOR }} />
                                    <span style={{ fontSize: '12px', fontWeight: 500, fontFamily: FONT_FAMILY }}>Select destination folder</span>
                                </div>
                            }
                            rules={[{ required: true, message: 'Please select a destination folder' }]}
                        >
                            <TreeSelect
                                style={{ borderRadius: '6px', fontFamily: FONT_FAMILY }}
                                dropdownStyle={{
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                                    border: '1px solid #e8eaed'
                                }}
                                placeholder="Choose folder"
                                allowClear
                                treeDefaultExpandAll
                                treeData={folderTreeData}
                                size="middle"
                                showSearch
                                treeNodeFilterProp="title"
                            />
                        </Form.Item>
                        <div style={{
                            backgroundColor: '#f8f9fa',
                            padding: '12px',
                            borderRadius: '6px',
                            marginBottom: '16px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                <InfoCircleOutlined style={{ color: '#4285f4', fontSize: '14px' }} />
                                <span style={{ fontSize: '12px', fontWeight: 500, color: '#202124', fontFamily: FONT_FAMILY }}>
                                    Moving files
                                </span>
                            </div>
                            <Text style={{ fontSize: '11px', color: '#5f6368', lineHeight: 1.5, fontFamily: FONT_FAMILY }}>
                                The file will be moved to the selected location. This action cannot be undone automatically.
                            </Text>
                        </div>
                        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                            <Space size="middle">
                                <Button
                                    size="middle"
                                    onClick={() => {
                                        setShowMoveModal(false);
                                        setCurrentActionItem(null);
                                        moveForm.resetFields();
                                    }}
                                    style={{
                                        borderRadius: '6px',
                                        borderColor: '#dadce0',
                                        color: '#5f6368',
                                        fontFamily: FONT_FAMILY
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="primary"
                                    size="middle"
                                    htmlType="submit"
                                    style={{
                                        backgroundColor: PRIMARY_COLOR,
                                        borderColor: PRIMARY_COLOR,
                                        borderRadius: '6px',
                                        fontWeight: 500,
                                        minWidth: '70px',
                                        fontFamily: FONT_FAMILY
                                    }}
                                >
                                    Move
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Modal>

                {/* Copy Modal */}
                <Modal
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: FONT_FAMILY }}>
                            <div style={{
                                width: '28px',
                                height: '28px',
                                backgroundColor: '#e8f0fe',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <CopyOutlined style={{ color: PRIMARY_COLOR, fontSize: '14px' }} />
                            </div>
                            <div>
                                <span style={{ fontSize: '16px', fontWeight: 600, color: '#202124', fontFamily: FONT_FAMILY }}>
                                    Make a copy
                                </span>
                                {currentActionItem && (
                                    <div style={{ fontSize: '11px', color: '#5f6368', marginTop: '1px', fontFamily: FONT_FAMILY }}>
                                        {currentActionItem.name}
                                    </div>
                                )}
                            </div>
                        </div>
                    }
                    open={showCopyModal}
                    onCancel={() => {
                        setShowCopyModal(false);
                        setCurrentActionItem(null);
                        copyForm.resetFields();
                    }}
                    footer={null}
                    width={470}
                    style={{ borderRadius: '8px', fontFamily: FONT_FAMILY }}
                >
                    <Form
                        form={copyForm}
                        onFinish={handleCopy}
                        layout="vertical"
                        style={{ fontFamily: FONT_FAMILY, marginTop: '16px' }}
                    >
                        <Form.Item
                            name="newName"
                            label={
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: FONT_FAMILY }}>
                                    <EditOutlined style={{ color: PRIMARY_COLOR }} />
                                    <span style={{ fontSize: '12px', fontWeight: 500, fontFamily: FONT_FAMILY }}>Name</span>
                                </div>
                            }
                            rules={[{ required: true, message: 'Please enter a name for the copy' }]}
                        >
                            <Input
                                size="middle"
                                style={{ borderRadius: '6px', fontFamily: FONT_FAMILY }}
                                placeholder="Enter name for the copy"
                            />
                        </Form.Item>
                        <Form.Item
                            name="targetFolder"
                            label={
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: FONT_FAMILY }}>
                                    <FolderOutlined style={{ color: PRIMARY_COLOR }} />
                                    <span style={{ fontSize: '12px', fontWeight: 500, fontFamily: FONT_FAMILY }}>Destination folder</span>
                                </div>
                            }
                            rules={[{ required: true, message: 'Please select a destination folder' }]}
                        >
                            <TreeSelect
                                style={{ borderRadius: '6px', fontFamily: FONT_FAMILY }}
                                size="middle"
                                dropdownStyle={{
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                                    border: '1px solid #e8eaed'
                                }}
                                placeholder="Choose destination folder"
                                allowClear
                                treeDefaultExpandAll
                                treeData={folderTreeData}
                                showSearch
                                treeNodeFilterProp="title"
                            />
                        </Form.Item>
                        <div style={{
                            backgroundColor: '#f8f9fa',
                            padding: '12px',
                            borderRadius: '6px',
                            marginBottom: '16px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                <InfoCircleOutlined style={{ color: '#4285f4', fontSize: '14px' }} />
                                <span style={{ fontSize: '12px', fontWeight: 500, color: '#202124', fontFamily: FONT_FAMILY }}>
                                    Creating copy
                                </span>
                            </div>
                            <Text style={{ fontSize: '11px', color: '#5f6368', lineHeight: 1.5, fontFamily: FONT_FAMILY }}>
                                A copy of the file will be created in the selected location with the specified name.
                            </Text>
                        </div>
                        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                            <Space size="middle">
                                <Button
                                    size="middle"
                                    onClick={() => {
                                        setShowCopyModal(false);
                                        setCurrentActionItem(null);
                                        copyForm.resetFields();
                                    }}
                                    style={{
                                        borderRadius: '6px',
                                        borderColor: '#dadce0',
                                        color: '#5f6368',
                                        fontFamily: FONT_FAMILY
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="primary"
                                    size="middle"
                                    htmlType="submit"
                                    style={{
                                        backgroundColor: PRIMARY_COLOR,
                                        borderColor: PRIMARY_COLOR,
                                        borderRadius: '6px',
                                        fontWeight: 500,
                                        minWidth: '70px',
                                        fontFamily: FONT_FAMILY
                                    }}
                                >
                                    Create copy
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Modal>

                {/* Bulk Share Modal */}
                <Modal
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: FONT_FAMILY }}>
                            <div style={{
                                width: '28px',
                                height: '28px',
                                backgroundColor: '#e8f0fe',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <ShareAltOutlined style={{ color: PRIMARY_COLOR, fontSize: '14px' }} />
                            </div>
                            <div>
                                <span style={{ fontSize: '16px', fontWeight: 600, color: '#202124', fontFamily: FONT_FAMILY }}>
                                    Share files
                                </span>
                                <div style={{ fontSize: '11px', color: '#5f6368', marginTop: '1px', fontFamily: FONT_FAMILY }}>
                                    {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
                                </div>
                            </div>
                        </div>
                    }
                    open={showBulkShareModal}
                    onCancel={() => {
                        setShowBulkShareModal(false);
                        bulkShareForm.resetFields();
                    }}
                    footer={null}
                    width={470}
                    style={{ borderRadius: '8px', fontFamily: FONT_FAMILY }}
                >
                    <Form
                        form={bulkShareForm}
                        onFinish={handleBulkShareSubmit}
                        layout="vertical"
                        style={{ fontFamily: FONT_FAMILY, marginTop: '16px' }}
                    >
                        <Form.Item
                            name="email"
                            label={
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: FONT_FAMILY }}>
                                    <UserOutlined style={{ color: PRIMARY_COLOR }} />
                                    <span style={{ fontSize: '12px', fontWeight: 500, fontFamily: FONT_FAMILY }}>Add people</span>
                                </div>
                            }
                            rules={[
                                { required: true, message: 'Please enter an email address' },
                                { type: 'email', message: 'Please enter a valid email address' }
                            ]}
                        >
                            <Input
                                size="middle"
                                placeholder="Enter email address"
                                style={{ borderRadius: '6px', fontFamily: FONT_FAMILY }}
                                prefix={<UserOutlined style={{ color: '#5f6368' }} />}
                            />
                        </Form.Item>
                        <Form.Item
                            name="role"
                            label={
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: FONT_FAMILY }}>
                                    <TeamOutlined style={{ color: PRIMARY_COLOR }} />
                                    <span style={{ fontSize: '12px', fontWeight: 500, fontFamily: FONT_FAMILY }}>Permission level</span>
                                </div>
                            }
                            initialValue="reader"
                        >
                            <Select size="middle" style={{ borderRadius: '6px', fontFamily: FONT_FAMILY }}>
                                <Select.Option value="reader">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: FONT_FAMILY }}>
                                        <EyeOutlined style={{ color: '#5f6368' }} />
                                        <div style={{ fontFamily: FONT_FAMILY }}>Viewer</div>
                                        <div style={{ fontSize: '9px', color: '#5f6368', fontFamily: FONT_FAMILY }}>*Can view and comment</div>
                                    </div>
                                </Select.Option>
                                <Select.Option value="commenter">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: FONT_FAMILY }}>
                                        <EditOutlined style={{ color: '#5f6368' }} />
                                        <div style={{ fontFamily: FONT_FAMILY }}>Commenter</div>
                                        <div style={{ fontSize: '9px', color: '#5f6368', fontFamily: FONT_FAMILY }}>*Can view and comment</div>
                                    </div>
                                </Select.Option>
                                <Select.Option value="writer">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: FONT_FAMILY }}>
                                        <EditOutlined style={{ color: '#5f6368' }} />
                                        <div style={{ fontFamily: FONT_FAMILY }}>Editor</div>
                                        <div style={{ fontSize: '9px', color: '#5f6368', fontFamily: FONT_FAMILY }}>*Can view, comment and edit</div>
                                    </div>
                                </Select.Option>
                            </Select>
                        </Form.Item>
                        <div style={{
                            backgroundColor: '#f8f9fa',
                            padding: '12px',
                            borderRadius: '6px',
                            marginBottom: '16px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                <InfoCircleOutlined style={{ color: '#4285f4', fontSize: '14px' }} />
                                <span style={{ fontSize: '12px', fontWeight: 500, color: '#202124', fontFamily: FONT_FAMILY }}>
                                    Bulk sharing
                                </span>
                            </div>
                            <Text style={{ fontSize: '11px', color: '#5f6368', lineHeight: 1.5, fontFamily: FONT_FAMILY }}>
                                All selected files will be shared with the specified email address with the chosen permission level.
                            </Text>
                        </div>
                        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                            <Space size="middle">
                                <Button
                                    size="middle"
                                    onClick={() => {
                                        setShowBulkShareModal(false);
                                        bulkShareForm.resetFields();
                                    }}
                                    style={{
                                        borderRadius: '6px',
                                        borderColor: '#dadce0',
                                        color: '#5f6368',
                                        fontFamily: FONT_FAMILY
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="primary"
                                    size="middle"
                                    htmlType="submit"
                                    style={{
                                        backgroundColor: PRIMARY_COLOR,
                                        borderColor: PRIMARY_COLOR,
                                        borderRadius: '6px',
                                        fontWeight: 500,
                                        minWidth: '70px',
                                        fontFamily: FONT_FAMILY
                                    }}
                                >
                                    Share files
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Modal>

                {/* Bulk Move Modal */}
                <Modal
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: FONT_FAMILY }}>
                            <div style={{
                                width: '28px',
                                height: '28px',
                                backgroundColor: '#e8f0fe',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <FolderOpenOutlined style={{ color: PRIMARY_COLOR, fontSize: '14px' }} />
                            </div>
                            <div>
                                <span style={{ fontSize: '16px', fontWeight: 600, color: '#202124', fontFamily: FONT_FAMILY }}>
                                    Move files
                                </span>
                                <div style={{ fontSize: '11px', color: '#5f6368', marginTop: '1px', fontFamily: FONT_FAMILY }}>
                                    {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
                                </div>
                            </div>
                        </div>
                    }
                    open={showBulkMoveModal}
                    onCancel={() => {
                        setShowBulkMoveModal(false);
                        bulkMoveForm.resetFields();
                    }}
                    footer={null}
                    width={470}
                    style={{ borderRadius: '8px', fontFamily: FONT_FAMILY }}
                >
                    <Form
                        form={bulkMoveForm}
                        onFinish={handleBulkMoveSubmit}
                        layout="vertical"
                        style={{ fontFamily: FONT_FAMILY, marginTop: '16px' }}
                    >
                        <Form.Item
                            name="targetFolder"
                            label={
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: FONT_FAMILY }}>
                                    <FolderOutlined style={{ color: PRIMARY_COLOR }} />
                                    <span style={{ fontSize: '12px', fontWeight: 500, fontFamily: FONT_FAMILY }}>Select destination folder</span>
                                </div>
                            }
                            rules={[{ required: true, message: 'Please select a destination folder' }]}
                        >
                            <TreeSelect
                                style={{ borderRadius: '6px', fontFamily: FONT_FAMILY }}
                                size="middle"
                                dropdownStyle={{
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                                    border: '1px solid #e8eaed'
                                }}
                                placeholder="Choose destination folder"
                                allowClear
                                treeDefaultExpandAll
                                treeData={folderTreeData}
                                showSearch
                                treeNodeFilterProp="title"
                            />
                        </Form.Item>
                        <div style={{
                            backgroundColor: '#fff3cd',
                            border: '1px solid #ffeaa7',
                            padding: '12px',
                            borderRadius: '6px',
                            marginBottom: '16px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                <InfoCircleOutlined style={{ color: '#e67e22', fontSize: '14px' }} />
                                <span style={{ fontSize: '12px', fontWeight: 500, color: '#d68910', fontFamily: FONT_FAMILY }}>
                                    Bulk move operation
                                </span>
                            </div>
                            <Text style={{ fontSize: '11px', color: '#b7950b', lineHeight: 1.5, fontFamily: FONT_FAMILY }}>
                                All selected items will be moved to the chosen location. This action cannot be undone automatically.
                            </Text>
                        </div>
                        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                            <Space size="middle">
                                <Button
                                    size="middle"
                                    onClick={() => {
                                        setShowBulkMoveModal(false);
                                        bulkMoveForm.resetFields();
                                    }}
                                    style={{
                                        borderRadius: '6px',
                                        borderColor: '#dadce0',
                                        color: '#5f6368',
                                        fontFamily: FONT_FAMILY
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="primary"
                                    size="middle"
                                    htmlType="submit"
                                    style={{
                                        backgroundColor: PRIMARY_COLOR,
                                        borderColor: PRIMARY_COLOR,
                                        borderRadius: '6px',
                                        fontWeight: 500,
                                        minWidth: '70px',
                                        fontFamily: FONT_FAMILY
                                    }}
                                >
                                    Move files
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Modal>

                {/* Bulk Copy Modal */}
                <Modal
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: FONT_FAMILY }}>
                            <div style={{
                                width: '28px',
                                height: '28px',
                                backgroundColor: '#e8f0fe',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <CopyOutlined style={{ color: PRIMARY_COLOR, fontSize: '14px' }} />
                            </div>
                            <div>
                                <span style={{ fontSize: '16px', fontWeight: 600, color: '#202124', fontFamily: FONT_FAMILY }}>
                                    Copy files
                                </span>
                                <div style={{ fontSize: '11px', color: '#5f6368', marginTop: '1px', fontFamily: FONT_FAMILY }}>
                                    {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
                                </div>
                            </div>
                        </div>
                    }
                    open={showBulkCopyModal}
                    onCancel={() => {
                        setShowBulkCopyModal(false);
                        bulkCopyForm.resetFields();
                    }}
                    footer={null}
                    width={470}
                    style={{ borderRadius: '8px', fontFamily: FONT_FAMILY }}
                >
                    <Form
                        form={bulkCopyForm}
                        onFinish={handleBulkCopySubmit}
                        layout="vertical"
                        style={{ fontFamily: FONT_FAMILY, marginTop: '16px' }}
                    >
                        <Form.Item
                            name="targetFolder"
                            label={
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: FONT_FAMILY }}>
                                    <FolderOutlined style={{ color: PRIMARY_COLOR }} />
                                    <span style={{ fontSize: '12px', fontWeight: 500, fontFamily: FONT_FAMILY }}>Select destination folder</span>
                                </div>
                            }
                            rules={[{ required: true, message: 'Please select a destination folder' }]}
                        >
                            <TreeSelect
                                style={{ borderRadius: '6px', fontFamily: FONT_FAMILY }}
                                size="middle"
                                dropdownStyle={{
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                                    border: '1px solid #e8eaed'
                                }}
                                placeholder="Choose destination folder"
                                allowClear
                                treeDefaultExpandAll
                                treeData={folderTreeData}
                                showSearch
                                treeNodeFilterProp="title"
                            />
                        </Form.Item>
                        <div style={{
                            backgroundColor: '#f8f9fa',
                            padding: '12px',
                            borderRadius: '6px',
                            marginBottom: '16px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                <InfoCircleOutlined style={{ color: '#4285f4', fontSize: '14px' }} />
                                <span style={{ fontSize: '12px', fontWeight: 500, color: '#202124', fontFamily: FONT_FAMILY }}>
                                    Bulk copy operation
                                </span>
                            </div>
                            <Text style={{ fontSize: '11px', color: '#5f6368', lineHeight: 1.5, fontFamily: FONT_FAMILY }}>
                                Copies of all selected items will be created in the chosen destination folder.
                            </Text>
                        </div>
                        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
                            <Space size="middle">
                                <Button
                                    size="middle"
                                    onClick={() => {
                                        setShowBulkCopyModal(false);
                                        bulkCopyForm.resetFields();
                                    }}
                                    style={{
                                        borderRadius: '6px',
                                        borderColor: '#dadce0',
                                        color: '#5f6368',
                                        fontFamily: FONT_FAMILY
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="primary"
                                    size="middle"
                                    htmlType="submit"
                                    style={{
                                        backgroundColor: PRIMARY_COLOR,
                                        borderColor: PRIMARY_COLOR,
                                        borderRadius: '6px',
                                        fontWeight: 500,
                                        minWidth: '70px',
                                        fontFamily: FONT_FAMILY
                                    }}
                                >
                                    Copy files
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Modal>

                {/* File Info Modal */}
                <Modal
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: FONT_FAMILY }}>
                            <div style={{
                                width: '28px',
                                height: '28px',
                                backgroundColor: '#e8f0fe',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <InfoCircleOutlined style={{ color: PRIMARY_COLOR, fontSize: '14px' }} />
                            </div>
                            <div>
                                <span style={{ fontSize: '16px', fontWeight: 600, color: '#202124', fontFamily: FONT_FAMILY }}>
                                    File Details
                                </span>
                                {currentActionItem && (
                                    <div style={{ fontSize: '11px', color: '#5f6368', marginTop: '1px', fontFamily: FONT_FAMILY }}>
                                        {currentActionItem.name}
                                    </div>
                                )}
                            </div>
                        </div>
                    }
                    open={showFileInfoModal}
                    onCancel={() => {
                        setShowFileInfoModal(false);
                        setCurrentActionItem(null);
                        setFileInfo(null);
                    }}
                    footer={null}
                    width={550}
                    style={{ borderRadius: '8px', fontFamily: FONT_FAMILY }}
                    styles={{
                        header: { borderBottom: '1px solid #f0f0f0', paddingBottom: '12px' },
                        body: { paddingTop: '16px' }
                    }}
                >
                    {fileInfo && currentActionItem && (
                        <div style={{ fontFamily: FONT_FAMILY }}>
                            {/* File Preview */}
                            {fileInfo.thumbnailLink && (
                                <div style={{
                                    textAlign: 'center',
                                    marginBottom: '16px',
                                    padding: '16px',
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '6px'
                                }}>
                                    <img
                                        src={fileInfo.thumbnailLink}
                                        alt={currentActionItem.name}
                                        style={{
                                            maxWidth: '180px',
                                            maxHeight: '180px',
                                            borderRadius: '6px',
                                            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                                        }}
                                    />
                                </div>
                            )}

                            {/* File Information */}
                            <Descriptions
                                column={1}
                                bordered
                                size="small"
                                style={{
                                    backgroundColor: '#fff',
                                    borderRadius: '6px',
                                    fontFamily: FONT_FAMILY
                                }}
                                labelStyle={{
                                    backgroundColor: '#f8f9fa',
                                    fontWeight: 500,
                                    color: '#202124',
                                    width: '130px',
                                    fontFamily: FONT_FAMILY
                                }}
                            >
                                <Descriptions.Item
                                    label={
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: FONT_FAMILY }}>
                                            <FileOutlined style={{ color: PRIMARY_COLOR }} />
                                            Name
                                        </div>
                                    }
                                >
                                    <Text copyable style={{ fontWeight: 500, fontFamily: FONT_FAMILY }}>
                                        {currentActionItem.name}
                                    </Text>
                                </Descriptions.Item>

                                {'mimeType' in currentActionItem && (
                                    <Descriptions.Item
                                        label={
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: FONT_FAMILY }}>
                                                <TagsOutlined style={{ color: PRIMARY_COLOR }} />
                                                Type
                                            </div>
                                        }
                                    >
                                        <Tag color="blue" style={{ fontFamily: FONT_FAMILY }}>{currentActionItem.mimeType}</Tag>
                                    </Descriptions.Item>
                                )}

                                {'size' in currentActionItem && currentActionItem.size && (
                                    <Descriptions.Item
                                        label={
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: FONT_FAMILY }}>
                                                <HddOutlined style={{ color: PRIMARY_COLOR }} />
                                                Size
                                            </div>
                                        }
                                    >
                                        <Text style={{ fontFamily: FONT_FAMILY }}>{formatFileSize(currentActionItem.size)}</Text>
                                    </Descriptions.Item>
                                )}

                                <Descriptions.Item
                                    label={
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: FONT_FAMILY }}>
                                            <CalendarOutlined style={{ color: PRIMARY_COLOR }} />
                                            Modified
                                        </div>
                                    }
                                >
                                    <Text style={{ fontFamily: FONT_FAMILY }}>{new Date(currentActionItem.modifiedTime).toLocaleString()}</Text>
                                </Descriptions.Item>

                                {'createdTime' in currentActionItem && currentActionItem.createdTime && (
                                    <Descriptions.Item
                                        label={
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: FONT_FAMILY }}>
                                                <CalendarOutlined style={{ color: PRIMARY_COLOR }} />
                                                Created
                                            </div>
                                        }
                                    >
                                        <Text style={{ fontFamily: FONT_FAMILY }}>{new Date(currentActionItem.createdTime).toLocaleString()}</Text>
                                    </Descriptions.Item>
                                )}

                                {'owners' in currentActionItem && currentActionItem.owners && currentActionItem.owners.length > 0 && (
                                    <Descriptions.Item
                                        label={
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: FONT_FAMILY }}>
                                                <UserOutlined style={{ color: PRIMARY_COLOR }} />
                                                Owner
                                            </div>
                                        }
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            {currentActionItem.owners[0]?.photoLink ? (
                                                <Avatar size={20} src={currentActionItem.owners[0].photoLink} />
                                            ) : (
                                                <Avatar size={20} style={{ backgroundColor: PRIMARY_COLOR, fontFamily: FONT_FAMILY }}>
                                                    {(currentActionItem.owners[0]?.displayName || 'U')[0]}
                                                </Avatar>
                                            )}
                                            <div>
                                                <div style={{ fontWeight: 500, fontFamily: FONT_FAMILY }}>
                                                    {currentActionItem.owners[0]?.displayName || 'Unknown'}
                                                </div>
                                                <div style={{ fontSize: '10px', color: '#5f6368', fontFamily: FONT_FAMILY }}>
                                                    {currentActionItem.owners[0]?.emailAddress}
                                                </div>
                                            </div>
                                        </div>
                                    </Descriptions.Item>
                                )}

                                <Descriptions.Item
                                    label={
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: FONT_FAMILY }}>
                                            <ShareAltOutlined style={{ color: PRIMARY_COLOR }} />
                                            Sharing
                                        </div>
                                    }
                                >
                                    <Space>
                                        <Tag color={currentActionItem.shared ? 'green' : 'default'} style={{ fontFamily: FONT_FAMILY }}>
                                            {currentActionItem.shared ? 'Shared' : 'Private'}
                                        </Tag>
                                        {'starred' in currentActionItem && currentActionItem.starred && (
                                            <Tag color="gold" icon={<StarOutlined />} style={{ fontFamily: FONT_FAMILY }}>
                                                Starred
                                            </Tag>
                                        )}
                                    </Space>
                                </Descriptions.Item>

                                {'webViewLink' in currentActionItem && currentActionItem.webViewLink && (
                                    <Descriptions.Item
                                        label={
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: FONT_FAMILY }}>
                                                <LinkOutlined style={{ color: PRIMARY_COLOR }} />
                                                Link
                                            </div>
                                        }
                                    >
                                        <Button
                                            type="link"
                                            icon={<LinkOutlined />}
                                            onClick={() => window.open(currentActionItem.webViewLink, '_blank')}
                                            style={{ padding: 0, fontFamily: FONT_FAMILY }}
                                        >
                                            Open in Cloud Drive
                                        </Button>
                                    </Descriptions.Item>
                                )}

                                {fileInfo.description && (
                                    <Descriptions.Item
                                        label={
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: FONT_FAMILY }}>
                                                <FileTextOutlined style={{ color: PRIMARY_COLOR }} />
                                                Description
                                            </div>
                                        }
                                    >
                                        <Text style={{ fontFamily: FONT_FAMILY }}>{fileInfo.description}</Text>
                                    </Descriptions.Item>
                                )}
                            </Descriptions>

                            {/* Quick Actions */}
                            <div style={{ marginTop: '16px', textAlign: 'center' }}>
                                <Space size="middle">
                                    {'webViewLink' in currentActionItem && currentActionItem.webViewLink && (
                                        <Button
                                            type="primary"
                                            icon={<EyeOutlined />}
                                            onClick={() => window.open(currentActionItem.webViewLink, '_blank')}
                                            style={{
                                                backgroundColor: PRIMARY_COLOR,
                                                borderColor: PRIMARY_COLOR,
                                                borderRadius: '4px',
                                                fontFamily: FONT_FAMILY
                                            }}
                                        >
                                            Open
                                        </Button>
                                    )}
                                    <Button
                                        icon={<ShareAltOutlined />}
                                        onClick={() => {
                                            setShowFileInfoModal(false);
                                            setShareFileId(currentActionItem.id);
                                            setShowShareModal(true);
                                        }}
                                        style={{ borderRadius: '4px', fontFamily: FONT_FAMILY }}
                                    >
                                        Share
                                    </Button>
                                    {'mimeType' in currentActionItem && (
                                        <Button
                                            icon={<DownloadOutlined />}
                                            onClick={() => handleFileAction('download', currentActionItem)}
                                            style={{ borderRadius: '4px', fontFamily: FONT_FAMILY }}
                                        >
                                            Download
                                        </Button>
                                    )}
                                </Space>
                            </div>
                        </div>
                    )}
                </Modal>

                {/* Analytics Drawer */}
                <Drawer
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: FONT_FAMILY }}>
                            <BarChartOutlined style={{ color: PRIMARY_COLOR }} />
                            <span style={{ fontFamily: FONT_FAMILY }}>Storage Analytics</span>
                        </div>
                    }
                    placement="right"
                    onClose={() => setShowAnalytics(false)}
                    open={showAnalytics}
                    width={350}
                    style={{ fontFamily: FONT_FAMILY }}
                >
                    {storageAnalytics && (
                        <div style={{ fontFamily: FONT_FAMILY }}>
                            <Card size="small" style={{ marginBottom: '12px', fontFamily: FONT_FAMILY }}>
                                <Statistic
                                    title="Total Files"
                                    value={storageAnalytics.totalFiles || 0}
                                    prefix={<FileOutlined />}
                                    style={{ fontFamily: FONT_FAMILY }}
                                />
                            </Card>
                            <Card size="small" style={{ marginBottom: '12px', fontFamily: FONT_FAMILY }}>
                                <Statistic
                                    title="Total Folders"
                                    value={storageAnalytics.totalFolders || 0}
                                    prefix={<FolderOutlined />}
                                    style={{ fontFamily: FONT_FAMILY }}
                                />
                            </Card>
                            {storageAnalytics.byType && (
                                <Card size="small" title="Files by Type" style={{ fontFamily: FONT_FAMILY }}>
                                    {Object.entries(storageAnalytics.byType).map(([type, count]: [string, any]) => (
                                        <div key={type} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                            <Text style={{ fontFamily: FONT_FAMILY }}>{type}</Text>
                                            <Text strong style={{ fontFamily: FONT_FAMILY }}>{count}</Text>
                                        </div>
                                    ))}
                                </Card>
                            )}
                        </div>
                    )}
                </Drawer>

                {/* Activity Drawer */}
                <Drawer
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: FONT_FAMILY }}>
                            <HistoryOutlined style={{ color: PRIMARY_COLOR }} />
                            <span style={{ fontFamily: FONT_FAMILY }}>Activity Log</span>
                        </div>
                    }
                    placement="right"
                    onClose={() => setShowActivity(false)}
                    open={showActivity}
                    width={450}
                    style={{ fontFamily: FONT_FAMILY }}
                >
                    <Timeline style={{ fontFamily: FONT_FAMILY }}>
                        {activityLogs.map((log) => (
                            <Timeline.Item
                                key={log.id}
                                dot={
                                    log.action === 'upload' ? <UploadOutlined style={{ color: '#52c41a' }} /> :
                                        log.action === 'download' ? <DownloadOutlined style={{ color: '#1890ff' }} /> :
                                            log.action === 'delete' ? <DeleteOutlined style={{ color: '#ff4d4f' }} /> :
                                                <ClockCircleOutlined style={{ color: '#faad14' }} />
                                }
                            >
                                <div style={{ fontFamily: FONT_FAMILY }}>
                                    <Text strong style={{ fontFamily: FONT_FAMILY }}>{log.action.replace('_', ' ').toUpperCase()}</Text>
                                    <br />
                                    <Text style={{ fontFamily: FONT_FAMILY }}>{log.fileName}</Text>
                                    <br />
                                    <Text type="secondary" style={{ fontSize: '10px', fontFamily: FONT_FAMILY }}>
                                        {new Date(log.timestamp).toLocaleString()}
                                    </Text>
                                    {log.details && (
                                        <>
                                            <br />
                                            <Text type="secondary" style={{ fontSize: '10px', fontFamily: FONT_FAMILY }}>
                                                {log.details}
                                            </Text>
                                        </>
                                    )}
                                </div>
                            </Timeline.Item>
                        ))}
                    </Timeline>
                </Drawer>

                {/* Duplicates Drawer */}
                <Drawer
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: FONT_FAMILY }}>
                            <BugOutlined style={{ color: PRIMARY_COLOR }} />
                            <span style={{ fontFamily: FONT_FAMILY }}>Duplicate Files</span>
                        </div>
                    }
                    placement="right"
                    onClose={() => setShowDuplicates(false)}
                    open={showDuplicates}
                    width={550}
                    style={{ fontFamily: FONT_FAMILY }}
                >
                    {duplicateFiles.length === 0 ? (
                        <Empty description="No duplicate files found" style={{ fontFamily: FONT_FAMILY }} />
                    ) : (
                        <div style={{ fontFamily: FONT_FAMILY }}>
                            <Alert
                                message="Duplicate Files Found"
                                description={`Found ${duplicateFiles.length} sets of duplicate files. Review and clean up to free storage space.`}
                                type="info"
                                style={{ marginBottom: '12px', fontFamily: FONT_FAMILY }}
                            />
                            <Collapse style={{ fontFamily: FONT_FAMILY }}>
                                {duplicateFiles.map((duplicate, index) => (
                                    <Panel
                                        header={
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: FONT_FAMILY }}>
                                                <Text strong style={{ fontFamily: FONT_FAMILY }}>{duplicate.name}</Text>
                                                <div>
                                                    <Badge count={duplicate.files.length} style={{ backgroundColor: '#faad14' }} />
                                                    <Text style={{ marginLeft: '6px', fontSize: '10px', color: '#5f6368', fontFamily: FONT_FAMILY }}>
                                                        {(duplicate.totalSize / (1024 * 1024)).toFixed(2)} MB
                                                    </Text>
                                                </div>
                                            </div>
                                        }
                                        key={index}
                                    >
                                        <List
                                            dataSource={duplicate.files}
                                            renderItem={(file) => (
                                                <List.Item
                                                    actions={[
                                                        <Button
                                                            key="delete"
                                                            type="text"
                                                            danger
                                                            size="small"
                                                            icon={<DeleteOutlined />}
                                                            onClick={() => handleFileAction('delete', file)}
                                                            style={{ fontFamily: FONT_FAMILY }}
                                                        >
                                                            Delete
                                                        </Button>
                                                    ]}
                                                >
                                                    <List.Item.Meta
                                                        avatar={
                                                            <div style={{ fontSize: '14px', color: getFileIconColor(file.mimeType) }}>
                                                                {getFileIcon(file.mimeType)}
                                                            </div>
                                                        }
                                                        title={<span style={{ fontFamily: FONT_FAMILY }}>{file.name}</span>}
                                                        description={
                                                            <div style={{ fontFamily: FONT_FAMILY }}>
                                                                <Text type="secondary" style={{ fontFamily: FONT_FAMILY }}>
                                                                    Modified {new Date(file.modifiedTime).toLocaleDateString()}
                                                                </Text>
                                                                <br />
                                                                <Text type="secondary" style={{ fontFamily: FONT_FAMILY }}>
                                                                    {formatFileSize(file.size)}
                                                                </Text>
                                                            </div>
                                                        }
                                                    />
                                                </List.Item>
                                            )}
                                        />
                                    </Panel>
                                ))}
                            </Collapse>
                        </div>
                    )}
                </Drawer>
            </Content>

            <style jsx>{`
                .folder-menu-btn {
                    opacity: 0 !important;
                    transition: opacity 0.2s ease !important;
                }
                
                .folder-menu-btn:hover,
                *:hover > .folder-menu-btn {
                    opacity: 1 !important;
                }
                
                .file-menu-btn {
                    opacity: 0 !important;
                    transition: opacity 0.2s ease !important;
                }
                
                *:hover .file-menu-btn {
                    opacity: 1 !important;
                }
                
                .ant-upload-drag:hover {
                    border-color: #4285f4 !important;
                }
                
                .ant-table-tbody > tr:hover > td {
                    background: #f8f9fa !important;
                }
                
                .ant-pagination-item-active {
                    border-color: ${PRIMARY_COLOR} !important;
                }
                
                .ant-pagination-item-active a {
                    color: ${PRIMARY_COLOR} !important;
                }
                
                .ant-select-focused .ant-select-selector {
                    border-color: ${PRIMARY_COLOR} !important;
                    box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2) !important;
                }
                
                .ant-input:focus {
                    border-color: ${PRIMARY_COLOR} !important;
                    box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2) !important;
                }

                .ant-select-dropdown {
                    border-radius: 8px !important;
                    padding: 2px 0 !important;
                }

                .ant-select-item {
                    border-radius: 6px !important;  
                    margin: 1px 6px !important;
                }

                .ant-select-item-option-selected {
                    background-color: #e8f0fe !important;
                    color: ${PRIMARY_COLOR} !important;
                }

                .ant-select-item:hover {
                    background-color: #f8f9fa !important;
                }

                * {
                    font-family: ${FONT_FAMILY} !important;
                }
            `}</style>
        </Layout>
    );
};

export default FilesManager;