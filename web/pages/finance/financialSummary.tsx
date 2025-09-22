import React from 'react';
import { Card, Typography } from 'antd';

const { Title, Text } = Typography;

const FONT_FAMILY =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

type CardProps = {
  title: string;
  amount?: number;
  change: string;
  note: string;
  changeColor: string;
  amountColor: string;
  backgroundColor: string;
};

const FinancialCard = ({
  title,
  amount,
  change,
  note,
  changeColor,
  amountColor,
  backgroundColor,
}: CardProps) => (
  <Card
    style={{
      borderRadius: '12px',
      boxShadow:
        '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
      marginBottom: '16px',
      padding: '0',
      width: '280px',
      border: '1px solid #e5e7eb',
      background: backgroundColor,
      fontFamily: FONT_FAMILY,
    }}
    bodyStyle={{ padding: '20px' }}
  >
    <div>
      <Text
        style={{
          fontSize: '12px',
          fontWeight: 500,
          color: '#6b7280',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          fontFamily: FONT_FAMILY,
        }}
      >
        {title}
      </Text>
      <Title
        level={2}
        style={{
          color: amountColor,
          margin: '8px 0 4px 0',
          fontWeight: 700,
          fontSize: '28px',
          fontFamily: FONT_FAMILY,
        }}
      >
        ${Number(amount ?? 0).toFixed(2)}
      </Title>
      <Text
        style={{
          color: changeColor,
          fontWeight: 500,
          fontSize: '14px',
          fontFamily: FONT_FAMILY,
        }}
      >
        {change}
      </Text>
      {note && (
        <>
          <br />
          <Text
            style={{
              color: '#6b7280',
              fontSize: '12px',
              fontFamily: FONT_FAMILY,
            }}
          >
            {note}
          </Text>
        </>
      )}
    </div>
  </Card>
);

const FinancialSummary: React.FC<{
  period?: string;
  income?: number;
  expense?: number;
  netCashFlow?: number;
}> = ({ period, income, expense, netCashFlow }) => {
  const safePeriod = period ?? 'Period';
  const lowerPeriod = safePeriod.toLowerCase();

  return (
    <div style={{ maxWidth: '300px', margin: '0' }}>
      <FinancialCard
        title={`${safePeriod} Income`}
        amount={income}
        change={`↑ 12.3% vs last ${lowerPeriod}`}
        note=""
        amountColor="#059669"
        changeColor="#059669"
        backgroundColor="rgba(16, 185, 129, 0.05)"
      />

      <FinancialCard
        title={`${safePeriod} Expenses`}
        amount={expense}
        change={`↑ 5.7% vs last ${lowerPeriod}`}
        note=""
        amountColor="#dc2626"
        changeColor="#dc2626"
        backgroundColor="rgba(239, 68, 68, 0.05)"
      />

      <FinancialCard
        title="Net Cash Flow"
        amount={netCashFlow}
        change="Saving 28.9% of income"
        note=""
        amountColor="#1d4ed8"
        changeColor="#6b7280"
        backgroundColor="rgba(59, 130, 246, 0.05)"
      />
    </div>
  );
};

export default FinancialSummary;
