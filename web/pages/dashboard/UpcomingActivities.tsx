import React from 'react';
import { Calendar, Clock, MapPin, Video, DollarSign } from 'lucide-react';

const UpcomingActivities: React.FC = () => {
    const todayActivities = [
        {
            id: 1,
            title: 'Team Standup Meeting',
            subtitle: 'Video Conference - Zoom',
            time: '9:00 AM',
            type: 'meeting',
            color: '#3b82f6',
            icon: <Video size={16} />
        },
        {
            id: 2,
            title: "Doctor's Appointment",
            subtitle: 'Annual Checkup - Dr. Smith',
            time: '2:00 PM',
            type: 'appointment',
            color: '#10b981',
            icon: <MapPin size={16} />
        },
        {
            id: 3,
            title: 'Mortgage Payment Due',
            subtitle: 'Chase Bank - $1,450.00',
            time: 'Due Today',
            type: 'payment',
            color: '#f59e0b',
            icon: <DollarSign size={16} />
        }
    ];

    const upcomingActivities = [
        {
            date: { day: '20', month: 'Jun' },
            title: 'Car Insurance',
            subtitle: 'Progressive - $132.50',
            timeLabel: 'Tomorrow'
        },
        {
            date: { day: '23', month: 'Jun' },
            title: "Sarah's Birthday",
            subtitle: 'Family Event',
            timeLabel: 'in 4 days'
        },
        {
            date: { day: '25', month: 'Jun' },
            title: 'Internet Bill',
            subtitle: 'Xfinity - $89.99',
            timeLabel: 'in 6 days'
        }
    ];

    return (
        <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            opacity: 0,
            animation: 'fadeInUp 0.6s ease-out 0.6s forwards'
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
                        <Calendar size={20} style={{ color: '#3b82f6' }} />
                        <h3 style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#1e293b',
                            margin: 0
                        }}>
                            Upcoming Activities
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
                        View Calendar →
                    </a>
                </div>
            </div>

            <div style={{ padding: '24px' }}>
                {/* Today Section */}
                <div style={{ marginBottom: '32px' }}>
                    <h4 style={{
                        fontSize: '12px',
                        fontWeight: '700',
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginBottom: '16px',
                        margin: '0 0 16px 0'
                    }}>
                        Today - Thursday, June 19
                    </h4>

                    <div>
                        {todayActivities.map((activity, index) => (
                            <div
                                key={activity.id}
                                className="card-hover"
                                style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    marginBottom: index < todayActivities.length - 1 ? '8px' : 0,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    opacity: 0,
                                    animation: `slideIn 0.4s ease-out ${0.7 + index * 0.1}s forwards`
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f8fafc';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                            >
                                <div style={{
                                    width: '4px',
                                    height: '48px',
                                    backgroundColor: activity.color,
                                    borderRadius: '2px',
                                    marginRight: '16px',
                                    flexShrink: 0
                                }} />

                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: '4px'
                                    }}>
                                        <div>
                                            <p style={{
                                                fontSize: '15px',
                                                fontWeight: '600',
                                                color: '#1e293b',
                                                margin: '0 0 4px 0'
                                            }}>
                                                {activity.title}
                                            </p>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                fontSize: '13px',
                                                color: '#64748b'
                                            }}>
                                                {activity.icon}
                                                <span>{activity.subtitle}</span>
                                            </div>
                                        </div>
                                        <span style={{
                                            fontSize: '13px',
                                            color: activity.type === 'payment' ? activity.color : '#64748b',
                                            fontWeight: activity.type === 'payment' ? '600' : '500',
                                            backgroundColor: activity.type === 'payment' ? '#fffbeb' : 'transparent',
                                            padding: activity.type === 'payment' ? '4px 8px' : '0',
                                            borderRadius: activity.type === 'payment' ? '6px' : '0'
                                        }}>
                                            {activity.time}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upcoming Section */}
                <div>
                    <h4 style={{
                        fontSize: '12px',
                        fontWeight: '700',
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        margin: '0 0 16px 0'
                    }}>
                        Next 7 Days
                    </h4>

                    <div>
                        {upcomingActivities.map((activity, index) => (
                            <div
                                key={index}
                                className="card-hover"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '12px 8px',
                                    borderBottom: index < upcomingActivities.length - 1 ? '1px solid #f1f5f9' : 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    opacity: 0,
                                    animation: `slideIn 0.4s ease-out ${1 + index * 0.1}s forwards`
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f8fafc';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                            >
                                <div style={{
                                    width: '50px',
                                    height: '50px',
                                    backgroundColor: '#f1f5f9',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '16px',
                                    flexShrink: 0
                                }}>
                                    <span style={{
                                        fontSize: '16px',
                                        fontWeight: '700',
                                        color: '#1e293b'
                                    }}>
                                        {activity.date.day}
                                    </span>
                                    <span style={{
                                        fontSize: '11px',
                                        color: '#64748b',
                                        fontWeight: '500'
                                    }}>
                                        {activity.date.month}
                                    </span>
                                </div>

                                <div style={{ flex: 1 }}>
                                    <p style={{
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#1e293b',
                                        margin: '0 0 2px 0'
                                    }}>
                                        {activity.title}
                                    </p>
                                    <p style={{
                                        fontSize: '12px',
                                        color: '#64748b',
                                        margin: 0
                                    }}>
                                        {activity.subtitle}
                                    </p>
                                </div>

                                <span style={{
                                    fontSize: '12px',
                                    color: '#64748b',
                                    fontWeight: '500'
                                }}>
                                    {activity.timeLabel}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpcomingActivities;