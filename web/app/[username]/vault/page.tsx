


// 'use client';

// import React, { useState, useEffect } from 'react';
// import {
//     Button, Input, Spin, Card, Tabs, Form, Space, Badge, Typography, Progress, Tooltip, Dropdown, Menu
// } from 'antd';
// import {
//     CheckCircleOutlined, UserOutlined, EyeOutlined, EyeInvisibleOutlined,
//     StarFilled, SearchOutlined, AppstoreOutlined, BarsOutlined, CloseOutlined, EllipsisOutlined,
//     ExclamationCircleOutlined
// } from '@ant-design/icons';
// import {
//     Shield, Wifi, WifiOff, ShieldCheck, ShieldX, LogOut, Database, AlertTriangle, User, Copy,
//     EyeOff, Eye, RefreshCw, Search, Unlock, Globe, ExternalLink
// } from 'lucide-react';
// import { PasswordItem as PasswordItemType, apiClient } from '../../../services/api';
// import { socketManager } from '../../../services/socket';

// const { Title, Text } = Typography;

// interface MessageProps { message: string; type: 'success' | 'error'; onClose: () => void; }

// const Message: React.FC<MessageProps> = ({ message, type, onClose }) => {
//     useEffect(() => {
//         const timer = setTimeout(onClose, 3000);
//         return () => clearTimeout(timer);
//     }, [onClose]);

//     return (
//         <div style={{
//             position: 'fixed', top: '12px', right: '12px', zIndex: 1000, padding: '8px 12px', borderRadius: '6px',
//             boxShadow: '0 4px 12px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '8px',
//             background: type === 'success' ? '#f6ffed' : '#fff2f0', color: type === 'success' ? '#52c41a' : '#ff4d4f',
//             border: `1px solid ${type === 'success' ? '#b7eb8f' : '#ffccc7'}`, maxWidth: '280px', fontSize: '13px'
//         }}>
//             <CheckCircleOutlined style={{ fontSize: '14px' }} />
//             <span style={{ fontWeight: 500 }}>{message}</span>
//             <Button type="text" size="small" onClick={onClose} icon={<CloseOutlined style={{ fontSize: '12px' }} />} />
//         </div>
//     );
// };

// interface StatusBarProps { isConnected: boolean; isLoggedIn: boolean; vaultStatus: 'locked' | 'unlocked' | 'unknown'; onLogout: () => Promise<void>; }

// const StatusBar: React.FC<StatusBarProps> = ({ isConnected, isLoggedIn, vaultStatus, onLogout }) => {
//     return (
//         <div style={{
//             background: '#1890ff', padding: '8px 16px', position: 'sticky', top: 0, zIndex: 50,
//             boxShadow: '0 2px 8px rgba(0,0,0,0.15)', borderBottom: '1px solid #096dd9', marginTop: '70px'
//         }}>
//             <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
//                     <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
//                         <Shield size={18} color="#fff" /> Dockly Vault
//                     </h1>
//                     <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
//                         <Badge
//                             color={isConnected ? '#52c41a' : '#ff4d4f'}
//                             text={<span style={{ fontSize: '12px', color: '#fff' }}>{isConnected ? 'Online' : 'Offline'}</span>}
//                         />
//                         {isLoggedIn && (
//                             <Badge
//                                 color={vaultStatus === 'unlocked' ? '#52c41a' : '#faad14'}
//                                 text={<span style={{ fontSize: '12px', color: '#fff' }}>{vaultStatus === 'unlocked' ? 'Unlocked' : 'Locked'}</span>}
//                             />
//                         )}
//                     </div>
//                 </div>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
//                     <Text style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>Real-time sync</Text>
//                     {isLoggedIn && (
//                         <Button size="small" onClick={onLogout} icon={<LogOut size={14} />}
//                             style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', height: '28px' }}>
//                             Logout
//                         </Button>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// interface PasswordStatsProps { stats: { total: number; strong: number; weak: number }; }

// const PasswordStats: React.FC<PasswordStatsProps> = ({ stats }) => {
//     return (
//         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '16px' }}>
//             <Card size="small" style={{ background: '#1890ff', border: 'none', borderRadius: '8px' }}>
//                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//                     <div>
//                         <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>Total Items</Text>
//                         <div style={{ color: '#fff', fontSize: '24px', fontWeight: 600 }}>{stats.total}</div>
//                     </div>
//                     <Database size={24} color="#fff" />
//                 </div>
//             </Card>
//             <Card size="small" style={{
//                 background: stats.weak > 0 ? '#ff4d4f' : '#52c41a',
//                 border: 'none', borderRadius: '8px'
//             }}>
//                 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//                     <div>
//                         <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>
//                             {stats.weak > 0 ? 'Weak Passwords' : 'All Secure'}
//                         </Text>
//                         <div style={{ color: '#fff', fontSize: '24px', fontWeight: 600 }}>
//                             {stats.weak > 0 ? stats.weak : '✓'}
//                         </div>
//                     </div>
//                     {stats.weak > 0 ? <AlertTriangle size={24} color="#fff" /> : <Shield size={24} color="#fff" />}
//                 </div>
//             </Card>
//         </div>
//     );
// };

// interface PasswordItemProps { password: PasswordItemType; onMessage: (message: string, type: 'success' | 'error') => void; viewMode: 'list' | 'grid'; }

// const PasswordItem: React.FC<PasswordItemProps> = ({ password, onMessage, viewMode }) => {
//     const [showPassword, setShowPassword] = useState(false);
//     const [actualPassword, setActualPassword] = useState<string | null>(null);
//     const [loading, setLoading] = useState(false);

//     const getStrengthColor = (strength: number) => strength >= 80 ? '#52c41a' : strength >= 60 ? '#faad14' : '#ff4d4f';
//     const getStrengthLabel = (strength: number) => strength >= 80 ? 'Strong' : strength >= 60 ? 'Medium' : 'Weak';

//     const handleShowPassword = async () => {
//         if (!showPassword && !actualPassword) {
//             setLoading(true);
//             try {
//                 const result = await apiClient.getPassword(password.id);
//                 if (result.status === 1) {
//                     setActualPassword(result.payload.password || '');
//                     setShowPassword(true);
//                 } else {
//                     onMessage(result.message || 'Failed to retrieve password', 'error');
//                 }
//             } catch (error) {
//                 onMessage('Failed to connect to server', 'error');
//             } finally {
//                 setLoading(false);
//             }
//         } else {
//             setShowPassword(!showPassword);
//         }
//     };

//     const handleCopyPassword = async () => {
//         if (!actualPassword) {
//             setLoading(true);
//             try {
//                 const result = await apiClient.getPassword(password.id);
//                 if (result.status === 1) {
//                     await navigator.clipboard.writeText(result.payload.password || '');
//                     onMessage('Password copied to clipboard', 'success');
//                 } else {
//                     onMessage(result.message || 'Failed to retrieve password', 'error');
//                 }
//             } catch (error) {
//                 onMessage('Failed to connect to server', 'error');
//             } finally {
//                 setLoading(false);
//             }
//         } else {
//             await navigator.clipboard.writeText(actualPassword);
//             onMessage('Password copied to clipboard', 'success');
//         }
//     };

//     const handleCopyUsername = async () => {
//         if (password.username) {
//             await navigator.clipboard.writeText(password.username);
//             onMessage('Username copied to clipboard', 'success');
//         }
//     };

//     const handleOpenWebsite = () => {
//         if (password.uri) window.open(password.uri, '_blank');
//     };

//     const getDomainIcon = (uri: string) => {
//         if (!uri) return null;
//         try {
//             const domain = new URL(uri).hostname.toLowerCase();
//             return `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;
//         } catch {
//             return null;
//         }
//     };

//     const actionMenu = (
//         <Menu>
//             <Menu.Item key="view" onClick={handleShowPassword} disabled={loading} icon={<Eye size={14} />}>
//                 {showPassword ? 'Hide' : 'View'}
//             </Menu.Item>
//             <Menu.Item key="copy" onClick={handleCopyPassword} disabled={loading} icon={<Copy size={14} />}>
//                 Copy Password
//             </Menu.Item>
//             {password.username && (
//                 <Menu.Item key="copyUser" onClick={handleCopyUsername} icon={<User size={14} />}>
//                     Copy Username
//                 </Menu.Item>
//             )}
//             {password.uri && (
//                 <Menu.Item key="open" onClick={handleOpenWebsite} icon={<ExternalLink size={14} />}>
//                     Open Site
//                 </Menu.Item>
//             )}
//         </Menu>
//     );

//     if (viewMode === 'grid') {
//         return (
//             <Card size="small" style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
//                 <div style={{ marginBottom: '8px' }}>
//                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
//                         <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
//                             {password.uri && (
//                                 <img src="/manager/vaulthub.webp"
//                                     // src={getDomainIcon(password.uri)}
//                                     alt="" style={{ width: '16px', height: '16px', flexShrink: 0 }}
//                                     onError={(e) => (e.currentTarget.style.display = 'none')} />
//                             )}
//                             <Text strong style={{ fontSize: '13px', color: '#1f1f1f', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
//                                 {password.name}
//                             </Text>
//                         </div>
//                         {password.favorite && <StarFilled style={{ fontSize: '12px', color: '#faad14', flexShrink: 0 }} />}
//                     </div>
//                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
//                         <Badge color={getStrengthColor(password.strength)} text={<span style={{ fontSize: '11px' }}>{getStrengthLabel(password.strength)}</span>} />
//                         <Progress percent={password.strength} size="small" strokeColor={getStrengthColor(password.strength)} showInfo={false} style={{ width: '40px' }} />
//                     </div>
//                 </div>
//                 {(password.username || password.uri) && (
//                     <div style={{ marginBottom: '8px', fontSize: '11px', color: '#8c8c8c' }}>
//                         {password.username && (
//                             <div style={{ marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px', overflow: 'hidden' }}>
//                                 <User size={10} style={{ flexShrink: 0 }} />
//                                 <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{password.username}</span>
//                             </div>
//                         )}
//                         {password.uri && (
//                             <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflow: 'hidden' }}>
//                                 <Globe size={10} style={{ flexShrink: 0 }} />
//                                 <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
//                                     {password.uri.replace(/^https?:\/\//, '')}
//                                 </span>
//                             </div>
//                         )}
//                     </div>
//                 )}
//                 <Dropdown overlay={actionMenu} trigger={['click']} placement="bottomRight">
//                     <Button size="small" style={{ width: '100%' }}
//                         icon={loading ? <Spin size="small" /> : <EllipsisOutlined />}>
//                         {loading ? 'Loading...' : 'Actions'}
//                     </Button>
//                 </Dropdown>
//                 {showPassword && actualPassword && (
//                     <div style={{
//                         marginTop: '8px', fontFamily: 'monospace', background: '#f5f5f5', padding: '6px 8px', borderRadius: '4px',
//                         fontSize: '11px', color: '#1f1f1f', wordBreak: 'break-all', border: '1px solid #d9d9d9'
//                     }}>
//                         {actualPassword}
//                     </div>
//                 )}
//             </Card>
//         );
//     }

//     return (
//         <Card size="small" style={{ marginBottom: '8px', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                 <div style={{ flex: 1, minWidth: 0 }}>
//                     <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
//                         {password.uri && (
//                             <img
//                                 // src={getDomainIcon(password.uri)}
//                                 src="/manager/vaulthub.webp"
//                                 alt=""
//                                 style={{ width: '16px', height: '16px' }}
//                                 onError={(e) => (e.currentTarget.style.display = 'none')} />
//                         )}
//                         <Text strong style={{ fontSize: '14px', color: '#1f1f1f' }}>{password.name}</Text>
//                         {password.favorite && <StarFilled style={{ fontSize: '12px', color: '#faad14' }} />}
//                     </div>
//                     <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#8c8c8c' }}>
//                         {password.username && (
//                             <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
//                                 <User size={12} /> {password.username}
//                             </div>
//                         )}
//                         {password.uri && (
//                             <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
//                                 <Globe size={12} /> {password.uri.replace(/^https?:\/\//, '')}
//                             </div>
//                         )}
//                     </div>
//                 </div>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
//                     <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//                         <Badge color={getStrengthColor(password.strength)} text={<span style={{ fontSize: '11px' }}>{getStrengthLabel(password.strength)}</span>} />
//                         <Progress percent={password.strength} size="small" strokeColor={getStrengthColor(password.strength)} showInfo={false} style={{ width: '60px' }} />
//                     </div>
//                     <Space size="small">
//                         <Tooltip title="View Password">
//                             <Button size="small" onClick={handleShowPassword} disabled={loading}
//                                 icon={loading ? <Spin size="small" /> : (showPassword ? <EyeOff size={14} /> : <Eye size={14} />)} />
//                         </Tooltip>
//                         <Tooltip title="Copy Password">
//                             <Button size="small" onClick={handleCopyPassword} disabled={loading}
//                                 icon={loading ? <Spin size="small" /> : <Copy size={14} />} />
//                         </Tooltip>
//                         {password.uri && (
//                             <Tooltip title="Open Website">
//                                 <Button size="small" onClick={handleOpenWebsite} icon={<ExternalLink size={14} />} />
//                             </Tooltip>
//                         )}
//                     </Space>
//                 </div>
//             </div>
//             {showPassword && actualPassword && (
//                 <div style={{
//                     marginTop: '8px', fontFamily: 'monospace', background: '#f5f5f5', padding: '8px', borderRadius: '4px',
//                     fontSize: '12px', color: '#1f1f1f', wordBreak: 'break-all', border: '1px solid #d9d9d9'
//                 }}>
//                     {actualPassword}
//                 </div>
//             )}
//         </Card>
//     );
// };

// interface PasswordDashboardProps { onMessage: (message: string, type: 'success' | 'error') => void; }

// const PasswordDashboard: React.FC<PasswordDashboardProps> = ({ onMessage }) => {
//     const [passwords, setPasswords] = useState<PasswordItemType[]>([]);
//     const [filteredPasswords, setFilteredPasswords] = useState<PasswordItemType[]>([]);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [loading, setLoading] = useState(true);
//     const [syncing, setSyncing] = useState(false);
//     const [selectedFilter, setSelectedFilter] = useState<'all' | 'weak' | 'favorites'>('all');
//     const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

//     useEffect(() => {
//         loadPasswords();
//         socketManager.on('items_updated', (data: any) => {
//             if (data.items) {
//                 setPasswords(data.items);
//                 onMessage(`${data.count} items synchronized`, 'success');
//             }
//         });
//         socketManager.on('sync_complete', () => {
//             setSyncing(false);
//             onMessage('Sync completed successfully', 'success');
//         });
//         socketManager.on('sync_error', (data: any) => {
//             setSyncing(false);
//             onMessage(data.message || 'Sync failed', 'error');
//         });
//         return () => {
//             socketManager.off('items_updated', () => { });
//             socketManager.off('sync_complete', () => { });
//             socketManager.off('sync_error', () => { });
//         };
//     }, [onMessage]);

//     useEffect(() => {
//         filterPasswords();
//     }, [passwords, searchTerm, selectedFilter]);

//     const loadPasswords = async () => {
//         try {
//             setLoading(true);
//             const result = await apiClient.getItems();
//             if (result.status === 1 && result.payload.items) {
//                 setPasswords(result.payload.items);
//             } else {
//                 onMessage(result.message || 'Failed to load passwords', 'error');
//             }
//         } catch (error) {
//             onMessage('Failed to connect to server', 'error');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const filterPasswords = () => {
//         let filtered = passwords;
//         if (searchTerm) {
//             filtered = filtered.filter(item =>
//                 item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                 item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                 item.uri.toLowerCase().includes(searchTerm.toLowerCase())
//             );
//         }
//         switch (selectedFilter) {
//             case 'weak': filtered = filtered.filter(item => item.strength < 60); break;
//             case 'favorites': filtered = filtered.filter(item => item.favorite); break;
//         }
//         setFilteredPasswords(filtered);
//     };

//     const handleSync = async () => {
//         setSyncing(true);
//         onMessage('Starting sync...', 'success');
//         socketManager.emit('request_sync');
//         try {
//             const result = await apiClient.syncVault();
//             if (result.status === 1) await loadPasswords();
//             else {
//                 setSyncing(false);
//                 onMessage(result.message || 'Sync failed', 'error');
//             }
//         } catch (error) {
//             setSyncing(false);
//             onMessage('Failed to sync vault', 'error');
//         }
//     };

//     const getPasswordStats = () => {
//         const weak = passwords.filter(p => p.strength < 60).length;
//         const strong = passwords.filter(p => p.strength >= 80).length;
//         const total = passwords.length;
//         return { weak, strong, total };
//     };

//     const stats = getPasswordStats();

//     if (loading) {
//         return (
//             <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', flexDirection: 'column', gap: '12px' }}>
//                 <Spin size="large" />
//                 <Text style={{ color: '#8c8c8c' }}>Loading your passwords...</Text>
//             </div>
//         );
//     }

//     return (
//         <div style={{ padding: '16px 0' }}>
//             <Card size="small" style={{ marginBottom: '16px', borderRadius: '8px' }}>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
//                     <div>
//                         <Title level={3} style={{ fontSize: '20px', margin: 0, marginBottom: '4px' }}>Password Vault</Title>
//                         <Text style={{ fontSize: '13px', color: '#8c8c8c' }}>{passwords.length} items • Last synced just now</Text>
//                     </div>
//                     <Button onClick={handleSync} disabled={syncing} icon={<RefreshCw size={14} />}>
//                         {syncing ? 'Syncing...' : 'Sync'}
//                     </Button>
//                 </div>
//                 <PasswordStats stats={stats} />
//                 <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
//                     <Input
//                         prefix={<SearchOutlined />}
//                         placeholder="Search passwords..."
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                         style={{ flex: 1, minWidth: '200px' }}
//                     />
//                     <Space>
//                         <Button.Group>
//                             <Button
//                                 icon={<BarsOutlined />}
//                                 type={viewMode === 'list' ? 'primary' : 'default'}
//                                 onClick={() => setViewMode('list')}
//                             />
//                             <Button
//                                 icon={<AppstoreOutlined />}
//                                 type={viewMode === 'grid' ? 'primary' : 'default'}
//                                 onClick={() => setViewMode('grid')}
//                             />
//                         </Button.Group>
//                         <Button.Group>
//                             <Button
//                                 onClick={() => setSelectedFilter('all')}
//                                 type={selectedFilter === 'all' ? 'primary' : 'default'}
//                             >
//                                 All
//                             </Button>
//                             <Button
//                                 onClick={() => setSelectedFilter('weak')}
//                                 type={selectedFilter === 'weak' ? 'primary' : 'default'}
//                                 danger={selectedFilter === 'weak'}
//                                 icon={<AlertTriangle size={14} />}
//                             >
//                                 Weak
//                             </Button>
//                             <Button
//                                 onClick={() => setSelectedFilter('favorites')}
//                                 type={selectedFilter === 'favorites' ? 'primary' : 'default'}
//                                 icon={<StarFilled />}
//                             >
//                                 Favorites
//                             </Button>
//                         </Button.Group>
//                     </Space>
//                 </div>
//             </Card>

//             {filteredPasswords.length === 0 ? (
//                 <Card style={{ textAlign: 'center', padding: '40px', borderRadius: '8px' }}>
//                     <Database size={48} color="#d9d9d9" style={{ marginBottom: '16px' }} />
//                     <Text style={{ fontSize: '14px', color: '#8c8c8c', display: 'block', marginBottom: '12px' }}>
//                         {searchTerm || selectedFilter !== 'all' ? 'No passwords match your current filters' : 'No passwords found in your vault'}
//                     </Text>
//                     {searchTerm && <Button type="link" onClick={() => setSearchTerm('')}>Clear search</Button>}
//                 </Card>
//             ) : viewMode === 'grid' ? (
//                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px' }}>
//                     {filteredPasswords.map((password) => (
//                         <PasswordItem key={password.id} password={password} onMessage={onMessage} viewMode="grid" />
//                     ))}
//                 </div>
//             ) : (
//                 <div>
//                     {filteredPasswords.map((password) => (
//                         <PasswordItem key={password.id} password={password} onMessage={onMessage} viewMode="list" />
//                     ))}
//                 </div>
//             )}
//         </div>
//     );
// };

// interface LoginFormProps {
//     onLogin: (email: string, password: string, code: string) => Promise<{ success: boolean; status: number; message?: string }>;
//     onUnlock: (password: string) => Promise<{ success: boolean; status: number; message?: string }>;
//     isLoggedIn: boolean;
//     vaultStatus: 'locked' | 'unlocked' | 'unknown';
//     onMessage: (message: string, type: 'success' | 'error') => void;
// }

// const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onUnlock, isLoggedIn, vaultStatus, onMessage }) => {
//     const [form] = Form.useForm();
//     const [unlockForm] = Form.useForm();
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState('');

//     const handleLogin = async (values: { email: string; password: string; code: string }) => {
//         setLoading(true);
//         setError('');
//         try {
//             const result = await onLogin(values.email, values.password, values.code);
//             if (result.status === 1) onMessage('Successfully connected to Bitwarden', 'success');
//             else setError(result.message || 'Login failed');
//         } catch (error) {
//             setError('Failed to connect to server');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleUnlock = async (values: { unlockPassword: string }) => {
//         setLoading(true);
//         setError('');
//         try {
//             const result = await onUnlock(values.unlockPassword);
//             if (result.status === 1) onMessage('Vault unlocked successfully', 'success');
//             else setError(result.message || 'Unlock failed');
//         } catch (error) {
//             setError('Failed to unlock vault');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const currentTab = isLoggedIn && vaultStatus === 'locked' ? 'unlock' : 'login';

//     return (
//         <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh', padding: '16px' }}>
//             <Card style={{ width: '100%', maxWidth: '400px', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
//                 <div style={{ textAlign: 'center', marginBottom: '24px' }}>
//                     <div style={{
//                         width: '48px', height: '48px', background: '#1890ff', borderRadius: '12px', display: 'flex', alignItems: 'center',
//                         justifyContent: 'center', margin: '0 auto 16px'
//                     }}>
//                         <Shield size={24} color="#fff" />
//                     </div>
//                     <Title level={2} style={{ fontSize: '24px', margin: 0, marginBottom: '8px' }}>
//                         Connect to Bitwarden
//                     </Title>
//                     <Text style={{ color: '#8c8c8c' }}>Access your password vault securely</Text>
//                 </div>

//                 <Tabs activeKey={currentTab} items={[
//                     {
//                         key: 'login',
//                         label: 'Login',
//                         disabled: isLoggedIn,
//                         children: (
//                             <Form form={form} onFinish={handleLogin} layout="vertical">
//                                 <Form.Item name="email" label="Email Address" rules={[{ required: true, message: 'Email is required' }]}>
//                                     <Input prefix={<UserOutlined />} placeholder="Enter your Bitwarden email" disabled={loading} />
//                                 </Form.Item>
//                                 <Form.Item name="password" label="Master Password" rules={[{ required: true, message: 'Password is required' }]}>
//                                     <Input.Password placeholder="Enter your master password" disabled={loading}
//                                         iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)} />
//                                 </Form.Item>
//                                 {/* <Form.Item name="code" label="2FA Code (Optional)">
//                                     <Input placeholder="Enter 2FA code if enabled" disabled={loading} />
//                                 </Form.Item> */}
//                                 <Form.Item>
//                                     <Button type="primary" htmlType="submit" loading={loading} icon={<Unlock size={16} />}
//                                         style={{ width: '100%', height: '40px' }}>
//                                         {loading ? 'Connecting...' : 'Connect to Vault'}
//                                     </Button>
//                                 </Form.Item>
//                             </Form>
//                         )
//                     },
//                     {
//                         key: 'unlock',
//                         label: 'Unlock',
//                         disabled: !isLoggedIn || vaultStatus === 'unlocked',
//                         children: (
//                             <Form form={unlockForm} onFinish={handleUnlock} layout="vertical">
//                                 <Form.Item name="unlockPassword" label="Master Password" rules={[{ required: true, message: 'Password is required' }]}>
//                                     <Input.Password placeholder="Enter your master password" disabled={loading}
//                                         iconRender={(visible) => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)} />
//                                 </Form.Item>
//                                 <Form.Item>
//                                     <Button type="primary" htmlType="submit" loading={loading} icon={<Unlock size={16} />}
//                                         style={{ width: '100%', height: '40px' }}>
//                                         {loading ? 'Unlocking...' : 'Unlock Vault'}
//                                     </Button>
//                                 </Form.Item>
//                             </Form>
//                         )
//                     }
//                 ]} />

//                 {error && (
//                     <div style={{
//                         marginTop: '16px', background: '#fff2f0', border: '1px solid #ffccc7', borderRadius: '6px', padding: '12px',
//                         display: 'flex', alignItems: 'center', gap: '8px'
//                     }}>
//                         <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
//                         <Text style={{ color: '#ff4d4f' }}>{error}</Text>
//                     </div>
//                 )}

//                 <div style={{ marginTop: '16px', padding: '12px', background: '#f5f5f5', borderRadius: '6px', textAlign: 'center' }}>
//                     <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>🔒 Your passwords are encrypted and secure</Text>
//                 </div>
//             </Card>
//         </div>
//     );
// };

// interface GetStartedProps { onStart: () => void; }

// const GetStarted: React.FC<GetStartedProps> = ({ onStart }) => {
//     const features = [
//         { title: 'Secure Vault Access', description: 'Enterprise-grade security for your passwords.', icon: <Shield size={20} color="#1890ff" /> },
//         { title: 'Real-time Sync', description: 'Sync passwords across all your devices.', icon: <RefreshCw size={20} color="#1890ff" /> },
//         { title: 'Password Health', description: 'Monitor and improve password security.', icon: <Search size={20} color="#1890ff" /> },
//         { title: 'Quick Access', description: 'Fast and secure credential access.', icon: <Unlock size={20} color="#1890ff" /> }
//     ];

//     return (
//         <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 16px', textAlign: 'center' }}>
//             <div style={{ marginBottom: '40px' }}>
//                 <div style={{
//                     width: '64px', height: '64px', background: '#1890ff', borderRadius: '16px', display: 'flex', alignItems: 'center',
//                     justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 4px 20px rgba(24,144,255,0.3)'
//                 }}>
//                     <Shield size={32} color="#fff" />
//                 </div>
//                 <Title level={1} style={{ fontSize: '32px', marginBottom: '16px' }}>
//                     Dockly Vault Hub
//                 </Title>
//                 <Text style={{ fontSize: '16px', color: '#8c8c8c', marginBottom: '32px', display: 'block', maxWidth: '500px', margin: '0 auto 32px' }}>
//                     Your secure gateway to Bitwarden password management. Access, manage, and sync your passwords with enterprise-grade security.
//                 </Text>
//                 <Button type="primary" size="large" onClick={onStart}
//                     style={{ height: '48px', padding: '0 32px', fontSize: '16px', borderRadius: '8px' }}>
//                     Get Started
//                 </Button>
//             </div>

//             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
//                 {features.map((feature, index) => (
//                     <Card key={index} style={{ borderRadius: '12px', textAlign: 'center', height: '100%' }}>
//                         <div style={{ marginBottom: '16px' }}>{feature.icon}</div>
//                         <Title level={4} style={{ fontSize: '16px', marginBottom: '8px' }}>{feature.title}</Title>
//                         <Text style={{ color: '#8c8c8c', fontSize: '14px' }}>{feature.description}</Text>
//                     </Card>
//                 ))}
//             </div>

//             <Card style={{ borderRadius: '12px', background: '#f5f5f5', textAlign: 'left' }}>
//                 <Title level={3} style={{ fontSize: '18px', marginBottom: '16px', textAlign: 'center' }}>How it works</Title>
//                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
//                     {['Enter Bitwarden credentials', 'Authorize Dockly access', 'Manage passwords securely'].map((step, index) => (
//                         <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
//                             <div style={{
//                                 width: '24px', height: '24px', borderRadius: '50%', background: '#1890ff', display: 'flex', alignItems: 'center',
//                                 justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: 600, flexShrink: 0
//                             }}>
//                                 {index + 1}
//                             </div>
//                             <Text style={{ fontSize: '14px' }}>{step}</Text>
//                         </div>
//                     ))}
//                 </div>
//                 <div style={{ marginTop: '20px', padding: '12px', background: '#f6ffed', borderRadius: '8px', border: '1px solid #b7eb8f', textAlign: 'center' }}>
//                     <Text style={{ fontSize: '13px', color: '#52c41a' }}>🔒 Your passwords are encrypted and never stored by Dockly</Text>
//                 </div>
//             </Card>
//         </div>
//     );
// };

// function App() {
//     const [isLoggedIn, setIsLoggedIn] = useState(false);
//     const [isConnected, setIsConnected] = useState(false);
//     const [vaultStatus, setVaultStatus] = useState<'locked' | 'unlocked' | 'unknown'>('unknown');
//     const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
//     const [showGetStarted, setShowGetStarted] = useState(true);

//     useEffect(() => {
//         socketManager.connect();
//         socketManager.on('connected', (data: any) => {
//             setIsConnected(true);
//             showMessage(data.message, 'success');
//         });
//         socketManager.on('login_success', (data: any) => {
//             showMessage(data.message, 'success');
//             setIsLoggedIn(true);
//             setShowGetStarted(false);
//         });
//         socketManager.on('vault_unlocked', (data: any) => {
//             showMessage(data.message, 'success');
//             setVaultStatus('unlocked');
//         });
//         socketManager.on('sync_complete', (data: any) => {
//             showMessage(data.message, 'success');
//         });
//         socketManager.on('sync_error', (data: any) => {
//             showMessage(data.message, 'error');
//         });
//         checkStatus();
//         return () => socketManager.disconnect();
//     }, []);

//     const showMessage = (text: string, type: 'success' | 'error') => setMessage({ text, type });
//     const hideMessage = () => setMessage(null);

//     const checkStatus = async () => {
//         try {
//             const status = await apiClient.getStatus();
//             if (status.payload.status.status === 'authenticated') {
//                 setIsLoggedIn(true);
//                 setVaultStatus('unlocked');
//                 setShowGetStarted(false);
//             } else if (status.payload.status.status === 'locked') {
//                 setIsLoggedIn(true);
//                 setVaultStatus('locked');
//                 setShowGetStarted(false);
//             } else {
//                 setIsLoggedIn(false);
//                 setVaultStatus('unknown');
//             }
//         } catch (error) {
//             console.error('Failed to check status:', error);
//         }
//     };

//     const handleLogin = async (email: string, password: string, code: string) => {
//         try {
//             const result = await apiClient.login(email, password);
//             if (result.status === 1) {
//                 setIsLoggedIn(true);
//                 setVaultStatus('unlocked');
//                 setShowGetStarted(false);
//                 return { success: true, status: 1 };
//             } else {
//                 return { success: false, status: 0, message: result.message };
//             }
//         } catch (error) {
//             return { success: false, status: 0, message: 'Failed to connect to server' };
//         }
//     };

//     const handleUnlock = async (password: string) => {
//         try {
//             const result = await apiClient.unlock(password);
//             if (result.status === 1) {
//                 setVaultStatus('unlocked');
//                 return { success: true, status: 1 };
//             } else {
//                 return { success: false, status: 0, message: result.message };
//             }
//         } catch (error) {
//             return { success: false, status: 0, message: 'Failed to unlock vault' };
//         }
//     };

//     const handleLogout = async () => {
//         try {
//             const result = await apiClient.logout();
//             if (result.status === 1) {
//                 setIsLoggedIn(false);
//                 setVaultStatus('unknown');
//                 setIsConnected(false);
//                 setShowGetStarted(true);
//                 socketManager.disconnect();
//                 showMessage('Successfully logged out', 'success');
//             } else {
//                 showMessage(result.message || 'Failed to logout', 'error');
//             }
//         } catch (error) {
//             showMessage('Failed to connect to server', 'error');
//         }
//     };

//     const handleStart = () => setShowGetStarted(false);

//     return (
//         <div style={{ minHeight: '100vh', background: '#fafafa' }}>
//             {message && <Message message={message.text} type={message.type} onClose={hideMessage} />}
//             <StatusBar isConnected={isConnected} isLoggedIn={isLoggedIn} vaultStatus={vaultStatus} onLogout={handleLogout} />
//             <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
//                 {showGetStarted ? (
//                     <GetStarted onStart={handleStart} />
//                 ) : !isLoggedIn || vaultStatus === 'locked' ? (
//                     <LoginForm onLogin={handleLogin} onUnlock={handleUnlock} isLoggedIn={isLoggedIn} vaultStatus={vaultStatus} onMessage={showMessage} />
//                 ) : (
//                     <PasswordDashboard onMessage={showMessage} />
//                 )}
//             </div>
//         </div>
//     );
// }

// export default App;



const App = () => {
    return (
        <div>
            dtcf
        </div>
    )
}

export default App