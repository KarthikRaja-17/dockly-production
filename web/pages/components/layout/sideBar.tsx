"use client";
import React, { forwardRef, useEffect, useState, RefObject } from "react";
import { Divider, Layout, Menu, Tooltip, Typography } from "antd";
import { usePathname, useRouter } from "next/navigation";
import {
  AppstoreOutlined,
  CalendarOutlined,
  TeamOutlined,
  DollarOutlined,
  HomeOutlined,
  HeartOutlined,
  FileTextOutlined,
  IdcardOutlined,
  FolderOpenOutlined,
  GiftOutlined,
  MessageOutlined,
  UserOutlined,
  LockOutlined,
  BarChartOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { useCurrentUser } from "../../../app/userContext";
import { useGlobalLoading } from "../../../app/loadingContext";
import {
  ACTIVE_BG_COLOR,
  ACTIVE_TEXT_COLOR,
  adminUser,
  COLORS,
  DEFAULT_TEXT_COLOR,
  DocklyLogo,
  FONT_FAMILY,
  PRIMARY_COLOR,
  SIDEBAR_BG,
} from "../../../app/comman";
import { responsive } from "../../../utils/responsive";
import { Users } from "lucide-react";
import { fetchUserMenus } from "../../../services/user";
import ReferralModal from "../ReferDockly";

const { Text } = Typography;
const { Sider } = Layout;

interface Board {
  board_name: string;
  icon: string;
  title: string;
}
type Hub = {
  hub_name: string;
  icon: string;
  title: string;
};

// Admin menu configuration with professional styling
const adminMenus = [
  { key: "overview", icon: <AppstoreOutlined />, label: "Overview" },
  { key: "users", icon: <Users size={16} />, label: "Users" },
  { key: "monitoring", icon: <CalendarOutlined />, label: "Monitoring" },
  { key: "billing", icon: <DollarOutlined />, label: "Billing" },
  { key: "security", icon: <LockOutlined />, label: "Security" },
  { key: "analytics", icon: <BarChartOutlined />, label: "Analytics" },
  { key: "admin-tools", icon: <ToolOutlined />, label: "Admin Tools" },
];

const iconMap: Record<string, JSX.Element> = {
  TeamOutlined: <TeamOutlined style={{ color: "#ec4899" }} />,
  DollarOutlined: <DollarOutlined style={{ color: "#3b82f6" }} />,
  HomeOutlined: <HomeOutlined style={{ color: "#10b981" }} />,
  HeartOutlined: <HeartOutlined style={{ color: "#ef4444" }} />,
  FileTextOutlined: <FileTextOutlined style={{ color: "#fa8c16" }} />,
  IdcardOutlined: <IdcardOutlined style={{ color: "#dc2626" }} />,
  FolderOpenOutlined: <FolderOpenOutlined style={{ color: "#2563eb" }} />,
  LockOutlined: <LockOutlined style={{ color: "#8b5cf6" }} />,
  AppstoreOutlined: <CalendarOutlined style={{ color: "#8b5cf6" }} />,
};

const getIcon = (iconName: string) =>
  iconMap[iconName] || <CalendarOutlined style={{ color: "#8b5cf6" }} />;

const Sidebar = forwardRef<HTMLDivElement, { collapsed: boolean }>(
  ({ collapsed }, ref) => {
    const router = useRouter();
    const pathname = usePathname();
    const currentUser = useCurrentUser();
    const isAdmin = adminUser(currentUser?.role);
    const isAdminPath = pathname?.startsWith("/admin");
    const showAdminMenu = isAdmin && isAdminPath;
    const username = currentUser?.user_name || "";
    const [isReferDocklyOpen, setIsReferDocklyOpen] = useState(false);
    const [currentPath, setCurrentPath] = useState("dashboard");
    const [hubs, setHubs] = useState<Hub[]>([]);
    const [boards, setBoards] = useState<Board[]>([]);
    const { setLoading } = useGlobalLoading();

    useEffect(() => {
      // Only fetch user menus when not showing admin menu
      if (!showAdminMenu) {
        getUserMenus();
      }
    }, [showAdminMenu]);

    useEffect(() => {
      const pathSegments = pathname?.split("/") || [];
      let active = "dashboard";
      if (showAdminMenu) {
        // Admin path logic
        active = pathSegments[pathSegments.length - 1];
      } else {
        // Regular user path logic
        const pathPart = pathSegments[2] || "dashboard";
        // Handle board paths that end with "-hub"
        if (pathPart.endsWith("-hub")) {
          // Remove the "-hub" suffix to match the board key
          active = pathPart.replace("-hub", "");
        } else {
          active = pathPart;
        }
      }
      setCurrentPath(active);
    }, [pathname, showAdminMenu]);

    const handleMenuClick = (
      key: string,
      isAdminMenu: boolean = false,
      isBoard: boolean = false
    ) => {
      if (isAdminMenu) {
        router.push(`/admin/${username}/${key}`);
      } else {
        if (isBoard) {
          router.push(`/${username}/${key}-hub`);
        } else {
          router.push(`/${username}/${key}`);
        }
      }
    };

    // Check if a menu item should be active
    const isMenuItemActive = (key: string) => {
      return currentPath === key;
    };

    // Professional Admin Menu Group - Made more compact
    const professionalAdminMenuGroup = () => (
      <div style={{ marginBottom: 10, marginTop: 4 }}>
        <Text
          style={{
            fontSize: 10.5,
            fontWeight: 700,
            marginLeft: 14,
            color: "#64748b",
            textTransform: "uppercase",
            letterSpacing: "0.7px",
            display: collapsed ? "none" : "block",
            fontFamily: FONT_FAMILY,
            marginBottom: 6,
          }}
        >
          ADMINISTRATION
        </Text>

        <div style={{ padding: "0 7px" }}>
          {adminMenus.map(({ key, icon, label }) => {
            const isActive = isMenuItemActive(key);
            return (
              <motion.div
                key={key}
                whileHover={{
                  scale: 1.02,
                  transition: { duration: 0.2, ease: "easeOut" },
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleMenuClick(key, true)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: collapsed ? "10.5px 0" : "10.5px 14px",
                  marginBottom: 2,
                  borderRadius: 9,
                  cursor: "pointer",
                  backgroundColor: isActive ? "#f8fafc" : "transparent",
                  border: isActive
                    ? "1px solid #e2e8f0"
                    : "1px solid transparent",
                  boxShadow: isActive
                    ? "0 2px 8px rgba(15, 23, 42, 0.04)"
                    : "none",
                  transition: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
                  justifyContent: collapsed ? "center" : "flex-start",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "#f1f5f9";
                    e.currentTarget.style.border = "1px solid #f1f5f9";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.border = "1px solid transparent";
                  }
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 21,
                    height: 21,
                    marginRight: collapsed ? 0 : 10,
                  }}
                >
                  {React.cloneElement(icon as React.ReactElement, {
                    style: {
                      fontSize: 15,
                      color: isActive ? "#0f172a" : "#64748b",
                      transition: "color 0.15s ease",
                    },
                  })}
                </div>

                {!collapsed && (
                  <span
                    style={{
                      fontSize: 13,
                      fontFamily: FONT_FAMILY,
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? "#0f172a" : "#475569",
                      letterSpacing: "0.15px",
                      transition: "color 0.15s ease",
                    }}
                  >
                    {label}
                  </span>
                )}

                {collapsed && (
                  <Tooltip title={label} placement="right">
                    <div style={{ position: "absolute", inset: 0 }} />
                  </Tooltip>
                )}

                {isActive && (
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 2.5,
                      height: 18,
                      backgroundColor: COLORS.accent,
                      borderRadius: "1.5px 0 0 1.5px",
                    }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    );

    const menuGroup = (
      title: string,
      items?: { key: string; icon: React.ReactNode; label: string }[],
      isAdminGroup: boolean = false,
      isBoard: boolean = false
    ) => (
      <div style={{ marginBottom: 10, marginTop: 4 }}>
        <Text
          style={{
            fontSize: 10.5,
            fontWeight: 700,
            marginLeft: 14,
            color: "#64748b",
            textTransform: "uppercase",
            letterSpacing: "0.7px",
            display: collapsed ? "none" : "block",
            fontFamily: FONT_FAMILY,
            marginBottom: 6,
          }}
        >
          {title}
        </Text>

        <div style={{ padding: "0 7px" }}>
          {(items ?? []).map(({ key, icon, label }) => {
            const isActive = isMenuItemActive(key);
            return (
              <motion.div
                key={key}
                whileHover={{
                  scale: 1.02,
                  transition: { duration: 0.2, ease: "easeOut" },
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleMenuClick(key, isAdminGroup, isBoard)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: collapsed ? "10.5px 0" : "10.5px 14px",
                  marginBottom: 2,
                  borderRadius: 9,
                  cursor: "pointer",
                  backgroundColor: isActive ? "#f8fafc" : "transparent",
                  border: isActive
                    ? "1px solid #e2e8f0"
                    : "1px solid transparent",
                  boxShadow: isActive
                    ? "0 2px 8px rgba(15, 23, 42, 0.04)"
                    : "none",
                  transition: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
                  justifyContent: collapsed ? "center" : "flex-start",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "#f1f5f9";
                    e.currentTarget.style.border = "1px solid #f1f5f9";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.border = "1px solid transparent";
                  }
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 21,
                    height: 21,
                    marginRight: collapsed ? 0 : 10,
                  }}
                >
                  {React.cloneElement(icon as React.ReactElement, {
                    style: {
                      ...((icon as React.ReactElement)?.props?.style || {}),
                      fontSize: 15,
                      color: isActive
                        ? "#0f172a"
                        : (icon as React.ReactElement)?.props?.style?.color ||
                          "#64748b",
                      transition: "color 0.15s ease",
                    },
                  })}
                </div>

                {!collapsed && (
                  <span
                    style={{
                      fontSize: 13,
                      fontFamily: FONT_FAMILY,
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? "#0f172a" : "#475569",
                      letterSpacing: "0.15px",
                      transition: "color 0.15s ease",
                    }}
                  >
                    {label}
                  </span>
                )}

                {collapsed && (
                  <Tooltip title={label} placement="right">
                    <div style={{ position: "absolute", inset: 0 }} />
                  </Tooltip>
                )}

                {isActive && (
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 2.5,
                      height: 18,
                      backgroundColor: COLORS.accent,
                      borderRadius: "1.5px 0 0 1.5px",
                    }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    );

    const getUserMenus = async () => {
      setLoading(true);

      // Check localStorage first
      const cachedMenus = localStorage.getItem("userMenus");
      if (cachedMenus) {
        const { boards, hubs } = JSON.parse(cachedMenus);
        setBoards(boards || []);
        setHubs(hubs || []);
        setLoading(false);
        return; // ✅ Don't call API again
      }

      // If not in localStorage, fetch from API
      const response = await fetchUserMenus();
      const { status, payload } = response.data;

      if (status) {
        setHubs(payload.hubs);
        setBoards(payload.boards);

        // Save in localStorage for later reloads
        localStorage.setItem("userMenus", JSON.stringify(payload));
      }

      setLoading(false);
    };

    const getSiderWidth = () => {
      if (responsive("mobile")) {
        return collapsed ? 55 : 170;
      } else if (responsive("tablet")) {
        return collapsed ? 65 : 190;
      } else {
        return collapsed ? 75 : 210;
      }
    };

    const getCollapsedWidth = () => {
      if (responsive("mobile")) {
        return 55;
      } else if (responsive("tablet")) {
        return 65;
      } else {
        return 75;
      }
    };

    // Hide sidebar completely on mobile
    if (responsive("mobile")) {
      return null;
    }

    const isDashboardActive = isMenuItemActive("dashboard");

    return (
      <>
        <style jsx global>{`
          .sidebar-container::-webkit-scrollbar {
            display: none;
          }
          .sidebar-container {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
        <Sider
          ref={ref as RefObject<HTMLDivElement>}
          width={getSiderWidth()}
          collapsedWidth={getCollapsedWidth()}
          collapsed={collapsed}
          className="sidebar-container"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            height: "100vh",
            minHeight: "100vh",
            maxHeight: "100vh",
            backgroundColor: SIDEBAR_BG,
            padding: responsive("mobile") ? "4px 0" : "6px 0",
            // borderRight: '1px solid #e5e7eb',
            overflow: "auto",
            overflowX: "hidden",
            display: "flex",
            flexDirection: "column",
            zIndex: 1000,
            fontFamily: FONT_FAMILY,
            boxShadow: "0 0 20px rgba(0, 0, 0, 0.02)",
            maxWidth: "100%",
            scrollbarWidth: "none", // Firefox
            msOverflowStyle: "none", // Internet Explorer 10+
          }}
        >
          {/* Logo Section */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              cursor: "pointer",
              display: "flex",
              justifyContent: "center",
              marginBottom: responsive("mobile") ? 10 : 8,
              padding: responsive("mobile") ? "5px" : "8px",
              flexShrink: 0,
            }}
            onClick={() => {
              if (showAdminMenu) {
                router.push(`/admin/${username}/users`);
              } else {
                router.push(`/${username}/dashboard`);
              }
            }}
          >
            <DocklyLogo
              collapsed={collapsed}
              size={40}
              marginLeftCollapsed="-7px"
              marginLeftExpanded="-45px"
            />
          </motion.div>
          <Divider
            style={{
              marginTop: "-8px",
              marginBottom: "8px",
              borderColor: "#E0E7FF",
              flexShrink: 0,
            }}
          />

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              overflowX: "hidden",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              paddingBottom: "15px",
              marginTop: -10,
            }}
          >
            {/* Dashboard section - show for non-admin menu only */}
            {!showAdminMenu && (
              <div style={{ marginBottom: 12, marginTop: 4, padding: "0 7px" }}>
                <motion.div
                  whileHover={{
                    scale: 1.02,
                    transition: { duration: 0.2, ease: "easeOut" },
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push(`/${username}/dashboard`)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: collapsed ? "10.5px 0" : "10.5px 14px",
                    marginBottom: 2,
                    borderRadius: 9,
                    cursor: "pointer",
                    backgroundColor: isDashboardActive
                      ? "#f8fafc"
                      : "transparent",
                    border: isDashboardActive
                      ? "1px solid #e2e8f0"
                      : "1px solid transparent",
                    boxShadow: isDashboardActive
                      ? "0 2px 8px rgba(15, 23, 42, 0.04)"
                      : "none",
                    transition: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
                    justifyContent: collapsed ? "center" : "flex-start",
                    position: "relative",
                    overflow: "hidden",
                  }}
                  onMouseEnter={(e) => {
                    if (!isDashboardActive) {
                      e.currentTarget.style.backgroundColor = "#f1f5f9";
                      e.currentTarget.style.border = "1px solid #f1f5f9";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isDashboardActive) {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.border = "1px solid transparent";
                    }
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 21,
                      height: 21,
                      marginRight: collapsed ? 0 : 10,
                    }}
                  >
                    <AppstoreOutlined
                      style={{
                        fontSize: 15,
                        color: isDashboardActive ? "#0f172a" : "#2563eb",
                        transition: "color 0.15s ease",
                      }}
                    />
                  </div>

                  {!collapsed && (
                    <span
                      style={{
                        fontSize: 13,
                        fontFamily: FONT_FAMILY,
                        fontWeight: isDashboardActive ? 600 : 500,
                        color: isDashboardActive ? "#0f172a" : "#475569",
                        letterSpacing: "0.15px",
                        transition: "color 0.15s ease",
                      }}
                    >
                      Dashboard
                    </span>
                  )}

                  {collapsed && (
                    <Tooltip title="Dashboard" placement="right">
                      <div style={{ position: "absolute", inset: 0 }} />
                    </Tooltip>
                  )}

                  {isDashboardActive && (
                    <div
                      style={{
                        position: "absolute",
                        right: 0,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 2.5,
                        height: 18,
                        backgroundColor: COLORS.accent,
                        borderRadius: "1.5px 0 0 1.5px",
                      }}
                    />
                  )}
                </motion.div>
              </div>
            )}

            {/* Professional Admin-specific menus - only show when on admin path */}
            {showAdminMenu && professionalAdminMenuGroup()}

            {/* User-specific menus - show when NOT on admin path (for all users including admins) */}
            {!showAdminMenu && (
              <>
                {menuGroup(
                  "Boards",
                  boards.map((board) => ({
                    key: board.board_name,
                    icon: getIcon(board.icon),
                    label: board.title,
                  })),
                  false, // not admin
                  true // this is boards → add "-hub"
                )}

                {menuGroup(
                  "Hubs",
                  hubs.map((hub) => ({
                    key: hub.hub_name,
                    icon: getIcon(hub.icon),
                    label: hub.title,
                  })),
                  false, // not admin
                  false // hubs → no "-hub"
                )}

                <Divider style={{ margin: "28px 0", borderColor: "#e5e7eb" }} />

                {/* Refer Dockly & Feedback Section with consistent styling */}
                <div style={{ marginBottom: 10, marginTop: 4 }}>
                  {/* Refer Dockly */}
                  <motion.div
                    whileHover={{
                      scale: 1.02,
                      transition: { duration: 0.2, ease: "easeOut" },
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsReferDocklyOpen(true)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: collapsed ? "12px 0" : "12px 16px",
                      marginBottom: 2,
                      borderRadius: 9,
                      cursor: "pointer",
                      backgroundColor: "transparent",
                      border: "1px solid transparent",
                      transition: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
                      justifyContent: collapsed ? "center" : "flex-start",
                      position: "relative",
                      overflow: "hidden",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f1f5f9";
                      e.currentTarget.style.border = "1px solid #f1f5f9";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.border = "1px solid transparent";
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 21,
                        height: 21,
                        marginRight: collapsed ? 0 : 10,
                      }}
                    >
                      <GiftOutlined
                        style={{
                          fontSize: 15,
                          color: "#ad4e00",
                          transition: "color 0.15s ease",
                        }}
                      />
                    </div>

                    {!collapsed && (
                      <span
                        style={{
                          fontSize: 13,
                          fontFamily: FONT_FAMILY,
                          fontWeight: 500,
                          color: "#475569",
                          letterSpacing: "0.15px",
                          transition: "color 0.15s ease",
                        }}
                      >
                        Refer Dockly
                      </span>
                    )}

                    {collapsed && (
                      <Tooltip title="Refer Dockly" placement="right">
                        <div style={{ position: "absolute", inset: 0 }} />
                      </Tooltip>
                    )}
                  </motion.div>

                  {/* Feedback */}
                  <motion.div
                    whileHover={{
                      scale: 1.02,
                      transition: { duration: 0.2, ease: "easeOut" },
                    }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => router.push(`/${username}/profile#feedback`)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: collapsed ? "10.5px 0" : "10.5px 14px",
                      marginBottom: 2,
                      borderRadius: 9,
                      cursor: "pointer",
                      backgroundColor: "transparent",
                      border: "1px solid transparent",
                      transition: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
                      justifyContent: collapsed ? "center" : "flex-start",
                      position: "relative",
                      overflow: "hidden",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f1f5f9";
                      e.currentTarget.style.border = "1px solid #f1f5f9";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.border = "1px solid transparent";
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 21,
                        height: 21,
                        marginRight: collapsed ? 0 : 10,
                      }}
                    >
                      <MessageOutlined
                        style={{
                          fontSize: 15,
                          color: PRIMARY_COLOR,
                          transition: "color 0.15s ease",
                        }}
                      />
                    </div>

                    {!collapsed && (
                      <span
                        style={{
                          fontSize: 13,
                          fontFamily: FONT_FAMILY,
                          fontWeight: 500,
                          color: "#475569",
                          letterSpacing: "0.15px",
                          transition: "color 0.15s ease",
                        }}
                      >
                        Feedback
                      </span>
                    )}

                    {collapsed && (
                      <Tooltip title="Feedback" placement="right">
                        <div style={{ position: "absolute", inset: 0 }} />
                      </Tooltip>
                    )}
                  </motion.div>
                </div>
              </>
            )}
          </div>
          <ReferralModal
            visible={isReferDocklyOpen}
            onClose={() => setIsReferDocklyOpen(false)}
          />
        </Sider>
      </>
    );
  }
);

Sidebar.displayName = "Sidebar";
export default Sidebar;
