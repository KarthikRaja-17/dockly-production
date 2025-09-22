import React from "react";
import { Card, Tag, Button, Typography } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  CalendarOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const bills = [
  {
    date: "23",
    month: "Apr",
    name: "Internet Bill",
    vendor: "Xfinity • Monthly",
    amount: "$89.99",
    status: "Due Soon",
    autoPay: true,
    color: "#ff4d4f",
  },
  {
    date: "25",
    month: "Apr",
    name: "Cell Phone",
    vendor: "Verizon • Monthly",
    amount: "$142.50",
    status: "Due Soon",
    autoPay: true,
    color: "#ff4d4f",
  },
  {
    date: "1",
    month: "May",
    name: "Amex Credit Card",
    vendor: "American Express • Monthly",
    amount: "$1,835.42",
    status: "Upcoming",
    autoPay: true,
    color: "#52c41a",
  },
  
];

const BillItem = (props: any) => {
  const { bill } = props;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "10px 0",
        borderBottom: "1px solid #f0f0f0",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", gap: 12 }}>
        <div
          style={{
            backgroundColor: "#f0f5ff",
            color: "#2f54eb",
            borderRadius: 8,
            padding: "4px 12px",
            textAlign: "center",
          }}
        >
          <div style={{ fontWeight: 600, fontSize: 16 }}>{bill.date}</div>
          <div style={{ fontSize: 12 }}>{bill.month}</div>
        </div>
        <div style={{ textAlign: "left" }}>
          <div style={{ fontWeight: 500, fontSize: 16 }}>{bill.name}</div>
          <div style={{ color: "#888" }}>{bill.vendor}</div>
          {bill.autoPay && (
            <Tag color="green" style={{ marginTop: 4 }}>
              Auto-Pay
            </Tag>
          )}
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontWeight: 600, color: bill.color }}>{bill.amount}</div>
        <div style={{ fontSize: 12, color: bill.color }}>{bill.status}</div>
      </div>
    </div>
  );
};

const UpcomingBills = () => {
  return (
    <Card
      style={{
        borderRadius: 16,
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        background: "#fff",
        padding: 14,
        maxWidth: 500,
        marginTop: 10,
      }}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <CalendarOutlined style={{ color: "#1890ff" }} />
          <Text style={{ fontSize: 18, fontWeight: 600 }}>Upcoming Bills</Text>
        </div>
      }
      extra={<Button icon={<EditOutlined />} shape="circle" />}
    >
      {bills.map((bill, index) => (
        <BillItem key={index} bill={bill} />
      ))}
      <div style={{ marginTop: 15, textAlign: "center" }}>
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          style={{
            width: "100%",
            borderRadius: 10,
            padding: "8px 0",
            fontWeight: 500,
          }}
        >
          Add Bill
        </Button>
      </div>
    </Card>
  );
};

export default UpcomingBills;
