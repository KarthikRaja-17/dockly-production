import { Card, Typography, Space, Tag } from "antd";
import { CheckCircleTwoTone } from "@ant-design/icons";
import { providerColors, textColors } from "./stepOne";

const { Title, Text } = Typography;

const CalendarStepFour = (props: any) => {
  const { selectedCalendars } = props;
  return (
    <Card
      style={{
        borderRadius: 16,
        padding: 32,
        background: "#f6ffed",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        textAlign: "center",
      }}
    >
      <Space
        direction="vertical"
        size="large"
        style={{
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 300,
        }}
      >
        <CheckCircleTwoTone twoToneColor="#52c41a" style={{ fontSize: 64 }} />
        <div>
          <Title level={3} style={{ marginBottom: 0, color: "#389e0d" }}>
            Calendars Connected!
          </Title>
          <Text style={{ fontSize: 16, color: "#4b5563" }}>
            Your calendars have been successfully connected to Dockly.
          </Text>
        </div>
        <Space size="middle" wrap>
          {(selectedCalendars ?? []).map((cal: any) => (
            <Tag
              key={cal}
              style={{
                padding: "8px 12px",
                fontSize: 14,
                borderRadius: 24,
                backgroundColor: providerColors[cal],
                color: textColors[cal],
                fontWeight: "bold",
                textTransform: "capitalize",
              }}
            >
              {cal}
            </Tag>
          ))}
        </Space>
      </Space>
    </Card>
  );
};

export default CalendarStepFour;
