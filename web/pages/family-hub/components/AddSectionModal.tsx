"use client";

import React from "react";
import { Modal, Button, Card, Typography } from "antd";

const { Title, Text } = Typography;

const FONT_FAMILY =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

interface AddSectionModalProps {
  visible: boolean;
  onClose: () => void;
  onAddSection: (sectionType: 'bookmarks' | 'projects') => void;
}

const AddSectionModal: React.FC<AddSectionModalProps> = ({
  visible,
  onClose,
  onAddSection,
}) => {
  const handleAddSection = (sectionType: 'bookmarks' | 'projects') => {
    onAddSection(sectionType);
    onClose();
  };

  return (
    <Modal
      title={
        <span style={{ fontFamily: FONT_FAMILY, fontSize: "18px", fontWeight: 600 }}>
          Add a New Section
        </span>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      width={500}
      styles={{
        body: { padding: "24px", fontFamily: FONT_FAMILY }
      }}
    >
      <Text
        style={{
          display: "block",
          marginBottom: "24px",
          color: "#6b7280",
          fontFamily: FONT_FAMILY,
        }}
      >
        Choose which section you'd like to add to your Family Hub:
      </Text>

      <div style={{ display: "grid", gap: "16px" }}>
        <Card
          hoverable
          style={{
            border: "2px solid #e5e7eb",
            borderRadius: "12px",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          bodyStyle={{ padding: "20px" }}
          onClick={() => handleAddSection('bookmarks')}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#3355ff";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(51, 85, 255, 0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#e5e7eb";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                backgroundColor: "#eef1ff",
                color: "#3355ff",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
              }}
            >
              🔖
            </div>
            <div>
              <Title
                level={4}
                style={{
                  margin: 0,
                  marginBottom: "4px",
                  fontFamily: FONT_FAMILY,
                  fontSize: "16px",
                }}
              >
                Bookmarks
              </Title>
              <Text
                style={{
                  color: "#6b7280",
                  fontSize: "14px",
                  fontFamily: FONT_FAMILY,
                }}
              >
                Save and organize important links for your family
              </Text>
            </div>
          </div>
        </Card>

        <Card
          hoverable
          style={{
            border: "2px solid #e5e7eb",
            borderRadius: "12px",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          bodyStyle={{ padding: "20px" }}
          onClick={() => handleAddSection('projects')}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#10b981";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#e5e7eb";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                backgroundColor: "#ecfdf5",
                color: "#10b981",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
              }}
            >
              📋
            </div>
            <div>
              <Title
                level={4}
                style={{
                  margin: 0,
                  marginBottom: "4px",
                  fontFamily: FONT_FAMILY,
                  fontSize: "16px",
                }}
              >
                Projects & Tasks
              </Title>
              <Text
                style={{
                  color: "#6b7280",
                  fontSize: "14px",
                  fontFamily: FONT_FAMILY,
                }}
              >
                Manage family projects and track tasks together
              </Text>
            </div>
          </div>
        </Card>
      </div>

      <div style={{ textAlign: "center", marginTop: "24px" }}>
        <Button onClick={onClose} style={{ fontFamily: FONT_FAMILY }}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
};

export default AddSectionModal;