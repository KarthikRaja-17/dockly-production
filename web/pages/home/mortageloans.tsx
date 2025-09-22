'use client';

import React, { useState, useEffect } from 'react';
import {
  addMortgageLoan,
  getLoansAndMortgages,
  updateMortgageLoan,
  deleteMortgageLoan,
} from '../../services/home';
import { Card, Button, Modal, Form, Input, InputNumber, Select, Typography, message, List, Avatar, Space, Dropdown, Menu } from 'antd';
import { PlusOutlined, MoreOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;
const { Option } = Select;

interface MortgageLoan {
  id: string;
  mortgageId: string;
  name: string;
  type: string;
  term: number;
  interestRate: number;
  amount: number;
  remainingBalance: number;
  is_active: number;
}

// Predefined loan types for the dropdown
const mortgageTypes = [
  'Car',
  'Home',
  'Personal',
  'Student',
  'Other',
];

const MortgageLoans: React.FC = () => {
  const [mortgages, setMortgages] = useState<MortgageLoan[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMortgageId, setCurrentMortgageId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [isViewAllModalOpen, setIsViewAllModalOpen] = useState<boolean>(false);

  const fetchMortgages = async () => {
    try {
      const response = await getLoansAndMortgages({});
      if (response.status === 1) {
        setMortgages(
          response.payload.loans.map((loan: any) => ({
            id: loan.id,
            mortgageId: loan.mortgageId || '', // Map mortgageId from backend
            name: loan.name,
            type: loan.type ?? '',
            term: loan.term,
            interestRate: loan.interestRate,
            amount: loan.amount,
            remainingBalance: loan.remainingBalance ?? 0,
            is_active: loan.is_active,
          }))
        );
      } else {
        message.error(response.message);
      }
    } catch (err) {
      message.error('Failed to fetch mortgage loans');
    }
  };

  useEffect(() => {
    fetchMortgages();
  }, []);

  const handleOpen = () => {
    setIsModalOpen(true);
    setIsEditing(false);
    form.resetFields();
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setCurrentMortgageId(null);
    form.resetFields();
  };

  const handleEdit = (mortgage: MortgageLoan) => {
    setIsModalOpen(true);
    setIsEditing(true);
    setCurrentMortgageId(mortgage.id);
    form.setFieldsValue({
      id: mortgage.mortgageId, // Use mortgageId for the form's id field
      name: mortgage.name,
      type: mortgage.type,
      term: mortgage.term,
      interestRate: mortgage.interestRate,
      amount: mortgage.amount,
      remainingBalance: mortgage.remainingBalance,
    });
  };

  const handleSubmit = async (values: any) => {
    const params = {
      id: values.id,
      name: values.name,
      type: values.type,
      term: values.term ? Math.floor(values.term) : 0, // Ensure term is an integer
      interestRate: values.interestRate ?? 0,
      amount: values.amount ?? 0,
      remainingBalance: values.remainingBalance ?? 0,
    };

    try {
      if (isEditing && currentMortgageId) {
        const response = await updateMortgageLoan(currentMortgageId, params);
        if (response.status === 1) {
          setMortgages((prev) =>
            prev.map((m) =>
              m.id === currentMortgageId
                ? {
                    id: response.payload.loans[0].id,
                    mortgageId: response.payload.loans[0].mortgageId || '',
                    name: response.payload.loans[0].name,
                    type: response.payload.loans[0].type ?? '',
                    term: response.payload.loans[0].term,
                    interestRate: response.payload.loans[0].interestRate,
                    amount: response.payload.loans[0].amount,
                    remainingBalance: response.payload.loans[0].remainingBalance ?? 0,
                    is_active: response.payload.loans[0].is_active,
                  }
                : m
            )
          );
          message.success('Mortgage loan updated successfully');
        } else {
          message.error(response.message);
        }
      } else {
        const response = await addMortgageLoan(params);
        if (response.status === 1) {
          setMortgages((prev) => [
            ...prev,
            {
              id: response.payload.loans[0].id,
              mortgageId: response.payload.loans[0].mortgageId || '',
              name: response.payload.loans[0].name,
              type: response.payload.loans[0].type ?? '',
              term: response.payload.loans[0].term,
              interestRate: response.payload.loans[0].interestRate,
              amount: response.payload.loans[0].amount,
              remainingBalance: response.payload.loans[0].remainingBalance ?? 0,
              is_active: response.payload.loans[0].is_active,
            },
          ]);
          message.success('Mortgage loan added successfully');
        } else {
          message.error(response.message);
        }
      }
      handleClose();
    } catch (err) {
      message.error('Failed to save mortgage loan');
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this mortgage loan?',
      content: 'This action cannot be undone.',
      okText: 'Delete',
      okButtonProps: { danger: true, style: { borderRadius: '6px' } },
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const response = await deleteMortgageLoan(id);
          if (response.status === 1) {
            setMortgages((prev) => prev.filter((m) => m.id !== id));
            message.success('Mortgage loan deleted successfully');
          } else {
            message.error(response.message);
          }
        } catch (err) {
          message.error('Failed to delete mortgage loan');
        }
      },
    });
  };

  const menu = (mortgage: MortgageLoan) => (
    <Menu>
      <Menu.Item key="edit" onClick={() => handleEdit(mortgage)}>
        <EditOutlined /> Edit
      </Menu.Item>
      <Menu.Item key="delete" onClick={() => handleDelete(mortgage.id)}>
        <DeleteOutlined /> Delete
      </Menu.Item>
    </Menu>
  );

  return (
    <Card
      title={
        <Space style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: '16px', fontWeight: 600, color: '#000', margin: 0 }}>🏦 Mortgage & Loans</Text>
          <Button
            type="text"
            icon={<PlusOutlined />}
            onClick={handleOpen}
            style={{ color: '#f7f3f3ff', padding: '4px 8px' ,backgroundColor: '#1890ff',}}
          />
        </Space>
      }
      style={{
        minHeight: '420px',
        borderRadius: '8px',
        border: '1px solid #d9d9d9',
        width: '100%',
      }}
      bodyStyle={{ padding: '12px', height: 'calc(100% - 57px)', overflow: 'hidden' }}
      headStyle={{ borderBottom: '1px solid #f0f0f0', minHeight: '57px' }}
    >
      <div style={{ height: '100%', overflowY: 'auto', paddingRight: '4px' }}>
        <List
          itemLayout="horizontal"
          dataSource={mortgages.slice(0, 3)}
          renderItem={(mortgage) => (
            <List.Item
              actions={[
                <Dropdown overlay={menu(mortgage)} trigger={['click']}>
                  <Button
                    type="text"
                    size="small"
                    style={{
                      borderColor: '#d9d9d9',
                      backgroundColor: 'transparent',
                      borderRadius: '4px',
                      padding: '0 8px',
                      color: '#000',
                    }}
                  >
                    <MoreOutlined />
                  </Button>
                </Dropdown>,
              ]}
              style={{ borderBottom: '1px solid #f0f0f0', padding: '8px 0' }}
            >
              <List.Item.Meta
                avatar={<Avatar style={{ backgroundColor: '#000', borderRadius: '50%' }}>{mortgage.name[0]}</Avatar>}
                title={
                  <Text style={{ fontWeight: 600, color: '#000', fontSize: '13px' }}>
                    {mortgage.name}
                  </Text>
                }
                description={
                  <Space direction="vertical" size={4}>
                    <Text style={{ color: '#666', fontSize: '13px' }}>
                      {mortgage.type}
                    </Text>
                    <Text style={{ color: '#666', fontSize: '13px' }}>
                      ${mortgage.amount.toFixed(2)} • {mortgage.term} years • {mortgage.interestRate}% • Remaining: ${(mortgage.remainingBalance || 0).toFixed(2)}
                    </Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
        {mortgages.length > 3 && (
          <div style={{ textAlign: 'center', padding: '8px 0', borderTop: '1px solid #f0f0f0' }}>
            <Button
              type="text"
              onClick={() => setIsViewAllModalOpen(true)}
              style={{ color: '#fcf7f7ff', fontSize: '13px', backgroundColor: '#1890ff', borderRadius: '20px' }}
            >
              View All Mortgage Loans
            </Button>
          </div>
        )}
      </div>

      <Modal
        title={isEditing ? 'Edit Mortgage Loan' : 'Add New Mortgage Loan'}
        open={isModalOpen}
        onCancel={handleClose}
        footer={null}
        width={600}
        style={{ top: '20px' }}
      >
        <Form
          form={form}
          name="mortgageForm"
          onFinish={handleSubmit}
          layout="vertical"
          initialValues={{
            id: '',
            name: '',
            type: '',
            term: 0,
            interestRate: 0,
            amount: 0,
            remainingBalance: 0,
          }}
        >
          <Form.Item
            name="name"
            label="Mortgage Name"
            rules={[{ required: true, message: 'Please enter the mortgage name' }]}
          >
            <Input
              style={{ fontSize: '13px', borderRadius: '4px' }}
              placeholder="Enter mortgage name"
            />
          </Form.Item>
          <Form.Item
            name="id"
            label="Mortgage ID"
            rules={[{ required: true, message: 'Please enter the mortgage ID' }]}
          >
            <Input
              style={{ fontSize: '13px', borderRadius: '4px' }}
              placeholder="Enter mortgage ID"
            />
          </Form.Item>
          <Form.Item
            name="type"
            label="Mortgage Type"
            rules={[{ required: true, message: 'Please select the mortgage type' }]}
          >
            <Select
              style={{ fontSize: '13px', borderRadius: '4px' }}
              placeholder="Select mortgage type"
            >
              {mortgageTypes.map((type) => (
                <Option key={type} value={type}>
                  {type}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="term"
            label="Term (Years)"
          >
            <InputNumber
              min={0}
              step={1}
              style={{ width: '100%', fontSize: '13px', borderRadius: '4px' }}
              placeholder="Enter term in years"
              parser={(value: string | undefined) => value ? parseInt(value) : 0}
            />
          </Form.Item>
          <Form.Item
            name="interestRate"
            label="Interest Rate (%)"
          >
            <InputNumber
              min={0}
              step={0.01}
              style={{ width: '100%', fontSize: '13px', borderRadius: '4px' }}
              placeholder="Enter interest rate"
            />
          </Form.Item>
          <Form.Item
            name="amount"
            label="Loan Amount ($)"
          >
            <InputNumber
              min={0}
              step={0.01}
              style={{ width: '100%', fontSize: '13px', borderRadius: '4px' }}
              placeholder="Enter loan amount"
            />
          </Form.Item>
          <Form.Item
            name="remainingBalance"
            label="Remaining Balance ($)"
          >
            <InputNumber
              min={0}
              step={0.01}
              style={{ width: '100%', fontSize: '13px', borderRadius: '4px' }}
              placeholder="Enter remaining balance"
            />
          </Form.Item>
          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button
                onClick={handleClose}
                style={{
                  fontSize: '13px',
                  padding: '4px 12px',
                  borderRadius: '4px',
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                style={{
                  backgroundColor: '#000',
                  borderColor: '#000',
                  color: '#fff',
                  fontSize: '13px',
                  padding: '4px 12px',
                  borderRadius: '4px',
                }}
              >
                {isEditing ? 'Update' : 'Add'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={<Title level={4} style={{ margin: 0, color: '#000' }}>All Mortgage Loans</Title>}
        open={isViewAllModalOpen}
        onCancel={() => setIsViewAllModalOpen(false)}
        footer={null}
        width={700}
        style={{ padding: '24px' }}
        bodyStyle={{ background: '#fafafa', borderRadius: '8px', maxHeight: '500px', overflowY: 'auto', padding: '24px' }}
      >
        <List
          itemLayout="horizontal"
          dataSource={mortgages}
          renderItem={(mortgage) => (
            <List.Item
              actions={[
                <Dropdown overlay={menu(mortgage)} trigger={['click']}>
                  <Button
                    type="text"
                    size="small"
                    style={{
                      borderColor: '#d9d9d9',
                      backgroundColor: 'transparent',
                      borderRadius: '4px',
                      padding: '0 8px',
                      color: '#000',
                    }}
                  >
                    <MoreOutlined />
                  </Button>
                </Dropdown>,
              ]}
              style={{ borderBottom: '1px solid #f0f0f0', padding: '8px 0' }}
            >
              <List.Item.Meta
                avatar={<Avatar style={{ backgroundColor: '#000', borderRadius: '50%' }}>{mortgage.name[0]}</Avatar>}
                title={
                  <Text style={{ fontWeight: 600, color: '#000', fontSize: '13px' }}>
                    {mortgage.name}
                  </Text>
                }
                description={
                  <Space direction="vertical" size={4}>
                    <Text style={{ color: '#666', fontSize: '13px' }}>
                      {mortgage.type}
                    </Text>
                    <Text style={{ color: '#666', fontSize: '13px' }}>
                      ${mortgage.amount.toFixed(2)} • {mortgage.term} years • {mortgage.interestRate}% • Remaining: ${(mortgage.remainingBalance || 0).toFixed(2)}
                    </Text>
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Modal>
    </Card>
  );
};

export default MortgageLoans;