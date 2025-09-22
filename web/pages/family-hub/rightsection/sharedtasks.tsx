'use client';
import React, { useEffect, useState } from 'react';
import { Card, Button, List, Input, Select, DatePicker, Typography, message, Space, Badge, Modal, Alert } from 'antd';
import { CheckCircleOutlined, EditOutlined, PlusOutlined, EyeOutlined, ClockCircleOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

export interface FamilyMember {
    id: string;
    name: string;
    relationship: string;
    email: string;
    phone: string;
    number: string;
    accessCode: string;
    code: string;
    method: 'Email' | 'Mobile' | 'Phone' | 'Access Code';
    permissions: PermissionState;
    type: 'FullAccess' | 'CustomAccess' | string;
    sharedItems: { [key: string]: string[] };
}

export interface Task {
    title: string;
    description: string;
    dueDate: Dayjs;
    assignedTo: string;
    addedBy: string;
    addedTime: Dayjs;
    editedBy?: string;
    editedTime?: Dayjs;
    completed?: boolean;
    completedTime?: Dayjs;
}

import { addFamilyTasks, getUserSharedTasks } from '../../../services/family';
import { useGlobalLoading } from '../../../app/loadingContext';

const { Title, Text } = Typography;
const { Option } = Select;

interface SharedTasksCardProps {
    tasks?: Task[];
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
    familyMembers?: FamilyMember[];
    selectedUser: string;
    setSelectedUser: (user: string) => void;
    localStep: string;
    setLocalStep: (step: string) => void;
    isMobile: boolean;
}

const SharedTasksCard: React.FC<SharedTasksCardProps> = ({
    tasks = [],
    setTasks,
    familyMembers = [],
    selectedUser,
    setSelectedUser,
    localStep,
    setLocalStep,
    isMobile,
}) => {
    const getStoredUser = (): string => {
        if (typeof window !== 'undefined' && window.localStorage) {
            return localStorage.getItem('username') || selectedUser || 'Unknown User';
        }
        return selectedUser || 'Unknown User';
    };

    const [newTask, setNewTask] = useState<Task>({
        title: '',
        description: '',
        dueDate: dayjs(),
        assignedTo: selectedUser,
        addedBy: getStoredUser(),
        addedTime: dayjs(),
    });
    const [editTaskIndex, setEditTaskIndex] = useState<number | null>(null);
    const { loading, setLoading } = useGlobalLoading();
    const [showAllModal, setShowAllModal] = useState<boolean>(false);
    const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');

    useEffect(() => {
        setNewTask((prev) => ({
            ...prev,
            addedBy: getStoredUser(),
        }));
    }, [selectedUser]);

    const resolveMemberName = (idOrName: string | undefined): string => {
        if (!idOrName) return 'Unknown';
        const member = familyMembers.find((m) => m.id === idOrName || m.name === idOrName);
        return member ? member.name : 'Unknown';
    };

    const getTasks = async () => {
        setLoading(true);
        try {
            const response = await getUserSharedTasks();
            const { status, payload, message: responseMessage } = response;
            if (status === 1 && Array.isArray(payload?.shared_tasks)) {
                const formattedTasks = payload.shared_tasks.map((task: any) => ({
                    title: task.task || task.title || '',
                    description: task.description || '',
                    dueDate: task.dueDate || task.due_date ? dayjs(task.dueDate || task.due_date) : dayjs(),
                    assignedTo: resolveMemberName(task.assignedTo || task.assigned_to),
                    addedBy: resolveMemberName(task.addedBy || task.added_by),
                    addedTime: task.added_time ? dayjs(task.added_time) : dayjs(),
                    editedBy: task.editedBy || task.edited_by ? resolveMemberName(task.editedBy || task.edited_by) : undefined,
                    editedTime: task.edited_time ? dayjs(task.edited_time) : undefined,
                    completed: task.completed || false,
                    completedTime: task.completed_time ? dayjs(task.completed_time) : undefined,
                }));
                setTasks(formattedTasks);
            } else {
                console.warn('Failed to fetch tasks:', responseMessage);
                setTasks([]);
                message.error(responseMessage || 'Failed to fetch tasks');
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
            setTasks([]);
            message.error('Failed to fetch tasks');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getTasks();
        if (!selectedUser && familyMembers.length > 0) {
            setSelectedUser(familyMembers[0].name);
        }
    }, [familyMembers, setSelectedUser]);

    const handleAddTask = async () => {
        setLoading(true);
        const currentUser = getStoredUser();
        if (!newTask.title.trim() || !newTask.description.trim() || !newTask.assignedTo || !currentUser || !newTask.dueDate) {
            message.error('Please fill in all task fields or ensure you are logged in.');
            setLoading(false);
            return;
        }

        const newTaskData = {
            ...newTask,
            addedBy: currentUser,
            addedTime: dayjs(),
        };

        try {
            const response = await addFamilyTasks({
                sharedtasks: {
                    title: newTask.title,
                    description: newTask.description,
                    dueDate: newTask.dueDate.format('YYYY-MM-DD'),
                    assignedTo: newTask.assignedTo,
                    addedBy: currentUser,
                    editedBy: null,
                },
            });
            if (response.status === 1) {
                setTasks([...tasks, newTaskData]);
                setNewTask({
                    title: '',
                    description: '',
                    dueDate: dayjs(),
                    assignedTo: selectedUser,
                    addedBy: currentUser,
                    addedTime: dayjs(),
                });
                setLocalStep('family');
                message.success('Task added successfully!');
            } else {
                message.error(response.message || 'Failed to add task');
            }
        } catch (error) {
            console.error('Error adding task:', error);
            message.error('Failed to add task');
        } finally {
            setLoading(false);
        }
    };

    const handleEditTask = async () => {
        setLoading(true);
        const currentUser = getStoredUser();
        if (
            !newTask.title.trim() ||
            !newTask.description.trim() ||
            !newTask.assignedTo ||
            !currentUser ||
            !newTask.dueDate ||
            editTaskIndex === null
        ) {
            message.error('Please fill in all task fields or ensure you are logged in.');
            setLoading(false);
            return;
        }

        const updatedTasks = [...tasks];
        updatedTasks[editTaskIndex] = {
            ...newTask,
            addedBy: tasks[editTaskIndex].addedBy,
            addedTime: tasks[editTaskIndex].addedTime,
            editedBy: currentUser,
            editedTime: dayjs(),
        };

        try {
            const response = await addFamilyTasks({
                sharedtasks: {
                    title: newTask.title,
                    description: newTask.description,
                    dueDate: newTask.dueDate.format('YYYY-MM-DD'),
                    assignedTo: newTask.assignedTo,
                    addedBy: tasks[editTaskIndex].addedBy,
                    editedBy: currentUser,
                    editedTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                },
            });
            if (response.status === 1) {
                setTasks(updatedTasks);
                setNewTask({
                    title: '',
                    description: '',
                    dueDate: dayjs(),
                    assignedTo: selectedUser,
                    addedBy: currentUser,
                    addedTime: dayjs(),
                });
                setEditTaskIndex(null);
                setLocalStep('family');
                message.success('Task updated successfully!');
            } else {
                message.error(response.message || 'Failed to update task');
            }
        } catch (error) {
            console.error('Error updating task:', error);
            message.error('Failed to update task');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleComplete = (taskToToggle: Task) => {
        const currentUser = getStoredUser();
        const updatedTasks = [...tasks];
        const taskIndex = tasks.findIndex((task) => task === taskToToggle);
        updatedTasks[taskIndex] = {
            ...updatedTasks[taskIndex],
            completed: !updatedTasks[taskIndex].completed,
            completedTime: !updatedTasks[taskIndex].completed ? dayjs() : undefined,
            editedBy: currentUser,
            editedTime: dayjs(),
        };
        setTasks(updatedTasks);
    };

    const getFilteredTasks = () => {
        let filteredTasks = tasks ?? [];
        if (taskFilter === 'pending') {
            filteredTasks = filteredTasks.filter((task) => !task.completed);
        } else if (taskFilter === 'completed') {
            filteredTasks = filteredTasks.filter((task) => task.completed);
        }
        return filteredTasks;
    };

    const getDisplayTasks = () => {
        const filteredTasks = getFilteredTasks();
        return filteredTasks.slice(0, 2);
    };

    const filteredTasks = getFilteredTasks();
    const displayTasks = getDisplayTasks();
    const pendingCount = (tasks ?? []).filter((task) => !task.completed).length;
    const completedCount = (tasks ?? []).filter((task) => task.completed).length;

    const renderTaskList = (tasksToRender: Task[], isModal = false) => (
        <List
            dataSource={tasksToRender}
            renderItem={(task) => (
                <List.Item
                    actions={[
                        <Button
                            type="link"
                            size="small"
                            onClick={() => handleToggleComplete(task)}
                            style={{
                                padding: '0',
                                color: task.completed ? '#52c41a' : '#faad14',
                                marginRight: '8px',
                            }}
                        >
                            {task.completed ? <CheckOutlined /> : <ClockCircleOutlined />}
                        </Button>,
                        <Button
                            type="link"
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => {
                                const actualIndex = tasks.findIndex((t) => t === task);
                                setNewTask(task);
                                setEditTaskIndex(actualIndex);
                                setLocalStep('editTask');
                                if (isModal) {
                                    setShowAllModal(false);
                                }
                            }}
                            style={{ padding: '0', color: '#1890ff' }}
                        >
                            Edit
                        </Button>,
                    ]}
                    style={{
                        flexWrap: isMobile ? 'wrap' : 'nowrap',
                        opacity: task.completed ? 0.7 : 1,
                        backgroundColor: task.completed ? '#f6ffed' : 'transparent',
                        borderRadius: '5px',
                        padding: '8px',
                        marginBottom: '4px',
                    }}
                >
                    <List.Item.Meta
                        title={
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Text
                                    style={{
                                        fontSize: '14px',
                                        textDecoration: task.completed ? 'line-through' : 'none',
                                    }}
                                >
                                    {task.title}
                                </Text>
                                {task.completed && (
                                    <Badge status="success" text="Completed" style={{ fontSize: '11px' }} />
                                )}
                            </div>
                        }
                        description={
                            <div>
                                <Text style={{ fontSize: '12px', color: '#666' }}>
                                    Assigned to: {task.assignedTo || 'Unknown'}
                                </Text>
                                <br />
                                <Text style={{ fontSize: '12px', color: '#666' }}>
                                    Due: {task.dueDate ? dayjs(task.dueDate).format('MMM D, YYYY') : 'N/A'}
                                </Text>
                                <br />
                                <Text style={{ fontSize: '12px', color: '#666' }}>
                                    Added by {task.addedBy || ''} on{' '}
                                    {task.addedTime ? dayjs(task.addedTime).format('MMM D, YYYY h:mm A') : 'N/A'}
                                </Text>
                                {task.completed && task.completedTime && (
                                    <>
                                        <br />
                                        <Text style={{ fontSize: '12px', color: '#52c41a' }}>
                                            Completed on {dayjs(task.completedTime).format('MMM D, YYYY h:mm A')}
                                        </Text>
                                    </>
                                )}
                                {task.editedBy && task.editedTime && (
                                    <>
                                        <br />
                                        <Text style={{ fontSize: '12px', color: '#666' }}>
                                            Edited by {task.editedBy} on {dayjs(task.editedTime).format('MMM D, YYYY h:mm A')}
                                        </Text>
                                    </>
                                )}
                            </div>
                        }
                    />
                </List.Item>
            )}
        />
    );

    return (
        <>
            <Card
                style={{
                    borderRadius: '10px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    marginBottom: '16px',
                    width: '100%',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <CheckCircleOutlined style={{ fontSize: '20px', color: '#52c41a', marginRight: '10px' }} />
                        <Title level={4} style={{ color: '#52c41a', margin: 0 }}>
                            Shared Tasks
                        </Title>
                    </div>
                    <Space wrap style={{ marginTop: isMobile ? '10px' : '0' }}>
                        <Button
                            type={taskFilter === 'all' ? 'primary' : 'default'}
                            size="small"
                            onClick={() => setTaskFilter('all')}
                            style={{ borderRadius: '15px', fontSize: '12px' }}
                        >
                            All ({(tasks ?? []).length})
                        </Button>
                        <Button
                            type={taskFilter === 'pending' ? 'primary' : 'default'}
                            size="small"
                            icon={<ClockCircleOutlined />}
                            onClick={() => setTaskFilter('pending')}
                            style={{ borderRadius: '15px', fontSize: '12px' }}
                        >
                            Pending ({pendingCount})
                        </Button>
                        <Button
                            type={taskFilter === 'completed' ? 'primary' : 'default'}
                            size="small"
                            icon={<CheckOutlined />}
                            onClick={() => setTaskFilter('completed')}
                            style={{ borderRadius: '15px', fontSize: '12px' }}
                        >
                            Completed ({completedCount})
                        </Button>
                    </Space>
                </div>

                {familyMembers.length === 0 && (
                    <Alert
                        message="No family members available. Please add a family member to enable adding tasks."
                        type="warning"
                        showIcon
                        style={{ marginBottom: '10px' }}
                    />
                )}

                {loading ? (
                    <Text>Loading tasks...</Text>
                ) : (
                    <>
                        {renderTaskList(displayTasks)}
                        {(filteredTasks ?? []).length > 2 && (
                            <div style={{ textAlign: 'center', marginTop: '15px' }}>
                                <Button
                                    type="primary"
                                    icon={<EyeOutlined />}
                                    onClick={() => setShowAllModal(true)}
                                    style={{
                                        borderRadius: '20px',
                                        padding: '8px 20px',
                                        backgroundColor: 'rgba(3, 48, 90, 0.81)',
                                        color: '#fff',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                    }}
                                >
                                    View All Tasks ({filteredTasks.length})
                                </Button>
                            </div>
                        )}
                    </>
                )}

                {familyMembers.length > 0 && (
                    <Button
                        type="link"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setNewTask({
                                title: '',
                                description: '',
                                dueDate: dayjs(),
                                assignedTo: selectedUser,
                                addedBy: getStoredUser(),
                                addedTime: dayjs(),
                            });
                            setEditTaskIndex(null);
                            setLocalStep('addTask');
                        }}
                        style={{ marginTop: '10px', padding: '0', color: '#1890ff', width: isMobile ? '100%' : 'auto' }}
                    >
                        Add Task
                    </Button>
                )}

                {(localStep === 'addTask' || localStep === 'editTask') && familyMembers.length > 0 && (
                    <div style={{ marginTop: '20px', padding: '20px', background: '#fafafa', borderRadius: '5px' }}>
                        <Title level={5}>{localStep === 'addTask' ? 'Add Task' : 'Edit Task'}</Title>
                        <Input
                            placeholder="Task Title"
                            value={newTask.title}
                            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                            style={{ marginBottom: '10px', borderRadius: '5px', padding: '10px' }}
                        />
                        <Input.TextArea
                            placeholder="Task Description"
                            value={newTask.description}
                            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                            style={{ marginBottom: '10px', borderRadius: '5px', padding: '10px' }}
                            rows={4}
                        />
                        <DatePicker
                            value={newTask.dueDate}
                            onChange={(date) => setNewTask({ ...newTask, dueDate: date || dayjs() })}
                            style={{ width: '100%', marginBottom: '10px', borderRadius: '5px' }}
                            format="MMM D, YYYY"
                        />
                        <p>Assigned To</p>
                        <Select
                            placeholder="Assigned To"
                            value={newTask.assignedTo}
                            onChange={(value) => setNewTask({ ...newTask, assignedTo: value })}
                            style={{ width: '100%', marginBottom: '10px', borderRadius: '5px' }}
                        >
                            {familyMembers.map((member) => (
                                <Option key={member.name} value={member.name}>
                                    {member.name}
                                </Option>
                            ))}
                        </Select>
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: isMobile ? 'wrap' : 'nowrap', gap: '10px' }}>
                            <Button
                                onClick={() => {
                                    setNewTask({
                                        title: '',
                                        description: '',
                                        dueDate: dayjs(),
                                        assignedTo: selectedUser,
                                        addedBy: getStoredUser(),
                                        addedTime: dayjs(),
                                    });
                                    setEditTaskIndex(null);
                                    setLocalStep('family');
                                }}
                                style={{ borderRadius: '20px', padding: '5px 15px', flex: isMobile ? '1 1 100%' : 'none' }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                loading={loading}
                                onClick={() => (localStep === 'addTask' ? handleAddTask() : handleEditTask())}
                                style={{
                                    borderRadius: '20px',
                                    padding: isMobile ? '5px 20px' : '5px 15px',
                                    backgroundColor: '#1890ff',
                                    borderColor: '#1890ff',
                                    flex: isMobile ? '1 1 100%' : 'none',
                                    fontSize: isMobile ? '18px' : '16px',
                                }}
                            >
                                {localStep === 'addTask' ? 'Add' : 'Save'}
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <CheckCircleOutlined style={{ fontSize: '20px', color: '#52c41a', marginRight: '10px' }} />
                            <Title level={3} style={{ color: '#52c41a', margin: 0 }}>
                                All Shared Tasks
                            </Title>
                        </div>
                        <Space>
                            <Button
                                type={taskFilter === 'all' ? 'primary' : 'default'}
                                size="small"
                                onClick={() => setTaskFilter('all')}
                                style={{ borderRadius: '15px', fontSize: '12px' }}
                            >
                                All ({(tasks ?? []).length})
                            </Button>
                            <Button
                                type={taskFilter === 'pending' ? 'primary' : 'default'}
                                size="small"
                                icon={<ClockCircleOutlined />}
                                onClick={() => setTaskFilter('pending')}
                                style={{ borderRadius: '15px', fontSize: '12px' }}
                            >
                                Pending ({pendingCount})
                            </Button>
                            <Button
                                type={taskFilter === 'completed' ? 'primary' : 'default'}
                                size="small"
                                icon={<CheckOutlined />}
                                onClick={() => setTaskFilter('completed')}
                                style={{ borderRadius: '15px', fontSize: '12px' }}
                            >
                                Completed ({completedCount})
                            </Button>
                        </Space>
                    </div>
                }
                open={showAllModal}
                onCancel={() => setShowAllModal(false)}
                footer={null}
                width="90%"
                style={{ top: 20 }}
                styles={{ body: { maxHeight: '70vh', overflowY: 'auto', padding: '20px' } }}
                closeIcon={<CloseOutlined style={{ fontSize: '18px' }} />}
            >
                <div style={{ marginTop: '20px' }}>
                    {(filteredTasks ?? []).length > 0 ? (
                        renderTaskList(filteredTasks, true)
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <Text style={{ fontSize: '16px', color: '#666' }}>
                                No {taskFilter === 'all' ? '' : taskFilter} tasks found
                            </Text>
                        </div>
                    )}
                </div>
            </Modal>
        </>
    );
};

export default React.memo(SharedTasksCard);