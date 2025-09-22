'use client';
import React, { useState, useEffect } from 'react';
import { Card, Button, Checkbox, Modal, Form, Input, DatePicker, Select, message, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { addMaintenanceTask, getMaintenanceTasks, updateMaintenanceTask, deleteMaintenanceTask, Task } from '../../services/home';
import { PRIMARY_COLOR } from '../../app/comman';

interface MaintenanceSectionProps {
  hasAdvancedFeatures?: boolean;
}

interface PredefinedTask {
  icon: string;
  name: string;
  recurrence: string;
  category: 'home' | 'auto';
}

const MaintenanceSection: React.FC<MaintenanceSectionProps> = ({ hasAdvancedFeatures = true }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [quickAddPredefined, setQuickAddPredefined] = useState<PredefinedTask | null>(null);
  const [activeCategory, setActiveCategory] = useState<'home' | 'auto'>('home'); // Default to 'home'
  const uid = 'test-uid'; // Placeholder; replace with real uid from auth context

  const predefinedTasks: Record<string, PredefinedTask[]> = {
    home: [
      { icon: '🏠', name: 'Replace HVAC Filters', recurrence: 'Monthly', category: 'home' },
      { icon: '🏠', name: 'Check Smoke/CO Detectors', recurrence: 'Annual', category: 'home' },
    ],
    auto: [
      { icon: '🚗', name: 'Oil Change', recurrence: 'Set Schedule', category: 'auto' },
      { icon: '🚗', name: 'Rotate Tires', recurrence: 'Set Schedule', category: 'auto' },
    ],
  };

  // Map propertyIcon to category for grouping
  const getCategoryFromIcon = (icon: string): string => {
    if (icon === '🏡' || icon === '🏠') return 'home';
    if (icon === '🚗' || icon === '🚙') return 'auto';
    return 'custom';
  };

  // Group tasks by category
  const groupedTasks = tasks.reduce((acc: Record<string, Task[]>, task: Task) => {
    const category = getCategoryFromIcon(task.propertyIcon || '');
    if (!acc[category]) acc[category] = [];
    acc[category].push(task);
    return acc;
  }, {});

  const sectionCardStyle: React.CSSProperties = {
    background: '#ffffff',
    borderRadius: 12,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    height: 500,
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: 600,
    margin: '0 auto',
  };

  const sectionHeaderStyle: React.CSSProperties = {
    padding: '1.25rem',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(to bottom, #ffffff, #fafbfc)',
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '1.125rem',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    margin: 0,
  };

  const sectionIconStyle: React.CSSProperties = {
    width: 24,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    color: '#a0aec0',
  };

  const navStyle: React.CSSProperties = {
    padding: '8px 20px',
    borderBottom: '1px solid #edf2f7',
    background: '#ffffff',
    display: 'flex',
    gap: 16,
  };

  const navItemStyle: React.CSSProperties = {
    fontSize: 14,
    color: '#4a5568',
    cursor: 'pointer',
    paddingBottom: 4,
    borderBottom: '2px solid transparent',
  };

  const activeNavItemStyle: React.CSSProperties = {
    ...navItemStyle,
    color: '#3182ce',
    borderBottom: '2px solid #3182ce',
  };

  const addButtonStyle: React.CSSProperties = {
    
                  backgroundColor: PRIMARY_COLOR,
                  borderColor: PRIMARY_COLOR,
                  color: '#fff',
                  borderRadius: '6px',
                  height: '32px',
                  padding: '0 8px',
                  width: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                  justifyContent: 'center',
                
  };

  const maintenanceContentStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: 20,
    width: '100%',
  };

  const subHeaderStyle: React.CSSProperties = {
    fontSize: 16,
    fontWeight: 600,
    color: '#1e293b',
    margin: '16px 0 8px 0',
    paddingLeft: 4,
    borderLeft: `3px solid ${PRIMARY_COLOR}`,
  };

  const addCustomStyle: React.CSSProperties = {
    background: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    marginTop: 12,
    border: '1px dashed #d1d5db',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    textAlign: 'center',
    color: '#64748b',
    fontSize: 14,
  };

  const taskItemStyle: React.CSSProperties = {
    background: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    border: '1px solid #e2e8f0',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    wordBreak: 'break-word',
  };

  const taskHeaderStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  };

  const taskPropertyIconStyle: React.CSSProperties = {
    width: 24,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    flexShrink: 0,
  };

  const taskTextStyle: React.CSSProperties = {
    flex: 1,
    fontSize: 14,
    fontWeight: 500,
    color: '#1e293b',
  };

  const taskMetaStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 12,
    color: '#64748b',
  };

  const taskRecurrenceStyle: React.CSSProperties = {
    width: 20,
    height: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    color: '#2563eb',
    background: '#dbeafe',
    borderRadius: '50%',
  };

  const taskDetailsStyle: React.CSSProperties = {
    marginTop: 12,
    paddingTop: 12,
    borderTop: '1px solid #e2e8f0',
    fontSize: 13,
    color: '#64748b',
    lineHeight: 1.5,
    wordBreak: 'break-word',
  };

  const noDataStyle: React.CSSProperties = {
    border: '1px dashed #d9d9d9',
    borderRadius: '4px',
    padding: '20px',
    textAlign: 'center',
    margin: '16px 1.25rem',
    backgroundColor: '#fafafa',
    marginTop: '120px',
  };

  const placeholderTaskStyle: React.CSSProperties = {
    background: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    border: '1px dashed #d1d5db',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  };

  const placeholderIconStyle: React.CSSProperties = {
    fontSize: 20,
    flexShrink: 0,
  };

  const placeholderTextStyle: React.CSSProperties = {
    flex: 1,
    fontSize: 14,
    fontWeight: 500,
    color: '#1e293b',
  };

  const placeholderMetaStyle: React.CSSProperties = {
    fontSize: 12,
    color: '#64748b',
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'HIGH':
        return '#ef4444';
      case 'MEDIUM':
        return '#f59e0b';
      case 'LOW':
        return '#10b981';
      default:
        return '#64748b';
    }
  };

  const fetchTasks = async () => {
    console.log('Fetching tasks with uid:', uid);
    try {
      const response = await getMaintenanceTasks({ is_active: 1 });
      console.log('Raw API Response:', JSON.stringify(response, null, 2));
      if (response.status === 1 && response.payload.tasks) {
        const mappedTasks = response.payload.tasks.map((task: any) => ({
          ...task,
          text: task.name || 'Unnamed Task',
          id: String(task.id),
          date: task.date || 'No Date',
          completed: !!task.completed,
          priority: task.priority || undefined,
          details: task.details || undefined,
          propertyIcon: task.property_icon || undefined,
          isRecurring: !!task.is_recurring,
          created_at: task.created_at || undefined,
          updated_at: task.updated_at || undefined,
          is_active: task.is_active ?? 1,
        }));
        setTasks(mappedTasks);
        console.log('Tasks set:', JSON.stringify(mappedTasks, null, 2));
      } else {
        message.error(response.message || 'Failed to fetch tasks');
        setTasks([]);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      message.error('Failed to fetch tasks');
      setTasks([]);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const toggleTaskCompletion = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    try {
      const response = await updateMaintenanceTask(taskId, { completed: !task.completed });
      if (response.status === 1) {
        message.success('Task updated successfully');
        fetchTasks();
      } else {
        message.error(response.message || 'Failed to update task');
      }
    } catch (error) {
      console.error('Update task error:', error);
      message.error('Failed to update task');
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      setLoading(true);
      const response = await deleteMaintenanceTask(taskId);
      if (response.status === 1) {
        message.success('Task deleted successfully');
        fetchTasks();
      } else {
        message.error(response.message || 'Failed to delete task');
      }
    } catch (error) {
      console.error('Delete task error:', error);
      message.error('Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskExpansion = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const handleQuickAdd = (predefined: PredefinedTask) => {
    setQuickAddPredefined(predefined);
    form.setFieldsValue({
      name: predefined.name,
      propertyIcon: predefined.icon === '🏠' ? '🏡' : '🚗',
      details: predefined.recurrence,
      isRecurring: true,
      date: null, // Will require user to set
    });
    setIsModalVisible(true);
  };

  const showModal = (forCustom = false) => {
    if (forCustom) {
      setQuickAddPredefined(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const taskData: Partial<Task> = {
        text: values.name,
        date: values.date ? values.date.format('YYYY-MM-DD') : undefined,
        priority: values.priority,
        details: values.details,
        propertyIcon: values.propertyIcon,
        isRecurring: values.isRecurring,
        completed: false,
        is_active: 1,
      };
      const response = await addMaintenanceTask(taskData);
      if (response.status === 1) {
        message.success('Task added successfully');
        form.resetFields();
        setIsModalVisible(false);
        setQuickAddPredefined(null);
        fetchTasks();
      } else {
        message.error(response.message || 'Failed to add task');
      }
    } catch (error) {
      console.error('Add task error:', error);
      message.error('Failed to add task');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setQuickAddPredefined(null);
    form.resetFields();
  };

  const TaskItem: React.FC<{ task: Task }> = ({ task }) => {
    const isExpanded = expandedTasks.has(task.id);

    return (
      <div
        style={{
          ...taskItemStyle,
          borderColor: isExpanded ? '#2563eb' : '#e2e8f0',
          boxShadow: isExpanded ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none',
        }}
        onClick={() => hasAdvancedFeatures && toggleTaskExpansion(task.id)}
      >
        <div style={taskHeaderStyle}>
          <Checkbox
            checked={task.completed}
            onChange={() => toggleTaskCompletion(task.id)}
            onClick={(e) => e.stopPropagation()}
          />
          {hasAdvancedFeatures && task.propertyIcon && (
            <div style={taskPropertyIconStyle}>{task.propertyIcon}</div>
          )}
          <div
            style={{
              ...taskTextStyle,
              color: task.completed ? '#64748b' : '#1e293b',
              textDecoration: task.completed ? 'line-through' : 'none',
            }}
          >
            {task.text || 'No Name'}
          </div>
          <div style={taskMetaStyle}>
            {hasAdvancedFeatures && task.isRecurring && (
              <div style={taskRecurrenceStyle} title="Recurring">
                🔄
              </div>
            )}
            {task.priority && (
              <span
                style={{
                  padding: '2px 6px',
                  borderRadius: 4,
                  fontWeight: 600,
                  fontSize: 10,
                  backgroundColor: getPriorityColor(task.priority),
                  color: '#ffffff',
                }}
              >
                {task.priority}
              </span>
            )}
            <span>{task.date}</span>
            {task.completed && (
              <Popconfirm
                title="Are you sure to delete this task?"
                onConfirm={() => deleteTask(task.id)}
                onCancel={(e) => { if (e) e.stopPropagation(); }}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  onClick={(e) => e.stopPropagation()}
                  title="Delete Task"
                  style={{ color: '#ef4444' }}
                  loading={loading}
                />
              </Popconfirm>
            )}
          </div>
        </div>
        {hasAdvancedFeatures && isExpanded && task.details && (
          <div style={taskDetailsStyle}>{task.details}</div>
        )}
      </div>
    );
  };

  const PlaceholderTask: React.FC<{ predefined: PredefinedTask; onAdd: (pre: PredefinedTask) => void }> = ({ predefined, onAdd }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <div
        style={{
          ...placeholderTaskStyle,
          opacity: isHovered ? 0.8 : 1,
        }}
        onClick={() => onAdd(predefined)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={placeholderIconStyle}>{predefined.icon}</div>
        <div style={placeholderTextStyle}>{predefined.name}</div>
        <div style={placeholderMetaStyle}>{predefined.recurrence}</div>
      </div>
    );
  };

  const renderCategorySection = (category: string, predefined: PredefinedTask[]) => {
    const categoryTasks = groupedTasks[category] || [];
    const hasAllPredefined = predefined.every(pre => 
      categoryTasks.some(task => task.text === pre.name)
    );

    if (category !== activeCategory) return null; // Only render the active category

    return (
      <div key={category}>
        {predefined.map((pre) => {
          const matchingTask = categoryTasks.find(task => task.text === pre.name);
          if (matchingTask) {
            return <TaskItem key={matchingTask.id} task={matchingTask} />;
          } else {
            return <PlaceholderTask key={pre.name} predefined={pre} onAdd={handleQuickAdd} />;
          }
        })}
        {hasAllPredefined && categoryTasks.length > predefined.length && (
          // Show extra custom tasks in this category
          categoryTasks.slice(predefined.length).map(task => <TaskItem key={task.id} task={task} />)
        )}
      </div>
    );
  };

  return (
    <Card
      style={sectionCardStyle}
      bodyStyle={{ padding: 0, height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <div style={sectionHeaderStyle}>
        <h2 style={sectionTitleStyle}>
          <div style={sectionIconStyle}>🔧</div>
          <span>Property Maintenance</span>
        </h2>
        <Button
          style={addButtonStyle}
          onClick={() => showModal(true)}
        >
          <PlusOutlined /> 
        </Button>
      </div>
      <div style={navStyle}>
        <div
          style={activeCategory === 'home' ? activeNavItemStyle : navItemStyle}
          onClick={() => setActiveCategory('home')}
        >
          Home
        </div>
        <div
          style={activeCategory === 'auto' ? activeNavItemStyle : navItemStyle}
          onClick={() => setActiveCategory('auto')}
        >
          Vehicle
        </div>
      </div>
      <div style={maintenanceContentStyle}>
        {renderCategorySection(activeCategory, predefinedTasks[activeCategory])}
        <div 
          style={addCustomStyle}
          onClick={() => showModal(true)}
        >
          <PlusOutlined /> Add Custom Task
        </div>
      </div>
      <Modal
        title={quickAddPredefined ? `Add ${quickAddPredefined.name}` : "Add Maintenance Task"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Add Task"
        cancelText="Cancel"
        okButtonProps={{
          type: 'primary',
          style: { backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR },
        }}
        cancelButtonProps={{ type: 'default' }}
        confirmLoading={loading}
        style={{ maxWidth: 500 }}
        bodyStyle={{ maxHeight: '60vh', overflowY: 'auto' }}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ padding: 16 }}>
          <Form.Item
            name="name"
            label="Task Name"
            rules={[{ required: true, message: 'Please enter the task name' }]}
          >
            <Input placeholder="Enter task name" />
          </Form.Item>
          <Form.Item
            name="date"
            label="Due Date"
            rules={[{ required: true, message: 'Please select a due date' }]}
          >
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item name="priority" label="Priority">
            <Select allowClear placeholder="Select priority">
              <Select.Option value="HIGH">High</Select.Option>
              <Select.Option value="MEDIUM">Medium</Select.Option>
              <Select.Option value="LOW">Low</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="details" label="Details">
            <Input.TextArea rows={4} placeholder="Enter task details" />
          </Form.Item>
          <Form.Item name="propertyIcon" label="Property Icon">
            <Select allowClear placeholder="Select property icon">
              <Select.Option value="🏡">Home 🏡</Select.Option>
              <Select.Option value="🚗">Vehicle 🚗</Select.Option>
              <Select.Option value="🏖️">Vacation Property 🏖️</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="isRecurring" label="Recurring" valuePropName="checked">
            <Checkbox>Is Recurring</Checkbox>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default MaintenanceSection;