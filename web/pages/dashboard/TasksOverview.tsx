import React, { useState } from 'react';
import { CheckSquare, Square, Clock, AlertCircle, Plus } from 'lucide-react';

const TasksOverview: React.FC = () => {
    const [tasks, setTasks] = useState([
        {
            id: 1,
            title: 'Review quarterly budget reports',
            priority: 'high',
            completed: false,
            dueDate: 'Today',
            category: 'Finance',
            progress: 75
        },
        {
            id: 2,
            title: 'Update team presentation slides',
            priority: 'medium',
            completed: true,
            dueDate: 'Yesterday',
            category: 'Work',
            progress: 100
        },
        {
            id: 3,
            title: 'Schedule doctor appointment',
            priority: 'high',
            completed: false,
            dueDate: 'Tomorrow',
            category: 'Personal',
            progress: 30
        },
        {
            id: 4,
            title: 'Organize digital photos',
            priority: 'low',
            completed: false,
            dueDate: 'This week',
            category: 'Personal',
            progress: 10
        },
        {
            id: 5,
            title: 'Organize Your Day - Example ',
            priority: 'low',
            completed: false,
            dueDate: 'This week',
            category: 'Personal',
            progress: 50
        },
        {
            id: 6,
            title: 'Organize Your Day - Example 2',
            priority: 'low',
            completed: false,
            dueDate: 'This week',
            category: 'Personal',
            progress: 70
        }
    ]);

    const toggleTask = (id: number) => {
        setTasks(prev => prev.map(task =>
            task.id === id ? { ...task, completed: !task.completed, progress: task.completed ? 75 : 100 } : task
        ));
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return { bg: '#fef2f2', border: '#fecaca', text: '#dc2626' };
            case 'medium': return { bg: '#fffbeb', border: '#fed7aa', text: '#d97706' };
            case 'low': return { bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a' };
            default: return { bg: '#f8fafc', border: '#e2e8f0', text: '#64748b' };
        }
    };

    const completedTasks = tasks.filter(task => task.completed).length;
    const totalTasks = tasks.length;
    const completionPercentage = (completedTasks / totalTasks) * 100;

    return (
        <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            opacity: 0,
            animation: 'fadeInUp 0.6s ease-out 1s forwards'
        }}>
            {/* Header with Progress */}
            <div style={{
                padding: '20px 24px',
                borderBottom: '1px solid #f1f5f9',
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckSquare size={20} style={{ color: '#10b981' }} />
                        <h3 style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#1e293b',
                            margin: 0
                        }}>
                            Tasks Overview
                        </h3>
                    </div>
                    <button style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '6px 12px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}>
                        <Plus size={14} />
                        Add Task
                    </button>
                </div>

                {/* Progress Summary */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{
                            height: '6px',
                            backgroundColor: '#f1f5f9',
                            borderRadius: '3px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                height: '100%',
                                backgroundColor: '#10b981',
                                width: `${completionPercentage}%`,
                                borderRadius: '3px',
                                transition: 'width 1s ease-out'
                            }} />
                        </div>
                    </div>
                    <span style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#1e293b'
                    }}>
                        {completedTasks}/{totalTasks} completed
                    </span>
                </div>
            </div>

            <div style={{ padding: '24px' }}>
                {/* Task List */}
                <div>
                    {tasks.map((task, index) => {
                        const priorityColors = getPriorityColor(task.priority);

                        return (
                            <div
                                key={task.id}
                                className="card-hover"
                                style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '12px',
                                    padding: '16px 12px',
                                    borderRadius: '12px',
                                    marginBottom: index < tasks.length - 1 ? '8px' : 0,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    opacity: 0,
                                    animation: `slideIn 0.4s ease-out ${1.1 + index * 0.1}s forwards`,
                                    backgroundColor: task.completed ? '#f8fafc' : 'transparent'
                                }}
                                onMouseEnter={(e) => {
                                    if (!task.completed) {
                                        e.currentTarget.style.backgroundColor = '#f8fafc';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!task.completed) {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }
                                }}
                                onClick={() => toggleTask(task.id)}
                            >
                                {/* Checkbox */}
                                <div style={{
                                    marginTop: '2px',
                                    cursor: 'pointer'
                                }}>
                                    {task.completed ? (
                                        <CheckSquare size={20} style={{ color: '#10b981' }} />
                                    ) : (
                                        <Square size={20} style={{ color: '#9ca3af' }} />
                                    )}
                                </div>

                                <div style={{ flex: 1 }}>
                                    {/* Task Title */}
                                    <h4 style={{
                                        fontSize: '15px',
                                        fontWeight: '600',
                                        color: task.completed ? '#9ca3af' : '#1e293b',
                                        margin: '0 0 8px 0',
                                        textDecoration: task.completed ? 'line-through' : 'none'
                                    }}>
                                        {task.title}
                                    </h4>

                                    {/* Task Meta */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        marginBottom: '8px'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Clock size={12} style={{ color: '#64748b' }} />
                                            <span style={{ fontSize: '12px', color: '#64748b' }}>
                                                {task.dueDate}
                                            </span>
                                        </div>

                                        <span style={{
                                            fontSize: '11px',
                                            fontWeight: '500',
                                            color: priorityColors.text,
                                            backgroundColor: priorityColors.bg,
                                            border: `1px solid ${priorityColors.border}`,
                                            padding: '2px 6px',
                                            borderRadius: '4px'
                                        }}>
                                            {task.priority}
                                        </span>

                                        <span style={{
                                            fontSize: '11px',
                                            color: '#64748b',
                                            backgroundColor: '#f1f5f9',
                                            padding: '2px 6px',
                                            borderRadius: '4px'
                                        }}>
                                            {task.category}
                                        </span>
                                    </div>

                                    {/* Progress Bar */}
                                    {!task.completed && (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <div style={{
                                                flex: 1,
                                                height: '4px',
                                                backgroundColor: '#f1f5f9',
                                                borderRadius: '2px',
                                                overflow: 'hidden'
                                            }}>
                                                <div style={{
                                                    height: '100%',
                                                    backgroundColor: task.progress > 70 ? '#10b981' : task.progress > 30 ? '#f59e0b' : '#ef4444',
                                                    width: `${task.progress}%`,
                                                    borderRadius: '2px',
                                                    transition: 'width 0.5s ease-out'
                                                }} />
                                            </div>
                                            <span style={{
                                                fontSize: '11px',
                                                color: '#64748b',
                                                fontWeight: '500'
                                            }}>
                                                {task.progress}%
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Quick Stats */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '12px',
                    marginTop: '20px',
                    padding: '16px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '18px', fontWeight: '700', color: '#10b981', margin: '0 0 4px 0' }}>
                            {completedTasks}
                        </p>
                        <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
                            Completed
                        </p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '18px', fontWeight: '700', color: '#f59e0b', margin: '0 0 4px 0' }}>
                            {tasks.filter(t => !t.completed && t.priority === 'high').length}
                        </p>
                        <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
                            High Priority
                        </p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '18px', fontWeight: '700', color: '#3b82f6', margin: '0 0 4px 0' }}>
                            {tasks.filter(t => !t.completed).length}
                        </p>
                        <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
                            Remaining
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TasksOverview;