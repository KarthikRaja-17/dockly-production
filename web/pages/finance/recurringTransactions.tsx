
'use client';
import React, { useEffect, useState } from 'react';
import { Button, message, Modal, Table, Checkbox, Radio } from 'antd';
import { getRecurringTransactions, getAllTransactions, updateRecurringStatus } from '../../services/apiConfig';
import DocklyLoader from '../../utils/docklyLoader';
import { Repeat, Settings, Plus, Calendar, DollarSign } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const FONT_FAMILY = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

interface RecurringTransactionsProps {
    onRecurringUpdate?: (transactions: any[]) => void;
}

const RecurringTransactions = ({ onRecurringUpdate }: RecurringTransactionsProps) => {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [allTransactions, setAllTransactions] = useState<any[]>([]);
    const [selected, setSelected] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [filter, setFilter] = useState<'all' | 'credit' | 'debit'>('all');

    useEffect(() => {
        fetchRecurring();
    }, []);

    const fetchRecurring = async () => {
        const user_id = localStorage.getItem('userId');
        if (!user_id) {
            message.error('User ID not found.');
            return;
        }

        try {
            setLoading(true);
            const res = await getRecurringTransactions({ user_id });
            const recurringData = res.recurring_transactions || [];
            setTransactions(recurringData);
            onRecurringUpdate?.(recurringData);
        } catch (err) {
            console.error('Error fetching recurring transactions:', err);
            message.error('Failed to load recurring transactions.');
            onRecurringUpdate?.([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSetup = async () => {
        const user_id = localStorage.getItem('userId');
        if (!user_id) {
            message.error('User ID not found.');
            return;
        }

        try {
            setLoading(true);
            const res = await getAllTransactions({ uid: user_id });
            const transactions = res.transactions || [];
            setAllTransactions(transactions);
            setSelected(transactions.filter((txn: any) => txn.isrecurring === 'yes').map((txn: any) => txn.transaction_id));
            setIsModalVisible(true);
        } catch (err) {
            console.error('Error fetching all transactions:', err);
            message.error('Failed to load transactions.');
        } finally {
            setLoading(false);
        }
    };

    const handleOk = async () => {
        const user_id = localStorage.getItem('userId');
        if (!user_id) {
            message.error('User ID not found.');
            return;
        }

        try {
            setIsSaving(true);
            const updates = allTransactions.map((txn) => ({
                transaction_id: txn.transaction_id,
                is_recurring: selected.includes(txn.transaction_id) ? 'yes' : 'no',
            }));

            await updateRecurringStatus({ uid: user_id, updates });
            message.success('Recurring transactions updated successfully.');
            setIsModalVisible(false);
            fetchRecurring();
        } catch (err) {
            console.error('Error updating recurring status:', err);
            message.error('Failed to update recurring transactions.');
        } finally {
            setIsSaving(false);
        }
    };

    const formatAmount = (amount: string | number) => {
        const num = parseFloat(amount.toString());
        return `$${Math.abs(num).toFixed(2)}`;
    };

    const isNegativeAmount = (amount: string | number) => {
        return parseFloat(amount.toString()) < 0;
    };

    const formatDate = (date: string) => {
        try {
            return format(parseISO(date), 'MMM dd, yyyy');
        } catch {
            return date;
        }
    };

    const filteredTransactions = allTransactions.filter((item) => {
        if (filter === 'all') return true;
        if (filter === 'credit') return !isNegativeAmount(item.amount);
        if (filter === 'debit') return isNegativeAmount(item.amount);
        return true;
    });

    const columns = [
        {
            title: 'Select',
            dataIndex: 'transaction_id',
            key: 'select',
            width: 70,
            render: (transaction_id: string) => (
                <Checkbox
                    checked={selected.includes(transaction_id)}
                    onChange={(e) => {
                        if (e.target.checked) {
                            setSelected([...selected, transaction_id]);
                        } else {
                            setSelected(selected.filter((id) => id !== transaction_id));
                        }
                    }}
                />
            ),
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            render: (text: string) => (
                <span
                    style={{
                        fontWeight: 500,
                        color: '#111827',
                        fontFamily: FONT_FAMILY,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: 'block',
                    }}
                    title={text}
                >
                    {text}
                </span>
            ),
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            width: 120,
            render: (amount: string | number) => (
                <span
                    style={{
                        fontWeight: 600,
                        color: isNegativeAmount(amount) ? '#ef4444' : '#111827',
                        fontFamily: FONT_FAMILY,
                    }}
                >
                    {isNegativeAmount(amount) ? '-' : ''}{formatAmount(amount)}
                </span>
            ),
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            width: 120,
            render: (date: string) => (
                <span
                    style={{
                        fontSize: 12,
                        color: '#64748b',
                        fontFamily: FONT_FAMILY,
                    }}
                >
                    {formatDate(date)}
                </span>
            ),
        },
    ];

    const EmptyRecurringTemplate = () => (
        <div
            style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                borderRadius: 16,
                padding: 24,
                textAlign: 'center',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
            }}
            onClick={handleSetup}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            <div style={{
                position: 'absolute',
                top: -10,
                right: -10,
                width: 40,
                height: 40,
                background: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '50%',
            }} />
            
            <div style={{
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                borderRadius: 12,
                width: 48,
                height: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
            }}>
                <Repeat size={24} style={{ color: '#ffffff' }} />
            </div>
            
            <div style={{ 
                fontSize: 16, 
                fontWeight: 700, 
                color: '#111827', 
                marginBottom: 8, 
                fontFamily: FONT_FAMILY 
            }}>
                Set Up Recurring Bills
            </div>
            <div style={{ 
                fontSize: 13, 
                color: '#6b7280', 
                marginBottom: 20, 
                fontFamily: FONT_FAMILY,
                lineHeight: 1.5,
            }}>
                Never miss a payment again.<br />Track your subscriptions and bills automatically.
            </div>
            
            <div style={{ 
                display: 'flex', 
                gap: 8, 
                justifyContent: 'center', 
                flexWrap: 'wrap',
                marginBottom: 16,
            }}>
                <span style={{ 
                    background: 'rgba(251, 191, 36, 0.1)', 
                    padding: '4px 8px', 
                    borderRadius: 8, 
                    fontSize: 11, 
                    color: '#d97706',
                    fontWeight: 500,
                    border: '1px solid rgba(251, 191, 36, 0.2)',
                }}>
                    💡 Utilities
                </span>
                <span style={{ 
                    background: 'rgba(139, 92, 246, 0.1)', 
                    padding: '4px 8px', 
                    borderRadius: 8, 
                    fontSize: 11, 
                    color: '#7c3aed',
                    fontWeight: 500,
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                }}>
                    📺 Subscriptions
                </span>
                <span style={{ 
                    background: 'rgba(239, 68, 68, 0.1)', 
                    padding: '4px 8px', 
                    borderRadius: 8, 
                    fontSize: 11, 
                    color: '#dc2626',
                    fontWeight: 500,
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                }}>
                    🏠 Rent
                </span>
            </div>
            
            <div style={{
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: '#ffffff',
                padding: '8px 16px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontFamily: FONT_FAMILY,
                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
            }}>
                <Plus size={14} />
                Get Started
            </div>
        </div>
    );

    return (
        <div
            style={{
                background: '#ffffff',
                borderRadius: 16,
                padding: 0,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)',
                height: 570,
                fontFamily: FONT_FAMILY,
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
            }}
        >
            {/* Header */}
            <div
                style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #f1f5f9',
                    background: '#ffffff',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        background: '#f1f5f9',
                        borderRadius: 8,
                        padding: 6,
                    }}>
                        <Repeat size={16} style={{ color: '#475569' }} />
                    </div>
                    <span style={{
                        fontSize: 16,
                        fontWeight: 400,
                        color: '#111827',
                        fontFamily: FONT_FAMILY,
                    }}>
                        Recurring Transactions
                    </span>
                </div>
                
                <button
                    style={{
                        background: transactions.length === 0 
                            ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' 
                            : 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                        border: 'none',
                        borderRadius: 8,
                        padding: '6px 12px',
                        fontSize: 12,
                        fontWeight: 600,
                        color: transactions.length === 0 ? '#ffffff' : '#475569',
                        cursor: 'pointer',
                        fontFamily: FONT_FAMILY,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        transition: 'all 0.2s ease',
                        boxShadow: transactions.length === 0 
                            ? '0 2px 8px rgba(59, 130, 246, 0.3)' 
                            : '0 1px 3px rgba(0, 0, 0, 0.1)',
                    }}
                    onClick={handleSetup}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = transactions.length === 0 
                            ? '0 4px 12px rgba(59, 130, 246, 0.4)' 
                            : '0 2px 8px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = transactions.length === 0 
                            ? '0 2px 8px rgba(59, 130, 246, 0.3)' 
                            : '0 1px 3px rgba(0, 0, 0, 0.1)';
                    }}
                >
                    {transactions.length === 0 ? <Plus size={14} /> : <Settings size={14} />}
                    {transactions.length === 0 ? 'Setup' : 'Manage'}
                </button>
            </div>

            {/* Content */}
            <div
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '16px 20px',
                }}
            >
                {loading ? (
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        height: '200px' 
                    }}>
                        <DocklyLoader />
                    </div>
                ) : transactions.length === 0 ? (
                    <EmptyRecurringTemplate />
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {transactions.map((t, i) => (
                            <div
                                key={i}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '12px 16px',
                                    borderRadius: 12,
                                    border: '1px solid #f1f5f9',
                                    background: '#ffffff',
                                    transition: 'all 0.2s ease',
                                    cursor: 'pointer',
                                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                                    e.currentTarget.style.borderColor = '#e2e8f0';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                                    e.currentTarget.style.borderColor = '#f1f5f9';
                                }}
                            >
                                {/* Date Icon */}
                                <div
                                    style={{
                                        width: 44,
                                        height: 44,
                                        background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                                        borderRadius: 10,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: 12,
                                        fontWeight: 600,
                                        fontFamily: FONT_FAMILY,
                                        border: '1px solid #e2e8f0',
                                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                                    }}
                                >
                                    <div style={{ fontSize: 16, color: '#111827', lineHeight: 1 }}>
                                        {new Date(t.last_date).getDate()}
                                    </div>
                                    <div style={{ fontSize: 9, color: '#64748b', lineHeight: 1, marginTop: 1 }}>
                                        {format(parseISO(t.last_date), 'MMM').toUpperCase()}
                                    </div>
                                </div>

                                {/* Transaction Details */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div
                                        style={{
                                            fontWeight: 600,
                                            fontSize: 14,
                                            color: '#111827',
                                            fontFamily: FONT_FAMILY,
                                            marginBottom: 4,
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}
                                        title={t.description}
                                    >
                                        {t.description}
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        fontSize: 11,
                                        color: '#64748b',
                                        fontFamily: FONT_FAMILY,
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <Calendar size={10} />
                                            {formatDate(t.last_date)}
                                        </div>
                                        <div style={{
                                            background: 'rgba(34, 197, 94, 0.1)',
                                            color: '#059669',
                                            fontSize: 9,
                                            fontWeight: 600,
                                            borderRadius: 4,
                                            padding: '2px 6px',
                                            border: '1px solid rgba(34, 197, 94, 0.2)',
                                        }}>
                                            {t.frequency}
                                        </div>
                                    </div>
                                </div>

                                {/* Amount */}
                                <div style={{ textAlign: 'right', minWidth: 80 }}>
                                    <div
                                        style={{
                                            fontWeight: 700,
                                            fontSize: 15,
                                            color: isNegativeAmount(t.amount) ? '#ef4444' : '#111827',
                                            fontFamily: FONT_FAMILY,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'flex-end',
                                            gap: 4,
                                        }}
                                    >
                                        <DollarSign size={12} style={{ 
                                            color: isNegativeAmount(t.amount) ? '#ef4444' : '#64748b' 
                                        }} />
                                        {isNegativeAmount(t.amount) ? '-' : ''}{formatAmount(t.amount)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Enhanced Modal with Table */}
            <Modal
                title={
                    <div style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: '#111827',
                        fontFamily: FONT_FAMILY,
                        padding: '8px 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                    }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                            borderRadius: 8,
                            padding: 8,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <Settings size={16} style={{ color: '#ffffff' }} />
                        </div>
                        Manage Recurring Transactions
                    </div>
                }
                open={isModalVisible}
                onOk={handleOk}
                onCancel={() => setIsModalVisible(false)}
                width={600}
                bodyStyle={{
                    maxHeight: '700px',
                    overflowY: 'auto',
                    padding: '20px',
                    background: '#f8fafc',
                    borderRadius: '12px',
                }}
                style={{
                    top: 40,
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                }}
                footer={
                    <div style={{
                        padding: '16px 24px',
                        background: '#ffffff',
                        borderTop: '1px solid #f1f5f9',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 12,
                    }}>
                        <button
                            style={{
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: 8,
                                padding: '8px 16px',
                                fontSize: 14,
                                fontWeight: 500,
                                color: '#64748b',
                                cursor: 'pointer',
                                fontFamily: FONT_FAMILY,
                                transition: 'all 0.2s ease',
                            }}
                            onClick={() => setIsModalVisible(false)}
                            disabled={isSaving}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#e2e8f0';
                                e.currentTarget.style.borderColor = '#cbd5e1';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#f8fafc';
                                e.currentTarget.style.borderColor = '#e2e8f0';
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            style={{
                                background: isSaving 
                                    ? 'linear-gradient(135deg, #94a3b8, #64748b)' 
                                    : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                border: 'none',
                                borderRadius: 8,
                                padding: '8px 20px',
                                fontSize: 14,
                                fontWeight: 600,
                                color: '#ffffff',
                                cursor: isSaving ? 'not-allowed' : 'pointer',
                                fontFamily: FONT_FAMILY,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                transition: 'all 0.2s ease',
                                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                            }}
                            onClick={handleOk}
                            disabled={isSaving}
                            onMouseEnter={(e) => {
                                if (!isSaving) {
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isSaving) {
                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }
                            }}
                        >
                            {isSaving && (
                                <div style={{
                                    width: 14,
                                    height: 14,
                                    border: '2px solid rgba(255, 255, 255, 0.3)',
                                    borderTop: '2px solid #ffffff',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite',
                                }} />
                            )}
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                }
            >
                {isSaving ? (
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        padding: '40px',
                        flexDirection: 'column',
                        gap: 16,
                    }}>
                        <DocklyLoader />
                        <div style={{
                            fontSize: 14,
                            color: '#64748b',
                            fontFamily: FONT_FAMILY,
                            fontWeight: 500,
                        }}>
                            Updating your recurring transactions...
                        </div>
                    </div>
                ) : (
                    <div style={{
                        background: '#ffffff',
                        borderRadius: 12,
                        padding: '16px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                    }}>
                        <div style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: '#111827',
                            marginBottom: 16,
                            fontFamily: FONT_FAMILY,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                        }}>
                            <Repeat size={16} style={{ color: '#3b82f6' }} />
                            Select transactions to mark as recurring:
                        </div>
                        <div style={{
                            marginBottom: 16,
                            display: 'flex',
                            gap: 8,
                            justifyContent: 'flex-start',
                        }}>
                            <Radio.Group
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                style={{ fontFamily: FONT_FAMILY }}
                            >
                                {/* <Radio.Button value="all">All</Radio.Button> */}
                                <Radio.Button value="credit">Credit</Radio.Button>
                                <Radio.Button value="debit">Debit</Radio.Button>
                            </Radio.Group>
                        </div>
                        <Table
                            columns={columns}
                            dataSource={filteredTransactions}
                            rowKey="transaction_id"
                            pagination={false}
                            style={{ fontFamily: FONT_FAMILY }}
                            bordered={false}
                            scroll={{ y: 300 }}
                        />
                    </div>
                )}
            </Modal>

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .ant-table-thead > tr > th {
                    background: #f8fafc;
                    font-weight: 600;
                    color: #111827;
                    font-family: ${FONT_FAMILY};
                    border-bottom: 1px solid #e2e8f0;
                }
                .ant-table-tbody > tr > td {
                    border-bottom: 1px solid #f1f5f9;
                }
                .ant-radio-button-wrapper {
                    border-radius: 8px;
                    font-weight: 500;
                    color: #64748b;
                    border: 1px solid #e2e8f0;
                    transition: all 0.2s ease;
                }
                .ant-radio-button-wrapper-checked {
                    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                    color: #ffffff;
                    border-color: transparent;
                }
                .ant-radio-button-wrapper:hover {
                    background: #e2e8f0;
                    color: #111827;
                }
            `}</style>
        </div>
    );
};

export default RecurringTransactions;

