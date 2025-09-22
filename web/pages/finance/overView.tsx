"use client";
import React from "react";
import { Card, Row, Col, Typography, Divider } from "antd";
import { RiseOutlined, FallOutlined } from "@ant-design/icons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import dayjs from "dayjs";

const { Title, Text } = Typography;

// Helper: Monthly Income vs Expense Summary
export const getMonthlyComparisonSummary = (transactions: any[]) => {
  const now = dayjs();
  const currentMonth = now.month();
  const currentYear = now.year();
  const prevMonthDate = now.subtract(1, "month");
  const prevMonth = prevMonthDate.month();
  const prevYear = prevMonthDate.year();

  let currentIncome = 0;
  let currentExpense = 0;
  let prevIncome = 0;
  let prevExpense = 0;

  transactions.forEach((tx) => {
    const txDate = dayjs(tx.date);
    const amount = parseFloat(tx.amount);

    if (txDate.year() === currentYear && txDate.month() === currentMonth) {
      if (tx.entryType === "CREDIT") currentIncome += amount;
      else if (tx.entryType === "DEBIT") currentExpense += Math.abs(amount);
    } else if (txDate.year() === prevYear && txDate.month() === prevMonth) {
      if (tx.entryType === "CREDIT") prevIncome += amount;
      else if (tx.entryType === "DEBIT") prevExpense += Math.abs(amount);
    }
  });

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0)
      return { percent: current > 0 ? 100 : 0, icon: RiseOutlined };
    const change = ((current - previous) / previous) * 100;
    return {
      percent: Math.abs(change).toFixed(2),
      icon: change >= 0 ? RiseOutlined : FallOutlined,
    };
  };

  return {
    currentIncome,
    currentExpense,
    prevIncome,
    prevExpense,
    incomeChange: calculateChange(currentIncome, prevIncome),
    expenseChange: calculateChange(currentExpense, prevExpense),
  };
};

// Helper: Last 6-month Summary
const getLastSixMonthsSummary = (transactions: any[]) => {
  const summary = [];
  for (let i = 5; i >= 0; i--) {
    const monthDate = dayjs().subtract(i, "month");
    const targetMonth = monthDate.month();
    const targetYear = monthDate.year();
    const label = monthDate.format("MMM YYYY");

    let income = 0;
    let expenses = 0;

    transactions.forEach((tx) => {
      const txDate = dayjs(tx.date);
      if (txDate.month() === targetMonth && txDate.year() === targetYear) {
        const amount = parseFloat(tx.amount);
        if (tx.entryType === "CREDIT") income += amount;
        else if (tx.entryType === "DEBIT") expenses += Math.abs(amount);
      }
    });

    summary.push({
      month: label,
      income: parseFloat(income.toFixed(2)),
      expenses: parseFloat(expenses.toFixed(2)),
    });
  }

  return summary;
};

// Helper: Net Worth Summary
export const getNetWorth = (connections: any[]) => {
  let totalAssets = 0;
  let totalLiabilities = 0;

  connections.forEach((account: any) => {
    const balance = account.balance?.current ?? 0;
    const name = account.name?.toLowerCase() ?? "";

    if (
      ["savings", "checking", "investment"].some((type) => name.includes(type))
    ) {
      totalAssets += balance;
    } else if (
      ["credit", "loan", "mortgage"].some((type) => name.includes(type))
    ) {
      totalLiabilities += balance;
    }
  });

  return {
    totalAssets,
    totalLiabilities,
    netWorth: totalAssets - totalLiabilities,
  };
};

// 💡 Main Component
const OverView = (props: any) => {
  const { bankDetails } = props;

  if (!bankDetails || !bankDetails.connections?.length) {
    return <div>No data available</div>;
  }

  const savings = bankDetails.connections[0].accounts.find(
    (account: any) => account.name === "Savings"
  );
  const checking = bankDetails.connections[0].accounts.find(
    (account: any) => account.name === "Checking"
  );
  const transactions = bankDetails.transactions.nodes;
  const graphData = getLastSixMonthsSummary(transactions);
  const {
    currentIncome,
    currentExpense,
    incomeChange,
    expenseChange,
  } = getMonthlyComparisonSummary(transactions);

  const totalBalance = (
    parseFloat(savings?.balance?.current ?? 0) +
    parseFloat(checking?.balance?.current ?? 0)
  ).toFixed(2);

  const totalDebited = transactions.reduce((sum: number, tx: any) => {
    if (tx.entryType === "DEBIT") {
      return sum + Math.abs(parseFloat(tx.amount) || 0);
    }
    return sum;
  }, 0);

  const startMonth = graphData[0]?.month || "";
  const endMonth = graphData[graphData.length - 1]?.month || "";
  const currentMonthYear = dayjs().format("MMM YYYY");
  const IncomeIcon = incomeChange.icon;
  const ExpenseIcon = expenseChange.icon;

  return (
    <Card
      style={{
        maxWidth: 950,
        margin: "10px auto",
        borderRadius: 20,
        // padding: 16,
        background: "#f9fcff",
      }}
    >
      <Row gutter={[16, 16]}>
        {/* Total Balance */}
        <Col span={8}>
          <Card style={cardStyle}>
            <Title level={4}>Total Balance</Title>
            <Title level={2}>${totalBalance}</Title>
            <Text>All accounts</Text>
          </Card>
        </Col>

        {/* Income */}
        <Col span={8}>
          <Card style={cardStyle}>
            <Title level={4}>Monthly Income</Title>
            <Title level={2} style={{ color: "#27ae60" }}>
              ${currentIncome.toFixed(2)}
            </Title>
            <Text>
              {currentMonthYear}{" "}
              <Text type="success">
                <IncomeIcon
                  style={{
                    color:
                      incomeChange.icon === RiseOutlined ? "green" : "red",
                  }}
                />{" "}
                {incomeChange.percent}%
              </Text>
            </Text>
          </Card>
        </Col>

        {/* Expenses */}
        <Col span={8}>
          <Card style={cardStyle}>
            <Title level={4}>Monthly Expenses</Title>
            <Title level={2} style={{ color: "#e74c3c" }}>
              ${currentExpense.toFixed(2)}
            </Title>
            <Text>
              {currentMonthYear}{" "}
              <Text type="danger">
                <ExpenseIcon
                  style={{
                    color:
                      expenseChange.icon === RiseOutlined ? "green" : "red",
                  }}
                />{" "}
                {expenseChange.percent}%
              </Text>
            </Text>
          </Card>
        </Col>

        {/* Graph */}
        <Col span={24}>
          {/* <Card style={graphCardStyle}>
            <Title level={4} style={{ textAlign: "center" }}>
              Income Vs. Expenses (Last 6 Months)
            </Title>
            <Text style={{ textAlign: "center", display: "block" }}>
              Chart showing trends from {startMonth} to {endMonth}
            </Text>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={graphData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#2ecc71"
                  strokeWidth={3}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#e74c3c"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card> */}
        </Col>
      </Row>
    </Card>
  );
};

// Styles
const cardStyle: React.CSSProperties = {
  borderRadius: 16,
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  textAlign: "center",
  background: "#ffffff",
  padding: 16,
};

const graphCardStyle: React.CSSProperties = {
  borderRadius: 16,
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  padding: 20,
  background: "#e9f5ff",
};

export default OverView;
