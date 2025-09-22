
'use client';
import React, { useEffect, useState } from 'react';
import { Button, message, Modal, List, Checkbox } from 'antd';
import { getRecurringTransactions, getAllTransactions, updateRecurringStatus } from '../../services/apiConfig';
import DocklyLoader from '../../utils/docklyLoader';
import { Repeat } from 'lucide-react';
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
        return `$${num.toFixed(2)}`;
    };

    const formatDate = (date: string) => {
        try {
            return format(parseISO(date), 'MMM dd, yyyy');
        } catch {
            return date;
        }
    };

    const EmptyRecurringTemplate = () => (
        <div
            style={{
                background: 'linear-gradient(145deg, #fef3c7, #fde68a)',
                borderRadius: 12,
                padding: 20,
                textAlign: 'center',
                border: '1px solid #fcd34d',
                cursor: 'pointer',
            }}
            onClick={handleSetup}
        >
            <Repeat size={32} style={{ color: '#d97706', marginBottom: 8 }} />
            <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 4, fontFamily: FONT_FAMILY }}>
                No Recurring Bills
            </div>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12, fontFamily: FONT_FAMILY }}>
                Never miss a payment again
            </div>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
                <span style={{ background: '#fef3c7', padding: '2px 6px', borderRadius: 4, fontSize: 10, color: '#d97706' }}>
                    💡 Utilities
                </span>
                <span style={{ background: '#ddd6fe', padding: '2px 6px', borderRadius: 4, fontSize: 10, color: '#7c3aed' }}>
                    📺 Subscriptions
                </span>
                <span style={{ background: '#fecaca', padding: '2px 6px', borderRadius: 4, fontSize: 10, color: '#dc2626' }}>
                    🏠 Rent
                </span>
            </div>
        </div>
    );

    return (
        <div
            style={{
                background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
                borderRadius: '12px',
                padding: '0',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                // width: 420,
                height: 569,
                fontFamily: FONT_FAMILY,
                // marginTop: '12px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                // marginBottom: '10px'
            }}
        >
            <div
                style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #e2e8f0',
                    background: '#fff',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1,
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: 16,
                        fontWeight: 600,
                        color: '#111827',
                        fontFamily: FONT_FAMILY,
                    }}
                >
                    <span>Recurring Transactions</span>
                    <Button
                        type="link"
                        style={{
                            padding: 0,
                            fontSize: 13,
                            fontFamily: FONT_FAMILY,
                            fontWeight: 500,
                            color: '#3b82f6',
                        }}
                        onClick={handleSetup}
                    >
                        {transactions.length === 0 ? 'Setup' : 'Manage'}
                    </Button>
                </div>
            </div>
            <div
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '12px',
                }}
            >
                {loading ? (
                    <DocklyLoader />
                ) : transactions.length === 0 ? (
                    <EmptyRecurringTemplate />
                ) : (
                    transactions.map((t, i) => (
                        <div
                            key={i}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: 12,
                                padding: '8px',
                                borderRadius: '8px',
                                border: '1px solid #f3f4f6',
                                background: '#fefefe',
                                transition: 'transform 0.2s ease',
                                cursor: 'pointer',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                        >
                            <div
                                style={{
                                    width: 40,
                                    height: 40,
                                    background: 'linear-gradient(145deg, #f3f4f6, #e5e7eb)',
                                    borderRadius: 8,
                                    textAlign: 'center',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 10,
                                    fontWeight: 600,
                                    fontSize: 12,
                                    fontFamily: FONT_FAMILY,
                                    border: '1px solid #e5e7eb',
                                }}
                            >
                                <div style={{ fontSize: 14, color: '#111827' }}>{new Date(t.last_date).getDate()}</div>
                                <div style={{ fontSize: 10, color: '#6b7280' }}>
                                    {format(parseISO(t.last_date), 'MMM').toUpperCase()}
                                </div>
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                    style={{
                                        fontWeight: 600,
                                        fontSize: 13,
                                        color: '#111827',
                                        fontFamily: FONT_FAMILY,
                                        marginBottom: 2,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}
                                    title={t.description}
                                >
                                    {t.description}
                                </div>
                                <div
                                    style={{
                                        fontSize: 11,
                                        color: '#6b7280',
                                        fontFamily: FONT_FAMILY,
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}
                                >
                                    {t.frequency} • {formatDate(t.last_date)}
                                </div>
                            </div>

                            <div style={{ textAlign: 'right', minWidth: 80 }}>
                                <div
                                    style={{
                                        fontWeight: 600,
                                        fontSize: 13,
                                        textAlign: 'right',
                                        color: '#ef4444',
                                        fontFamily: FONT_FAMILY,
                                    }}
                                >
                                    {formatAmount(t.amount)}
                                </div>
                                <div>
                                    <span
                                        style={{
                                            backgroundColor: '#ecfdf5',
                                            color: '#059669',
                                            fontSize: 10,
                                            fontWeight: 500,
                                            borderRadius: 6,
                                            padding: '2px 6px',
                                            marginTop: 4,
                                            display: 'inline-block',
                                            fontFamily: FONT_FAMILY,
                                            border: '1px solid #a7f3d0',
                                        }}
                                    >
                                        {t.frequency}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <Modal
                title={
                    <div style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: '#111827',
                        fontFamily: FONT_FAMILY,
                        padding: '8px 0',
                        background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
                        borderBottom: '1px solid #e2e8f0',
                    }}>
                        Select Recurring Transactions
                    </div>
                }
                open={isModalVisible}
                onOk={handleOk}
                onCancel={() => setIsModalVisible(false)}
                okText="Save"
                cancelText="Cancel"
                width={500}
                bodyStyle={{
                    maxHeight: '300px',
                    overflowY: 'auto',
                    padding: '12px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                }}
                style={{
                    top: 40,
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                }}
                footer={
                    <div style={{
                        textAlign: 'right',
                        padding: '8px 12px',
                        background: '#fff',
                        borderTop: '1px solid #e2e8f0',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '8px',
                    }}>
                        <Button
                            style={{
                                fontFamily: FONT_FAMILY,
                                borderRadius: '6px',
                                color: '#6b7280',
                                borderColor: '#d1d5db',
                            }}
                            onClick={() => setIsModalVisible(false)}
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            style={{
                                fontFamily: FONT_FAMILY,
                                borderRadius: '6px',
                                background: '#3b82f6',
                                borderColor: '#3b82f6',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}
                            onClick={handleOk}
                            disabled={isSaving}
                        >
                            {isSaving ? <DocklyLoader /> : null}
                            Save
                        </Button>
                    </div>
                }
            >
                {isSaving ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
                        <DocklyLoader />
                    </div>
                ) : (
                    <List
                        dataSource={allTransactions}
                        renderItem={(item) => (
                            <List.Item style={{ padding: '6px 0', borderBottom: '1px solid #f3f4f6' }}>
                                <Checkbox
                                    checked={selected.includes(item.transaction_id)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelected([...selected, item.transaction_id]);
                                        } else {
                                            setSelected(selected.filter((id) => id !== item.transaction_id));
                                        }
                                    }}
                                    style={{ width: '100%' }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        fontSize: '13px',
                                        gap: '8px',
                                    }}>
                                        <span style={{
                                            fontWeight: 500,
                                            color: '#111827',
                                            fontFamily: FONT_FAMILY,
                                            flex: 1,
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}
                                        title={item.description}
                                        >
                                            {item.description}
                                        </span>
                                        <span style={{
                                            fontSize: 11,
                                            color: '#6b7280',
                                            fontFamily: FONT_FAMILY,
                                            textAlign: 'right',
                                            minWidth: 140,
                                        }}>
                                            {formatAmount(item.amount)} on {formatDate(item.date)}
                                        </span>
                                    </div>
                                </Checkbox>
                            </List.Item>
                        )}
                    />
                )}
            </Modal>
        </div>
    );
};

export default RecurringTransactions;