"use client";
import React, { useState, useEffect } from "react";
import { Card, Button, message, Spin, Typography, Tooltip } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { getAllPlannerData } from "../../../services/planner";
import { useCurrentUser } from "../../../app/userContext";
import AddEventModal from "../../dashboard/AddEventModal";


const { Text } = Typography;
const FONT_FAMILY =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

interface FamilyMember {
  id: number;
  name: string;
  color: string;
  type: "family" | "pets";
  initials: string;
  status?: "pending" | "accepted";
  user_id?: string;
}

interface WeekHighlightsProps {
  familyMembers?: FamilyMember[];
  onRefreshData?: () => void;
}

const WeekHighlights: React.FC<WeekHighlightsProps> = ({
  familyMembers = [],
  onRefreshData,
}) => {
  const [highlights, setHighlights] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isAddEventModalVisible, setIsAddEventModalVisible] = useState(false);
  const currentUser = useCurrentUser();

  const isInCurrentWeek = (date: Date) => {
    const now = new Date();
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((day + 6) % 7));
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return date >= monday && date <= sunday;
  };

  const getMemberColor = (name: string) => {
    const member = familyMembers?.find((fm) => fm.name === name);
    return member ? member.color : "#3355ff";
  };

  const getMemberInitials = (name: string) => { 
    const member = familyMembers?.find((fm) => fm.name === name);
    return member ? member.name.charAt(0).toUpperCase() : "Y";
  };


  // Function to determine if text should be white or dark based on background color
  const getTextColor = (backgroundColor: string) => {
    // Convert hex to RGB
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return white for dark backgrounds, dark for light backgrounds
    return luminance > 0.5 ? '#333333' : '#ffffff';
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getAllPlannerData({ show_dockly: true });
      const events = response.data?.payload?.events || [];

      const filteredEvents = events.filter((event: any) => {
        const rawDate =
          event.start?.dateTime || event.start?.date || event.date || null;
        if (!rawDate) return false;
        const eventDate = new Date(rawDate);
        return isInCurrentWeek(eventDate);
      });

      const transformed = filteredEvents.map((event: any) => {
        const eventDate = new Date(
          event.start?.dateTime || event.start?.date || event.date
        );

        const eventTime = event.start?.dateTime
          ? new Date(event.start.dateTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "All Day";

        const member = familyMembers?.find(
          (fm) => fm.user_id === event.user_id
        );

        // Format the day and time display
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const eventDateOnly = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
        
        let dayLabel = "";
        if (eventDateOnly.getTime() === today.getTime()) {
          dayLabel = "TODAY";
        } else if (eventDateOnly.getTime() === today.getTime() + 86400000) {
          dayLabel = "TOMORROW";
        } else {
          dayLabel = eventDate.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
        }

        return {
          time: `${dayLabel} • ${eventTime}`,
          title: event.summary || "Untitled Event",
          location: event.location || "—",
          person: member?.name || currentUser?.name || "You",
          color: member?.color || "#3355ff",
          user_id: event.user_id,
          eventDate: eventDate, // Keep original date for sorting
        };
      });

      // Sort activities by date
      transformed.sort((a: { eventDate: Date }, b: { eventDate: Date }) => a.eventDate.getTime() - b.eventDate.getTime());

      setHighlights(transformed);
    } catch (err) {
      console.error("Error fetching weekly planner data:", err);
      message.error("Failed to load weekly activities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [familyMembers]);

  const handleAddActivityClick = () => {
    setIsAddEventModalVisible(true);
  };

  const handleEventModalClose = () => {
    setIsAddEventModalVisible(false);
  };

  const handleEventSuccess = async () => {
    setIsAddEventModalVisible(false);
    await fetchData(); // Refresh the activities data
    if (onRefreshData) {
      onRefreshData(); // Trigger parent refresh if needed
    }
  };

  // Create mock connected accounts from family members for the modal
  const connectedAccounts = familyMembers
    .filter(member => member.type === "family" && member.user_id)
    .map(member => ({
      userName: member.name,
      email: `${member.name.toLowerCase().replace(/\s+/g, '.')}@family.com`,
      displayName: member.name,
      accountType: "family",
      provider: "family",
      color: member.color,
    }));

  return (
    <>
      <div
        style={{
          backgroundColor: "#f9fafb",
          borderRadius: "8px",
          padding: "12px",
          height: "460px",
          width: "100%",
          maxWidth: "100%",
          display: "flex",
          flexDirection: "column",
          fontFamily: FONT_FAMILY,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "12px",
            paddingBottom: "8px",
            borderBottom: "2px solid #e5e7eb",
            flexShrink: 0,
          }}
        >
          <div>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "#374151",
                margin: "0 0 4px 0",
                fontFamily: FONT_FAMILY,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Activities
            </h3>
            <div
              style={{
                fontSize: "12px",
                color: "#6b7280",
                fontFamily: FONT_FAMILY,
                whiteSpace: "nowrap",
              }}
            >
              This Week
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            flex: 1,
            overflowY: "hidden",
            overflowX: "hidden",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            minHeight: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.overflowY = "auto";
            // Add scrollbar styles
            const style = document.createElement('style');
            style.textContent = `
              .activity-scroll::-webkit-scrollbar { width: 6px; }
              .activity-scroll::-webkit-scrollbar-track { background: transparent; }
              .activity-scroll::-webkit-scrollbar-thumb { background-color: rgba(0,0,0,0.2); border-radius: 3px; }
              .activity-scroll::-webkit-scrollbar-thumb:hover { background-color: rgba(0,0,0,0.3); }
            `;
            document.head.appendChild(style);
            e.currentTarget.className += ' activity-scroll';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.overflowY = "hidden";
            // Remove scrollbar styles
            const styles = document.querySelectorAll('style');
            styles.forEach(style => {
              if (style.textContent?.includes('.activity-scroll::-webkit-scrollbar')) {
                style.remove();
              }
            });
            e.currentTarget.className = e.currentTarget.className.replace(' activity-scroll', '');
          }}
        >
          {loading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flex: 1,
              }}
            >
              <Spin tip="Loading activities..." />
            </div>
          ) : highlights.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                color: "#6b7280",
                fontSize: "10px",
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              No activities scheduled for this week.
            </div>
          ) : (
            highlights.map((item, index) => {
              const memberColor = getMemberColor(item.person);
              const memberInitials = getMemberInitials(item.person);
              const textColor = getTextColor(memberColor);
              
              return (
                <div
                  key={index}
                  style={{
                    backgroundColor: "white",
                    borderRadius: "6px",
                    padding: "8px",
                    border: `1px solid ${item.color}`,
                    transition: "all 0.2s",
                    cursor: "pointer",
                    flexShrink: 0,
                    minHeight: "60px",
                    maxHeight: "65px",
                    maxWidth: "100%",
                    overflow: "hidden",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "8px",
                      width: "100%",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: "10px",
                          fontWeight: 600,
                          color: "#222222ff",
                          marginBottom: "2px",
                          fontFamily: FONT_FAMILY,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {item.time}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: 500,
                          marginBottom: "2px",
                          fontFamily: FONT_FAMILY,
                          wordWrap: "break-word",
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: "vertical",
                          lineHeight: "1.2",
                        }}
                      >
                        {item.title}
                      </div>
                      {/* <div
                        style={{
                          fontSize: "10px",
                          color: "#8b5cf6",
                          fontWeight: 500,
                          fontFamily: FONT_FAMILY,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {item.location}
                      </div> */}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "2px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "10px",
                          padding: "1px 5px",
                          borderRadius: "8px",
                          backgroundColor: item.color,
                          color: textColor,
                          fontWeight: 500,
                          fontFamily: FONT_FAMILY,
                          minWidth: "22px",
                          textAlign: "center",
                        }}
                      >
                        {memberInitials}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <button
          style={{
            width: "100%",
            padding: "6px",
            border: "2px dashed #e5e7eb",
            backgroundColor: "transparent",
            borderRadius: "6px",
            color: "#6b7280",
            fontSize: "11px",
            cursor: "pointer",
            transition: "all 0.2s",
            marginTop: "8px",
            fontFamily: FONT_FAMILY,
            flexShrink: 0,
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#2563eb";
            e.currentTarget.style.color = "#2563eb";
            e.currentTarget.style.backgroundColor = "#eff6ff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#e5e7eb";
            e.currentTarget.style.color = "#6b7280";
            e.currentTarget.style.backgroundColor = "transparent";
          }}
          onClick={handleAddActivityClick}
          disabled={loading}
        >
          {loading ? (
            <>
              <Spin size="small" style={{ marginRight: "8px" }} />
              Loading...
            </>
          ) : (
            "+ Add activity"
          )}
        </button>
      </div>

      <AddEventModal
        visible={isAddEventModalVisible}
        onCancel={handleEventModalClose}
        onSuccess={handleEventSuccess}
        connectedAccounts={connectedAccounts}
      />
    </>
  );
};

export default WeekHighlights;