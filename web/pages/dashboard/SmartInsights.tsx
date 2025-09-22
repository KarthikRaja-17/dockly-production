import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, Lightbulb, Target, Zap, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const SmartInsights: React.FC = () => {
    const [insights, setInsights] = useState([
        {
            id: 1,
            type: 'productivity',
            icon: <Brain size={18} />,
            title: 'Peak Performance Window',
            description: 'Your productivity peaks between 10-11 AM. Schedule important tasks during this time.',
            confidence: 92,
            action: 'Optimize Schedule',
            bgColor: '#eff6ff',
            borderColor: '#bfdbfe',
            textColor: '#1e40af',
            actionColor: '#2563eb'
        },
        {
            id: 2,
            type: 'financial',
            icon: <TrendingUp size={18} />,
            title: 'Spending Pattern Alert',
            description: 'Coffee expenses increased 40% this month. Consider a subscription plan.',
            confidence: 87,
            action: 'View Options',
            bgColor: '#f0fdf4',
            borderColor: '#bbf7d0',
            textColor: '#166534',
            actionColor: '#16a34a'
        },
        {
            id: 3,
            type: 'health',
            icon: <Target size={18} />,
            title: 'Activity Goal Insight',
            description: 'You\'re 23% more active on days when you sleep 7+ hours.',
            confidence: 89,
            action: 'Sleep Better',
            bgColor: '#fef2f2',
            borderColor: '#fecaca',
            textColor: '#991b1b',
            actionColor: '#dc2626'
        },
        {
            id: 4,
            type: 'automation',
            icon: <Zap size={18} />,
            title: 'Automation Opportunity',
            description: 'Auto-categorize recurring transactions to save 15 minutes weekly.',
            confidence: 95,
            action: 'Set Up',
            bgColor: '#faf5ff',
            borderColor: '#e9d5ff',
            textColor: '#7c2d12',
            actionColor: '#8b5cf6'
        }
    ]);

    const [selectedInsight, setSelectedInsight] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsProcessing(true);
            setTimeout(() => {
                setIsProcessing(false);
            }, 2000);
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 90) return '#10b981';
        if (confidence >= 80) return '#f59e0b';
        return '#ef4444';
    };

    return (
        <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            marginBottom: '24px',
            overflow: 'hidden',
            opacity: 0,
            animation: 'fadeInUp 0.6s ease-out 0.5s forwards'
        }}>
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
                        <Brain size={20} style={{ color: '#8b5cf6' }} />
                        <h3 style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#1e293b',
                            margin: 0
                        }}>
                            Smart Insights
                        </h3>
                    </div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 8px',
                        backgroundColor: isProcessing ? '#fef3c7' : '#f0fdf4',
                        borderRadius: '12px'
                    }}>
                        <div style={{
                            width: '6px',
                            height: '6px',
                            backgroundColor: isProcessing ? '#f59e0b' : '#10b981',
                            borderRadius: '50%',
                            animation: isProcessing ? 'pulse 1s infinite' : 'none'
                        }} />
                        <span style={{
                            fontSize: '12px',
                            color: isProcessing ? '#92400e' : '#16a34a',
                            fontWeight: '500'
                        }}>
                            {isProcessing ? 'Analyzing' : 'AI Active'}
                        </span>
                    </div>
                </div>
            </div>

            <div style={{ padding: '24px' }}>
                {/* Featured Insight */}
                <div style={{
                    padding: '20px',
                    backgroundColor: insights[selectedInsight].bgColor,
                    border: `1px solid ${insights[selectedInsight].borderColor}`,
                    borderRadius: '16px',
                    marginBottom: '20px',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{
                            color: insights[selectedInsight].actionColor,
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            padding: '10px',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {insights[selectedInsight].icon}
                        </div>

                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <h4 style={{
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: insights[selectedInsight].textColor,
                                    margin: 0
                                }}>
                                    {insights[selectedInsight].title}
                                </h4>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '2px 6px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                    borderRadius: '6px'
                                }}>
                                    <div style={{
                                        width: '4px',
                                        height: '4px',
                                        backgroundColor: getConfidenceColor(insights[selectedInsight].confidence),
                                        borderRadius: '50%'
                                    }} />
                                    <span style={{
                                        fontSize: '10px',
                                        fontWeight: '500',
                                        color: insights[selectedInsight].textColor
                                    }}>
                                        {insights[selectedInsight].confidence}% confident
                                    </span>
                                </div>
                            </div>

                            <p style={{
                                fontSize: '14px',
                                color: insights[selectedInsight].textColor,
                                opacity: 0.9,
                                margin: '0 0 16px 0',
                                lineHeight: '1.4'
                            }}>
                                {insights[selectedInsight].description}
                            </p>

                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button style={{
                                    fontSize: '13px',
                                    color: insights[selectedInsight].actionColor,
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                                }}>
                                    {insights[selectedInsight].action} →
                                </button>
                                <button style={{
                                    fontSize: '13px',
                                    color: insights[selectedInsight].textColor,
                                    backgroundColor: 'transparent',
                                    border: `1px solid ${insights[selectedInsight].borderColor}`,
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    fontWeight: '500',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}>
                                    Learn More
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Animated background pattern */}
                    <div style={{
                        position: 'absolute',
                        top: '-30%',
                        right: '-30%',
                        width: '150%',
                        height: '150%',
                        background: `radial-gradient(circle, ${insights[selectedInsight].actionColor}10 0%, transparent 70%)`,
                        transform: 'rotate(45deg)',
                        opacity: 0.5
                    }} />
                </div>

                {/* Insight Navigation */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '12px',
                    marginBottom: '20px'
                }}>
                    {insights.map((insight, index) => (
                        <div
                            key={insight.id}
                            className="card-hover"
                            style={{
                                padding: '12px',
                                backgroundColor: selectedInsight === index ? insight.bgColor : '#f8fafc',
                                border: `1px solid ${selectedInsight === index ? insight.borderColor : '#e2e8f0'}`,
                                borderRadius: '12px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                opacity: 0,
                                animation: `slideIn 0.4s ease-out ${0.6 + index * 0.1}s forwards`
                            }}
                            onClick={() => setSelectedInsight(index)}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                <div style={{
                                    color: insight.actionColor,
                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                    padding: '6px',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {React.cloneElement(insight.icon, { size: 14 })}
                                </div>
                                <span style={{
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    color: selectedInsight === index ? insight.textColor : '#64748b'
                                }}>
                                    {insight.title}
                                </span>
                            </div>
                            <div style={{
                                height: '2px',
                                backgroundColor: selectedInsight === index ? insight.actionColor : '#e2e8f0',
                                borderRadius: '1px',
                                transition: 'background-color 0.2s ease'
                            }} />
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div style={{
                    display: 'flex',
                    gap: '8px',
                    padding: '16px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px'
                }}>
                    <button style={{
                        flex: 1,
                        padding: '10px',
                        fontSize: '13px',
                        color: '#8b5cf6',
                        backgroundColor: '#faf5ff',
                        border: '1px solid #e9d5ff',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                    }}>
                        <Lightbulb size={14} />
                        Get More Insights
                    </button>
                    <button style={{
                        flex: 1,
                        padding: '10px',
                        fontSize: '13px',
                        color: '#64748b',
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                    }}>
                        <Clock size={14} />
                        View History
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SmartInsights;