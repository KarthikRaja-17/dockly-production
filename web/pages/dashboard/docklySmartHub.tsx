import React from "react";
import {
  FileTextOutlined,
  DollarCircleOutlined,
  ClockCircleOutlined,
  UsergroupAddOutlined,
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  ExclamationCircleTwoTone,
} from "@ant-design/icons";

const DocklySmartHub = () => {
  const highlights = [
    { icon: <FileTextOutlined />, value: "323 files", label: "Pinned" },
    { icon: <DollarCircleOutlined />, value: "$20K", label: "Saved" },
    { icon: <ClockCircleOutlined />, value: "30K hours", label: "Saved" },
    { icon: <UsergroupAddOutlined />, value: "13", label: "Accounts Managed" },
  ];

  const notifications = [
    {
      icon: <CheckCircleTwoTone twoToneColor="#52c41a" />,
      message: "Netlix plan upgraded to Comprehensive",
    },
    {
      icon: <CloseCircleTwoTone twoToneColor="#ff4d4f" />,
      message: "Clean 3GB of duplicate photos stored among different drives",
    },
    // {
    //   icon: <CheckCircleTwoTone twoToneColor="#52c41a" />,
    //   message: "Upgraded with New Privacy Policy",
    // },
    {
      icon: <ExclamationCircleTwoTone twoToneColor="#faad14" />,
      message:
        "Your blood test results are here. I have scheduled an appointment with your PCP",
    },
  ];

  const actions = ["Organizer", "Finance Optimizer", "SMART Pin", "SMART Drop"];

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "12px",
        boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
        maxWidth: 400,
        paddingBottom: "20px",
        overflow: "hidden",
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "#007B8F",
          color: "#fff",
          padding: "12px 20px",
          fontWeight: "bold",
          fontSize: "16px",
        }}
      >
        Dockly Smart Hub
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          padding: "10px",
          textAlign: "center",
          flexWrap: "wrap",
        }}
      >
        {highlights.map((item, index) => (
          <div
            key={index}
            style={{
              width: 60, // fixed width for consistency
              overflow: "hidden",
            }}
          >
            <div
              style={{
                background: "#e6f7ff",
                padding: 10,
                borderRadius: 10,
                marginBottom: 5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 50, // optional for visual consistency
              }}
            >
              {item.icon}
            </div>
            <div
              style={{
                fontWeight: 600,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              title={item.value}
            >
              {item.value}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#888",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              title={item.label}
            >
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {/* Notifications */}
      <div style={{ padding: "0 20px" }}>
        {notifications.map((note, idx) => (
          <div
            key={idx}
            style={{
              background: "#f8f9fa",
              borderRadius: "8px",
              padding: "10px 12px",
              display: "flex",
              alignItems: "flex-start",
              marginBottom: "10px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <div style={{ marginRight: "10px", fontSize: "18px" }}>
              {note.icon}
            </div>
            <div style={{ fontSize: "14px", lineHeight: "1.5" }}>
              {note.message}
            </div>
          </div>
        ))}
      </div>

      {/* Subscribe CTA */}
      <div style={{ textAlign: "center", marginTop: 10 }}>
        <button
          style={{
            backgroundColor: "#007B8F",
            color: "white",
            padding: "8px 20px",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "14px",
            marginTop: "10px",
          }}
        >
          Subscribe now
        </button>
      </div>

      {/* Bottom Actions */}
      {/* <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          marginTop: "20px",
          padding: "0 10px",
          flexWrap: "wrap", // optional for responsiveness
        }}
      >
        {actions.map((action, i) => (
          <div
            key={i}
            style={{
              textAlign: "center",
              width: 70, // fixed width for equal spacing
              overflow: "hidden",
            }}
          >
            <div
              style={{
                backgroundColor: "#e6f7ff",
                padding: 10,
                borderRadius: 10,
                marginBottom: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 50, // optional: to make all icon boxes uniform
              }}
            >
              <span style={{ fontSize: "18px", color: "#007B8F" }}>📌</span>
            </div>
            <div
              style={{
                fontSize: "13px",
                color: "#555",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              title={action}
            >
              {action}
            </div>
          </div>
        ))}
      </div> */}
    </div>
  );
};

export default DocklySmartHub;
