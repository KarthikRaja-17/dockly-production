
"use client";
import { Layout } from "antd";

import Sidebar from "./sideBar";
import { useEffect, useState } from "react";
import { count } from "console";
import { default as CustomHeader } from "./header";

interface MainLayoutProps {
  children: React.ReactNode;
  colors?: {
    primaryColor?: string;
    activeTextColor?: string;
    sidebarBg?: string;
  };
  // activeTab: string;
  // onTabClick: (tab: string) => void;
}

export default function MainLayout({ children, colors }: MainLayoutProps) {
  // const [hoverRef, isHovered] = useIsHovered();
  const [collapsed, setCollapsed] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey) {
        const key = event.key.toLowerCase();

        if (key === 'b') {
          event.preventDefault();

          // If hidden, first make it visible
          if (hidden) {
            setHidden(false);
          }

          // Then toggle collapsed
          setCollapsed(prev => !prev);
        }

        if (key === 'h') {
          event.preventDefault();
          setHidden(prev => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [hidden]);

  return (
    <Layout style={{
      background: "#f9fafb",
      caretColor: "transparent"
    }}>
      {!hidden && (
        <Sidebar collapsed={collapsed} />
      )}
      <Layout
        style={{
          marginLeft: hidden ? 0 : !collapsed ? 140 : 25,
          transition: "all 0.3s ease",
          minHeight: "100vh",
        }}
      >

        <CustomHeader isHovered={!collapsed} collapsed={collapsed} setCollapsed={setCollapsed} setHidden={setHidden} hidden={hidden}
          count={6}
        />
        <div
          style={{
            background: "#f9fafb",
            marginLeft: hidden ? 0 : collapsed ? 38 : 70,
            minHeight: "calc(100vh - 64px)",
            caretColor: "transparent"
          }}
        >
          {children}
        </div>
      </Layout>
    </Layout>
  );
}


