import React, { useState } from "react";
import { Drawer, Button, Avatar, Typography, Divider } from "antd";
import {
    RobotOutlined,
    CloseOutlined,
    ExpandOutlined,
    CompressOutlined,
    MinusOutlined,
} from "@ant-design/icons";
import { FONT_FAMILY, PRIMARY_COLOR } from "../../../app/comman";

const { Text, Title } = Typography;

interface HelpChatDrawerProps {
    visible: boolean;
    onClose: () => void;
}

const HelpChatDrawer: React.FC<HelpChatDrawerProps> = ({ visible, onClose }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [messages, setMessages] = useState([
        { id: 1, sender: "bot", text: "Hi! We're here to help!", time: "now" },
        { id: 2, sender: "bot", text: "Please select a topic below to get started", time: "now" },
    ]);

    const helpTopics = [
        "About Dockly",
        "Dashboard Guides and How-To",
        "Account Management",
        "File Organization",
        "Sharing and Permissions",
        "Troubleshooting",
        "Feature Request",
        "Report an Issue",
        "Something Else",
    ];

    const handleTopicSelect = (topic: string) => {
        setSelectedTopic(topic);
        const newMessage = {
            id: messages.length + 1,
            sender: "user" as const,
            text: topic,
            time: "now",
        };

        const botResponse = {
            id: messages.length + 2,
            sender: "bot" as const,
            text: `Great! I can help you with ${topic}. Let me connect you with the right resources or a support specialist.`,
            time: "now",
        };

        setMessages((prev) => [...prev, newMessage, botResponse]);
    };

    return (
        <>
            <Drawer
                title={
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <Avatar
                            size={40}
                            icon={<RobotOutlined />}
                            style={{
                                backgroundColor: "rgba(255,255,255,0.25)",
                                color: "white",
                                border: "2px solid rgba(255,255,255,0.3)",
                            }}
                        />
                        <div>
                            <Title
                                level={5}
                                style={{
                                    margin: 0,
                                    color: "white",
                                    fontFamily: FONT_FAMILY,
                                    fontSize: "18px",
                                    fontWeight: 600,
                                }}
                            >
                                Dockly Support
                            </Title>
                            <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: "13px" }}>
                                Instant answers + live support
                            </Text>
                        </div>
                    </div>
                }
                placement="right"
                closable={false}
                onClose={onClose}
                open={visible}
                width={isExpanded ? 520 : 400}
                styles={{
                    header: {
                        background: PRIMARY_COLOR,
                        padding: "16px 20px",
                    },
                    body: {
                        padding: 0,
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                    },
                }}
                extra={
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Button
                            type="text"
                            size="small"
                            icon={<MinusOutlined />}
                            style={{ color: "white", fontSize: "16px" }}
                        />
                        <Button
                            type="text"
                            size="small"
                            icon={isExpanded ? <CompressOutlined /> : <ExpandOutlined />}
                            onClick={() => setIsExpanded(!isExpanded)}
                            style={{ color: "white", fontSize: "16px" }}
                        />
                        <Button
                            type="text"
                            size="small"
                            icon={<CloseOutlined />}
                            onClick={onClose}
                            style={{ color: "white", fontSize: "16px" }}
                        />
                    </div>
                }
            >
                {/* Consent Notice */}
                <div
                    style={{
                        background: "#fafafa",
                        padding: "12px 20px",
                        borderBottom: "1px solid #eee",
                        fontSize: "12px",
                        color: "#666",
                    }}
                >
                    You consent to the monitoring and recording of this chat by Dockly for service improvement purposes.
                </div>

                {/* Chat Window */}
                <div
                    style={{
                        flex: 1,
                        overflowY: "auto",
                        padding: "20px",
                        background: "linear-gradient(180deg, #ffffff 0%, #fafafa 100%)",
                    }}
                >
                    {messages.map((msg) => (
                        <div key={msg.id} style={{ marginBottom: "18px" }}>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: "12px",
                                    flexDirection: msg.sender === "user" ? "row-reverse" : "row",
                                }}
                            >
                                {msg.sender === "bot" && (
                                    <Avatar size={30} icon={<RobotOutlined />} style={{ backgroundColor: "#f0f0f0", color: "#666" }} />
                                )}
                                <div
                                    style={{
                                        background: msg.sender === "user" ? PRIMARY_COLOR : "#f5f5f5",
                                        color: msg.sender === "user" ? "white" : "#333",
                                        padding: "12px 16px",
                                        borderRadius: "18px",
                                        maxWidth: "75%",
                                        fontFamily: FONT_FAMILY,
                                        fontSize: "14px",
                                        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                                    }}
                                >
                                    {msg.text}
                                </div>
                            </div>
                            <Text
                                type="secondary"
                                style={{
                                    display: "block",
                                    marginTop: "6px",
                                    fontSize: "11px",
                                    textAlign: msg.sender === "user" ? "right" : "left",
                                    marginLeft: msg.sender === "bot" ? "36px" : "0",
                                }}
                            >
                                {msg.time}
                            </Text>
                        </div>
                    ))}

                    {/* Topic Buttons */}
                    {!selectedTopic && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
                            {helpTopics.map((topic) => (
                                <Button
                                    key={topic}
                                    block
                                    onClick={() => handleTopicSelect(topic)}
                                    style={{
                                        borderRadius: "22px",
                                        border: `1px solid ${PRIMARY_COLOR}40`,
                                        color: PRIMARY_COLOR,
                                        background: "white",
                                        fontFamily: FONT_FAMILY,
                                        fontSize: "14px",
                                        height: "42px",
                                        transition: "all 0.25s ease",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = `${PRIMARY_COLOR}10`;
                                        e.currentTarget.style.transform = "translateY(-1px)";
                                        e.currentTarget.style.boxShadow = `0 4px 10px ${PRIMARY_COLOR}20`;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = "white";
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = "none";
                                    }}
                                >
                                    {topic}
                                </Button>
                            ))}
                        </div>
                    )}
                </div>
            </Drawer>
        </>
    );
};

export default HelpChatDrawer;
