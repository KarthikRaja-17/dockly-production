"use client";

import React, { useState, useEffect } from "react";
import { Card, Space, Typography, Button, Avatar, message, Spin } from "antd";
import { getAllPlannerData } from "../../../services/planner";
import { useCurrentUser } from "../../../app/userContext";

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
}

const WeekHighlights: React.FC<WeekHighlightsProps> = ({
  familyMembers = [],
}) => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [highlights, setHighlights] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const currentUser = useCurrentUser();
  const duser = currentUser?.duser;

  const getWeekRange = () => {
    const now = new Date();
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((day + 6) % 7));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const formatDate = (d: Date) =>
      d.toLocaleString("en-US", { month: "short", day: "numeric" });

    const formatYear = (d: Date) => d.getFullYear();

    return `${formatDate(monday)} - ${formatDate(sunday)}, ${formatYear(
      sunday
    )}`;
  };

  const weekLabel = getWeekRange();

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

  useEffect(() => {
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

          const date = eventDate.getDate().toString().padStart(2, "0");
          const day = eventDate
            .toLocaleDateString("en-US", { weekday: "short" })
            .toUpperCase();

          const eventTime = event.start?.dateTime
            ? new Date(event.start.dateTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "All Day";

          const member = familyMembers?.find(
            (fm) => fm.user_id === event.user_id
          );

          return {
            date,
            day,
            title: event.summary || "Untitled Event",
            person: member?.name || currentUser?.name || "You",
            avatar:
              member?.initials || (currentUser?.name?.substring(0, 2) ?? "U"),
            avatarColor: member?.color || "#3b82f6",
            time: eventTime,
            location: event.location || "—",
          };
        });

        setHighlights(transformed);
      } catch (err) {
        console.error("Error fetching weekly planner data:", err);
        message.error("Failed to load weekly highlights");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [familyMembers]);

  const filteredHighlights =
    activeFilter === "All"
      ? highlights
      : activeFilter === "Family"
      ? highlights.filter((h) => h.person === "Whole Family")
      : highlights.filter((h) => h.person.includes(activeFilter));

  return (
    <Card
      title={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Space>
            <span style={{ fontSize: "16px" }}>⭐</span>
            <span
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "#1f2937",
                fontFamily: FONT_FAMILY,
              }}
            >
              Week Highlights
            </span>
          </Space>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ fontSize: "12px" }}>📅</span>
            <Text
              style={{
                fontSize: "11px",
                color: "#6b7280",
                fontFamily: FONT_FAMILY,
              }}
            >
              {weekLabel}
            </Text>
          </div>
        </div>
      }
      bodyStyle={{ padding: "18px" }}
      headStyle={{ padding: "16px", borderBottom: "1px solid #f3f4f6" }}
      style={{ borderRadius: "12px", border: "1px solid #e5e7eb" }}
    >
      {/* Filter Buttons */}
      {familyMembers &&
        familyMembers.filter((fm) => fm.status !== "pending" && fm.type !=="pets").length > 1 && (
          <div style={{ marginBottom: "12px" }}>
            <Space wrap size={6}>
              <Button
                size="small"
                style={{
                  backgroundColor:
                    activeFilter === "All" ? "#3b82f6" : "#f8fafc",
                  color: activeFilter === "All" ? "white" : "#64748b",
                  border: activeFilter === "All" ? "none" : "1px solid #e2e8f0",
                  borderRadius: "14px",
                  height: "24px",
                  padding: "0 10px",
                  fontWeight: 500,
                  fontSize: "11px",
                  fontFamily: FONT_FAMILY,
                }}
                onClick={() => setActiveFilter("All")}
              >
                👥 All
              </Button>

              {/* <Button
                size="small"
                style={{
                  backgroundColor:
                    activeFilter === "Family" ? "#fef2f2" : "#f8fafc",
                  color: activeFilter === "Family" ? "#dc2626" : "#64748b",
                  border:
                    activeFilter === "Family" ? "none" : "1px solid #e2e8f0",
                  borderRadius: "14px",
                  height: "24px",
                  padding: "0 10px",
                  fontWeight: 500,
                  fontSize: "11px",
                  fontFamily: FONT_FAMILY,
                }}
                onClick={() => setActiveFilter("Family")}
              >
                ❤ Family
              </Button> */}

              {(familyMembers || [])
                .filter((f) => f.status !== "pending" && f.type !=="pets")
                .map((member) => (
                  <Button
                    key={member.id}
                    size="small"
                    style={{
                      backgroundColor:
                        activeFilter === member.name
                          ? `${member.color}20`
                          : "#f8fafc",
                      color:
                        activeFilter === member.name ? member.color : "#64748b",
                      border:
                        activeFilter === member.name
                          ? "none"
                          : "1px solid #e2e8f0",
                      borderRadius: "14px",
                      height: "24px",
                      padding: "0 10px",
                      fontWeight: 500,
                      fontSize: "11px",
                      fontFamily: FONT_FAMILY,
                    }}
                    onClick={() => setActiveFilter(member.name)}
                  >
                    {member.name}
                  </Button>
                ))}
            </Space>
          </div>
        )}

      {/* Highlights List */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          minHeight: "300px",
          maxHeight: "300px",
          overflow: "auto",
          position: "relative",
        }}
      >
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <Spin tip="Loading highlights..." />
          </div>
        ) : filteredHighlights.length === 0 ? (
          <Text type="secondary" style={{ fontSize: "12px" }}>
            No events scheduled for this week.
          </Text>
        ) : (
          filteredHighlights.map((item, index) => (
            <div
              key={index}
              style={{ display: "flex", alignItems: "flex-start", gap: "15px" }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  backgroundColor: "#f8fafc",
                  borderRadius: "5px",
                  padding: "6px 6px",
                  minWidth: "40px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <Text
                  strong
                  style={{ fontSize: "14px", color: "#3b82f6", lineHeight: 1 }}
                >
                  {item.date}
                </Text>
                <Text
                  style={{ fontSize: "9px", color: "#6b7280", fontWeight: 500 }}
                >
                  {item.day}
                </Text>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ marginBottom: "4px" }}>
                  <Text
                    strong
                    style={{
                      fontSize: "13px",
                      color: "#111827",
                      display: "block",
                      lineHeight: 1.3,
                      fontFamily: FONT_FAMILY,
                    }}
                  >
                    {item.title}
                  </Text>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      marginTop: "3px",
                    }}
                  >
                    <Avatar
                      size={16}
                      style={{
                        backgroundColor: item.avatarColor,
                        fontSize: "8px",
                        fontWeight: 600,
                      }}
                    >
                      {item.avatar}
                    </Avatar>
                    <Text
                      style={{
                        fontSize: "11px",
                        color: "#6b7280",
                        fontFamily: FONT_FAMILY,
                      }}
                    >
                      {item.person}
                    </Text>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ color: "#ef4444", fontSize: "10px" }}>⏰</span>
                  <Text
                    style={{
                      fontSize: "11px",
                      color: "#6b7280",
                      fontFamily: FONT_FAMILY,
                    }}
                  >
                    {item.time} • {item.location}
                  </Text>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </Card>
  );
};

export default WeekHighlights;
