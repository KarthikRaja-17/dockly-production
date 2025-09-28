'use client';
import React, { useState, useEffect } from 'react';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Card, Tabs, Button, Modal, Typography, Input, Select, message, Popconfirm, Spin, Alert } from 'antd';
import { Home, DollarSign, Link, FileText } from 'lucide-react';
import { addUtility, getUtilities, updateUtility, deleteUtility, Utility } from '../../services/home';
import { CustomButton, PRIMARY_COLOR } from '../../app/comman';

const { TabPane } = Tabs;
const { Text } = Typography;
const { Option } = Select;

interface UtilitiesSectionProps {
  hasTabNavigation?: boolean;
}

const UtilitiesSection: React.FC<UtilitiesSectionProps> = ({ hasTabNavigation = true }) => {
  const [formData, setFormData] = useState({
    type: '',
    category: '',
    accountNumber: '',
    monthlyCost: '',
    providerUrl: '',
  });
  const [customType, setCustomType] = useState('');
  const [utilities, setUtilities] = useState<Utility[]>([]);
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [selectedUtility, setSelectedUtility] = useState<Utility | null>(null);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Core');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [errorMessage, setErrorMessage] = useState('');

  const predefinedUtilities = [
    { category: 'Core', name: 'Gas', icon: '🔥', desc: 'Gas utility service' },
    { category: 'Core', name: 'Electricity', icon: '⚡', desc: 'Electricity utility service' },
    { category: 'Core', name: 'Water', icon: '💧', desc: 'Water utility service' },
    { category: 'Core', name: 'Trash / Waste', icon: '🗑️', desc: 'Trash and waste management' },
    { category: 'Core', name: 'Internet', icon: '🌐', desc: 'Internet service provider' },
    { category: 'Home Services', name: 'Lawn Care', icon: '🌱', desc: 'Lawn maintenance service' },
    { category: 'Home Services', name: 'Pest Control', icon: '🐜', desc: 'Pest control service' },
    { category: 'Home Services', name: 'Security System', icon: '🔒', desc: 'Home security service' },
    { category: 'Home Services', name: 'HVAC Service', icon: '❄️', desc: 'Heating and cooling service' },
    { category: 'Home Services', name: 'Cleaning Service', icon: '🧹', desc: 'House cleaning service' },
    { category: 'Home Services', name: 'Snow Removal', icon: '❄️', desc: 'Snow removal service' },
    { category: 'Home Services', name: 'Pool Maintenance', icon: '🏊', desc: 'Pool maintenance service' },
    { category: 'Home Services', name: 'Smart Home', icon: '🏠', desc: 'Smart home system management' },
    { category: 'Entertainment', name: 'TV Provider', icon: '📺', desc: 'Television service provider' },
    { category: 'Entertainment', name: 'Streaming Services', icon: '🎥', desc: 'Streaming media services' },
    { category: 'Entertainment', name: 'Home Phone', icon: '☎️', desc: 'Home phone service' },
  ];

  const categories = {
    Core: { title: 'Core Utilities' },
    'Home Services': { title: 'Home Services' },
    Entertainment: { title: 'Entertainment' },
  };

  const categoryOrder = Object.keys(categories);

  const gradientColors = [
    'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
    'linear-gradient(135deg, #fefcbf 0%, #fef3c7 100%)',
    'linear-gradient(135deg, #d1fae5 0%, #c7f0e0 100%)',
    'linear-gradient(135deg, #fed7e2 0%, #fce7f3 100%)',
  ];

  const sectionCardStyle: React.CSSProperties = {
    background: '#ffffff',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    overflow: 'hidden',
    transition: 'box-shadow 0.3s',
    height: '500px',
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

  const utilitiesContentStyle: React.CSSProperties = {
    padding: '1.5rem',
    maxHeight: '340px',
    overflowY: 'auto',
    flex: 1,
  };

  const noDataStyle: React.CSSProperties = {
    border: '1px dashed #d9d9d9',
    borderRadius: '4px',
    padding: '20px',
    textAlign: 'center',
    margin: '1.5rem',
    backgroundColor: '#fafafa',
    marginTop: '1.5rem',
  };

  const placeholderCardStyle: React.CSSProperties = {
    background: '#e2e8f0',
    borderRadius: '0.5rem',
    padding: '1.25rem',
    marginBottom: '1rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    position: 'relative',
    border: '1px dashed #6b7280',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  };

  const placeholderIconStyle: React.CSSProperties = {
    fontSize: '2rem',
    color: '#6b7280',
  };

  const placeholderNameStyle: React.CSSProperties = {
    fontWeight: 600,
    fontSize: '1rem',
    color: '#6b7280',
  };

  const placeholderDescStyle: React.CSSProperties = {
    fontSize: '0.8125rem',
    color: '#9ca3af',
  };

  const arrowStyle: React.CSSProperties = {
    position: 'absolute',
    right: '1rem',
    color: '#6b7280',
    opacity: 0,
    transition: 'opacity 0.2s',
    pointerEvents: 'none',
    fontSize: '16px',
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
    gradientIndex?: number;
  }> = ({ predefined, utility, expanded, gradientIndex = 0 }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [localLoading, setLocalLoading] = useState(false);

    const utilityCardStyle: React.CSSProperties = {
      background: utility ? gradientColors[gradientIndex % gradientColors.length] : '#e2e8f0',
      borderRadius: '0.5rem',
      padding: '1.25rem',
      marginBottom: '1rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
      position: 'relative',
      border: utility ? '1px solid #e2e8f0' : '1px dashed #6b7280',
    };

    const utilityProviderStyle: React.CSSProperties = {
      fontWeight: 600,
      marginBottom: '0.75rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      fontSize: '0.9375rem',
    };

    const coverageGridStyle: React.CSSProperties = {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '0.75rem',
      fontSize: '0.8125rem',
    };

    const coverageItemStyle: React.CSSProperties = {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '0.25rem 0',
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
      marginTop: '0.5rem',
    };

    const detailItemStyle: React.CSSProperties = {
      fontSize: '0.875rem',
      marginBottom: '0.5rem',
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
      gap: '1rem',
      marginTop: '1.25rem',
      paddingTop: '1.25rem',
      borderTop: '1px solid #e2e8f0',
    };

    const actionButtonsStyle: React.CSSProperties = {
      display: 'flex',
      gap: '12px',
      marginTop: '1.25rem',
      justifyContent: 'flex-end',
    };

    const handleEdit = (e: React.MouseEvent) => {
      e.stopPropagation();
      setFormMode('edit');
      setSelectedUtility(utility!);
      setFormData({
        type: utility!.type,
        category: utility!.category,
        accountNumber: utility!.accountNumber,
        monthlyCost: utility!.monthlyCost.toString(),
        providerUrl: utility!.providerUrl,
      });
      setCustomType(utility!.type);
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
        setFormData({
          type: predefined.name,
          category: predefined.category,
          accountNumber: '',
          monthlyCost: '',
          providerUrl: '',
        });
        setCustomType(predefined.name);
        setSelectedUtility(null);
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
                okText="Yes, Delete"
                cancelText="No"
                okButtonProps={{
                  danger: true,
                  style: { backgroundColor: '#ff0207ff', borderColor: '#ff0207ff' },
                }}
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

  const PlaceholderCard: React.FC<{ onAdd: () => void }> = ({ onAdd }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <div
        style={placeholderCardStyle}
        onClick={onAdd}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* <div style={placeholderIconStyle}><PlusOutlined /></div> */}
        <div>
          <div style={placeholderNameStyle}>Add Another Utility</div>
          <div style={placeholderDescStyle}>Add a new utility to your services</div>
        </div>
        <div style={{ ...arrowStyle, opacity: isHovered ? 1 : 0 }}><PlusOutlined /></div>
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
          .map((util: any, index: number) => ({
            id: util.id || util.utid || '',
            type: util.type || util.name || 'Unknown',
            accountNumber: util.accountNumber || util.account_number || 'N/A',
            monthlyCost: Number(util.monthlyCost || util.monthly_cost || 0),
            providerUrl: util.providerUrl || util.provider_url || '',
            category: util.category || 'Core',
            created_at: util.created_at || '',
            updated_at: util.updated_at || '',
            is_active: util.is_active ?? 1,
            amount: util.amount ?? 0,
            details: util.details ?? '',
            name: util.name ?? util.type ?? 'Unknown',
            logo: util.logo ?? '',
            backgroundColor: gradientColors[index % gradientColors.length],
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
    setFormData({
      type: '',
      category: activeTab,
      accountNumber: '',
      monthlyCost: '',
      providerUrl: '',
    });
    setCustomType('');
    setSelectedUtility(null);
    setErrorMessage('');
    setIsFormModalVisible(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    try {
      if (!formData.category || !customType || !formData.accountNumber || !formData.monthlyCost || !formData.providerUrl) {
        setErrorMessage('Please fill in all required fields.');
        setLoading(false);
        return;
      }

      const payload = {
        type: customType,
        account_number: formData.accountNumber,
        monthly_cost: parseFloat(formData.monthlyCost),
        provider_url: formData.providerUrl,
        category: formData.category,
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
      setFormData({
        type: '',
        category: '',
        accountNumber: '',
        monthlyCost: '',
        providerUrl: '',
      });
      setCustomType('');
      setSelectedUtility(null);
      fetchUtilities();
    } catch (error: any) {
      console.error('Save error:', error);
      setErrorMessage(`Failed to ${formMode} utility: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleModalCancel = () => {
    setIsFormModalVisible(false);
    setFormData({
      type: '',
      category: '',
      accountNumber: '',
      monthlyCost: '',
      providerUrl: '',
    });
    setCustomType('');
    setSelectedUtility(null);
    setErrorMessage('');
  };

  const renderUtilities = (category: string) => {
    const catPre = predefinedUtilities.filter(p => p.category === category);
    const catUtilities = utilities.filter(u => u.category === category);
    if (catPre.length === 0 && catUtilities.length === 0) return null;
    return (
      <div style={utilitiesContentStyle}>
        {catPre.map((p, index) => {
          const util = utilities.find(u => u.category === category && u.type === p.name);
          return (
            <UtilitySubCard
              key={p.name}
              predefined={p}
              utility={util}
              expanded={expandedItems.has(p.name)}
              gradientIndex={index}
            />
          );
        })}
        {catUtilities
          .filter(u => !predefinedUtilities.some(p => p.category === category && p.name === u.type))
          .map((util, index) => (
            <UtilitySubCard
              key={util.id}
              predefined={{ category: util.category, name: util.type, icon: '⚙️', desc: 'Custom utility' }}
              utility={util}
              expanded={expandedItems.has(util.type)}
              gradientIndex={catPre.length + index}
            />
          ))}
        <PlaceholderCard onAdd={handleAdd} />
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
          <CustomButton
            label="Add Utility"
            // icon={<PlusOutlined />}
            onClick={handleAdd}
            // style={{
            //   backgroundColor: PRIMARY_COLOR,
            //   borderColor: PRIMARY_COLOR,
            //   color: '#fff',
            //   borderRadius: '6px',
            //   height: '32px',
            //   padding: '0 8px',
            //   width: '30px',
            //   display: 'flex',
            //   alignItems: 'center',
            //   gap: '2px',
            //   justifyContent: 'center',
            // }}
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
         <CustomButton
            label="Add Utility"
            // icon={<PlusOutlined />}
            onClick={handleAdd}
            // style={{
            //   backgroundColor: PRIMARY_COLOR,
            //   borderColor: PRIMARY_COLOR,
            //   color: '#fff',
            //   borderRadius: '6px',
            //   height: '32px',
            //   padding: '0 8px',
            //   width: '30px',
            //   display: 'flex',
            //   alignItems: 'center',
            //   gap: '2px',
            //   justifyContent: 'center',
            // }
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
        title={
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 0',
              borderBottom: '1px solid #f0f0f0',
              paddingBottom: '16px',
              marginBottom: '8px',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, #096dd9 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 12px ${PRIMARY_COLOR}30`,
              }}
            >
              <Home style={{ fontSize: '20px', color: 'white' }} />
            </div>
            <div>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#1a202c',
                  lineHeight: 1.2,
                  marginBottom: '2px',
                }}
              >
                {formMode === 'add' ? 'Add New Utility' : 'Edit Utility'}
              </div>
              <div
                style={{
                  fontSize: '13px',
                  color: '#64748b',
                  fontWeight: 400,
                }}
              >
                {formMode === 'add' ? 'Add a new utility to your services' : 'Update utility information'}
              </div>
            </div>
          </div>
        }
        open={isFormModalVisible}
        onCancel={handleModalCancel}
        footer={null}
        width={700}
        style={{ top: 20 }}
        bodyStyle={{
          padding: '24px',
          maxHeight: '70vh',
          overflowY: 'auto',
          background: '#fafbfc',
        }}
        maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.6)'}}
      >
        <form onSubmit={handleFormSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '8px',
                display: 'block',
              }}
            >
              Category
            </label>
            <Select
              size="large"
              value={formData.category}
              onChange={(value) => {
                setFormData((prev) => ({ ...prev, category: value, type: '' }));
                setCustomType('');
              }}
              placeholder="Select category"
              style={{
                width: '100%',
                borderRadius: '10px',
                fontSize: '15px',
                height: '48px',
              }}
              dropdownStyle={{
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
              }}
            >
              {categoryOrder.map((category) => (
                <Option key={category} value={category}>
                  {categories[category as keyof typeof categories].title}
                </Option>
              ))}
            </Select>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151',
                marginBottom: '8px',
                display: 'block',
              }}
            >
              Utility Type
            </label>
            <Input
              size="large"
              value={customType}
              onChange={(e) => setCustomType(e.target.value)}
              placeholder="Enter utility type"
              style={{
                borderRadius: '10px',
                border: '2px solid #e2e8f0',
                fontSize: '15px',
                height: '48px',
                background: 'white',
                transition: 'all 0.2s ease',
              }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '8px',
                  display: 'block',
                }}
              >
                Account Number
              </label>
              <Input
                size="large"
                value={formData.accountNumber}
                onChange={(e) => setFormData((prev) => ({ ...prev, accountNumber: e.target.value }))}
                placeholder="Enter account number"
                style={{
                  borderRadius: '10px',
                  border: '2px solid #e2e8f0',
                  fontSize: '15px',
                  height: '48px',
                  background: 'white',
                  transition: 'all 0.2s ease',
                }}
                prefix={<FileText size={16} color="#64748b" />}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '8px',
                  display: 'block',
                }}
              >
                Monthly Cost
              </label>
              <Input
                size="large"
                type="number"
                value={formData.monthlyCost}
                onChange={(e) => setFormData((prev) => ({ ...prev, monthlyCost: e.target.value }))}
                placeholder="Enter monthly cost"
                prefix={<DollarSign size={16} color="#64748b" />}
                style={{
                  borderRadius: '10px',
                  border: '2px solid #e2e8f0',
                  fontSize: '15px',
                  height: '48px',
                  background: 'white',
                  transition: 'all 0.2s ease',
                }}
              />
            </div>
            <div>
              <label
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '8px',
                  display: 'block',
                }}
              >
                Provider URL
              </label>
              <Input
                size="large"
                value={formData.providerUrl}
                onChange={(e) => setFormData((prev) => ({ ...prev, providerUrl: e.target.value }))}
                placeholder="Enter provider URL"
                prefix={<Link size={16} color="#64748b" />}
                style={{
                  borderRadius: '10px',
                  border: '2px solid #e2e8f0',
                  fontSize: '15px',
                  height: '48px',
                  background: 'white',
                  transition: 'all 0.2s ease',
                }}
              />
            </div>
          </div>
          {errorMessage && (
            <Alert
              message="Error"
              description={errorMessage}
              type="error"
              showIcon
              closable
              onClose={() => setErrorMessage('')}
              style={{ marginBottom: '16px', borderRadius: '8px' }}
            />
          )}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button
              size="large"
              onClick={handleModalCancel}
              style={{
                borderRadius: '10px',
                height: '48px',
                padding: '0 24px',
                fontSize: '15px',
                fontWeight: 500,
                border: '2px solid #e2e8f0',
                color: '#64748b',
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              style={{
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: 600,
                background: `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, #096dd9 100%)`,
                border: 'none',
                boxShadow: `0 4px 12px ${PRIMARY_COLOR}30`,
                height: '48px',
                padding: '0 32px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = `0 6px 16px ${PRIMARY_COLOR}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 4px 12px ${PRIMARY_COLOR}30`;
              }}
            >
              {loading ? 'Saving...' : formMode === 'add' ? 'Add Utility' : 'Update Utility'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default UtilitiesSection;