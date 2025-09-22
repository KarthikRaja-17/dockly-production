import React from 'react';
import { AlertTriangle, Lightbulb, Bot, Shield, DollarSign, Zap } from 'lucide-react';

const AlertsSuggestions: React.FC = () => {
  const alerts = [
    {
      id: 1,
      type: 'security',
      icon: <Shield size={20} />,
      title: 'Password Security Alert',
      description: '3 accounts using weak passwords',
      action: 'Update Now',
      bgColor: '#fef2f2',
      borderColor: '#fecaca',
      textColor: '#991b1b',
      actionColor: '#dc2626'
    },
    {
      id: 2,
      type: 'savings',
      icon: <DollarSign size={20} />,
      title: 'Save on Subscriptions',
      description: 'Bundle Netflix & Hulu to save $5/month',
      action: 'Learn More',
      bgColor: '#fffbeb',
      borderColor: '#fed7aa',
      textColor: '#92400e',
      actionColor: '#d97706'
    },
    {
      id: 3,
      type: 'ai',
      icon: <Bot size={20} />,
      title: 'AI Suggestion',
      description: 'Set up auto-pay for recurring bills',
      action: 'Set Up',
      bgColor: '#eff6ff',
      borderColor: '#bfdbfe',
      textColor: '#1e40af',
      actionColor: '#2563eb'
    },
    // {
    //   id: 4,
    //   type: 'optimization',
    //   icon: <Zap size={20} />,
    //   title: 'Performance Boost',
    //   description: 'Clean up 2.3GB of temporary files',
    //   action: 'Optimize',
    //   bgColor: '#f0fdf4',
    //   borderColor: '#bbf7d0',
    //   textColor: '#166534',
    //   actionColor: '#16a34a'
    // }
  ];

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '20px',
      border: '1px solid #e2e8f0',
      marginBottom: '24px',
      overflow: 'hidden',
      opacity: 0,
      animation: 'fadeInUp 0.6s ease-out 0.4s forwards'
    }}>
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid #f1f5f9',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Lightbulb size={20} style={{ color: '#f59e0b' }} />
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1e293b',
            margin: 0
          }}>
            Smart Alerts & Suggestions
          </h3>
        </div>
      </div>

      <div style={{ padding: '18px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px'
        }}>
          {alerts.map((alert, index) => (
            <div
              key={alert.id}
              className="card-hover"
              style={{
                padding: '20px',
                backgroundColor: alert.bgColor,
                border: `1px solid ${alert.borderColor}`,
                borderRadius: '16px',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
                opacity: 0,
                animation: `slideIn 0.5s ease-out ${0.5 + index * 0.1}s forwards`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{
                  color: alert.actionColor,
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  padding: '8px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {alert.icon}
                </div>

                <div style={{ flex: 1 }}>
                  <p style={{
                    fontSize: '15px',
                    fontWeight: '600',
                    color: alert.textColor,
                    margin: '0 0 4px 0'
                  }}>
                    {alert.title}
                  </p>
                  <p style={{
                    fontSize: '13px',
                    color: alert.textColor,
                    opacity: 0.8,
                    margin: '0 0 12px 0',
                    lineHeight: '1.4'
                  }}>
                    {alert.description}
                  </p>
                  <button style={{
                    fontSize: '13px',
                    color: alert.actionColor,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}>
                    {alert.action} →
                  </button>
                </div>
              </div>

              {/* Animated background pattern */}
              <div style={{
                position: 'absolute',
                top: '-50%',
                right: '-50%',
                width: '200%',
                height: '200%',
                background: `radial-gradient(circle, ${alert.actionColor}15 0%, transparent 70%)`,
                transform: 'rotate(45deg)',
                opacity: 0.3
              }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AlertsSuggestions;