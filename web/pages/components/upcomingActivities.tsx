import { Badge, Card, Modal, Typography, Button } from "antd";
import { useState } from "react";
import dayjs from "dayjs";
import { PushpinFilled, PushpinOutlined } from "@ant-design/icons";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const { Title, Text } = Typography;

const transformActivities = (events: any = []) => {
    return events?.map((event: any) => {
        const startDate = dayjs(event.start);
        const endDate = dayjs(event.end);
        const detail = event.allDay
            ? "All Day"
            : `${startDate.format("h:mm A")} - ${endDate.format("h:mm A")}`;

        return {
            id: event.id,
            title: event.title,
            source_email: event.source_email || "",
            date: startDate.format("DD"),
            month: startDate.format("MMM"),
            detail,
        };
    });
};

const ActivityList = ({
    activities,
    accountColor,
    pinned,
    onTogglePin,
    showPin = false,
}: {
    activities: any[];
    accountColor?: { [email: string]: string };
    pinned?: string[];
    onTogglePin?: (id: string) => void;
    showPin?: boolean;
}) =>
    <div style={{ marginTop: 16 }}>
        {activities.map((activity) => {
            const email = activity.source_email;
            const provider = activity.provider?.toLowerCase() || "google"; // fallback to google if missing
            const key = `${provider}:${email}`;
            const color = (accountColor?.[key]) || "#888";
            const isPinned = pinned?.includes(activity.id);

            return (
                <div
                    key={activity.id}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "12px 0",
                        borderBottom: "1px solid #f0f0f0",
                        justifyContent: "space-between",
                    }}
                >
                    <div style={{ display: "flex", gap: 12, flex: 1 }}>
                        <div
                            style={{
                                backgroundColor: "#e0f2fe",
                                borderRadius: 8,
                                textAlign: "center",
                                padding: "6px 10px",
                                width: 48,
                            }}
                        >
                            <Text strong style={{ fontSize: 16, display: "block" }}>
                                {activity.date}
                            </Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                {activity.month}
                            </Text>
                        </div>

                        <div>
                            <Text style={{ fontSize: 15, fontWeight: 500, display: "block" }}>
                                {activity.title}
                            </Text>
                            <Text type="secondary" style={{ fontSize: 13, display: "block" }}>
                                {activity.detail}
                            </Text>
                            {activity.source_email && (
                                <Badge color={color} text={activity.source_email} />
                            )}
                        </div>
                    </div>

                    {showPin && (
                        <div
                            style={{ cursor: "pointer" }}
                            onClick={() => onTogglePin?.(activity.id)}
                        >
                            {isPinned ? (
                                <PushpinFilled style={{ color: "#f59e0b", fontSize: 18 }} />
                            ) : (
                                <PushpinOutlined style={{ color: "#999", fontSize: 18 }} />
                            )}
                        </div>
                    )}
                </div>
            );
        })}
    </div>


const UpcomingActivities = ({ googleEvents, accountColor, width = 380 }: any) => {
    const activities = transformActivities(googleEvents);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pinned, setPinned] = useState<string[]>([]);

    const togglePin = (id: string) => {
        setPinned((prev) => {
            if (prev.includes(id)) return prev.filter((item) => item !== id);
            if (prev.length >= 3) return prev;
            return [...prev, id];
        });
    };

    const pinnedActivities = activities.filter((a: any) => pinned.includes(a.id));
    const unpinnedActivities = activities.filter(
        (a: any) => !pinned.includes(a.id)
    );
    const firstThree = [...pinnedActivities, ...unpinnedActivities].slice(0, 3);

    return (
        <>
            <Card
                style={{
                    borderRadius: 16,
                    width: width,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
            >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Title level={4} style={{ margin: 0 }}>
                        Upcoming Activities
                    </Title>
                    <Text
                        style={{ color: "#2563eb", cursor: "pointer" }}
                        onClick={() => setIsModalOpen(true)}
                    >
                        View All
                    </Text>
                </div>

                {firstThree.length > 0 ? (
                    <ActivityList
                        activities={firstThree}
                        accountColor={accountColor}
                        pinned={pinned}
                        onTogglePin={togglePin}
                        showPin
                    />
                ) : (
                    <div
                        style={{
                            textAlign: "center",
                            padding: "30px 0 10px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "#e6f0ff",
                            border: "1px solid #1677ff",
                            borderRadius: 12,
                            marginTop: 10
                        }}
                    >
                        {/* <DotLottieReact
                            src="https://lottie.host/7f7ad052-1118-4202-abaa-8030b51775fd/onSaBJbTRK.lottie"
                            loop
                            autoplay
                        /> */}
                        <div style={{ width: 400, height: 'auto' }}>
                            <DotLottieReact
                                src="https://lottie.host/7f7ad052-1118-4202-abaa-8030b51775fd/onSaBJbTRK.lottie"
                                loop
                                autoplay
                            />
                        </div>

                        <Title level={5} style={{ marginTop: 16 }}>
                            No Upcoming Activities
                        </Title>
                        <Text type="secondary">
                            Looks like your schedule is clear. Time to plan something fun!
                        </Text>
                    </div>
                )}
            </Card>

            <Modal
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                title={
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Title level={4} style={{ margin: 0 }}>Upcoming Activities</Title>
                    </div>
                }
                width={700}
                styles={{
                    body: {
                        padding: 0,
                        background: "#fff",
                        borderRadius: 8,
                        maxHeight: "70vh",
                        overflow: "hidden",
                    },
                }}
            >
                {activities.length > 0 ? (
                    <div style={{ padding: 24, maxHeight: "60vh", overflowY: "auto" }}>
                        <ActivityList
                            activities={activities}
                            accountColor={accountColor}
                            pinned={pinned}
                            onTogglePin={togglePin}
                            showPin
                        />
                    </div>
                ) : (
                    <div
                        style={{
                            textAlign: "center",
                            padding: "40px 20px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <DotLottieReact
                            src="https://lottie.host/7f7ad052-1118-4202-abaa-8030b51775fd/onSaBJbTRK.lottie"
                            loop
                            autoplay
                            style={{ width: 200 }}
                        />
                        <Title level={5} style={{ marginTop: 16 }}>No Upcoming Activities</Title>
                        <Text type="secondary">Plan and pin your schedule to see it here.</Text>
                    </div>
                )}
            </Modal>
        </>
    );
};

export default UpcomingActivities;
