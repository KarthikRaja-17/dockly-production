'use client';
import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Card, 
  Input, 
  Modal, 
  message, 
  Dropdown, 
  Space,
  Divider,
  Tabs,
  Typography,
  Popconfirm
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { 
  addSchool, 
  getSchools, 
  updateSchool, 
  deleteSchool,
  addActivity,
  getActivities,
  updateActivity,
  deleteActivity
} from '../../../services/family';
import { PRIMARY_COLOR } from '../../../app/comman';

const { Text } = Typography;

interface CustomField {
  label: string;
  value: string;
}

interface ResourceLink {
  label: string;
  url: string;
}

interface School {
  id?: string;
  name: string;
  gradeLevel: string;
  studentId: string;
  customFields: CustomField[];
  links: ResourceLink[];
}

interface Activity {
  id?: string;
  name: string;
  schedule: string;
  customFields: CustomField[];
  links: ResourceLink[];
}

// const PRIMARY_COLOR = '#1890ff'; // Assuming PRIMARY_COLOR from insurance.tsx

const DynamicSchoolActivities: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState<any>(null);
  const [currentEditType, setCurrentEditType] = useState<'school' | 'activity'>('school');
  const [formType, setFormType] = useState<'school' | 'activity'>('school');
  const [formData, setFormData] = useState<any>({});
  const [customFieldLabel, setCustomFieldLabel] = useState('');
  const [linkLabel, setLinkLabel] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

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
    fontSize: '1rem',
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

  const contentStyle: React.CSSProperties = {
    padding: '1.25rem',
    maxHeight: '340px',
    overflowY: 'auto',
    flex: 1,
  };

  const noDataStyle: React.CSSProperties = {
    border: '1px dashed #d9d9d9',
    borderRadius: '4px',
    padding: '16px',
    textAlign: 'center',
    margin: '16px 1.25rem',
    backgroundColor: '#fafafa',
    marginTop: '40px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    minHeight: '80px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [schoolResponse, activityResponse] = await Promise.all([
        getSchools(),
        getActivities()
      ]);
      
      if (schoolResponse.status === 1) {
        setSchools(schoolResponse.payload.schools || []);
      }
      
      if (activityResponse.status === 1) {
        setActivities(activityResponse.payload.activities || []);
      }
    } catch (error) {
    //   console.error('Error loading data:', error);
    //   message.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    const dropdownItems = [
      {
        key: 'school',
        label: 'School',
        onClick: () => {
          setFormType('school');
          setFormData({
            name: '',
            gradeLevel: '',
            studentId: '',
            customFields: [],
            links: []
          });
          setAddModalVisible(true);
        }
      },
      {
        key: 'activity',
        label: 'Activity',
        onClick: () => {
          setFormType('activity');
          setFormData({
            name: '',
            schedule: '',
            customFields: [],
            links: []
          });
          setAddModalVisible(true);
        }
      }
    ];

    return (
      <Dropdown menu={{ items: dropdownItems }} trigger={['click']}>
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
        />
      </Dropdown>
    );
  };

  const handleSave = async () => {
    try {
      if (formType === 'school') {
        if (!formData.name) {
          message.error('School name is required');
          return;
        }
        const response = await addSchool(formData);
        if (response.status === 1) {
          message.success('School added successfully');
          loadData();
          setAddModalVisible(false);
          resetForm();
        }
      } else {
        if (!formData.name) {
          message.error('Activity name is required');
          return;
        }
        const response = await addActivity(formData);
        if (response.status === 1) {
          message.success('Activity added successfully');
          loadData();
          setAddModalVisible(false);
          resetForm();
        }
      }
    } catch (error) {
      console.error('Error saving:', error);
      message.error('Failed to save');
    }
  };

  const handleEdit = (item: any, type: 'school' | 'activity') => {
    setCurrentEditItem(item);
    setCurrentEditType(type);
    setFormType(type);
    setFormData({ ...item });
    setEditModalVisible(true);
  };

  const handleUpdate = async () => {
    try {
      if (currentEditType === 'school') {
        const response = await updateSchool(formData);
        if (response.status === 1) {
          message.success('School updated successfully');
          loadData();
          setEditModalVisible(false);
        }
      } else {
        const response = await updateActivity(formData);
        if (response.status === 1) {
          message.success('Activity updated successfully');
          loadData();
          setEditModalVisible(false);
        }
      }
    } catch (error) {
      console.error('Error updating:', error);
      message.error('Failed to update');
    }
  };

  const handleDelete = async (id: string, type: 'school' | 'activity') => {
    try {
      if (type === 'school') {
        const response = await deleteSchool(id);
        if (response.status === 1) {
          message.success('School deleted successfully');
          loadData();
        }
      } else {
        const response = await deleteActivity(id);
        if (response.status === 1) {
          message.success('Activity deleted successfully');
          loadData();
        }
      }
    } catch (error) {
      console.error('Error deleting:', error);
      message.error('Failed to delete');
    }
  };

  const resetForm = () => {
    setFormData({});
    setCustomFieldLabel('');
    setLinkLabel('');
    setLinkUrl('');
  };

  const addCustomField = () => {
    if (!customFieldLabel.trim()) {
      message.error('Please enter a field label');
      return;
    }
    
    const newField = { label: customFieldLabel, value: '' };
    setFormData({
      ...formData,
      customFields: [...(formData.customFields || []), newField]
    });
    setCustomFieldLabel('');
    message.success(`Field "${customFieldLabel}" added`);
  };

  const addLink = () => {
    if (!linkLabel.trim() || !linkUrl.trim()) {
      message.error('Please enter both link label and URL');
      return;
    }
    
    const newLink = { label: linkLabel, url: linkUrl };
    setFormData({
      ...formData,
      links: [...(formData.links || []), newLink]
    });
    setLinkLabel('');
    setLinkUrl('');
    message.success('Link added successfully');
  };

  const updateCustomFieldValue = (index: number, value: string) => {
    const updatedFields = [...(formData.customFields || [])];
    updatedFields[index].value = value;
    setFormData({ ...formData, customFields: updatedFields });
  };

  const removeCustomField = (index: number) => {
    const updatedFields: CustomField[] = formData.customFields?.filter((_: CustomField, i: number) => i !== index) ?? [];
    setFormData({ ...formData, customFields: updatedFields });
  };

  const removeLink = (index: number) => {
    const updatedLinks: ResourceLink[] = formData.links?.filter((_: ResourceLink, i: number) => i !== index) ?? [];
    setFormData({ ...formData, links: updatedLinks });
  };

  const handleEmptyTemplateClick = (type: 'school' | 'activity') => {
    setFormType(type);
    setFormData(
      type === 'school'
        ? {
            name: '',
            gradeLevel: '',
            studentId: '',
            customFields: [],
            links: []
          }
        : {
            name: '',
            schedule: '',
            customFields: [],
            links: []
          }
    );
    setAddModalVisible(true);
  };

  const ItemCard: React.FC<{ item: School | Activity; type: 'school' | 'activity' }> = ({ item, type }) => {
    const [isHovered, setIsHovered] = useState(false);

    const cardStyle: React.CSSProperties = {
      background: 'linear-gradient(135deg, #dbeafe, #e0e7ff)',
      borderRadius: '0.5rem',
      padding: '1rem',
      marginBottom: '1rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
      position: 'relative',
      border: '1px solid #e2e8f0',
    };

    const itemTitleStyle: React.CSSProperties = {
      fontWeight: 600,
      marginBottom: '0.75rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.9375rem',
    };

    const gridStyle: React.CSSProperties = {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '0.5rem',
      fontSize: '0.8125rem',
    };

    const gridItemStyle: React.CSSProperties = {
      display: 'flex',
      justifyContent: 'space-between',
    };

    const labelStyle: React.CSSProperties = {
      color: '#64748b',
    };

    const valueStyle: React.CSSProperties = {
      fontWeight: 600,
    };

    const detailContainerStyle: React.CSSProperties = {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '0.75rem',
      marginTop: '1rem',
      paddingTop: '1rem',
      borderTop: '1px solid #e2e8f0',
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

    const actionButtonsStyle: React.CSSProperties = {
      display: 'flex',
      gap: '8px',
      marginTop: '1rem',
      justifyContent: 'flex-end',
    };

    const handleEditClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      handleEdit(item, type);
    };

    const handleDeleteClick = async (e?: React.MouseEvent<HTMLElement>) => {
      if (e) {
        e.stopPropagation();
      }
      await handleDelete(item.id!, type);
    };

    return (
      <div
        style={cardStyle}
        onClick={() => toggleExpand(item.id!)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={itemTitleStyle}>
          <span>{type === 'school' ? '🏫' : '🎭'}</span>
          <span>{item.name}</span>
        </div>
        <div style={gridStyle}>
          {type === 'school' ? (
            <>
              <div style={gridItemStyle}>
                <span style={labelStyle}>Grade Level</span>
                <span style={valueStyle}>{(item as School).gradeLevel || 'N/A'}</span>
              </div>
              <div style={gridItemStyle}>
                <span style={labelStyle}>Student ID</span>
                <span style={valueStyle}>{(item as School).studentId || 'N/A'}</span>
              </div>
            </>
          ) : (
            <div style={gridItemStyle}>
              <span style={labelStyle}>Schedule</span>
              <span style={valueStyle}>{(item as Activity).schedule || 'N/A'}</span>
            </div>
          )}
        </div>
        {expandedItems.has(item.id!) && (
          <div style={detailContainerStyle}>
            {item.customFields && item.customFields.length > 0 && (
              <div style={detailItemStyle}>
                <div style={detailLabelStyle}>Custom Fields</div>
                {item.customFields.map((field, index) => (
                  <div key={index} style={{ marginBottom: '0.25rem' }}>
                    <span style={{ ...detailValueStyle, color: '#64748b' }}>{field.label}: </span>
                    <span style={detailValueStyle}>{field.value || 'Not specified'}</span>
                  </div>
                ))}
              </div>
            )}
            {item.links && item.links.length > 0 && (
              <div style={detailItemStyle}>
                <div style={detailLabelStyle}>Links</div>
                {item.links.map((link, index) => (
                  <div key={index} style={{ marginBottom: '0.25rem' }}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: PRIMARY_COLOR, textDecoration: 'none' }}
                    >
                      {link.label}
                    </a>
                  </div>
                ))}
              </div>
            )}
            <div style={actionButtonsStyle}>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleEditClick}
                style={{ borderRadius: '6px' }}
                loading={loading}
              >
                {/* Edit */}
              </Button>
              <Popconfirm
                title={`Are you sure to delete this ${type}?`}
                onConfirm={handleDeleteClick}
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
                >
                  {/* Delete */}
                </Button>
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

  const renderForm = () => (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#64748b' }}>
          {formType === 'school' ? 'School Name' : 'Activity Name'} *
        </label>
        <Input
          placeholder={`Enter ${formType} name`}
          value={formData.name || ''}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          style={{ borderRadius: '6px' }}
        />
      </div>

      {formType === 'school' && (
        <>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#64748b' }}>
              Grade Level
            </label>
            <Input
              placeholder="Enter grade level"
              value={formData.gradeLevel || ''}
              onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
              style={{ borderRadius: '6px' }}
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#64748b' }}>
              Student ID
            </label>
            <Input
              placeholder="Enter student ID"
              value={formData.studentId || ''}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              style={{ borderRadius: '6px' }}
            />
          </div>
        </>
      )}

      {formType === 'activity' && (
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#64748b' }}>
            Schedule
          </label>
          <Input
            placeholder="Enter schedule (e.g., Monday 3:00 PM - 5:00 PM)"
            value={formData.schedule || ''}
            onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
            style={{ borderRadius: '6px' }}
          />
        </div>
      )}

      <Divider style={{ borderColor: '#e2e8f0' }} />

      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 600, color: '#2d3748' }}>
          Custom Fields
        </h4>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <Input
            placeholder="Enter field name (e.g., 'Teacher', 'Room Number')"
            value={customFieldLabel}
            onChange={(e) => setCustomFieldLabel(e.target.value)}
            style={{ flex: 1, borderRadius: '6px' }}
          />
          <Button
            onClick={addCustomField}
            style={{
              backgroundColor: PRIMARY_COLOR,
              borderColor: PRIMARY_COLOR,
              color: '#fff',
              borderRadius: '6px',
            }}
          >
            Add Field
          </Button>
        </div>

        {formData.customFields && formData.customFields.length > 0 && (
          <div>
            {formData.customFields.map((field: CustomField, index: number) => (
              <div key={index} style={{ marginBottom: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ minWidth: '100px', fontSize: '14px', fontWeight: 500, color: '#64748b' }}>
                  {field.label}:
                </span>
                <Input
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  value={field.value}
                  onChange={(e) => updateCustomFieldValue(index, e.target.value)}
                  style={{ flex: 1, borderRadius: '6px' }}
                />
                <Button
                  onClick={() => removeCustomField(index)}
                  style={{
                    backgroundColor: '#fff',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Divider style={{ borderColor: '#e2e8f0' }} />

      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 600, color: '#2d3748' }}>
          Resource Links
        </h4>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <Input
            placeholder="Link name (e.g., 'Website', 'Portal')"
            value={linkLabel}
            onChange={(e) => setLinkLabel(e.target.value)}
            style={{ flex: 1, borderRadius: '6px' }}
          />
          <Input
            placeholder="URL (https://...)"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            style={{ flex: 1, borderRadius: '6px' }}
          />
          <Button
            onClick={addLink}
            style={{
              backgroundColor: PRIMARY_COLOR,
              borderColor: PRIMARY_COLOR,
              color: '#fff',
              borderRadius: '6px',
            }}
          >
            Add Link
          </Button>
        </div>

        {formData.links && formData.links.length > 0 && (
          <div>
            {formData.links.map((link: ResourceLink, index: number) => (
              <div key={index} style={{ marginBottom: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ minWidth: '100px', fontSize: '14px', fontWeight: 500, color: '#64748b' }}>
                  {link.label}:
                </span>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ flex: 1, fontSize: '14px', textDecoration: 'none', color: PRIMARY_COLOR }}
                >
                  {link.url}
                </a>
                <Button
                  onClick={() => removeLink(index)}
                  style={{
                    backgroundColor: '#fff',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderContent = (type: 'school' | 'activity', items: (School | Activity)[]) => (
    <div style={contentStyle}>
      {loading ? (
        <div style={{ padding: '1rem', textAlign: 'center' }}>
          <Text>Loading...</Text>
        </div>
      ) : items.length === 0 ? (
        <div 
          style={noDataStyle}
          onClick={() => handleEmptyTemplateClick(type)}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f0f0f0';
            e.currentTarget.style.borderColor = '#1890ff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#fafafa';
            e.currentTarget.style.borderColor = '#d9d9d9';
          }}
        >
          <div style={{ fontSize: '20px', color: '#bfbfbf', marginBottom: '4px' }}>+</div>
          <div style={{ fontSize: '14px', color: '#8c8c8c', fontWeight: 500 }}>
            Add New {type === 'school' ? 'School' : 'Activity'}
          </div>
          <div style={{ fontSize: '12px', color: '#bfbfbf', marginTop: '2px' }}>
            Click to add {type === 'school' ? 'school' : 'activity'} details
          </div>
        </div>
      ) : (
        items.map((item) => (
          <ItemCard key={item.id} item={item} type={type} />
        ))
      )}
    </div>
  );

  return (
    <Card style={sectionCardStyle} bodyStyle={{ padding: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={sectionHeaderStyle}>
        <h2 style={sectionTitleStyle}>
          <div style={sectionIconStyle}>🏫</div>
          <span>Schools & Activities</span>
        </h2>
        {handleAddItem()}
      </div>
      <Tabs
        items={[
          {
            key: 'schools',
            label: 'Schools',
            children: renderContent('school', schools),
          },
          {
            key: 'activities',
            label: 'Activities',
            children: renderContent('activity', activities),
          },
        ]}
        style={{ flex: 1, overflow: 'hidden' }}
        tabBarStyle={{ padding: '0 1.25rem' }}
      />
      <Modal
        title={`Add ${formType === 'school' ? 'School' : 'Activity'}`}
        open={addModalVisible}
        onOk={handleSave}
        onCancel={() => {
          setAddModalVisible(false);
          resetForm();
        }}
        width={600}
        okText="Save"
        cancelText="Cancel"
        okButtonProps={{ style: { backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR, borderRadius: '6px' } }}
        cancelButtonProps={{ style: { borderRadius: '6px' } }}
      >
        {renderForm()}
      </Modal>
      <Modal
        title={`Edit ${currentEditType === 'school' ? 'School' : 'Activity'}`}
        open={editModalVisible}
        onOk={handleUpdate}
        onCancel={() => {
          setEditModalVisible(false);
          resetForm();
        }}
        width={600}
        okText="Update"
        cancelText="Cancel"
        okButtonProps={{ style: { backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR, borderRadius: '6px' } }}
        cancelButtonProps={{ style: { borderRadius: '6px' } }}
      >
        {renderForm()}
      </Modal>
    </Card>
  );
};

export default DynamicSchoolActivities;