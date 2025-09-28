'use client';
import React, { useState, useEffect } from 'react';
import { Home, Gift, DollarSign, Eye, Edit3, ArrowRightLeft } from 'lucide-react';
import { Button, Modal, Table, Select, Input } from 'antd';
import { generateMonthlyBudget, updateMonthlyBudget, updateTransactionCategory } from '../../services/apiConfig';
const FONT_FAMILY = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

type Transaction = { transaction_id: string; description: string; amount: number; categoryname?: 'Needs' | 'Wants' | 'Savings'; category?: string; date: string };
type BudgetCategory = { spent: number; budget: number; transactions: Transaction[]; count: number };
type BudgetSummary = { spent: number; total: number };
type SpendingCategory = { name: string; spent: number; budget: number; type: string; icon: string };
type BudgetData = {
  budget_categories: { Needs: BudgetCategory; Wants: BudgetCategory; Savings: BudgetCategory; Others?: BudgetCategory };
  budget_summary: { Needs: BudgetSummary; Wants: BudgetSummary; Savings: BudgetSummary; Others?: BudgetSummary };
  spending_by_category: SpendingCategory[];
  message: string;
  status?: number;
  error?: string;
};

const { Option } = Select;

const MonthlyBudget: React.FC = () => {
  const [budgetData, setBudgetData] = useState<BudgetData>({
    budget_categories: {
      Needs: { spent: 0, budget: 0, transactions: [], count: 0 },
      Wants: { spent: 0, budget: 0, transactions: [], count: 0 },
      Savings: { spent: 0, budget: 0, transactions: [], count: 0 },
    },
    budget_summary: {
      Needs: { spent: 0, total: 0 },
      Wants: { spent: 0, total: 0 },
      Savings: { spent: 0, total: 0 },
    },
    spending_by_category: [],
    message: '',
  });
  const [loading, setLoading] = useState(true);
  const [uid] = useState('user123');
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [showEditBudgetModal, setShowEditBudgetModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryTransactions, setCategoryTransactions] = useState<Transaction[]>([]);
  const [budgetInputs, setBudgetInputs] = useState({
    Needs: 50,
    Wants: 30,
    Savings: 20,
  });
  const [totalBudget, setTotalBudget] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const budgetResponse = await generateMonthlyBudget({ uid });
        if (budgetResponse.data.status === 1) {
          const filteredData = {
            ...budgetResponse.data,
            budget_categories: {
              Needs: {
                ...budgetResponse.data.budget_categories.Needs,
                transactions: budgetResponse.data.budget_categories.Needs.transactions.filter(
                  (txn: Transaction) => !['Transfers', 'Accounts'].includes(txn.category ?? '')
                ),
                count: budgetResponse.data.budget_categories.Needs.transactions.filter(
                  (txn: Transaction) => !['Transfers', 'Accounts'].includes(txn.category ?? '')
                ).length,
              },
              Wants: {
                ...budgetResponse.data.budget_categories.Wants,
                transactions: budgetResponse.data.budget_categories.Wants.transactions.filter(
                  (txn: Transaction) => !['Transfers', 'Accounts'].includes(txn.category ?? '')
                ),
                count: budgetResponse.data.budget_categories.Wants.transactions.filter(
                  (txn: Transaction) => !['Transfers', 'Accounts'].includes(txn.category ?? '')
                ).length,
              },
              Savings: {
                ...budgetResponse.data.budget_categories.Savings,
                transactions: budgetResponse.data.budget_categories.Savings.transactions.filter(
                  (txn: Transaction) => !['Transfers', 'Accounts'].includes(txn.category ?? '')
                ),
                count: budgetResponse.data.budget_categories.Savings.transactions.filter(
                  (txn: Transaction) => !['Transfers', 'Accounts'].includes(txn.category ?? '')
                ).length,
              },
              Others: budgetResponse.data.budget_categories.Others || { spent: 0, budget: 0, transactions: [], count: 0 },
            },
            budget_summary: {
              Needs: budgetResponse.data.budget_summary.Needs || { spent: 0, total: 0 },
              Wants: budgetResponse.data.budget_summary.Wants || { spent: 0, total: 0 },
              Savings: budgetResponse.data.budget_summary.Savings || { spent: 0, total: 0 },
              Others: budgetResponse.data.budget_summary.Others || { spent: 0, total: 0 },
            },
            spending_by_category: budgetResponse.data.spending_by_category.filter(
              (item: { name: string }) => !['Transfers', 'Accounts'].includes(item.name)
            ),
          };
          setBudgetData(filteredData);
          const total =
            filteredData.budget_summary.Needs.total +
            filteredData.budget_summary.Wants.total +
            filteredData.budget_summary.Savings.total;
          setTotalBudget(total);
        }
      } catch (error) {
        console.error('Error fetching budget data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [uid]);

  const getIcon = (iconName: string, size = 14) => {
    const iconProps = { size, strokeWidth: 1.5 };
    const iconMap: Record<string, JSX.Element> = {
      Home: <Home {...iconProps} />,
      Gift: <Gift {...iconProps} />,
      DollarSign: <DollarSign {...iconProps} />,
      ShoppingCart: <Home {...iconProps} />,
      Car: <Home {...iconProps} />,
      Utensils: <Gift {...iconProps} />,
      ShoppingBag: <Gift {...iconProps} />,
      Smartphone: <Gift {...iconProps} />,
      Shield: <DollarSign {...iconProps} />,
      TrendingUp: <DollarSign {...iconProps} />,
      Target: <DollarSign {...iconProps} />,
    };
    return iconMap[iconName] || <Home {...iconProps} />;
  };

  const categoryConfig = {
    Needs: { title: 'Needs', bgColor: '#F0F9FF', borderColor: '#E0F2FE', textColor: '#0369A1', progressColor: '#0EA5E9', icon: 'Home' },
    Wants: { title: 'Wants', bgColor: '#FFFBEB', borderColor: '#FEF3C7', textColor: '#D97706', progressColor: '#F59E0B', icon: 'Gift' },
    Savings: { title: 'Savings', bgColor: '#F0FDF4', borderColor: '#DCFCE7', textColor: '#16A34A', progressColor: '#22C55E', icon: 'DollarSign' },
  };

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

  const handleViewTransactions = (category: string) => {
    setSelectedCategory(category);
    let transactions: Transaction[] = [];
    if (category === 'Needs') {
      transactions = budgetData.budget_categories.Needs.transactions || [];
    } else if (category === 'Wants') {
      transactions = budgetData.budget_categories.Wants.transactions || [];
    } else if (category === 'Savings') {
      transactions = budgetData.budget_categories.Savings.transactions || [];
    } else if (category === 'Others') {
      transactions =
        budgetData.budget_categories.Others?.transactions.filter((txn) => !['Transfers', 'Accounts'].includes(txn.category ?? '')) || [];
    } else if (category === 'Transfers') {
      transactions = budgetData.budget_categories.Others?.transactions.filter((txn) => txn.category === 'Transfers') || [];
    }
    setCategoryTransactions(transactions);
    setShowTransactionsModal(true);
  };

  const handleCategoryChange = async (transactionId: string, newCategory: string, description: string) => {
    try {
      const typedCategory = newCategory as 'Needs' | 'Wants' | 'Savings';
      const transactionsToUpdate = budgetData.budget_categories.Others?.transactions
        .filter((txn) => txn.description === description)
        .map((txn) => ({ transaction_id: txn.transaction_id, category: typedCategory }));

      for (const { transaction_id, category } of transactionsToUpdate || []) {
        await updateTransactionCategory(transaction_id, category, { uid, transaction_id, category });
      }

      const updatedBudget = await generateMonthlyBudget({ uid });
      const filteredUpdatedBudget = {
        ...updatedBudget.data,
        budget_categories: {
          Needs: {
            ...updatedBudget.data.budget_categories.Needs,
            transactions: updatedBudget.data.budget_categories.Needs.transactions.filter(
              (txn: Transaction) => !['Transfers', 'Accounts'].includes(txn.category ?? '')
            ),
            count: updatedBudget.data.budget_categories.Needs.transactions.filter(
              (txn: Transaction) => !['Transfers', 'Accounts'].includes(txn.category ?? '')
            ).length,
          },
          Wants: {
            ...updatedBudget.data.budget_categories.Wants,
            transactions: updatedBudget.data.budget_categories.Wants.transactions.filter(
              (txn: Transaction) => !['Transfers', 'Accounts'].includes(txn.category ?? '')
            ),
            count: updatedBudget.data.budget_categories.Wants.transactions.filter(
              (txn: Transaction) => !['Transfers', 'Accounts'].includes(txn.category ?? '')
            ).length,
          },
          Savings: {
            ...updatedBudget.data.budget_categories.Savings,
            transactions: updatedBudget.data.budget_categories.Savings.transactions.filter(
              (txn: Transaction) => !['Transfers', 'Accounts'].includes(txn.category ?? '')
            ),
            count: updatedBudget.data.budget_categories.Savings.transactions.filter(
              (txn: Transaction) => !['Transfers', 'Accounts'].includes(txn.category ?? '')
            ).length,
          },
          Others: updatedBudget.data.budget_categories.Others || { spent: 0, budget: 0, transactions: [], count: 0 },
        },
        budget_summary: {
          Needs: updatedBudget.data.budget_summary.Needs || { spent: 0, total: 0 },
          Wants: updatedBudget.data.budget_summary.Wants || { spent: 0, total: 0 },
          Savings: updatedBudget.data.budget_summary.Savings || { spent: 0, total: 0 },
          Others: updatedBudget.data.budget_summary.Others || { spent: 0, total: 0 },
        },
        spending_by_category: updatedBudget.data.spending_by_category.filter(
          (item: { name: string }) => !['Transfers', 'Accounts'].includes(item.name)
        ),
      };
      setBudgetData(filteredUpdatedBudget);
      setCategoryTransactions(
        selectedCategory === 'Needs'
          ? filteredUpdatedBudget.budget_categories.Needs.transactions || []
          : selectedCategory === 'Wants'
          ? filteredUpdatedBudget.budget_categories.Wants.transactions || []
          : selectedCategory === 'Savings'
          ? filteredUpdatedBudget.budget_categories.Savings.transactions || []
          : selectedCategory === 'Others'
          ? filteredUpdatedBudget.budget_categories.Others?.transactions.filter(
              (txn: Transaction) => !['Transfers', 'Accounts'].includes(txn.category ?? '')
            ) || []
          : selectedCategory === 'Transfers'
          ? filteredUpdatedBudget.budget_categories.Others?.transactions.filter((txn: { category: string; }) => txn.category === 'Transfers') || []
          : []
      );
    } catch (error) {
      console.error('Error updating transaction categories:', error);
    }
  };

  const handleBudgetChange = (category: keyof typeof budgetInputs, value: string) => {
    const newValue = Math.max(0, parseFloat(value) || 0);
    const updatedInputs = { ...budgetInputs, [category]: newValue };
    const otherCategories = Object.keys(updatedInputs).filter((key) => key !== category) as (keyof typeof budgetInputs)[];
    let remaining = 100 - newValue;

    if (remaining >= 0) {
      const baseAdjustment = Math.floor(remaining / otherCategories.length);
      let leftover = remaining % otherCategories.length;

      otherCategories.forEach((cat) => {
        updatedInputs[cat] = Math.max(0, baseAdjustment + (leftover-- > 0 ? 1 : 0));
      });
    } else {
      updatedInputs[category] = 100;
      otherCategories.forEach((cat) => (updatedInputs[cat] = 0));
    }

    setBudgetInputs(updatedInputs);
  };

  const handleSaveBudget = async () => {
    try {
      const budgetCategories = {
        Needs: { budget: (budgetInputs.Needs / 100) * totalBudget },
        Wants: { budget: (budgetInputs.Wants / 100) * totalBudget },
        Savings: { budget: (budgetInputs.Savings / 100) * totalBudget },
      };
      await updateMonthlyBudget({ uid, budget_categories: budgetCategories });
      const updatedBudget = await generateMonthlyBudget({ uid });
      const filteredUpdatedBudget = {
        ...updatedBudget.data,
        budget_categories: {
          Needs: {
            ...updatedBudget.data.budget_categories.Needs,
            transactions: updatedBudget.data.budget_categories.Needs.transactions.filter(
              (txn: Transaction) => !['Transfers', 'Accounts'].includes(txn.category ?? '')
            ),
            count: updatedBudget.data.budget_categories.Needs.transactions.filter(
              (txn: Transaction) => !['Transfers', 'Accounts'].includes(txn.category ?? '')
            ).length,
          },
          Wants: {
            ...updatedBudget.data.budget_categories.Wants,
            transactions: updatedBudget.data.budget_categories.Wants.transactions.filter(
              (txn: Transaction) => !['Transfers', 'Accounts'].includes(txn.category ?? '')
            ),
            count: updatedBudget.data.budget_categories.Wants.transactions.filter(
              (txn: Transaction) => !['Transfers', 'Accounts'].includes(txn.category ?? '')
            ).length,
          },
          Savings: {
            ...updatedBudget.data.budget_categories.Savings,
            transactions: updatedBudget.data.budget_categories.Savings.transactions.filter(
              (txn: Transaction) => !['Transfers', 'Accounts'].includes(txn.category ?? '')
            ),
            count: updatedBudget.data.budget_categories.Savings.transactions.filter(
              (txn: Transaction) => !['Transfers', 'Accounts'].includes(txn.category ?? '')
            ).length,
          },
          Others: updatedBudget.data.budget_categories.Others || { spent: 0, budget: 0, transactions: [], count: 0 },
        },
        budget_summary: {
          Needs: updatedBudget.data.budget_summary.Needs || { spent: 0, total: 0 },
          Wants: updatedBudget.data.budget_summary.Wants || { spent: 0, total: 0 },
          Savings: updatedBudget.data.budget_summary.Savings || { spent: 0, total: 0 },
          Others: updatedBudget.data.budget_summary.Others || { spent: 0, total: 0 },
        },
        spending_by_category: updatedBudget.data.spending_by_category.filter(
          (item: { name: string }) => !['Transfers', 'Accounts'].includes(item.name)
        ),
      };
      setBudgetData(filteredUpdatedBudget);
      setTotalBudget(Object.values(budgetCategories).reduce((sum, cat) => sum + cat.budget, 0));
      setShowEditBudgetModal(false);
    } catch (error) {
      console.error('Error saving budget:', error);
    }
  };

  const transactionColumns = [
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', render: (amount: number) => formatAmount(amount) },
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: 'Sub Category', dataIndex: 'category', key: 'category', render: (category: string) => category || 'Unknown' },
    {
      title: 'Category',
      key: 'categoryname',
      render: (_: any, record: Transaction) => (
        <Select
          value={record.categoryname || 'Needs'}
          onChange={(value) => handleCategoryChange(record.transaction_id, value, record.description)}
          style={{ width: '100%' }}
        >
          {Object.keys(categoryConfig).map((key) => (
            <Option key={key} value={key}>
              {categoryConfig[key as keyof typeof categoryConfig].title}
            </Option>
          ))}
        </Select>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ padding: '16px', background: '#FFFFFF', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ animation: 'pulse 1.5s infinite' }}>
          <div style={{ height: '20px', background: '#E5E7EB', borderRadius: '4px', width: '150px', marginBottom: '16px' }}></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{ height: '120px', background: '#E5E7EB', borderRadius: '6px' }}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '24px',
        background: '#FFFFFF',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        maxWidth: '1200px',
        margin: '0 auto',
        marginLeft: '10px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h1 style={{ fontFamily: FONT_FAMILY, fontSize: '18px', fontWeight: 700, color: '#111827' }}>Spend and Savings Tracker</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              color: '#2563EB',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              fontSize: '12px',
              background: '#FFFFFF',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            }}
            onClick={() => setShowEditBudgetModal(true)}
          >
            <Edit3 size={12} /> 
          </Button>
          <Select
            value={selectedCategory || 'View Transactions'}
            onChange={(value) => handleViewTransactions(value)}
            style={{ width: '200px', marginLeft: '8px' }}
            placeholder="View Transactions"
            dropdownStyle={{ minWidth: '200px' }}
          >
            <Option value="Others">Other Transactions</Option>
            <Option value="Transfers">Transfers</Option>
          </Select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
        {['Needs', 'Wants', 'Savings'].map((key) => {
          const config = categoryConfig[key as keyof typeof categoryConfig];
          const categoryData = budgetData.budget_summary[key as keyof typeof budgetData.budget_summary] || { spent: 0, total: 0 };
          const allocation = budgetInputs[key as keyof typeof budgetInputs];
          const spent = categoryData.spent;
          const budget = categoryData.total;
          const spentPerc = allocation > 0 ? Math.min((spent / (budget * (allocation / 100))) * 100, allocation * 0.9) : 0;
          const progress = budget > 0 ? (spent / budget) * 100 : 0;
          const remaining = budget - spent;
          const isOver = spent > budget;
          const statusText = key === 'Savings' ? (progress >= 100 ? 'Goal achieved!' : 'On track!') : isOver ? 'Over budget' : 'On track';
          const statusMessage = remaining >= 0 ? `${formatAmount(remaining)} remaining` : `${formatAmount(Math.abs(remaining))} over budget`;

          return (
            <div
              key={key}
              style={{
                background: config.bgColor,
                border: `1px solid ${config.borderColor}`,
                borderRadius: '8px',
                padding: '12px',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                height: '120px',
                minWidth: '0', // Ensure the container can shrink if needed
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              onClick={() => handleViewTransactions(key)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', minWidth: '0' }}>
                <div style={{ padding: '4px', background: '#FFFFFF', borderRadius: '6px', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)', color: config.textColor }}>
                  {getIcon(config.icon, 12)}
                </div>
                <h3 style={{ fontWeight: '600', color: '#111827', fontSize: '12px', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {config.title} <span style={{ fontWeight: '700', fontSize: '14px' }}>{allocation}%</span>
                </h3>
              </div>
              <div style={{ marginBottom: '8px', minWidth: '0' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {`${spentPerc.toFixed(1)}% of ${allocation}% ${key === 'Savings' ? 'goal' : 'target'}`}
                </div>
              </div>
              <div style={{ background: '#E5E7EB', borderRadius: '999px', height: '4px', marginBottom: '8px' }}>
                <div style={{ width: `${Math.min(progress, 100)}%`, height: '100%', background: config.progressColor, borderRadius: '999px' }} />
              </div>
              <Button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '10px',
                  color: config.textColor,
                  padding: '2px 6px',
                  height: 'auto',
                  border: 'none',
                  background: 'transparent',
                  marginTop: 'auto',
                }}
                type="link"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewTransactions(key);
                }}
              >
                <Eye size={10} /> View Transactions
              </Button>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {['Needs', 'Wants', 'Savings'].map((key) => {
          const config = categoryConfig[key as keyof typeof categoryConfig];
          const breakdownItems = budgetData.spending_by_category.filter((item) => item.type === key);
          const totalCategorySpent = budgetData.budget_summary[key as keyof typeof budgetData.budget_summary]?.spent ?? 0;

          return (
            <div key={key} style={{ background: '#FAFBFC', borderRadius: '6px', padding: '8px', minWidth: '0' }}>
              <h4 style={{ fontSize: '10px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 6px' }}>
                {config.title} Breakdown
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '0' }}>
                {breakdownItems.length > 0 ? (
                  breakdownItems.slice(0, 3).map((item, index) => {
                    const percentage = totalCategorySpent > 0 ? ((item.spent / totalCategorySpent) * 100).toFixed(1) : '0.0';
                    return (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px',
                          background: '#FFFFFF',
                          borderRadius: '4px',
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                          minWidth: '0',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1, minWidth: '0' }}>
                          <div style={{ padding: '3px', background: config.bgColor, borderRadius: '3px', color: config.textColor }}>
                            {getIcon(item.icon, 8)}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: '0' }}>
                            <span
                              style={{
                                fontWeight: '500',
                                color: '#111827',
                                fontSize: '10px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                minWidth: '0',
                              }}
                            >
                              {item.name}
                            </span>
                          </div>
                        </div>
                        <span style={{ fontSize: '10px', fontWeight: '500', color: '#6B7280', marginRight: '8px' }}>{percentage}%</span>
                      </div>
                    );
                  })
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '8px',
                      background: '#FFFFFF',
                      borderRadius: '4px',
                      color: '#9CA3AF',
                      fontSize: '10px',
                    }}
                  >
                    <Home size={10} style={{ marginRight: '4px' }} />
                    No items yet
                  </div>
                )}
                {breakdownItems.length > 3 && (
                  <div style={{ fontSize: '10px', color: '#6B7280', textAlign: 'center', padding: '4px' }}>+{breakdownItems.length - 3} more items</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        visible={showTransactionsModal}
        onCancel={() => setShowTransactionsModal(false)}
        footer={null}
        centered
        bodyStyle={{ padding: '16px', display: 'flex', flexDirection: 'column' }}
        style={{ maxWidth: '1200px', width: '90%' }} // Increased width to 1200px and set width to 90% of viewport
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>{selectedCategory || 'Transaction'} Details</h3>
          <Button
            style={{ padding: '4px', color: '#9CA3AF', border: 'none', background: 'transparent' }}
            type="text"
            onClick={() => setShowTransactionsModal(false)}
          >
            <Edit3 size={12} />
          </Button>
        </div>
        <div>
          {categoryTransactions.length > 0 ? (
            <Table
              columns={transactionColumns}
              dataSource={categoryTransactions}
              rowKey="transaction_id"
              pagination={false}
              size="small"
              style={{ fontSize: '12px' }}
              scroll={{ y: 400, x: '100%' }} // Added x-scroll to handle wide content
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '24px', color: '#6B7280' }}>
              <Home size={20} style={{ marginBottom: '6px' }} />
              <div>No transactions available</div>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', position: 'sticky', bottom: 0, background: '#FFFFFF', padding: '8px 0', zIndex: 1 }}>
          <Button
            onClick={() => setShowTransactionsModal(false)}
            style={{ flex: 1, padding: '6px 12px', color: '#374151', background: '#F3F4F6', border: 'none', borderRadius: '6px' }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => setShowTransactionsModal(false)}
            style={{ flex: 1, padding: '6px 12px', color: '#FFFFFF', background: '#2563EB', border: 'none', borderRadius: '6px' }}
          >
            Save
          </Button>
        </div>
      </Modal>

      <Modal
        visible={showEditBudgetModal}
        onCancel={() => setShowEditBudgetModal(false)}
        footer={null}
        centered
        bodyStyle={{ padding: '16px' }}
        style={{ maxWidth: '650px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>Edit Budget Allocation</h3>
          <Button
            style={{ padding: '4px', color: '#9CA3AF', border: 'none', background: 'transparent' }}
            type="text"
            onClick={() => setShowEditBudgetModal(false)}
          >
            <Edit3 size={12} />
          </Button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Object.keys(budgetInputs).map((category) => (
            <div key={category}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                {categoryConfig[category as keyof typeof categoryConfig].title} (%)
              </label>
              <Input
                type="number"
                value={budgetInputs[category as keyof typeof budgetInputs]}
                onChange={(e) => handleBudgetChange(category as keyof typeof budgetInputs, e.target.value)}
                style={{ padding: '6px 10px', border: '1px solid #D1D5DB', borderRadius: '6px' }}
                placeholder="Percentage"
                suffix="%"
              />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <Button
            onClick={() => setShowEditBudgetModal(false)}
            style={{ flex: 1, padding: '6px 12px', color: '#374151', background: '#F3F4F6', border: 'none', borderRadius: '6px' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveBudget}
            style={{ flex: 1, padding: '6px 12px', color: '#FFFFFF', background: '#2563EB', border: 'none', borderRadius: '6px' }}
          >
            Save
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default MonthlyBudget;