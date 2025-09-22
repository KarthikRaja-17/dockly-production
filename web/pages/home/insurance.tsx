'use client';
import React, { useState, useEffect } from 'react';
import { Card, Tabs, Button, Modal, Form, Input, Select, DatePicker, message, Typography, Popconfirm, Spin, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { addInsurance, getInsurance, updateInsurance, deleteInsurance } from '../../services/home';
import moment from 'moment';
import { PRIMARY_COLOR } from '../../app/comman';

const { TabPane } = Tabs;
const { Text } = Typography;
const { Option } = Select;

interface Insurance {
  id: string;
  name: string;
  meta: string;
  type: string;
  years: number;
  payment: number;
  renewal_date?: string;
  description?: string;
  is_active: number;
  created_at?: string;
  updated_at?: string;
}

const InsuranceSection: React.FC = () => {
  const [form] = Form.useForm();
  const [insurances, setInsurances] = useState<Insurance[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingInsurance, setEditingInsurance] = useState<Insurance | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('property');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [subTypeOptions, setSubTypeOptions] = useState<{ value: string; label: string }[]>([]);

  const predefined = [
    { category: 'property', name: 'Homeowners Insurance', icon: '🏠', desc: 'Coverage • Premium • Deductible' },
    { category: 'property', name: 'Flood / Earthquake', icon: '💧', desc: 'Optional coverage' },
    { category: 'property', name: 'Home Warranty', icon: '🔧', desc: 'Appliances • Systems' },
    { category: 'vehicle', name: 'Auto Insurance', icon: '🚗', desc: 'Cars • Motorcycles • RV • Boat' },
    { category: 'life', name: 'Life Insurance', icon: '❤️', desc: 'Term • Whole • Universal • AD&D' },
    { category: 'other', name: 'Umbrella Policy', icon: '☂️', desc: 'Additional liability coverage' },
    { category: 'other', name: 'Valuable Items', icon: '💎', desc: 'Jewelry • Art • Collectibles' },
    { category: 'other', name: 'Pet Insurance', icon: '🐕', desc: 'Health coverage for pets' },
    { category: 'renewals', name: 'Vehicle Registration', icon: '🚗', desc: 'Cars • Motorcycles • Boats • Trailers' },
    { category: 'renewals', name: "Driver's License", icon: '🆔', desc: 'Renewal date • Real ID' },
    { category: 'renewals', name: 'Property Taxes', icon: '🏛️', desc: 'Annual / Semi-annual' },
    { category: 'renewals', name: 'HOA Dues', icon: '🏘️', desc: 'If applicable' },
  ];

  const categories = {
    property: { title: 'Property' },
    vehicle: { title: 'Vehicle' },
    life: { title: 'Life' },
  };

  const categoryOrder = Object.keys(categories);

  const sectionCardStyle: React.CSSProperties = {
    background: '#ffffff',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    overflow: 'hidden',
    transition: 'box-shadow 0.3s',
    height: '500px',
    display: 'flex',
    flexDirection: 'column',
    // margin: '0.75rem', // Added margin for gap around the card
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

  const insuranceContentStyle: React.CSSProperties = {
    padding: '1.5rem', // Increased padding for internal spacing
    maxHeight: '340px',
    overflowY: 'auto',
    flex: 1,
  };

  const noDataStyle: React.CSSProperties = {
    border: '1px dashed #d9d9d9',
    borderRadius: '4px',
    padding: '20px',
    textAlign: 'center',
    margin: '1.5rem', // Increased margin for better spacing
    backgroundColor: '#fafafa',
    marginTop: '1.5rem',
  };

  const toggleExpand = (name: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(name)) {
        newSet.delete(name);
      } else {
        newSet.add(name);
      }
      return newSet;
    });
  };

  const handleQuickAdd = (pre: typeof predefined[0]) => {
    setEditingInsurance(null);
    form.resetFields();
    form.setFieldsValue({ type: pre.category, subType: pre.name });
    const availableNames = predefined
      .filter(p => p.category === pre.category)
      .map(p => p.name)
      .filter(name => !insurances.some(i => i.name === name));
    setSubTypeOptions(availableNames.map(name => ({ value: name, label: name })));
    setIsModalVisible(true);
  };

  const handleFormValuesChange = (changedValues: any, allValues: any) => {
    if (changedValues.type !== undefined) {
      const typeVal = allValues.type;
      let availableNames = predefined.filter(p => p.category === typeVal).map(p => p.name);
      if (!editingInsurance) {
        availableNames = availableNames.filter(name => !insurances.some(i => i.name === name));
      }
      setSubTypeOptions(availableNames.map(name => ({ value: name, label: name })));
      const currentSubType = allValues.subType;
      if (currentSubType && !availableNames.includes(currentSubType)) {
        form.setFields([{ name: 'subType', value: undefined }]);
      }
    }
  };

  const InsuranceSubCard: React.FC<{
    predefined: typeof predefined[0];
    insurance?: Insurance;
    expanded: boolean;
  }> = ({ predefined, insurance, expanded }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [localLoading, setLocalLoading] = useState(false);

    const insuranceCardStyle: React.CSSProperties = {
      background: insurance ? 'linear-gradient(135deg, #dbeafe, #e0e7ff)' : '#f9fafb',
      borderRadius: '0.5rem',
      padding: '1.25rem', // Adjusted padding for internal spacing
      marginBottom: '1rem', // Added gap between cards
      cursor: 'pointer',
      transition: 'all 0.2s',
      position: 'relative',
      border: insurance ? '1px solid #e2e8f0' : '1px dashed #d1d5db',
    };

    const insuranceProviderStyle: React.CSSProperties = {
      fontWeight: 600,
      marginBottom: '0.75rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem', // Increased gap for better spacing
      fontSize: '0.9375rem',
    };

    const coverageGridStyle: React.CSSProperties = {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '0.75rem', // Increased gap for grid items
      fontSize: '0.8125rem',
    };

    const coverageItemStyle: React.CSSProperties = {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '0.25rem 0', // Added padding for vertical spacing
    };

    const coverageLabelStyle: React.CSSProperties = {
      color: '#64748b',
    };

    const coverageValueStyle: React.CSSProperties = {
      fontWeight: 600,
    };

    const descStyle: React.CSSProperties = {
      fontSize: '0.8125rem',
      color: '#64748b',
      marginTop: '0.5rem', // Adjusted for spacing
    };

    const detailItemStyle: React.CSSProperties = {
      fontSize: '0.875rem',
      marginBottom: '0.5rem', // Added gap between detail items
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
      gap: '1rem', // Increased gap for details
      marginTop: '1.25rem',
      paddingTop: '1.25rem',
      borderTop: '1px solid #e2e8f0',
    };

    const actionButtonsStyle: React.CSSProperties = {
      display: 'flex',
      gap: '12px', // Increased gap for buttons
      marginTop: '1.25rem',
      justifyContent: 'flex-end',
    };

    const handleEdit = (e: React.MouseEvent) => {
      e.stopPropagation();
      setEditingInsurance(insurance!);
      form.setFieldsValue({
        type: insurance!.type,
        subType: insurance!.name,
        meta: insurance!.meta,
        years: insurance!.years,
        payment: insurance!.payment,
        renewal_date: insurance!.renewal_date ? moment(insurance!.renewal_date) : null,
        description: insurance!.description,
      });
      const predefinedArr =
        Array.isArray((window as any).predefined)
          ? ((window as any).predefined as { category: string; name: string }[])
          : Array.isArray(predefined)
            ? predefined
            : [predefined];
      const availableNames: string[] = predefinedArr
        .filter((p: { category: string; name: string }) => p.category === insurance!.type)
        .map((p: { name: string }) => p.name);
      setSubTypeOptions(availableNames.map((name: string): { value: string; label: string } => ({ value: name, label: name })));
      setIsModalVisible(true);
    };

    const handleDelete = async () => {
      try {
        setLocalLoading(true);
        await deleteInsurance(insurance!.id);
        message.success('Insurance deleted successfully');
        fetchInsurances();
      } catch (error) {
        console.error('Delete error:', error);
        message.error('Failed to delete insurance');
      } finally {
        setLocalLoading(false);
      }
    };

    const handleCardClick = () => {
      if (insurance) {
        toggleExpand(predefined.name);
      } else {
        handleQuickAdd(predefined);
      }
    };

    const arrowContent = insurance ? '→' : <PlusOutlined />;
    const arrowColor = insurance ? PRIMARY_COLOR : '#6b7280';

    return (
      <div
        style={insuranceCardStyle}
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={insuranceProviderStyle}>
          <span>{predefined.icon}</span>
          <span>{predefined.name}</span>
        </div>
        {insurance ? (
          <div style={coverageGridStyle}>
            <div style={coverageItemStyle}>
              <span style={coverageLabelStyle}>Term Length</span>
              <span style={coverageValueStyle}>{insurance.years} years</span>
            </div>
            <div style={coverageItemStyle}>
              <span style={coverageLabelStyle}>Annual Premium</span>
              <span style={coverageValueStyle}>${insurance.payment}</span>
            </div>
          </div>
        ) : (
          <div style={descStyle}>{predefined.desc}</div>
        )}
        {insurance && expanded && (
          <div>
            <div style={propertyItemDetailsStyle}>
              <div style={detailItemStyle}>
                <div style={detailLabelStyle}>Provider</div>
                <div style={detailValueStyle}>{insurance.meta || 'N/A'}</div>
              </div>
              <div style={detailItemStyle}>
                <div style={detailLabelStyle}>Next Renewal</div>
                <div style={detailValueStyle}>{insurance.renewal_date ? moment(insurance.renewal_date).format('MMM DD, YYYY') : 'N/A'}</div>
              </div>
              <div style={detailItemStyle}>
                <div style={detailLabelStyle}>Description</div>
                <div style={detailValueStyle}>{insurance.description || 'No description available'}</div>
              </div>
            </div>
            <div style={actionButtonsStyle}>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleEdit}
                style={{ borderRadius: '6px' }}
                loading={localLoading}
              />
              <Popconfirm
                title="Are you sure to delete this insurance?"
                onConfirm={handleDelete}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  type="primary"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={(e) => e.stopPropagation()}
                  style={{ borderRadius: '6px' }}
                  loading={localLoading}
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
            color: arrowColor,
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.2s',
            pointerEvents: 'none',
            fontSize: '16px',
          }}
        >
          {arrowContent}
        </div>
      </div>
    );
  };

  const fetchInsurances = async () => {
    try {
      setLoading(true);
      const response = await getInsurance({});
      setInsurances(response.payload.insurances || []);
    } catch (error) {
      console.error('Fetch error:', error);
      message.error('Failed to fetch insurances');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsurances();
  }, []);

  const handleAdd = () => {
    setEditingInsurance(null);
    form.resetFields();
    form.setFieldsValue({ type: activeTab });
    const availableNames = predefined
      .filter(p => p.category === activeTab)
      .map(p => p.name)
      .filter(name => !insurances.some(i => i.name === name));
    setSubTypeOptions(availableNames.map(name => ({ value: name, label: name })));
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const insuranceData = {
        name: values.subType,
        type: values.type,
        meta: values.meta,
        years: values.years,
        payment: parseFloat(values.payment),
        renewal_date: values.renewal_date ? values.renewal_date.format('YYYY-MM-DD') : null,
        description: values.description || '',
      };

      if (editingInsurance) {
        await updateInsurance(editingInsurance.id, insuranceData);
        message.success('Insurance updated successfully');
      } else {
        await addInsurance(insuranceData);
        message.success('Insurance added successfully');
      }
      setIsModalVisible(false);
      fetchInsurances();
    } catch (error) {
      console.error('Save error:', error);
      message.error('Failed to save insurance');
    } finally {
      setLoading(false);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingInsurance(null);
    form.resetFields();
    setSubTypeOptions([]);
  };

  const renderInsurances = (category: string) => {
    const catPre = predefined.filter(p => p.category === category);
    if (catPre.length === 0) return null;
    return (
      <div style={insuranceContentStyle}>
        {catPre.map((p) => {
          const ins = insurances.find(i => i.type === category && i.name === p.name);
          return (
            <InsuranceSubCard
              key={p.name}
              predefined={p}
              insurance={ins}
              expanded={expandedItems.has(p.name)}
            />
          );
        })}
        {catPre.every(p => insurances.some(i => i.type === category && i.name === p.name)) && (
          <div style={noDataStyle}>
            <div style={{ fontSize: '24px', color: '#bfbfbf' }}>+</div>
            <div style={{ marginTop: '0.5rem', color: '#8c8c8c' }}>Add New Insurance</div>
            <div style={{ color: '#bfbfbf' }}>{category} insurance description...</div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Card style={sectionCardStyle} bodyStyle={{ padding: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={sectionHeaderStyle}>
          <h2 style={sectionTitleStyle}>
            <div style={sectionIconStyle}>🛡️</div>
            <span>Insurance & Renewals</span>
          </h2>
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
        <div style={insuranceContentStyle}>
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <Spin />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card style={sectionCardStyle} bodyStyle={{ padding: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={sectionHeaderStyle}>
          <h2 style={sectionTitleStyle}>
            <div style={sectionIconStyle}>🛡️</div>
            <span>Insurance & Renewals</span>
          </h2>
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
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', marginTop: '0.5rem' }}
          tabBarStyle={{
            padding: '1rem 1.5rem 0',
            background: '#ffffff',
            margin: 0,
          }}
        >
          <TabPane tab="Property" key="property" style={{ flex: 1 }}>
            {renderInsurances('property')}
          </TabPane>
          <TabPane tab="Vehicle" key="vehicle" style={{ flex: 1 }}>
            {renderInsurances('vehicle')}
          </TabPane>
          <TabPane tab="Life" key="life" style={{ flex: 1 }}>
            {renderInsurances('life')}
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title={editingInsurance ? `Edit ${editingInsurance.name}` : 'Add Insurance Policy'}
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
        style={{ padding: '1rem' }}
      >
        <Form
          form={form}
          onFinish={handleModalOk}
          layout="vertical"
          style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
          onValuesChange={handleFormValuesChange}
        >
          <Form.Item
            name="type"
            label="Category"
            rules={[{ required: true, message: 'Please select category' }]}
          >
            <Select options={categoryOrder.map(key => ({ value: key, label: categories[key as keyof typeof categories].title }))} disabled={!!editingInsurance} />
          </Form.Item>
          <Form.Item
            name="subType"
            label="Policy Type"
            rules={[{ required: true, message: 'Please select policy type' }]}
          >
            <Select options={subTypeOptions} disabled={!!editingInsurance} />
          </Form.Item>
          <Form.Item
            name="meta"
            label="Provider / Meta"
            rules={[{ required: true, message: 'Please enter provider or meta information' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="years"
            label="Coverage Years"
            rules={[{ required: true, message: 'Please enter number of years' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="payment"
            label="Annual Premium ($)"
            rules={[{ required: true, message: 'Please enter premium amount' }]}
          >
            <InputNumber step={0.01} min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="renewal_date"
            label="Renewal Date"
          >
            <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%', marginTop: '0.5rem' }}>
              {editingInsurance ? 'Update Insurance' : 'Add Insurance'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default InsuranceSection;
