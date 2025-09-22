import React, { useState, useEffect } from 'react';
import { Activity, Heart, Moon, Flame, Droplets, Target } from 'lucide-react';

const HealthPulse: React.FC = () => {
  const [healthData, setHealthData] = useState({
    steps: 7842,
    heartRate: 72,
    sleep: { hours: 7, minutes: 23 },
    calories: 1847,
    water: 5,
    waterTarget: 8
  });

  const [isConnected, setIsConnected] = useState(true);
  const [animatedSteps, setAnimatedSteps] = useState(0);

  useEffect(() => {
    // Animate steps counter
    const timer = setTimeout(() => {
      let current = 0;
      const increment = healthData.steps / 50;
      const stepTimer = setInterval(() => {
        current += increment;
        if (current >= healthData.steps) {
          setAnimatedSteps(healthData.steps);
          clearInterval(stepTimer);
        } else {
          setAnimatedSteps(Math.floor(current));
        }
      }, 20);
    }, 500);

    return () => clearTimeout(timer);
  }, [healthData.steps]);

  const getStepsPercentage = () => {
    const target = 10000;
    return Math.min((healthData.steps / target) * 100, 100);
  };

  const getWaterPercentage = () => {
    return (healthData.water / healthData.waterTarget) * 100;
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '20px',
      border: '1px solid #e2e8f0',
      overflow: 'hidden',
      opacity: 0,
      animation: 'fadeInUp 0.6s ease-out 0.9s forwards'
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
            <Activity size={20} style={{ color: '#ef4444' }} />
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1e293b',
              margin: 0
            }}>
              Health Pulse
            </h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              backgroundColor: isConnected ? '#10b981' : '#ef4444',
              borderRadius: '50%',
              animation: isConnected ? 'pulse 2s infinite' : 'none'
            }} />
            <span style={{
              fontSize: '12px',
              color: isConnected ? '#10b981' : '#ef4444',
              fontWeight: '500'
            }}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      <div style={{ padding: '24px' }}>
        {/* Main Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          marginBottom: '24px'
        }}>
          {/* Steps */}
          <div style={{
            textAlign: 'center',
            padding: '20px 16px',
            backgroundColor: '#f0f9ff',
            borderRadius: '16px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Activity size={24} style={{ color: '#3b82f6', marginBottom: '8px' }} />
            <p style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1e293b',
              margin: '0 0 4px 0'
            }}>
              {animatedSteps.toLocaleString()}
            </p>
            <p style={{
              fontSize: '12px',
              color: '#64748b',
              margin: '0 0 8px 0'
            }}>
              Steps
            </p>

            {/* Progress bar */}
            <div style={{
              width: '100%',
              height: '4px',
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                backgroundColor: '#3b82f6',
                width: `${getStepsPercentage()}%`,
                borderRadius: '2px',
                transition: 'width 2s cubic-bezier(0.4, 0, 0.2, 1)'
              }} />
            </div>

            {/* Background decoration */}
            <div style={{
              position: 'absolute',
              top: '-10px',
              right: '-10px',
              width: '40px',
              height: '40px',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '50%'
            }} />
          </div>

          {/* Heart Rate */}
          <div style={{
            textAlign: 'center',
            padding: '20px 16px',
            backgroundColor: '#fef2f2',
            borderRadius: '16px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Heart
              size={24}
              style={{
                color: '#ef4444',
                marginBottom: '8px',
                animation: 'heartbeat 1.5s ease-in-out infinite'
              }}
            />
            <p style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1e293b',
              margin: '0 0 4px 0'
            }}>
              {healthData.heartRate}
            </p>
            <p style={{
              fontSize: '12px',
              color: '#64748b',
              margin: 0
            }}>
              BPM
            </p>

            {/* Background decoration */}
            <div style={{
              position: 'absolute',
              top: '-10px',
              right: '-10px',
              width: '40px',
              height: '40px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '50%'
            }} />
          </div>
        </div>

        {/* Detailed Stats */}
        <div>
          <div style={{ marginBottom: '12px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Moon size={16} style={{ color: '#6366f1' }} />
                <span style={{ fontSize: '14px', color: '#64748b' }}>Sleep</span>
              </div>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                {healthData.sleep.hours}h {healthData.sleep.minutes}m
              </span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Flame size={16} style={{ color: '#f59e0b' }} />
                <span style={{ fontSize: '14px', color: '#64748b' }}>Calories</span>
              </div>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                {healthData.calories.toLocaleString()} cal
              </span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Droplets size={16} style={{ color: '#06b6d4' }} />
                <span style={{ fontSize: '14px', color: '#64748b' }}>Water</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                  {healthData.water}/{healthData.waterTarget} glasses
                </span>
                <div style={{
                  width: '40px',
                  height: '6px',
                  backgroundColor: '#f1f5f9',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    backgroundColor: '#06b6d4',
                    width: `${getWaterPercentage()}%`,
                    borderRadius: '3px',
                    transition: 'width 1s ease-out'
                  }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button style={{
          width: '100%',
          padding: '12px',
          fontSize: '14px',
          color: '#3b82f6',
          backgroundColor: '#f0f9ff',
          border: '1px solid #bfdbfe',
          borderRadius: '12px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          marginTop: '16px'
        }}>
          View Health Dashboard →
        </button>
      </div>

      <style>{`
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default HealthPulse;