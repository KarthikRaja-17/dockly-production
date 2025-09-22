'use client';
import React, { useEffect, useState } from 'react';
import {
  Steps, Button, Input, Tag, Checkbox, Card, Space, List, Divider, Upload, message
} from 'antd';
import {
  SearchOutlined, FolderOutlined, FilePdfOutlined,
  FileImageOutlined, CloudOutlined, LockOutlined, UploadOutlined
} from '@ant-design/icons';
import Typography from 'antd/es/typography';
import { useRouter } from 'next/navigation';

const { Step } = Steps;
const { Title, Text } = Typography;

interface CloudService {
  imageUrl: string; // Changed from icon to imageUrl
  name: string;
  description: string;
  connected: boolean;
  email?: string;
  totalStorage?: string;
  usedPercentage?: number;
  files?: number;
  folders?: number;
  shared?: number;
}

interface FileItem {
  type: 'folder' | 'pdf' | 'image' | 'doc' | 'xls' | 'ppt' | 'zip';
  name: string;
  details?: string;
  path: string;
  storage?: string;
  size?: string;
  modified?: string;
  status?: string;
}

interface PinnedFile {
  name: string;
  boards: string[];
}

interface UploadedImage {
  name: string;
  url: string;
}

const initialCloudServices: CloudService[] = [
  { 
    imageUrl: '/manager/drive.jpg', // Placeholder for Google Drive logo
    name: 'Google Drive', 
    description: 'Documents, spreadsheets, presentations, and more.', 
    connected: false 
  },
  { 
    imageUrl: '/manager/dropbox.jpg', // Placeholder for Dropbox logo
    name: 'Dropbox', 
    description: 'Cloud storage for all your files and photos.', 
    connected: true, 
    email: 'user@dropbox.com', 
    totalStorage: '2 TB', 
    usedPercentage: 10, 
    files: 583, 
    folders: 42, 
    shared: 15 
  },
  { 
    imageUrl: '/manager/cloud.jpg', // Placeholder for iCloud Drive logo
    name: 'iCloud Drive', 
    description: "Apple's cloud storage for documents and data.", 
    connected: false 
  },
  { 
    imageUrl: '/manager/1drive.png', // Placeholder for OneDrive logo
    name: 'OneDrive', 
    description: "Microsoft's cloud storage integrated with Office.", 
    connected: false 
  },
  { 
    imageUrl: '/manager/gphotos.png', // Placeholder for Google Photos logo
    name: 'Google Photos', 
    description: 'Photo and video storage with smart organization.', 
    connected: false 
  },
  { 
    imageUrl: '/manager/box.png', // Placeholder for Box logo
    name: 'Box', 
    description: 'Secure content management and collaboration.', 
    connected: false 
  },
];

const initialFiles: FileItem[] = [
  { type: 'folder', name: 'Tax Documents', details: 'Folder with 8 items', path: 'My Drive/Important Documents/2023/Tax Documents' },
  { type: 'folder', name: 'Insurance', details: 'Folder with 4 items', path: 'My Drive/Important Documents/2023/Insurance' },
  { type: 'pdf', name: 'Home_Deed_2020.pdf', details: 'PDF • 2.4 MB • Apr 14, 2020', path: 'My Drive/Important Documents/2023/Home_Deed_2020.pdf' },
  { type: 'pdf', name: 'Mortgage_Agreement.pdf', details: 'PDF • 3.7 MB • Apr 13, 2020', path: 'My Drive/Important Documents/2023/Mortgage_Agreement.pdf' },
  { type: 'pdf', name: 'Home_Insurance_Policy.pdf', details: 'PDF • 1.8 MB • May 2, 2023', path: 'My Drive/Important Documents/2023/Home_Insurance_Policy.pdf' },
  { type: 'image', name: 'House_Front.jpg', details: 'JPG • 5.3 MB • Jul 10, 2020', path: 'My Drive/Important Documents/2023/House_Front.jpg' },
  { type: 'pdf', name: 'HOA_Bylaws.pdf', details: 'PDF • 1.2 MB • Apr 20, 2020', path: 'My Drive/Important Documents/2023/HOA_Bylaws.pdf' },
];

const CloudConnectionPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedService, setSelectedService] = useState<CloudService | null>(null);
  const [currentPath, setCurrentPath] = useState<string>('My Drive/Important Documents/2023');
  const [files, setFiles] = useState<FileItem[]>(initialFiles);
  const [pinningFile, setPinningFile] = useState<FileItem | null>(null);
  const [pinnedFiles, setPinnedFiles] = useState<PinnedFile[]>([
    { name: 'Home Deed', boards: ['Home Management', 'Important Documents'] },
    { name: 'Mortgage Agreement', boards: ['Home Management'] },
    { name: 'Home Insurance Policy', boards: ['Home Management'] },
  ]);
  const [cloudServices, setCloudServices] = useState<CloudService[]>(initialCloudServices);
  const [displayName, setDisplayName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [tags, setTags] = useState<string[]>(['home', 'legal', 'important']);
  const [selectedBoards, setSelectedBoards] = useState<string[]>(['Home Management', 'Important Documents']);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);


  const [username, setUsername] = useState<string>("");
    console.log("🚀 ~ CloudConnectionPage ~ username:", username)
    const router = useRouter();
  
    useEffect(() => {
      const username = localStorage.getItem("username") || "";
      setUsername(username);
      if (localStorage.getItem('cloud-storage') === null) {
        router.push(`/${username}/cloud-storage/setup`);
      }
    }, []);

    const handlesubmit = () => {
        localStorage.setItem('cloud-storage', '1');
        router.push(`/${username}/finalboards/cloud-storage`);
};

  

  const handleImageUpload = (file: any): boolean => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
      return false;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      setUploadedImages((prev) => [
        ...prev,
        { name: file.name, url: imageUrl },
      ]);
      message.success(`${file.name} uploaded successfully!`);
    };
    reader.readAsDataURL(file);
    return false;
  };

  // New function to set an uploaded image as a cloud service image
  const handleSetServiceImage = (serviceName: string, imageUrl: string) => {
    setCloudServices((prev) =>
      prev.map((s) =>
        s.name === serviceName ? { ...s, imageUrl } : s
      )
    );
    message.success(`Image set for ${serviceName}`);
  };

  const handleSelectService = (service: CloudService) => {
    setSelectedService(service);
    setCurrentStep(1);
  };

  const handleOpenFolder = (folder: FileItem) => {
    setCurrentPath(folder.path);
    setFiles([
      { type: 'pdf', name: `${folder.name}_Sample.pdf`, details: 'PDF • 1 MB • Jan 1, 2023', path: `${folder.path}/Sample.pdf` },
    ]);
  };


  const handlePinFile = (file: FileItem) => {
    setPinningFile(file);
    setDisplayName(file.name);
    setDescription(`Property deed for our house on Main Street`);
    setCurrentStep(3);
  };

  const handlePinConfirm = () => {
    if (pinningFile) {
      setPinnedFiles([...pinnedFiles, {
        name: displayName || pinningFile.name,
        boards: selectedBoards
      }]);
      setPinningFile(null);
      setCurrentStep(4);
    }
  };

  const handleConnectService = () => {
    if (selectedService) {
      setCloudServices(cloudServices.map((s) =>
        s.name === selectedService.name
          ? { ...s, connected: true, email: 'user@example.com', totalStorage: '15 GB', usedPercentage: 75, files: 2458, folders: 146, shared: 63 }
          : s
      ));
      setCurrentStep(2);
    }
  };

  const handleTagClose = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const renderWizardContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <Title level={2} style={{ fontSize: '24px', fontWeight: 600, marginBottom: '10px' }}>
              Connect Your Digital Vaults
            </Title>
            <Text style={{ fontSize: '16px', color: '#666', display: 'block', marginBottom: '20px' }}>
              Access and organize your files without moving them. Connect to your cloud storage to pin important documents to your Dockly dashboard.
            </Text>
            <Card style={{ marginBottom: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <Space>
                <LockOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                <Text style={{ fontSize: '14px' }}>
                  Your files stay where they are. Dockly connects to your existing storage and helps you organize without duplicating content.
                </Text>
              </Space>
            </Card>
            <Title level={4} style={{ fontSize: '18px', marginBottom: '10px' }}>
              Cloud Services
            </Title>
            <List
              grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
              dataSource={cloudServices}
              renderItem={(item: CloudService) => (
                <List.Item>
                  <Card
                    hoverable
                    onClick={() => handleSelectService(item)}
                    style={{
                      border: selectedService?.name === item.name ? '2px solid #1890ff' : '1px solid #e8e8e8',
                      borderRadius: '8px',
                      textAlign: 'center',
                      // width:'400px',
                      padding: '10px',
                      cursor: 'pointer'
                    }}
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      style={{ maxWidth: '45px', maxHeight: '55px', objectFit: 'contain', marginBottom: '10px' }}
                    />
                    <Text strong style={{ fontSize: '16px', display: 'block' }}>{item.name}</Text>
                    <Text style={{ fontSize: '14px', color: '#666', display: 'block', marginBottom: '10px' }}>
                      {item.description}
                    </Text>
                    <Tag color={item.connected ? 'green' : 'default'} style={{ marginBottom: '10px' }}>
                      {item.connected ? '✓ Connected' : '○ Not Connected'}
                    </Tag>
                    <Button
                      type="primary"
                      style={{ borderRadius: '4px' }}
                      onClick={(e) => { e.stopPropagation(); handleSelectService(item); }}
                    >
                      {item.connected ? 'Manage' : 'Connect'}
                    </Button>
                  </Card>
                </List.Item>
              )}
            />
            <Space style={{ marginTop: '20px', width: '100%', justifyContent: 'space-between' }}>
              <Button style={{ borderRadius: '4px' }}>Back to Dashboard</Button>
              <Button type="primary" style={{ borderRadius: '4px' }} onClick={() => setCurrentStep(1)}>
                Continue
              </Button>
            </Space>
          </div>
        );
      case 1:
        return (
          <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
            <img
              src={selectedService?.imageUrl}
              alt={selectedService?.name}
              style={{ maxWidth: '32px', maxHeight: '32px', objectFit: 'contain', marginBottom: '10px' }}
            />
            <Title level={3} style={{ fontSize: '20px', marginBottom: '20px' }}>Connect to {selectedService?.name}</Title>
            <Text style={{ fontSize: '16px', display: 'block', marginBottom: '20px' }}>
              Dockly will connect to your {selectedService?.name} to help you organize and access your important files.
            </Text>
            <Card style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: '20px' }}>
              <Title level={5} style={{ fontSize: '16px', marginBottom: '20px' }}>Dockly will be able to:</Title>
              <List
                dataSource={[
                  `View and list files and folders in your ${selectedService?.name}`,
                  `Download files when you access them through Dockly`,
                  `Create reference links to your files (without moving or copying them)`,
                  `Dockly cannot delete or modify your original files`,
                  `Dockly does not store copies of your complete files on its servers`,
                ]}
                renderItem={(text, idx) => (
                  <List.Item style={{ justifyContent: 'flex-start', padding: '8px 0' }}>
                    <Text style={{ fontSize: '14px' }}>{idx < 3 ? '✓' : '✗'} {text}</Text>
                  </List.Item>
                )}
              />
              <Space style={{ marginTop: '20px' }}>
                <Button style={{ borderRadius: '4px' }} onClick={() => setCurrentStep(0)}>Cancel</Button>
                <Button type="primary" style={{ borderRadius: '4px' }} onClick={handleConnectService}>
                  Connect {selectedService?.name}
                </Button>
              </Space>
            </Card>
          </div>
        );
      case 2:
        return (
          <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <Title level={3} style={{ fontSize: '20px', marginBottom: '10px' }}>Browse {selectedService?.name} Files</Title>
            <Text style={{ fontSize: '16px', color: '#666', display: 'block', marginBottom: '20px' }}>
              Find and pin important documents to your Dockly boards.
            </Text>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search"
              style={{ maxWidth: '300px', marginBottom: '20px', borderRadius: '4px' }}
            />
            <Text style={{ fontSize: '14px', color: '#666', display: 'block', marginBottom: '20px' }}>{currentPath}</Text>
            <List
              header={<Text strong style={{ fontSize: '14px' }}>Name ↑</Text>}
              dataSource={files}
              renderItem={(item: FileItem) => (
                <List.Item
                  actions={[
                    <Button
                      type="link"
                      style={{ color: '#1890ff' }}
                      onClick={() => (item as FileItem).type === 'folder' ? handleOpenFolder(item as FileItem) : handlePinFile(item as FileItem)}
                    >
                      {(item as FileItem).type === 'folder' ? 'Open' : 'Pin to Dockly'}
                    </Button>
                  ]}
                  style={{ padding: '10px 0', borderBottom: '1px solid #e8e8e8' }}
                >
                  <List.Item.Meta
                    avatar={
                      item.type === 'folder'
                        ? <FolderOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                        : item.type === 'pdf'
                          ? <FilePdfOutlined style={{ fontSize: '24px', color: '#ff4d4f' }} />
                          : item.type === 'image'
                            ? <FileImageOutlined style={{ fontSize: '24px', color: '#faad14' }} />
                            : <CloudOutlined style={{ fontSize: '24px', color: '#666' }} />
                    }
                    title={<Text style={{ fontSize: '14px' }}>{item.name}</Text>}
                    description={<Text style={{ fontSize: '12px', color: '#666' }}>{(item as FileItem).details}</Text>}
                  />
                </List.Item>
              )}
            />
            <Space style={{ marginTop: '20px', width: '100%', justifyContent: 'space-between' }}>
              <Button style={{ borderRadius: '4px' }} onClick={() => setCurrentStep(1)}>Back</Button>
              <Space>
                <Button style={{ borderRadius: '4px' }} onClick={() => setCurrentStep(4)}>Skip File Selection</Button>
                <Button type="primary" style={{ borderRadius: '4px' }} onClick={() => setCurrentStep(3)}>Continue</Button>
              </Space>
            </Space>
          </div>
        );
      case 3:
        return (
          <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <Title level={3} style={{ fontSize: '20px', marginBottom: '20px' }}>
              Pinning: {pinningFile?.name}
            </Title>
            <Text style={{ fontSize: '16px', color: '#666', display: 'block', marginBottom: '20px' }}>
              Add details to help you find and organize this document in Dockly.
            </Text>
            <Card style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: '20px' }}>
              <Space style={{ marginBottom: '20px' }}>
                {pinningFile?.type === 'pdf' ? (
                  <FilePdfOutlined style={{ fontSize: '32px', color: '#ff4d4f' }} />
                ) : (
                  <FileImageOutlined style={{ fontSize: '32px', color: '#faad14' }} />
                )}
              </Space>
              <List
                dataSource={[
                  { label: 'Source', value: pinningFile?.path ?? '' },
                  { label: 'Type', value: pinningFile?.type === 'pdf' ? 'PDF Document' : 'Image' },
                  { label: 'Size', value: pinningFile?.details?.split('•')[1]?.trim() ?? '' },
                  { label: 'Modified', value: pinningFile?.details?.split('•')[2]?.trim() ?? '' },
                ]}
                renderItem={(item: { label: string; value: string }) => (
                  <List.Item style={{ padding: '8px 0' }}>
                    <Text strong style={{ width: '100px', fontSize: '14px' }}>{item.label}:</Text>
                    <Text style={{ fontSize: '14px' }}>{item.value}</Text>
                  </List.Item>
                )}
              />
              <Divider style={{ margin: '20px 0' }} />
              <Text strong style={{ fontSize: '14px', display: 'block', marginBottom: '10px' }}>Display Name</Text>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                style={{ marginBottom: '20px', borderRadius: '4px' }}
              />
              <Text strong style={{ fontSize: '14px', display: 'block', marginBottom: '10px' }}>Description (optional)</Text>
              <Input.TextArea
                value={description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                placeholder="Description"
                style={{ marginBottom: '20px', borderRadius: '4px' }}
              />
              <Divider style={{ margin: '20px 0' }} />
              <Text strong style={{ fontSize: '14px', display: 'block', marginBottom: '10px' }}>Tags (optional)</Text>
              <Space style={{ marginBottom: '20px' }}>
                {tags.map(tag => (
                  <Tag
                    key={tag}
                    closable
                    onClose={() => handleTagClose(tag)}
                    style={{ borderRadius: '4px', padding: '2px 8px' }}
                  >
                    {tag}
                  </Tag>
                ))}
              </Space>
              <Text strong style={{ fontSize: '14px', display: 'block', marginBottom: '10px' }}>Pin to Boards</Text>
              <Checkbox.Group
                value={selectedBoards}
                onChange={(values: string[]) => setSelectedBoards(values)}
                style={{ display: 'block', marginBottom: '20px' }}
              >
                {['Home Management', 'Family Hub', 'Important Documents', 'Finance'].map((board) => (
                  <Checkbox
                    key={board}
                    value={board}
                    style={{ display: 'block', margin: '8px 0', fontSize: '14px' }}
                  >
                    {board}
                  </Checkbox>
                ))}
              </Checkbox.Group>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button style={{ borderRadius: '4px' }} onClick={() => setCurrentStep(2)}>Cancel</Button>
                <Button type="primary" style={{ borderRadius: '4px' }} onClick={handlePinConfirm}>Pin Document</Button>
              </Space>
            </Card>
          </div>
        );
      case 4:
        return (
          <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
            <Title level={3} style={{ fontSize: '20px', marginBottom: '20px' }}>
              <span style={{ color: '#52c41a', marginRight: '10px' }}>✓</span> Storage Successfully Connected!
            </Title>
            <Text style={{ fontSize: '16px', color: '#666', display: 'block', marginBottom: '20px' }}>
              You've connected your cloud storage to Dockly. You can now pin documents from these services to your boards.
            </Text>
            <Card style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: '20px' }}>
              <Title level={5} style={{ fontSize: '16px', marginBottom: '20px' }}>Connected Storage Services</Title>
              <List
                grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
                dataSource={cloudServices.filter(s => s.connected)}
                renderItem={(item: CloudService) => (
                  <List.Item>
                    <Card style={{ borderRadius: '8px', textAlign: 'center', padding: '10px' }}>
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        style={{ maxWidth: '24px', maxHeight: '24px', objectFit: 'contain', marginBottom: '10px' }}
                      />
                      <Text style={{ fontSize: '14px' }}>{item.name}</Text>
                    </Card>
                  </List.Item>
                )}
              />
              <Divider style={{ margin: '20px 0' }} />
              <Title level={5} style={{ fontSize: '16px', marginBottom: '20px' }}>Pinned Documents</Title>
              <List
                dataSource={pinnedFiles}
                renderItem={(item) => (
                  <List.Item>
                    <Text style={{ fontSize: '14px' }}>
                      • {item.name} (pinned to {item.boards.join(', ')})
                    </Text>
                  </List.Item>
                )}
              />
              <Space style={{ marginTop: '20px', width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  type="link"
                  style={{ fontSize: '14px', display: 'flex', alignItems: 'center' }}
                  onClick={() => setCurrentStep(2)}
                >
                  <span style={{ marginRight: '5px' }}>📎</span> Pin more documents
                </Button>
                <Button type="link" style={{ fontSize: '14px', display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '5px' }}>👨‍👩‍👧</span> Set up family sharing
                </Button>
                <Button type="link" style={{ fontSize: '14px', display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '5px' }}>📝</span> Customize your boards
                </Button>
              </Space>
            </Card>
            <Button type="link" style={{ marginTop: '20px', fontSize: '14px', color: '#666' }} onClick={handlesubmit}>
              Return to Dashboard
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px 0' }}>
        <Title level={2} style={{ fontSize: '24px', marginBottom: '20px', textAlign: 'center', color: '#1890ff' }}>
          Dockly
        </Title>
        <Steps current={currentStep} style={{ marginBottom: '20px', background: '#fff', padding: '20px', borderRadius: '8px' }}>
          <Step title="Select Storage" />
          <Step title="Connect" />
          <Step title="Browse Files" />
          <Step title="Pin Files" />
          <Step title="Complete" />
        </Steps>
        {renderWizardContent()}
      </div>
    </div>
  );
};

export default CloudConnectionPage;