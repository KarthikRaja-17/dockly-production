import React, { useEffect, useState } from 'react';
import { Progress, Button, Typography, Card, Radio } from 'antd';
import { CheckCircleOutlined, CrownOutlined, StarOutlined } from '@ant-design/icons';
import { CustomModal } from '../../app/comman';
import { getSubscriptions } from '../../services/subscription';
// import { getSubscriptions } from '../../services/subscriptions';

const { Title, Text } = Typography;

interface ApiSubscription {
    id: string;
    name: string;
    type: string;
    price: string;
    period: string;
    features: string[];
    limits: {
        integrations: number;
        family_members: number;
        storage_gb: number;
    };
}

interface ApiUser {
    auto_renew: boolean;
    days_used: number;
    email: string;
    expires_at: string;
    next_billing_date: string | null;
    plan: string | null;
    started_at: string;
    status: string;
}

interface ApiResponse {
    subscriptions: ApiSubscription[];
    user: ApiUser;
}

interface SubscriptionModalProps {
    isVisible: boolean;
    onClose: () => void;
    onUpgrade: (planId: string) => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
    isVisible,
    onClose,
    onUpgrade,
}) => {
    const [selectedPlan, setSelectedPlan] = useState('');
    const [subscriptionData, setSubscriptionData] = useState<ApiResponse | null>(null);
    const { user, subscriptions } = subscriptionData || { user: null, subscriptions: [] };
    const [loading, setLoading] = useState(true);

    const getDocklySubscriptions = async () => {
        try {
            setLoading(true);
            const response = await getSubscriptions({});
            const data = response.data.payload;
            setSubscriptionData(data);

            // Set default selected plan to first subscription
            if (data.subscriptions && data.subscriptions.length > 0) {
                setSelectedPlan(data.subscriptions[0].id);
            }
        } catch (error) {
            console.error("Error fetching subscriptions:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isVisible) {
            getDocklySubscriptions();
        }
    }, [isVisible]);

    // Calculate trial information
    const calculateTrialInfo = () => {
        const startDate = new Date(user?.started_at ?? '');
        const expiresDate = new Date(user?.expires_at ?? '');
        const currentDate = new Date();

        // Calculate total trial days
        const totalTrialDays = Math.ceil((expiresDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

        // Calculate remaining days
        const remainingDays = Math.ceil((expiresDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

        return {
            daysUsed: user?.days_used,
            totalTrialDays,
            remainingDays: Math.max(0, remainingDays),
            progressPercentage: (user?.days_used ?? 0 / totalTrialDays) * 100
        };
    };

    const trialInfo = calculateTrialInfo();

    // Transform subscriptions to include popular flag
    const transformedPlans = subscriptions.map((subscription, index) => ({
        ...subscription,
        popular: subscription.type === 'premium' || index === 1 // Mark yearly/premium as popular
    }));

    const handleUpgrade = () => {
        onUpgrade(selectedPlan);
    };

    return (
        <CustomModal isVisible={isVisible} onClose={onClose}>
            {/* Header */}
            <div style={{ marginBottom: 16, textAlign: 'center' }}>
                <Title level={4} style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>
                    Choose Your Plan
                </Title>
                <Text style={{ fontSize: 13, color: '#6b7280' }}>
                    Upgrade to unlock premium features
                </Text>
            </div>

            {/* Trial Progress */}
            <div
                style={{
                    background: '#f9fafb',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 16,
                    border: '1px solid #e5e7eb',
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div>
                        <Text style={{ fontSize: 13, fontWeight: 600, color: '#1f2937' }}>
                            Free Trial Progress
                        </Text>
                        <div>
                            <Text style={{ fontSize: 12, color: '#6b7280' }}>
                                {user?.email} • {user?.plan || 'Trial'}
                            </Text>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <Text style={{ fontSize: 13, fontWeight: 600, color: '#059669' }}>
                            {trialInfo.remainingDays} days left
                        </Text>
                        <div>
                            <Text style={{ fontSize: 11, color: '#6b7280' }}>
                                Day {trialInfo.daysUsed} of {trialInfo.totalTrialDays}
                            </Text>
                        </div>
                    </div>
                </div>

                <Progress
                    percent={trialInfo.progressPercentage}
                    strokeColor={{ '0%': '#10b981', '100%': '#059669' }}
                    trailColor="#e5e7eb"
                    strokeWidth={6}
                    showInfo={false}
                />
            </div>

            {/* Plans */}
            <Radio.Group
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                style={{ width: '100%' }}
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {transformedPlans.map((plan) => (
                        <Radio.Button
                            key={plan.id}
                            value={plan.id}
                            style={{ height: 'auto', padding: 0, border: 'none' }}
                        >
                            <Card
                                style={{
                                    border: selectedPlan === plan.id ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                                    borderRadius: 8,
                                    background: selectedPlan === plan.id ? '#eff6ff' : '#ffffff',
                                    transition: 'all 0.3s ease',
                                    height: 220,
                                    position: 'relative',
                                }}
                                styles={{
                                    body: {
                                        padding: 12,
                                    },
                                }}
                            >
                                {plan.popular && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: 8,
                                            right: 8,
                                            background: '#f59e0b',
                                            color: '#fff',
                                            padding: '2px 6px',
                                            borderRadius: 8,
                                            fontSize: 10,
                                            fontWeight: 600,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 4,
                                        }}
                                    >
                                        <StarOutlined style={{ fontSize: 10 }} />
                                        Popular
                                    </div>
                                )}

                                <div style={{ textAlign: 'center', marginBottom: 8 }}>
                                    <CrownOutlined
                                        style={{
                                            fontSize: 20,
                                            color: plan.popular ? '#f59e0b' : '#9ca3af',
                                        }}
                                    />
                                    <Title level={5} style={{ margin: '6px 0', fontSize: 16 }}>
                                        {plan.name}
                                    </Title>
                                </div>

                                <div style={{ textAlign: 'center', marginBottom: 10 }}>
                                    <Text style={{ fontSize: 20, fontWeight: 600, color: '#1f2937' }}>
                                        ${plan.price}
                                    </Text>
                                    <Text style={{ fontSize: 12, marginLeft: 4, color: '#6b7280' }}>
                                        /{plan.period}
                                    </Text>
                                </div>

                                <div>
                                    {plan.features.slice(0, 4).map((feature, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
                                            <CheckCircleOutlined style={{ color: '#10b981', fontSize: 12, marginRight: 6 }} />
                                            <Text style={{ fontSize: 12, color: '#374151' }}>{feature}</Text>
                                        </div>
                                    ))}
                                    {plan.features.length > 4 && (
                                        <Text style={{ fontSize: 11, fontStyle: 'italic', color: '#6b7280' }}>
                                            +{plan.features.length - 4} more features
                                        </Text>
                                    )}
                                </div>
                            </Card>
                        </Radio.Button>
                    ))}
                </div>
            </Radio.Group>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
                <Button size="middle" onClick={onClose} style={{ borderRadius: 6, minWidth: 100 }}>
                    Later
                </Button>
                <Button
                    type="primary"
                    size="middle"
                    onClick={handleUpgrade}
                    disabled={!selectedPlan}
                    style={{
                        fontWeight: 600,
                        borderRadius: 6,
                        background: '#3b82f6',
                        borderColor: '#3b82f6',
                        minWidth: 100,
                    }}
                >
                    Upgrade
                </Button>
            </div>

            {/* Trial Info */}
            <div
                style={{
                    marginTop: 12,
                    padding: 8,
                    background: user?.status === 'trial' ? '#ecfdf5' : '#fef3c7',
                    borderRadius: 6,
                    border: user?.status === 'trial' ? '1px solid #d1fae5' : '1px solid #fde68a',
                    textAlign: 'center',
                }}
            >
                <Text style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: user?.status === 'trial' ? '#065f46' : '#92400e'
                }}>
                    {user?.status === 'trial'
                        ? `💡 ${trialInfo.remainingDays} days left in your free trial`
                        : `🎉 Current plan: ${user?.plan || 'Active'}`
                    }
                </Text>
            </div>
        </CustomModal>
    );
};

export default SubscriptionModal;