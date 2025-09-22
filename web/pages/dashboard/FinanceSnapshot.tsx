import React, { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, PieChart } from 'lucide-react';

const FinanceSnapshot: React.FC = () => {
  const [animatedValues, setAnimatedValues] = useState({
    needs: 0,
    wants: 0,
    savings: 0
  });

  const financeData = {
    totalBalance: 12847,
    income: 2340,
    expenses: 1827,
    budgetData: {
      needs: { current: 1250, target: 1500, percentage: 83 },
      wants: { current: 680, target: 900, percentage: 76 },
      savings: { current: 600, target: 600, percentage: 100 }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValues({
        needs: financeData.budgetData.needs.percentage,
        wants: financeData.budgetData.wants.percentage,
        savings: financeData.budgetData.savings.percentage
      });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '20px',
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
      opacity: 0,
      animation: 'fadeInUp 0.6s ease-out 0.8s forwards'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid #f1f5f9',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieChart size={20} style={{ color: '#10b981' }} />
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1e293b',
              margin: 0
            }}>
              Finance Snapshot
            </h3>
          </div>
          <a
            href="#"
            style={{
              fontSize: '14px',
              color: '#3b82f6',
              textDecoration: 'none',
              fontWeight: '500'
            }}
          >
            View Details →
          </a>
        </div>
      </div>

      <div style={{ padding: '24px' }}>
        {/* Account Activity */}
        <div style={{ marginBottom: '32px' }}>
          <p style={{
            fontSize: '12px',
            color: '#64748b',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            margin: '0 0 16px 0'
          }}>
            Account Activity (Last 7 days)
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '20px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '8px'
              }}>
                <DollarSign size={16} style={{ color: '#3b82f6', marginRight: '4px' }} />
              </div>
              <p style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#1e293b',
                margin: '0 0 4px 0'
              }}>
                {formatCurrency(financeData.totalBalance)}
              </p>
              <p style={{
                fontSize: '12px',
                color: '#64748b',
                margin: 0
              }}>
                Total Balance
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '8px'
              }}>
                <TrendingUp size={16} style={{ color: '#10b981', marginRight: '4px' }} />
              </div>
              <p style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#10b981',
                margin: '0 0 4px 0'
              }}>
                +{formatCurrency(financeData.income)}
              </p>
              <p style={{
                fontSize: '12px',
                color: '#64748b',
                margin: 0
              }}>
                Income
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '8px'
              }}>
                <TrendingDown size={16} style={{ color: '#ef4444', marginRight: '4px' }} />
              </div>
              <p style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#ef4444',
                margin: '0 0 4px 0'
              }}>
                -{formatCurrency(financeData.expenses)}
              </p>
              <p style={{
                fontSize: '12px',
                color: '#64748b',
                margin: 0
              }}>
                Expenses
              </p>
            </div>
          </div>
        </div>

        {/* Budget Progress */}
        <div>
          <p style={{
            fontSize: '12px',
            color: '#64748b',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            margin: '0 0 16px 0'
          }}>
            Budget Progress (50/30/20 Rule)
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Needs */}
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b' }}>
                  Needs (50%)
                </span>
                <span style={{ fontSize: '13px', color: '#64748b' }}>
                  {formatCurrency(financeData.budgetData.needs.current)} / {formatCurrency(financeData.budgetData.needs.target)}
                </span>
              </div>
              <div style={{
                height: '8px',
                backgroundColor: '#f1f5f9',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  backgroundColor: '#3b82f6',
                  borderRadius: '4px',
                  width: `${animatedValues.needs}%`,
                  transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '4px',
                    height: '100%',
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    animation: 'shimmer 2s infinite'
                  }} />
                </div>
              </div>
            </div>

            {/* Wants */}
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b' }}>
                  Wants (30%)
                </span>
                <span style={{ fontSize: '13px', color: '#64748b' }}>
                  {formatCurrency(financeData.budgetData.wants.current)} / {formatCurrency(financeData.budgetData.wants.target)}
                </span>
              </div>
              <div style={{
                height: '8px',
                backgroundColor: '#f1f5f9',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  backgroundColor: '#10b981',
                  borderRadius: '4px',
                  width: `${animatedValues.wants}%`,
                  transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1) 0.2s',
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '4px',
                    height: '100%',
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    animation: 'shimmer 2s infinite 0.5s'
                  }} />
                </div>
              </div>
            </div>

            {/* Savings */}
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b' }}>
                  Savings (20%)
                </span>
                <span style={{ fontSize: '13px', color: '#64748b' }}>
                  {formatCurrency(financeData.budgetData.savings.current)} / {formatCurrency(financeData.budgetData.savings.target)}
                </span>
              </div>
              <div style={{
                height: '8px',
                backgroundColor: '#f1f5f9',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  backgroundColor: '#9333ea',
                  borderRadius: '4px',
                  width: `${animatedValues.savings}%`,
                  transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1) 0.4s',
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '4px',
                    height: '100%',
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    animation: 'shimmer 2s infinite 1s'
                  }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default FinanceSnapshot;