'use client'
import React from "react";
import {
  CheckCircleFilled,
  DeleteFilled,
  StarFilled,
  AimOutlined,
  CalendarFilled,
} from "@ant-design/icons";

const GettingStartedWidget = () => {
  const steps = [
    {
      label: "Add an account",
      icon: <DeleteFilled />,
      completed: true,
    },
    {
      label: "Customize categories",
      icon: <StarFilled />,
    },
    {
      label: "Create a goal",
      icon: <AimOutlined />,
    },
    {
      label: "Create a budget",
      icon: <CalendarFilled />,
    },
  ];

  return (
    <div
      style={{
        // border: "2px solid #1890ff",
        borderRadius: "12px",
        padding: "20px",
        backgroundColor: "#fff",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        width: "100vw",
        fontFamily: "Arial, sans-serif",
        // height: "45vh",
      }}
    >
      <h4 style={{ margin: 0, marginBottom: 16 }}>
        <strong>Getting Started</strong> John, let’s finish setting up your account
      </h4>

      <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
        <div
          style={{
            height: "6px",
            borderRadius: "4px",
            backgroundColor: "#007B8F",
            width: "20%",
            position: "relative",
          }}
        >
          <CheckCircleFilled
            style={{
              position: "absolute",
              right: "-12px",
              top: "-10px",
              color: "#007B8F",
              backgroundColor: "#fff",
              borderRadius: "50%",
              fontSize: "16px",
            }}
          />
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              height: "6px",
              width: "20%",
              backgroundColor: "#d9d9d9",
              borderRadius: "4px",
              marginLeft: "4px",
            }}
          />
        ))}
      </div>

      {/* Step List */}
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {steps.map((step, idx) => (
          <li
            key={idx}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "20px",
              borderTop: idx === 0 ? "none" : "1px solid #f0f0f0",
              color: step.completed ? "#aaa" : "#333",
              textDecoration: step.completed ? "line-through" : "none",
              fontSize: "15px",
              cursor: step.completed ? "default" : "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) =>
              !step.completed && (e.currentTarget.style.backgroundColor = "#f5faff")
            }
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
          >
            <span style={{ marginRight: 12 }}>{step.icon}</span>
            <span>{step.label}</span>
          </li>
        ))}
      </ul>

    </div>
  );
};

export default GettingStartedWidget;
