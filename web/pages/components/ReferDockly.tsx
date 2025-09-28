import React, { useState } from "react";
import {
  Modal,
  Card,
  Button,
  Input,
  Typography,
  Row,
  Col,
  Progress,
  message,
} from "antd";
import {
  CopyOutlined,
  ReloadOutlined,
  MessageOutlined,
  MailOutlined,
  FacebookOutlined,
  LinkedinOutlined,
  TwitterOutlined,
  InstagramOutlined,
  CloseOutlined,
  RightOutlined,
  WhatsAppOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { Users, Gift, Zap } from "lucide-react";
import { DocklyLogo, PRIMARY_COLOR } from "../../app/comman";
import { X } from "lucide-react";

const { Title, Text } = Typography;

interface ReferralModalProps {
  visible: boolean;
  onClose: () => void;
}

const ReferralModal: React.FC<ReferralModalProps> = ({ visible, onClose }) => {
  const [invitationCode, setInvitationCode] = useState("Dockly");
  const [invitationLink, setInvitationLink] = useState(
    "https://dockly.app/signup?ref=Dockly"
  );
  const [referralCount, setReferralCount] = useState(3);
  const [loading, setLoading] = useState(false);
  const [showTrackingView, setShowTrackingView] = useState(false);

  const generateNewCode = () => {
    setLoading(true);
    setTimeout(() => {
      const newCode = Math.random().toString(36).substring(2, 8);
      setInvitationCode(newCode);
      setInvitationLink(`https://dockly.app/signup?ref=${newCode}`);
      setLoading(false);
    }, 1000);
  };

  const copyToClipboard = async (text: string, type: "Code" | "Link") => {
    try {
      await navigator.clipboard.writeText(text);
      message.success(`${type} copied!`, 1.5);
    } catch (err) {
      console.error("Failed to copy: ", err);
      message.error(`Failed to copy ${type}`);
    }
  };

  const milestones = [
    { count: 5, reward: "$50" },
    { count: 10, reward: "$120" },
    { count: 25, reward: "$350" },
    { count: 50, reward: "$800" },
    { count: 100, reward: "$2000" },
  ];

  const nextMilestone = milestones.find((m) => referralCount < m.count);
  const progressPercent = nextMilestone
    ? (referralCount / nextMilestone.count) * 100
    : 100;

  const handleTrackReferralsClick = () => {
    setShowTrackingView(true);
  };

  const handleBackToShare = () => {
    setShowTrackingView(false);
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={900}
      centered
      closable={false}
      style={{
        borderRadius: "12px",
      }}
      bodyStyle={{
        padding: 0,
        height: "600px",
        overflow: "hidden",
      }}
    >
      {/* Custom Close Button */}
      <Button
        type="text"
        icon={<CloseOutlined />}
        onClick={onClose}
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          zIndex: 10,
          padding: "4px",
          width: "32px",
          height: "32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          backgroundColor: "#ffffff",
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        }}
      />

      <div style={{ display: "flex", height: "600px" }}>
        {/* Left Section - Dynamic Content */}
        <div
          style={{
            flex: 1,
            padding: "32px 24px 16px 24px",
            backgroundColor: PRIMARY_COLOR,
            display: "flex",
            flexDirection: "column",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Background decoration */}
          <div
            style={{
              position: "absolute",
              top: "-50px",
              right: "-50px",
              width: "300px",
              height: "300px",
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "50%",
              zIndex: 0,
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-30px",
              left: "-30px",
              width: "200px",
              height: "200px",
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "50%",
              zIndex: 0,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "-100px",
              width: "250px",
              height: "250px",
              background: "rgba(255, 255, 255, 0.03)",
              borderRadius: "50%",
              zIndex: 0,
            }}
          />

          {/* Back Button for Tracking View */}
          {showTrackingView && (
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={handleBackToShare}
              style={{
                alignSelf: "flex-start",
                marginBottom: "20px",
                padding: "8px 16px",
                display: "flex",
                alignItems: "center",
                color: "#ffffff",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                borderRadius: "20px",
                border: "none",
                zIndex: 1,
                fontSize: "14px",
                fontWeight: 500,
              }}
            >
              Back to Share
            </Button>
          )}

          {!showTrackingView ? (
            // Default Share View
            <div
              style={{
                flex: 1,
                zIndex: 1,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Logo placeholder - replace src with your logo */}
              <div style={{ marginBottom: "24px", textAlign: "center" }}>
                <DocklyLogo marginLeftExpanded="145px" title="" size={70} />
              </div>

              <div style={{ textAlign: "center", flex: 1 }}>
                <Title
                  level={1}
                  style={{
                    fontSize: "36px",
                    fontWeight: 800,
                    color: "#ffffff",
                    marginBottom: "16px",
                    lineHeight: "1.1",
                    fontFamily:
                      "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  }}
                >
                  Earn Together
                </Title>

                <div
                  style={{
                    fontSize: "20px",
                    color: "rgba(255, 255, 255, 0.9)",
                    lineHeight: "1.4",
                    marginBottom: "32px",
                    fontWeight: 500,
                    fontFamily:
                      "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  }}
                >
                  Both you & your friend get
                  <div
                    style={{
                      fontSize: "48px",
                      fontWeight: 900,
                      color: "#ffffff",
                      lineHeight: "1",
                      margin: "8px 0",
                    }}
                  >
                    25% OFF
                  </div>
                  when they join Dockly
                </div>

                {/* Feature highlights */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-around",
                    marginBottom: "32px",
                  }}
                >
                  <div
                    style={{
                      textAlign: "center",
                      color: "rgba(255, 255, 255, 0.9)",
                    }}
                  >
                    <Users size={24} style={{ marginBottom: "8px" }} />
                    <div style={{ fontSize: "12px", fontWeight: 600 }}>
                      Invite Friends
                    </div>
                  </div>
                  <div
                    style={{
                      textAlign: "center",
                      color: "rgba(255, 255, 255, 0.9)",
                    }}
                  >
                    <Gift size={24} style={{ marginBottom: "8px" }} />
                    <div style={{ fontSize: "12px", fontWeight: 600 }}>
                      Get Rewards
                    </div>
                  </div>
                  <div
                    style={{
                      textAlign: "center",
                      color: "rgba(255, 255, 255, 0.9)",
                    }}
                  >
                    <Zap size={24} style={{ marginBottom: "8px" }} />
                    <div style={{ fontSize: "12px", fontWeight: 600 }}>
                      Save More
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer with small text */}
              <div
                style={{
                  fontSize: "10px",
                  color: "rgba(255, 255, 255, 0.7)",
                  lineHeight: "1.4",
                  marginTop: "auto",
                  textAlign: "left",
                }}
              >
                * Capped at 100%
                <br />* Receive only when they pay their Membership
              </div>
            </div>
          ) : (
            // Tracking View
            <div
              style={{
                flex: 1,
                zIndex: 1,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Title
                level={2}
                style={{
                  fontSize: "28px",
                  fontWeight: 700,
                  color: "#ffffff",
                  marginBottom: "12px",
                  lineHeight: "1.2",
                  fontFamily:
                    "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                }}
              >
                Your Progress
              </Title>

              <Text
                style={{
                  fontSize: "16px",
                  color: "rgba(255, 255, 255, 0.9)",
                  lineHeight: "1.5",
                  marginBottom: "24px",
                  display: "block",
                }}
              >
                Track your referrals and milestones
              </Text>

              {nextMilestone && (
                <div style={{ marginBottom: "24px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: "12px",
                        color: "rgba(255, 255, 255, 0.8)",
                      }}
                    >
                      Next reward: {nextMilestone.reward}
                    </Text>
                    <Text
                      style={{
                        fontSize: "12px",
                        color: "rgba(255, 255, 255, 0.8)",
                        fontWeight: 500,
                      }}
                    >
                      {referralCount}/{nextMilestone.count}
                    </Text>
                  </div>
                  <Progress
                    percent={progressPercent}
                    strokeColor="#ffffff"
                    trailColor="rgba(255, 255, 255, 0.2)"
                    strokeWidth={8}
                    showInfo={false}
                    style={{ marginBottom: 0 }}
                  />
                </div>
              )}

              <Row gutter={[8, 8]} style={{ flex: 1 }}>
                {milestones.map((m, idx) => (
                  <Col span={12} key={idx}>
                    <div
                      style={{
                        position: "relative",
                        padding: "12px 8px",
                        borderRadius: "8px",
                        textAlign: "center",
                        border:
                          referralCount >= m.count
                            ? "2px solid #ffffff"
                            : "2px solid rgba(255, 255, 255, 0.3)",
                        backgroundColor:
                          referralCount >= m.count
                            ? "rgba(255, 255, 255, 0.2)"
                            : "rgba(255, 255, 255, 0.1)",
                        transition: "all 0.3s ease",
                      }}
                    >
                      {referralCount >= m.count && (
                        <div
                          style={{
                            position: "absolute",
                            top: "-8px",
                            right: "-8px",
                            width: "20px",
                            height: "20px",
                            backgroundColor: "#ffffff",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            color: "#667eea",
                            fontWeight: "bold",
                          }}
                        >
                          ✓
                        </div>
                      )}
                      <div
                        style={{
                          fontSize: "18px",
                          fontWeight: "bold",
                          color:
                            referralCount >= m.count
                              ? "#ffffff"
                              : "rgba(255, 255, 255, 0.6)",
                          marginBottom: "4px",
                        }}
                      >
                        {m.count}
                      </div>
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: 600,
                          color:
                            referralCount >= m.count
                              ? "#ffffff"
                              : "rgba(255, 255, 255, 0.6)",
                        }}
                      >
                        {m.reward}
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>

              {/* Footer with small text */}
              <div
                style={{
                  fontSize: "10px",
                  color: "rgba(255, 255, 255, 0.7)",
                  lineHeight: "1.4",
                  marginTop: "16px",
                  textAlign: "left",
                }}
              >
                Capped at 100%
                <br />
                Recover only when they pay their Membership
              </div>
            </div>
          )}
        </div>

        {/* Right Section - Referral Card */}
        <div
          style={{
            flex: 1,
            padding: "24px",
            backgroundColor: "#ffffff",
            borderLeft: "1px solid #f0f0f0",
          }}
        >
          <Card
            style={{
              height: "100%",
              borderRadius: "12px",
              border: "none",
              boxShadow: "none",
            }}
            bodyStyle={{
              padding: "16px",
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                paddingBottom: "16px",
                marginBottom: "16px",
              }}
            >
              <Title
                level={4}
                style={{
                  fontSize: "24px",
                  fontWeight: 600,
                  color: "#1a1a1a",
                  margin: 0,
                  textAlign: "center",
                }}
              >
                Share Dockly with Friends
              </Title>
            </div>

            {/* Content */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              {/* Invitation Code */}
              <div style={{ marginBottom: "16px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "8px",
                  }}
                >
                  <Text
                    style={{
                      fontSize: "12px",
                      fontWeight: 500,
                      color: "#666666",
                    }}
                  >
                    Invitation Code
                  </Text>
                  <Button
                    type="text"
                    icon={<ReloadOutlined />}
                    onClick={generateNewCode}
                    loading={loading}
                    style={{
                      padding: "4px",
                      width: "20px",
                      height: "20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  />
                </div>
                <Input
                  value={invitationCode}
                  readOnly
                  suffix={
                    <CopyOutlined
                      onClick={() => copyToClipboard(invitationCode, "Code")}
                      style={{
                        color: "#999999",
                        cursor: "pointer",
                        fontSize: "16px",
                      }}
                    />
                  }
                  style={{
                    borderRadius: "6px",
                    fontWeight: 600,
                    backgroundColor: "#fafafa",
                  }}
                />
              </div>

              {/* Invitation Link */}
              <div style={{ marginBottom: "16px" }}>
                <Text
                  style={{
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "#666666",
                    marginBottom: "8px",
                    display: "block",
                  }}
                >
                  Invitation Link
                </Text>
                <Input
                  value={invitationLink}
                  readOnly
                  suffix={
                    <CopyOutlined
                      onClick={() => copyToClipboard(invitationLink, "Link")}
                      style={{
                        color: "#999999",
                        cursor: "pointer",
                        fontSize: "16px",
                      }}
                    />
                  }
                  style={{
                    borderRadius: "6px",
                    backgroundColor: "#fafafa",
                    fontSize: "14px",
                  }}
                />
              </div>

              {/* Share Options */}
              <div style={{ flex: 1 }}>
                {/* Share via text */}
                <Button
                  block
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    height: "auto",
                    backgroundColor: "#fafafa",
                    border: "1px solid #f0f0f0",
                    borderRadius: "8px",
                    marginBottom: "8px",
                    textAlign: "left",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        backgroundColor: "#52c41a",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: "12px",
                      }}
                    >
                      <MessageOutlined
                        style={{ color: "#ffffff", fontSize: "16px" }}
                      />
                    </div>
                    <Text style={{ color: "#1a1a1a", fontWeight: 500 }}>
                      Share via text
                    </Text>
                  </div>
                  <RightOutlined
                    style={{ color: "#cccccc", fontSize: "16px" }}
                  />
                </Button>

                {/* Share via email */}
                <Button
                  block
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    height: "auto",
                    backgroundColor: "#fafafa",
                    border: "1px solid #f0f0f0",
                    borderRadius: "8px",
                    marginBottom: "12px",
                    textAlign: "left",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        backgroundColor: "#1a1a1a",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: "12px",
                      }}
                    >
                      <MailOutlined
                        style={{ color: "#ffffff", fontSize: "16px" }}
                      />
                    </div>
                    <Text style={{ color: "#1a1a1a", fontWeight: 500 }}>
                      Share via email
                    </Text>
                  </div>
                  <RightOutlined
                    style={{ color: "#cccccc", fontSize: "16px" }}
                  />
                </Button>

                {/* Social Media Icons */}
                <Row gutter={[12, 12]} style={{ marginBottom: "16px" }}>
                  <Col span={8}>
                    <Button
                      block
                      style={{
                        height: "48px",
                        backgroundColor: "#fafafa",
                        border: "1px solid #f0f0f0",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          width: "24px",
                          height: "24px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          fill="#1877F2" // Facebook blue
                          viewBox="0 0 24 24"
                        >
                          <path d="M22 12a10 10 0 1 0-11.5 9.9v-7h-2v-2.9h2v-2.2c0-2 1.2-3.1 3-3.1.9 0 1.8.16 1.8.16v2h-1c-1 0-1.3.63-1.3 1.3v1.9h2.3l-.37 2.9h-2v7A10 10 0 0 0 22 12z" />
                        </svg>
                      </div>
                    </Button>
                  </Col>
                  <Col span={8}>
                    <Button
                      block
                      style={{
                        height: "48px",
                        backgroundColor: "#fafafa",
                        border: "1px solid #f0f0f0",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          width: "24px",
                          height: "24px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          fill="#000000" // TikTok black
                          viewBox="0 0 24 24"
                        >
                          <path d="M16.5 2h2.4a6.5 6.5 0 0 0 1.8 4.4 6.6 6.6 0 0 0 3.3 1.8v2.5a9 9 0 0 1-5.1-1.5v7.6a6.9 6.9 0 1 1-6.9-6.9c.2 0 .5 0 .7.1v2.7a4.3 4.3 0 1 0 3 4.1V2z" />
                        </svg>
                      </div>
                    </Button>
                  </Col>
                  <Col span={8}>
                    <Button
                      block
                      style={{
                        height: "48px",
                        backgroundColor: "#fafafa",
                        border: "1px solid #f0f0f0",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {/* <X size={24} color="#1a1a1a" />   */}
                      <div
                        style={{
                          width: "24px",
                          height: "24px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          fill="#1a1a1a"
                          viewBox="0 0 24 24"
                        >
                          <path d="M18.244 2H21.5l-7.5 8.568L22 22h-5.856l-4.544-6.085L7.5 22H4.244l7.944-9.079L2 2h5.856l4.15 5.561L18.244 2z" />
                        </svg>
                      </div>
                    </Button>
                  </Col>
                </Row>

                <Row gutter={[12, 12]} style={{ marginBottom: "16px" }}>
                  <Col span={12}>
                    <Button
                      block
                      style={{
                        height: "48px",
                        backgroundColor: "#fafafa",
                        border: "1px solid #f0f0f0",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          width: "24px",
                          height: "24px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          fill="#E1306C" // Instagram pink-purple
                          viewBox="0 0 24 24"
                        >
                          <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm4.75-2a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5z" />
                        </svg>
                      </div>
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Button
                      block
                      style={{
                        height: "48px",
                        backgroundColor: "#fafafa",
                        border: "1px solid #f0f0f0",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          width: "24px",
                          height: "24px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          fill="#25D366" // WhatsApp green
                          viewBox="0 0 24 24"
                        >
                          <path d="M12.04 2C6.52 2 2 6.28 2 11.53c0 2.05.68 3.94 1.82 5.47L2 22l5.21-1.74a10.36 10.36 0 0 0 4.83 1.2c5.52 0 10.04-4.28 10.04-9.53S17.56 2 12.04 2zm0 17c-1.6 0-3.1-.47-4.36-1.28l-.31-.2-3.09 1.03 1.01-3.01-.2-.32A7.57 7.57 0 0 1 4.5 11.5c0-4.06 3.37-7.37 7.54-7.37 4.17 0 7.54 3.3 7.54 7.37S16.21 19 12.04 19zm4.3-5.55c-.23-.12-1.34-.66-1.54-.74-.2-.08-.34-.12-.49.12-.15.23-.56.74-.69.89-.13.15-.25.17-.48.05-.23-.12-.95-.35-1.8-1.1-.66-.58-1.1-1.3-1.22-1.52-.13-.23-.01-.35.11-.47.12-.12.28-.3.42-.45.14-.15.18-.25.28-.42.09-.17.04-.32-.02-.44-.05-.12-.49-1.18-.67-1.62-.18-.44-.36-.38-.49-.39h-.42c-.14 0-.37.05-.57.25s-.75.73-.75 1.78.77 2.07.88 2.21c.11.15 1.52 2.3 3.68 3.13.51.2.9.32 1.21.41.51.16.97.14 1.34.09.41-.06 1.34-.55 1.53-1.09.19-.54.19-1 .13-1.1-.05-.1-.21-.16-.44-.28z" />
                        </svg>
                      </div>
                    </Button>
                  </Col>
                </Row>

                {/* Links */}
                <div style={{ textAlign: "center" }}>
                  <Button
                    type="link"
                    style={{
                      padding: 0,
                      fontSize: "12px",
                      color: "#1890ff",
                      marginBottom: "8px",
                      display: "block",
                      width: "100%",
                    }}
                  >
                    Learn more
                  </Button>
                  <Button
                    type="link"
                    onClick={handleTrackReferralsClick}
                    style={{
                      padding: 0,
                      fontSize: "12px",
                      color: "#1890ff",
                      display: "block",
                      width: "100%",
                    }}
                  >
                    {/* Track your referrals */}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Modal>
  );
};

export default ReferralModal;
