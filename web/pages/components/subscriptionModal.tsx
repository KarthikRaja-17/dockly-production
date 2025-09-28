
import React from "react";
import {
    Modal,
    Card,
    Button,
    Typography,
    Row,
    Col,
} from "antd";
import {
    CloseOutlined,
    CheckOutlined,
    StarOutlined,
} from "@ant-design/icons";
import { Zap, Shield, Smartphone } from "lucide-react";
import { DocklyLogo } from "../../app/comman";
import { useGlobalLoading } from "../../app/loadingContext";
import { addSubscription } from "../../services/subscription";

// You can import and replace this with your actual primary color
const PRIMARY_COLOR = "#667eea";

const { Title, Text } = Typography;

interface PricingModalProps {
    visible: boolean;
    onClose: () => void;
}

const PricingModal: React.FC<PricingModalProps> = ({ visible, onClose }) => {
    const { loading, setLoading } = useGlobalLoading();

    const plans = [
        {
            id: 'monthly',
            name: 'Monthly',
            description: 'Perfect for trying out Dockly',
            price: '$12.99',
            period: 'USD/month',
            features: [
                'All Hubs & Boards',
                'Unlimited connections',
                'Priority support',
                'Mobile & web access',
            ],
            buttonText: 'Subscribe',
            billingNote: 'Billed monthly',
        },
        {
            id: 'yearly',
            name: 'Yearly',
            description: 'Best value - save 25%',
            price: '$8.33',
            period: 'USD/month',
            features: [
                'All Monthly features',
                '25% discount',
                'Early access to features',
                'Premium integrations',
            ],
            buttonText: 'Subscribe',
            billingNote: 'Billed $99.99 yearly',
            popular: true,
        },
    ];
    const handleSubscribe = async (planId: string) => {
        setLoading(true)
        try {
            const response = await addSubscription({ plan_id: planId });
            if (!response || response.status !== 200) {
                throw new Error("Subscription failed");
            }
            if (response.data) {
                const { payload } = response.data;
                if (payload.checkout_url) {
                    window.location.href = payload.checkout_url
                }

            }
        } catch (error) {
            console.error("❌ Subscription failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            open={visible}
            onCancel={onClose}
            footer={null}
            width={1000}
            centered
            closable={false}
            style={{
                borderRadius: "12px",
            }}
            bodyStyle={{
                padding: 0,
                height: "550px",
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

            <div style={{ display: "flex", height: "550px" }}>
                {/* Left Section - Attractive Design */}
                <div
                    style={{
                        width: "400px",
                        padding: "32px 24px 24px 24px",
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

                    <div style={{ flex: 1, zIndex: 1, display: "flex", flexDirection: "column" }}>
                        {/* Logo placeholder - replace src with your logo */}
                        {/* <DocklyLogo marginLeftExpanded="750px" title="" /> */}

                        <div style={{ textAlign: "center", flex: 1 }}>
                            <Title
                                level={1}
                                style={{
                                    fontSize: "32px",
                                    fontWeight: 800,
                                    color: "#ffffff",
                                    marginBottom: "12px",
                                    lineHeight: "1.1",
                                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                                }}
                            >
                                Choose Your Plan
                            </Title>

                            {/* <div
                                style={{
                                    fontSize: "18px",
                                    color: "rgba(255, 255, 255, 0.9)",
                                    lineHeight: "1.4",
                                    marginBottom: "24px",
                                    fontWeight: 500,
                                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                                }}
                            >
                                Unlock the full power of
                                <div
                                    style={{
                                        fontSize: "42px",
                                        fontWeight: 900,
                                        color: "#ffffff",
                                        lineHeight: "1",
                                        margin: "6px 0",
                                    }}
                                >
                                    Dockly
                                </div>
                                with our flexible pricing
                            </div> */}

                            {/* Feature highlights */}
                            {/* <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "24px" }}>
                                <div style={{ textAlign: "center", color: "rgba(255, 255, 255, 0.9)" }}>
                                    <Zap size={20} style={{ marginBottom: "6px" }} />
                                    <div style={{ fontSize: "11px", fontWeight: 600 }}>Fast Setup</div>
                                </div>
                                <div style={{ textAlign: "center", color: "rgba(255, 255, 255, 0.9)" }}>
                                    <Shield size={20} style={{ marginBottom: "6px" }} />
                                    <div style={{ fontSize: "11px", fontWeight: 600 }}>Secure</div>
                                </div>
                                <div style={{ textAlign: "center", color: "rgba(255, 255, 255, 0.9)" }}>
                                    <Smartphone size={20} style={{ marginBottom: "6px" }} />
                                    <div style={{ fontSize: "11px", fontWeight: 600 }}>Mobile Ready</div>
                                </div>
                            </div> */}
                        </div>

                        {/* Footer with small text */}
                        <div
                            style={{
                                fontSize: "10px",
                                color: "rgba(255, 255, 255, 0.7)",
                                lineHeight: "1.4",
                                textAlign: "left",
                            }}
                        >
                            30-day money-back guarantee
                            <br />
                            Cancel anytime, no questions asked
                        </div>
                    </div>
                </div>

                {/* Right Section - Pricing Plans Side by Side */}
                <div
                    style={{
                        flex: 1,
                        padding: "24px",
                        backgroundColor: "#ffffff",
                        borderLeft: "1px solid #f0f0f0",
                    }}
                >
                    <div
                        style={{
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        {/* Header */}
                        <div
                            style={{
                                textAlign: "center",
                                marginBottom: "20px",
                            }}
                        >
                            <Title
                                level={4}
                                style={{
                                    fontSize: "22px",
                                    fontWeight: 600,
                                    color: "#1a1a1a",
                                    margin: 0,
                                }}
                            >
                                Select Your Plan
                            </Title>
                        </div>

                        {/* Plans Side by Side */}
                        <div style={{ flex: 1, display: "flex", gap: "16px" }}>
                            {plans.map((plan, index) => (
                                <div key={index} style={{ flex: 1 }}>
                                    <Card
                                        style={{
                                            borderRadius: "12px",
                                            border: plan.popular ? `2px solid ${PRIMARY_COLOR}` : "1px solid #f0f0f0",
                                            boxShadow: plan.popular ? "0 4px 20px rgba(102, 126, 234, 0.15)" : "0 2px 8px rgba(0,0,0,0.06)",
                                            position: "relative",
                                            height: "100%",
                                        }}
                                        bodyStyle={{
                                            padding: "18px",
                                            height: "100%",
                                            display: "flex",
                                            flexDirection: "column",
                                        }}
                                    >
                                        {plan.popular && (
                                            <div
                                                style={{
                                                    position: "absolute",
                                                    top: "-10px",
                                                    left: "50%",
                                                    transform: "translateX(-50%)",
                                                    backgroundColor: PRIMARY_COLOR,
                                                    color: "#ffffff",
                                                    padding: "3px 12px",
                                                    borderRadius: "20px",
                                                    fontSize: "11px",
                                                    fontWeight: 600,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "3px",
                                                }}
                                            >
                                                <StarOutlined style={{ fontSize: "10px" }} />
                                                Most Popular
                                            </div>
                                        )}

                                        <div style={{ textAlign: "center", marginBottom: "14px" }}>
                                            <Title
                                                level={5}
                                                style={{
                                                    fontSize: "18px",
                                                    fontWeight: 700,
                                                    color: "#1a1a1a",
                                                    marginBottom: "3px",
                                                }}
                                            >
                                                {plan.name}
                                            </Title>
                                            <Text
                                                style={{
                                                    fontSize: "13px",
                                                    color: "#666666",
                                                    display: "block",
                                                    marginBottom: "10px",
                                                }}
                                            >
                                                {plan.description}
                                            </Text>
                                            <div style={{ marginBottom: "6px" }}>
                                                <span
                                                    style={{
                                                        fontSize: "28px",
                                                        fontWeight: 800,
                                                        color: PRIMARY_COLOR,
                                                    }}
                                                >
                                                    {plan.price}
                                                </span>
                                                <span
                                                    style={{
                                                        fontSize: "13px",
                                                        color: "#666666",
                                                        marginLeft: "3px",
                                                    }}
                                                >
                                                    {plan.period}
                                                </span>
                                            </div>
                                            <Text
                                                style={{
                                                    fontSize: "11px",
                                                    color: "#999999",
                                                }}
                                            >
                                                {plan.billingNote}
                                            </Text>
                                        </div>

                                        <div style={{ flex: 1, marginBottom: "14px" }}>
                                            {plan.features.map((feature, idx) => (
                                                <div
                                                    key={idx}
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        marginBottom: "6px",
                                                    }}
                                                >
                                                    <CheckOutlined
                                                        style={{
                                                            color: "#52c41a",
                                                            fontSize: "12px",
                                                            marginRight: "7px",
                                                            flexShrink: 0,
                                                        }}
                                                    />
                                                    <Text
                                                        style={{
                                                            fontSize: "13px",
                                                            color: "#1a1a1a",
                                                            lineHeight: "1.3",
                                                        }}
                                                    >
                                                        {feature}
                                                    </Text>
                                                </div>
                                            ))}
                                        </div>

                                        <Button
                                            type={plan.popular ? "primary" : "default"}
                                            block
                                            size="large"
                                            onClick={() => handleSubscribe(plan.id)}
                                            style={{
                                                borderRadius: "8px",
                                                fontWeight: 600,
                                                height: "40px",
                                                fontSize: "14px",
                                                backgroundColor: plan.popular ? PRIMARY_COLOR : undefined,
                                                borderColor: plan.popular ? PRIMARY_COLOR : undefined,
                                            }}
                                        >
                                            {plan.buttonText}
                                        </Button>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default PricingModal;

