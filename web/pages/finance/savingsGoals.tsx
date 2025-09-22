import { Button, Card, Progress, Tag } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const SavingsGoalCard = (props: any) => {
  const { title, saved, target, tag, note, progressColor } = props;
  const percent = Math.min((saved / target) * 100, 100).toFixed(0);

  return (
    <Card
      style={{
        borderRadius: 16,
        background: "#e6f4ff",
        marginBottom: 10,
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        <Tag color="blue" style={{ borderRadius: 12 }}>
          {tag}
        </Tag>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 8,
        }}
      >
        <span style={{ fontWeight: "bold" }}>${saved.toLocaleString()}</span>
        <span style={{ color: "#999" }}>${target.toLocaleString()}</span>
      </div>

      <Progress
        percent={parseFloat(percent)}
        strokeColor={progressColor || "blue"}
        showInfo={false}
        style={{ marginTop: 8 }}
      />

      <div style={{ color: "#666", marginTop: 8 }}>{note}</div>
    </Card>
  );
};

const SavingsGoals = () => {
  const goals = [
    {
      title: "Emergency Fund",
      saved: 18500,
      target: 24000,
      tag: "Ongoing",
      note: "Target: 6 months of expenses",
      progressColor: "blue",
    },
    {
      title: "Summer Vacation",
      saved: 3200,
      target: 5000,
      tag: "Jun 2025",
      note: "$450 saved per month",
      progressColor: "#1890ff",
    },
    {
      title: "New Car Down Payment",
      saved: 4800,
      target: 12000,
      tag: "Dec 2025",
      note: "$800 saved per month",
      progressColor: "#1890ff",
    },
  ];

  return (
    <Card
      title="🎯 Savings Goals"
      extra={<Button shape="circle" icon={<PlusOutlined />} />}
      style={{
        borderRadius: 16,
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        background: "#ffffff",
        maxWidth: 600,
        margin: "0",
      }}
    >
      {goals.map((goal, index) => (
        <SavingsGoalCard key={index} {...goal} />
      ))}

      <Button
        type="dashed"
        icon={<PlusOutlined />}
        block
        style={{
          marginTop: 16,
          borderRadius: 8,
        }}
      >
        Add Goal
      </Button>
    </Card>
  );
};

export default SavingsGoals;
