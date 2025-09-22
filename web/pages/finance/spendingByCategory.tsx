import React from "react";
import { Card } from "antd";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Sample data
const pieData = [
  { name: "Housing", value: 1850 },
  { name: "Food & Dining", value: 852.43 },
  { name: "Transportation", value: 412.75 },
  { name: "Utilities", value: 412.75 },
  { name: "Entertainment", value: 345.28 },
];

// Color scheme
const COLORS = ["#3f8600", "#ff4d4f", "#1890ff", "#ffc107", "#722ed1"];

const SpendingByCategory = () => {
  return (
    <>
      <div
        style={{
          marginTop: 24,
          background: "#e6f4ff",
          borderRadius: 12,
          padding: 24,
          textAlign: "center",
        }}
      >
        <div style={{ fontWeight: 600, fontSize: 16 }}>
          April 2025 Spending by Category
        </div>
        <div style={{ color: "#666", marginTop: 4, marginBottom: 16 }}>
          Pie chart showing the distribution of expenses across different
          categories
        </div>

        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} (${(percent * 100).toFixed(0)}%)`
                }
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
};

export default SpendingByCategory;
