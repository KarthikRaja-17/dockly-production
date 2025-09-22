// 'use client';
// import React, { useEffect, useState } from 'react';
// import { Card, Button, Typography, Row, Col, Modal, Steps } from 'antd';
// import {
//   ArrowRightOutlined,
//   HomeOutlined,
//   BulbOutlined,
//   ToolOutlined,
//   TeamOutlined,
// } from '@ant-design/icons';
// import 'antd/dist/reset.css';
// import { useRouter } from 'next/navigation';

// const { Title, Paragraph } = Typography;
// const { Step } = Steps;

// const HomeIntroBoard: React.FC = () => {
//   const [isHomeUser, setIsHomeUser] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const router = useRouter();
//   const [step, setStep] = useState(1);
//   const [username, setUsername] = useState<string | null>(null);

//   useEffect(() => {
//     const storedUsername = localStorage.getItem('username');
//     if (storedUsername) {
//       setUsername(storedUsername);
//     }
//   }, []);

//   const handleGetStarted = async () => {
//     setLoading(true);
//     try {
//       setTimeout(() => {
//         setIsHomeUser(true);
//         setLoading(false);
//       }, 1000);
//     } catch (error) {
//       console.error('Error setting up home board:', error);
//       setLoading(false);
//     }
//   };

//   const showModal = () => {
//     setIsModalVisible(true);
//   };

//   const handleCancel = () => {
//     setIsModalVisible(false);
//   };

//   const handleLaunchSetup = () => {
//     setIsHomeUser(true);
//     setIsModalVisible(false);
//     setStep(1); // Start at step 1 of the setup process
//   };

//   const nextStep = () => {
//     setStep((prev) => Math.min(prev + 1, 3));
//   };

//   const prevStep = () => {
//     setStep((prev) => Math.max(prev - 1, 1));
//   };

//   const completeSetup = () => {
//     localStorage.setItem('home-hub', '1');
//     router.push(`/${username}/home-hub`);
//   };

//   return (
//     <Card style={{ padding: '0px 24px' }} loading={loading}>
//       {!isHomeUser ? (
//         <div
//           style={{
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             flexDirection: 'column',
//           }}
//         >
//           <div
//             style={{
//               display: 'flex',
//               justifyContent: 'space-between',
//               alignItems: 'center',
//               width: '100%',
//               padding: '-20px 0',
//             }}
//           />

//           <Row
//             gutter={24}
//             style={{
//               marginTop: '20px',
//               alignItems: 'center',
//               justifyContent: 'center',
//             }}
//           >
//             <Col xs={24} md={12}>
//               <img
//                 src="/manager/home.jpg"
//                 alt="Home Illustration"
//                 style={{
//                   width: '100%',
//                   maxWidth: '100%',
//                   borderRadius: 12,
//                   objectFit: 'cover',
//                 }}
//                 onError={(e) => {
//                   e.currentTarget.style.display = 'none';
//                   e.currentTarget.parentElement!.innerHTML = `
//                     <div style="
//                       width: 100%;
//                       height: 400px;
//                       background: #e8ecef;
//                       border-radius: 12px;
//                       display: flex;
//                       align-items: center;
//                       justify-content: center;
//                       color: #666;
//                       font-size: 16px;
//                     ">
//                       [Home Illustration Placeholder]
//                     </div>
//                   `;
//                 }}
//               />
//             </Col>
//             <Col xs={24} md={12}>
//               <div
//                 style={{
//                   display: 'flex',
//                   flexDirection: 'column',
//                   alignItems: 'start',
//                   justifyContent: 'center',
//                   padding: '0 -20px',
//                 }}
//               >
//                 <Title level={1}>Welcome to Your Home Board</Title>
//                 <Paragraph style={{ maxWidth: 800, fontSize: 18 }}>
//                   Your central dashboard for managing all aspects of your home  from mortgage and property details to utilities, maintenance, and household documents.
//                 </Paragraph>
//               </div>
//               <div
//                 style={{
//                   display: 'flex',
//                   alignItems: 'center',
//                   marginLeft: 20,
//                 }}
//               >
//                 <Button
//                   type="primary"
//                   size="large"
//                   style={{
//                     borderRadius: 10,
//                     background: '#0052cc',
//                     marginTop: 20,
//                     padding: '10px 20px',
//                   }}
//                   onClick={showModal}
//                 >
//                   Get Started
//                   <ArrowRightOutlined />
//                 </Button>
//               </div>
//             </Col>
//           </Row>

//           <Row gutter={[24, 24]} style={{ marginTop: 30 }}>
//             <Col xs={24} sm={12}>
//               <HomeInfoCard
//                 icon={<HomeOutlined />}
//                 title="Property Details"
//                 description="Connect to Zillow, Redfin, or input your property details manually to track value, mortgage info, and important documents."
//               />
//             </Col>

//             <Col xs={24} sm={12}>
//               <HomeInfoCard
//                 icon={<BulbOutlined />}
//                 title="Utilities & Services"
//                 description="Track all your home utilities and services in one place - electricity, water, internet, streaming services, and more."
//               />
//             </Col>

//             <Col xs={24} sm={12}>
//               <HomeInfoCard
//                 icon={<ToolOutlined />}
//                 title="Maintenance Tracker"
//                 description="Schedule and track regular home maintenance tasks with reminders for HVAC, appliances, garden, and seasonal upkeep."
//               />
//             </Col>

//             <Col xs={24} sm={12}>
//               <HomeInfoCard
//                 icon={<TeamOutlined />}
//                 title="Family Coordination"
//                 description="Share home information with family members and coordinate responsibilities for a well-maintained household."
//               />
//             </Col>
//           </Row>

//           <div
//             style={{
//               backgroundColor: '#e6f7ff',
//               padding: '20px',
//               borderRadius: 8,
//               marginTop: 30,
//               width: 1350,
//               textAlign: 'left',
//             }}
//           >
//             <Title level={3} style={{ color: '#1890ff' }}>
//               How does it work?
//             </Title>
//             <Paragraph style={{ fontSize: 18 }}>
//               To set up your Home Board, we'll help you connect your property information and home services. This allows you to:
//             </Paragraph>
//             <ul style={{ fontSize: 16, marginLeft: 20 }}>
//               <li>Import your property details from Zillow or other real estate platforms</li>
//               <li>Connect your utility accounts to monitor bills and usage in one place</li>
//               <li>Set up maintenance schedules with automatic reminders</li>
//               <li>Store important home documents securely for easy access</li>
//             </ul>
//             <Paragraph style={{ fontSize: 16 }}>
//               You'll be able to connect multiple services including your mortgage provider, utility companies, home insurance, and property tax information.
//             </Paragraph>
//           </div>

//           <div style={{ textAlign: 'center', padding: '20px', marginTop: '30px' }}>
//             <Button
//               type="primary"
//               size="large"
//               onClick={showModal}
//               style={{
//                 background: '#0052cc',
//                 borderColor: '#0052cc',
//                 borderRadius: '4px',
//                 fontSize: '16px',
//                 height: '40px',
//                 width: '100%',
//                 maxWidth: '300px',
//               }}
//             >
//               Set Up Your Home Board
//             </Button>
//           </div>
//         </div>
//       ) : (
//         <div
//           style={{
//             padding: '24px',
//             minHeight: '450px',
//           }}
//         >
//           <Steps current={step - 1} style={{ marginBottom: '24px' }}>
//             <Step title="Property Details" />
//             <Step title="Utilities & Services" />
//             <Step title="Maintenance & Family" />
//           </Steps>
//           {step === 1 && (
//             <div>
//               <Title level={2}>Step 1: Property Details</Title>
//               <Paragraph>
//                 Connect your property details by linking to Zillow, Redfin, or manually input your information. This step helps track value, mortgage, and documents.
//               </Paragraph>
//               <Button
//                 type="primary"
//                 onClick={nextStep}
//                 style={{ marginTop: '16px' }}
//               >
//                 Next
//               </Button>
//             </div>
//           )}
//           {step === 2 && (
//             <div>
//               <Title level={2}>Step 2: Utilities & Services</Title>
//               <Paragraph>
//                 Link your utility accounts (electricity, water, internet) to monitor bills and usage in one place.
//               </Paragraph>
//               <Button
//                 type="default"
//                 onClick={prevStep}
//                 style={{ marginRight: '8px' }}
//               >
//                 Previous
//               </Button>
//               <Button
//                 type="primary"
//                 onClick={nextStep}
//                 style={{ marginTop: '16px' }}
//               >
//                 Next
//               </Button>
//             </div>
//           )}
//           {step === 3 && (
//             <div>
//               <Title level={2}>Step 3: Maintenance & Family</Title>
//               <Paragraph>
//                 Set up maintenance schedules and coordinate with family members for household responsibilities.
//               </Paragraph>
//               <Button
//                 type="default"
//                 onClick={prevStep}
//                 style={{ marginRight: '8px' }}
//               >
//                 Previous
//               </Button>
//               <Button
//                 type="primary"
//                 onClick={completeSetup}
//                 style={{ marginTop: '16px' }}
//               >
//                 Complete Setup
//               </Button>
//             </div>
//           )}
//         </div>
//       )}

//       <Modal
//         title={
//           <div style={{ display: 'flex', alignItems: 'center' }}>
//             <span style={{ fontSize: '24px', color: '#0052cc', marginRight: '10px' }}>D</span>
//             <span style={{ fontWeight: 'bold' }}>Dockly</span>
//           </div>
//         }
//         visible={isModalVisible}
//         onCancel={handleCancel}
//         footer={[
//           <Button key="cancel" onClick={handleCancel}>
//             Cancel
//           </Button>,
//           <Button
//             key="launch"
//             type="primary"
//             onClick={handleLaunchSetup}
//             style={{ background: '#0052cc', borderColor: '#0052cc' }}
//           >
//             Launch Setup Home
//           </Button>,
//         ]}
//         style={{ borderRadius: '8px' }}
//       >
//         <Paragraph style={{ fontSize: '16px', color: '#666' }}>
//           Ready to set up your Home Board? The setup wizard will guide you through connecting your property information, utilities, and setting up maintenance schedules.
//         </Paragraph>
//       </Modal>
//     </Card>
//   );
// };

// const HomeInfoCard = (props: any) => {
//   const { title, description, icon, style } = props;
//   return (
//     <Card
//       variant="outlined"
//       hoverable
//       style={{
//         width: '100%',
//         maxWidth: 650,
//         marginBottom: 0,
//         ...style,
//       }}
//     >
//       <Title level={4} style={{ display: 'flex', alignItems: 'center' }}>
//         {icon}
//         <span style={{ marginLeft: 8 }}>{title}</span>
//       </Title>
//       <Paragraph style={{ fontSize: 16 }}>{description}</Paragraph>
//     </Card>
//   );
// };

// export default HomeIntroBoard;


'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { Card, Button, Typography, Row, Col, Modal, Steps, Form, Input, AutoComplete, DatePicker, Spin, Select, message } from 'antd';
import { ArrowRightOutlined, HomeOutlined, BulbOutlined, ToolOutlined, TeamOutlined, EnvironmentOutlined, SearchOutlined, CalendarOutlined, DollarOutlined, BorderOutlined, PlusOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import moment from 'moment';
import { addProperty, addUtility } from '../../services/home';

const { Title, Paragraph } = Typography;
const { Step } = Steps;
const { Option } = Select;

const PRIMARY_COLOR = "#1890ff";
const SHADOW_COLOR = "rgba(0, 0, 0, 0.1)";

// Geopify Types and Service
interface GeopifyFeature {
  properties: {
    formatted: string;
    address_line1?: string;
    address_line2?: string;
    housenumber?: string;
    house_number?: string;
    name?: string;
    building?: string;
    lat?: number;
    lon?: number;
    result_type?: string;
    type?: string;
    rank?: { confidence?: number };
  };
  geometry: { coordinates: [number, number] };
}

interface GeopifyResponse { features: GeopifyFeature[] }

interface AddressDetails { formatted: string; latitude: number; longitude: number }

const GEOPIFY_API_KEY = 'ea55e68bab7b4b26a0104dfbbeeaaf7b';
const GEOPIFY_BASE_URL = 'https://api.geoapify.com/v1/geocode/autocomplete';

class GeopifyService {
  static async searchAddresses(query: string, limit: number = 10): Promise<GeopifyResponse> {
    try {
      const response = await axios.get(GEOPIFY_BASE_URL, {
        params: { text: query, limit, apiKey: GEOPIFY_API_KEY, format: 'geojson' },
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching addresses:', error);
      throw new Error('API Error: ' + (error as Error).message);
    }
  }
}

const USA_UTILITY_TYPES = [
  "Water", "Electricity", "Gas", "Waste Management", "Internet", "Cable TV", "Sewer", "Home Phone"
];

const HomeIntroBoard: React.FC = () => {
  const [isHomeUser, setIsHomeUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState<string | null>(null);
  const [propertyForm] = Form.useForm();
  const [utilityForm] = Form.useForm();
  const router = useRouter();
  const [addressOptions, setAddressOptions] = useState<any[]>([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<AddressDetails | null>(null);
  const [addressSearchValue, setAddressSearchValue] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const userId = "test_user_id";

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  // Debounce function
  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  };

  // Address search function
  const searchAddresses = useCallback(
    debounce(async (value: string) => {
      if (!value || value.length < 3) {
        setAddressOptions([]);
        return;
      }
      setAddressLoading(true);
      setErrorMessage('');
      try {
        const response = await GeopifyService.searchAddresses(value);
        const formattedOptions = response.features.map((feature: GeopifyFeature, index: number) => {
          const props = feature.properties;
          const houseNumber = props.housenumber || props.house_number || '';
          const building = props.name || props.building || '';
          return {
            key: index,
            value: feature.properties.formatted || 'No formatted address',
            label: (
              <div style={{ padding: '8px 0', borderBottom: index < response.features.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <EnvironmentOutlined style={{ color: '#1890ff', fontSize: 16, flexShrink: 0 }} />
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>{feature.properties.formatted}</span>
                </div>
                {(houseNumber || building) && (
                  <div style={{ paddingLeft: '24px', marginBottom: '2px' }}>
                    <span style={{ fontSize: '11px', color: '#595959' }}>
                      {houseNumber && `House: ${houseNumber}`}
                      {houseNumber && building && ' • '}
                      {building && `Building: ${building}`}
                    </span>
                  </div>
                )}
              </div>
            ),
            feature
          };
        });
        setAddressOptions(formattedOptions);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch addresses. Please try again.';
        setErrorMessage(errorMessage);
        setAddressOptions([]);
      } finally {
        setAddressLoading(false);
      }
    }, 300),
    []
  );

  const handleAddressSearch = (value: string) => {
    setAddressSearchValue(value);
    searchAddresses(value);
  };

  const handleAddressSelect = (value: string, option: any) => {
    const feature: GeopifyFeature = option.feature;
    const props = feature.properties;
    const addressDetails: AddressDetails = {
      formatted: props.formatted || value,
      latitude: props.lat || feature.geometry.coordinates[1],
      longitude: props.lon || feature.geometry.coordinates[0]
    };
    setSelectedAddress(addressDetails);
    setAddressSearchValue(value);
    propertyForm.setFieldsValue({ address: addressDetails.formatted });
  };

  const handleGetStarted = () => {
    setIsModalVisible(true);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    propertyForm.resetFields();
    utilityForm.resetFields();
    setSelectedAddress(null);
    setAddressSearchValue('');
    setAddressOptions([]);
    setErrorMessage('');
  };

  const handleLaunchSetup = () => {
    setIsHomeUser(true);
    setIsModalVisible(false);
    setStep(1);
    propertyForm.resetFields();
    utilityForm.resetFields();
    setSelectedAddress(null);
    setAddressSearchValue('');
    setErrorMessage('');
  };

  const nextStep = () => {
    setStep((prev) => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const completeSetup = () => {
    localStorage.setItem('home-hub', '1');
    router.push(`/${username}/home-hub`);
  };

  const handlePropertySubmit = () => {
    propertyForm.validateFields().then(async (values) => {
      setLoading(true);
      setErrorMessage('');
      try {
        const propertyData = {
          address: values.address,
          purchaseDate: values.purchaseDate ? values.purchaseDate.format('YYYY-MM-DD') : '',
          purchasePrice: Number(values.purchasePrice),
          squareFootage: values.squareFootage,
          lotSize: values.lotSize,
          propertyTaxId: values.propertyTaxId
        };
        const response = await addProperty(propertyData);
        if (response.status === 1) {
          message.success('Property added successfully');
          propertyForm.resetFields();
          setSelectedAddress(null);
          setAddressSearchValue('');
          setAddressOptions([]);
          setErrorMessage('');
          nextStep();
        } else {
          setErrorMessage(response.message);
        }
      } catch (error) {
        console.error('Error saving property:', error);
        setErrorMessage('Error saving property information');
      } finally {
        setLoading(false);
      }
    }).catch(() => {
      setErrorMessage('Please fill in all required fields');
    });
  };

  const handleUtilitySubmit = () => {
    utilityForm.validateFields().then(async (values) => {
      setLoading(true);
      try {
        const response = await addUtility({
          type: values.type,
          accountNumber: values.accountNumber,
          monthlyCost: parseFloat(values.monthlyCost),
          providerUrl: values.providerUrl,
          user_id: userId
        });
        if (response.status === 1 && response.payload.utility.is_active === 1) {
          message.success(response.message);
          utilityForm.resetFields();
          nextStep();
        } else {
          message.error(response.message || "Failed to add utility");
        }
      } catch (error) {
        message.error("Failed to add utility");
        console.error("Error adding utility:", error);
      } finally {
        setLoading(false);
      }
    }).catch(() => {
      message.error('Please fill in all required fields');
    });
  };

  const renderPropertyForm = () => (
    <Form form={propertyForm} layout="vertical" style={{ width: '100%' }}>
      <div style={{ marginBottom: '24px' }}>
        <Form.Item
          label="Property Address"
          name="address"
          rules={[{ required: true, message: 'Please enter the property address' }]}
        >
          <AutoComplete
            style={{ width: '100%' }}
            options={addressOptions}
            onSearch={handleAddressSearch}
            onSelect={handleAddressSelect}
            value={addressSearchValue}
            placeholder="e.g., 123 Main Street, New York"
            size="large"
            notFoundContent={addressLoading ? (
              <div style={{ textAlign: 'center', padding: '8px' }}>
                <Spin size="small" /> Searching worldwide...
              </div>
            ) : 'No addresses found'}
            dropdownStyle={{ borderRadius: '8px', boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)', border: '1px solid #e8e8e8' }}
          >
            <Input
              prefix={<SearchOutlined />}
              suffix={addressLoading ? <Spin size="small" /> : null}
              style={{ borderRadius: '8px', border: '2px solid #e8e8e8', transition: 'all 0.3s ease' }}
            />
          </AutoComplete>
        </Form.Item>
        {errorMessage && (
          <div style={{ color: '#ff4d4f', fontSize: '14px', marginTop: '8px' }}>{errorMessage}</div>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <Form.Item
          label={<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CalendarOutlined style={{ color: PRIMARY_COLOR }} /><span>Purchase Date</span></div>}
          name="purchaseDate"
          rules={[{ required: true, message: 'Please select purchase date' }]}
        >
          <DatePicker style={{ width: '100%' }} size="large" placeholder="Select purchase date" />
        </Form.Item>
        <Form.Item
          label={<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><DollarOutlined style={{ color: PRIMARY_COLOR }} /><span>Purchase Price</span></div>}
          name="purchasePrice"
          rules={[{ required: true, message: 'Please enter purchase price' }]}
        >
          <Input size="large" placeholder="Enter purchase price" prefix="$" type="number" />
        </Form.Item>
        <Form.Item
          label={<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><BorderOutlined style={{ color: PRIMARY_COLOR }} /><span>Square Footage</span></div>}
          name="squareFootage"
          rules={[{ required: true, message: 'Please enter square footage' }]}
        >
          <Input size="large" placeholder="Enter square footage" suffix="sq ft" type="text" />
        </Form.Item>
        <Form.Item
          label={<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><BorderOutlined style={{ color: PRIMARY_COLOR }} /><span>Lot Size</span></div>}
          name="lotSize"
          rules={[{ required: true, message: 'Please enter lotjonsize' }]}
        >
          <Input size="large" placeholder="Enter lot size" suffix="acres" type="text" />
        </Form.Item>
        <Form.Item
          label="Property Tax ID"
          name="propertyTaxId"
          rules={[{ required: true, message: 'Please enter property tax ID' }]}
        >
          <Input size="large" placeholder="Enter property tax ID" />
        </Form.Item>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
        <Button
          type="default"
          onClick={prevStep}
          style={{ marginRight: '8px', borderRadius: '4px' }}
          disabled={step === 1}
        >
          Previous
        </Button>
        <Button
          type="primary"
          onClick={handlePropertySubmit}
          loading={loading}
          style={{ borderRadius: '4px', background: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }}
        >
          {loading ? 'Saving...' : 'Next'}
        </Button>
      </div>
    </Form>
  );

  const renderUtilityForm = () => (
    <Form form={utilityForm} layout="vertical">
      <Form.Item
        name="type"
        label="Utility Type"
        rules={[{ required: true, message: "Please select utility type!" }]}
      >
        <Select style={{ width: '100%', borderRadius: '4px' }} placeholder="Select utility type">
          {USA_UTILITY_TYPES.map((type) => (
            <Option key={type} value={type}>{type}</Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        name="accountNumber"
        label="Account Number"
        rules={[{ required: true, message: "Please enter account number!" }]}
      >
        <Input style={{ padding: '5px', borderRadius: '4px' }} placeholder="Enter account number" />
      </Form.Item>
      <Form.Item
        name="monthlyCost"
        label="Monthly Cost ($)"
        rules={[
          { required: true, message: "Please enter monthly cost!" },
          { pattern: /^\d+(\.\d{1,2})?$/, message: "Please enter a valid amount (e.g., 65.00)" }
        ]}
      >
        <Input style={{ padding: '5px', borderRadius: '4px' }} placeholder="Enter monthly cost" />
      </Form.Item>
      <Form.Item
        name="providerUrl"
        label="Provider URL"
        rules={[
          { required: true, message: "Please enter provider URL!" },
          { type: "url", message: "Please enter a valid URL!" }
        ]}
      >
        <Input style={{ padding: '5px', borderRadius: '4px' }} placeholder="Enter provider URL" />
      </Form.Item>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
        <Button
          type="default"
          onClick={prevStep}
          style={{ marginRight: '8px', borderRadius: '4px' }}
        >
          Previous
        </Button>
        <Button
          type="primary"
          onClick={handleUtilitySubmit}
          loading={loading}
          style={{ borderRadius: '4px', background: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }}
        >
          {loading ? 'Saving...' : 'Next'}
        </Button>
      </div>
    </Form>
  );

  return (
    <Card style={{ padding: '0px 24px' }} loading={loading}>
      {!isHomeUser ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <Row gutter={24} style={{ marginTop: '-20px', alignItems: 'center', justifyContent: 'center' }}>
            <Col xs={24} md={12}>
              <img
                src="/manager/home.png"
                alt="Home Illustration"
                style={{ width: '70%', maxWidth: '100%', borderRadius: '12px', objectFit: 'cover', marginTop: '20px' }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = `
                    <div style="width: 100%; height: 400px; background: #e8ecef; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #666; font-size: 16px;">
                      [Home Illustration Placeholder]
                    </div>`;
                }}
              />
            </Col>
            <Col xs={24} md={12}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'start', justifyContent: 'center', padding: '0 20px' }}>
                <Title level={1}>Welcome to Your Home Board</Title>
                <Paragraph style={{ maxWidth: '800px', fontSize: '18px' }}>
                  Your central dashboard for managing all aspects of your home from mortgage and property details to utilities, maintenance, and household documents.
                </Paragraph>
                <Button
                  type="primary"
                  size="large"
                  style={{ borderRadius: '10px', background: PRIMARY_COLOR, marginTop: '20px', padding: '10px 20px' }}
                  onClick={showModal}
                >
                  Get Started <ArrowRightOutlined />
                </Button>
              </div>
            </Col>
          </Row>
          <Row gutter={[24, 24]} style={{ marginTop: '30px' }}>
            <Col xs={24} sm={12}>
              <Card hoverable style={{ width: '100%', maxWidth: '650px', marginBottom: '0' }}>
                <Title level={4} style={{ display: 'flex', alignItems: 'center' }}><HomeOutlined /><span style={{ marginLeft: '8px' }}>Property Details</span></Title>
                <Paragraph style={{ fontSize: '16px' }}>Connect to Zillow, Redfin, or input your property details manually to track value, mortgage info, and important documents.</Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card hoverable style={{ width: '100%', maxWidth: '650px', marginBottom: '0' }}>
                <Title level={4} style={{ display: 'flex', alignItems: 'center' }}><BulbOutlined /><span style={{ marginLeft: '8px' }}>Utilities & Services</span></Title>
                <Paragraph style={{ fontSize: '16px' }}>Track all your home utilities and services in one place - electricity, water, internet, streaming services, and more.</Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card hoverable style={{ width: '100%', maxWidth: '650px', marginBottom: '0' }}>
                <Title level={4} style={{ display: 'flex', alignItems: 'center' }}><ToolOutlined /><span style={{ marginLeft: '8px' }}>Maintenance Tracker</span></Title>
                <Paragraph style={{ fontSize: '16px' }}>Schedule and track regular home maintenance tasks with reminders for HVAC, appliances, garden, and seasonal upkeep.</Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card hoverable style={{ width: '100%', maxWidth: '650px', marginBottom: '0' }}>
                <Title level={4} style={{ display: 'flex', alignItems: 'center' }}><TeamOutlined /><span style={{ marginLeft: '8px' }}>Family Coordination</span></Title>
                <Paragraph style={{ fontSize: '16px' }}>Share home information with family members and coordinate responsibilities for a well-maintained household.</Paragraph>
              </Card>
            </Col>
          </Row>
          <div style={{ backgroundColor: '#e6f7ff', padding: '20px', borderRadius: '8px', marginTop: '30px', width: '100%', maxWidth: '1350px', textAlign: 'left' }}>
            <Title level={3} style={{ color: PRIMARY_COLOR }}>How does it work?</Title>
            <Paragraph style={{ fontSize: '18px' }}>
              To set up your Home Board, we'll help you connect your property information and home services. This allows you to:
            </Paragraph>
            <ul style={{ fontSize: '16px', marginLeft: '20px' }}>
              <li>Import your property details from Zillow or other real estate platforms</li>
              <li>Autocomplete Your Address with Geopify</li>
              <li>Connect your utility accounts to monitor bills and usage in one place</li>
              <li>Set up maintenance schedules with automatic reminders</li>
              <li>Store important home documents securely for easy access</li>
            </ul>
            <Paragraph style={{ fontSize: '16px' }}>
              You'll be able to connect multiple services including your mortgage provider, utility companies, home insurance, and property tax information.
            </Paragraph>
          </div>
          <div style={{ textAlign: 'center', padding: '20px', marginTop: '30px' }}>
            <Button
              type="primary"
              size="large"
              onClick={showModal}
              style={{ background: PRIMARY_COLOR, borderColor: PRIMARY_COLOR, borderRadius: '4px', fontSize: '16px', height: '40px', width: '100%', maxWidth: '300px' }}
            >
              Set Up Your Home Board
            </Button>
          </div>
        </div>
      ) : (
        <div style={{ padding: '54px', minHeight: '450px' }}>
          <Steps current={step - 1} style={{ marginBottom: '24px' }}>
            <Step title="Property Details" />
            <Step title="Utilities & Services" />
            <Step title="Completed" />
          </Steps>
          {step === 1 && (
            <div>
              <Title level={2}>Step 1: Property Details</Title>
              <Paragraph>Enter your property details to track value, mortgage, and documents.</Paragraph>
              {renderPropertyForm()}
            </div>
          )}
          {step === 2 && (
            <div>
              <Title level={2}>Step 2: Utilities & Services</Title>
              <Paragraph>Link your utility accounts (electricity, water, internet) to monitor bills and usage.</Paragraph>
              {renderUtilityForm()}
            </div>
          )}
          {step === 3 && (
            <div>
              <Title level={2}>Step 3: CompletedSetup</Title>
              <Paragraph>
                {/* Set up maintenance schedules and coordinate with family members for household responsibilities. This step is optional and can be configured later. */}
              </Paragraph>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                <Button
                  type="default"
                  onClick={prevStep}
                  style={{ marginRight: '8px', borderRadius: '4px' }}
                >
                  Previous
                </Button>
                <Button
                  type="primary"
                  onClick={completeSetup}
                  style={{ borderRadius: '4px', background: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }}
                >
                  Home Board
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '24px', color: PRIMARY_COLOR, marginRight: '10px' }}>D</span>
            <span style={{ fontWeight: 'bold' }}>Dockly</span>
          </div>
        }
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel} style={{ borderRadius: '4px' }}>
            Cancel
          </Button>,
          <Button
            key="launch"
            type="primary"
            onClick={handleLaunchSetup}
            style={{ background: PRIMARY_COLOR, borderColor: PRIMARY_COLOR, borderRadius: '4px' }}
          >
            Launch Setup Home
          </Button>,
        ]}
        style={{ borderRadius: '8px' }}
      >
        <Paragraph style={{ fontSize: '16px', color: '#666' }}>
          Ready to set up your Home Board? The setup wizard will guide you through connecting your property information, utilities, and setting up maintenance schedules.
        </Paragraph>
      </Modal>
    </Card>
  );
};

export default HomeIntroBoard;