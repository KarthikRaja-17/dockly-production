import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Input, Select, DatePicker, message, Typography, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { addFinanceGoal, getFinanceGoals, updateFinanceGoal, deleteFinanceGoal } from '../../services/apiConfig';
import moment from 'moment';
import { PRIMARY_COLOR } from '../../app/comman';

const { Option } = Select;
const { Text } = Typography;

interface FinanceGoal {
  id: string;
  name: string;
  saved_percentage: number;
  target_percentage: number;
  saved_amount: number | null;
  target_amount: number | null;
  goal_status: number | null;
  deadline?: string | null;
  is_active: number;
  created_at?: string;
  updated_at?: string;
}

const FinanceGoalsSection: React.FC = () => {
  const [form] = Form.useForm();
  const [goals, setGoals] = useState<FinanceGoal[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinanceGoal | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [errorMessage, setErrorMessage] = useState<string>('');

  const sectionCardStyle: React.CSSProperties = {
    background: '#ffffff',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    overflow: 'hidden',
    transition: 'box-shadow 0.3s',
    height: '419px',
    marginBottom: '10px',
    display: 'flex',
    flexDirection: 'column',
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
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
  };

  const goalContentStyle: React.CSSProperties = {
    padding: '1.25rem',
    maxHeight: '340px',
    overflowY: 'auto',
    flex: 1,
  };

  const noDataStyle: React.CSSProperties = {
    border: '1px dashed #d9d9d9',
    borderRadius: '4px',
    padding: '20px',
    textAlign: 'center',
    margin: '16px 1.25rem',
    backgroundColor: '#fafafa',
    marginTop: '125px',
  };

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const FinanceGoalCard: React.FC<{ goal: FinanceGoal }> = ({ goal }) => {
    const [isHovered, setIsHovered] = useState(false);

    const goalCardStyle: React.CSSProperties = {
      background: 'linear-gradient(135deg, #dbeafe, #e0e7ff)',
      borderRadius: '0.5rem',
      padding: '1rem',
      marginBottom: '1rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
      position: 'relative',
      border: '1px solid #e2e8f0',
    };

    const goalNameStyle: React.CSSProperties = {
      fontWeight: 600,
      marginBottom: '0.75rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.9375rem',
    };

    const goalGridStyle: React.CSSProperties = {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '0.5rem',
      fontSize: '0.8125rem',
    };

    const goalItemStyle: React.CSSProperties = {
      display: 'flex',
      justifyContent: 'space-between',
    };

    const goalLabelStyle: React.CSSProperties = {
      color: '#64748b',
    };

    const goalValueStyle: React.CSSProperties = {
      fontWeight: 600,
    };

    const detailItemStyle: React.CSSProperties = {
      fontSize: '0.875rem',
    };

    const detailLabelStyle: React.CSSProperties = {
      color: '#64748b',
      marginBottom: '0.25rem',
      fontSize: '0.75rem',
      fontWeight: 600,
      textTransform: 'uppercase',
    };

    const detailValueStyle: React.CSSProperties = {
      fontWeight: 500,
      color: '#000000',
    };

    const propertyItemDetailsStyle: React.CSSProperties = {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '0.75rem',
      marginTop: '1rem',
      paddingTop: '1rem',
      borderTop: '1px solid #e2e8f0',
    };

    const actionButtonsStyle: React.CSSProperties = {
      display: 'flex',
      gap: '8px',
      marginTop: '1rem',
      justifyContent: 'flex-end',
    };

    const handleEdit = (e: React.MouseEvent) => {
      e.stopPropagation();
      setEditingGoal(goal);
      form.setFieldsValue({
        name: goal.name,
        saved_percentage: goal.saved_percentage,
        target_percentage: goal.target_percentage,
        saved_amount: goal.saved_amount,
        target_amount: goal.target_amount,
        goal_status: goal.goal_status,
        deadline: goal.deadline ? moment(goal.deadline) : null,
      });
      setIsModalVisible(true);
    };

    const handleDelete = async (e?: React.MouseEvent<HTMLElement>) => {
      if (e) {
        e.stopPropagation();
      }
      try {
        setLoading(true);
        await deleteFinanceGoal(goal.id);
        message.success('Finance goal deleted successfully');
        fetchGoals();
      } catch (error) {
        console.error('Delete error:', error);
        setErrorMessage('Failed to delete finance goal');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div
        style={goalCardStyle}
        onClick={() => toggleExpand(goal.id)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={goalNameStyle}>
          <span>💸</span>
          <span>{goal.name}</span>
        </div>
        <div style={goalGridStyle}>
          <div style={goalItemStyle}>
            <span style={goalLabelStyle}>Saved %</span>
            <span style={goalValueStyle}>{goal.saved_percentage}%</span>
          </div>
          <div style={goalItemStyle}>
            <span style={goalLabelStyle}>Target %</span>
            <span style={goalValueStyle}>{goal.target_percentage}%</span>
          </div>
          <div style={goalItemStyle}>
            <span style={goalLabelStyle}>Saved Amount</span>
            <span style={goalValueStyle}>{goal.saved_amount !== null ? `$${goal.saved_amount}` : 'N/A'}</span>
          </div>
          <div style={goalItemStyle}>
            <span style={goalLabelStyle}>Target Amount</span>
            <span style={goalValueStyle}>{goal.target_amount !== null ? `$${goal.target_amount}` : 'N/A'}</span>
          </div>
        </div>
        {expandedItems.has(goal.id) && (
          <div>
            <div style={propertyItemDetailsStyle}>
              <div style={detailItemStyle}>
                <div style={detailLabelStyle}>Status</div>
                <div style={detailValueStyle}>
                  {goal.goal_status === 0 ? 'Not Started' : goal.goal_status === 1 ? 'In Progress' : goal.goal_status === 2 ? 'Completed' : 'N/A'}
                </div>
              </div>
              <div style={detailItemStyle}>
                <div style={detailLabelStyle}>Deadline</div>
                <div style={detailValueStyle}>{goal.deadline || 'N/A'}</div>
              </div>
            </div>
            <div style={actionButtonsStyle}>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleEdit}
                style={{ borderRadius: '6px' }}
                loading={loading}
              />
              <Popconfirm
                title="Are you sure to delete this finance goal?"
                onConfirm={handleDelete}
                onCancel={(e) => { if (e) e.stopPropagation(); }}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  type="primary"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={(e) => e.stopPropagation()}
                  style={{ borderRadius: '6px' }}
                  loading={loading}
                />
              </Popconfirm>
            </div>
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            right: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: PRIMARY_COLOR,
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.2s',
            pointerEvents: 'none',
            fontSize: '16px',
          }}
        >
          →
        </div>
      </div>
    );
  };

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const response = await getFinanceGoals({ is_active: 1 });
      console.log('API Response:', response);
      if (response.status !== 1) {
        throw new Error(response.message || 'Failed to fetch finance goals');
      }
      const fetchedGoals = response.payload?.goals || [];
      console.log('Fetched Goals:', fetchedGoals);
      setGoals(fetchedGoals);
      if (fetchedGoals.length === 0) {
        // setErrorMessage('No active finance goals found.');
      }
    } catch (error: any) {
      console.error('Fetch error:', error);
      // setErrorMessage(error.message || 'Failed to fetch finance goals');
      setGoals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // console.log('Fetching goals due to useEffect trigger');
    fetchGoals();
  }, [isModalVisible]);

  const handleAdd = () => {
    setEditingGoal(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const goalData = {
        name: values.name,
        saved_percentage: parseFloat(values.saved_percentage),
        target_percentage: parseFloat(values.target_percentage),
        saved_amount: values.saved_amount ? parseFloat(values.saved_amount) : null,
        target_amount: values.target_amount ? parseFloat(values.target_amount) : null,
        goal_status: values.goal_status !== undefined ? values.goal_status : null,
        deadline: values.deadline ? values.deadline.format('YYYY-MM-DD') : null,
      };

      if (editingGoal) {
        await updateFinanceGoal(editingGoal.id, goalData);
        message.success('Finance goal updated successfully');
      } else {
        await addFinanceGoal(goalData);
        message.success('Finance goal added successfully');
      }
      setIsModalVisible(false);
    } catch (error: any) {
      console.error('Save error:', error);
      // setErrorMessage(error.message || 'Failed to save finance goal');
    } finally {
      setLoading(false);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingGoal(null);
    form.resetFields();
  };

  return (
    <>
      <Card style={sectionCardStyle} bodyStyle={{ padding: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={sectionHeaderStyle}>
          <h2 style={sectionTitleStyle}>
            <div style={sectionIconStyle}>💸</div>
            <span>Finance Goals</span>
          </h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button
              type="primary"
              style={{
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
              }}
              size="small"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            />
          </div>
        </div>
        <div style={goalContentStyle}>
          {loading ? (
            <div style={{ padding: '1rem', textAlign: 'center' }}>
              <Text>Loading...</Text>
            </div>
          ) : goals.length === 0 ? (
            <div style={noDataStyle}>
              <div style={{ fontSize: '24px', color: '#bfbfbf' }}>+</div>
              <div style={{ marginTop: '8px', color: '#8c8c8c' }}>Add New Finance Goal</div>
              <div style={{ color: '#bfbfbf' }}>Finance goal description...</div>
            </div>
          ) : (
            <>
              {console.log('Rendering goals:', goals)}
              {goals.map((goal) => (
                <FinanceGoalCard key={goal.id} goal={goal} />
              ))}
            </>
          )}
          {errorMessage && (
            <div style={{ color: 'red', marginTop: '1rem' }}>{errorMessage}</div>
          )}
        </div>
      </Card>

      <Modal
        title={editingGoal ? 'Edit Finance Goal' : 'Add Finance Goal'}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText={editingGoal ? 'Update' : 'Add'}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Goal Name"
            rules={[{ required: true, message: 'Please enter goal name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="saved_percentage"
            label="Saved Percentage (%)"
            rules={[{ required: true, message: 'Please enter saved percentage' }]}
          >
            <Input type="number" step="0.01" min={0} />
          </Form.Item>
          <Form.Item
            name="target_percentage"
            label="Target Percentage (%)"
            rules={[{ required: true, message: 'Please enter target percentage' }]}
          >
            <Input type="number" step="0.01" min={0} />
          </Form.Item>
          <Form.Item
            name="saved_amount"
            label="Saved Amount ($)"
          >
            <Input type="number" step="0.01" min={0} />
          </Form.Item>
          <Form.Item
            name="target_amount"
            label="Target Amount ($)"
          >
            <Input type="number" step="0.01" min={0} />
          </Form.Item>
          <Form.Item
            name="goal_status"
            label="Status"
          >
            <Select allowClear>
              <Option value={0}>Not Started</Option>
              <Option value={1}>In Progress</Option>
              <Option value={2}>Completed</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="deadline"
            label="Deadline"
          >
            <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default FinanceGoalsSection;