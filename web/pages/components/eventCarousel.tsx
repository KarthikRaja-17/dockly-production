import React, { useMemo, useRef, useState } from "react";
import { Avatar, Button, Card, Carousel, Col, Form, Input, Mentions, Modal, Popover, Row, Tag, Typography } from "antd";
import { InfoCircleOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { addGoogleCalendarEvents } from "../../services/google";
import { useGlobalLoading } from "../../app/loadingContext";
const { Title } = Typography;

type Event = {
    date: string;
    month: string;
    title: string;
    subtitle: string;
    time: string;
    duration: string;
    user: string;
};
const { Option } = Mentions;

const mentionUsers = [
    { name: "Karthik", avatar: "https://i.pravatar.cc/150?img=1", email: 'karthikrajayuvaraj16@gmail.com' },
    { name: "Asfar", avatar: "https://i.pravatar.cc/150?img=2", email: 'asfarhuda.3@gmail.com' },
    { name: "Rahul", avatar: "https://i.pravatar.cc/150?img=3", email: 'karthikraja20016@gmail.com' },
];

export const inputSuffix = (
    <Popover
        title="How to Add an Event"
        content={
            <div style={{ maxWidth: 220 }}>
                <p>📅 Enter the event name (e.g., <b>Meeting</b>, <b>Call</b>).</p>
                <p>⏰ Optionally include date/time (e.g., <b>June 10, 3 PM</b>).</p>
                <p>👨‍👩‍👧‍👦 To mention a family member, type <b>@</b> to see suggestions.</p>
                <p>✅ Press <b>Add Event</b> to add the event.</p>
            </div>
        }
        trigger="click"
    >
        <InfoCircleOutlined style={{ color: "#1890ff", cursor: "pointer", marginRight: 10 }} />
    </Popover>
);

const MentionInputWithAvatar = () => {
    const [form] = Form.useForm();
    const [value, setValue] = useState("");
    const { loading, setLoading } = useGlobalLoading();
    const [visible, setVisible] = useState(false);
    const [mentioned, setMentioned] = useState<{ name: string }[]>([]);

    const handleAddEvent = async () => {
        setLoading(true);
        const eventText = form.getFieldValue("event");

        const mentions = Array.from(eventText.matchAll(/@(\w+)/g)).map(
            (m) => (m as RegExpMatchArray)[1]
        );

        const matchedUsers = (mentionUsers || [])
            .filter((user) => mentions.includes(user.name))
            .map((user) => ({ name: user.name, email: user.email }));

        try {
            const response = await addGoogleCalendarEvents({
                matchedUsers: matchedUsers,
                event: eventText,
            });

            const { status, payload } = response.data;

            if (status) {
                form.resetFields();
                setValue("");
                window.location.reload();
            }
        } catch (err) {
            console.error("Failed to add event", err);
        }
        setLoading(false)
    };
    const mentionOptions = mentionUsers.map((user) => ({
        value: user.name,
        label: (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar size="small" src={user.avatar} />
                <span>@{user.name}</span>
            </div>
        ),
    }));
    return (
        <>
            <style>
                {`
          .ant-mentions .ant-mentions-dropdown .ant-mentions-option {
            padding: 6px 12px;
          }
          .ant-mentions .ant-mentions-dropdown .ant-mentions-option:hover {
            background-color: #f0f0f0;
          }
          .ant-mentions .ant-mentions-dropdown .ant-mentions-option span {
            font-weight: 500;
          }
          .ant-mentions .ant-mentions-measure span[data-mention],
          .ant-mentions span[data-mention] {
            color: #e87c42 !important;
            font-weight: 600;
          }
          .ant-mentions .ant-mentions-measure {
            white-space: pre-wrap;
          }
        `}
            </style>

            <Form form={form} requiredMark={false} initialValues={{ event: "" }} onFinish={handleAddEvent} >
                <Form.Item name="event" style={{ marginBottom: 16 }}>
                    <div
                        style={{
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                            border: "1px solid #d9d9d9",
                            borderRadius: 6,
                            padding: "8px 12px",
                            transition: "border-color 0.3s",
                            backgroundColor: "#fff",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                        }}
                    >
                        {inputSuffix}
                        <Mentions
                            style={{
                                flex: 1,
                                border: "none",
                                outline: "none",
                                fontSize: 15,
                                backgroundColor: "transparent",
                                minHeight: 40,
                                caretColor: "auto",
                            }}
                            value={value}
                            onChange={(val) => {
                                setValue(val);
                                form.setFieldValue("event", val);
                            }}
                            autoSize
                            prefix={["@"]}
                            placeholder="Add your event... "
                            split=" "
                            options={mentionOptions}
                        />
                    </div>
                </Form.Item>

                <Button type="primary" style={{ width: "100%", padding: "16px 10px" }} htmlType="submit" loading={loading} onClick={() => setVisible(true)}>
                    Add Event
                </Button>

            </Form>
            {/* <CalendarChoiceModal handleAddEvent={handleAddEvent} visible={visible} onCancel={() => setVisible(false)} /> */}
        </>
    );
};

type EventCarouselProps = {
    events: Event[];
};

const EventCarousel: React.FC<EventCarouselProps> = ({ events }) => {
    const carouselRef = useRef<any>(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const getTodayEvents = (rawEvents: any[]) => {
        const today = dayjs().format("YYYY-MM-DD");

        return (rawEvents || [])
            .filter((event) => {
                const eventDate = dayjs(event.start).format("YYYY-MM-DD");
                return eventDate === today;
            })
            .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
            .map((event) => {
                const start = dayjs(event.start);
                const end = dayjs(event.end);
                const durationMinutes = end.diff(start, "minute");
                const hours = Math.floor(durationMinutes / 60);
                const minutes = durationMinutes % 60;

                return {
                    date: start.format("DD"),
                    month: start.format("MMM").toUpperCase(),
                    title: event.title,
                    subtitle: event.extendedProps?.status || "",
                    time: start.format("h:mm A"),
                    duration: `${hours > 0 ? `${hours}h ` : ""}${minutes > 0 ? `${minutes}m` : ""}`.trim(),
                };
            });
    };
    const todayEvents = getTodayEvents(events);
    const totalSlides = todayEvents.length;

    return (
        <div style={{ position: "relative", maxWidth: 700, padding: "7px 15px" }}>
            <Title level={4} style={{ margin: 0, marginBottom: 20, marginTop: 15 }}>
                Upcoming Events
            </Title>

            {todayEvents.length > 0 && currentSlide > 0 && (
                <div
                    style={{
                        border: "none",
                        backgroundColor: "#f0f2f5",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                        borderRadius: "50%",
                        width: 32,
                        height: 32,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "absolute",
                        top: "35%",
                        transform: "translateY(-50%)",
                        zIndex: 1,
                        cursor: "pointer" as const,
                        left: 5,
                    }}
                    onClick={() => {
                        carouselRef.current?.prev();
                    }}
                >
                    <LeftOutlined />
                </div>
            )}

            {todayEvents.length > 0 && currentSlide < totalSlides - 1 && (
                <div
                    style={{
                        border: "none",
                        backgroundColor: "#f0f2f5",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                        borderRadius: "50%",
                        width: 32,
                        height: 32,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "absolute",
                        top: "35%",
                        transform: "translateY(-50%)",
                        zIndex: 1,
                        cursor: "pointer" as const,
                        right: 5,
                    }}
                    onClick={() => {
                        carouselRef.current?.next();
                    }}
                >
                    <RightOutlined />
                </div>
            )}

            {todayEvents.length > 0 ? (
                <Carousel
                    ref={carouselRef}
                    dots={false}
                    autoplay
                    afterChange={(current) => setCurrentSlide(current)}
                >
                    {todayEvents.map((event, idx) => (
                        <div key={idx}>
                            <div
                                style={{
                                    display: "flex",
                                    backgroundColor: "#fff",
                                    borderRadius: 12,
                                    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                                    padding: 16,
                                    alignItems: "center",
                                }}
                            >
                                <div
                                    style={{
                                        backgroundColor: "#2f54eb",
                                        color: "#fff",
                                        borderRadius: 8,
                                        padding: "10px 16px",
                                        textAlign: "center",
                                        marginRight: 16,
                                        minWidth: 60,
                                    }}
                                >
                                    <div style={{ fontSize: 12 }}>{event.month}</div>
                                    <div style={{ fontSize: 24, fontWeight: "bold" }}>{event.date}</div>
                                </div>

                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 16, fontWeight: 600 }}>{event.title}</div>
                                    <div style={{ fontSize: 14, color: "#888" }}>{event.subtitle}</div>
                                    <div style={{ fontSize: 13, marginTop: 4 }}>
                                        {event.time}{" "}
                                        <span style={{ color: "#999" }}>({event.duration})</span>
                                    </div>
                                    {/* If you want to show user, make sure to include it in getTodayEvents */}
                                    {/* <Tag color="blue" style={{ marginTop: 8 }}>
                                        {event.user}
                                    </Tag> */}
                                </div>
                            </div>
                        </div>
                    ))}
                </Carousel>
            ) : (
                <div
                    style={{
                        textAlign: "center",
                        background: "#f6ffed",
                        border: "1px solid #b7eb8f",
                        borderRadius: 12,
                        padding: 15,
                        boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                    }}
                >
                    <img
                        src="/plan.png"
                        alt="No events"
                        style={{ maxWidth: 180, marginBottom: 16 }}
                    />
                    <Title level={5} style={{ color: "#389e0d", margin: 0, marginBottom: 8 }}>
                        No Upcoming Events Today
                    </Title>
                    <p style={{ fontSize: 14, color: "#555", marginBottom: 0 }}>
                        “The future depends on what you do today.” – Mahatma Gandhi
                    </p>
                </div>
            )}

            {todayEvents.length > 0 && (
                <div
                    style={{
                        textAlign: "center",
                        marginTop: 20,
                        fontWeight: "bold",
                        fontSize: 16,
                        marginBottom: 20,
                    }}
                >
                    {currentSlide + 1} / {totalSlides}
                </div>
            )}

            <div style={{ marginTop: 15 }}>
                <MentionInputWithAvatar />
            </div>

        </div>
    );
};

export default EventCarousel;


const CalendarChoiceModal = ({ visible, onCancel, handleAddEvent }: any) => {
    return (
        <Modal
            open={visible}
            onCancel={onCancel}
            footer={null}
            centered
            width={750}
            style={{
                borderRadius: 12,
                backgroundImage: 'url("https://www.transparenttextures.com/patterns/clean-textile.png")',
                backgroundSize: "cover",
                padding: 0,
            }}
            bodyStyle={{
                padding: 40,
                background: "rgba(255, 255, 255, 0.95)",
                borderRadius: 12,
            }}
        >
            <div style={{ textAlign: "center", marginBottom: 32 }}>
                <Typography.Title level={3} style={{ color: "#333", marginBottom: 4 }}>
                    Where do you want to save this event?
                </Typography.Title>
                <Typography.Text style={{ fontSize: 16, color: "#666" }}>
                    Choose your preferred calendar to sync with
                </Typography.Text>
            </div>

            <Row gutter={24} justify="center">
                <Col span={8}>
                    <Card
                        hoverable
                        onClick={() => handleAddEvent()}
                        style={{
                            borderRadius: 12,
                            background: "#fef9e7",
                            textAlign: "center",
                            padding: 24,
                            border: "1px solid #f5d76e",
                            transition: "all 0.3s",
                        }}
                    >
                        <div style={{ marginBottom: 16 }}>
                            <img
                                src="https://cdn-icons-png.flaticon.com/512/4712/4712100.png"
                                alt="Dockly"
                                style={{ width: 64, height: 64 }}
                            />
                        </div>
                        <Typography.Title level={4} style={{ color: "#b27d00", marginBottom: 8 }}>
                            Dockly Calendar
                        </Typography.Title>
                        <Typography.Text style={{ color: "#7f6000" }}>
                            Save to your internal Dockly calendar
                        </Typography.Text>
                    </Card>
                </Col>

                <Col span={8}>
                    <Card
                        hoverable
                        onClick={() => console.log("Google Calendar Selected")}
                        style={{
                            borderRadius: 12,
                            background: "#e3f2fd",
                            textAlign: "center",
                            padding: 24,
                            border: "1px solid #90caf9",
                            transition: "all 0.3s",
                        }}
                    >
                        <div style={{ marginBottom: 16 }}>
                            <img
                                src="https://cdn-icons-png.flaticon.com/512/270/270798.png"
                                alt="Google Calendar"
                                style={{ width: 64, height: 64 }}
                            />
                        </div>
                        <Typography.Title level={4} style={{ color: "#1976d2", marginBottom: 8 }}>
                            Google Calendar
                        </Typography.Title>
                        <Typography.Text style={{ color: "#0d47a1" }}>
                            Sync with your Google Calendar account
                        </Typography.Text>
                    </Card>
                </Col>

                <Col span={8}>
                    <Card
                        hoverable
                        onClick={() => console.log("Both Selected")}
                        style={{
                            borderRadius: 12,
                            background: "#e8f5e9",
                            textAlign: "center",
                            padding: 24,
                            border: "1px solid #81c784",
                            transition: "all 0.3s",
                        }}
                    >
                        <div style={{ marginBottom: 16 }}>
                            <img
                                src="https://cdn-icons-png.flaticon.com/512/535/535239.png"
                                alt="Both"
                                style={{ width: 64, height: 64 }}
                            />
                        </div>
                        <Typography.Title level={4} style={{ color: "#388e3c", marginBottom: 8 }}>
                            Both
                        </Typography.Title>
                        <Typography.Text style={{ color: "#1b5e20" }}>
                            Sync with Dockly and Google Calendar
                        </Typography.Text>
                    </Card>
                </Col>
            </Row>
        </Modal>
    );
};
