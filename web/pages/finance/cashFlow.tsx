"use client";

import { Card, Typography, Button } from "antd";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import React, { useState, useEffect } from "react";

dayjs.extend(weekOfYear);
import {
    BarChart,
    Bar,
    CartesianGrid,
    Legend,
    Line,
    ComposedChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip as RechartsTooltip,
} from "recharts";
import FinancialSummary from "./financialSummary";
import { PRIMARY_COLOR } from "../../app/comman";

const FONT_FAMILY = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const { Title } = Typography;

type TimePeriod = 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';

const CashFlow = ({ bankDetails }: any) => {
    const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('Monthly');
    const transactions = bankDetails?.transactions?.nodes ?? [];
    
    const graphData = getPeriodSummary(transactions, selectedPeriod);

    const timePeriods: TimePeriod[] = ['Daily', 'Weekly', 'Monthly', 'Yearly' /*, 'Quarterly' */];

    // Get current period data for summary
    const currentPeriodData = graphData[graphData.length - 1] || { income: 0, expenses: 0, net: 0 };

    return (
        <Card
            style={{
                borderRadius: "12px",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
                padding: "24px",
                background: "#ffffff",
                margin: "12px",
                width: "1300px",
                border: "1px solid #e2e8f0",
                fontFamily: FONT_FAMILY,
            }}
        >
            <div style={{ display: "flex", gap: "24px" }}>
                <div style={{ flex: 1 }}>
                    <div style={{ 
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "center",
                        marginBottom: "24px"
                    }}>
                        <Title level={4} style={{ 
                            margin: 0, 
                            fontFamily: FONT_FAMILY, 
                            fontSize: "18px", 
                            fontWeight: 600, 
                            color: "#111827" 
                        }}>
                            Cash Flow Summary
                        </Title>
                        <div style={{ display: "flex", gap: "8px" }}>
                            {timePeriods.map((period) => (
                                <Button
                                    key={period}
                                    type={selectedPeriod === period ? "primary" : "default"}
                                    size="small"
                                    onClick={() => setSelectedPeriod(period)}
                                    style={{
                                        borderRadius: "6px",
                                        fontSize: "12px",
                                        height: "28px",
                                        padding: "0 12px",
                                        fontFamily: FONT_FAMILY,
                                        border: selectedPeriod === period ? `1px solid ${PRIMARY_COLOR}` : "1px solid #d9d9d9",
                                        background: selectedPeriod === period ? PRIMARY_COLOR : "#ffffff",
                                        color: selectedPeriod === period ? "#ffffff" : "#666666"
                                    }}
                                >
                                    {period}
                                </Button>
                            ))}
                        </div>
                    </div>
                    
                    <div style={{ width: "100%", height: 400, background: "#f8f9fa", borderRadius: "8px", padding: "16px" }}>
                        <ResponsiveContainer>
                            <ComposedChart data={graphData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis 
                                    dataKey="label" 
                                    style={{ fontFamily: FONT_FAMILY, fontSize: '12px', color: '#666' }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis 
                                    style={{ fontFamily: FONT_FAMILY, fontSize: '12px', color: '#666' }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
                                />
                                <RechartsTooltip 
                                    contentStyle={{ 
                                        fontFamily: FONT_FAMILY, 
                                        borderRadius: '8px', 
                                        border: '1px solid #e5e7eb',
                                        background: '#ffffff',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}
                                    formatter={(value: any, name: string) => [
                                        `$${Number(value).toLocaleString()}`,
                                        name === 'income' ? 'Income' : name === 'expenses' ? 'Expenses' : 'Net'
                                    ]}
                                />
                                <Legend 
                                    verticalAlign="bottom" 
                                    height={36}
                                    wrapperStyle={{ 
                                        fontFamily: FONT_FAMILY, 
                                        fontSize: '12px',
                                        paddingTop: '16px'
                                    }}
                                />
                                <Bar
                                    dataKey="income"
                                    fill="#52c41a"
                                    name="Income"
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={60}
                                />
                                <Bar
                                    dataKey="expenses"
                                    fill="#ff4d4f"
                                    name="Expenses"
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={60}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="net"
                                    stroke="#1890ff"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    dot={{ r: 4, fill: "#1890ff" }}
                                    name="Net"
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <FinancialSummary
                    period={selectedPeriod}
                    income={currentPeriodData.income}
                    expense={currentPeriodData.expenses}
                    netCashFlow={currentPeriodData.net}
                />
            </div>
        </Card>
    );
};

export default CashFlow;

const getPeriodSummary = (transactions: any[] = [], period: TimePeriod) => {
    const summary = [];
    const today = dayjs();

    const getPeriodRange = (p: TimePeriod) => {
        switch (p) {
            case 'Daily':
                return { count: 30, unit: 'day', format: 'DD MMM' };
            case 'Weekly':
                return { count: 12, unit: 'week', format: 'WW YYYY' };
            case 'Monthly':
                return { count: 6, unit: 'month', format: 'MMM YYYY' };
            case 'Yearly':
                return { count: 5, unit: 'year', format: 'YYYY' };
            default:
                return { count: 6, unit: 'month', format: 'MMM YYYY' };
        }
    };

    const { count, unit, format } = getPeriodRange(period);

    for (let i = count - 1; i >= 0; i--) {
        const periodDate = today.subtract(i, unit as dayjs.ManipulateType);
        let label, income = 0, expenses = 0;

        transactions.forEach((tx) => {
            const txDate = dayjs(tx?.date);
            if (isWithinPeriod(txDate, periodDate, period)) {
                const amount = parseFloat(tx?.amount || "0");
                if (tx?.entryType === "CREDIT") income += amount;
                else if (tx?.entryType === "DEBIT") expenses += Math.abs(amount);
            }
        });

        const net = income - expenses;

        switch (period) {
            case 'Daily':
                label = periodDate.format(format);
                break;
            case 'Weekly':
                label = `Week ${periodDate.week()} ${periodDate.year()}`;
                break;
            case 'Monthly':
                label = periodDate.format(format);
                break;
            case 'Yearly':
                label = periodDate.format(format);
                break;
        }

        summary.push({
            label,
            income: parseFloat(income.toFixed(2)),
            expenses: parseFloat(expenses.toFixed(2)),
            net: parseFloat(net.toFixed(2)),
        });
    }

    return summary;
};

const isWithinPeriod = (txDate: dayjs.Dayjs, periodDate: dayjs.Dayjs, period: TimePeriod) => {
    switch (period) {
        case 'Daily':
            return txDate.isSame(periodDate, 'day');
        case 'Weekly':
            return txDate.isSame(periodDate, 'week');
        case 'Monthly':
            return txDate.isSame(periodDate, 'month') && txDate.isSame(periodDate, 'year');
        case 'Yearly':
            return txDate.isSame(periodDate, 'year');
        default:
            return false;
    }
};