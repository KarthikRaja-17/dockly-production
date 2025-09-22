'use client';
import React, { useState, useEffect } from 'react';
import { Card, Tabs, Button, Modal, Typography, Form, Input, InputNumber, Select, message, Popconfirm, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { addUtility, getUtilities, updateUtility, deleteUtility, Utility } from '../../services/home';
import { PRIMARY_COLOR } from '../../app/comman';

const { TabPane } = Tabs;
const { Text } = Typography;
const { Option } = Select;

interface UtilitiesSectionProps {
  hasTabNavigation?: boolean;
}

const UtilitiesSection: React.FC<UtilitiesSectionProps> = ({ hasTabNavigation = true }) => {
  const [form] = Form.useForm();
  const [utilities, setUtilities] = useState<Utility[]>([]);
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [selectedUtility, setSelectedUtility] = useState<Utility | null>(null);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Core');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const predefinedUtilities = [
    { category: 'Core', name: 'Gas', icon: 'G', desc: 'Gas utility service' },
    { category: 'Core', name: 'Electricity', icon: 'E', desc: 'Electricity utility service' },
    { category: 'Core', name: 'Water', icon: 'W', desc: 'Water utility service' },
    { category: 'Core', name: 'Trash / Waste', icon: 'T', desc: 'Trash and waste management' },
    { category: 'Core', name: 'Internet', icon: 'I', desc: 'Internet service provider' },
    { category: 'Home Services', name: 'Lawn Care', icon: 'L', desc: 'Lawn maintenance service' },
    { category: 'Home Services', name: 'Pest Control', icon: 'P', desc: 'Pest control service' },
    { category: 'Home Services', name: 'Security System', icon: 'S', desc: 'Home security service' },
    { category: 'Home Services', name: 'HVAC Service', icon: 'H', desc: 'Heating and cooling service' },
    { category: 'Home Services', name: 'Cleaning Service', icon: 'C', desc: 'House cleaning service' },
    { category: 'Home Services', name: 'Snow Removal', icon: 'W', desc: 'Snow removal service' },
    { category: 'Home Services', name: 'Pool Maintenance', icon: 'P', desc: 'Pool maintenance service' },
    { category: 'Home Services', name: 'Smart Home', icon: 'S', desc: 'Smart home system management' },
    { category: 'Entertainment', name: 'TV Provider', icon: 'T', desc: 'Television service provider' },
    { category: 'Entertainment', name: 'Streaming Services', icon: 'S', desc: 'Streaming media services' },
    { category: 'Entertainment', name: 'Home Phone', icon: 'P', desc: 'Home phone service' },
  ];

  const categories = {
    Core: { title: 'Core Utilities' },
    'Home Services': { title: 'Home Services' },
    Entertainment: { title: 'Entertainment' },
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

  const utilitiesContentStyle: React.CSSProperties = {
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

  const UtilitySubCard: React.FC<{
    predefined: typeof predefinedUtilities[0];
    utility?: Utility;
    expanded: boolean;
  }> = ({ predefined, utility, expanded }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [localLoading, setLocalLoading] = useState(false);

    const utilityCardStyle: React.CSSProperties = {
      background: utility ? 'linear-gradient(135deg, #dbeafe, #e0e7ff)' : '#f9fafb',
      borderRadius: '0.5rem',
      padding: '1.25rem', // Adjusted padding for internal spacing
      marginBottom: '1rem', // Added gap between cards
      cursor: 'pointer',
      transition: 'all 0.2s',
      position: 'relative',
      border: utility ? '1px solid #e2e8f0' : '1px dashed #d1d5db',
    };

    const utilityProviderStyle: React.CSSProperties = {
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
      setFormMode('edit');
      setSelectedUtility(utility!);
      form.setFieldsValue({
        type: utility!.type,
        category: utility!.category,
        accountNumber: utility!.accountNumber,
        monthlyCost: utility!.monthlyCost,
        providerUrl: utility!.providerUrl,
      });
      setIsFormModalVisible(true);
    };

    const handleDelete = async () => {
      try {
        setLocalLoading(true);
        await deleteUtility(utility!.id);
        message.success('Utility deleted successfully');
        fetchUtilities();
      } catch (error) {
        console.error('Delete error:', error);
        message.error('Failed to delete utility');
      } finally {
        setLocalLoading(false);
      }
    };

    const handleCardClick = () => {
      if (utility) {
        toggleExpand(predefined.name);
      } else {
        setFormMode('add');
        form.resetFields();
        form.setFieldsValue({ category: predefined.category, type: predefined.name });
        setIsFormModalVisible(true);
      }
    };

    const arrowContent = utility ? '→' : <PlusOutlined />;
    const arrowColor = utility ? PRIMARY_COLOR : '#6b7280';

    return (
      <div
        style={utilityCardStyle}
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={utilityProviderStyle}>
          <span>{predefined.icon}</span>
          <span>{predefined.name}</span>
        </div>
        {utility ? (
          <div style={coverageGridStyle}>
            <div style={coverageItemStyle}>
              <span style={coverageLabelStyle}>Monthly Cost</span>
              <span style={coverageValueStyle}>${utility.monthlyCost.toFixed(2)}</span>
            </div>
            <div style={coverageItemStyle}>
              <span style={coverageLabelStyle}>Account Number</span>
              <span style={coverageValueStyle}>{utility.accountNumber || 'N/A'}</span>
            </div>
          </div>
        ) : (
          <div style={descStyle}>{predefined.desc}</div>
        )}
        {utility && expanded && (
          <div>
            <div style={propertyItemDetailsStyle}>
              <div style={detailItemStyle}>
                <div style={detailLabelStyle}>Provider URL</div>
                <div style={detailValueStyle}>
                  <a
                    href={utility.providerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: PRIMARY_COLOR, textDecoration: 'underline' }}
                  >
                    {utility.providerUrl || 'N/A'}
                  </a>
                </div>
              </div>
              <div style={detailItemStyle}>
                <div style={detailLabelStyle}>Category</div>
                <div style={detailValueStyle}>{utility.category}</div>
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
                title="Are you sure to delete this utility?"
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

  const fetchUtilities = async () => {
    try {
      setLoading(true);
      const response = await getUtilities({ is_active: 1 });
      if (response.status === 1 && Array.isArray(response.payload.utilities)) {
        const fetchedUtilities = response.payload.utilities
          .filter((util: any) => util.is_active === 1)
          .map((util: any) => ({
            id: util.id || util.utid || '',
            type: util.type || util.name || 'Unknown',
            accountNumber: util.accountNumber || util.account_number || 'N/A',
            monthlyCost: Number(util.monthlyCost || util.monthly_cost || 0),
            providerUrl: util.providerUrl || util.provider_url || '',
            category: util.category || 'Core',
            created_at: util.created_at || '',
            updated_at: util.updated_at || '',
            is_active: util.is_active ?? 1,
            // Add required Utility fields with default values if missing
            amount: util.amount ?? 0,
            details: util.details ?? '',
            name: util.name ?? util.type ?? 'Unknown',
            logo: util.logo ?? '',
            backgroundColor: util.backgroundColor ?? '#ffffff',
          }));
        setUtilities(fetchedUtilities);
      } else {
        message.error('Failed to fetch utilities');
      }
    } catch (error: any) {
      console.error('Fetch error:', error);
      message.error(`An error occurred while fetching utilities: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUtilities();
  }, []);

  const handleAdd = () => {
    setFormMode('add');
    form.resetFields();
    form.setFieldsValue({ category: activeTab });
    setSelectedUtility(null);
    setIsFormModalVisible(true);
  };

  const handleFormSubmit = async (values: any) => {
    try {
      const payload = {
        type: values.type,
        account_number: values.accountNumber,
        monthly_cost: values.monthlyCost,
        provider_url: values.providerUrl,
        category: values.category,
        is_active: 1,
      };

      if (formMode === 'add') {
        await addUtility(payload);
        message.success('Utility added successfully');
      } else if (formMode === 'edit' && selectedUtility) {
        await updateUtility(selectedUtility.id, payload);
        message.success('Utility updated successfully');
      }
      setIsFormModalVisible(false);
      form.resetFields();
      setSelectedUtility(null);
      fetchUtilities();
    } catch (error: any) {
      console.error('Save error:', error);
      message.error(`Failed to ${formMode} utility: ${error.message}`);
    }
  };

  const handleModalCancel = () => {
    setIsFormModalVisible(false);
    form.resetFields();
    setSelectedUtility(null);
  };

  const renderUtilities = (category: string) => {
    const catPre = predefinedUtilities.filter(p => p.category === category);
    if (catPre.length === 0) return null;
    return (
      <div style={utilitiesContentStyle}>
        {catPre.map((p) => {
          const util = utilities.find(u => u.category === category && u.type === p.name);
          return (
            <UtilitySubCard
              key={p.name}
              predefined={p}
              utility={util}
              expanded={expandedItems.has(p.name)}
            />
          );
        })}
        {catPre.every(p => utilities.some(u => u.category === category && u.type === p.name)) && (
          <div style={noDataStyle}>
            <div style={{ fontSize: '24px', color: '#bfbfbf' }}>+</div>
            <div style={{ marginTop: '0.5rem', color: '#8c8c8c' }}>Add New Utility</div>
            <div style={{ color: '#bfbfbf' }}>{category} utility description...</div>
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
            <div style={sectionIconStyle}>⚡</div>
            <span>Utilities & Home Services</span>
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
        <div style={utilitiesContentStyle}>
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
            <div style={sectionIconStyle}>⚡</div>
            <span>Utilities & Home Services</span>
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
          style={{ flex: 1, display: 'flex', flexDirection: 'column', marginTop: '0.5rem' }} // Added margin for tab spacing
          tabBarStyle={{
            padding: '1rem 1.5rem 0', // Adjusted padding for tab bar
            background: '#ffffff',
            margin: 0,
          }}
        >
          <TabPane tab="Core" key="Core" style={{ flex: 1 }}>
            {renderUtilities('Core')}
          </TabPane>
          <TabPane tab="Home Services" key="Home Services" style={{ flex: 1 }}>
            {renderUtilities('Home Services')}
          </TabPane>
          <TabPane tab="Entertainment" key="Entertainment" style={{ flex: 1 }}>
            {renderUtilities('Entertainment')}
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title={formMode === 'add' ? 'Add Utility' : 'Edit Utility'}
        open={isFormModalVisible}
        onCancel={handleModalCancel}
        footer={null}
        style={{ padding: '1rem' }} // Added padding for modal
      >
        <Form
          form={form}
          onFinish={handleFormSubmit}
          layout="vertical"
          style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }} // Increased padding and gap
        >
          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please select a category' }]}
          >
            <Select placeholder="Select a category">
              {categoryOrder.map((cat) => (
                <Option key={cat} value={cat}>
                  {categories[cat as keyof typeof categories].title}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="type"
            label="Utility Name"
            rules={[{ required: true, message: 'Please select or enter the utility name' }]}
          >
            <Select
              placeholder="Select or enter utility name"
              showSearch
              allowClear
              options={predefinedUtilities
                .filter(p => p.category === form.getFieldValue('category') || !form.getFieldValue('category'))
                .filter(p => !utilities.some(u => u.type === p.name && u.category === p.category))
                .map(p => ({ value: p.name, label: p.name }))}
              filterOption={(input, option) =>
                option?.label?.toString().toLowerCase().includes(input.toLowerCase()) || false
              }
            />
          </Form.Item>
          <Form.Item
            name="accountNumber"
            label="Account Number"
            rules={[{ required: true, message: 'Please enter the account number' }]}
          >
            <Input placeholder="e.g., 123456789" />
          </Form.Item>
          <Form.Item
            name="monthlyCost"
            label="Monthly Cost ($)"
            rules={[{ required: true, message: 'Please enter the monthly cost' }]}
          >
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="providerUrl"
            label="Provider URL"
            rules={[{ required: true, message: 'Please enter the provider URL' }, { type: 'url', message: 'Please enter a valid URL' }]}
          >
            <Input placeholder="e.g., https://provider.com" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%', marginTop: '0.5rem' }}>
              {formMode === 'add' ? 'Add Utility' : 'Update Utility'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default UtilitiesSection;