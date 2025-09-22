'use client';
import React, { useEffect, useState } from 'react';
import { Card, Button, List, Input, Select, DatePicker, TimePicker, Typography, message, Modal, Badge, Space, Alert } from 'antd';
import { ScheduleOutlined, EditOutlined, PlusOutlined, CheckOutlined, ClockCircleOutlined, EyeOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import type { FamilyMember, Schedule } from '../left-section';
import { addSchedules, getUserSchedules, updateSchedule } from '../../../services/family';
import { useGlobalLoading } from '../../../app/loadingContext';

const { Title, Text } = Typography;
const { Option } = Select;

const scheduleColors = [
    '#fff7e6', // Light Orange
    '#e6f7ff', // Light Blue
    '#f6ffed', // Light Green
    '#fff0f6', // Light Pink
    '#f9f0ff', // Light Purple
];

interface SchedulesCardProps {
    familyMembers?: FamilyMember[];
    selectedUser: string;
    setSelectedUser: (user: string) => void;
    localStep: string;
    setLocalStep: (step: string) => void;
    selectedDate: Dayjs | null;
    isMobile: boolean;
    userId: string;
}

const SchedulesCard: React.FC<SchedulesCardProps> = ({
    familyMembers = [],
    selectedUser,
    setSelectedUser,
    localStep,
    setLocalStep,
    selectedDate,
    isMobile,
    userId,
}) => {
    const getStoredUser = (): string => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('username') || selectedUser || '';
        }
        return selectedUser || '';
    };

    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [newSchedule, setNewSchedule] = useState<Schedule>({
        name: '',
        type: 'school',
        date: selectedDate || dayjs(),
        time: '',
        place: '',
        addedBy: getStoredUser(),
        addedTime: dayjs(),
        status: 'pending',
        completedTime: false,
        updated_at: undefined,
    });
    const [editScheduleIndex, setEditScheduleIndex] = useState<number | null>(null);
    const { loading, setLoading } = useGlobalLoading();
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [scheduleFilter, setScheduleFilter] = useState<'all' | 'pending' | 'completed'>('all');

    useEffect(() => {
        setNewSchedule((prev) => ({
            ...prev,
            addedBy: getStoredUser(),
            date: selectedDate || dayjs(),
        }));
    }, [selectedUser, selectedDate]);

    useEffect(() => {
        getSchedules();
        if (!selectedUser && familyMembers.length > 0) {
            setSelectedUser(familyMembers[0].name);
        }
    }, [userId, familyMembers, setSelectedUser]);

    const getSchedules = async () => {
        setLoading(true);
        try {
            const response = await getUserSchedules({ userId });
            const { status, message: responseMessage, payload } = response;
            if (status && Array.isArray(payload?.schedules)) {
                const formattedSchedules = payload.schedules.map((schedule: any) => ({
                    id: schedule.id,
                    name: schedule.name,
                    type: schedule.type,
                    date: schedule.date ? dayjs(schedule.date) : dayjs(),
                    time: schedule.time || '',
                    place: schedule.place || '',
                    addedBy: schedule.addedBy || '',
                    addedTime: schedule.addedTime ? dayjs(schedule.addedTime) : dayjs(),
                    editedBy: schedule.editedBy,
                    updated_at: schedule.updated_at ? dayjs(schedule.updated_at) : undefined,
                    status: schedule.status || 'pending',
                    completedTime:
                        schedule.completedTime &&
                            typeof schedule.completedTime !== 'boolean'
                            ? dayjs(schedule.completedTime)
                            : undefined,
                }));
                setSchedules(formattedSchedules);
            } else {
                console.warn('Failed to fetch schedules:', responseMessage);
                setSchedules([]);
                message.error(responseMessage || 'Failed to fetch schedules');
            }
        } catch (error) {
            console.error('Error fetching schedules:', error);
            message.error('Failed to fetch schedules');
            setSchedules([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSchedule = async () => {
        setLoading(true);
        const currentUser = getStoredUser();
        if (
            !newSchedule.name.trim() ||
            !newSchedule.type.trim() ||
            !newSchedule.date ||
            !newSchedule.time.trim() ||
            !newSchedule.place.trim() ||
            !currentUser
        ) {
            message.error('Please fill in all schedule fields or ensure you are logged in.');
            setLoading(false);
            return;
        }

        const scheduleData = {
            school_church: {
                name: newSchedule.name,
                type: newSchedule.type,
                date: (newSchedule.date as Dayjs).format('YYYY-MM-DD'),
                time: newSchedule.time,
                place: newSchedule.place,
                addedBy: currentUser,
                editedBy: currentUser,
                status: newSchedule.status,
            },
        };

        try {
            const response = await addSchedules(scheduleData);
            if (response.status === 1) {
                setSchedules([
                    ...schedules,
                    {
                        id: response.payload.userId,
                        ...newSchedule,
                        addedBy: currentUser,
                        addedTime: dayjs(),
                        status: 'pending',
                    },
                ]);
                setNewSchedule({
                    name: '',
                    type: 'school',
                    date: selectedDate || dayjs(),
                    time: '',
                    place: '',
                    addedBy: currentUser,
                    addedTime: dayjs(),
                    status: 'pending',
                    completedTime: false,
                    updated_at: undefined,
                });
                setLocalStep('family');
                message.success('Schedule added successfully!');
            } else {
                message.error(response.message || 'Failed to add schedule');
            }
        } catch (error) {
            console.error('Add schedule error:', error);
            message.error('Error adding schedule');
        } finally {
            setLoading(false);
        }
    };

    const handleEditSchedule = async () => {
        setLoading(true);
        const currentUser = getStoredUser();
        if (
            !newSchedule.name.trim() ||
            !newSchedule.time.trim() ||
            !newSchedule.place.trim() ||
            !currentUser ||
            editScheduleIndex === null
        ) {
            message.error('Please fill in all schedule fields or ensure you are logged in.');
            setLoading(false);
            return;
        }
        try {
            const scheduleData = {
                school_church: {
                    name: newSchedule.name,
                    type: newSchedule.type,
                    date: (newSchedule.date as Dayjs).format('YYYY-MM-DD'),
                    time: newSchedule.time,
                    place: newSchedule.place,
                    addedBy: schedules[editScheduleIndex].addedBy,
                    editedBy: currentUser,
                    status: newSchedule.status,
                    completedTime:
                        newSchedule.completedTime &&
                            typeof newSchedule.completedTime !== 'boolean' &&
                            dayjs.isDayjs(newSchedule.completedTime)
                            ? (newSchedule.completedTime as Dayjs).format('YYYY-MM-DD HH:mm:ss')
                            : undefined,
                },
                id: Number(schedules[editScheduleIndex].id),
            };
            const response = await updateSchedule(scheduleData);
            if (response.status === 1) {
                const updatedSchedules = [...schedules];
                updatedSchedules[editScheduleIndex] = {
                    ...newSchedule,
                    id: schedules[editScheduleIndex].id,
                    addedBy: schedules[editScheduleIndex].addedBy,
                    addedTime: schedules[editScheduleIndex].addedTime,
                    editedBy: currentUser,
                    updated_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                };
                setSchedules(updatedSchedules);
                setNewSchedule({
                    name: '',
                    type: 'school',
                    date: selectedDate || dayjs(),
                    time: '',
                    place: '',
                    addedBy: currentUser,
                    addedTime: dayjs(),
                    status: 'pending',
                    completedTime: false,
                    updated_at: undefined,
                });
                setEditScheduleIndex(null);
                setLocalStep('family');
                message.success('Schedule updated successfully!');
            } else {
                message.error(response.message || 'Failed to update schedule');
            }
        } catch (error) {
            console.error('Update schedule error:', error);
            message.error('Error updating schedule');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleComplete = async (scheduleToToggle: Schedule) => {
        setLoading(true);
        const currentUser = getStoredUser();
        try {
            const scheduleIndex = schedules.findIndex((s) => s === scheduleToToggle);
            const updatedSchedules = [...schedules];
            const newStatus = schedules[scheduleIndex].status === 'pending' ? 'completed' : 'pending';
            const scheduleData = {
                school_church: {
                    name: scheduleToToggle.name,
                    type: scheduleToToggle.type,
                    date: dayjs(scheduleToToggle.date).format('YYYY-MM-DD'),
                    time: scheduleToToggle.time,
                    place: scheduleToToggle.place,
                    addedBy: scheduleToToggle.addedBy,
                    editedBy: currentUser,
                    status: newStatus,
                    completedTime: newStatus === 'completed' ? dayjs().format('YYYY-MM-DD HH:mm:ss') : undefined,
                },
                id: Number(scheduleToToggle.id),
            };
            const response = await updateSchedule(scheduleData);
            if (response.status === 1) {
                updatedSchedules[scheduleIndex] = {
                    ...updatedSchedules[scheduleIndex],
                    status: newStatus,
                    completedTime: newStatus === 'completed',
                    editedBy: currentUser,
                    updated_at: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                };
                setSchedules(updatedSchedules);
                message.success(`Schedule marked as ${newStatus}!`);
            } else {
                message.error(response.message || `Failed to mark schedule as ${newStatus}`);
            }
        } catch (error) {
            console.error('Toggle complete error:', error);
            message.error('Error updating schedule status');
        } finally {
            setLoading(false);
        }
    };

    const getFilteredSchedules = () => {
        const safeSchedules = Array.isArray(schedules) ? schedules : [];
        if (scheduleFilter === 'pending') {
            return safeSchedules.filter((schedule) => schedule.status === 'pending');
        } else if (scheduleFilter === 'completed') {
            return safeSchedules.filter((schedule) => schedule.status === 'completed');
        }
        return safeSchedules;
    };

    const filteredSchedules = getFilteredSchedules();
    const displayedSchedules = (schedules ?? []).slice(0, 2);
    const safeSchedules = Array.isArray(schedules) ? schedules : [];
    const pendingCount = safeSchedules.filter((s) => s.status === 'pending').length;
    const completedCount = safeSchedules.filter((s) => s.status === 'completed').length;

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
    };

    const getScheduleColor = (index: number) => {
        return scheduleColors[index % scheduleColors.length];
    };

    const renderScheduleList = (schedulesToRender: Schedule[], isModal = false) => (
        <List
            dataSource={isModal ? filteredSchedules : schedulesToRender}
            renderItem={(schedule, index) => (
                <List.Item
                    actions={[
                        <Button
                            type="link"
                            size="small"
                            onClick={() => handleToggleComplete(schedule)}
                            style={{
                                padding: '0',
                                color: schedule.status === 'completed' ? '#52c41a' : '#faad14',
                                marginRight: '8px',
                            }}
                        >
                            {schedule.status === 'completed' ? <CheckOutlined /> : <ClockCircleOutlined />}
                        </Button>,
                        <Button
                            type="link"
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => {
                                const actualIndex = schedules.findIndex((s) => s === schedule);
                                setNewSchedule({
                                    ...schedule,
                                    date: schedule.date ? dayjs(schedule.date) : dayjs(),
                                    completedTime: !!schedule.completedTime,
                                });
                                setEditScheduleIndex(actualIndex);
                                setLocalStep('editSchedule');
                                if (isModal) {
                                    setIsModalVisible(false);
                                }
                            }}
                            style={{ padding: '0', color: '#1890ff' }}
                        >
                            Edit
                        </Button>,
                    ]}
                    style={{
                        flexWrap: isMobile ? 'wrap' : 'nowrap',
                        opacity: schedule.status === 'completed' ? 0.7 : 1,
                        backgroundColor: getScheduleColor(index),
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
                                        textDecoration: schedule.status === 'completed' ? 'line-through' : 'none',
                                    }}
                                >
                                    {schedule.name}
                                </Text>
                                {schedule.status === 'completed' && (
                                    <Badge status="success" text="Completed" style={{ fontSize: '11px' }} />
                                )}
                            </div>
                        }
                        description={
                            <div>
                                <Text style={{ fontSize: '12px', color: '#666' }}>
                                    {schedule.type.charAt(0).toUpperCase() + schedule.type.slice(1)}
                                </Text>
                                <br />
                                <Text style={{ fontSize: '12px', color: '#666' }}>
                                    {dayjs(schedule.date).format('MMM D, YYYY')} at {schedule.time}
                                </Text>
                                <br />
                                <Text style={{ fontSize: '12px', color: '#666' }}>{schedule.place}</Text>
                                <br />
                                <Text style={{ fontSize: '12px', color: '#666' }}>
                                    Added by {schedule.addedBy} on{' '}
                                    {dayjs(schedule.addedTime).format('MMM D, YYYY h:mm A')}
                                </Text>
                                {schedule.status === 'completed' && schedule.completedTime && (
                                    <>
                                        <br />
                                        <Text style={{ fontSize: '12px', color: '#52c41a' }}>
                                            Completed on{' '}
                                            {schedule.completedTime &&
                                                typeof schedule.completedTime !== 'boolean' &&
                                                dayjs(schedule.completedTime).isValid()
                                                ? dayjs(schedule.completedTime).format('MMM D, YYYY h:mm A')
                                                : ''}
                                        </Text>
                                    </>
                                )}
                                {schedule.editedBy && schedule.updated_at && (
                                    <>
                                        <br />
                                        <Text style={{ fontSize: '12px', color: '#666' }}>
                                            Edited by {schedule.editedBy} on{' '}
                                            {dayjs(schedule.updated_at).format('MMM D, YYYY h:mm A')}
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
        <Card
            style={{
                borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                marginBottom: '16px',
                width: '100%',
                padding: '8px',
            }}
            styles={{
                body: { padding: '16px' },
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <ScheduleOutlined style={{ fontSize: '20px', color: '#fa8c16', marginRight: '10px' }} />
                <Title level={4} style={{ color: '#fa8c16', margin: 0 }}>
                    School and Church Schedules
                </Title>
            </div>
            {familyMembers.length === 0 && (
                <Alert
                    message="No family members available. Please add a family member to enable adding schedules."
                    type="warning"
                    showIcon
                    style={{ marginBottom: '10px' }}
                />
            )}
            {loading ? (
                <Text>Loading schedules...</Text>
            ) : (
                <>
                    {renderScheduleList(displayedSchedules)}
                    {(schedules ?? []).length > 2 && (
                        <div style={{ textAlign: 'center', marginTop: '15px' }}>
                            <Button
                                type="primary"
                                icon={<EyeOutlined />}
                                onClick={showModal}
                                style={{
                                    borderRadius: '20px',
                                    padding: '8px 20px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                }}
                            >
                                View All Schedules ({schedules.length})
                            </Button>
                        </div>
                    )}
                    <Modal
                        title={null}
                        open={isModalVisible}
                        onCancel={handleModalClose}
                        footer={null}
                        width={isMobile ? '90%' : '600px'}
                        style={{ top: 20 }}
                        bodyStyle={{
                            padding: 0,
                            maxHeight: filteredSchedules.length > 5 ? '400px' : 'auto',
                            overflowY: filteredSchedules.length > 5 ? 'auto' : 'visible',
                        }}
                    >
                        <div
                            style={{
                                position: 'sticky',
                                top: 0,
                                backgroundColor: '#fff',
                                zIndex: 1,
                                padding: '16px 24px',
                                borderBottom: '1px solid #f0f0f0',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <ScheduleOutlined style={{ fontSize: '20px', color: '#fa8c16', marginRight: '10px' }} />
                                    <Title level={4} style={{ color: '#fa8c16', margin: 0 }}>
                                        All Schedules
                                    </Title>
                                </div>
                                <Space>
                                    <Button
                                        type={scheduleFilter === 'all' ? 'primary' : 'default'}
                                        size="small"
                                        onClick={() => setScheduleFilter('all')}
                                        style={{ borderRadius: '15px', fontSize: '12px' }}
                                    >
                                        All ({safeSchedules.length})
                                    </Button>
                                    <Button
                                        type={scheduleFilter === 'pending' ? 'primary' : 'default'}
                                        size="small"
                                        icon={<ClockCircleOutlined />}
                                        onClick={() => setScheduleFilter('pending')}
                                        style={{ borderRadius: '15px', fontSize: '12px' }}
                                    >
                                        Pending ({pendingCount})
                                    </Button>
                                    <Button
                                        type={scheduleFilter === 'completed' ? 'primary' : 'default'}
                                        size="small"
                                        icon={<CheckOutlined />}
                                        onClick={() => setScheduleFilter('completed')}
                                        style={{ borderRadius: '15px', fontSize: '12px' }}
                                    >
                                        Completed ({completedCount})
                                    </Button>
                                </Space>
                            </div>
                        </div>
                        <div style={{ padding: '16px 24px' }}>
                            {filteredSchedules.length > 0 ? (
                                renderScheduleList(schedules, true)
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px' }}>
                                    <Text style={{ fontSize: '16px', color: '#666' }}>
                                        No {scheduleFilter === 'all' ? '' : scheduleFilter} schedules found
                                    </Text>
                                </div>
                            )}
                        </div>
                    </Modal>
                </>
            )}
            {familyMembers.length > 0 && (
                <Button
                    type="link"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setNewSchedule({
                            name: '',
                            type: 'school',
                            date: selectedDate || dayjs(),
                            time: '',
                            place: '',
                            addedBy: getStoredUser(),
                            addedTime: dayjs(),
                            status: 'pending',
                            completedTime: false,
                            updated_at: undefined,
                        });
                        setEditScheduleIndex(null);
                        setLocalStep('addSchedule');
                    }}
                    style={{ marginTop: '10px', padding: '0', color: '#1890ff', width: isMobile ? '100%' : 'auto' }}
                >
                    Add Schedule
                </Button>
            )}
            {(localStep === 'addSchedule' || localStep === 'editSchedule') && familyMembers.length > 0 && (
                <div style={{ marginTop: '20px', padding: '20px', background: '#fafafa', borderRadius: '5px' }}>
                    <Title level={5}>{localStep === 'addSchedule' ? 'Add Schedule' : 'Edit Schedule'}</Title>
                    <Input
                        placeholder="Schedule Name (e.g., Parent-Teacher Meeting)"
                        value={newSchedule.name}
                        onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
                        style={{ marginBottom: '10px', borderRadius: '5px', padding: '10px' }}
                    />
                    <Select
                        value={newSchedule.type}
                        onChange={(value) => setNewSchedule({ ...newSchedule, type: value })}
                        style={{ width: '100%', marginBottom: '10px', borderRadius: '5px' }}
                    >
                        <Option value="school">School</Option>
                        <Option value="church">Church</Option>
                    </Select>
                    <DatePicker
                        value={newSchedule.date ? dayjs(newSchedule.date) : null}
                        onChange={(date) => setNewSchedule({ ...newSchedule, date: date || dayjs() })}
                        style={{ width: '100%', marginBottom: '10px', borderRadius: '5px' }}
                        format="YYYY-MM-DD"
                    />
                    <TimePicker
                        value={newSchedule.time ? dayjs(newSchedule.time, 'h:mm A') : null}
                        onChange={(time) => setNewSchedule({ ...newSchedule, time: time ? time.format('h:mm A') : '' })}
                        style={{ width: '100%', marginBottom: '10px', borderRadius: '5px' }}
                        format="h:mm A"
                    />
                    <Input
                        placeholder="Place (e.g., School Auditorium)"
                        value={newSchedule.place}
                        onChange={(e) => setNewSchedule({ ...newSchedule, place: e.target.value })}
                        style={{ marginBottom: '10px', borderRadius: '5px', padding: '10px' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: isMobile ? 'wrap' : 'nowrap', gap: '10px' }}>
                        <Button
                            onClick={() => {
                                setNewSchedule({
                                    name: '',
                                    type: 'school',
                                    date: selectedDate || dayjs(),
                                    time: '',
                                    place: '',
                                    addedBy: getStoredUser(),
                                    addedTime: dayjs(),
                                    status: 'pending',
                                    completedTime: false,
                                    updated_at: undefined,
                                });
                                setEditScheduleIndex(null);
                                setLocalStep('family');
                            }}
                            style={{ borderRadius: '20px', padding: '5px 15px', flex: isMobile ? '1 1 100%' : 'none' }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            onClick={() => (localStep === 'addSchedule' ? handleAddSchedule() : handleEditSchedule())}
                            loading={loading}
                            style={{
                                borderRadius: '20px',
                                padding: '5px 15px',
                                backgroundColor: '#1890ff',
                                borderColor: '#1890ff',
                                flex: isMobile ? '1 1 100%' : 'none',
                            }}
                        >
                            {localStep === 'addSchedule' ? 'Add' : 'Save'}
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default React.memo(SchedulesCard);