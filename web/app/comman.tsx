
'use client'
import { Button, Input, Modal, Tooltip, Typography } from "antd";
import { ReactNode, useEffect, useRef, useState } from "react";
import { DocklyUsers } from "../services/auth";
import { PlusOutlined } from "@ant-design/icons";
const { Text } = Typography;
export const PRIMARY_COLOR = "#6366F1";
export const ACTIVE_BG_COLOR = "#E0E7FF";
export const ACTIVE_TEXT_COLOR = PRIMARY_COLOR;
export const DEFAULT_TEXT_COLOR = "#343434";
export const FONT_FAMILY =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
export const SIDEBAR_BG = "#f9fafa";

export const COLORS = {
  primary: "#1a1a1a",
  secondary: "#4a4a4a",
  accent: "#6366F1",
  success: "#059669",
  warning: "#d97706",
  error: "#dc2626",
  background: "#fafbfc",
  surface: "#ffffff",
  surfaceSecondary: "#f8fafc",
  surfaceElevated: "#fdfdfd",
  border: "#e2e8f0",
  borderLight: "#f1f5f9",
  borderMedium: "#cbd5e1",
  text: "#1a1a1a",
  textSecondary: "#64748b",
  textTertiary: "#94a3b8",
  overlay: "rgba(0, 0, 0, 0.5)",
  shadowLight: "rgba(0, 0, 0, 0.05)",
  shadowMedium: "rgba(0, 0, 0, 0.1)",
  shadowHeavy: "rgba(0, 0, 0, 0.15)",
  shadowElevated: "rgba(0, 0, 0, 0.2)",
  habit: "#8b5cf6",
  mood: "#ec4899",
  energy: "#f59e0b",
  time: "#10b981",
};

const SPACING = {
  xs: 3,
  sm: 6,
  md: 12,
  lg: 18,
  xl: 24,
  xxl: 36,
};

type ContentCategory = {
  label: { name: string; title: string };
  children: { name: string; title: string }[];
};

export const Hubs: ContentCategory[] = [
  {
    label: { name: 'home', title: 'Home' },
    children: [
      { name: 'property-info', title: 'Property Information' },
      { name: 'mortgage-loans', title: 'Mortgage & Loans' },
      { name: 'home-maintenance', title: 'Home Maintenance' },
      { name: 'utilities', title: 'Utilities' },
      { name: 'insurance', title: 'Insurance' },
    ],
  },
  {
    label: { name: 'finance', title: 'Finance' },
    children: [],
  },
  {
    label: { name: 'family', title: 'Family' },
    children: [
      { name: 'familyMembers', title: 'Family Members & Pets' },
      { name: 'familyCalendar', title: 'Family Calendar' },
      { name: 'upcomingActivities', title: 'Upcoming Activities' },
      { name: 'familyNotesLists', title: 'Family Notes & Lists' },
      { name: 'familyTasksProjects', title: 'Family Tasks & Projects' },
      { name: 'guardiansEmergencyInfo', title: 'Guardians & Emergency Info' },
      { name: 'importantContacts', title: 'Important Contacts' }
    ]
  },
  {
    label: { name: 'health', title: 'Health' },
    children: [
      { name: 'health-info', title: 'Health Information' },
      { name: 'medical-records', title: 'Medical Records' },
      { name: 'emergency-contacts', title: 'Emergency Contacts' },
    ],
  },
];

// export const DocklyLogo = () => {
//   return (
//     <div
//       style={{
//         flex: 1.1,
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         backgroundColor: "#007B8F",
//       }}
//     >
//       <img
//         src="/logo.png"
//         alt="Dockly Logo"
//         style={{
//           maxWidth: "60%",
//           height: "auto",
//         }}
//       />
//     </div>
//   );
// };

export const adminUser = (role: number | undefined) => {
  return role === DocklyUsers.SuperAdmin || role === DocklyUsers.Developer;
};

export const LowercaseInput = (props: any) => {
  const { value, onChange, onKeyDown, style = {}, ...restProps } = props;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value.toLowerCase();
    inputValue = inputValue.replace(/\s+/g, "_");
    onChange?.(inputValue);
  };

  return (
    <Input
      {...restProps}
      value={value}
      onChange={handleChange}
      onKeyDown={onKeyDown}
      style={{
        ...style,
        caretColor: "#000",
      }}
    />
  );
};

export const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour >= 4 && hour < 12) {
    return "Good Morning";
  } else if (hour >= 12 && hour < 17) {
    return "Good Afternoon";
  } else if (hour >= 17 && hour < 21) {
    return "Good Evening";
  } else {
    return "Good Night";
  }
};

export const capitalizeEachWord = (text: string): string => {
  if (!text) return "";
  return text
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export function cleanProfilePictureUrl(url: string): string {
  if (typeof url !== "string") return "";
  const index = url.indexOf("=");
  return index !== -1 ? url.substring(0, index) : url;
}


export const useIsHovered = () => {
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return [ref, isHovered] as const;
};

interface DocklyLogoProps {
  collapsed?: boolean;
  color?: string;
  size?: number;
  title?: string;
  marginLeftCollapsed?: string;
  marginLeftExpanded?: string;
  marginTop?: string;
  textStyle?: React.CSSProperties;
}

export const DocklyLogo: React.FC<DocklyLogoProps> = ({
  collapsed = false,
  color = PRIMARY_COLOR,
  size = 40,
  title = "Dockly",
  marginLeftCollapsed = "-8px",
  marginLeftExpanded = "-50px",
  marginTop = 15,
  textStyle = {},
}) => {
  return (
    <div
      style={{
        marginLeft: collapsed ? marginLeftCollapsed : marginLeftExpanded,
        marginTop: marginTop,
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* SVG Logo */}
      <div
        style={{
          width: size,
          height: size,
          marginTop: -5,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 128 128"
            aria-hidden="true"
          >
            {/* Background circle */}
            <circle cx="64" cy="64" r="64" fill="#E0E7FF" />

            {/* Logo lines - scaled to 90% and centered */}
            <g
              fill={color}
              transform="translate(6.4, 6.4) scale(0.9)"
            >
              <rect x="34" y="28" width="60" height="16" rx="8" />
              <rect x="26" y="56" width="76" height="16" rx="8" />
              <rect x="18" y="84" width="92" height="16" rx="8" />
            </g>
          </svg>

        </div>
      </div>

      {/* Text */}
      {!collapsed && (
        <Text
          style={{
            color: DEFAULT_TEXT_COLOR,
            marginTop: '-7px',
            marginLeft: 8,
            fontSize: 22, // 🔥 dynamic font size based on logo size
            fontWeight: 700,
            letterSpacing: "0.5px",
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            ...textStyle,
          }}
        >
          {title}
        </Text>
      )}
    </div>
  );
};

interface AppModalProps {
  isVisible: boolean;
  onClose: () => void;
  width?: number;
  children: React.ReactNode;
}

export const CustomModal: React.FC<AppModalProps> = ({
  isVisible,
  onClose,
  width = 970,
  children,
}) => {
  return (
    <Modal
      open={isVisible}
      onCancel={onClose}
      footer={null}
      width={width}
      centered
      style={{
        borderRadius: "16px",
        margin: "50px",
        overflow: "hidden",
      }}
      styles={{
        body: {
          // padding: "32px",
          background: "#ffffff",
          maxHeight: "80vh",
          overflowY: "auto",
          scrollbarWidth: "none", // Firefox
          msOverflowStyle: "none", // IE / Edge
        }
      }}
      className="custom-modal"
    >
      {children}
    </Modal>
  );
};


type CustomTitleProps = {
  title: string;
  desc: string;
  icon: ReactNode;
  accentColor?: string; // optional, defaults to COLORS.accent
};

export const CustomTitle = ({ title, desc, icon, accentColor = COLORS.accent }: CustomTitleProps) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        // marginBottom: SPACING.xs,
        padding: `${SPACING.xs}px ${SPACING.sm}px`,
        borderRadius: "16px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: SPACING.md,
        }}
      >
        <div
          style={{
            width: "42px",
            height: "42px",
            background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`,
            color: "white",
            borderRadius: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 6px 20px ${accentColor}30`,
          }}
        >
          {icon}
        </div>
        <div>
          <h1
            style={{
              fontSize: "26px",
              fontWeight: 600,
              color: COLORS.text,
              margin: 0,
              lineHeight: 1.2,
              fontFamily: FONT_FAMILY,
            }}
          >
            {title}
          </h1>
          <Text
            style={{
              color: COLORS.textSecondary,
              fontSize: "14px",
              fontWeight: 400,
              display: "block",
              marginTop: "2px",
              fontFamily: FONT_FAMILY,
            }}
          >
            {desc}
          </Text>
        </div>
      </div>
    </div>
  );
};


interface CommonButtonProps {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  type?: "primary" | "default" | "dashed" | "link" | "text";
  size?: "small" | "middle" | "large";
  style?: React.CSSProperties;
}

export const CustomButton: React.FC<CommonButtonProps> = ({
  label,
  onClick,
  type = "primary",
  size = "small",
  style,
}) => {
  return (
    <Tooltip title={label} placement="top">
      <Button
        type={type}
        size={size}
        icon={<PlusOutlined />}
        onClick={onClick}
        style={{
          backgroundColor: COLORS.accent,
          borderColor: COLORS.accent,
          borderRadius: "6px",
          height: size === "small" ? "28px" : size === "middle" ? "36px" : "44px",
          fontWeight: 600,
          fontSize: size === "small" ? "12px" : "14px",
          fontFamily: FONT_FAMILY,
          ...style,
        }}
      />
    </Tooltip>);
};
