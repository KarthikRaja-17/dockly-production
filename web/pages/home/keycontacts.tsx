
'use client';
import React, { useState } from 'react';
import { Card, Tabs, Button, Modal, Form, Input, Select, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;

interface Contact {
  id: string;
  name: string;
  service: string;
  phone: string;
  email?: string;
  notes: string;
  category: string;
}

const KeyContacts: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([
    { id: '1', name: 'Emergency Plumbing Inc.', service: 'Emergency Plumber', phone: '+1-555-0123', email: 'emergency@plumbing.com', notes: '24/7 service', category: 'Emergency Services' },
    { id: '2', name: 'Quick Fix Electric', service: 'Emergency Electrician', phone: '+1-555-0456', email: 'quick@electric.com', notes: '24/7 service', category: 'Emergency Services' },
  ]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Emergency Services');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const predefinedContacts = [
    { category: 'Emergency Services', name: 'Emergency Plumber', icon: '🔧', desc: '24/7 service' },
    { category: 'Emergency Services', name: 'Emergency Electrician', icon: '⚡', desc: '24/7 service' },
    { category: 'Emergency Services', name: 'Emergency Locksmith', icon: '🔒', desc: '24/7 service' },
    { category: 'Regular Service Providers', name: 'HVAC Technician', icon: '🔥', desc: 'Heating & cooling service' },
    { category: 'Regular Service Providers', name: 'Handyman / Contractor', icon: '🔨', desc: 'General repairs & renovations' },
    { category: 'Regular Service Providers', name: 'Window & Gutter Service', icon: '🪟', desc: 'Cleaning & maintenance' },
    { category: 'Regular Service Providers', name: 'Roofer', icon: '🏠', desc: 'Repairs & inspections' },
    { category: 'Regular Service Providers', name: 'Tree Service / Arborist', icon: '🌳', desc: 'Trimming & removal' },
    { category: 'Professional Advisors', name: 'Insurance Agent', icon: '🏢', desc: 'Home & auto insurance' },
    { category: 'Professional Advisors', name: 'Real Estate Agent', icon: '🏘', desc: 'Property advisor' },
    { category: 'Professional Advisors', name: 'Real Estate Attorney', icon: '⚖', desc: 'Legal matters' },
    { category: 'Professional Advisors', name: 'Mortgage Broker / Banker', icon: '🏦', desc: 'Financing advisor' },
    { category: 'Other Contacts', name: 'HOA Contact', icon: '👥', desc: 'Management company' },
    { category: 'Other Contacts', name: 'Neighbors', icon: '🏠', desc: 'Emergency contacts' },
  ];

  const categories = {
    'Emergency Services': { title: 'Emergency Services' },
    'Regular Service Providers': { title: 'Regular Service Providers' },
    'Professional Advisors': { title: 'Professional Advisors' },
    'Other Contacts': { title: 'Other Contacts' },
  };

  const categoryOrder = Object.keys(categories);

  const sectionCardStyle: React.CSSProperties = {
    background: '#ffffff',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    overflow: 'hidden',
    transition: 'box-shadow 0.3s',
    height: '360px',
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

  const contactsContentStyle: React.CSSProperties = {
    padding: '1.5rem',
    maxHeight: '200px',
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

  const ContactSubCard: React.FC<{
    predefined: typeof predefinedContacts[0];
    contact?: Contact;
  }> = ({ predefined, contact }) => {
    const [isHovered, setIsHovered] = useState(false);

    const contactCardStyle: React.CSSProperties = {
      background: contact ? 'linear-gradient(135deg, #dbeafe, #e0e7ff)' : '#f9fafb',
      borderRadius: '0.5rem',
      padding: '1.25rem',
      marginBottom: '1rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
      position: 'relative',
      border: contact ? '1px solid #e2e8f0' : '1px dashed #d1d5db',
      ...(contact && expandedItems.has(contact.id) ? { boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' } : {}),
    };

    const contactProviderStyle: React.CSSProperties = {
      fontWeight: 600,
      marginBottom: '0.75rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      fontSize: '0.9375rem',
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

    const contactItemDetailsStyle: React.CSSProperties = {
      display: 'grid',
      gridTemplateColumns: 'repeat(1, 1fr)',
      gap: '1rem',
      marginTop: '1.25rem',
      paddingTop: '1.25rem',
      borderTop: '1px solid #e2e8f0',
    };

    const actionButtonsStyle: React.CSSProperties = {
      display: 'flex',
      gap: '12px',
      marginTop: '1rem',
      justifyContent: 'flex-end',
    };

    const toggleExpand = () => {
      if (contact) {
        setExpandedItems((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(contact.id)) {
            newSet.delete(contact.id);
          } else {
            newSet.add(contact.id);
          }
          return newSet;
        });
      }
    };

    const handleEdit = (e: React.MouseEvent) => {
      e.stopPropagation();
      form.setFieldsValue({
        category: contact!.category,
        service: contact!.service,
        name: contact!.name,
        phone: contact!.phone,
        email: contact!.email,
        notes: contact!.notes,
      });
      setIsModalVisible(true);
    };

    const handleDelete = (e?: React.MouseEvent<HTMLElement>) => {
      if (e) e.stopPropagation();
      setContacts(contacts.filter(c => c.id !== contact!.id));
      message.success('Contact deleted successfully');
    };

    const handleCardClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (contact) toggleExpand();
      else {
        form.setFieldsValue({
          service: predefined.name,
          category: predefined.category,
        });
        setIsModalVisible(true);
      }
    };

    const arrowContent = contact ? (expandedItems.has(contact.id) ? '↓' : '→') : <PlusOutlined />;
    const arrowColor = contact ? '#3182ce' : '#6b7280';

    return (
      <div
        style={contactCardStyle}
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={contactProviderStyle}>
          <span>{predefined.icon}</span>
          <span>{contact ? contact.name : predefined.name}</span>
        </div>
        {contact ? (
          <>
            <div style={detailItemStyle}>
              <div style={detailLabelStyle}>Service</div>
              <div style={detailValueStyle}>{contact.service}</div>
            </div>
            {expandedItems.has(contact.id) && (
              <div style={contactItemDetailsStyle}>
                <div style={detailItemStyle}>
                  <div style={detailLabelStyle}>Phone</div>
                  <div style={detailValueStyle}>{contact.phone}</div>
                </div>
                {contact.email && (
                  <div style={detailItemStyle}>
                    <div style={detailLabelStyle}>Email</div>
                    <div style={detailValueStyle}>{contact.email}</div>
                  </div>
                )}
                <div style={detailItemStyle}>
                  <div style={detailLabelStyle}>Notes</div>
                  <div style={detailValueStyle}>{contact.notes}</div>
                </div>
                <div style={actionButtonsStyle}>
                  <Button
                    icon={<EditOutlined />}
                    style={{ color: '#3182ce' }}
                    onClick={handleEdit}
                  />
                  <Popconfirm
                    title="Are you sure to delete this contact?"
                    onConfirm={handleDelete}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button
                      icon={<DeleteOutlined />}
                      style={{ color: '#ef4444' }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Popconfirm>
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={descStyle}>{predefined.desc}</div>
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

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const newContact: Contact = {
        id: (contacts.length + 1).toString(),
        name: values.name,
        service: values.service,
        phone: values.phone,
        email: values.email || '',
        notes: values.notes || '',
        category: values.category,
      };
      setContacts([...contacts, newContact]);
      message.success('Contact added successfully');
      form.resetFields();
      setIsModalVisible(false);
    } catch (error) {
      console.error('Add contact error:', error);
      message.error('Failed to add contact');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const renderContacts = (category: string) => {
    const catPre = predefinedContacts.filter(p => p.category === category);
    if (catPre.length === 0) return null;
    const categoryContacts = contacts.filter(c => c.category === category);
    return (
      <div style={contactsContentStyle}>
        {catPre.map((p) => {
          const existingContact = categoryContacts.find(c => c.service === p.name);
          return (
            <ContactSubCard
              key={p.name}
              predefined={p}
              contact={existingContact}
            />
          );
        })}
        {catPre.every(p => categoryContacts.some(c => c.service === p.name)) && (
          <div style={noDataStyle}>
            <div style={{ fontSize: '24px', color: '#bfbfbf' }}>+</div>
            <div style={{ marginTop: '0.5rem', color: '#8c8c8c' }}>Add New Contact</div>
            <div style={{ color: '#bfbfbf' }}>{category} contact description...</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Card style={sectionCardStyle} bodyStyle={{ padding: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={sectionHeaderStyle}>
          <h2 style={sectionTitleStyle}>
            <div style={sectionIconStyle}>📞</div>
            <span>Key Contacts</span>
          </h2>
          <Button
            style={{
              backgroundColor: '#3182ce',
              borderColor: '#3182ce',
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
            onClick={showModal}
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
          {categoryOrder.map((cat) => (
            <TabPane tab={categories[cat as keyof typeof categories].title} key={cat} style={{ flex: 1 }}>
              {renderContacts(cat)}
            </TabPane>
          ))}
        </Tabs>
      </Card>

      <Modal
        title="Add/Edit Contact"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Save Contact"
        cancelText="Cancel"
        okButtonProps={{ type: 'primary', style: { backgroundColor: '#3182ce', borderColor: '#3182ce' } }}
        cancelButtonProps={{ type: 'default' }}
        confirmLoading={loading}
        style={{ maxWidth: 500 }}
        bodyStyle={{ maxHeight: '60vh', overflowY: 'auto' }}
        destroyOnClose
      >
        <Form form={form} layout="vertical" style={{ padding: 16 }}>
          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please select category' }]}
          >
            <Select disabled={!!activeTab} placeholder="Select category">
              {categoryOrder.map((cat) => (
                <Select.Option key={cat} value={cat}>
                  {categories[cat as keyof typeof categories].title}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="service"
            label="Service Type"
            rules={[{ required: true, message: 'Please select service type' }]}
          >
            <Select placeholder="Select service type">
              {predefinedContacts
                .filter(p => p.category === activeTab)
                .map(p => (
                  <Select.Option key={p.name} value={p.name}>
                    {p.name}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="name"
            label="Provider Name"
            rules={[{ required: true, message: 'Please enter provider name' }]}
          >
            <Input placeholder="Enter provider name" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[{ required: true, message: 'Please enter phone number' }]}
          >
            <Input placeholder="e.g., +1-555-0123" />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input placeholder="Enter email (optional)" />
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={3} placeholder="Enter notes" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default KeyContacts;
