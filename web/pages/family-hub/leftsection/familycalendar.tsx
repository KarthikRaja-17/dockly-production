'use client';
import React, { useState } from 'react';
import { Card, Button, Carousel, Calendar, DatePicker, Input, Select, Typography, message } from 'antd';
import { ScheduleOutlined, LeftOutlined, RightOutlined, PlusOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { FamilyMember } from '../left-section';
// import FamilyMember from '../left-section'; // Remove this line

// Define the Event interface to match the event object structure
interface Event {
    date: Dayjs;
    title: string;
    color: string;
    addedBy: string;
    addedTime: Dayjs;
    editedBy?: string;
    editedTime?: Dayjs;
}

const { Title, Text } = Typography;
const { Option } = Select;

interface FamilyCalendarCardProps {
    upcomingEvents: Event[];
    setUpcomingEvents: React.Dispatch<React.SetStateAction<Event[]>>;
    schedules: any[];
    familyMembers: FamilyMember[];
    selectedUser: string;
    setSelectedUser: (user: string) => void;
    localStep: string;
    setLocalStep: (step: string) => void;
    isMobile: boolean;
}

const FamilyCalendarCard: React.FC<FamilyCalendarCardProps> = ({
    upcomingEvents = [],
    setUpcomingEvents,
    schedules = [],
    familyMembers = [],

    selectedUser,
    setSelectedUser,
    localStep,
    setLocalStep,
    isMobile,
}) => {
    const [currentMonth, setCurrentMonth] = useState<Dayjs>(dayjs());
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
    const [newEvent, setNewEvent] = useState<Event>({
        date: dayjs(),
        title: '',
        color: '#1890ff',
        addedBy: selectedUser,
        addedTime: dayjs(),
    });

    const handlePrevMonth = () => setCurrentMonth(currentMonth.subtract(1, 'month'));
    const handleNextMonth = () => setCurrentMonth(currentMonth.add(1, 'month'));

    const handleDateSelect = (date: Dayjs) => {
        setSelectedDate(date);
        setNewEvent((prev: any) => ({ ...prev, date }));
    };

    const cellRender = (value: Dayjs) => {
        const eventsOnDate = upcomingEvents.filter((event) => event.date.isSame(value, 'day'));
        const schedulesOnDate = schedules.filter((schedule) => schedule.date.isSame(value, 'day'));
        const isToday = value.isSame(dayjs(), 'day');
        const isSelected = selectedDate && value.isSame(selectedDate, 'day');

        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    backgroundColor: isToday ? '#e6fffb' : isSelected ? '#e6f7ff' : 'transparent',
                    borderRadius: '5px',
                    padding: '5px',
                    minHeight: '50px',
                }}
            >
                {eventsOnDate.map((event, index) => (
                    <div
                        key={`event-${index}`}
                        style={{
                            width: '8px',
                            height: '8px',
                            backgroundColor: event.color,
                            borderRadius: '50%',
                            margin: '2px auto',
                        }}
                    />
                ))}
                {schedulesOnDate.map((schedule, index) => (
                    <div
                        key={`schedule-${index}`}
                        style={{
                            width: '8px',
                            height: '8px',
                            backgroundColor: schedule.type === 'school' ? '#f5222d' : '#722ed1',
                            borderRadius: '50%',
                            margin: '2px auto',
                        }}
                    />
                ))}
            </div>
        );
    };

    const handleAddEvent = () => {
        if (!newEvent.title.trim() || !selectedUser || !newEvent.date) {
            message.error('Please enter an event title, select a family member, and choose a date.');
            return;
        }
        setUpcomingEvents([
            ...upcomingEvents,
            { ...newEvent, addedBy: selectedUser, addedTime: dayjs(), date: newEvent.date || dayjs() },
        ]);
        setNewEvent({ date: selectedDate || dayjs(), title: '', color: '#1890ff', addedBy: selectedUser, addedTime: dayjs() });
        setLocalStep('family');
        message.success('Event added successfully!');
    };

    const getFilteredEvents = () => {
        const combinedItems = (upcomingEvents || []).map((event) => ({ type: 'event', data: event }));
        if (selectedDate) {
            return combinedItems.filter((item) => item.type === 'event' && item.data.date.isSame(selectedDate, 'day'));
        }
        return combinedItems.filter((item) => item.type === 'event' && item.data.date.isSame(currentMonth, 'month'));
    };

    return (
        <Card
            style={{
                borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                marginBottom: '16px',
                width: '100%',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <ScheduleOutlined style={{ fontSize: '20px', color: '#52c41a', marginRight: '10px' }} />
                <Title level={4} style={{ color: '#52c41a', margin: 0 }}>
                    Family Calendar
                </Title>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <Button icon={<LeftOutlined />} onClick={handlePrevMonth} style={{ borderRadius: '5px' }} />
                <Text style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: 'bold' }}>
                    {currentMonth.format('MMMM YYYY')}
                </Text>
                <Button icon={<RightOutlined />} onClick={handleNextMonth} style={{ borderRadius: '5px' }} />
            </div>
            <Calendar
                fullscreen={false}
                onSelect={handleDateSelect}
                cellRender={cellRender}
                value={currentMonth}
                style={{ border: 'none' }}
            />
            {localStep === 'addEvent' && (
                <div style={{ marginTop: '20px', padding: '20px', background: '#fafafa', borderRadius: '5px' }}>
                    <Title level={5}>Add Event for {selectedDate?.format('MMM D, YYYY') || 'Today'}</Title>
                    <Input
                        placeholder="Event Title"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                        style={{ marginBottom: '10px', borderRadius: '5px', padding: '10px' }}
                    />
                    <DatePicker
                        value={newEvent.date}
                        onChange={(date) => setNewEvent({ ...newEvent, date: date || dayjs() })}
                        style={{ width: '100%', marginBottom: '10px', borderRadius: '5px' }}
                        format="MMM D, YYYY"
                    />
                    <Select
                        placeholder="Added By"
                        value={selectedUser}
                        onChange={(value) => setSelectedUser(value)}
                        style={{ width: '100%', marginBottom: '10px', borderRadius: '5px' }}
                    >
                        {familyMembers?.map((member) => (
                            <Option key={member.name} value={member.name}>
                                {member.name}
                            </Option>
                        ))}

                    </Select>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: isMobile ? 'wrap' : 'nowrap', gap: '10px' }}>
                        <Button
                            onClick={() => {
                                setNewEvent({ date: selectedDate || dayjs(), title: '', color: '#1890ff', addedBy: selectedUser, addedTime: dayjs() });
                                setLocalStep('family');
                            }}
                            style={{ borderRadius: '20px', padding: '5px 15px', flex: isMobile ? '1 1 100%' : 'none' }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            onClick={handleAddEvent}
                            style={{
                                borderRadius: '20px',
                                padding: '5px 15px',
                                backgroundColor: '#1890ff',
                                borderColor: '#1890ff',
                                flex: isMobile ? '1 1 100%' : 'none',
                            }}
                        >
                            Add Event
                        </Button>
                    </div>
                </div>
            )}
            <div style={{ marginTop: '20px' }}>
                <Title level={5}>
                    {selectedDate ? `Events for ${selectedDate.format('MMM D, YYYY')}` : `Events for ${currentMonth.format('MMMM YYYY')}`}
                </Title>
                {getFilteredEvents().length > 0 ? (
                    <Carousel dots={true} style={{ background: '#fafafa', padding: '10px', borderRadius: '5px' }}>
                        {getFilteredEvents().map((item, index) => (
                            <div key={index} style={{ padding: '0 10px' }}>
                                <div
                                    style={{
                                        background: '#fff',
                                        borderRadius: '5px',
                                        padding: '15px',
                                        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                                        <div
                                            style={{
                                                width: '12px',
                                                height: '12px',
                                                backgroundColor: item.data.color,
                                                borderRadius: '50%',
                                                marginRight: '8px',
                                            }}
                                        />
                                        <Text strong>{item.data.title}</Text>
                                    </div>
                                    <Text style={{ fontSize: '12px', color: '#666' }}>
                                        Event on {item.data.date.format('MMM D, YYYY')}
                                    </Text>
                                    <br />
                                    <Text style={{ fontSize: '12px', color: '#666' }}>
                                        Added by {item.data.addedBy} on {item.data.addedTime.format('MMM D, YYYY h:mm A')}
                                    </Text>
                                    {item.data.editedBy && item.data.editedTime && (
                                        <>
                                            <br />
                                            <Text style={{ fontSize: '12px', color: '#666' }}>
                                                Edited by {item.data.editedBy} on {item.data.editedTime.format('MMM D, YYYY h:mm A')}
                                            </Text>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </Carousel>
                ) : (
                    <Text>
                        No events available for {selectedDate ? selectedDate.format('MMM D, YYYY') : currentMonth.format('MMMM YYYY')}.
                    </Text>
                )}
            </div>
            <Button
                type="link"
                icon={<PlusOutlined />}
                onClick={() => {
                    setNewEvent({ date: selectedDate || dayjs(), title: '', color: '#1890ff', addedBy: selectedUser, addedTime: dayjs() });
                    setLocalStep('addEvent');
                }}
                style={{ marginTop: '10px', padding: '0', color: '#1890ff', width: isMobile ? '100%' : 'auto' }}
            >
                Add Event
            </Button>
        </Card>
    );
};

export default React.memo(FamilyCalendarCard);