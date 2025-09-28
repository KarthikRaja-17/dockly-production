'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Card,
  Table,
  Typography,
  Avatar,
  message,
  Tag,
  Space,
  Spin,
} from 'antd';
import {
  ShoppingCartOutlined,
  DollarCircleOutlined,
  CarOutlined,
  CoffeeOutlined,
  LaptopOutlined,
  HomeOutlined,
  BankOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { useQuilttSession } from '@quiltt/react';
import { getAllTransactions, saveBankTransactions } from '../../services/apiConfig';

const FONT_FAMILY =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
const { Text } = Typography;

const RecentTransactions = ({
  isFullscreen = false,
  onViewAll,
}: {
  isFullscreen?: boolean;
  onViewAll?: () => void;
}) => {
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const { session } = useQuilttSession();

  const getIcon = (category: string) => {
    const iconMap: { [key: string]: JSX.Element } = {
      Groceries: <ShoppingCartOutlined />,
      Housing: <HomeOutlined />,
      Entertainment: <LaptopOutlined />,
      'Dining Out': <CoffeeOutlined />,
      Shopping: <ShoppingCartOutlined />,
      Income: <DollarCircleOutlined />,
      Transportation: <CarOutlined />,
      Transfer: <BankOutlined />,
    };
    return iconMap[category] || <QuestionCircleOutlined />;
  };

  const getInitials = (merchant: string) => {
    if (!merchant) return '';
    const words = merchant.split(' ');
    return words.length > 1 ? words[0][0] + words[1][0] : words[0][0];
  };

  const getCategoryColor = (category: string) => {
    const colorMap: { [key: string]: { bg: string; color: string; border: string } } = {
      Groceries: { bg: '#f3f4f6', color: '#6b7280', border: '#e5e7eb' },
      Housing: { bg: '#e0e7ff', color: '#4338ca', border: '#c7d2fe' },
      Entertainment: { bg: '#fef3c7', color: '#d97706', border: '#fde68a' },
      'Dining Out': { bg: '#fed7d7', color: '#e53e3e', border: '#fbb6ce' },
      Shopping: { bg: '#f3f4f6', color: '#6b7280', border: '#e5e7eb' },
      Income: { bg: '#dcfce7', color: '#16a34a', border: '#bbf7d0' },
      Transportation: { bg: '#dbeafe', color: '#2563eb', border: '#bfdbfe' },
      Transfer: { bg: '#f3f4f6', color: '#6b7280', border: '#e5e7eb' },
    };
    return colorMap[category] || { bg: '#f3f4f6', color: '#6b7280', border: '#e5e7eb' };
  };

  const getAvatarGradient = (merchant: string) => {
    if (!merchant) return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    const colors = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      'linear-gradient(135deg, #ff8a80 0%, #ea4c89 100%)',
    ];
    const index = merchant.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Save transactions (always on reload)
  const saveTransactions = async () => {
    const user_id = localStorage.getItem('userId');
    if (!user_id || !session?.token) {
      return false;
    }
    let retries = 4;
    let delay = 40;
    try {
      setSaveLoading(true);
      while (retries > 0) {
        const response = await saveBankTransactions({ session, user_id });
        if (response.status === 1) {
          return true;
        }
        if (response.status === 0 && response.message?.includes('Still syncing')) {
          await new Promise(res => setTimeout(res, delay));
          retries--;
          continue;
        }
        return false;
      }
      return false;
    } finally {
      setSaveLoading(false);
    }
  };

  // Fetch transactions (paged)
  const fetchTransactions = async () => {
    const user_id = localStorage.getItem('userId');
    if (!user_id || !session?.token) return;
    try {
      setLoading(true);
      const response = await getAllTransactions({
        uid: user_id,
        page: currentPage,
        page_size: pageSize,
        type_filter: typeFilter,
      });

      if (response.status !== 1) {
        message.error(response.message || 'Failed to load transactions.');
        return;
      }

      const formattedTxns = response.transactions.map((txn: any, index: number) => ({
        key: `${index}`,
        merchant: txn.merchantname || txn.description?.split(' ')[0] || 'Unknown',
        description: txn.description || 'Unknown',
        category: txn.category || 'Others',
        date: new Date(txn.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: '2-digit',
        }),
        amount: txn.amount,
        account: txn.account || 'Account',
        icon: getIcon(txn.category || 'Others'),
        color: txn.amount < 0 ? '#fecaca' : '#bbf7d0',
        type: txn.entry_type,
      }));

      setAllTransactions(formattedTxns);
      setTotal(response.total);
    } finally {
      setLoading(false);
    }
  };

  // Always run save → then fetch, on every reload
  useEffect(() => {
    const init = async () => {
      if (!session?.token) return;
      const saved = await saveTransactions();
      if (saved) {
        await fetchTransactions();
      }
    };
    init();
  }, [session?.token, currentPage, pageSize, typeFilter]);

  const displayedTransactions = useMemo(() => {
    if (!isFullscreen) {
      return allTransactions.slice(0, 6);
    }
    return allTransactions;
  }, [allTransactions, isFullscreen]);

  const handleViewAllClick = () => {
    if (onViewAll) onViewAll();
  };

  const columns = [
    {
      title: 'Merchant',
      dataIndex: 'merchant',
      key: 'merchant',
      width: 170,
      align: 'center' as const,
      render: (merchant: string) => (
        <Space size={14} style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            style={{
              background: getAvatarGradient(merchant),
              fontSize: '13px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
            size={36}
          >
            {getInitials(merchant)}
          </Avatar>
          <Text style={{ fontWeight: 600, fontFamily: FONT_FAMILY }}>{merchant}</Text>
        </Space>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 150,
      align: 'center' as const,
      render: (category: string) => {
        const categoryStyle = getCategoryColor(category);
        return (
          <Tag
            style={{
              fontFamily: FONT_FAMILY,
              fontSize: '13px',
              border: `1px solid ${categoryStyle.border}`,
              backgroundColor: categoryStyle.bg,
              color: categoryStyle.color,
              borderRadius: '8px',
              padding: '4px 12px',
            }}
          >
            {category}
          </Tag>
        );
      },
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      align: 'center' as const,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      align: 'center' as const,
      render: (amount: number) => (
        <Text
          strong
          style={{
            fontSize: '13px',
            fontFamily: FONT_FAMILY,
            color: amount < 0 ? '#dc2626' : '#16a34a',
          }}
        >
          {amount < 0 ? '-' : ''}${Math.abs(amount).toFixed(2)}
        </Text>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 250,
      align: 'center' as const,
      render: (desc: string) => <Text style={{ fontFamily: FONT_FAMILY }}>{desc}</Text>,
    },
  ];

  return (
    <Card
      title="Recent Transactions"
      extra={
        !isFullscreen && (
          <Text style={{ color: '#2563eb', cursor: 'pointer' }} onClick={handleViewAllClick}>
            View All
          </Text>
        )
      }
      style={{ marginBottom: 10, fontFamily: FONT_FAMILY }}
    >
      {loading || saveLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={displayedTransactions}
          pagination={
            isFullscreen
              ? {
                  current: currentPage,
                  pageSize,
                  total,
                  onChange: (page, size) => {
                    setCurrentPage(page);
                    setPageSize(size);
                  },
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '20', '50', '100'],
                }
              : false
          }
          rowKey="key"
          style={{ fontFamily: FONT_FAMILY }}
        />
      )}
    </Card>
  );
};

export default RecentTransactions;
