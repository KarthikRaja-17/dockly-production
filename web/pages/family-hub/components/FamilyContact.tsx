"use client";

import React from "react";
import { Button } from "antd";

const FONT_FAMILY =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

// Mock data for contacts
const mockContacts = [
  { name: "Dr. Robert Williams", role: "Family Doctor", phone: "(555) 123-4567", avatar: "👨‍⚕️", color: "#ef4444" },
  { name: "Dr. Susan Chen", role: "Dentist", phone: "(555) 234-5678", avatar: "🦷", color: "#f59e0b" },
];

const FamilyContacts: React.FC = () => {
  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
        overflow: "hidden",
        fontFamily: FONT_FAMILY,
      }}
    >
      <div
        style={{
          padding: "16px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <h3
          style={{
            fontSize: "16px",
            fontWeight: 600,
            color: "#111827",
            display: "flex",
            alignItems: "center",
            margin: 0,
            fontFamily: FONT_FAMILY,
          }}
        >
          <span style={{ marginRight: "8px", opacity: 0.8 }}>📞</span>
          Family Contacts
        </h3>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "6px",
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#6b7280",
            }}
          >
            ➕
          </button>
          <button
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "6px",
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#6b7280",
            }}
          >
            •••
          </button>
        </div>
      </div>
      <div style={{ padding: "20px" }}>
        <div style={{ display: "grid", gap: "12px" }}>
          {mockContacts.map((contact, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "12px",
                backgroundColor: "#f0f4f8",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#e5e7eb";
                e.currentTarget.style.transform = "translateX(4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#f0f4f8";
                e.currentTarget.style.transform = "translateX(0)";
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  backgroundColor: contact.color,
                  color: "white",
                  borderRadius: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "12px",
                  fontSize: "16px",
                  fontWeight: 600,
                }}
              >
                {contact.avatar}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 500,
                    marginBottom: "2px",
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  {contact.name}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  {contact.role}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#3355ff",
                    fontFamily: FONT_FAMILY,
                  }}
                >
                  {contact.phone}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <Button
          style={{
            width: "100%",
            marginTop: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: FONT_FAMILY,
          }}
        >
          <span style={{ marginRight: "8px" }}>➕</span>
          Add Contact
        </Button>
      </div>
    </div>
  );
};

export default FamilyContacts;