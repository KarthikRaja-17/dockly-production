import BankBoardPage from "../../../pages/finance/bankBoardPage";

const Finance = () => {
  return (
    <div>
      <BankBoardPage />
    </div>
  );
};

export default Finance;


// 'use client';
// import React, { useState, useEffect } from 'react';
// import { Tabs, Spin, Alert, Button, Modal, Progress } from 'antd';
// import { BankOutlined, UserOutlined } from '@ant-design/icons';
// import { useGlobalLoading } from '../../loadingContext';
// import { useQuilttSession } from '../../../services/useQuilttSession';
// import { getBankAccount } from '../../../services/apiConfig';
// // import { useQuilttSession, useGlobalLoading } from '../hooks/useQuilttSession';
// // import { getBankAccount } from '../services/financeApi';
// // import CashFlowChart from './CashFlowChart';
// // import BudgetOverview from './BudgetOverview';
// // import TransactionsList from './TransactionsList';
// // import AccountsGrid from './AccountsGrid';
// // import FinancialGoals from './FinancialGoals';
// // import RecurringTransactions from './RecurringTransactions';

// const { TabPane } = Tabs;

// const FinanceDashboard: React.FC = () => {
//   const [bankDetails, setBankDetails] = useState<any>(null);
//   const [activeTab, setActiveTab] = useState('1');
//   const [showConnectModal, setShowConnectModal] = useState(false);
//   const [email, setEmail] = useState('');
//   const [userId, setUserId] = useState('');

//   const { session, isConnected, loading: sessionLoading, connectBank } = useQuilttSession();
//   const { loading, setLoading } = useGlobalLoading();

//   const getUserBankAccount = async () => {
//     if (!session) return;

//     setLoading(true);
//     try {
//       const response = await getBankAccount({ session });
//       const data = response?.data?.data;
//       if (data) {
//         setBankDetails(data);
//       }
//     } catch (error) {
//       console.error('Error fetching bank account:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (isConnected) {
//       getUserBankAccount();
//     }
//   }, [isConnected, session]);

//   const handleConnectBank = async () => {
//     if (!email || !userId) {
//       return;
//     }

//     const success = await connectBank(email, userId);
//     if (success) {
//       setShowConnectModal(false);
//       setEmail('');
//       setUserId('');
//     }
//   };

//   const goToTransactionsTab = () => {
//     setActiveTab('3');
//   };

//   if (!isConnected) {
//     return (
//       <div style={{
//         padding: '40px',
//         textAlign: 'center',
//         background: '#f5f7fa',
//         minHeight: '100vh',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center'
//       }}>
//         <div style={{
//           background: 'white',
//           padding: '48px',
//           borderRadius: '12px',
//           boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
//           maxWidth: '400px',
//           width: '100%'
//         }}>
//           <BankOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '24px' }} />
//           <h2 style={{ marginBottom: '16px', fontSize: '24px', fontWeight: '600' }}>
//             Connect Your Bank Account
//           </h2>
//           <p style={{ color: '#666', marginBottom: '32px', lineHeight: '1.6' }}>
//             Connect your bank account to get started with comprehensive financial management using Quiltt.
//           </p>
//           <Button
//             type="primary"
//             size="large"
//             onClick={() => setShowConnectModal(true)}
//             loading={sessionLoading}
//             style={{ width: '100%', height: '48px', fontSize: '16px' }}
//           >
//             Connect Bank Account
//           </Button>
//         </div>

//         <Modal
//           title="Connect Bank Account"
//           open={showConnectModal}
//           onOk={handleConnectBank}
//           onCancel={() => setShowConnectModal(false)}
//           confirmLoading={sessionLoading}
//           okText="Connect"
//         >
//           <div style={{ marginBottom: '16px' }}>
//             <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
//               Email Address
//             </label>
//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               placeholder="Enter your email"
//               style={{
//                 width: '100%',
//                 padding: '8px 12px',
//                 border: '1px solid #d9d9d9',
//                 borderRadius: '6px',
//                 fontSize: '14px'
//               }}
//             />
//           </div>
//           <div style={{ marginBottom: '16px' }}>
//             <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
//               User ID
//             </label>
//             <input
//               type="text"
//               value={userId}
//               onChange={(e) => setUserId(e.target.value)}
//               placeholder="Enter your user ID"
//               style={{
//                 width: '100%',
//                 padding: '8px 12px',
//                 border: '1px solid #d9d9d9',
//                 borderRadius: '6px',
//                 fontSize: '14px'
//               }}
//             />
//           </div>
//         </Modal>
//       </div>
//     );
//   }

//   if (loading) {
//     return (
//       <div style={{
//         padding: '40px',
//         textAlign: 'center',
//         background: '#f5f7fa',
//         minHeight: '100vh',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center'
//       }}>
//         <Spin size="large" />
//         <p style={{ marginTop: '16px', color: '#666' }}>Loading your financial data...</p>
//       </div>
//     );
//   }

//   return (
//     <div style={{
//       background: '#f5f7fa',
//       minHeight: '100vh',
//       padding: '20px'
//     }}>
//       <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
//         {/* Header */}
//         <div style={{
//           background: 'white',
//           padding: '24px',
//           borderRadius: '12px',
//           boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
//           marginBottom: '24px'
//         }}>
//           <div style={{
//             display: 'flex',
//             justifyContent: 'space-between',
//             alignItems: 'center',
//             marginBottom: '16px'
//           }}>
//             <h1 style={{
//               fontSize: '28px',
//               fontWeight: '600',
//               color: '#1a1a1a',
//               margin: 0
//             }}>
//               Finance Dashboard
//             </h1>
//             <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
//               <UserOutlined />
//               <span style={{ color: '#666' }}>Connected via Quiltt</span>
//             </div>
//           </div>

//           <Tabs
//             activeKey={activeTab}
//             onChange={setActiveTab}
//           >
//             <TabPane tab="Overview" key="1" />
//             <TabPane tab="Accounts" key="2" />
//             <TabPane tab="Transactions" key="3" />
//             <TabPane tab="Budgets" key="4" />
//             <TabPane tab="Goals" key="5" />
//           </Tabs>
//         </div>

//         {/* Content */}
//         <div style={{ display: activeTab === '1' ? 'block' : 'none' }}>
//           {/* Cash Flow Section */}
//           <div style={{
//             display: 'grid',
//             gridTemplateColumns: '1fr 380px',
//             gap: '24px',
//             marginBottom: '24px'
//           }}>
//             <CashFlowChart bankDetails={bankDetails} />
//             <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
//               <div style={{
//                 background: 'white',
//                 padding: '20px',
//                 borderRadius: '12px',
//                 boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
//                 flex: 1
//               }}>
//                 <div style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>
//                   Total Balance
//                 </div>
//                 <div style={{ fontSize: '28px', fontWeight: '600', marginBottom: '4px' }}>
//                   $12,543.87
//                 </div>
//                 <div style={{ fontSize: '14px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
//                   <span>↑ 5.2%</span>
//                   <span>from last month</span>
//                 </div>
//               </div>

//               <div style={{
//                 background: 'white',
//                 padding: '20px',
//                 borderRadius: '12px',
//                 boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
//                 flex: 1
//               }}>
//                 <div style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>
//                   Monthly Income
//                 </div>
//                 <div style={{ fontSize: '28px', fontWeight: '600', color: '#10b981', marginBottom: '4px' }}>
//                   $1,649.45
//                 </div>
//                 <div style={{ fontSize: '14px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
//                   <span>↑ 100%</span>
//                   <span>Jun 2025</span>
//                 </div>
//               </div>

//               <div style={{
//                 background: 'white',
//                 padding: '20px',
//                 borderRadius: '12px',
//                 boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
//                 flex: 1
//               }}>
//                 <div style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>
//                   Monthly Expenses
//                 </div>
//                 <div style={{ fontSize: '28px', fontWeight: '600', color: '#ef4444', marginBottom: '4px' }}>
//                   $2,156.00
//                 </div>
//                 <div style={{ fontSize: '14px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
//                   <span>↑ 100%</span>
//                   <span>Jun 2025</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Budget and Goals Section */}
//           <div style={{
//             display: 'grid',
//             gridTemplateColumns: '1fr 320px',
//             gap: '24px',
//             marginBottom: '24px'
//           }}>
//             <BudgetOverview />
//             <FinancialGoals />
//           </div>

//           {/* Transactions Section */}
//           <div style={{
//             display: 'grid',
//             gridTemplateColumns: '1fr 340px',
//             gap: '24px',
//             marginBottom: '24px'
//           }}>
//             <TransactionsList onViewAll={goToTransactionsTab} />
//             <RecurringTransactions />
//           </div>

//           {/* Accounts Section */}
//           <AccountsGrid />
//         </div>

//         {/* Other Tab Content */}
//         {activeTab === '2' && <AccountsGrid />}
//         {activeTab === '3' && <TransactionsList />}
//         {activeTab === '4' && <BudgetOverview />}
//         {activeTab === '5' && <FinancialGoals />}
//       </div>
//     </div>
//   );
// };

// export default FinanceDashboard;



// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

// interface CashFlowChartProps {
//   bankDetails?: any;
// }

// const CashFlowChart: React.FC<CashFlowChartProps> = ({ bankDetails }) => {
//   const [chartData, setChartData] = useState<any[]>([]);
//   const [period, setPeriod] = useState('6m');

//   useEffect(() => {
//     // Generate chart data based on period
//     const generateData = () => {
//       const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
//       const data = months.map((month, index) => ({
//         month,
//         income: 1500 + Math.random() * 400,
//         expenses: 1200 + Math.random() * 600,
//       }));

//       setChartData(data);
//     };

//     generateData();
//   }, [period, bankDetails]);

//   const CustomTooltip = ({ active, payload, label }: any) => {
//     if (active && payload && payload.length) {
//       return (
//         <div style={{
//           background: 'white',
//           padding: '12px',
//           border: '1px solid #e5e7eb',
//           borderRadius: '8px',
//           boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
//         }}>
//           <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>{`${label} 2025`}</p>
//           {payload.map((entry: any, index: number) => (
//             <p key={index} style={{
//               margin: '4px 0',
//               color: entry.color,
//               display: 'flex',
//               alignItems: 'center',
//               gap: '8px'
//             }}>
//               <span style={{
//                 width: '8px',
//                 height: '8px',
//                 backgroundColor: entry.color,
//                 borderRadius: '50%',
//                 display: 'inline-block'
//               }} />
//               {`${entry.name}: $${entry.value.toFixed(2)}`}
//             </p>
//           ))}
//           <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
//           <p style={{
//             margin: '4px 0 0 0',
//             fontWeight: '600',
//             color: payload[0].value > payload[1].value ? '#10b981' : '#ef4444'
//           }}>
//             Net: ${(payload[0].value - payload[1].value).toFixed(2)}
//           </p>
//         </div>
//       );
//     }
//     return null;
//   };

//   return (
//     <div style={{
//       background: 'white',
//       padding: '24px',
//       borderRadius: '12px',
//       boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
//     }}>
//       <div style={{
//         display: 'flex',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         marginBottom: '20px'
//       }}>
//         <h2 style={{
//           fontSize: '20px',
//           fontWeight: '600',
//           margin: 0
//         }}>
//           Cash Flow
//         </h2>
//         <div style={{ display: 'flex', gap: '8px' }}>
//           {[
//             { key: '3m', label: '3M' },
//             { key: '6m', label: '6M' },
//             { key: '1y', label: '1Y' },
//           ].map(({ key, label }) => (
//             <button
//               key={key}
//               onClick={() => setPeriod(key)}
//               style={{
//                 padding: '6px 12px',
//                 border: '1px solid #e5e7eb',
//                 borderRadius: '6px',
//                 background: period === key ? '#1890ff' : 'white',
//                 color: period === key ? 'white' : '#666',
//                 cursor: 'pointer',
//                 fontSize: '12px',
//                 fontWeight: '500',
//                 transition: 'all 0.2s ease'
//               }}
//             >
//               {label}
//             </button>
//           ))}
//         </div>
//       </div>

//       <div style={{ width: '100%', height: '300px' }}>
//         <ResponsiveContainer width="100%" height="100%">
//           <AreaChart
//             data={chartData}
//             margin={{
//               top: 5,
//               right: 30,
//               left: 20,
//               bottom: 5,
//             }}
//           >
//             <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//             <XAxis
//               dataKey="month"
//               axisLine={false}
//               tickLine={false}
//               tick={{ fontSize: 12, fill: '#666' }}
//             />
//             <YAxis
//               axisLine={false}
//               tickLine={false}
//               tick={{ fontSize: 12, fill: '#666' }}
//               tickFormatter={(value) => `$${value}`}
//             />
//             <Tooltip content={<CustomTooltip />} />
//             <Legend
//               wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }}
//             />

//             {/* Income area */}
//             <Area
//               type="monotone"
//               dataKey="income"
//               stackId="1"
//               stroke="#10b981"
//               fill="#10b981"
//               fillOpacity={0.1}
//               strokeWidth={3}
//               name="Income"
//             />

//             {/* Expenses area */}
//             <Area
//               type="monotone"
//               dataKey="expenses"
//               stackId="2"
//               stroke="#ef4444"
//               fill="#ef4444"
//               fillOpacity={0.1}
//               strokeWidth={3}
//               name="Expenses"
//             />
//           </AreaChart>
//         </ResponsiveContainer>
//       </div>

//       {/* Summary Stats */}
//       <div style={{
//         display: 'grid',
//         gridTemplateColumns: 'repeat(3, 1fr)',
//         gap: '16px',
//         marginTop: '20px',
//         padding: '16px',
//         background: '#f8fafc',
//         borderRadius: '8px'
//       }}>
//         <div style={{ textAlign: 'center' }}>
//           <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
//             Avg Income
//           </div>
//           <div style={{ fontSize: '16px', fontWeight: '600', color: '#10b981' }}>
//             $1,649
//           </div>
//         </div>
//         <div style={{ textAlign: 'center' }}>
//           <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
//             Avg Expenses
//           </div>
//           <div style={{ fontSize: '16px', fontWeight: '600', color: '#ef4444' }}>
//             $1,456
//           </div>
//         </div>
//         <div style={{ textAlign: 'center' }}>
//           <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
//             Net Flow
//           </div>
//           <div style={{ fontSize: '16px', fontWeight: '600', color: '#10b981' }}>
//             +$193
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// import { EditOutlined } from '@ant-design/icons';
// import { formatCurrency, formatDate, getAccountsSummary, getBudgets, getFinancialGoals, getTransactions, processTransactionEnrichment } from '../../../services/finance';

// const BudgetOverview: React.FC = () => {
//   const [budgetData, setBudgetData] = useState<any>(null);
//   const [loading, setLoading] = useState(false);
//   const { session } = useQuilttSession();

//   useEffect(() => {
//     if (session) {
//       fetchBudgetData();
//     }
//   }, [session]);

//   const fetchBudgetData = async () => {
//     setLoading(true);
//     try {
//       const response = await getBudgets({ session });
//       setBudgetData(response.data);
//     } catch (error) {
//       console.error('Error fetching budget data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const budgetRules = [
//     {
//       percentage: 50,
//       label: 'Needs',
//       budget: 1250,
//       spent: 1078,
//       color: '#EF4444',
//       bgColor: '#FEE2E2',
//       borderColor: '#FECACA'
//     },
//     {
//       percentage: 30,
//       label: 'Wants',
//       budget: 750,
//       spent: 645,
//       color: '#F59E0B',
//       bgColor: '#FEF3C7',
//       borderColor: '#FDE68A'
//     },
//     {
//       percentage: 20,
//       label: 'Savings',
//       budget: 500,
//       spent: 433,
//       color: '#10B981',
//       bgColor: '#D1FAE5',
//       borderColor: '#A7F3D0'
//     }
//   ];

//   const categories = [
//     {
//       name: 'Housing',
//       budget: 900,
//       spent: 850,
//       type: 'needs',
//       icon: '🏠',
//       bgColor: '#DBEAFE'
//     },
//     {
//       name: 'Dining Out',
//       budget: 300,
//       spent: 245,
//       type: 'wants',
//       icon: '🍔',
//       bgColor: '#FEF3C7'
//     },
//     {
//       name: 'Groceries',
//       budget: 250,
//       spent: 228,
//       type: 'needs',
//       icon: '🛒',
//       bgColor: '#DBEAFE'
//     },
//     {
//       name: 'Entertainment',
//       budget: 150,
//       spent: 125,
//       type: 'wants',
//       icon: '🎬',
//       bgColor: '#FEF3C7'
//     },
//     {
//       name: 'Shopping',
//       budget: 300,
//       spent: 275,
//       type: 'wants',
//       icon: '🛍️',
//       bgColor: '#FEF3C7'
//     }
//   ];

//   return (
//     <div style={{
//       background: 'white',
//       padding: '24px',
//       borderRadius: '12px',
//       boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
//     }}>
//       <div style={{
//         display: 'flex',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         marginBottom: '20px'
//       }}>
//         <h2 style={{
//           fontSize: '20px',
//           fontWeight: '600',
//           margin: 0
//         }}>
//           Monthly Budget
//         </h2>
//         <Button
//           type="link"
//           icon={<EditOutlined />}
//           style={{ padding: 0, fontSize: '14px' }}
//         >
//           Edit Budget
//         </Button>
//       </div>

//       {/* 50/30/20 Rule Cards */}
//       <div style={{
//         display: 'flex',
//         gap: '16px',
//         marginBottom: '24px'
//       }}>
//         {budgetRules.map((rule, index) => {
//           const percentageUsed = Math.round((rule.spent / rule.budget) * 100);

//           return (
//             <div
//               key={index}
//               style={{
//                 flex: 1,
//                 padding: '16px',
//                 borderRadius: '8px',
//                 background: rule.bgColor,
//                 border: `1px solid ${rule.borderColor}`,
//                 position: 'relative',
//                 overflow: 'hidden'
//               }}
//             >
//               <div style={{
//                 fontSize: '24px',
//                 fontWeight: '600',
//                 marginBottom: '4px',
//                 color: rule.color
//               }}>
//                 {rule.percentage}%
//               </div>
//               <div style={{
//                 fontSize: '16px',
//                 fontWeight: '500',
//                 marginBottom: '4px'
//               }}>
//                 {rule.label}
//               </div>
//               <div style={{
//                 fontSize: '14px',
//                 color: '#4b5563',
//                 marginBottom: '8px'
//               }}>
//                 ${rule.spent.toLocaleString()} of ${rule.budget.toLocaleString()}
//               </div>

//               <div style={{
//                 height: '8px',
//                 background: 'rgba(255,255,255,0.5)',
//                 borderRadius: '4px',
//                 overflow: 'hidden',
//                 marginBottom: '4px'
//               }}>
//                 <div style={{
//                   height: '100%',
//                   background: rule.color,
//                   borderRadius: '4px',
//                   width: `${Math.min(percentageUsed, 100)}%`,
//                   transition: 'width 0.3s ease'
//                 }} />
//               </div>

//               <div style={{
//                 fontSize: '12px',
//                 color: rule.color,
//                 fontWeight: '500'
//               }}>
//                 {percentageUsed}% {rule.label === 'Savings' ? 'saved' : 'used'}
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* Category Breakdown */}
//       <div>
//         <h3 style={{
//           fontSize: '16px',
//           marginBottom: '12px',
//           fontWeight: '600'
//         }}>
//           Spending by Category
//         </h3>

//         {categories.map((category, index) => {
//           const percentageUsed = Math.round((category.spent / category.budget) * 100);

//           return (
//             <div
//               key={index}
//               style={{
//                 display: 'flex',
//                 alignItems: 'center',
//                 padding: '12px 0',
//                 borderBottom: index < categories.length - 1 ? '1px solid #f3f4f6' : 'none'
//               }}
//             >
//               <div style={{
//                 width: '32px',
//                 height: '32px',
//                 borderRadius: '8px',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 marginRight: '12px',
//                 fontSize: '18px',
//                 background: category.bgColor
//               }}>
//                 {category.icon}
//               </div>

//               <div style={{ flex: 1 }}>
//                 <div style={{
//                   fontWeight: '500',
//                   fontSize: '14px',
//                   marginBottom: '2px'
//                 }}>
//                   {category.name}
//                 </div>
//                 <div style={{
//                   fontSize: '12px',
//                   color: '#6b7280'
//                 }}>
//                   ${category.spent} of ${category.budget} • {category.type === 'needs' ? 'Needs' : 'Wants'}
//                 </div>

//                 {/* Progress bar */}
//                 <div style={{
//                   width: '100%',
//                   height: '4px',
//                   background: '#f3f4f6',
//                   borderRadius: '2px',
//                   marginTop: '4px',
//                   overflow: 'hidden'
//                 }}>
//                   <div style={{
//                     height: '100%',
//                     background: category.type === 'needs' ? '#EF4444' : '#F59E0B',
//                     borderRadius: '2px',
//                     width: `${Math.min(percentageUsed, 100)}%`,
//                     transition: 'width 0.3s ease'
//                   }} />
//                 </div>
//               </div>

//               <div style={{
//                 fontWeight: '600',
//                 fontSize: '14px',
//                 textAlign: 'right'
//               }}>
//                 ${category.spent.toLocaleString()}
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// import { Input, Select, DatePicker, Tag } from 'antd';
// import { SearchOutlined, FilterOutlined } from '@ant-design/icons';

// const { RangePicker } = DatePicker;
// const { Option } = Select;

// interface TransactionsListProps {
//   onViewAll?: () => void;
// }

// const TransactionsList: React.FC<TransactionsListProps> = ({ onViewAll }) => {
//   const [transactions, setTransactions] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedCategory, setSelectedCategory] = useState<string>('');
//   const [dateRange, setDateRange] = useState<any[]>([]);
//   const { session } = useQuilttSession();

//   useEffect(() => {
//     if (session) {
//       fetchTransactions();
//     }
//   }, [session]);

//   const fetchTransactions = async () => {
//     setLoading(true);
//     try {
//       const response = await getTransactions({
//         session,
//         filters: {
//           limit: onViewAll ? 50 : 6
//         }
//       });

//       const transactionNodes = response.data?.data?.transactions?.nodes || [];
//       const processedTransactions = transactionNodes.map(processTransactionEnrichment);
//       setTransactions(processedTransactions);
//     } catch (error) {
//       console.error('Error fetching transactions:', error);
//       // Use sample data for demo
//       setSampleTransactions();
//     } finally {
//       setLoading(false);
//     }
//   };

//   const setSampleTransactions = () => {
//     const sampleData = [
//       {
//         id: '1',
//         description: 'Whole Foods Market',
//         merchantName: 'Whole Foods Market',
//         amount: -87.43,
//         date: '2025-01-25',
//         category: 'Groceries',
//         account: { name: 'Chase Checking' },
//         status: 'posted',
//         icon: '🛒',
//         bgColor: '#FEF3C7'
//       },
//       {
//         id: '2',
//         description: 'Direct Deposit',
//         merchantName: 'Direct Deposit',
//         amount: 1649.45,
//         date: '2025-01-15',
//         category: 'Income',
//         account: { name: 'Chase Checking' },
//         status: 'posted',
//         icon: '💰',
//         bgColor: '#D1FAE5'
//       },
//       {
//         id: '3',
//         description: 'Shell Gas Station',
//         merchantName: 'Shell Gas Station',
//         amount: -52.18,
//         date: '2025-01-14',
//         category: 'Transportation',
//         account: { name: 'Visa Card' },
//         status: 'posted',
//         icon: '⛽',
//         bgColor: '#FEE2E2'
//       },
//       {
//         id: '4',
//         description: 'Chipotle Mexican Grill',
//         merchantName: 'Chipotle Mexican Grill',
//         amount: -14.85,
//         date: '2025-01-14',
//         category: 'Dining Out',
//         account: { name: 'Chase Checking' },
//         status: 'posted',
//         icon: '🍔',
//         bgColor: '#DBEAFE'
//       },
//       {
//         id: '5',
//         description: 'Netflix Subscription',
//         merchantName: 'Netflix',
//         amount: -19.99,
//         date: '2025-01-13',
//         category: 'Entertainment',
//         account: { name: 'Amex Card' },
//         status: 'posted',
//         icon: '💻',
//         bgColor: '#E0E7FF'
//       },
//       {
//         id: '6',
//         description: 'Property Management LLC',
//         merchantName: 'Property Management LLC',
//         amount: -850.00,
//         date: '2025-01-01',
//         category: 'Housing',
//         account: { name: 'Chase Checking' },
//         status: 'posted',
//         icon: '🏠',
//         bgColor: '#FCE7F3'
//       }
//     ];
//     setTransactions(sampleData);
//   };

//   const filteredTransactions = transactions.filter(transaction => {
//     const matchesSearch = transaction.merchantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       transaction.description?.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesCategory = !selectedCategory || transaction.category === selectedCategory;
//     // Add date range filtering logic here if needed

//     return matchesSearch && matchesCategory;
//   });

//   const getTransactionIcon = (category: string) => {
//     const iconMap: { [key: string]: { icon: string; bgColor: string } } = {
//       'Groceries': { icon: '🛒', bgColor: '#FEF3C7' },
//       'Income': { icon: '💰', bgColor: '#D1FAE5' },
//       'Transportation': { icon: '⛽', bgColor: '#FEE2E2' },
//       'Dining Out': { icon: '🍔', bgColor: '#DBEAFE' },
//       'Entertainment': { icon: '💻', bgColor: '#E0E7FF' },
//       'Housing': { icon: '🏠', bgColor: '#FCE7F3' },
//       'Shopping': { icon: '🛍️', bgColor: '#FEF3C7' },
//       'Healthcare': { icon: '🏥', bgColor: '#E0F2FE' }
//     };

//     return iconMap[category] || { icon: '📊', bgColor: '#F3F4F6' };
//   };

//   return (
//     <div style={{
//       background: 'white',
//       padding: '24px',
//       borderRadius: '12px',
//       boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
//     }}>
//       <div style={{
//         display: 'flex',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         marginBottom: '20px'
//       }}>
//         <h2 style={{
//           fontSize: '20px',
//           fontWeight: '600',
//           margin: 0
//         }}>
//           {onViewAll ? 'All Transactions' : 'Recent Transactions'}
//         </h2>
//         {!onViewAll && (
//           <Button
//             type="link"
//             onClick={onViewAll}
//             style={{ padding: 0, fontSize: '14px' }}
//           >
//             View All
//           </Button>
//         )}
//       </div>

//       {/* Filters - only show on full view */}
//       {onViewAll && (
//         <div style={{
//           display: 'flex',
//           gap: '12px',
//           marginBottom: '20px',
//           flexWrap: 'wrap'
//         }}>
//           <Input
//             placeholder="Search transactions..."
//             prefix={<SearchOutlined />}
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             style={{ width: '200px' }}
//           />

//           <Select
//             placeholder="Category"
//             allowClear
//             value={selectedCategory}
//             onChange={setSelectedCategory}
//             style={{ width: '150px' }}
//           >
//             <Option value="Groceries">Groceries</Option>
//             <Option value="Dining Out">Dining Out</Option>
//             <Option value="Transportation">Transportation</Option>
//             <Option value="Entertainment">Entertainment</Option>
//             <Option value="Housing">Housing</Option>
//             <Option value="Shopping">Shopping</Option>
//           </Select>

//           <RangePicker
//             // value={dateRange}
//             // onChange={setDateRange}
//             style={{ width: '240px' }}
//           />
//         </div>
//       )}

//       {/* Transactions List */}
//       <div style={{ maxHeight: onViewAll ? '600px' : 'none', overflowY: 'auto' }}>
//         {filteredTransactions.map((transaction, index) => {
//           const { icon, bgColor } = getTransactionIcon(transaction.category);
//           const isIncome = transaction.amount > 0;

//           return (
//             <div
//               key={transaction.id}
//               style={{
//                 display: 'grid',
//                 gridTemplateColumns: '40px 1fr auto',
//                 gap: '12px',
//                 alignItems: 'center',
//                 padding: '12px 0',
//                 borderBottom: index < filteredTransactions.length - 1 ? '1px solid #f3f4f6' : 'none',
//                 cursor: 'pointer',
//                 transition: 'background-color 0.2s ease'
//               }}
//               onMouseEnter={(e) => {
//                 e.currentTarget.style.backgroundColor = '#f8fafc';
//               }}
//               onMouseLeave={(e) => {
//                 e.currentTarget.style.backgroundColor = 'transparent';
//               }}
//             >
//               <div style={{
//                 width: '40px',
//                 height: '40px',
//                 borderRadius: '8px',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 fontSize: '20px',
//                 background: bgColor
//               }}>
//                 {icon}
//               </div>

//               <div style={{ display: 'flex', flexDirection: 'column' }}>
//                 <div style={{
//                   fontWeight: '500',
//                   fontSize: '14px',
//                   marginBottom: '2px'
//                 }}>
//                   {transaction.merchantName || transaction.description}
//                 </div>
//                 <div style={{
//                   fontSize: '12px',
//                   color: '#6b7280'
//                 }}>
//                   {transaction.category} • {formatDate(transaction.date)}
//                 </div>
//               </div>

//               <div style={{ textAlign: 'right' }}>
//                 <div style={{
//                   fontWeight: '600',
//                   fontSize: '14px',
//                   color: isIncome ? '#10b981' : '#ef4444',
//                   marginBottom: '2px'
//                 }}>
//                   {isIncome ? '+' : ''}{formatCurrency(transaction.amount)}
//                 </div>
//                 <div style={{
//                   fontSize: '12px',
//                   color: '#6b7280'
//                 }}>
//                   {transaction.account?.name}
//                 </div>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {filteredTransactions.length === 0 && (
//         <div style={{
//           textAlign: 'center',
//           padding: '40px',
//           color: '#666'
//         }}>
//           <p>No transactions found</p>
//         </div>
//       )}
//     </div>
//   );
// };
// import { PlusOutlined } from '@ant-design/icons';

// const AccountsGrid: React.FC = () => {
//   const [accountsData, setAccountsData] = useState<any>(null);
//   const [loading, setLoading] = useState(false);
//   const [selectedAccount, setSelectedAccount] = useState<any>(null);
//   const { session } = useQuilttSession();

//   useEffect(() => {
//     if (session) {
//       fetchAccountsData();
//     }
//   }, [session]);

//   const fetchAccountsData = async () => {
//     setLoading(true);
//     try {
//       const response = await getAccountsSummary({ session });
//       setAccountsData(response.data);
//     } catch (error) {
//       console.error('Error fetching accounts data:', error);
//       // Use sample data for demo
//       setSampleAccountsData();
//     } finally {
//       setLoading(false);
//     }
//   };

//   const setSampleAccountsData = () => {
//     setAccountsData({
//       net_worth: {
//         total_assets: 72543.87,
//         total_liabilities: 25000.00,
//         net_worth: 47543.87,
//         monthly_cash_flow: -506.55
//       },
//       account_categories: [
//         {
//           category: 'cash',
//           name: 'Cash Accounts',
//           total: 12543.87,
//           accounts: [
//             { id: 'chase-checking', name: 'Chase Checking', balance: 4856.23, type: 'Checking Account', institution: 'Chase' },
//             { id: 'chase-savings', name: 'Chase Savings', balance: 7687.64, type: 'Savings Account', institution: 'Chase' }
//           ]
//         },
//         {
//           category: 'credit',
//           name: 'Credit Cards',
//           total: -3250.00,
//           accounts: [
//             { id: 'visa-card', name: 'Visa Card', balance: -1414.58, type: 'Credit Card', institution: 'Visa', limit: 5000 },
//             { id: 'amex-card', name: 'Amex Card', balance: -1835.42, type: 'Credit Card', institution: 'American Express', limit: 10000 }
//           ]
//         },
//         {
//           category: 'investment',
//           name: 'Investments',
//           total: 60000.00,
//           accounts: [
//             { id: 'fidelity-401k', name: 'Fidelity 401(k)', balance: 42350.00, type: 'Retirement', institution: 'Fidelity' },
//             { id: 'vanguard-ira', name: 'Vanguard IRA', balance: 17650.00, type: 'Retirement', institution: 'Vanguard' }
//           ]
//         },
//         {
//           category: 'loans',
//           name: 'Loans',
//           total: -21750.00,
//           accounts: [
//             { id: 'student-loan', name: 'Student Loan', balance: -16250.00, type: 'Student Loan', institution: 'Sallie Mae' },
//             { id: 'auto-loan', name: 'Auto Loan', balance: -5500.00, type: 'Auto Loan', institution: 'Toyota Financial' }
//           ]
//         }
//       ]
//     });
//   };

//   const getInstitutionLogo = (institution: string) => {
//     const logoMap: { [key: string]: { bg: string; text: string } } = {
//       'Chase': { bg: '#2563eb', text: 'C' },
//       'Visa': { bg: '#1e40af', text: 'V' },
//       'American Express': { bg: '#059669', text: 'A' },
//       'Fidelity': { bg: '#7c3aed', text: 'F' },
//       'Vanguard': { bg: '#0891b2', text: 'V' },
//       'Sallie Mae': { bg: '#dc2626', text: 'S' },
//       'Toyota Financial': { bg: '#ea580c', text: 'T' }
//     };

//     return logoMap[institution] || { bg: '#6b7280', text: institution.charAt(0) };
//   };

//   const getCategoryColor = (category: string) => {
//     const colorMap: { [key: string]: string } = {
//       'cash': '#10b981',
//       'credit': '#ef4444',
//       'investment': '#8b5cf6',
//       'loans': '#f59e0b'
//     };

//     return colorMap[category] || '#6b7280';
//   };

//   if (!accountsData) {
//     return <div>Loading accounts...</div>;
//   }

//   return (
//     <div style={{
//       background: 'white',
//       padding: '24px',
//       borderRadius: '12px',
//       boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
//     }}>
//       <div style={{
//         display: 'flex',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         marginBottom: '24px'
//       }}>
//         <h2 style={{
//           fontSize: '20px',
//           fontWeight: '600',
//           margin: 0
//         }}>
//           Accounts & Net Worth
//         </h2>
//         <Button
//           type="primary"
//           icon={<PlusOutlined />}
//           size="middle"
//         >
//           Add Account
//         </Button>
//       </div>

//       {/* Net Worth Summary */}
//       <div style={{
//         display: 'grid',
//         gridTemplateColumns: 'repeat(4, 1fr)',
//         gap: '20px',
//         padding: '20px',
//         background: '#f8fafc',
//         borderRadius: '8px',
//         marginBottom: '24px'
//       }}>
//         <div style={{ textAlign: 'center' }}>
//           <div style={{
//             fontSize: '14px',
//             color: '#6b7280',
//             marginBottom: '8px'
//           }}>
//             Net Worth
//           </div>
//           <div style={{
//             fontSize: '24px',
//             fontWeight: '600',
//             color: '#10b981'
//           }}>
//             {formatCurrency(accountsData.net_worth.net_worth)}
//           </div>
//         </div>

//         <div style={{ textAlign: 'center' }}>
//           <div style={{
//             fontSize: '14px',
//             color: '#6b7280',
//             marginBottom: '8px'
//           }}>
//             Total Assets
//           </div>
//           <div style={{
//             fontSize: '24px',
//             fontWeight: '600'
//           }}>
//             {formatCurrency(accountsData.net_worth.total_assets)}
//           </div>
//         </div>

//         <div style={{ textAlign: 'center' }}>
//           <div style={{
//             fontSize: '14px',
//             color: '#6b7280',
//             marginBottom: '8px'
//           }}>
//             Total Liabilities
//           </div>
//           <div style={{
//             fontSize: '24px',
//             fontWeight: '600',
//             color: '#ef4444'
//           }}>
//             {formatCurrency(Math.abs(accountsData.net_worth.total_liabilities))}
//           </div>
//         </div>

//         <div style={{ textAlign: 'center' }}>
//           <div style={{
//             fontSize: '14px',
//             color: '#6b7280',
//             marginBottom: '8px'
//           }}>
//             Monthly Cash Flow
//           </div>
//           <div style={{
//             fontSize: '24px',
//             fontWeight: '600',
//             color: accountsData.net_worth.monthly_cash_flow > 0 ? '#10b981' : '#ef4444'
//           }}>
//             {formatCurrency(accountsData.net_worth.monthly_cash_flow)}
//           </div>
//         </div>
//       </div>

//       {/* Accounts Grid */}
//       <div style={{
//         display: 'grid',
//         gridTemplateColumns: 'repeat(2, 1fr)',
//         gap: '24px'
//       }}>
//         {accountsData.account_categories.map((category: any, index: number) => (
//           <div
//             key={index}
//             style={{
//               border: '1px solid #e5e7eb',
//               borderRadius: '8px',
//               padding: '20px'
//             }}
//           >
//             <div style={{
//               display: 'flex',
//               justifyContent: 'space-between',
//               alignItems: 'center',
//               marginBottom: '16px'
//             }}>
//               <h3 style={{
//                 fontWeight: '600',
//                 fontSize: '16px',
//                 margin: 0
//               }}>
//                 {category.name}
//               </h3>
//               <span style={{
//                 fontSize: '18px',
//                 fontWeight: '600',
//                 color: getCategoryColor(category.category)
//               }}>
//                 {formatCurrency(category.total)}
//               </span>
//             </div>

//             <div style={{
//               display: 'flex',
//               flexDirection: 'column',
//               gap: '12px'
//             }}>
//               {category.accounts.map((account: any, accountIndex: number) => {
//                 const logo = getInstitutionLogo(account.institution);
//                 const isCredit = category.category === 'credit';
//                 const utilizationPercentage = isCredit && account.limit ?
//                   Math.abs(account.balance) / account.limit * 100 : 0;

//                 return (
//                   <div
//                     key={accountIndex}
//                     onClick={() => setSelectedAccount(account)}
//                     style={{
//                       display: 'flex',
//                       alignItems: 'center',
//                       padding: '12px',
//                       background: '#f8fafc',
//                       borderRadius: '8px',
//                       cursor: 'pointer',
//                       transition: 'all 0.2s ease'
//                     }}
//                     onMouseEnter={(e) => {
//                       e.currentTarget.style.background = '#e2e8f0';
//                     }}
//                     onMouseLeave={(e) => {
//                       e.currentTarget.style.background = '#f8fafc';
//                     }}
//                   >
//                     <div style={{
//                       width: '40px',
//                       height: '40px',
//                       borderRadius: '8px',
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                       marginRight: '12px',
//                       fontWeight: '600',
//                       color: 'white',
//                       background: logo.bg
//                     }}>
//                       {logo.text}
//                     </div>

//                     <div style={{ flex: 1 }}>
//                       <div style={{
//                         fontWeight: '500',
//                         fontSize: '14px',
//                         marginBottom: '2px'
//                       }}>
//                         {account.name}
//                       </div>
//                       <div style={{
//                         fontSize: '12px',
//                         color: '#6b7280'
//                       }}>
//                         {account.type}
//                       </div>

//                       {/* Credit utilization bar */}
//                       {isCredit && account.limit && (
//                         <div style={{ marginTop: '4px' }}>
//                           <div style={{
//                             display: 'flex',
//                             justifyContent: 'space-between',
//                             fontSize: '10px',
//                             color: '#6b7280',
//                             marginBottom: '2px'
//                           }}>
//                             <span>Utilization</span>
//                             <span>{utilizationPercentage.toFixed(0)}%</span>
//                           </div>
//                           <div style={{
//                             width: '100%',
//                             height: '4px',
//                             background: '#e5e7eb',
//                             borderRadius: '2px',
//                             overflow: 'hidden'
//                           }}>
//                             <div style={{
//                               height: '100%',
//                               background: utilizationPercentage > 30 ? '#ef4444' : '#10b981',
//                               width: `${utilizationPercentage}%`,
//                               borderRadius: '2px',
//                               transition: 'width 0.3s ease'
//                             }} />
//                           </div>
//                         </div>
//                       )}
//                     </div>

//                     <div style={{
//                       fontWeight: '600',
//                       fontSize: '14px',
//                       color: account.balance < 0 ? '#ef4444' : '#000'
//                     }}>
//                       {formatCurrency(account.balance)}
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Account Details Modal */}
//       <Modal
//         title={selectedAccount?.name}
//         open={!!selectedAccount}
//         onCancel={() => setSelectedAccount(null)}
//         footer={null}
//         width={500}
//       >
//         {selectedAccount && (
//           <div style={{ padding: '20px 0' }}>
//             <div style={{
//               display: 'grid',
//               gridTemplateColumns: 'repeat(2, 1fr)',
//               gap: '16px',
//               marginBottom: '20px'
//             }}>
//               <div>
//                 <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
//                   Account Type
//                 </div>
//                 <div style={{ fontWeight: '500' }}>
//                   {selectedAccount.type}
//                 </div>
//               </div>

//               <div>
//                 <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
//                   Institution
//                 </div>
//                 <div style={{ fontWeight: '500' }}>
//                   {selectedAccount.institution}
//                 </div>
//               </div>

//               <div>
//                 <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
//                   Current Balance
//                 </div>
//                 <div style={{
//                   fontWeight: '600',
//                   fontSize: '18px',
//                   color: selectedAccount.balance < 0 ? '#ef4444' : '#10b981'
//                 }}>
//                   {formatCurrency(selectedAccount.balance)}
//                 </div>
//               </div>

//               {selectedAccount.limit && (
//                 <div>
//                   <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
//                     Credit Limit
//                   </div>
//                   <div style={{ fontWeight: '500' }}>
//                     {formatCurrency(selectedAccount.limit)}
//                   </div>
//                 </div>
//               )}
//             </div>

//             <div style={{
//               display: 'flex',
//               gap: '8px',
//               marginTop: '20px'
//             }}>
//               <Button type="primary">View Transactions</Button>
//               <Button>Account Settings</Button>
//             </div>
//           </div>
//         )}
//       </Modal>
//     </div>
//   );
// };
// import { TrophyOutlined } from '@ant-design/icons';

// const FinancialGoals: React.FC = () => {
//   const [goals, setGoals] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [newGoal, setNewGoal] = useState({
//     name: '',
//     target_amount: '',
//     target_date: null,
//     goal_type: 'savings'
//   });
//   const { session } = useQuilttSession();

//   useEffect(() => {
//     if (session) {
//       fetchGoals();
//     }
//   }, [session]);

//   const fetchGoals = async () => {
//     setLoading(true);
//     try {
//       const response = await getFinancialGoals({ session });
//       setGoals(response.data.goals || []);
//     } catch (error) {
//       console.error('Error fetching goals:', error);
//       setSampleGoals();
//     } finally {
//       setLoading(false);
//     }
//   };

//   const setSampleGoals = () => {
//     setGoals([
//       {
//         id: 'emergency-fund',
//         name: 'Emergency Fund',
//         target_amount: 25000.00,
//         current_amount: 18500.00,
//         progress_percentage: 74,
//         status: 'ongoing',
//         goal_type: 'savings'
//       },
//       {
//         id: 'vacation-fund',
//         name: 'Vacation Fund',
//         target_amount: 3000.00,
//         current_amount: 1800.00,
//         progress_percentage: 60,
//         status: 'ongoing',
//         target_date: '2025-06-01',
//         goal_type: 'savings'
//       },
//       {
//         id: 'student-loan',
//         name: 'Student Loan',
//         target_amount: 25000.00,
//         current_amount: 8750.00,
//         remaining_amount: 16250.00,
//         progress_percentage: 35,
//         status: 'debt',
//         goal_type: 'debt_payoff'
//       }
//     ]);
//   };

//   const getGoalStatusColor = (status: string, goalType: string) => {
//     if (goalType === 'debt_payoff') return '#ef4444';

//     const colorMap: { [key: string]: string } = {
//       'ongoing': '#1890ff',
//       'completed': '#52c41a',
//       'paused': '#faad14'
//     };

//     return colorMap[status] || '#1890ff';
//   };

//   const getGoalIcon = (goalType: string) => {
//     const iconMap: { [key: string]: string } = {
//       'savings': '💰',
//       'debt_payoff': '💳',
//       'investment': '📈',
//       'purchase': '🛍️'
//     };

//     return iconMap[goalType] || '🎯';
//   };

//   const handleAddGoal = () => {
//     // Implementation for adding new goal
//     console.log('Adding new goal:', newGoal);
//     setShowAddModal(false);
//     setNewGoal({
//       name: '',
//       target_amount: '',
//       target_date: null,
//       goal_type: 'savings'
//     });
//   };

//   return (
//     <div style={{
//       background: 'white',
//       padding: '24px',
//       borderRadius: '12px',
//       boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
//     }}>
//       <div style={{
//         display: 'flex',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         marginBottom: '20px'
//       }}>
//         <h2 style={{
//           fontSize: '20px',
//           fontWeight: '600',
//           margin: 0
//         }}>
//           Financial Goals
//         </h2>
//         <Button
//           type="link"
//           icon={<PlusOutlined />}
//           onClick={() => setShowAddModal(true)}
//           style={{ padding: 0, fontSize: '14px' }}
//         >
//           Add Goal
//         </Button>
//       </div>

//       {/* Goals List */}
//       <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
//         {goals.map((goal, index) => {
//           const isDebt = goal.goal_type === 'debt_payoff';
//           const progressColor = getGoalStatusColor(goal.status, goal.goal_type);
//           const icon = getGoalIcon(goal.goal_type);

//           return (
//             <div
//               key={goal.id}
//               style={{
//                 marginBottom: '20px',
//                 paddingBottom: '20px',
//                 borderBottom: index < goals.length - 1 ? '1px solid #f3f4f6' : 'none'
//               }}
//             >
//               <div style={{
//                 display: 'flex',
//                 justifyContent: 'space-between',
//                 alignItems: 'flex-start',
//                 marginBottom: '12px'
//               }}>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//                   <span style={{ fontSize: '20px' }}>{icon}</span>
//                   <div>
//                     <div style={{
//                       fontWeight: '600',
//                       fontSize: '16px',
//                       marginBottom: '2px'
//                     }}>
//                       {goal.name}
//                     </div>
//                     {goal.target_date && (
//                       <div style={{
//                         fontSize: '12px',
//                         color: '#6b7280'
//                       }}>
//                         Target: {new Date(goal.target_date).toLocaleDateString()}
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 <div style={{
//                   fontSize: '12px',
//                   padding: '4px 8px',
//                   borderRadius: '4px',
//                   background: progressColor === '#ef4444' ? '#fee2e2' :
//                     progressColor === '#52c41a' ? '#f6ffed' : '#e6f7ff',
//                   color: progressColor === '#ef4444' ? '#991b1b' :
//                     progressColor === '#52c41a' ? '#389e0d' : '#1890ff',
//                   fontWeight: '500'
//                 }}>
//                   {isDebt ? 'Debt' : goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
//                 </div>
//               </div>

//               {/* Progress Bar */}
//               <div style={{ marginBottom: '8px' }}>
//                 <Progress
//                   percent={goal.progress_percentage}
//                   strokeColor={progressColor}
//                   trailColor="#f5f5f5"
//                   size="small"
//                   showInfo={false}
//                 />
//               </div>

//               {/* Goal Amounts */}
//               <div style={{
//                 display: 'flex',
//                 justifyContent: 'space-between',
//                 fontSize: '14px',
//                 color: '#6b7280'
//               }}>
//                 {isDebt ? (
//                   <>
//                     <span>{formatCurrency(goal.current_amount)} paid</span>
//                     <span>{formatCurrency(goal.remaining_amount)} remaining</span>
//                   </>
//                 ) : (
//                   <>
//                     <span>{formatCurrency(goal.current_amount)}</span>
//                     <span>{formatCurrency(goal.target_amount)}</span>
//                   </>
//                 )}
//               </div>

//               {/* Progress Details */}
//               <div style={{
//                 fontSize: '12px',
//                 color: '#6b7280',
//                 marginTop: '4px',
//                 textAlign: 'center'
//               }}>
//                 {isDebt ?
//                   `${goal.progress_percentage}% paid off` :
//                   `${goal.progress_percentage}% of goal achieved`
//                 }
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {goals.length === 0 && (
//         <div style={{
//           textAlign: 'center',
//           padding: '40px',
//           color: '#666'
//         }}>
//           <TrophyOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
//           <p>No financial goals set yet</p>
//           <Button
//             type="primary"
//             onClick={() => setShowAddModal(true)}
//             style={{ marginTop: '8px' }}
//           >
//             Set Your First Goal
//           </Button>
//         </div>
//       )}

//       {/* Add Goal Modal */}
//       <Modal
//         title="Add Financial Goal"
//         open={showAddModal}
//         onOk={handleAddGoal}
//         onCancel={() => setShowAddModal(false)}
//         okText="Create Goal"
//         width={500}
//       >
//         <div style={{ padding: '20px 0' }}>
//           <div style={{ marginBottom: '16px' }}>
//             <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
//               Goal Name
//             </label>
//             <Input
//               value={newGoal.name}
//               onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
//               placeholder="e.g., Emergency Fund, Vacation, New Car"
//             />
//           </div>

//           <div style={{ marginBottom: '16px' }}>
//             <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
//               Goal Type
//             </label>
//             <Select
//               value={newGoal.goal_type}
//               onChange={(value) => setNewGoal({ ...newGoal, goal_type: value })}
//               style={{ width: '100%' }}
//             >
//               <Option value="savings">Savings Goal</Option>
//               <Option value="debt_payoff">Debt Payoff</Option>
//               <Option value="investment">Investment</Option>
//               <Option value="purchase">Major Purchase</Option>
//             </Select>
//           </div>

//           <div style={{ marginBottom: '16px' }}>
//             <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
//               Target Amount
//             </label>
//             <Input
//               value={newGoal.target_amount}
//               onChange={(e) => setNewGoal({ ...newGoal, target_amount: e.target.value })}
//               placeholder="$10,000"
//               prefix="$"
//             />
//           </div>

//           <div style={{ marginBottom: '16px' }}>
//             <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
//               Target Date (Optional)
//             </label>
//             <DatePicker
//               value={newGoal.target_date}
//               onChange={(date) => setNewGoal({ ...newGoal, target_date: date })}
//               style={{ width: '100%' }}
//               placeholder="Select target date"
//             />
//           </div>
//         </div>
//       </Modal>
//     </div>
//   );
// };
// import { Switch } from 'antd';
// import { SettingOutlined, CalendarOutlined } from '@ant-design/icons';

// const RecurringTransactions: React.FC = () => {
//   const [recurringTransactions, setRecurringTransactions] = useState<any[]>([]);

//   useEffect(() => {
//     // Set sample recurring transactions data
//     setRecurringTransactions([
//       {
//         id: '1',
//         name: 'Internet Bill',
//         merchant: 'Xfinity',
//         amount: -89.99,
//         frequency: 'Monthly',
//         next_date: '2025-04-23',
//         status: 'due_soon',
//         auto_pay: false
//       },
//       {
//         id: '2',
//         name: 'Cell Phone',
//         merchant: 'Verizon',
//         amount: -142.50,
//         frequency: 'Monthly',
//         next_date: '2025-04-25',
//         status: 'due_soon',
//         auto_pay: false
//       },
//       {
//         id: '3',
//         name: 'Amex Credit Card',
//         merchant: 'American Express',
//         amount: 1835.42,
//         frequency: 'Monthly',
//         next_date: '2025-05-01',
//         status: 'auto_pay',
//         auto_pay: true
//       },
//       {
//         id: '4',
//         name: 'Car Insurance',
//         merchant: 'Progressive',
//         amount: -132.50,
//         frequency: 'Monthly',
//         next_date: '2025-05-05',
//         status: 'auto_pay',
//         auto_pay: true
//       },
//       {
//         id: '5',
//         name: 'Student Loan',
//         merchant: 'Sallie Mae',
//         amount: -285.00,
//         frequency: 'Monthly',
//         next_date: '2025-05-15',
//         status: 'auto_pay',
//         auto_pay: true
//       }
//     ]);
//   }, []);

//   const getStatusTag = (status: string) => {
//     const statusConfig: { [key: string]: { color: string; text: string } } = {
//       'due_soon': { color: 'orange', text: 'Due Soon' },
//       'auto_pay': { color: 'green', text: 'Auto-Pay' },
//       'overdue': { color: 'red', text: 'Overdue' },
//       'paid': { color: 'blue', text: 'Paid' }
//     };

//     const config = statusConfig[status] || { color: 'default', text: 'Unknown' };

//     return (
//       <Tag color={config.color} style={{ fontSize: '11px', fontWeight: '500' }}>
//         {config.text}
//       </Tag>
//     );
//   };

//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     const day = date.getDate();
//     const month = date.toLocaleDateString('en-US', { month: 'short' });

//     return { day, month };
//   };

//   const toggleAutoPay = (id: string, currentStatus: boolean) => {
//     setRecurringTransactions(prev =>
//       prev.map(transaction =>
//         transaction.id === id
//           ? {
//             ...transaction,
//             auto_pay: !currentStatus,
//             status: !currentStatus ? 'auto_pay' : 'due_soon'
//           }
//           : transaction
//       )
//     );
//   };

//   return (
//     <div style={{
//       background: 'white',
//       padding: '24px',
//       borderRadius: '12px',
//       boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
//     }}>
//       <div style={{
//         display: 'flex',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         marginBottom: '20px'
//       }}>
//         <h2 style={{
//           fontSize: '20px',
//           fontWeight: '600',
//           margin: 0
//         }}>
//           Recurring Transactions
//         </h2>
//         <Button
//           type="link"
//           icon={<SettingOutlined />}
//           style={{ padding: 0, fontSize: '14px' }}
//         >
//           Manage
//         </Button>
//       </div>

//       {/* Recurring Transactions List */}
//       <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
//         {recurringTransactions.map((transaction, index) => {
//           const { day, month } = formatDate(transaction.next_date);
//           const isPositive = transaction.amount > 0;

//           return (
//             <div
//               key={transaction.id}
//               style={{
//                 display: 'flex',
//                 alignItems: 'center',
//                 padding: '12px 0',
//                 borderBottom: index < recurringTransactions.length - 1 ? '1px solid #f3f4f6' : 'none'
//               }}
//             >
//               {/* Date */}
//               <div style={{
//                 width: '48px',
//                 height: '48px',
//                 background: '#f3f4f6',
//                 borderRadius: '8px',
//                 display: 'flex',
//                 flexDirection: 'column',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 marginRight: '12px'
//               }}>
//                 <div style={{
//                   fontSize: '18px',
//                   fontWeight: '600',
//                   lineHeight: 1
//                 }}>
//                   {day}
//                 </div>
//                 <div style={{
//                   fontSize: '11px',
//                   color: '#6b7280',
//                   textTransform: 'uppercase'
//                 }}>
//                   {month}
//                 </div>
//               </div>

//               {/* Transaction Details */}
//               <div style={{ flex: 1 }}>
//                 <div style={{
//                   fontWeight: '500',
//                   fontSize: '14px',
//                   marginBottom: '2px'
//                 }}>
//                   {transaction.name}
//                 </div>
//                 <div style={{
//                   fontSize: '12px',
//                   color: '#6b7280',
//                   marginBottom: '4px'
//                 }}>
//                   {transaction.merchant} • {transaction.frequency}
//                 </div>

//                 {/* Auto-pay toggle */}
//                 <div style={{
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: '8px'
//                 }}>
//                   <Switch
//                     size="small"
//                     checked={transaction.auto_pay}
//                     onChange={() => toggleAutoPay(transaction.id, transaction.auto_pay)}
//                   />
//                   <span style={{ fontSize: '12px', color: '#6b7280' }}>
//                     Auto-pay
//                   </span>
//                 </div>
//               </div>

//               {/* Amount and Status */}
//               <div style={{ textAlign: 'right' }}>
//                 <div style={{
//                   fontWeight: '600',
//                   fontSize: '14px',
//                   color: isPositive ? '#10b981' : '#000',
//                   marginBottom: '4px'
//                 }}>
//                   {formatCurrency(transaction.amount)}
//                 </div>
//                 {getStatusTag(transaction.status)}
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* Summary Stats */}
//       <div style={{
//         marginTop: '16px',
//         padding: '12px',
//         background: '#f8fafc',
//         borderRadius: '6px',
//         display: 'flex',
//         justifyContent: 'space-between',
//         alignItems: 'center'
//       }}>
//         <div style={{ textAlign: 'center', flex: 1 }}>
//           <div style={{ fontSize: '12px', color: '#6b7280' }}>
//             Monthly Bills
//           </div>
//           <div style={{ fontSize: '16px', fontWeight: '600', color: '#ef4444' }}>
//             $650.00
//           </div>
//         </div>

//         <div style={{
//           width: '1px',
//           height: '32px',
//           background: '#e5e7eb',
//           margin: '0 12px'
//         }} />

//         <div style={{ textAlign: 'center', flex: 1 }}>
//           <div style={{ fontSize: '12px', color: '#6b7280' }}>
//             Auto-Pay Enabled
//           </div>
//           <div style={{ fontSize: '16px', fontWeight: '600', color: '#10b981' }}>
//             3 of 5
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };