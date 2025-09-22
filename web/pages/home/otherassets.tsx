
'use client';
import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { App, Form, Input, Button, Typography, Modal, message, Select, Spin, Popconfirm } from 'antd';
import { Plus, Edit, Trash2, ChevronRight } from 'lucide-react';
import { addOtherAsset, getOtherAssets, updateOtherAsset, deleteOtherAsset, OtherAsset } from '../../services/home';
import { PRIMARY_COLOR } from '../../app/comman';

const { Text } = Typography;

const SHADOW_COLOR = 'rgba(0, 0, 0, 0.12)';

const OtherAssets = forwardRef((props, ref) => {
  const { modal } = App.useApp();
  const [form] = Form.useForm();
  const [assets, setAssets] = useState<OtherAsset[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAsset, setEditingAsset] = useState<OtherAsset | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching assets with is_active: 1...');
      const response = await getOtherAssets({ is_active: 1 });
      if (response.status === 1) {
        setAssets(response.payload.assets);
        console.log('Assets fetched successfully:', response.payload.assets);
      } else {
        setErrorMessage(response.message || 'Failed to fetch assets');
        console.error('Failed to fetch assets:', response.message);
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to fetch assets');
      console.error('Error fetching assets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      let response;
      // Split the combined type_icon value into icon and type
      const [icon, type] = values.type_icon ? values.type_icon.split('|') : ['📦', ''];
      if (editingAsset) {
        response = await updateOtherAsset(editingAsset.id, {
          name: values.name,
          type: type,
          value: values.value,
          payment: values.payment,
          icon: icon,
        });
        if (response.status === 1) {
          message.success('Asset updated successfully!');
        }
      } else {
        response = await addOtherAsset({
          name: values.name,
          type: type,
          value: values.value,
          payment: values.payment,
          icon: icon,
          is_active: 1,
        });
        if (response.status === 1) {
          message.success('Asset added successfully!');
        }
      }
      if (response.status === 1) {
        setIsModalVisible(false);
        form.resetFields();
        setEditingAsset(null);
        fetchAssets();
      } else {
        message.error(response.message || 'Failed to save asset');
        setErrorMessage(response.message || 'Failed to save asset');
      }
    } catch (error: any) {
      console.error('Error saving asset:', error);
      message.error(error.message || 'Failed to save asset');
      setErrorMessage(error.message || 'Failed to save asset');
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      const response = await deleteOtherAsset(id);
      console.log('Delete response:', response);
      if (response.status === 1) {
        message.success('Asset deleted successfully!');
        await fetchAssets();
      } else {
        message.error(response.message || 'Failed to delete asset');
        setErrorMessage(response.message || 'Failed to delete asset');
      }
    } catch (error: any) {
      console.error('Error deleting asset:', error);
      message.error(error.message || 'Failed to delete asset');
      setErrorMessage(error.message || 'Failed to delete asset');
    } finally {
      setIsDeleting(null);
    }
  };

  const customScrollbarStyle: React.CSSProperties = {
    scrollbarWidth: 'thin',
    scrollbarColor: `${PRIMARY_COLOR}40 transparent`,
  };

  const customScrollbarWebkitStyle = `
    .assets-custom-scrollbar::-webkit-scrollbar {
      width: 8px;
    }
    .assets-custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
      borderRadius: 4px;
    }
    .assets-custom-scrollbar::-webkit-scrollbar-thumb {
      background: ${PRIMARY_COLOR}40;
      borderRadius: 4px;
      transition: background 0.3s ease;
    }
    .assets-custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: ${PRIMARY_COLOR}60;
    }
    .assets-custom-scrollbar::-webkit-scrollbar-thumb:active {
      background: ${PRIMARY_COLOR}80;
    }
  `;

  useImperativeHandle(ref, () => ({
    openAddModal: () => {
      setEditingAsset(null);
      form.resetFields();
      setIsModalVisible(true);
      console.log('Opening add asset modal');
    },
  }));

  const assetItemStyle: React.CSSProperties = {
    background: '#ffffff',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1rem',
    border: '1px solid #e2e8f0',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    position: 'relative',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
  };

  const assetItemHeaderStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '0.75rem',
  };

  const assetItemIconStyle: React.CSSProperties = {
    width: '56px',
    height: '56px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    flexShrink: 0,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
  };

  const assetItemTitleStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
  };

  const assetItemNameStyle: React.CSSProperties = {
    fontWeight: 600,
    fontSize: '1rem',
    marginBottom: '0.25rem',
    color: '#1a202c',
    lineHeight: '1.4',
  };

  const assetItemTypeStyle: React.CSSProperties = {
    fontSize: '0.875rem',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  };

  const assetItemValueStyle: React.CSSProperties = {
    fontWeight: 700,
    color: PRIMARY_COLOR,
    paddingRight: '1.5rem',
    fontSize: '1.2rem',
  };

  const assetItemDetailsStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginTop: '1.5rem',
    paddingTop: '1.5rem',
    borderTop: '1px solid #e2e8f0',
  };

  const detailItemStyle: React.CSSProperties = {
    fontSize: '0.875rem',
  };

  const detailLabelStyle: React.CSSProperties = {
    color: '#64748b',
    marginBottom: '0.5rem',
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const detailValueStyle: React.CSSProperties = {
    fontWeight: 500,
    color: '#1a202c',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  };

  const handleItemHover = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.12)';
    e.currentTarget.style.transform = 'translateY(-2px)';
  };

  const handleItemLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)';
    e.currentTarget.style.transform = 'translateY(0)';
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const handleEdit = (asset: OtherAsset, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAsset(asset);
    form.setFieldsValue({
      name: asset.name,
      type_icon: `${asset.icon}|${asset.type}`,
      value: asset.value,
      payment: asset.payment,
    });
    setIsModalVisible(true);
    console.log('Editing asset:', asset);
  };

  return (
    <div style={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <style>{customScrollbarWebkitStyle}</style>
      <Spin spinning={isLoading}>
        {assets.length === 0 ? (
          <div
            style={{
              border: '1px dashed #d9d9d9',
              borderRadius: '4px',
              padding: '20px',
              textAlign: 'center',
              margin: '16px 1.25rem',
              backgroundColor: '#fafafa',
              marginTop: '6rem',
              cursor: 'pointer',
            }}
            onClick={() => {
              setEditingAsset(null);
              form.resetFields();
              setIsModalVisible(true);
              console.log('Opening add asset modal');
            }}
          >
            <div style={{ fontSize: '24px', color: '#bfbfbf' }}>+</div>
            <div style={{ marginTop: '8px', color: '#8c8c8c' }}>Add New Asset</div>
            <div style={{ color: '#bfbfbf' }}>Asset description...</div>
          </div>
        ) : (
          <div
            className="assets-custom-scrollbar"
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '0 1.25rem',
              maxHeight: '350px',
              paddingRight: '1.75rem',
              ...customScrollbarStyle,
            }}
          >
            {assets.map((asset) => (
              <div
                key={asset.id}
                style={assetItemStyle}
                onClick={() => toggleExpanded(asset.id)}
                onMouseEnter={handleItemHover}
                onMouseLeave={handleItemLeave}
              >
                <div style={assetItemHeaderStyle}>
                  <div style={assetItemIconStyle}>{asset.icon}</div>
                  <div style={assetItemTitleStyle}>
                    <div style={assetItemNameStyle}>{asset.name}</div>
                    <div style={assetItemTypeStyle}>
                      {asset.icon}
                      {asset.type}
                    </div>
                  </div>
                  <div style={assetItemValueStyle}>{asset.payment}</div>
                </div>
                {expandedItems.has(asset.id) && (
                  <div style={assetItemDetailsStyle}>
                    <div style={detailItemStyle}>
                      <div style={detailLabelStyle}>Type</div>
                      <div style={detailValueStyle}>
                        {asset.icon}
                        {asset.type}
                      </div>
                    </div>
                    <div style={detailItemStyle}>
                      <div style={detailLabelStyle}>Value</div>
                      <div style={detailValueStyle}>${asset.value.toLocaleString()}</div>
                    </div>
                    <div style={detailItemStyle}>
                      <div style={detailLabelStyle}>Payment</div>
                      <div style={detailValueStyle}>{asset.payment}</div>
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: '12px',
                      marginTop: '1rem',
                      gridColumn: '1 / -1',
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                    }}>
                      <button
                        onClick={(e) => handleEdit(asset, e)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 16px',
                          backgroundColor: PRIMARY_COLOR,
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          transition: 'all 0.2s ease',
                          boxShadow: '0 2px 4px rgba(24, 144, 255, 0.2)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = PRIMARY_COLOR;
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 4px 8px rgba(24, 144, 255, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = PRIMARY_COLOR;
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 4px rgba(24, 144, 255, 0.2)';
                        }}
                      >
                        <Edit size={16} />
                      </button>
                      <Popconfirm
                        title="Are you sure to delete this asset?"
                        onConfirm={() => handleDelete(asset.id)}
                        onCancel={(e) => { if (e) e.stopPropagation(); }}
                        okText="Yes"
                        cancelText="No"
                      >
                        <button
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 16px',
                            backgroundColor: '#ff4d4f',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: isDeleting === asset.id ? 'not-allowed' : 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 4px rgba(255, 77, 79, 0.2)',
                            opacity: isDeleting === asset.id ? 0.7 : 1,
                          }}
                          onMouseEnter={(e) => {
                            if (isDeleting !== asset.id) {
                              e.currentTarget.style.backgroundColor = '#d9363e';
                              e.currentTarget.style.transform = 'translateY(-1px)';
                              e.currentTarget.style.boxShadow = '0 4px 8px rgba(255, 77, 79, 0.3)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (isDeleting !== asset.id) {
                              e.currentTarget.style.backgroundColor = '#ff4d4f';
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 2px 4px rgba(255, 77, 79, 0.2)';
                            }
                          }}
                        >
                          <Trash2 size={16} />
                          {isDeleting === asset.id ? 'Deleting...' : ''}
                        </button>
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
                    transition: 'transform 0.2s ease',
                    pointerEvents: 'none',
                    fontSize: '16px',
                  }}
                >
                  <ChevronRight 
                    size={20} 
                    style={{
                      transform: expandedItems.has(asset.id) ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Spin>
      {errorMessage && (
        <div style={{
          marginTop: '16px',
          padding: '12px 16px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          color: '#dc2626',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage('')}
            style={{
              background: 'none',
              border: 'none',
              color: '#dc2626',
              cursor: 'pointer',
              fontSize: '18px',
              padding: '0 4px',
            }}
          >
            ×
          </button>
        </div>
      )}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
            <Text style={{ fontSize: '16px', fontWeight: 600, color: PRIMARY_COLOR }}>
              {editingAsset ? 'Edit Asset' : 'Add Asset'}
            </Text>
          </div>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setEditingAsset(null);
          console.log('Modal closed');
        }}
        footer={null}
        width={800}
        style={{ top: 20 }}
        bodyStyle={{ maxHeight: '80vh', overflowY: 'auto' }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ padding: '20px 0' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <Form.Item
              label="Name"
              name="name"
              rules={[{ required: true, message: 'Please enter asset name!' }]}
            >
              <Input size="large" placeholder="Enter asset name" />
            </Form.Item>
            <Form.Item
              label="Asset Type"
              name="type_icon"
              rules={[{ required: true, message: 'Please select asset type!' }]}
            >
              <Select size="large" placeholder="Select asset type">
                <Select.Option value="📦|Public Storage • 10x20">📦 Public Storage • 10x20</Select.Option>
                <Select.Option value="🛠|Riding Mower • 2021">🛠 Riding Mower • 2021</Select.Option>
                <Select.Option value="🚤|Professional Grade • Garage Workshop">🚤 Professional Grade • Garage Workshop</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="Value"
              name="value"
              rules={[{ required: true, message: 'Please enter asset value!' }]}
            >
              <Input size="large" placeholder="Enter value" prefix="$" type="number" />
            </Form.Item>
            <Form.Item
              label="Payment"
              name="payment"
              rules={[{ required: true, message: 'Please enter payment details!' }]}
            >
              <Input size="large" placeholder="Enter payment details (e.g., $135/mo)" />
            </Form.Item>
          </div>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              style={{
                width: '100%',
                height: '50px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                border: 'none',
                boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)',
              }}
            >
              {editingAsset ? 'Update Asset' : 'Add Asset'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
});

OtherAssets.displayName = 'OtherAssets';

export default OtherAssets;