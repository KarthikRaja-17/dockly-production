'use client';
import React, { useEffect, useState } from 'react';
import {
  Input,
  Avatar,
  Tooltip,
  Button,
  Typography,
  Dropdown,
  Menu,
  Divider,
  Switch,
} from 'antd';
import {
  SearchOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  CloseOutlined,
  TeamOutlined,
  LinkOutlined,
  StarOutlined,
  SyncOutlined,
  QuestionCircleOutlined,
  MessageOutlined,
  MailOutlined,
  CrownOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import {
  capitalizeEachWord,
  DocklyLogo,
  PRIMARY_COLOR,
} from '../../../app/comman';
import { useCurrentUser } from '../../../app/userContext';
import { responsive } from '../../../utils/responsive';
import FolderConnectionModal from '../connect';
import HelpChatModal from '../bot/helpModal';
// import { CatppuccinFolderConnection } from "../icons";

const FONT_FAMILY =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
const { Text } = Typography;

export function trimGooglePhotoUrl(url: string): string {
  const index = url.indexOf('=');
  const baseUrl = index !== -1 ? url.substring(0, index) : url;
  return `${baseUrl}=s4000`;
}

// Enhanced styles with animations
const headerStyles = `
  @keyframes logo-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @keyframes avatar-glow {
    0%, 100% { box-shadow: 0 0 0 0 ${PRIMARY_COLOR}40; }
    50% { box-shadow: 0 0 0 8px ${PRIMARY_COLOR}10; }
  }
  
  @keyframes search-focus {
    0% { transform: scale(1); }
    100% { transform: scale(1.02); }
  }
  
  @keyframes button-hover {
    0% { transform: translateY(0); }
    100% { transform: translateY(-2px); }
  }
  
  @keyframes notification-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
  
  @keyframes dropdown-fade-in {
    0% { 
      opacity: 0; 
      transform: translateY(-8px) scale(0.95); 
    }
    100% { 
      opacity: 1; 
      transform: translateY(0) scale(1); 
    }
  }
  
  @keyframes menu-item-hover {
    0% { transform: translateX(0); }
    100% { transform: translateX(4px); }
  }

  @keyframes switch-glow {
    0%, 100% { box-shadow: 0 0 0 0 ${PRIMARY_COLOR}40; }
    50% { box-shadow: 0 0 0 4px ${PRIMARY_COLOR}15; }
  }

  @keyframes switch-slide {
    0% { transform: translateX(0) scale(1); }
    50% { transform: translateX(2px) scale(1.05); }
    100% { transform: translateX(0) scale(1); }
  }
  
  .logo-spin { 
    animation: logo-spin 8s linear infinite; 
    transition: all 0.3s ease;
  }
  
  .avatar-glow { 
    animation: avatar-glow 2s ease-in-out infinite; 
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .search-focus { 
    animation: search-focus 0.2s ease-in-out; 
  }
  
  .button-hover { 
    animation: button-hover 0.3s ease-in-out; 
  }
  
  .notification-pulse {
    animation: notification-pulse 0.3s ease-in-out;
  }
  
  .dropdown-fade-in {
    animation: dropdown-fade-in 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .menu-item-hover {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .menu-item-hover:hover {
    animation: menu-item-hover 0.3s ease-out;
    background: ${PRIMARY_COLOR}08 !important;
    color: ${PRIMARY_COLOR} !important;
  }
  
  .header-transition {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .action-button {
    background: ${PRIMARY_COLOR}12;
    border-radius: 50%;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 2px solid transparent;
    position: relative;
    overflow: hidden;
  }
  
  .action-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, ${PRIMARY_COLOR}20, transparent);
    transition: left 0.5s;
  }
  
  .action-button:hover::before {
    left: 100%;
  }
  
  .action-button:hover {
    background: ${PRIMARY_COLOR}20;
    border-color: ${PRIMARY_COLOR}30;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px ${PRIMARY_COLOR}25;
  }
  
  .user-info {
    transition: all 0.3s ease;
    padding: 8px 12px;
    border-radius: 12px;
    position: relative;
    overflow: hidden;
  }
  
  .user-info::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, ${PRIMARY_COLOR}08, transparent);
    transition: left 0.5s;
  }
  
  .user-info:hover::before {
    left: 100%;
  }
  
  .user-info:hover {
    background: ${PRIMARY_COLOR}08;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px ${PRIMARY_COLOR}15;
  }
  
  .search-container {
    position: relative;
    overflow: hidden;
  }
  
  .search-container::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, ${PRIMARY_COLOR}10, transparent);
    transition: left 0.6s;
    pointer-events: none;
  }
  
  .search-container:focus-within::after {
    left: 100%;
  }

  .profile-dropdown {
    background: #ffffff;
    border-radius: 16px;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08);
    border: 1px solid ${PRIMARY_COLOR}15;
    padding: 0;
    min-width: 280px;
    overflow: hidden;
    backdrop-filter: blur(16px);
  }
  
  .profile-header {
    background: linear-gradient(135deg, ${PRIMARY_COLOR}08, ${PRIMARY_COLOR}04);
    padding: 20px;
    border-bottom: 1px solid ${PRIMARY_COLOR}10;
    position: relative;
  }
  
  .profile-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, ${PRIMARY_COLOR}, ${PRIMARY_COLOR}80, ${PRIMARY_COLOR});
  }
  
  .workspace-tag {
    background: ${PRIMARY_COLOR}15;
    color: ${PRIMARY_COLOR};
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 8px;
    display: inline-block;
    border: 1px solid ${PRIMARY_COLOR}25;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }

  .workspace-tag:hover {
    background: ${PRIMARY_COLOR}25;
    border-color: ${PRIMARY_COLOR}40;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px ${PRIMARY_COLOR}20;
  }

  .workspace-tag::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, ${PRIMARY_COLOR}10, transparent);
    transition: left 0.4s;
  }

  .workspace-tag:hover::before {
    left: 100%;
  }

.admin-switch-container {
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, ${PRIMARY_COLOR}0D, ${PRIMARY_COLOR}05);
  padding: 8px 18px;
  border-radius: 28px;
  border: 1px solid ${PRIMARY_COLOR}25;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(12px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.admin-switch-container:hover {
  border-color: ${PRIMARY_COLOR}40;
  transform: translateY(-2px);
  box-shadow: 0 6px 18px ${PRIMARY_COLOR}30;
}

.admin-switch-label {
  font-size: 13px;
  font-weight: 600;
  color: ${PRIMARY_COLOR};
  letter-spacing: 0.4px;
  text-transform: uppercase;
  font-family: ${FONT_FAMILY};
  transition: color 0.3s ease;
}

.crown-icon {
  font-size: 16px;
  color: ${PRIMARY_COLOR};
  animation: crown-pulse 2s infinite;
}

.admin-switch .ant-switch {
  width: 46px !important;
  height: 22px !important;
  background: linear-gradient(135deg, #f0f0f0, #fafafa) !important;
  border: 1px solid ${PRIMARY_COLOR}25 !important;
  border-radius: 20px !important;
  position: relative;
  transition: all 0.3s ease !important;
}

.admin-switch .ant-switch-handle {
  top: 1px !important;
  left: 1px !important;
  width: 20px !important;
  height: 20px !important;
  background: #fff !important;
  border-radius: 50% !important;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15) !important;
  transition: all 0.3s ease !important;
}

.admin-switch .ant-switch-checked {
  background: linear-gradient(135deg, ${PRIMARY_COLOR}, ${PRIMARY_COLOR}AA) !important;
  border-color: ${PRIMARY_COLOR} !important;
  box-shadow: 0 0 12px ${PRIMARY_COLOR}60;
}

.admin-switch .ant-switch-checked .ant-switch-handle {
  left: calc(100% - 21px) !important;
  box-shadow: 0 3px 8px ${PRIMARY_COLOR}50 !important;
}

@keyframes crown-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.15); opacity: 0.8; }
}

  @media (max-width: 768px) {
    .action-button {
      width: 36px;
      height: 36px;
    }
    
    .user-info {
      padding: 6px 8px;
    }
    
    .profile-dropdown {
      min-width: 260px;
    }
    
    .profile-header {
      padding: 16px;
    }

    .admin-switch-container {
      padding: 6px 12px;
      gap: 8px;
    }

    .admin-switch-label {
      font-size: 11px;
    }
  }
`;

const CustomHeader: React.FC<{
  isHovered: boolean;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  setHidden: (hidden: boolean) => void;
  hidden: boolean;
  count: number;
}> = ({ isHovered, collapsed, setCollapsed, setHidden, hidden, count }) => {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const role = currentUser?.role;

  // State management
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isHelpModalVisible, setIsHelpModalVisible] = useState(false);
  const [screenSize, setScreenSize] = useState<string>('desktop');
  const [isAdminView, setIsAdminView] = useState(false);
  const [user, setUser] = useState({
    image: '',
    name: null as string | null,
    userName: null as string | null,
    email: null as string | null,
  });
  const [searchFocused, setSearchFocused] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const initials = user.userName
    ? user.userName.slice(0, 2).toUpperCase()
    : 'DU';
  const trimmedUrl = trimGooglePhotoUrl(user.image);

  useEffect(() => {
    const updateScreenSize = () => {
      if (responsive('mobile')) {
        setScreenSize('mobile');
      } else if (responsive('tablet')) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const userObj = userData ? JSON.parse(userData) : null;
    setUser({
      image: userObj?.picture || '',
      name: userObj?.name || null,
      userName: currentUser?.user_name || userObj?.username || null,
      email: userObj?.email || 'user@example.com',
    });
  }, [currentUser]);

  // Check current URL to determine if we're in admin view
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      setIsAdminView(currentPath.includes('/admin/'));
    }
  }, []);
  
  // Handle family hub navigation
  const handleFamilyHubClick = () => {
    const username = user.userName || currentUser?.user_name;
    if (username) {
      setDropdownVisible(false);
      router.push(`/${username}/family-hub`);
    }
  };

  // Handle admin/user view switch
  const handleViewSwitch = (checked: boolean) => {
    const username = user.userName || currentUser?.user_name;

    if (checked) {
      // Switch to admin view
      setIsAdminView(true);
      router.push(`/admin/${username}/users`);
    } else {
      // Switch to user view
      setIsAdminView(false);
      router.push(`/${username}/dashboard`);
    }
  };

  // Sidebar toggle logic
  const handleToggleSidebar = () => {
    if (!collapsed && !hidden) {
      setCollapsed(true);
    } else if (collapsed && !hidden) {
      setHidden(true);
    } else if (hidden) {
      setHidden(false);
      setCollapsed(false);
    }
  };

  const getToggleIcon = (collapsed: boolean, hidden: boolean) => {
    if (hidden) return <MenuUnfoldOutlined />;
    return collapsed ? <CloseOutlined /> : <MenuFoldOutlined />;
  };

  // Navigation handlers for menu items
  const handleMenuClick = (key: string) => {
    setDropdownVisible(false);

    switch (key) {
      case 'profile':
        router.push(`/${user.userName}/profile`);
        break;
      case 'manage-access':
        router.push(`/${user.userName}/manage-access`);
        break;
      case 'secure-links':
        router.push(`/${user.userName}/secure-links`);
        break;
      case 'settings':
        // Navigate to profile page preferences tab
        const currentPath = window.location.pathname;
        if (currentPath.includes('/profile')) {
          // Already on profile page, dispatch custom event to change tab
          window.dispatchEvent(new CustomEvent('changeProfileTab', { 
            detail: { tab: 'preferences' } 
          }));
        } else {
          // Navigate to profile page with preferences tab
          router.push(`/${user.userName}/profile#preferences`);
        }
        break;
      case 'recent-updates':
        router.push(`/${user.userName}/recent-updates`);
        break;
      case 'refer-earn':
        router.push(`/${user.userName}/refer-and-earn`);
        break;
      case 'help-center':
        // Open help modal instead of navigating
        setIsHelpModalVisible(true);
        break;
      case 'feedback':
        // Handle feedback navigation properly
        const currentFeedbackPath = window.location.pathname;
        if (currentFeedbackPath.includes('/profile')) {
          // Already on profile page, dispatch custom event to change tab
          window.dispatchEvent(new CustomEvent('changeProfileTab', { 
            detail: { tab: 'feedback' } 
          }));
        } else {
          // Navigate to profile page with feedback tab
          router.push(`/${user.userName}/profile#feedback`);
        }
        break;
      case 'logout':
        localStorage.clear();
        router.push('/');
        window.location.reload();
        break;
      default:
        break;
    }
  };


  // Profile dropdown menu
  const profileMenu = (
    <div className="profile-dropdown dropdown-fade-in">
      {/* User Info Header */}
      <div className="profile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {user.image ? (
            <Avatar
              src={trimmedUrl}
              size={56}
              style={{
                border: `3px solid ${PRIMARY_COLOR}30`,
                boxShadow: `0 4px 12px ${PRIMARY_COLOR}25`,
              }}
            />
          ) : (
            <Avatar
              size={56}
              style={{
                backgroundColor: PRIMARY_COLOR,
                color: 'white',
                fontSize: '20px',
                fontWeight: 'bold',
                fontFamily: FONT_FAMILY,
                border: `3px solid ${PRIMARY_COLOR}30`,
              }}>
              {initials}
            </Avatar>
          )}
          <div>
            <div
              style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#262626',
                fontFamily: FONT_FAMILY,
                marginBottom: '2px',
              }}>
              {user.name || capitalizeEachWord(user.userName || 'Dockly User')}
            </div>
            <div
              style={{
                fontSize: '13px',
                color: '#8c8c8c',
                fontFamily: FONT_FAMILY,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}>
              <MailOutlined style={{ fontSize: '12px' }} />
              {/* {currentUser?.email} || {user.email} */}
              {currentUser ? currentUser.email : user.email}
            </div>
          </div>
        </div>
        <div className="workspace-tag" onClick={handleFamilyHubClick}>
          {user.userName
            ? `${capitalizeEachWord(user.userName)} Family`
            : 'Dockly Family'}
        </div>
      </div>

      {/* Menu Items */}
      <Menu
        style={{
          border: 'none',
          background: 'transparent',
          fontFamily: FONT_FAMILY,
        }}
        onClick={({ key }) => handleMenuClick(key)}
        items={[
          {
            key: 'profile',
            icon: (
              <UserOutlined
                style={{ color: PRIMARY_COLOR, fontSize: '16px' }}
              />
            ),
            label: (
              <span
                className="menu-item-hover"
                style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: '14px',
                  fontWeight: '500',
                  padding: '8px 0',
                }}>
                Profile
              </span>
            ),
            style: { marginBottom: '8px' },
          },
          { type: 'divider' },
          {
            key: 'manage-access',
            icon: (
              <TeamOutlined style={{ color: '#52c41a', fontSize: '16px' }} />
            ),
            label: (
              <span
                className="menu-item-hover"
                style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: '14px',
                  fontWeight: '500',
                  padding: '8px 0',
                }}>
                Manage access
              </span>
            ),
            style: { marginBottom: '8px' },
          },
          // {
          //   key: 'secure-links',
          //   icon: <LinkOutlined style={{ color: '#1890ff', fontSize: '16px' }} />,
          //   label: (
          //     <span
          //       className="menu-item-hover"
          //       style={{
          //         fontFamily: FONT_FAMILY,
          //         fontSize: '14px',
          //         fontWeight: '500',
          //         padding: '8px 0',
          //       }}
          //     >
          //       Secure links
          //     </span>
          //   ),
          //   style: { marginBottom: '8px' },
          // },
          {
            key: 'settings',
            icon: (
              <SettingOutlined style={{ color: '#722ed1', fontSize: '16px' }} />
            ),
            label: (
              <span
                className="menu-item-hover"
                style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: '14px',
                  fontWeight: '500',
                  padding: '8px 0',
                }}>
                Settings
              </span>
            ),
            style: { marginBottom: '8px' },
          },
          {
            key: 'recent-updates',
            icon: (
              <StarOutlined style={{ color: '#fa8c16', fontSize: '16px' }} />
            ),
            label: (
              <span
                className="menu-item-hover"
                style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: '14px',
                  fontWeight: '500',
                  padding: '8px 0',
                }}>
                Recent updates
              </span>
            ),
            style: { marginBottom: '8px' },
          },
          {
            key: 'refer-earn',
            icon: (
              <SyncOutlined style={{ color: '#13c2c2', fontSize: '16px' }} />
            ),
            label: (
              <span
                className="menu-item-hover"
                style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: '14px',
                  fontWeight: '500',
                  padding: '8px 0',
                }}>
                Refer and earn
              </span>
            ),
            style: { marginBottom: '8px' },
          },
          {
            key: 'help-center',
            icon: (
              <QuestionCircleOutlined
                style={{ color: '#eb2f96', fontSize: '16px' }}
              />
            ),
            label: (
              <span
                className="menu-item-hover"
                style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: '14px',
                  fontWeight: '500',
                  padding: '8px 0',
                }}>
                Help center
              </span>
            ),
            style: { marginBottom: '8px' },
          },
          {
            key: 'feedback',
            icon: (
              <MessageOutlined style={{ color: '#f5222d', fontSize: '16px' }} />
            ),
            label: (
              <span
                className="menu-item-hover"
                style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: '14px',
                  fontWeight: '500',
                  padding: '8px 0',
                }}>
                Feedback
              </span>
            ),
            style: { marginBottom: '8px' },
          },
          { type: 'divider' },
          {
            key: 'logout',
            icon: (
              <LogoutOutlined style={{ color: '#ff4d4f', fontSize: '16px' }} />
            ),
            label: (
              <span
                className="menu-item-hover"
                style={{
                  fontFamily: FONT_FAMILY,
                  fontSize: '14px',
                  fontWeight: '500',
                  padding: '8px 0',
                  color: '#ff4d4f',
                }}>
                Log out
              </span>
            ),
          },
        ]}
      />
    </div>
  );

  const getHeaderMargin = () => {
    if (responsive('mobile')) {
      return 0;
    } else if (responsive('tablet')) {
      return hidden ? 0 : isHovered ? 190 : 70;
    } else {
      return hidden ? 0 : isHovered ? 200 : 70;
    }
  };

  const getHeaderPadding = () => {
    if (responsive('mobile')) {
      return '6px 12px';
    } else if (responsive('tablet')) {
      return '6px 18px';
    } else {
      return '8px 24px';
    }
  };

  return (
    <>
      <style jsx>{headerStyles}</style>

      {/* Header Container */}
      <div
        className="header-transition"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: getHeaderPadding(),
          backgroundColor: '#fafafa',
          backdropFilter: 'blur(12px)',
          marginLeft: getHeaderMargin(),
          fontFamily: FONT_FAMILY,
        }}>
        {/* Left Section */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: responsive('mobile') ? '12px' : '20px',
          }}>
          <Button
            type="text"
            icon={getToggleIcon(collapsed, hidden)}
            onClick={handleToggleSidebar}
            className="button-hover"
            style={{
              fontSize: responsive('mobile') ? '16px' : '18px',
              width: responsive('mobile') ? 36 : 44,
              height: responsive('mobile') ? 36 : 44,
              marginLeft: hidden
                ? responsive('mobile')
                  ? '-8px'
                  : '-12px'
                : responsive('mobile')
                  ? '-16px'
                  : '-20px',
              color: PRIMARY_COLOR,
              borderRadius: '50%',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              fontFamily: FONT_FAMILY,
              marginTop: responsive('mobile') ? '2px' : '10px',
            }}
          />

          {hidden && <DocklyLogo marginLeftExpanded="-20px" marginTop="-1px" />}
        </div>
<div
  className="search-container"
  style={{
    maxWidth: responsive('mobile') ? 200 : responsive('tablet') ? 350 : 480,
    width: "100%",
    flex: 1,
    margin: responsive('mobile') ? "0 8px" : "0 16px"
  }}
>
  <Input
    prefix={
      <SearchOutlined
        style={{ color: PRIMARY_COLOR, fontSize: responsive('mobile') ? "14px" : "16px" }}
      />
    }
    placeholder={responsive('mobile') ? "Search..." : "Search accounts, files, notes - Ask Dockly AI"}
    className={searchFocused ? "search-focus" : ""}
    onFocus={() => setSearchFocused(true)}
    onBlur={() => setSearchFocused(false)}
    style={{
      width: "100%",
      borderRadius: responsive('mobile') ? "10px" : "12px",
      borderColor: searchFocused ? PRIMARY_COLOR : "#e0e0e0",
      padding: responsive('mobile') ? "8px 12px" : "12px 16px",
      fontSize: responsive('mobile') ? "12px" : "14px",
      fontFamily: FONT_FAMILY,
      background: "#ffffff",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      caretColor: "#000000", // cursor color
    } as React.CSSProperties} // <-- cast added here
  />
</div>


        {/* Right Section */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: responsive('mobile') ? '8px' : '12px',
          }}>
          {/* Admin/User Switch - Only visible for admin users (role === 2) */}
          {role === 2 && (
            <Tooltip
              title={
                isAdminView ? 'Switch to User View' : 'Switch to Admin View'
              }
              placement="bottom">
              <div className="admin-switch-container">
                <CrownOutlined className="crown-icon" />
                <span className="admin-switch-label">
                  {isAdminView ? 'Admin' : 'User'}
                </span>
                <div className="admin-switch">
                  <Switch
                    size="small"
                    checked={isAdminView}
                    onChange={handleViewSwitch}
                  />
                </div>
              </div>
            </Tooltip>
          )}

          {/* Help Button */}
          {!responsive('mobile') && (
            <Tooltip title="Help & Support" placement="bottom">
              <div
                className="action-button"
                onClick={() => setIsHelpModalVisible(true)}
                style={{
                  width: responsive('mobile') ? 36 : 44,
                  height: responsive('mobile') ? 36 : 44,
                }}>
                <QuestionCircleOutlined
                  style={{
                    fontSize: '18px',
                    color: PRIMARY_COLOR,
                  }}
                />
              </div>
            </Tooltip>
          )}

          {/* Commented out Folder Connection Button */}
          {/* {!responsive('mobile') && (
            <Tooltip title="Folder Connections" placement="bottom">
              <div
                className="action-button"
                onClick={() => setIsModalVisible(true)}
                style={{
                  width: responsive('mobile') ? 36 : 44,
                  height: responsive('mobile') ? 36 : 44,
                }}
              >
                <CatppuccinFolderConnection />
              </div>
            </Tooltip>
          )} */}

          <Dropdown
            dropdownRender={() => profileMenu}
            trigger={['click']}
            open={dropdownVisible}
            onOpenChange={setDropdownVisible}
            placement="bottomRight"
            arrow={{ pointAtCenter: true }}>
            <div
              className="user-info"
              style={{
                cursor: 'pointer',
                display: 'flex',
                gap: responsive('mobile') ? 8 : 12,
                alignItems: 'center',
                padding: responsive('mobile') ? '6px 8px' : '8px 12px',
              }}>
              {!responsive('mobile') && (
                <div style={{ textAlign: 'right' }}>
                  {/* <div
                    style={{
                      fontSize: responsive('mobile') ? '11px' : '13px',
                      fontWeight: '500',
                      fontFamily: FONT_FAMILY,
                      color: '#666',
                      transition: 'color 0.3s ease',
                    }}>
                    Welcome Back!
                  </div> */}
                  <div
                    style={{
                      color: PRIMARY_COLOR,
                      fontSize: responsive('mobile') ? '12px' : '14px',
                      fontWeight: '600',
                      fontFamily: FONT_FAMILY,
                      transition: 'all 0.3s ease',
                    }}>
                    {/* {user.userName
                      ? capitalizeEachWord(user.userName)
                      : 'Dockly User'} */}
                  </div>
                </div>
              )}

              {user.image ? (
                <Avatar
                  src={trimmedUrl}
                  size={responsive('mobile') ? 34 : 42}
                  className="avatar-glow"
                  style={{
                    cursor: 'pointer',
                    border: `2px solid ${PRIMARY_COLOR}`,
                    boxShadow: `0 2px 8px ${PRIMARY_COLOR}20`,
                  }}
                />
              ) : (
                <Avatar
                  className="avatar-glow"
                  size={responsive('mobile') ? 34 : 42}
                  style={{
                    backgroundColor: PRIMARY_COLOR,
                    color: 'white',
                    fontSize: responsive('mobile') ? '14px' : '16px',
                    fontWeight: 'bold',
                    fontFamily: FONT_FAMILY,
                    cursor: 'pointer',
                    border: `2px solid ${PRIMARY_COLOR}30`,
                  }}>
                  {initials}
                </Avatar>
              )}
            </div>
          </Dropdown>
        </div>
      </div>

      {/* Modals */}
      <FolderConnectionModal
        setIsModalVisible={setIsModalVisible}
        isModalVisible={isModalVisible}
      />

      <HelpChatModal
        visible={isHelpModalVisible}
        onClose={() => setIsHelpModalVisible(false)}
      />
    </>
  );
};

export default CustomHeader;