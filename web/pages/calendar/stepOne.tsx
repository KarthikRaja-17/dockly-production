import { Button, Card, Typography, Row, Col } from "antd";

const { Title, Paragraph, Text } = Typography;

const calendarProviders = [
  "Google",
  "Apple",
  "Outlook",
  "Yahoo",
];

export const providerColors: { [key: string]: string } = {
  "Google": "#F3F4F6",
  "Apple": "#111827",
  "Outlook": "#2563EB",
  "Yahoo": "#8B5CF6",
};

export const textColors: { [key: string]: string } = {
  "Google": "#DC2626",
  "Apple": "#FFFFFF",
  "Outlook": "#FFFFFF",
  "Yahoo": "#FFFFFF",
};
interface CalendarStepOneProps {
  setStep: (step: number) => void;
  selectedCalendars: string[];
  setSelectedCalendars: React.Dispatch<React.SetStateAction<string[]>>;
}

const CalendarStepOne: React.FC<CalendarStepOneProps> = ({
  setStep,
  selectedCalendars = [],
  setSelectedCalendars,
}) => {
  const handleCalendarSelect = (provider: string) => {
    setSelectedCalendars((prev) => {
      if (prev && prev.includes(provider)) return [];
      return [provider];
    });
  };

  return (
    <div
      style={{
        padding: "40px",
        height: "85vh",
        backgroundColor: "#f9fafb",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <Card
        style={{
          width: "100%",
          height: "75vh",
          maxWidth: "960px",
          borderRadius: "16px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.05)",
          //   padding: "32px",
          backgroundColor: "#ffffff",
        }}
      >
        <Title level={3} style={{ color: "#2563eb", marginBottom: "8px" }}>
          Connect Accounts
        </Title>
        <Paragraph
          style={{ marginBottom: "0px", fontSize: "16px", color: "#374151" }}
        >
          Select the accounts you want to connect to Dockly.
        </Paragraph>
        <Text
          style={{
            fontSize: "14px",
            color: "#6b7280",
            display: "block",
            marginBottom: "24px",
          }}
        >
          Step 1 of 3
        </Text>

        <Row gutter={[24, 24]} style={{ marginBottom: "32px" }}>
          {calendarProviders.map((provider) => {
            const isSelected = selectedCalendars.includes(provider);
            return (
              <Col span={12} key={provider}>
                <Button
                  onClick={() => handleCalendarSelect(provider)}
                  style={{
                    width: "100%",
                    borderRadius: "16px",
                    padding: "38px 16px",
                    border: `2px solid ${isSelected ? "#2563eb" : "#d1d5db"}`,
                    backgroundColor: isSelected ? "#eff6ff" : "#ffffff",
                    textAlign: "center",
                    height: "100%",
                  }}
                >
                  <div
                    style={{
                      width: "52px",
                      height: "52px",
                      borderRadius: "50%",
                      margin: "0 auto 12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                      fontSize: "20px",
                      backgroundColor: providerColors[provider],
                      color: textColors[provider],
                    }}
                  >
                    {provider[0]}
                  </div>
                  <div
                    style={{
                      fontWeight: 600,
                      color: "#111827",
                      fontSize: "17px",
                    }}
                  >
                    {provider}
                  </div>
                  {isSelected && (
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#2563eb",
                        marginTop: "6px",
                      }}
                    >
                      ✓ Selected
                    </div>
                  )}
                </Button>
              </Col>
            );
          })}
        </Row>

        <div style={{ textAlign: "right" }}>
          <Button
            type="primary"
            onClick={() => setStep(2)}
            disabled={selectedCalendars.length === 0}
            style={{
              height: "40px",
              padding: "0 24px",
              backgroundColor:
                selectedCalendars.length > 0 ? "#2563eb" : "#9ca3af",
              borderColor: selectedCalendars.length > 0 ? "#2563eb" : "#9ca3af",
              color: "#fff",
              cursor: selectedCalendars.length > 0 ? "pointer" : "not-allowed",
              fontWeight: "bold",
              borderRadius: "8px",
            }}
          >
            Next
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CalendarStepOne;
