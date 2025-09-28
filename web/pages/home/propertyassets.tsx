'use client';
import React, { useState, useRef } from 'react';
import { Card, Tabs, Button, Dropdown, Menu } from 'antd';
import { PlusOutlined, DownOutlined, HomeOutlined, CarOutlined, AppstoreOutlined } from '@ant-design/icons';
import PropertyInformation from './PropertyInformation';
import VehicleDetails from './vehicledetails';
import OtherAssets from './otherassets';
import { CustomButton, PRIMARY_COLOR } from '../../app/comman';

const { TabPane } = Tabs;

interface PropertySectionProps {
  hasAdvancedFeatures?: boolean;
  uid: string;
}

const PropertySection: React.FC<PropertySectionProps> = ({ hasAdvancedFeatures = true, uid }) => {
  const [activeTab, setActiveTab] = useState('homes');
  const propertyRef = useRef<any>(null);
  const vehicleRef = useRef<any>(null);
  const otherAssetsRef = useRef<any>(null);

  const handleAddProperty = () => {
    setActiveTab('homes');
    if (propertyRef.current?.openAddModal) {
      propertyRef.current.openAddModal();
    }
  };

  const handleAddVehicle = () => {
    setActiveTab('vehicles');
    if (vehicleRef.current?.openAddModal) {
      vehicleRef.current.openAddModal();
    }
  };

  const handleAddOtherAsset = () => {
    setActiveTab('other');
    if (otherAssetsRef.current?.openAddModal) {
      otherAssetsRef.current.openAddModal();
    }
  };

  const addMenu = (
    <Menu
      style={{
        minWidth: '200px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      }}
    >
      <Menu.Item
        key="property"
        onClick={handleAddProperty}
        style={{
          padding: '12px 16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <HomeOutlined style={{ fontSize: '16px', color: '#1890ff' }} />
          <span style={{ fontWeight: 500 }}>Add Property</span>
        </div>
      </Menu.Item>
      <Menu.Item
        key="vehicle"
        onClick={handleAddVehicle}
        style={{
          padding: '12px 16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CarOutlined style={{ fontSize: '16px', color: '#1890ff' }} />
          <span style={{ fontWeight: 500 }}>Add Vehicle</span>
        </div>
      </Menu.Item>
      <Menu.Item
        key="other"
        onClick={handleAddOtherAsset}
        style={{
          padding: '12px 16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AppstoreOutlined style={{ fontSize: '16px', color: '#1890ff' }} />
          <span style={{ fontWeight: 500 }}>Add Other Asset</span>
        </div>
      </Menu.Item>
    </Menu>
  );

  return (
    <Card
      style={{
        background: '#ffffff',
        borderRadius: '0.75rem',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        overflow: 'hidden',
        height: '500px',
        display: 'flex',
        flexDirection: 'column',
      }}
      styles={{ body: { padding: 0, flex: 1, display: 'flex', flexDirection: 'column' } }}
    >
      <div style={{
        padding: '1.25rem',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(to bottom, #ffffff, #fafbfc)',
      }}>
        <h2 style={{
          fontSize: '1.125rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          margin: 0,
        }}>
          <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🏠</div>
          <span>Property & Assets</span>
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Dropdown overlay={addMenu} trigger={['click']} placement="bottomRight">
           <CustomButton
             label="Add Property" 
             onClick={handleAddProperty}// Tooltip text
          />
          </Dropdown>
        </div>
      </div>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
        tabBarStyle={{ padding: '1rem 1.25rem 0', background: '#ffffff', margin: 0 }}
      >
        <TabPane tab="Homes" key="homes" style={{ height: '100%' }}>
          <div style={{ height: 'calc(100% - 48px)', overflow: 'hidden', padding: '1.25rem 0' }}>
            <PropertyInformation ref={propertyRef} />
          </div>
        </TabPane>
        <TabPane tab="Vehicles" key="vehicles" style={{ height: '100%' }}>
          <div style={{ height: 'calc(100% - 48px)', overflow: 'hidden', padding: '1.25rem 0' }}>
            <VehicleDetails uid={uid} ref={vehicleRef} />
          </div>
        </TabPane>
        <TabPane tab="Other Assets" key="other" style={{ height: '100%' }}>
          <div style={{ height: 'calc(100% - 48px)', overflow: 'hidden', padding: '1.25rem 0' }}>
            <OtherAssets ref={otherAssetsRef} />
          </div>
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default PropertySection;