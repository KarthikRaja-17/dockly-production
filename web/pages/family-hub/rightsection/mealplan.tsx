'use client';
import React, { useEffect, useState } from 'react';
import { Card, Button, List, Input, Select, DatePicker, TimePicker, Typography, message, Space, Modal } from 'antd';
import { CoffeeOutlined, EditOutlined, PlusOutlined, EyeOutlined, CloseOutlined, CalendarOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { addMealPlan, getUserMealPlan } from '../../../services/family';
import { FamilyMember } from './sharedtasks';
import { useGlobalLoading } from '../../../app/loadingContext';

const { Title, Text } = Typography;
const { Option } = Select;

interface MealPlansCardProps {
    mealPlans?: MealPlan[];
    setMealPlans: React.Dispatch<React.SetStateAction<MealPlan[]>>;
    familyMembers?: FamilyMember[];
    selectedUser: string;
    setSelectedUser: (user: string) => void;
    localStep: string;
    setLocalStep: (step: string) => void;
    isMobile: boolean;
}

export interface MealPlan {
    date: Dayjs;
    mealType: string;
    description: string;
    mealTime: Dayjs;
    addedBy: string;
    addedTime: Dayjs;
    editedBy?: string;
    editedTime?: Dayjs;
    meal_type?: string;
    meal_date?: string;
    meal_time?: string;
}

const MealPlansCard: React.FC<MealPlansCardProps> = ({
    mealPlans = [],
    setMealPlans,
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

    const [newMealPlan, setNewMealPlan] = useState<MealPlan>({
        date: dayjs(),
        mealType: 'Breakfast',
        description: '',
        mealTime: dayjs(),
        addedBy: getStoredUser(),
        addedTime: dayjs(),
    });
    const [editMealPlanIndex, setEditMealPlanIndex] = useState<number | null>(null);
    const { loading, setLoading } = useGlobalLoading();
    const [showAllModal, setShowAllModal] = useState<boolean>(false);
    const [mealFilter, setMealFilter] = useState<'all' | 'breakfast' | 'lunch' | 'dinner'>('all');

    useEffect(() => {
        setNewMealPlan((prev) => ({
            ...prev,
            addedBy: getStoredUser(),
        }));
    }, [selectedUser]);

    const handleAddMealPlan = async () => {
        setLoading(true);
        const currentUser = getStoredUser();
        if (
            !newMealPlan.description.trim() ||
            !currentUser ||
            !newMealPlan.date ||
            !newMealPlan.mealType ||
            !newMealPlan.mealTime
        ) {
            message.error('Please fill in all meal plan fields or ensure you are logged in.');
            setLoading(false);
            return;
        }

        const mealPlanData = {
            mealplanning: {
                meal_type: newMealPlan.mealType,
                date: newMealPlan.date.format('YYYY-MM-DD'),
                time: newMealPlan.mealTime.format('HH:mm'),
                description: newMealPlan.description,
                addedBy: currentUser,
            },
        };

        try {
            const response = await addMealPlan(mealPlanData);
            if (response.status === 1) {
                setMealPlans([
                    ...mealPlans,
                    {
                        ...newMealPlan,
                        addedBy: currentUser,
                        addedTime: dayjs(),
                    },
                ]);
                setNewMealPlan({
                    date: dayjs(),
                    mealType: 'Breakfast',
                    description: '',
                    mealTime: dayjs(),
                    addedBy: currentUser,
                    addedTime: dayjs(),
                });
                setLocalStep('family');
                message.success('Meal plan added successfully!');
            } else {
                message.error(response.message || 'Failed to add meal plan');
            }
        } catch (error) {
            console.error('Error adding meal plan:', error);
            message.error('Failed to add meal plan');
        } finally {
            setLoading(false);
        }
    };

    const handleEditMealPlan = async () => {
        setLoading(true);
        const currentUser = getStoredUser();
        if (
            !newMealPlan.description.trim() ||
            !currentUser ||
            !newMealPlan.date ||
            !newMealPlan.mealType ||
            !newMealPlan.mealTime ||
            editMealPlanIndex === null
        ) {
            message.error('Please fill in all meal plan fields or ensure you are logged in.');
            setLoading(false);
            return;
        }

        const updatedMealPlans = [...mealPlans];
        updatedMealPlans[editMealPlanIndex] = {
            ...newMealPlan,
            addedBy: mealPlans[editMealPlanIndex].addedBy,
            addedTime: mealPlans[editMealPlanIndex].addedTime,
            editedBy: currentUser,
            editedTime: dayjs(),
        };
        setMealPlans(updatedMealPlans);
        setNewMealPlan({
            date: dayjs(),
            mealType: 'Breakfast',
            description: '',
            mealTime: dayjs(),
            addedBy: currentUser,
            addedTime: dayjs(),
        });
        setEditMealPlanIndex(null);
        setLocalStep('family');
        message.success('Meal plan updated successfully!');
        setLoading(false);
    };

    const getPlan = async () => {
        setLoading(true);
        try {
            const response = await getUserMealPlan();
            const { status, payload, message: responseMessage } = response;
            if (status === 1 && Array.isArray(payload?.meal_planning)) {
                const formattedPlans = payload.meal_planning.map((plan: any) => ({
                    date: plan.date ? dayjs(plan.date) : dayjs(),
                    mealType: plan.meal_type || plan.mealType || 'Breakfast',
                    description: plan.description || '',
                    mealTime: plan.time ? dayjs(plan.time, 'HH:mm') : dayjs(),
                    addedBy: plan.addedBy || 'Unknown User',
                    addedTime: plan.addedTime ? dayjs(plan.addedTime) : dayjs(),
                    editedBy: plan.editedBy,
                    editedTime: plan.editedTime ? dayjs(plan.editedTime) : undefined,
                    meal_type: plan.meal_type,
                    meal_date: plan.date,
                    meal_time: plan.time,
                }));
                setMealPlans(formattedPlans);
            } else {
                console.warn('Failed to fetch meal plans:', responseMessage);
                setMealPlans([]);
                message.error(responseMessage || 'Failed to fetch meal plans');
            }
        } catch (error) {
            console.error('Error fetching meal plans:', error);
            setMealPlans([]);
            message.error('Failed to fetch meal plans');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getPlan();
    }, []);

    const getFilteredMealPlans = () => {
        const filteredPlans = Array.isArray(mealPlans) ? mealPlans : [];
        if (mealFilter === 'breakfast') {
            return filteredPlans.filter((plan) =>
                (plan.meal_type || plan.mealType)?.toLowerCase() === 'breakfast'
            );
        } else if (mealFilter === 'lunch') {
            return filteredPlans.filter((plan) =>
                (plan.meal_type || plan.mealType)?.toLowerCase() === 'lunch'
            );
        } else if (mealFilter === 'dinner') {
            return filteredPlans.filter((plan) =>
                (plan.meal_type || plan.mealType)?.toLowerCase() === 'dinner'
            );
        }
        return filteredPlans;
    };

    const getDisplayMealPlans = () => {
        const filteredPlans = getFilteredMealPlans();
        return filteredPlans.slice(0, 2);
    };

    const filteredMealPlans = getFilteredMealPlans() ?? [];
    const displayMealPlans = getDisplayMealPlans() ?? [];
    const breakfastCount = (mealPlans ?? []).filter((plan) =>
        (plan.meal_type || plan.mealType)?.toLowerCase() === 'breakfast'
    ).length;
    const lunchCount = (mealPlans ?? []).filter((plan) =>
        (plan.meal_type || plan.mealType)?.toLowerCase() === 'lunch'
    ).length;
    const dinnerCount = (mealPlans ?? []).filter((plan) =>
        (plan.meal_type || plan.mealType)?.toLowerCase() === 'dinner'
    ).length;

    const renderMealPlanList = (plansToRender: MealPlan[], isModal = false) => (
        <List
            dataSource={plansToRender}
            renderItem={(meal) => (
                <List.Item
                    actions={[
                        <Button
                            type="link"
                            icon={<EditOutlined />}
                            size="small"
                            onClick={() => {
                                const actualIndex = mealPlans.findIndex((m) => m === meal);
                                setNewMealPlan(meal);
                                setEditMealPlanIndex(actualIndex);
                                setLocalStep('editMealPlan');
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
                        backgroundColor: '#fefefe',
                        borderRadius: '5px',
                        padding: '8px',
                        marginBottom: '4px',
                        border: '1px solid #f0f0f0',
                    }}
                >
                    <List.Item.Meta
                        title={
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Text style={{ fontSize: '14px', fontWeight: '600' }}>
                                    {meal.meal_type || meal.mealType} -{' '}
                                    {meal.meal_date
                                        ? dayjs(meal.meal_date).format('MMM D, YYYY')
                                        : meal.date
                                            ? dayjs(meal.date).format('MMM D, YYYY')
                                            : 'Invalid date'}
                                </Text>
                                <CalendarOutlined style={{ color: '#fadb14', fontSize: '12px' }} />
                            </div>
                        }
                        description={
                            <div>
                                <Text style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
                                    {meal.description}
                                </Text>
                                <br />
                                <Text style={{ fontSize: '12px', color: '#666' }}>
                                    Time:{' '}
                                    {meal.meal_time
                                        ? dayjs(meal.meal_time, 'HH:mm:ss').format('HH:mm')
                                        : meal.mealTime
                                            ? dayjs(meal.mealTime).format('HH:mm')
                                            : 'Invalid time'}
                                </Text>
                                <br />
                                <Text style={{ fontSize: '12px', color: '#666' }}>
                                    Added by {meal.addedBy} on{' '}
                                    {meal.addedTime ? dayjs(meal.addedTime).format('MMM D, YYYY h:mm A') : 'N/A'}
                                </Text>
                                {meal.editedBy && meal.editedTime && (
                                    <>
                                        <br />
                                        <Text style={{ fontSize: '12px', color: '#666' }}>
                                            Edited by {meal.editedBy} on {dayjs(meal.editedTime).format('MMM D, YYYY h:mm A')}
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
                        <CoffeeOutlined style={{ fontSize: '20px', color: '#fadb14', marginRight: '10px' }} />
                        <Title level={4} style={{ color: '#fadb14', margin: 0 }}>
                            Meal Plans
                        </Title>
                    </div>
                    <Space wrap style={{ marginTop: isMobile ? '10px' : '0' }}>
                        <Button
                            type={mealFilter === 'all' ? 'primary' : 'default'}
                            size="small"
                            onClick={() => setMealFilter('all')}
                            style={{ borderRadius: '15px', fontSize: '12px' }}
                        >
                            All ({(mealPlans ?? []).length})
                        </Button>
                        <Button
                            type={mealFilter === 'breakfast' ? 'primary' : 'default'}
                            size="small"
                            onClick={() => setMealFilter('breakfast')}
                            style={{ borderRadius: '15px', fontSize: '12px' }}
                        >
                            Breakfast ({breakfastCount})
                        </Button>
                        <Button
                            type={mealFilter === 'lunch' ? 'primary' : 'default'}
                            size="small"
                            onClick={() => setMealFilter('lunch')}
                            style={{ borderRadius: '15px', fontSize: '12px' }}
                        >
                            Lunch ({lunchCount})
                        </Button>
                        <Button
                            type={mealFilter === 'dinner' ? 'primary' : 'default'}
                            size="small"
                            onClick={() => setMealFilter('dinner')}
                            style={{ borderRadius: '15px', fontSize: '12px' }}
                        >
                            Dinner ({dinnerCount})
                        </Button>
                    </Space>
                </div>

                {loading ? (
                    <Text>Loading meal plans...</Text>
                ) : (
                    renderMealPlanList(displayMealPlans)
                )}

                {(filteredMealPlans ?? []).length > 2 && (
                    <div style={{ textAlign: 'center', marginTop: '15px' }}>
                        <Button
                            type="primary"
                            icon={<EyeOutlined />}
                            onClick={() => setShowAllModal(true)}
                            style={{
                                borderRadius: '20px',
                                padding: '8px 20px',
                                fontSize: '14px',
                                fontWeight: '500',
                                backgroundColor: 'rgba(6, 174, 62, 0.91)',
                                borderColor: '#fadb14',
                            }}
                        >
                            View All Meal Plans ({filteredMealPlans.length})
                        </Button>
                    </div>
                )}

                {familyMembers.length > 0 && (
                    <Button
                        type="link"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setNewMealPlan({
                                date: dayjs(),
                                mealType: 'Breakfast',
                                description: '',
                                mealTime: dayjs(),
                                addedBy: getStoredUser(),
                                addedTime: dayjs(),
                            });
                            setEditMealPlanIndex(null);
                            setLocalStep('addMealPlan');
                        }}
                        style={{ marginTop: '10px', padding: '0', color: '#1890ff', width: isMobile ? '100%' : 'auto' }}
                    >
                        Add Meal Plan
                    </Button>
                )}

                {(localStep === 'addMealPlan' || localStep === 'editMealPlan') && familyMembers.length > 0 && (
                    <div style={{ marginTop: '20px', padding: '20px', background: '#fafafa', borderRadius: '5px' }}>
                        <Title level={5}>{localStep === 'addMealPlan' ? 'Add Meal Plan' : 'Edit Meal Plan'}</Title>
                        <DatePicker
                            value={newMealPlan.date}
                            onChange={(date) => setNewMealPlan({ ...newMealPlan, date: date || dayjs() })}
                            style={{ width: '100%', marginBottom: '10px', borderRadius: '5px' }}
                            format="MMM D, YYYY"
                        />
                        <TimePicker
                            value={newMealPlan.mealTime}
                            onChange={(time) => setNewMealPlan({ ...newMealPlan, mealTime: time || dayjs() })}
                            format="HH:mm"
                            style={{ width: '100%', marginBottom: '10px', borderRadius: '5px' }}
                        />
                        <Select
                            value={newMealPlan.mealType}
                            onChange={(value) => setNewMealPlan({ ...newMealPlan, mealType: value })}
                            style={{ width: '100%', marginBottom: '10px', borderRadius: '5px' }}
                        >
                            <Option value="Breakfast">Breakfast</Option>
                            <Option value="Lunch">Lunch</Option>
                            <Option value="Dinner">Dinner</Option>
                        </Select>
                        <Input.TextArea
                            placeholder="Meal Description"
                            value={newMealPlan.description}
                            onChange={(e) => setNewMealPlan({ ...newMealPlan, description: e.target.value })}
                            style={{ marginBottom: '10px', borderRadius: '5px', padding: '10px' }}
                            rows={4}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: isMobile ? 'wrap' : 'nowrap', gap: '10px' }}>
                            <Button
                                onClick={() => {
                                    setNewMealPlan({
                                        date: dayjs(),
                                        mealType: 'Breakfast',
                                        description: '',
                                        mealTime: dayjs(),
                                        addedBy: getStoredUser(),
                                        addedTime: dayjs(),
                                    });
                                    setEditMealPlanIndex(null);
                                    setLocalStep('family');
                                }}
                                style={{ borderRadius: '20px', padding: '5px 15px', flex: isMobile ? '1 1 100%' : 'none' }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                loading={loading}
                                onClick={() => (localStep === 'addMealPlan' ? handleAddMealPlan() : handleEditMealPlan())}
                                style={{
                                    borderRadius: '20px',
                                    padding: '5px 15px',
                                    backgroundColor: '#1890ff',
                                    borderColor: '#1890ff',
                                    flex: isMobile ? '1 1 100%' : 'none',
                                }}
                            >
                                {localStep === 'addMealPlan' ? 'Add' : 'Save'}
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            <Modal
                title={null}
                open={showAllModal}
                onCancel={() => setShowAllModal(false)}
                footer={null}
                width={isMobile ? '90%' : '600px'}
                style={{ top: 20 }}
                bodyStyle={{
                    padding: 0,
                    maxHeight: (filteredMealPlans ?? []).length > 5 ? '400px' : 'auto',
                    overflowY: (filteredMealPlans ?? []).length > 5 ? 'auto' : 'visible',
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
                            <CoffeeOutlined style={{ fontSize: '20px', color: '#fadb14', marginRight: '10px' }} />
                            <Title level={4} style={{ color: '#fadb14', margin: 0 }}>
                                All Meal Plans
                            </Title>
                        </div>
                        <Space>
                            <Button
                                type={mealFilter === 'all' ? 'primary' : 'default'}
                                size="small"
                                onClick={() => setMealFilter('all')}
                                style={{ borderRadius: '15px', fontSize: '12px' }}
                            >
                                All ({(mealPlans ?? []).length})
                            </Button>
                            <Button
                                type={mealFilter === 'breakfast' ? 'primary' : 'default'}
                                size="small"
                                onClick={() => setMealFilter('breakfast')}
                                style={{ borderRadius: '15px', fontSize: '12px' }}
                            >
                                Breakfast ({breakfastCount})
                            </Button>
                            <Button
                                type={mealFilter === 'lunch' ? 'primary' : 'default'}
                                size="small"
                                onClick={() => setMealFilter('lunch')}
                                style={{ borderRadius: '15px', fontSize: '12px' }}
                            >
                                Lunch ({lunchCount})
                            </Button>
                            <Button
                                type={mealFilter === 'dinner' ? 'primary' : 'default'}
                                size="small"
                                onClick={() => setMealFilter('dinner')}
                                style={{ borderRadius: '15px', fontSize: '12px' }}
                            >
                                Dinner ({dinnerCount})
                            </Button>
                        </Space>
                    </div>
                </div>
                <div style={{ padding: '16px 24px' }}>
                    {(filteredMealPlans ?? []).length > 0 ? (
                        renderMealPlanList(filteredMealPlans, true)
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <Text style={{ fontSize: '16px', color: '#666' }}>
                                No {mealFilter === 'all' ? '' : mealFilter} meal plans found
                            </Text>
                        </div>
                    )}
                </div>
            </Modal>
        </>
    );
};

export default React.memo(MealPlansCard);