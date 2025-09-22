"use client";
import { Button, Typography } from "antd";
import { useState, useEffect } from "react";
import { API_URL } from "../../services/apiConfig";
const { Text } = Typography;
const CalendarStepThree = (props: any) => {
  const { setStep, selectedCalendars, setConnectedCalendars } = props;
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const username = localStorage.getItem("username") || null;
    const userId = localStorage.getItem("userId") || null;
    setUsername(username);
    setUserId(userId);
  }, []);

  const handleConnect = async () => {
    if (selectedCalendars.includes("Google Calendar")) {
      window.location.href = `${API_URL}/add-googleCalendar?username=${username}&userId=${userId}`;
    } else if (selectedCalendars.includes("Outlook Calendar")) {
      window.location.href = `${API_URL}/add-microsoftAccount?username=${username}&userId=${userId}`;
    }
    else {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setConnectedCalendars(selectedCalendars);
      setStep(4);
    }
  };
  return (
    <div
      style={{
        backgroundColor: "#fff",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        padding: "24px",
        marginBottom: "16px",
      }}
    >
      <Text
        style={{
          fontSize: "14px",
          color: "#6b7280",
          display: "block",
          marginBottom: "24px",
        }}
      >
        Step 3 of 3
      </Text>
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: "600" }}>
          Permissions & Privacy
        </h3>
        <p style={{ fontSize: "14px", color: "#6b7280" }}>
          Authorize Dockly to sync your selected calendars
        </p>
      </div>

      {/* Redirect Notice with Tick */}
      <div
        style={{
          backgroundColor: "#f0fdf4",
          padding: "16px",
          borderRadius: "12px",
          border: "1px solid #bbf7d0",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            backgroundColor: "#22c55e",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            stroke="#fff"
            fill="none"
            strokeWidth="3"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <p style={{ fontSize: "14px", color: "#111827", margin: 0 }}>
          <span style={{ fontWeight: 500 }}>
            You'll be redirected to sign in
          </span>
          <br />
          <span style={{ color: "#6b7280" }}>
            For each selected calendar, you'll need to sign in and authorize
            Dockly.
          </span>
        </p>
      </div>

      {/* Permissions */}
      <div
        style={{
          backgroundColor: "#f9fafb",
          padding: "16px",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          marginBottom: "16px",
        }}
      >
        <p
          style={{
            fontSize: "14px",
            fontWeight: 500,
            color: "#111827",
            marginBottom: "8px",
          }}
        >
          Dockly will be able to:
        </p>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {[
            "Sync selected service data", "Display relevant information in Dockly", "Allow disconnection anytime",
          ].map((item, index) => (
            <li
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "8px",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                stroke="#22c55e"
                fill="none"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span style={{ fontSize: "14px", color: "#111827" }}>{item}</span>
            </li>
          ))}

          <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              stroke="#ef4444"
              fill="none"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <span style={{ fontSize: "14px", color: "#111827" }}>
              Cannot access or modify data not explicitly selected by you
            </span>
          </li>
        </ul>
      </div>

      {/* Data Privacy */}
      <div
        style={{
          backgroundColor: "#f9fafb",
          padding: "16px",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          marginBottom: "24px",
        }}
      >
        <p style={{ fontSize: "14px", color: "#111827" }}>
          <span style={{ fontWeight: 500 }}>Data & Privacy</span>
          <br />
          <span style={{ color: "#6b7280" }}>
            Dockly syncs your selected service data securely and doesn't share it with
            third parties. You can disconnect access at any time.
          </span>
        </p>
      </div>

      {/* Navigation Buttons */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Button
          onClick={() => setStep(2)}
          style={{
            padding: "8px 16px",
            borderRadius: "6px",
            fontSize: "14px",
            cursor: "pointer",
            background: "none",
            color: "#6b7280",
            border: "1px solid #d1d5db",
          }}
        >
          Back
        </Button>
        <Button
          onClick={handleConnect}
          style={{
            padding: "8px 16px",
            borderRadius: "6px",
            fontSize: "14px",
            border: "none",
            cursor: "pointer",
            backgroundColor: "#2563eb",
            color: "#fff",
          }}
        >
          Connect
        </Button>
      </div>
    </div>
  );
};

export default CalendarStepThree;
