// 'use client';
// import React from 'react';
// import { Card, Button, Tag, Space, Typography, Table, Progress } from 'antd';
// import { CloudOutlined, MoreOutlined } from '@ant-design/icons';

// const { Title, Text } = Typography;

// const FilesStorage: React.FC = () => {
//   const columns = [
//     {
//       title: 'File Name',
//       dataIndex: 'fileName',
//       key: 'fileName',
//       render: (text: string, record: any) => (
//         <div style={{ display: 'flex', alignItems: 'center' }}>
//           <img src={record.icon} alt="file" style={{ width: '24px', marginRight: '8px' }} />
//           <div>
//             <Text strong>{text}</Text>
//             <br />
//             <Text type="secondary">{record.path}</Text>
//           </div>
//         </div>
//       ),
//     },
//     { title: 'Storage', dataIndex: 'storage', key: 'storage' },
//     { title: 'Size', dataIndex: 'size', key: 'size' },
//     { title: 'Modified', dataIndex: 'modified', key: 'modified' },
//     {
//       title: 'Status',
//       dataIndex: 'status',
//       key: 'status',
//       render: (text: string) => <Tag color="green">{text}</Tag>,
//     },
//     {
//       title: 'Actions',
//       key: 'actions',
//       render: () => (
//         <Space>
//           <Button type="link">Open</Button>
//           <Button type="link" icon={<MoreOutlined />} />
//         </Space>
//       ),
//     },
//   ];

//   const data = [
//     {
//       key: '1',
//       fileName: 'Q2 Financial Report.docx',
//       path: 'Documents/Finance',
//       storage: 'OneDrive',
//       size: '2.4 MB',
//       modified: 'Today, 9:45 AM',
//       status: 'Synced',
//       // icon: '/icons/doc-icon.png',
//     },
//     {
//       key: '2',
//       fileName: 'Budget 2025.xlsx',
//       path: 'Finance/Planning',
//       storage: 'Google Drive',
//       size: '1.8 MB',
//       modified: 'Today, 10:12 AM',
//       status: 'Synced',
//       // icon: '/icons/xls-icon.png',
//     },
//     {
//       key: '3',
//       fileName: 'Home Insurance Policy.pdf',
//       path: 'Documents/Insurance',
//       storage: 'Dropbox',
//       size: '4.2 MB',
//       modified: 'Yesterday, 3:22 PM',
//       status: 'Synced',
//       // icon: '/icons/pdf-icon.png',
//     },
//     {
//       key: '4',
//       fileName: 'Family Vacation Photos.zip',
//       path: 'Photos/2025/Spring',
//       storage: 'Google Drive',
//       size: '256 MB',
//       modified: 'Yesterday, 8:45 PM',
//       status: 'Synced',
//       // icon: '/icons/zip-icon.png',
//     },
//     {
//       key: '5',
//       fileName: 'Project Timeline.pptx',
//       path: 'Work/Projects/Q2',
//       storage: 'OneDrive',
//       size: '3.7 MB',
//       modified: 'May 26, 2025',
//       status: 'Synced',
//       // icon: '/icons/pptx-icon.png',
//     },
//   ];

//   const services = [
//     {
//       name: 'Google Drive',
//       email: '[email protected]',
//       total: '15 GB',
//       used: '75',
//       files: 2458,
//       folders: 146,
//       shared: 63,
//       // icon: '/icons/gdrive-icon.png',
//     },
//     {
//       name: 'OneDrive',
//       email: '[email protected]',
//       total: '1 TB',
//       used: '35',
//       files: 1287,
//       folders: 93,
//       shared: 27,
//       // icon: '/icons/onedrive-icon.png',
//     },
//     {
//       name: 'Dropbox',
//       email: '[email protected]',
//       total: '2 TB',
//       used: '10',
//       files: 583,
//       folders: 42,
//       shared: 15,
//       // icon: '/icons/dropbox-icon.png',
//     },
//   ];

//   return (
//     <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
//       <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
//         <CloudOutlined style={{ fontSize: '24px', marginRight: '10px', color: '#1890ff' }} />
//         <Title level={3} style={{ margin: 0, color: '#1f1f1f' }}>Connected Cloud Storage</Title>
//       </div>
//       <Text style={{ color: '#595959' }}>
//         Manage your cloud storage accounts and connect new ones
//       </Text>

//       {/* Summary Section */}
//       <div style={{ margin: '20px 0' }}>
//         <Card style={{ marginBottom: '20px' }}>
//           <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//             <div>
//               <Title level={5}>Total Storage</Title>
//               <Text strong>7.8 TB</Text>
//             </div>
//             <Progress type="circle" percent={41} width={60} strokeColor="#1890ff" />
//           </div>
//           <Text>Used: 3.2 TB (41%)</Text>
//         </Card>

//         <Card style={{ marginBottom: '20px' }}>
//           <Title level={5}>Connected Accounts (3)</Title>
//           <Space style={{ margin: '10px 0' }}>
//             <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#1890ff' }} />
//             <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#fa8c16' }} />
//             <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#fadb14' }} />
//           </Space>
//           <Text>Last sync: Today, 10:23 AM</Text>
//         </Card>

//         <Card>
//           <Title level={5}>Files Synced (4,328)</Title>
//         </Card>
//       </div>

//       {/* Storage Services */}
//       <div style={{ margin: '20px 0' }}>
//         <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//           <Title level={4}>Connected Storage Services</Title>
//           <Button type="primary">Connect New</Button>
//         </div>
//         {services.map((service) => (
//           <Card key={service.name} style={{ marginBottom: 20 }}>
//             <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//               <div style={{ display: 'flex', alignItems: 'center' }}>
//                 {/* <img src={service.icon} alt={service.name} style={{ width: 40, marginRight: 10 }} /> */}
//                 <div>
//                   <Title level={5}>{service.name}</Title>
//                   <Text>{service.email}</Text>
//                 </div>
//               </div>
//               <Space>
//                 <Tag color="green">Active</Tag>
//                 <Button type="link" icon={<MoreOutlined />} />
//               </Space>
//             </div>
//             <div style={{ margin: '10px 0' }}>
//               <Text>{`${service.total} Total, ${service.used}% Used`}</Text>
//               <Progress percent={parseInt(service.used)} strokeColor="#1890ff" />
//             </div>
//             <Space style={{ marginBottom: 10 }}>
//               <Text>Files: {service.files}</Text>
//               <Text>Folders: {service.folders}</Text>
//               <Text>Shared: {service.shared}</Text>
//             </Space>
//             <Button type="primary">View Files</Button>
//           </Card>
//         ))}
//       </div>

//       {/* Synced Files Table */}
//       <div style={{ margin: '20px 0' }}>
//         <div style={{ display: 'flex', justifyContent: 'space-between' }}>
//           <Title level={4}>Recently Synced Files</Title>
//           <Button type="link">View All</Button>
//         </div>
//         <Table
//           columns={columns}
//           dataSource={data}
//           pagination={false}
//           rowKey="key"
//           style={{ borderRadius: '8px' }}
//         />
//       </div>
//     </div>
//   );
// };

// export default FilesStorage;


const FilesStorageWrapper = () => {
  return <></>;
}
export default FilesStorageWrapper;