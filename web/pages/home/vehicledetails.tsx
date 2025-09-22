'use client';
import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Form, Input, Button, Select, Typography, Alert, Modal, Spin, message, Popconfirm } from 'antd';
import { PlusOutlined, CarOutlined, EditOutlined, SearchOutlined, DeleteOutlined } from '@ant-design/icons';
import { addVehicle, getVehicles, updateVehicle, deleteVehicle } from '../../services/home';
import { PRIMARY_COLOR } from '../../app/comman';
import { ChevronRight, Edit, Trash2 } from 'lucide-react';

const { Text } = Typography;
const { Option } = Select;

const SHADOW_COLOR = 'rgba(0, 0, 0, 0.12)';

interface Vehicle {
  id: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  registration_number?: string;
  insurance_provider?: string;
  insurance_id?: string;
  is_active: number;
  icon?: string;
  license_plate?: string;
  plate_state?: string;
}

interface VinDecodeResult {
  Make?: string;
  Model?: string;
  ModelYear?: string;
  BodyClass?: string;
  VehicleType?: string;
  ErrorCode?: string;
  ErrorText?: string;
}

const POPULAR_MAKES = [
  'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen',
  'Hyundai', 'Kia', 'Mazda', 'Subaru', 'Lexus', 'Acura', 'Other',
];
const INSURANCE_PROVIDERS = [
  'State Farm', 'Geico', 'Progressive', 'Allstate', 'USAA', 'Liberty Mutual', 'Farmers',
  'Nationwide', 'Travelers', 'American Family', 'Other',
];
const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA',
  'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT',
  'VA', 'WA', 'WV', 'WI', 'WY'
];

interface VehicleDetailsProps {
  uid: string;
}

const predefinedVehicles = [
  { id: 'primary', name: 'Auto 1', icon: '🚗', desc: 'Primary vehicle • Make/Model • VIN • License' },
  { id: 'secondary', name: 'Auto 2', icon: '🚙', desc: 'Secondary vehicle • Make/Model • VIN • License' },
  { id: 'additional', name: 'Add Another Vehicle', icon: '<PlusOutlined />', desc: 'Motorcycle • RV • Boat • Trailer' },
];

const VehiclePlaceholderCard: React.FC<{ predefined: typeof predefinedVehicles[0]; onAdd: () => void }> = ({ predefined, onAdd }) => {
  const [isHovered, setIsHovered] = useState(false);

  const placeholderCardStyle: React.CSSProperties = {
    background: '#f9fafb',
    borderRadius: '0.5rem',
    padding: '1.25rem',
    marginBottom: '1rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    position: 'relative',
    border: '1px dashed #d1d5db',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  };

  const placeholderIconStyle: React.CSSProperties = {
    fontSize: '2rem',
  };

  const placeholderNameStyle: React.CSSProperties = {
    fontWeight: 600,
    fontSize: '1rem',
    color: '#374151',
  };

  const placeholderDescStyle: React.CSSProperties = {
    fontSize: '0.8125rem',
    color: '#64748b',
  };

  const arrowStyle: React.CSSProperties = {
    position: 'absolute',
    right: '1rem',
    color: '#6b7280',
    opacity: isHovered ? 1 : 0,
    transition: 'opacity 0.2s',
    pointerEvents: 'none',
    fontSize: '16px',
  };

  return (
    <div
      style={placeholderCardStyle}
      onClick={onAdd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={placeholderIconStyle}>{predefined.icon}</div>
      <div>
        <div style={placeholderNameStyle}>{predefined.name}</div>
        <div style={placeholderDescStyle}>{predefined.desc}</div>
      </div>
      <div style={arrowStyle}><PlusOutlined /></div>
    </div>
  );
};

const VehicleDetails = forwardRef<any, VehicleDetailsProps>(({ uid }, ref) => {
  const [form] = Form.useForm();
  const [vehiclesData, setVehiclesData] = useState<Vehicle[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [otherMake, setOtherMake] = useState<string>('');
  const [otherInsuranceProvider, setOtherInsuranceProvider] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [vinDecoding, setVinDecoding] = useState(false);
  const [vinDecodeError, setVinDecodeError] = useState('');
  const [vinDecodeSuccess, setVinDecodeSuccess] = useState('');
  const [inputMethod, setInputMethod] = useState<'license' | 'vin'>('license');
  const [licenseState, setLicenseState] = useState<string>('');
  const [licensePlate, setLicensePlate] = useState<string>('');
  const [plateDecoding, setPlateDecoding] = useState(false);
  const [plateDecodeError, setPlateDecodeError] = useState('');
  const [plateDecodeSuccess, setPlateDecodeSuccess] = useState('');

  // Custom scrollbar styles
  const customScrollbarStyle: React.CSSProperties = {
    scrollbarWidth: 'thin',
    scrollbarColor: `${PRIMARY_COLOR}40 transparent`,
  };

  const customScrollbarWebkitStyle = `
    .vehicle-custom-scrollbar::-webkit-scrollbar {
      width: 8px;
    }
    .vehicle-custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
      border-radius: 4px;
    }
    .vehicle-custom-scrollbar::-webkit-scrollbar-thumb {
      background: ${PRIMARY_COLOR}40;
      border-radius: 4px;
      transition: background 0.3s ease;
    }
    .vehicle-custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: ${PRIMARY_COLOR}60;
    }
    .vehicle-custom-scrollbar::-webkit-scrollbar-thumb:active {
      background: ${PRIMARY_COLOR}80;
    }
  `;

  useImperativeHandle(ref, () => ({
    openAddModal: () => {
      setEditingVehicle(null);
      form.resetFields();
      setOtherMake('');
      setOtherInsuranceProvider('');
      setVinDecodeError('');
      setVinDecodeSuccess('');
      setPlateDecodeError('');
      setPlateDecodeSuccess('');
      setInputMethod('license');
      setLicenseState('');
      setLicensePlate('');
      setIsModalVisible(true);
    },
  }));

  const containerStyle: React.CSSProperties = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    padding: '0 1.25rem',
  };

  const vehicleItemStyle: React.CSSProperties = {
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

  const vehicleItemHeaderStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '0.75rem',
  };

  const vehicleItemIconStyle: React.CSSProperties = {
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

  const vehicleItemTitleStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
  };

  const vehicleItemNameStyle: React.CSSProperties = {
    fontWeight: 600,
    fontSize: '1rem',
    color: '#1a202c',
    lineHeight: '1.4',
  };

  const vehicleItemTypeStyle: React.CSSProperties = {
    fontSize: '0.875rem',
    color: '#64748b',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  };

  const vehicleItemValueStyle: React.CSSProperties = {
    fontWeight: 700,
    color: PRIMARY_COLOR,
    paddingRight: '1.5rem',
    fontSize: '1.2rem',
  };

  const vehicleItemDetailsStyle: React.CSSProperties = {
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

  const noDataStyle: React.CSSProperties = {
    border: '1px dashed #d9d9d9',
    borderRadius: '4px',
    padding: '20px',
    textAlign: 'center',
    margin: '16px 1.25rem',
    backgroundColor: '#fafafa',
    marginTop: '6rem'
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

  const handleEdit = (vehicle: Vehicle, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingVehicle(vehicle);
    form.setFieldsValue({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      vin: vehicle.vin,
      registration_number: vehicle.registration_number,
      insurance_provider: vehicle.insurance_provider,
      insurance_id: vehicle.insurance_id,
      plate_state: vehicle.plate_state,
      license_plate: vehicle.license_plate,
    });
    setOtherMake(POPULAR_MAKES.includes(vehicle.make) ? '' : vehicle.make);
    setOtherInsuranceProvider(INSURANCE_PROVIDERS.includes(vehicle.insurance_provider || '') ? '' : vehicle.insurance_provider || '');
    setInputMethod(vehicle.vin ? 'vin' : 'license');
    setLicenseState(vehicle.plate_state || '');
    setLicensePlate(vehicle.license_plate || '');
    setIsModalVisible(true);
  };

  const handleDelete = async (vehicleId: string) => {
    setIsDeleting(vehicleId);
    try {
      const response = await deleteVehicle(vehicleId);
      if (response.status === 1) {
        message.success('Vehicle deleted successfully!');
        const fetchResponse = await getVehicles({ is_active: 1 });
        if (fetchResponse.status === 1) {
          setVehiclesData(fetchResponse.payload.vehicles);
        }
      } else {
        message.error(response.message || 'Failed to delete vehicle');
        setErrorMessage(response.message || 'Failed to delete vehicle');
      }
    } catch (error: any) {
      message.error(error.message || 'Failed to delete vehicle');
      setErrorMessage(error.message || 'Failed to delete vehicle');
    } finally {
      setIsDeleting(null);
    }
  };

  // VIN Decoding Function
  const decodeVin = async (vin: string) => {
    if (!vin || vin.length !== 17) {
      setVinDecodeError('VIN must be exactly 17 characters');
      return;
    }

    setVinDecoding(true);
    setVinDecodeError('');
    setVinDecodeSuccess('');

    try {
      const response = await fetch(
        `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValuesExtended/${vin}?format=json`
      );

      if (!response.ok) {
        throw new Error('Failed to decode VIN');
      }

      const data = await response.json();

      if (data.Results && data.Results.length > 0) {
        const result: VinDecodeResult = data.Results[0];

        if (result.ErrorCode === '0' || !result.ErrorCode) {
          const make = result.Make || '';
          const model = result.Model || '';
          const year = result.ModelYear ? parseInt(result.ModelYear) : '';

          if (make && model && year) {
            const makeValue = POPULAR_MAKES.includes(make) ? make : 'Other';

            form.setFieldsValue({
              make: makeValue,
              model: model,
              year: year,
            });

            if (makeValue === 'Other') {
              setOtherMake(make);
            } else {
              setOtherMake('');
            }

            setVinDecodeSuccess('VIN decoded successfully! Vehicle details have been filled automatically.');
            message.success('VIN decoded successfully!');
          } else {
            setVinDecodeError('VIN decoded but some vehicle details are missing');
          }
        } else {
          setVinDecodeError(result.ErrorText || 'Invalid VIN');
        }
      } else {
        setVinDecodeError('No results found for this VIN');
      }
    } catch (error: any) {
      setVinDecodeError('Failed to decode VIN: ' + error.message);
    } finally {
      setVinDecoding(false);
    }
  };

  const handleVinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vin = e.target.value.toUpperCase();
    form.setFieldsValue({ vin });
    if (vin.length === 17) {
      decodeVin(vin);
    }
  };

  // License Plate Lookup (placeholder - implement with actual API)
  const lookupLicensePlate = async (state: string, plate: string) => {
    setPlateDecoding(true);
    setPlateDecodeError('');
    setPlateDecodeSuccess('');

    try {
      // Placeholder implementation - replace with actual license plate lookup API
      // For demo, we'll simulate a response
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate success or failure
      if (Math.random() > 0.3) {
        setPlateDecodeSuccess('License plate lookup successful! Vehicle details estimated.');
        // Simulate filling some fields
        form.setFieldsValue({
          make: 'Toyota',
          model: 'Camry',
          year: 2020,
        });
        message.success('License plate looked up successfully!');
      } else {
        setPlateDecodeError('No vehicle found for this license plate. Please enter details manually.');
      }
    } catch (error: any) {
      setPlateDecodeError('License plate lookup failed: ' + error.message);
    } finally {
      setPlateDecoding(false);
    }
  };

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const response = await getVehicles({ is_active: 1 });
        if (response.status === 1) {
          setVehiclesData(response.payload.vehicles || []);
        } else {
          setErrorMessage(response.message || 'Failed to fetch vehicles');
        }
      } catch (error: any) {
        console.error('Error fetching vehicles:', error);
        setErrorMessage('An error occurred while fetching vehicles');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  const closeModal = () => {
    setIsModalVisible(false);
    setEditingVehicle(null);
    form.resetFields();
    setOtherMake('');
    setOtherInsuranceProvider('');
    setVinDecodeError('');
    setVinDecodeSuccess('');
    setPlateDecodeError('');
    setPlateDecodeSuccess('');
    setInputMethod('license');
    setLicenseState('');
    setLicensePlate('');
    setErrorMessage('');
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    setErrorMessage('');

    try {
      const make = values.make === 'Other' ? otherMake : values.make;
      const insuranceProvider = values.insurance_provider === 'Other' ? otherInsuranceProvider : values.insurance_provider;

      const payload = {
        make,
        model: values.model,
        year: values.year,
        vin: values.vin || undefined,
        registration_number: values.registration_number || undefined,
        insurance_provider: insuranceProvider || undefined,
        insurance_id: values.insurance_id || undefined,
        plate_state: values.plate_state || undefined,
        license_plate: values.license_plate || undefined,
        is_active: 1,
      };

      let response;
      if (editingVehicle) {
        response = await updateVehicle(editingVehicle.id, payload);
      } else {
        response = await addVehicle(payload);
      }

      if (response.status === 1) {
        message.success(editingVehicle ? 'Vehicle updated successfully!' : 'Vehicle added successfully!');
        closeModal();
        const fetchResponse = await getVehicles({ is_active: 1 });
        if (fetchResponse.status === 1) {
          setVehiclesData(fetchResponse.payload.vehicles || []);
        }
      } else {
        setErrorMessage(response.message || 'Failed to save vehicle');
      }
    } catch (error: any) {
      console.error('Error saving vehicle:', error);
      setErrorMessage(error.message || 'An error occurred while saving the vehicle');
    } finally {
      setLoading(false);
    }
  };

  const VehicleItem: React.FC<{ vehicle: Vehicle }> = ({ vehicle }) => {
    const isExpanded = expandedItems.has(vehicle.id);
    const [isHovered, setIsHovered] = useState(false);

    return (
      <div
        style={vehicleItemStyle}
        onClick={() => toggleExpanded(vehicle.id)}
        onMouseEnter={(e) => {
          handleItemHover(e);
          setIsHovered(true);
        }}
        onMouseLeave={(e) => {
          handleItemLeave(e);
          setIsHovered(false);
        }}
      >
        <div style={vehicleItemHeaderStyle}>
          <div style={vehicleItemIconStyle}>
            {vehicle.icon
              ? vehicle.icon
              : React.createElement(CarOutlined)}
          </div>
          <div style={vehicleItemTitleStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={vehicleItemNameStyle}>
                {vehicle.make} {vehicle.model} ({vehicle.year})
              </div>
              <div style={vehicleItemTypeStyle}>
                VIN: {vehicle.vin?.slice(-6) || 'N/A'}
                {vehicle.license_plate && (
                  <>
                    {' • '}
                    Plate: {vehicle.license_plate} ({vehicle.plate_state})
                  </>
                )}
              </div>
            </div>
          </div>
          <div style={vehicleItemValueStyle}>
            {vehicle.insurance_provider || 'No Insurance'}
          </div>
        </div>

        {isExpanded && (
          <div style={vehicleItemDetailsStyle}>
            <div style={detailItemStyle}>
              <div style={detailLabelStyle}>VIN</div>
              <div style={detailValueStyle}>{vehicle.vin}</div>
            </div>
            <div style={detailItemStyle}>
              <div style={detailLabelStyle}>Registration</div>
              <div style={detailValueStyle}>{vehicle.registration_number || 'N/A'}</div>
            </div>
            <div style={detailItemStyle}>
              <div style={detailLabelStyle}>Insurance Provider</div>
              <div style={detailValueStyle}>{vehicle.insurance_provider || 'N/A'}</div>
            </div>
            <div style={detailItemStyle}>
              <div style={detailLabelStyle}>Insurance ID</div>
              <div style={detailValueStyle}>{vehicle.insurance_id || 'N/A'}</div>
            </div>
            {vehicle.license_plate && (
              <div style={detailItemStyle}>
                <div style={detailLabelStyle}>License Plate</div>
                <div style={detailValueStyle}>
                  {vehicle.license_plate} - {vehicle.plate_state}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={(e) => handleEdit(vehicle, e)}
                style={{ borderRadius: '6px' }}
              >
                Edit
              </Button>
              <Popconfirm
                title="Are you sure to delete this vehicle?"
                onConfirm={() => handleDelete(vehicle.id)}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  type="primary"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={(e) => e.stopPropagation()}
                  style={{ borderRadius: '6px' }}
                  loading={isDeleting === vehicle.id}
                >
                  Delete
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

  return (
    <>
      <style>{customScrollbarWebkitStyle}</style>
      <div style={containerStyle} className="vehicle-custom-scrollbar">
        {loading ? (
          <div style={{ padding: '1rem', textAlign: 'center' }}>
            <Spin size="large" />
            <Text style={{ marginTop: '16px' }}>Loading vehicles...</Text>
          </div>
        ) : vehiclesData.length === 0 ? (
          <div style={{ padding: '1.5rem', maxHeight: '340px', overflowY: 'auto', flex: 1 }}>
            {predefinedVehicles.map((pre) => (
              <VehiclePlaceholderCard key={pre.id} predefined={pre} onAdd={() => {
                if (typeof ref !== 'function' && ref && 'current' in ref && ref.current) {
                  ref.current.openAddModal();
                }
              }} />
            ))}
          </div>
        ) : (
          <div style={{ padding: '1.5rem', maxHeight: '340px', overflowY: 'auto', flex: 1 }}>
            {vehiclesData.slice(0, 2).map((vehicle, index) => (
              <VehicleItem key={vehicle.id} vehicle={vehicle} />
            ))}
            {vehiclesData.length < 2 && (
              <VehiclePlaceholderCard
                predefined={predefinedVehicles[vehiclesData.length]}
                onAdd={() => {
                  if (typeof ref !== 'function' && ref && 'current' in ref && ref.current) {
                    ref.current.openAddModal();
                  }
                }}
              />
            )}
            {vehiclesData.length >= 2 && (
              <VehiclePlaceholderCard
                predefined={predefinedVehicles[2]}
                onAdd={() => {
                  if (typeof ref !== 'function' && ref && 'current' in ref && ref.current) {
                    ref.current.openAddModal();
                  }
                }}
              />
            )}
            {vehiclesData.length > 2 && vehiclesData.slice(2).map((vehicle) => (
              <VehicleItem key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        )}
      </div>

      <Modal
        title={editingVehicle ? `Edit ${editingVehicle.make} ${editingVehicle.model}` : 'Add Vehicle'}
        open={isModalVisible}
        onCancel={closeModal}
        footer={null}
        width={800}
        style={{ padding: '1rem' }}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Form.Item
            label="Input Method"
            name="inputMethod"
            initialValue={inputMethod}
          >
            <Select size="large" onChange={(value) => setInputMethod(value as 'license' | 'vin')}>
              <Option value="license">License Plate</Option>
              <Option value="vin">VIN</Option>
            </Select>
          </Form.Item>

          {inputMethod === 'license' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
              <Form.Item
                label="State"
                name="plate_state"
                rules={[{ required: true, message: 'Please select a state!' }]}
              >
                <Select
                  size="large"
                  placeholder="Select state"
                  onChange={(value) => setLicenseState(value)}
                  showSearch
                >
                  {US_STATES.map((state) => (
                    <Option key={state} value={state}>
                      {state}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>License Plate</span>
                    {plateDecoding && <Spin size="small" />}
                  </div>
                }
                name="license_plate"
                rules={[{ required: true, message: 'Please enter license plate!' }]}
              >
                <Input
                  size="large"
                  placeholder="Enter license plate"
                  onChange={(e) => setLicensePlate(e.target.value)}
                  style={{
                    textTransform: 'uppercase',
                    fontFamily: 'monospace',
                    letterSpacing: '0.5px',
                  }}
                />
              </Form.Item>
            </div>
          )}

          {inputMethod === 'vin' && (
            <div>
              <Form.Item
                label={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>VIN</span>
                    {vinDecoding && <Spin size="small" />}
                  </div>
                }
                name="vin"
                rules={[
                  { required: true, message: 'Please enter VIN!' },
                  { len: 17, message: 'VIN must be exactly 17 characters!' },
                ]}
              >
                <Input
                  size="large"
                  placeholder="Enter 17-character VIN (auto-decodes on input)"
                  onChange={handleVinChange}
                  maxLength={17}
                  style={{
                    textTransform: 'uppercase',
                    fontFamily: 'monospace',
                    letterSpacing: '0.5px',
                  }}
                  suffix={
                    vinDecoding ? (
                      <Spin size="small" />
                    ) : form.getFieldValue('vin')?.length === 17 ? (
                      <SearchOutlined style={{ color: PRIMARY_COLOR }} />
                    ) : null
                  }
                />
              </Form.Item>
              <Button
                type="dashed"
                icon={<SearchOutlined />}
                onClick={() => {
                  const vin = form.getFieldValue('vin');
                  if (vin) {
                    decodeVin(vin);
                  }
                }}
                loading={vinDecoding}
                disabled={!form.getFieldValue('vin') || form.getFieldValue('vin').length !== 17}
                style={{
                  marginBottom: '16px',
                  borderColor: PRIMARY_COLOR,
                  color: PRIMARY_COLOR,
                }}
              >
                {vinDecoding ? 'Decoding VIN...' : 'Decode VIN Manually'}
              </Button>
            </div>
          )}

          {inputMethod === 'license' && plateDecodeSuccess && (
            <Alert
              message="License Plate Lookup Successful"
              description={plateDecodeSuccess}
              type="success"
              showIcon
              style={{ marginBottom: '16px' }}
            />
          )}
          {inputMethod === 'license' && plateDecodeError && (
            <Alert
              message="License Plate Lookup Error"
              description={plateDecodeError}
              type="error"
              showIcon
              style={{ marginBottom: '16px' }}
            />
          )}
          {inputMethod === 'vin' && vinDecodeSuccess && (
            <Alert
              message="VIN Decoded Successfully"
              description={vinDecodeSuccess}
              type="success"
              showIcon
              style={{ marginBottom: '16px' }}
            />
          )}
          {inputMethod === 'vin' && vinDecodeError && (
            <Alert
              message="VIN Decode Error"
              description={vinDecodeError}
              type="error"
              showIcon
              style={{ marginBottom: '16px' }}
            />
          )}
          {inputMethod === 'license' && (
            <Button
              type="dashed"
              icon={<SearchOutlined />}
              onClick={() => licenseState && licensePlate && lookupLicensePlate(licenseState, licensePlate)}
              disabled={!licenseState || !licensePlate}
              style={{
                marginBottom: '16px',
                borderColor: PRIMARY_COLOR,
                color: PRIMARY_COLOR,
              }}
            >
              {plateDecoding ? 'Looking up...' : 'Lookup License Plate'}
            </Button>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <Form.Item label="Make" name="make" rules={[{ required: true, message: 'Please select make!' }]}>
              <Select
                size="large"
                placeholder="Select make"
                onChange={(value) => setOtherMake(value === 'Other' ? '' : value)}
                showSearch
              >
                {POPULAR_MAKES.map((make) => (
                  <Option key={make} value={make}>
                    {make}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {form.getFieldValue('make') === 'Other' && (
              <Form.Item
                label="Custom Make"
                rules={[{ required: true, message: 'Please enter custom make!' }]}
              >
                <Input
                  size="large"
                  placeholder="Enter custom make"
                  value={otherMake}
                  onChange={(e) => setOtherMake(e.target.value)}
                />
              </Form.Item>
            )}

            <Form.Item label="Model" name="model" rules={[{ required: true, message: 'Please enter model!' }]}>
              <Input size="large" placeholder="Enter model" />
            </Form.Item>

            <Form.Item label="Year" name="year" rules={[{ required: true, message: 'Please select year!' }]}>
              <Select size="large" placeholder="Select year" showSearch allowClear>
                {Array.from({ length: new Date().getFullYear() + 1 - 1900 }, (_, i) => 1900 + i)
                  .reverse()
                  .map((year) => (
                    <Option key={year} value={year}>
                      {year}
                    </Option>
                  ))}
              </Select>
            </Form.Item>

            <Form.Item label="Registration Number" name="registration_number">
              <Input size="large" placeholder="Enter registration number" />
            </Form.Item>

            <Form.Item label="Insurance Provider" name="insurance_provider">
              <Select
                size="large"
                placeholder="Select insurance provider"
                onChange={(value) => setOtherInsuranceProvider(value === 'Other' ? '' : value)}
                showSearch
                allowClear
              >
                {INSURANCE_PROVIDERS.map((provider) => (
                  <Option key={provider} value={provider}>
                    {provider}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {form.getFieldValue('insurance_provider') === 'Other' && (
              <Form.Item
                label="Custom Insurance Provider"
                rules={[{ required: true, message: 'Please enter custom insurance provider!' }]}
              >
                <Input
                  size="large"
                  placeholder="Enter custom insurance provider"
                  value={otherInsuranceProvider}
                  onChange={(e) => setOtherInsuranceProvider(e.target.value)}
                />
              </Form.Item>
            )}

            <Form.Item label="Insurance ID" name="insurance_id">
              <Input size="large" placeholder="Enter insurance ID" />
            </Form.Item>
          </div>

          {errorMessage && (
            <Alert
              message="Error"
              description={errorMessage}
              type="error"
              showIcon
              closable
              onClose={() => setErrorMessage('')}
              style={{ marginBottom: '16px' }}
            />
          )}

          <Form.Item>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <Button
                size="large"
                onClick={closeModal}
                style={{
                  borderRadius: '8px',
                  height: '50px',
                  paddingLeft: '24px',
                  paddingRight: '24px',
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
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 600,
                  background: PRIMARY_COLOR,
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)',
                  height: '50px',
                  paddingLeft: '24px',
                  paddingRight: '24px',
                }}
              >
                {loading ? 'Saving Vehicle...' : editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
});

VehicleDetails.displayName = 'VehicleDetails';
export default VehicleDetails;